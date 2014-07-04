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
		array.each( self.onDone, function ( i ) {
			i( arg );
		} );

		array.each( self.onAlways, function ( i ) {
			i( arg );
		} );

		self.onAlways = [];
		self.onDone   = [];
		self.onFail   = [];
	}, function ( arg ) {
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
 *     ...
 * } ).then( function () {
 *     ...
 * } );
 *
 * ...
 *
 * deferred.resolve( true );
 */
Deferred.prototype.always = function ( arg ) {
	this.onAlways.push( arg );

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
	this.onDone.push( arg );

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
	this.onFail.push( arg );

	return this;
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
