const yaml = require('node-yaml');
const Jenkins = require('jenkins');

const pify = require('../utils/promisify');
const Deferred = require('../utils/deferred');

const jenkinsPromise = pify(yaml.read, { context: yaml })('../../config/default.yml')
  .then(v => Jenkins({ crumbIssuer: true, baseUrl: v.jenkinsURL }));

module.exports = function (router) {

  // 获取所有可使用的部署任务
  router.get('/tasks', async ctx => {
    const jenkins = await jenkinsPromise
      , data = await pify(jenkins.info, { context: jenkins })();

    const machines = data.jobs.map(v => v.name).filter(v => v.indexOf('deploy-') === 0);

    ctx.type = 'application/json';
    ctx.body = JSON.stringify(machines, null, '  ');
  });

  // 部署特定的工程
  router.post('/build', async ctx => {
    const jenkins = await jenkinsPromise
      , build = pify(jenkins.job.build, { context: jenkins.job });

    const { body } = ctx.request;

    const id = await build({
      name: body.task,
      parameters: {
        package_url: body.packageUrl,
        work_path: '/root/tmp',
        project_name: 'portal-preact',
        package_id: 489,
        commit_id: 'c400e167',
        branch_name: 'hotfix/update-project-info',
        notification_url: 'https://oapi.dingtalk.com/robot/send?access_token=18950ef237a80508add81a804191ab07c51f543be7766772b115791b39293601'
      },
    });

    ctx.type = 'application/json';
    ctx.body = JSON.stringify({
      id,
      task: body.task,
    });
  });

  return router;
}
