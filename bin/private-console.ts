#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as network from '../lib/network';
import * as dns from '../lib/dns';
import * as vpn from '../lib/vpn';
import * as iam from '../lib/iam';




export const app = new cdk.App();


let region:string= "eu-west-1";
let CompanyName:string= "company";
let whichEnv:string= "staging";
let accountid:string="507012062575";

// VPC - 
const vpcTest = new network.VPC(app, 'VPC', {
    company: CompanyName,
    cidr: '10.120.0.0/16',
    whichEnv: whichEnv,
    zone:1,
    gateway:1
  });

const VpcEndpoint = new network.VpcEndpoint(app,'VpcEndpoint',{
    vpc: vpcTest.vpc,
    whichEnv: whichEnv,
    company: CompanyName,
    region: region,
    accoundid: accountid
});

const route53 = new dns.Route53(app,'Route53',{
    vpc: vpcTest.vpc,
    whichEnv: whichEnv,
    company: CompanyName,
    region: region,
    signinVpcEndpoint: VpcEndpoint.signinendpoint,
    consoleVpcEndpoint: VpcEndpoint.consoleendpoint
});

const openvpn = new vpn.OpenVPN(app,'OpenVpn',{
    vpc: vpcTest.vpc,
    whichEnv: whichEnv,
    company: CompanyName
});

const policy = new iam.Policy(app,'PrivateConsolePolicy',{
    vpc: vpcTest.vpc,
});
// Synthesize the app
app.synth();
