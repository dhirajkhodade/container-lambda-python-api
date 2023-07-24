#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ContainerLambdaPythonApiStack } from '../lib/infrastructure/container-lambda-python-api-stack';

const app = new cdk.App();
new ContainerLambdaPythonApiStack(app, 'ContainerLambdaPythonApiStack', {
  env: { account: '123456789012', region: 'us-east-1' },
});