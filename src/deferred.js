class Deferred {
	/**
	 * Creates a new Deferred
	 *
	 * @constructor
	 * @memberOf keigai
	 */
	constructor () {
		let self = this;

		this.promise = promise.factory();
		this.onDone = [];
		this.onAlways = [];
		this.onFail = [];

		// Setting handlers to execute Arrays of Functions
		this.promise.then( ( arg ) => {
			array.each( self.onDone, ( i ) => {
				i( arg );
			} );

			array.each( self.onAlways, ( i ) => {
				i( arg );
			} );

			self.onAlways = [];
			self.onDone = [];
			self.onFail = [];
		}, ( arg ) => {
			array.each( self.onFail, ( i ) => {
				i( arg );
			} );

			array.each( self.onAlways, ( i ) => {
				i( arg );
			} );

			self.onAlways = [];
			self.onDone = [];
			self.onFail = [];
		} );
	}

	/**
	 * Registers a function to execute after Promise is reconciled
	 *
	 * @method always
	 * @memberOf keigai.Deferred
	 * @param  {Function} arg Function to execute
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * let deferred = keigai.util.defer();
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
	always ( arg ) {
		this.onAlways.push( arg );

		return this;
	}

	/**
	 * Catches errors from the Promise
	 *
	 * @method  catch
	 * @memberOf keigai.Deferred
	 * @param  {Function} arg Function to execute
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * let deferred = keigai.util.defer();
	 *
	 * deferred.catch( function ( err ) {
	 *   ...
	 * } );
	 */
	catch ( arg ) {
		return this.promise.catch( arg );
	}

	/**
	 * Registers a function to execute after Promise is resolved
	 *
	 * @method done
	 * @memberOf keigai.Deferred
	 * @param  {Function} arg Function to execute
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * let deferred = keigai.util.defer();
	 *
	 * deferred.done( function ( ... ) {
	 *   ...
	 * } );
	 */
	done ( arg ) {
		this.onDone.push( arg );

		return this;
	}

	/**
	 * Registers a function to execute after Promise is rejected
	 *
	 * @method fail
	 * @memberOf keigai.Deferred
	 * @param  {Function} arg Function to execute
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * let deferred = keigai.util.defer();
	 *
	 * deferred.fail( function ( ... ) {
	 *   ...
	 * } );
	 */
	fail ( arg ) {
		this.onFail.push( arg );

		return this;
	}

	/**
	 * Rejects the Promise
	 *
	 * @method reject
	 * @memberOf keigai.Deferred
	 * @param  {Mixed} arg Rejection outcome
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * let deferred = keigai.util.defer();
	 *
	 * deferred.reject( new Error( "Something went wrong" ) );
	 */
	reject ( arg ) {
		this.promise.reject.call( this.promise, arg );

		return this;
	}

	/**
	 * Resolves the Promise
	 *
	 * @method resolve
	 * @memberOf keigai.Deferred
	 * @param  {Mixed} arg Resolution outcome
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * let deferred = keigai.util.defer();
	 *
	 * deferred.resolve( true );
	 */
	resolve ( arg ) {
		this.promise.resolve.call( this.promise, arg );

		return this;
	}

	/**
	 * Registers handler(s) for the Promise
	 *
	 * @method then
	 * @memberOf keigai.Deferred
	 * @param  {Function} success Executed when/if promise is resolved
	 * @param  {Function} failure [Optional] Executed when/if promise is broken
	 * @return {Object} {@link Promise}
	 * @example
	 * let deferred = keigai.util.defer();
	 *
	 * deferred.then( function ( ... ) { ... }, function ( err ) { ... } )
	 *         .then( function ( ... ) { ... }, function ( err ) { ... } );
	 *
	 * ...
	 *
	 * deferred.resolve( true );
	 */
	then ( success, failure ) {
		return this.promise.then( success, failure );
	}
}

/**
 * @namespace deferred
 */
let deferred = {
	/**
	 * Deferred factory
	 *
	 * @method factory
	 * @memberOf deferred
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * let deferred = keigai.util.defer();
	 *
	 * deferred.then( function ( ... ) { ... }, function ( err ) { ... } )
	 * deferred.always( function ( ... ) { ... } );
	 *
	 * ...
	 *
	 * deferred.resolve( true );
	 */
	factory: () => {
		return new Deferred();
	}
};
