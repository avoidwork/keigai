// Bootstrapping
bootstrap();

// DataStore Worker "script"
WORKER = "var " + string.fromObject( array, "array" ) + ", " + string.fromObject( regex, "regex" ) + ", " + string.fromObject( string, "string" ) + ", " + string.fromObject( utility, "utility" ) + "; onmessage = " + store.worker.toString() + ";";

// Interface
return {
	filter  : filter.factory,
	list    : list.factory,
	grid    : grid.factory,
	store   : store.factory,
	util    : {
		$        : utility.$,
		array    : array,
		clone    : utility.clone,
		coerce   : utility.coerce,
		defer    : deferred.factory,
		el       : element,
		extend   : utility.extend,
		iterate  : utility.iterate,
		jsonp    : client.jsonp,
		log      : utility.log,
		merge    : utility.merge,
		number   : number,
		observer : Observable,
		parse    : utility.parse,
		prevent  : utility.prevent,
		request  : client.request,
		stop     : utility.stop,
		target   : utility.target,
		uuid     : utility.uuid,
		walk     : utility.walk,
		when     : utility.when
	},
	version : "{{VERSION}}"
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
