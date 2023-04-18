#bin/bash

sam package --template-file template.yaml --s3-bucket aws-event-photo-manager-codebase --output-template-file packaged.yaml --profile demohub

sam deploy --template-file packaged.yaml --stack-name aws-event-photo-manager --capabilities CAPABILITY_IAM --profile demohub --region ap-southeast-1