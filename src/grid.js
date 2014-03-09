/**
 * @namespace grid
 */
var grid = {
	/**
	 * DataGrid factory
	 *
	 * @method factory
	 * @memberOf grid
	 * @fires DataGrid#change Fires when the DOM changes
	 * @param  {Object}  target      Element to receive DataGrid
	 * @param  {Object}  store       DataStore
	 * @param  {Array}   fields      Array of fields to display
	 * @param  {Array}   sortable    [Optional] Array of sortable columns/fields
	 * @param  {Object}  options     [Optional] DataList options
	 * @param  {Boolean} filtered    [Optional] Create an input to filter the data grid
	 * @param  {Number}  debounce    [Optional] DataListFilter input debounce, default is 250
	 * @return {Object} {@link keigai.DataGrid}
	 */
	factory : function ( target, store, fields, sortable, options, filtered, debounce ) {
		var ref = [store],
		    obj, template, header, width, css, sort;

		obj       = new DataGrid( target, ref[0], fields, sortable, options, filtered );
		template  = "";
		header    = element.create( "li", {}, element.create( "ul", {"class": "header"}, obj.element ) );
		width     = ( 100 / obj.fields.length ) + "%";
		css       = "display:inline-block;width:" + width;
		sort      = obj.options.order ? string.explode( obj.options.order ) : [];

		// Creating DataList template based on fields
		array.each( obj.fields, function ( i ) {
			var trimmed = i.replace( /.*\./g, "" ),
			    el      = element.create( "span", {innerHTML: string.capitalize( string.unCamelCase( string.unhyphenate( trimmed, true ) ), true ), style: css, "data-field": i}, header );

			// Adding CSS class if "column" is sortable
			if ( array.contains( obj.sortable, i ) ) {
				element.klass( el, "sortable", true );

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

		// Creating DataList
		ref.push( list.factory( obj.element, ref[0], template, obj.options ) );

		// Setting by-reference DataList on DataGrid
		obj.list = ref[1];

		if ( obj.filtered === true ) {
			// Creating DataListFilter
			ref.push( filter.factory( element.create( "input", {"class": "filter", placeholder: "Filter"}, obj.element, "first" ), ref[1], obj.fields.join( "," ), debounce || 250 ) );
			
			// Setting by-reference DataListFilter on DataGrid
			obj.filter = ref[2];
		}

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

		obj.list.on( "change", function () {
			obj.dispatch.apply( obj, ["change"].concat( array.cast( arguments ) ) );
		}, "change" );

		obj.list.on( "beforeFilter", function () {
			obj.dispatch.apply( obj, ["beforeFilter"].concat( array.cast( arguments ) ) );
		}, "beforeFilter" );

		obj.list.on( "afterFilter", function () {
			obj.dispatch.apply( obj, ["afterFilter"].concat( array.cast( arguments ) ) );
		}, "afterFilter" );

		return obj;
	}
};

/**
 * Creates a new DataGrid
 *
 * @constructor
 * @memberOf keigai
 * @param  {Object}  target   Element to receive DataGrid
 * @param  {Object}  store    DataStore
 * @param  {Array}   fields   Array of fields to display
 * @param  {Array}   sortable [Optional] Array of sortable columns/fields
 * @param  {Object}  options  [Optional] DataList options
 * @param  {Boolean} filtered [Optional] Create an input to filter the DataGrid
 */
function DataGrid ( target, store, fields, sortable, options, filtered ) {
	var sortOrder;

	if ( options.order && !string.isEmpty( options.order ) ) {
		sortOrder = string.explode( options.order ).map( function ( i ) {
			return i.replace( regex.after_space, "" );
		} );
	}

	this.element   = element.create( "section", {"class": "grid"}, target );
	this.fields    = fields;
	this.filter    = null;
	this.filtered  = filtered === true;
	this.list      = null;
	this.observer  = new Observable();
	this.options   = options   || {};
	this.store     = store;
	this.sortable  = sortable  || [];
	this.sortOrder = sortOrder || sortable || [];
}

/**
 * Setting constructor loop
 *
 * @method constructor
 * @memberOf keigai.DataGrid
 * @type {Function}
 */
DataGrid.prototype.constructor = DataGrid;

/**
 * Adds an event listener
 *
 * @method addListener
 * @memberOf keigai.DataGrid
 * @param  {String}   ev       Event name
 * @param  {Function} listener Function to execute
 * @param  {String}   id       [Optional] Listener ID
 * @param  {String}   scope    [Optional] Listener scope, default is `this`
 * @return {Object} {@link keigai.DataGrid}
 */
DataGrid.prototype.addListener = function ( ev, listener, id, scope ) {
	this.observer.on( ev, listener, id, scope || this );

	return this;
};

/**
 * Dispatches an event, with optional arguments
 *
 * @method emit
 * @memberOf keigai.DataGrid
 * @return {Object} {@link keigai.DataGrid}
 */
DataGrid.prototype.dispatch = function () {
	this.observer.dispatch.apply( this.observer, [].concat( array.cast( arguments ) ) );

	return this;
};

/**
 * Exports data grid records
 *
 * @method dump
 * @memberOf keigai.DataGrid
 * @return {Array} Record set
 */
DataGrid.prototype.dump = function () {
	return this.store.dump( this.list.records, this.fields );
};

/**
 * Dispatches an event, with optional arguments
 *
 * @method emit
 * @memberOf keigai.DataGrid
 * @return {Object} {@link keigai.DataGrid}
 */
DataGrid.prototype.emit = function () {
	this.observer.dispatch.apply( this.observer, [].concat( array.cast( arguments ) ) );

	return this;
};

/**
 * Gets listeners
 *
 * @method listeners
 * @memberOf keigai.DataGrid
 * @param  {String} ev [Optional] Event name
 * @return {Object} Listeners
 */
DataGrid.prototype.listeners = function ( ev ) {
	return ev ? this.observer.listeners[ev] : this.listeners;
};

/**
 * Removes an event listener
 *
 * @method off
 * @memberOf keigai.DataGrid
 * @param  {String} ev Event name
 * @param  {String} id [Optional] Listener ID
 * @return {Object} {@link keigai.DataGrid}
 */
DataGrid.prototype.off = function ( ev, id ) {
	this.observer.off( ev, id );

	return this;
};

/**
 * Adds an event listener
 *
 * @method on
 * @memberOf keigai.DataGrid
 * @param  {String}   ev       Event name
 * @param  {Function} listener Function to execute
 * @param  {String}   id       [Optional] Listener ID
 * @param  {String}   scope    [Optional] Listener scope, default is `this`
 * @return {Object} {@link keigai.DataGrid}
 */
DataGrid.prototype.on = function ( ev, listener, id, scope ) {
	this.observer.on( ev, listener, id, scope || this );

	return this;
};

/**
 * Adds a short lived event listener
 *
 * @method once
 * @memberOf keigai.DataGrid
 * @param  {String}   ev       Event name
 * @param  {Function} listener Function to execute
 * @param  {String}   id       [Optional] Listener ID
 * @param  {String}   scope    [Optional] Listener scope, default is `this`
 * @return {Object} {@link keigai.DataGrid}
 */
DataGrid.prototype.once = function ( ev, listener, id, scope ) {
	this.observer.once( ev, listener, id, scope || this );

	return this;
};

/**
 * Refreshes the DataGrid
 *
 * @method refresh
 * @memberOf keigai.DataGrid
 * @fires DataGrid#beforeRefresh Fires before refresh
 * @fires DataGrid#afterRefresh Fires after refresh
 * @return {Object} {@link keigai.DataGrid}
 */
DataGrid.prototype.refresh = function () {
	var sort = [],
	    self = this;

	this.dispatch( "beforeRefresh", this.element );

	if ( this.sortOrder.length > 0 ) {
		array.each( this.sortOrder, function ( i ) {
			var obj = element.find( self.element, ".header span[data-field='" + i + "']" )[0];

			sort.push( string.trim( i + " " + ( element.data( obj, "sort" ) || "" ) ) );
		} );

		this.options.order = this.list.order = sort.join( ", " );
	}

	this.list.where = null;
	utility.merge( this.list, this.options );
	this.list.refresh();

	this.dispatch( "afterRefresh", this.element );

	return this;
};

/**
 * Sorts the DataGrid when a column header is clicked
 *
 * @method sort
 * @memberOf keigai.DataGrid
 * @param  {Object} e Event
 * @return {Object} {@link keigai.DataGrid}
 */
DataGrid.prototype.sort = function ( e ) {
	var target = utility.target( e ),
	    field;

	// Stopping event propogation
	utility.stop( e );

	// Refreshing list if target is sortable
	if ( element.hasClass( target, "sortable" ) ) {
		field = element.data( target, "field" );
		element.data( target, "sort", element.data( target, "sort" ) === "asc" ? "desc" : "asc" );
		array.remove( this.sortOrder, field );
		this.sortOrder.splice( 0, 0, field );
		this.refresh();
	}

	return this;
};

/**
 * Tears down the DataGrid
 *
 * @method teardown
 * @memberOf keigai.DataGrid
 * @return {Object} {@link keigai.DataGrid}
 */
DataGrid.prototype.teardown = function () {
	if ( this.filter !== null ) {
		this.filter.teardown();
		this.filter = null;
	}

	this.list.teardown();
	this.observer.unhook( element.find( this.element, ".header" )[0], "click" );
	element.destroy( this.element );
	this.element = null;

	return this;
};
