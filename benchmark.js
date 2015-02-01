var keigai = require("./lib/keigai");
var precise = require("precise");
var x = new Array();
var i = -1;
var nth = 10000;

while (++i < nth) {
	x.push(i);
}

console.log("Array Methods (10,000)");
console.log("======================");

["each", "iterate"].forEach(function (fn) {
	var timer = precise().start();

	keigai.util.array[fn](x, function (i) { return i+"a"; });
	timer.stop();
	console.log(fn, "-", keigai.util.number.format( timer.diff() ), "ns");
});
