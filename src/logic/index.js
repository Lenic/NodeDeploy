const { etcdPromise, jenkinsPromise } = require('./config');

module.exports = function (router) {

  // 获取所有可使用的部署任务
  router.get('/tasks', async ctx => {
    const jenkins = await jenkinsPromise
      , data = await jenkins.info();

    const machines = data.jobs.map(v => v.name).filter(v => v.indexOf('deploy-') === 0);

    ctx.type = 'application/json';
    ctx.body = JSON.stringify(machines, null, '  ');
  });

  // 部署特定的工程
  router.post('/build', async ctx => {
    const { body } = ctx.request
      , jenkins = await jenkinsPromise
      , urlInfo = body.packageUrl.split('/').filter(v => v)
      , [project_name, filename] = urlInfo.slice(urlInfo.length - 2)
      , list = filename.slice(0, filename.length - 7).split('-')
      , versionIndex = list.findIndex(v => v.indexOf('.') >= 0)
      , info = list.slice(versionIndex + 1)
      , [, package_id, commit_id] = info
      , branch_names = info.slice(0, info.length - 2)
      , branch_name = [branch_names[0]].concat(branch_names.slice(1).join('-')).filter(v => v).join('/')
      , id = await jenkins.build({
        name: body.task,
        parameters: {
          package_url: body.packageUrl,
          work_path: '/root/tmp',
          project_name,
          package_id,
          commit_id,
          branch_name,
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
