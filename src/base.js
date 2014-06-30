/**
 * @namespace base
 * @private
 */
var base = {
	/**
	 * Base factory
	 *
	 * @memberOf base
	 * @method factory
	 * @return {Object} {@link keigai.Base}
	 */
	factory : function () {
		return new Base();
	}
};

/**
 * Base Object
 *
 * @constructor
 * @memberOf keigai
 */
function Base () {
	/**
	 * {@link keigai.Observable}
	 *
	 * @abstract
	 * @type {Object}
	 */
	this.observer = null;
}

/**
 * Setting constructor loop
 *
 * @method constructor
 * @memberOf keigai.Base
 * @type {Function}
 * @private
 */
Base.prototype.constructor = Base;

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
Base.prototype.addEventListener = function ( ev, listener, id, scope ) {
	this.observer.on( ev, listener, id, scope || this );

	return this;
};

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
Base.prototype.addListener = function ( ev, listener, id, scope ) {
	this.observer.on( ev, listener, id, scope || this );

	return this;
};

/**
 * Dispatches an event, with optional arguments
 *
 * @method dispatch
 * @memberOf keigai.Base
 * @return {Object} {@link keigai.Base}
 * @example
 * obj.dispatch( "event", ... );
 */
Base.prototype.dispatch = function () {
	this.observer.dispatch.apply( this.observer, [].concat( array.cast( arguments ) ) );

	return this;
};

/**
 * Dispatches an event, with optional arguments
 *
 * @method dispatchEvent
 * @memberOf keigai.Base
 * @return {Object} {@link keigai.Base}
 * @example
 * obj.dispatchEvent( "event", ... );
 */
Base.prototype.dispatchEvent = function () {
	this.observer.dispatch.apply( this.observer, [].concat( array.cast( arguments ) ) );

	return this;
};

/**
 * Dispatches an event, with optional arguments
 *
 * @method emit
 * @memberOf keigai.Base
 * @return {Object} {@link keigai.Base}
 * @example
 * obj.emit( "event", ... );
 */
Base.prototype.emit = function () {
	this.observer.dispatch.apply( this.observer, [].concat( array.cast( arguments ) ) );

	return this;
};

/**
 * Hooks into `target` for an event
 *
 * @method hook
 * @memberOf keigai.Base
 * @return {Object} {@link keigai.Base}
 * @example
 * obj.hook( document.querySelector( "a" ), "click" );
 */
Base.prototype.hook = function () {
	this.observer.hook.apply( this.observer, [].concat( array.cast( arguments ) ) );

	return this;
};

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
Base.prototype.listeners = function ( ev ) {
	return ev ? this.observer.listeners[ev] : this.listeners;
};

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
Base.prototype.off = function ( ev, id ) {
	this.observer.off( ev, id );

	return this;
};

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
Base.prototype.on = function ( ev, listener, id, scope ) {
	this.observer.on( ev, listener, id, scope || this );

	return this;
};

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
Base.prototype.once = function ( ev, listener, id, scope ) {
	this.observer.once( ev, listener, id, scope || this );

	return this;
};

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
Base.prototype.removeEventListener = function ( ev, id ) {
	this.observer.off( ev, id );

	return this;
};

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
Base.prototype.removeListener = function ( ev, id ) {
	this.observer.off( ev, id );

	return this;
};
