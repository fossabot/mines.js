module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        locales: function() {
            return grunt.file.expand("locales/*").join(",").replace(/locales\//g, "");
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                files: [
                    {
                        'dist/mines.min.js': 'src/*.js',
                    },
                    {
                        expand: true,
                        cwd: 'assets/scripts',
                        src: '**/*.js',
                        dest: 'dist/scripts',
                        ext: '.min.js'
                    }
                ]
            }
        },
        cssmin: {
            minify: {
                files: [{
                    expand: true,
                    cwd: 'assets/styles',
                    src: ['*.css'],
                    dest: 'dist/styles/',
                    ext: '.css'
                }]
            }
        },
        qunit: {
            files: ['test/**/*.html']
        },
        jshint: {
            // define the files to lint
            files: ['Gruntfile.js', 'assets/scripts/**/*.js', 'src/**/*.js', 'test/**/*.js']
        },
        bower: {
            build: {
                dest: 'dist/vendor/',
                options: {
                    expand: true,
                    packageSpecific: {
                        'gaia-fonts': {
                            files: [
                                'fonts/**',
                            ]
                        },
                        'gaia-icons': {
                            files: [
                                'gaia-icons.css',
                                'fonts/**'
                            ]
                        }
                    }
                }
            }
        },
        copy: {
            html: {
                options: {
                    process: function(file) {
                        return file.replace("{{locales}}", grunt.config('locales'));
                    }
                },
                files: [
                    {
                        expand: true,
                        cwd: 'assets',
                        src: ['*.html'],
                        dest: 'dist'
                    }
                ]
            },
            build: {
               files: [
                    { 'dist/mines.appcache': 'mines.appcache' },
                    { 'dist/manifest.webapp': 'manifest.webapp' },
                    {
                        expand: true,
                        cwd: 'locales',
                        src: ['**'],
                        dest: 'dist/locales'
                    },
                    {
                        expand: true,
                        cwd: 'assets/font',
                        src: ['**'],
                        dest: 'dist/font'
                    },
                    {
                        expand: true,
                        cwd: 'assets/styles',
                        src: ['**', '!*.css'],
                        dest: 'dist/styles'
                    }
                ]
            },
            appcache: {
                options: {
                    process: function(file) {
                        return file.replace("{{version}}", grunt.config('pkg.version'))
                                    .replace("{{assets}}", grunt.file.expand("dist/**/*")
                                        .join("\n")
                                        .replace(/dist\//g, "")
                                        .replace(grunt.config('pkg.name')+".appcache\n","")
                                    );
                    }
                },
                files: [ {'dist/<%= pkg.name %>.appcache': '<%= pkg.name %>.appcache' } ]
            }
        },
        transifex: {
            'mines': {
                options: {
                    targetDir: 'locales',
                    resources: ['app_properties'],
                    filename: '_lang_/app.properties',
                    templateFn: function(strings) {
                        return strings.reduce(function(p, string) {
                            return p + string.key + "=" + string.translation + "\n";
                        }, "");
                    }
                }
            }
        },
        clean: [ 'dist' ]
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');    
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-bower');
    grunt.loadNpmTasks('grunt-transifex');

    // Default task(s).
    grunt.registerTask('default', ['transifex', 'uglify', 'bower', 'cssmin', 'copy:html', 'copy:build', 'copy:appcache']);

    grunt.registerTask('test', ['jshint', 'qunit']);
};
