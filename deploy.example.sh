#!/bin/bash

EBEnvironment=""
DockerRepository="";
Profile="default";
ProjectName="";
Region="";

echo What is the next deployment version?;

read ImageVersion;

echo Building and pushing version $ProjectName:v$ImageVersion to ECR using profile $Profile ...;

$(aws ecr get-login --no-include-email --region $Region --profile $Profile);

docker build -t $ProjectName . -f ./Dockerfile.prod;

docker tag $ProjectName:latest $DockerRepository/$ProjectName:v$ImageVersion;

docker push $DockerRepository/$ProjectName:v$ImageVersion;

eb deploy $EBEnvironment;