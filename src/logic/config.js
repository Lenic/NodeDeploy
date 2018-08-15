const yaml = require('node-yaml');
const Jenkins = require('jenkins');
const { Etcd3 } = require('etcd3');

const pify = require('../utils/promisify');
const Deferred = require('../utils/deferred');

const configPromise = pify(yaml.read, { context: yaml })('../../config/default.yml');

module.exports = {
  etcdPromise: configPromise.then(v => new Etcd3({ hosts: [v.etcdURL] })),
  jenkinsPromise: configPromise.then(v => {
    const jenkins = Jenkins({ crumbIssuer: true, baseUrl: v.jenkinsURL });

    return {
      info: pify(jenkins.info, { context: jenkins }),
      build: pify(jenkins.job.build, { context: jenkins.job }),
    };
  }),
};
