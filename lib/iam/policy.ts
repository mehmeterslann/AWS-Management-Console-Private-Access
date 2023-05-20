import { Stack, StackProps, aws_iam as iam,} from 'aws-cdk-lib'
import { Construct } from 'constructs';
import ec2 = require('aws-cdk-lib/aws-ec2');

export interface PolicyProps extends StackProps {
    vpc: ec2.Vpc;
}

export class Policy extends Stack {

    constructor(scope: Construct, id: string, props: PolicyProps) {
        super(scope, id, props);

        let PrivateAccessPolicyManifest = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Deny",
                        "Action": "*",
                        "Resource": "*",
                        "Condition": {
                            "StringNotEqualsIfExists": {
                                "aws:SourceVpc": `${props.vpc.vpcCidrBlock}`
                            },
                            "Bool": {
                                "aws:ViaAwsService": "false"
                            }
                        }
                    }
                ]
        }        
    // Create IAM policy
    const PrivateAccessPolicy = iam.PolicyDocument.fromJson(PrivateAccessPolicyManifest);
    const PrivateAccessManagedPolicy = new iam.ManagedPolicy(this, "PrivateAccessManagedPolicy", {
        document: PrivateAccessPolicy,
        managedPolicyName: "PrivateAccess-policy",
    });
    
  

    }
}
