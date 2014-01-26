/**
 * deferred factory
 *
 * @method deferred
 * @memberOf keigai
 * @private
 * @return {Object} {@link Deferred}
 */
var deferred = function () {
	return new Deferred();
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
 * @private
 * @memberOf Deferred
 * @type {Function}
 */
Deferred.prototype.constructor = Deferred;

/**
 * Registers a function to execute after Promise is reconciled
 *
 * @method always
 * @memberOf Deferred
 * @param  {Function} arg Function to execute
 * @return {Object} {@link Deferred}
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
 * @memberOf Deferred
 * @param  {Function} arg Function to execute
 * @return {Object} {@link Deferred}
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
 * @memberOf Deferred
 * @param  {Function} arg Function to execute
 * @return {Object} {@link Deferred}
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
 * @memberOf Deferred
 * @return {Boolean} `true` if rejected
 */
Deferred.prototype.isRejected = function () {
	return ( this.promise.state === promise.state.FAILED );
};

/**
 * Determines if Deferred is resolved
 *
 * @method isResolved
 * @memberOf Deferred
 * @return {Boolean} `true` if resolved
 */
Deferred.prototype.isResolved = function () {
	return ( this.promise.state === promise.state.SUCCESS );
};

/**
 * Rejects the Promise
 *
 * @method reject
 * @memberOf Deferred
 * @param  {Mixed} arg Rejection outcome
 * @return {Object} {@link Deferred}
 */
Deferred.prototype.reject = function ( arg ) {
	this.promise.reject.call( this.promise, arg );

	return this;
};

/**
 * Resolves the Promise
 *
 * @method resolve
 * @memberOf Deferred
 * @param  {Mixed} arg Resolution outcome
 * @return {Object} {@link Deferred}
 */
Deferred.prototype.resolve = function ( arg ) {
	this.promise.resolve.call( this.promise, arg );

	return this;
};

/**
 * Gets the state of the Promise
 *
 * @method state
 * @memberOf Deferred
 * @return {String} Describes the state
 */
Deferred.prototype.state = function () {
	return this.promise.state;
};

/**
 * Registers handler(s) for the Promise
 *
 * @method then
 * @memberOf Deferred
 * @param  {Function} success Executed when/if promise is resolved
 * @param  {Function} failure [Optional] Executed when/if promise is broken
 * @return {Object} {@link Promise}
 */
Deferred.prototype.then = function ( success, failure ) {
	return this.promise.then( success, failure );
};
