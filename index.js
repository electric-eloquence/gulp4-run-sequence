'use strict';

function invalidArgumentTypeError() {
  TypeError.call(this);

  this.message = 'gulp4-run-sequence expects its arguments to be strings, arrays, or functions.';
  this.code = 'EINVAL';
}

function runSequence(gulp_) {
  var argsArr = [];
  var cb;
  var gulp = gulp_ || require('gulp');

  for (var i = 0; i < arguments.length; i++) {
    argsArr[i] = arguments[i];
  }

  var toRunArr = argsArr.filter(function (task, index) {
    if (typeof task === 'string') {
      return true;
    }
    else if (Array.isArray(task)) {
      return true;
    }
    else if (typeof task === 'function') {
      if (index === argsArr.length - 1) {
        cb = task;

        return false;
      }
      else {
        return true;
      }
    }
    else {
      if (module.exports.options.errorOnInvalidArgumentType) {
        throw new invalidArgumentTypeError();
      }

      return false;
    }
  }).map(function (task, index) {
    if (typeof task === 'string') {
      return task;
    }
    else if (Array.isArray(task)) {
      return gulp.parallel.apply(null, task);
    }
    else if (typeof task === 'function') {
      if (index < argsArr.length - 1) {
        return task;
      }
    }
  });

  try {
    var toRunFn = gulp.series.apply(null, toRunArr);

    toRunFn(cb);
  }
  catch (err) {
    // This can be a very helpful error message, but the logic for catching it is brittle, because the dependency that
    // emits the error may change without warning. The only way to ensure its usefulness is to constantly test with the
    // latest dependencies.
    if (err.message.indexOf('Task never defined') === 0) {
      err.message += '. If your code requires multiple gulp instances, try consolidating them into one instance.' +
        ' Otherwise, try require(\'gulp4-run-sequence\').use(gulp).';
    }

    throw err;
  }
}

module.exports = runSequence.bind(null, null);
module.exports.use = function (gulp) {
  return runSequence.bind(null, gulp);
};
module.exports.options = {};
