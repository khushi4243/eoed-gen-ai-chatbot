import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';

// Import Lambda L2 construct
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as bedrock from "aws-cdk-lib/aws-bedrock";
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';


interface LambdaFunctionStackProps {  
  readonly wsApiEndpoint : string;  
  readonly sessionTable : Table;  
  readonly feedbackTable : Table;
  readonly feedbackBucket : s3.Bucket;
  readonly knowledgeBucket : s3.Bucket;
  readonly knowledgeBase : bedrock.CfnKnowledgeBase;
  readonly knowledgeBaseSource: bedrock.CfnDataSource;
}

export class LambdaFunctionStack extends cdk.Stack {  
  public readonly chatFunction : lambda.Function;
  public readonly sessionFunction : lambda.Function;
  public readonly feedbackFunction : lambda.Function;
  public readonly deleteS3Function : lambda.Function;
  public readonly getS3Function : lambda.Function;
  public readonly uploadS3Function : lambda.Function;
  public readonly syncKBFunction : lambda.Function;
  metadataHandlerFunction: cdk.aws_lambda.Function;
  excelRetrieverFunction: cdk.aws_lambda.Function;

  // add the system prompt and configurations 
  
  constructor(scope: Construct, id: string, props: LambdaFunctionStackProps) {
    super(scope, id);    

    const sessionAPIHandlerFunction = new lambda.Function(scope, 'SessionHandlerFunction', {
      runtime: lambda.Runtime.PYTHON_3_12, // Choose any supported Node.js runtime
      code: lambda.Code.fromAsset(path.join(__dirname, 'session-handler')), // Points to the lambda directory
      handler: 'lambda_function.lambda_handler', // Points to the 'hello' file in the lambda directory
      environment: {
        "DDB_TABLE_NAME" : props.sessionTable.tableName
      },
      timeout: cdk.Duration.seconds(30)
    });
    
    sessionAPIHandlerFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
        'dynamodb:Query',
        'dynamodb:Scan'
      ],
      resources: [props.sessionTable.tableArn, props.sessionTable.tableArn + "/index/*"]
    }));

    this.sessionFunction = sessionAPIHandlerFunction;

        // Define the Lambda function resource
        const websocketAPIFunction = new lambda.Function(scope, 'ChatHandlerFunction', {
          runtime: lambda.Runtime.NODEJS_20_X, // Choose any supported Node.js runtime
          code: lambda.Code.fromAsset(path.join(__dirname, 'websocket-chat')), // Points to the lambda directory
          handler: 'index.handler', // Points to the 'hello' file in the lambda directory
          environment : {
            "WEBSOCKET_API_ENDPOINT" : props.wsApiEndpoint.replace("wss","https"),            
            "PROMPT" : `You are BEACON AI, an AI assistant developed for the Massachusetts Executive Office of Economic 
            Development (EOED). Your primary role is to assist EOED Navigators in guiding businesses across the Commonwealth by 
            identifying relevant incentives, loans, grants, and programs, as well as providing accurate answers to business-related inquiries. 
            Your responses should always be polite, professional, and direct, focusing solely on EOED-related queries. If a question 
            falls outside your scope, clearly inform the user that you cannot provide information on unrelated topics.
            
            Guidance Tracks
            Resource Finder
            
            Purpose: Help Navigators match businesses with applicable Team MA incentives, loans, grants, and programs.
            Process:
            The Navigator enters business details, including:
            
            Category: Industry or sector of the business.
            
            Life Cycle Phase: Stage of the business (e.g., startup, growth, mature).
            
            Size of Business: Small, medium, or large.
            
            Business Needs: Dropdown options for Growing Operations, New Land Construction, or Existing Land Construction.
            Response Requirements:
            For each relevant incentive, loan, or program, retrieve and display the following details:
            Name of the program.
            Associated agency.
            Summary of the program.
            Eligibility requirements.
            Additional relevant information (e.g., deadlines, application process).
            If multiple programs meet similar criteria, list each applicable option with full details to provide comprehensive guidance.
            Chatbot
            Purpose: Address open-ended inquiries directly from Navigators by providing suggestions or information available through EOED and Team MA resources.
            Process:
            Retrieve relevant information using a web-crawled database of over 250 trusted websites.
            If the system lacks full details, provide the most helpful information available, beginning with a statement like:
            “I don’t have the complete information, but here’s something that might be helpful...”
            If the question is entirely outside the available scope, inform the Navigator with a polite message:
            “I’m sorry, I don’t have the information to answer this question.”
            
            Response Requirements:
            Suggest helpful business resources, programs, or information.
            Always verify and organize details for clarity and ease of understanding.
            General Guidelines
           
            Accuracy and Guardrails: Verify all information and avoid generating content outside verified data to minimize hallucination risks.
            Clarity and Structure: Organize responses so that essential details are clear and immediately actionable.
            Professional Tone: Ensure all responses are polite, respectful, and professionally helpful.`,
            'KB_ID' : props.knowledgeBase.attrKnowledgeBaseId
          },
          timeout: cdk.Duration.seconds(300)
        });
        websocketAPIFunction.addToRolePolicy(new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'bedrock:InvokeModelWithResponseStream',
            'bedrock:InvokeModel',
            
          ],
          resources: ["*"]
        }));
        websocketAPIFunction.addToRolePolicy(new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'bedrock:Retrieve'
          ],
          resources: [props.knowledgeBase.attrKnowledgeBaseArn]
        }));

        websocketAPIFunction.addToRolePolicy(new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'lambda:InvokeFunction'
          ],
          resources: [this.sessionFunction.functionArn]
        }));
        
        this.chatFunction = websocketAPIFunction;

    const feedbackAPIHandlerFunction = new lambda.Function(scope, 'FeedbackHandlerFunction', {
      runtime: lambda.Runtime.PYTHON_3_12, // Choose any supported Node.js runtime
      code: lambda.Code.fromAsset(path.join(__dirname, 'feedback-handler')), // Points to the lambda directory
      handler: 'lambda_function.lambda_handler', // Points to the 'hello' file in the lambda directory
      environment: {
        "FEEDBACK_TABLE" : props.feedbackTable.tableName,
        "FEEDBACK_S3_DOWNLOAD" : props.feedbackBucket.bucketName
      },
      timeout: cdk.Duration.seconds(30)
    });
    
    feedbackAPIHandlerFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
        'dynamodb:Query',
        'dynamodb:Scan'
      ],
      resources: [props.feedbackTable.tableArn, props.feedbackTable.tableArn + "/index/*"]
    }));

    feedbackAPIHandlerFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:*'
      ],
      resources: [props.feedbackBucket.bucketArn,props.feedbackBucket.bucketArn+"/*"]
    }));

    this.feedbackFunction = feedbackAPIHandlerFunction;
    
    const deleteS3APIHandlerFunction = new lambda.Function(scope, 'DeleteS3FilesHandlerFunction', {
      runtime: lambda.Runtime.PYTHON_3_12, // Choose any supported Node.js runtime
      code: lambda.Code.fromAsset(path.join(__dirname, 'knowledge-management/delete-s3')), // Points to the lambda directory
      handler: 'lambda_function.lambda_handler', // Points to the 'hello' file in the lambda directory
      environment: {
        "BUCKET" : props.knowledgeBucket.bucketName,        
      },
      timeout: cdk.Duration.seconds(30)
    });

    deleteS3APIHandlerFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:*'
      ],
      resources: [props.knowledgeBucket.bucketArn,props.knowledgeBucket.bucketArn+"/*"]
    }));
    this.deleteS3Function = deleteS3APIHandlerFunction;

    const getS3APIHandlerFunction = new lambda.Function(scope, 'GetS3FilesHandlerFunction', {
      runtime: lambda.Runtime.NODEJS_20_X, // Choose any supported Node.js runtime
      code: lambda.Code.fromAsset(path.join(__dirname, 'knowledge-management/get-s3')), // Points to the lambda directory
      handler: 'index.handler', // Points to the 'hello' file in the lambda directory
      environment: {
        "BUCKET" : props.knowledgeBucket.bucketName,        
      },
      timeout: cdk.Duration.seconds(30)
    });

    getS3APIHandlerFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:*'
      ],
      resources: [props.knowledgeBucket.bucketArn,props.knowledgeBucket.bucketArn+"/*"]
    }));
    this.getS3Function = getS3APIHandlerFunction;


    const kbSyncAPIHandlerFunction = new lambda.Function(scope, 'SyncKBHandlerFunction', {
      runtime: lambda.Runtime.PYTHON_3_12, // Choose any supported Node.js runtime
      code: lambda.Code.fromAsset(path.join(__dirname, 'knowledge-management/kb-sync')), // Points to the lambda directory
      handler: 'lambda_function.lambda_handler', // Points to the 'hello' file in the lambda directory
      environment: {
        "KB_ID" : props.knowledgeBase.attrKnowledgeBaseId,      
        "SOURCE" : props.knowledgeBaseSource.attrDataSourceId  
      },
      timeout: cdk.Duration.seconds(30)
    });

    kbSyncAPIHandlerFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:*'
      ],
      resources: [props.knowledgeBase.attrKnowledgeBaseArn]
    }));
    this.syncKBFunction = kbSyncAPIHandlerFunction;

    const uploadS3APIHandlerFunction = new lambda.Function(scope, 'UploadS3FilesHandlerFunction', {
      runtime: lambda.Runtime.NODEJS_20_X, // Choose any supported Node.js runtime
      code: lambda.Code.fromAsset(path.join(__dirname, 'knowledge-management/upload-s3')), // Points to the lambda directory
      handler: 'index.handler', // Points to the 'hello' file in the lambda directory
      environment: {
        "BUCKET" : props.knowledgeBucket.bucketName,        
      },
      timeout: cdk.Duration.seconds(30)
    });

    uploadS3APIHandlerFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:*'
      ],
      resources: [props.knowledgeBucket.bucketArn,props.knowledgeBucket.bucketArn+"/*"]
    }));
    this.uploadS3Function = uploadS3APIHandlerFunction;

  // Define the Lambda function for metadata
    const metadataHandlerFunction = new lambda.Function(scope, 'MetadataHandlerFunction', {
        runtime: lambda.Runtime.PYTHON_3_12,
        code: lambda.Code.fromAsset(path.join(__dirname, 'metadata-handler')),
        handler: 'lambda_function.lambda_handler',
        timeout: cdk.Duration.seconds(30),
        environment: {
          "BUCKET": props.knowledgeBucket.bucketName,
          "KB_ID": props.knowledgeBase.attrKnowledgeBaseId
        },
    });
  

  
      metadataHandlerFunction.addToRolePolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          's3:*' ,// Grants full access to all S3 actions (read, write, delete, etc.)
          'bedrock:InvokeModel',
          'bedrock:Retrieve',
        ],
        resources: [
          props.knowledgeBucket.bucketArn,               // Grants access to the bucket itself (for actions like ListBucket)
          props.knowledgeBucket.bucketArn + "/*" ,        // Grants access to all objects within the bucket
          'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0',  // Add the Bedrock model resource explicitly
          props.knowledgeBase.attrKnowledgeBaseArn,
  
        ]
      }));
  
  
  // Trigger the lambda function when a document is uploaded
  
      this.metadataHandlerFunction = metadataHandlerFunction;
  
        metadataHandlerFunction.addEventSource(new S3EventSource(props.knowledgeBucket, {
          events: [s3.EventType.OBJECT_CREATED],
        }));
    
  // define lambda function for excel retriever
    const excelRetrieverFunction = new lambda.Function(scope, 'ExcelRetrieverFunction', {
      runtime: lambda.Runtime.PYTHON_3_9, // Adjust runtime as needed
      code: lambda.Code.fromAsset(path.join(__dirname, 'load-excel')), // Path to your Lambda code
      handler: 'lambda_function.lambda_handler', 
      timeout: cdk.Duration.seconds(60),
      environment: {
        "BUCKET": props.knowledgeBucket.bucketName,
        "KB_ID": props.knowledgeBase.attrKnowledgeBaseId
      },
    });

    excelRetrieverFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:ListBucket',
        'bedrock:Retrieve',
      ],
      resources: [
        props.knowledgeBucket.bucketArn,               // Grants access to the bucket itself (for actions like ListBucket)
        props.knowledgeBucket.bucketArn + "/*" ,        // Grants access to all objects within the bucket
        'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0',  // Add the Bedrock model resource explicitly
        props.knowledgeBase.attrKnowledgeBaseArn,

      ]
    }));

    this.excelRetrieverFunction = excelRetrieverFunction;
  } 
  }
 
