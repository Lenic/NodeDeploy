const path = require('path');
const Jenkins = require('jenkins');
const { Etcd3 } = require('etcd3');
var env = require('node-env-file');

const pify = require('../utils/promisify');

let envFile = path.resolve(process.cwd(), 'config/default');
console.info('load envFile', envFile);
env(envFile);

if (process.env.RUN_AT) {
  envFile = `${envFile}.${process.env.RUN_AT}`;

  console.info('load envFile', envFile);
  env(envFile, { overwrite: true });
}

module.exports = {
  etcd: new Etcd3({ hosts: [process.env.etcdURL] }),
  getJenkinsClient: () => {
    const jenkins = Jenkins({ crumbIssuer: true, baseUrl: process.env.jenkinsURL });

    return {
      info: pify(jenkins.info, { context: jenkins }),
      build: pify(jenkins.job.build, { context: jenkins.job }),
    };
  },
};
