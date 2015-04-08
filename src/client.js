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

		this.observer = observable.factory();
		this.defer = deferred.factory();
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
	version: () => {
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
	allows: ( uri, verb, headers ) => {
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
	bit: ( args ) => {
		let result = 0;

		array.each( args, ( verb ) => {
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
	cors: ( uri ) => {
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
	 * @private
	 */
	headers: ( xhr, uri, type, request_headers ) => {
		let headers = string.trim( xhr.getAllResponseHeaders() ).split( "\n" );
		let items = {};
		let o = {};
		let allow = null;
		let expires = new Date();
		let cors = client.cors( uri );
		let cachable = true;

		array.each( headers, ( i ) => {
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
	parse: ( xhr, type="" ) => {
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
	permissions: ( uri, headers ) => {
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
	jsonp: ( uri, args ) => {
		let defer = deferred.factory();
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

		global.callback[ cbid ] = ( arg ) => {
			utility.clearTimers( cbid );
			delete global.callback[ cbid ];
			defer.resolve( arg );
			element.destroy( s );
		};

		s = element.create( "script", { src: uri, type: "text/javascript" }, utility.dom( "head" )[ 0 ] );

		utility.defer( () => {
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
	kxhr: ( xhr ) => {
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
	request: ( uri, type="GET", args, headers ) => {
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
		kxhr.on( "readystatechange", ( ev ) => {
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
			utility.delay( () => {
				kxhr.dispatch( "afterXHR", kxhr.xhr, null );
			} );

			return;
		}

		if ( type === "get" && Boolean( cached ) ) {
			// Decorating XHR for proxy behavior
			if ( server ) {
				kxhr.xhr.readyState = 4;
				kxhr.xhr.status = 200;
				kxhr.xhr._resheaders = cached.headers;
			}

			kxhr.dispatch( "beforeXHR", kxhr.xhr, null );
			kxhr.resolve( cached.response );

			utility.delay( () => {
				kxhr.dispatch( "afterXHR", kxhr.xhr, null );
			} );

			return;
		}

		utility.delay( () => {
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

				utility.iterate( headers, ( v, k ) => {
					if ( v !== null && k !== "withCredentials" ) {
						kxhr.xhr.setRequestHeader( k, v );
					}
				} );

				// Cross Origin Resource Sharing ( CORS )
				if ( typeof kxhr.xhr.withCredentials === "boolean" && headers !== null && typeof headers.withCredentials === "boolean" ) {
					kxhr.xhr.withCredentials = headers.withCredentials;
				}
			}

			kxhr.on( "load", () => {
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
										client.request( redirect ).then( ( arg ) => {
											if ( type === "get" && shared && o.cachable ) {
												cache.set( uri, "response", arg );
											}

											kxhr.resolve( arg );
										}, ( e ) => {
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

			kxhr.on( "error", ( e ) => {
				kxhr.reject( e );
			} );

			// Sending request
			kxhr.xhr.send( payload !== null ? payload : undefined );
		} );

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
	scroll: ( dest, ms ) => {
		let defer = deferred();
		let start = client.scrollPos();
		let t = 0;

		ms = ( !isNaN( ms ) ? ms : 250 ) / 100;

		utility.repeat( () => {
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
	scrollPos: () => {
		return [
			window.scrollX || 0,
			window.scrollY || 0
		];
	}
};
