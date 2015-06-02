class DataStore extends Base {
	/**
	 * Creates a new DataStore
	 *
	 * @constructor
	 * @memberOf keigai
	 * @extends {keigai.Base}
	 * @example
	 * let store = keigai.store();
	 */
	constructor () {
		super();

		this.autosave = false;
		this.callback = null;
		this.credentials = null;
		this.lists = [];
		this.events = true;
		this.expires = null;
		this.headers = { Accept: "application/json" };
		this.ignore = [];
		this.index = [];
		this.indexes = { key: {} };
		this.key = null;
		this.loaded = false;
		this.mongodb = "";
		this.observer = observable();
		this.records = [];
		this.source = null;
		this.total = 0;
		this.versions = {};
		this.versioning = true;
		this.views = {};
		this.uri = null;
	}

	/**
	 * Batch sets or deletes data in the store
	 *
	 * @method batch
	 * @memberOf keigai.DataStore
	 * @param  {String}  type Type of action to perform ( set/del/delete )
	 * @param  {Array}   data Array of keys or indices to delete, or Object containing multiple records to set
	 * @param  {Boolean} sync [Optional] Syncs store with data, if true everything is erased
	 * @return {Object} {@link keigai.Deferred}
	 * @fires keigai.DataStore#beforeBatch Fires before the batch is queued
	 * @fires keigai.DataStore#afterBatch Fires after the batch is queued
	 * @fires keigai.DataStore#failedBatch Fires when an exception occurs
	 * @example
	 * store.batch( "set", [...] ).then( ( records ) => {
	 *   ...
	 * }, ( err ) => {
	 *   ...
	 * } );
	 */
	batch ( type, data, sync=false ) {
		let self = this;
		let events = this.events;
		let defer = deferred();
		let deferreds = [];
		let patch = [];

		if ( !regex.set_del.test( type ) || ( sync && regex.del.test( type ) ) || typeof data !== "object" ) {
			defer.reject( new Error( label.invalidArguments ) );
		} else {
			if ( events ) {
				this.dispatch( "beforeBatch", data );
			}

			if ( sync ) {
				this.clear( sync );
			}

			if ( data.length === 0 ) {
				this.loaded = true;

				if ( events ) {
					this.dispatch( "afterBatch", this.records );
				}

				defer.resolve( this.records );
			} else {
				// Batch deletion will create a sparse array, which will be compacted before re-indexing
				if ( type === "del" ) {
					array.each( data, ( i ) => {
						deferreds.push( this.del( i, false, true ) );
					} );
				} else {
					array.each( data, ( i ) => {
						deferreds.push( this.set( i[ this.key ] || null, i, true ) );
					} );
				}

				this.loaded = false;

				utility.when( deferreds ).then( ( args ) => {
					this.loaded = true;

					if ( events ) {
						this.dispatch( "afterBatch", args );
					}

					// Forcing a clear of views to deal with async nature of workers & staggered loading
					array.each( this.lists, ( i ) => {
						i.refresh( true );
					} );

					if ( type === "del" ) {
						this.records = array.compact( this.records );
						this.reindex();
					}

					if ( this.autosave ) {
						this.save();
					}

					defer.resolve( args );
				}, ( e ) => {
					if ( events ) {
						this.dispatch( "failedBatch", e );
					}

					defer.reject( e );
				} );
			}
		}

		return defer;
	}

	/**
	 * Builds a URI
	 *
	 * @method buildUri
	 * @memberOf keigai.DataStore
	 * @param  {String} key Record key
	 * @return {String}     URI
	 * @example
	 * let uri = store.buildUri( "key" );
	 */
	buildUri ( key ) {
		let parsed = utility.parse( this.uri );

		return parsed.protocol + "//" + parsed.host + parsed.pathname.replace( regex.endslash, "" ) + "/" + key;
	}

	/**
	 * Clears the data object, unsets the uri property
	 *
	 * @method clear
	 * @memberOf keigai.DataStore
	 * @param  {Boolean} sync [Optional] Boolean to limit clearing of properties
	 * @return {Object} {@link keigai.DataStore}
	 * @fires keigai.DataStore#beforeClear Fires before the data is cleared
	 * @fires keigai.DataStore#afterClear Fires after the data is cleared
	 * @example
	 * // Resyncing the records, if wired to an API
	 * store.clear( true );
	 *
	 * // Resetting the store
	 * store.clear();
	 */
	clear ( sync=true ) {
		let events = ( this.events === true );
		let resave = ( this.autosave === true );

		if ( !sync ) {
			if ( events ) {
				this.dispatch( "beforeClear" );
			}

			array.each( this.lists, ( i ) => {
				if ( i ) {
					i.teardown( true );
				}
			} );

			this.autosave = false;
			this.callback = null;
			this.credentials = null;
			this.lists = [];
			this.events = true;
			this.expires = null;
			this.headers = { Accept: "application/json" };
			this.ignore = [];
			this.index = [];
			this.indexes = { key: {} };
			this.key = null;
			this.loaded = false;
			this.records = [];
			this.source = null;
			this.total = 0;
			this.versions = {};
			this.versioning = true;
			this.views = {};
			this.uri = null;

			if ( events ) {
				this.dispatch( "afterClear" );
			}
		} else {
			this.indexes = { key: {} };
			this.loaded = false;
			this.records = [];
			this.total = 0;
			this.views = {};

			array.each( this.lists, ( i ) => {
				if ( i ) {
					i.refresh();
				}
			} );
		}

		if ( resave ) {
			this.save();
		}

		return this;
	}

	/**
	 * Deletes a record based on key or index
	 *
	 * @method del
	 * @memberOf keigai.DataStore
	 * @param  {Mixed}   record  Record, key or index
	 * @param  {Boolean} reindex [Optional] `true` if DataStore should be reindexed
	 * @param  {Boolean} batch   [Optional] `true` if part of a batch operation
	 * @return {Object} {@link keigai.Deferred}
	 * @fires keigai.DataStore#beforeDelete Fires before the record is deleted
	 * @fires keigai.DataStore#afterDelete Fires after the record is deleted
	 * @fires keigai.DataStore#failedDelete Fires if the store is RESTful and the action is denied
	 * @example
	 * store.del( "key" ).then( () => {
	 *   console.log( "Successfully deleted " + key );
	 * }, ( err ) => {
	 *   console.warn( "Failed to delete " + key + ": " + err.message );
	 * } );
	 */
	del ( record, reindex=true, batch=false ) {
		record = record.key ? record : this.get( record );

		let defer = deferred();

		if ( record === undefined ) {
			defer.reject( new Error( label.invalidArguments ) );
		} else {
			if ( this.events ) {
				this.dispatch( "beforeDelete", record );
			}

			if ( this.uri === null || this.callback !== null ) {
				this.delComplete( record, reindex, batch, defer );
			} else {
				client.request( this.buildUri( record.key ), "DELETE", null, utility.merge( { withCredentials: this.credentials }, this.headers ) ).then( () => {
					this.delComplete( record, reindex, batch, defer );
				}, ( e ) => {
					this.dispatch( "failedDelete", e );
					defer.reject( e );
				} );
			}
		}

		return defer;
	}

	/**
	 * Delete completion
	 *
	 * @method delComplete
	 * @memberOf keigai.DataStore
	 * @param  {Object}  record  DataStore record
	 * @param  {Boolean} reindex `true` if DataStore should be reindexed
	 * @param  {Boolean} batch   `true` if part of a batch operation
	 * @param  {Object}  defer   Deferred instance
	 * @return {Object} {@link keigai.DataStore}
	 * @private
	 */
	delComplete ( record, reindex, batch, defer ) {
		delete this.indexes.key[ record.key ];
		delete this.versions[ record.key ];
		this.total--;
		this.views = {};

		if ( !batch ) {
			array.remove( this.records, record.index );

			if ( reindex ) {
				this.reindex();
			} else {
				array.each( record.indexes, ( i ) => {
					array.remove( this.indexes[ i[ 0 ] ][ i[ 1 ] ], record.index );

					if ( this.indexes[ i[ 0 ] ][ i[ 1 ] ].length === 0 ) {
						delete this.indexes[ i[ 0 ] ][ i[ 1 ] ];
					}
				} );
			}

			if ( this.autosave ) {
				this.purge( record.key );
			}

			if ( this.events ) {
				this.dispatch( "afterDelete", record );
			}

			array.each( this.lists, ( i ) => {
				i.refresh();
			} );
		} else {
			this.records[ record.index ] = null;
		}

		return defer !== undefined ? defer.resolve( record.key ) : record.key;
	}

	/**
	 * Exports a subset or complete record set of DataStore
	 *
	 * @method dump
	 * @memberOf keigai.DataStore
	 * @param  {Array} args   [Optional] Sub-data set of DataStore
	 * @param  {Array} fields [Optional] Fields to export, defaults to all
	 * @return {Array}        Records
	 * @example
	 * let data = store.dump();
	 */
	dump ( args, fields ) {
		args = args || this.records;

		let custom = ( fields instanceof Array && fields.length > 0 );
		let key = this.key !== null;
		let fn;

		if ( custom ) {
			fn = ( i ) => {
				let record = {};

				array.each( fields, ( f ) => {
					record[ f ] = f === this.key ? ( isNaN( i.key ) ? i.key : Number( i.key ) ) : utility.clone( i.data[ f ], true );
				} );

				return record;
			};
		} else {
			fn = ( i ) => {
				let record = {};

				if ( key ) {
					record[ this.key ] = isNaN( i.key ) ? i.key : Number( i.key );
				}

				utility.iterate( i.data, ( v, k ) => {
					record[ k ] = utility.clone( v, true );
				} );

				return record;
			};
		}

		return args.map( fn );
	}

	/**
	 * Retrieves the current version of a record(s) based on key or index
	 *
	 * If the key is an integer, cast to a string before sending as an argument!
	 *
	 * @method get
	 * @memberOf keigai.DataStore
	 * @param  {Mixed}  record Key, index or Array of pagination start & end; or comma delimited String of keys or indices
	 * @param  {Number} offset [Optional] Offset from `record` for pagination
	 * @return {Mixed}         Individual record, or Array of records
	 * @example
	 * let record = store.get( "key" );
	 */
	get ( record, offset ) {
		let type = typeof record;
		let result;

		if ( type === "undefined" ) {
			result = this.records;
		} else if ( type === "string" ) {
			if ( record.indexOf( "," ) === -1 ) {
				result = this.records[ this.indexes.key[ record ] ];
			} else {
				result = string.explode( record ).map( ( i ) => {
					if ( !isNaN( i ) ) {
						return this.records[ parseInt( i, 10 ) ];
					} else {
						return this.records[ this.indexes.key[ i ] ];
					}
				} );
			}
		} else if ( type === "number" ) {
			if ( isNaN( offset ) ) {
				result = this.records[ parseInt( record, 10 ) ];
			} else {
				result = array.limit( this.records, parseInt( record, 10 ), parseInt( offset, 10 ) );
			}
		}

		return utility.clone( result, true );
	}

	/**
	 * Performs an (INNER/LEFT/RIGHT) JOIN on two DataStores
	 *
	 * @method join
	 * @memberOf keigai.DataStore
	 * @param  {String} arg   DataStore to join
	 * @param  {String} field Field in both DataStores
	 * @param  {String} join  Type of JOIN to perform, defaults to `inner`
	 * @return {Object} {@link keigai.Deferred}
	 * let data = store.join( otherStore, "commonField" );
	 */
	join ( arg, field, join="inner" ) {
		let defer = deferred();
		let results = [];
		let deferreds = [];
		let key = field === this.key;
		let keys = array.merge( array.keys( this.records[ 0 ].data ), array.keys( arg.records[ 0 ].data ) );
		let fn;

		if ( join === "inner" ) {
			fn = ( i ) => {
				let where = {},
					record = i.data,
					defer = deferred();

				where[ field ] = key ? i.key : record[ field ];

				arg.select( where ).then( ( match ) => {
					if ( match.length > 2 ) {
						defer.reject( new Error( label.databaseMoreThanOne ) );
					} else if ( match.length === 1 ) {
						results.push( utility.merge( record, match[ 0 ].data ) );
						defer.resolve( true );
					} else {
						defer.resolve( false );
					}
				} );

				deferreds.push( defer );
			};
		} else if ( join === "left" ) {
			fn = ( i ) => {
				let where = {},
					record = i.data,
					defer = deferred();

				where[ field ] = key ? i.key : record[ field ];

				arg.select( where ).then( ( match ) => {
					if ( match.length > 2 ) {
						defer.reject( new Error( label.databaseMoreThanOne ) );
					} else if ( match.length === 1 ) {
						results.push( utility.merge( record, match[ 0 ].data ) );
						defer.resolve( true );
					} else {
						array.each( keys, ( i ) => {
							if ( record[ i ] === undefined ) {
								record[ i ] = null;
							}
						} );

						results.push( record );
						defer.resolve( true );
					}
				} );

				deferreds.push( defer );
			};
		} else if ( join === "right" ) {
			fn = ( i ) => {
				let where = {},
					record = i.data,
					defer = deferred();

				where[ field ] = key ? i.key : record[ field ];

				this.select( where ).then( ( match ) => {
					if ( match.length > 2 ) {
						defer.reject( new Error( label.databaseMoreThanOne ) );
					} else if ( match.length === 1 ) {
						results.push( utility.merge( record, match[ 0 ].data ) );
						defer.resolve( true );
					} else {
						array.each( keys, ( i ) => {
							if ( record[ i ] === undefined ) {
								record[ i ] = null;
							}
						} );

						results.push( record );
						defer.resolve( true );
					}
				} );

				deferreds.push( defer );
			};
		}

		array.each( utility.clone( join === "right" ? arg.records : this.records, true ), fn );

		utility.when( deferreds ).then( () => {
			defer.resolve( results );
		}, ( e ) => {
			defer.reject( e );
		} );

		return defer;
	}

	/**
	 * Retrieves only 1 field/property
	 *
	 * @method only
	 * @memberOf keigai.DataStore
	 * @param  {String} arg Field/property to retrieve
	 * @return {Array}      Array of values
	 * @example
	 * let ages = store.only( "age" );
	 */
	only ( arg ) {
		if ( arg === this.key ) {
			return this.records.map( ( i ) => {
				return i.key;
			} );
		} else {
			return this.records.map( ( i ) => {
				return i.data[ arg ];
			} );
		}
	}

	/**
	 * Purges DataStore or record from persistant storage
	 *
	 * @method purge
	 * @memberOf keigai.DataStore
	 * @param  {Mixed} arg  [Optional] String or Number for record
	 * @return {Object}     Record or store
	 * @example
	 * store.purge();
	 */
	purge ( arg ) {
		return this.storage( arg || this, "remove" );
	}

	/**
	 * Reindexes the DataStore
	 *
	 * @method reindex
	 * @memberOf keigai.DataStore
	 * @return {Object} {@link keigai.DataStore}
	 * @example
	 * store.reindex();
	 */
	reindex () {
		let i = -1;
		let tmp = [];

		this.views = {};
		this.indexes = { key: {} };

		if ( this.total > 0 ) {
			array.each( this.records, ( record ) => {
				if ( record !== undefined ) {
					tmp[ ++i ] = record;
					record.index = i;
					this.indexes.key[ record.key ] = i;
					this.setIndexes( record );
				}
			} );
		}

		this.records = tmp;

		return this;
	}

	/**
	 * Restores DataStore or record persistant storage
	 *
	 * @method restore
	 * @memberOf keigai.DataStore
	 * @param  {Mixed} arg  [Optional] String or Number for record
	 * @return {Object}     Record or store
	 * @example
	 * store.restore();
	 */
	restore ( arg ) {
		return this.storage( arg || this, "get" );
	}

	/**
	 * Saves DataStore or record to persistant storage, or sessionStorage
	 *
	 * @method save
	 * @memberOf keigai.DataStore
	 * @param  {Mixed} arg  [Optional] String or Number for record
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * store.save();
	 */
	save ( arg ) {
		return this.storage( arg || this, "set" );
	}

	/**
	 * Selects records (not by reference) based on an explicit description
	 *
	 * @method select
	 * @memberOf keigai.DataStore
	 * @param  {Object} where Object describing the WHERE clause
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * let adults;
	 *
	 * store.select( {age: function ( i ) { return i >= 21; } } ).then( function ( records ) {
	 *   adults = records;
	 * }, ( err ) => {
	 *   adults = [];
	 *   console.error( err.stack || err.message || err );
	 * } );
	 */
	select ( where ) {
		let defer = deferred();
		let functions = [];
		let clauses, cond, index, result, sorted, values, worker;

		if ( !( where instanceof Object ) ) {
			defer.reject( new Error( label.invalidArguments ) );
		} else {
			utility.iterate( where, ( v, k ) => {
				if ( typeof v === "function" ) {
					this[ k ] = v.toString();
					functions.push( k );
				}
			} );

			if ( webWorker ) {
				try {
					worker = utility.worker( defer );
					worker.postMessage( {
						cmd: "select",
						indexes: this.indexes,
						records: this.records,
						where: json.encode( where ),
						functions: functions
					} );
				}
				catch ( e ) {
					// Probably IE10, which doesn't have the correct security flag for local loading
					webWorker = false;

					this.select( where ).then( ( arg ) => {
						defer.resolve( arg );
					}, ( e ) => {
						defer.reject( e );
					} );
				}
			} else {
				clauses = array.fromObject( where );
				sorted = array.flat( clauses ).filter( ( i, idx ) => {
					return idx % 2 === 0;
				} ).map( function ( i ) { return i.toString(); } ).sort( array.sort );
				index = sorted.join( "|" );
				values = sorted.map( ( i ) => {
					return where[ i ];
				} ).join( "|" );
				cond = "return ( ";

				if ( functions.length === 0 && this.indexes[ index ] ) {
					result = ( this.indexes[ index ][ values ] || [] ).map( ( i ) => {
						return this.records[ i ];
					} );
				} else {
					if ( clauses.length > 1 ) {
						array.each( clauses, ( i, idx ) => {
							let b1 = "( ";

							if ( idx > 0 ) {
								b1 = " && ( ";
							}

							if ( i[ 1 ] instanceof Function ) {
								cond += b1 + i[ 1 ].toString() + "( rec.data[\"" + i[ 0 ] + "\"] ) )";
							} else if ( !isNaN( i[ 1 ] ) ) {
								cond += b1 + "rec.data[\"" + i[ 0 ] + "\"] === " + i[ 1 ] + " )";
							} else {
								cond += b1 + "rec.data[\"" + i[ 0 ] + "\"] === \"" + i[ 1 ] + "\" )";
							}
						} );
					} else {
						if ( clauses[ 0 ][ 1 ] instanceof Function ) {
							cond += clauses[ 0 ][ 1 ].toString() + "( rec.data[\"" + clauses[ 0 ][ 0 ] + "\"] )";
						} else if ( !isNaN( clauses[ 0 ][ 1 ] ) ) {
							cond += "rec.data[\"" + clauses[ 0 ][ 0 ] + "\"] === " + clauses[ 0 ][ 1 ];
						} else {
							cond += "rec.data[\"" + clauses[ 0 ][ 0 ] + "\"] === \"" + clauses[ 0 ][ 1 ] + "\"";
						}
					}

					cond += " );";

					result = utility.clone( this.records, true ).filter( new Function( "rec", cond ) );
				}

				defer.resolve( result );
			}
		}

		return defer;
	};

	/**
	 * Creates or updates an existing record
	 *
	 * @method set
	 * @memberOf keigai.DataStore
	 * @param  {Mixed}   key       [Optional] Integer or String to use as a Primary Key
	 * @param  {Object}  data      Key:Value pairs to set as field values
	 * @param  {Boolean} batch     [Optional] True if called by data.batch
	 * @param  {Boolean} overwrite [Optional] Overwrites the existing record, if found
	 * @return {Object} {@link keigai.Deferred}
	 * @fires keigai.DataStore#beforeSet Fires before the record is set
	 * @fires keigai.DataStore#afterSet Fires after the record is set, the record is the argument for listeners
	 * @fires keigai.DataStore#failedSet Fires if the store is RESTful and the action is denied
	 * @example
	 * // Creating a new record
	 * store.set( null, {...} );
	 *
	 * // Updating a record
	 * store.set( "key", {...} );
	 */
	set ( key, data, batch=false, overwrite=false ) {
		data = utility.clone( data, true );

		let events = this.events;
		let defer = deferred();
		let record = key !== null ? this.get( key ) || null : data[ this.key ] ? this.get( data[ this.key ] ) || null : null;
		let method = "POST";
		let parsed = utility.parse( this.uri || "" );
		let uri, odata, rdefer;

		let patch = ( overwrite, data, ogdata ) => {
			let ndata = [];

			if ( overwrite ) {
				array.each( array.keys( ogdata ), ( k ) => {
					if ( k !== this.key && data[ k ] === undefined ) {
						ndata.push( { op: "remove", path: "/" + k } );
					}
				} );
			}

			utility.iterate( data, ( v, k ) => {
				if ( k !== this.key && ogdata[ k ] === undefined ) {
					ndata.push( { op: "add", path: "/" + k, value: v } );
				} else if ( json.encode( ogdata[ k ] ) !== json.encode( v ) ) {
					ndata.push( { op: "replace", path: "/" + k, value: v } );
				}
			} );

			return ndata;
		};

		if ( typeof data === "string" ) {
			if ( data.indexOf( "//" ) === -1 ) {
				// Relative path to store, i.e. a child
				if ( data.charAt( 0 ) !== "/" ) {
					uri = this.buildUri( data );
				}
				// Root path, relative to store, i.e. a domain
				else if ( this.uri !== null && regex.root.test( data ) ) {
					uri = parsed.protocol + "//" + parsed.host + data;
				} else {
					uri = data;
				}
			} else {
				uri = data;
			}

			key = uri.replace( regex.not_endpoint, "" );

			if ( string.isEmpty( key ) ) {
				defer.reject( new Error( label.invalidArguments ) );
			} else {
				if ( !batch && events ) {
					this.dispatch( "beforeSet", { key: key, data: data } );
				}

				client.request( uri, "GET", null, utility.merge( { withCredentials: this.credentials }, this.headers ) ).then( ( arg ) => {
					this.setComplete( record, key, this.source ? utility.walk( arg, this.source ) : arg, batch, overwrite, defer );
				}, ( e ) => {
					this.dispatch( "failedSet", e );
					defer.reject( e );
				} );
			}
		} else {
			if ( !batch && events ) {
				this.dispatch( "beforeSet", { key: key, data: data } );
			}

			if ( batch || this.uri === null ) {
				this.setComplete( record, key, data, batch, overwrite, defer );
			} else {
				if ( key !== null ) {
					uri = this.buildUri( key );
					method = "PATCH";
					odata = utility.clone( data, true );
					data = patch( overwrite, data, this.dump( [ record ] )[ 0 ] );
				} else {
					// Dropping query string
					uri = parsed.protocol + "//" + parsed.host + parsed.pathname;
				}

				rdefer = client.request( uri, method, data, utility.merge( { withCredentials: this.credentials }, this.headers ) );
				rdefer.then( ( arg ) => {
					let change;

					if ( rdefer.xhr.status !== 204 && rdefer.xhr.status < 300 ) {
						change = key === null ? ( this.source ? utility.walk( arg, this.source ) : arg ) : odata;
					} else {
						change = odata;
					}

					this.setComplete( record, key, change, batch, overwrite, defer );
				}, ( e ) => {
					if ( method === "PATCH" ) {
						method = "PUT";
						data = utility.clone( odata, true );

						utility.iterate( record.data, ( v, k ) => {
							data[ k ] = v;
						} );

						client.request( uri, method, data, utility.merge( { withCredentials: this.credentials }, this.headers ) ).then( () => {
							this.setComplete( record, key, odata, batch, overwrite, defer );
						}, ( e ) => {
							this.dispatch( "failedSet", e );
							defer.reject( e );
						} );
					} else {
						this.dispatch( "failedSet", e );
						defer.reject( e );
					}
				} );
			}
		}

		return defer;
	}

	/**
	 * Set completion
	 *
	 * @method setComplete
	 * @memberOf keigai.DataStore
	 * @param  {Mixed}   record    DataStore record, or `null` if new
	 * @param  {String}  key       Record key
	 * @param  {Object}  data      Record data
	 * @param  {Boolean} batch     `true` if part of a batch operation
	 * @param  {Boolean} overwrite Overwrites the existing record, if found
	 * @param  {Object}  defer     Deferred instance
	 * @return {Object} {@link keigai.DataStore}
	 * @private
	 */
	setComplete ( record, key, data, batch, overwrite, defer ) {
		// Clearing views
		this.views = {};

		// Setting key
		if ( key === null ) {
			if ( this.key !== null && data[ this.key ] !== undefined && data[ this.key ] !== null ) {
				key = data[ this.key ].toString();
			} else {
				key = utility.uuid();
			}
		}

		// Removing primary key from data
		if ( this.key ) {
			delete data[ this.key ];
		}

		// Create
		if ( record === null ) {
			record = {
				index: this.total++,
				key: key,
				data: data,
				indexes: []
			};

			this.indexes.key[ key ] = record.index;
			this.records[ record.index ] = record;

			if ( this.versioning ) {
				this.versions[ record.key ] = lru.factory( VERSIONS );
				this.versions[ record.key ].nth = 0;
			}
		}
		// Update
		else {
			if ( this.versioning ) {
				if ( this.versions[ record.key ] === undefined ) {
					this.versions[ record.key ] = lru.factory( VERSIONS );
					this.versions[ record.key ].nth = 0;
				}

				this.versions[ record.key ].set( "v" + ( ++this.versions[ record.key ].nth ), this.dump( [ record ] )[ 0 ] );
			}

			// By reference
			record = this.records[ record.index ];

			if ( overwrite ) {
				record.data = {};
			}

			utility.iterate( data, ( v, k ) => {
				record.data[ k ] = v;
			} );

			// Snapshot that's safe to hand out
			record = utility.clone( record, true );
		}

		this.setIndexes( record );

		if ( !batch ) {
			if ( this.autosave ) {
				this.save();
			}

			if ( this.events ) {
				this.dispatch( "afterSet", record );
			}

			array.each( this.lists, ( i ) => {
				i.refresh();
			} );
		}

		if ( defer !== undefined ) {
			defer.resolve( record );
		}

		return this;
	};

	/**
	 * Gets or sets an explicit expiration of data
	 *
	 * @method setExpires
	 * @memberOf keigai.DataStore
	 * @param  {Number} arg Milliseconds until data is stale
	 * @return {Object} {@link keigai.DataStore}
	 * @example
	 * store.setExpires( 5 * 60 * 1000 ); // Resyncs every 5 minutes
	 */
	setExpires ( arg ) {
		let id = this.id + "Expire";
		let expires = arg;

		// Expiry cannot be less than a second, and must be a valid scenario for consumption; null will disable repetitive expiration
		if ( ( arg !== null && this.uri === null ) || ( arg !== null && ( isNaN( arg ) || arg < 1000 ) ) ) {
			throw new Error( label.invalidArguments );
		}

		if ( this.expires === arg ) {
			return;
		}

		this.expires = arg;

		utility.clearTimers( id );

		if ( arg === null ) {
			return;
		}

		utility.repeat( () => {
			if ( this.uri === null ) {
				this.setExpires( null );

				return false;
			}

			this.dispatch( "beforeExpire" );
			cache.expire( this.uri );
			this.dispatch( "expire" );
			this.dispatch( "afterExpire" );
		}, expires, id, false );
	};

	/**
	 * Sets indexes for a record using `store.indexes`
	 *
	 * Composite indexes are supported, but require keys be in alphabetical order, e.g. "age|name"
	 *
	 * @method setIndexes
	 * @memberOf keigai.DataStore
	 * @param  {Object} arg DataStore Record
	 * @return {Object} {@link keigai.DataStore}
	 * @example
	 * store.setIndexes( record );
	 */
	setIndexes ( arg ) {
		let delimter = "|";

		arg.indexes = [];

		array.each( this.index, ( i ) => {
			let keys = i.split( delimter );
			let values = "";

			if ( this.indexes[ i ] === undefined ) {
				this.indexes[ i ] = {};
			}

			array.each( keys, ( k, kdx ) => {
				values += ( kdx > 0 ? delimter : "" ) + arg.data[ k ];
			} );

			if ( this.indexes[ i ][ values ] === undefined ) {
				this.indexes[ i ][ values ] = [];
			}

			if ( !array.contains( this.indexes[ i ][ values ], arg.index ) ) {
				this.indexes[ i ][ values ].push( arg.index );
				arg.indexes.push( [ i, values ] );
			}
		} );

		return this;
	}

	/**
	 * Sets the RESTful API end point
	 *
	 * @method setUri
	 * @memberOf keigai.DataStore
	 * @param  {String} arg API collection end point
	 * @return {Object}     Deferred
	 * @example
	 * store.setUri( "..." ).then( ( records ) => {
	 *   ...
	 * }, ( err ) => {
	 *   ...
	 * } );
	 */
	setUri ( arg ) {
		let defer = deferred();
		let parsed;

		if ( arg !== null && string.isEmpty( arg ) ) {
			defer.reject( new Error( label.invalidArguments ) );
		}

		if ( arg === null ) {
			this.uri = arg;
		} else {
			parsed = utility.parse( arg );
			this.uri = parsed.protocol + "//" + parsed.host + parsed.path;

			if ( !string.isEmpty( parsed.auth ) && !this.headers.authorization && !this.headers.Authorization ) {
				this.headers.Authorization = "Basic " + btoa( decodeURIComponent( parsed.auth ) );
			}

			this.on( "expire", () => {
				this.sync();
			}, "resync" );

			cache.expire( this.uri );

			this.sync().then( ( arg ) => {
				defer.resolve( arg );
			}, ( e ) => {
				defer.reject( e );
			} );
		}

		return defer;
	}

	/**
	 * Creates, or returns a cached view of the records (not by reference)
	 *
	 * @method sort
	 * @memberOf keigai.DataStore
	 * @param  {String} query  SQL ( style ) order by
	 * @param  {String} create [Optional, default behavior is true, value is false] Boolean determines whether to recreate a view if it exists
	 * @param  {Object} where  [Optional] Object describing the WHERE clause
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * store.sort( "age desc, name" ).then( ( records ) => {
	 *   ...
	 * }, ( err ) => {
	 *   ...
	 * } );
	 */
	sort ( query, create, where ) {
		create = ( create === true || ( where instanceof Object ) );

		let view = string.toCamelCase( string.explode( query ).join( " " ) );
		let defer = deferred();

		// Next phase
		let next = ( records ) => {
			let worker;

			if ( this.total === 0 ) {
				defer.resolve( [] );
			} else if ( !create && this.views[ view ] ) {
				defer.resolve( this.views[ view ] );
			} else if ( webWorker ) {
				defer.then( ( arg ) => {
					this.views[ view ] = arg;

					return this.views[ view ];
				}, ( e ) => {
					utility.error( e );
				} );

				try {
					worker = utility.worker( defer );
					worker.postMessage( { cmd: "sort", indexes: this.indexes, records: records, query: query } );
				}
				catch ( e ) {
					// Probably IE10, which doesn't have the correct security flag for local loading
					webWorker = false;

					this.views[ view ] = array.keySort( records, query, "data" );
					defer.resolve( this.views[ view ] );
				}
			} else {
				this.views[ view ] = array.keySort( records, query, "data" );
				defer.resolve( this.views[ view ] );
			}
		};

		if ( !where ) {
			next( utility.clone( this.records, true ) );
		} else {
			this.select( where ).then( next, ( e ) => {
				defer.reject( e );
			} );
		}

		return defer;
	}

	/**
	 * Storage interface
	 *
	 * SQL/NoSQL backends will be used if configured in lieu of localStorage (node.js only)
	 *
	 * @method storage
	 * @memberOf keigai.DataStore
	 * @param  {Mixed}  obj  Record ( Object, key or index ) or store
	 * @param  {Object} op   Operation to perform ( get, remove or set )
	 * @param  {String} type [Optional] Type of Storage to use ( local, session [local] )
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * store.storage( store, "set" );
	 */
	storage ( obj, op, type ) {
		let self = this;
		let record = false;
		let mongo = !string.isEmpty( this.mongodb );
		let session = ( type === "session" && typeof sessionStorage !== "undefined" );
		let defer = deferred();
		let data, key, result;

		if ( !regex.number_string_object.test( typeof obj ) || !regex.get_remove_set.test( op ) ) {
			defer.reject( new Error( label.invalidArguments ) );
		} else {
			record = ( regex.number_string.test( typeof obj ) || obj.hasOwnProperty( "data" ) );

			if ( op !== "remove" ) {
				if ( record && !( obj instanceof Object ) ) {
					obj = this.get( obj );
				}

				key = record ? obj.key : obj.id;
			} else if ( op === "remove" && record ) {
				key = obj.key || obj;
			}

			if ( mongo ) {
				mongodb.connect( this.mongodb, ( e, db ) => {
					if ( e ) {
						if ( db ) {
							db.close();
						}

						return defer.reject( e );
					}

					db.collection( this.id, ( e, collection ) => {
						if ( e ) {
							db.close();
							return defer.reject( e );
						}

						if ( op === "get" ) {
							if ( record ) {
								collection.find( { _id: obj.key } ).limit( 1 ).toArray( ( e, recs ) => {
									db.close();

									if ( e ) {
										defer.reject( e );
									} else if ( recs.length === 0 ) {
										defer.resolve( null );
									} else {
										delete recs[ 0 ]._id;

										this.set( key, recs[ 0 ], true ).then( ( rec ) => {
											defer.resolve( rec );
										}, ( e ) => {
											defer.reject( e );
										} );
									}
								} );
							} else {
								collection.find( {} ).toArray( ( e, recs ) => {
									let i, nth;

									if ( e ) {
										db.close();
										return defer.reject( e );
									}

									i = -1;
									nth = recs.length;

									if ( nth > 0 ) {
										this.records = recs.map( ( r ) => {
											let rec = { key: r._id, index: ++i, data: {} };

											this.indexes.key[ rec.key ] = rec.index;
											rec.data = r;
											delete rec.data._id;
											this.setIndexes( rec );

											return rec;
										} );

										this.total = nth;
									}

									db.close();
									defer.resolve( this.records );
								} );
							}
						} else if ( op === "remove" ) {
							collection.remove( record ? { _id: key } : {}, { safe: true }, ( e, arg ) => {
								db.close();

								if ( e ) {
									defer.reject( e );
								} else {
									defer.resolve( arg );
								}
							} );
						} else if ( op === "set" ) {
							if ( record ) {
								collection.update( { _id: obj.key }, obj.data, {
									w: 1,
									safe: true,
									upsert: true
								}, ( e, arg ) => {
									db.close();

									if ( e ) {
										defer.reject( e );
									} else {
										defer.resolve( arg );
									}
								} );
							} else {
								// Removing all documents & re-inserting
								collection.remove( {}, { w: 1, safe: true }, ( e ) => {
									let deferreds;

									if ( e ) {
										db.close();
										return defer.reject( e );

									} else {
										deferreds = [];

										array.each( this.records, ( i ) => {
											let data = {};
											let defer2 = deferred();

											deferreds.push( defer2 );

											utility.iterate( i.data, ( v, k ) => {
												data[ k ] = v;
											} );

											collection.update( { _id: i.key }, data, {
												w: 1,
												safe: true,
												upsert: true
											}, ( e, arg ) => {
												if ( e ) {
													defer2.reject( e );
												} else {
													defer2.resolve( arg );
												}
											} );
										} );

										utility.when( deferreds ).then( ( result ) => {
											db.close();
											defer.resolve( result );
										}, ( e ) => {
											db.close();
											defer.reject( e );
										} );
									}
								} );
							}
						} else {
							db.close();
							defer.reject( null );
						}
					} );
				} );
			} else {
				if ( op === "get" ) {
					result = session ? sessionStorage.getItem( key ) : localStorage.getItem( key );

					if ( result !== null ) {
						result = json.decode( result );

						if ( record ) {
							this.set( key, result, true ).then( ( rec ) => {
								defer.resolve( rec );
							}, ( e ) => {
								defer.reject( e );
							} );
						} else {
							utility.merge( self, result );
							defer.resolve( self );
						}
					} else {
						defer.resolve( self );
					}

					// Decorating loaded state for various code paths
					defer.then( () => {
						this.loaded = true;
					}, ( e ) => {
						throw e;
					} );
				} else if ( op === "remove" ) {
					session ? sessionStorage.removeItem( key ) : localStorage.removeItem( key );
					defer.resolve( this );
				} else if ( op === "set" ) {
					data = json.encode( record ? obj.data : {
						total: this.total,
						index: this.index,
						indexes: this.indexes,
						records: this.records
					} );
					session ? sessionStorage.setItem( key, data ) : localStorage.setItem( key, data );
					defer.resolve( this );
				} else {
					defer.reject( null );
				}
			}
		}

		return defer;
	}

	/**
	 * Syncs the DataStore with a URI representation
	 *
	 * @method sync
	 * @memberOf keigai.DataStore
	 * @return {Object} {@link keigai.Deferred}
	 * @fires keigai.DataStore#beforeSync Fires before syncing the DataStore
	 * @fires keigai.DataStore#afterSync Fires after syncing the DataStore
	 * @fires keigai.DataStore#failedSync Fires when an exception occurs
	 * @example
	 * store.sync().then( ( records ) => {
	 *   ...
	 * }, ( err ) => {
	 *   ...
	 * } );
	 */
	sync () {
		let events = ( this.events === true );
		let defer = deferred();

		/**
		 * Resolves public deferred
		 *
		 * @method success
		 * @memberOf keigai.DataStore.sync
		 * @private
		 * @param  {Object} arg API response
		 * @return {Undefined}  undefined
		 */
		let success = ( arg ) => {
			let data;

			if ( typeof arg !== "object" ) {
				return failure( new Error( label.expectedObject ) );
			}

			if ( this.source !== null ) {
				arg = utility.walk( arg, this.source );
			}

			if ( arg instanceof Array ) {
				data = arg;
			} else {
				data = [ arg ];
			}

			this.batch( "set", data, true ).then( ( arg ) => {
				if ( events ) {
					this.dispatch( "afterSync", arg );
				}

				defer.resolve( arg );
			}, failure );
		};

		/**
		 * Rejects public deferred
		 *
		 * @method failure
		 * @memberOf keigai.DataStore.sync
		 * @private
		 * @param  {Object} e Error instance
		 * @return {Undefined} undefined
		 */
		let failure = ( e ) => {
			if ( events ) {
				this.dispatch( "failedSync", e );
			}

			defer.reject( e );
		};

		if ( this.uri === null || string.isEmpty( this.uri ) ) {
			defer.reject( new Error( label.invalidArguments ) );
		} else {
			if ( events ) {
				this.dispatch( "beforeSync", this.uri );
			}

			if ( this.callback !== null ) {
				client.jsonp( this.uri, { callback: this.callback } ).then( success, failure );
			} else {
				client.request( this.uri, "GET", null, utility.merge( { withCredentials: this.credentials }, this.headers ) ).then( success, failure );
			}
		}

		return defer;
	}

	/**
	 * Tears down a store & expires all records associated to an API
	 *
	 * @method teardown
	 * @memberOf keigai.DataStore
	 * @return {Object} {@link keigai.DataStore}
	 * @example
	 * store.teardown();
	 */
	teardown () {
		let uri = this.uri;
		let id;

		if ( uri !== null ) {
			cache.expire( uri, true );

			id = this.id + "DataExpire";
			utility.clearTimers( id );

			array.each( this.records, ( i ) => {
				let recordUri = uri + "/" + i.key;

				cache.expire( recordUri, true );
			} );
		}

		array.each( this.lists, ( i ) => {
			i.teardown( true );
		} );

		this.clear( true );
		this.dispatch( "afterTeardown" );

		return this;
	}

	/**
	 * Undoes the last modification to a record, if it exists
	 *
	 * @method undo
	 * @memberOf keigai.DataStore
	 * @param  {Mixed}  key     Key or index
	 * @param  {String} version [Optional] Version to restore
	 * @return {Object}         Deferred
	 * @example
	 * // Didn't like the new version, so undo the change
	 * store.undo( "key", "v1" );
	 */
	undo ( key, version ) {
		let record = this.get( key );
		let defer = deferred();
		let versions = this.versions[ record.key ];
		let previous;

		if ( record === undefined ) {
			defer.reject( new Error( label.invalidArguments ) );
		} else {
			if ( versions ) {
				previous = versions.get( version || versions.first );

				if ( previous === undefined ) {
					defer.reject( label.datastoreNoPrevVersion );
				} else {
					this.set( key, previous ).then( ( arg ) => {
						defer.resolve( arg );
					}, ( e ) => {
						defer.reject( e );
					} );
				}
			} else {
				defer.reject( label.datastoreNoPrevVersion );
			}
		}

		return defer;
	}

	/**
	 * Returns Array of unique values of `key`
	 *
	 * @method unique
	 * @memberOf keigai.DataStore
	 * @param  {String} key Field to compare
	 * @return {Array}      Array of values
	 * @example
	 * let ages = store.unique( "age" );
	 */
	unique ( key ) {
		return array.unique( this.records.map( ( i ) => {
			return i.data[ key ];
		} ) );
	}

	/**
	 * Applies a difference to a record
	 *
	 * Use `data.set()` if `data` is the complete field set
	 *
	 * @method update
	 * @memberOf keigai.DataStore
	 * @param  {Mixed}  key  Key or index
	 * @param  {Object} data Key:Value pairs to set as field values
	 * @return {Object} {@link keigai.Deferred}
	 * @example
	 * store.update( "key", {age: 34} );
	 */
	update ( key, data ) {
		let record = this.get( key );
		let defer = deferred();

		if ( record === undefined ) {
			defer.reject( new Error( label.invalidArguments ) );
		} else {
			this.set( key, utility.merge( record.data, data ) ).then( ( arg ) => {
				defer.resolve( arg );
			}, ( e ) => {
				defer.reject( e );
			} );
		}

		return defer;
	};
}

/**
 * @namespace store
 */
let store = {
	/**
	 * Decorates a DataStore on an Object
	 *
	 * @method factory
	 * @memberOf store
	 * @param  {Mixed}  recs [Optional] Data to set with this.batch
	 * @param  {Object} args [Optional] Arguments to set on the store
	 * @return {Object} {@link keigai.DataStore}
	 * @example
	 * let store = keigai.store(null, {key: "guid"});
	 *
	 * store.setUri( "http://..." ).then( ( records ) => {
	 *   // Do something with the records
	 * }, ( e ) => {
	 *   // Handle `e`
	 * } );
	 */
	factory: function ( recs, args ) {
		let obj = new DataStore();

		if ( args instanceof Object ) {
			utility.merge( obj, args );
		}

		if ( recs !== null && typeof recs === "object" ) {
			obj.batch( "set", recs );
		}

		return obj;
	},

	/**
	 * DataStore worker handler
	 *
	 * @method worker
	 * @memberOf store
	 * @param  {Object} ev Event
	 * @return {Undefined} undefined
	 * @private
	 */
	worker: function ( ev ) {
		let cmd = ev.data.cmd;
		let records = ev.data.records;
		let clauses, cond, functions, indexes, index, result, sorted, where, values;

		if ( cmd === "select" ) {
			where = JSON.parse( ev.data.where );
			functions = ev.data.functions;
			clauses = array.fromObject( where );
			sorted = array.flat( clauses ).filter( ( i, idx ) => {
				return idx % 2 === 0;
			} ).sort( array.sort );
			index = sorted.join( "|" );
			values = sorted.map( ( i ) => {
				return where[ i ];
			} ).join( "|" );
			indexes = ev.data.indexes;
			cond = "return ( ";

			if ( functions.length === 0 && indexes[ index ] ) {
				result = ( indexes[ index ][ values ] || [] ).map( ( i ) => {
					return records[ i ];
				} );
			} else {
				if ( clauses.length > 1 ) {
					array.each( clauses, ( i, idx ) => {
						let b1 = "( ";

						if ( idx > 0 ) {
							b1 = " && ( ";
						}

						if ( array.contains( functions, i[ 0 ] ) ) {
							cond += b1 + i[ 1 ] + "( rec.data[\"" + i[ 0 ] + "\"] ) )";
						} else if ( !isNaN( i[ 1 ] ) ) {
							cond += b1 + "rec.data[\"" + i[ 0 ] + "\"] === " + i[ 1 ] + " )";
						} else {
							cond += b1 + "rec.data[\"" + i[ 0 ] + "\"] === \"" + i[ 1 ] + "\" )";
						}
					} );
				} else {
					if ( array.contains( functions, clauses[ 0 ][ 0 ] ) ) {
						cond += clauses[ 0 ][ 1 ] + "( rec.data[\"" + clauses[ 0 ][ 0 ] + "\"] )";
					} else if ( !isNaN( clauses[ 0 ][ 1 ] ) ) {
						cond += "rec.data[\"" + clauses[ 0 ][ 0 ] + "\"] === " + clauses[ 0 ][ 1 ];
					} else {
						cond += "rec.data[\"" + clauses[ 0 ][ 0 ] + "\"] === \"" + clauses[ 0 ][ 1 ] + "\"";
					}
				}

				cond += " );";

				result = records.filter( new Function( "rec", cond ) );
			}
		} else if ( cmd === "sort" ) {
			result = array.keySort( records, ev.data.query, "data" );
		}

		postMessage( result );
	}
};
