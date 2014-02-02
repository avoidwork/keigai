/**
 * keigai
 *
 * @author Jason Mulligan <jason.mulligan@avoidwork.com>
 * @copyright 2014 Jason Mulligan
 * @license BSD-3 <https://raw.github.com/avoidwork/keigai/master/LICENSE>
 * @link http://keigai.io
 * @module keigai
 * @version 0.1.3
 */
( function ( global ) {

var document  = global.document,
    location  = global.location,
    navigator = global.navigator,
    server    = typeof process != "undefined",
    webWorker = typeof Blob != "undefined" && typeof Worker != "undefined",
    MAX       = 10,
    VERSIONS  = 100,
    http, https, lib, url, WORKER;

if ( server ) {
	url     = require( "url" );
	http    = require( "http" );
	https   = require( "https" );
	mongodb = require( "mongodb" ).MongoClient;
	format  = require( "util" ).format;

	if ( typeof Storage == "undefined" ) {
		localStorage = require( "localStorage" );
	}

	if ( typeof XMLHttpRequest == "undefined" ) {
		XMLHttpRequest = null;
	}
}

lib = ( function () {
"use strict";

var external, has, slice;

/**
 * Regex patterns used through keigai
 *
 * `url` was authored by Diego Perini
 *
 * @namespace regex
 * @private
 * @type {Object}
 */
var regex = {
	after_space          : /\s+.*/,
	allow                : /^allow$/i,
	allow_cors           : /^access-control-allow-methods$/i,
	and                  : /^&/,
	args                 : /\((.*)\)/,
	auth                 : /\/\/(.*)\@/,
	bool                 : /^(true|false)?$/,
	cdata                : /\&|<|>|\"|\'|\t|\r|\n|\@|\$/,
	checked_disabled     : /checked|disabled/i,
	complete_loaded      : /^(complete|loaded)$/i,
	csv_quote            : /^\s|\"|\n|,|\s$/,
	del                  : /^del/,
	domain               : /^[\w.-_]+\.[A-Za-z]{2,}$/,
	down                 : /down/,
	endslash             : /\/$/,
	eol_nl               : /\n$/,
	element_update       : /id|innerHTML|innerText|textContent|type|src/,
	get_headers          : /^(head|get|options)$/,
	get_remove_set       : /get|remove|set/,
	hash                 : /^\#/,
	header_replace       : /:.*/,
	header_value_replace : /.*:\s+/,
	html                 : /^<.*>$/,
	http_body            : /200|202|203|206/,
	http_ports           : /80|443/,
	ie                   : /msie|ie/i,
	ip                   : /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
	is_xml               : /^<\?xml.*\?>/,
	json_maybe           : /json|plain|javascript/,
	json_wrap            : /^[\[\{]/,
	klass                : /^\./,
	no                   : /no-store|no-cache/i,
	not_endpoint         : /.*\//,
	number               : /(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)|number/,
	number_format_1      : /.*\./,
	number_format_2      : /\..*/,
	number_present       : /\d{1,}/,
	number_string        : /number|string/i,
	number_string_object : /number|object|string/i,
	object_type          : /\[object Object\]/,
	patch                : /^patch$/,
	primitive            : /^(boolean|function|number|string)$/,
	priv                 : /private/,
	put_post             : /^(post|put)$/i,
	radio_checkbox       : /^(radio|checkbox)$/i,
	root                 : /^\/[^\/]/,
	select               : /select/i,
	selector_is          : /^:/,
	selector_complex     : /\s+|\>|\+|\~|\:|\[/,
	set_del              : /^(set|del|delete)$/,
	space_hyphen         : /\s|-/,
	string_object        : /string|object/i,
	svg                  : /svg/,
	top_bottom           : /top|bottom/i,
	url                  : /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i,
	word                 : /^\w+$/,
	xdomainrequest       : /^(get|post)$/i,
	xml                  : /xml/i
};

/**
 * @namespace array
 * @private
 */
var array = {
	/**
	 * Adds 'arg' to 'obj' if it is not found
	 *
	 * @method add
	 * @memberOf array
	 * @param  {Array} obj Array to receive 'arg'
	 * @param  {Mixed} arg Argument to set in 'obj'
	 * @return {Array}     Array that was queried
	 */
	add : function ( obj, arg ) {
		if ( !array.contains( obj, arg ) ) {
			obj.push( arg );
		}

		return obj;
	},

	/**
	 * Returns an Object ( NodeList, etc. ) as an Array
	 *
	 * @method cast
	 * @memberOf array
	 * @param  {Object}  obj Object to cast
	 * @param  {Boolean} key [Optional] Returns key or value, only applies to Objects without a length property
	 * @return {Array}       Object as an Array
	 */
	cast : function ( obj, key ) {
		key   = ( key === true );
		var o = [];

		if ( !isNaN( obj.length ) ) {
			o = slice.call( obj );
		}
		else if ( key ) {
			o = array.keys( obj );
		}
		else {
			utility.iterate( obj, function ( i ) {
				o.push( i );
			} );
		}

		return o;
	},

	/**
	 * Determines if obj contains arg
	 *
	 * @method contains
	 * @memberOf array
	 * @param  {Array} obj Array to search
	 * @param  {Mixed} arg Value to look for
	 * @return {Boolean}   True if found, false if not
	 */
	contains : function ( obj, arg ) {
		return obj.indexOf( arg ) > -1;
	},

	/**
	 * Finds the difference between array1 and array2
	 *
	 * @method diff
	 * @memberOf array
	 * @param  {Array} array1 Source Array
	 * @param  {Array} array2 Comparison Array
	 * @return {Array}        Array of the differences
	 */
	diff : function ( array1, array2 ) {
		var result = [];

		array.each( array1, function ( i ) {
			if ( !array.contains( array2, i ) ) {
				array.add( result, i );
			}
		} );

		array.each( array2, function ( i ) {
			if ( !array.contains( array1, i ) ) {
				array.add( result, i );
			}
		} );

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
	 */
	each : function ( obj, fn, async, size ) {
		var nth = obj.length,
		    i, offset;

		if ( async !== true ) {
			i = -1;
			while ( ++i < nth ) {
				if ( fn.call( obj, obj[i], i ) === false ) {
					break;
				}
			}
		}
		else {
			size   = size || 10;
			offset = 0;

			if ( size > nth ) {
				size = nth;
			}

			utility.repeat( function () {
				var i = -1,
				    idx;

				while ( ++i < size ) {
					idx = i + offset;

					if ( idx === nth || fn.call( obj, obj[idx], idx ) === false ) {
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
	 * Creates a 2D Array from an Object
	 *
	 * @method fromObject
	 * @memberOf array
	 * @param  {Object} obj Object to convert
	 * @return {Array}      2D Array
	 */
	fromObject : function ( obj ) {
		return array.mingle( array.keys( obj ), array.cast( obj ) );
	},

	/**
	 * Sorts an Array based on key values, like an SQL ORDER BY clause
	 *
	 * @method sort
	 * @memberOf array
	 * @param  {Array}  obj   Array to sort
	 * @param  {String} query Sort query, e.g. "name, age desc, country"
	 * @param  {String} sub   [Optional] Key which holds data, e.g. "{data: {}}" = "data"
	 * @return {Array}        Sorted Array
	 */
	keySort : function ( obj, query, sub ) {
		query       = query.replace( /\s*asc/ig, "" ).replace( /\s*desc/ig, " desc" );
		var queries = string.explode( query ).map( function ( i ) { return i.split( " " ); } ),
		    sorts   = [];

		if ( sub && sub !== "" ) {
			sub = "." + sub;
		}
		else {
			sub = "";
		}

		array.each( queries, function ( i ) {
			if ( i[1] === "desc" ) {
				sorts.push( "if ( a" + sub + "[\"" + i[0] + "\"] < b" + sub + "[\"" + i[0] + "\"] ) return 1;" );
				sorts.push( "if ( a" + sub + "[\"" + i[0] + "\"] > b" + sub + "[\"" + i[0] + "\"] ) return -1;" );
			}
			else {
				sorts.push( "if ( a" + sub + "[\"" + i[0] + "\"] < b" + sub + "[\"" + i[0] + "\"] ) return -1;" );
				sorts.push( "if ( a" + sub + "[\"" + i[0] + "\"] > b" + sub + "[\"" + i[0] + "\"] ) return 1;" );
			}
		} );

		sorts.push( "else return 0;" );

		return obj.sort( new Function( "a", "b", sorts.join( "\n" ) ) );
	},

	/**
	 * Returns the keys in an "Associative Array"
	 *
	 * @method keys
	 * @memberOf array
	 * @param  {Mixed} obj Array or Object to extract keys from
	 * @return {Array}     Array of the keys
	 */
	keys : function ( obj ) {
		return Object.keys( obj );
	},

	/**
	 * Returns the last index of the Array
	 *
	 * @method last
	 * @memberOf array
	 * @param  {Array}  obj Array
	 * @param  {Number} arg [Optional] Negative offset from last index to return
	 * @return {Mixed}      Last index( s ) of Array
	 */
	last : function ( obj, arg ) {
		var n = obj.length - 1;

		if ( arg >= ( n + 1 ) ) {
			return obj;
		}
		else if ( isNaN( arg ) || arg === 1 ) {
			return obj[n];
		}
		else {
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
	 */
	limit : function ( obj, start, offset ) {
		var result = [],
		    i      = start - 1,
		    nth    = start + offset,
		    max    = obj.length;

		if ( max > 0 ) {
			while ( ++i < nth && i < max ) {
				result.push( obj[i] );
			}
		}

		return result;
	},

	/**
	 * Merges `arg` into `obj`, excluding duplicate indices
	 *
	 * @method merge
	 * @param  {Array} obj Array to receive indices
	 * @param  {Array} arg Array to merge
	 * @return {Array}     obj
	 */
	merge : function ( obj, arg ) {
		array.each( arg, function ( i ) {
			array.add( obj, i );
		} );

		return obj;
	},

	/**
	 * Mingles Arrays and returns a 2D Array
	 *
	 * @method mingle
	 * @memberOf array
	 * @param  {Array} obj1 Array to mingle
	 * @param  {Array} obj2 Array to mingle
	 * @return {Array}      2D Array
	 */
	mingle : function ( obj1, obj2 ) {
		var result;

		result = obj1.map( function ( i, idx ) {
			return [i, obj2[idx]];
		} );

		return result;
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
	 */
	remove : function ( obj, start, end ) {
		if ( isNaN( start ) ) {
			start = obj.indexOf( start );

			if ( start === -1 ) {
				return obj;
			}
		}
		else {
			start = start || 0;
		}

		var length    = obj.length,
		    remaining = obj.slice( ( end || start ) + 1 || length );

		obj.length = start < 0 ? ( length + start ) : start;
		obj.push.apply( obj, remaining );

		return obj;
	},

	/**
	 * Sorts the Array by parsing values
	 *
	 * @method sort
	 * @memberOf array
	 * @param  {Mixed} a Argument to compare
	 * @param  {Mixed} b Argument to compare
	 * @return {Number}  Number indicating sort order
	 */
	sort : function ( a, b ) {
		var types = {a: typeof a, b: typeof b},
		    c, d, result;

		if ( types.a === "number" && types.b === "number" ) {
			result = a - b;
		}
		else {
			c = a.toString();
			d = b.toString();

			if ( c < d ) {
				result = -1;
			}
			else if ( c > d ) {
				result = 1;
			}
			else if ( types.a === types.b ) {
				result = 0;
			}
			else if ( types.a === "boolean" ) {
				result = -1;
			}
			else {
				result = 1;
			}
		}

		return result;
	},

	/**
	 * Returns an Array of unique indices of `obj`
	 *
	 * @method unique
	 * @memberOf array
	 * @param  {Array} obj Array to parse
	 * @return {Array}     Array of unique indices
	 */
	unique : function ( obj ) {
		var result = [];

		array.each( obj, function ( i ) {
			array.add( result, i );
		} );

		return result;
	}
};

/**
 * @namespace cache
 * @private
 */
var cache = {
	/**
	 * Collection URIs
	 *
	 * @memberOf cache
	 * @type {Object}
	 */
	items : {},

	/**
	 * Garbage collector for the cached items
	 *
	 * @method clean
	 * @memberOf cache
	 * @return {Undefined} undefined
	 */
	clean : function () {
		return utility.iterate( cache.items, function ( v, k ) {
			if ( cache.expired( k ) ) {
				cache.expire( k, true );
			}
		} );
	},

	/**
	 * Expires a URI from the local cache
	 *
	 * Events: expire    Fires when the URI expires
	 *
	 * @method expire
	 * @memberOf cache
	 * @param  {String} uri URI of the local representation
	 * @return {Boolean} `true` if successful
	 */
	expire : function ( uri ) {
		if ( cache.items[uri] ) {
			delete cache.items[uri];

			return true;
		}
		else {
			return false;
		}
	},

	/**
	 * Determines if a URI has expired
	 *
	 * @method expired
	 * @memberOf cache
	 * @param  {Object} uri Cached URI object
	 * @return {Boolean}    True if the URI has expired
	 */
	expired : function ( uri ) {
		var item = cache.items[uri];

		return item && item.expires < new Date();
	},

	/**
	 * Returns the cached object {headers, response} of the URI or false
	 *
	 * @method get
	 * @memberOf cache
	 * @param  {String}  uri    URI/Identifier for the resource to retrieve from cache
	 * @param  {Boolean} expire [Optional] If 'false' the URI will not expire
	 * @param  {Boolean} silent [Optional] If 'true', the event will not fire
	 * @return {Mixed}          URI Object {headers, response} or False
	 */
	get : function ( uri, expire ) {
		uri = utility.parse( uri ).href;

		if ( !cache.items[uri] ) {
			return false;
		}

		if ( expire !== false && cache.expired( uri ) ) {
			cache.expire( uri );

			return false;
		}

		return utility.clone( cache.items[uri], true );
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
	set : function ( uri, property, value ) {
		uri = utility.parse( uri ).href;

		if ( !cache.items[uri] ) {
			cache.items[uri] = {};
			cache.items[uri].permission = 0;
		}

		if ( property === "permission" ) {
			cache.items[uri].permission |= value;
		}
		else if ( property === "!permission" ) {
			cache.items[uri].permission &= ~value;
		}
		else {
			cache.items[uri][property] = value;
		}

		return cache.items[uri];
	}
};

/**
 * @namespace client
 * @private
 */
var client = {
	/**
	 * Internet Explorer browser
	 *
	 * @memberOf client
	 * @type {Boolean}
	 */
	ie : function () {
		return !server && regex.ie.test( navigator.userAgent );
	}(),

	/**
	 * Client version
	 *
	 * @memberOf client
	 * @type {Number}
	 */
	version : function () {
		var version = 0;

		if ( this.ie ) {
			version = navigator.userAgent.replace(/(.*msie|;.*)/gi, "");
			version = number.parse( string.trim( version ) );
		}

		return version;
	},

	/**
	 * Quick way to see if a URI allows a specific verb
	 *
	 * @method allows
	 * @memberOf client
	 * @param  {String} uri  URI to query
	 * @param  {String} verb HTTP verb
	 * @return {Boolean}     `true` if the verb is allowed, undefined if unknown
	 */
	allows : function ( uri, verb ) {
		if ( string.isEmpty( uri ) || string.isEmpty( verb ) ) {
			throw new Error( label.invalidArguments );
		}

		uri        = utility.parse( uri ).href;
		verb       = verb.toLowerCase();
		var result = false,
		    bit    = 0;

		if ( !cache.get( uri, false ) ) {
			result = undefined;
		}
		else {
			if ( regex.del.test( verb ) ) {
				bit = 1;
			}
			else if ( regex.get_headers.test( verb ) ) {
				bit = 4;
			}
			else if ( regex.put_post.test( verb ) ) {
				bit = 2;
			}
			else if ( regex.patch.test( verb ) ) {
				bit = 8;
			}

			result = Boolean( client.permissions( uri, verb ).bit & bit );
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
	 */
	bit : function ( args ) {
		var result = 0;

		array.each( args, function ( verb ) {
			verb = verb.toLowerCase();

			if ( regex.get_headers.test( verb ) ) {
				result |= 4;
			}
			else if ( regex.put_post.test( verb ) ) {
				result |= 2;
			}
			else if ( regex.patch.test( verb ) ) {
				result |= 8;
			}
			else if ( regex.del.test( verb ) ) {
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
	 */
	cors : function ( uri ) {
		return ( !server && uri.indexOf( "//" ) > -1 && uri.indexOf( "//" + location.host ) === -1 );
	},

	/**
	 * Caches the headers from the XHR response
	 *
	 * @method headers
	 * @memberOf client
	 * @param  {Object} xhr  XMLHttpRequest Object
	 * @param  {String} uri  URI to request
	 * @param  {String} type Type of request
	 * @return {Object}      Cached URI representation
	 */
	headers : function ( xhr, uri, type ) {
		var headers = string.trim( xhr.getAllResponseHeaders() ).split( "\n" ),
		    items   = {},
		    o       = {},
		    allow   = null,
		    expires = new Date(),
		    cors    = client.cors( uri );

		array.each( headers, function ( i ) {
			var header = i.split( ": " );

			items[header[0].toLowerCase()] = header[1];

			if ( allow === null ) {
				if ( ( !cors && regex.allow.test( header ) ) || ( cors && regex.allow_cors.test( header ) ) ) {
					allow = header[1];
				}
			}
		} );

		if ( regex.no.test( items["cache-control"] ) ) {
			// Do nothing
		}
		else if ( items["cache-control"] && regex.number_present.test( items["cache-control"] ) ) {
			expires = expires.setSeconds( expires.getSeconds() + number.parse( regex.number_present.exec( items["cache-control"] )[0], 10 ) );
		}
		else if ( items.expires ) {
			expires = new Date( items.expires );
		}
		else {
			expires = expires.setSeconds( expires.getSeconds() + expires );
		}

		o.expires    = expires;
		o.headers    = items;
		o.timestamp  = new Date();
		o.permission = client.bit( allow !== null ? string.explode( allow ) : [type] );

		if ( type === "get" ) {
			cache.set( uri, "expires",    o.expires );
			cache.set( uri, "headers",    o.headers );
			cache.set( uri, "timestamp",  o.timestamp );
			cache.set( uri, "permission", o.permission );
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
	 */
	parse : function ( xhr, type ) {
		type = type || "";
		var result, obj;

		if ( ( regex.json_maybe.test( type ) || string.isEmpty( type ) ) && ( regex.json_wrap.test( xhr.responseText ) && Boolean( obj = json.decode( xhr.responseText, true ) ) ) ) {
			result = obj;
		}
		else if ( regex.xml.test( type ) ) {
			if ( type !== "text/xml" ) {
				xhr.overrideMimeType( "text/xml" );
			}

			result = xhr.responseXML;
		}
		else if ( type === "text/plain" && regex.is_xml.test( xhr.responseText ) && xml.valid( xhr.responseText ) ) {
			result = xml.decode( xhr.responseText );
		}
		else {
			result = xhr.responseText;
		}

		return result;
	},

	/**
	 * Returns the permission of the cached URI
	 *
	 * @method permissions
	 * @memberOf client
	 * @param  {String} uri URI to query
	 * @return {Object}     Contains an Array of available commands, the permission bit and a map
	 */
	permissions : function ( uri ) {
		var cached = cache.get( uri, false ),
		    bit    = !cached ? 0 : cached.permission,
		    result = {allows: [], bit: bit, map: {partial: 8, read: 4, write: 2, "delete": 1, unknown: 0}};

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
	 * @param  {String}   uri     URI to request
	 * @param  {Function} success A handler function to execute when an appropriate response been received
	 * @param  {Function} failure [Optional] A handler function to execute on error
	 * @param  {Mixed}    args    Custom JSONP handler parameter name, default is "callback"; or custom headers for GET request ( CORS )
	 * @return {Object} {@link keigai.Deferred}
	 */
	jsonp : function ( uri, success, failure, args ) {
		var defer    = deferred.factory(),
		    callback = "callback", cbid, s;

		if ( external === undefined ) {
			if ( !global.keigai ) {
				global.keigai = {callback: {}};
			}

			external = "keigai";
		}

		if ( args instanceof Object && !args.callback ) {
			callback = args.callback;
		}

		defer.then( function ( arg ) {
			if ( typeof success == "function") {
				success( arg );
			}
		}, function ( e ) {
			if ( typeof failure == "function") {
				failure( e );
			}

			throw e;
		} );

		do {
			cbid = utility.genId().slice( 0, 10 );
		}
		while ( global.callback[cbid] );

		uri = uri.replace( callback + "=?", callback + "=" + external + ".callback." + cbid );

		global.callback[cbid] = function ( arg ) {
			utility.clearTimers( cbid );
			delete global.callback[cbid];
			defer.resolve( arg );
			element.destroy( s );
		};

		s = element.create( "script", {src: uri, type: "text/javascript"}, utility.dom( "head" )[0] );
		
		utility.defer( function () {
			defer.reject( undefined );
		}, 30000, cbid );

		return defer;
	},

	/**
	 * Creates an XmlHttpRequest to a URI ( aliased to multiple methods )
	 *
	 * The returned Deferred will have an .xhr
	 *
	 * @method request
	 * @memberOf client
	 * @param  {String}   uri     URI to query
	 * @param  {String}   type    Type of request ( DELETE/GET/POST/PUT/HEAD )
	 * @param  {Function} success A handler function to execute when an appropriate response been received
	 * @param  {Function} failure [Optional] A handler function to execute on error
	 * @param  {Mixed}    args    [Optional] Data to send with the request
	 * @param  {Object}   headers [Optional] Custom request headers ( can be used to set withCredentials )
	 * @param  {Number}   timeout [Optional] Timeout in milliseconds, default is 30000
	 * @return {Object}   {@link Deferred}
	 */
	request : function ( uri, type, success, failure, args, headers, timeout ) {
		var cors, xhr, payload, cached, typed, contentType, doc, ab, blob, defer;

		if ( ( regex.put_post.test( type ) || regex.patch.test( type ) ) && args === undefined ) {
			throw new Error( label.invalidArguments );
		}

		uri         = utility.parse( uri ).href;
		type        = type.toLowerCase();
		headers     = headers instanceof Object ? headers : null;
		timeout     = timeout || 30000;
		cors        = client.cors( uri );
		xhr         = !client.ie || ( !cors || client.version > 9 ) ? new XMLHttpRequest() : new XDomainRequest();
		payload     = ( regex.put_post.test( type ) || regex.patch.test( type ) ) && args ? args : null;
		cached      = type === "get" ? cache.get( uri ) : false;
		typed       = string.capitalize( type );
		contentType = null;
		doc         = typeof Document != "undefined";
		ab          = typeof ArrayBuffer != "undefined";
		blob        = typeof Blob != "undefined";
		defer       = deferred.factory();

		// Only GET & POST is supported by XDomainRequest (so useless!)
		if ( cors && client.ie && client.version === 9 && !regex.xdomainrequest.test( type ) ) {
			throw new Error( label.notAvailable );
		}

		// Using a deferred to resolve request
		defer.then( function ( arg ) {
			if ( typeof success == "function" ) {
				success.call( xhr, arg, xhr );
			}

			return arg;
		}, function ( e ) {
			if ( typeof failure == "function" ) {
				try {
					return failure.call( xhr, e, xhr );
				}
				catch ( err ) {
					throw err;
				}
			}
		} );

		if ( !cors && !regex.get_headers.test( type ) && client.allows( uri, type ) === false ) {
			xhr.status = 405;
			defer.reject( null );
		}

		if ( type === "get" && Boolean( cached ) ) {
			// Decorating XHR for proxy behavior
			if ( server ) {
				xhr.readyState  = 4;
				xhr.status      = 200;
				xhr._resheaders = cached.headers;
			}

			defer.resolve( cached.response );
		}
		else {
			xhr.open( type.toUpperCase(), uri, true );

			// Setting content-type value
			if ( headers !== null && headers.hasOwnProperty( "content-type" ) ) {
				contentType = headers["content-type"];
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

				if ( typeof payload == "string" && regex.is_xml.test( payload ) ) {
					contentType = "application/xml";
				}

				if ( !( ab && payload instanceof ArrayBuffer ) && !( blob && payload instanceof Blob ) && payload instanceof Object ) {
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

				if ( typeof cached == "object" && cached.headers.hasOwnProperty( "etag" ) ) {
					headers.etag = cached.headers.etag;
				}

				if ( contentType !== null ) {
					headers["content-type"] = contentType;
				}

				if ( headers.hasOwnProperty( "callback" ) ) {
					delete headers.callback;
				}

				utility.iterate( headers, function ( v, k ) {
					if ( v !== null && k !== "withCredentials") {
						xhr.setRequestHeader( k, v );
					}
				} );

				// Cross Origin Resource Sharing ( CORS )
				if ( typeof xhr.withCredentials == "boolean" && headers !== null && typeof headers.withCredentials == "boolean" ) {
					xhr.withCredentials = headers.withCredentials;
				}
			}

			xhr.onload = function () {
				var xdr    = client.ie && xhr.readyState === undefined,
				    shared = true,
				    o, r, t, redirect;

				if ( !xdr && xhr.readyState === 4 ) {
					switch ( xhr.status ) {
						case 200:
						case 201:
						case 202:
						case 203:
						case 204:
						case 205:
						case 206:
							o = client.headers( xhr, uri, type );

							if ( type === "head" ) {
								return defer.resolve( o.headers );
							}
							else if ( type === "options" ) {
								return defer.resolve( o.headers );
							}
							else if ( type !== "delete" ) {
								if ( server && regex.priv.test( o.headers["cache-control"] ) ) {
									shared = false;
								}

								if ( regex.http_body.test( xhr.status ) ) {
									t = o.headers["content-type"] || "";
									r = client.parse( xhr, t );

									if ( r === undefined ) {
										deferred.reject( new Error( label.serverError ) );
									}
								}

								if ( type === "get" && shared ) {
									cache.set( uri, "response", ( o.response = utility.clone( r, true ) ) );
								}
								else {
									cache.expire( uri, true );
								}
							}
							else if ( type === "delete" ) {
								cache.expire( uri, true );
							}

							switch ( xhr.status ) {
								case 200:
								case 202:
								case 203:
								case 206:
									defer.resolve( r );
									break;
								case 201:
									if ( ( o.headers.Location === undefined || string.isEmpty( o.headers.Location ) ) && !string.isUrl( r ) ) {
										deferred.reject( new Error( label.invalidArguments ) );
									}
									else {
										redirect = string.trim ( o.headers.Location || r );
										client.request( redirect, "GET", function ( arg ) {
											defer.resolve ( arg );
										}, function ( e ) {
											deferred.reject( e );
										} );
										break;
									}
									break;
								case 204:
								case 205:
									defer.resolve( null );
									break;
							}
							break;
						case 304:
							defer.resolve( r );
							break;
						case 401:
							deferred.reject( new Error( label.serverUnauthorized ) );
							break;
						case 403:
							cache.set( uri, "!permission", client.bit( [type] ) );
							deferred.reject( new Error( label.serverForbidden ) );
							break;
						case 405:
							cache.set( uri, "!permission", client.bit( [type] ) );
							deferred.reject( new Error( label.serverInvalidMethod ) );
							break;
						default:
							deferred.reject( new Error( label.serverError ) );
					}
				}
				else if ( xdr ) {
					r = client.parse( xhr, "text/plain" );
					cache.set( uri, "permission", client.bit( ["get"] ) );
					cache.set( uri, "response", r );
					defer.resolve( r );
				}
			};

			xhr.onerror = function ( e ) {
				defer.reject( e );
			};

			// Firing event & sending request
			payload !== null ? xhr.send( payload ) : xhr.send();
		}

		defer.xhr = xhr;

		return defer;
	}
};

/**
 * @namespace filter
 * @private
 */
var filter = {
	/**
	 * DataListFilter factory
	 *
	 * @method factory
	 * @memberOf filter
	 * @param  {Object} target   Element to receive the filter
	 * @param  {Object} list     {@link keigai.DataList}
	 * @param  {String} filters  Comma delimited string of fields to filter by
	 * @param  {Number} debounce [Optional] Milliseconds to debounce
	 * @return {Object} {@link keigai.DataListFilter}
	 */
	factory : function ( target, list, filters, debounce ) {
		var ref = [list],
		    obj;

		debounce = debounce || 250;

		if ( !( target instanceof Element ) || ( list && !list.store ) || ( typeof filters != "string" || string.isEmpty( filters ) ) ) {
			throw new Error( label.invalidArguments );
		}

		obj = new DataListFilter( target, ref[0], debounce ).set( filters );

		// Setting up a chain of Events
		obj.observer.hook( obj.element, "keyup" );
		obj.observer.hook( obj.element, "input" );
		obj.on( "keyup", obj.update, "keyup" );
		obj.on( "input", obj.update, "input" );

		return obj;
	}
};

/**
 * Creates a new DataListFilter
 *
 * @constructor
 * @memberOf keigai
 * @param  {Object} obj      Element to receive the filter
 * @param  {Object} list     {@link keigai.DataList}
 * @param  {Number} debounce [Optional] Milliseconds to debounce
 */
function DataListFilter ( element, list, debounce ) {
	this.element  = element;
	this.list     = list;
	this.debounce = debounce;
	this.filters  = {};
	this.observer = new Observable();
}

/**
 * Setting constructor loop
 *
 * @method constructor
 * @memberOf keigai.DataListFilter
 * @type {Function}
 */
DataListFilter.prototype.constructor = DataListFilter;

/**
 * Adds an event listener
 *
 * @method addListener
 * @memberOf keigai.DataListFilter
 * @param  {String}   ev       Event name
 * @param  {Function} listener Function to execute
 * @param  {String}   id       [Optional] Listener ID
 * @param  {String}   scope    [Optional] Listener scope, default is `this`
 * @return {Object} {@link keigai.DataListFilter}
 */
DataListFilter.prototype.addListener = function ( ev, listener, id, scope ) {
	this.observer.on( ev, listener, id, scope || this );

	return this;
};

/**
 * Dispatches an event, with optional arguments
 *
 * @method emit
 * @memberOf keigai.DataListFilter
 * @return {Object} {@link keigai.DataListFilter}
 */
DataListFilter.prototype.dispatch = function () {
	this.observer.dispatch.apply( this.observer, [].concat( array.cast( arguments ) ) );

	return this;
};

/**
 * Dispatches an event, with optional arguments
 *
 * @method emit
 * @memberOf keigai.DataListFilter
 * @return {Object} {@link keigai.DataListFilter}
 */
DataListFilter.prototype.emit = function () {
	this.observer.dispatch.apply( this.observer, [].concat( array.cast( arguments ) ) );

	return this;
};

/**
 * Gets listeners
 *
 * @method listeners
 * @memberOf keigai.DataListFilter
 * @param  {String} ev [Optional] Event name
 * @return {Object} Listeners
 */
DataListFilter.prototype.listeners = function ( ev ) {
	return ev ? this.observer.listeners[ev] : this.listeners;
};

/**
 * Removes an event listener
 *
 * @method off
 * @memberOf keigai.DataListFilter
 * @param  {String} ev Event name
 * @param  {String} id [Optional] Listener ID
 * @return {Object} {@link keigai.DataListFilter}
 */
DataListFilter.prototype.off = function ( ev, id ) {
	this.observer.off( ev, id );

	return this;
};

/**
 * Adds an event listener
 *
 * @method on
 * @memberOf keigai.DataListFilter
 * @param  {String}   ev       Event name
 * @param  {Function} listener Function to execute
 * @param  {String}   id       [Optional] Listener ID
 * @param  {String}   scope    [Optional] Listener scope, default is `this`
 * @return {Object} {@link keigai.DataListFilter}
 */
DataListFilter.prototype.on = function ( ev, listener, id, scope ) {
	this.observer.on( ev, listener, id, scope || this );

	return this;
};

/**
 * Adds a short lived event listener
 *
 * @method once
 * @memberOf keigai.DataListFilter
 * @param  {String}   ev       Event name
 * @param  {Function} listener Function to execute
 * @param  {String}   id       [Optional] Listener ID
 * @param  {String}   scope    [Optional] Listener scope, default is `this`
 * @return {Object} {@link keigai.DataListFilter}
 */
DataListFilter.prototype.once = function ( ev, listener, id, scope ) {
	this.observer.once( ev, listener, id, scope || this );

	return this;
};

/**
 * Set the filters
 *
 * Create an object based on comma separated key string
 *
 * @method set
 * @memberOf keigai.DataListFilter
 * @param  {String} fields Comma separated filters
 * @return {Object} {@link keigai.DataListFilter}
 */
DataListFilter.prototype.set = function ( fields ) {
	var obj = {};

	array.each( string.explode( fields ), function ( v ) {
		obj[v] = "";
	} );

	this.filters = obj;

	return this;
};

/**
 * Cancel all event listeners
 *
 * @method teardown
 * @memberOf keigai.DataListFilter
 * @return {Object} {@link keigai.DataListFilter}
 */
DataListFilter.prototype.teardown = function () {
	this.observer.unhook( this.element, "keyup" );
	this.observer.unhook( this.element, "input" );

	return this;
};

/**
 * Update the results list
 *
 * @method update
 * @memberOf keigai.DataListFilter
 * @return {Object} {@link keigai.DataListFilter}
 */
DataListFilter.prototype.update = function () {
	var self = this;

	utility.defer( function () {
		var val = element.val( self.element ).toString();
		
		self.dispatch( "beforeFilter", self.element );

		if ( !string.isEmpty( val ) ) {
			utility.iterate( self.filters, function ( v, k ) {
				var queries = string.explode( val );

				// Ignoring trailing commas
				queries = queries.filter( function ( i ) {
					return !string.isEmpty( i );
				} );

				// Shaping valid pattern
				array.each( queries, function ( i, idx ) {
					this[idx] = "^.*" + string.escape( i ).replace( /(^\*|\*$)/g, "" ).replace( /\*/g, ".*" ) + ".*";
				} );

				this[k] = queries.join( "," );
			} );

			self.list.filter = self.filters;
		}
		else {
			self.list.filter = null;
		}

		self.list.pageIndex = 1;
		self.list.refresh( true, true );

		self.dispatch( "afterFilter", self.element );
	}, this.debounce, this.element.id + "Debounce");

	return this;
};

/**
 * @namespace grid
 * @private
 */
var grid = {
	/**
	 * DataGrid factory
	 *
	 * @method factory
	 * @memberOf grid
	 * @param  {Object}  target      Element to receive DataGrid
	 * @param  {Object}  store       DataStore
	 * @param  {Array}   fields      Array of fields to display
	 * @param  {Array}   sortable    [Optional] Array of sortable columns/fields
	 * @param  {Object}  options     [Optional] DataList options
	 * @param  {Boolean} filtered    [Optional] Create an input to filter the data grid
	 * @param  {Number}  debounce    [Optional] DataListFilter input debounce, default is 250
	 * @return {Object} {@link keigai.DataGrid}
	 */
	factory : function ( target, store, fields, sortable, options, filtered, debounce ) {
		var ref = [store],
		    obj, template, header, width, css, sort;

		obj       = new DataGrid( target, ref[0], fields, sortable, options, filtered );
		template  = "";
		header    = element.create( "li", {}, element.create( "ul", {"class": "header"}, obj.element ) );
		width     = ( 100 / obj.fields.length ) + "%";
		css       = "display:inline-block;width:" + width;
		sort      = obj.options.order ? string.explode( obj.options.order ) : [];

		// Creating DataList template based on fields
		array.each( obj.fields, function ( i ) {
			var trimmed = i.replace( /.*\./g, "" ),
			    el      = element.create( "span", {innerHTML: string.capitalize( string.unCamelCase( string.unhyphenate( trimmed, true ) ), true ), style: css, "data-field": i}, header );

			// Adding CSS class if "column" is sortable
			if ( array.contains( obj.sortable, i ) ) {
				element.klass( el, "sortable", true );

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

		// Creating DataList
		ref.push( list.factory( obj.element, ref[0], template, obj.options ) );

		// Setting by-reference DataList on DataGrid
		obj.list = ref[1];

		if ( obj.filtered === true ) {
			// Creating DataListFilter
			ref.push( filter.factory( element.create( "input", {"class": "filter"}, obj.element, "first" ), ref[1], obj.fields.join( "," ), debounce || 250 ) );
			
			// Setting by-reference DataListFilter on DataGrid
			obj.filter = ref[2];
		}

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

		return obj;
	}
};

/**
 * Creates a new DataGrid
 *
 * @constructor
 * @memberOf keigai
 * @param  {Object}  target   Element to receive DataGrid
 * @param  {Object}  store    DataStore
 * @param  {Array}   fields   Array of fields to display
 * @param  {Array}   sortable [Optional] Array of sortable columns/fields
 * @param  {Object}  options  [Optional] DataList options
 * @param  {Boolean} filtered [Optional] Create an input to filter the DataGrid
 */
function DataGrid ( target, store, fields, sortable, options, filtered ) {
	var sortOrder;

	if ( options.order && !string.isEmpty( options.order ) ) {
		sortOrder = string.explode( options.order ).map( function ( i ) {
			return i.replace( regex.after_space, "" );
		} );
	}

	this.element   = element.create( "section", {"class": "grid"}, target );
	this.fields    = fields;
	this.filter    = null;
	this.filtered  = filtered === true;
	this.list      = null;
	this.observer  = new Observable();
	this.options   = options   || {};
	this.store     = store;
	this.sortable  = sortable  || [];
	this.sortOrder = sortOrder || sortable || [];
}

/**
 * Setting constructor loop
 *
 * @method constructor
 * @memberOf keigai.DataGrid
 * @type {Function}
 */
DataGrid.prototype.constructor = DataGrid;

/**
 * Adds an event listener
 *
 * @method addListener
 * @memberOf keigai.DataGrid
 * @param  {String}   ev       Event name
 * @param  {Function} listener Function to execute
 * @param  {String}   id       [Optional] Listener ID
 * @param  {String}   scope    [Optional] Listener scope, default is `this`
 * @return {Object} {@link keigai.DataGrid}
 */
DataGrid.prototype.addListener = function ( ev, listener, id, scope ) {
	this.observer.on( ev, listener, id, scope || this );

	return this;
};

/**
 * Dispatches an event, with optional arguments
 *
 * @method emit
 * @memberOf keigai.DataGrid
 * @return {Object} {@link keigai.DataGrid}
 */
DataGrid.prototype.dispatch = function () {
	this.observer.dispatch.apply( this.observer, [].concat( array.cast( arguments ) ) );

	return this;
};

/**
 * Exports data grid records
 *
 * @method dump
 * @memberOf keigai.DataGrid
 * @return {Array} Record set
 */
DataGrid.prototype.dump = function () {
	return this.store.dump( this.list.records, this.fields );
};

/**
 * Dispatches an event, with optional arguments
 *
 * @method emit
 * @memberOf keigai.DataGrid
 * @return {Object} {@link keigai.DataGrid}
 */
DataGrid.prototype.emit = function () {
	this.observer.dispatch.apply( this.observer, [].concat( array.cast( arguments ) ) );

	return this;
};

/**
 * Gets listeners
 *
 * @method listeners
 * @memberOf keigai.DataGrid
 * @param  {String} ev [Optional] Event name
 * @return {Object} Listeners
 */
DataGrid.prototype.listeners = function ( ev ) {
	return ev ? this.observer.listeners[ev] : this.listeners;
};

/**
 * Removes an event listener
 *
 * @method off
 * @memberOf keigai.DataGrid
 * @param  {String} ev Event name
 * @param  {String} id [Optional] Listener ID
 * @return {Object} {@link keigai.DataGrid}
 */
DataGrid.prototype.off = function ( ev, id ) {
	this.observer.off( ev, id );

	return this;
};

/**
 * Adds an event listener
 *
 * @method on
 * @memberOf keigai.DataGrid
 * @param  {String}   ev       Event name
 * @param  {Function} listener Function to execute
 * @param  {String}   id       [Optional] Listener ID
 * @param  {String}   scope    [Optional] Listener scope, default is `this`
 * @return {Object} {@link keigai.DataGrid}
 */
DataGrid.prototype.on = function ( ev, listener, id, scope ) {
	this.observer.on( ev, listener, id, scope || this );

	return this;
};

/**
 * Adds a short lived event listener
 *
 * @method once
 * @memberOf keigai.DataGrid
 * @param  {String}   ev       Event name
 * @param  {Function} listener Function to execute
 * @param  {String}   id       [Optional] Listener ID
 * @param  {String}   scope    [Optional] Listener scope, default is `this`
 * @return {Object} {@link keigai.DataGrid}
 */
DataGrid.prototype.once = function ( ev, listener, id, scope ) {
	this.observer.once( ev, listener, id, scope || this );

	return this;
};

/**
 * Refreshes the DataGrid
 *
 * Events: beforeRefresh  Fires from the element containing the DataGrid
 *         afterRefresh   Fires from the element containing the DataGrid
 *
 * @method refresh
 * @memberOf keigai.DataGrid
 * @return {Object} {@link keigai.DataGrid}
 */
DataGrid.prototype.refresh = function () {
	var sort = [],
	    self = this;

	this.dispatch( "beforeRefresh", this.element );

	if ( this.sortOrder.length > 0 ) {
		array.each( this.sortOrder, function ( i ) {
			var obj = element.find( self.element, ".header span[data-field='" + i + "']" )[0];

			sort.push( string.trim( i + " " + ( element.data( obj, "sort" ) || "" ) ) );
		} );

		this.options.order = this.list.order = sort.join( ", " );
	}

	this.list.where = null;
	utility.merge( this.list, this.options );
	this.list.refresh( true, true );

	this.dispatch( "afterRefresh", this.element );

	return this;
};

/**
 * Sorts the DataGrid when a column header is clicked
 *
 * @method sort
 * @memberOf keigai.DataGrid
 * @param  {Object} e Event
 * @return {Object} {@link keigai.DataGrid}
 */
DataGrid.prototype.sort = function ( e ) {
	var target = utility.target( e ),
	    field;

	// Stopping event propogation
	utility.stop( e );

	// Refreshing list if target is sortable
	if ( element.hasClass( target, "sortable" ) ) {
		field = element.data( target, "field" );
		element.data( target, "sort", element.data( target, "sort" ) === "asc" ? "desc" : "asc" );
		array.remove( this.sortOrder, field );
		this.sortOrder.splice( 0, 0, field );
		this.refresh();
	}

	return this;
};

/**
 * Tears down the DataGrid
 *
 * @method teardown
 * @memberOf keigai.DataGrid
 * @return {Object} {@link keigai.DataGrid}
 */
DataGrid.prototype.teardown = function () {
	if ( this.filter !== null ) {
		this.filter.teardown();
		this.filter = null;
	}

	this.list.teardown();
	this.observer.unhook( element.find( this.element, ".header" )[0], "click" );
	element.destroy( this.element );
	this.element = null;

	return this;
};

/**
 * @namespace list
 * @private
 */
var list = {
	/**
	 * Creates an instance of datalist
	 *
	 * @method factory
	 * @memberOf list
	 * @param  {Object} target   Element to receive the DataList
	 * @param  {Object} store    {@link keigai.DataStore}
	 * @param  {Mixed}  template Record field, template ( $.tpl ), or String, e.g. "<p>this is a {{field}} sample.</p>", fields are marked with {{ }}
	 * @param  {Object} options  Optional parameters to set on the DataList
	 * @return {Object} {@link keigai.DataList}
	 */
	factory : function ( target, store, template, options ) {
		var ref = [store],
		    obj;

		if ( !( target instanceof Element ) || typeof store != "object" || !regex.string_object.test( typeof template ) ) {
			throw new Error( label.invalidArguments );
		}

		// Creating instance
		obj = new DataList( element.create( "ul", {"class": "list"}, target ), ref[0], template );

		if ( options instanceof Object ) {
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

		obj.on( "click", function ( e ) {
			var target = utility.target( e ),
			    page;

			utility.stop( e );

			if ( target.nodeName === "A" ) {
				page = element.data( target, "page" );

				if ( !isNaN( page ) ) {
					obj.page( page );
				}
			}
		}, "pagination" );

		// Rendering if not tied to an API or data is ready
		if ( obj.store.uri === null || obj.store.loaded ) {
			obj.refresh( true, true );
		}

		return obj;
	},

	/**
	 * Calculates the total pages
	 *
	 * @method pages
	 * @memberOf list
	 * @return {Number} Total pages
	 */
	pages : function () {
		if ( isNaN( this.pageSize ) ) {
			throw new Error( label.invalidArguments );
		}

		return Math.ceil( ( !this.filter ? this.total : this.filtered.length ) / this.pageSize );
	},

	/**
	 * Calculates the page size as an Array of start & finish
	 *
	 * @method range
	 * @memberOf list
	 * @return {Array}  Array of start & end numbers
	 */
	range : function () {
		var start = ( this.pageIndex * this.pageSize ) - this.pageSize,
		    end   = this.pageSize;

		return [start, end];
	}
};

/**
 * Creates a new DataList
 *
 * @constructor
 * @memberOf keigai
 */
function DataList ( element, store, template ) {
	this.callback    = null;
	this.current     = [];
	this.element     = element;
	this.emptyMsg    = label.noData;
	this.filter      = null;
	this.filtered    = [];
	this.id          = utility.genId();
	this.observer    = new Observable();
	this.pageIndex   = 1;
	this.pageSize    = null;
	this.pageRange   = 5;
	this.pagination  = "bottom"; // "top" or "bottom|top" are also valid
	this.placeholder = "";
	this.order       = "";
	this.records     = [];
	this.template    = template;
	this.total       = 0;
	this.store       = store;
	this.where       = null;
}

/**
 * Setting constructor loop
 *
 * @method constructor
 * @memberOf keigai.DataList
 * @type {Function}
 */
DataList.prototype.constructor = DataList;

/**
 * Adds an event listener
 *
 * @method addListener
 * @memberOf keigai.DataList
 * @param  {String}   ev       Event name
 * @param  {Function} listener Function to execute
 * @param  {String}   id       [Optional] Listener ID
 * @param  {String}   scope    [Optional] Listener scope, default is `this`
 * @return {Object} {@link keigai.DataList}
 */
DataList.prototype.addListener = function ( ev, listener, id, scope ) {
	this.observer.on( ev, listener, id, scope || this );

	return this;
};

/**
 * Dispatches an event, with optional arguments
 *
 * @method emit
 * @memberOf keigai.DataList
 * @return {Object} {@link keigai.DataList}
 */
DataList.prototype.dispatch = function () {
	this.observer.dispatch.apply( this.observer, [].concat( array.cast( arguments ) ) );

	return this;
};

/**
 * Exports data list records
 *
 * @method dump
 * @memberOf keigai.DataList
 * @return {Array} Record set
 */
DataList.prototype.dump = function () {
	return this.store.dump( this.records );
};

/**
 * Dispatches an event, with optional arguments
 *
 * @method emit
 * @memberOf keigai.DataList
 * @return {Object} {@link keigai.DataList}
 */
DataList.prototype.emit = function () {
	this.observer.dispatch.apply( this.observer, [].concat( array.cast( arguments ) ) );

	return this;
};

/**
 * Gets listeners
 *
 * @method listeners
 * @memberOf keigai.DataList
 * @param  {String} ev [Optional] Event name
 * @return {Object} Listeners
 */
DataList.prototype.listeners = function ( ev ) {
	return ev ? this.observer.listeners[ev] : this.listeners;
};

/**
 * Removes an event listener
 *
 * @method off
 * @memberOf keigai.DataList
 * @param  {String} ev Event name
 * @param  {String} id [Optional] Listener ID
 * @return {Object} {@link keigai.DataList}
 */
DataList.prototype.off = function ( ev, id ) {
	this.observer.off( ev, id );

	return this;
};

/**
 * Adds an event listener
 *
 * @method on
 * @memberOf keigai.DataList
 * @param  {String}   ev       Event name
 * @param  {Function} listener Function to execute
 * @param  {String}   id       [Optional] Listener ID
 * @param  {String}   scope    [Optional] Listener scope, default is `this`
 * @return {Object} {@link keigai.DataList}
 */
DataList.prototype.on = function ( ev, listener, id, scope ) {
	this.observer.on( ev, listener, id, scope || this );

	return this;
};

/**
 * Adds a short lived event listener
 *
 * @method once
 * @memberOf keigai.DataList
 * @param  {String}   ev       Event name
 * @param  {Function} listener Function to execute
 * @param  {String}   id       [Optional] Listener ID
 * @param  {String}   scope    [Optional] Listener scope, default is `this`
 * @return {Object} {@link keigai.DataList}
 */
DataList.prototype.once = function ( ev, listener, id, scope ) {
	this.observer.once( ev, listener, id, scope || this );

	return this;
};

/**
 * Changes the page index of the DataList
 *
 * @method page
 * @memberOf keigai.DataList
 * @param  {Boolean} redraw [Optional] Boolean to force clearing the DataList, default is `true`, `false` toggles "hidden" class of items
 * @param  {Boolean} create [Optional] Recreates cached View of data
 * @return {Object} {@link keigai.DataList}
 */
DataList.prototype.page = function ( arg, redraw, create ) {
	this.pageIndex = arg;

	return this.refresh( redraw, create );
};

/**
 * Adds pagination Elements to the View
 *
 * @method pages
 * @memberOf keigai.DataList
 * @return {Object} {@link keigai.DataList}
 */
DataList.prototype.pages = function () {
	var self  = this,
	    obj   = this.element,
	    page  = this.pageIndex,
	    pos   = this.pagination,
	    range = this.pageRange,
	    mid   = Math.floor( range / 2 ),
	    start = page - mid,
	    end   = page + mid,
	    total = list.pages.call( this ),
	    diff;

	if ( !regex.top_bottom.test( pos ) ) {
		throw new Error( label.invalidArguments );
	}

	// Removing the existing controls
	array.each( utility.dom( "#" + obj.id + "-pages-top, #" + obj.id + "-pages-bottom" ), function ( i ) {
		if ( i ) {
			self.observer.unhook( i, "click" );
			element.destroy( i );
		}
	} );
	
	// Halting because there's 1 page, or nothing
	if ( ( this.filter && this.filtered.length === 0 ) || this.total === 0 || total === 1 ) {
		return this;
	}

	// Getting the range to display
	if ( start < 1 ) {
		diff  = number.diff( start, 1 );
		start = start + diff;
		end   = end   + diff;
	}

	if ( end > total ) {
		end   = total;
		start = ( end - range ) + 1;

		if ( start < 1 ) {
			start = 1;
		}
	}

	if ( number.diff( start, end ) >= range ) {
		--end;
	}

	array.each( string.explode( pos ), function ( i ) {
		var current = false,
		    more    = page > 1,
		    next    = ( page + 1 ) <= total,
		    last    = ( page >= total ),
		    el, n;

		// Setting up the list
		el = element.create( "ul", {"class": "list pages hidden " + i, id: obj.id + "-pages-" + i}, obj, i === "bottom" ? "after" : "before" );

		// First page
		element.create( more ? "a" : "span", {"class": "first page", "data-page": 1, innerHTML: "&lt;&lt;"}, element.create( "li", {}, el ) );

		// Previous page
		element.create( more ? "a" : "span", {"class": "prev page", "data-page": ( page - 1 ), innerHTML: "&lt;"}, element.create( "li", {}, el ) );

		// Rendering the page range
		for ( n = start; n <= end; n++ ) {
			current = ( n === page );
			element.create( current ? "span" : "a", {"class": current ? "current page" : "page", "data-page": n, innerHTML: n}, element.create( "li", {}, el ) );
		}

		// Next page
		element.create( next ? "a" : "span", {"class": "next page", "data-page": next ? ( page + 1 ) : null, innerHTML: "&gt;"}, element.create( "li", {}, el ) );

		// Last page
		element.create( last ? "span" : "a", {"class": "last page", "data-page": last ? null : total, innerHTML: "&gt;&gt;"}, element.create( "li", {}, el ) );

		// Adding to DOM
		element.klass( el, "hidden", false );

		// Pagination listener
		self.observer.hook( el, "click" );
	} );

	return this;
};

/**
 * Refreshes element
 *
 * Events: beforeRefresh  Fires from the element containing the DataList
 *         afterRefresh   Fires from the element containing the DataList
 *
 * @method refresh
 * @memberOf keigai.DataList
 * @param  {Boolean} redraw [Optional] Boolean to force clearing the DataList ( default ), false toggles "hidden" class of items
 * @param  {Boolean} create [Optional] Recreates cached View of data
 * @return {Object} {@link keigai.DataList}
 */
DataList.prototype.refresh = function ( redraw, create ) {
	var el       = this.element,
	    template = ( typeof this.template == "object" ),
	    filter   = this.filter !== null,
	    items    = [],
	    self     = this,
	    callback = ( typeof this.callback == "function" ),
	    reg      = new RegExp(),
	    registry = [], // keeps track of records in the list ( for filtering )
	    range    = [],
	    fn, ceiling, next;

	redraw = ( redraw !== false );
	create = ( create === true );

	this.dispatch( "beforeRefresh", el );

	// Function to create templates for the html rep
	if ( !template ) {
		fn = function ( i ) {
			var html  = self.template,
			    items = array.unique( html.match( /\{\{[\w\.\-\[\]]+\}\}/g ) );

			// Replacing record key
			html = html.replace( "{{" + self.store.key + "}}", i.key );
			
			// Replacing dot notation properties
			array.each( items, function ( attr ) {
				var key   = attr.replace( /\{\{|\}\}/g, "" ),
				    value = utility.walk( i.data, key );

				reg.compile( string.escape( attr ), "g" );
				html = html.replace( reg, value );
			} );

			// Filling in placeholder value
			html = html.replace( /\{\{.*\}\}/g, self.placeholder );

			return "<li data-key=\"" + i.key + "\">" + html + "</li>";
		};
	}
	else {
		fn = function ( i ) {
			var obj   = json.encode( self.template ),
			    items = array.unique( obj.match( /\{\{[\w\.\-\[\]]+\}\}/g ) );

			// Replacing record key
			obj = obj.replace( "{{" + self.store.key + "}}", i.key );
			
			// Replacing dot notation properties
			array.each( items, function ( attr ) {
				var key   = attr.replace( /\{\{|\}\}/g, "" ),
				    value = utility.walk( i.data, key );

				reg.compile( string.escape( attr ), "g" );

				// Stripping first and last " to concat to valid JSON
				obj = obj.replace( reg, json.encode( value ).replace( /(^")|("$)/g, "" ) );
			} );

			// Filling in placeholder value
			obj = json.decode( obj.replace( /\{\{.*\}\}/g, self.placeholder ) );

			return {li: obj};
		};
	}

	// Next phase
	next = function ( args ) {
		self.records = args;

		// Creating view of DataStore
		if ( create ) {
			self.total    = self.records.length;
			self.filtered = [];
		}

		// Resetting 'view' specific arrays
		self.current  = [];

		// Filtering records (if applicable)
		if ( filter && create ) {
			array.each( self.records, function ( i ) {
				utility.iterate( self.filter, function ( v, k ) {
					var reg, key;

					if ( array.contains( registry, i.key ) ) {
						return false;
					}
					
					v   = string.explode( v );
					reg = new RegExp(),
					key = ( k === self.store.key );

					array.each( v, function ( query ) {
						var value = !key ? utility.walk( i.data, k ) : "";

						utility.compile( reg, query, "i" );

						if ( ( key && reg.test( i.key ) ) || reg.test( value ) ) {
							registry.push( i.key );
							self.filtered.push( i );

							return false;
						}
					} );
				} );
			} );
		}

		// Pagination
		if ( self.pageSize !== null && !isNaN( self.pageIndex ) && !isNaN( self.pageSize ) ) {
			ceiling = list.pages.call( self );

			// Passed the end, so putting you on the end
			if ( ceiling > 0 && self.pageIndex > ceiling ) {
				return self.page( ceiling );
			}

			// Paginating the items
			else if ( self.total > 0 ) {
				range        = list.range.call( self );
				self.current = array.limit( !filter ? self.records : self.filtered, range[0], range[1] );
			}
		}
		else {
			self.current = !filter ? self.records : self.filtered;
		}

		// Processing records & generating templates
		array.each( self.current, function ( i ) {
			items.push( {key: i.key, template: fn( i )} );
		} );

		// Preparing the target element
		if ( redraw ) {
			if ( items.length === 0 ) {
				el.innerHTML = "<li class=\"empty\">" + self.emptyMsg + "</li>";
			}
			else {
				el.innerHTML = items.map( function ( i ) {
					return i.template;
				} ).join( "\n" );

				if ( callback ) {
					array.each( element.find( el, "> li" ), function ( i ) {
						self.callback( i );
					} );
				}
			}
		}
		else {
			array.each( element.find( el, "> li" ), function ( i ) {
				element.addClass( i, "hidden" );
			} );

			array.each( items, function ( i ) {
				array.each( element.find( el, "> li[data-key='" + i.key + "']" ), function ( o ) {
					element.removeClass( o, "hidden" );
				} );
			} );
		}

		// Rendering pagination elements
		if ( self.pageSize !== null && regex.top_bottom.test( self.pagination ) && !isNaN( self.pageIndex ) && !isNaN( self.pageSize ) ) {
			self.pages();
		}
		else {
			array.each( utility.$( "#" + el.id + "-pages-top, #" + el.id + "-pages-bottom" ), function ( i ) {
				element.destroy( i );
			} );
		}

		self.dispatch( "afterRefresh", el );
	};

	// Consuming records based on sort
	if ( this.where === null ) {
		string.isEmpty( this.order ) ? next( this.store.get() ) : this.store.sort( this.order, create ).then( next, function ( e ) {
			utility.error( e );
		} );
	}
	else if ( string.isEmpty( this.order ) ) {
		this.store.select( this.where ).then( next, function ( e ) {
			utility.error( e );
		} );
	}
	else {
		this.store.sort( this.order, create, this.where ).then( next, function ( e ) {
			utility.error( e );
		} );
	}

	return this;
};

/**
 * Sorts data list & refreshes element
 *
 * @method sort
 * @memberOf keigai.DataList
 * @param  {String}  order  SQL "order by" statement
 * @param  {Boolean} create [Optional] Recreates cached View of data store
 * @return {Object} {@link keigai.DataList}
 */
DataList.prototype.sort = function ( order, create ) {
	this.order = order;

	return this.refresh( true, create );
};

/**
 * Tears down references to the DataList
 *
 * @method teardown
 * @memberOf keigai.DataList
 * @param  {Boolean} destroy [Optional] `true` will remove the DataList from the DOM
 * @return {Object} {@link keigai.DataList}
 */
DataList.prototype.teardown = function ( destroy ) {
	destroy  = ( destroy === true );
	var self = this;

	array.each( this.store.lists, function ( i, idx ) {
		if ( i.id === self.id ) {
			this.remove( idx );

			return false;
		}
	} );

	delete this.observer.hooks[this.element.id];

	if ( destroy ) {
		element.destroy( this.element );
		this.element = null;
	}

	return this;
};

/**
 * @namespace deferred
 * @private
 */
var deferred = {
	/**
	 * Deferred factory
	 *
	 * @method factory
	 * @memberOf deferred
	 * @return {Object} {@link keigai.Deferred}
	 */
	 factory : function () {
		return new Deferred();
	}
};

/**
 * Creates a new Deferred
 *
 * @constructor
 * @memberOf keigai
 */
function Deferred () {
	var self      = this;

	this.promise  = promise.factory();
	this.onDone   = [];
	this.onAlways = [];
	this.onFail   = [];

	// Setting handlers to execute Arrays of Functions
	this.promise.then( function ( arg ) {
		promise.delay( function () {
			array.each( self.onDone, function ( i ) {
				i( arg );
			} );

			array.each( self.onAlways, function ( i ) {
				i( arg );
			} );

			self.onAlways = [];
			self.onDone   = [];
			self.onFail   = [];
		} );
	}, function ( arg ) {
		promise.delay( function () {
			array.each( self.onFail, function ( i ) {
				i( arg );
			} );

			array.each( self.onAlways, function ( i ) {
				i( arg );
			} );

			self.onAlways = [];
			self.onDone   = [];
			self.onFail   = [];
		} );
	} );
}

/**
 * Setting constructor loop
 *
 * @method constructor
 * @memberOf keigai.Deferred
 * @type {Function}
 */
Deferred.prototype.constructor = Deferred;

/**
 * Registers a function to execute after Promise is reconciled
 *
 * @method always
 * @memberOf keigai.Deferred
 * @param  {Function} arg Function to execute
 * @return {Object} {@link keigai.Deferred}
 */
Deferred.prototype.always = function ( arg ) {
	if ( !this.isResolved() && !this.isRejected() && typeof arg == "function" ) {
		this.onAlways.push( arg );
	}

	return this;
};

/**
 * Registers a function to execute after Promise is resolved
 *
 * @method done
 * @memberOf keigai.Deferred
 * @param  {Function} arg Function to execute
 * @return {Object} {@link keigai.Deferred}
 */
Deferred.prototype.done = function ( arg ) {
	if ( !this.isResolved() && !this.isRejected() && typeof arg == "function" ) {
		this.onDone.push( arg );
	}

	return this;
};

/**
 * Registers a function to execute after Promise is rejected
 *
 * @method fail
 * @memberOf keigai.Deferred
 * @param  {Function} arg Function to execute
 * @return {Object} {@link keigai.Deferred}
 */
Deferred.prototype.fail = function ( arg ) {
	if ( !this.isResolved() && !this.isRejected() && typeof arg == "function" ) {
		this.onFail.push( arg );
	}

	return this;
};

/**
 * Determines if Deferred is rejected
 *
 * @method isRejected
 * @memberOf keigai.Deferred
 * @return {Boolean} `true` if rejected
 */
Deferred.prototype.isRejected = function () {
	return ( this.promise.state === promise.state.FAILED );
};

/**
 * Determines if Deferred is resolved
 *
 * @method isResolved
 * @memberOf keigai.Deferred
 * @return {Boolean} `true` if resolved
 */
Deferred.prototype.isResolved = function () {
	return ( this.promise.state === promise.state.SUCCESS );
};

/**
 * Rejects the Promise
 *
 * @method reject
 * @memberOf keigai.Deferred
 * @param  {Mixed} arg Rejection outcome
 * @return {Object} {@link keigai.Deferred}
 */
Deferred.prototype.reject = function ( arg ) {
	this.promise.reject.call( this.promise, arg );

	return this;
};

/**
 * Resolves the Promise
 *
 * @method resolve
 * @memberOf keigai.Deferred
 * @param  {Mixed} arg Resolution outcome
 * @return {Object} {@link keigai.Deferred}
 */
Deferred.prototype.resolve = function ( arg ) {
	this.promise.resolve.call( this.promise, arg );

	return this;
};

/**
 * Gets the state of the Promise
 *
 * @method state
 * @memberOf keigai.Deferred
 * @return {String} Describes the state
 */
Deferred.prototype.state = function () {
	return this.promise.state;
};

/**
 * Registers handler(s) for the Promise
 *
 * @method then
 * @memberOf keigai.Deferred
 * @param  {Function} success Executed when/if promise is resolved
 * @param  {Function} failure [Optional] Executed when/if promise is broken
 * @return {Object} {@link Promise}
 */
Deferred.prototype.then = function ( success, failure ) {
	return this.promise.then( success, failure );
};

/**
 * @namespace element
 * @private
 */
var element = {
	/**
	 * Gets or sets an Element attribute
	 *
	 * @method attr
	 * @memberOf element
	 * @param  {Mixed}  obj   Element
	 * @param  {String} name  Attribute name
	 * @param  {Mixed}  value Attribute value
	 * @return {Object}       Element
	 */
	attr : function ( obj, key, value ) {
		var target, result;

		if ( regex.svg.test( obj.namespaceURI ) ) {
			if ( value === undefined ) {
				result = obj.getAttributeNS( obj.namespaceURI, key );

				if ( result === null || string.isEmpty( result ) ) {
					result = undefined;
				}
				else {
					result = utility.coerce( result );
				}
			}
			else {
				obj.setAttributeNS( obj.namespaceURI, key, value );
			}
		}
		else {
			if ( typeof value == "string" ) {
				value = string.trim( value );
			}

			if ( regex.checked_disabled.test( key ) && value === undefined ) {
				return utility.coerce( obj[key] );
			}
			else if ( regex.checked_disabled.test( key ) && value !== undefined ) {
				obj[key] = value;
			}
			else if ( obj.nodeName === "SELECT" && key === "selected" && value === undefined ) {
				return utility.dom( "#" + obj.id + " option[selected=\"selected\"]" )[0] || utility.dom( "#" + obj.id + " option" )[0];
			}
			else if ( obj.nodeName === "SELECT" && key === "selected" && value !== undefined ) {
				target = utility.dom( "#" + obj.id + " option[selected=\"selected\"]" )[0];

				if ( target !== undefined ) {
					target.selected = false;
					target.removeAttribute( "selected" );
				}

				target = utility.dom( "#" + obj.id + " option[value=\"" + value + "\"]" )[0];
				target.selected = true;
				target.setAttribute( "selected", "selected" );
			}
			else if ( value === undefined ) {
				result = obj.getAttribute( key );

				if ( result === null || string.isEmpty( result ) ) {
					result = undefined;
				}
				else {
					result = utility.coerce( result );
				}

				return result;
			}
			else {
				obj.setAttribute( key, value );
			}
		}

		return obj;
	},

	/**
	 * Creates an Element in document.body or a target Element.
	 * An id is generated if not specified with args.
	 *
	 * @method create
	 * @memberOf element
	 * @param  {String} type   Type of Element to create, or HTML String
	 * @param  {Object} args   [Optional] Properties to set
	 * @param  {Mixed}  target [Optional] Target Element
	 * @param  {Mixed}  pos    [Optional] "first", "last" or Object describing how to add the new Element, e.g. {before: referenceElement}
	 * @return {Mixed}         Element that was created, or an Array if `type` is a String of multiple Elements (frag)
	 */
	create : function ( type, args, target, pos ) {
		var svg  = false,
		    frag = false,
		    obj, uid, result;

		// Removing potential HTML template formatting
		type = type.replace( /\t|\n|\r/g, "" );

		if ( target ) {
			svg = target.namespaceURI && regex.svg.test( target.namespaceURI );
		}
		else {
			target = document.body;
		}
		
		if ( args instanceof Object && args.id && !utility.dom( "#" + args.id ) ) {
			uid = args.id;
			delete args.id;
		}
		else if ( !svg ) {
			uid = utility.genId( undefined, true );
		}

		// String injection, create a frag and apply it
		if ( regex.html.test( type ) ) {
			frag   = true;
			obj    = element.frag( type );
			result = obj.childNodes.length === 1 ? obj.childNodes[0] : array.cast( obj.childNodes );
		}
		// Original syntax
		else {
			if ( !svg && !regex.svg.test( type ) ) {
				obj = document.createElement( type );
			}
			else {
				obj = document.createElementNS( "http://www.w3.org/2000/svg", type );
			}

			if ( uid ) {
				obj.id = uid;
			}

			if ( args instanceof Object ) {
				element.update( obj, args );
			}
		}

		if ( !pos || pos === "last" ) {
			target.appendChild( obj );
		}
		else if ( pos === "first" ) {
			element.prependChild( target, obj );
		}
		else if ( pos === "after" ) {
			pos = {};
			pos.after = target;
			target    = target.parentNode;
			target.insertBefore( obj, pos.after.nextSibling );
		}
		else if ( pos.after ) {
			target.insertBefore( obj, pos.after.nextSibling );
		}
		else if ( pos === "before" ) {
			pos = {};
			pos.before = target;
			target     = target.parentNode;
			target.insertBefore( obj, pos.before );
		}
		else if ( pos.before ) {
			target.insertBefore( obj, pos.before );
		}
		else {
			target.appendChild( obj );
		}

		return !frag ? obj : result;
	},

	/**
	 * Data attribute facade acting as a getter (with coercion) & setter
	 *
	 * @method data
	 * @memberOf element
	 * @param  {Mixed}  obj   Element
	 * @param  {String} key   Data key
	 * @param  {Mixed}  value Boolean, Number or String to set
	 * @return {Mixed}        undefined, Element or value
	 */
	data : function ( obj, key, value ) {
		if ( value !== undefined ) {
			obj.setAttribute( "data-" + key, regex.json_wrap.test( value ) ? json.encode( value ) : value );
			return obj;
		}
		else {
			return utility.coerce( obj.getAttribute( "data-" + key ) );
		}
	},

	/**
	 * Destroys an Element
	 *
	 * @method destroy
	 * @memberOf element
	 * @param  {Mixed} obj Element
	 * @return {Undefined} undefined
	 */
	destroy : function ( obj ) {
		if ( obj.parentNode !== null ) {
			obj.parentNode.removeChild( obj );
		}

		return undefined;
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
	 * @param  {Object}  data       Data to include with the Event
	 * @param  {Boolean} bubbles    [Optional] Determines if the Event bubbles, defaults to `true`
	 * @param  {Boolean} cancelable [Optional] Determines if the Event can be canceled, defaults to `true`
	 * @return {Object}             Element which dispatches the Event
	 */
	dispatch : function ( obj, type, data, bubbles, cancelable ) {
		var ev = new CustomEvent( type );

		bubbles    = ( bubbles    !== false );
		cancelable = ( cancelable !== false );

		ev.initCustomEvent( type, bubbles, cancelable, data || {} );
		obj.dispatchEvent( ev );

		return obj;
	},

	/**
	 * Finds descendant childNodes of Element matched by arg
	 *
	 * @method find
	 * @memberOf element
	 * @param  {Mixed}  obj Element to search
	 * @param  {String} arg Comma delimited string of descendant selectors
	 * @return {Mixed}      Array of Elements or undefined
	 */
	find : function ( obj, arg ) {
		var result = [];

		utility.genId( obj, true );

		array.each( string.explode( arg ), function ( i ) {
			result = result.concat( utility.dom( "#" + obj.id + " " + i ) );
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
	 */
	frag : function ( arg ) {
		var obj = document.createDocumentFragment();

		if ( arg ) {
			array.each( array.cast( element.create( "div", {innerHTML: arg}, obj ).childNodes ), function ( i ) {
				obj.appendChild( i );
			} );

			obj.removeChild( obj.childNodes[0] );
		}

		return obj;
	},

	/**
	 * Determines if obj has a specific CSS class
	 *
	 * @method hasClass
	 * @memberOf element
	 * @param  {Mixed} obj Element
	 * @return {Mixed}     Element, Array of Elements or undefined
	 */
	hasClass : function ( obj, klass ) {
		return obj.classList.contains( klass );
	},

	/**
	 * Adds or removes a CSS class
	 *
	 * @method klass
	 * @memberOf element
	 * @param  {Mixed}   obj Element
	 * @param  {String}  arg Class to add or remove ( can be a wildcard )
	 * @param  {Boolean} add Boolean to add or remove, defaults to true
	 * @return {Object}      Element
	 */
	klass : function ( obj, arg, add ) {
		add = ( add !== false );
		arg = string.explode( arg, " " );

		if ( add ) {
			array.each( arg, function ( i ) {
				obj.classList.add( i );
			} );
		}
		else {
			array.each( arg, function ( i ) {
				if ( i !== "*" ) {
					obj.classList.remove( i );
				}
				else {
					array.each( obj.classList, function ( x ) {
						this.remove( x );
					} );

					return false;
				}
			} );
		}

		return obj;
	},

	/**
	 * Prepends an Element to an Element
	 *
	 * @method prependChild
	 * @memberOf element
	 * @param  {Object} obj   Element
	 * @param  {Object} child Child Element
	 * @return {Object}       Element
	 */
	prependChild : function ( obj, child ) {
		return obj.childNodes.length === 0 ? obj.appendChild( child ) : obj.insertBefore( child, obj.childNodes[0] );
	},

	/**
	 * Getter / setter for an Element's text
	 *
	 * @method text
	 * @memberOf element
	 * @param  {Object} obj Element
	 * @param  {String} arg [Optional] Value to set
	 * @return {Object}     Element
	 */
	text : function ( obj, arg ) {
		var key     = obj.textContent ? "textContent" : "innerText",
		    payload = {},
		    set     = false;

		if ( typeof arg != "undefined" ) {
			set          = true;
			payload[key] = arg;
		}

		return set ? element.update( obj, payload ) : obj[key];
	},

	/**
	 * Updates an Element
	 *
	 * @method update
	 * @memberOf element
	 * @param  {Mixed}  obj  Element
	 * @param  {Object} args Properties to set
	 * @return {Object}      Element
	 */
	update : function ( obj, args ) {
		utility.iterate( args, function ( v, k ) {
			if ( regex.element_update.test( k ) ) {
				obj[k] = v;
			}
			else if ( k === "class" ) {
				!string.isEmpty( v ) ? element.klass( obj, v ) : element.klass( obj, "*", false );
			}
			else if ( k.indexOf( "data-" ) === 0 ) {
				element.data( obj, k.replace( "data-", "" ), v );
			}
			else {
				element.attr ( obj, k, v );
			}
		} );

		return obj;
	},

	/**
	 * Gets or sets the value of Element
	 *
	 * @method val
	 * @memberOf element
	 * @param  {Mixed}  obj   Element
	 * @param  {Mixed}  value [Optional] Value to set
	 * @return {Object}       Element
	 */
	val : function ( obj, value ) {
		var ev = "input",
		    output;

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
			}
			else if ( regex.select.test( obj.type ) ) {
				output = obj.options[obj.selectedIndex].value;
			}
			else if ( obj.value ) {
				output = obj.value;
			}
			else {
				output = element.text( obj );
			}

			if ( output !== undefined ) {
				output = utility.coerce( output );
			}

			if ( typeof output == "string" ) {
				output = string.trim( output );
			}
		}
		else {
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
			}
			else if ( regex.select.test( obj.type ) ) {
				ev = "change";

				array.each( element.find( obj, "> *" ), function ( i ) {
					if ( i.value === value ) {
						i.selected = true;
						output = i;
						return false;
					}
				} );
			}
			else {
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
 * @private
 */
var json = {
	/**
	 * Transforms JSON to CSV
	 *
	 * @method csv
	 * @memberOf json
	 * @param  {String}  arg JSON  string to transform
	 * @param  {String}  delimiter [Optional] Character to separate fields
	 * @param  {Boolean} header    [Optional] False to not include field names as first row
	 * @return {String}            CSV string
	 */
	csv : function ( arg, delimiter, header ) {
		var obj    = json.decode( arg, true ) || arg,
		    result = "";

		delimiter  = delimiter || ",";
		header     = ( header !== false );

		// Prepares input based on CSV rules
		function prepare ( input ) {
			var output;

			if ( input instanceof Array ) {
				output = "\"" + input.toString() + "\"";

				if ( regex.object_type.test( output ) ) {
					output = "\"" + json.csv( input, delimiter ) + "\"";
				}
			}
			else if ( input instanceof Object ) {
				output = "\"" + json.csv( input, delimiter ) + "\"";
			}
			else if ( regex.csv_quote.test( input ) ) {
				output = "\"" + input.replace( /"/g, "\"\"" ) + "\"";
			}
			else {
				output = input;
			}

			return output;
		}

		if ( obj instanceof Array ) {
			if ( obj[0] instanceof Object ) {
				if ( header ) {
					result = ( array.keys( obj[0] ).join( delimiter ) + "\n" );
				}

				result += obj.map( function ( i ) {
					return json.csv( i, delimiter, false );
				} ).join( "\n" );
			}
			else {
				result += ( prepare( obj, delimiter ) + "\n" );
			}

		}
		else {
			if ( header ) {
				result = ( array.keys( obj ).join( delimiter ) + "\n" );
			}

			result += ( array.cast( obj ).map( prepare ).join( delimiter ) + "\n" );
		}

		return result.replace( regex.eol_nl , "");
	},

	/**
	 * Decodes the argument
	 *
	 * @method decode
	 * @memberOf json
	 * @param  {String}  arg    String to parse
	 * @param  {Boolean} silent [Optional] Silently fail
	 * @return {Mixed}          Entity resulting from parsing JSON, or undefined
	 */
	decode : function ( arg, silent ) {
		try {
			return JSON.parse( arg );
		}
		catch ( e ) {
			if ( silent !== true ) {
				utility.error( e, arguments, this );
			}

			return undefined;
		}
	},

	/**
	 * Encodes the argument as JSON
	 *
	 * @method encode
	 * @memberOf json
	 * @param  {Mixed}   arg    Entity to encode
	 * @param  {Boolean} silent [Optional] Silently fail
	 * @return {String}         JSON, or undefined
	 */
	encode : function ( arg, silent ) {
		try {
			return JSON.stringify( arg );
		}
		catch ( e ) {
			if ( silent !== true ) {
				utility.error( e, arguments, this );
			}

			return undefined;
		}
	}
};

/**
 * @namespace label
 * @private
 */
var label = {
	/**
	 * Expected a Number
	 *
	 * @type {String}
	 * @memberOf label
	 */
	expectedNumber : "Expected a Number",

	/**
	 * Expected a property, and it was not set
	 *
	 * @type {String}
	 * @memberOf label
	 */
	expectedProperty : "Expected a property, and it was not set",

	/**
	 * Expected an Object
	 *
	 * @type {String}
	 * @memberOf label
	 */
	expectedObject : "Expected an Object",

	/**
	 * One or more arguments is invalid
	 *
	 * @type {String}
	 * @memberOf label
	 */
	invalidArguments : "One or more arguments is invalid",

	/**
	 * INVALID_STATE_ERR: Headers have not been received
	 *
	 * @type {String}
	 * @memberOf label
	 */
	invalidStateNoHeaders : "INVALID_STATE_ERR: Headers have not been received",

	/**
	 * Synchronous XMLHttpRequest requests are not supported
	 *
	 * @type {String}
	 * @memberOf label
	 */
	invalidStateNoSync : "Synchronous XMLHttpRequest requests are not supported",

	/**
	 * INVALID_STATE_ERR: Object is not open
	 *
	 * @type {String}
	 * @memberOf label
	 */
	invalidStateNotOpen : "INVALID_STATE_ERR: Object is not open",

	/**
	 * INVALID_STATE_ERR: Object is sending
	 *
	 * @type {String}
	 * @memberOf label
	 */
	invalidStateNotSending : "INVALID_STATE_ERR: Object is sending",

	/**
	 * INVALID_STATE_ERR: Object is not usable
	 *
	 * @type {String}
	 * @memberOf label
	 */
	invalidStateNotUsable : "INVALID_STATE_ERR: Object is not usable",

	/**
	 * Defauly `emptyMsg` of DataLists
	 *
	 * @type {String}
	 * @memberOf label
	 */
	noData : "Nothing to display",

	/**
	 * Requested method is not available
	 *
	 * @type {String}
	 * @memberOf label
	 */
	notAvailable : "Requested method is not available",

	/**
	 * Server error has occurred
	 *
	 * @type {String}
	 * @memberOf label
	 */
	serverError : "Server error has occurred",

	/**
	 * Forbidden to access URI
	 *
	 * @type {String}
	 * @memberOf label
	 */
	serverForbidden : "Forbidden to access URI",

	/**
	 * Method not allowed
	 *
	 * @type {String}
	 * @memberOf label
	 */
	serverInvalidMethod : "Method not allowed",

	/**
	 * Authorization required to access URI
	 *
	 * @type {String}
	 * @memberOf label
	 */
	serverUnauthorized : "Authorization required to access URI",

	/**
	 * Your browser is too old to use keigai, please upgrade
	 *
	 * @type {String}
	 * @memberOf label
	 */
	upgrade : "Your browser is too old to use keigai, please upgrade"
};

/**
 * Creates a new Least Recently Used cache
 *
 * @constructor
 * @memberOf keigai
 * @param  {Number} max [Optional] Max size of cache, default is 1000
 */
function LRU ( max ) {
	this.cache  = {};
	this.max    = max || 1000;
	this.first  = null;
	this.last   = null;
	this.length = 0;
}

/**
 * Setting constructor loop
 *
 * @method constructor
 * @memberOf keigai.LRU
 * @type {Function}
 */
LRU.prototype.constructor = LRU;

/**
 * Evicts the least recently used item from cache
 *
 * @method evict
 * @memberOf keigai.LRU
 * @return {Object} {@link keigai.LRU}
 */
LRU.prototype.evict = function () {
	if ( this.last !== null ) {
		this.remove( this.last );
	}

	return this;
};

/**
 * Gets cached item and moves it to the front
 *
 * @method get
 * @memberOf keigai.LRU
 * @param  {String} key Item key
 * @return {Object} {@link keigai.LRUItem}
 */
LRU.prototype.get = function ( key ) {
	var item = this.cache[key];

	if ( item === undefined ) {
		return;
	}

	this.set( key, item.value );

	return item.value;
};

/**
 * Removes item from cache
 *
 * @method remove
 * @memberOf keigai.LRU
 * @param  {String} key Item key
 * @return {Object} {@link keigai.LRUItem}
 */
LRU.prototype.remove = function ( key ) {
	var item = this.cache[ key ];

	if ( item ) {
		delete this.cache[key];

		this.length--;

		if ( item.previous !== null ) {
			this.cache[item.previous].next = item.next;
		}

		if ( item.next !== null ) {
			this.cache[item.next].previous = item.previous;
		}

		if ( this.first === key ) {
			this.first = item.previous;
		}

		if ( this.last === key ) {
			this.last = item.next;
		}
	}

	return item;
};

/**
 * Sets item in cache as `first`
 *
 * @method set
 * @memberOf keigai.LRU
 * @param  {String} key   Item key
 * @param  {Mixed}  value Item value
 * @return {Object} {@link keigai.LRU}
 */
LRU.prototype.set = function ( key, value ) {
	var item = this.remove( key );

	if ( item === undefined ) {
		item = new LRUItem( value );
	}
	else {
		item.value = value;
	}

	item.next       = null;
	item.previous   = this.first;
	this.cache[key] = item;

	if ( this.first !== null ) {
		this.cache[this.first].next = key;
	}

	this.first = key;

	if ( this.last === null ) {
		this.last = key;
	}

	if ( ++this.length > this.max ) {
		this.evict();
	}

	return this;
};

/**
 * Creates a new LRUItem
 *
 * @constructor
 * @memberOf keigai
 * @param {Mixed} value Item value
 */
function LRUItem ( value ) {
	this.next     = null;
	this.previous = null;
	this.value    = value;
}

/**
 * Setting constructor loop
 *
 * @method constructor
 * @memberOf keigai.LRUItem
 * @type {Function}
 */
LRUItem.prototype.constructor = LRUItem;

/**
 * @namespace number
 * @private
 */
var number = {
	/**
	 * Returns the difference of arg
	 *
	 * @method diff
	 * @memberOf number
	 * @param {Number} arg Number to compare
	 * @return {Number}    The absolute difference
	 */
	diff : function ( num1, num2 ) {
		if ( isNaN( num1 ) || isNaN( num2 ) ) {
			throw new Error( label.expectedNumber );
		}

		return Math.abs( num1 - num2 );
	},

	/**
	 * Parses the number
	 *
	 * @method parse
	 * @memberOf number
	 * @param  {Mixed}  arg  Number to parse
	 * @param  {Number} base Integer representing the base or radix
	 * @return {Number}      Integer or float
	 */
	parse : function ( arg, base ) {
		return ( base === undefined ) ? parseFloat( arg ) : parseInt( arg, base );
	}
};

/**
 * Creates a new Observable
 *
 * @constructor
 * @memberOf keigai
 * @param  {Number} arg Maximum listeners, default is 10
 */
function Observable ( arg ) {
	this.limit     = arg || MAX;
	this.listeners = {};
	this.hooks     = {};
}

/**
 * Setting constructor loop
 *
 * @method constructor
 * @memberOf keigai.Observable
 * @type {Function}
 */
Observable.prototype.constructor = Observable;

/**
 * Dispatches an event, with optional arguments
 *
 * @method dispatch
 * @memberOf keigai.Observable
 * @return {Object} {@link keigai.Observable}
 */
Observable.prototype.dispatch = function () {
	var args = array.cast( arguments ),
	    ev   = args.shift();

	if ( ev && this.listeners[ev] ) {
		utility.iterate( this.listeners[ev], function ( i ) {
			i.handler.apply( i.scope, args );
		} );
	}

	return this;
};

/**
 * Hooks into `target` for a DOM event
 *
 * @method hook
 * @memberOf keigai.Observable
 * @param  {Object} target Element
 * @param  {String} ev     Event
 * @return {Object}        Element
 */
Observable.prototype.hook = function ( target, ev ) {
	var self = this;

	if ( typeof target.addEventListener != "function" ) {
		throw new Error( label.invalidArguments );
	}

	utility.genId( target, true );

	this.hooks[target.id] = function ( arg ) {
		self.dispatch( ev, arg );
	};

	target.addEventListener( ev, this.hooks[target.id], false );

	return target;
};

/**
 * Removes all, or a specific listener for an event
 *
 * @method off
 * @memberOf keigai.Observable
 * @param {String} ev Event name
 * @param {String} id [Optional] Listener ID
 * @return {Object} {@link keigai.Observable}
 */
Observable.prototype.off = function ( ev, id ) {
	if ( this.listeners[ev] ) {
		if ( id ) {
			delete this.listeners[ev][id];
		}
		else {
			delete this.listeners[ev];
		}
	}

	return this;
};

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
 */
Observable.prototype.on = function ( ev, handler, id, scope ) {
	id    = id    || utility.uuid();
	scope = scope || this;

	if ( !this.listeners[ev] ) {
		this.listeners[ev] = {};
	}

	if ( array.keys( this.listeners[ev] ).length >= this.limit ) {
		throw( new Error( "Possible memory leak, more than " + this.limit + " listeners for event: " + ev ) );
	}

	this.listeners[ev][id] = {scope: scope, handler: handler};

	return this;
};

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
 */
Observable.prototype.once = function ( ev, handler, id, scope  ) {
	var self = this;

	id    = id    || utility.uuid();
	scope = scope || this;

	return this.on( ev, function () {
		handler.apply( scope, [].concat( array.cast( arguments ) ) );
		self.off( ev, id );
	}, id, scope );
};

/**
 * Unhooks from `target` for a DOM event
 *
 * @method unhook
 * @memberOf keigai.Observable
 * @param  {Object} target Element
 * @param  {String} ev     Event
 * @return {Object}        Element
 */
Observable.prototype.unhook = function ( target, ev ) {
	target.removeEventListener( ev, this.hooks[target.id], false );

	return target;
};

/**
 * @namespace promise
 * @private
 */
var promise = {
	/**
	 * Async delay strategy
	 *
	 * @method delay
	 * @memberOf promise
	 * @return {Function} Delay method
	 */
	delay : function () {
		if ( typeof setImmediate != "undefined" ) {
			return setImmediate;
		}
		else if ( typeof process != "undefined" ) {
			return process.nextTick;
		}
		else {
			return function ( arg ) {
				setTimeout( arg, 0 );
			};
		}
	}(),

	/**
	 * Promise factory
	 *
	 * @method factory
	 * @memberOf promise
	 * @return {Object} {@link Promise}
	 */
	factory : function () {
		return new Promise();
	},

	/**
	 * Pipes a reconciliation from `parent` to `child`
	 *
	 * @method pipe
	 * @memberOf promise
	 * @param  {Object} parent Promise
	 * @param  {Object} child  Promise
	 * @return {Undefined}     undefined
	 */
	pipe : function ( parent, child ) {
		parent.then( function ( arg ) {
			child.resolve( arg );
		}, function ( e ) {
			child.reject( e );
		} );
	},

	/**
	 * Initiates processing a Promise
	 *
	 * @memberOf process
	 * @memberOf promise
	 * @param  {Object} obj   Promise instance
	 * @param  {Mixed}  arg   Promise value
	 * @param  {Number} state State, e.g. "1"
	 * @return {Object}       Promise instance
	 */
	process : function ( obj, arg, state ) {
		if ( obj.state > promise.state.PENDING ) {
			return;
		}

		obj.value = arg;
		obj.state = state;

		if ( !obj.deferred ) {
			promise.delay( function () {
				obj.process();
			} );

			obj.deferred = true;
		}

		return obj;
	},

	/**
	 * States of a Promise
	 *
	 * @memberOf promise
	 * @type {Object}
	 */
	state : {
		PENDING : 0,
		FAILURE : 1,
		SUCCESS : 2
	}
};

/**
 * Creates a new Promise
 *
 * @constructor
 * @memberOf keigai
 */
function Promise () {
	this.deferred = false;
	this.handlers = [];
	this.state    = promise.state.PENDING;
	this.value    = null;
}

/**
 * Setting constructor loop
 *
 * @method constructor
 * @memberOf keigai.Promise
 * @private
 * @type {Function}
 */
Promise.prototype.constructor = Promise;

/**
 * Processes `handlers` queue
 *
 * @method process
 * @memberOf keigai.Promise
 * @return {Object} {@link Promise}
 */
Promise.prototype.process = function() {
	var result, success, value;

	this.deferred = false;

	if ( this.state === promise.state.PENDING ) {
		return;
	}

	value   = this.value;
	success = this.state === promise.state.SUCCESS;

	array.each( this.handlers.slice(), function ( i ) {
		var callback = i[success ? "success" : "failure" ],
		    child    = i.promise;

		if ( !callback || typeof callback != "function" ) {
			if ( value && typeof value.then == "function" ) {
				promise.pipe( value, child );
			}
			else {
				if ( success ) {
					child.resolve( value );
				} else {
					child.reject( value );
				}
			}

			return;
		}

		try {
			result = callback( value );
		}
		catch ( e ) {
			child.reject( e );

			return;
		}

		if ( result && typeof result.then == "function" ) {
			promise.pipe( result, promise );
		}
		else {
			child.resolve( result );
		}
	} );

	return this;
};

/**
 * Breaks a Promise
 *
 * @method reject
 * @memberOf keigai.Promise
 * @param  {Mixed} arg Promise value
 * @return {Object} {@link Promise}
 */
Promise.prototype.reject = function ( arg ) {
	return promise.process( this, arg, promise.state.FAILURE );
};

/**
 * Resolves a Promise
 *
 * @method resolve
 * @memberOf keigai.Promise
 * @param  {Mixed} arg Promise value
 * @return {Object} {@link Promise}
 */
Promise.prototype.resolve = function ( arg ) {
	return promise.process( this, arg, promise.state.SUCCESS );
};

/**
 * Registers handler(s) for a Promise
 *
 * @method then
 * @memberOf keigai.Promise
 * @param  {Function} success [Optional] Success handler for eventual value
 * @param  {Function} failure [Optional] Failure handler for eventual value
 * @return {Object} {@link Promise}
 */
Promise.prototype.then = function ( success, failure ) {
	var self  = this,
	    child = new Promise();

	this.handlers.push( {
		success : success,
		failure : failure,
		promise : child
	} );

	if ( this.state > promise.state.PENDING && !this.deferred ) {
		promise.delay( function () {
			self.process();
		} );

		this.deferred = true;
	}

	return child;
};

/**
 * @namespace store
 * @private
 */
var store = {
	/**
	 * Decorates a DataStore on an Object
	 *
	 * @method factory
	 * @memberOf store
	 * @param  {Mixed}  recs [Optional] Data to set with this.batch
	 * @param  {Object} args [Optional] Arguments to set on the store
	 * @return {Object} {@link keigai.DataStore}
	 */
	factory : function ( recs, args ) {
		var obj = new DataStore();

		if ( args instanceof Object ) {
			utility.merge( obj, args );
		}

		if ( recs !== null && typeof recs == "object" ) {
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
	 */
	worker : function ( ev ) {
		var cmd = ev.data.cmd,
		    clauses, cond, result, where, functions;

		if ( cmd === "select" ) {
			where     = JSON.parse( ev.data.where );
			functions = ev.data.functions;
			clauses   = array.fromObject( where );
			cond      = "return ( ";

			if ( clauses.length > 1 ) {
				array.each( clauses, function ( i, idx ) {
					var b1 = "( ";

					if ( idx > 0 ) {
						b1 = " && ( ";
					}

					if ( array.contains( functions, i[0] ) ) {
						cond += b1 + i[1] + "( rec.data[\"" + i[0] + "\"] ) )";
					}
					else if ( !isNaN( i[1] ) ) {
						cond += b1 + "rec.data[\"" + i[0] + "\"] === " + i[1] + " )";
					}
					else {
						cond += b1 + "rec.data[\"" + i[0] + "\"] === \"" + i[1] + "\" )";
					}
				} );
			}
			else {
				if ( array.contains( functions, clauses[0][0] ) ) {
					cond += clauses[0][1] + "( rec.data[\"" + clauses[0][0] + "\"] )";
				}
				else if ( !isNaN( clauses[0][1] ) ) {
					cond += "rec.data[\"" + clauses[0][0] + "\"] === " + clauses[0][1];
				}
				else {
					cond += "rec.data[\"" + clauses[0][0] + "\"] === \"" + clauses[0][1] + "\"";
				}
			}

			cond += " );";

			result = ev.data.records.filter( new Function( "rec", cond ) );
		}
		else if ( cmd === "sort" ) {
			result = array.keySort( ev.data.records, ev.data.query, "data" );
		}

		postMessage( result );
	}
};

/**
 * Creates a new DataStore
 *
 * @constructor
 * @memberOf keigai
 */
function DataStore () {
	this.autosave    = false;
	this.callback    = null;
	this.collections = [];
	this.credentials = null;
	this.lists       = [];
	this.depth       = 0;
	this.events      = true;
	this.expires     = null;
	this.headers     = {Accept: "application/json"};
	this.ignore      = [];
	this.key         = null;
	this.keys        = {};
	this.leafs       = [];
	this.loaded      = false;
	this.maxDepth    = 0;
	this.mongodb     = "";
	this.observer    = new Observable();
	this.pointer     = null;
	this.records     = [];
	this.retrieve    = false;
	this.source      = null;
	this.total       = 0;
	this.versions    = {};
	this.versioning  = true;
	this.views       = {};
	this.uri         = null;
}

/**
 * Setting constructor loop
 *
 * @method constructor
 * @memberOf keigai.DataStore
 * @type {Function}
 */
DataStore.prototype.constructor = DataStore;

/**
 * Adds an event listener
 *
 * @method addListener
 * @memberOf keigai.DataStore
 * @param  {String}   ev       Event name
 * @param  {Function} listener Function to execute
 * @param  {String}   id       [Optional] Listener ID
 * @param  {String}   scope    [Optional] Listener scope, default is `this`
 * @return {Object} {@link keigai.DataStore}
 */
DataStore.prototype.addListener = function ( ev, listener, id, scope ) {
	this.observer.on( ev, listener, id, scope || this );

	return this;
};

/**
 * Batch sets or deletes data in the store
 *
 * Events: beforeBatch  Fires before the batch is queued
 *         afterBatch   Fires after the batch is queued
 *         failedBatch  Fires when an exception occurs
 *
 * @method batch
 * @memberOf keigai.DataStore
 * @param  {String}  type Type of action to perform ( set/del/delete )
 * @param  {Array}   data Array of keys or indices to delete, or Object containing multiple records to set
 * @param  {Boolean} sync [Optional] Syncs store with data, if true everything is erased
 * @return {Object} {@link keigai.Deferred}
 */
DataStore.prototype.batch = function ( type, data, sync ) {
	if ( !regex.set_del.test( type ) || ( sync && regex.del.test( type ) ) || typeof data != "object" ) {
		throw new Error( label.invalidArguments );
	}

	sync          = ( sync === true );
	var self      = this,
	    events    = this.events,
	    defer     = deferred.factory(),
	    deferreds = [];

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
	}
	else {
		if ( type === "del" ) {
			array.each( data, function ( i ) {
				deferreds.push( self.del( i, false, true ) );
			} );
		}
		else {
			array.each( data, function ( i ) {
				deferreds.push( self.set( null, i, true ) );
			} );
		}

		utility.when( deferreds ).then( function () {
			self.loaded = true;

			if ( events ) {
				self.dispatch( "afterBatch", self.records );
			}

			array.each( self.lists, function ( i ) {
				i.refresh( true, true );
			} );

			if ( type === "del" ) {
				self.reindex();
			}

			if ( self.autosave ) {
				self.save();
			}

			defer.resolve( self.records );
		}, function ( e ) {
			if ( events ) {
				self.dispatch( "failedBatch", e );
			}

			defer.reject( e );
		} );
	}

	return defer;
};

/**
 * Builds a URI
 *
 * @method buildUri
 * @memberOf keigai.DataStore
 * @param  {String} key Record key
 * @return {String}     URI
 */
DataStore.prototype.buildUri = function ( key ) {
	var parsed = utility.parse( this.uri );

	return parsed.protocol + "//" + parsed.host + parsed.pathname + ( regex.endslash.test( parsed.pathname ) ? "" : "/" ) + key;
};

/**
 * Clears the data object, unsets the uri property
 *
 * Events: beforeClear Fires before the data is cleared
 *         afterClear  Fires after the data is cleared
 *
 * @method clear
 * @memberOf keigai.DataStore
 * @param  {Boolean} sync [Optional] Boolean to limit clearing of properties
 * @return {Object} {@link keigai.DataStore}
 */
DataStore.prototype.clear = function ( sync ) {
	sync       = ( sync === true );
	var events = ( this.events === true );

	if ( !sync ) {
		if ( events ) {
			this.dispatch( "beforeClear" );
		}

		array.each( this.lists, function ( i ) {
			i.teardown( true );
		} );

		this.autosave    = false;
		this.callback    = null;
		this.collections = [];
		this.credentials = null;
		this.lists       = [];
		this.depth       = 0;
		this.events      = true;
		this.expires     = null;
		this.headers     = {Accept: "application/json"};
		this.ignore      = [];
		this.key         = null;
		this.keys        = {};
		this.leafs       = [];
		this.loaded      = false;
		this.maxDepth    = 0;
		this.pointer     = null;
		this.records     = [];
		this.retrieve    = false;
		this.source      = null;
		this.total       = 0;
		this.versions    = {};
		this.versioning  = true;
		this.views       = {};
		this.uri         = null;

		if ( events ) {
			this.dispatch( "afterClear" );
		}
	}
	else {
		this.collections = [];
		this.keys        = {};
		this.loaded      = false;
		this.records     = [];
		this.total       = 0;
		this.views       = {};

		array.each( this.lists, function ( i ) {
			i.refresh( true, true );
		} );
	}

	return this;
};

/**
 * Crawls a record's properties and creates DataStores when URIs are detected
 *
 * Events: beforeRetrieve Fires before crawling a record
 *         afterRetrieve  Fires after the store has retrieved all data from crawling
 *         failedRetrieve Fires if an exception occurs
 *
 * @method crawl
 * @memberOf keigai.DataStore
 * @param  {Mixed}  arg Record, key or index
 * @return {Object} {@link keigai.Deferred}
 */
DataStore.prototype.crawl = function ( arg ) {
	var self      = this,
	    events    = ( this.events === true ),
	    record    = ( arg instanceof Object ) ? arg : this.get( arg ),
	    defer     = deferred.factory(),
	    deferreds = [],
	    parsed    = utility.parse( this.uri || "" );

	if ( this.uri === null || record === undefined ) {
		throw new Error( label.invalidArguments );
	}

	if ( events ) {
		this.dispatch( "beforeRetrieve", record );
	}

	// Depth of recursion is controled by `maxDepth`
	utility.iterate( record.data, function ( v, k ) {
		var uri;

		if ( array.contains( self.ignore, k ) || array.contains( self.leafs, k ) || self.depth >= self.maxDepth || ( !( v instanceof Array ) && typeof v != "string" ) || ( v.indexOf( "//" ) === -1 && v.charAt( 0 ) !== "/" ) ) {
			return;
		}

		array.add( self.collections, k );

		record.data[k] = store.decorator( {id: record.key + "-" + k}, null, {key: self.key, pointer: self.pointer, source: self.source, ignore: self.ignore.slice(), leafs: self.leafs.slice(), depth: self.depth + 1, maxDepth: self.maxDepth, headers: self.headers, retrieve: true} );

		if ( !array.contains( self.leafs, k ) && ( record.data[k].data.maxDepth === 0 || record.data[k].data.depth <= record.data[k].data.maxDepth ) ) {
			if ( v instanceof Array ) {
				deferreds.push( record.data[k].data.batch( "set", v ) );
			}
			else {
				if ( v.indexOf( "//" ) === -1 ) {
					// Relative path to store, i.e. a child
					if ( v.charAt( 0 ) !== "/" ) {
						uri = self.buildUri( v );
					}
					// Root path, relative to store, i.e. a domain
					else {
						uri = parsed.protocol + "//" + parsed.host + v;
					}
				}
				else {
					uri = v;
				}

				deferreds.push( record.data[k].data.setUri( uri ) );
			}
		}
	} );

	if ( deferreds.length > 0 ) {
		utility.when( deferreds ).then( function () {
			if ( events ) {
				self.dispatch( "afterRetrieve", record );
			}

			defer.resolve( record );
		}, function ( e ) {
			if ( events ) {
				self.dispatch( "failedRetrieve", record );
			}

			defer.reject( e );
		} );
	}
	else {
		if ( events ) {
			self.dispatch( "afterRetrieve", record );
		}

		defer.resolve( record );
	}

	return defer;
};

/**
 * Deletes a record based on key or index
 *
 * Events: beforeDelete  Fires before the record is deleted
 *         afterDelete   Fires after the record is deleted
 *         failedDelete  Fires if the store is RESTful and the action is denied
 *
 * @method del
 * @memberOf keigai.DataStore
 * @param  {Mixed}   record  Record, key or index
 * @param  {Boolean} reindex [Optional] `true` if DataStore should be reindexed
 * @param  {Boolean} batch   [Optional] `true` if part of a batch operation
 * @return {Object} {@link keigai.Deferred}
 */
DataStore.prototype.del = function ( record, reindex, batch ) {
	record    = record.key ? record : this.get ( record );
	reindex   = ( reindex !== false );
	batch     = ( batch === true );
	var self  = this,
	    defer = deferred.factory();

	if ( record === undefined ) {
		defer.reject( new Error( label.invalidArguments ) );
	}
	else {
		if ( this.events ) {
			self.dispatch( "beforeDelete", record );
		}

		if ( this.uri === null || this.callback !== null ) {
			this.delComplete( record, reindex, batch, defer );
		}
		else {
			client.request( this.buildUri( record.key ), "DELETE", function () {
				self.delComplete( record, reindex, batch, defer );
			}, function ( e ) {
				self.dispatch( "failedDelete", e );
				defer.reject( e );
			}, undefined, utility.merge( {withCredentials: this.credentials}, this.headers ) );
		}
	}

	return defer;
};

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
 */
DataStore.prototype.delComplete = function ( record, reindex, batch, defer ) {
	delete this.keys[record.key];
	delete this.versions[record.key];

	this.records.remove( record.index );

	this.total--;
	this.views = {};

	array.each( this.collections, function ( i ) {
		record.data[i].teardown();
	} );

	if ( !batch ) {
		if ( reindex ) {
			this.reindex();
		}

		if ( this.autosave ) {
			this.purge( record.key );
		}

		if ( this.events ) {
			this.dispatch( "afterDelete", record );
		}

		array.each( this.lists, function ( i ) {
			i.refresh( true, true );
		} );
	}

	defer.resolve( record.key );

	return this;
};

/**
 * Dispatches an event, with optional arguments
 *
 * @method emit
 * @memberOf keigai.DataStore
 * @return {Object} {@link keigai.DataStore}
 */
DataStore.prototype.dispatch = function () {
	this.observer.dispatch.apply( this.observer, [].concat( array.cast( arguments ) ) );

	return this;
};

/**
 * Exports a subset or complete record set of DataStore
 *
 * @method dump
 * @memberOf keigai.DataStore
 * @param  {Array} args   [Optional] Sub-data set of DataStore
 * @param  {Array} fields [Optional] Fields to export, defaults to all
 * @return {Array}        Records
 */
DataStore.prototype.dump = function ( args, fields ) {
	args       = args || this.records;
	var self   = this,
	    custom = ( fields instanceof Array && fields.length > 0 ),
	    key    = this.key !== null,
	    fn;

	if ( custom ) {
		fn = function ( i ) {
			var record = {};

			array.each( fields, function ( f ) {
				record[f] = f === self.key ? i.key : ( !array.contains( self.collections, f ) ? utility.clone( i.data[f], true ) : i.data[f].data.uri );
			} );

			return record;
		};
	}
	else {
		fn = function ( i ) {
			var record = {};

			if ( key ) {
				record[self.key] = i.key;
			}

			utility.iterate( i.data, function ( v, k ) {
				record[k] = !array.contains( self.collections, k ) ? utility.clone( v, true ) : v.data.uri;
			} );

			return record;
		};
	}

	return args.map( fn );
};

/**
 * Dispatches an event, with optional arguments
 *
 * @method emit
 * @memberOf keigai.DataStore
 * @return {Object} {@link keigai.DataStore}
 */
DataStore.prototype.emit = function () {
	this.observer.dispatch.apply( this.observer, [].concat( array.cast( arguments ) ) );

	return this;
};

/**
 * Retrieves a record based on key or index
 *
 * If the key is an integer, cast to a string before sending as an argument!
 *
 * @method get
 * @memberOf keigai.DataStore
 * @param  {Mixed}  record Key, index or Array of pagination start & end; or comma delimited String of keys or indices
 * @param  {Number} offset [Optional] Offset from `record` for pagination
 * @return {Mixed}         Individual record, or Array of records
 */
DataStore.prototype.get = function ( record, offset ) {
	var records = this.records,
	    type    = typeof record,
	    self    = this,
	    r;

	if ( type === "undefined" ) {
		r = records;
	}
	else if ( type === "string" ) {
		if ( record.indexOf( "," ) === -1 ) {
			r = records[self.keys[record]];
		}
		else {
			r = string.explode( record ).map( function ( i ) {
				if ( !isNaN( i ) ) {
					return records[parseInt( i, 10 )];
				}
				else {
					return records[self.keys[i]];
				}
			} );
		}
	}
	else if ( type === "number" ) {
		if ( isNaN( offset ) ) {
			r = records[parseInt( record, 10 )];
		}
		else {
			r = array.limit( records, parseInt( record, 10 ), parseInt( offset, 10 ) );
		}
	}

	return r;
},

/**
 * Performs an (INNER/LEFT/RIGHT) JOIN on two DataStores
 *
 * @method join
 * @memberOf keigai.DataStore
 * @param  {String} arg   DataStore to join
 * @param  {String} field Field in both DataStores
 * @param  {String} join  Type of JOIN to perform, defaults to `inner`
 * @return {Object} {@link keigai.Deferred}
 */
DataStore.prototype.join = function ( arg, field, join ) {
	join          = join || "inner";
	var self      = this,
	    defer     = deferred.factory(),
	    results   = [],
	    deferreds = [],
	    key       = field === this.key,
	    keys      = array.merge( array.cast( this.records[0].data, true ), array.cast( arg.records[0].data, true ) ),
		fn;

	if ( join === "inner" ) {
		fn = function ( i ) {
			var where  = {},
			    record = utility.clone( i.data, true ),
			    defer  = deferred.factory();

			where[field] = key ? i.key : record[field];
			
			arg.select( where ).then( function ( match ) {
				if ( match.length > 2 ) {
					defer.reject( new Error( label.databaseMoreThanOne ) );
				}
				else if ( match.length === 1 ) {
					results.push( utility.merge( record, match[0].data ) );
					defer.resolve( true );
				}
				else {
					defer.resolve( false );
				}
			} );

			deferreds.push( defer );
		};
	}
	else if ( join === "left" ) {
		fn = function ( i ) {
			var where  = {},
			    record = utility.clone( i.data, true ),
			    defer  = deferred.factory();

			where[field] = key ? i.key : record[field];

			arg.select( where ).then( function ( match ) {
				if ( match.length > 2 ) {
					defer.reject( new Error( label.databaseMoreThanOne ) );
				}
				else if ( match.length === 1 ) {
					results.push( utility.merge( record, match[0].data ) );
					defer.resolve( true );
				}
				else {
					array.each( keys, function ( i ) {
						if ( record[i] === undefined ) {
							record[i] = null;
						}
					} );

					results.push( record );
					defer.resolve( true );
				}
			} );

			deferreds.push( defer );
		};
	}
	else if ( join === "right" ) {
		fn = function ( i ) {
			var where  = {},
			    record = utility.clone( i.data, true ),
			    defer  = deferred.factory();

			where[field] = key ? i.key : record[field];
			
			self.select( where ).then( function ( match ) {
				if ( match.length > 2 ) {
					defer.reject( new Error( label.databaseMoreThanOne ) );
				}
				else if ( match.length === 1 ) {
					results.push( utility.merge( record, match[0].data ) );
					defer.resolve( true );
				}
				else {
					array.each( keys, function ( i ) {
						if ( record[i] === undefined ) {
							record[i] = null;
						}
					} );

					results.push( record );
					defer.resolve( true );
				}
			} );

			deferreds.push( defer );
		};
	}

	array.each( join === "right" ? arg.records : this.records, fn );

	utility.when( deferreds ).then( function () {
		defer.resolve( results );
	}, function ( e ) {
		defer.reject( e );
	} );
	
	return defer;
};

/**
 * Gets listeners
 *
 * @method listeners
 * @memberOf keigai.DataStore
 * @param  {String} ev [Optional] Event name
 * @return {Object} Listeners
 */
DataStore.prototype.listeners = function ( ev ) {
	return ev ? this.observer.listeners[ev] : this.listeners;
};

/**
 * Removes an event listener
 *
 * @method off
 * @memberOf keigai.DataStore
 * @param  {String} ev Event name
 * @param  {String} id [Optional] Listener ID
 * @return {Object} {@link keigai.DataStore}
 */
DataStore.prototype.off = function ( ev, id ) {
	this.observer.off( ev, id );

	return this;
};

/**
 * Adds an event listener
 *
 * @method on
 * @memberOf keigai.DataStore
 * @param  {String}   ev       Event name
 * @param  {Function} listener Function to execute
 * @param  {String}   id       [Optional] Listener ID
 * @param  {String}   scope    [Optional] Listener scope, default is `this`
 * @return {Object} {@link keigai.DataStore}
 */
DataStore.prototype.on = function ( ev, listener, id, scope ) {
	this.observer.on( ev, listener, id, scope || this );

	return this;
};

/**
 * Adds a short lived event listener
 *
 * @method once
 * @memberOf keigai.DataStore
 * @param  {String}   ev       Event name
 * @param  {Function} listener Function to execute
 * @param  {String}   id       [Optional] Listener ID
 * @param  {String}   scope    [Optional] Listener scope, default is `this`
 * @return {Object} {@link keigai.DataStore}
 */
DataStore.prototype.once = function ( ev, listener, id, scope ) {
	this.observer.once( ev, listener, id, scope || this );

	return this;
};

/**
 * Retrieves only 1 field/property
 *
 * @method only
 * @memberOf keigai.DataStore
 * @param  {String} arg Field/property to retrieve
 * @return {Array}      Array of values
 */
DataStore.prototype.only = function ( arg ) {
	if ( arg === this.key ) {
		return this.records.map( function ( i ) {
			return i.key;
		} );
	}
	else {
		return this.records.map( function ( i ) {
			return i.data[arg];
		} );
	}
};

/**
 * Purges DataStore or record from localStorage
 *
 * @method purge
 * @memberOf keigai.DataStore
 * @param  {Mixed} arg  [Optional] String or Number for record
 * @return {Object}     Record or store
 */
DataStore.prototype.purge = function ( arg ) {
	return this.storage( arg || this, "remove" );
};

/**
 * Reindexes the DataStore
 *
 * @method reindex
 * @memberOf keigai.DataStore
 * @return {Object} {@link keigai.DataStore}
 */
DataStore.prototype.reindex = function () {
	var nth = this.total,
	    i   = -1;

	this.views = {};

	if ( nth > 0 ) {
		while ( ++i < nth ) {
			this.records[i].index = i;
			this.keys[this.records[i].key] = i;
		}
	}

	return this;
};

/**
 * Removes an event listener
 *
 * @method removeListener
 * @memberOf keigai.DataStore
 * @param  {String} ev Event name
 * @param  {String} id [Optional] Listener ID
 * @return {Object} {@link keigai.DataStore}
 */
DataStore.prototype.removeListener = function ( ev, id ) {
	this.observer.off( ev, id );

	return this;
};

/**
 * Restores DataStore or record frome localStorage
 *
 * @method restore
 * @memberOf keigai.DataStore
 * @param  {Mixed} arg  [Optional] String or Number for record
 * @return {Object}     Record or store
 */
DataStore.prototype.restore = function ( arg ) {
	return this.storage( arg || this, "get" );
};

/**
 * Saves DataStore or record to localStorage, sessionStorage or MongoDB (node.js only)
 *
 * @method save
 * @memberOf keigai.DataStore
 * @param  {Mixed} arg  [Optional] String or Number for record
 * @return {Object} {@link keigai.Deferred}
 */
DataStore.prototype.save = function ( arg ) {
	return this.storage( arg || this, "set" );
};

/**
 * Selects records based on an explcit description
 *
 * Note: Records are not by reference!
 *
 * @method select
 * @memberOf keigai.DataStore
 * @param  {Object} where Object describing the WHERE clause
 * @return {Object} {@link keigai.Deferred}
 */
DataStore.prototype.select = function ( where ) {
	var defer = deferred.factory(),
	    blob, clauses, cond, functions, worker;

	if ( !( where instanceof Object ) ) {
		throw new Error( label.invalidArguments );
	}

	if ( webWorker ) {
		functions = [];

		utility.iterate( where, function ( v, k ) {
			if ( typeof v == "function" ) {
				this[k] = v.toString();
				functions.push( k );
			}
		} );

		blob   = new Blob( [WORKER] );
		worker = new Worker( global.URL.createObjectURL( blob ) );

		worker.onmessage = function ( ev ) {
			defer.resolve( ev.data );
		};

		worker.postMessage( {cmd: "select", records: this.records, where: json.encode( where ), functions: functions} );
	}
	else {
		clauses = array.fromObject( where );
		cond    = "return ( ";

		if ( clauses.length > 1 ) {
			array.each( clauses, function ( i, idx ) {
				var b1 = "( ";

				if ( idx > 0 ) {
					b1 = " && ( ";
				}

				if ( i[1] instanceof Function ) {
					cond += b1 + i[1].toString() + "( rec.data[\"" + i[0] + "\"] ) )";
				}
				else if ( !isNaN( i[1] ) ) {
					cond += b1 + "rec.data[\"" + i[0] + "\"] === " + i[1] + " )";
				}
				else {
					cond += b1 + "rec.data[\"" + i[0] + "\"] === \"" + i[1] + "\" )";
				}
			} );
		}
		else {
			if ( clauses[0][1] instanceof Function ) {
				cond += clauses[0][1].toString() + "( rec.data[\"" + clauses[0][0] + "\"] )";
			}
			else if ( !isNaN( clauses[0][1] ) ) {
				cond += "rec.data[\"" + clauses[0][0] + "\"] === " + clauses[0][1];
			}
			else {
				cond += "rec.data[\"" + clauses[0][0] + "\"] === \"" + clauses[0][1] + "\"";
			}
		}

		cond += " );";

		defer.resolve( this.records.slice().filter( new Function( "rec", cond ) ) );
	}

	return defer;
};

/**
 * Creates or updates an existing record
 *
 * Events: beforeSet  Fires before the record is set
 *         afterSet   Fires after the record is set, the record is the argument for listeners
 *         failedSet  Fires if the store is RESTful and the action is denied
 *
 * @method set
 * @memberOf keigai.DataStore
 * @param  {Mixed}   key   [Optional] Integer or String to use as a Primary Key
 * @param  {Object}  data  Key:Value pairs to set as field values
 * @param  {Boolean} batch [Optional] True if called by data.batch
 * @return {Object} {@link keigai.Deferred}
 */
DataStore.prototype.set = function ( key, data, batch ) {
	data       = utility.clone( data, true );
	batch      = ( batch === true );
	var self   = this,
	    events = this.events,
	    defer  = deferred.factory(),
	    record = key !== null ? this.get( key ) || null : data[this.key] ? this.get( data[this.key] ) || null : null,
	    method = "POST",
	    parsed = utility.parse( self.uri || "" ),
	    uri;

	if ( typeof data == "string" ) {
		if ( data.indexOf( "//" ) === -1 ) {
			// Relative path to store, i.e. a child
			if ( data.charAt( 0 ) !== "/" ) {
				uri = this.buildUri( data );
			}
			// Root path, relative to store, i.e. a domain
			else if ( self.uri !== null && regex.root.test( data ) ) {
				uri = parsed.protocol + "//" + parsed.host + data;
			}
			else {
				uri = data;
			}
		}
		else {
			uri = data;
		}

		key = uri.replace( regex.not_endpoint, "" );

		if ( string.isEmpty( key ) ) {
			defer.reject( new Error( label.invalidArguments ) );
		}
		else {
			if ( !batch && events ) {
				self.dispatch( "beforeSet", {key: key, data: data} );
			}

			client.request( uri, "GET", function ( arg ) {
				self.setComplete( record, key, self.source ? arg[self.source] : arg, batch, defer );
			}, function ( e ) {
				self.dispatch( "failedSet", e );
				defer.reject( e );
			}, undefined, utility.merge( {withCredentials: self.credentials}, self.headers ) );
		}
	}
	else {
		if ( record === null && ( key === null || key === undefined ) ) {
			if ( this.key === null ) {
				key = utility.uuid();
			}
			else if ( data[this.key] ) {
				key = data[this.key];
			}
			else {
				key = utility.uuid();
			}
		}

		if ( !batch && events ) {
			self.dispatch( "beforeSet", {key: key, data: data} );
		}

		if ( batch || this.uri === null ) {
			this.setComplete( record, key, data, batch, defer );
		}
		else {
			if ( key !== null ) {
				method = "PUT";
				uri    = this.buildUri( key );

				if ( client.allows( uri, "patch" ) ) {
					method = "PATCH";
				}
				else if ( record !== null ) {
					utility.iterate( record.data, function ( v, k ) {
						if ( !array.contains( self.collections, k ) && !data[k] ) {
							data[k] = v;
						}
					} );
				}
			}
			else {
				uri = this.uri;
			}

			client.request( uri, method, function ( arg ) {
				self.setComplete( record, key, self.source ? arg[self.source] : arg, batch, defer );
			}, function ( e ) {
				self.dispatch( "failedSet", e );
				defer.reject( e );
			}, data, utility.merge( {withCredentials: this.credentials}, this.headers ) );
		}
	}

	return defer;
};

/**
 * Set completion
 *
 * @method setComplete
 * @memberOf keigai.DataStore
 * @param  {Mixed}   record DataStore record, or `null` if new
 * @param  {String}  key    Record key
 * @param  {Object}  data   Record data
 * @param  {Boolean} batch  `true` if part of a batch operation
 * @param  {Object}  defer  Deferred instance
 * @return {Object} {@link keigai.DataStore}
 */
DataStore.prototype.setComplete = function ( record, key, data, batch, defer ) {
	var self      = this,
	    deferreds = [];

	// Removing primary key from data
	if ( this.key ) {
		delete data[this.key];
	}

	// Create
	if ( record === null ) {
		record = {
			index : this.total++,
			key   : key,
			data  : data
		};

		this.keys[key]                = record.index;
		this.records[record.index]    = record;
		this.versions[record.key]     = new LRU( VERSIONS );
		this.versions[record.key].nth = 0;

		if ( this.retrieve ) {
			deferreds.push( this.crawl( record ) );
		}
	}
	// Update
	else {
		if ( this.versioning ) {
			this.versions[record.key].set( "v" + ( ++this.versions[record.key].nth ), this.dump( [record] )[0] );
		}

		utility.iterate( data, function ( v, k ) {
			if ( !array.contains( self.collections, k ) ) {
				record.data[k] = v;
			}
			else if ( typeof v == "string" ) {
				deferreds.push( record.data[k].data.setUri( record.data[k].data.uri + "/" + v, true ) );
			}
			else {
				deferreds.push( record.data[k].data.batch( "set", v, true ) );
			}
		} );
	}

	if ( !batch && this.events ) {
		self.dispatch( "afterSet", record );

		array.each( this.lists, function ( i ) {
			i.refresh( true, true );
		} );
	}

	if ( deferreds.length === 0 ) {
		defer.resolve( record );
	}
	else {
		utility.when( deferreds ).then( function () {
			defer.resolve( record );
		} );
	}

	return this;
};

/**
 * Gets or sets an explicit expiration of data
 *
 * @method setExpires
 * @memberOf keigai.DataStore
 * @param  {Number} arg  Milliseconds until data is stale
 * @return {Object} {@link keigai.DataStore}
 */
DataStore.prototype.setExpires = function ( arg ) {
	// Expiry cannot be less than a second, and must be a valid scenario for consumption; null will disable repetitive expiration
	if ( ( arg !== null && this.uri === null ) || ( arg !== null && ( isNaN( arg ) || arg < 1000 ) ) ) {
		throw new Error( label.invalidArguments );
	}

	if ( this.expires === arg ) {
		return;
	}

	this.expires = arg;

	var id      = this.id + "Expire",
	    expires = arg,
	    self    = this;

	utility.clearTimers( id );

	if ( arg === null ) {
		return;
	}

	utility.repeat( function () {
		if ( self.uri === null ) {
			self.setExpires( null );

			return false;
		}

		if ( !cache.expire( self.uri ) ) {
			self.dispatch( "beforeExpire");
			self.dispatch( "expire");
			self.dispatch( "afterExpire");
		}
	}, expires, id, false );
};

/**
 * Sets the RESTful API end point
 *
 * @method setUri
 * @memberOf keigai.DataStore
 * @param  {String} arg API collection end point
 * @return {Object}     Deferred
 */
DataStore.prototype.setUri = function ( arg ) {
	var defer = deferred.factory(),
	    parsed, uri;

	if ( arg !== null && string.isEmpty( arg ) ) {
		throw new Error( label.invalidArguments );
	}

	parsed = utility.parse( arg );
	uri    = parsed.href;

	// Re-encoding the query string for the request
	if ( array.keys( parsed.query ).length > 0 ) {
		uri = uri.replace( /\?.*/, "?" );

		utility.iterate( parsed.query, function ( v, k ) {
			if ( !( v instanceof Array ) ) {
				uri += "&" + k + "=" + encodeURIComponent( v );
			}
			else {
				array.each( v, function ( i ) {
					uri += "&" + k + "=" + encodeURIComponent( i );
				} );
			}
		} );

		uri = uri.replace( "?&", "?" );
	}

	this.uri = uri;

	if ( this.uri !== null ) {
		this.on( "expire", function () {
			this.sync();
		}, "resync", this );

		cache.expire( this.uri );

		this.sync().then( function (arg ) {
			defer.resolve( arg );
		}, function ( e ) {
			defer.reject( e );
		});
	}

	return defer;
};

/**
 * Returns a view, or creates a view and returns it
 *
 * Records in a view are not by reference, they are clones
 *
 * @method sort
 * @memberOf keigai.DataStore
 * @param  {String} query  SQL ( style ) order by
 * @param  {String} create [Optional, default behavior is true, value is false] Boolean determines whether to recreate a view if it exists
 * @param  {Object} where  [Optional] Object describing the WHERE clause
 * @return {Object} {@link keigai.Deferred}
 */
DataStore.prototype.sort = function ( query, create, where ) {
	create      = ( create === true || ( where instanceof Object ) );
	var self    = this,
	    view    = string.toCamelCase( string.explode( query ).join( " " ) ),
	    defer   = deferred.factory(),
	    blob, next, worker;

	// Next phase
	next = function ( records ) {
		if ( self.total === 0 ) {
			defer.resolve( [] );
		}
		else if ( !create && self.views[view] ) {
			defer.resolve( self.views[view] );
		}
		else if ( webWorker ) {
			blob   = new Blob( [WORKER] );
			worker = new Worker( global.URL.createObjectURL( blob ) );

			worker.onmessage = function ( ev ) {
				self.views[view] = ev.data;
				defer.resolve( self.views[view] );
			};

			worker.postMessage( {cmd: "sort", records: records, query: query} );
		}
		else {
			self.views[view] = array.keySort( records.slice(), query, "data" );
			defer.resolve( self.views[view] );
		}
	};

	if ( !where ) {
		next( this.records );
	}
	else {
		this.select( where ).then( next );
	}

	return defer;
};

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
 */
DataStore.prototype.storage = function ( obj, op, type ) {
	var self    = this,
	    record  = false,
	    mongo   = !string.isEmpty( this.mongodb ),
	    session = ( type === "session" && typeof sessionStorage != "undefined" ),
	    defer   = deferred.factory(),
	    data, deferreds, key, result;

	if ( !regex.number_string_object.test( typeof obj ) || !regex.get_remove_set.test( op ) ) {
		throw new Error( label.invalidArguments );
	}

	record = ( regex.number_string.test( typeof obj ) || ( obj.hasOwnProperty( "key" ) && !obj.hasOwnProperty( "parentNode" ) ) );

	if ( op !== "remove" ) {
		if ( record && !( obj instanceof Object ) ) {
			obj = this.get( obj );
		}

		key = record ? obj.key : obj.id;
	}
	else if ( op === "remove" && record ) {
		key = obj.key || obj;
	}

	if ( op === "get" ) {
		if ( mongo ) {
			mongodb.connect( this.mongodb, function( e, db ) {
				if ( e ) {
					if ( db ) {
						db.close();
					}

					defer.reject( e );
				}
				else {
					db.createCollection( self.id, function ( e, collection ) {
						if ( e ) {
							defer.reject( e );
							db.close();
						}
						else if ( record ) {
							collection.find( {_id: obj.key} ).limit( 1 ).toArray( function ( e, recs ) {
								if ( e ) {
									defer.reject( e );
								}
								else {
									delete recs[0]._id;

									self.set( key, recs[0], true ).then( function ( rec ) {
										defer.resolve( rec );
									}, function ( e ) {
										defer.reject( e );
									} );
								}

								db.close();
							} );
						}
						else {
							collection.find( {} ).toArray( function ( e, recs ) {
								var i   = -1,
								    nth = recs.length;
								
								if ( e ) {
									defer.reject( e );
								}
								else {
									if ( nth > 0 ) {
										self.records = recs.map( function ( r ) {
											var rec = {key: r._id, index: ++i, data: {}};

											self.keys[rec.key] = rec.index;
											rec.data = r;
											delete rec.data._id;

											return rec;
										} );
										
										self.total = nth;
									}
									
									defer.resolve( self.records );
								}

								db.close();
							} );
						}
					} );
				}
			} );
		}
		else {
			result = session ? sessionStorage.getItem( key ) : localStorage.getItem( key );

			if ( result !== null ) {
				result = json.decode( result );

				if ( record ) {
					self.set( key, result, true ).then( function ( rec ) {
						defer.resolve( rec );
					}, function ( e ) {
						defer.reject( e );
					} );
				}
				else {
					utility.merge( self, result );
					defer.resolve( self );
				}
			}
			else {
				defer.resolve( self );
			}
		}
	}
	else if ( op === "remove" ) {
		if ( mongo ) {
			mongodb.connect( this.mongodb, function( e, db ) {
				if ( e ) {
					if ( db ) {
						db.close();
					}

					defer.reject( e );
				}
				else {
					db.createCollection( self.id, function ( e, collection ) {
						if ( e ) {
							if ( db ) {
								db.close();
							}

							defer.reject( e );
						}
						else {
							collection.remove( record ? {_id: key} : {}, {safe: true}, function ( e, arg ) {
								if ( e ) {
									defer.reject( e );
								}
								else {
									defer.resolve( arg );
								}

								db.close();
							} );
						}
					} );
				}
			} );
		}
		else {
			session ? sessionStorage.removeItem( key ) : localStorage.removeItem( key );
			defer.resolve( this );
		}
	}
	else if ( op === "set" ) {
		if ( mongo ) {
			mongodb.connect( this.mongodb, function( e, db ) {
				if ( e ) {
					if ( db ) {
						db.close();
					}

					defer.reject( e );
				}
				else {
					db.createCollection( self.id, function ( e, collection ) {
						if ( e ) {
							defer.reject( e );
							db.close();
						}
						else if ( record ) {
							collection.update( {_id: obj.key}, {$set: obj.data}, {w: 1, safe: true, upsert: true}, function ( e, arg ) {
								if ( e ) {
									defer.reject( e );
								}
								else {
									defer.resolve( arg );
								}

								db.close();
							} );
						}
						else {
							// Removing all documents & re-inserting
							collection.remove( {}, {w: 1, safe: true}, function ( e ) {
								if ( e ) {
									defer.reject( e );
									db.close();
								}
								else {
									deferreds = [];

									array.each( self.records, function ( i ) {
										var data   = {},
										    defer2 = deferred.factory();

										deferreds.push( defer2 );

										utility.iterate( i.data, function ( v, k ) {
											if ( !array.contains( self.collections, k ) ) {
												data[k] = v;
											}
										} );

										collection.update( {_id: i.key}, {$set: data}, {w:1, safe:true, upsert:true}, function ( e, arg ) {
											if ( e ) {
												defer2.reject( e );
											}
											else {
												defer2.resolve( arg );
											}
										} );
									} );

									utility.when( deferreds ).then( function ( result ) {
										defer.resolve( result );
										db.close();
									}, function ( e ) {
										defer.reject( e );
										db.close();
									} );
								}
							} );
						}
					} );
				}
			} );
		}
		else {
			data = json.encode( record ? obj.data : {total: this.total, keys: this.keys, records: this.records} );
			session ? sessionStorage.setItem( key, data ) : localStorage.setItem( key, data );
			defer.resolve( this );
		}
	}

	return defer;
};

/**
 * Syncs the DataStore with a URI representation
 *
 * Events: beforeSync  Fires before syncing the DataStore
 *         afterSync   Fires after syncing the DataStore
 *         failedSync  Fires when an exception occurs
 *
 * @method sync
 * @memberOf keigai.DataStore
 * @return {Object} {@link keigai.Deferred}
 */
DataStore.prototype.sync = function () {
	if ( this.uri === null || string.isEmpty( this.uri ) ) {
		throw new Error( label.invalidArguments );
	}

	var self   = this,
	    events = ( this.events === true ),
	    defer  = deferred.factory(),
	    success, failure;

	/**
	 * Resolves public deferred
	 *
	 * @method success
	 * @memberOf keigai.DataStore.sync
	 * @private
	 * @param  {Object} arg API response
	 * @return {Undefined}  undefined
	 */
	success = function ( arg ) {
		var data;

		if ( typeof arg != "object" ) {
			throw new Error( label.expectedObject );
		}

		if ( self.source !== null ) {
			arg = utility.walk( arg, self.source );
		}

		if ( arg instanceof Array ) {
			data = arg;
		}
		else {
			data = [arg];
		}

		self.batch( "set", data, true ).then( function ( arg ) {
			if ( events ) {
				self.dispatch( "afterSync", arg );
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
	failure = function ( e ) {
		if ( events ) {
			self.dispatch( "failedSync", e );
		}

		defer.reject( e );
	};

	if ( events ) {
		this.dispatch( "beforeSync", this.uri );
	}

	if ( this.callback !== null ) {
		client.jsonp( this.uri, success, failure, {callback: this.callback} );
	}
	else {
		client.request( this.uri, "GET", success, failure, null, utility.merge( {withCredentials: this.credentials}, this.headers ) );
	}

	return defer;
};

/**
 * Tears down a store & expires all records associated to an API
 *
 * @method teardown
 * @memberOf keigai.DataStore
 * @return {Object} {@link keigai.DataStore}
 */
DataStore.prototype.teardown = function () {
	var uri = this.uri,
	    id;

	if ( uri !== null ) {
		cache.expire( uri, true );

		id = this.id + "DataExpire";
		utility.clearTimers( id );

		array.each( this.records, function ( i ) {
			var recordUri = uri + "/" + i.key;

			cache.expire( recordUri, true );

			utility.iterate( i.data, function ( v ) {
				if ( v === null ) {
					return;
				}

				if ( v.data && typeof v.data.teardown == "function" ) {
					v.data.teardown();
				}
			} );
		} );
	}

	array.each( this.lists, function ( i ) {
		i.teardown();
	} );

	this.clear( true );
	this.dispatch( "afterTeardown" );

	return this;
};

/**
 * Undoes the last modification to a record, if it exists
 *
 * @method undo
 * @memberOf keigai.DataStore
 * @param  {Mixed}  key     Key or index
 * @param  {String} version [Optional] Version to restore
 * @return {Object}         Deferred
 */
DataStore.prototype.undo = function ( key, version ) {
	var record   = this.get( key ),
	    defer    = deferred.factory(),
	    versions = this.versions[record.key],
	    previous;

	if ( record === undefined ) {
		throw new Error( label.invalidArguments );
	}

	if ( versions ) {
		previous = versions.get( version || versions.first );

		if ( previous === undefined ) {
			defer.reject( label.datastoreNoPrevVersion );
		}
		else {
			this.set( key, previous ).then( function ( arg ) {
				defer.resolve( arg );
			}, function ( e ) {
				defer.reject( e );
			} );
		}
	}
	else {
		defer.reject( label.datastoreNoPrevVersion );
	}

	return defer;
};

/**
 * Returns Array of unique values of `key`
 *
 * @method unique
 * @memberOf keigai.DataStore
 * @param  {String} key Field to compare
 * @return {Array}      Array of values
 */
DataStore.prototype.unique = function ( key ) {
	return array.unique( this.records.map( function ( i ) {
		return i.data[key];
	} ) );
};

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
 */
DataStore.prototype.update = function ( key, data ) {
	var record = this.get( key ),
	    defer  = deferred.factory();

	if ( record === undefined ) {
		throw new Error( label.invalidArguments );
	}

	utility.iterate( record.data, function ( v, k ) {
		data[v] = k;
	} );
	
	this.set( key, data ).then( function ( arg ) {
		defer.resolve( arg );
	}, function ( e ) {
		defer.reject( e );
	} );

	return defer;
};

/**
 * @namespace string
 * @private
 */
var string = {
	/**
	 * Capitalizes the String
	 *
	 * @method capitalize
	 * @memberOf string
	 * @param  {String}  obj String to capitalize
	 * @param  {Boolean} all [Optional] Capitalize each word
	 * @return {String}      Capitalized String
	 */
	capitalize : function ( obj, all ) {
		all = ( all === true );

		var result;

		if ( all ) {
			result = string.explode( obj, " " ).map( function ( i ) {
				return i.charAt( 0 ).toUpperCase() + i.slice( 1 );
			} ).join(" ");
		}
		else {
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
	 */
	escape : function ( obj ) {
		return obj.replace( /[\-\[\]{}()*+?.,\\\^\$|#\s]/g, "\\$&" );
	},

	/**
	 * Splits a string on comma, or a parameter, and trims each value in the resulting Array
	 *
	 * @method explode
	 * @memberOf string
	 * @param  {String} obj String to capitalize
	 * @param  {String} arg String to split on
	 * @return {Array}      Array of the exploded String
	 */
	explode : function ( obj, arg ) {
		arg = arg || ",";

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
	 */
	fromObject : function ( obj, name ) {
		var result = ( name ? name + " = {" : "{" ) + "\n";

		utility.iterate( obj, function ( v, k ) {
			result += "\"" + k + "\":" + v.toString() + ",\n";
		} );

		result = result.replace( /\[object Object\]/g, "{}" ).replace( /,\n$/, "\n" ) + "}";

		return result;
	},

	/**
	 * Tests if a string is a boolean
	 *
	 * @method isBoolean
	 * @memberOf string
	 * @param  {String}  obj String to test
	 * @return {Boolean}     Result of test
	 */
	isBoolean : function ( obj ) {
		return regex.bool.test( obj );
	},

	/**
	 * Tests if a string is empty
	 *
	 * @method isEmpty
	 * @memberOf string
	 * @param  {String}  obj String to test
	 * @return {Boolean}     Result of test
	 */
	isEmpty : function ( obj ) {
		return string.trim( obj ) === "";
	},

	/**
	 * Tests if a string is a number
	 *
	 * @method isNumber
	 * @memberOf string
	 * @param  {String}  obj String to test
	 * @return {Boolean}     Result of test
	 */
	isNumber : function ( obj ) {
		return regex.number.test( obj );
	},

	/**
	 * Tests if a string is a URL
	 *
	 * @method isUrl
	 * @memberOf string
	 * @param  {String}  obj String to test
	 * @return {Boolean}     Result of test
	 */
	isUrl : function ( obj ) {
		return regex.url.test( obj );
	},

	/**
	 * Transforms the case of a String into CamelCase
	 *
	 * @method toCamelCase
	 * @memberOf string
	 * @param  {String} obj String to capitalize
	 * @return {String}     Camel case String
	 */
	toCamelCase : function ( obj ) {
		var s = string.trim( obj ).replace( /\.|_|-|\@|\[|\]|\(|\)|\#|\$|\%|\^|\&|\*|\s+/g, " " ).toLowerCase().split( regex.space_hyphen ),
		    r = [];

		array.each( s, function ( i, idx ) {
			r.push( idx === 0 ? i : string.capitalize( i ) );
		});

		return r.join( "" );
	},

	/**
	 * Trims the whitespace around a String
	 *
	 * @method trim
	 * @memberOf string
	 * @param  {String} obj String to capitalize
	 * @return {String}     Trimmed String
	 */
	trim : function ( obj ) {
		return obj.replace( /^(\s+|\t+)|(\s+|\t+)$/g, "" );
	},

	/**
	 * Uncamelcases the String
	 *
	 * @method unCamelCase
	 * @memberOf string
	 * @param  {String} obj String to uncamelcase
	 * @return {String}     Uncamelcased String
	 */
	unCamelCase : function ( obj ) {
		return string.trim( obj.replace( /([A-Z])/g, " $1" ).toLowerCase() );
	},

	/**
	 * Replaces all hyphens with spaces
	 *
	 * @method unhyphenate
	 * @memberOf string
	 * @param  {String}  obj  String to unhypenate
	 * @param  {Boolean} caps [Optional] True to capitalize each word
	 * @return {String}       Unhyphenated String
	 */
	unhyphenate : function ( obj, caps ) {
		if ( caps !== true ) {
			return string.explode( obj, "-" ).join( " " );
		}
		else {
			return string.explode( obj, "-" ).map( function ( i ) {
				return string.capitalize( i );
			} ).join( " " );
		}
	}
};

/**
 * @namespace utility
 * @private
 */
var utility = {
	/**
	 * Collection of timers
	 *
	 * @memberOf utility
	 * @type {Object}
	 */
	timer : {},

	/**
	 * Collection of repeating functions
	 *
	 * @memberOf utility
	 * @type {Object}
	 */
	repeating: {},

	/**
	 * Queries the DOM using CSS selectors and returns an Element or Array of Elements
	 *
	 * @method $
	 * @memberOf utility
	 * @param  {Mixed} arg Element, HTML, or Comma delimited string of CSS selectors
	 * @return {Mixed}     Element or Array of Elements
	 */
	$ : function ( arg ) {
		var result;

		// Nothing
		if ( !arg ) {
		}
		// Element
		else if ( arg.nodeName ) {
			result = [arg];
		}
		// HTML
		else if ( regex.html.test( arg ) ) {
			result = [element.create( arg )];
		}
		// CSS selector(s)
		else {
			arg = string.trim( arg );

			if ( arg.indexOf( "," ) === -1 ) {
				result = utility.dom( arg );

				if ( result ) {
					if ( isNaN( result.length ) ) {
						result = [result];
					}
				}
				else {
					result = [];
				}
			}
			else {
				result = [];

				array.each( string.explode( arg ), function ( query ) {
					var obj = utility.dom( query );

					if ( obj instanceof Array ) {
						result = result.concat( obj );
					}
					else if ( obj ) {
						result.push( obj );
					}
				} );
			}
		}

		return result;
	},

	/**
	 * Clears deferred & repeating functions
	 *
	 * @method clearTimers
	 * @memberOf utility
	 * @param  {String} id ID of timer( s )
	 * @return {Undefined} undefined
	 */
	clearTimers : function ( id ) {
		if ( id === undefined || string.isEmpty( id ) ) {
			throw new Error( label.invalidArguments );
		}

		// deferred
		if ( utility.timer[id] ) {
			clearTimeout( utility.timer[id] );
			delete utility.timer[id];
		}

		// repeating
		if ( utility.repeating[id] ) {
			clearTimeout( utility.repeating[id] );
			delete utility.repeating[id];
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
	 */
	clone : function ( obj, shallow ) {
		var clone;

		if ( shallow === true ) {
			return json.decode( json.encode( obj ) );
		}
		else if ( !obj || regex.primitive.test( typeof obj ) || ( obj instanceof RegExp ) ) {
			return obj;
		}
		else if ( obj instanceof Array ) {
			return obj.slice();
		}
		else if ( !server && !client.ie && obj instanceof Document ) {
			return xml.decode( xml.encode( obj ) );
		}
		else if ( typeof obj.__proto__ != "undefined" ) {
			return utility.extend( obj.__proto__, obj );
		}
		else if ( obj instanceof Object ) {
			// If JSON encoding fails due to recursion, the original Object is returned because it's assumed this is for decoration
			clone = json.encode( obj, true );

			if ( clone !== undefined ) {
				clone = json.decode( clone );

				// Decorating Functions that would be lost with JSON encoding/decoding
				utility.iterate( obj, function ( v, k ) {
					if ( typeof v == "function" ) {
						clone[k] = v;
					}
				} );
			}
			else {
				clone = obj;
			}

			return clone;
		}
		else {
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
	 */
	coerce : function ( value ) {
		var tmp;

		if ( value === null || value === undefined ) {
			return undefined;
		}
		else if ( value === "true" ) {
			return true;
		}
		else if ( value === "false" ) {
			return false;
		}
		else if ( value === "null" ) {
			return null;
		}
		else if ( value === "undefined" ) {
			return undefined;
		}
		else if ( value === "" ) {
			return value;
		}
		else if ( !isNaN( tmp = Number( value ) ) ) {
			return tmp;
		}
		else if ( regex.json_wrap.test( value ) ) {
			return json.decode( value, true ) || value;
		}
		else {
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
	 */
	compile : function ( reg, pattern, modifiers ) {
		reg.compile( pattern, modifiers );

		return true;
	},

	/**
	 * Defers the execution of Function by at least the supplied milliseconds.
	 * Timing may vary under "heavy load" relative to the CPU & client JavaScript engine.
	 *
	 * @method defer
	 * @memberOf utility
	 * @param  {Function} fn     Function to defer execution of
	 * @param  {Number}   ms     Milliseconds to defer execution
	 * @param  {Number}   id     [Optional] ID of the deferred function
	 * @param  {Boolean}  repeat [Optional] Describes the execution, default is `false`
	 * @return {String}          ID of the timer
	 */
	defer : function ( fn, ms, id, repeat ) {
		var op;

		ms     = ms || 0;
		repeat = ( repeat === true );

		if ( id !== undefined ) {
			utility.clearTimers( id );
		}
		else {
			id = utility.uuid( true );
		}

		op = function () {
			utility.clearTimers( id );
			fn();
		};

		utility[repeat ? "repeating" : "timer"][id] = setTimeout( op, ms );

		return id;
	},

	/**
	 * Queries DOM with fastest method
	 *
	 * @method dom
	 * @memberOf utility
	 * @param  {String} arg DOM query
	 * @return {Mixed}      undefined, Element, or Array of Elements
	 */
	dom : function ( arg ) {
		var result;

		if ( !regex.selector_complex.test( arg ) ) {
			if ( regex.hash.test( arg ) ) {
				result = document.getElementById( arg.replace( regex.hash, "" ) ) || undefined;
			}
			else if ( regex.klass.test( arg ) ) {
				result = array.cast( document.getElementsByClassName( arg.replace( regex.klass, "" ) ) );
			}
			else if ( regex.word.test( arg ) ) {
				result = array.cast( document.getElementsByTagName( arg ) );
			}
			else {
				result = array.cast( document.querySelectorAll( arg ) );
			}
		}
		else {
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
	 */
	domId : function ( arg ) {
		return "a" + arg.replace( /-/g, "" ).slice( 1 );
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
	 * @return {Undefined}       undefined
	 */
	error : function ( e, args, scope, warning ) {
		var o = {
			"arguments" : args ? array.cast( args ) : [],
			message     : e.message || e,
			number      : e.number ? ( e.number & 0xFFFF ) : undefined,
			scope       : scope,
			stack       : e.stack || undefined,
			timestamp   : new Date().toUTCString(),
			type        : e.type || "TypeError"
		};

		utility.log( o.stack || o.message, warning !== true ? "error" : "warn" );

		return undefined;
	},

	/**
	 * Creates a "class" extending Object, with optional decoration
	 *
	 * @method extend
	 * @memberOf utility
	 * @param  {Object} obj Object to extend
	 * @param  {Object} arg [Optional] Object for decoration
	 * @return {Object}     Decorated obj
	 */
	extend : function ( obj, arg ) {
		var o;

		if ( obj === undefined ) {
			throw new Error( label.invalidArguments );
		}

		o = Object.create( obj );

		if ( arg instanceof Object ) {
			utility.merge( o, arg );
		}

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
	 */
	genId : function ( obj, dom ) {
		dom = ( dom === true );
		var id;

		if ( obj && ( obj.id || ( obj instanceof Array ) || ( typeof obj == "string" || obj instanceof String ) ) ) {
			return obj;
		}

		if ( dom ) {
			do {
				id = utility.domId( utility.uuid( true ) );
			}
			while ( utility.dom( "#" + id ) );
		}
		else {
			id = utility.domId( utility.uuid( true ) );
		}

		if ( typeof obj == "object" ) {
			obj.id = id;

			return obj;
		}
		else {
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
	 */
	iterate : function ( obj, fn ) {
		if ( typeof fn != "function" ) {
			throw new Error( label.invalidArguments );
		}

		array.each( Object.keys( obj ), function ( i ) {
			return fn.call( obj, obj[i], i );
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
	 */
	log : function ( arg, target ) {
		var ts, msg;

		if ( typeof console != "undefined" ) {
			ts  = typeof arg != "object";
			msg = ts ? "[" + new Date().toLocaleTimeString() + "] " + arg : arg;
			console[target || "log"]( msg );
		}
	},

	/**
	 * Merges obj with arg
	 *
	 * @method merge
	 * @memberOf utility
	 * @param  {Object} obj Object to decorate
	 * @param  {Object} arg Decoration
	 * @return {Object}     Decorated Object
	 */
	merge : function ( obj, arg ) {
		utility.iterate( arg, function ( v, k ) {
			if ( ( obj[k] instanceof Array ) && ( v instanceof Array ) ) {
				array.merge( obj[k], v );
			}
			else if ( ( obj[k] instanceof Object ) && ( v instanceof Object ) ) {
				utility.iterate( v, function ( x, y ) {
					obj[k][y] = utility.clone( x );
				} );
			}
			else {
				obj[k] = utility.clone( v );
			}
		} );

		return obj;
	},

	/**
	 * Parses a URI into an Object
	 *
	 * @method parse
	 * @memberOf utility
	 * @param  {String} uri URI to parse
	 * @return {Object}     Parsed URI
	 */
	parse : function ( uri ) {
		var obj    = {},
		    parsed = {};

		if ( uri === undefined ) {
			uri = !server ? location.href : "";
		}

		uri = decodeURIComponent( uri );

		if ( !server ) {
			obj = document.createElement( "a" );
			obj.href = uri;
		}
		else {
			obj = url.parse( uri );
		}

		if ( server ) {
			utility.iterate( obj, function ( v, k ) {
				if ( v === null ) {
					obj[k] = undefined;
				}
			} );
		}

		parsed = {
			auth     : server ? null : regex.auth.exec( uri ),
			protocol : obj.protocol || "http:",
			hostname : obj.hostname || "localhost",
			port     : obj.port ? number.parse( obj.port, 10 ) : "",
			pathname : obj.pathname,
			search   : obj.search   || "",
			hash     : obj.hash     || "",
			host     : obj.host     || "localhost"
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

		parsed.auth  = obj.auth || ( parsed.auth === null ? "" : parsed.auth[1] );
		parsed.href  = obj.href || ( parsed.protocol + "//" + ( string.isEmpty( parsed.auth ) ? "" : parsed.auth + "@" ) + parsed.host + parsed.pathname + parsed.search + parsed.hash );
		parsed.path  = obj.path || parsed.pathname + parsed.search;
		parsed.query = utility.queryString( null, parsed.search );

		return parsed;
	},

	/**
	 * Prevents default behavior of an Event
	 *
	 * @method prevent
	 * @memberOf utility
	 * @param  {Object} e Event
	 * @return {Object}   Event
	 */
	prevent : function ( e ) {
		if ( typeof e.preventDefault == "function" ) {
			e.preventDefault();
		}

		return e;
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
	queryString : function ( arg, qstring ) {
		var obj    = {},
		    result = qstring !== undefined ? ( qstring.indexOf( "?" ) > -1 ? qstring.replace( /.*\?/, "" ) : null ) : ( server || string.isEmpty( location.search ) ? null : location.search.replace( "?", "" ) ),
		    item;

		if ( result !== null && !string.isEmpty( result ) ) {
			result = result.split( "&" );
			array.each( result, function ( prop ) {
				item = prop.split( "=" );

				if ( string.isEmpty( item[0] ) ) {
					return;
				}

				if ( !item[1] ) {
					item[1] = "";
				}
				else if ( string.isNumber( item[1] ) ) {
					item[1] = Number( item[1] );
				}
				else if ( string.isBoolean( item[1] ) ) {
					item[1] = ( item[1] === "true" );
				}

				if ( obj[item[0]] === undefined ) {
					obj[item[0]] = item[1];
				}
				else if ( !( obj[item[0]] instanceof Array ) ) {
					obj[item[0]] = [obj[item[0]]];
					obj[item[0]].push( item[1] );
				}
				else {
					obj[item[0]].push( item[1] );
				}
			} );
		}

		if ( arg !== null && arg !== undefined ) {
			obj = obj[arg];
		}

		return obj;
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
	 */
	repeat : function ( fn, ms, id, now ) {
		ms  = ms || 10;
		id  = id || utility.uuid( true );
		now = ( now !== false );

		// Could be valid to return false from initial execution
		if ( now && fn() === false ) {
			return;
		}

		// Creating repeating execution
		utility.defer( function () {
			var recursive = function ( fn, ms, id ) {
				var recursive = this;

				if ( fn() !== false ) {
					utility.repeating[id] = setTimeout( function () {
						recursive.call( recursive, fn, ms, id );
					}, ms );
				}
				else {
					delete utility.repeating[id];
				}
			};

			recursive.call( recursive, fn, ms, id );
		}, ms, id, true );

		return id;
	},

	/**
	 * Stops an Event from bubbling, & prevents default behavior
	 *
	 * @method stop
	 * @memberOf utility
	 * @param  {Object} e Event
	 * @return {Object}   Event
	 */
	stop : function ( e ) {
		if ( typeof e.stopPropagation == "function" ) {
			e.stopPropagation();
		}

		utility.prevent( e );

		// Assumed to always be valid, even if it's not decorated on `e` ( I'm looking at you IE8 )
		e.returnValue = false;

		return e;
	},

	/**
	 * Returns the Event target
	 *
	 * @method target
	 * @memberOf utility
	 * @param  {Object} e Event
	 * @return {Object}   Event target
	 */
	target : function ( e ) {
		return e.target || e.srcElement;
	},

	/**
	 * Generates a version 4 UUID
	 *
	 * @method uuid
	 * @memberOf utility
	 * @param  {Boolean} safe [Optional] Strips - from UUID
	 * @return {String}       UUID
	 */
	uuid : function ( safe ) {
		var s = function () { return ( ( ( 1 + Math.random() ) * 0x10000 ) | 0 ).toString( 16 ).substring( 1 ); },
		    r = [8, 9, "a", "b"],
		    o;

		o = ( s() + s() + "-" + s() + "-4" + s().substr( 0, 3 ) + "-" + r[Math.floor( Math.random() * 4 )] + s().substr( 0, 3 ) + "-" + s() + s() + s() );

		if ( safe === true ) {
			o = o.replace( /-/g, "" );
		}

		return o;
	},

	/**
	 * Walks `obj` and returns `arg`
	 *
	 * @method  walk
	 * @memberOf utility
	 * @param  {Mixed}  obj  Object or Array
	 * @param  {String} arg  String describing the property to return
	 * @return {Mixed}       arg
	 */
	walk : function ( obj, arg ) {
		array.each( arg.replace( /\]$/, "" ).replace( /\]/g, "." ).replace( /\.\./g, "." ).split( /\.|\[/ ), function ( i ) {
			obj = obj[i];
		} );

		return obj;
	},

	/**
	 * Accepts Deferreds or Promises as arguments, or an Array of either
	 *
	 * @method when
	 * @memberOf utility
	 * @return {Object} {@link keigai.Deferred}
	 */
	when : function () {
		var i     = 0,
		    defer = deferred.factory(),
		    args  = array.cast( arguments ),
		    nth;

		// Did we receive an Array? if so it overrides any other arguments
		if ( args[0] instanceof Array ) {
			args = args[0];
		}

		// How many instances to observe?
		nth = args.length;

		// None, end on next tick
		if ( nth === 0 ) {
			defer.resolve( null );
		}
		// Setup and wait
		else {
			array.each( args, function ( p ) {
				p.then( function () {
					if ( ++i === nth && !defer.isResolved() ) {
						if ( args.length > 1 ) {
							defer.resolve( args.map( function ( obj ) {
								return obj.value || obj.promise.value;
							} ) );
						}
						else {
							defer.resolve( args[0].value || args[0].promise.value );
						}
					}
				}, function () {
					if ( !defer.isResolved() ) {
						if ( args.length > 1 ) {
							defer.reject( args.map( function ( obj ) {
								return obj.value || obj.promise.value;
							} ) );
						}
						else {
							defer.reject( args[0].value || args[0].promise.value );
						}
					}
				} );
			} );
		}

		return defer;
	}
};

/**
 * XMLHttpRequest shim for node.js
 *
 * @method xhr
 * @private
 * @return {Object} XMLHttpRequest instance
 */
function xhr () {
	var UNSENT           = 0,
	    OPENED           = 1,
	    HEADERS_RECEIVED = 2,
	    LOADING          = 3,
	    DONE             = 4,
	    ERR_REFUSED      = /ECONNREFUSED/,
	    ready            = new RegExp( HEADERS_RECEIVED + "|" + LOADING ),
	    XMLHttpRequest, headers, handler, handlerError, state;

	headers = {
		"User-Agent"   : "keigai/0.1.3 node.js/" + process.versions.node.replace( /^v/, "" ) + " (" + string.capitalize( process.platform ) + " V8/" + process.versions.v8 + " )",
		"Content-Type" : "text/plain",
		"Accept"       : "*/*"
	};

	/**
	 * Changes the readyState of an XMLHttpRequest
	 *
	 * @method state
	 * @memberOf xhr
	 * @param  {String} arg New readyState
	 * @return {Object}     XMLHttpRequest instance
	 */
	state = function ( arg ) {
		if ( this.readyState !== arg ) {
			this.readyState = arg;
			this.dispatchEvent( "readystatechange" );

			if ( this.readyState === DONE && !this._error ) {
				this.dispatchEvent( "load" );
				this.dispatchEvent( "loadend" );
			}
		}

		return this;
	};

	/**
	 * Response handler
	 *
	 * @method handler
	 * @memberOf xhr
	 * @param  {Object} res HTTP(S) Response Object
	 * @return {Undefined}  undefined
	 */
	handler = function ( res ) {
		var self = this;

		state.call( this, HEADERS_RECEIVED );

		this.status      = res.statusCode;
		this._resheaders = res.headers;

		if ( this._resheaders["set-cookie"] && this._resheaders["set-cookie"] instanceof Array ) {
			this._resheaders["set-cookie"] = this._resheaders["set-cookie"].join( ";" );
		}

		res.on( "data", function ( arg ) {
			res.setEncoding( "utf8" );

			if ( self._send ) {
				if ( arg ) {
					self.responseText += arg;
				}

				state.call( self, LOADING );
			}
		} );

		res.on( "end", function () {
			if ( self._send ) {
				state.call( self, DONE );
				self._send = false;
			}
		} );
	};

	/**
	 * Response error handler
	 *
	 * @method handlerError
	 * @memberOf xhr
	 * @param  {Object} e Error
	 * @return {Undefined} undefined
	 */
	handlerError = function ( e ) {
		this.status       = ERR_REFUSED.test( e.message ) ? 503 : 500;
		this.statusText   = "";
		this.responseText = e.message;
		this._error       = true;
		this._send        = false;
		this.dispatchEvent( "error" );
		state.call( this, DONE );
	};

	/**
	 * Creates a new XMLHttpRequest
	 *
	 * @constructor
	 * @private
	 * @return {Object} XMLHttpRequest instance
	 */
	XMLHttpRequest = function () {
		this.onabort            = null;
		this.onerror            = null;
		this.onload             = null;
		this.onloadend          = null;
		this.onloadstart        = null;
		this.onreadystatechange = null;
		this.readyState         = UNSENT;
		this.response           = null;
		this.responseText       = "";
		this.responseType       = "";
		this.responseXML        = null;
		this.status             = UNSENT;
		this.statusText         = "";

		// Psuedo private for prototype chain
		this._id                = utility.genId();
		this._error             = false;
		this._headers           = {};
		this._listeners         = {};
		this._params            = {};
		this._request           = null;
		this._resheaders        = {};
		this._send              = false;
	};

	/**
	 * Aborts a request
	 *
	 * @method abort
	 * @memberOf XMLHttpRequest
	 * @return {Object} XMLHttpRequest instance
	 */
	XMLHttpRequest.prototype.abort = function () {
		if ( this._request !== null ) {
			this._request.abort();
			this._request = null;
		}

		this.responseText = "";
		this.responseXML  = "";
		this._error       = true;
		this._headers     = {};

		if ( this._send === true || ready.test( this.readyState ) ) {
			this._send = false;
			state.call( this, DONE );
		}

		this.dispatchEvent( "abort" );
		this.readyState = UNSENT;

		return this;
	};

	/**
	 * Adds an event listener to an XMLHttpRequest instance
	 *
	 * @method addEventListener
	 * @memberOf XMLHttpRequest
	 * @param {String}   event Event to listen for
	 * @param {Function} fn    Event handler
	 * @return {Object}        XMLHttpRequest instance
	 */
	XMLHttpRequest.prototype.addEventListener = function ( event, fn ) {
		if ( !this._listeners.hasOwnProperty( event ) ) {
			this._listeners[event] = [];
		}

		this._listeners[event].add( fn );

		return this;
	};

	/**
	 * Dispatches an event
	 *
	 * @method dispatchEvent
	 * @memberOf XMLHttpRequest
	 * @param  {String} event Name of event
	 * @return {Object}       XMLHttpRequest instance
	 */
	XMLHttpRequest.prototype.dispatchEvent = function ( event ) {
		var self = this;

		if ( typeof this["on" + event] === "function" ) {
			this["on" + event]();
		}

		if ( this._listeners.hasOwnProperty( event ) ) {
			array.each( this._listeners[event], function ( i ) {
				if ( typeof i == "function" ) {
					i.call( self );
				}
			} );
		}

		return this;
	};

	/**
	 * Gets all response headers
	 *
	 * @method getAllResponseHeaders
	 * @memberOf XMLHttpRequest
	 * @return {Object} Response headers
	 */
	XMLHttpRequest.prototype.getAllResponseHeaders = function () {
		var result = "";

		if ( this.readyState < HEADERS_RECEIVED ) {
			throw new Error( label.invalidStateNoHeaders );
		}

		utility.iterate( this._resheaders, function ( v, k ) {
			result += k + ": " + v + "\n";
		} );

		return result;
	};

	/**
	 * Gets a specific response header
	 *
	 * @method getResponseHeader
	 * @memberOf XMLHttpRequest
	 * @param  {String} header Header to get
	 * @return {String}        Response header value
	 */
	XMLHttpRequest.prototype.getResponseHeader = function ( header ) {
		var result;

		if ( this.readyState < HEADERS_RECEIVED || this._error ) {
			throw new Error( label.invalidStateNoHeaders );
		}

		result = this._resheaders[header] || this._resheaders[header.toLowerCase()];

		return result;
	};

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
	XMLHttpRequest.prototype.open = function ( method, url, async, user, password ) {
		var self = this;

		if ( async !== true ) {
			throw new Error( label.invalidStateNoSync );
		}

		this.abort();
		this._error  = false;
		this._params = {
			method   : method,
			url      : url,
			async    : async    || true,
			user     : user     || null,
			password : password || null
		};

		utility.iterate( headers, function ( v, k ) {
			self._headers[k] = v;
		} );

		this.readyState = OPENED;

		return this;
	};

	/**
	 * Overrides the Content-Type of the request
	 *
	 * @method overrideMimeType
	 * @memberOf XMLHttpRequest
	 * @param  {String} mime Mime type of the request ( media type )
	 * @return {Object}      XMLHttpRequest instance
	 */
	XMLHttpRequest.prototype.overrideMimeType = function ( mime ) {
		this._headers["Content-Type"] = mime;

		return this;
	};

	/**
	 * Removes an event listener from an XMLHttpRequest instance
	 *
	 * @method removeEventListener
	 * @memberOf XMLHttpRequest
	 * @param {String}   event Event to listen for
	 * @param {Function} fn    Event handler
	 * @return {Object}        XMLHttpRequest instance
	 */
	XMLHttpRequest.prototype.removeEventListener = function ( event, fn ) {
		if ( !this._listeners.hasOwnProperty( event ) ) {
			return;
		}

		this._listeners[event].remove( fn );

		return this;
	};

	/**
	 * Sends an XMLHttpRequest request
	 *
	 * @method send
	 * @memberOf XMLHttpRequest
	 * @param  {Mixed} data [Optional] Payload to send with the request
	 * @return {Object}     XMLHttpRequest instance
	 */
	XMLHttpRequest.prototype.send = function ( data ) {
		data     = data || null;
		var self = this,
		    options, parsed, request, obj;

		if ( this.readyState < OPENED ) {
			throw new Error( label.invalidStateNotOpen );
		}
		else if ( this._send ) {
			throw new Error( label.invalidStateNotSending );
		}

		parsed      = utility.parse( this._params.url );
		parsed.port = parsed.port || ( parsed.protocol === "https:" ? 443 : 80 );

		if ( this._params.user !== null && this._params.password !== null ) {
			parsed.auth = this._params.user + ":" + this._params.password;
		}

		// Specifying Content-Length accordingly
		if ( regex.put_post.test( this._params.method ) ) {
			this._headers["Content-Length"] = data !== null ? Buffer.byteLength( data ) : 0;
		}

		this._headers.Host = parsed.hostname + ( !regex.http_ports.test( parsed.port ) ? ":" + parsed.port : "" );

		options = {
			hostname : parsed.hostname,
			path     : parsed.path,
			port     : parsed.port,
			method   : this._params.method,
			headers  : this._headers
		};

		if ( parsed.protocol === "https:" ) {
			options.rejectUnauthorized = false;
			options.agent              = false;
		}

		if ( parsed.auth ) {
			options.auth = parsed.auth;
		}

		self._send = true;
		self.dispatchEvent( "readystatechange" );

		obj = parsed.protocol === "http:" ? http : https;

		request = obj.request( options, function ( arg ) {
			handler.call( self, arg );
		} ).on( "error", function ( e ) {
			handlerError.call( self, e );
		} );

		data === null ? request.setSocketKeepAlive( true, 10000 ) : request.write( data, "utf8" );
		this._request = request;
		request.end();

		self.dispatchEvent( "loadstart" );

		return this;
	};

	/**
	 * Sets a request header of an XMLHttpRequest instance
	 *
	 * @method setRequestHeader
	 * @memberOf XMLHttpRequest
	 * @param {String} header HTTP header
	 * @param {String} value  Header value
	 * @return {Object}       XMLHttpRequest instance
	 */
	XMLHttpRequest.prototype.setRequestHeader = function ( header, value ) {
		if ( this.readyState !== OPENED ) {
			throw new Error( label.invalidStateNotUsable );
		}
		else if ( this._send ) {
			throw new Error( label.invalidStateNotSending );
		}

		this._headers[header] = value;

		return this;
	};

	return XMLHttpRequest;
}

/**
 * @namespace xml
 * @private
 */
var xml = {
	/**
	 * Returns XML (Document) Object from a String
	 *
	 * @method decode
	 * @memberOf xml
	 * @param  {String} arg XML String
	 * @return {Object}     XML Object or undefined
	 */
	decode : function ( arg ) {
		if ( typeof arg != "string" || string.isEmpty( arg ) ) {
			throw new Error( label.invalidArguments );
		}

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
	encode : function ( arg, wrap ) {
		try {
			if ( arg === undefined ) {
				throw new Error( label.invalidArguments );
			}

			wrap    = ( wrap !== false );
			var x   = wrap ? "<xml>" : "",
			    top = ( arguments[2] !== false ),
			    node;

			/**
			 * Encodes a value as a node
			 *
			 * @method node
			 * @memberOf xml.encode
			 * @private
			 * @param  {String} name  Node name
			 * @param  {String} value Node value
			 * @return {String}       Node
			 */
			node = function ( name, value ) {
				var output = "<n>v</n>";

				output = output.replace( "v", ( regex.cdata.test( value ) ? "<![CDATA[" + value + "]]>" : value ) );
				return output.replace(/<(\/)?n>/g, "<$1" + name + ">");
			};

			if ( arg !== null && arg.xml ) {
				arg = arg.xml;
			}

			if ( arg instanceof Document ) {
				arg = ( new XMLSerializer() ).serializeToString( arg );
			}

			if ( regex.boolean_number_string.test( typeof arg ) ) {
				x += node( "item", arg );
			}
			else if ( typeof arg == "object" ) {
				utility.iterate( arg, function ( v, k ) {
					x += xml.encode( v, ( typeof v == "object" ), false ).replace( /item|xml/g, isNaN( k ) ? k : "item" );
				} );
			}

			x += wrap ? "</xml>" : "";

			if ( top ) {
				x = "<?xml version=\"1.0\" encoding=\"UTF8\"?>" + x;
			}

			return x;
		}
		catch ( e ) {
			utility.error( e, arguments, this );

			return undefined;
		}
	},

	/**
	 * Validates `arg` is XML
	 *
	 * @method valid
	 * @memberOf xml
	 * @param  {String} arg String to validate
	 * @return {Boolean}    `true` if valid XML
	 */
	valid : function ( arg ) {
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
function bootstrap () {
	// Second phase
	function init () {
		// Cache garbage collector (every minute)
		utility.repeat( function () {
			cache.clean();
		}, 60000, "cacheGarbageCollector");
	}

	// Repeating function to call init()
	function fn () {
		if ( regex.complete_loaded.test( document.readyState ) ) {
			init();

			return false;
		}
	}

	// Describing the Client
	if ( !server ) {
		client.version = client.version();

		// IE8 and older is not supported
		if ( client.ie && client.version < 9 ) {
			throw new Error( label.upgrade );
		}

		// getElementsByClassName shim for IE9
		if ( Element.prototype.getElementsByClassName === undefined ) {
			Element.prototype.getElementsByClassName = function ( arg ) {
				return document.querySelectorAll( "." + arg );
			};
		}

		// classList shim for IE9
		if ( !document.documentElement.classList ) {
			( function ( view ) {
				var ClassList, getter, proto, target, descriptor;

				if ( !( "HTMLElement" in view ) && !( "Element" in view ) ) {
					return;
				}

				ClassList = function ( obj ) {
					var classes = string.explode( obj.className, " " ),
					    self    = this;

					array.each( classes, function ( i ) {
						self.push( i );
					} );

					this.updateClassName = function () {
						obj.className = this.join( " " );
					};
				};

				getter = function () {
					return new ClassList( this );
				};

				proto  = ClassList.prototype = [];
				target = ( view.HTMLElement || view.Element ).prototype;

				proto.add = function ( arg ) {
					if ( !array.contains( this, arg ) ) {
						this.push( arg );
						this.updateClassName();
					}
				};

				proto.contains = function ( arg ) {
					return array.contains( this, arg );
				};

				proto.remove = function ( arg ) {
					if ( array.contains( this, arg ) ) {
						array.remove( this, arg );
						this.updateClassName();
					}
				};

				proto.toggle = function ( arg ) {
					array[array.contains( this, arg ) ? "remove" : "add"]( this, arg );
					this.updateClassName();
				};

				if ( Object.defineProperty ) {
					descriptor = {
						get          : getter,
						enumerable   : true,
						configurable : true
					};

					Object.defineProperty( target, "classList", descriptor );
				}
				else if ( Object.prototype.__defineGetter__) {
					target.__defineGetter__( "classList", getter );
				}
				else {
					throw new Error( "Could not create classList shim" );
				}
			} )( global );
		}
	}
	else {
		// XHR shim
		XMLHttpRequest = xhr();
	}

	// Caching functions
	has   = Object.prototype.hasOwnProperty;
	slice = Array.prototype.slice;

	// Initializing
	if ( typeof exports != "undefined" || typeof define == "function" || regex.complete_loaded.test( document.readyState ) ) {
		init();
	}
	else if ( typeof document.addEventListener == "function" ) {
		document.addEventListener( "DOMContentLoaded" , function () {
			init();
		}, false );
	}
	else if ( typeof document.attachEvent == "function" ) {
		document.attachEvent( "onreadystatechange" , fn );
	}
	else {
		utility.repeat( fn );
	}
}

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
	version : "0.1.3"
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