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
	    XMLHttpRequest, headers, dispatch, success, failure, state;

	headers = {
		"user-agent"   : "keigai/{{VERSION}} node.js/" + process.versions.node.replace( /^v/, "" ) + " (" + string.capitalize( process.platform ) + " V8/" + process.versions.v8 + " )",
		"content-type" : "text/plain",
		"accept"       : "*/*"
	};

	/**
	 * Dispatches an event
	 *
	 * @method dispatch
	 * @memberOf xhr
	 * @param  {String} arg Event to dispatch
	 * @return {Object}     XMLHttpRequest instance
	 */
	dispatch = function ( arg ) {
		var fn = "on" + arg;

		if ( typeof this[fn] == "function" ) {
			this[fn]();
		}

		this.dispatchEvent( arg );

		return this;
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
			dispatch.call( this, "readystatechange" );

			if ( this.readyState === DONE && !this._error ) {
				dispatch.call( this, "load" );
				dispatch.call( this, "loadend" );
			}
		}

		return this;
	};

	/**
	 * Response handler
	 *
	 * @method success
	 * @memberOf xhr
	 * @param  {Object} res HTTP(S) Response Object
	 * @return {Undefined}  undefined
	 */
	success = function ( res ) {
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
	 * @method failure
	 * @memberOf xhr
	 * @param  {Object} e Error
	 * @return {Undefined} undefined
	 */
	failure = function ( e ) {
		this.status       = ERR_REFUSED.test( e.message ) ? 503 : 500;
		this.statusText   = "";
		this.responseText = e.message;
		this._error       = true;
		this._send        = false;
		dispatch.call( this, "error" );
		state.call( this, DONE );
	};

	/**
	 * Creates a new XMLHttpRequest
	 *
	 * @constructor
	 * @private
	 * @memberOf xhr
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
		this.observer           = observable.factory();

		// Psuedo private for prototype chain
		this._error             = false;
		this._headers           = {};
		this._params            = {};
		this._request           = null;
		this._resheaders        = {};
		this._send              = false;
	};

	/**
	 * Extending Base
	 *
	 * @memberOf keigai.XMLHttpRequest
	 * @type {Object} {@link keigai.Base}
	 */
	XMLHttpRequest.prototype = base.factory();

	/**
	 * Setting constructor loop
	 *
	 * @method constructor
	 * @memberOf keigai.XMLHttpRequest
	 * @type {Function}
	 * @private
	 */
	XMLHttpRequest.prototype.constructor = XMLHttpRequest;

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
			this._request     = null;
			this.responseText = "";
			this.responseXML  = "";
			this._error       = true;
			this._headers     = {};

			if ( this._send === true || ready.test( this.readyState ) ) {
				this._send = false;
				state.call( this, DONE );
			}

			dispatch.call( this, "abort" );
			this.readyState = UNSENT;
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
		this._headers["content-type"] = mime;

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
			if ( data === null ) {
				this._headers["content-length"] = 0;
			}
			else if ( typeof data == "string" ) {
				this._headers["content-length"] = Buffer.byteLength( data );
			}
			else if ( data instanceof Buffer || typeof data.toString == "function" ) {
				data = data.toString();
				this._headers["content-length"] = Buffer.byteLength( data );
			}
			else {
				throw new Error( label.invalidArguments );
			}
		}

		this._headers.host = parsed.host;

		if ( this._headers["x-requested-with"] === "XMLHttpRequest" ) {
			delete this._headers["x-requested-with"];
		}

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

		this._send = true;
		dispatch.call( this, "readystatechange" );

		obj = parsed.protocol === "http:" ? http : https;

		request = obj.request( options, function ( arg ) {
			success.call( self, arg );
		} ).on( "error", function ( e ) {
			failure.call( self, e );
		} );

		data === null ? request.setSocketKeepAlive( true ) : request.write( data, "utf8" );
		this._request = request;
		request.end();

		dispatch.call( this, "loadstart" );

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

		this._headers[header.toLowerCase()] = value;

		return this;
	};

	return XMLHttpRequest;
}
