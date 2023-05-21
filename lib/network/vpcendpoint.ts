import { Stack, StackProps,aws_iam as iam, } from 'aws-cdk-lib'
import { Construct } from 'constructs';
import ec2 = require('aws-cdk-lib/aws-ec2');


export interface VpcEndpointProps extends StackProps {
    vpc: ec2.Vpc;
    whichEnv: string;
    company: string;
    region: string;
    accoundid: string;
}

export class VpcEndpoint extends Stack {
    public readonly signinendpoint: ec2.InterfaceVpcEndpoint;
    public readonly consoleendpoint: ec2.InterfaceVpcEndpoint;


    constructor(scope: Construct, id: string, props: VpcEndpointProps) {
        super(scope, id, props);


        const securityGroup = new ec2.SecurityGroup(this, 'VpcEndpointSecurityGroup', {
            vpc: props.vpc,
            allowAllOutbound: true,
            securityGroupName: props.company+'-vpcendpoint-sg-' + props.whichEnv,
            
        });
        securityGroup.addIngressRule(ec2.Peer.ipv4(props.vpc.vpcCidrBlock), ec2.Port.tcp(443));

       this.consoleendpoint = new ec2.InterfaceVpcEndpoint(this, 'VPCConsoleEndpoint', {
            vpc: props.vpc,
            service: new ec2.InterfaceVpcEndpointService('com.amazonaws.'+props.region+'.console', 443),
            subnets: {
                subnetGroupName: props.company + "-" + props.whichEnv + '-private-database'
            },
            securityGroups: [securityGroup],
            privateDnsEnabled: true
        });
        this.consoleendpoint.addToPolicy( new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            principals:[new iam.AnyPrincipal()],
            actions: ['*'],
            resources: ['*'],
            conditions: {
              'StringEquals': {
                'aws:PrincipalAccount': props.accoundid,
              }
            }
          }))
        this.signinendpoint = new ec2.InterfaceVpcEndpoint(this, 'VPCSigninEndpoint', {
            vpc: props.vpc,
            service: new ec2.InterfaceVpcEndpointService('com.amazonaws.'+props.region+'.signin', 443),
            subnets: {
                subnetGroupName: props.company + "-" + props.whichEnv + '-private-generic'
            },
            securityGroups: [securityGroup],
            privateDnsEnabled: true
        });

        this.signinendpoint.addToPolicy( new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            principals:[new iam.AnyPrincipal()],
            actions: ['*'],
            resources: ['*'],
            conditions: {
              'StringEquals': {
                'aws:PrincipalAccount': props.accoundid,
              }
            }
          }));
    }
}
