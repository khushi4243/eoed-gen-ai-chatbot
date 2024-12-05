import json
import boto3
import pandas as pd
import numpy as np
from io import BytesIO
import logging
import os
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    logger.info("Lambda function has been invoked.")
    bedrock = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
    s3 = boto3.client('s3')
    kb_id = os.getenv('KB_ID', None)

    if not kb_id:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({"error": "KB_ID environment variable not set"})
        }

    try:
        local_path = retrieve_kb_docs("EOED-Master_1.xlsx", kb_id, bedrock, s3)
        df_master = pd.read_excel(local_path, header=1)

        headings = {
            "Category": df_master.columns[4:13],  # Columns E-M
            "Life Cycle": df_master.columns[13:17],  # Columns M-P
            "Size": df_master.columns[17:24],  # Columns Q-W
            "Grow Operations": df_master.columns[25:33],  # Columns Y-AF
            "Construct-New (Land)": df_master.columns[34:38],  # Columns AH-AK
            "Construct-Existing (Land)": df_master.columns[38:42]  # Columns AL-AO
        }

        data = process_excel_data(df_master, headings)
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': data  # Note: process_excel_data already returns JSON string
        }

    except Exception as e:
        print(f"Failed to retrieve or process file: {e}")
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({"error": str(e)})
        }


def retrieve_kb_docs(file_name, knowledge_base_id, bedrock_client, s3_client):
    try:
        key, _ = os.path.splitext(file_name)
        print(f"Search query KB: {key}")
        response = bedrock_client.retrieve(
            knowledgeBaseId=knowledge_base_id,
            retrievalQuery={'text': key},
            retrievalConfiguration={
                'vectorSearchConfiguration': {
                    'numberOfResults': 5  # We only want the most relevant document
                }
            }
        )
        
        print(f"Retrieve API Response: {response}")

        file_uri = None
        if response.get('retrievalResults'):
            for result in response['retrievalResults']:
                uri = result['location']['s3Location']['uri']
                if file_name in uri:
                    file_uri = uri
                    break

        if not file_uri:
            raise FileNotFoundError(f"File {file_name} not found in knowledge base")

        # Parse the S3 URI
        s3_parts = file_uri.replace("s3://", "").split("/", 1)
        bucket_name = s3_parts[0]
        object_key = s3_parts[1]

        # Download the file from S3 to Lambda's /tmp directory
        local_file_path = f"/tmp/{file_name}"
        s3_client.download_file(bucket_name, object_key, local_file_path)
        print(f"File downloaded to {local_file_path}")

        return local_file_path

    except Exception as e:
        print(f"Error retrieving document: {e}")
        raise

def process_excel_data(df, headings):
    """
    Process the Excel data to extract dropdown and checkbox options dynamically.
    """
    print("\n=== Starting Data Processing ===")
    print("DataFrame columns:", df.columns.tolist())
    print("\nHeadings configuration:")
    for category, cols in headings.items():
        print(f"{category}: {cols.tolist()}")
    
    # Replace NaN values with 0
    df = df.replace({np.nan: 0})
    
    # Initialize dictionaries for dropdowns and checkboxes
    dropdowns = {}
    checkboxes = {}
    
    # Process each heading category
    for main_heading, columns in headings.items():
        print(f"\nProcessing {main_heading}:")
        if main_heading in ["Size", "Life Cycle"]:
            # For dropdown categories, get the column names as options
            dropdown_values = [col for col in columns if pd.notna(col)]
            dropdowns[main_heading] = dropdown_values
            print(f"Added dropdown values: {dropdown_values}")
        else:
            # For checkbox categories, get the column names as options
            checkbox_values = [col for col in columns if pd.notna(col)]
            checkboxes[main_heading] = checkbox_values
            print(f"Added checkbox values: {checkbox_values}")

    # Add sample data logging
    print("\n=== Sample Data Values ===")
    if len(df) > 0:
        sample_row = df.iloc[0]
        print("\nFirst row values:")
        for heading, columns in headings.items():
            print(f"\n{heading}:")
            for col in columns:
                print(f"{col}: {sample_row[col]} (type: {type(sample_row[col])})")

    # Process records to include all necessary fields
    processed_records = []
    for idx, row in df.iterrows():
        if pd.isna(row['Agency']) and pd.isna(row['Resource Name']):
            continue
            
        record = {
            'Agency': row['Agency'],
            'Resource Name': row['Resource Name'],
            'Task Type': row['Task Type']
        }
        
        # Add values for each dropdown/checkbox field
        for heading, columns in headings.items():
            for col in columns:
                if pd.notna(col):  # Only process valid column names
                    # Convert boolean or float 1.0/0.0 to integer 1/0
                    value = row[col]
                    if isinstance(value, (bool, float)):
                        value = int(value == 1.0 or value is True)
                    record[col] = value
                    
        if idx < 2:  # Log first two records in detail
            print(f"\nDetailed Record {idx + 1}:")
            print("Resource Name:", record['Resource Name'])
            for heading, columns in headings.items():
                print(f"\n{heading} values:")
                for col in columns:
                    if col in record:
                        print(f"{col}: {record[col]} (type: {type(record[col])})")

        processed_records.append(record)

    print("\n=== Final Data Structure ===")
    print("Dropdowns:", json.dumps(dropdowns, indent=2))
    print("Checkboxes:", json.dumps(checkboxes, indent=2))
    print(f"Total Records: {len(processed_records)}")

    data = {
        'dropdowns': dropdowns,
        'checkboxes': checkboxes,
        'records': processed_records
    }

    return json.dumps(data)