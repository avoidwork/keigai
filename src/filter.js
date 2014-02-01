/**
 * @namespace filter
 * @private
 */
var filter = {
	/**
	 * DataListFilter factory
	 *
	 * @method factory
	 * @memberOf filter
	 * @param  {Object} target   Element to receive the filter
	 * @param  {Object} list     {@link keigai.DataList}
	 * @param  {String} filters  Comma delimited string of fields to filter by
	 * @param  {Number} debounce [Optional] Milliseconds to debounce
	 * @return {Object} {@link keigai.DataListFilter}
	 */
	factory : function ( target, list, filters, debounce ) {
		var ref = [list],
		    obj;

		debounce = debounce || 250;

		if ( !( target instanceof Element ) || ( list && !list.store ) || ( typeof filters != "string" || string.isEmpty( filters ) ) ) {
			throw new Error( label.invalidArguments );
		}

		obj = new DataListFilter( target, ref[0], debounce ).set( filters );

		// Setting up a chain of Events
		obj.observer.hook( obj.element, "keyup" );
		obj.observer.hook( obj.element, "input" );
		obj.on( "keyup", obj.update, "keyup" );
		obj.on( "input", obj.update, "input" );

		return obj;
	}
};

/**
 * Creates a new DataListFilter
 *
 * @constructor
 * @memberOf keigai
 * @param  {Object} obj      Element to receive the filter
 * @param  {Object} list     {@link keigai.DataList}
 * @param  {Number} debounce [Optional] Milliseconds to debounce
 */
function DataListFilter ( element, list, debounce ) {
	this.element  = element;
	this.list     = list;
	this.debounce = debounce;
	this.filters  = {};
	this.observer = new Observable();
}

/**
 * Setting constructor loop
 *
 * @method constructor
 * @memberOf keigai.DataListFilter
 * @type {Function}
 */
DataListFilter.prototype.constructor = DataListFilter;

/**
 * Adds an event listener
 *
 * @method addListener
 * @memberOf keigai.DataListFilter
 * @param  {String}   ev       Event name
 * @param  {Function} listener Function to execute
 * @param  {String}   id       [Optional] Listener ID
 * @param  {String}   scope    [Optional] Listener scope, default is `this`
 * @return {Object} {@link keigai.DataListFilter}
 */
DataListFilter.prototype.addListener = function ( ev, listener, id, scope ) {
	this.observer.on( ev, listener, id, scope || this );

	return this;
};

/**
 * Dispatches an event, with optional arguments
 *
 * @method emit
 * @memberOf keigai.DataListFilter
 * @return {Object} {@link keigai.DataListFilter}
 */
DataListFilter.prototype.dispatch = function () {
	this.observer.dispatch.apply( this.observer, [].concat( array.cast( arguments ) ) );

	return this;
};

/**
 * Dispatches an event, with optional arguments
 *
 * @method emit
 * @memberOf keigai.DataListFilter
 * @return {Object} {@link keigai.DataListFilter}
 */
DataListFilter.prototype.emit = function () {
	this.observer.dispatch.apply( this.observer, [].concat( array.cast( arguments ) ) );

	return this;
};

/**
 * Gets listeners
 *
 * @method listeners
 * @memberOf keigai.DataListFilter
 * @param  {String} ev [Optional] Event name
 * @return {Object} Listeners
 */
DataListFilter.prototype.listeners = function ( ev ) {
	return ev ? this.observer.listeners[ev] : this.listeners;
};

/**
 * Removes an event listener
 *
 * @method off
 * @memberOf keigai.DataListFilter
 * @param  {String} ev Event name
 * @param  {String} id [Optional] Listener ID
 * @return {Object} {@link keigai.DataListFilter}
 */
DataListFilter.prototype.off = function ( ev, id ) {
	this.observer.off( ev, id );

	return this;
};

/**
 * Adds an event listener
 *
 * @method on
 * @memberOf keigai.DataListFilter
 * @param  {String}   ev       Event name
 * @param  {Function} listener Function to execute
 * @param  {String}   id       [Optional] Listener ID
 * @param  {String}   scope    [Optional] Listener scope, default is `this`
 * @return {Object} {@link keigai.DataListFilter}
 */
DataListFilter.prototype.on = function ( ev, listener, id, scope ) {
	this.observer.on( ev, listener, id, scope || this );

	return this;
};

/**
 * Adds a short lived event listener
 *
 * @method once
 * @memberOf keigai.DataListFilter
 * @param  {String}   ev       Event name
 * @param  {Function} listener Function to execute
 * @param  {String}   id       [Optional] Listener ID
 * @param  {String}   scope    [Optional] Listener scope, default is `this`
 * @return {Object} {@link keigai.DataListFilter}
 */
DataListFilter.prototype.once = function ( ev, listener, id, scope ) {
	this.observer.once( ev, listener, id, scope || this );

	return this;
};

/**
 * Set the filters
 *
 * Create an object based on comma separated key string
 *
 * @method set
 * @memberOf keigai.DataListFilter
 * @param  {String} fields Comma separated filters
 * @return {Object} {@link keigai.DataListFilter}
 */
DataListFilter.prototype.set = function ( fields ) {
	var obj = {};

	array.each( string.explode( fields ), function ( v ) {
		obj[v] = "";
	} );

	this.filters = obj;

	return this;
};

/**
 * Cancel all event listeners
 *
 * @method teardown
 * @memberOf keigai.DataListFilter
 * @return {Object} {@link keigai.DataListFilter}
 */
DataListFilter.prototype.teardown = function () {
	this.observer.unhook( this.element, "keyup" );
	this.observer.unhook( this.element, "input" );

	return this;
};

/**
 * Update the results list
 *
 * @method update
 * @memberOf keigai.DataListFilter
 * @return {Object} {@link keigai.DataListFilter}
 */
DataListFilter.prototype.update = function () {
	var self = this;

	utility.defer( function () {
		var val = element.val( self.element ).toString();
		
		self.dispatch( "beforeFilter", self.element );

		if ( !string.isEmpty( val ) ) {
			utility.iterate( self.filters, function ( v, k ) {
				var queries = string.explode( val );

				// Ignoring trailing commas
				queries = queries.filter( function ( i ) {
					return !string.isEmpty( i );
				} );

				// Shaping valid pattern
				array.each( queries, function ( i, idx ) {
					this[idx] = "^.*" + string.escape( i ).replace( /(^\*|\*$)/g, "" ).replace( /\*/g, ".*" ) + ".*";
				} );

				this[k] = queries.join( "," );
			} );

			self.list.filter = self.filters;
		}
		else {
			self.list.filter = null;
		}

		self.list.pageIndex = 1;
		self.list.refresh( true, true );

		self.dispatch( "afterFilter", self.element );
	}, this.debounce, this.element.id + "Debounce");

	return this;
};
