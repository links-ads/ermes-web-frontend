// File name: ./runWithEnv.js
/* eslint-env node */
// Example based on https://stackoverflow.com/questions/52174249/set-node-environment-variable-to-dynamic-value-in-npm-script/55284054#55284054
const execSync = require('child_process').execSync
const env = Object.create(process.env)
const command = process.argv[2]
const projectname = process.argv[3]

env['REACT_APP_GIT_SHA'] = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
env['REACT_APP_BUILD_DATE'] = Date.now()

console.log('Used env variables: ' + JSON.stringify(env))
console.log('Run command: react-scripts ' + command)
execSync('npx react-scripts ' + command, { env: env, stdio: 'inherit' })
execSync('sh create_public_content.sh '+ projectname, { stdio: 'inherit' })
execSync('sh deploy-to-azure.sh ' + projectname, { stdio: 'inherit' })