'use strict';

const fs = require('fs');
const path = require('path');

const expect = require('chai').expect;
const gulp = require('gulp');

const runSequence = require('../index');

const fixturesDir = path.join(__dirname, 'fixtures');
const destDir = path.join(fixturesDir, 'dest');
const parallelDir = path.join(fixturesDir, 'parallel');
const srcDir = path.join(fixturesDir, 'src');
const seriesDir = path.join(fixturesDir, 'series');

const enc = 'utf8';
const timeout = 10;

let boilWaterStart;
let boilWaterStop;
gulp.task('boilWater', function (cb) {
  boilWaterStart = Date.now();

  setTimeout(function () {
    boilWaterStop = Date.now();
    cb();
  }, timeout);
});

let steepTeaStart;
let steepTeaStop;
gulp.task('steepTea', function (cb) {
  steepTeaStart = Date.now();

  setTimeout(function () {
    steepTeaStop = Date.now();
    cb();
  }, timeout);
});

let boilEggStart;
let boilEggStop;
gulp.task('boilEgg', function (cb) {
  boilEggStart = Date.now();

  setTimeout(function () {
    boilEggStop = Date.now();
    cb();
  }, timeout);
});

let toastBreadStart;
let toastBreadStop;
gulp.task('toastBread', function (cb) {
  toastBreadStart = Date.now();

  setTimeout(function () {
    toastBreadStop = Date.now();
    cb();
  }, timeout);
});

let peelEggStart;
let peelEggStop;
gulp.task('peelEgg', function (cb) {
  peelEggStart = Date.now();

  setTimeout(function () {
    peelEggStop = Date.now();
    cb();
  }, timeout);
});

let spreadOnToastStart;
let spreadOnToastStop;
gulp.task('spreadOnToast', function (cb) {
  spreadOnToastStart = Date.now();

  setTimeout(function () {
    spreadOnToastStop = Date.now();
    cb();
  }, timeout);
});

describe('gulp4-run-sequence', function () {
  before(function (done) {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir);
    }

    if (!fs.existsSync(parallelDir)) {
      fs.mkdirSync(parallelDir);
    }

    if (!fs.existsSync(seriesDir)) {
      fs.mkdirSync(seriesDir);
    }

    fs.readdir(destDir, function (err, files) {
      files.forEach(function (file) {
        fs.unlinkSync(path.join(destDir, file));
      });

      fs.readdir(parallelDir, function (err, files) {
        files.forEach(function (file) {
          fs.unlinkSync(path.join(parallelDir, file));
        });

        fs.readdir(seriesDir, function (err, files) {
          files.forEach(function (file) {
            fs.unlinkSync(path.join(seriesDir, file));
          });
          done();
        });
      });
    });
  });

  it('should run callback tasks in series', function (done) {
    gulp.task('seriesCallbacks', function (cb) {
      runSequence(
        'boilWater',
        'steepTea',
        cb
      );
    });

    gulp.series('seriesCallbacks')(function () {
      expect(boilWaterStart).to.be.a('number');
      expect(boilWaterStop).to.be.a('number');
      expect(steepTeaStart).to.be.a('number');
      expect(steepTeaStop).to.be.a('number');
      expect(steepTeaStart).to.not.be.below(boilWaterStop);
      done();
    });
  });

  it('should run callback tasks in parallel', function (done) {
    gulp.task('parallelCallbacks', function (cb) {
      runSequence(
        ['boilWater', 'toastBread'],
        cb
      );
    });

    gulp.series('parallelCallbacks')(function () {
      expect(boilWaterStart).to.be.a('number');
      expect(boilWaterStop).to.be.a('number');
      expect(toastBreadStart).to.be.a('number');
      expect(toastBreadStop).to.be.a('number');
      expect(boilWaterStart).to.be.below(toastBreadStop);
      expect(toastBreadStart).to.be.below(boilWaterStop);
      done();
    });
  });

  it('should allow null tasks', function (done) {
    gulp.task('nullTask', function (cb) {
      runSequence(
        'boilWater',
        null,
        'steepTea',
        cb
      );
    });

    gulp.series('nullTask')(function () {
      expect(boilWaterStart).to.be.a('number');
      expect(boilWaterStop).to.be.a('number');
      expect(steepTeaStart).to.be.a('number');
      expect(steepTeaStop).to.be.a('number');
      expect(steepTeaStart).to.not.be.below(boilWaterStop);
      done();
    });
  });

  it('should run a serial task, then two parallel tasks', function (done) {
    gulp.task('serialThenTwoParallel', function (cb) {
      runSequence(
        'boilWater',
        ['steepTea', 'boilEgg'],
        cb
      );
    });

    gulp.series('serialThenTwoParallel')(function () {
      expect(boilWaterStart).to.be.a('number');
      expect(boilWaterStop).to.be.a('number');
      expect(steepTeaStart).to.be.a('number');
      expect(steepTeaStop).to.be.a('number');
      expect(boilEggStart).to.be.a('number');
      expect(boilEggStop).to.be.a('number');
      expect(boilWaterStop).to.not.be.above(steepTeaStart);
      expect(boilWaterStop).to.not.be.above(boilEggStart);
      expect(steepTeaStart).to.not.be.below(boilWaterStop);
      expect(boilEggStart).to.not.be.below(boilWaterStop);
      expect(steepTeaStart).to.be.below(boilEggStop);
      expect(boilEggStart).to.be.below(steepTeaStop);
      done();
    });
  });

  it('should run two parallel tasks, then a serial task', function (done) {
    gulp.task('twoParallelThenSerial', function (cb) {
      runSequence(
        ['steepTea', 'boilEgg'],
        'peelEgg',
        cb
      );
    });

    gulp.series('twoParallelThenSerial')(function () {
      expect(steepTeaStart).to.be.a('number');
      expect(steepTeaStop).to.be.a('number');
      expect(boilEggStart).to.be.a('number');
      expect(boilEggStop).to.be.a('number');
      expect(peelEggStart).to.be.a('number');
      expect(peelEggStop).to.be.a('number');
      expect(steepTeaStart).to.be.below(boilEggStop);
      expect(boilEggStart).to.be.below(steepTeaStop);
      expect(steepTeaStop).to.not.be.above(peelEggStart);
      expect(boilEggStop).to.not.be.above(peelEggStart);
      expect(peelEggStart).to.not.be.below(steepTeaStop);
      expect(peelEggStart).to.not.be.below(boilEggStop);
      done();
    });
  });

  it('should run a serial task, then two parallel tasks, then a serial task', function (done) {
    gulp.task('serialThenTwoParallelThenSerial', function (cb) {
      runSequence(
        'boilEgg',
        ['toastBread', 'peelEgg'],
        'spreadOnToast',
        cb
      );
    });

    gulp.series('serialThenTwoParallelThenSerial')(function () {
      expect(boilEggStart).to.be.a('number');
      expect(boilEggStop).to.be.a('number');
      expect(toastBreadStart).to.be.a('number');
      expect(toastBreadStop).to.be.a('number');
      expect(peelEggStart).to.be.a('number');
      expect(peelEggStop).to.be.a('number');
      expect(spreadOnToastStart).to.be.a('number');
      expect(spreadOnToastStop).to.be.a('number');
      expect(boilEggStop).to.not.be.above(toastBreadStart);
      expect(boilEggStop).to.not.be.above(peelEggStart);
      expect(toastBreadStart).to.not.be.below(boilEggStop);
      expect(peelEggStart).to.not.be.below(boilEggStop);
      expect(toastBreadStart).to.be.below(peelEggStop);
      expect(peelEggStart).to.be.below(toastBreadStop);
      expect(toastBreadStart).to.be.below(spreadOnToastStart);
      expect(peelEggStart).to.be.below(spreadOnToastStart);
      expect(spreadOnToastStart).to.not.be.below(toastBreadStop);
      expect(spreadOnToastStart).to.not.be.below(peelEggStop);
      done();
    });
  });

  it('should run stream tasks in series', function (done) {
    gulp.task('seriesStream0', function () {
      return gulp.src(path.join(srcDir, 'foo.txt'))
        .pipe(gulp.dest(seriesDir));
    });
    gulp.task('seriesStream1', function () {
      return gulp.src(path.join(seriesDir, 'foo.txt'))
        .pipe(gulp.dest(destDir));
    });
    gulp.task('seriesStreams', function (cb) {
      runSequence(
        'seriesStream0',
        'seriesStream1',
        cb
      );
    });

    expect(fs.existsSync(path.join(seriesDir, 'foo.txt'))).to.be.false;
    expect(fs.existsSync(path.join(destDir, 'foo.txt'))).to.be.false;

    gulp.series('seriesStreams')(function () {
      fs.readFile(path.join(destDir, 'foo.txt'), enc, function (err, contents) {
        expect(err).to.be.null;
        expect(contents).to.equal('foo\n');
        done();
      });
    });
  });

  it('should run stream tasks in parallel', function (done) {
    var stop0;
    var start1;

    gulp.task('stream0', function () {
      return gulp.src(path.join(srcDir, 'foo.txt'))
        .pipe(gulp.dest(parallelDir));
    });
    gulp.task('stream1', function () {
      return gulp.src(path.join(srcDir, 'bar.txt'))
        .pipe(gulp.dest(parallelDir));
    });
    gulp.task('parallelTask0', function (cb) {
      setTimeout(function () {
        gulp.series('stream0')(function () {
          stop0 = Date.now();
          cb();
        });
      }, timeout);
    });
    gulp.task('parallelTask1', function (cb) {
      start1 = Date.now();
      setTimeout(function () {
        gulp.series('stream1')(cb);
      }, timeout);
    });
    gulp.task('parallelStreams', function (cb) {
      runSequence(
        ['parallelTask0', 'parallelTask1'],
        cb
      );
    });

    expect(fs.existsSync(path.join(parallelDir, 'foo.txt'))).to.be.false;
    expect(fs.existsSync(path.join(parallelDir, 'bar.txt'))).to.be.false;

    gulp.series('parallelStreams')(function () {
      expect(start1).to.be.below(stop0);
      done();
    });
  });

  it('should run promise tasks in series', function (done) {
    var a = '';
    var b = '0';
    var c = '1';
    var stop0;
    var start1;

    gulp.task('seriesPromise0', function () {
      return new Promise(function (resolve) {
        setTimeout(function () {
          a = a + b;
          stop0 = Date.now();
          resolve();
        }, timeout);
      });
    });
    gulp.task('seriesPromise1', function () {
      return new Promise(function (resolve) {
        start1 = Date.now();
        setTimeout(function () {
          a = a + c;
          resolve();
        }, timeout);
      });
    });
    gulp.task('seriesPromises', function (cb) {
      runSequence(
        'seriesPromise0',
        'seriesPromise1',
        cb
      );
    });

    gulp.series('seriesPromises')(function () {
      expect(a).to.equal('01');
      expect(start1).to.not.be.below(stop0);
      done();
    });
  });

  it('should run promise tasks in parallel', function (done) {
    var stop0;
    var start1;

    gulp.task('parallelPromise0', function () {
      return new Promise(function (resolve) {
        setTimeout(function () {
          stop0 = Date.now();
          resolve();
        }, timeout);
      });
    });
    gulp.task('parallelPromise1', function () {
      return new Promise(function (resolve) {
        start1 = Date.now();
        setTimeout(function () {
          resolve();
        }, timeout);
      });
    });
    gulp.task('parallelPromises', function(cb) {
      runSequence(
        ['parallelPromise0', 'parallelPromise1'],
        cb
      );
    });

    gulp.series('parallelPromises')(function () {
      expect(start1).to.be.below(stop0);
      done();
    });
  });
});
