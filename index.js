'use strict';

var gulp = require('gulp');

module.exports = function () {
  var cb;
  var argsArr = [];

  for (var i = 0; i < arguments.length; i++) {
    argsArr[i] = arguments[i];
  }

  var toRunArr = argsArr.filter(function (task) {
    if (typeof task === 'string') {
      return true;
    }
    else if (Array.isArray(task)) {
      return true;
    }
    else if (typeof task === 'function') {
      cb = task;
      return false;
    }
    else {
      return false;
    }
  }).map(function (task) {
    if (typeof task === 'string') {
      return task;
    }
    else if (Array.isArray(task)) {
      return gulp.parallel.apply(null, task);
    }
  });

  var toRunFn = gulp.series.apply(null, toRunArr);

  toRunFn(cb);
};
