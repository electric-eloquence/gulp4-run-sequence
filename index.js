'use strict';

const gulp = require('gulp');

module.exports = function (tasks) {
  let cb;

  const toRunArr = tasks.filter(task => {
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
  }).map(task => {
    if (typeof task === 'string') {
      return task;
    }
    else if (Array.isArray(task)) {
      return gulp.parallel.apply(null, task);
    }
  });

  const toRunFn = gulp.series.apply(null, toRunArr);
  toRunFn(cb);
};
