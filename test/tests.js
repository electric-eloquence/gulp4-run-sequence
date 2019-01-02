'use strict';

const fs = require('fs');
const path = require('path');

const expect = require('chai').expect;
const gulp = require('gulp');

const runSequence = require('../index');

function steepTea(cb) {
  cb();
}

function boilEgg(cb) {
  cb();
}

function spreadOnToast(cb) {
  cb();
}

function peelEgg(cb) {
  cb();
}

const fixturesDir = path.join(__dirname, 'fixtures');
const watchDir = path.join(fixturesDir, 'watch');

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

let toastBreadStart;
let toastBreadStop;
gulp.task('toastBread', function (cb) {
  toastBreadStart = Date.now();

  setTimeout(function () {
    toastBreadStop = Date.now();
    cb();
  }, timeout);
});

describe('gulp4-run-sequence', function () {
  before(function (done) {
    if (!fs.existsSync(watchDir)) {
      fs.mkdirSync(watchDir);
    }

    fs.readdir(watchDir, function (err, files) {
      files.forEach(function (file) {
        fs.unlinkSync(path.join(watchDir, file));
      });
      done();
    });
  });

  it('should run two tasks in series', function (done) {
    gulp.task('seriesMinimal', function (cb) {
      runSequence(
        'boilWater',
        'steepTea',
        cb
      );
    });

    gulp.series('seriesMinimal')(function () {
      expect(boilWaterStart).to.be.a('number');
      expect(boilWaterStop).to.be.a('number');
      expect(steepTeaStart).to.be.a('number');
      expect(steepTeaStop).to.be.a('number');
      expect(steepTeaStart).to.not.be.below(boilWaterStop);
      done();
    });
  });

  it('should run two tasks in parallel', function (done) {
    gulp.task('parallelMinimal', function (cb) {
      runSequence(
        ['boilWater', 'toastBread'],
        cb
      );
    });

    gulp.series('parallelMinimal')(function () {
      expect(boilWaterStart).to.be.a('number');
      expect(boilWaterStop).to.be.a('number');
      expect(toastBreadStart).to.be.a('number');
      expect(toastBreadStop).to.be.a('number');
      expect(toastBreadStart).to.be.below(boilWaterStop);
      done();
    });
  });
});
