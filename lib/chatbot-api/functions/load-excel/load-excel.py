import boto3
import pandas as pd
from io import BytesIO
import os
from botocore.exceptions import ClientError

# Initialize boto3 clients
s3_client = boto3.client('s3')
bedrock = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
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
                    'numberOfResults': 20
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

        return {'uri': file_uri}
    except ClientError as e:
        print(f"Error fetching knowledge base docs: {e}")
        return {'uri': None}

def fetch_excel_from_s3(uri):
    try:
        if not uri.startswith("s3://"):
            raise ValueError("Invalid S3 URI format")
        
        # Parse the bucket name and object key
        parts = uri.replace("s3://", "").split("/", 1)
        bucket_name, object_key = parts[0], parts[1]
        
        # Fetch the file from S3
        response = s3_client.get_object(Bucket=bucket_name, Key=object_key)
        return BytesIO(response['Body'].read())
    except (ClientError, ValueError) as e:
        print(f"Error fetching Excel file from S3: {e}")
        return None

# Retrieve the Excel file URI
RESOURCES_EXCEL = retrieve_kb_docs("EOED-Master_1.xlsx", kb_id)

if RESOURCES_EXCEL['uri']:
    excel_file_stream = fetch_excel_from_s3(RESOURCES_EXCEL['uri'])
    if excel_file_stream:
        try:
            df = pd.read_excel(excel_file_stream, sheet_name='MASTER (Resource+Intake)')
            print(df.head())
        except Exception as e:
            print(f"Error reading Excel file: {e}")
    else:
        print("Failed to fetch the Excel file from S3.")
else:
    print("No valid URI found for the Excel file.")
