var $ = require("../lib/keigai.js").util;

exports["clone"] = {
	setUp: function (done) {
		this.array = [true, false, true];
		done();
	},
	test: function (test) {
		var dest;

		test.expect(3);
		test.equal((dest = $.clone(this.array)).length, this.array.length, "Should be an identical Array");
		test.equal(dest.push(false), 4, "Should be `4`");
		test.equal(this.array.length, 3, "Should be `3`");
		test.done();
	}
};

exports["coerce"] = {
	setUp: function (done) {
		this.number    = "1234";
		this.boolean   = "true";
		this.json      = "{\"test\": true}";
		this.undefined = "undefined";
		this.null      = "null";
		done();
	},
	test: function (test) {
		test.expect(5);
		test.equal($.coerce(this.number), 1234, "Should be `1234`");
		test.equal($.coerce(this.boolean), true, "Should be `true`");
		test.equal($.coerce(this.json) instanceof Object, true, "Should be an Object");
		test.equal($.coerce(this.undefined), undefined, "Should be `undefined`");
		test.equal($.coerce(this.null), null, "Should be `null`");
		test.done();
	}
};

exports["equal"] = {
	setUp: function (done) {
		this.a = {a: true, b: false};
		this.b = {a: true, b: false};
		this.c = {a: true, b: true};
		done();
	},
	test: function (test) {
		test.expect(3);
		test.equal($.equal(this.a, this.b), true, "Should be `true`");
		test.equal($.equal(this.a, this.c), false, "Should be `false`");
		test.equal($.equal(this.b, this.c), false, "Should be `false`");
		test.done();
	}
};

exports["extend"] = {
	setUp: function (done) {
		this.obj = {method: function () { void 0; }};
		this.ext = {};
		done();
	},
	test: function (test) {
		test.expect(1);
		test.equal(this.ext = $.extend(this.obj), this.ext, "Should be `this.ext`");
		test.done();
	}
};