// Bootstrapping
bootstrap();

// Interface
return {
	filter: filter.factory,
	list: list.factory,
	grid: grid.factory,
	store: store.factory,
	util: {
		$: utility.$,
		array: array,
		base: utility.base,
		clearTimers: utility.clearTimers,
		clone: utility.clone,
		coerce: utility.coerce,
		curry: utility.curry,
		csv: csv,
		defer: deferred.factory,
		delay: utility.defer,
		element: element,
		extend: utility.extend,
		genId: utility.genId,
		iterate: utility.iterate,
		json: json,
		jsonp: client.jsonp,
		log: utility.log,
		lru: lru.factory,
		math: math,
		merge: utility.merge,
		number: number,
		observer: observable.factory,
		parse: utility.parse,
		partial: utility.partial,
		prevent: utility.prevent,
		race: utility.race,
		render: utility.render,
		repeat: utility.repeat,
		request: client.request,
		stop: utility.stop,
		string: string,
		target: utility.target,
		uuid: utility.uuid,
		walk: utility.walk,
		when: utility.when
	},
	version: "{{VERSION}}"
};
}();

// Node, AMD & window supported
if ( typeof exports != "undefined" ) {
	module.exports = lib;
} else if ( typeof define == "function" ) {
	define( () => {
		return lib;
	} );
} else {
	global.keigai = lib;
}
}( this );
