/**
 * XMLHttpRequest shim for node.js
 *
 * @method xhr
 * @private
 * @return {Object} XMLHttpRequest instance
 */
let xhr = () => {
	const UNSENT = 0;
	const OPENED = 1;
	const HEADERS_RECEIVED = 2;
	const LOADING = 3;
	const DONE = 4;
	const ERR_REFUSED = /ECONNREFUSED/;
	const ready = new RegExp( HEADERS_RECEIVED + "|" + LOADING );

	let headers = {
		"user-agent": "keigai/{{VERSION}} node.js/" + process.versions.node.replace( /^v/, "" ) + " (" + string.capitalize( process.platform ) + " V8/" + process.versions.v8 + " )",
		"content-type": "text/plain",
		"accept": "*/*"
	};

	/**
	 * Dispatches an event
	 *
	 * @method dispatch
	 * @memberOf xhr
	 * @param  {String} arg Event to dispatch
	 * @return {Object}     XMLHttpRequest instance
	 */
	let dispatch = ( obj, arg ) => {
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
	let state = ( obj, arg ) => {
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
	 * @param  {Object} res HTTP(S) Response Object
	 * @return {Undefined}  undefined
	 */
	let success = ( obj, res ) => {
		state( obj, HEADERS_RECEIVED );
		obj.status = res.statusCode;
		obj._resheaders = res.headers;

		if ( obj._resheaders[ "set-cookie" ] && obj._resheaders[ "set-cookie" ] instanceof Array ) {
			obj._resheaders[ "set-cookie" ] = obj._resheaders[ "set-cookie" ].join( ";" );
		}

		res.on( "data", ( arg ) => {
			res.setEncoding( "utf8" );

			if ( obj._send ) {
				if ( arg ) {
					obj.responseText += arg;
				}

				state( obj, LOADING );
			}
		} );

		res.on( "end", () => {
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
	 * @param  {Object} e Error
	 * @return {Undefined} undefined
	 */
	let failure = ( obj, e ) => {
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
			this.observer = observable.factory();

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

			utility.iterate( this._resheaders, ( v, k ) => {
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
			let self = this;

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
			let self = this;
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
				success( self, arg );
			} ).on( "error", ( e ) => {
				failure( self, e );
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
