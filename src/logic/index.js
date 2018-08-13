const Deferred = require('../utils/deferred');
const pify = require('../utils/promisify');

const jenkins = require('jenkins')({
  baseUrl: 'http://admin:admin123@192.168.31.222:8080',
  crumbIssuer: true,
});

const j = pify(jenkins)
  , jobs = pify(jenkins.job);

module.exports = function (router) {
  router.get('/', async (ctx, next) => {
    await next();

    const data = await j.info();

    ctx.type = 'text/plain';
    ctx.body = JSON.stringify(data.jobs, null, '  ');
    ctx.body += '\n';

    const xml = await jobs.build({
      name: 'deploy-37',
      parameters: {
        target_path: '/target_path',
        zip_url: 'http://store.helianshare.com/repository/nas/doctor-manage/doctor-manage-2.0.2-master-497-08a34c2f.tar.gz',
        work_dir: '/workdir1111'
      },
    });

    console.log('xml', xml);
  });
}
