const Deferred = require('../utils/deferred');
const pify = require('../utils/promisify');

const jenkins = require('jenkins')({
  baseUrl: 'http://admin:admin123@192.168.31.222:8080',
  crumbIssuer: true,
});

const j = pify(jenkins);

module.exports = function (router) {
  router.get('/', async (ctx, next) => {
    await next();

    const data = await j.info();

    ctx.type = 'text/plain';
    ctx.body = JSON.stringify(data.jobs, null, '  ');
    ctx.body += '\n';
  });
}
