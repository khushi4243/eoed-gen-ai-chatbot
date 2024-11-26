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
            "Category": df_master.columns[5:13],  # Columns E-L
            "Life Cycle": df_master.columns[13:17],  # Columns M-P
            "Size": df_master.columns[18:24],  # Columns Q-W
            "Grow Operations": df_master.columns[26:33],  # Columns Y-AF
            "Construct-New (Land)": df_master.columns[35:38],  # Columns AH-AK
            "Construct-Existing (Land)": df_master.columns[39:42]  # Columns AL-AO
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
    # Replace NaN values with 0
    df = df.replace({np.nan: 0})
    
    # Initialize dictionaries for dropdowns and checkboxes
    dropdowns = {}
    checkboxes = {}

    print("=== Processing Excel Data ===")
    
    # Process each heading category
    for main_heading, columns in headings.items():
        if main_heading in ["Size", "Life Cycle"]:
            # For dropdown categories, get the column names as options
            dropdown_values = [col for col in columns if pd.notna(col)]
            dropdowns[main_heading] = dropdown_values
        else:
            # For checkbox categories, get the column names as options
            checkbox_values = [col for col in columns if pd.notna(col)]
            checkboxes[main_heading] = checkbox_values

    # Process records to include all necessary fields
    processed_records = []
    for _, row in df.iterrows():
        if pd.isna(row['Agency']) and pd.isna(row['Resource Name']):
            continue
            
        record = {
            'Agency': row['Agency'],
            'Resource Name': row['Resource Name']
        }
        
        # Add values for each dropdown/checkbox field
        for heading, columns in headings.items():
            for col in columns:
                if pd.notna(col):  # Only process valid column names
                    # Convert boolean or float 1.0/0.0 to integer 1/0
                    value = row[col]
                    if isinstance(value, (bool, float)):
                        value = 1 if value == 1.0 or value is True else 0
                    record[col] = value

        processed_records.append(record)

    data = {
        'dropdowns': dropdowns,
        'checkboxes': checkboxes,
        'records': processed_records
    }

    print("\nSample record structure:")
    if processed_records:
        print(json.dumps(processed_records[0], indent=2))

    return json.dumps(data)