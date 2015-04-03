class DataListFilter extends Base {
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
	 * let store  = keigai.store( [...] ),
	 *     list   = keigai.list( document.querySelector( "#list" ), store, "{{field}}" ),
	 *     filter = keigai.filter( document.querySelector( "input.filter" ), list, "field" );
	 */
	constructor ( element, list, debounce ) {
		this.debounce = debounce;
		this.element = element;
		this.filters = {};
		this.list = list;
		this.observer = observable.factory();
	}

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
	set ( fields ) {
		this.filters = {};
		array.each( string.explode( fields ), ( v ) => {
			this.filters[ v ] = "";
		} );

		return this;
	}

	/**
	 * Removes listeners, and DOM hooks to avoid memory leaks
	 *
	 * @method teardown
	 * @memberOf keigai.DataListFilter
	 * @return {Object} {@link keigai.DataListFilter}
	 * @example
	 * filter.teardown();
	 */
	teardown () {
		this.observer.unhook( this.element, "keyup" );
		this.observer.unhook( this.element, "input" );
		this.element = null;

		return this;
	}

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
	update () {
		utility.defer( () => {
			let val = element.val( this.element ).toString();

			this.list.dispatch( "beforeFilter", this.element, val );

			if ( !string.isEmpty( val ) ) {
				utility.iterate( this.filters, ( v, k ) => {
					let queries = string.explode( val );

					// Ignoring trailing commas
					queries = queries.filter( ( i ) => {
						return !string.isEmpty( i );
					} );

					// Shaping valid pattern
					array.each( queries, ( i, idx ) => {
						queries[ idx ] = "^.*" + string.escape( i ).replace( /(^\*|\*$)/g, "" ).replace( /\*/g, ".*" ) + ".*";
					} );

					this.filters[ k ] = queries.join( "," );
				} );

				this.list.filter = this.filters;
			} else {
				this.list.filter = null;
			}

			this.list.pageIndex = 1;
			this.list.refresh();
			this.list.dispatch( "afterFilter", this.element );
		}, this.debounce, this.element.id + "Debounce" );

		return this;
	}
}

/**
 * @namespace filter
 */
let filter = {
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
	 * let store  = keigai.store( [...] ),
	 *     list   = keigai.list( document.querySelector( "#list" ), store, "{{field}}" ),
	 *     filter = keigai.filter( document.querySelector( "input.filter" ), list, "field" );
	 */
	factory: ( target, list, filters, debounce=250 ) => {
		let ref = [ list ];
		let obj = new DataListFilter( target, ref[ 0 ], debounce ).set( filters );

		// Decorating `target` with the appropriate input `type`
		element.attr( target, "type", "text" );

		// Setting up a chain of Events
		obj.observer.hook( obj.element, "keyup" );
		obj.observer.hook( obj.element, "input" );
		obj.on( "keyup", obj.update, "keyup" );
		obj.on( "input", obj.update, "input" );

		return obj;
	}
};
