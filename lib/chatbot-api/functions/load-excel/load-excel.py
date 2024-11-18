import boto3
import pandas as pd
from io import BytesIO
import os
from botocore.exceptions import ClientError

# Initialize boto3 clients
bedrock = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
s3 = boto3.client('s3')
kb_id = os.getenv('KB_ID', None)

if not kb_id:
    raise EnvironmentError("KB_ID environment variable not set")

def retrieve_kb_docs(file_name, knowledge_base_id):
    try:
        key, _ = os.path.splitext(file_name)
        print(f"Search query KB : {key}")
        response = bedrock.retrieve(
            knowledgeBaseId=knowledge_base_id,
            retrievalQuery={'text': key},
            retrievalConfiguration={
                'vectorSearchConfiguration': {
                    'numberOfResults': 1  # We only want the relevant document
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
        
        s3_parts = file_uri.replace("s3://", "").split("/", 1)
        bucket_name = s3_parts[0]
        object_key = s3_parts[1]

        # Download the file from S3
        local_file_path = f"/tmp/{file_name}"
        s3.download_file(bucket_name, object_key, local_file_path)
        print(f"File downloaded to {local_file_path}")

        return local_file_path

    except Exception as e:
        print(f"Error retrieving document: {e}")
        raise
    
    

    

# def fetch_excel_from_s3(uri):
#     try:
#         if not uri.startswith("s3://"):
#             raise ValueError("Invalid S3 URI format")
        
#         # Parse the bucket name and object key
#         parts = uri.replace("s3://", "").split("/", 1)
#         bucket_name, object_key = parts[0], parts[1]
        
#         # Fetch the file from S3
#         response = s3_client.get_object(Bucket=bucket_name, Key=object_key)
#         return BytesIO(response['Body'].read())
#     except (ClientError, ValueError) as e:
#         print(f"Error fetching Excel file from S3: {e}")
#         return None

# Retrieve the Excel file URI
RESOURCES_EXCEL = retrieve_kb_docs("EOED-Master_1.xlsx", kb_id)

try:
    local_path = retrieve_kb_docs(RESOURCES_EXCEL, kb_id)
    print(f"File retrieved and saved to {local_path}")
except Exception as e:
    print(f"Failed to retrieve file: {e}")
