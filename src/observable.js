/**
 * Observable factory
 *
 * @method observable
 * @private
 * @param  {Number} arg Maximum listeners, default is 10
 * @return {Object} {@link Observable}
 */
function observable ( arg ) {
	return new Observable( arg );
}

/**
 * Observable
 *
 * @constructor
 * @private
 * @param  {Number} arg Maximum listeners, default is 10
 */
function Observable ( arg ) {
	this.limit     = arg || 10;
	this.listeners = {};
}

// Prototype loop
Observable.prototype.constructor = Observable;

/**
 * Dispatches an event, with optional arguments
 *
 * @method dispatch
 * @memberOf Observable
 * @return {Object} {@link Observable}
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
 * @memberOf Observable
 * @param {String} ev Event name
 * @param {String} id [Optional] Listener ID
 * @return {Object} {@link Observable}
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
 * @memberOf Observer
 * @param  {String}   ev      Event name
 * @param  {Function} handler Handler
 * @param  {String}   id      [Optional] Handler ID
 * @param  {String}   scope   [Optional] Handler scope, default is `this`
 * @return {Object} {@link Observable}
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
 * @memberOf Observer
 * @param  {String}   ev      Event name
 * @param  {Function} handler Handler
 * @param  {String}   id      [Optional] Handler ID
 * @param  {String}   scope   [Optional] Handler scope, default is `this`
 * @return {Object} {@link Observable}
 */
Observable.prototype.once = function ( ev, handler, id, scope  ) {
	var self = this;

	id    = id    || utility.uuid();
	scope = scope || this;

	return this.on( ev, function () {
		handler.apply( [scope].concat( array.cast( arguments ) ) );
		self.off( ev, id );
	}, id, scope );
};
