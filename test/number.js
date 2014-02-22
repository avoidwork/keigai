var number = require("../lib/keigai.js").util.number;

exports["diff"] = {
	setUp: function (done) {
		this.v1 = -1;
		this.v2 =  5;
		done();
	},
	test: function (test) {
		test.expect(1);
		test.equal(number.diff(this.v1, this.v2), 6, "Should be 6");
		test.done();
	}
};

exports["even"] = {
	setUp: function (done) {
		this.v1 = 1;
		this.v2 = 2;
		done();
	},
	test: function (test) {
		test.expect(2);
		test.equal(number.even(this.v1), false, "Should be false");
		test.equal(number.even(this.v2), true, "Should be true");
		test.done();
	}
};

exports["format"] = {
	setUp: function (done) {
		this.val = 123456789;
		done();
	},
	test: function (test) {
		test.expect(3);
		test.equal(number.format(this.val), "123,456,789", "Should be '123,456,789'");
		test.equal(number.format(this.val, " "), "123 456 789", "Should be '123 456 789'");
		test.equal(number.format(this.val, " ", 2), "1 23 45 67 89", "Should be '1 23 45 67 89'");
		test.done();
	}
};

exports["half"] = {
	setUp: function (done) {
		this.val = 10;
		done();
	},
	test: function (test) {
		test.expect(2);
		test.equal(number.half(this.val), 5, "Should be 5");
		test.equal(number.half(number.half(this.val)), 2.5, "Should be 2.5");
		test.done();
	}
};

exports["odd"] = {
	setUp: function (done) {
		this.v1 = 1;
		this.v2 = 2;
		done();
	},
	test: function (test) {
		test.expect(2);
		test.equal(number.odd(this.v1), true, "Should be true");
		test.equal(number.odd(this.v2), false, "Should be false");
		test.done();
	}
};

exports["parse"] = {
	setUp: function (done) {
		this.v1 = "10";
		this.v2 = "2.5";
		this.v3 = "10a";
		done();
	},
	test: function (test) {
		test.expect(4);
		test.equal(number.parse(this.v1), 10, "Should be 10");
		test.equal(number.parse(this.v1, null), 10, "Should be 10");
		test.equal(number.parse(this.v2), 2.5, "Should be 2.5");
		test.equal(number.parse(this.v3, 10), 10, "Should be 10");
		test.done();
	}
};

exports["round"] = {
	setUp: function (done) {
		this.val = 2.5;
		done();
	},
	test: function (test) {
		test.expect(3);
		test.equal(number.round(this.val), 3, "Should be 3");
		test.equal(number.round(this.val, "down"), 2, "Should be 2");
		test.equal(number.round(this.val, "up"), 3, "Should be 3");
		test.done();
	}
};
