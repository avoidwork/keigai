/**
 * @namespace utility
 */
var utility = {
	/**
	 * Collection of timers
	 *
	 * @memberOf utility
	 * @type {Object}
	 * @private
	 */
	timer : {},

	/**
	 * Collection of repeating functions
	 *
	 * @memberOf utility
	 * @type {Object}
	 * @private
	 */
	repeating: {},

	/**
	 * Creates Elements or Queries the DOM using CSS selectors
	 *
	 * @method $
	 * @memberOf utility
	 * @param  {Mixed} arg HTML, or Comma delimited string of CSS selectors
	 * @return {Array}     Array of matching Elements
	 * @example
	 * var $ = keigai.util.$;
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
	$ : function ( arg ) {
		var result;

		// Nothing
		if ( !arg ) {
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
	 * @private
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
	 * @example
	 * var x = {a: true, b: false},
	 *     y = keigai.util.clone( x, true );
	 *
	 * y.a; // true
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
	 * @example
	 * keigai.util.coerce( "1" ); // 1
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
	 * @private
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
	 * @private
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
	 * Async delay strategy
	 *
	 * @method delay
	 * @memberOf promise
	 * @return {Function} Delay method
	 * @private
	 */
	delay : function () {
		if ( typeof setImmediate != "undefined" ) {
			return function ( arg ) {
				setImmediate( arg );
			};
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
	 * Queries DOM with fastest method
	 *
	 * @method dom
	 * @memberOf utility
	 * @param  {String} arg DOM query
	 * @return {Mixed}      undefined, Element, or Array of Elements
	 * @private
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
	 * @private
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
	 * @private
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
	 * @example
	 * var extendObj = keigai.util.extend( someObj, {newProperty: value} );
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
	 * @private
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
	 * @example
	 * keigai.util.iterate( {...}, function ( value, key ) {
	 *   ...
	 * } );
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
	 * @example
	 * keigai.util.log( "Something bad happened", "warn" );
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
	 * @example
	 * var obj = {a: true};
	 *
	 * keigai.util.merge( obj, {b: false} )
	 * obj.b; // false
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
	 * @example
	 * var parsed = keigai.util.parse( location.href );
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
	 * @param  {Object} ev Event
	 * @return {Object}    Event
	 * @example
	 * keigai.util.prevent( Event );
	 */
	prevent : function ( ev ) {
		if ( typeof ev.preventDefault == "function" ) {
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
	 * @private
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
	 * @param  {Object} ev Event
	 * @return {Object}    Event
	 * @example
	 * keigai.util.stop( Event );
	 */
	stop : function ( ev ) {
		if ( typeof ev.stopPropagation == "function" ) {
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
	 * var target = keigai.util.target( Event );
	 */
	target : function ( ev ) {
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
	 * var uuid4 = keigai.util.uuid();
	 */
	uuid : function ( strip ) {
		var s = function () { return ( ( ( 1 + Math.random() ) * 0x10000 ) | 0 ).toString( 16 ).substring( 1 ); },
		    r = [8, 9, "a", "b"],
		    o;

		o = ( s() + s() + "-" + s() + "-4" + s().substr( 0, 3 ) + "-" + r[Math.floor( Math.random() * 4 )] + s().substr( 0, 3 ) + "-" + s() + s() + s() );

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
	 * @return {Mixed}       arg
	 * @example
	 * var obj = {a: [{b: true}]};
	 *
	 * keigai.util.walk( obj, "a[0].b" ); // true
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
	 * @example
	 * var deferreds = [],
	 *     defer1    = keigai.util.defer(),
	 *     defer2    = keigai.util.defer();
	 *
	 * deferreds.push( defer1 );
	 * deferreds.push( defer2 );
	 *
	 * // Executes when both deferreds have resolved or one has rejected
	 * $.when( deferreds ).then( function ( args ) ) {
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
