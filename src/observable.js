/**
 * Creates a new Observable
 *
 * @constructor
 * @memberOf keigai
 * @param  {Number} arg Maximum listeners, default is 10
 */
function Observable ( arg ) {
	this.limit     = arg || MAX;
	this.listeners = {};
}

/**
 * Setting constructor loop
 *
 * @method constructor
 * @memberOf keigai.Observable
 * @type {Function}
 */
Observable.prototype.constructor = Observable;

/**
 * Dispatches an event, with optional arguments
 *
 * @method dispatch
 * @memberOf keigai.Observable
 * @return {Object} {@link keigai.Observable}
 */
Observable.prototype.dispatch = function () {
	var args = array.cast( arguments ),
	    ev   = args.shift();

	if ( ev && this.listeners[ev] ) {
		utility.iterate( this.listeners[ev], function ( i ) {
			i.handler.apply( i.scope, args );
		} );
	}

	return this;
};

/**
 * Removes all, or a specific listener for an event
 *
 * @method off
 * @memberOf keigai.Observable
 * @param {String} ev Event name
 * @param {String} id [Optional] Listener ID
 * @return {Object} {@link keigai.Observable}
 */
Observable.prototype.off = function ( ev, id ) {
	if ( this.listeners[ev] ) {
		if ( id ) {
			delete this.listeners[ev][id];
		}
		else {
			delete this.listeners[ev];
		}
	}

	return this;
};

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
 */
Observable.prototype.on = function ( ev, handler, id, scope ) {
	id    = id    || utility.uuid();
	scope = scope || this;

	if ( !this.listeners[ev] ) {
		this.listeners[ev] = {};
	}

	if ( array.keys( this.listeners[ev] ).length >= this.limit ) {
		throw( new Error( "Possible memory leak, more than " + this.limit + " listeners for event: " + ev ) );
	}

	this.listeners[ev][id] = {scope: scope, handler: handler};

	return this;
};

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
 */
Observable.prototype.once = function ( ev, handler, id, scope  ) {
	var self = this;

	id    = id    || utility.uuid();
	scope = scope || this;

	return this.on( ev, function () {
		handler.apply( scope, [].concat( array.cast( arguments ) ) );
		self.off( ev, id );
	}, id, scope );
};

/**
 * Watches `obj` for a DOM event
 *
 * @method watch
 * @memberOf keigai.Observable
 * @param  {Object} target Element
 * @param  {String} ev     Event
 * @return {Object}        Element
 */
Observable.prototype.watch = function ( target, ev ) {
	var self = this;

	if ( typeof target.addEventListener != "function" ) {
		throw new Error( label.invalidArguments );
	}
	else {
		target.addEventListener( ev, function ( arg ) {
			self.dispatch( ev, arg );
		} );
	}

	return target;
};
