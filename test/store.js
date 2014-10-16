var store = require("../lib/keigai.js").store,
    data  = require("./store.json");

exports["empty"] = {
	setUp: function (done) {
		this.store = store();
		done();
	},
	test: function (test) {
		test.expect(2);
		test.equal(this.store.total, 0, "Should be '0'");
		test.equal(this.store.records.length, 0, "Should be '0'");
		test.done();
	}
};

exports["create"] = {
	setUp: function (done) {
		this.store = store();
		done();
	},
	test: function (test) {
		var self = this;

		test.expect(5);
		test.equal(this.store.total, 0, "Should be '0'");
		test.equal(this.store.records.length, 0, "Should be '0'");
		this.store.set(null, data[0]).then(function(arg) {
			test.equal(self.store.total, 1, "Should be '1'");
			test.equal(self.store.records.length, 1, "Should be '1'");
			test.equal(self.store.records[0].key, arg.key, "Should be a match");
			test.done();
		}, function (e) {
			console.error(e);
			test.done();
		});
	}
};

exports["create (batch)"] = {
	setUp: function (done) {
		this.store = store();
		done();
	},
	test: function (test) {
		var self = this;

		test.expect(5);
		test.equal(this.store.total, 0, "Should be '0'");
		test.equal(this.store.records.length, 0, "Should be '0'");
		this.store.batch("set", data).then(function(arg) {
			test.equal(self.store.total, 6, "Should be '1'");
			test.equal(self.store.records.length, 6, "Should be '1'");
			test.equal(self.store.records[0].key, arg[0].key, "Should be a match");
			test.done();
		}, function (e) {
			console.error(e);
			test.done();
		});
	}
};

exports["read (valid)"] = {
	setUp: function (done) {
		this.store = store();
		done();
	},
	test: function (test) {
		var self = this;

		test.expect(4);
		this.store.set(null, data[0]).then(function() {
			var record = self.store.get(0);

			test.equal(self.store.total, 1, "Should be '1'");
			test.equal(self.store.records.length, 1, "Should be '1'");
			test.equal(Object.keys(record.data).length, 19, "Should be a '19'");
			test.equal(record.data.name, "Decker Merrill", "Should be a match");
			test.done();
		}, function (e) {
			console.error(e);
			test.done();
		});
	}
};

exports["read (invalid)"] = {
	setUp: function (done) {
		this.store = store();
		done();
	},
	test: function (test) {
		var self = this;

		test.expect(3);
		this.store.set(null, data[0]).then(function() {
			test.equal(self.store.total, 1, "Should be '1'");
			test.equal(self.store.records.length, 1, "Should be '1'");
			test.equal(self.store.get(1), undefined, "Should be 'undefined'");
			test.done();
		}, function (e) {
			console.error(e);
			test.done();
		});
	}
};

exports["read (indexed & filtered)"] = {
	setUp: function (done) {
		this.store = store(null, {index:["age", "name", "age|name"]});
		done();
	},
	test: function (test) {
		var self = this;

		test.expect(5);
		this.store.batch("set", data).then(function() {
			// self.store.indexes.key is automatically created
			test.equal(Object.keys(self.store.indexes).length, 4, "Should be '4'");
			test.equal(Object.keys(self.store.indexes.age).length, 4, "Should be '4'");
			self.store.select({age:20}).then(function (args) {
				test.equal(args.length, Object.keys(self.store.indexes.age["20"]).length, "Should be a match");
				test.equal(args[0].data.name, "Decker Merrill", "Should be a match");
				test.equal(args[1].data.name, "Leann Sosa", "Should be a match");
				test.done();
			}, function (e) {
				throw e;
			});
		}).catch( function (e) {
			console.error(e);
			test.done();
		});
	}
};

exports["update (delta)"] = {
	setUp: function (done) {
		this.store = store();
		done();
	},
	test: function (test) {
		var self = this;

		test.expect(2);
		this.store.set(null, data[0]).then(function(arg) {
			test.equal(arg.data.name, "Decker Merrill", "Should be a match");
		}).then(function () {
			self.store.set(0, {name: "John Doe"}).then(function (arg) {
				test.equal(arg.data.name, "John Doe", "Should be a match");
				test.done();
			}, function (e) {
				throw e;
			});
		}).catch(function (e) {
			console.error(e);
			test.done();
		});
	}
};

exports["update (overwrite)"] = {
	setUp: function (done) {
		this.store = store();
		done();
	},
	test: function (test) {
		var self = this;

		test.expect(3);
		this.store.set(null, data[0]).then(function(arg) {
			test.equal(arg.data.name, "Decker Merrill", "Should be a match");
		}).then(function () {
			self.store.set(0, {name: "John Doe"}, false, true).then(function (arg) {
				test.equal(arg.data.name, "John Doe", "Should be a match");
				test.equal(Object.keys(arg.data ).length, 1, "Should be '1'");
				test.done();
			}, function (e) {
				throw e;
			});
		}).catch(function (e) {
			console.error(e);
			test.done();
		});
	}
};

exports["delete"] = {
	setUp: function (done) {
		this.store = store();
		done();
	},
	test: function (test) {
		var self = this;

		test.expect(3);
		this.store.set(null, data[0]).then(function(arg) {
			test.equal(arg.data.name, "Decker Merrill", "Should be a match");
		}).then(function () {
			self.store.del(0).then(function () {
				test.equal(self.store.total, 0, "Should be '0'");
				test.equal(self.store.records.length, 0, "Should be '0'");
				test.done();
			}, function (e) {
				throw e;
			});
		}).catch(function (e) {
			console.error(e);
			test.done();
		});
	}
};

exports["delete (batch)"] = {
	setUp: function (done) {
		this.store = store();
		done();
	},
	test: function (test) {
		var self = this;

		test.expect(5);
		this.store.batch("set", data).then(function(arg) {
			test.equal(arg[0].data.name, "Decker Merrill", "Should be a match");
		}).then(function () {
			self.store.batch("del", [0,2]).then(function () {
				test.equal(self.store.total, 4, "Should be '4'");
				test.equal(self.store.records.length, 4, "Should be '4'");
				test.equal(self.store.records[0].data.name, "Waters Yates", "Should be a match");
				test.equal(self.store.records[0].index, 0, "Should be '0'");
				test.done();
			}, function (e) {
				throw e;
			});
		}).catch(function (e) {
			console.error(e);
			test.done();
		});
	}
};

exports["delete (indexed)"] = {
	setUp: function (done) {
		this.store = store(null, {index:["age", "name", "age|name"]});
		done();
	},
	test: function (test) {
		var self = this;

		test.expect(4);
		this.store.batch("set", data).then(function() {
			// self.store.indexes.key is automatically created
			test.equal(Object.keys(self.store.indexes).length, 4, "Should be '4'");
			test.equal(Object.keys(self.store.indexes.age).length, 4, "Should be '4'");
			test.equal(Object.keys(self.store.indexes.age["20"]).length, 2, "Should be '2'");
			self.store.del(0).then(function () {
				test.equal(Object.keys(self.store.indexes.age["20"]).length, 1, "Should be '1'");
				test.done();
			}, function (e) {
				throw e;
			});
		}).catch( function (e) {
			console.error(e);
			test.done();
		});
	}
};
