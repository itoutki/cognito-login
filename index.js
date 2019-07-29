#!/usr/bin/env node
require("isomorphic-fetch")
const program = require("commander");
const Amplify = require("aws-amplify");
const Auth = Amplify.Auth

program
    .option('-u, --user <user>', 'user')
    .option('-p, --password <password>', 'password')
    .option('--region <region>', 'region')
    .option('--user-pool-id <user-pool-id>', 'user pool id')
    .option('--client-id <client-id>', 'client id')
    .option('--new-password <new-password>', 'new password')

const options = program.parse(process.argv);

if (options.user === undefined) {
    console.log("option user is required");
    process.exit(-1);
}

if (options.password === undefined) {
    console.log("option password is required");
    process.exit(-1);
}

const region = options.region || process.env.REGION;
const userPoolId = options.userPoolId || process.env.USER_POOL_ID;
const clientId = options.clientId || process.env.CLIENT_ID;

if (region === undefined) {
    console.log("option region is required");
    process.exit(-1);
}

if (userPoolId === undefined) {
    console.log("option user pool id is required");
    process.exit(-1);
}

if (clientId === undefined) {
    console.log("option client id is required");
    process.exit(-1);
}

console.log(region);
console.log(userPoolId);
console.log(clientId);

Amplify.default.configure({
    Auth: {
        region: region,
        userPoolId: userPoolId,
        userPoolWebClientId: clientId,
        mandatorySignIn: true
    }
})

Auth.signIn(options.user, options.password)
    .then(user => {
        if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
            if (options.newPassword === undefined) {
                return Promise.reject("option new password is required");
            }
            return Auth.completeNewPassword(user, options.newPassword);
        } else {
            return Promise.resolve(user);
        }
    })
    .then(user => Auth.currentSession())
    .then(data => {
        console.log(data.getIdToken().getJwtToken());
    })
    .catch(err => {
        console.log(err);
    })

