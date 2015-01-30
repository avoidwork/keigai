class Base {
	/**
	 * Base Object
	 *
	 * @constructor
	 * @memberOf keigai
	 */
	constructor () {
		/**
		 * {@link keigai.Observable}
		 *
		 * @abstract
		 * @type {Object}
		 */
		this.observer = null;
	}

	/**
	 * Adds an event listener
	 *
	 * @method addEventListener
	 * @memberOf keigai.Base
	 * @param  {String}   ev       Event name
	 * @param  {Function} listener Function to execute
	 * @param  {String}   id       [Optional] Listener ID
	 * @param  {String}   scope    [Optional] Listener scope, default is `this`
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.addEventListener( "event", function ( ev ) {
	 *   ...
	 * }, "myHook" );
	 */
	addEventListener ( ev, listener, id, scope ) {
		this.observer.on( ev, listener, id, scope || this );

		return this;
	}

	/**
	 * Adds an event listener
	 *
	 * @method addListener
	 * @memberOf keigai.Base
	 * @param  {String}   ev       Event name
	 * @param  {Function} listener Function to execute
	 * @param  {String}   id       [Optional] Listener ID
	 * @param  {String}   scope    [Optional] Listener scope, default is `this`
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.addEventListener( "event", function ( ev ) {
	 *   ...
	 * }, "myHook" );
	 */
	addListener ( ev, listener, id, scope ) {
		this.observer.on( ev, listener, id, scope || this );

		return this;
	}

	/**
	 * Dispatches an event, with optional arguments
	 *
	 * @method dispatch
	 * @memberOf keigai.Base
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.dispatch( "event", ... );
	 */
	dispatch ( ...args ) {
		this.observer.dispatch.apply( this.observer, args );

		return this;
	}

	/**
	 * Dispatches an event, with optional arguments
	 *
	 * @method dispatchEvent
	 * @memberOf keigai.Base
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.dispatchEvent( "event", ... );
	 */
	dispatchEvent ( ...args ) {
		this.observer.dispatch.apply( this.observer, args );

		return this;
	}

	/**
	 * Dispatches an event, with optional arguments
	 *
	 * @method emit
	 * @memberOf keigai.Base
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.emit( "event", ... );
	 */
	emit ( ...args ) {
		this.observer.dispatch.apply( this.observer, args );

		return this;
	}

	/**
	 * Hooks into `target` for an event
	 *
	 * @method hook
	 * @memberOf keigai.Base
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.hook( document.querySelector( "a" ), "click" );
	 */
	hook ( ...args ) {
		this.observer.hook.apply( this.observer, args );

		return this;
	}

	/**
	 * Gets listeners
	 *
	 * @method listeners
	 * @memberOf keigai.Base
	 * @param  {String} ev [Optional] Event name
	 * @return {Object} Listeners
	 * @example
	 * keigai.util.iterate( obj.listeners(), function ( fn, id ) {
	 *   ...
	 * } );
	 */
	listeners ( ev ) {
		return ev ? this.observer.listeners[ ev ] : this.observer.listeners;
	}

	/**
	 * Removes an event listener
	 *
	 * @method off
	 * @memberOf keigai.Base
	 * @param  {String} ev Event name
	 * @param  {String} id [Optional] Listener ID
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.off( "event", "myHook" );
	 */
	off ( ev, id ) {
		this.observer.off( ev, id );

		return this;
	}

	/**
	 * Adds an event listener
	 *
	 * @method on
	 * @memberOf keigai.Base
	 * @param  {String}   ev       Event name
	 * @param  {Function} listener Function to execute
	 * @param  {String}   id       [Optional] Listener ID
	 * @param  {String}   scope    [Optional] Listener scope, default is `this`
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.on( "event", function ( ev ) {
	 *   ...
	 * }, "myHook" );
	 */
	on ( ev, listener, id, scope ) {
		this.observer.on( ev, listener, id, scope || this );

		return this;
	}

	/**
	 * Adds a short lived event listener
	 *
	 * @method once
	 * @memberOf keigai.Base
	 * @param  {String}   ev       Event name
	 * @param  {Function} listener Function to execute
	 * @param  {String}   id       [Optional] Listener ID
	 * @param  {String}   scope    [Optional] Listener scope, default is `this`
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.once( "event", function ( ev ) {
	 *   ...
	 * } );
	 */
	once ( ev, listener, id, scope ) {
		this.observer.once( ev, listener, id, scope || this );

		return this;
	}

	/**
	 * Removes an event listener
	 *
	 * @method removeEventListener
	 * @memberOf keigai.Base
	 * @param  {String} ev Event name
	 * @param  {String} id [Optional] Listener ID
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.removeListener( "event", "myHook" );
	 */
	removeEventListener ( ev, id ) {
		this.observer.off( ev, id );

		return this;
	}

	/**
	 * Removes an event listener
	 *
	 * @method removeListener
	 * @memberOf keigai.Base
	 * @param  {String} ev Event name
	 * @param  {String} id [Optional] Listener ID
	 * @return {Object} {@link keigai.Base}
	 * @example
	 * obj.removeListener( "event", "myHook" );
	 */
	removeListener ( ev, id ) {
		this.observer.off( ev, id );

		return this;
	}
}

/**
 * @namespace base
 * @private
 */
let base = {
	/**
	 * Base factory
	 *
	 * @memberOf base
	 * @method factory
	 * @return {Object} {@link keigai.Base}
	 */
	factory: () => {
		return new Base();
	}
};
