var figlet = require("figlet");

function graffiti (arg) {
	return figlet.textSync(arg, {
		font: 'Graffiti',
		horizontalLayout: 'default',
		verticalLayout: 'default'
	})
}

module.exports = function (grunt) {
	var banner = graffiti("keigai " + grunt.file.readJSON("package.json").version);

	grunt.initConfig({
		pkg : grunt.file.readJSON("package.json"),
		babel: {
			options: {
				compact: false,
				sourceMap: false
			},
			dist: {
				files: {
					"lib/<%= pkg.name %>.js": "lib/<%= pkg.name %>.es6.js"
				}
			}
		},
		concat : {
			options : {
				banner : '/*\n' + banner + '\n\n<%= grunt.template.today("yyyy") %> <%= pkg.author.name %> <<%= pkg.author.email %>>\n*/\n'
			},
			dist : {
				src : [
					"src/intro.js",
					"src/regex.js",
					"src/lru.js",
					"src/observable.js",
					"src/base.js",
					"src/array.js",
					"src/cache.js",
					"src/client.js",
					"src/csv.js",
					"src/filter.js",
					"src/grid.js",
					"src/list.js",
					"src/deferred.js",
					"src/element.js",
					"src/json.js",
					"src/label.js",
					"src/math.js",
					"src/number.js",
					"src/promise.js",
					"src/store.js",
					"src/string.js",
					"src/utility.js",
					"src/xhr.js",
					"src/weakmap.js",
					"src/xml.js",
					"src/bootstrap.js",
					"src/outro.js"
				],
				dest : "lib/<%= pkg.name %>.es6.js"
			}
		},
		jsdoc : {
			dist : {
				src: ["lib/<%= pkg.name %>.js", "README.md"],
				options: {
				    destination : "doc",
				    template    : "node_modules/ink-docstrap/template",
				    configure   : "docstrap.json",
				    "private"   : false
				}
			}
		},
		nodeunit : {
			all : ["test/*.js"]
		},
		sass: {
			dist: {
				options : {
					style : "compressed"
				},
				files : {
					"css/keigai.css" : "sass/keigai.scss"
				}
			}
		},
		sed : {
			banner : {
				pattern : "{{BANNER}}",
				replacement : JSON.stringify(banner.split("\n")),
				path : ["<%= concat.dist.dest %>"]
			},
			version : {
				pattern : "{{VERSION}}",
				replacement : "<%= pkg.version %>",
				path : ["<%= concat.dist.dest %>"]
			}
		},
		uglify: {
			options: {
				banner: '/*\n' + banner + '\n\n<%= grunt.template.today("yyyy") %> <%= pkg.author.name %> <<%= pkg.author.email %>>\n*/\n',
				sourceMap: true,
				sourceMapIncludeSources: true,
				mangle: {
					except: ["keigai", "define", "export", "process", "array", "regex", "store", "string", "utility"]
				}
			},
			target: {
				files: {
					"lib/keigai.min.js" : ["lib/keigai.js"]
				}
			}
		},
		watch : {
			js : {
				files : "<%= concat.dist.src %>",
				tasks : "default"
			},
			pkg: {
				files : "package.json",
				tasks : "default"
			}
		}
	});

	// tasks
	grunt.loadNpmTasks("grunt-sed");
	grunt.loadNpmTasks("grunt-jsdoc");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-nodeunit");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-babel");

	// aliases
	grunt.registerTask("test", ["nodeunit"]);
	grunt.registerTask("build", ["concat", "sed", "babel"]);
	grunt.registerTask("default", ["build", "test", "sass", "uglify"]);
	grunt.registerTask("package", ["default", "jsdoc"]);
};
