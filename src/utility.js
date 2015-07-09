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
		console.log( {{BANNER}}.join( "\n" ) );
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
		let host, idxAscii, idxQ, parsed, protocol;

		if ( uri === undefined || uri === null ) {
			uri = !server ? location.href : "";
		} else {
			idxAscii = uri.indexOf( "%3F" );
			idxQ = uri.indexOf( "?" );

			if ( ( idxQ === -1 && idxAscii > -1 ) || ( idxAscii < idxQ ) ) {
				uri = uri.replace( "%3F", "?" );
			}
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
			let aitem = prop.replace( /\+/g, " " ).split( "=" );
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
