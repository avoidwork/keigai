// Bootstrapping
bootstrap();

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
		element  : element,
		extend   : utility.extend,
		iterate  : utility.iterate,
		json     : json,
		jsonp    : client.jsonp,
		log      : utility.log,
		lru      : lru.factory,
		math     : math,
		merge    : utility.merge,
		number   : number,
		observer : observable.factory,
		parse    : utility.parse,
		prevent  : utility.prevent,
		race     : utility.race,
		render   : utility.render,
		repeat   : utility.repeat,
		request  : client.request,
		stop     : utility.stop,
		string   : string,
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
