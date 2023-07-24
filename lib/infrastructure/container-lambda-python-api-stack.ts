import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_lambda as lambda, aws_ec2 as ec2, Duration, } from 'aws-cdk-lib'
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as path from 'path'
import { SsmHelper } from '../infrastructure/utils/ssm-helper'

export class ContainerLambdaPythonApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);



    // You can import existing VPC by providing vpc id here 
    const myVpc = ec2.Vpc.fromLookup(this, `vpc`, {
      vpcId: "1234567890",
    })

    const lambdaSg = new ec2.SecurityGroup(this, 'lambda-sg', {
      vpc: myVpc,
      allowAllOutbound: true,
      description: 'security group for API',
    })

    //Add your desired ip address for incomming trafic
    lambdaSg.addIngressRule(ec2.Peer.ipv4('1.2.3.4/8'), ec2.Port.tcp(443), 'allow https incoming trafic from specific network')


    const lambdaRole = new Role(this, 'python-lambda-role', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
      ],
    })

    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: ['*'],
        actions: [
          'ssm:GetParameter',
        ],
      }),
    )

    const fnEndpoint = new lambda.Function(this, 'Function', {
      code: lambda.Code.fromAsset(path.join(__dirname, `/../applications/sample_api/`), {
        bundling: {
          image: lambda.Runtime.PYTHON_3_9.bundlingImage,
          command: [
            'bash', '-c',
            'pip install -r requirements.txt -t /asset-output && cp -au . /asset-output'
          ],
        },
      }),

      handler: "controller.handler",
      runtime: lambda.Runtime.PYTHON_3_9,
      memorySize: 256,
      vpc: myVpc,
      securityGroups: [lambdaSg],
      role: lambdaRole,
      timeout: Duration.minutes(1),
    })
    
    
    const functionUrl = fnEndpoint.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.AWS_IAM,
      cors: {
        allowedOrigins: ['*'],
      },
    })

    SsmHelper.putParameter(
      this,
      `/my-app/endpoint/my-api`,
      functionUrl.url,
    )
  }
}
