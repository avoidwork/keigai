class Observable {
	/**
	 * Creates a new Observable
	 *
	 * @constructor
	 * @memberOf keigai
	 * @param  {Number} arg Maximum listeners, default is 10
	 * @example
	 * let observer = keigai.util.observer( 50 );
	 */
	constructor ( arg=MAX ) {
		this.limit = arg;
		this.listeners = {};
		this.hooks = new WeakMap();
	}

	/**
	 * Dispatches an event, with optional arguments
	 *
	 * @method dispatch
	 * @memberOf keigai.Observable
	 * @return {Object} {@link keigai.Observable}
	 * @example
	 * observer.dispatch( "event", ... );
	 */
	dispatch ( ev, ...args ) {
		if ( ev && this.listeners[ ev ] ) {
			utility.iterate( this.listeners[ ev ], ( i ) => {
				i.handler.apply( i.scope, args );
			} );
		}

		return this;
	}

	/**
	 * Hooks into `target` for a DOM event
	 *
	 * @method hook
	 * @memberOf keigai.Observable
	 * @param  {Object} target Element
	 * @param  {String} ev     Event
	 * @return {Object}        Element
	 * @example
	 * observer.hook( document.querySelector( "a" ), "click" );
	 */
	hook ( target, ev ) {
		if ( typeof target.addEventListener !== "function" ) {
			throw new Error( label.invalidArguments );
		}

		let obj = this.hooks.get( target ) || {};

		obj[ ev ] = ( arg ) => {
			this.dispatch( ev, arg );
		};

		this.hooks.set( target, obj );
		target.addEventListener( ev, this.hooks.get( target )[ev], false );

		return target;
	}

	/**
	 * Removes all, or a specific listener for an event
	 *
	 * @method off
	 * @memberOf keigai.Observable
	 * @param {String} ev Event name
	 * @param {String} id [Optional] Listener ID
	 * @return {Object} {@link keigai.Observable}
	 * @example
	 * observer.off( "click", "myHook" );
	 */
	off ( ev, id ) {
		if ( this.listeners[ ev ] ) {
			if ( id ) {
				delete this.listeners[ ev ][ id ];
			} else {
				delete this.listeners[ ev ];
			}
		}

		return this;
	}

	/**
	 * Adds a listener for an event
	 *
	 * @method on
	 * @memberOf keigai.Observable
	 * @param  {String}   ev      Event name
	 * @param  {Function} handler Handler
	 * @param  {String}   id      [Optional] Handler ID
	 * @param  {String}   scope   [Optional] Handler scope, default is `this`
	 * @return {Object} {@link keigai.Observable}
	 * @example
	 * observer.on( "click", function ( ev ) {
	 *   ...
	 * }, "myHook" );
	 */
	on ( ev, handler, id=utility.uuid(), scope ) {
		if ( !this.listeners[ ev ] ) {
			this.listeners[ ev ] = {};
		}

		if ( array.keys( this.listeners[ ev ] ).length >= this.limit ) {
			throw( new Error( "Possible memory leak, more than " + this.limit + " listeners for event: " + ev ) );
		}

		this.listeners[ ev ][ id ] = { scope: scope || this, handler: handler };

		return this;
	}

	/**
	 * Adds a short lived listener for an event
	 *
	 * @method once
	 * @memberOf keigai.Observable
	 * @param  {String}   ev      Event name
	 * @param  {Function} handler Handler
	 * @param  {String}   id      [Optional] Handler ID
	 * @param  {String}   scope   [Optional] Handler scope, default is `this`
	 * @return {Object} {@link keigai.Observable}
	 * @example
	 * observer.once( "click", function ( ev ) {
	 *   ...
	 * } );
	 */
	once ( ev, handler, id=utility.uuid(), scope ) {
		scope = scope || this;

		return this.on( ev, ( ...args ) => {
			handler.apply( scope, args );
			this.off( ev, id );
		}, id, scope );
	}

	/**
	 * Unhooks from `target` for a DOM event
	 *
	 * @method unhook
	 * @memberOf keigai.Observable
	 * @param  {Object} target Element
	 * @param  {String} ev     Event
	 * @return {Object}        Element
	 * @example
	 * observer.unhook( document.querySelector( "a" ), "click" );
	 */
	unhook ( target, ev ) {
		let obj = this.hooks.get( target );

		if ( obj ) {
			target.removeEventListener( ev, obj[ ev ], false );
			delete obj[ ev ];

			if ( array.keys( obj ).length === 0 ) {
				this.hooks.delete( target );
			}
			else {
				this.hooks.set( target, obj );
			}
		}

		return target;
	}
}

/**
 * @namespace observable
 */
let observable = {
	/**
	 * Observable factory
	 *
	 * @method factory
	 * @memberOf observable
	 * @return {Object} {@link keigai.Observable}
	 * @example
	 * let observer = keigai.util.observer( 50 );
	 */
	factory: ( arg ) => {
		return new Observable( arg );
	}
};
