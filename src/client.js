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

			items[header[0].toLowerCase()] = string.trim( header[1] );

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
	},

	/**
	 * Creates a script Element to load an external script
	 *
	 * @method script
	 * @memberOf client
	 * @param  {String} arg    URL to script
	 * @param  {Object} target [Optional] Element to receive the script
	 * @param  {String} pos    [Optional] Position to create the script at within the target
	 * @return {Object}        Element
	 */
	script : function ( arg, target, pos ) {
		return element.create( "script", {type: "application/javascript", src: arg}, target || utility.dom( "head" )[0], pos );
	},

	/**
	 * Scrolls to a position in the view using a two point bezier curve
	 *
	 * @method scroll
	 * @memberOf client
	 * @param  {Array}  dest Coordinates
	 * @param  {Number} ms   [Optional] Milliseconds to scroll, default is 250, min is 100
	 * @return {Object} {@link Deferred}
	 */
	scroll : function ( dest, ms ) {
		var defer = deferred(),
		    start = client.scrollPos(),
		    t     = 0;

		ms = ( !isNaN( ms ) ? ms : 250 ) / 100;

		utility.repeat( function () {
			var pos = math.bezier( start[0], start[1], dest[0], dest[1], ++t / 100 );

			window.scrollTo( pos[0], pos[1] );

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
	 */
	scrollPos : function () {
		return [
			window.scrollX || 0,
			window.scrollY || 0
		];
	},

	/**
	 * Returns the visible area of the View
	 *
	 * @method size
	 * @memberOf client
	 * @return {Array} Describes the View
	 */
	size : function () {
		return [
			document["documentElement" || "body"].clientWidth  || 0,
			document["documentElement" || "body"].clientHeight || 0
		];
	},

	/**
	 * Creates a link Element to load an external stylesheet
	 *
	 * @method stylesheet
	 * @memberOf client
	 * @param  {String} arg   URL to stylesheet
	 * @param  {String} media [Optional] Medias the stylesheet applies to
	 * @return {Object}      Stylesheet
	 */
	stylesheet : function ( arg, media ) {
		return element.create( "link", {rel: "stylesheet", type: "text/css", href: arg, media: media || "print, screen"}, utility.dom( "head" )[0] );
	}
};
