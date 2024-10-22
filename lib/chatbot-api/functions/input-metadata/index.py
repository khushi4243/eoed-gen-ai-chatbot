import json
import boto3


def lambda_handler(event, context):
    
    print("S3 Event received:", json.dumps(event, indent=2))
    
    try:
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = event['Records'][0]['s3']['object']['key']
    except KeyError as e:
        print(f"Error extracting bucket/key from event: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error processing event: {str(e)}")
        }
    

    if bucket == 'eoedstack-chatbotapiknowledgesourcebucketd704ddfd-okcbypr8z19b':
        print(f"File uploaded to bucket: {bucket}")
        print(f"File key: {key}")
        
        return {
            'statusCode': 200,
            'body': json.dumps(f"Successfully processed file {key} from bucket {bucket}")
        }
    else:
        print(f"Unexpected bucket: {bucket}")
        return {
            'statusCode': 400,
            'body': json.dumps(f"Unexpected bucket: {bucket}")
        }