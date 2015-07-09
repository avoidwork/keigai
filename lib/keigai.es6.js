/*
 __          .__             .__   ____     ________      ____  ______  
|  | __ ____ |__| _________  |__| /_   |    \_____  \    /_   |/  __  \ 
|  |/ // __ \|  |/ ___\__  \ |  |  |   |      _(__  <     |   |>      < 
|    <\  ___/|  / /_/  > __ \|  |  |   |     /       \    |   /   --   \
|__|_ \\___  >__\___  (____  /__|  |___| /\ /______  / /\ |___\______  /
     \/    \/  /_____/     \/            \/        \/  \/            \/ 

2015 Jason Mulligan <jason.mulligan@avoidwork.com>
*/
( function ( global ) {
const document = global.document;
const location = global.location || {};
const navigator = global.navigator;
const server = typeof process !== "undefined";
const mutation = typeof MutationObserver === "function";
const MAX = 10;
const VERSIONS = 100;
const CACHE = 500;
const EVENTS = [ "readystatechange", "abort", "load", "loadstart", "loadend", "error", "progress", "timeout" ];

let Buffer = function () {};
let Promise = global.Promise || undefined;
let localStorage = global.localStorage || undefined;
let XMLHttpRequest = global.XMLHttpRequest || null;
let WeakMap = global.WeakMap || null;
let btoa = global.btoa || undefined;
let webWorker = typeof Blob !== "undefined" && typeof Worker !== "undefined";
let external, http, https, mongodb, url, RENDER, TIME, WORKER;

if ( server ) {
	url = require( "url" );
	http = require( "http" );
	https = require( "https" );
	mongodb = require( "mongodb" ).MongoClient;
	Buffer = require( "buffer" ).Buffer;

	if ( typeof Promise === "undefined" ) {
		Promise = require( "es6-promise" ).Promise;
	}

	if ( typeof localStorage === "undefined" ) {
		localStorage = require( "localStorage" );
	}

	if ( typeof btoa === "undefined" ) {
		btoa = require( "btoa" );
	}
}

let lib = ( function () {

/**
 * Regex patterns used through keigai
 *
 * `url` was authored by Diego Perini
 *
 * @namespace regex
 * @private
 * @type {Object}
 */
let regex = {
	after_space: /\s+.*/,
	allow: /^allow$/i,
	allow_cors: /^access-control-allow-methods$/i,
	and: /^&/,
	args: /\((.*)\)/,
	auth: /\/\/(.*)\@/,
	bool: /^(true|false)?$/,
	boolean_number_string: /boolean|number|string/,
	caps: /[A-Z]/,
	cdata: /\&|<|>|\"|\'|\t|\r|\n|\@|\$/,
	checked_disabled: /checked|disabled/i,
	complete_loaded: /^(complete|loaded)$/i,
	csv_quote: /^\s|\"|\n|,|\s$/,
	del: /^del/,
	domain: /^[\w.-_]+\.[A-Za-z]{2,}$/,
	down: /down/,
	endslash: /\/$/,
	eol_nl: /\n$/,
	element_update: /id|innerHTML|innerText|textContent|type|src/,
	get_headers: /^(head|get|options)$/,
	get_remove_set: /get|remove|set/,
	hash: /^\#/,
	header_replace: /:.*/,
	header_value_replace: /.*:\s+/,
	html: /^<.*>$/,
	http_body: /200|201|202|203|206/,
	http_ports: /80|443/,
	host: /\/\/(.*)\//,
	ie: /msie|ie|\.net|windows\snt/i,
	ip: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
	is_xml: /^<\?xml.*\?>/,
	json_maybe: /json|plain|javascript/,
	json_wrap: /^[\[\{]/,
	klass: /^\./,
	no: /no-store|no-cache/i,
	not_dotnotation: /-|\s/,
	not_endpoint: /.*\//,
	null_undefined: /null|undefined/,
	number: /(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)|number/,
	number_format_1: /.*\./,
	number_format_2: /\..*/,
	number_present: /\d{1,}/,
	number_string: /number|string/i,
	number_string_object: /number|object|string/i,
	object_type: /\[object Object\]/,
	patch: /^patch$/,
	primitive: /^(boolean|function|number|string)$/,
	priv: /private/,
	protocol: /^(.*)\/\//,
	put_post: /^(post|put)$/i,
	radio_checkbox: /^(radio|checkbox)$/i,
	root: /^\/[^\/]/,
	select: /select/i,
	selector_is: /^:/,
	selector_complex: /\s+|\>|\+|\~|\:|\[/,
	set_del: /^(set|del|delete)$/,
	space_hyphen: /\s|-/,
	string_object: /string|object/i,
	svg: /svg/,
	top_bottom: /top|bottom/i,
	url: /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i,
	word: /^\w+$/,
	xdomainrequest: /^(get|post)$/i,
	xml: /xml/i
};

class LRU {
	/**
	 * Creates a new Least Recently Used cache
	 *
	 * @constructor
	 * @memberOf keigai
	 * @param  {Number} max [Optional] Max size of cache, default is 1000
	 * @example
	 * let lru = keigai.util.lru( 50 );
	 */
	constructor ( max=1000 ) {
		this.cache = {};
		this.max = max;
		this.first = null;
		this.last = null;
		this.length = 0;
	}

	/**
	 * Evicts the least recently used item from cache
	 *
	 * @method evict
	 * @memberOf keigai.LRU
	 * @return {Object} {@link keigai.LRU}
	 * @example
	 * lru.evict();
	 */
	evict () {
		if ( this.last !== null ) {
			this.remove( this.last );
		}

		return this;
	}

	/**
	 * Gets cached item and moves it to the front
	 *
	 * @method get
	 * @memberOf keigai.LRU
	 * @param  {String} key Item key
	 * @return {Object} {@link keigai.LRUItem}
	 * @example
	 * let item = lru.get( "key" );
	 */
	get ( key ) {
		let item = this.cache[ key ];

		if ( item === undefined ) {
			return;
		}

		this.set( key, item.value );

		return item.value;
	}

	/**
	 * Removes item from cache
	 *
	 * @method remove
	 * @memberOf keigai.LRU
	 * @param  {String} key Item key
	 * @return {Object} {@link keigai.LRUItem}
	 * @example
	 * lru.remove( "key" );
	 */
	remove ( key ) {
		let item = this.cache[ key ];

		if ( item ) {
			delete this.cache[ key ];

			this.length--;

			if ( item.previous !== null ) {
				this.cache[ item.previous ].next = item.next;
			}

			if ( item.next !== null ) {
				this.cache[ item.next ].previous = item.previous;
			}

			if ( this.first === key ) {
				this.first = item.previous;
			}

			if ( this.last === key ) {
				this.last = item.next;
			}
		}

		return item;
	}

	/**
	 * Sets item in cache as `first`
	 *
	 * @method set
	 * @memberOf keigai.LRU
	 * @param  {String} key   Item key
	 * @param  {Mixed}  value Item value
	 * @return {Object} {@link keigai.LRU}
	 * @example
	 * lru.set( "key", {x: true} );
	 */
	set ( key, value ) {
		let item = this.remove( key );

		if ( item === undefined ) {
			item = new LRUItem( value );
		} else {
			item.value = value;
		}

		item.next = null;
		item.previous = this.first;
		this.cache[ key ] = item;

		if ( this.first !== null ) {
			this.cache[ this.first ].next = key;
		}

		this.first = key;

		if ( this.last === null ) {
			this.last = key;
		}

		if ( ++this.length > this.max ) {
			this.evict();
		}

		return this;
	}
}

/**
 * Creates a new LRUItem
 *
 * @constructor
 * @memberOf keigai
 * @param {Mixed} value Item value
 * @private
 */
class LRUItem {
	constructor ( value ) {
		this.next = null;
		this.previous = null;
		this.value = value;
	}
}

/**
 * @namespace lru
 */
let lru = {
	/**
	 * LRU factory
	 *
	 * @method factory
	 * @memberOf lru
	 * @return {Object} {@link keigai.LRU}
	 * @example
	 * let lru = keigai.util.lru( 50 );
	 */
	factory: function ( max ) {
		return new LRU( max );
	}
};

class Observable {
	/**
	 * Creates a new Observable
	 *
	 * @constructor
	 * @memberOf keigai
	 * @param  {Number} arg Maximum listeners, default is 10
	 * @example
	 * let observer = keigai.util.observer( 50 );
	 */
	constructor ( arg=MAX ) {
		this.limit = arg;
		this.listeners = {};
		this.hooks = new WeakMap();
	}

	/**
	 * Dispatches an event, with optional arguments
	 *
	 * @method dispatch
	 * @memberOf keigai.Observable
	 * @return {Object} {@link keigai.Observable}
	 * @example
	 * observer.dispatch( "event", ... );
	 */
	dispatch ( ev, ...args ) {
		if ( ev && this.listeners[ ev ] ) {
			utility.iterate( this.listeners[ ev ], function ( i ) {
				i.handler.apply( i.scope, args );
			} );
		}

		return this;
	}

	/**
	 * Hooks into `target` for a DOM event
	 *
	 * @method hook
	 * @memberOf keigai.Observable
	 * @param  {Object} target Element
	 * @param  {String} ev     Event
	 * @return {Object}        Element
	 * @example
	 * observer.hook( document.querySelector( "a" ), "click" );
	 */
	hook ( target, ev ) {
		if ( typeof target.addEventListener !== "function" ) {
			throw new Error( label.invalidArguments );
		}

		let obj = this.hooks.get( target ) || {};

		obj[ ev ] = ( arg ) => {
			this.dispatch( ev, arg );
		};

		this.hooks.set( target, obj );
		target.addEventListener( ev, this.hooks.get( target )[ ev ], false );

		return target;
	}

	/**
	 * Removes all, or a specific listener for an event
	 *
	 * @method off
	 * @memberOf keigai.Observable
	 * @param {String} ev Event name
	 * @param {String} id [Optional] Listener ID
	 * @return {Object} {@link keigai.Observable}
	 * @example
	 * observer.off( "click", "myHook" );
	 */
	off ( ev, id ) {
		if ( this.listeners[ ev ] ) {
			if ( id ) {
				delete this.listeners[ ev ][ id ];
			} else {
				delete this.listeners[ ev ];
			}
		}

		return this;
	}

	/**
	 * Adds a listener for an event
	 *
	 * @method on
	 * @memberOf keigai.Observable
	 * @param  {String}   ev      Event name
	 * @param  {Function} handler Handler
	 * @param  {String}   id      [Optional] Handler ID
	 * @param  {String}   scope   [Optional] Handler scope, default is `this`
	 * @return {Object} {@link keigai.Observable}
	 * @example
	 * observer.on( "click", function ( ev ) {
	 *   ...
	 * }, "myHook" );
	 */
	on ( ev, handler, id=utility.uuid(), scope=undefined ) {
		if ( !this.listeners[ ev ] ) {
			this.listeners[ ev ] = {};
		}

		if ( array.keys( this.listeners[ ev ] ).length >= this.limit ) {
			throw( new Error( "Possible memory leak, more than " + this.limit + " listeners for event: " + ev ) );
		}

		this.listeners[ ev ][ id ] = { scope: scope || this, handler: handler };

		return this;
	}

	/**
	 * Adds a short lived listener for an event
	 *
	 * @method once
	 * @memberOf keigai.Observable
	 * @param  {String}   ev      Event name
	 * @param  {Function} handler Handler
	 * @param  {String}   id      [Optional] Handler ID
	 * @param  {String}   scope   [Optional] Handler scope, default is `this`
	 * @return {Object} {@link keigai.Observable}
	 * @example
	 * observer.once( "click", function ( ev ) {
	 *   ...
	 * } );
	 */
	once ( ev, handler, id=utility.uuid(), scope=undefined ) {
		scope = scope || this;

		return this.on( ev, ( ...args ) => {
			handler.apply( scope, args );
			this.off( ev, id );
		}, id, scope );
	}

	/**
	 * Unhooks from `target` for a DOM event
	 *
	 * @method unhook
	 * @memberOf keigai.Observable
	 * @param  {Object} target Element
	 * @param  {String} ev     Event
	 * @return {Object}        Element
	 * @example
	 * observer.unhook( document.querySelector( "a" ), "click" );
	 */
	unhook ( target, ev ) {
		let obj = this.hooks.get( target );

		if ( obj ) {
			target.removeEventListener( ev, obj[ ev ], false );
			delete obj[ ev ];

			if ( array.keys( obj ).length === 0 ) {
				this.hooks.delete( target );
			}
			else {
				this.hooks.set( target, obj );
			}
		}

		return target;
	}
}

/**
 * Observable factory
 *
 * @method factory
 * @memberOf observable
 * @return {Object} {@link keigai.Observable}
 * @example
 * let observer = keigai.util.observer( 50 );
 */
let observable = function ( arg ) {
	return new Observable( arg );
};

class Base {
	/**
	 * Base Object
	 *
	 * @constructor
	 * @memberOf keigai
	 */
	constructor () {
		/**
		 * {@link keigai.Observable}
		 *
		 * @abstract
		 * @type {Object}
		 */
		this.observer = null;
	}

	/**
	 * Adds an event listener
	 *
	 * @method addEventListener
	 * @memberOf keigai.Base
	 * @param  {String}   ev       Event name
	 * @param  {Function} listener Function to execute
	 * @param  {String}   id       [Optional] Listener ID
	 * @param  {String}   scope    [Optional] Listener scope, default is `this`
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.addEventListener( "event", function ( ev ) {
	 *   ...
	 * }, "myHook" );
	 */
	addEventListener ( ev, listener, id, scope ) {
		this.observer.on( ev, listener, id, scope || this );

		return this;
	}

	/**
	 * Adds an event listener
	 *
	 * @method addListener
	 * @memberOf keigai.Base
	 * @param  {String}   ev       Event name
	 * @param  {Function} listener Function to execute
	 * @param  {String}   id       [Optional] Listener ID
	 * @param  {String}   scope    [Optional] Listener scope, default is `this`
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.addEventListener( "event", function ( ev ) {
	 *   ...
	 * }, "myHook" );
	 */
	addListener ( ev, listener, id, scope ) {
		this.observer.on( ev, listener, id, scope || this );

		return this;
	}

	/**
	 * Dispatches an event, with optional arguments
	 *
	 * @method dispatch
	 * @memberOf keigai.Base
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.dispatch( "event", ... );
	 */
	dispatch ( ...args ) {
		this.observer.dispatch.apply( this.observer, args );

		return this;
	}

	/**
	 * Dispatches an event, with optional arguments
	 *
	 * @method dispatchEvent
	 * @memberOf keigai.Base
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.dispatchEvent( "event", ... );
	 */
	dispatchEvent ( ...args ) {
		this.observer.dispatch.apply( this.observer, args );

		return this;
	}

	/**
	 * Dispatches an event, with optional arguments
	 *
	 * @method emit
	 * @memberOf keigai.Base
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.emit( "event", ... );
	 */
	emit ( ...args ) {
		this.observer.dispatch.apply( this.observer, args );

		return this;
	}

	/**
	 * Hooks into `target` for an event
	 *
	 * @method hook
	 * @memberOf keigai.Base
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.hook( document.querySelector( "a" ), "click" );
	 */
	hook ( ...args ) {
		this.observer.hook.apply( this.observer, args );

		return this;
	}

	/**
	 * Gets listeners
	 *
	 * @method listeners
	 * @memberOf keigai.Base
	 * @param  {String} ev [Optional] Event name
	 * @return {Object} Listeners
	 * @example
	 * keigai.util.iterate( obj.listeners(), function ( fn, id ) {
	 *   ...
	 * } );
	 */
	listeners ( ev ) {
		return ev ? this.observer.listeners[ ev ] : this.observer.listeners;
	}

	/**
	 * Removes an event listener
	 *
	 * @method off
	 * @memberOf keigai.Base
	 * @param  {String} ev Event name
	 * @param  {String} id [Optional] Listener ID
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.off( "event", "myHook" );
	 */
	off ( ev, id ) {
		this.observer.off( ev, id );

		return this;
	}

	/**
	 * Adds an event listener
	 *
	 * @method on
	 * @memberOf keigai.Base
	 * @param  {String}   ev       Event name
	 * @param  {Function} listener Function to execute
	 * @param  {String}   id       [Optional] Listener ID
	 * @param  {String}   scope    [Optional] Listener scope, default is `this`
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.on( "event", function ( ev ) {
	 *   ...
	 * }, "myHook" );
	 */
	on ( ev, listener, id, scope ) {
		this.observer.on( ev, listener, id, scope || this );

		return this;
	}

	/**
	 * Adds a short lived event listener
	 *
	 * @method once
	 * @memberOf keigai.Base
	 * @param  {String}   ev       Event name
	 * @param  {Function} listener Function to execute
	 * @param  {String}   id       [Optional] Listener ID
	 * @param  {String}   scope    [Optional] Listener scope, default is `this`
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.once( "event", function ( ev ) {
	 *   ...
	 * } );
	 */
	once ( ev, listener, id, scope ) {
		this.observer.once( ev, listener, id, scope || this );

		return this;
	}

	/**
	 * Removes an event listener
	 *
	 * @method removeEventListener
	 * @memberOf keigai.Base
	 * @param  {String} ev Event name
	 * @param  {String} id [Optional] Listener ID
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.removeListener( "event", "myHook" );
	 */
	removeEventListener ( ev, id ) {
		this.observer.off( ev, id );

		return this;
	}

	/**
	 * Removes an event listener
	 *
	 * @method removeListener
	 * @memberOf keigai.Base
	 * @param  {String} ev Event name
	 * @param  {String} id [Optional] Listener ID
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.removeListener( "event", "myHook" );
	 */
	removeListener ( ev, id ) {
		this.observer.off( ev, id );

		return this;
	}
}

/**
 * @namespace array
 */
let array = {
	/**
	 * Adds 'arg' to 'obj' if it is not found
	 *
	 * @method add
	 * @memberOf array
	 * @param  {Array} obj Array to receive 'arg'
	 * @param  {Mixed} arg Argument to set in 'obj'
	 * @return {Array}     Array that was queried
	 * @example
	 * let myArray = [1, 2];
	 *
	 * keigai.util.array.add( myArray, 3 ); // [1, 2, 3]
	 * keigai.util.array.add( myArray, 1 ); // [1, 2, 3]
	 */
	add: function ( obj, arg ) {
		if ( !array.contains( obj, arg ) ) {
			obj.push( arg );
		}

		return obj;
	},

	/**
	 * Preforms a binary search on a sorted Array
	 *
	 * @method binIndex
	 * @memberOf array
	 * @param  {Array} obj Array to search
	 * @param  {Mixed} arg Value to find index of
	 * @return {Number}    Index of `arg` within `obj`
	 * @example
	 * let myArray = [1, 5, 10, 15, 20, 25, ...];
	 *
	 * keigai.util.array.binIndex( myArray, 5 ); // 1
	 */
	binIndex: function ( obj, arg ) {
		let max = obj.length - 1;
		let min = 0;
		let idx = 0;
		let val = 0;

		while ( min <= max ) {
			idx = Math.floor( ( min + max ) / 2 );
			val = obj[ idx ];

			if ( val < arg ) {
				min = idx + 1;
			} else if ( val > arg ) {
				max = idx - 1;
			} else {
				return idx;
			}
		}

		return -1;
	},

	/**
	 * Returns an Object ( NodeList, etc. ) as an Array
	 *
	 * @method cast
	 * @memberOf array
	 * @param  {Object}  obj Object to cast
	 * @param  {Boolean} key [Optional] Returns key or value, only applies to Objects without a length property
	 * @return {Array}       Object as an Array
	 * @example
	 * keigai.util.array.cast( document.querySelectorAll( "..." ) );
	 */
	cast: function ( obj, key ) {
		let o = [];

		if ( !isNaN( obj.length ) ) {
			o = Array.from( obj );
		} else if ( key === true ) {
			o = array.keys( obj );
		} else {
			utility.iterate( obj, function ( i ) {
				o.push( i );
			} );
		}

		return o;
	},

	/**
	 * Transforms an Array to a 2D Array of chunks
	 *
	 * @method chunk
	 * @memberOf array
	 * @param  {Array}  obj  Array to process
	 * @param  {Number} size Chunk size ( integer )
	 * @return {Array}       Chunked Array
	 * @example
	 * keigai.util.array.chunk( [0, 1, 2, 3], 2 ); // [[0, 1], [2, 3]]
	 */
	chunk: function ( obj, size ) {
		let result = [];
		let nth = number.round( ( obj.length / size ), "up" );
		let start = 0;
		let i = -1;

		while ( ++i < nth ) {
			start = i * size;
			result.push( array.limit( obj, start, size ) );
		}

		return result;
	},

	/**
	 * Clears an Array without destroying it
	 *
	 * @method clear
	 * @memberOf array
	 * @param  {Array} obj Array to clear
	 * @return {Array}     Cleared Array
	 * @example
	 * let myArray = [1, 2, 3, 4, 5];
	 *
	 * keigai.util.array.clear( myArray );
	 * myArray.length; // 0
	 */
	clear: function ( obj ) {
		return obj.length > 0 ? array.remove( obj, 0, obj.length ) : obj;
	},

	/**
	 * Clones an Array
	 *
	 * @method clone
	 * @memberOf array
	 * @param  {Array}   obj     Array to clone
	 * @param  {Boolean} shallow [Optional] Default is `true`
	 * @return {Array}           Clone of Array
	 * @example
	 * let myArray      = [1, 2, 3, 4, 5],
	 *     myArrayClone = keigai.util.array.clone( myArray );
	 *
	 * myArrayClone.push( 6 );
	 *
	 * myArray.length;      // 5
	 * myArrayClone.length; // 6
	 */
	clone: function ( obj, shallow=true ) {
		return utility.clone( obj, shallow );
	},

	/**
	 * Determines if obj contains arg
	 *
	 * @method contains
	 * @memberOf array
	 * @param  {Array} obj Array to search
	 * @param  {Mixed} arg Value to look for
	 * @return {Boolean}   True if found, false if not
	 * @example
	 * if ( keigai.util.array.contains( [1], 1 ) ) { ... }
	 */
	contains: function ( obj, arg ) {
		return obj.indexOf( arg ) > -1;
	},

	/**
	 * Facade of `Array.map()`
	 *
	 * @method collect
	 * @memberOf array
	 * @param  {Array}    obj Array to iterate
	 * @param  {Function} fn  Function to execute against indices
	 * @return {Array}        New Array
	 * @example
	 * let results = keigai.util.array.collect( [...], function ( ... ) { ... } );
	 */
	collect: function ( obj, fn ) {
		return obj.map( fn );
	},

	/**
	 * Compacts a Array by removing `null` or `undefined` indices
	 *
	 * @method compact
	 * @memberOf array
	 * @param  {Array}   obj  Array to compact
	 * @param  {Boolean} diff Indicates to return resulting Array only if there's a difference
	 * @return {Array}        Compacted copy of `obj`, or null ( if `diff` is passed & no diff is found )
	 * @example
	 * keigai.util.array.compact( [null, "a", "b", "c", null, "d"] ); // ["a", "b", "c", "d"]
	 * keigai.util.array.compact( ["a", "b", "c", "d"], true );       // null
	 */
	compact: function ( obj, diff ) {
		let result = obj.filter( function ( i ) {
			return !regex.null_undefined.test( i );
		} );

		return diff !== true ? result : ( result.length < obj.length ? result : null );
	},

	/**
	 * Counts `value` in `obj`
	 *
	 * @method count
	 * @memberOf array
	 * @param  {Array} obj   Array to search
	 * @param  {Mixed} value Value to compare
	 * @return {Array}       Array of counts
	 * @example
	 * keigai.util.array.count( ["apple", "banana", "orange", "apple"], "apple" ); // 2
	 */
	count: function ( obj, value ) {
		return obj.filter( function ( i ) {
			return ( i === value );
		} ).length;
	},

	/**
	 * Finds the difference between two Arrays
	 *
	 * @method diff
	 * @memberOf array
	 * @param  {Array} obj1 Source Array
	 * @param  {Array} obj2 Comparison Array
	 * @return {Array}      Array of the differences
	 * @example
	 * keigai.util.array.diff( ["a"], ["a", "b"] ); // ["b"]
	 */
	diff: function ( obj1, obj2 ) {
		let result;

		result = obj1.filter( function ( i ) {
			return !array.contains( obj2, i );
		} );

		result = result.concat( obj2.filter( function ( i ) {
			return !array.contains( obj1, i );
		} ) );

		return result;
	},

	/**
	 * Iterates `obj` and executes `fn` with arguments [`value`, `index`].
	 * Returning `false` halts iteration.
	 *
	 * @method each
	 * @memberOf array
	 * @param  {Array}    obj   Array to iterate
	 * @param  {Function} fn    Function to execute on index values
	 * @param  {Boolean}  async [Optional] Asynchronous iteration
	 * @param  {Number}   size  [Optional] Batch size for async iteration, default is 10
	 * @return {Array}          Array
	 * @example
	 * keigai.util.array.each( [ ... ], function ( ... ) { ... } );
	 * keigai.util.array.each( [ ... ], function ( ... ) { ... }, true, 100 ); // processing batches of a 100
	 */
	each: function ( obj, fn, async, size=10 ) {
		let nth = obj.length;
		let i, offset;

		if ( async !== true ) {
			i = -1;
			while ( ++i < nth ) {
				if ( fn.call( obj, obj[ i ], i ) === false ) {
					break;
				}
			}
		} else {
			offset = 0;

			if ( size > nth ) {
				size = nth;
			}

			utility.repeat( function () {
				let i = -1;
				let idx;

				while ( ++i < size ) {
					idx = i + offset;

					if ( idx === nth || fn.call( obj, obj[ idx ], idx ) === false ) {
						return false;
					}
				}

				offset += size;

				if ( offset >= nth ) {
					return false;
				}
			}, undefined, undefined, false );
		}

		return obj;
	},

	/**
	 * Iterates `obj` in reverse and executes `fn` with arguments [`value`, `index`].
	 * Returning `false` halts iteration.
	 *
	 * @method eachReverse
	 * @memberOf array
	 * @param  {Array}    obj   Array to iterate
	 * @param  {Function} fn    Function to execute on index values
	 * @param  {Boolean}  async [Optional] Asynchronous iteration
	 * @param  {Number}   size  [Optional] Batch size for async iteration, default is 10
	 * @return {Array}          Array
	 * @example
	 * keigai.util.array.eachReverse( [ ... ], function ( ... ) { ... } );
	 * keigai.util.array.eachReverse( [ ... ], function ( ... ) { ... }, true, 100 ); // processing batches of a 100
	 */
	eachReverse: function ( obj, fn, async, size ) {
		let nth = obj.length;
		let i, offset;

		if ( async !== true ) {
			i = nth;
			while ( --i > -1 ) {
				if ( fn.call( obj, obj[ i ], i ) === false ) {
					break;
				}
			}
		} else {
			size = size || 10;
			offset = nth - 1;

			if ( size > nth ) {
				size = nth;
			}

			utility.repeat( function () {
				let i = -1;
				let idx;

				while ( ++i < size ) {
					idx = offset - i;

					if ( idx < 0 || fn.call( obj, obj[ idx ], idx ) === false ) {
						return false;
					}
				}

				offset -= size;

				if ( offset < 0 ) {
					return false;
				}
			}, undefined, undefined, false );
		}

		return obj;
	},

	/**
	 * Determines if an Array is empty
	 *
	 * @method empty
	 * @memberOf array
	 * @param  {Array} obj Array to inspect
	 * @return {Boolean}   `true` if there's no indices
	 * @example
	 * keigai.util.array.empty( [] );    // true
	 * keigai.util.array.empty( ["a"] ); // false
	 */
	empty: function ( obj ) {
		return obj.length === 0;
	},

	/**
	 * Determines if two Arrays are equal
	 *
	 * @method equal
	 * @memberOf array
	 * @param  {Array} obj1 Array to compare
	 * @param  {Array} obj2 Array to compare
	 * @return {Boolean} `true` if the Arrays match
	 * @example
	 * keigai.util.array.equal( ["a"], ["a"] );      // true
	 * keigai.util.array.equal( ["a"], ["a", "b"] ); // false
	 */
	equal: function ( obj1, obj2 ) {
		return JSON.stringify( obj1 ) === JSON.stringify( obj2 );
	},

	/**
	 * Fills `obj` with the evalution of `arg`, optionally from `start` to `offset`
	 *
	 * @method fill
	 * @memberOf array
	 * @param  {Array}  obj   Array to fill
	 * @param  {Mixed}  arg   String, Number of Function to fill with
	 * @param  {Number} start [Optional] Index to begin filling at
	 * @param  {Number} end   [Optional] Offset from start to stop filling at
	 * @return {Array}        Filled Array
	 * @example
	 * let myArray = ["a", "b", "c"];
	 *
	 * keigai.util.array.fill( myArray, function ( i ) { return i + "a"; } );
	 * myArray[0]; // "aa"
	 */
	fill: function ( obj, arg, start, offset ) {
		let fn = typeof arg === "function";
		let l = obj.length;
		let i = !isNaN( start ) ? start : 0;
		let nth = !isNaN( offset ) ? i + offset : l - 1;

		if ( nth > ( l - 1 ) ) {
			nth = l - 1;
		}

		if ( fn ) {
			while ( i <= nth ) {
				obj[ i ] = arg( obj[ i ] );
				i++;
			}
		} else {
			while ( i <= nth ) {
				obj[ i ] = arg;
				i++;
			}
		}

		return obj;
	},

	/**
	 * Returns the first Array index
	 *
	 * @method first
	 * @memberOf array
	 * @param  {Array} obj The array
	 * @return {Mixed}     The first node of the array
	 * @example
	 * keigai.util.array.first( ["a", "b"] ); // "a"
	 */
	first: function ( obj ) {
		return obj[ 0 ];
	},

	/**
	 * Flattens a 2D Array
	 *
	 * @method flat
	 * @memberOf array
	 * @param  {Array} obj 2D Array to flatten
	 * @return {Array}     Flatten Array
	 * @example
	 * keigai.util.array.flat( [[0, 1], [2, 3]] ); // [0, 1, 2, 3]
	 */
	flat: function ( obj ) {
		let result = [];

		result = obj.reduce( function ( a, b ) {
			return a.concat( b );
		}, result );

		return result;
	},

	/**
	 * Iterates `obj` and executes `fn` with arguments [`value`, `index`].
	 * Returning `false` halts iteration.
	 *
	 * @method forEach
	 * @memberOf array
	 * @see array.each
	 * @param  {Array}    obj   Array to iterate
	 * @param  {Function} fn    Function to execute on index values
	 * @param  {Boolean}  async [Optional] Asynchronous iteration
	 * @param  {Number}   size  [Optional] Batch size for async iteration, default is 10
	 * @return {Array}          Array
	 * @example
	 * keigai.util.array.forEach( [ ... ], function ( ... ) { ... } );
	 * keigai.util.array.forEach( [ ... ], function ( ... ) { ... }, true, 100 ); // processing batches of a 100
	 */
	forEach: function ( obj, fn, async, size ) {
		return array.each( obj, fn, async, size );
	},

	/**
	 * Creates a 2D Array from an Object
	 *
	 * @method fromObject
	 * @memberOf array
	 * @param  {Object} obj Object to convert
	 * @return {Array}      2D Array
	 * @example
	 * keigai.util.array.fromObject( {name: "John", sex: "male"} ); // [["name", "John"], ["sex", "male"]]
	 */
	fromObject: function ( obj ) {
		return array.mingle( array.keys( obj ), array.cast( obj ) );
	},

	/**
	 * Facade of indexOf
	 *
	 * @method index
	 * @memberOf array
	 * @param  {Array} obj Array to search
	 * @param  {Mixed} arg Value to find index of
	 * @return {Number}    The position of arg in instance
	 * @example
	 * keigai.util.array.index( ["a", "b", "c"], "b" ); // 1
	 */
	index: function ( obj, arg ) {
		return obj.indexOf( arg );
	},

	/**
	 * Returns an Associative Array as an Indexed Array
	 *
	 * @method indexed
	 * @memberOf array
	 * @param  {Array} obj Array to index
	 * @return {Array}     Indexed Array
	 * @example
	 * let myArray = ["a", "b", "c"];
	 *
	 * myArray.prop = "d";
	 * keigai.util.array.indexed( myArray ); ["a", "b", "c", "d"];
	 */
	indexed: function ( obj ) {
		let result = [];

		utility.iterate( obj, function ( v ) {
			result.push( v );
		} );

		return result;
	},

	/**
	 * Finds the intersections between obj1 and obj2
	 *
	 * @method intersect
	 * @memberOf array
	 * @param  {Array} obj1 Source Array
	 * @param  {Array} obj2 Comparison Array
	 * @return {Array}      Array of the intersections
	 * @example
	 * keigai.util.array.intersect( ["a", "b", "d"], ["b", "c", "d"] ); // ["b", "d"]
	 */
	intersect: function ( obj1, obj2 ) {
		let a = obj1.length > obj2.length ? obj1 : obj2;
		let b = ( a === obj1 ? obj2 : obj1 );

		return a.filter( function ( key ) {
			return array.contains( b, key );
		} );
	},

	/**
	 * Iterates an Array using an Iterator
	 *
	 * @method iterate
	 * @memberOf array
	 * @param  {Array} obj Array to iterate
	 * @return {Array}     Array to iterate
	 */
	iterate: function ( obj, fn ) {
		let itr = array.iterator( obj );
		let i = -1;
		let item, next;

		do {
			item = itr.next();

			if ( !item.done ) {
				next = fn( item.value, ++i );
			}
			else {
				next = false;
			}
		} while ( next !== false );

		return obj;
	},

	/**
	 * Creates an Array generator to iterate the indices
	 *
	 * @method iterator
	 * @memberOf array
	 * @param  {Array} obj Array to iterate
	 * @return {Function}  Generator
	 */
	iterator: function ( obj ) {
		let i = -1;
		let n = obj.length;

		return {
			next () {
				if ( ++i < n ) {
					return { done: false, value: obj[ i ] };
				} else {
					return { done: true };
				}
			}
		}
	},

	/**
	 * Keeps every element of `obj` for which `fn` evaluates to true
	 *
	 * @method keepIf
	 * @memberOf array
	 * @param  {Array}    obj Array to iterate
	 * @param  {Function} fn  Function to test indices against
	 * @return {Array}        Array
	 * @example
	 * let myArray = ["a", "b", "c"];
	 *
	 * keigai.util.array.keepIf( myArray, function ( i ) { return /a|c/.test( i ); } );
	 * myArray[1]; // "c"
	 */
	keepIf: function ( obj, fn ) {
		let result, remove;

		result = obj.filter( fn );
		remove = array.diff( obj, result );

		array.each( remove, function ( i ) {
			array.remove( obj, array.index( obj, i ) );
		} );

		return obj;
	},

	/**
	 * Returns the keys in an "Associative Array"
	 *
	 * @method keys
	 * @memberOf array
	 * @param  {Mixed} obj Array or Object to extract keys from
	 * @return {Array}     Array of the keys
	 * @example
	 * keigai.util.array.keys( {abc: true, xyz: false} ); // ["abc", "xyz"]
	 */
	keys: function ( obj ) {
		return Object.keys( obj );
	},

	/**
	 * Sorts an Array based on key values, like an SQL ORDER BY clause
	 *
	 * @method keySort
	 * @memberOf array
	 * @param  {Array}  obj   Array to sort
	 * @param  {String} query Sort query, e.g. "name, age desc, country"
	 * @param  {String} sub   [Optional] Key which holds data, e.g. "{data: {}}" = "data"
	 * @return {Array}        Sorted Array
	 * @example
	 * let myArray = [{abc: 123124, xyz: 5}, {abc: 123124, xyz: 6}, {abc: 2, xyz: 5}];
	 *
	 * keigai.util.array.keySort( myArray, "abc" );           // [{abc: 2, xyz: 5}, {abc: 123124, xyz: 5}, {abc: 123124, xyz: 6}];
	 * keigai.util.array.keySort( myArray, "abc, xyz desc" ); // [{abc: 2, xyz: 5}, {abc: 123124, xyz: 6}, {abc: 123124, xyz: 5}];
	 */
	keySort: function ( obj, query, sub ) {
		query = query.replace( /\s*asc/ig, "" ).replace( /\s*desc/ig, " desc" );

		let queries = string.explode( query ).map( function ( i ) { return i.split( " " ); } );
		let sorts = [];
		let braceS = "[\"";
		let braceE = "\"]";

		if ( sub && sub !== "" ) {
			sub = "." + sub;
		} else {
			sub = "";
		}

		array.each( queries, function ( i ) {
			let s = ".";
			let e = "";

			if ( regex.not_dotnotation.test( i[ 0 ] ) ) {
				s = braceS;
				e = braceE;
			}

			sorts.push( "try {" );

			if ( i[ 1 ] === "desc" ) {
				sorts.push( "if ( a" + sub + s + i[ 0 ] + e + " < b" + sub + s + i[ 0 ] + e + " ) return 1;" );
				sorts.push( "if ( a" + sub + s + i[ 0 ] + e + " > b" + sub + s + i[ 0 ] + e + " ) return -1;" );
			} else {
				sorts.push( "if ( a" + sub + s + i[ 0 ] + e + " < b" + sub + s + i[ 0 ] + e + " ) return -1;" );
				sorts.push( "if ( a" + sub + s + i[ 0 ] + e + " > b" + sub + s + i[ 0 ] + e + " ) return 1;" );
			}

			sorts.push( "} catch (e) {" );
			sorts.push( "try {" );
			sorts.push( "if ( a" + sub + s + i[ 0 ] + e + " !== undefined ) return " + ( i[ 1 ] === "desc" ? "-1" : "1") + ";" );
			sorts.push( "} catch (e) {}" );
			sorts.push( "try {" );
			sorts.push( "if ( b" + sub + s + i[ 0 ] + e + " !== undefined ) return " + ( i[ 1 ] === "desc" ? "1" : "-1") + ";" );
			sorts.push( "} catch (e) {}" );
			sorts.push( "}" );
		} );

		sorts.push( "return 0;" );

		return obj.sort( new Function( "a", "b", sorts.join( "\n" ) ) );
	},

	/**
	 * Returns the last index of the Array
	 *
	 * @method last
	 * @memberOf array
	 * @param  {Array}  obj Array
	 * @param  {Number} arg [Optional] Negative offset from last index to return
	 * @return {Mixed}      Last index( s ) of Array
	 * @example
	 * let myArray = [1, 2, 3, 4];
	 *
	 * keigai.util.array.last( myArray );    // 4
	 * keigai.util.array.last( myArray, 2 ); // [3, 4]
	 */
	last: function ( obj, arg ) {
		let n = obj.length - 1;

		if ( arg >= ( n + 1 ) ) {
			return obj;
		} else if ( isNaN( arg ) || arg === 1 ) {
			return obj[ n ];
		} else {
			return array.limit( obj, ( n - ( --arg ) ), n );
		}
	},

	/**
	 * Returns a limited range of indices from the Array
	 *
	 * @method limit
	 * @memberOf array
	 * @param  {Array}  obj    Array to iterate
	 * @param  {Number} start  Starting index
	 * @param  {Number} offset Number of indices to return
	 * @return {Array}         Array of indices
	 * @example
	 * let myArray = [1, 2, 3, 4];
	 *
	 * keigai.util.array.limit( myArray, 0, 2 ); // [1, 2]
	 * keigai.util.array.limit( myArray, 2, 2 ); // [3, 4]
	 */
	limit: function ( obj, start, offset ) {
		let result = [];
		let i = start - 1;
		let nth = start + offset;
		let max = obj.length;

		if ( max > 0 ) {
			while ( ++i < nth && i < max ) {
				result.push( obj[ i ] );
			}
		}

		return result;
	},

	/**
	 * Finds the maximum value in an Array
	 *
	 * @method max
	 * @memberOf array
	 * @param  {Array} obj Array to process
	 * @return {Mixed}     Number, String, etc.
	 * @example
	 * keigai.util.array.max( [5, 3, 9, 1, 4] ); // 9
	 */
	max: function ( obj ) {
		return array.last( array.sorted( array.clone( obj ) ) );
	},

	/**
	 * Finds the mean of an Array ( of numbers )
	 *
	 * @method mean
	 * @memberOf array
	 * @param  {Array} obj Array to process
	 * @return {Number}    Mean of the Array ( float or integer )
	 * @example
	 * keigai.util.array.mean( [1, 3, 5] ); // 3
	 */
	mean: function ( obj ) {
		return obj.length > 0 ? ( array.sum( obj ) / obj.length ) : undefined;
	},

	/**
	 * Finds the median value of an Array ( of numbers )
	 *
	 * @method median
	 * @memberOf array
	 * @param  {Array} obj Array to process
	 * @return {Number}    Median number of the Array ( float or integer )
	 * @example
	 * keigai.util.array.median( [5, 1, 3, 8] ); // 4
	 * keigai.util.array.median( [5, 1, 3] );    // 3
	 */
	median: function ( obj ) {
		let dupe = array.sorted( array.clone( obj ) );
		let nth = dupe.length;
		let mid = number.round( nth / 2, "down" );

		return number.odd( nth ) ? dupe[ mid ]: ( ( dupe[ mid - 1 ] + dupe[ mid ] ) / 2 );
	},

	/**
	 * Merges `arg` into `obj`, excluding duplicate indices
	 *
	 * @method merge
	 * @memberOf array
	 * @param  {Array} obj1 Array to receive indices
	 * @param  {Array} obj2 Array to merge
	 * @return {Array}      First argument
	 * @example
	 * let a = ["a", "b", "c"],
	 *     b = ["d"];
	 *
	 * keigai.util.array.merge( a, b );
	 * a[3]; // "d"
	 */
	merge: function ( obj1, obj2 ) {
		array.each( obj2, function ( i ) {
			array.add( obj1, i );
		} );

		return obj1;
	},

	/**
	 * Finds the minimum value in an Array
	 *
	 * @method min
	 * @memberOf array
	 * @param  {Array} obj Array to process
	 * @return {Mixed}     Number, String, etc.
	 * @example
	 * keigai.util.array.min( [5, 3, 9, 1, 4] ); // 1
	 */
	min: function ( obj ) {
		return array.sorted( array.clone( obj ) )[ 0 ];
	},

	/**
	 * Mingles Arrays and returns a 2D Array
	 *
	 * @method mingle
	 * @memberOf array
	 * @param  {Array} obj1 Array to mingle
	 * @param  {Array} obj2 Array to mingle
	 * @return {Array}      2D Array
	 * @example
	 * let a = ["a", "b"],
	 *     b = ["c", "d"];
	 *
	 * keigai.util.array.mingle( a, b ); // [["a", "c"], ["b", "d"]]
	 */
	mingle: function ( obj1, obj2 ) {
		let result = obj1.map( function ( i, idx ) {
			return [ i, obj2[ idx ] ];
		} );

		return result;
	},

	/**
	 * Finds the mode value of an Array
	 *
	 * @method mode
	 * @memberOf array
	 * @param  {Array} obj Array to process
	 * @return {Mixed}     Mode value of the Array
	 * @example
	 * keigai.util.array.mode( [1, 3, 7, 1, 2, 10, 7, 7, 3, 10] );     // 7
	 * keigai.util.array.mode( [1, 3, 7, 1, 2, 10, 7, 7, 3, 10, 10] ); // [7, 10]
	 */
	mode: function ( obj ) {
		let values = {};
		let count = 0;
		let mode = [];
		let nth, result;

		// Counting values
		array.each( obj, function ( i ) {
			if ( !isNaN( values[ i ] ) ) {
				values[ i ]++;
			} else {
				values[ i ] = 1;
			}
		} );

		// Finding the highest occurring count
		count = array.max( array.cast( values ) );

		// Finding values that match the count
		utility.iterate( values, function ( v, k ) {
			if ( v === count ) {
				mode.push( number.parse( k ) );
			}
		} );

		// Determining the result
		nth = mode.length;

		if ( nth > 0 ) {
			result = nth === 1 ? mode[ 0 ] : mode;
		}

		return result;
	},

	/**
	 * Finds the range of the Array ( of numbers ) values
	 *
	 * @method range
	 * @memberOf array
	 * @param  {Array} obj Array to process
	 * @return {Number}    Range of the array ( float or integer )
	 * @example
	 * keigai.util.array.range( [5, 1, 3, 8] ); // 7
	 */
	range: function ( obj ) {
		return array.max( obj ) - array.min( obj );
	},

	/**
	 * Searches a 2D Array `obj` for the first match of `arg` as a second index
	 *
	 * @method rassoc
	 * @memberOf array
	 * @param  {Array} obj 2D Array to search
	 * @param  {Mixed} arg Primitive to find
	 * @return {Mixed}     Array or undefined
	 * @example
	 * keigai.util.array.rassoc( [[1, 3], [7, 2], [4, 3]], 3 ); // [1, 3]
	 */
	rassoc: function ( obj, arg ) {
		let result;

		array.each( obj, function ( i, idx ) {
			if ( i[ 1 ] === arg ) {
				result = utility.clone( obj[ idx ], true );

				return false;
			}
		} );

		return result;
	},

	/**
	 * Returns Array containing the items in `obj` for which `fn()` is not true
	 *
	 * @method reject
	 * @memberOf array
	 * @param  {Array}    obj Array to iterate
	 * @param  {Function} fn  Function to execute against `obj` indices
	 * @return {Array}        Array of indices which fn() is not true
	 * @example
	 * keigai.util.array.reject( [0, 1, 2, 3, 4, 5], function ( i ) { return i % 2 > 0; } ); // [0, 2, 4]
	 */
	reject: function ( obj, fn ) {
		return array.diff( obj, obj.filter( fn ) );
	},

	/**
	 * Removes indices from an Array without recreating it
	 *
	 * @method remove
	 * @memberOf array
	 * @param  {Array}  obj   Array to remove from
	 * @param  {Mixed}  start Starting index, or value to find within obj
	 * @param  {Number} end   [Optional] Ending index
	 * @return {Array}        Modified Array
	 * @example
	 * let myArray = ["a", "b", "c", "d", "e"];
	 *
	 * keigai.util.array.remove( myArray, 2, 3 );
	 * myArray[2]; // "e"
	 */
	remove: function ( obj, start, end ) {
		if ( isNaN( start ) ) {
			start = array.index( obj, start );

			if ( start === -1 ) {
				return obj;
			}
		} else {
			start = start || 0;
		}

		let length = obj.length;
		let remaining = obj.slice( ( end || start ) + 1 || length );

		obj.length = start < 0 ? ( length + start ) : start;
		obj.push.apply( obj, remaining );

		return obj;
	},

	/**
	 * Deletes every element of `obj` for which `fn` evaluates to true
	 *
	 * @method removeIf
	 * @memberOf array
	 * @param  {Array}    obj Array to iterate
	 * @param  {Function} fn  Function to test indices against
	 * @return {Array}        Array
	 * @example
	 * let myArray = ["a", "b", "c"];
	 *
	 * keigai.util.array.removeIf( myArray, function ( i ) { return /a|c/.test( i ); } );
	 * myArray[0]; // "b"
	 */
	removeIf: function ( obj, fn ) {
		let remove = obj.filter( fn );

		array.each( remove, function ( i ) {
			array.remove( obj, array.index( obj, i ) );
		} );

		return obj;
	},

	/**
	 * Deletes elements of `obj` until `fn` evaluates to false
	 *
	 * @method removeWhile
	 * @memberOf array
	 * @param  {Array}    obj Array to iterate
	 * @param  {Function} fn  Function to test indices against
	 * @return {Array}        Array
	 * @example
	 * let myArray = ["a", "b", "c"];
	 *
	 * keigai.util.array.removeWhile( myArray, function ( i ) { return /a|c/.test( i ); } );
	 * myArray[0];     // "b"
	 * myArray.length; // 2
	 */
	removeWhile: function ( obj, fn ) {
		let remove = [];

		array.each( obj, function ( i ) {
			if ( fn( i ) !== false ) {
				remove.push( i );
			} else {
				return false;
			}
		} );

		array.each( remove, function ( i ) {
			array.remove( obj, array.index( obj, i ) );
		} );

		return obj;
	},

	/**
	 * Replaces the contents of `obj1` with `obj2`
	 *
	 * @method replace
	 * @memberOf array
	 * @param  {Array} obj1 Array to modify
	 * @param  {Array} obj2 Array to values to push into `obj1`
	 * @return {Array}      Array to modify
	 * @example
	 * let myArray = ["a", "b", "c"];
	 *
	 * keigai.util.array.replace( myArray, [true, false] );
	 * myArray[0];     // true
	 * myArray.length; // 2
	 */
	replace: function ( obj1, obj2 ) {
		array.remove( obj1, 0, obj1.length );
		array.each( obj2, function ( i ) {
			obj1.push( i );
		} );

		return obj1;
	},

	/**
	 * Returns the "rest" of `obj` from `arg`
	 *
	 * @method rest
	 * @memberOf array
	 * @param  {Array}  obj Array to process
	 * @param  {Number} arg [Optional] Start position of subset of `obj` ( positive number only )
	 * @return {Array}      Array of a subset of `obj`
	 * @example
	 * keigai.util.array.rest( [1, 2, 3, 4, 5, 6] );    // [2, 3, 4, 5, 6]
	 * keigai.util.array.rest( [1, 2, 3, 4, 5, 6], 3 ); // [4, 5, 6]
	 */
	rest: function ( obj, arg=1 ) {
		if ( arg < 1 ) {
			arg = 1;
		}

		return array.limit( obj, arg, obj.length );
	},

	/**
	 * Finds the last index of `arg` in `obj`
	 *
	 * @method rindex
	 * @memberOf array
	 * @param  {Array} obj Array to search
	 * @param  {Mixed} arg Primitive to find
	 * @return {Mixed}     Index or undefined
	 * @example
	 * keigai.util.array.rindex( [1, 2, 3, 2, 1], 2 ); // 3
	 */
	rindex: function ( obj, arg ) {
		let result = -1;

		array.each( obj, function ( i, idx ) {
			if ( i === arg ) {
				result = idx;
			}
		} );

		return result;
	},

	/**
	 * Returns new Array with `arg` moved to the first index
	 *
	 * @method rotate
	 * @memberOf array
	 * @param  {Array}  obj Array to rotate
	 * @param  {Number} arg Index to become the first index, if negative the rotation is in the opposite direction
	 * @return {Array}      Newly rotated Array
	 * @example
	 * keigai.util.array.rotate( [0, 1, 2, 3, 4],  3 )[0] // 2;
	 * keigai.util.array.rotate( [0, 1, 2, 3, 4], -2 )[0] // 3;
	 */
	rotate: function ( obj, arg ) {
		let nth = obj.length;
		let result;

		if ( arg === 0 ) {
			result = obj;
		} else {
			if ( arg < 0 ) {
				arg += nth;
			} else {
				arg--;
			}

			result = array.limit( obj, arg, nth );
			result = result.concat( array.limit( obj, 0, arg ) );
		}

		return result;
	},

	/**
	 * Generates a series Array
	 *
	 * @method series
	 * @memberOf array
	 * @param  {Number} start  Start value the series
	 * @param  {Number} end    [Optional] The end of the series
	 * @param  {Number} offset [Optional] Offset for indices, default is 1
	 * @return {Array}         Array of new series
	 * @example
	 * keigai.util.array.series( 0, 5 );     // [0, 1, 2, 3, 4]
	 * keigai.util.array.series( 0, 25, 5 ); // [0, 5, 10, 15, 20]
	 */
	series: function ( start=0, end=undefined, offset=1 ) {
		end = end || start;

		let result = [];
		let n = -1;
		let nth = Math.max( 0, Math.ceil( ( end - start ) / offset ) );

		while ( ++n < nth ) {
			result[ n ] = start;
			start += offset;
		}

		return result;
	},

	/**
	 * Sorts the Array by parsing values
	 *
	 * @method sort
	 * @memberOf array
	 * @param  {Mixed} a Argument to compare
	 * @param  {Mixed} b Argument to compare
	 * @return {Number}  Number indicating sort order
	 * @example
	 * keigai.util.array.sort( 2, 3 ); // -1
	 */
	sort: function ( a, b ) {
		let types = { a: typeof a, b: typeof b };
		let c, d, result;

		if ( types.a === "number" && types.b === "number" ) {
			result = a - b;
		} else {
			c = a.toString();
			d = b.toString();

			if ( c < d ) {
				result = -1;
			} else if ( c > d ) {
				result = 1;
			} else if ( types.a === types.b ) {
				result = 0;
			} else if ( types.a === "boolean" ) {
				result = -1;
			} else {
				result = 1;
			}
		}

		return result;
	},

	/**
	 * Sorts `obj` using `array.sort`
	 *
	 * @method sorted
	 * @memberOf array
	 * @param  {Array} obj Array to sort
	 * @return {Array}     Sorted Array
	 * @example
	 * let myArray = [5, 9, 2, 4];
	 *
	 * keigai.util.array.sorted( myArray );
	 * myArray[0]; // 2
	 */
	sorted: function ( obj ) {
		return obj.sort( array.sort );
	},

	/**
	 * Splits an Array by divisor
	 *
	 * @method split
	 * @memberOf array
	 * @param  {Array}  obj     Array to process
	 * @param  {Number} divisor Integer to divide the Array by
	 * @return {Array}          Split Array
	 * @example
	 * let myArray = [],
	 *     i       = -1,
	 *     results;
	 *
	 * while ( ++i < 100 ) {
		 *   myArray.push( i + 1 );
		 * }
	 *
	 * results = keigai.util.array.split( myArray, 21 );
	 * results.length;     // 21
	 * results[0].length;  // 5
	 * results[19].length; // 4
	 * results[19][0];     // 99
	 * results[20].length; // 1
	 * results[20][0];     // 100
	 */
	split: function ( obj, divisor ) {
		let result = [];
		let total = obj.length;
		let nth = Math.ceil( total / divisor );
		let low = Math.floor( total / divisor );
		let lower = Math.ceil( total / nth );
		let lowered = false;
		let start = 0;
		let i = -1;

		// Finding the fold
		if ( number.diff( total, ( divisor * nth ) ) > nth ) {
			lower = total - ( low * divisor ) + low - 1;
		} else if ( total % divisor > 0 && lower * nth >= total ) {
			lower--;
		}

		while ( ++i < divisor ) {
			if ( i > 0 ) {
				start = start + nth;
			}

			if ( !lowered && lower < divisor && i === lower ) {
				--nth;
				lowered = true;
			}

			result.push( array.limit( obj, start, nth ) );
		}

		return result;
	},

	/**
	 * Finds the standard deviation of an Array ( of numbers )
	 *
	 * @method stddev
	 * @memberOf array
	 * @param  {Array} obj Array to process
	 * @return {Number}    Standard deviation of the Array ( float or integer )
	 * @example
	 * keigai.util.array.stddev( [1, 3, 5] ); // 1.632993161855452
	 */
	stddev: function ( obj ) {
		return Math.sqrt( array.variance( obj ) );
	},

	/**
	 * Gets the summation of an Array of numbers
	 *
	 * @method sum
	 * @memberOf array
	 * @param  {Array} obj Array to sum
	 * @return {Number}    Summation of Array
	 * @example
	 * keigai.util.array.sum( [2, 4, 3, 1] ); // 10
	 */
	sum: function ( obj ) {
		let result = 0;

		if ( obj.length > 0 ) {
			result = obj.reduce( function ( prev, cur ) {
				return prev + cur;
			} );
		}

		return result;
	},

	/**
	 * Takes the first `n` indices from `obj`
	 *
	 * @method take
	 * @memberOf array
	 * @param  {Array}  obj Array to process
	 * @param  {Number} n   Offset from 0 to return
	 * @return {Array}      Subset of `obj`
	 * @example
	 * keigai.util.array.take( [1, 2, 3, 4], 2 ); // [1, 2]
	 */
	take: function ( obj, n ) {
		return array.limit( obj, 0, n );
	},

	/**
	 * Casts an Array to Object
	 *
	 * @method toObject
	 * @memberOf array
	 * @param  {Array} ar Array to transform
	 * @return {Object}   New object
	 * @example
	 * keigai.util.array.toObject( ["abc", "def"] ); // {0: "abc", 1: "def"}
	 */
	toObject: function ( ar ) {
		let obj = {};
		let i = ar.length;

		while ( i-- ) {
			obj[ i.toString() ] = ar[ i ];
		}

		return obj;
	},

	/**
	 * Gets the total keys in an Array
	 *
	 * @method total
	 * @memberOf array
	 * @param  {Array} obj Array to find the length of
	 * @return {Number}    Number of keys in Array
	 * @example
	 * let myArray = [true, true, false];
	 *
	 * myArray.extra = true;
	 * keigai.util.array.total( myArray ); // 4
	 */
	total: function ( obj ) {
		return array.indexed( obj ).length;
	},

	/**
	 * Returns an Array of unique indices of `obj`
	 *
	 * @method unique
	 * @memberOf array
	 * @param  {Array} obj Array to process
	 * @return {Array}     Array of unique indices
	 * @example
	 * keigai.util.array.unique( ["a", "b", "a", "c", "b", "d"] ); // ["a", "b", "c", "d"]
	 */
	unique: function ( obj ) {
		let result = [];

		array.each( obj, function ( i ) {
			array.add( result, i );
		} );

		return result;
	},

	/**
	 * Finds the variance of an Array ( of numbers )
	 *
	 * @method variance
	 * @memberOf array
	 * @param  {Array} obj Array to process
	 * @return {Number}    Variance of the Array ( float or integer )
	 * @example
	 * keigai.util.array.variance( [1, 3, 5] ); // 2.6666666666666665
	 */
	variance: function ( obj ) {
		let nth = obj.length;
		let n = 0;
		let mean;

		if ( nth > 0 ) {
			mean = array.mean( obj );

			array.each( obj, function ( i ) {
				n += math.sqr( i - mean );
			} );

			return n / nth;
		} else {
			return n;
		}
	},

	/**
	 * Converts any arguments to Arrays, then merges elements of `obj` with corresponding elements from each argument
	 *
	 * @method zip
	 * @memberOf array
	 * @param  {Array} obj  Array to transform
	 * @param  {Mixed} args Argument instance or Array to merge
	 * @return {Array}      Array
	 * @example
	 * keigai.util.array.zip( [0, 1], 1 ); // [[0, 1], [1, null]]
	 */
	zip: function ( obj, args ) {
		let result = [];

		// Preparing args
		if ( !( args instanceof Array ) ) {
			args = typeof args === "object" ? array.cast( args ) : [ args ];
		}

		array.each( args, function ( i, idx ) {
			if ( !( i instanceof Array ) ) {
				args[ idx ] = [ i ];
			}
		} );

		// Building result Array
		array.each( obj, function ( i, idx ) {
			result[ idx ] = [ i ];
			array.each( args, function ( x ) {
				result[ idx ].push( x[ idx ] || null );
			} );
		} );

		return result;
	}
};

/**
 * @namespace cache
 * @private
 */
let cache = {
	/**
	 * Collection URIs
	 *
	 * @memberOf cache
	 * @type {Object}
	 */
	lru: lru.factory( CACHE ),

	/**
	 * Expires a URI from the local cache
	 *
	 * @method expire
	 * @memberOf cache
	 * @param  {String} uri URI of the local representation
	 * @return {Boolean} `true` if successful
	 */
	expire: function ( uri ) {
		if ( cache.lru.cache[ uri ] ) {
			cache.lru.remove( uri );

			return true;
		}

		return false;
	},

	/**
	 * Determines if a URI has expired
	 *
	 * @method expired
	 * @memberOf cache
	 * @param  {Object} uri Cached URI object
	 * @return {Boolean}    True if the URI has expired
	 */
	expired: function ( uri ) {
		let item = cache.lru.cache[ uri ];

		return item && item.value.expires < new Date().getTime();
	},

	/**
	 * Returns the cached object {headers, response} of the URI or false
	 *
	 * @method get
	 * @memberOf cache
	 * @param  {String}  uri     URI/Identifier for the resource to retrieve from cache
	 * @param  {Boolean} expire  [Optional] If 'false' the URI will not expire
	 * @param  {Object}  headers [Optional] Request headers
	 * @return {Mixed}           URI Object {headers, response} or False
	 */
	get: function ( uri, expire, headers ) {
		uri = utility.parse( uri ).href;
		let item = cache.lru.get( uri );

		if ( !item ) {
			return false;
		}

		if ( ( expire !== false && cache.expired( uri ) ) || !utility.equal( item.request_headers, headers ) ) {
			cache.expire( uri );

			return false;
		}

		return utility.clone( item, true );
	},

	/**
	 * Sets, or updates an item in cache.items
	 *
	 * @method set
	 * @memberOf cache
	 * @param  {String} uri      URI to set or update
	 * @param  {String} property Property of the cached URI to set
	 * @param  {Mixed} value     Value to set
	 * @return {Mixed}           URI Object {headers, response} or undefined
	 */
	set: function ( uri, property, value ) {
		uri = utility.parse( uri ).href;
		let item = cache.lru.get( uri );

		if ( !item ) {
			item = {
				permission: 0
			};
		}

		if ( property === "permission" ) {
			item.permission |= value;
		} else if ( property === "!permission" ) {
			item.permission &= ~value;
		} else {
			item[ property ] = value;
		}

		cache.lru.set( uri, item );

		return item;
	}
};

/**
 * Custom Object returned from `client.request()`
 *
 * @constructor
 * @memberOf keigai
 * @extends {keigai.Base}
 * @param {Object} xhr XMLHttpRequest
 */
class KXMLHttpRequest extends Base {
	constructor ( xhr ) {
		super();

		this.observer = observable();
		this.defer = deferred();
		this.xhr = xhr;

		// Hooking observer for standard events
		array.each( EVENTS, ( i ) => {
			this.hook( this.xhr, i );
		} );
	}

	always ( arg ) {
		return this.defer.always.call( this.defer, arg );
	}

	done ( arg ) {
		return this.defer.done.call( this.defer, arg );
	}

	fail ( arg ) {
		return this.defer.fail.call( this.defer, arg );
	}

	reject ( arg ) {
		return this.defer.reject.call( this.defer, arg );
	}

	resolve ( arg ) {
		return this.defer.resolve.call( this.defer, arg );
	}

	then ( success, failure ) {
		return this.defer.then.call( this.defer, success, failure );
	}
}

/**
 * @namespace client
 */
let client = {
	/**
	 * Array Buffer is available
	 *
	 * @memberOf client
	 * @type {Boolean}
	 * @private
	 */
	ab: typeof ArrayBuffer !== "undefined",

	/**
	 * Blob is available
	 *
	 * @memberOf client
	 * @type {Boolean}
	 * @private
	 */
	blob: typeof Blob !== "undefined",

	/**
	 * Document is available
	 *
	 * @memberOf client
	 * @type {Boolean}
	 * @private
	 */
	doc: typeof Document !== "undefined",

	/**
	 * Internet Explorer browser
	 *
	 * @memberOf client
	 * @type {Boolean}
	 * @private
	 */
	ie: !server && regex.ie.test( navigator.userAgent ),

	/**
	 * Client version
	 *
	 * @memberOf client
	 * @type {Number}
	 * @private
	 */
	version: function () {
		let result = 0;

		if ( client.ie ) {
			result = number.parse( string.trim( navigator.userAgent.replace( /( .*msie|;.*)/gi, "" ) ) || 9, 10  );
		}

		return result;
	},

	/**
	 * Quick way to see if a URI allows a specific verb
	 *
	 * @method allows
	 * @memberOf client
	 * @param  {String} uri     URI to query
	 * @param  {String} verb    HTTP verb
	 * @param  {Object} headers [Optional] Request headers
	 * @return {Boolean}        `true` if the verb is allowed, undefined if unknown
	 * @private
	 */
	allows: function ( uri, verb, headers ) {
		uri = utility.parse( uri ).href;
		verb = verb.toLowerCase();

		let result = false;
		let bit = 0;

		if ( !cache.get( uri, false, headers ) ) {
			result = undefined;
		} else {
			if ( regex.del.test( verb ) ) {
				bit = 1;
			} else if ( regex.get_headers.test( verb ) ) {
				bit = 4;
			} else if ( regex.put_post.test( verb ) ) {
				bit = 2;
			} else if ( regex.patch.test( verb ) ) {
				bit = 8;
			}

			result = Boolean( client.permissions( uri, headers ).bit & bit );
		}

		return result;
	},

	/**
	 * Gets bit value based on args
	 *
	 * @method bit
	 * @memberOf client
	 * @param  {Array} args Array of commands the URI accepts
	 * @return {Number} To be set as a bit
	 * @private
	 */
	bit: function ( args ) {
		let result = 0;

		array.each( args, function ( verb ) {
			verb = verb.toLowerCase();

			if ( regex.get_headers.test( verb ) ) {
				result |= 4;
			} else if ( regex.put_post.test( verb ) ) {
				result |= 2;
			} else if ( regex.patch.test( verb ) ) {
				result |= 8;
			} else if ( regex.del.test( verb ) ) {
				result |= 1;
			}
		} );

		return result;
	},

	/**
	 * Determines if a URI is a CORS end point
	 *
	 * @method cors
	 * @memberOf client
	 * @param  {String} uri  URI to parse
	 * @return {Boolean}     True if CORS
	 * @private
	 */
	cors: function ( uri ) {
		return ( !server && uri.indexOf( "//" ) > -1 && uri.indexOf( "//" + location.host ) === -1 );
	},

	/**
	 * Caches the headers from the XHR response
	 *
	 * @method headers
	 * @memberOf client
	 * @param  {Object} xhr             XMLHttpRequest Object
	 * @param  {String} uri             URI to request
	 * @param  {String} type            Type of request
	 * @param  {Object} request_headers Request headers
	 * @return {Object}                 Cached URI representation
	 * @private
	 */
	headers: function ( xhr, uri, type, request_headers ) {
		let headers = string.trim( xhr.getAllResponseHeaders() ).split( "\n" );
		let items = {};
		let o = {};
		let allow = null;
		let expires = new Date();
		let cors = client.cors( uri );
		let cachable = true;

		array.each( headers, function ( i ) {
			let header = i.split( ": " );

			items[ header[ 0 ].toLowerCase() ] = string.trim( header[ 1 ] );

			if ( allow === null ) {
				if ( ( !cors && regex.allow.test( header[ 0 ] ) ) || ( cors && regex.allow_cors.test( header[ 0 ] ) ) ) {
					allow = header[ 1 ];

					return false;
				}
			}
		} );

		if ( regex.no.test( items[ "cache-control" ] ) ) {
			expires = expires.getTime();
		} else if ( items[ "cache-control" ] && regex.number_present.test( items[ "cache-control" ] ) ) {
			expires = expires.setSeconds( expires.getSeconds() + number.parse( regex.number_present.exec( items[ "cache-control" ] )[ 0 ], 10 ) );
		} else if ( items.expires ) {
			expires = new Date( items.expires ).getTime();
		} else {
			cachable = false;
			expires = expires.getTime();
		}

		o.cachable = cachable;
		o.expires = expires;
		o.headers = items;
		o.timestamp = new Date();
		o.permission = client.bit( allow !== null ? string.explode( allow ) : [ type ] );

		if ( type === "get" && cachable ) {
			cache.set( uri, "expires", o.expires );
			cache.set( uri, "headers", o.headers );
			cache.set( uri, "timestamp", o.timestamp );
			cache.set( uri, "permission", o.permission );
			cache.set( uri, "request_headers", request_headers );
		}

		return o;
	},

	/**
	 * Parses an XHR response
	 *
	 * @method parse
	 * @memberOf client
	 * @param  {Object} xhr  XHR Object
	 * @param  {String} type [Optional] content-type header value
	 * @return {Mixed}       Array, Boolean, Document, Number, Object or String
	 * @private
	 */
	parse: function ( xhr, type="" ) {
		let result, obj;

		if ( ( regex.json_maybe.test( type ) || string.isEmpty( type ) ) && ( regex.json_wrap.test( xhr.responseText ) && Boolean( obj = json.decode( xhr.responseText, true ) ) ) ) {
			result = obj;
		} else if ( type === "text/csv" ) {
			result = csv.decode( xhr.responseText );
		} else if ( type === "text/tsv" ) {
			result = csv.decode( xhr.responseText, "\t" );
		} else if ( regex.xml.test( type ) ) {
			if ( type !== "text/xml" ) {
				xhr.overrideMimeType( "text/xml" );
			}

			result = xhr.responseXML;
		} else if ( type === "text/plain" && regex.is_xml.test( xhr.responseText ) && xml.valid( xhr.responseText ) ) {
			result = xml.decode( xhr.responseText );
		} else {
			result = xhr.responseText;
		}

		return result;
	},

	/**
	 * Returns the permission of the cached URI
	 *
	 * @method permissions
	 * @memberOf client
	 * @param  {String} uri     URI to query
	 * @param  {Object} headers [Optional] Request headers
	 * @return {Object}         Contains an Array of available commands, the permission bit and a map
	 * @private
	 */
	permissions: function ( uri, headers ) {
		let cached = cache.get( uri, false, headers );
		let bit = !cached ? 0 : cached.permission;
		let result = { allows: [], bit: bit, map: { partial: 8, read: 4, write: 2, "delete": 1, unknown: 0 } };

		if ( bit & 1 ) {
			result.allows.push( "DELETE" );
		}

		if ( bit & 2 ) {
			result.allows.push( "POST" );
			result.allows.push( "PUT" );
		}

		if ( bit & 4 ) {
			result.allows.push( "GET" );
		}

		if ( bit & 8 ) {
			result.allows.push( "PATCH" );
		}

		return result;
	},

	/**
	 * Creates a JSONP request
	 *
	 * @method jsonp
	 * @memberOf client
	 * @param  {String} uri  URI to request
	 * @param  {Mixed}  args Custom JSONP handler parameter name, default is "callback"; or custom headers for GET request ( CORS )
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * keigai.util.jsonp( "http://somedomain.com/resource?callback=", function ( arg ) {
	 *   // `arg` is the coerced response body
	 * }, function ( err ) {
	 *   // Handle `err`
	 * } );
	 */
	jsonp: function ( uri, args ) {
		let defer = deferred();
		let callback = "callback";
		let cbid, s;

		if ( external === undefined ) {
			if ( !global.keigai ) {
				global.keigai = { callback: {} };
			}

			external = "keigai";
		}

		if ( args instanceof Object && !args.callback ) {
			callback = args.callback;
		}

		do {
			cbid = utility.genId().slice( 0, 10 );
		}
		while ( global.callback[ cbid ] );

		uri = uri.replace( callback + "=?", callback + "=" + external + ".callback." + cbid );

		global.callback[ cbid ] = function ( arg ) {
			utility.clearTimers( cbid );
			delete global.callback[ cbid ];
			defer.resolve( arg );
			element.destroy( s );
		};

		s = element.create( "script", { src: uri, type: "text/javascript" }, utility.dom( "head" )[ 0 ] );

		utility.defer( function () {
			utility.clearTimers( cbid );
			delete global.callback[ cbid ];
			defer.reject( new Error( label.requestTimeout ) );
		}, 30000, cbid );

		return defer;
	},

	/**
	 * KXMLHttpRequest factory
	 *
	 * @method kxhr
	 * @memberOf client
	 * @param {Object} xhr XMLHttpRequest
	 * @return {Object} {@link keigai.KXMLHttpRequest}
	 * @private
	 */
	kxhr: function ( xhr ) {
		return new KXMLHttpRequest( xhr );
	},

	/**
	 * Creates an XmlHttpRequest to a URI ( aliased to multiple methods )
	 *
	 * The returned Deferred will have an .xhr
	 *
	 * @method request
	 * @memberOf client
	 * @param  {String}   uri     URI to query
	 * @param  {String}   type    [Optional] Type of request ( DELETE/GET/POST/PUT/PATCH/HEAD/OPTIONS ), default is `GET`
	 * @param  {Mixed}    args    [Optional] Data to send with the request
	 * @param  {Object}   headers [Optional] Custom request headers ( can be used to set withCredentials )
	 * @return {Object}   {@link keigai.KXMLHttpRequest}
	 * @example
	 * keigai.util.request( "http://keigai.io" ).then( function ( arg ) {
	 *   // `arg` is the coerced response body
	 * }, function ( err ) {
	 *   // Handle `err`
	 * } );
	 */
	request: function ( uri, type="GET", args=undefined, headers=undefined ) {
		uri = utility.parse( uri ).href;
		type = type.toLowerCase();
		headers = headers instanceof Object ? headers : null;

		let cors = client.cors( uri );
		let kxhr = client.kxhr( !client.ie || ( !cors || client.version > 9 ) ? new XMLHttpRequest() : new XDomainRequest() );
		let payload = ( regex.put_post.test( type ) || regex.patch.test( type ) ) && args ? args : null;
		let cached = type === "get" ? cache.get( uri, false, headers ) : false;
		let contentType = null;
		let doc = client.doc;
		let ab = client.ab;
		let blob = client.blob;

		// Only GET & POST is supported by XDomainRequest (so useless!)
		if ( client.ie && client.version === 9 && cors && !regex.xdomainrequest.test( type ) ) {
			throw new Error( label.notAvailable );
		}

		// Hooking custom events
		kxhr.on( "readystatechange", function ( ev ) {
			let state = kxhr.xhr.readyState;

			if ( state === 1 ) {
				kxhr.dispatch( "beforeXHR", kxhr.xhr, ev );
			} else if ( state === 4 ) {
				kxhr.dispatch( "afterXHR", kxhr.xhr, ev );
			}
		} );

		if ( client.allows( uri, type, headers ) === false ) {
			kxhr.dispatch( "beforeXHR", kxhr.xhr, null );
			kxhr.xhr.status = 405;
			kxhr.reject( new Error( label.methodNotAllowed ) );
			utility.delay( function () {
				kxhr.dispatch( "afterXHR", kxhr.xhr, null );
			} );
		} else if ( type === "get" && Boolean( cached ) ) {
			// Decorating XHR for proxy behavior
			if ( server ) {
				kxhr.xhr.readyState = 4;
				kxhr.xhr.status = 200;
				kxhr.xhr._resheaders = cached.headers;
			}

			kxhr.dispatch( "beforeXHR", kxhr.xhr, null );
			kxhr.resolve( cached.response );
			utility.delay( function () {
				kxhr.dispatch( "afterXHR", kxhr.xhr, null );
			} );
		} else {
			utility.delay( function () {
				kxhr.xhr.open( type.toUpperCase(), uri, true );

				// Setting content-type value
				if ( headers !== null && headers.hasOwnProperty( "content-type" ) ) {
					contentType = headers[ "content-type" ];
				}

				if ( cors && contentType === null ) {
					contentType = "text/plain";
				}

				// Transforming payload
				if ( payload !== null ) {
					if ( payload.hasOwnProperty( "xml" ) ) {
						payload = payload.xml;
					}

					if ( doc && payload instanceof Document ) {
						payload = xml.decode( payload );
					}

					if ( typeof payload === "string" && regex.is_xml.test( payload ) ) {
						contentType = "application/xml";
					}

					if ( !( ab && payload instanceof ArrayBuffer ) && !( blob && payload instanceof Blob ) && !( payload instanceof Buffer ) && payload instanceof Object ) {
						contentType = "application/json";
						payload = json.encode( payload );
					}

					if ( contentType === null && ( ( ab && payload instanceof ArrayBuffer ) || ( blob && payload instanceof Blob ) ) ) {
						contentType = "application/octet-stream";
					}

					if ( contentType === null ) {
						contentType = "application/x-www-form-urlencoded; charset=UTF-8";
					}
				}

				// Setting headers for everything except IE9 CORS requests
				if ( !client.ie || ( !cors || client.version > 9 ) ) {
					if ( headers === null ) {
						headers = {};
					}

					if ( typeof cached === "object" && cached.headers.hasOwnProperty( "etag" ) ) {
						headers.etag = cached.headers.etag;
					}

					if ( contentType !== null ) {
						headers[ "content-type" ] = contentType;
					}

					if ( headers.hasOwnProperty( "callback" ) ) {
						delete headers.callback;
					}

					headers[ "x-requested-with" ] = "XMLHttpRequest";

					utility.iterate( headers, function ( v, k ) {
						if ( v !== null && k !== "withCredentials" ) {
							kxhr.xhr.setRequestHeader( k, v );
						}
					} );

					// Cross Origin Resource Sharing ( CORS )
					if ( typeof kxhr.xhr.withCredentials === "boolean" && headers !== null && typeof headers.withCredentials === "boolean" ) {
						kxhr.xhr.withCredentials = headers.withCredentials;
					}
				}

				kxhr.on( "load", function () {
					let xdr = client.ie && kxhr.xhr.readyState === undefined;
					let shared = true;
					let o, r, t, redirect;

					if ( !xdr && kxhr.xhr.readyState === 4 ) {
						switch ( kxhr.xhr.status ) {
							case 200:
							case 201:
							case 202:
							case 203:
							case 204:
							case 205:
							case 206:
								o = client.headers( kxhr.xhr, uri, type, headers );

								if ( type === "head" ) {
									return kxhr.resolve( o.headers );
								} else if ( type === "options" ) {
									return kxhr.resolve( o.headers );
								} else if ( type !== "delete" ) {
									if ( server && regex.priv.test( o.headers[ "cache-control" ] ) ) {
										shared = false;
									}

									if ( regex.http_body.test( kxhr.xhr.status ) ) {
										t = o.headers[ "content-type" ] || "";
										r = client.parse( kxhr.xhr, t );

										if ( r === undefined ) {
											kxhr.reject( new Error( label.serverError ) );
										}
									}

									if ( type === "get" && shared && o.cachable ) {
										cache.set( uri, "response", ( o.response = utility.clone( r, true ) ) );
									} else {
										cache.expire( uri, true );
									}
								} else if ( type === "delete" ) {
									cache.expire( uri, true );
								}

								switch ( kxhr.xhr.status ) {
									case 200:
									case 202:
									case 203:
									case 206:
										kxhr.resolve( r );
										break;
									case 201:
										if ( ( o.headers.location === undefined || string.isEmpty( o.headers.location ) ) && !string.isUrl( r ) ) {
											kxhr.resolve( r );
										} else {
											redirect = string.trim( o.headers.Location || r );
											client.request( redirect ).then( function ( arg ) {
												if ( type === "get" && shared && o.cachable ) {
													cache.set( uri, "response", arg );
												}

												kxhr.resolve( arg );
											}, function ( e ) {
												kxhr.reject( e );
											} );
										}
										break;
									case 204:
									case 205:
										kxhr.resolve( null );
										break;
								}
								break;
							case 304:
								kxhr.resolve( r );
								break;
							case 401:
								kxhr.reject( new Error( kxhr.xhr.responseText || label.serverUnauthorized ) );
								break;
							case 403:
								cache.set( uri, "!permission", client.bit( [ type ] ) );
								kxhr.reject( new Error( kxhr.xhr.responseText || label.serverForbidden ) );
								break;
							case 405:
								cache.set( uri, "!permission", client.bit( [ type ] ) );
								kxhr.reject( new Error( kxhr.xhr.responseText || label.serverInvalidMethod ) );
								break;
							default:
								kxhr.reject( new Error( kxhr.xhr.responseText || label.serverError ) );
						}
					} else if ( xdr ) {
						r = client.parse( kxhr.xhr, "text/plain" );
						cache.set( uri, "permission", client.bit( [ "get" ] ) );
						cache.set( uri, "response", r );
						kxhr.resolve( r );
					}
				} );

				kxhr.on( "error", function ( e ) {
					kxhr.reject( e );
				} );

				// Sending request
				kxhr.xhr.send( payload !== null ? payload : undefined );
			} );
		}

		return kxhr;
	},

	/**
	 * Scrolls to a position in the view using a two point bezier curve
	 *
	 * @method scroll
	 * @memberOf client
	 * @param  {Array}  dest Coordinates
	 * @param  {Number} ms   [Optional] Milliseconds to scroll, default is 250, min is 100
	 * @return {Object} {@link Deferred}
	 * @private
	 */
	scroll: function ( dest, ms ) {
		let defer = deferred();
		let start = client.scrollPos();
		let t = 0;

		ms = ( !isNaN( ms ) ? ms : 250 ) / 100;

		utility.repeat( function () {
			let pos = math.bezier( start[ 0 ], start[ 1 ], dest[ 0 ], dest[ 1 ], ++t / 100 );

			window.scrollTo( pos[ 0 ], pos[ 1 ] );

			if ( t === 100 ) {
				defer.resolve( true );
				return false;
			}
		}, ms, "scrolling" );

		return defer;
	},

	/**
	 * Returns the current scroll position of the View
	 *
	 * @method scrollPos
	 * @memberOf client
	 * @return {Array} Describes the scroll position
	 * @private
	 */
	scrollPos: function () {
		return [
			window.scrollX || 0,
			window.scrollY || 0
		];
	}
};

/**
 * @namespace csv
 */
let csv = {
	/**
	 * Converts CSV to an Array of Objects
	 *
	 * @method decode
	 * @memberOf csv
	 * @param  {String} arg       CSV string
	 * @param  {String} delimiter [Optional] Delimiter to split columns on, default is ","
	 * @return {Array}            Array of Objects
	 */
	decode: function ( arg, delimiter="," ) {
		let regex = new RegExp( delimiter + "(?=(?:[^\"]|\"(?:[^\"])[^\"]*\")*$)" );
		let rows = string.trim( arg ).split( "\n" );
		let keys = rows.shift().split( delimiter );
		let result;

		result = rows.map( function ( r ) {
			let obj = {};
			let row = r.split( regex );

			array.each( keys, function ( i, idx ) {
				obj[ i ] = utility.coerce( ( row[ idx ] || "" ).replace( /^"|"$/g, "" ) );
			} );

			return obj;
		} );

		return result;
	},

	/**
	 * Encodes an Array, JSON, or Object as CSV
	 *
	 * @method encode
	 * @memberOf csv
	 * @param  {Mixed}   arg       JSON, Array or Object
	 * @param  {String}  delimiter [Optional] Character to separate fields
	 * @param  {Boolean} header    [Optional] `false` to disable keys names as first row
	 * @return {String}            CSV string
	 * @example
	 * let csv = keigai.util.csv.encode( [{prop:"value"}, {prop:"value2"}] );
	 *
	 * console.log( csv );
	 * "prop
	 *  value
	 *  value2"
	 */
	encode: function ( arg, delimiter=",", header=true ) {
		let obj = json.decode( arg, true ) || arg;
		let result = "";

		// Prepares input based on CSV rules
		let prepare = ( input ) => {
			let output;

			if ( input instanceof Array ) {
				output = "\"" + input.toString() + "\"";

				if ( regex.object_type.test( output ) ) {
					output = "\"" + csv.encode( input, delimiter ) + "\"";
				}
			} else if ( input instanceof Object ) {
				output = "\"" + csv.encode( input, delimiter ) + "\"";
			} else if ( regex.csv_quote.test( input ) ) {
				output = "\"" + input.replace( /"/g, "\"\"" ) + "\"";
			} else {
				output = input;
			}

			return output;
		};

		if ( obj instanceof Array ) {
			if ( obj[ 0 ] instanceof Object ) {
				if ( header ) {
					result = ( array.keys( obj[ 0 ] ).join( delimiter ) + "\n" );
				}

				result += obj.map( function ( i ) {
					return csv.encode( i, delimiter, false );
				} ).join( "\n" );
			} else {
				result += ( prepare( obj, delimiter ) + "\n" );
			}

		} else {
			if ( header ) {
				result = ( array.keys( obj ).join( delimiter ) + "\n" );
			}

			result += ( array.cast( obj ).map( prepare ).join( delimiter ) + "\n" );
		}

		return result.replace( regex.eol_nl, "" );
	}
};

class DataListFilter extends Base {
	/**
	 * Creates a new DataListFilter
	 *
	 * @constructor
	 * @memberOf keigai
	 * @extends {keigai.Base}
	 * @param  {Object} element  Element to receive the filter
	 * @param  {Object} list     {@link keigai.DataList}
	 * @param  {Number} debounce [Optional] Milliseconds to debounce
	 * @example
	 * let store  = keigai.store( [...] ),
	 *     list   = keigai.list( document.querySelector( "#list" ), store, "{{field}}" ),
	 *     filter = keigai.filter( document.querySelector( "input.filter" ), list, "field" );
	 */
	constructor ( element, list, debounce ) {
		super();

		this.debounce = debounce;
		this.element = element;
		this.filters = {};
		this.list = list;
		this.observer = observable();
	}

	/**
	 * Set the filters
	 *
	 * Create an object based on comma separated key string
	 *
	 * @method set
	 * @memberOf keigai.DataListFilter
	 * @param  {String} fields Comma separated filters
	 * @return {Object} {@link keigai.DataListFilter}
	 * @example
	 * filter.set( "firstName, lastName, email" );
	 */
	set ( fields ) {
		this.filters = {};
		array.each( string.explode( fields ), ( v ) => {
			this.filters[ v ] = "";
		} );

		return this;
	}

	/**
	 * Removes listeners, and DOM hooks to avoid memory leaks
	 *
	 * @method teardown
	 * @memberOf keigai.DataListFilter
	 * @return {Object} {@link keigai.DataListFilter}
	 * @example
	 * filter.teardown();
	 */
	teardown () {
		this.observer.unhook( this.element, "keyup" );
		this.observer.unhook( this.element, "input" );
		this.element = null;

		return this;
	}

	/**
	 * Applies the input value as a filter against the DataList based on specific fields
	 *
	 * @method update
	 * @memberOf keigai.DataListFilter
	 * @fires keigai.DataList#beforeFilter Fires before filter
	 * @fires keigai.DataList#afterFilter Fires after filter
	 * @return {Object} {@link keigai.DataListFilter}
	 * @example
	 * filter.update(); // Debounced execution
	 */
	update () {
		utility.defer( () => {
			let val = element.val( this.element ).toString();

			this.list.dispatch( "beforeFilter", this.element, val );

			if ( !string.isEmpty( val ) ) {
				utility.iterate( this.filters, ( v, k ) => {
					let queries = string.explode( val );

					// Ignoring trailing commas
					queries = queries.filter( function ( i ) {
						return !string.isEmpty( i );
					} );

					// Shaping valid pattern
					array.each( queries, ( i, idx ) => {
						queries[ idx ] = "^.*" + string.escape( i ).replace( /(^\*|\*$)/g, "" ).replace( /\*/g, ".*" ) + ".*";
					} );

					this.filters[ k ] = queries.join( "," );
				} );

				this.list.filter = this.filters;
			} else {
				this.list.filter = null;
			}

			this.list.pageIndex = 1;
			this.list.refresh();
			this.list.dispatch( "afterFilter", this.element );
		}, this.debounce, this.element.id + "Debounce" );

		return this;
	}
}

/**
 * DataListFilter factory
 *
 * @method factory
 * @memberOf filter
 * @param  {Object} target   Element to receive the filter
 * @param  {Object} list     {@link keigai.DataList}
 * @param  {String} filters  Comma delimited string of fields to filter by
 * @param  {Number} debounce [Optional] Milliseconds to debounce, default is `250`
 * @return {Object} {@link keigai.DataListFilter}
 * @example
 * let store  = keigai.store( [...] ),
 *     list   = keigai.list( document.querySelector( "#list" ), store, "{{field}}" ),
 *     filter = keigai.filter( document.querySelector( "input.filter" ), list, "field" );
 */
let filter = function ( target, list, filters, debounce=250 ) {
	let ref = [ list ];
	let obj = new DataListFilter( target, ref[ 0 ], debounce ).set( filters );

	// Decorating `target` with the appropriate input `type`
	element.attr( target, "type", "text" );

	// Setting up a chain of Events
	obj.observer.hook( obj.element, "keyup" );
	obj.observer.hook( obj.element, "input" );
	obj.on( "keyup", obj.update, "keyup" );
	obj.on( "input", obj.update, "input" );

	return obj;
};

class DataGrid extends Base {
	/**
	 * Creates a new DataGrid
	 *
	 * @constructor
	 * @memberOf keigai
	 * @extends {keigai.Base}
	 * @param  {Object}  target   Element to receive DataGrid
	 * @param  {Object}  store    DataStore
	 * @param  {Array}   fields   Array of fields to display
	 * @param  {Array}   sortable [Optional] Array of sortable columns/fields
	 * @param  {Object}  options  [Optional] DataList options
	 * @param  {Boolean} filtered [Optional] Create an input to filter the DataGrid
	 * @example
	 * let fields  = ["name", "age"],
	 *     options = {pageSize: 5, order: "age desc, name"},
	 *     store   = keigai.store( [...] ),
	 *     grid    = keigai.grid( document.querySelector( "#grid" ), store, fields, fields, options, true );
	 */
	constructor ( target, store, fields, sortable=[], options={}, filtered=false ) {
		super();

		let sortOrder;

		if ( options.order && !string.isEmpty( options.order ) ) {
			sortOrder = string.explode( options.order ).map( function ( i ) {
				return i.replace( regex.after_space, "" );
			} );
		}

		this.element = element.create( "section", { "class": "grid" }, target );
		this.fields = fields;
		this.filtered = filtered;
		this.list = null;
		this.observer = observable();
		this.options = options;
		this.store = store;
		this.sortable = sortable;
		this.sortOrder = sortOrder || sortable;
	}

	/**
	 * Adds an item to the DataGrid
	 *
	 * @method add
	 * @memberOf keigai.DataGrid
	 * @param {Object} record New DataStore record (shapes should match)
	 * @return {Object}       {@link keigai.DataGrid}
	 * @example
	 * grid.add( {name: "John Doe", age: 34} );
	 */
	add ( record ) {
		this.store.set( null, record ).then( null, ( e ) => {
			utility.error( e );
			this.dispatch( "error", e );
		} );

		return this;
	}

	/**
	 * Exports data grid records
	 *
	 * @method dump
	 * @memberOf keigai.DataGrid
	 * @return {Array} Record set
	 * @example
	 * let data = grid.dump();
	 */
	dump () {
		return this.store.dump( this.list.records, this.fields );
	}

	/**
	 * Refreshes the DataGrid
	 *
	 * @method refresh
	 * @memberOf keigai.DataGrid
	 * @fires keigai.DataGrid#beforeRefresh Fires before refresh
	 * @fires keigai.DataGrid#afterRefresh Fires after refresh
	 * @return {Object} {@link keigai.DataGrid}
	 * @example
	 * grid.refresh();
	 */
	refresh () {
		let sort = [];
		this.dispatch( "beforeRefresh", this.element );

		if ( this.sortOrder.length > 0 ) {
			array.each( this.sortOrder, ( i ) => {
				let obj = element.find( this.element, ".header span[data-field='" + i + "']" )[ 0 ];

				sort.push( string.trim( i + " " + ( element.data( obj, "sort" ) || "" ) ) );
			} );

			this.options.order = this.list.order = sort.join( ", " );
		}

		this.list.where = null;
		utility.merge( this.list, this.options );
		this.list.refresh();
		this.dispatch( "afterRefresh", this.element );

		return this;
	}

	/**
	 * Removes an item from the DataGrid
	 *
	 * @method remove
	 * @memberOf keigai.DataGrid
	 * @param {Mixed} record Record, key or index
	 * @return {Object} {@link keigai.DataGrid}
	 * @example
	 * grid.remove( "key" );
	 */
	remove ( record ) {
		this.store.del( record ).then( null, ( e ) => {
			utility.error( e );
			this.dispatch( "error", e );
		} );

		return this;
	}

	/**
	 * Sorts the DataGrid when a column header is clicked
	 *
	 * @method sort
	 * @memberOf keigai.DataGrid
	 * @param  {Object} ev Event
	 * @return {Object} {@link keigai.DataGrid}
	 */
	sort ( ev ) {
		let target = utility.target( ev );
		let field;

		// Stopping event propogation
		utility.stop( ev );

		// Refreshing list if target is sortable
		if ( element.hasClass( target, "sortable" ) ) {
			field = element.data( target, "field" );
			element.data( target, "sort", element.data( target, "sort" ) === "asc" ? "desc" : "asc" );
			array.remove( this.sortOrder, field );
			this.sortOrder.splice( 0, 0, field );
			this.refresh();
		}

		return this;
	}

	/**
	 * Tears down the DataGrid
	 *
	 * @method teardown
	 * @memberOf keigai.DataGrid
	 * @return {Object} {@link keigai.DataGrid}
	 * @example
	 * grid.teardown();
	 */
	teardown () {
		this.observer.unhook( element.find( this.element, "ul.header" )[ 0 ], "click" );
		this.list.teardown();
		element.destroy( this.element );
		this.element = null;

		return this;
	}

	/**
	 * Updates an item in the DataGrid
	 *
	 * @method update
	 * @memberOf keigai.DataGrid
	 * @param {Mixed}  key  Key or index
	 * @param {Object} data New property values
	 * @return {Object}     {@link keigai.DataGrid}
	 * @example
	 * grid.update( "key", {name: "Jim Smith"} );
	 */
	update ( key, data ) {
		this.store.update( key, data ).then( null, ( e ) => {
			utility.error( e );
			this.dispatch( "error", e );
		} );

		return this;
	};
}

/**
 * DataGrid factory
 *
 * @method factory
 * @memberOf grid
 * @fires keigai.DataGrid#change Fires when the DOM changes
 * @param  {Object}  target      Element to receive DataGrid
 * @param  {Object}  store       DataStore
 * @param  {Array}   fields      Array of fields to display
 * @param  {Array}   sortable    [Optional] Array of sortable columns/fields
 * @param  {Object}  options     [Optional] DataList options
 * @param  {Boolean} filtered    [Optional] Create an input to filter the data grid
 * @param  {Number}  debounce    [Optional] DataListFilter input debounce, default is 250
 * @return {Object} {@link keigai.DataGrid}
 * @example
 * let fields  = ["name", "age"],
 *     options = {pageSize: 5, order: "age desc, name"},
 *     store   = keigai.store(),
 *     grid    = keigai.grid( document.querySelector( "#grid" ), store, fields, fields, options, true );
 *
 * store.setUri( "data.json" ).then( null, function ( e ) {
 *   ...
 * } );
 */
let grid = function ( target, store, fields, sortable, options, filtered, debounce=250 ) {
	let ref = [ store ];
	let obj = new DataGrid( target, ref[ 0 ], fields, sortable, options, filtered );
	let template = "";
	let header = element.create( "li", {}, element.create( "ul", { "class": "header" }, obj.element ) );
	let width = ( 100 / obj.fields.length ) + "%";
	let css = "display:inline-block;width:" + width;
	let sort = obj.options.order ? string.explode( obj.options.order ) : [];

	// Creating DataList template based on fields
	array.each( obj.fields, function ( i ) {
		let trimmed = i.replace( /.*\./g, "" );
		let el = element.create( "span", {
			innerHTML: string.capitalize( string.unCamelCase( string.unhyphenate( trimmed, true ) ).replace( /_|-/g, " " ), true ),
			style: css,
			"data-field": i
		}, header );

		// Adding CSS class if "column" is sortable
		if ( array.contains( obj.sortable, i ) ) {
			element.addClass( el, "sortable" );

			// Applying default sort, if specified
			if ( sort.filter( function ( x ) { return ( x.indexOf( i ) === 0 ); } ).length > 0 ) {
				element.data( el, "sort", array.contains( sort, i + " desc" ) ? "desc" : "asc" );
			}
		}

		template += "<span class=\"" + i + "\" data-field=\"" + i + "\" style=\"" + css + "\">{{" + i + "}}</span>";
	} );

	// Setting click handler on sortable "columns"
	if ( obj.sortable.length > 0 ) {
		obj.observer.hook( header.parentNode, "click", obj.sort, "sort", obj );
	}

	if ( obj.filtered === true ) {
		obj.options.listFiltered = true;
		obj.options.listFilter = obj.fields.join( "," );
	}

	obj.options.debounce = debounce;

	// Creating DataList
	ref.push( list.factory( obj.element, ref[ 0 ], template, obj.options ) );

	// Setting by-reference DataList on DataGrid
	obj.list = ref[ 1 ];

	// Setting up a chain of Events
	obj.on( "beforeRefresh", function ( arg ) {
		element.dispatch( arg, "beforeRefresh" );
	}, "bubble" );

	obj.on( "afterRefresh", function ( arg ) {
		element.dispatch( arg, "afterRefresh" );
	}, "bubble" );

	obj.on( "click", function ( e ) {
		if ( element.hasClass( e.currentTarget, "header" ) ) {
			obj.sort( e );
		}
	}, "header" );

	obj.list.on( "change", function ( ...args ) {
		obj.dispatch.apply( obj, [ "change" ].concat( args ) );
	}, "change" );

	obj.list.on( "beforeFilter", function ( ...args ) {
		obj.dispatch.apply( obj, [ "beforeFilter" ].concat( args ) );
	}, "beforeFilter" );

	obj.list.on( "afterFilter", function ( ...args ) {
		obj.dispatch.apply( obj, [ "afterFilter" ].concat( args ) );
	}, "afterFilter" );

	return obj;
};

class DataList extends Base {
	/**
	 * Creates a new DataList
	 *
	 * @constructor
	 * @memberOf keigai
	 * @extends {keigai.Base}
	 * @example
	 * let store = keigai.store( [...] ),
	 *     list  = keigai.list( document.querySelector("#list"), store, "{{name}}", {order: "name"} );
	 */
	constructor ( element, store, template ) {
		super();

		this.callback = null;
		this.current = [];
		this.element = element;
		this.emptyMsg = label.noData;
		this.filter = null;
		this.filtered = [];
		this.id = utility.genId();
		this.items = [];
		this.listFilter = null;
		this.mutation = null;
		this.observer = observable();
		this.pageIndex = 1;
		this.pageSize = null;
		this.pageRange = 5;
		this.pagination = "bottom"; // "top" or "bottom|top" are also valid
		this.placeholder = "";
		this.order = "";
		this.records = [];
		this.template = template;
		this.total = 0;
		this.store = store;
		this.where = null;
	}

	/**
	 * Adds an item to the DataList
	 *
	 * @method add
	 * @memberOf keigai.DataList
	 * @param {Object} record New DataStore record (shapes should match)
	 * @return {Object}       {@link keigai.DataList}
	 * @example
	 * list.add( {name: "John Doe", age: 34} );
	 */
	add ( record ) {
		this.store.set( null, record ).then( null, ( e ) => {
			utility.error( e );
			this.dispatch( "error", e );
		} );

		return this;
	}

	/**
	 * Exports data list records
	 *
	 * @method dump
	 * @memberOf keigai.DataList
	 * @return {Array} Record set
	 * @example
	 * let data = list.dump();
	 */
	dump () {
		return this.store.dump( this.records );
	}

	/**
	 * Changes the page index of the DataList
	 *
	 * @method page
	 * @memberOf keigai.DataList
	 * @param  {Number} n Page to view
	 * @return {Object}   {@link keigai.DataList}
	 * @example
	 * list.page( 2 );
	 */
	page ( n ) {
		this.pageIndex = n;

		return this.refresh();
	}

	/**
	 * Adds pagination Elements to the View, executed from `DataList.refresh()`
	 *
	 * @method pages
	 * @memberOf keigai.DataList
	 * @return {Object} {@link keigai.DataList}
	 * @example
	 * list.pages();
	 */
	pages () {
		let obj = this.element;
		let page = this.pageIndex;
		let pos = this.pagination;
		let range = this.pageRange;
		let mid = Math.floor( range / 2 );
		let start = page - mid;
		let end = page + mid;
		let total = list.pages( this );
		let diff;

		// Removing the existing controls
		array.each( utility.dom( "#" + obj.id + "-pages-top, #" + obj.id + "-pages-bottom" ), ( i ) => {
			if ( i ) {
				this.observer.unhook( i, "click" );
				element.destroy( i );
			}
		} );

		// Halting because there's 1 page, or nothing
		if ( ( this.filter && this.filtered.length === 0 ) || this.total === 0 || total === 1 ) {
			return this;
		}

		// Getting the range to display
		if ( start < 1 ) {
			diff = number.diff( start, 1 );
			start = start + diff;
			end = end + diff;
		}

		if ( end > total ) {
			end = total;
			start = ( end - range ) + 1;

			if ( start < 1 ) {
				start = 1;
			}
		}

		if ( number.diff( start, end ) >= range ) {
			--end;
		}

		array.each( string.explode( pos ), ( i ) => {
			let current = false;
			let more = page > 1;
			let next = ( page + 1 ) <= total;
			let last = ( page >= total );
			let el, n;

			// Setting up the list
			el = element.create( "ul", {
				"class": "list pages hidden " + i,
				id: obj.id + "-pages-" + i
			}, obj, i === "bottom" ? "after" : "before" );

			// First page
			element.create( more ? "a" : "span", {
				"class": "first page",
				"data-page": 1,
				innerHTML: "&lt;&lt;"
			}, element.create( "li", {}, el ) );

			// Previous page
			element.create( more ? "a" : "span", {
				"class": "prev page",
				"data-page": ( page - 1 ),
				innerHTML: "&lt;"
			}, element.create( "li", {}, el ) );

			// Rendering the page range
			n = start - 1;
			while ( ++n <= end ) {
				current = ( n === page );
				element.create( current ? "span" : "a", {
					"class": current ? "current page" : "page",
					"data-page": n,
					innerHTML: n
				}, element.create( "li", {}, el ) );
			}

			// Next page
			element.create( next ? "a" : "span", {
				"class": "next page",
				"data-page": next ? ( page + 1 ) : null,
				innerHTML: "&gt;"
			}, element.create( "li", {}, el ) );

			// Last page
			element.create( last ? "span" : "a", {
				"class": "last page",
				"data-page": last ? null : total,
				innerHTML: "&gt;&gt;"
			}, element.create( "li", {}, el ) );

			// Adding to DOM
			element.removeClass( el, "hidden" );

			// Pagination listener
			this.observer.hook( el, "click" );
		} );

		return this;
	}

	/**
	 * Refreshes element
	 *
	 * @method refresh
	 * @memberOf keigai.DataList
	 * @extends {keigai.Base}
	 * @fires keigai.DataList#beforeRefresh Fires before refresh
	 * @fires keigai.DataList#afterRefresh Fires after refresh
	 * @fires keigai.DataList#error Fires on error
	 * @param  {Boolean} create [Optional] Recreates cached View of data
	 * @return {Object} {@link keigai.DataList}
	 * @example
	 * list.refresh();
	 */
	refresh ( create=false ) {
		let el = this.element;
		let template = ( typeof this.template === "object" );
		let filter = this.filter !== null;
		let items = [];
		let callback = ( typeof this.callback === "function" );
		let reg = new RegExp();
		let registry = []; // keeps track of records in the list ( for filtering )
		let range = [];
		let fn, ceiling, next;

		this.dispatch( "beforeRefresh", el );

		// Function to create templates for the html rep
		if ( !template ) {
			fn = ( i ) => {
				let html = this.template;
				let items = array.unique( html.match( /\{\{[\w\.\-\[\]]+\}\}/g ) );

				// Replacing record key
				html = html.replace( "{{" + this.store.key + "}}", i.key );

				// Replacing dot notation properties
				array.each( items, function ( attr ) {
					let key = attr.replace( /\{\{|\}\}/g, "" ),
						value = utility.walk( i.data, key );

					if ( value === undefined ) {
						value = "";
					}

					reg.compile( string.escape( attr ), "g" );
					html = html.replace( reg, value );
				} );

				// Filling in placeholder value
				html = html.replace( /\{\{.*\}\}/g, this.placeholder );

				return "<li data-key=\"" + i.key + "\">" + html + "</li>";
			};
		} else {
			fn = ( i ) => {
				let obj = json.encode( this.template );
				let items = array.unique( obj.match( /\{\{[\w\.\-\[\]]+\}\}/g ) );

				// Replacing record key
				obj = obj.replace( "{{" + this.store.key + "}}", i.key );

				// Replacing dot notation properties
				array.each( items, function ( attr ) {
					let key = attr.replace( /\{\{|\}\}/g, "" );
					let value = utility.walk( i.data, key ) || "";

					reg.compile( string.escape( attr ), "g" );

					// Stripping first and last " to concat to valid JSON
					obj = obj.replace( reg, json.encode( value ).replace( /(^")|("$)/g, "" ) );
				} );

				// Filling in placeholder value
				obj = json.decode( obj.replace( /\{\{.*\}\}/g, this.placeholder ) );

				return { li: obj };
			};
		}

		// Next phase
		next = ( args ) => {
			// Creating view of DataStore
			this.records = args;
			this.total = this.records.length;
			this.filtered = [];

			// Resetting 'view' specific arrays
			this.current = [];

			// Filtering records (if applicable)
			if ( filter ) {
				array.each( this.records, ( i ) => {
					utility.iterate( this.filter, ( v, k ) => {
						let key;

						if ( array.contains( registry, i.key ) ) {
							return false;
						}

						key = ( k === this.store.key );

						array.each( string.explode( v ), ( query ) => {
							let reg = new RegExp( query, "i" );
							let value = !key ? utility.walk( i.data, k ) : "";

							if ( ( key && reg.test( i.key ) ) || reg.test( value ) ) {
								registry.push( i.key );
								this.filtered.push( i );

								return false;
							}
						} );
					} );
				} );
			}

			// Pagination
			if ( this.pageSize !== null && !isNaN( this.pageIndex ) && !isNaN( this.pageSize ) ) {
				ceiling = list.pages( this );

				// Passed the end, so putting you on the end
				if ( ceiling > 0 && this.pageIndex > ceiling ) {
					return this.page( ceiling );
				}
				// Paginating the items
				else if ( this.total > 0 ) {
					range = list.range( this );
					this.current = array.limit( !filter ? this.records : this.filtered, range[ 0 ], range[ 1 ] );
				}
			} else {
				this.current = !filter ? this.records : this.filtered;
			}

			// Processing records & generating templates
			array.each( this.current, function ( i ) {
				let html = fn( i );
				let hash = btoa( html );

				items.push( { key: i.key, template: html, hash: hash } );
			} );

			// Updating element
			utility.render( () => {
				let destroy = [];
				let callbacks = [];
				let i, nth;

				if ( items.length === 0 ) {
					element.html( el, "<li class=\"empty\">" + this.emptyMsg + "</li>" );
				} else {
					if ( this.items.length === 0 ) {
						element.html( el, items.map( function ( i ) {
							return i.template;
						} ).join( "" ) );

						if ( callback ) {
							array.each( array.cast( el.childNodes ), ( i ) => {
								this.callback( i );
							} );
						}
					} else {
						array.each( items, ( i, idx ) => {
							if ( this.items[ idx ] !== undefined && this.items[ idx ].hash !== i.hash ) {
								element.data( element.html( el.childNodes[ idx ], i.template.replace( /<li data-key=\"\d+\">|<\/li>/g, "" ) ), "key", i.key );
								callbacks.push( idx );
							} else if ( this.items[ idx ] === undefined ) {
								element.create( i.template, null, el );
								callbacks.push( idx );
							}
						} );

						if ( items.length < this.items.length ) {
							i = items.length - 1;
							nth = this.items.length;

							while ( ++i < nth ) {
								destroy.push( i );
							}

							array.each( destroy.reverse(), function ( i ) {
								element.destroy( el.childNodes[ i ] );
							} );
						}

						if ( callback ) {
							array.each( callbacks, ( i ) => {
								this.callback( el.childNodes[ i ] );
							} );
						}
					}
				}

				// Updating reference for next change
				this.items = items;

				// Rendering pagination elements
				if ( this.pageSize !== null && regex.top_bottom.test( this.pagination ) && !isNaN( this.pageIndex ) && !isNaN( this.pageSize ) ) {
					this.pages();
				} else {
					array.each( utility.$( "#" + el.id + "-pages-top, #" + el.id + "-pages-bottom" ), function ( i ) {
						element.destroy( i );
					} );
				}

				this.dispatch( "afterRefresh", el );
			} );
		};

		// Consuming records based on sort
		if ( this.where === null ) {
			string.isEmpty( this.order ) ? next( this.store.get() ) : this.store.sort( this.order, create ).then( next, ( e ) => {
				utility.error( e );
				this.dispatch( "error", e );
			} );
		} else if ( string.isEmpty( this.order ) ) {
			this.store.select( this.where ).then( next, ( e ) => {
				utility.error( e );
				this.dispatch( "error", e );
			} );
		} else {
			this.store.sort( this.order, create, this.where ).then( next, ( e ) => {
				utility.error( e );
				this.dispatch( "error", e );
			} );
		}

		return this;
	}

	/**
	 * Removes an item from the DataList
	 *
	 * @method remove
	 * @memberOf keigai.DataList
	 * @param {Mixed} record Record, key or index
	 * @return {Object} {@link keigai.DataList}
	 * @example
	 * // Adding a click handler to 'trash' Elements
	 * keigai.util.array.cast( document.querySelectorAll( ".list .trash" ) ).forEach( function ( i ) {
	 *   i.addEventListener( "click", ( ev ) => {
	 *     let key = keigai.util.element.data( keigai.util.target( ev ).parentNode, "key" );
	 *
	 *     list.remove( key );
	 *   }, false );
	 * } );
	 */
	remove ( record ) {
		this.store.del( record ).then( null, ( e ) => {
			utility.error( e );
			this.dispatch( "error", e );
		} );

		return this;
	}

	/**
	 * Sorts data list & refreshes element
	 *
	 * @method sort
	 * @memberOf keigai.DataList
	 * @param  {String} order SQL "ORDER BY" clause
	 * @return {Object} {@link keigai.DataList}
	 * @example
	 * list.sort( "age, name" );
	 */
	sort ( order ) {
		this.order = order;

		return this.refresh();
	}

	/**
	 * Tears down references to the DataList
	 *
	 * @method teardown
	 * @memberOf keigai.DataList
	 * @param  {Boolean} destroy [Optional] `true` will remove the DataList from the DOM
	 * @return {Object} {@link keigai.DataList}
	 * @example
	 * list.teardown();
	 */
	teardown ( destroy=false ) {
		let el = this.element;
		let id = el.id;

		array.each( this.store.lists, ( i, idx ) => {
			if ( i.id === this.id ) {
				array.remove( this.store.lists, idx );

				return false;
			}
		} );

		if ( this.listFilter ) {
			this.listFilter.teardown();
		}

		array.each( utility.$( "#" + id + "-pages-top, #" + id + "-pages-bottom" ), ( i ) => {
			this.observer.unhook( i, "click" );

			if ( destroy ) {
				element.destroy( i );
			}
		} );

		this.observer.unhook( el, "click" );

		if ( destroy ) {
			element.destroy( el );
		}

		this.element = null;

		return this;
	}

	/**
	 * Updates an item in the DataList
	 *
	 * @method update
	 * @memberOf keigai.DataList
	 * @param {Mixed}  key  Key or index
	 * @param {Object} data New property values
	 * @return {Object}     {@link keigai.DataList}
	 * @example
	 * list.update( "key", {name: "Jim Smith"} );
	 */
	update ( key, data ) {
		this.store.update( key, data ).then( null, ( e ) => {
			utility.error( e );
			this.dispatch( "error", e );
		} );

		return this;
	};
}

/**
 * @namespace list
 */
let list = {
	/**
	 * Creates an instance of DataList
	 *
	 * @method factory
	 * @memberOf list
	 * @fires keigai.DataList#change Fires when the DOM changes
	 * @param  {Object} target   Element to receive the DataList
	 * @param  {Object} store    {@link keigai.DataStore}
	 * @param  {Mixed}  template Record field, template ( $.tpl ), or String, e.g. "<p>this is a {{field}} sample.</p>", fields are marked with {{ }}
	 * @param  {Object} options  Optional parameters to set on the DataList
	 * @return {Object} {@link keigai.DataList}
	 * @example
	 * let store = keigai.store( [...] ),
	 *     list  = keigai.list( document.querySelector("#list"), store, "{{name}}", {order: "name"} );
	 */
	factory: function ( target, store, template, options ) {
		let ref = [ store ];
		let obj = new DataList( element.create( "ul", { "class": "list", id: utility.genId( null, true ) }, target ), ref[ 0 ], template );

		if ( options instanceof Object ) {
			if ( options.listFiltered && options.listFilter ) {
				obj.listFilter = filter( element.create( "input", {
					"id": obj.element.id + "-filter",
					"class": "filter",
					placeholder: "Filter"
				}, target, "first" ), obj, options.listFilter, options.debounce );
				delete options.listFilter;
				delete options.listFiltered;
				delete options.debounce;
			}

			utility.merge( obj, options );
		}

		obj.store.lists.push( obj );

		// Setting up a chain of Events
		obj.on( "beforeRefresh", function ( arg ) {
			element.dispatch( arg, "beforeRefresh" );
		}, "bubble" );

		obj.on( "afterRefresh", function ( arg ) {
			element.dispatch( arg, "afterRefresh" );
		}, "bubble" );

		obj.on( "change", function ( arg ) {
			element.dispatch( obj.element, "change", arg );
		}, "change" );

		obj.on( "click", function ( e ) {
			let target = utility.target( e );
			let page;

			utility.stop( e );

			if ( target.nodeName === "A" ) {
				page = element.data( target, "page" );

				if ( !isNaN( page ) ) {
					obj.page( page );
				}
			}
		}, "pagination" );

		if ( mutation ) {
			obj.mutation = new MutationObserver( function ( arg ) {
				obj.dispatch( "change", arg );
			} );

			obj.mutation.observe( obj.element, { childList: true, subtree: true } );
		}

		// Rendering if not tied to an API or data is ready
		if ( obj.store.uri === null || obj.store.loaded ) {
			obj.refresh();
		}

		return obj;
	},

	/**
	 * Calculates the total pages
	 *
	 * @method pages
	 * @memberOf list
	 * @return {Number} Total pages
	 * @private
	 */
	pages: function ( obj ) {
		if ( isNaN( obj.pageSize ) ) {
			throw new Error( label.invalidArguments );
		}

		return Math.ceil( ( !obj.filter ? obj.total : obj.filtered.length ) / obj.pageSize );
	},

	/**
	 * Calculates the page size as an Array of start & finish
	 *
	 * @method range
	 * @memberOf list
	 * @return {Array}  Array of start & end numbers
	 * @private
	 */
	range: function ( obj ) {
		let start = ( obj.pageIndex * obj.pageSize ) - obj.pageSize;
		let end = obj.pageSize;

		return [ start, end ];
	}
};

class Deferred {
	/**
	 * Creates a new Deferred
	 *
	 * @constructor
	 * @memberOf keigai
	 */
	constructor () {
		this.promise = promise.factory();
		this.onDone = [];
		this.onAlways = [];
		this.onFail = [];

		// Setting handlers to execute Arrays of Functions
		this.promise.then( ( arg ) => {
			array.each( this.onDone, function ( i ) {
				i( arg );
			} );

			array.each( this.onAlways, function ( i ) {
				i( arg );
			} );

			this.onAlways = [];
			this.onDone = [];
			this.onFail = [];
		}, ( arg ) => {
			array.each( this.onFail, function ( i ) {
				i( arg );
			} );

			array.each( this.onAlways, function ( i ) {
				i( arg );
			} );

			this.onAlways = [];
			this.onDone = [];
			this.onFail = [];
		} );
	}

	/**
	 * Registers a function to execute after Promise is reconciled
	 *
	 * @method always
	 * @memberOf keigai.Deferred
	 * @param  {Function} arg Function to execute
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * let deferred = keigai.util.defer();
	 *
	 * deferred.always( function () {
	 *     ...
	 * } ).then( function () {
	 *     ...
	 * } );
	 *
	 * ...
	 *
	 * deferred.resolve( true );
	 */
	always ( arg ) {
		this.onAlways.push( arg );

		return this;
	}

	/**
	 * Catches errors from the Promise
	 *
	 * @method  catch
	 * @memberOf keigai.Deferred
	 * @param  {Function} arg Function to execute
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * let deferred = keigai.util.defer();
	 *
	 * deferred.catch( function ( err ) {
	 *   ...
	 * } );
	 */
	catch ( arg ) {
		return this.promise.catch( arg );
	}

	/**
	 * Registers a function to execute after Promise is resolved
	 *
	 * @method done
	 * @memberOf keigai.Deferred
	 * @param  {Function} arg Function to execute
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * let deferred = keigai.util.defer();
	 *
	 * deferred.done( function ( ... ) {
	 *   ...
	 * } );
	 */
	done ( arg ) {
		this.onDone.push( arg );

		return this;
	}

	/**
	 * Registers a function to execute after Promise is rejected
	 *
	 * @method fail
	 * @memberOf keigai.Deferred
	 * @param  {Function} arg Function to execute
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * let deferred = keigai.util.defer();
	 *
	 * deferred.fail( function ( ... ) {
	 *   ...
	 * } );
	 */
	fail ( arg ) {
		this.onFail.push( arg );

		return this;
	}

	/**
	 * Rejects the Promise
	 *
	 * @method reject
	 * @memberOf keigai.Deferred
	 * @param  {Mixed} arg Rejection outcome
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * let deferred = keigai.util.defer();
	 *
	 * deferred.reject( new Error( "Something went wrong" ) );
	 */
	reject ( arg ) {
		this.promise.reject.call( this.promise, arg );

		return this;
	}

	/**
	 * Resolves the Promise
	 *
	 * @method resolve
	 * @memberOf keigai.Deferred
	 * @param  {Mixed} arg Resolution outcome
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * let deferred = keigai.util.defer();
	 *
	 * deferred.resolve( true );
	 */
	resolve ( arg ) {
		this.promise.resolve.call( this.promise, arg );

		return this;
	}

	/**
	 * Registers handler(s) for the Promise
	 *
	 * @method then
	 * @memberOf keigai.Deferred
	 * @param  {Function} success Executed when/if promise is resolved
	 * @param  {Function} failure [Optional] Executed when/if promise is broken
	 * @return {Object} {@link Promise}
	 * @example
	 * let deferred = keigai.util.defer();
	 *
	 * deferred.then( function ( ... ) { ... }, function ( err ) { ... } )
	 *         .then( function ( ... ) { ... }, function ( err ) { ... } );
	 *
	 * ...
	 *
	 * deferred.resolve( true );
	 */
	then ( success, failure ) {
		return this.promise.then( success, failure );
	}
}

/**
 * Deferred factory
 *
 * @method factory
 * @memberOf deferred
 * @return {Object} {@link keigai.Deferred}
 * @example
 * let deferred = keigai.util.defer();
 *
 * deferred.then( function ( ... ) { ... }, function ( err ) { ... } )
 * deferred.always( function ( ... ) { ... } );
 *
 * ...
 *
 * deferred.resolve( true );
 */
let deferred = function () {
	return new Deferred();
};

/**
 * @namespace element
 */
let element = {
	/**
	 * Adds a CSS class to an Element
	 *
	 * @method addClass
	 * @memberOf element
	 * @param  {Object} obj Element
	 * @param  {String} arg CSS class
	 * @return {Object}     Element
	 * @example
	 * keigai.util.element.addClass( document.querySelector( "#target" ), "newClass" );
	 */
	addClass: function ( obj, arg ) {
		element.klass( obj, arg, true );
	},

	/**
	 * Appends an Element to an Element
	 *
	 * @method appendTo
	 * @memberOf element
	 * @param  {Object} obj   Element
	 * @param  {Object} child Child Element
	 * @return {Object}       Element
	 * @example
	 * keigai.util.element.appendTo( document.querySelector( "#target" ), document.querySelector( "#something" ) );
	 */
	appendTo: function ( obj, child ) {
		obj.appendChild( child );

		return obj;
	},

	/**
	 * Gets or sets an Element attribute
	 *
	 * @method attr
	 * @memberOf element
	 * @param  {Object} obj   Element
	 * @param  {String} key   Attribute name
	 * @param  {Mixed}  value Attribute value
	 * @return {Object}       Element
	 * @example
	 * keigai.util.element.attr( document.querySelector( "select" ), "selected", "option 1" );
	 */
	attr: function ( obj, key, value ) {
		let target, result;

		if ( regex.svg.test( obj.namespaceURI ) ) {
			if ( value === undefined ) {
				result = obj.getAttributeNS( obj.namespaceURI, key );

				if ( result === null || string.isEmpty( result ) ) {
					result = undefined;
				} else {
					result = utility.coerce( result );
				}

				return result;
			} else {
				obj.setAttributeNS( obj.namespaceURI, key, value );
			}
		} else {
			if ( typeof value === "string" ) {
				value = string.trim( value );
			}

			if ( regex.checked_disabled.test( key ) && value === undefined ) {
				return utility.coerce( obj[ key ] );
			} else if ( regex.checked_disabled.test( key ) && value !== undefined ) {
				obj[ key ] = value;
			} else if ( obj.nodeName === "SELECT" && key === "selected" && value === undefined ) {
				return utility.dom( "#" + obj.id + " option[selected=\"selected\"]" )[ 0 ] || utility.dom( "#" + obj.id + " option" )[ 0 ];
			} else if ( obj.nodeName === "SELECT" && key === "selected" && value !== undefined ) {
				target = utility.dom( "#" + obj.id + " option[selected=\"selected\"]" )[ 0 ];

				if ( target !== undefined ) {
					target.selected = false;
					target.removeAttribute( "selected" );
				}

				target = utility.dom( "#" + obj.id + " option[value=\"" + value + "\"]" )[ 0 ];
				target.selected = true;
				target.setAttribute( "selected", "selected" );
			} else if ( value === undefined ) {
				result = obj.getAttribute( key );

				if ( result === null || string.isEmpty( result ) ) {
					result = undefined;
				} else {
					result = utility.coerce( result );
				}

				return result;
			} else {
				obj.setAttribute( key, value );
			}
		}

		return obj;
	},

	/**
	 * Clears an object's innerHTML, or resets it's state
	 *
	 * @method clear
	 * @memberOf element
	 * @param  {Object} obj Element
	 * @return {Object}     Element
	 * @example
	 * keigai.util.element.clear( document.querySelector( "#something" ) );
	 */
	clear: function ( obj ) {
		if ( typeof obj.reset === "function" ) {
			obj.reset();
		} else if ( obj.value !== undefined ) {
			element.update( obj, { innerHTML: "", value: "" } );
		} else {
			element.update( obj, { innerHTML: "" } );
		}

		return obj;
	},

	/**
	 * Creates an Element in document.body or a target Element.
	 * An id is generated if not specified with args.
	 *
	 * @method create
	 * @memberOf element
	 * @param  {String} type Type of Element to create, or HTML String
	 * @param  {Object} args [Optional] Properties to set
	 * @param  {Object} obj  [Optional] Target Element
	 * @param  {Mixed}  pos  [Optional] "first", "last" or Object describing how to add the new Element, e.g. {before: referenceElement}, default is "last"
	 * @return {Mixed}       Element that was created, or an Array if `type` is a String of multiple Elements (frag)
	 * @example
	 * keigai.util.element.create( "div", {innerHTML: "Hello World!"}, document.querySelector( "#something" ) );
	 * keigai.util.element.create( "&lt;div&gt;Hello World!&lt;/div&gt;" );
	 */
	create: function ( type, args, obj, pos ) {
		let svg = false;
		let frag = false;
		let fragment, result;

		// Removing potential HTML template formatting
		type = type.replace( /\t|\n|\r/g, "" );

		if ( obj ) {
			svg = obj.namespaceURI && regex.svg.test( obj.namespaceURI );
		} else {
			obj = document.body;
		}

		// String injection, create a frag and apply it
		if ( regex.html.test( type ) ) {
			frag = true;
			fragment = element.frag( type );
			result = fragment.childNodes.length === 1 ? fragment.childNodes[ 0 ] : array.cast( fragment.childNodes );
		}
		// Original syntax
		else {
			if ( !svg && !regex.svg.test( type ) ) {
				fragment = document.createElement( type );
			} else {
				fragment = document.createElementNS( "http://www.w3.org/2000/svg", type );
			}

			if ( args instanceof Object ) {
				element.update( fragment, args );
			}
		}

		if ( !pos || pos === "last" ) {
			obj.appendChild( fragment );
		} else if ( pos === "first" ) {
			element.prependChild( obj, fragment );
		} else if ( pos === "after" ) {
			pos = { after: obj };
			obj = obj.parentNode;
			obj.insertBefore( fragment, pos.after.nextSibling );
		} else if ( pos.after ) {
			obj.insertBefore( fragment, pos.after.nextSibling );
		} else if ( pos === "before" ) {
			pos = { before: obj };
			obj = obj.parentNode;
			obj.insertBefore( fragment, pos.before );
		} else if ( pos.before ) {
			obj.insertBefore( fragment, pos.before );
		} else {
			obj.appendChild( fragment );
		}

		return !frag ? fragment : result;
	},

	/**
	 * Gets or sets a CSS style attribute on an Element
	 *
	 * @method css
	 * @memberOf element
	 * @param  {Object} obj   Element
	 * @param  {String} key   CSS to put in a style tag
	 * @param  {String} value [Optional] Value to set
	 * @return {Object}       Element
	 * @example
	 * keigai.util.element.css( document.querySelector( "#something" ), "font-weight", "bold" );
	 * keigai.util.element.css( document.querySelector( "#something" ), "font-weight" ); // "bold"
	 */
	css: function ( obj, key, value ) {
		if ( !regex.caps.test( key ) ) {
			key = string.toCamelCase( key );
		}

		if ( value !== undefined ) {
			obj.style[ key ] = value;
			return obj;
		} else {
			return obj.style[ key ];
		}
	},

	/**
	 * Data attribute facade acting as a getter (with coercion) & setter
	 *
	 * @method data
	 * @memberOf element
	 * @param  {Object} obj   Element
	 * @param  {String} key   Data key
	 * @param  {Mixed}  value Boolean, Number or String to set
	 * @return {Mixed}        undefined, Element or value
	 * @example
	 * // Setting
	 * keigai.util.element.data( document.querySelector( "#something" ), "id", "abc-1234" );
	 *
	 * // Getting
	 * keigai.util.element.data( document.querySelector( "#something" ), "id" ); // "abc-1234"
	 *
	 * // Unsetting
	 * keigai.util.element.data( document.querySelector( "#something" ), "id", null );
	 *
	 * // Setting a `null` value can be done by using a String
	 * keigai.util.element.data( document.querySelector( "#something" ), "id", "null" );
	 */
	data: function ( obj, key, value ) {
		if ( value !== undefined ) {
			obj.setAttribute( "data-" + key, regex.json_wrap.test( value ) ? json.encode( value ) : value );

			return obj;
		} else {
			return utility.coerce( obj.getAttribute( "data-" + key ) );
		}
	},

	/**
	 * Destroys an Element
	 *
	 * @method destroy
	 * @memberOf element
	 * @param  {Object} obj Element
	 * @return {Undefined} undefined
	 * @example
	 * keigai.util.element.destroy( document.querySelector( "#something" ) );
	 */
	destroy: function ( obj ) {
		if ( obj.parentNode !== null ) {
			obj.parentNode.removeChild( obj );
		}

		return undefined;
	},

	/**
	 * Disables an Element
	 *
	 * @method disable
	 * @memberOf element
	 * @param  {Object} obj Element
	 * @return {Object}     Element
	 * @example
	 * keigai.util.element.disable( document.querySelector( "#something" ) );
	 */
	disable: function ( obj ) {
		if ( typeof obj.disabled === "boolean" && !obj.disabled ) {
			obj.disabled = true;
		}

		return obj;
	},

	/**
	 * Dispatches a DOM Event from an Element
	 *
	 * `data` will appear as `Event.detail`
	 *
	 * @method dispatch
	 * @memberOf element
	 * @param  {Object}  obj        Element which dispatches the Event
	 * @param  {String}  type       Type of Event to dispatch
	 * @param  {Object}  data       [Optional] Data to include with the Event
	 * @param  {Boolean} bubbles    [Optional] Determines if the Event bubbles, defaults to `true`
	 * @param  {Boolean} cancelable [Optional] Determines if the Event can be canceled, defaults to `true`
	 * @return {Object}             Element which dispatches the Event
	 * @example
	 * keigai.util.element.dispatch( document.querySelector( "#something" ), "click" );
	 */
	dispatch: function ( obj, type, data={}, bubbles=true, cancelable=true ) {
		let ev;

		if ( !obj ) {
			return;
		}

		try {
			ev = new CustomEvent( type );
		}
		catch ( e ) {
			ev = document.createEvent( "CustomEvent" );
		}

		ev.initCustomEvent( type, bubbles, cancelable, data );
		obj.dispatchEvent( ev );

		return obj;
	},

	/**
	 * Enables an Element
	 *
	 * @method enable
	 * @memberOf element
	 * @param  {Object} obj Element
	 * @return {Object}     Element
	 * @example
	 * keigai.util.element.enable( document.querySelector( "#something" ) );
	 */
	enable: function ( obj ) {
		if ( typeof obj.disabled === "boolean" && obj.disabled ) {
			obj.disabled = false;
		}

		return obj;
	},

	/**
	 * Finds descendant childNodes of Element matched by arg
	 *
	 * @method find
	 * @memberOf element
	 * @param  {Object} obj Element to search
	 * @param  {String} arg Comma delimited string of descendant selectors
	 * @return {Mixed}      Array of Elements or undefined
	 * @example
	 * keigai.util.element.find( document.querySelector( "#something" ), "p" );
	 */
	find: function ( obj, arg ) {
		let result = [];

		array.each( string.explode( arg ), function ( i ) {
			result = result.concat( array.cast( obj.querySelectorAll( i ) ) );
		} );

		return result;
	},

	/**
	 * Creates a document fragment
	 *
	 * @method frag
	 * @memberOf element
	 * @param  {String} arg [Optional] innerHTML
	 * @return {Object}     Document fragment
	 * @example
	 * let frag = keigai.util.element.frag( "Hello World!" );
	 */
	frag: function ( arg ) {
		let obj = document.createDocumentFragment();

		if ( arg ) {
			array.each( array.cast( element.create( "div", { innerHTML: arg }, obj ).childNodes ), function ( i ) {
				obj.appendChild( i );
			} );

			obj.removeChild( obj.childNodes[ 0 ] );
		}

		return obj;
	},

	/**
	 * Determines if Element has descendants matching arg
	 *
	 * @method has
	 * @memberOf element
	 * @param  {Object} obj Element
	 * @param  {String} arg Type of Element to find
	 * @return {Boolean}    `true` if 1 or more Elements are found
	 * @example
	 * if ( keigai.util.element.has( document.querySelector( "#something" ), "p" ) ) {
	 *   ...
	 * }
	 */
	has: function ( obj, arg ) {
		let result = element.find( obj, arg );

		return ( !isNaN( result.length ) && result.length > 0 );
	},

	/**
	 * Determines if obj has a specific CSS class
	 *
	 * @method hasClass
	 * @memberOf element
	 * @param  {Object} obj Element
	 * @param  {String} arg CSS class to test for
	 * @return {Boolean}    `true` if Element has `arg`
	 * @example
	 * if ( keigai.util.element.hasClass( document.querySelector( "#something" ), "someClass" ) ) {
	 *   ...
	 * }
	 */
	hasClass: function ( obj, arg ) {
		return obj.classList.contains( arg );
	},

	/**
	 * Returns a Boolean indidcating if the Object is hidden
	 *
	 * @method hidden
	 * @memberOf element
	 * @param  {Object} obj Element
	 * @return {Boolean}   `true` if hidden
	 * @example
	 * if ( keigai.util.element.hidden( document.querySelector( "#something" ) ) ) {
	 *   ...
	 * }
	 */
	hidden: function ( obj ) {
		return obj.style.display === "none" || obj.hidden === true;
	},

	/**
	 * Gets or sets an Elements innerHTML
	 *
	 * @method html
	 * @memberOf element
	 * @param  {Object} obj Element
	 * @param  {String} arg [Optional] innerHTML value
	 * @return {Object}     Element
	 * @example
	 * keigai.util.element.html( document.querySelector( "#something" ), "Hello World!" );
	 * keigai.util.element.html( document.querySelector( "#something" ) ); // "Hello World!"
	 */
	html: function ( obj, arg ) {
		if ( arg === undefined ) {
			return obj.innerHTML;
		} else {
			obj.innerHTML = arg;
			return obj;
		}
	},

	/**
	 * Determines if Element is equal to `arg`, supports nodeNames & CSS2+ selectors
	 *
	 * @method is
	 * @memberOf element
	 * @param  {Object} obj Element
	 * @param  {String} arg Property to query
	 * @return {Boolean}    `true` if a match
	 * @example
	 * if ( keigai.util.element.is( document.querySelector( "#something" ), "div" ) ) {
	 *   ...
	 * }
	 *
	 * if ( keigai.util.element.is( document.querySelector( "#something" ), ":first-child" ) ) {
	 *   ...
	 * }
	 */
	is: function ( obj, arg ) {
		if ( regex.selector_is.test( arg ) ) {
			return ( element.find( obj.parentNode, obj.nodeName.toLowerCase() + arg ).filter( function ( i ) {
				return i.id === obj.id;
			} ).length === 1 );
		} else {
			return new RegExp( arg, "i" ).test( obj.nodeName );
		}
	},

	/**
	 * Adds or removes a CSS class
	 *
	 * @method klass
	 * @memberOf element
	 * @param  {Object}  obj Element
	 * @param  {String}  arg Class to add or remove ( can be a wildcard )
	 * @param  {Boolean} add Boolean to add or remove, defaults to true
	 * @return {Object}      Element
	 * @example
	 * // Adding a class
	 * keigai.util.element.klass( document.querySelector( "#something" ), "newClass" );
	 *
	 * // Removing a class
	 * keigai.util.element.klass( document.querySelector( "#something" ), "newClass", false );
	 */
	klass: function ( obj, arg, add=true ) {
		arg = string.explode( arg, " " );

		if ( add ) {
			array.each( arg, function ( i ) {
				obj.classList.add( i );
			} );
		} else {
			array.each( arg, function ( i ) {
				if ( i !== "*" ) {
					obj.classList.remove( i );
				} else {
					array.each( obj.classList, function ( x ) {
						obj.classList.remove( x );
					} );

					return false;
				}
			} );
		}

		return obj;
	},

	/**
	 * Finds the position of an Element
	 *
	 * @method position
	 * @memberOf element
	 * @param  {Object} obj Element
	 * @return {Array}      Coordinates [left, top, right, bottom]
	 * @example
	 * let pos = keigai.util.element.position( document.querySelector( "#something" ) );
	 */
	position: function ( obj=document.body ) {
		let left, top, right, bottom, height, width;

		left = top = 0;
		width = obj.offsetWidth;
		height = obj.offsetHeight;

		if ( obj.offsetParent ) {
			top = obj.offsetTop;
			left = obj.offsetLeft;

			while ( obj = obj.offsetParent ) {
				left += obj.offsetLeft;
				top += obj.offsetTop;
			}

			right = document.body.offsetWidth - ( left + width );
			bottom = document.body.offsetHeight - ( top + height );
		} else {
			right = width;
			bottom = height;
		}

		return [ left, top, right, bottom ];
	},

	/**
	 * Prepends an Element to an Element
	 *
	 * @method prependChild
	 * @memberOf element
	 * @param  {Object} obj   Element
	 * @param  {Object} child Child Element
	 * @return {Object}       Element
	 * @example
	 * keigai.util.element.prependChild( document.querySelector( "#target" ), document.querySelector( "#something" ) );
	 */
	prependChild: function ( obj, child ) {
		return obj.childNodes.length === 0 ? obj.appendChild( child ) : obj.insertBefore( child, obj.childNodes[ 0 ] );
	},

	/**
	 * Removes an Element attribute
	 *
	 * @method removeAttr
	 * @memberOf element
	 * @param  {Object} obj Element
	 * @param  {String} key Attribute name
	 * @return {Object}     Element
	 * @example
	 * keigai.util.element.removeAttr( document.querySelector( "a" ), "href" );
	 */
	removeAttr: function ( obj, key ) {
		if ( regex.svg.test( obj.namespaceURI ) ) {
			obj.removeAttributeNS( obj.namespaceURI, key );
		} else if ( obj.nodeName === "SELECT" && key === "selected" ) {
			array.each( element.find( obj, "option" ), function ( i ) {
				if ( i.selected === true ) {
					i.selected = false;
					i.removeAttribute( "selected" );

					return false;
				}
			} );
		} else {
			obj.removeAttribute( key );
		}

		return obj;
	},

	/**
	 * Removes a CSS class from Element
	 *
	 * @method removeClass
	 * @memberOf element
	 * @param  {Object} obj Element
	 * @param  {String} arg CSS class
	 * @return {Object}     Element
	 * @example
	 * keigai.util.element.removeClass( document.querySelector( "#target" ), "existingClass" );
	 */
	removeClass: function ( obj, arg ) {
		element.klass( obj, arg, false );
	},

	/**
	 * Scrolls to the position of an Element
	 *
	 * @method scrollTo
	 * @memberOf element
	 * @param  {Object} obj        Element to scroll to
	 * @param  {Number} ms         [Optional] Milliseconds to scroll, default is 250, min is 100
	 * @param  {Number} offsetTop  [Optional] Offset from top of Element
	 * @param  {Number} offsetLeft [Optional] Offset from left of Element
	 * @return {Object} {@link Deferred}
	 * @example
	 * keigai.util.element.scrollTo( document.querySelector( "#something" ) ).then( () => {
	 *   ...
	 * } );
	 */
	scrollTo: function ( obj, ms, offsetTop, offsetLeft ) {
		let pos = array.remove( element.position( obj ), 2, 3 );

		if ( !isNaN( offsetTop ) ) {
			pos[ 0 ] += offsetTop;
		}

		if ( !isNaN( offsetLeft ) ) {
			pos[ 1 ] += offsetLeft;
		}

		return client.scroll( pos, ms );
	},

	/**
	 * Serializes the elements of an Element
	 *
	 * @method serialize
	 * @memberOf element
	 * @param  {Object}  obj    Element
	 * @param  {Boolean} string [Optional] true if you want a query string, default is false ( JSON )
	 * @param  {Boolean} encode [Optional] true if you want to URI encode the value, default is true
	 * @return {Mixed}          String or Object
	 * @example
	 * let userInput = keigai.util.element.serialize( document.querySelector( "form" ) );
	 */
	serialize: function ( obj, string=true, encode=true ) {
		let registry = {};
		let children, result;

		children = obj.nodeName === "FORM" ? ( obj.elements ? array.cast( obj.elements ) : obj.find( "button, input, select, textarea" ) ) : [ obj ];

		array.each( children, function ( i ) {
			let id = i.id || i.name || i.type;

			if ( i.nodeName === "FORM" ) {
				utility.merge( registry, json.decode( element.serialize( i ) ) );
			} else if ( !registry[ id ] ) {
				registry[ id ] = element.val( i );
			}
		} );

		if ( !string ) {
			result = registry;
		} else {
			result = "";

			utility.iterate( registry, function ( v, k ) {
				encode ? result += "&" + encodeURIComponent( k ) + "=" + encodeURIComponent( v ) : result += "&" + k + "=" + v;
			} );

			result = result.replace( regex.and, "?" );
		}

		return result;
	},

	/**
	 * Returns the size of the Element
	 *
	 * @method size
	 * @memberOf element
	 * @param  {Object} obj Element
	 * @return {Array}      [width, height]
	 * @example
	 * let size = keigai.util.element.size( document.querySelector( "#something" ) );
	 */
	size: function ( obj ) {
		return [
			obj.offsetWidth + number.parse( obj.style.paddingLeft || 0 ) + number.parse( obj.style.paddingRight || 0 ) + number.parse( obj.style.borderLeft || 0 ) + number.parse( obj.style.borderRight || 0 ),
			obj.offsetHeight + number.parse( obj.style.paddingTop || 0 ) + number.parse( obj.style.paddingBottom || 0 ) + number.parse( obj.style.borderTop || 0 ) + number.parse( obj.style.borderBottom || 0 )
		];
	},

	/**
	 * Getter / setter for an Element's text
	 *
	 * @method text
	 * @memberOf element
	 * @param  {Object} obj Element
	 * @param  {String} arg [Optional] Value to set
	 * @return {Object}     Element
	 * @example
	 * let obj  = document.querySelector( "#something" ),
	 *     text = keigai.util.element.text( obj );
	 *
	 * keigai.util.element.text( obj, text + ", and some more text" );
	 */
	text: function ( obj, arg ) {
		let key = obj.textContent ? "textContent" : "innerText";
		let payload = {};
		let set = false;

		if ( typeof arg !== "undefined" ) {
			set = true;
			payload[ key ] = arg;
		}

		return set ? element.update( obj, payload ) : obj[ key ];
	},

	/**
	 * Toggles a CSS class
	 *
	 * @method toggleClass
	 * @memberOf element
	 * @param  {Object} obj Element
	 * @param  {String} arg CSS class to toggle
	 * @return {Object}     Element
	 * @example
	 * let obj = document.querySelector( "#something" );
	 *
	 * keigai.util.element.toggleClass( obj, "someClass" );
	 */
	toggleClass: function ( obj, arg ) {
		obj.classList.toggle( arg );

		return obj;
	},

	/**
	 * Updates an Element
	 *
	 * @method update
	 * @memberOf element
	 * @param  {Object}  obj  Element
	 * @param  {Object} args Properties to set
	 * @return {Object}      Element
	 * @example
	 * keigai.util.element.update( document.querySelector( "#something" ), {innerHTML: "Hello World!", "class": "new"} );
	 */
	update: function ( obj, args ) {
		utility.iterate( args, function ( v, k ) {
			if ( regex.element_update.test( k ) ) {
				obj[ k ] = v;
			} else if ( k === "class" ) {
				!string.isEmpty( v ) ? element.addClass( obj, v ) : element.removeClass( obj, "*" );
			} else if ( k.indexOf( "data-" ) === 0 ) {
				element.data( obj, k.replace( "data-", "" ), v );
			} else {
				element.attr( obj, k, v );
			}
		} );

		return obj;
	},

	/**
	 * Gets or sets the value of Element
	 *
	 * @method val
	 * @memberOf element
	 * @param  {Object} obj   Element
	 * @param  {Mixed}  value [Optional] Value to set
	 * @return {Object}       Element
	 * @example
	 * keigai.util.element.val( document.querySelector( "input[type='text']" ), "new value" );
	 */
	val: function ( obj, value ) {
		let ev = "input";
		let output;

		if ( value === undefined ) {
			if ( regex.radio_checkbox.test( obj.type ) ) {
				if ( string.isEmpty( obj.name ) ) {
					throw new Error( label.expectedProperty );
				}

				array.each( utility.dom( "input[name='" + obj.name + "']" ), function ( i ) {
					if ( i.checked ) {
						output = i.value;
						return false;
					}
				} );
			} else if ( regex.select.test( obj.type ) ) {
				output = null;
				array.each( element.find( obj, "option" ), function ( i ) {
					if ( i.selected === true ) {
						output = i.value;
						return false;
					}
				} );
			} else if ( obj.value ) {
				output = obj.value;
			} else if ( obj.placeholder ) {
				output = obj.placeholder === obj.innerText ? undefined : obj.innerText;
			} else {
				output = element.text( obj );
			}

			if ( output !== undefined ) {
				output = utility.coerce( output );

				if ( typeof output === "string" ) {
					output = string.trim( output );
				}
			} else {
				output = "";
			}
		} else {
			value = value.toString();

			if ( regex.radio_checkbox.test( obj.type ) ) {
				ev = "click";

				array.each( utility.dom( "input[name='" + obj.name + "']" ), function ( i ) {
					if ( i.value === value ) {
						i.checked = true;
						output = i;
						return false;
					}
				} );
			} else if ( regex.select.test( obj.type ) ) {
				ev = "change";

				array.each( element.find( obj, " option" ), function ( i ) {
					if ( i.value === value ) {
						i.selected = true;
						output = i;
						return false;
					}
				} );
			} else {
				obj.value !== undefined ? obj.value = value : element.text( obj, value );
			}

			element.dispatch( obj, ev );

			output = obj;
		}

		return output;
	}
};

/**
 * @namespace json
 */
let json = {
	/**
	 * Decodes the argument
	 *
	 * @method decode
	 * @memberOf json
	 * @param  {String}  arg    String to parse
	 * @param  {Boolean} silent [Optional] Silently fail
	 * @return {Mixed}          Entity resulting from parsing JSON, or undefined
	 * @example
	 * let x = keigai.util.json.decode( ..., true );
	 *
	 * if ( x ) {
	 *   ...
	 * } else {
	 *   ... // invalid JSON, with `Error` suppressed by `silent`
	 * }
	 */
	decode: function ( arg, silent ) {
		try {
			return JSON.parse( arg );
		}
		catch ( e ) {
			if ( silent !== true ) {
				utility.error( e, [arg, silent] );
			}

			return undefined;
		}
	},

	/**
	 * Encodes `arg` as JSON
	 *
	 * @method encode
	 * @memberOf json
	 * @param  {Mixed}   arg    Primative
	 * @param  {Boolean} silent [Optional] Silently fail
	 * @return {String}         JSON, or undefined
	 * @example
	 * let x = keigai.util.json.encode( ..., true );
	 *
	 * if ( x ) {
	 *   ...
	 * } else {
	 *   ... // invalid JSON, with `Error` suppressed by `silent`
	 * }
	 */
	encode: function ( arg, silent ) {
		try {
			return JSON.stringify( arg );
		}
		catch ( e ) {
			if ( silent !== true ) {
				utility.error( e, [arg, silent] );
			}

			return undefined;
		}
	}
};

/**
 * @namespace label
 * @private
 */
let label = {
	/**
	 * Expected a Number
	 *
	 * @type {String}
	 * @memberOf label
	 */
	expectedNumber: "Expected a Number",

	/**
	 * Expected a property, and it was not set
	 *
	 * @type {String}
	 * @memberOf label
	 */
	expectedProperty: "Expected a property, and it was not set",

	/**
	 * Expected an Object
	 *
	 * @type {String}
	 * @memberOf label
	 */
	expectedObject: "Expected an Object",

	/**
	 * One or more arguments is invalid
	 *
	 * @type {String}
	 * @memberOf label
	 */
	invalidArguments: "One or more arguments is invalid",

	/**
	 * INVALID_STATE_ERR: Headers have not been received
	 *
	 * @type {String}
	 * @memberOf label
	 */
	invalidStateNoHeaders: "INVALID_STATE_ERR: Headers have not been received",

	/**
	 * Synchronous XMLHttpRequest requests are not supported
	 *
	 * @type {String}
	 * @memberOf label
	 */
	invalidStateNoSync: "Synchronous XMLHttpRequest requests are not supported",

	/**
	 * INVALID_STATE_ERR: Object is not open
	 *
	 * @type {String}
	 * @memberOf label
	 */
	invalidStateNotOpen: "INVALID_STATE_ERR: Object is not open",

	/**
	 * INVALID_STATE_ERR: Object is sending
	 *
	 * @type {String}
	 * @memberOf label
	 */
	invalidStateNotSending: "INVALID_STATE_ERR: Object is sending",

	/**
	 * INVALID_STATE_ERR: Object is not usable
	 *
	 * @type {String}
	 * @memberOf label
	 */
	invalidStateNotUsable: "INVALID_STATE_ERR: Object is not usable",

	/**
	 * Error when deferred is rejected for invalid request
	 *
	 * @type {String}
	 * @memberOf label
	 */
	methodNotAllowed: "Method not allowed",

	/**
	 * Default `emptyMsg` of DataLists
	 *
	 * @type {String}
	 * @memberOf label
	 */
	noData: "Nothing to display",

	/**
	 * Requested method is not available
	 *
	 * @type {String}
	 * @memberOf label
	 */
	notAvailable: "Requested method is not available",

	/**
	 * No previous version of a record
	 *
	 * @type {String}
	 * @memberOf label
	 */
	datastoreNoPrevVersion: "No previous version found",

	/**
	 * HTTP request timed out
	 *
	 * @type {String}
	 * @memberOf label
	 */
	requestTimeout: "Request timed out",

	/**
	 * Server error has occurred
	 *
	 * @type {String}
	 * @memberOf label
	 */
	serverError: "Server error has occurred",

	/**
	 * Forbidden to access URI
	 *
	 * @type {String}
	 * @memberOf label
	 */
	serverForbidden: "Forbidden to access URI",

	/**
	 * Method not allowed
	 *
	 * @type {String}
	 * @memberOf label
	 */
	serverInvalidMethod: "Method not allowed",

	/**
	 * Authorization required to access URI
	 *
	 * @type {String}
	 * @memberOf label
	 */
	serverUnauthorized: "Authorization required to access URI",

	/**
	 * Your browser is too old to use keigai, please upgrade
	 *
	 * @type {String}
	 * @memberOf label
	 */
	upgrade: "Your browser is too old to use keigai, please upgrade"
};

/**
 * @namespace math
 */
let math = {
	/**
	 * Generates bezier curve coordinates for up to 4 points, last parameter is `t`
	 *
	 * Two point example: (0, 10, 0, 0, 1) means move straight up
	 *
	 * @method bezier
	 * @memberOf math
	 * @return {Array} Coordinates
	 * @example
	 * // Moving straight down
	 * let p1 = keigai.util.math.bezier( 0, 10, 2000, 10, 0 ),
	 *     p2 = keigai.util.math.bezier( 0, 10, 2000, 10, 0.5 ),
	 *     p3 = keigai.util.math.bezier( 0, 10, 2000, 10, 0.75 ),
	 *     p4 = keigai.util.math.bezier( 0, 10, 2000, 10, 0.9 ),
	 *     p5 = keigai.util.math.bezier( 0, 10, 2000, 10, 1 );
	 */
	bezier: function ( ...args ) {
		let a = array.cast( args );
		let t = a.pop();
		let P = array.chunk( a, 2 );
		let n = P.length;
		let c, S0, Q0, Q1, Q2, C0, C1, C2, C3;

		if ( n < 2 || n > 4 ) {
			throw new Error( label.invalidArguments );
		}

		// Setting variables
		c = [];
		S0 = 1 - t;
		Q0 = math.sqr( S0 );
		Q1 = 2 * S0 * t;
		Q2 = math.sqr( t );
		C0 = Math.pow( S0, 3 );
		C1 = 3 * Q0 * t;
		C2 = 3 * S0 * Q2;
		C3 = Math.pow( t, 3 );

		// Straight
		if ( n === 2 ) {
			c.push( ( S0 * P[ 0 ][ 0 ] ) + ( t * P[ 1 ][ 0 ] ) );
			c.push( ( S0 * P[ 0 ][ 1 ] ) + ( t * P[ 1 ][ 1 ] ) );
		}
		// Quadratic
		else if ( n === 3 ) {
			c.push( ( Q0 * P[ 0 ][ 0 ] ) + ( Q1 * P[ 1 ][ 0 ] ) + ( Q2 + P[ 2 ][ 0 ] ) );
			c.push( ( Q0 * P[ 0 ][ 1 ] ) + ( Q1 * P[ 1 ][ 1 ] ) + ( Q2 + P[ 2 ][ 1 ] ) );
		}
		// Cubic
		else if ( n === 4 ) {
			c.push( ( C0 * P[ 0 ][ 0 ] ) + ( C1 * P[ 1 ][ 0 ] ) + ( C2 * P[ 2 ][ 0 ] ) + ( C3 * P[ 3 ][ 0 ] ) );
			c.push( ( C0 * P[ 0 ][ 1 ] ) + ( C1 * P[ 1 ][ 1 ] ) + ( C2 * P[ 2 ][ 1 ] ) + ( C3 * P[ 3 ][ 1 ] ) );
		}

		return c;
	},

	/**
	 * Finds the distance between 2 Arrays of coordinates
	 *
	 * @method dist
	 * @memberOf math
	 * @param  {Array} a Coordinates [x, y]
	 * @param  {Array} b Coordinates [x, y]
	 * @return {Number}  Distance between `a` & `b`
	 * @example
	 * let dist = keigai.util.math.dist( [4, 40], [-10, 12] );
	 */
	dist: function ( a, b ) {
		return Math.sqrt( math.sqr( b[ 0 ] - a[ 0 ] ) + math.sqr( b[ 1 ] - a[ 1 ] ) );
	},

	/**
	 * Squares a Number
	 *
	 * @method sqr
	 * @memberOf math
	 * @param  {Number} n Number to square
	 * @return {Number}   Squared value
	 * @example
	 * let sqr = keigai.util.math.sqr( 23 );
	 */
	sqr: function ( n ) {
		return n * n;
	}
};

/**
 * @namespace number
 */
let number = {
	/**
	 * Returns the difference of arg
	 *
	 * @method diff
	 * @memberOf number
	 * @param {Number} arg Number to compare
	 * @return {Number}    The absolute difference
	 * @example
	 * keigai.util.number.diff( -3, 8 ); // 11
	 */
	diff: function ( num1, num2 ) {
		return Math.abs( num1 - num2 );
	},

	/**
	 * Tests if an number is even
	 *
	 * @method even
	 * @memberOf number
	 * @param {Number} arg Number to test
	 * @return {Boolean}   True if even, or undefined
	 * @example
	 * let n = keigai.util.number.random( 10 );
	 *
	 * if ( keigai.util.number.even( n ) ) {
	 *   ...
	 * }
	 */
	even: function ( arg ) {
		return arg % 2 === 0;
	},

	/**
	 * Formats a Number to a delimited String
	 *
	 * @method format
	 * @memberOf number
	 * @param  {Number} arg       Number to format
	 * @param  {String} delimiter [Optional] String to delimit the Number with
	 * @param  {String} every     [Optional] Position to insert the delimiter, default is 3
	 * @return {String}           Number represented as a comma delimited String
	 * @example
	 * keigai.util.number.format( 1000 ); // "1,000"
	 */
	format: function ( arg, delimiter=",", every=3 ) {
		arg = arg.toString();

		let d = arg.indexOf( "." ) > -1 ? "." + arg.replace( regex.number_format_1, "" ) : "";
		let a = arg.replace( regex.number_format_2, "" ).split( "" ).reverse();
		let p = Math.floor( a.length / every );
		let i = 1;
		let b = -1;
		let n;

		while ( ++b < p ) {
			n = i === 1 ? every: ( every * i ) + ( i === 2 ? 1: ( i - 1 ) );
			a.splice( n, 0, delimiter );
			i++;
		}

		a = a.reverse().join( "" );

		if ( a.charAt( 0 ) === delimiter ) {
			a = a.substring( 1 );
		}

		return a + d;
	},

	/**
	 * Returns half of a, or true if a is half of b
	 *
	 * @method half
	 * @memberOf number
	 * @param  {Number} a Number to divide
	 * @param  {Number} b [Optional] Number to test a against
	 * @return {Mixed}    Boolean if b is passed, Number if b is undefined
	 * @example
	 * if ( keigai.util.number.half( 2, 4 ) ) {
	 *   ...
	 * } );
	 */
	half: function ( a, b ) {
		return b ? ( a / b ) === 0.5 : a / 2;
	},

	/**
	 * Tests if a number is odd
	 *
	 * @method odd
	 * @memberOf number
	 * @param  {Number} arg Number to test
	 * @return {Boolean}    True if odd, or undefined
	 * @example
	 * let n = keigai.util.number.random( 10 );
	 *
	 * if ( keigai.util.number.odd( n ) ) {
	 *   ...
	 * }
	 */
	odd: function ( arg ) {
		return !number.even( arg );
	},

	/**
	 * Parses the number
	 *
	 * @method parse
	 * @memberOf number
	 * @param  {Mixed}  arg  Number to parse
	 * @param  {Number} base Integer representing the base or radix
	 * @return {Number}      Integer or float
	 * @example
	 * // Unsure if `n` is an int or a float
	 * keigai.util.number.parse( n );
	 */
	parse: function ( arg, base ) {
		return base === undefined ? parseFloat( arg ) : parseInt( arg, base );
	},

	/**
	 * Generates a random number between 0 and `arg`
	 *
	 * @method random
	 * @memberOf number
	 * @param  {Number} arg Ceiling for random number, default is 100
	 * @return {Number}     Random number
	 * @example
	 * let n = keigai.util.math.random( 10 );
	 */
	random: function ( arg=100 ) {
		return Math.floor( Math.random() * ( arg + 1 ) );
	},

	/**
	 * Rounds a number up or down
	 *
	 * @method round
	 * @memberOf number
	 * @param  {Number} arg       Number to round
	 * @param  {String} direction [Optional] "up" or "down"
	 * @return {Number}           Rounded interger
	 * @example
	 * keigai.util.math.round( n, "down" );
	 */
	round: function ( arg, direction ) {
		arg = number.parse( arg );

		if ( direction === undefined || string.isEmpty( direction ) ) {
			return number.parse( arg.toFixed( 0 ) );
		} else if ( regex.down.test( direction ) ) {
			return ~~( arg );
		} else {
			return Math.ceil( arg );
		}
	}
};

/**
 * @namespace promise
 */
let promise = {
	/**
	 * "Unboxed" Promise factory
	 *
	 * @method factory
	 * @memberOf promise
	 * @return {Object} {@link Promise}
	 */
	factory: function () {
		let promise, pCatch, pResolve, pReject, pThen;

		promise = new Promise( function ( resolve, reject ) {
			pResolve = resolve;
			pReject = reject;
		} );

		pCatch = function ( ...args ) {
			return promise.catch.apply( promise, args );
		};

		pThen = function ( ...args ) {
			return promise.then.apply( promise, args );
		};

		return { "catch": pCatch, resolve: pResolve, reject: pReject, then: pThen };
	}
};

class DataStore extends Base {
	/**
	 * Creates a new DataStore
	 *
	 * @constructor
	 * @memberOf keigai
	 * @extends {keigai.Base}
	 * @example
	 * let store = keigai.store();
	 */
	constructor () {
		super();

		this.autosave = false;
		this.callback = null;
		this.credentials = null;
		this.lists = [];
		this.events = true;
		this.expires = null;
		this.headers = { Accept: "application/json" };
		this.ignore = [];
		this.index = [];
		this.indexes = { key: {} };
		this.key = null;
		this.loaded = false;
		this.mongodb = "";
		this.observer = observable();
		this.records = [];
		this.source = null;
		this.total = 0;
		this.versions = {};
		this.versioning = true;
		this.views = {};
		this.uri = null;
	}

	/**
	 * Batch sets or deletes data in the store
	 *
	 * @method batch
	 * @memberOf keigai.DataStore
	 * @param  {String}  type Type of action to perform ( set/del/delete )
	 * @param  {Array}   data Array of keys or indices to delete, or Object containing multiple records to set
	 * @param  {Boolean} sync [Optional] Syncs store with data, if true everything is erased
	 * @return {Object} {@link keigai.Deferred}
	 * @fires keigai.DataStore#beforeBatch Fires before the batch is queued
	 * @fires keigai.DataStore#afterBatch Fires after the batch is queued
	 * @fires keigai.DataStore#failedBatch Fires when an exception occurs
	 * @example
	 * store.batch( "set", [...] ).then( ( records ) => {
	 *   ...
	 * }, ( err ) => {
	 *   ...
	 * } );
	 */
	batch ( type, data, sync=false ) {
		let self = this;
		let events = this.events;
		let defer = deferred();
		let deferreds = [];
		let patch = [];

		if ( !regex.set_del.test( type ) || ( sync && regex.del.test( type ) ) || typeof data !== "object" ) {
			defer.reject( new Error( label.invalidArguments ) );
		} else {
			if ( events ) {
				this.dispatch( "beforeBatch", data );
			}

			if ( sync ) {
				this.clear( sync );
			}

			if ( data.length === 0 ) {
				this.loaded = true;

				if ( events ) {
					this.dispatch( "afterBatch", this.records );
				}

				defer.resolve( this.records );
			} else {
				// Batch deletion will create a sparse array, which will be compacted before re-indexing
				if ( type === "del" ) {
					array.each( data, ( i ) => {
						deferreds.push( this.del( i, false, true ) );
					} );
				} else {
					array.each( data, ( i ) => {
						deferreds.push( this.set( i[ this.key ] || null, i, true ) );
					} );
				}

				this.loaded = false;

				utility.when( deferreds ).then( ( args ) => {
					this.loaded = true;

					if ( events ) {
						this.dispatch( "afterBatch", args );
					}

					// Forcing a clear of views to deal with async nature of workers & staggered loading
					array.each( this.lists, ( i ) => {
						i.refresh( true );
					} );

					if ( type === "del" ) {
						this.records = array.compact( this.records );
						this.reindex();
					}

					if ( this.autosave ) {
						this.save();
					}

					defer.resolve( args );
				}, ( e ) => {
					if ( events ) {
						this.dispatch( "failedBatch", e );
					}

					defer.reject( e );
				} );
			}
		}

		return defer;
	}

	/**
	 * Builds a URI
	 *
	 * @method buildUri
	 * @memberOf keigai.DataStore
	 * @param  {String} key Record key
	 * @return {String}     URI
	 * @example
	 * let uri = store.buildUri( "key" );
	 */
	buildUri ( key ) {
		let parsed = utility.parse( this.uri );

		return parsed.protocol + "//" + parsed.host + parsed.pathname.replace( regex.endslash, "" ) + "/" + key;
	}

	/**
	 * Clears the data object, unsets the uri property
	 *
	 * @method clear
	 * @memberOf keigai.DataStore
	 * @param  {Boolean} sync [Optional] Boolean to limit clearing of properties
	 * @return {Object} {@link keigai.DataStore}
	 * @fires keigai.DataStore#beforeClear Fires before the data is cleared
	 * @fires keigai.DataStore#afterClear Fires after the data is cleared
	 * @example
	 * // Resyncing the records, if wired to an API
	 * store.clear( true );
	 *
	 * // Resetting the store
	 * store.clear();
	 */
	clear ( sync=true ) {
		let events = ( this.events === true );
		let resave = ( this.autosave === true );

		if ( !sync ) {
			if ( events ) {
				this.dispatch( "beforeClear" );
			}

			array.each( this.lists, ( i ) => {
				if ( i ) {
					i.teardown( true );
				}
			} );

			this.autosave = false;
			this.callback = null;
			this.credentials = null;
			this.lists = [];
			this.events = true;
			this.expires = null;
			this.headers = { Accept: "application/json" };
			this.ignore = [];
			this.index = [];
			this.indexes = { key: {} };
			this.key = null;
			this.loaded = false;
			this.records = [];
			this.source = null;
			this.total = 0;
			this.versions = {};
			this.versioning = true;
			this.views = {};
			this.uri = null;

			if ( events ) {
				this.dispatch( "afterClear" );
			}
		} else {
			this.indexes = { key: {} };
			this.loaded = false;
			this.records = [];
			this.total = 0;
			this.views = {};

			array.each( this.lists, ( i ) => {
				if ( i ) {
					i.refresh();
				}
			} );
		}

		if ( resave ) {
			this.save();
		}

		return this;
	}

	/**
	 * Deletes a record based on key or index
	 *
	 * @method del
	 * @memberOf keigai.DataStore
	 * @param  {Mixed}   record  Record, key or index
	 * @param  {Boolean} reindex [Optional] `true` if DataStore should be reindexed
	 * @param  {Boolean} batch   [Optional] `true` if part of a batch operation
	 * @return {Object} {@link keigai.Deferred}
	 * @fires keigai.DataStore#beforeDelete Fires before the record is deleted
	 * @fires keigai.DataStore#afterDelete Fires after the record is deleted
	 * @fires keigai.DataStore#failedDelete Fires if the store is RESTful and the action is denied
	 * @example
	 * store.del( "key" ).then( () => {
	 *   console.log( "Successfully deleted " + key );
	 * }, ( err ) => {
	 *   console.warn( "Failed to delete " + key + ": " + err.message );
	 * } );
	 */
	del ( record, reindex=true, batch=false ) {
		record = record.key ? record : this.get( record );

		let defer = deferred();

		if ( record === undefined ) {
			defer.reject( new Error( label.invalidArguments ) );
		} else {
			if ( this.events ) {
				this.dispatch( "beforeDelete", record );
			}

			if ( this.uri === null || this.callback !== null ) {
				this.delComplete( record, reindex, batch, defer );
			} else {
				client.request( this.buildUri( record.key ), "DELETE", null, utility.merge( { withCredentials: this.credentials }, this.headers ) ).then( () => {
					this.delComplete( record, reindex, batch, defer );
				}, ( e ) => {
					this.dispatch( "failedDelete", e );
					defer.reject( e );
				} );
			}
		}

		return defer;
	}

	/**
	 * Delete completion
	 *
	 * @method delComplete
	 * @memberOf keigai.DataStore
	 * @param  {Object}  record  DataStore record
	 * @param  {Boolean} reindex `true` if DataStore should be reindexed
	 * @param  {Boolean} batch   `true` if part of a batch operation
	 * @param  {Object}  defer   Deferred instance
	 * @return {Object} {@link keigai.DataStore}
	 * @private
	 */
	delComplete ( record, reindex, batch, defer ) {
		delete this.indexes.key[ record.key ];
		delete this.versions[ record.key ];
		this.total--;
		this.views = {};

		if ( !batch ) {
			array.remove( this.records, record.index );

			if ( reindex ) {
				this.reindex();
			} else {
				array.each( record.indexes, ( i ) => {
					array.remove( this.indexes[ i[ 0 ] ][ i[ 1 ] ], record.index );

					if ( this.indexes[ i[ 0 ] ][ i[ 1 ] ].length === 0 ) {
						delete this.indexes[ i[ 0 ] ][ i[ 1 ] ];
					}
				} );
			}

			if ( this.autosave ) {
				this.purge( record.key );
			}

			if ( this.events ) {
				this.dispatch( "afterDelete", record );
			}

			array.each( this.lists, ( i ) => {
				i.refresh();
			} );
		} else {
			this.records[ record.index ] = null;
		}

		return defer !== undefined ? defer.resolve( record.key ) : record.key;
	}

	/**
	 * Exports a subset or complete record set of DataStore
	 *
	 * @method dump
	 * @memberOf keigai.DataStore
	 * @param  {Array} args   [Optional] Sub-data set of DataStore
	 * @param  {Array} fields [Optional] Fields to export, defaults to all
	 * @return {Array}        Records
	 * @example
	 * let data = store.dump();
	 */
	dump ( args, fields ) {
		args = args || this.records;

		let custom = ( fields instanceof Array && fields.length > 0 );
		let key = this.key !== null;
		let fn;

		if ( custom ) {
			fn = ( i ) => {
				let record = {};

				array.each( fields, ( f ) => {
					record[ f ] = f === this.key ? ( isNaN( i.key ) ? i.key : Number( i.key ) ) : utility.clone( i.data[ f ], true );
				} );

				return record;
			};
		} else {
			fn = ( i ) => {
				let record = {};

				if ( key ) {
					record[ this.key ] = isNaN( i.key ) ? i.key : Number( i.key );
				}

				utility.iterate( i.data, ( v, k ) => {
					record[ k ] = utility.clone( v, true );
				} );

				return record;
			};
		}

		return args.map( fn );
	}

	/**
	 * Retrieves the current version of a record(s) based on key or index
	 *
	 * If the key is an integer, cast to a string before sending as an argument!
	 *
	 * @method get
	 * @memberOf keigai.DataStore
	 * @param  {Mixed}  record Key, index or Array of pagination start & end; or comma delimited String of keys or indices
	 * @param  {Number} offset [Optional] Offset from `record` for pagination
	 * @return {Mixed}         Individual record, or Array of records
	 * @example
	 * let record = store.get( "key" );
	 */
	get ( record, offset ) {
		let type = typeof record;
		let result;

		if ( type === "undefined" ) {
			result = this.records;
		} else if ( type === "string" ) {
			if ( record.indexOf( "," ) === -1 ) {
				result = this.records[ this.indexes.key[ record ] ];
			} else {
				result = string.explode( record ).map( ( i ) => {
					if ( !isNaN( i ) ) {
						return this.records[ parseInt( i, 10 ) ];
					} else {
						return this.records[ this.indexes.key[ i ] ];
					}
				} );
			}
		} else if ( type === "number" ) {
			if ( isNaN( offset ) ) {
				result = this.records[ parseInt( record, 10 ) ];
			} else {
				result = array.limit( this.records, parseInt( record, 10 ), parseInt( offset, 10 ) );
			}
		}

		return utility.clone( result, true );
	}

	/**
	 * Performs an (INNER/LEFT/RIGHT) JOIN on two DataStores
	 *
	 * @method join
	 * @memberOf keigai.DataStore
	 * @param  {String} arg   DataStore to join
	 * @param  {String} field Field in both DataStores
	 * @param  {String} join  Type of JOIN to perform, defaults to `inner`
	 * @return {Object} {@link keigai.Deferred}
	 * let data = store.join( otherStore, "commonField" );
	 */
	join ( arg, field, join="inner" ) {
		let defer = deferred();
		let results = [];
		let deferreds = [];
		let key = field === this.key;
		let keys = array.merge( array.keys( this.records[ 0 ].data ), array.keys( arg.records[ 0 ].data ) );
		let fn;

		if ( join === "inner" ) {
			fn = ( i ) => {
				let where = {},
					record = i.data,
					defer = deferred();

				where[ field ] = key ? i.key : record[ field ];

				arg.select( where ).then( ( match ) => {
					if ( match.length > 2 ) {
						defer.reject( new Error( label.databaseMoreThanOne ) );
					} else if ( match.length === 1 ) {
						results.push( utility.merge( record, match[ 0 ].data ) );
						defer.resolve( true );
					} else {
						defer.resolve( false );
					}
				} );

				deferreds.push( defer );
			};
		} else if ( join === "left" ) {
			fn = ( i ) => {
				let where = {},
					record = i.data,
					defer = deferred();

				where[ field ] = key ? i.key : record[ field ];

				arg.select( where ).then( ( match ) => {
					if ( match.length > 2 ) {
						defer.reject( new Error( label.databaseMoreThanOne ) );
					} else if ( match.length === 1 ) {
						results.push( utility.merge( record, match[ 0 ].data ) );
						defer.resolve( true );
					} else {
						array.each( keys, ( i ) => {
							if ( record[ i ] === undefined ) {
								record[ i ] = null;
							}
						} );

						results.push( record );
						defer.resolve( true );
					}
				} );

				deferreds.push( defer );
			};
		} else if ( join === "right" ) {
			fn = ( i ) => {
				let where = {},
					record = i.data,
					defer = deferred();

				where[ field ] = key ? i.key : record[ field ];

				this.select( where ).then( ( match ) => {
					if ( match.length > 2 ) {
						defer.reject( new Error( label.databaseMoreThanOne ) );
					} else if ( match.length === 1 ) {
						results.push( utility.merge( record, match[ 0 ].data ) );
						defer.resolve( true );
					} else {
						array.each( keys, ( i ) => {
							if ( record[ i ] === undefined ) {
								record[ i ] = null;
							}
						} );

						results.push( record );
						defer.resolve( true );
					}
				} );

				deferreds.push( defer );
			};
		}

		array.each( utility.clone( join === "right" ? arg.records : this.records, true ), fn );

		utility.when( deferreds ).then( () => {
			defer.resolve( results );
		}, ( e ) => {
			defer.reject( e );
		} );

		return defer;
	}

	/**
	 * Retrieves only 1 field/property
	 *
	 * @method only
	 * @memberOf keigai.DataStore
	 * @param  {String} arg Field/property to retrieve
	 * @return {Array}      Array of values
	 * @example
	 * let ages = store.only( "age" );
	 */
	only ( arg ) {
		if ( arg === this.key ) {
			return this.records.map( ( i ) => {
				return i.key;
			} );
		} else {
			return this.records.map( ( i ) => {
				return i.data[ arg ];
			} );
		}
	}

	/**
	 * Purges DataStore or record from persistant storage
	 *
	 * @method purge
	 * @memberOf keigai.DataStore
	 * @param  {Mixed} arg  [Optional] String or Number for record
	 * @return {Object}     Record or store
	 * @example
	 * store.purge();
	 */
	purge ( arg ) {
		return this.storage( arg || this, "remove" );
	}

	/**
	 * Reindexes the DataStore
	 *
	 * @method reindex
	 * @memberOf keigai.DataStore
	 * @return {Object} {@link keigai.DataStore}
	 * @example
	 * store.reindex();
	 */
	reindex () {
		let i = -1;
		let tmp = [];

		this.views = {};
		this.indexes = { key: {} };

		if ( this.total > 0 ) {
			array.each( this.records, ( record ) => {
				if ( record !== undefined ) {
					tmp[ ++i ] = record;
					record.index = i;
					this.indexes.key[ record.key ] = i;
					this.setIndexes( record );
				}
			} );
		}

		this.records = tmp;

		return this;
	}

	/**
	 * Restores DataStore or record persistant storage
	 *
	 * @method restore
	 * @memberOf keigai.DataStore
	 * @param  {Mixed} arg  [Optional] String or Number for record
	 * @return {Object}     Record or store
	 * @example
	 * store.restore();
	 */
	restore ( arg ) {
		return this.storage( arg || this, "get" );
	}

	/**
	 * Saves DataStore or record to persistant storage, or sessionStorage
	 *
	 * @method save
	 * @memberOf keigai.DataStore
	 * @param  {Mixed} arg  [Optional] String or Number for record
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * store.save();
	 */
	save ( arg ) {
		return this.storage( arg || this, "set" );
	}

	/**
	 * Selects records (not by reference) based on an explicit description
	 *
	 * @method select
	 * @memberOf keigai.DataStore
	 * @param  {Object} where Object describing the WHERE clause
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * let adults;
	 *
	 * store.select( {age: function ( i ) { return i >= 21; } } ).then( function ( records ) {
	 *   adults = records;
	 * }, ( err ) => {
	 *   adults = [];
	 *   console.error( err.stack || err.message || err );
	 * } );
	 */
	select ( where ) {
		let defer = deferred();
		let functions = [];
		let clauses, cond, index, result, sorted, values, worker;

		if ( !( where instanceof Object ) ) {
			defer.reject( new Error( label.invalidArguments ) );
		} else {
			utility.iterate( where, ( v, k ) => {
				if ( typeof v === "function" ) {
					this[ k ] = v.toString();
					functions.push( k );
				}
			} );

			if ( webWorker ) {
				try {
					worker = utility.worker( defer );
					worker.postMessage( {
						cmd: "select",
						indexes: this.indexes,
						records: this.records,
						where: json.encode( where ),
						functions: functions
					} );
				}
				catch ( e ) {
					// Probably IE10, which doesn't have the correct security flag for local loading
					webWorker = false;

					this.select( where ).then( ( arg ) => {
						defer.resolve( arg );
					}, ( e ) => {
						defer.reject( e );
					} );
				}
			} else {
				clauses = array.fromObject( where );
				sorted = array.flat( clauses ).filter( ( i, idx ) => {
					return idx % 2 === 0;
				} ).map( function ( i ) { return i.toString(); } ).sort( array.sort );
				index = sorted.join( "|" );
				values = sorted.map( ( i ) => {
					return where[ i ];
				} ).join( "|" );
				cond = "return ( ";

				if ( functions.length === 0 && this.indexes[ index ] ) {
					result = ( this.indexes[ index ][ values ] || [] ).map( ( i ) => {
						return this.records[ i ];
					} );
				} else {
					if ( clauses.length > 1 ) {
						array.each( clauses, ( i, idx ) => {
							let b1 = "( ";

							if ( idx > 0 ) {
								b1 = " && ( ";
							}

							if ( i[ 1 ] instanceof Function ) {
								cond += b1 + i[ 1 ].toString() + "( rec.data[\"" + i[ 0 ] + "\"] ) )";
							} else if ( !isNaN( i[ 1 ] ) ) {
								cond += b1 + "rec.data[\"" + i[ 0 ] + "\"] === " + i[ 1 ] + " )";
							} else {
								cond += b1 + "rec.data[\"" + i[ 0 ] + "\"] === \"" + i[ 1 ] + "\" )";
							}
						} );
					} else {
						if ( clauses[ 0 ][ 1 ] instanceof Function ) {
							cond += clauses[ 0 ][ 1 ].toString() + "( rec.data[\"" + clauses[ 0 ][ 0 ] + "\"] )";
						} else if ( !isNaN( clauses[ 0 ][ 1 ] ) ) {
							cond += "rec.data[\"" + clauses[ 0 ][ 0 ] + "\"] === " + clauses[ 0 ][ 1 ];
						} else {
							cond += "rec.data[\"" + clauses[ 0 ][ 0 ] + "\"] === \"" + clauses[ 0 ][ 1 ] + "\"";
						}
					}

					cond += " );";

					result = utility.clone( this.records, true ).filter( new Function( "rec", cond ) );
				}

				defer.resolve( result );
			}
		}

		return defer;
	};

	/**
	 * Creates or updates an existing record
	 *
	 * @method set
	 * @memberOf keigai.DataStore
	 * @param  {Mixed}   key       [Optional] Integer or String to use as a Primary Key
	 * @param  {Object}  data      Key:Value pairs to set as field values
	 * @param  {Boolean} batch     [Optional] True if called by data.batch
	 * @param  {Boolean} overwrite [Optional] Overwrites the existing record, if found
	 * @return {Object} {@link keigai.Deferred}
	 * @fires keigai.DataStore#beforeSet Fires before the record is set
	 * @fires keigai.DataStore#afterSet Fires after the record is set, the record is the argument for listeners
	 * @fires keigai.DataStore#failedSet Fires if the store is RESTful and the action is denied
	 * @example
	 * // Creating a new record
	 * store.set( null, {...} );
	 *
	 * // Updating a record
	 * store.set( "key", {...} );
	 */
	set ( key, data, batch=false, overwrite=false ) {
		data = utility.clone( data, true );

		let events = this.events;
		let defer = deferred();
		let record = key !== null ? this.get( key ) || null : data[ this.key ] ? this.get( data[ this.key ] ) || null : null;
		let method = "POST";
		let parsed = utility.parse( this.uri || "" );
		let uri, odata, rdefer;

		let patch = ( overwrite, data, ogdata ) => {
			let ndata = [];

			if ( overwrite ) {
				array.each( array.keys( ogdata ), ( k ) => {
					if ( k !== this.key && data[ k ] === undefined ) {
						ndata.push( { op: "remove", path: "/" + k } );
					}
				} );
			}

			utility.iterate( data, ( v, k ) => {
				if ( k !== this.key && ogdata[ k ] === undefined ) {
					ndata.push( { op: "add", path: "/" + k, value: v } );
				} else if ( json.encode( ogdata[ k ] ) !== json.encode( v ) ) {
					ndata.push( { op: "replace", path: "/" + k, value: v } );
				}
			} );

			return ndata;
		};

		if ( typeof data === "string" ) {
			if ( data.indexOf( "//" ) === -1 ) {
				// Relative path to store, i.e. a child
				if ( data.charAt( 0 ) !== "/" ) {
					uri = this.buildUri( data );
				}
				// Root path, relative to store, i.e. a domain
				else if ( this.uri !== null && regex.root.test( data ) ) {
					uri = parsed.protocol + "//" + parsed.host + data;
				} else {
					uri = data;
				}
			} else {
				uri = data;
			}

			key = uri.replace( regex.not_endpoint, "" );

			if ( string.isEmpty( key ) ) {
				defer.reject( new Error( label.invalidArguments ) );
			} else {
				if ( !batch && events ) {
					this.dispatch( "beforeSet", { key: key, data: data } );
				}

				client.request( uri, "GET", null, utility.merge( { withCredentials: this.credentials }, this.headers ) ).then( ( arg ) => {
					this.setComplete( record, key, this.source ? utility.walk( arg, this.source ) : arg, batch, overwrite, defer );
				}, ( e ) => {
					this.dispatch( "failedSet", e );
					defer.reject( e );
				} );
			}
		} else {
			if ( !batch && events ) {
				this.dispatch( "beforeSet", { key: key, data: data } );
			}

			if ( batch || this.uri === null ) {
				this.setComplete( record, key, data, batch, overwrite, defer );
			} else {
				if ( key !== null ) {
					uri = this.buildUri( key );
					method = "PATCH";
					odata = utility.clone( data, true );
					data = patch( overwrite, data, this.dump( [ record ] )[ 0 ] );
				} else {
					// Dropping query string
					uri = parsed.protocol + "//" + parsed.host + parsed.pathname;
				}

				rdefer = client.request( uri, method, data, utility.merge( { withCredentials: this.credentials }, this.headers ) );
				rdefer.then( ( arg ) => {
					let change;

					if ( rdefer.xhr.status !== 204 && rdefer.xhr.status < 300 ) {
						change = key === null ? ( this.source ? utility.walk( arg, this.source ) : arg ) : odata;
					} else {
						change = odata;
					}

					this.setComplete( record, key, change, batch, overwrite, defer );
				}, ( e ) => {
					if ( method === "PATCH" ) {
						method = "PUT";
						data = utility.clone( odata, true );

						utility.iterate( record.data, ( v, k ) => {
							data[ k ] = v;
						} );

						client.request( uri, method, data, utility.merge( { withCredentials: this.credentials }, this.headers ) ).then( () => {
							this.setComplete( record, key, odata, batch, overwrite, defer );
						}, ( e ) => {
							this.dispatch( "failedSet", e );
							defer.reject( e );
						} );
					} else {
						this.dispatch( "failedSet", e );
						defer.reject( e );
					}
				} );
			}
		}

		return defer;
	}

	/**
	 * Set completion
	 *
	 * @method setComplete
	 * @memberOf keigai.DataStore
	 * @param  {Mixed}   record    DataStore record, or `null` if new
	 * @param  {String}  key       Record key
	 * @param  {Object}  data      Record data
	 * @param  {Boolean} batch     `true` if part of a batch operation
	 * @param  {Boolean} overwrite Overwrites the existing record, if found
	 * @param  {Object}  defer     Deferred instance
	 * @return {Object} {@link keigai.DataStore}
	 * @private
	 */
	setComplete ( record, key, data, batch, overwrite, defer ) {
		// Clearing views
		this.views = {};

		// Setting key
		if ( key === null ) {
			if ( this.key !== null && data[ this.key ] !== undefined && data[ this.key ] !== null ) {
				key = data[ this.key ].toString();
			} else {
				key = utility.uuid();
			}
		}

		// Removing primary key from data
		if ( this.key ) {
			delete data[ this.key ];
		}

		// Create
		if ( record === null ) {
			record = {
				index: this.total++,
				key: key,
				data: data,
				indexes: []
			};

			this.indexes.key[ key ] = record.index;
			this.records[ record.index ] = record;

			if ( this.versioning ) {
				this.versions[ record.key ] = lru.factory( VERSIONS );
				this.versions[ record.key ].nth = 0;
			}
		}
		// Update
		else {
			if ( this.versioning ) {
				if ( this.versions[ record.key ] === undefined ) {
					this.versions[ record.key ] = lru.factory( VERSIONS );
					this.versions[ record.key ].nth = 0;
				}

				this.versions[ record.key ].set( "v" + ( ++this.versions[ record.key ].nth ), this.dump( [ record ] )[ 0 ] );
			}

			// By reference
			record = this.records[ record.index ];

			if ( overwrite ) {
				record.data = {};
			}

			utility.iterate( data, ( v, k ) => {
				record.data[ k ] = v;
			} );

			// Snapshot that's safe to hand out
			record = utility.clone( record, true );
		}

		this.setIndexes( record );

		if ( !batch ) {
			if ( this.autosave ) {
				this.save();
			}

			if ( this.events ) {
				this.dispatch( "afterSet", record );
			}

			array.each( this.lists, ( i ) => {
				i.refresh();
			} );
		}

		if ( defer !== undefined ) {
			defer.resolve( record );
		}

		return this;
	};

	/**
	 * Gets or sets an explicit expiration of data
	 *
	 * @method setExpires
	 * @memberOf keigai.DataStore
	 * @param  {Number} arg Milliseconds until data is stale
	 * @return {Object} {@link keigai.DataStore}
	 * @example
	 * store.setExpires( 5 * 60 * 1000 ); // Resyncs every 5 minutes
	 */
	setExpires ( arg ) {
		let id = this.id + "Expire";
		let expires = arg;

		// Expiry cannot be less than a second, and must be a valid scenario for consumption; null will disable repetitive expiration
		if ( ( arg !== null && this.uri === null ) || ( arg !== null && ( isNaN( arg ) || arg < 1000 ) ) ) {
			throw new Error( label.invalidArguments );
		}

		if ( this.expires === arg ) {
			return;
		}

		this.expires = arg;

		utility.clearTimers( id );

		if ( arg === null ) {
			return;
		}

		utility.repeat( () => {
			if ( this.uri === null ) {
				this.setExpires( null );

				return false;
			}

			this.dispatch( "beforeExpire" );
			cache.expire( this.uri );
			this.dispatch( "expire" );
			this.dispatch( "afterExpire" );
		}, expires, id, false );
	};

	/**
	 * Sets indexes for a record using `store.indexes`
	 *
	 * Composite indexes are supported, but require keys be in alphabetical order, e.g. "age|name"
	 *
	 * @method setIndexes
	 * @memberOf keigai.DataStore
	 * @param  {Object} arg DataStore Record
	 * @return {Object} {@link keigai.DataStore}
	 * @example
	 * store.setIndexes( record );
	 */
	setIndexes ( arg ) {
		let delimter = "|";

		arg.indexes = [];

		array.each( this.index, ( i ) => {
			let keys = i.split( delimter );
			let values = "";

			if ( this.indexes[ i ] === undefined ) {
				this.indexes[ i ] = {};
			}

			array.each( keys, ( k, kdx ) => {
				values += ( kdx > 0 ? delimter : "" ) + arg.data[ k ];
			} );

			if ( this.indexes[ i ][ values ] === undefined ) {
				this.indexes[ i ][ values ] = [];
			}

			if ( !array.contains( this.indexes[ i ][ values ], arg.index ) ) {
				this.indexes[ i ][ values ].push( arg.index );
				arg.indexes.push( [ i, values ] );
			}
		} );

		return this;
	}

	/**
	 * Sets the RESTful API end point
	 *
	 * @method setUri
	 * @memberOf keigai.DataStore
	 * @param  {String} arg API collection end point
	 * @return {Object}     Deferred
	 * @example
	 * store.setUri( "..." ).then( ( records ) => {
	 *   ...
	 * }, ( err ) => {
	 *   ...
	 * } );
	 */
	setUri ( arg ) {
		let defer = deferred();
		let parsed;

		if ( arg !== null && string.isEmpty( arg ) ) {
			defer.reject( new Error( label.invalidArguments ) );
		}

		if ( arg === null ) {
			this.uri = arg;
		} else {
			parsed = utility.parse( arg );
			this.uri = parsed.protocol + "//" + parsed.host + parsed.path;

			if ( !string.isEmpty( parsed.auth ) && !this.headers.authorization && !this.headers.Authorization ) {
				this.headers.Authorization = "Basic " + btoa( decodeURIComponent( parsed.auth ) );
			}

			this.on( "expire", () => {
				this.sync();
			}, "resync" );

			cache.expire( this.uri );

			this.sync().then( ( arg ) => {
				defer.resolve( arg );
			}, ( e ) => {
				defer.reject( e );
			} );
		}

		return defer;
	}

	/**
	 * Creates, or returns a cached view of the records (not by reference)
	 *
	 * @method sort
	 * @memberOf keigai.DataStore
	 * @param  {String} query  SQL ( style ) order by
	 * @param  {String} create [Optional, default behavior is true, value is false] Boolean determines whether to recreate a view if it exists
	 * @param  {Object} where  [Optional] Object describing the WHERE clause
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * store.sort( "age desc, name" ).then( ( records ) => {
	 *   ...
	 * }, ( err ) => {
	 *   ...
	 * } );
	 */
	sort ( query, create, where ) {
		create = ( create === true || ( where instanceof Object ) );

		let view = string.toCamelCase( string.explode( query ).join( " " ) );
		let defer = deferred();

		// Next phase
		let next = ( records ) => {
			let worker;

			if ( this.total === 0 ) {
				defer.resolve( [] );
			} else if ( !create && this.views[ view ] ) {
				defer.resolve( this.views[ view ] );
			} else if ( webWorker ) {
				defer.then( ( arg ) => {
					this.views[ view ] = arg;

					return this.views[ view ];
				}, ( e ) => {
					utility.error( e );
				} );

				try {
					worker = utility.worker( defer );
					worker.postMessage( { cmd: "sort", indexes: this.indexes, records: records, query: query } );
				}
				catch ( e ) {
					// Probably IE10, which doesn't have the correct security flag for local loading
					webWorker = false;

					this.views[ view ] = array.keySort( records, query, "data" );
					defer.resolve( this.views[ view ] );
				}
			} else {
				this.views[ view ] = array.keySort( records, query, "data" );
				defer.resolve( this.views[ view ] );
			}
		};

		if ( !where ) {
			next( utility.clone( this.records, true ) );
		} else {
			this.select( where ).then( next, ( e ) => {
				defer.reject( e );
			} );
		}

		return defer;
	}

	/**
	 * Storage interface
	 *
	 * SQL/NoSQL backends will be used if configured in lieu of localStorage (node.js only)
	 *
	 * @method storage
	 * @memberOf keigai.DataStore
	 * @param  {Mixed}  obj  Record ( Object, key or index ) or store
	 * @param  {Object} op   Operation to perform ( get, remove or set )
	 * @param  {String} type [Optional] Type of Storage to use ( local, session [local] )
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * store.storage( store, "set" );
	 */
	storage ( obj, op, type ) {
		let self = this;
		let record = false;
		let mongo = !string.isEmpty( this.mongodb );
		let session = ( type === "session" && typeof sessionStorage !== "undefined" );
		let defer = deferred();
		let data, key, result;

		if ( !regex.number_string_object.test( typeof obj ) || !regex.get_remove_set.test( op ) ) {
			defer.reject( new Error( label.invalidArguments ) );
		} else {
			record = ( regex.number_string.test( typeof obj ) || obj.hasOwnProperty( "data" ) );

			if ( op !== "remove" ) {
				if ( record && !( obj instanceof Object ) ) {
					obj = this.get( obj );
				}

				key = record ? obj.key : obj.id;
			} else if ( op === "remove" && record ) {
				key = obj.key || obj;
			}

			if ( mongo ) {
				mongodb.connect( this.mongodb, ( e, db ) => {
					if ( e ) {
						if ( db ) {
							db.close();
						}

						return defer.reject( e );
					}

					db.collection( this.id, ( e, collection ) => {
						if ( e ) {
							db.close();
							return defer.reject( e );
						}

						if ( op === "get" ) {
							if ( record ) {
								collection.find( { _id: obj.key } ).limit( 1 ).toArray( ( e, recs ) => {
									db.close();

									if ( e ) {
										defer.reject( e );
									} else if ( recs.length === 0 ) {
										defer.resolve( null );
									} else {
										delete recs[ 0 ]._id;

										this.set( key, recs[ 0 ], true ).then( ( rec ) => {
											defer.resolve( rec );
										}, ( e ) => {
											defer.reject( e );
										} );
									}
								} );
							} else {
								collection.find( {} ).toArray( ( e, recs ) => {
									let i, nth;

									if ( e ) {
										db.close();
										return defer.reject( e );
									}

									i = -1;
									nth = recs.length;

									if ( nth > 0 ) {
										this.records = recs.map( ( r ) => {
											let rec = { key: r._id, index: ++i, data: {} };

											this.indexes.key[ rec.key ] = rec.index;
											rec.data = r;
											delete rec.data._id;
											this.setIndexes( rec );

											return rec;
										} );

										this.total = nth;
									}

									db.close();
									defer.resolve( this.records );
								} );
							}
						} else if ( op === "remove" ) {
							collection.remove( record ? { _id: key } : {}, { safe: true }, ( e, arg ) => {
								db.close();

								if ( e ) {
									defer.reject( e );
								} else {
									defer.resolve( arg );
								}
							} );
						} else if ( op === "set" ) {
							if ( record ) {
								collection.update( { _id: obj.key }, obj.data, {
									w: 1,
									safe: true,
									upsert: true
								}, ( e, arg ) => {
									db.close();

									if ( e ) {
										defer.reject( e );
									} else {
										defer.resolve( arg );
									}
								} );
							} else {
								// Removing all documents & re-inserting
								collection.remove( {}, { w: 1, safe: true }, ( e ) => {
									let deferreds;

									if ( e ) {
										db.close();
										return defer.reject( e );

									} else {
										deferreds = [];

										array.each( this.records, ( i ) => {
											let data = {};
											let defer2 = deferred();

											deferreds.push( defer2 );

											utility.iterate( i.data, ( v, k ) => {
												data[ k ] = v;
											} );

											collection.update( { _id: i.key }, data, {
												w: 1,
												safe: true,
												upsert: true
											}, ( e, arg ) => {
												if ( e ) {
													defer2.reject( e );
												} else {
													defer2.resolve( arg );
												}
											} );
										} );

										utility.when( deferreds ).then( ( result ) => {
											db.close();
											defer.resolve( result );
										}, ( e ) => {
											db.close();
											defer.reject( e );
										} );
									}
								} );
							}
						} else {
							db.close();
							defer.reject( null );
						}
					} );
				} );
			} else {
				if ( op === "get" ) {
					result = session ? sessionStorage.getItem( key ) : localStorage.getItem( key );

					if ( result !== null ) {
						result = json.decode( result );

						if ( record ) {
							this.set( key, result, true ).then( ( rec ) => {
								defer.resolve( rec );
							}, ( e ) => {
								defer.reject( e );
							} );
						} else {
							utility.merge( self, result );
							defer.resolve( self );
						}
					} else {
						defer.resolve( self );
					}

					// Decorating loaded state for various code paths
					defer.then( () => {
						this.loaded = true;
					}, ( e ) => {
						throw e;
					} );
				} else if ( op === "remove" ) {
					session ? sessionStorage.removeItem( key ) : localStorage.removeItem( key );
					defer.resolve( this );
				} else if ( op === "set" ) {
					data = json.encode( record ? obj.data : {
						total: this.total,
						index: this.index,
						indexes: this.indexes,
						records: this.records
					} );
					session ? sessionStorage.setItem( key, data ) : localStorage.setItem( key, data );
					defer.resolve( this );
				} else {
					defer.reject( null );
				}
			}
		}

		return defer;
	}

	/**
	 * Syncs the DataStore with a URI representation
	 *
	 * @method sync
	 * @memberOf keigai.DataStore
	 * @return {Object} {@link keigai.Deferred}
	 * @fires keigai.DataStore#beforeSync Fires before syncing the DataStore
	 * @fires keigai.DataStore#afterSync Fires after syncing the DataStore
	 * @fires keigai.DataStore#failedSync Fires when an exception occurs
	 * @example
	 * store.sync().then( ( records ) => {
	 *   ...
	 * }, ( err ) => {
	 *   ...
	 * } );
	 */
	sync () {
		let events = ( this.events === true );
		let defer = deferred();

		/**
		 * Resolves public deferred
		 *
		 * @method success
		 * @memberOf keigai.DataStore.sync
		 * @private
		 * @param  {Object} arg API response
		 * @return {Undefined}  undefined
		 */
		let success = ( arg ) => {
			let data;

			if ( typeof arg !== "object" ) {
				return failure( new Error( label.expectedObject ) );
			}

			if ( this.source !== null ) {
				arg = utility.walk( arg, this.source );
			}

			if ( arg instanceof Array ) {
				data = arg;
			} else {
				data = [ arg ];
			}

			this.batch( "set", data, true ).then( ( arg ) => {
				if ( events ) {
					this.dispatch( "afterSync", arg );
				}

				defer.resolve( arg );
			}, failure );
		};

		/**
		 * Rejects public deferred
		 *
		 * @method failure
		 * @memberOf keigai.DataStore.sync
		 * @private
		 * @param  {Object} e Error instance
		 * @return {Undefined} undefined
		 */
		let failure = ( e ) => {
			if ( events ) {
				this.dispatch( "failedSync", e );
			}

			defer.reject( e );
		};

		if ( this.uri === null || string.isEmpty( this.uri ) ) {
			defer.reject( new Error( label.invalidArguments ) );
		} else {
			if ( events ) {
				this.dispatch( "beforeSync", this.uri );
			}

			if ( this.callback !== null ) {
				client.jsonp( this.uri, { callback: this.callback } ).then( success, failure );
			} else {
				client.request( this.uri, "GET", null, utility.merge( { withCredentials: this.credentials }, this.headers ) ).then( success, failure );
			}
		}

		return defer;
	}

	/**
	 * Tears down a store & expires all records associated to an API
	 *
	 * @method teardown
	 * @memberOf keigai.DataStore
	 * @return {Object} {@link keigai.DataStore}
	 * @example
	 * store.teardown();
	 */
	teardown () {
		let uri = this.uri;
		let id;

		if ( uri !== null ) {
			cache.expire( uri, true );

			id = this.id + "DataExpire";
			utility.clearTimers( id );

			array.each( this.records, ( i ) => {
				let recordUri = uri + "/" + i.key;

				cache.expire( recordUri, true );
			} );
		}

		array.each( this.lists, ( i ) => {
			i.teardown( true );
		} );

		this.clear( true );
		this.dispatch( "afterTeardown" );

		return this;
	}

	/**
	 * Undoes the last modification to a record, if it exists
	 *
	 * @method undo
	 * @memberOf keigai.DataStore
	 * @param  {Mixed}  key     Key or index
	 * @param  {String} version [Optional] Version to restore
	 * @return {Object}         Deferred
	 * @example
	 * // Didn't like the new version, so undo the change
	 * store.undo( "key", "v1" );
	 */
	undo ( key, version ) {
		let record = this.get( key );
		let defer = deferred();
		let versions = this.versions[ record.key ];
		let previous;

		if ( record === undefined ) {
			defer.reject( new Error( label.invalidArguments ) );
		} else {
			if ( versions ) {
				previous = versions.get( version || versions.first );

				if ( previous === undefined ) {
					defer.reject( label.datastoreNoPrevVersion );
				} else {
					this.set( key, previous ).then( ( arg ) => {
						defer.resolve( arg );
					}, ( e ) => {
						defer.reject( e );
					} );
				}
			} else {
				defer.reject( label.datastoreNoPrevVersion );
			}
		}

		return defer;
	}

	/**
	 * Returns Array of unique values of `key`
	 *
	 * @method unique
	 * @memberOf keigai.DataStore
	 * @param  {String} key Field to compare
	 * @return {Array}      Array of values
	 * @example
	 * let ages = store.unique( "age" );
	 */
	unique ( key ) {
		return array.unique( this.records.map( ( i ) => {
			return i.data[ key ];
		} ) );
	}

	/**
	 * Applies a difference to a record
	 *
	 * Use `data.set()` if `data` is the complete field set
	 *
	 * @method update
	 * @memberOf keigai.DataStore
	 * @param  {Mixed}  key  Key or index
	 * @param  {Object} data Key:Value pairs to set as field values
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * store.update( "key", {age: 34} );
	 */
	update ( key, data ) {
		let record = this.get( key );
		let defer = deferred();

		if ( record === undefined ) {
			defer.reject( new Error( label.invalidArguments ) );
		} else {
			this.set( key, utility.merge( record.data, data ) ).then( ( arg ) => {
				defer.resolve( arg );
			}, ( e ) => {
				defer.reject( e );
			} );
		}

		return defer;
	};
}

/**
 * @namespace store
 */
let store = {
	/**
	 * Decorates a DataStore on an Object
	 *
	 * @method factory
	 * @memberOf store
	 * @param  {Mixed}  recs [Optional] Data to set with this.batch
	 * @param  {Object} args [Optional] Arguments to set on the store
	 * @return {Object} {@link keigai.DataStore}
	 * @example
	 * let store = keigai.store(null, {key: "guid"});
	 *
	 * store.setUri( "http://..." ).then( ( records ) => {
	 *   // Do something with the records
	 * }, ( e ) => {
	 *   // Handle `e`
	 * } );
	 */
	factory: function ( recs, args ) {
		let obj = new DataStore();

		if ( args instanceof Object ) {
			utility.merge( obj, args );
		}

		if ( recs !== null && typeof recs === "object" ) {
			obj.batch( "set", recs );
		}

		return obj;
	},

	/**
	 * DataStore worker handler
	 *
	 * @method worker
	 * @memberOf store
	 * @param  {Object} ev Event
	 * @return {Undefined} undefined
	 * @private
	 */
	worker: function ( ev ) {
		let cmd = ev.data.cmd;
		let records = ev.data.records;
		let clauses, cond, functions, indexes, index, result, sorted, where, values;

		if ( cmd === "select" ) {
			where = JSON.parse( ev.data.where );
			functions = ev.data.functions;
			clauses = array.fromObject( where );
			sorted = array.flat( clauses ).filter( ( i, idx ) => {
				return idx % 2 === 0;
			} ).sort( array.sort );
			index = sorted.join( "|" );
			values = sorted.map( ( i ) => {
				return where[ i ];
			} ).join( "|" );
			indexes = ev.data.indexes;
			cond = "return ( ";

			if ( functions.length === 0 && indexes[ index ] ) {
				result = ( indexes[ index ][ values ] || [] ).map( ( i ) => {
					return records[ i ];
				} );
			} else {
				if ( clauses.length > 1 ) {
					array.each( clauses, ( i, idx ) => {
						let b1 = "( ";

						if ( idx > 0 ) {
							b1 = " && ( ";
						}

						if ( array.contains( functions, i[ 0 ] ) ) {
							cond += b1 + i[ 1 ] + "( rec.data[\"" + i[ 0 ] + "\"] ) )";
						} else if ( !isNaN( i[ 1 ] ) ) {
							cond += b1 + "rec.data[\"" + i[ 0 ] + "\"] === " + i[ 1 ] + " )";
						} else {
							cond += b1 + "rec.data[\"" + i[ 0 ] + "\"] === \"" + i[ 1 ] + "\" )";
						}
					} );
				} else {
					if ( array.contains( functions, clauses[ 0 ][ 0 ] ) ) {
						cond += clauses[ 0 ][ 1 ] + "( rec.data[\"" + clauses[ 0 ][ 0 ] + "\"] )";
					} else if ( !isNaN( clauses[ 0 ][ 1 ] ) ) {
						cond += "rec.data[\"" + clauses[ 0 ][ 0 ] + "\"] === " + clauses[ 0 ][ 1 ];
					} else {
						cond += "rec.data[\"" + clauses[ 0 ][ 0 ] + "\"] === \"" + clauses[ 0 ][ 1 ] + "\"";
					}
				}

				cond += " );";

				result = records.filter( new Function( "rec", cond ) );
			}
		} else if ( cmd === "sort" ) {
			result = array.keySort( records, ev.data.query, "data" );
		}

		postMessage( result );
	}
};

/**
 * @namespace string
 */
let string = {
	/**
	 * Capitalizes the String
	 *
	 * @method capitalize
	 * @memberOf string
	 * @param  {String}  obj String to capitalize
	 * @param  {Boolean} all [Optional] Capitalize each word
	 * @return {String}      Capitalized String
	 * @example
	 * keigai.util.string.capitalize( "hello" ); // "Hello"
	 */
	capitalize: function ( obj, all=false ) {
		let result;

		if ( all ) {
			result = string.explode( obj, " " ).map( function ( i ) {
				return i.charAt( 0 ).toUpperCase() + i.slice( 1 );
			} ).join( " " );
		} else {
			result = obj.charAt( 0 ).toUpperCase() + obj.slice( 1 );
		}

		return result;
	},

	/**
	 * Escapes meta characters within a string
	 *
	 * @method escape
	 * @memberOf string
	 * @param  {String} obj String to escape
	 * @return {String}     Escaped string
	 * @example
	 * keigai.util.string.escape( "{hello}" ); // "\{hello\}"
	 */
	escape: function ( obj ) {
		return obj.replace( /[\-\[\]{}()*+?.,\\\/\^\$|#\s]/g, "\\$&" );
	},

	/**
	 * Splits a string on comma, or a parameter, and trims each value in the resulting Array
	 *
	 * @method explode
	 * @memberOf string
	 * @param  {String} obj String to capitalize
	 * @param  {String} arg String to split on
	 * @return {Array}      Array of the exploded String
	 * @example
	 * keigai.util.array.each( keigai.util.string.explode( "abc, def" ), ( i ) => {
	 *   ...
	 * } );
	 */
	explode: function ( obj, arg="," ) {
		return string.trim( obj ).split( new RegExp( "\\s*" + arg + "\\s*" ) );
	},

	/**
	 * Creates a String representation of an Object, preserving Functions
	 *
	 * Nested Objects are not supported
	 *
	 * @method fromObject
	 * @memberOf string
	 * @param  {Object} obj  Object to convert
	 * @param  {String} name [Optional] Name of Object
	 * @return {String}      String representation
	 * @example
	 * keigai.util.string.fromObject( {a: true, b: false}, "stats" ); // "stats = {'a': true,'b':false}"
	 */
	fromObject: function ( obj, name ) {
		let result = ( name ? name + " = {" : "{" ) + "\n";

		utility.iterate( obj, function ( v, k ) {
			result += "\"" + k + "\":" + v.toString() + ",\n";
		} );

		result = result.replace( /\[object Object\]/g, "{}" ).replace( /,\n$/, "\n" ) + "}";

		return result;
	},

	/**
	 * Replaces all spaces in a string with dashes
	 *
	 * @method hyphenate
	 * @memberOf string
	 * @param  {String} obj   String to hyphenate
	 * @param {Boolean} camel [Optional] Hyphenate camelCase
	 * @return {String}       String with dashes instead of spaces
	 * @example
	 * keigai.util.string.hyphenate( "hello world" ); // "hello-world"
	 */
	hyphenate: function ( obj, camel=false ) {
		let result = string.trim( obj ).replace( /\s+/g, "-" );

		if ( camel === true ) {
			result = result.replace( /([A-Z])/g, "-$1" ).toLowerCase();
		}

		return result;
	},

	/**
	 * Tests if a string is a boolean
	 *
	 * @method isBoolean
	 * @memberOf string
	 * @param  {String}  obj String to test
	 * @return {Boolean}     Result of test
	 * @example
	 * if ( keigai.util.string.isBoolean( ... ) {
	 *   ...
	 * } );
	 */
	isBoolean: function ( obj ) {
		return regex.bool.test( obj );
	},

	/**
	 * Tests if a string is empty
	 *
	 * @method isEmpty
	 * @memberOf string
	 * @param  {String}  obj String to test
	 * @return {Boolean}     Result of test
	 * @example
	 * if ( !keigai.util.string.isEmpty( ... ) {
	 *   ...
	 * } );
	 */
	isEmpty: function ( obj ) {
		return string.trim( obj ) === "";
	},

	/**
	 * Tests if a string is a number
	 *
	 * @method isNumber
	 * @memberOf string
	 * @param  {String}  obj String to test
	 * @return {Boolean}     Result of test
	 * @example
	 * if ( keigai.util.string.isNumber( ... ) {
	 *   ...
	 * } );
	 */
	isNumber: function ( obj ) {
		return regex.number.test( obj );
	},

	/**
	 * Tests if a string is a URL
	 *
	 * @method isUrl
	 * @memberOf string
	 * @param  {String}  obj String to test
	 * @return {Boolean}     Result of test
	 * @example
	 * if ( keigai.util.string.isUrl( ... ) {
	 *   ...
	 * } );
	 */
	isUrl: function ( obj ) {
		return regex.url.test( obj );
	},

	/**
	 * Transforms the case of a String into CamelCase
	 *
	 * @method toCamelCase
	 * @memberOf string
	 * @param  {String} obj String to capitalize
	 * @return {String}     Camel case String
	 * @example
	 * keigai.util.string.toCamelCase( "hello world" ); // "helloWorld"
	 */
	toCamelCase: function ( obj ) {
		let s = string.trim( obj ).replace( /\.|_|-|\@|\[|\]|\(|\)|\#|\$|\%|\^|\&|\*|\s+/g, " " ).toLowerCase().split( regex.space_hyphen );
		let r = [];

		array.each( s, function ( i, idx ) {
			r.push( idx === 0 ? i : string.capitalize( i ) );
		} );

		return r.join( "" );
	},

	/**
	 * Returns singular form of the string
	 *
	 * @method singular
	 * @memberOf string
	 * @param  {String} obj String to transform
	 * @return {String}     Transformed string
	 * @example
	 * keigai.util.string.singular( "cans" ); // "can"
	 */
	singular: function ( obj ) {
		return obj.replace( /oe?s$/, "o" ).replace( /ies$/, "y" ).replace( /ses$/, "se" ).replace( /s$/, "" );
	},

	/**
	 * Casts a String to a Function
	 *
	 * @method toFunction
	 * @memberOf string
	 * @param  {String} obj String to cast
	 * @return {Function}   Function
	 * @example
	 * let fn = someFunction.toString();
	 *
	 * ...
	 *
	 * let func = keigai.util.string.toFunction( fn );
	 */
	toFunction: function ( obj ) {
		let args = string.trim( obj.replace( /^.*\(/, "" ).replace( /[\t|\r|\n|\"|\']+/g, "" ).replace( /\).*/, "" ) );
		let body = string.trim( obj.replace( /^.*\{/, "" ).replace( /\}$/, "" ) );

		return Function.apply( Function, string.explode( args ).concat( [ body ] ) );
	},

	/**
	 * Trims the whitespace around a String
	 *
	 * @method trim
	 * @memberOf string
	 * @param  {String} obj String to capitalize
	 * @return {String}     Trimmed String
	 * @example
	 * keigai.util.string.trim( "  hello world " ); // "hello world"
	 */
	trim: function ( obj ) {
		return obj.replace( /^(\s+|\t+|\n+)|(\s+|\t+|\n+)$/g, "" );
	},

	/**
	 * Uncamelcases the String
	 *
	 * @method unCamelCase
	 * @memberOf string
	 * @param  {String} obj String to uncamelcase
	 * @return {String}     Uncamelcased String
	 */
	unCamelCase: function ( obj ) {
		return string.trim( obj.replace( /([A-Z])/g, " $1" ).toLowerCase() );
	},

	/**
	 * Uncapitalizes the String
	 *
	 * @method uncapitalize
	 * @memberOf string
	 * @param  {String} obj String to uncapitalize
	 * @return {String}     Uncapitalized String
	 * @example
	 * keigai.util.string.uncapitalize( "Hello" ); // "hello"
	 */
	uncapitalize: function ( obj ) {
		let result = string.trim( obj );

		return result.charAt( 0 ).toLowerCase() + result.slice( 1 );
	},

	/**
	 * Replaces all hyphens with spaces
	 *
	 * @method unhyphenate
	 * @memberOf string
	 * @param  {String}  obj  String to unhypenate
	 * @param  {Boolean} caps [Optional] True to capitalize each word
	 * @return {String}       Unhyphenated String
	 * @example
	 * keigai.util.string.unhyphenate( "hello-world" );       // "hello world"
	 * keigai.util.string.unhyphenate( "hello-world", true ); // "Hello World"
	 */
	unhyphenate: function ( obj, caps=false ) {
		if ( caps !== true ) {
			return string.explode( obj, "-" ).join( " " );
		} else {
			return string.explode( obj, "-" ).map( ( i ) => {
				return string.capitalize( i );
			} ).join( " " );
		}
	}
};

/**
 * @namespace utility
 */
let utility = {
	/**
	 * Collection of timers
	 *
	 * @memberOf utility
	 * @type {Object}
	 * @private
	 */
	timer: {},

	/**
	 * Creates Elements or Queries the DOM using CSS selectors
	 *
	 * @method $
	 * @memberOf utility
	 * @param  {Mixed} arg HTML, or Comma delimited string of CSS selectors
	 * @return {Array}     Array of matching Elements
	 * @example
	 * let $ = keigai.util.$;
	 *
	 * // Looking for Elements
	 * $( ".someClass" ).forEach( function ( i ) {
	 *   ...
	 * } );
	 *
	 * // Creating an H1 Element
	 * $( "&lt;h1&gt;" ).forEach( function ( i ) {
	 *   ...
	 * } );
	 */
	$: function ( arg ) {
		let result;

		// Nothing
		if ( !arg ) {
		}
		// HTML
		else if ( regex.html.test( arg ) ) {
			result = [ element.create( arg ) ];
		}
		// CSS selector(s)
		else {
			arg = string.trim( arg );

			if ( arg.indexOf( "," ) === -1 ) {
				result = utility.dom( arg );

				if ( result ) {
					if ( isNaN( result.length ) ) {
						result = [ result ];
					}
				} else {
					result = [];
				}
			} else {
				result = [];

				array.each( string.explode( arg ), ( query ) => {
					let obj = utility.dom( query );

					if ( obj instanceof Array ) {
						result = result.concat( obj );
					} else if ( obj ) {
						result.push( obj );
					}
				} );
			}
		}

		return result;
	},

	/**
	 * Writes the banner to the console
	 *
	 * @method banner
	 * @memberOf utility
	 * @return {Undefined} undefined
	 * @example
	 * keigai.util.banner();
	 */
	banner: function () {
		console.log( [" __          .__             .__   ____     ________      ____  ______  ","|  | __ ____ |__| _________  |__| /_   |    \\_____  \\    /_   |/  __  \\ ","|  |/ // __ \\|  |/ ___\\__  \\ |  |  |   |      _(__  <     |   |>      < ","|    <\\  ___/|  / /_/  > __ \\|  |  |   |     /       \\    |   /   --   \\","|__|_ \\\\___  >__\\___  (____  /__|  |___| /\\ /______  / /\\ |___\\______  /","     \\/    \\/  /_____/     \\/            \\/        \\/  \\/            \\/ "].join( "\n" ) );
	},

	/**
	 * Creates an instance of Base
	 *
	 * @method base
	 * @memberOf utility
	 * @param  {Object} arg [Optional] Decorative Object
	 * @return {Object}     Instance of Base
	 */
	base: function ( arg ) {
		let obj = new Base();

		if ( arg instanceof Object ) {
			utility.merge( obj, arg );
		}

		obj.observer = observable();

		return obj;
	},

	/**
	 * Blob factory
	 *
	 * @method blob
	 * @memberOf utility
	 * @param  {String} arg String to convert to a Blob
	 * @return {Object}     Blob
	 * @private
	 */
	blob: function ( arg ) {
		let obj;

		try {
			obj = new Blob( [ arg ], { type: "application/javascript" } );
		}
		catch ( e ) {
			if ( !global.BlobBuilder ) {
				global.BlobBuilder = global.MSBlobBuilder || global.WebKitBlobBuilder || global.MozBlobBuilder;
			}

			obj = new global.BlobBuilder().append( arg ).getBlob();
		}

		return obj;
	},

	/**
	 * Clears deferred & repeating functions
	 *
	 * @method clearTimers
	 * @memberOf utility
	 * @param  {String} id ID of timer( s )
	 * @return {Undefined} undefined
	 * @example
	 * keigai.util.clearTimers( 'helloWorld' );
	 */
	clearTimers: function ( id ) {
		if ( utility.timer[ id ] ) {
			clearTimeout( utility.timer[ id ] );
			delete utility.timer[ id ];
		}
	},

	/**
	 * Clones an Object
	 *
	 * @method clone
	 * @memberOf utility
	 * @param  {Object}  obj     Object to clone
	 * @param  {Boolean} shallow [Optional] Create a shallow clone, which doesn't maintain prototypes, default is `false`
	 * @return {Object}          Clone of obj
	 * @example
	 * let x = {a: true, b: false},
	 *     y = keigai.util.clone( x, true );
	 *
	 * y.a; // true
	 */
	clone: function ( obj, shallow=false ) {
		let clone, result;

		if ( shallow === true ) {
			return obj !== undefined && obj !== null ? JSON.parse( JSON.stringify( obj ) ) : obj;
		} else if ( !obj || regex.primitive.test( typeof obj ) || ( obj instanceof RegExp ) ) {
			return obj;
		} else if ( obj instanceof Array ) {
			result = [];

			array.each( obj, function ( i, idx ) {
				result[ idx ] = utility.clone( i );
			} );

			return result;
		} else if ( !server && !client.ie && obj instanceof Document ) {
			return xml.decode( xml.encode( obj ) );
		} else if ( typeof obj.__proto__ !== "undefined" ) {
			return utility.extend( obj.__proto__, obj );
		} else if ( obj instanceof Object ) {
			// If JSON encoding fails due to recursion, the original Object is returned because it's assumed this is for decoration
			clone = json.encode( obj, true );

			if ( clone !== undefined ) {
				clone = json.decode( clone );

				// Decorating Functions that would be lost with JSON encoding/decoding
				utility.iterate( obj, function ( v, k ) {
					if ( typeof v === "function" ) {
						clone[ k ] = v;
					}
				} );
			} else {
				clone = obj;
			}

			return clone;
		} else {
			return obj;
		}
	},

	/**
	 * Coerces a String to a Type
	 *
	 * @method coerce
	 * @memberOf utility
	 * @param  {String} value String to coerce
	 * @return {Mixed}        Primitive version of the String
	 * @example
	 * keigai.util.coerce( "1" ); // 1
	 */
	coerce: function ( value ) {
		let tmp;

		if ( value === null || value === undefined ) {
			return undefined;
		} else if ( value === "true" ) {
			return true;
		} else if ( value === "false" ) {
			return false;
		} else if ( value === "null" ) {
			return null;
		} else if ( value === "undefined" ) {
			return undefined;
		} else if ( value === "" ) {
			return value;
		} else if ( !isNaN( tmp = Number( value ) ) ) {
			return tmp;
		} else if ( regex.json_wrap.test( value ) ) {
			return json.decode( value, true ) || value;
		} else {
			return value;
		}
	},

	/**
	 * Recompiles a RegExp by reference
	 *
	 * This is ideal when you need to recompile a regex for use within a conditional statement
	 *
	 * @method compile
	 * @memberOf utility
	 * @param  {Object} regex     RegExp
	 * @param  {String} pattern   Regular expression pattern
	 * @param  {String} modifiers Modifiers to apply to the pattern
	 * @return {Boolean}          true
	 * @private
	 */
	compile: function ( reg, pattern, modifiers ) {
		reg.compile( pattern, modifiers );

		return true;
	},

	/**
	 * Curries a Function
	 *
	 * Note: Function to curry must return a Function
	 *
	 * @method curry
	 * @memberOf utility
	 * @return {Function} Curried Function
	 * @example
	 * function f ( a, b ) {
	 *   return function ( n ) {
	 *     return ( a + b ) * n;
	 *   };
	 * }
	 *
	 * let g = keigai.util.curry( f, 2, 8 );
	 *
	 * g( 5 ); // 50
	 */
	curry: function ( fn, ...x ) {
		let cfn = fn.apply( fn, x );

		return function ( ...y ) {
			return cfn.apply( cfn, y );
		};
	},

	/**
	 * Defers the execution of Function by at least the supplied milliseconds.
	 * Timing may vary under "heavy load" relative to the CPU & client JavaScript engine.
	 *
	 * @method defer
	 * @memberOf utility
	 * @param  {Function} fn Function to defer execution of
	 * @param  {Number}   ms Milliseconds to defer execution
	 * @param  {Number}   id [Optional] ID of the deferred function
	 * @return {String}      ID of the timer
	 * @example
	 * keigai.util.defer( () => {
	 *   console.log( 'hello world' );
	 * }, 1000, 'helloWorld' );
	 */
	defer: function ( fn, ms=0, id=undefined ) {
		if ( typeof id === "string" ) {
			utility.clearTimers( id );
		} else {
			id = utility.uuid( true );
		}

		utility.timer[ id ] = setTimeout( function () {
			utility.clearTimers( id );
			fn();
		}, ms );

		return id;
	},

	/**
	 * Async delay strategy
	 *
	 * @method delay
	 * @memberOf promise
	 * @return {Function} Delay method
	 * @example
	 * keigai.util.next( function () {
	 *   console.log( 'On the next tick' );
	 * } );
	 */
	delay: ( function () {
		if ( typeof setImmediate !== "undefined" ) {
			return function ( arg ) {
				setImmediate( arg );
			};
		} else if ( typeof process !== "undefined" ) {
			return process.nextTick;
		} else {
			return function ( arg ) {
				setTimeout( arg, 0 );
			};
		}
	} )(),

	/**
	 * Queries DOM with fastest method
	 *
	 * @method dom
	 * @memberOf utility
	 * @param  {String} arg DOM query
	 * @return {Mixed}      undefined, Element, or Array of Elements
	 * @private
	 */
	dom: function ( arg ) {
		let result;

		if ( !regex.selector_complex.test( arg ) ) {
			if ( regex.hash.test( arg ) ) {
				result = document.getElementById( arg.replace( regex.hash, "" ) ) || undefined;
			} else if ( regex.klass.test( arg ) ) {
				result = array.cast( document.getElementsByClassName( arg.replace( regex.klass, "" ) ) );
			} else if ( regex.word.test( arg ) ) {
				result = array.cast( document.getElementsByTagName( arg ) );
			} else {
				result = array.cast( document.querySelectorAll( arg ) );
			}
		} else {
			result = array.cast( document.querySelectorAll( arg ) );
		}

		return result;
	},

	/**
	 * Encodes a UUID to a DOM friendly ID
	 *
	 * @method domId
	 * @memberOf utility
	 * @param  {String} UUID
	 * @return {String} DOM friendly ID
	 * @private
	 */
	domId: function ( arg ) {
		return "a" + arg.replace( /-/g, "" ).slice( 1 );
	},

	/**
	 * Equality verification
	 *
	 * @method equal
	 * @memberOf utility
	 * @param  {Mixed}   a Argument to compare
	 * @param  {Array}   b Argument to compare
	 * @return {Boolean}   `true` if equal
	 * @private
	 */
	equal: function ( a, b ) {
		return json.encode( a, true ) === json.encode( b, true );
	},

	/**
	 * Error handling, with history in `error.log`
	 *
	 * @method error
	 * @memberOf utility
	 * @param  {Mixed}   e       Error object or message to display
	 * @param  {Array}   args    Array of arguments from the callstack
	 * @param  {Mixed}   scope   Entity that was "this"
	 * @param  {Boolean} warning [Optional] Will display as console warning if true
	 * @return {Object}          Error descriptor
	 * @private
	 */
	error: function ( e, args, scope, warning ) {
		let o = {
			"arguments": args ? array.cast( args ) : [],
			message: e.message || e,
			number: e.number ? ( e.number & 0xFFFF ) : undefined,
			scope: scope,
			stack: e.stack || undefined,
			timestamp: new Date().toUTCString(),
			type: e.type || "TypeError"
		};

		utility.log( o.stack || o.message, warning !== true ? "error" : "warn" );

		return o;
	},

	/**
	 * Creates a "class" extending Object, with optional decoration. SuperClass can be called from `super` property.
	 *
	 * @method extend
	 * @memberOf utility
	 * @param  {Object} obj Object to extend
	 * @param  {Object} arg [Optional] Object for decoration
	 * @return {Object}     Decorated obj
	 * @example
	 * let extendObj = keigai.util.extend( someObj, {newProperty: value} );
	 */
	extend: function ( obj, arg ) {
		let o = Object.create( obj );

		if ( arg instanceof Object ) {
			utility.merge( o, arg );
		}

		o[ "super" ] = obj;

		return o;
	},

	/**
	 * Generates an ID value
	 *
	 * @method genId
	 * @memberOf utility
	 * @param  {Mixed}   obj [Optional] Object to receive id
	 * @param  {Boolean} dom [Optional] Verify the ID is unique in the DOM, default is false
	 * @return {Mixed}       Object or id
	 * @example
	 * let id = keigai.util.genId();
	 */
	genId: function ( obj, dom=false ) {
		let id;

		if ( obj && ( obj.id || ( obj instanceof Array ) || ( typeof obj === "string" || obj instanceof String ) ) ) {
			return obj;
		}

		if ( dom ) {
			do {
				id = utility.domId( utility.uuid( true ) );
			}
			while ( utility.dom( "#" + id ) );
		} else {
			id = utility.domId( utility.uuid( true ) );
		}

		if ( obj && typeof obj === "object" ) {
			obj.id = id;

			return obj;
		} else {
			return id;
		}
	},

	/**
	 * Iterates an Object and executes a function against the properties.
	 * Returning `false` halts iteration.
	 *
	 * @method iterate
	 * @memberOf utility
	 * @param  {Object}   obj Object to iterate
	 * @param  {Function} fn  Function to execute against properties
	 * @return {Object}       Object
	 * @example
	 * keigai.util.iterate( {...}, ( value, key ) => {
	 *   ...
	 * } );
	 */
	iterate: function ( obj, fn ) {
		array.each( Object.keys( obj ), function ( i ) {
			return fn.call( obj, obj[ i ], i );
		} );

		return obj;
	},

	/**
	 * Writes argument to the console
	 *
	 * @method log
	 * @memberOf utility
	 * @param  {String} arg    String to write to the console
	 * @param  {String} target [Optional] Target console, default is "log"
	 * @return {Undefined}     undefined
	 * @example
	 * keigai.util.log( "Something bad happened", "warn" );
	 */
	log: function ( arg, target="log" ) {
		let msg = typeof arg !== "object" ? "[" + new Date().toLocaleTimeString() + "] " + arg : arg;

		console[ target ]( msg );
	},

	/**
	 * Merges obj with arg
	 *
	 * @method merge
	 * @memberOf utility
	 * @param  {Object} obj Object to decorate
	 * @param  {Object} arg Decoration
	 * @return {Object}     Decorated Object
	 * @example
	 * let obj = {a: true};
	 *
	 * keigai.util.merge( obj, {b: false} )
	 * console.log(obj); // {a: true, b: false}
	 */
	merge: function ( obj, arg ) {
		if ((obj instanceof Object) && (arg instanceof Object)) {
			Object.keys(arg).forEach(function (i) {
				if ((obj[i] instanceof Object) && (arg[i] instanceof Object)) {
					obj[i] = utility.merge(obj[i], arg[i]);
				} else if ((obj[i] instanceof Array) && (arg[i] instanceof Array)) {
					obj[i] = obj[i].concat(d[i]);
				} else {
					obj[i] = arg[i];
				}
			});
		} else if ((obj instanceof Array) && (arg instanceof Array)) {
			obj = obj.concat(arg);
		} else {
			obj = arg;
		}

		return obj;
	},

	/**
	 * Parses a URI into an Object
	 *
	 * @method parse
	 * @memberOf utility
	 * @param  {String} uri URI to parse
	 * @return {Object}     Parsed URI
	 * @example
	 * let parsed = keigai.util.parse( location.href );
	 *
	 * parsed;
	 * {
	 *   auth     : "",
	 *   hash     : "",
	 *   host     : "",
	 *   hostname : "",
	 *   query    : {},
	 *   pathname : "",
	 *   port     : n,
	 *   protocol : "",
	 *   search   : "",
	 * }
	 */
	parse: function ( uri ) {
		let obj = {};
		let host, parsed, protocol;

		if ( uri === undefined ) {
			uri = !server ? location.href : "";
		}

		if ( !server ) {
			obj = document.createElement( "a" );
			obj.href = uri;
			host = obj.href.match( regex.host )[ 1 ];
			protocol = obj.href.match( regex.protocol )[ 1 ];
		} else {
			obj = url.parse( uri );
		}

		if ( server ) {
			utility.iterate( obj, function ( v, k ) {
				if ( v === null ) {
					obj[ k ] = undefined;
				}
			} );
		}

		parsed = {
			auth: server ? null : regex.auth.exec( uri ),
			protocol: obj.protocol || protocol,
			hostname: obj.hostname || host,
			port: obj.port ? number.parse( obj.port, 10 ) : "",
			pathname: obj.pathname,
			search: obj.search || "",
			hash: obj.hash || "",
			host: obj.host || host
		};

		// 'cause IE is ... IE; required for data.batch()
		if ( client.ie ) {
			if ( parsed.protocol === ":" ) {
				parsed.protocol = location.protocol;
			}

			if ( string.isEmpty( parsed.hostname ) ) {
				parsed.hostname = location.hostname;
			}

			if ( string.isEmpty( parsed.host ) ) {
				parsed.host = location.host;
			}

			if ( parsed.pathname.charAt( 0 ) !== "/" ) {
				parsed.pathname = "/" + parsed.pathname;
			}
		}

		parsed.auth = obj.auth || ( parsed.auth === null ? "" : parsed.auth[ 1 ] );
		parsed.href = obj.href || ( parsed.protocol + "//" + ( string.isEmpty( parsed.auth ) ? "" : parsed.auth + "@" ) + parsed.host + parsed.pathname + parsed.search + parsed.hash );
		parsed.path = obj.path || parsed.pathname + parsed.search;
		parsed.query = utility.queryString( null, parsed.search );

		return parsed;
	},

	/**
	 * Creates a partially applied Function
	 *
	 * @method partial
	 * @memberOf utility
	 * @return {Function} Partial Function
	 * @example
	 * function f ( a, b ) {
	 *   return a + b;
	 * }
	 *
	 * let g = keigai.util.partial( f, 2 );
	 *
	 * g( 2 ); // 4
	 */
	partial: function ( fn, ...args ) {
		return function ( ...args2 ) {
			return fn.apply( fn, args.concat( args2 ) );
		};
	},

	/**
	 * Prevents default behavior of an Event
	 *
	 * @method prevent
	 * @memberOf utility
	 * @param  {Object} ev Event
	 * @return {Object}    Event
	 * @example
	 * keigai.util.prevent( Event );
	 */
	prevent: function ( ev ) {
		if ( typeof ev.preventDefault === "function" ) {
			ev.preventDefault();
		}

		return ev;
	},

	/**
	 * Parses a query string & coerces values
	 *
	 * @method queryString
	 * @memberOf utility
	 * @param  {String} arg     [Optional] Key to find in the querystring
	 * @param  {String} qstring [Optional] Query string to parse
	 * @return {Mixed}          Value or Object of key:value pairs
	 */
	queryString: function ( arg, qstring="" ) {
		let obj = {};
		let aresult = ( qstring || location.search || "" ).split( "?" );
		let result;

		if ( aresult.length > 1 ) {
			aresult.shift();
		}

		result = aresult.join( "?" );

		array.each( result.split( "&" ), function ( prop ) {
			let aitem = prop.split( "=" );
			let item;

			if ( aitem.length > 2 ) {
				item = [ aitem.shift(), aitem.join( "=" ) ];
			} else {
				item = aitem;
			}

			if ( string.isEmpty( item[ 0 ] ) ) {
				return;
			}

			if ( item[ 1 ] === undefined ) {
				item[ 1 ] = "";
			} else {
				item[ 1 ] = utility.coerce( decodeURIComponent( item[ 1 ] ) );
			}

			if ( obj[ item[ 0 ] ] === undefined ) {
				obj[ item[ 0 ] ] = item[ 1 ];
			} else if ( !( obj[ item[ 0 ] ] instanceof Array ) ) {
				obj[ item[ 0 ] ] = [ obj[ item[ 0 ] ] ];
				obj[ item[ 0 ] ].push( item[ 1 ] );
			} else {
				obj[ item[ 0 ] ].push( item[ 1 ] );
			}
		} );

		return typeof arg === "string" ? utility.walk( obj, arg ) : obj;
	},

	/**
	 * Accepts Deferreds or Promises as arguments, or an Array of either
	 *
	 * @method race
	 * @memberOf utility
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * let deferreds = [],
	 *     defer1    = keigai.util.defer(),
	 *     defer2    = keigai.util.defer();
	 *
	 * deferreds.push( defer1 );
	 * deferreds.push( defer2 );
	 *
	 * // Executes when one deferred is resolved or rejected
	 * keigai.util.race( deferreds ).then( function ( arg ) ) {
	 *   ...
	 * }, function ( err ) {
	 *   ...
	 * } );
	 *
	 * ...
	 *
	 * defer1.resolve( true );
	 * defer2.resolve( true );
	 */
	race: function ( ...args ) {
		let defer = deferred();

		// Did we receive an Array? if so it overrides any other arguments
		if ( args[ 0 ] instanceof Array ) {
			args = args[ 0 ];
		}

		// None, end on next tick
		if ( args.length === 0 ) {
			defer.resolve( null );
		}
		// Setup and wait
		else {
			Promise.race( args ).then( function ( results ) {
				defer.resolve( results );
			}, function ( e ) {
				defer.reject( e );
			} );
		}

		return defer;
	},

	/**
	 * Asynchronous DOM rendering (cannot be cancelled, suggested for reactive behavior)
	 *
	 * @method render
	 * @memberOf utility
	 * @param  {Function} fn Function to execute on next 'frame'
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * keigai.util.render( function () {
	 *     return keitai.util.element.html( document.querySelector( "#id" ), "Hello World" )
	 * } ).then( function ( arg ) {
	 *     // arg is the return value of your function
	 * }, function ( e ) {
	 *     // Handle e
	 * } );
	 */
	render: function ( fn ) {
		let defer = deferred();

		RENDER( function ( arg ) {
			try {
				defer.resolve( fn( arg ) );
			}
			catch ( e ) {
				defer.reject( e );
			}
		} );

		return defer;
	},

	/**
	 * Creates a recursive function. Return false from the function to halt recursion.
	 *
	 * @method repeat
	 * @memberOf utility
	 * @param  {Function} fn  Function to execute repeatedly
	 * @param  {Number}   ms  Milliseconds to stagger the execution
	 * @param  {String}   id  [Optional] Timeout ID
	 * @param  {Boolean}  now Executes `fn` and then setup repetition, default is `true`
	 * @return {String}       Timeout ID
	 * @example
	 * keigai.util.repeat( function () {
	 *   ...
	 *
	 *   // Cancelling repetition at some point in the future
	 *   if ( someCondition ) {
	 *     return false;
	 *   }
	 * }, 1000, "repeating" );
	 */
	repeat: function ( fn, ms=10, id=utility.uuid( true ), now=true ) {
		let recursive;

		// Could be valid to return false from initial execution
		if ( now && fn() === false ) {
			return;
		}

		recursive = function () {
			if ( fn() !== false ) {
				utility.defer( recursive, ms, id )
			}
		};

		utility.defer( recursive, ms, id );

		return id;
	},

	/**
	 * Stops an Event from bubbling, & prevents default behavior
	 *
	 * @method stop
	 * @memberOf utility
	 * @param  {Object} ev Event
	 * @return {Object}    Event
	 * @example
	 * keigai.util.stop( Event );
	 */
	stop: function ( ev ) {
		if ( typeof ev.stopPropagation === "function" ) {
			ev.stopPropagation();
		}

		utility.prevent( ev );

		return ev;
	},

	/**
	 * Returns the Event target
	 *
	 * @method target
	 * @memberOf utility
	 * @param  {Object} ev Event
	 * @return {Object}    Event target
	 * @example
	 * let target = keigai.util.target( Event );
	 */
	target: function ( ev ) {
		return ev.target || ev.srcElement;
	},

	/**
	 * Generates a version 4 UUID
	 *
	 * @method uuid
	 * @memberOf utility
	 * @param  {Boolean} strip [Optional] Strips - from UUID
	 * @return {String}        UUID
	 * @example
	 * let uuid4 = keigai.util.uuid();
	 */
	uuid: function ( strip ) {
		function s () {
			return ( ( ( 1 + Math.random() ) * 0x10000 ) | 0 ).toString( 16 ).substring( 1 );
		}

		let r = [ 8, 9, "a", "b" ];
		let o = ( s() + s() + "-" + s() + "-4" + s().substr( 0, 3 ) + "-" + r[ Math.floor( Math.random() * 4 ) ] + s().substr( 0, 3 ) + "-" + s() + s() + s() );

		if ( strip === true ) {
			o = o.replace( /-/g, "" );
		}

		return o;
	},

	/**
	 * Walks `obj` and returns `arg`, for when you can't easily access `arg`
	 *
	 * @method  walk
	 * @memberOf utility
	 * @param  {Mixed}  obj  Object or Array
	 * @param  {String} arg  String describing the property to return
	 * @return {Mixed}       Target or undefined
	 * @example
	 * let obj = {a: [{b: true}]};
	 *
	 * keigai.util.walk( obj, "a[0].b" ); // true
	 */
	walk: function ( obj, arg ) {
		let output = obj;

		array.each( arg.replace( /\]$/, "" ).replace( /\]/g, "." ).replace( /\.\./g, "." ).split( /\.|\[/ ), function ( i ) {
			if ( output[ i ] === undefined || output[ i ] === null ) {
				output = undefined;
				return false;
			}

			output = output[ i ];
		} );

		return output;
	},

	/**
	 * Accepts Deferreds or Promises as arguments, or an Array of either
	 *
	 * @method when
	 * @memberOf utility
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * let deferreds = [],
	 *     defer1    = keigai.util.defer(),
	 *     defer2    = keigai.util.defer();
	 *
	 * deferreds.push( defer1 );
	 * deferreds.push( defer2 );
	 *
	 * // Executes when both deferreds have resolved or one has rejected
	 * keigai.util.when( deferreds ).then( function ( args ) {
	 *   ...
	 * }, function ( err ) {
	 *   ...
	 * } );
	 *
	 * ...
	 *
	 * defer1.resolve( true );
	 * defer2.resolve( true );
	 */
	when: function ( ...args ) {
		let defer = deferred();

		// Did we receive an Array? if so it overrides any other arguments
		if ( args[ 0 ] instanceof Array ) {
			args = args[ 0 ];
		}

		// None, end on next tick
		if ( args.length === 0 ) {
			defer.resolve( null );
		}
		// Setup and wait
		else {
			Promise.all( args ).then( function ( results ) {
				defer.resolve( results );
			}, function ( e ) {
				defer.reject( e );
			} );
		}

		return defer;
	},

	/**
	 * Worker factory
	 *
	 * @method worker
	 * @memberOf utility
	 * @param  {Object} defer Deferred to receive message from Worker
	 * @return {Object}       Worker
	 * @private
	 */
	worker: function ( defer ) {
		let obj = new Worker( WORKER );

		obj.onerror = function ( err ) {
			defer.reject( err );
			obj.terminate();
		};

		obj.onmessage = function ( ev ) {
			defer.resolve( ev.data );
			obj.terminate();
		};

		return obj;
	}
};

/**
 * XMLHttpRequest shim for node.js
 *
 * @method xhr
 * @private
 * @return {Object} XMLHttpRequest instance
 */
let xhr = function () {
	const UNSENT = 0;
	const OPENED = 1;
	const HEADERS_RECEIVED = 2;
	const LOADING = 3;
	const DONE = 4;
	const ERR_REFUSED = /ECONNREFUSED/;
	const ready = new RegExp( HEADERS_RECEIVED + "|" + LOADING );

	let headers = {
		"user-agent": "keigai/1.3.18 node.js/" + process.versions.node.replace( /^v/, "" ) + " (" + string.capitalize( process.platform ) + " V8/" + process.versions.v8 + " )",
		"content-type": "text/plain",
		"accept": "*/*"
	};

	/**
	 * Dispatches an event
	 *
	 * @method dispatch
	 * @memberOf xhr
	 * @param  {Object} obj In
	 * @param  {String} arg Event to dispatch
	 * @return {Object}     XMLHttpRequest instance
	 */
	let dispatch = function ( obj, arg ) {
		let fn = "on" + arg;

		if ( typeof obj[ fn ] === "function" ) {
			obj[ fn ]();
		}

		obj.dispatchEvent( arg );

		return obj;
	};

	/**
	 * Changes the readyState of an XMLHttpRequest
	 *
	 * @method state
	 * @memberOf xhr
	 * @param  {String} arg New readyState
	 * @return {Object}     XMLHttpRequest instance
	 */
	let state = function ( obj, arg ) {
		if ( obj.readyState !== arg ) {
			obj.readyState = arg;
			dispatch( obj, "readystatechange" );

			if ( obj.readyState === DONE && !obj._error ) {
				dispatch( obj, "load" );
				dispatch( obj, "loadend" );
			}
		}

		return obj;
	};

	/**
	 * Response handler
	 *
	 * @method success
	 * @memberOf xhr
	 * @param  {Object} obj {@link keigai.XMLHttpRequest}
	 * @param  {Object} res HTTP(S) Response Object
	 * @return {Undefined}  undefined
	 */
	let success = function ( obj, res ) {
		state( obj, HEADERS_RECEIVED );
		obj.status = res.statusCode;
		obj._resheaders = res.headers;

		if ( obj._resheaders[ "set-cookie" ] && obj._resheaders[ "set-cookie" ] instanceof Array ) {
			obj._resheaders[ "set-cookie" ] = obj._resheaders[ "set-cookie" ].join( ";" );
		}

		res.on( "data", function ( arg ) {
			res.setEncoding( "utf8" );

			if ( obj._send ) {
				if ( arg ) {
					obj.responseText += arg;
				}

				state( obj, LOADING );
			}
		} );

		res.on( "end", function () {
			if ( obj._send ) {
				state( obj, DONE );
				obj._send = false;
			}
		} );
	};

	/**
	 * Response error handler
	 *
	 * @method failure
	 * @memberOf xhr
	 * @param  {Object} obj {@link keigai.XMLHttpRequest}
	 * @param  {Object} e   Error
	 * @return {Undefined}  undefined
	 */
	let failure = function ( obj, e ) {
		obj.status = ERR_REFUSED.test( e.message ) ? 503 : 500;
		obj.statusText = "";
		obj.responseText = e.message;
		obj._error = true;
		obj._send = false;
		dispatch( obj, "error" );
		state( obj, DONE );
	};

	class XMLHttpRequest extends Base {
		/**
		 * Creates a new XMLHttpRequest
		 *
		 * @constructor
		 * @private
		 * @memberOf xhr
		 * @return {Object} XMLHttpRequest instance
		 */
		constructor () {
			super();

			this.onabort = null;
			this.onerror = null;
			this.onload = null;
			this.onloadend = null;
			this.onloadstart = null;
			this.onreadystatechange = null;
			this.readyState = UNSENT;
			this.response = null;
			this.responseText = "";
			this.responseType = "";
			this.responseXML = null;
			this.status = UNSENT;
			this.statusText = "";
			this.observer = observable();

			// Psuedo private for prototype chain
			this._error = false;
			this._headers = {};
			this._params = {};
			this._request = null;
			this._resheaders = {};
			this._send = false;
		}

		/**
		 * Aborts a request
		 *
		 * @method abort
		 * @memberOf XMLHttpRequest
		 * @return {Object} XMLHttpRequest instance
		 */
		abort () {
			if ( this._request !== null ) {
				this._request.abort();
				this._request = null;
				this.responseText = "";
				this.responseXML = "";
				this._error = true;
				this._headers = {};

				if ( this._send === true || ready.test( this.readyState ) ) {
					this._send = false;
					state( this, DONE );
				}

				dispatch( this, "abort" );
				this.readyState = UNSENT;
			}

			return this;
		}

		/**
		 * Gets all response headers
		 *
		 * @method getAllResponseHeaders
		 * @memberOf XMLHttpRequest
		 * @return {Object} Response headers
		 */
		getAllResponseHeaders () {
			let result = "";

			if ( this.readyState < HEADERS_RECEIVED ) {
				throw new Error( label.invalidStateNoHeaders );
			}

			utility.iterate( this._resheaders, function ( v, k ) {
				result += k + ": " + v + "\n";
			} );

			return result;
		}

		/**
		 * Gets a specific response header
		 *
		 * @method getResponseHeader
		 * @memberOf XMLHttpRequest
		 * @param  {String} header Header to get
		 * @return {String}        Response header value
		 */
		getResponseHeader ( header ) {
			if ( this.readyState < HEADERS_RECEIVED || this._error ) {
				throw new Error( label.invalidStateNoHeaders );
			}

			return this._resheaders[ header ] || this._resheaders[ header.toLowerCase() ];
		}

		/**
		 * Prepares an XMLHttpRequest instance to make a request
		 *
		 * @method open
		 * @memberOf XMLHttpRequest
		 * @param  {String}  method   HTTP method
		 * @param  {String}  url      URL to receive request
		 * @param  {Boolean} async    [Optional] Asynchronous request
		 * @param  {String}  user     [Optional] Basic auth username
		 * @param  {String}  password [Optional] Basic auth password
		 * @return {Object}           XMLHttpRequest instance
		 */
		open ( method, url, async, user, password ) {
			if ( async !== true ) {
				throw new Error( label.invalidStateNoSync );
			}

			this.abort();
			this._error = false;
			this._params = {
				method: method,
				url: url,
				async: async || true,
				user: user || null,
				password: password || null
			};

			utility.iterate( headers, ( v, k ) => {
				this._headers[ k ] = v;
			} );

			this.readyState = OPENED;

			return this;
		}

		/**
		 * Overrides the Content-Type of the request
		 *
		 * @method overrideMimeType
		 * @memberOf XMLHttpRequest
		 * @param  {String} mime Mime type of the request ( media type )
		 * @return {Object}      XMLHttpRequest instance
		 */
		overrideMimeType ( mime ) {
			this._headers[ "content-type" ] = mime;

			return this;
		}

		/**
		 * Sends an XMLHttpRequest request
		 *
		 * @method send
		 * @memberOf XMLHttpRequest
		 * @param  {Mixed} data [Optional] Payload to send with the request
		 * @return {Object}     XMLHttpRequest instance
		 */
		send ( data=null ) {
			let options, parsed, request, obj;

			if ( this.readyState < OPENED ) {
				throw new Error( label.invalidStateNotOpen );
			} else if ( this._send ) {
				throw new Error( label.invalidStateNotSending );
			}

			parsed = utility.parse( this._params.url );
			parsed.port = parsed.port || ( parsed.protocol === "https:" ? 443 : 80 );

			if ( this._params.user !== null && this._params.password !== null ) {
				parsed.auth = this._params.user + ":" + this._params.password;
			}

			// Specifying Content-Length accordingly
			if ( regex.put_post.test( this._params.method ) ) {
				if ( data === null ) {
					this._headers[ "content-length" ] = 0;
				} else if ( typeof data === "string" ) {
					this._headers[ "content-length" ] = Buffer.byteLength( data );
				} else if ( data instanceof Buffer || typeof data.toString === "function" ) {
					data = data.toString();
					this._headers[ "content-length" ] = Buffer.byteLength( data );
				} else {
					throw new Error( label.invalidArguments );
				}
			}

			this._headers.host = parsed.host;

			if ( this._headers[ "x-requested-with" ] === "XMLHttpRequest" ) {
				delete this._headers[ "x-requested-with" ];
			}

			options = {
				hostname: parsed.hostname,
				path: parsed.path,
				port: parsed.port,
				method: this._params.method,
				headers: this._headers
			};

			if ( parsed.protocol === "https:" ) {
				options.rejectUnauthorized = false;
				options.agent = false;
			}

			if ( parsed.auth ) {
				options.auth = parsed.auth;
			}

			this._send = true;
			dispatch( this, "readystatechange" );

			obj = parsed.protocol === "http:" ? http : https;

			request = obj.request( options, ( arg ) => {
				success( this, arg );
			} ).on( "error", ( e ) => {
				failure( this, e );
			} );

			data === null ? request.setSocketKeepAlive( true ) : request.write( data, "utf8" );
			this._request = request;
			request.end();

			dispatch( this, "loadstart" );

			return this;
		}

		/**
		 * Sets a request header of an XMLHttpRequest instance
		 *
		 * @method setRequestHeader
		 * @memberOf XMLHttpRequest
		 * @param {String} header HTTP header
		 * @param {String} value  Header value
		 * @return {Object}       XMLHttpRequest instance
		 */
		setRequestHeader ( header, value ) {
			if ( this.readyState !== OPENED ) {
				throw new Error( label.invalidStateNotUsable );
			} else if ( this._send ) {
				throw new Error( label.invalidStateNotSending );
			}

			this._headers[ header.toLowerCase() ] = value;

			return this;
		}
	}

	return XMLHttpRequest;
}

/**
 * WeakMap shim
 *
 * @class
 * @private
 */
class WeakMapShim {
	constructor () {
		this.elements = {};
	}

	clear () {
		this.elements = {};
	}

	delete ( arg ) {
		delete this.elements[ arg ];
	}

	has ( arg ) {
		return this.elements[ arg ] !== undefined;
	}

	get ( arg ) {
		return this.has( arg ) ? this.elements[ arg ].value : undefined;
	}

	set ( arg, value ) {
		this.elements[ arg ] = { value: value };
		return this;
	}
}

/**
 * @namespace xml
 * @private
 */
let xml = {
	/**
	 * Returns XML (Document) Object from a String
	 *
	 * @method decode
	 * @memberOf xml
	 * @param  {String} arg XML String
	 * @return {Object}     XML Object or undefined
	 */
	decode: function ( arg ) {
		return new DOMParser().parseFromString( arg, "text/xml" );
	},

	/**
	 * Returns XML String from an Object or Array
	 *
	 * @method encode
	 * @memberOf xml
	 * @param  {Mixed} arg Object or Array to cast to XML String
	 * @return {String}    XML String or undefined
	 */
	encode: function ( arg, wrap=true, top=true, key="" ) {
		let x = wrap ? "<" + ( key || "xml" ) + ">" : "";

		if ( arg !== null && arg.xml ) {
			arg = arg.xml;
		}

		if ( client.doc && ( arg instanceof Document ) ) {
			arg = ( new XMLSerializer() ).serializeToString( arg );
		}

		if ( regex.boolean_number_string.test( typeof arg ) ) {
			x += xml.node( isNaN( key ) ? key : "item", arg );
		} else if ( arg === null || arg === undefined ) {
			x += "null";
		} else if ( arg instanceof Array ) {
			array.each( arg, function ( v ) {
				x += xml.encode( v, ( typeof v === "object" ), false, "item" );
			} );
		} else if ( arg instanceof Object ) {
			utility.iterate( arg, function ( v, k ) {
				x += xml.encode( v, ( typeof v === "object" ), false, k );
			} );
		}

		x += wrap ? "</" + ( key || "xml" ) + ">" : "";

		if ( top ) {
			x = "<?xml version=\"1.0\" encoding=\"UTF8\"?>" + x;
		}

		return x;
	},

	/**
	 * Encodes a value as a node
	 *
	 * @method node
	 * @memberOf xml
	 * @param  {String} name  Node name
	 * @param  {String} value Node value
	 * @return {String}       Node
	 */
	node: function ( name, value ) {
		return "<n>v</n>".replace( "v", ( regex.cdata.test( value ) ? "<![CDATA[" + value + "]]>" : value ) ).replace( /<(\/)?n>/g, "<$1" + name + ">" );
	},

	/**
	 * Validates `arg` is XML
	 *
	 * @method valid
	 * @memberOf xml
	 * @param  {String} arg String to validate
	 * @return {Boolean}    `true` if valid XML
	 */
	valid: function ( arg ) {
		return ( xml.decode( arg ).getElementsByTagName( "parsererror" ).length === 0 );
	}
};

/**
 * Bootstraps environment
 *
 * @method bootstrap
 * @private
 * @return {Undefined} undefined
 */
let bootstrap = function () {
	// ES6 Array shims
	if ( Array.from === undefined ) {
		Array.from = function ( arg ) {
			return [].slice.call( arg );
		};
	}

	// Describing the Client
	if ( !server ) {
		client.version = client.version();

		if ( client.ie && client.version < 10 ) {
			throw new Error( label.upgrade );
		}
	} else {
		// XHR shim
		XMLHttpRequest = xhr();
	}

	// WeakMap shim for client & server
	if ( WeakMap === null ) {
		WeakMap = WeakMapShim;
	}

	// DataStore Worker "script"
	if ( webWorker ) {
		try {
			WORKER = global.URL.createObjectURL( utility.blob( "var " + string.fromObject( array, "array" ) + ", " + string.fromObject( regex, "regex" ) + ", " + string.fromObject( string, "string" ) + ", " + string.fromObject( utility, "utility" ) + "; onmessage = " + store.worker.toString() + ";" ) );
		}
		catch ( e ) {
			webWorker = false;
		}
	}

	TIME = new Date().getTime();

	// Setting up `utility.render()`
	if ( global.requestAnimationFrame !== undefined ) {
		RENDER = global.requestAnimationFrame
	} else {
		RENDER = function ( fn ) {
			let offset = new Date().getTime() - TIME;

			utility.defer( function () {
				fn( offset );
			}, 16, offset );
		};
	}

	if ( !server ) {
		utility.banner();
	}
};

// Bootstrapping
bootstrap();

// Interface
return {
	filter: filter,
	list: list.factory,
	grid: grid,
	store: store.factory,
	util: {
		$: utility.$,
		array: array,
		banner: utility.banner,
		base: utility.base,
		clearTimers: utility.clearTimers,
		clone: utility.clone,
		coerce: utility.coerce,
		curry: utility.curry,
		csv: csv,
		defer: deferred,
		delay: utility.defer,
		element: element,
		equal: utility.equal,
		extend: utility.extend,
		genId: utility.genId,
		iterate: utility.iterate,
		json: json,
		jsonp: client.jsonp,
		log: utility.log,
		lru: lru.factory,
		math: math,
		merge: utility.merge,
		next: utility.delay,
		number: number,
		observer: observable,
		parse: utility.parse,
		partial: utility.partial,
		prevent: utility.prevent,
		queryString: utility.queryString,
		race: utility.race,
		regex: regex,
		render: utility.render,
		repeat: utility.repeat,
		request: client.request,
		stop: utility.stop,
		string: string,
		target: utility.target,
		uuid: utility.uuid,
		walk: utility.walk,
		when: utility.when,
		xml: xml
	},
	version: "1.3.18"
};
} )();

// Node, AMD & window supported
if ( typeof exports !== "undefined" ) {
	module.exports = lib;
} else if ( typeof define === "function" ) {
	define( function () {
		return lib;
	} );
} else {
	global.keigai = lib;
}
} )( typeof global !== "undefined" ? global : window );
