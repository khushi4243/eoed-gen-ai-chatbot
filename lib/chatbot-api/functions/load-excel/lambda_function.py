import json
import boto3
import pandas as pd
from io import BytesIO
import os
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    # Initialize boto3 clients
    bedrock = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
    s3 = boto3.client('s3')
    kb_id = os.getenv('KB_ID', None)

    if not kb_id:
        raise EnvironmentError("KB_ID environment variable not set")

    try:
        # Retrieve the Excel file
        local_path = retrieve_kb_docs("EOED-Master_1.xlsx", kb_id, bedrock, s3)
        print(f"File retrieved and saved to {local_path}")

        # Read the Excel file (optional)
        df = pd.read_excel(local_path)
        print(df.head())  # For example, print the first few rows

        # Return a success response
        return {
            'statusCode': 200,
            'body': json.dumps('File retrieved and processed successfully')
        }

    except Exception as e:
        print(f"Failed to retrieve file: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"Failed to retrieve file: {str(e)}")
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
                    'numberOfResults': 1  # We only want the most relevant document
                }
            }
        )

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

