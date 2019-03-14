# Drop-in replacement for run-sequence for gulp 4

[![Known Vulnerabilities][snyk-image]][snyk-url]
[![Mac/Linux Build Status][travis-image]][travis-url]
[![Windows Build Status][appveyor-image]][appveyor-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![License][license-image]][license-url]

This package aims to help gulp tasks coded in gulp 3 syntax run in gulp 4.

### Use

```javascript
const gulp = require('gulp');
const runSequence = require('gulp4-run-sequence');
const fs = require('fs');

// This will run in this order:
// * 'boil-water'
// * 'steep-tea' and 'boil-egg' concurrently
// * 'peel-egg'
// * Finally, the callback function.
gulp.task('build', function (callback) {
  runSequence(
    'boil-water',
    ['steep-tea', 'boil-egg'],
    'peel-egg',
    callback
//  ^^^^^^^^
//  This informs that the sequence is complete.
  );
});

// Configure boil-water, steep-tea, boil-egg, and peel-egg as you wish,
// but make sure they return a stream or promise, or handle the callback.
// Examples:

gulp.task('boil-water', function () {
  // Return the stream from gulp.
  return gulp.src('water').pipe(...)...
});

gulp.task('boil-egg', function () {
  return new Promise(function (resolve, reject) {
    // Make sure asynchronous tasks are resolved or rejected.
  });
});

gulp.task('peel-egg', function (callback) {
  fs.readFile('egg', function (err, data) {
    // Consume data...
    callback();
//  ^^^^^^^^
//  This informs that the task is complete.
  });
});
```

### Use within gulp submodules

If you have a complex gulp setup with your tasks split up across different 
files, you may get the error that `gulp4-run-sequence` is unable to find your 
tasks. In this case, you can configure `gulp4-run-sequence` to look at the gulp 
within the submodule, like so:

```javascript
// Explicitly declare gulp particular to your submodule.
const gulp = require('gulp');
// Explicitly assign this gulp to gulp4-run-sequence.
const runSequence = require('gulp4-run-sequence').use(gulp);

// ...and then use normally.
gulp.task('supertask', function (callback) {
  runSequence('subtask0', 'subtask1', callback);
});
```

### Options

The options in the gulp 3 version of run-sequence no longer apply. 

`showErrorStackTrace` no longer applies because errors are handled entirely 
within the gulp 4 stack. A good command of streams, promises, and callback 
functions will deliver the desired amount of error verbosity.

`ignoreUndefinedTasks` no longer applies because all falsey arguments will be 
skipped without a warning. The logic follows the best practice of looking for 
positive matches, rather than looking for a subset of the infinite set of 
negative matches, in order to warn that there's a negative match, only to skip 
it or exit on it.

### Why the culinary task names?

Computational tasks might be too abstract for visualizing sequences and 
concurrency. It's much easier to visualize steeping tea and boiling eggs 
concurrently, but only after water has come to a boil.

It might also be irresponsible to suggest running certain tasks concurrently, 
when concurrent operation would not be optimal for those tasks.

First, we need to understand what "__parallel__", "__concurrent__", and 
"__asynchrony__" mean in terms of computing.

"__Parallel computing__" refers to distributing processes across multiple 
processor cores.

"__Concurrent computing__" refers to running multiple processes in such a way 
that they appear to be running at the same time. This can be accomplished by 
rapidly switching between the processes on one processor core.

"__Asynchrony__" refers to when a process runs outside the main execution flow, 
and the main execution might need a response. If it does, it must not block 
other processes, that don't depend on the response, while it waits.

JavaScript, and Node.js in particular, are frequently referred to as being 
"single-threaded". In recent years, this has become wholly untrue. If you are 
working on production-level parallel JavaScript, firstly, kudos! Secondly, we're 
not sure why you're reading this, but thanks for checking out 
gulp4-run-sequence!

Now consider a procedure found in nearly every gulp implementation: a file read. 
It is not a good idea to read files concurrently on a single machine, even if it 
has many processor cores. You should assume the machine has a single disk drive, 
and that the drive has a single read/write head. Even if those aren't the case, 
you should assume there is only one pathway open at a given time on which the 
data can travel from drive to memory.

Let's make a culinary analogy: Assume you need 2 liters of warm water evenly 
mixed from a cold faucet and a hot faucet. However, the cold and hot faucets 
are 10 meters apart. Any rational person would mix the water sequentially, 
filling a liter of cold water, walking the 10 meters, and filling another liter 
of hot water.

Trying to make this water gathering appear concurrent by filling smaller 
quantities of water at a time and walking more is called "thrashing" if applied 
to a disk drive.

### Acknowledgements

This package is inspired entirely by 
[run-sequence](https://github.com/OverZealous/run-sequence) for gulp 3. Credit 
and gratitude are due for 
[its contributors](https://github.com/OverZealous/run-sequence/graphs/contributors). 

#### Also recommended: [gulp 3 with long-term support](https://github.com/electric-eloquence/gulp)

[snyk-image]: https://snyk.io/test/github/electric-eloquence/gulp4-run-sequence/master/badge.svg
[snyk-url]: https://snyk.io/test/github/electric-eloquence/gulp4-run-sequence/master

[travis-image]: https://img.shields.io/travis/electric-eloquence/gulp4-run-sequence.svg?label=mac%20%26%20linux
[travis-url]: https://travis-ci.org/electric-eloquence/gulp4-run-sequence

[appveyor-image]: https://img.shields.io/appveyor/ci/e2tha-e/gulp4-run-sequence.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/e2tha-e/gulp4-run-sequence

[coveralls-image]: https://img.shields.io/coveralls/electric-eloquence/gulp4-run-sequence/master.svg
[coveralls-url]: https://coveralls.io/r/electric-eloquence/gulp4-run-sequence

[license-image]: https://img.shields.io/github/license/electric-eloquence/gulp4-run-sequence.svg
[license-url]: https://raw.githubusercontent.com/electric-eloquence/gulp4-run-sequence/master/LICENSE
