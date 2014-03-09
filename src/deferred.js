/**
 * @namespace deferred
 */
var deferred = {
	/**
	 * Deferred factory
	 *
	 * @method factory
	 * @memberOf deferred
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * var deferred = keigai.util.defer();
	 *
	 * deferred.then( function ( ... ) { ... }, function ( err ) { ... } )
	 * deferred.always( function ( ... ) { ... } );
	 *
	 * ...
	 *
	 * deferred.resolve( true );
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
 * @private
 */
Deferred.prototype.constructor = Deferred;

/**
 * Registers a function to execute after Promise is reconciled
 *
 * @method always
 * @memberOf keigai.Deferred
 * @param  {Function} arg Function to execute
 * @return {Object} {@link keigai.Deferred}
 * @example
 * var deferred = keigai.util.defer();
 *
 * deferred.always( function () {
 *            ...
 *          } ).then( function () {
 *            ...
 *          } );
 *
 * ...
 *
 * deferred.resolve( true );
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
 * @example
 * var deferred = keigai.util.defer();
 *
 * deferred.done( function ( ... ) {
 *   ...
 * } );
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
 * @example
 * var deferred = keigai.util.defer();
 *
 * deferred.fail( function ( ... ) {
 *   ...
 * } );
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
 * @example
 * var deferred = keigai.util.defer();
 *
 * ...
 *
 * if ( deferred.isRejected() ) {
 *   ...
 * }
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
 * @example
 * var deferred = keigai.util.defer();
 *
 * ...
 *
 * if ( deferred.isResolved() ) {
 *   ...
 * }
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
 * @example
 * var deferred = keigai.util.defer();
 *
 * deferred.reject( new Error( "Something went wrong" ) );
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
 * @example
 * var deferred = keigai.util.defer();
 *
 * deferred.resolve( true );
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
 * @example
 * var deferred = keigai.util.defer();
 *
 * deferred.state(); // 0
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
 * @example
 * var deferred = keigai.util.defer();
 *
 * deferred.then( function ( ... ) { ... }, function ( err ) { ... } )
 *         .then( function ( ... ) { ... }, function ( err ) { ... } );
 *
 * ...
 *
 * deferred.resolve( true );
 */
Deferred.prototype.then = function ( success, failure ) {
	return this.promise.then( success, failure );
};
