# Welcome to BEACON AI

## Overview
BEACON AI is a RAG based chatbot that allows Navigators from the Executive Office of Economic Development (EOED) have streamlined access to information about all resources within the EOED. This chatbot is powered by over 100+ documents and 250+ websites about various grant, program, and other informational resources within the agency. There is a Resources Finder interface that allows navigtars to easily select various categories about the business. The user can then filter through the results to find the relevant grants and programs, and send this information to the chatbot for more detailed informtion.

## Prerequisites :

Before you begin, ensure you have the following installed:

Node.js (version 14.x or later)
AWS CDK
Python (for Lambda functions)
AWS CLI configured with your AWS credentials

## Useful commands:
git clone <Github url> clone the repo
npm run build compile typescript to js
npm run watch watch for changes and compile
npm run test perform the jest unit tests
npx cdk deploy deploy this stack to your default AWS account/region
npx cdk diff compare deployed stack with current state
npx cdk synth emits the synthesized CloudFormation template
npm i Install dependencies

## Deployment Instructions
Change the constants in lib/constants.ts!
Deploy with npm run build && npx cdk deploy [stack name from constants.ts]
Configure Cognito using the CDK outputs

# Contributing 
## Contributions are welcome! Please follow these steps: 
Fork the repository.
Create a new branch (git checkout -b feature/YourFeature).
Make your changes and commit them (git commit -m 'Add some feature').
Push to the branch (git push origin feature/YourFeature).
Open a pull request.
