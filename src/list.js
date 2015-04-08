class DataList extends Base {
	/**
	 * Creates a new DataList
	 *
	 * @constructor
	 * @memberOf keigai
	 * @extends {keigai.Base}
	 * @example
	 * let store = keigai.store( [...] ),
	 *     list  = keigai.list( document.querySelector("#list"), store, "{{name}}", {order: "name"} );
	 */
	constructor ( element, store, template ) {
		super();

		this.callback = null;
		this.current = [];
		this.element = element;
		this.emptyMsg = label.noData;
		this.filter = null;
		this.filtered = [];
		this.id = utility.genId();
		this.items = [];
		this.listFilter = null;
		this.mutation = null;
		this.observer = observable.factory();
		this.pageIndex = 1;
		this.pageSize = null;
		this.pageRange = 5;
		this.pagination = "bottom"; // "top" or "bottom|top" are also valid
		this.placeholder = "";
		this.order = "";
		this.records = [];
		this.template = template;
		this.total = 0;
		this.store = store;
		this.where = null;
	}

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
	add ( record ) {
		this.store.set( null, record ).then( null, ( e ) => {
			utility.error( e );
			this.dispatch( "error", e );
		} );

		return this;
	}

	/**
	 * Exports data list records
	 *
	 * @method dump
	 * @memberOf keigai.DataList
	 * @return {Array} Record set
	 * @example
	 * let data = list.dump();
	 */
	dump () {
		return this.store.dump( this.records );
	}

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
	page ( n ) {
		this.pageIndex = n;

		return this.refresh();
	}

	/**
	 * Adds pagination Elements to the View, executed from `DataList.refresh()`
	 *
	 * @method pages
	 * @memberOf keigai.DataList
	 * @return {Object} {@link keigai.DataList}
	 * @example
	 * list.pages();
	 */
	pages () {
		let obj = this.element;
		let page = this.pageIndex;
		let pos = this.pagination;
		let range = this.pageRange;
		let mid = Math.floor( range / 2 );
		let start = page - mid;
		let end = page + mid;
		let total = list.pages( this );
		let diff;

		// Removing the existing controls
		array.each( utility.dom( "#" + obj.id + "-pages-top, #" + obj.id + "-pages-bottom" ), ( i ) => {
			if ( i ) {
				this.observer.unhook( i, "click" );
				element.destroy( i );
			}
		} );

		// Halting because there's 1 page, or nothing
		if ( ( this.filter && this.filtered.length === 0 ) || this.total === 0 || total === 1 ) {
			return this;
		}

		// Getting the range to display
		if ( start < 1 ) {
			diff = number.diff( start, 1 );
			start = start + diff;
			end = end + diff;
		}

		if ( end > total ) {
			end = total;
			start = ( end - range ) + 1;

			if ( start < 1 ) {
				start = 1;
			}
		}

		if ( number.diff( start, end ) >= range ) {
			--end;
		}

		array.each( string.explode( pos ), ( i ) => {
			let current = false;
			let more = page > 1;
			let next = ( page + 1 ) <= total;
			let last = ( page >= total );
			let el, n;

			// Setting up the list
			el = element.create( "ul", {
				"class": "list pages hidden " + i,
				id: obj.id + "-pages-" + i
			}, obj, i === "bottom" ? "after" : "before" );

			// First page
			element.create( more ? "a" : "span", {
				"class": "first page",
				"data-page": 1,
				innerHTML: "&lt;&lt;"
			}, element.create( "li", {}, el ) );

			// Previous page
			element.create( more ? "a" : "span", {
				"class": "prev page",
				"data-page": ( page - 1 ),
				innerHTML: "&lt;"
			}, element.create( "li", {}, el ) );

			// Rendering the page range
			n = start - 1;
			while ( ++n <= end ) {
				current = ( n === page );
				element.create( current ? "span" : "a", {
					"class": current ? "current page" : "page",
					"data-page": n,
					innerHTML: n
				}, element.create( "li", {}, el ) );
			}

			// Next page
			element.create( next ? "a" : "span", {
				"class": "next page",
				"data-page": next ? ( page + 1 ) : null,
				innerHTML: "&gt;"
			}, element.create( "li", {}, el ) );

			// Last page
			element.create( last ? "span" : "a", {
				"class": "last page",
				"data-page": last ? null : total,
				innerHTML: "&gt;&gt;"
			}, element.create( "li", {}, el ) );

			// Adding to DOM
			element.removeClass( el, "hidden" );

			// Pagination listener
			this.observer.hook( el, "click" );
		} );

		return this;
	}

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
	refresh ( create=false ) {
		let el = this.element;
		let template = ( typeof this.template === "object" );
		let filter = this.filter !== null;
		let items = [];
		let callback = ( typeof this.callback === "function" );
		let reg = new RegExp();
		let registry = []; // keeps track of records in the list ( for filtering )
		let range = [];
		let fn, ceiling, next;

		this.dispatch( "beforeRefresh", el );

		// Function to create templates for the html rep
		if ( !template ) {
			fn = ( i ) => {
				let html = this.template;
				let items = array.unique( html.match( /\{\{[\w\.\-\[\]]+\}\}/g ) );

				// Replacing record key
				html = html.replace( "{{" + this.store.key + "}}", i.key );

				// Replacing dot notation properties
				array.each( items, ( attr ) => {
					let key = attr.replace( /\{\{|\}\}/g, "" ),
						value = utility.walk( i.data, key );

					if ( value === undefined ) {
						value = "";
					}

					reg.compile( string.escape( attr ), "g" );
					html = html.replace( reg, value );
				} );

				// Filling in placeholder value
				html = html.replace( /\{\{.*\}\}/g, this.placeholder );

				return "<li data-key=\"" + i.key + "\">" + html + "</li>";
			};
		} else {
			fn = ( i ) => {
				let obj = json.encode( this.template );
				let items = array.unique( obj.match( /\{\{[\w\.\-\[\]]+\}\}/g ) );

				// Replacing record key
				obj = obj.replace( "{{" + this.store.key + "}}", i.key );

				// Replacing dot notation properties
				array.each( items, ( attr ) => {
					let key = attr.replace( /\{\{|\}\}/g, "" );
					let value = utility.walk( i.data, key ) || "";

					reg.compile( string.escape( attr ), "g" );

					// Stripping first and last " to concat to valid JSON
					obj = obj.replace( reg, json.encode( value ).replace( /(^")|("$)/g, "" ) );
				} );

				// Filling in placeholder value
				obj = json.decode( obj.replace( /\{\{.*\}\}/g, this.placeholder ) );

				return { li: obj };
			};
		}

		// Next phase
		next = ( args ) => {
			// Creating view of DataStore
			this.records = args;
			this.total = this.records.length;
			this.filtered = [];

			// Resetting 'view' specific arrays
			this.current = [];

			// Filtering records (if applicable)
			if ( filter ) {
				array.each( this.records, ( i ) => {
					utility.iterate( this.filter, ( v, k ) => {
						let key;

						if ( array.contains( registry, i.key ) ) {
							return false;
						}

						key = ( k === this.store.key );

						array.each( string.explode( v ), ( query ) => {
							let reg = new RegExp( query, "i" );
							let value = !key ? utility.walk( i.data, k ) : "";

							if ( ( key && reg.test( i.key ) ) || reg.test( value ) ) {
								registry.push( i.key );
								this.filtered.push( i );

								return false;
							}
						} );
					} );
				} );
			}

			// Pagination
			if ( this.pageSize !== null && !isNaN( this.pageIndex ) && !isNaN( this.pageSize ) ) {
				ceiling = list.pages( this );

				// Passed the end, so putting you on the end
				if ( ceiling > 0 && this.pageIndex > ceiling ) {
					return this.page( ceiling );
				}
				// Paginating the items
				else if ( this.total > 0 ) {
					range = list.range( this );
					this.current = array.limit( !filter ? this.records : this.filtered, range[ 0 ], range[ 1 ] );
				}
			} else {
				this.current = !filter ? this.records : this.filtered;
			}

			// Processing records & generating templates
			array.each( this.current, ( i ) => {
				let html = fn( i );
				let hash = btoa( html );

				items.push( { key: i.key, template: html, hash: hash } );
			} );

			// Updating element
			utility.render( () => {
				let destroy = [];
				let callbacks = [];
				let i, nth;

				if ( items.length === 0 ) {
					element.html( el, "<li class=\"empty\">" + this.emptyMsg + "</li>" );
				} else {
					if ( this.items.length === 0 ) {
						element.html( el, items.map( ( i ) => {
							return i.template;
						} ).join( "" ) );

						if ( callback ) {
							array.each( array.cast( el.childNodes ), ( i ) => {
								this.callback( i );
							} );
						}
					} else {
						array.each( items, ( i, idx ) => {
							if ( this.items[ idx ] !== undefined && this.items[ idx ].hash !== i.hash ) {
								element.data( element.html( el.childNodes[ idx ], i.template.replace( /<li data-key=\"\d+\">|<\/li>/g, "" ) ), "key", i.key );
								callbacks.push( idx );
							} else if ( this.items[ idx ] === undefined ) {
								element.create( i.template, null, el );
								callbacks.push( idx );
							}
						} );

						if ( items.length < this.items.length ) {
							i = items.length - 1;
							nth = this.items.length;

							while ( ++i < nth ) {
								destroy.push( i );
							}

							array.each( destroy.reverse(), ( i ) => {
								element.destroy( el.childNodes[ i ] );
							} );
						}

						if ( callback ) {
							array.each( callbacks, ( i ) => {
								this.callback( el.childNodes[ i ] );
							} );
						}
					}
				}

				// Updating reference for next change
				this.items = items;

				// Rendering pagination elements
				if ( this.pageSize !== null && regex.top_bottom.test( this.pagination ) && !isNaN( this.pageIndex ) && !isNaN( this.pageSize ) ) {
					this.pages();
				} else {
					array.each( utility.$( "#" + el.id + "-pages-top, #" + el.id + "-pages-bottom" ), ( i ) => {
						element.destroy( i );
					} );
				}

				this.dispatch( "afterRefresh", el );
			} );
		};

		// Consuming records based on sort
		if ( this.where === null ) {
			string.isEmpty( this.order ) ? next( this.store.get() ) : this.store.sort( this.order, create ).then( next, ( e ) => {
				utility.error( e );
				this.dispatch( "error", e );
			} );
		} else if ( string.isEmpty( this.order ) ) {
			this.store.select( this.where ).then( next, ( e ) => {
				utility.error( e );
				this.dispatch( "error", e );
			} );
		} else {
			this.store.sort( this.order, create, this.where ).then( next, ( e ) => {
				utility.error( e );
				this.dispatch( "error", e );
			} );
		}

		return this;
	}

	/**
	 * Removes an item from the DataList
	 *
	 * @method remove
	 * @memberOf keigai.DataList
	 * @param {Mixed} record Record, key or index
	 * @return {Object} {@link keigai.DataList}
	 * @example
	 * // Adding a click handler to 'trash' Elements
	 * keigai.util.array.cast( document.querySelectorAll( ".list .trash" ) ).forEach( ( i ) => {
	 *   i.addEventListener( "click", ( ev ) => {
	 *     let key = keigai.util.element.data( keigai.util.target( ev ).parentNode, "key" );
	 *
	 *     list.remove( key );
	 *   }, false );
	 * } );
	 */
	remove ( record ) {
		this.store.del( record ).then( null, ( e ) => {
			utility.error( e );
			this.dispatch( "error", e );
		} );

		return this;
	}

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
	sort ( order ) {
		this.order = order;

		return this.refresh();
	}

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
	teardown ( destroy=false ) {
		let el = this.element;
		let id = el.id;

		array.each( this.store.lists, ( i, idx ) => {
			if ( i.id === this.id ) {
				array.remove( this.store.lists, idx );

				return false;
			}
		} );

		if ( this.listFilter ) {
			this.listFilter.teardown();
		}

		array.each( utility.$( "#" + id + "-pages-top, #" + id + "-pages-bottom" ), ( i ) => {
			this.observer.unhook( i, "click" );

			if ( destroy ) {
				element.destroy( i );
			}
		} );

		this.observer.unhook( el, "click" );

		if ( destroy ) {
			element.destroy( el );
		}

		this.element = null;

		return this;
	}

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
	update ( key, data ) {
		this.store.update( key, data ).then( null, ( e ) => {
			utility.error( e );
			this.dispatch( "error", e );
		} );

		return this;
	};
}

/**
 * @namespace list
 */
let list = {
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
	 * let store = keigai.store( [...] ),
	 *     list  = keigai.list( document.querySelector("#list"), store, "{{name}}", {order: "name"} );
	 */
	factory: ( target, store, template, options ) => {
		let ref = [ store ];
		let obj = new DataList( element.create( "ul", { "class": "list", id: utility.genId( null, true ) }, target ), ref[ 0 ], template );

		if ( options instanceof Object ) {
			if ( options.listFiltered && options.listFilter ) {
				obj.listFilter = filter.factory( element.create( "input", {
					"id": obj.element.id + "-filter",
					"class": "filter",
					placeholder: "Filter"
				}, target, "first" ), obj, options.listFilter, options.debounce || 250 );
				delete options.listFilter;
				delete options.listFiltered;
				delete options.debounce;
			}

			utility.merge( obj, options );
		}

		obj.store.lists.push( obj );

		// Setting up a chain of Events
		obj.on( "beforeRefresh", ( arg ) => {
			element.dispatch( arg, "beforeRefresh" );
		}, "bubble" );

		obj.on( "afterRefresh", ( arg ) => {
			element.dispatch( arg, "afterRefresh" );
		}, "bubble" );

		obj.on( "change", ( arg ) => {
			element.dispatch( obj.element, "change", arg );
		}, "change" );

		obj.on( "click", ( e ) => {
			let target = utility.target( e );
			let page;

			utility.stop( e );

			if ( target.nodeName === "A" ) {
				page = element.data( target, "page" );

				if ( !isNaN( page ) ) {
					obj.page( page );
				}
			}
		}, "pagination" );

		if ( typeof MutationObserver === "function" ) {
			obj.mutation = new MutationObserver( ( arg ) => {
				obj.dispatch( "change", arg );
			} );

			obj.mutation.observe( obj.element, { childList: true, subtree: true } );
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
	pages: ( obj ) => {
		if ( isNaN( obj.pageSize ) ) {
			throw new Error( label.invalidArguments );
		}

		return Math.ceil( ( !obj.filter ? obj.total : obj.filtered.length ) / obj.pageSize );
	},

	/**
	 * Calculates the page size as an Array of start & finish
	 *
	 * @method range
	 * @memberOf list
	 * @return {Array}  Array of start & end numbers
	 * @private
	 */
	range: ( obj ) => {
		let start = ( obj.pageIndex * obj.pageSize ) - obj.pageSize;
		let end = obj.pageSize;

		return [ start, end ];
	}
};
