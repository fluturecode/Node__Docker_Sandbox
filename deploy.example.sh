#!/bin/bash

AppVersion=$(sed -n 's/"version": "\(.*\)".*/\1/p' package.json | xargs echo -n);
EBEnvironment=""
DockerRepository="";
Profile="default";
ProjectName="";
Region="";

ECRDeploymentOutput=$DockerRepository/$ProjectName:v$AppVersion;

$(sed "s|<ecr-repository-link>/<ecr-repository-name>:v<project-version-number>|$ECRDeploymentOutput|g" Dockerrun.example.aws.json > Dockerrun.aws.json);

echo Press enter to confirm build version: $AppVersion or Ctrl-C to cancel the build.

read DeploymentConfirm;

echo Building and pushing version $ProjectName:v$AppVersion to ECR using profile $Profile ...;

npm run build;

$(aws ecr get-login --no-include-email --region $Region --profile $Profile);

docker build -t $ProjectName . -f ./Dockerfile.prod;

docker tag $ProjectName:latest $DockerRepository/$ProjectName:v$ImageVersion;

docker push $DockerRepository/$ProjectName:v$ImageVersion;

eb deploy $EBEnvironment;