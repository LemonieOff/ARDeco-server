const gulp = require('gulp');
const rename = require('gulp-rename');
const dest = require('gulp-dest');

// Define the source and destination paths
const srcFolder = './src/mail/templates/**/*.hbs';
const destFolder = './dist/mail/templates';

// Task to copy .hbs files from src to dist
gulp.task('copyHbsFiles', function () {
  console.log("a", gulp.src(srcFolder))
  return gulp.src(srcFolder)
    .pipe(gulp.dest(destFolder));
});

// Watch task to automatically run 'copyHbsFiles' when .hbs files change
gulp.task('watch', function () {
  gulp.watch(srcFolder, gulp.series('copyHbsFiles'));
});

// Default task to run 'clean' and 'copyHbsFiles'
gulp.task('default', gulp.series('copyHbsFiles'));


//  id | name| price | styles| rooms| width | height | depth | colors| model_id | active | company | object_id | company_name