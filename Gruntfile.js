module.exports = function (grunt) {
	grunt.initConfig({
		pkg : grunt.file.readJSON("package.json"),
		concat : {
			options : {
				banner : "/**\n" + 
				         " * <%= pkg.name %>\n" +
				         " *\n" +
				         " * @author <%= pkg.author.name %> <<%= pkg.author.email %>>\n" +
				         " * @copyright <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>\n" +
				         " * @license <%= pkg.licenses[0].type %> <<%= pkg.licenses[0].url %>>\n" +
				         " * @link <%= pkg.homepage %>\n" +
				         " * @module <%= pkg.name %>\n" +
				         " * @version <%= pkg.version %>\n" +
				         " */\n"
			},
			dist : {
				src : [
					"src/intro.js",
					"src/regex.js",
					"src/array.js",
					"src/cache.js",
					"src/client.js",
					"src/datastore.js",
					"src/datafilter.js",
					"src/datagrid.js",
					"src/datalist.js",
					"src/deferred.js",
					"src/element.js",
					"src/json.js",
					"src/label.js",
					"src/lru.js",
					"src/number.js",
					"src/observable.js",
					"src/observer.js",
					"src/promise.js",
					"src/string.js",
					"src/utility.js",
					"src/xhr.js",
					"src/xml.js",
					"src/bootstrap.js",
					"src/outro.js"
				],
				dest : "lib/<%= pkg.name %>.js"
			}
		},
		exec : {
			closure : {
				cmd : "cd lib\nclosure-compiler --compilation_level WHITESPACE_ONLY --js <%= pkg.name %>.js --js_output_file <%= pkg.name %>.min.js --create_source_map ./<%= pkg.name %>.map"
			},
			sourcemap : {
				cmd : "echo //@ sourceMappingURL=<%= pkg.name %>.map >> lib/<%= pkg.name %>.min.js"
			}
		},
		jsdoc : {
			dist : {
				src: ["lib/<%= pkg.name %>.js"],
				options: {
				    destination: "doc"
				}
			}
		},
		jshint : {
			options : {
				jshintrc : ".jshintrc"
			},
			src : "lib/<%= pkg.name %>.js"
		},
		nodeunit : {
			all : ["test/*.js"]
		},
		sed : {
			version : {
				pattern : "{{VERSION}}",
				replacement : "<%= pkg.version %>",
				path : ["<%= concat.dist.dest %>"]
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
	grunt.loadNpmTasks("grunt-exec");
	grunt.loadNpmTasks("grunt-jsdoc");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-nodeunit");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-watch");

	// aliases
	grunt.registerTask("test", [/*"nodeunit",*/ "jshint"]);
	grunt.registerTask("build", ["concat", "sed", "exec"]);
	grunt.registerTask("default", ["build", "test", "jsdoc"]);
};