import boto3
import pandas as pd
from io import BytesIO
import os
from botocore.exceptions import ClientError

# Initialize boto3 clients
s3_client = boto3.client('s3')
bedrock = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
bedrock_invoke = boto3.client('bedrock-runtime', region_name='us-east-1')
kb_id = os.environ['KB_ID']

def retrieve_kb_docs(file_name, knowledge_base_id):
    try:
        key, _ = os.path.splitext(file_name)
        print(f"Search query KB : {key}")
        response = bedrock.retrieve(
            knowledgeBaseId=knowledge_base_id,
            retrievalQuery={'text': key},
            retrievalConfiguration={
                'vectorSearchConfiguration': {'numberOfResults': 20}
            }
        )

        full_content = []
        file_uri = None
        if response['retrievalResults']:
            for result in response['retrievalResults']:
                uri = result['location']['s3Location']['uri']
                if file_name in uri:
                    full_content.append(result['content']['text'])
                    file_uri = uri
            return {'content': full_content, 'uri': file_uri}

        return {'content': "No relevant document found in the knowledge base.", 'uri': None}
    except ClientError as e:
        print(f"Error fetching knowledge base docs: {e}")
        return {'content': "Error occurred while searching the knowledge base.", 'uri': None}

def fetch_excel_from_s3(uri):
    try:
        # Extract bucket name and object key from S3 URI
        bucket_name = uri.split('/')[2]
        object_key = '/'.join(uri.split('/')[3:])
        
        # Fetch the file from S3
        response = s3_client.get_object(Bucket=bucket_name, Key=object_key)
        excel_binary = response['Body'].read()
        
        # Convert the binary content to a BytesIO object for pandas
        return BytesIO(excel_binary)
    except ClientError as e:
        print(f"Error fetching Excel file from S3: {e}")
        return None

# Retrieve the Excel file URI
RESOURCES_EXCEL = retrieve_kb_docs("EOED-Master_1.xlsx", kb_id)

if RESOURCES_EXCEL['uri']:
    excel_file_stream = fetch_excel_from_s3(RESOURCES_EXCEL['uri'])
    if excel_file_stream:
        df = pd.read_excel(excel_file_stream, sheet_name='MASTER (Resource+Intake)')
        print(df.head())
    else:
        print("Failed to fetch the Excel file from S3.")
else:
    print("No valid URI found for the Excel file.")
