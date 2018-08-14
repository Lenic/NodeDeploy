const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const logic = require('./logic');

const app = new Koa()
  , router = new Router()
  , apiRouter = logic(new Router());

router.use('/api/v1', apiRouter.routes(), apiRouter.allowedMethods());

app
  .use(bodyParser())
  .use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.url} ……`);

    await next();
  })
  .use(router.routes())
  .listen(3000, () => console.log('listening at http://localhost:3000'));
