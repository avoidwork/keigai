var json = require("../lib/keigai.js").util.json,
    data = [{name: "John Doe"}, {name: "Josh Davis"}];

exports["decode"] = {
	setUp: function (done) {
		this.val = "{\"abc\":true}";
		done();
	},
	test: function (test) {
		test.expect(2);
		test.equal(json.decode(this.val) instanceof Object, true, "Should be true");
		test.equal(json.decode(this.val)["abc"], true, "Should be true");
		test.done();
	}
};

exports["encode"] = {
	setUp: function (done) {
		this.val = {abc:true};
		done();
	},
	test: function (test) {
		test.expect(1);
		test.equal(typeof json.encode(this.val) === "string", true, "Should be true");
		test.done();
	}
};
