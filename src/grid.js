class DataGrid extends Base {
	/**
	 * Creates a new DataGrid
	 *
	 * @constructor
	 * @memberOf keigai
	 * @extends {keigai.Base}
	 * @param  {Object}  target   Element to receive DataGrid
	 * @param  {Object}  store    DataStore
	 * @param  {Array}   fields   Array of fields to display
	 * @param  {Array}   sortable [Optional] Array of sortable columns/fields
	 * @param  {Object}  options  [Optional] DataList options
	 * @param  {Boolean} filtered [Optional] Create an input to filter the DataGrid
	 * @example
	 * let fields  = ["name", "age"],
	 *     options = {pageSize: 5, order: "age desc, name"},
	 *     store   = keigai.store( [...] ),
	 *     grid    = keigai.grid( document.querySelector( "#grid" ), store, fields, fields, options, true );
	 */
	constructor ( target, store, fields, sortable=[], options={}, filtered=false ) {
		super();

		let sortOrder;

		if ( options.order && !string.isEmpty( options.order ) ) {
			sortOrder = string.explode( options.order ).map( function ( i ) {
				return i.replace( regex.after_space, "" );
			} );
		}

		this.element = element.create( "section", { "class": "grid" }, target );
		this.fields = fields;
		this.filtered = filtered;
		this.list = null;
		this.observer = observable();
		this.options = options;
		this.store = store;
		this.sortable = sortable;
		this.sortOrder = sortOrder || sortable;
	}

	/**
	 * Adds an item to the DataGrid
	 *
	 * @method add
	 * @memberOf keigai.DataGrid
	 * @param {Object} record New DataStore record (shapes should match)
	 * @return {Object}       {@link keigai.DataGrid}
	 * @example
	 * grid.add( {name: "John Doe", age: 34} );
	 */
	add ( record ) {
		this.store.set( null, record ).then( null, ( e ) => {
			utility.error( e );
			this.dispatch( "error", e );
		} );

		return this;
	}

	/**
	 * Exports data grid records
	 *
	 * @method dump
	 * @memberOf keigai.DataGrid
	 * @return {Array} Record set
	 * @example
	 * let data = grid.dump();
	 */
	dump () {
		return this.store.dump( this.list.records, this.fields );
	}

	/**
	 * Refreshes the DataGrid
	 *
	 * @method refresh
	 * @memberOf keigai.DataGrid
	 * @fires keigai.DataGrid#beforeRefresh Fires before refresh
	 * @fires keigai.DataGrid#afterRefresh Fires after refresh
	 * @return {Object} {@link keigai.DataGrid}
	 * @example
	 * grid.refresh();
	 */
	refresh () {
		let sort = [];
		this.dispatch( "beforeRefresh", this.element );

		if ( this.sortOrder.length > 0 ) {
			array.each( this.sortOrder, ( i ) => {
				let obj = element.find( this.element, ".header span[data-field='" + i + "']" )[ 0 ];

				sort.push( string.trim( i + " " + ( element.data( obj, "sort" ) || "" ) ) );
			} );

			this.options.order = this.list.order = sort.join( ", " );
		}

		this.list.where = null;
		utility.merge( this.list, this.options );
		this.list.refresh();
		this.dispatch( "afterRefresh", this.element );

		return this;
	}

	/**
	 * Removes an item from the DataGrid
	 *
	 * @method remove
	 * @memberOf keigai.DataGrid
	 * @param {Mixed} record Record, key or index
	 * @return {Object} {@link keigai.DataGrid}
	 * @example
	 * grid.remove( "key" );
	 */
	remove ( record ) {
		this.store.del( record ).then( null, ( e ) => {
			utility.error( e );
			this.dispatch( "error", e );
		} );

		return this;
	}

	/**
	 * Sorts the DataGrid when a column header is clicked
	 *
	 * @method sort
	 * @memberOf keigai.DataGrid
	 * @param  {Object} ev Event
	 * @return {Object} {@link keigai.DataGrid}
	 */
	sort ( ev ) {
		let target = utility.target( ev );
		let field;

		// Stopping event propogation
		utility.stop( ev );

		// Refreshing list if target is sortable
		if ( element.hasClass( target, "sortable" ) ) {
			field = element.data( target, "field" );
			element.data( target, "sort", element.data( target, "sort" ) === "asc" ? "desc" : "asc" );
			array.remove( this.sortOrder, field );
			this.sortOrder.splice( 0, 0, field );
			this.refresh();
		}

		return this;
	}

	/**
	 * Tears down the DataGrid
	 *
	 * @method teardown
	 * @memberOf keigai.DataGrid
	 * @return {Object} {@link keigai.DataGrid}
	 * @example
	 * grid.teardown();
	 */
	teardown () {
		this.observer.unhook( element.find( this.element, "ul.header" )[ 0 ], "click" );
		this.list.teardown();
		element.destroy( this.element );
		this.element = null;

		return this;
	}

	/**
	 * Updates an item in the DataGrid
	 *
	 * @method update
	 * @memberOf keigai.DataGrid
	 * @param {Mixed}  key  Key or index
	 * @param {Object} data New property values
	 * @return {Object}     {@link keigai.DataGrid}
	 * @example
	 * grid.update( "key", {name: "Jim Smith"} );
	 */
	update ( key, data ) {
		this.store.update( key, data ).then( null, ( e ) => {
			utility.error( e );
			this.dispatch( "error", e );
		} );

		return this;
	};
}

/**
 * DataGrid factory
 *
 * @method factory
 * @memberOf grid
 * @fires keigai.DataGrid#change Fires when the DOM changes
 * @param  {Object}  target      Element to receive DataGrid
 * @param  {Object}  store       DataStore
 * @param  {Array}   fields      Array of fields to display
 * @param  {Array}   sortable    [Optional] Array of sortable columns/fields
 * @param  {Object}  options     [Optional] DataList options
 * @param  {Boolean} filtered    [Optional] Create an input to filter the data grid
 * @param  {Number}  debounce    [Optional] DataListFilter input debounce, default is 250
 * @return {Object} {@link keigai.DataGrid}
 * @example
 * let fields  = ["name", "age"],
 *     options = {pageSize: 5, order: "age desc, name"},
 *     store   = keigai.store(),
 *     grid    = keigai.grid( document.querySelector( "#grid" ), store, fields, fields, options, true );
 *
 * store.setUri( "data.json" ).then( null, function ( e ) {
 *   ...
 * } );
 */
let grid = function ( target, store, fields, sortable, options, filtered, debounce=250 ) {
	let ref = [ store ];
	let obj = new DataGrid( target, ref[ 0 ], fields, sortable, options, filtered );
	let template = "";
	let header = element.create( "li", {}, element.create( "ul", { "class": "header" }, obj.element ) );
	let width = ( 100 / obj.fields.length ) + "%";
	let css = "display:inline-block;width:" + width;
	let sort = obj.options.order ? string.explode( obj.options.order ) : [];

	// Creating DataList template based on fields
	array.each( obj.fields, function ( i ) {
		let trimmed = i.replace( /.*\./g, "" );
		let el = element.create( "span", {
			innerHTML: string.capitalize( string.unCamelCase( string.unhyphenate( trimmed, true ) ).replace( /_|-/g, " " ), true ),
			style: css,
			"data-field": i
		}, header );

		// Adding CSS class if "column" is sortable
		if ( array.contains( obj.sortable, i ) ) {
			element.addClass( el, "sortable" );

			// Applying default sort, if specified
			if ( sort.filter( function ( x ) { return ( x.indexOf( i ) === 0 ); } ).length > 0 ) {
				element.data( el, "sort", array.contains( sort, i + " desc" ) ? "desc" : "asc" );
			}
		}

		template += "<span class=\"" + i + "\" data-field=\"" + i + "\" style=\"" + css + "\">{{" + i + "}}</span>";
	} );

	// Setting click handler on sortable "columns"
	if ( obj.sortable.length > 0 ) {
		obj.observer.hook( header.parentNode, "click", obj.sort, "sort", obj );
	}

	if ( obj.filtered === true ) {
		obj.options.listFiltered = true;
		obj.options.listFilter = obj.fields.join( "," );
	}

	obj.options.debounce = debounce;

	// Creating DataList
	ref.push( list.factory( obj.element, ref[ 0 ], template, obj.options ) );

	// Setting by-reference DataList on DataGrid
	obj.list = ref[ 1 ];

	// Setting up a chain of Events
	obj.on( "beforeRefresh", function ( arg ) {
		element.dispatch( arg, "beforeRefresh" );
	}, "bubble" );

	obj.on( "afterRefresh", function ( arg ) {
		element.dispatch( arg, "afterRefresh" );
	}, "bubble" );

	obj.on( "click", function ( e ) {
		if ( element.hasClass( e.currentTarget, "header" ) ) {
			obj.sort( e );
		}
	}, "header" );

	obj.list.on( "change", function ( ...args ) {
		obj.dispatch.apply( obj, [ "change" ].concat( args ) );
	}, "change" );

	obj.list.on( "beforeFilter", function ( ...args ) {
		obj.dispatch.apply( obj, [ "beforeFilter" ].concat( args ) );
	}, "beforeFilter" );

	obj.list.on( "afterFilter", function ( ...args ) {
		obj.dispatch.apply( obj, [ "afterFilter" ].concat( args ) );
	}, "afterFilter" );

	return obj;
};
