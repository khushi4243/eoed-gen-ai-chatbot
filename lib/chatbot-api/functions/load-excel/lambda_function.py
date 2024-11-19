import json
import boto3
import pandas as pd
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
        raise EnvironmentError("KB_ID environment variable not set")

    try:
        # Retrieve the Excel file
        local_path = retrieve_kb_docs("EOED-Master_1.xlsx", kb_id, bedrock, s3)
        print(f"File retrieved and saved to {local_path}")

        # Read the Excel file
        df = pd.read_excel(local_path, header=[0, 1])  # Adjust header rows if necessary
        print(df.head())  # For debugging

        # Process the DataFrame into the desired format
        data = process_excel_data(df)

        # Return the data as a JSON response
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Adjust as necessary
                'Content-Type': 'application/json'
            },
            'body': json.dumps(data)
        }

    except Exception as e:
        print(f"Failed to retrieve or process file: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Adjust as necessary
                'Content-Type': 'application/json'
            },
            'body': json.dumps(f"Failed to retrieve or process file: {str(e)}")
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


def process_excel_data(df):
    # This function processes the DataFrame and returns data in the desired format

    # Initialize dictionaries to hold dropdown and checkbox options
    dropdowns = {}
    checkboxes = {}

    # Assuming the first two rows are headers (adjust as necessary)
    # Flatten multi-level columns if needed
    df.columns = [' '.join(col).strip() for col in df.columns.values]

    # Extract unique values for dropdowns and checkboxes
    # Adjust column names to match your Excel file

    # For example, extract options for 'Life Cycle' dropdown
    if 'Life Cycle' in df.columns:
        dropdowns['Life Cycle'] = df['Life Cycle'].dropna().unique().tolist()

    # Extract options for 'Size' dropdown
    if 'Size' in df.columns:
        dropdowns['Size'] = df['Size'].dropna().unique().tolist()

    # Extract options for 'Category' checkboxes
    if 'Category' in df.columns:
        checkboxes['Category'] = df['Category'].dropna().unique().tolist()

    # Similarly extract for other categories
    # For checkboxes that may have multiple columns (e.g., 'Grow Operations'), you may need to handle binary columns
    # For the sake of example, let's handle binary columns indicating the presence (1) or absence (0) of a category

    # Identify binary columns (assuming they are binary indicators)
    binary_columns = [col for col in df.columns if df[col].dropna().isin([0,1]).all()]

    # For each binary column, add the column name to the checkbox options
    for col in binary_columns:
        # You can categorize them if necessary
        checkboxes.setdefault('Binary Categories', []).append(col)

    # Convert DataFrame to a list of dictionaries for records
    records = df.to_dict(orient='records')

    # Prepare the data to return
    data = {
        'dropdowns': dropdowns,
        'checkboxes': checkboxes,
        'records': records
    }

    return json.dumps(data)