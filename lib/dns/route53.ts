import { Stack, StackProps, Tags, aws_route53 as route53} from 'aws-cdk-lib'
import { Construct } from 'constructs';
import ec2 = require('aws-cdk-lib/aws-ec2');
import targets = require('aws-cdk-lib/aws-route53-targets');


export interface RouteProps extends StackProps {
    vpc: ec2.Vpc;
    whichEnv: string;
    company: string;
    region: string;
    signinVpcEndpoint: ec2.InterfaceVpcEndpoint;
    consoleVpcEndpoint: ec2.InterfaceVpcEndpoint;

}

export class Route53 extends Stack {

    constructor(scope: Construct, id: string, props: RouteProps) {
        super(scope, id, props);

    const singingHostedZone = new route53.HostedZone(this, 'SigninHostedZone', {
            zoneName: 'signin.aws.amazon.com',
            vpcs: [props.vpc],

    });
    new route53.ARecord(this, 'SigninRecord', {
        zone: singingHostedZone,
        target: route53.RecordTarget.fromAlias(new targets.InterfaceVpcEndpointTarget(props.signinVpcEndpoint)),

    });

    new route53.ARecord(this, 'RegionRecord', {
        zone: singingHostedZone,
        target: route53.RecordTarget.fromAlias(new targets.InterfaceVpcEndpointTarget(props.signinVpcEndpoint)),
        recordName: props.region
    });

    const consoleHostedZone = new route53.HostedZone(this, 'ConsoleHostedZone', {
        zoneName: 'console.aws.amazon.com',
        vpcs: [props.vpc],
    });

    new route53.ARecord(this, 'ConsoleRecord', {
        zone: consoleHostedZone,
        target: route53.RecordTarget.fromAlias(new targets.InterfaceVpcEndpointTarget(props.consoleVpcEndpoint)),
    });

    new route53.ARecord(this, 'S3ConsoleRecord', {
        zone: consoleHostedZone,
        target: route53.RecordTarget.fromAlias(new targets.InterfaceVpcEndpointTarget(props.consoleVpcEndpoint)),
        recordName: "s3"
    });
    new route53.ARecord(this, 'GlobalConsoleRecord', {
        zone: consoleHostedZone,
        target: route53.RecordTarget.fromAlias(new targets.InterfaceVpcEndpointTarget(props.consoleVpcEndpoint)),
        recordName: "global"
    });

    new route53.ARecord(this, 'SupportConsoleRecord', {
        zone: consoleHostedZone,
        target: route53.RecordTarget.fromAlias(new targets.InterfaceVpcEndpointTarget(props.consoleVpcEndpoint)),
        recordName: "support"
    });

    new route53.ARecord(this, 'ResourceExplorerConsoleRecord', {
        zone: consoleHostedZone,
        target: route53.RecordTarget.fromAlias(new targets.InterfaceVpcEndpointTarget(props.consoleVpcEndpoint)),
        recordName: "resource-explorer"
    });

    new route53.ARecord(this, 'RegionConsoleRecord', {
        zone: consoleHostedZone,
        target: route53.RecordTarget.fromAlias(new targets.InterfaceVpcEndpointTarget(props.consoleVpcEndpoint)),
        recordName: props.region
    });
    }
}
