import { Construct } from "constructs";
import { Stack, StackProps, Tags, aws_ssm } from "aws-cdk-lib";
import { readFileSync } from "fs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from 'aws-cdk-lib/aws-iam';


export interface OpenVPNProps extends StackProps {
    vpc: ec2.Vpc;
    whichEnv: string;
    company: string;
}

export class OpenVPN extends Stack {
  constructor(scope: Construct, id: string, props: OpenVPNProps) {
    super(scope, id);

  
    const ec2SG = new ec2.SecurityGroup(this, props.company + "-" + props.whichEnv +"-openvpn-sg", {
      vpc:props.vpc,
      allowAllOutbound: true,
    });

    ec2SG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.udp(1194));

    const ec2Role = new iam.Role(this, props.company + "-" + props.whichEnv +"-ssm-role", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonSSMManagedInstanceCore"
        ),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "CloudWatchAgentServerPolicy"
        ),
      ],
    });
    

    const ec2Instance = new ec2.Instance(this, "OpenVpn", {
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      instanceName: props.company + "-" + props.whichEnv +"openvpn" ,
      role: ec2Role,
      securityGroup: ec2SG,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
    });
    const elasticIp = new ec2.CfnEIP(this, props.company + "-" + props.whichEnv +"openvpn-elasticip", {
      domain: "vpc",
      instanceId: ec2Instance.instanceId,
    });
    Tags.of(ec2Instance).add("Name", props.company + "-" + props.whichEnv +"openvpn")
    Tags.of(ec2Instance).add("CostCenter", props.company + "-" + props.whichEnv +"openvpn")
    Tags.of(elasticIp).add("Name", props.company + "-" + props.whichEnv +"openvpn-elasticip");
    Tags.of(elasticIp).add("CostCenter", props.company + "-" + props.whichEnv +"openvpn-elasticip");
    Tags.of(ec2SG).add("Name", props.company + "-" + props.whichEnv+"openvpn-sg");


    const cfnEIPAssociation = new ec2.CfnEIPAssociation(
      this,
      "openvpn-elasticip-association", {
        allocationId: elasticIp.attrAllocationId,
        instanceId: ec2Instance.instanceId,
        privateIpAddress: ec2Instance.instancePrivateIp,
      }
    );
      
    ec2Instance.node.addDependency(ec2Role, ec2SG);
    elasticIp.node.addDependency(ec2Instance);

    const vpnInstallScript = readFileSync("./lib/scripts/openvpn.sh", "utf8");
    const cfnAssociation = new aws_ssm.CfnAssociation(this, "OpenVpnAssociation", {
      name: 'AWS-RunShellScript',
      applyOnlyAtCronInterval: false,
      associationName: 'openvpn-shell-script',
      targets: [{
        key: 'InstanceIds',
        values: [ec2Instance.instanceId],
      }],   
      parameters: {
        commands: [vpnInstallScript]
      },
    });
    cfnAssociation.node.addDependency(ec2Instance, elasticIp, cfnEIPAssociation)

  }
}
