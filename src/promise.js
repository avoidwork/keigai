/**
 * @namespace promise
 * @private
 */
var promise = {
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
			utility.delay( function () {
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
 * @private
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
		utility.delay( function () {
			self.process();
		} );

		this.deferred = true;
	}

	return child;
};
