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

/**
 * Dispatches an event, with optional arguments
 *
 * @method dispatch
 * @memberOf Observable
 * @return {Object} {@link Observable}
 */
Observable.prototype.dispatch = function () {
	return this;
};

/**
 * Returns a list of listeners
 *
 * @method list
 * @memberOf Observable
 * @param  {String} arg Event name
 * @return {Object}     List
 */
Observable.prototype.list = function ( arg ) {
	if ( arg ) {
		return this.listeners[arg];
	}
	else {
		return this.listeners;
	}
};

/**
 * Removes all, or a specific listener for an event
 *
 * @method off
 * @memberOf Observable
 * @param {String} event Event name
 * @param {String} id    [Optional] Listener ID
 * @return {Object} {@link Observable}
 */
Observable.prototype.off = function ( event, id ) {
	return this;
};

/**
 * Adds a listener for an event
 *
 * @method on
 * @memberOf Observer
 * @param  {String}   event   Event name
 * @param  {Function} handler Handler
 * @param  {String}   id      [Optional] Handler ID
 * @param  {String}   scope   [Optional] Handler scope, default is `this`
 * @return {Object} {@link Observable}
 */
Observable.prototype.on = function ( event, handler, id, scope ) {
	return this;
};

/**
 * Adds a short lived listener for an event
 *
 * @method once
 * @memberOf Observer
 * @param  {String}   event   Event name
 * @param  {Function} handler Handler
 * @param  {String}   id      [Optional] Handler ID
 * @param  {String}   scope   [Optional] Handler scope, default is `this`
 * @return {Object} {@link Observable}
 */
Observable.prototype.once = function ( event, handler, id, scope  ) {
	return this;
};
