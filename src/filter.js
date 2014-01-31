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
	 * @param  {Object} obj      Element to receive the filter
	 * @param  {Object} datalist Data list linked to the data store
	 * @param  {String} filters  Comma delimited string of fields to filter by
	 * @param  {Number} debounce [Optional] Milliseconds to debounce
	 * @return {Object} {@link keigai.DataListFilter}
	 */
	factory : function ( obj, datalist, filters, debounce ) {
		var ref = [datalist];

		debounce = debounce || 250;

		if ( !( obj instanceof Element ) || ( datalist && !datalist.store ) || ( typeof filters != "string" || string.isEmpty( filters ) ) ) {
			throw new Error( label.invalidArguments );
		}

		return new DataListFilter( obj, ref[0], debounce ).set( filters ).init();
	}
};

/**
 * Creates a new DataListFilter
 *
 * @constructor
 * @memberOf keigai
 * @param  {Object} obj      Element to receive the filter
 * @param  {Object} datalist Data list linked to the data store
 * @param  {Number} debounce [Optional] Milliseconds to debounce
 */
function DataListFilter ( element, datalist, debounce ) {
	this.element  = element;
	this.datalist = datalist;
	this.debounce = debounce;
	this.filters  = {};
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
 * Initiate all event listeners
 *
 * @method init
 * @memberOf keigai.DataListFilter
 * @return {Object} {@link keigai.DataListFilter}
 */
DataListFilter.prototype.init = function () {
	observer.add( this.element, "keyup", this.update, "filter", this );
	observer.add( this.element, "input", this.update, "value",  this );

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
	observer.remove( this.element, "keyup", "filter" );
	observer.remove( this.element, "input", "value" );

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

			self.datalist.filter = self.filters;
		}
		else {
			self.datalist.filter = null;
		}

		self.datalist.pageIndex = 1;
		self.datalist.refresh( true, true );
	}, this.debounce, this.element.id + "Debounce");

	return this;
};
