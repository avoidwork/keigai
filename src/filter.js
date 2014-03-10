/**
 * @namespace filter
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
	 * @param  {Number} debounce [Optional] Milliseconds to debounce, default is `250`
	 * @return {Object} {@link keigai.DataListFilter}
	 * @example
	 * var store  = keigai.store( [...] ),
	 *     list   = keigai.list( document.querySelector( "#list" ), store, "{{field}}" ),
	 *     filter = keigai.filter( document.querySelector( "input.filter" ), list, "field" );
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
 * @extends {keigai.Base}
 * @param  {Object} obj      Element to receive the filter
 * @param  {Object} list     {@link keigai.DataList}
 * @param  {Number} debounce [Optional] Milliseconds to debounce
 * @example
 * var store  = keigai.store( [...] ),
 *     list   = keigai.list( document.querySelector( "#list" ), store, "{{field}}" ),
 *     filter = keigai.filter( document.querySelector( "input.filter" ), list, "field" );
 */
function DataListFilter ( element, list, debounce ) {
	this.debounce = debounce;
	this.element  = element;
	this.filters  = {};
	this.list     = list;
	this.observer = observable.factory();
}

/**
 * Extending Base
 *
 * @memberOf keigai.DataListFilter
 * @type {Object} {@link keigai.Base}
 */
DataListFilter.prototype = base.factory();

/**
 * Setting constructor loop
 *
 * @method constructor
 * @memberOf keigai.DataListFilter
 * @type {Function}
 * @private
 */
DataListFilter.prototype.constructor = DataListFilter;

/**
 * Set the filters
 *
 * Create an object based on comma separated key string
 *
 * @method set
 * @memberOf keigai.DataListFilter
 * @param  {String} fields Comma separated filters
 * @return {Object} {@link keigai.DataListFilter}
 * @example
 * filter.set( "firstName, lastName, email" );
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
 * Removes listeners, and DOM hooks to avoid memory leaks
 *
 * @method teardown
 * @memberOf keigai.DataListFilter
 * @return {Object} {@link keigai.DataListFilter}
 * @example
 * filter.teardown();
 */
DataListFilter.prototype.teardown = function () {
	this.observer.unhook( this.element, "keyup" );
	this.observer.unhook( this.element, "input" );

	return this;
};

/**
 * Applies the input value as a filter against the DataList based on specific fields
 *
 * @method update
 * @memberOf keigai.DataListFilter
 * @fires keigai.DataList#beforeFilter Fires before filter
 * @fires keigai.DataList#afterFilter Fires after filter
 * @return {Object} {@link keigai.DataListFilter}
 * @example
 * filter.update(); // Debounced execution
 */
DataListFilter.prototype.update = function () {
	var self = this;

	utility.defer( function () {
		var val = element.val( self.element ).toString();
		
		self.list.dispatch( "beforeFilter", self.element, val );

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
		self.list.refresh();

		self.list.dispatch( "afterFilter", self.element );
	}, this.debounce, this.element.id + "Debounce");

	return this;
};
