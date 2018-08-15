const { etcdPromise, jenkinsPromise } = require('./config');

module.exports = function (router) {

  // 获取所有可使用的部署任务
  router.get('/tasks', async ctx => {
    const jenkins = await jenkinsPromise
      , data = await jenkins.info()
      , etcd = await etcdPromise;

    const tasks = data
      .jobs
      .map(v => v.name)
      .filter(v => v.indexOf('deploy-') === 0)
      .map(async v => {
        const prefix = `node-deploy/${v}/work_path/`
          , keys = await etcd.getAll().prefix(prefix).keys()
          , projects = keys.map(v => v.slice(prefix.length));

        return {
          machine: v,
          projects,
        };
      });

    const result = await Promise.all(tasks);

    ctx.type = 'application/json';
    ctx.body = JSON.stringify(result);
  });

  // 部署特定的工程
  router.post('/build', async ctx => {
    const { body } = ctx.request
      , jenkins = await jenkinsPromise
      , etcd = await etcdPromise
      , notification_url = await etcd.get(`node-deploy/notifications/${body.project}`).string()
      , urlInfo = body.url.split('/').filter(v => v)
      , [project_name, filename] = urlInfo.slice(urlInfo.length - 2)
      , work_path = await etcd.get(`node-deploy/${body.machine}/work_path/${body.project}`).string()
      , list = filename.slice(0, filename.length - 7).split('-')
      , versionIndex = list.findIndex(v => v.indexOf('.') >= 0)
      , info = list.slice(versionIndex + 1)
      , [, package_id, commit_id] = info
      , branch_names = info.slice(0, info.length - 2)
      , branch_name = [branch_names[0]].concat(branch_names.slice(1).join('-')).filter(v => v).join('/')
      , id = await jenkins.build({
        name: body.machine,
        parameters: {
          package_url: body.packageUrl,
          work_path,
          project_name,
          package_id,
          commit_id,
          branch_name,
          notification_url,
        },
      });

    ctx.type = 'application/json';
    ctx.body = JSON.stringify({
      id,
      machine: body.machine,
    });
  });

  return router;
}
