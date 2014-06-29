/**
 * @namespace list
 */
var list = {
	/**
	 * Creates an instance of DataList
	 *
	 * @method factory
	 * @memberOf list
	 * @fires keigai.DataList#change Fires when the DOM changes
	 * @param  {Object} target   Element to receive the DataList
	 * @param  {Object} store    {@link keigai.DataStore}
	 * @param  {Mixed}  template Record field, template ( $.tpl ), or String, e.g. "<p>this is a {{field}} sample.</p>", fields are marked with {{ }}
	 * @param  {Object} options  Optional parameters to set on the DataList
	 * @return {Object} {@link keigai.DataList}
	 * @example
	 * var store = keigai.store( [...] ),
	 *     list  = keigai.list( document.querySelector("#list"), store, "{{name}}", {order: "name"} );
	 */
	factory : function ( target, store, template, options ) {
		var ref = [store],
		    obj;

		if ( !( target instanceof Element ) || typeof store != "object" || !regex.string_object.test( typeof template ) ) {
			throw new Error( label.invalidArguments );
		}

		// Creating instance
		obj = new DataList( element.create( "ul", {"class": "list"}, target ), ref[0], template );

		if ( options instanceof Object ) {
			utility.merge( obj, options );
		}

		obj.store.lists.push( obj );

		// Setting up a chain of Events
		obj.on( "beforeRefresh", function ( arg ) {
			element.dispatch( arg, "beforeRefresh" );
		}, "bubble" );

		obj.on( "afterRefresh", function ( arg ) {
			element.dispatch( arg, "afterRefresh" );
		}, "bubble" );

		obj.on( "change", function ( arg ) {
			element.dispatch( obj.element, "change", arg );
		}, "change" );

		obj.on( "click", function ( e ) {
			var target = utility.target( e ),
			    page;

			utility.stop( e );

			if ( target.nodeName === "A" ) {
				page = element.data( target, "page" );

				if ( !isNaN( page ) ) {
					obj.page( page );
				}
			}
		}, "pagination" );

		if ( typeof MutationObserver == "function" ) {
			obj.mutation = new MutationObserver( function ( arg ) {
				obj.dispatch( "change", arg );
			} );

			obj.mutation.observe( obj.element, {childList: true, subtree: true} );
		}

		// Rendering if not tied to an API or data is ready
		if ( obj.store.uri === null || obj.store.loaded ) {
			obj.refresh();
		}

		return obj;
	},

	/**
	 * Calculates the total pages
	 *
	 * @method pages
	 * @memberOf list
	 * @return {Number} Total pages
	 * @private
	 */
	pages : function () {
		if ( isNaN( this.pageSize ) ) {
			throw new Error( label.invalidArguments );
		}

		return Math.ceil( ( !this.filter ? this.total : this.filtered.length ) / this.pageSize );
	},

	/**
	 * Calculates the page size as an Array of start & finish
	 *
	 * @method range
	 * @memberOf list
	 * @return {Array}  Array of start & end numbers
	 * @private
	 */
	range : function () {
		var start = ( this.pageIndex * this.pageSize ) - this.pageSize,
		    end   = this.pageSize;

		return [start, end];
	}
};

/**
 * Creates a new DataList
 *
 * @constructor
 * @memberOf keigai
 * @extends {keigai.Base}
 * @example
 * var store = keigai.store( [...] ),
 *     list  = keigai.list( document.querySelector("#list"), store, "{{name}}", {order: "name"} );
 */
function DataList ( element, store, template ) {
	this.callback    = null;
	this.current     = [];
	this.element     = element;
	this.emptyMsg    = label.noData;
	this.filter      = null;
	this.filtered    = [];
	this.id          = utility.genId();
	this.items       = [];
	this.mutation    = null;
	this.observer    = observable.factory();
	this.pageIndex   = 1;
	this.pageSize    = null;
	this.pageRange   = 5;
	this.pagination  = "bottom"; // "top" or "bottom|top" are also valid
	this.placeholder = "";
	this.order       = "";
	this.records     = [];
	this.template    = template;
	this.total       = 0;
	this.store       = store;
	this.where       = null;
}

/**
 * Extending Base
 *
 * @memberOf keigai.DataList
 * @type {Object} {@link keigai.Base}
 */
DataList.prototype = base.factory();

/**
 * Setting constructor loop
 *
 * @method constructor
 * @memberOf keigai.DataList
 * @type {Function}
 * @private
 */
DataList.prototype.constructor = DataList;

/**
 * Adds an item to the DataList
 *
 * @method add
 * @memberOf keigai.DataList
 * @param {Object} record New DataStore record (shapes should match)
 * @return {Object}       {@link keigai.DataList}
 * @example
 * list.add( {name: "John Doe", age: 34} );
 */
DataList.prototype.add = function ( record ) {
	var self = this;

	this.store.set( null, record ).then( null, function ( e ) {
		utility.error( e );
		self.dispatch( "error", e );
	} );

	return this;
};

/**
 * Exports data list records
 *
 * @method dump
 * @memberOf keigai.DataList
 * @return {Array} Record set
 * @example
 * var data = list.dump();
 */
DataList.prototype.dump = function () {
	return this.store.dump( this.records );
};

/**
 * Changes the page index of the DataList
 *
 * @method page
 * @memberOf keigai.DataList
 * @param  {Number} n Page to view
 * @return {Object}   {@link keigai.DataList}
 * @example
 * list.page( 2 );
 */
DataList.prototype.page = function ( n ) {
	this.pageIndex = n;

	return this.refresh();
};

/**
 * Adds pagination Elements to the View, executed from `DataList.refresh()`
 *
 * @method pages
 * @memberOf keigai.DataList
 * @return {Object} {@link keigai.DataList}
 * @example
 * list.pages();
 */
DataList.prototype.pages = function () {
	var self  = this,
	    obj   = this.element,
	    page  = this.pageIndex,
	    pos   = this.pagination,
	    range = this.pageRange,
	    mid   = Math.floor( range / 2 ),
	    start = page - mid,
	    end   = page + mid,
	    total = list.pages.call( this ),
	    diff;

	if ( !regex.top_bottom.test( pos ) ) {
		throw new Error( label.invalidArguments );
	}

	// Removing the existing controls
	array.each( utility.dom( "#" + obj.id + "-pages-top, #" + obj.id + "-pages-bottom" ), function ( i ) {
		if ( i ) {
			self.observer.unhook( i, "click" );
			element.destroy( i );
		}
	} );
	
	// Halting because there's 1 page, or nothing
	if ( ( this.filter && this.filtered.length === 0 ) || this.total === 0 || total === 1 ) {
		return this;
	}

	// Getting the range to display
	if ( start < 1 ) {
		diff  = number.diff( start, 1 );
		start = start + diff;
		end   = end   + diff;
	}

	if ( end > total ) {
		end   = total;
		start = ( end - range ) + 1;

		if ( start < 1 ) {
			start = 1;
		}
	}

	if ( number.diff( start, end ) >= range ) {
		--end;
	}

	array.each( string.explode( pos ), function ( i ) {
		var current = false,
		    more    = page > 1,
		    next    = ( page + 1 ) <= total,
		    last    = ( page >= total ),
		    el, n;

		// Setting up the list
		el = element.create( "ul", {"class": "list pages hidden " + i, id: obj.id + "-pages-" + i}, obj, i === "bottom" ? "after" : "before" );

		// First page
		element.create( more ? "a" : "span", {"class": "first page", "data-page": 1, innerHTML: "&lt;&lt;"}, element.create( "li", {}, el ) );

		// Previous page
		element.create( more ? "a" : "span", {"class": "prev page", "data-page": ( page - 1 ), innerHTML: "&lt;"}, element.create( "li", {}, el ) );

		// Rendering the page range
		for ( n = start; n <= end; n++ ) {
			current = ( n === page );
			element.create( current ? "span" : "a", {"class": current ? "current page" : "page", "data-page": n, innerHTML: n}, element.create( "li", {}, el ) );
		}

		// Next page
		element.create( next ? "a" : "span", {"class": "next page", "data-page": next ? ( page + 1 ) : null, innerHTML: "&gt;"}, element.create( "li", {}, el ) );

		// Last page
		element.create( last ? "span" : "a", {"class": "last page", "data-page": last ? null : total, innerHTML: "&gt;&gt;"}, element.create( "li", {}, el ) );

		// Adding to DOM
		element.klass( el, "hidden", false );

		// Pagination listener
		self.observer.hook( el, "click" );
	} );

	return this;
};

/**
 * Refreshes element
 *
 * @method refresh
 * @memberOf keigai.DataList
 * @extends {keigai.Base}
 * @fires keigai.DataList#beforeRefresh Fires before refresh
 * @fires keigai.DataList#afterRefresh Fires after refresh
 * @fires keigai.DataList#error Fires on error
 * @param  {Boolean} create [Optional] Recreates cached View of data
 * @return {Object} {@link keigai.DataList}
 * @example
 * list.refresh();
 */
DataList.prototype.refresh = function ( create ) {
	var self     = this,
	    el       = this.element,
	    template = ( typeof this.template == "object" ),
	    filter   = this.filter !== null,
	    items    = [],
	    callback = ( typeof this.callback == "function" ),
	    reg      = new RegExp(),
	    registry = [], // keeps track of records in the list ( for filtering )
	    range    = [],
	    fn, ceiling, next;

	create = create === true;

	this.dispatch( "beforeRefresh", el );

	// Function to create templates for the html rep
	if ( !template ) {
		fn = function ( i ) {
			var html  = self.template,
			    items = array.unique( html.match( /\{\{[\w\.\-\[\]]+\}\}/g ) );

			// Replacing record key
			html = html.replace( "{{" + self.store.key + "}}", i.key );
			
			// Replacing dot notation properties
			array.each( items, function ( attr ) {
				var key   = attr.replace( /\{\{|\}\}/g, "" ),
				    value = utility.walk( i.data, key ) || "";

				reg.compile( string.escape( attr ), "g" );
				html = html.replace( reg, value );
			} );

			// Filling in placeholder value
			html = html.replace( /\{\{.*\}\}/g, self.placeholder );

			return "<li data-key=\"" + i.key + "\">" + html + "</li>";
		};
	}
	else {
		fn = function ( i ) {
			var obj   = json.encode( self.template ),
			    items = array.unique( obj.match( /\{\{[\w\.\-\[\]]+\}\}/g ) );

			// Replacing record key
			obj = obj.replace( "{{" + self.store.key + "}}", i.key );
			
			// Replacing dot notation properties
			array.each( items, function ( attr ) {
				var key   = attr.replace( /\{\{|\}\}/g, "" ),
				    value = utility.walk( i.data, key ) || "";

				reg.compile( string.escape( attr ), "g" );

				// Stripping first and last " to concat to valid JSON
				obj = obj.replace( reg, json.encode( value ).replace( /(^")|("$)/g, "" ) );
			} );

			// Filling in placeholder value
			obj = json.decode( obj.replace( /\{\{.*\}\}/g, self.placeholder ) );

			return {li: obj};
		};
	}

	// Next phase
	next = function ( args ) {
		// Creating view of DataStore
		self.records  = args;
		self.total    = self.records.length;
		self.filtered = [];

		// Resetting 'view' specific arrays
		self.current  = [];

		// Filtering records (if applicable)
		if ( filter ) {
			array.each( self.records, function ( i ) {
				utility.iterate( self.filter, function ( v, k ) {
					var reg, key;

					if ( array.contains( registry, i.key ) ) {
						return false;
					}
					
					v   = string.explode( v );
					reg = new RegExp(),
					key = ( k === self.store.key );

					array.each( v, function ( query ) {
						var value = !key ? utility.walk( i.data, k ) : "";

						utility.compile( reg, query, "i" );

						if ( ( key && reg.test( i.key ) ) || reg.test( value ) ) {
							registry.push( i.key );
							self.filtered.push( i );

							return false;
						}
					} );
				} );
			} );
		}

		// Pagination
		if ( self.pageSize !== null && !isNaN( self.pageIndex ) && !isNaN( self.pageSize ) ) {
			ceiling = list.pages.call( self );

			// Passed the end, so putting you on the end
			if ( ceiling > 0 && self.pageIndex > ceiling ) {
				return self.page( ceiling );
			}

			// Paginating the items
			else if ( self.total > 0 ) {
				range        = list.range.call( self );
				self.current = array.limit( !filter ? self.records : self.filtered, range[0], range[1] );
			}
		}
		else {
			self.current = !filter ? self.records : self.filtered;
		}

		// Processing records & generating templates
		array.each( self.current, function ( i ) {
			var html = fn( i ),
			    hash = btoa( html );

			items.push( {key: i.key, template: html, hash: hash} );
		} );

		// Updating element
		utility.render( function () {
			var destroy   = [],
			    callbacks = [],
			    i, nth;

			if ( items.length === 0 ) {
				element.html( el, "<li class=\"empty\">" + self.emptyMsg + "</li>" );
			}
			else {
				if ( self.items.length === 0 ) {
					element.html( el, items.map( function ( i ) {
						return i.template;
					} ).join( "" ) );

					if ( callback ) {
						array.each( array.cast( el.childNodes ), function ( i ) {
							self.callback( i );
						} );
					}
				}
				else {
					array.each( items, function ( i, idx ) {
						if ( self.items[idx] !== undefined && self.items[idx].hash !== i.hash ) {
							element.data( element.html( el.childNodes[idx], i.template.replace( /<li data-key=\"\d+\">|<\/li>/g, "" ) ), "key", i.key );
							callbacks.push( idx );
						}
						else if ( self.items[idx] === undefined ) {
							element.create( i.template, null, el );
							callbacks.push( idx );
						}
					} );

					if ( items.length < self.items.length ) {
						i   = items.length - 1;
						nth = self.items.length;

						while ( ++i < nth ) {
							destroy.push( i );
						}

						array.each( destroy.reverse(), function ( i ) {
							element.destroy( el.childNodes[ i ] );
						} );
					}

					if ( callback ) {
						array.each( callbacks, function ( i ) {
							self.callback( el.childNodes[i] );
						} );
					}
				}
			}

			// Updating reference for next change
			self.items = items;

			// Rendering pagination elements
			if ( self.pageSize !== null && regex.top_bottom.test( self.pagination ) && !isNaN( self.pageIndex ) && !isNaN( self.pageSize ) ) {
				self.pages();
			}
			else {
				array.each( utility.$( "#" + el.id + "-pages-top, #" + el.id + "-pages-bottom" ), function ( i ) {
					element.destroy( i );
				} );
			}

			self.dispatch( "afterRefresh", el );
		} );
	};

	// Consuming records based on sort
	if ( this.where === null ) {
		string.isEmpty( this.order ) ? next( this.store.get() ) : this.store.sort( this.order, create ).then( next, function ( e ) {
			utility.error( e );
			self.dispatch( "error", e );
		} );
	}
	else if ( string.isEmpty( this.order ) ) {
		this.store.select( this.where ).then( next, function ( e ) {
			utility.error( e );
			self.dispatch( "error", e );
		} );
	}
	else {
		this.store.sort( this.order, create, this.where ).then( next, function ( e ) {
			utility.error( e );
			self.dispatch( "error", e );
		} );
	}

	return this;
};

/**
 * Removes an item from the DataList
 *
 * @method remove
 * @memberOf keigai.DataList
 * @param {Mixed} record Record, key or index
 * @return {Object} {@link keigai.DataList}
 * @example
 * // Adding a click handler to 'trash' Elements
 * keigai.util.array.cast( document.querySelectorAll( ".list .trash" ) ).forEach( function ( i ) {
 *   i.addEventListener( "click", function ( ev ) {
 *     var key = keigai.util.element.data( keigai.util.target( ev ).parentNode, "key" );
 *
 *     list.remove( key );
 *   }, false );
 * } );
 */
DataList.prototype.remove = function ( record ) {
	var self = this;

	this.store.del( record ).then( null, function ( e ) {
		utility.error( e );
		self.dispatch( "error", e );
	} );

	return this;
};

/**
 * Sorts data list & refreshes element
 *
 * @method sort
 * @memberOf keigai.DataList
 * @param  {String} order SQL "ORDER BY" clause
 * @return {Object} {@link keigai.DataList}
 * @example
 * list.sort( "age, name" );
 */
DataList.prototype.sort = function ( order ) {
	this.order = order;

	return this.refresh();
};

/**
 * Tears down references to the DataList
 *
 * @method teardown
 * @memberOf keigai.DataList
 * @param  {Boolean} destroy [Optional] `true` will remove the DataList from the DOM
 * @return {Object} {@link keigai.DataList}
 * @example
 * list.teardown();
 */
DataList.prototype.teardown = function ( destroy ) {
	destroy  = ( destroy === true );
	var self = this;

	array.each( this.store.lists, function ( i, idx ) {
		if ( i.id === self.id ) {
			this.remove( idx );

			return false;
		}
	} );

	delete this.observer.hooks[this.element.id];

	if ( destroy ) {
		element.destroy( this.element );
		this.element = null;
	}

	return this;
};

/**
 * Updates an item in the DataList
 *
 * @method update
 * @memberOf keigai.DataList
 * @param {Mixed}  key  Key or index
 * @param {Object} data New property values
 * @return {Object}     {@link keigai.DataList}
 * @example
 * list.update( "key", {name: "Jim Smith"} );
 */
DataList.prototype.update = function ( key, data ) {
	var self = this;

	this.store.update( key, data ).then( null, function ( e ) {
		utility.error( e );
		self.dispatch( "error", e );
	} );

	return this;
};
