<div align="center" width="100%">
    <br>
    <br>
    <h1>AWS MANAGEMENT CONSOLE PRIVATE ACCESS</h1>
</div>

## 🔧 

Required Tools: 
- [CDK](https://docs.aws.amazon.com/cdk/api/v2/) = 2.64.0
- [Node](https://nodejs.org/en/download/) = v19.4.0
- [Npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) = 9.2.*



## Places to be edited
### We can configure aws and arrange the parts in the private-console.ts file under the bin file according to our own configurations.
### 
```bash
let region:string= ""; #The region where the cdk will be deployed must contain regions supported by AWS manage private console access. AWS DOC: https://docs.aws.amazon.com/awsconsolehelpdocs/latest/gsg/console-private-access.html
let CompanyName:string= "";   
let whichEnv:string= "";
let accountid:string="";


const vpcTest = new network.VPC(app, 'VPC', {
    company: CompanyName,
    cidr: '10.120.0.0/16', #VPC cidr to use
    whichEnv: whichEnv,
    zone:1,
    gateway:1
});

```

### PrivateAccess-policy must be attached after the cdk is deployed on users to restrict public access.
### In the openvpn server, the client.ovpn was created ready under the /root directory, you can connect to the server via ssm and get the ovpn file and establish a connection


## Bootstrap

* `cdk bootstrap` 

## Build Command

* `npm run private-console diff "*"` 


## Deploy Command

* `npm run private-console-deploy "*"` 