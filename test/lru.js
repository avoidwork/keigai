var lru = require("../lib/keigai.js").util.lru;

exports["suite"] = {
	setUp: function (done) {
		this.cache = lru(2);
		done();
	},
	test: function (test) {
		test.expect(19);
		test.equal(this.cache.length, 0, "Should be '0'");
		test.equal(this.cache.max, 2, "Should be '2'");
		test.equal(this.cache.set("test1", {prop: true}).length, 1, "Should be '1'");
		test.equal(this.cache.first, "test1", "Should be 'test1'");
		test.equal(this.cache.last,  "test1", "Should be 'test1'");
		test.equal(this.cache.set("test2", {prop: true}).length, 2, "Should be '2'");
		test.equal(this.cache.first, "test2", "Should be 'test2'");
		test.equal(this.cache.last,  "test1", "Should be 'test1'");
		test.equal(this.cache.set("test3", {prop: true}).length, 2, "Should be '2'");
		test.equal(this.cache.first, "test3", "Should be 'test3'");
		test.equal(this.cache.last,  "test2", "Should be 'test2'");
		test.equal(this.cache.remove("test2").value.prop, true, "Should be 'true'");
		test.equal(this.cache.length, 1, "Should be '1'");
		test.equal(this.cache.first, "test3", "Should be 'test3'");
		test.equal(this.cache.last,  "test3", "Should be 'test3'");
		test.equal(this.cache.remove("test3").value.prop, true, "Should be 'true'");
		test.equal(this.cache.length, 0, "Should be '0'");
		test.equal(this.cache.first, null, "Should be 'null'");
		test.equal(this.cache.last,  null, "Should be 'null'");
		test.done();
	}
};
