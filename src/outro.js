// Bootstrapping
bootstrap();

// DataStore Worker "script"
WORKER = "var " + string.fromObject( array, "array" ) + ", " + string.fromObject( regex, "regex" ) + ", " + string.fromObject( string, "string" ) + ", " + string.fromObject( utility, "utility" ) + "; onmessage = " + datastore.worker.toString() + ";";

// Interface
return {
	data       : datastore.decorator,
	list       : datalist.factory,
	filter     : datafilter,
	grid       : datagrid,
	observable : observable,
	version    : "{{VERSION}}"
};

} )();

// Node, AMD & window supported
if ( typeof exports != "undefined" ) {
	module.exports = lib;
}
else if ( typeof define == "function" ) {
	define( function () {
		return lib;
	} );
}
else {
	global.keigai = lib;
}
} )( this );
