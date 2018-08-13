const Deferred = require('./deferred');

const callback = (fn, context) => (...args) => {
  const defer = Deferred();

  const wrapper = (error, data) => {
    if (error) {
      defer.reject(error);
    } else {
      defer.resolve(data);
    }
  };

  fn.apply(context, args.concat(wrapper));

  return defer.promise;
};

module.exports = function (target) {
  const result = {};

  for (const key in target) {
    result[key] = callback(target[key], target);
  }

  return result;
};
