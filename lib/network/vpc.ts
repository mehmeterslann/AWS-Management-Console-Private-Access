import { Stack, StackProps, Tags } from 'aws-cdk-lib'
import { Construct } from 'constructs';
import ec2 = require('aws-cdk-lib/aws-ec2');

export interface VPCProps extends StackProps {
    company: string;
    whichEnv: string;
    cidr: string;
    zone: number;
    gateway: number;
}

export class VPC extends Stack {
    public readonly vpc: ec2.Vpc;

    constructor(scope: Construct, id: string, props: VPCProps) {
        super(scope, id, props);

        this.vpc = new ec2.Vpc(this, 'VPC', {
            vpcName: props.company + props.whichEnv + '-vpc',
            cidr: props.cidr,
            maxAzs: props.zone,
            enableDnsHostnames: true,
            enableDnsSupport: true,
            subnetConfiguration: [
                {
                  cidrMask: 21,
                  name: props.company + "-" + props.whichEnv + '-public-xlb',
                  subnetType: ec2.SubnetType.PUBLIC, 
                },
                {
                  cidrMask: 21,
                  name: props.company + "-" + props.whichEnv + '-private-database',
                  subnetType: ec2.SubnetType.PRIVATE_ISOLATED, 
                },
                {
                  cidrMask: 24,
                  name: props.company + "-" + props.whichEnv + '-private-generic',
                  subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                }
              ],
            natGateways: props.gateway,
        });
        Tags.of(this.vpc).add('Name', props.company + "-" + props.whichEnv + "-vpc");

        for (const subnet of this.vpc.publicSubnets) {
          Tags.of(subnet).add('Name', `${subnet.node.id.replace(/Subnet[0-9]$/, '')}-${subnet.availabilityZone}`);

        };
        for (const subnet of this.vpc.privateSubnets) {
          Tags.of(subnet).add('Name', `${subnet.node.id.replace(/Subnet[0-9]$/, '')}-${subnet.availabilityZone}`);
        };
    }
}
