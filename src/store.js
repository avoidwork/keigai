/**
 * @namespace store
 */
var store = {
	/**
	 * Decorates a DataStore on an Object
	 *
	 * @method factory
	 * @memberOf store
	 * @param  {Mixed}  recs [Optional] Data to set with this.batch
	 * @param  {Object} args [Optional] Arguments to set on the store
	 * @return {Object} {@link keigai.DataStore}
	 * @example
	 * var store = keigai.store(null, {key: "guid"});
	 *
	 * store.setUri( "http://..." ).then( function ( records ) {
	 *   // Do something with the records
	 * }, function ( e ) {
	 *   // Handle `e`
	 * } );
	 */
	factory : function ( recs, args ) {
		var obj = new DataStore();

		if ( args instanceof Object ) {
			utility.merge( obj, args );
		}

		if ( recs !== null && typeof recs == "object" ) {
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
	worker : function ( ev ) {
		var cmd     = ev.data.cmd,
		    records = ev.data.records,
		    clauses, cond, functions, indexes, index, result, sorted, where, values;

		if ( cmd === "select" ) {
			where     = JSON.parse( ev.data.where );
			functions = ev.data.functions;
			clauses   = array.fromObject( where );
			sorted    = array.flat( clauses ).filter( function ( i, idx ) { return idx % 2 === 0; } ).sort( array.sort );
			index     = sorted.join( "|" );
			values    = sorted.map( function ( i ) { return where[i]; } ).join( "|" );
			indexes   = ev.data.indexes;
			cond      = "return ( ";

			if ( functions.length === 0 && indexes[index] ) {
				result = ( indexes[index][values] || [] ).map( function ( i ) {
					return records[i];
				} );
			}
			else {
				if ( clauses.length > 1 ) {
					array.each( clauses, function ( i, idx ) {
						var b1 = "( ";

						if ( idx > 0 ) {
							b1 = " && ( ";
						}

						if ( array.contains( functions, i[0] ) ) {
							cond += b1 + i[1] + "( rec.data[\"" + i[0] + "\"] ) )";
						}
						else if (!isNaN(i[1])) {
							cond += b1 + "rec.data[\"" + i[0] + "\"] === " + i[1] + " )";
						}
						else {
							cond += b1 + "rec.data[\"" + i[0] + "\"] === \"" + i[1] + "\" )";
						}
					} );
				}
				else {
					if ( array.contains( functions, clauses[0][0] ) ) {
						cond += clauses[0][1] + "( rec.data[\"" + clauses[0][0] + "\"] )";
					}
					else if ( !isNaN( clauses[0][1] ) ) {
						cond += "rec.data[\"" + clauses[0][0] + "\"] === " + clauses[0][1];
					}
					else {
						cond += "rec.data[\"" + clauses[0][0] + "\"] === \"" + clauses[0][1] + "\"";
					}
				}

				cond += " );";

				result = records.filter( new Function("rec", cond ) );
			}
		}
		else if ( cmd === "sort" ) {
			result = array.keySort( records, ev.data.query, "data" );
		}

		postMessage( result );
	}
};

/**
 * Creates a new DataStore
 *
 * @constructor
 * @memberOf keigai
 * @extends {keigai.Base}
 * @example
 * var store = keigai.store();
 */
function DataStore () {
	this.autosave    = false;
	this.callback    = null;
	this.credentials = null;
	this.lists       = [];
	this.events      = true;
	this.expires     = null;
	this.headers     = {Accept: "application/json"};
	this.ignore      = [];
	this.index       = [];
	this.indexes     = {key: {}};
	this.key         = null;
	this.loaded      = false;
	this.mongodb     = "";
	this.observer    = observable.factory();
	this.records     = [];
	this.source      = null;
	this.total       = 0;
	this.versions    = {};
	this.versioning  = true;
	this.views       = {};
	this.uri         = null;
}

/**
 * Extending Base
 *
 * @memberOf keigai.DataGrid
 * @type {Object} {@link keigai.Base}
 */
DataStore.prototype = base.factory();

/**
 * Setting constructor loop
 *
 * @method constructor
 * @memberOf keigai.DataStore
 * @type {Function}
 * @private
 */
DataStore.prototype.constructor = DataStore;

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
 * store.batch( "set", [...] ).then( function ( records ) {
 *   ...
 * }, function ( err ) {
 *   ...
 * } );
 */
DataStore.prototype.batch = function ( type, data, sync ) {
	sync          = ( sync === true );
	var self      = this,
	    events    = this.events,
	    defer     = deferred.factory(),
	    deferreds = [];

	if ( !regex.set_del.test( type ) || ( sync && regex.del.test( type ) ) || typeof data != "object" ) {
		defer.reject( new Error( label.invalidArguments ) );
	}
	else {
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
		}
		else {
			// Batch deletion will create a sparse array, which will be compacted before re-indexing
			if ( type === "del" ) {
				array.each( data, function ( i ) {
					deferreds.push( self.del( i, false, true ) );
				} );
			}
			else {
				array.each( data, function ( i ) {
					deferreds.push( self.set( null, i, true ) );
				} );
			}

			this.loaded = false;

			utility.when( deferreds ).then( function ( args ) {
				self.loaded = true;

				if ( events ) {
					self.dispatch( "afterBatch", args );
				}

				// Forcing a clear of views to deal with async nature of workers & staggered loading
				array.each( self.lists, function ( i ) {
					i.refresh( true );
				} );

				if ( type === "del" ) {
					self.records = array.compact( self.records );
					self.reindex();
				}

				if ( self.autosave ) {
					self.save();
				}

				defer.resolve( args );
			}, function ( e ) {
				if ( events ) {
					self.dispatch( "failedBatch", e );
				}

				defer.reject( e );
			} );
		}
	}

	return defer;
};

/**
 * Builds a URI
 *
 * @method buildUri
 * @memberOf keigai.DataStore
 * @param  {String} key Record key
 * @return {String}     URI
 * @example
 * var uri = store.buildUri( "key" );
 */
DataStore.prototype.buildUri = function ( key ) {
	var parsed = utility.parse( this.uri );

	return parsed.protocol + "//" + parsed.host + parsed.pathname + ( regex.endslash.test( parsed.pathname ) ? "" : "/" ) + key;
};

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
DataStore.prototype.clear = function ( sync ) {
	sync       = ( sync === true );
	var events = ( this.events === true ),
	    resave = ( this.autosave === true );

	if ( !sync ) {
		if ( events ) {
			this.dispatch( "beforeClear" );
		}

		array.each( this.lists, function ( i ) {
			if ( i ) {
				i.teardown( true );
			}
		} );

		this.autosave    = false;
		this.callback    = null;
		this.credentials = null;
		this.lists       = [];
		this.events      = true;
		this.expires     = null;
		this.headers     = {Accept: "application/json"};
		this.ignore      = [];
		this.index       = [];
		this.indexes     = {key: {}};
		this.key         = null;
		this.loaded      = false;
		this.records     = [];
		this.source      = null;
		this.total       = 0;
		this.versions    = {};
		this.versioning  = true;
		this.views       = {};
		this.uri         = null;

		if ( events ) {
			this.dispatch( "afterClear" );
		}
	}
	else {
		this.indexes     = {key: {}};
		this.loaded      = false;
		this.records     = [];
		this.total       = 0;
		this.views       = {};

		array.each( this.lists, function ( i ) {
			if ( i ) {
				i.refresh();
			}
		} );
	}

	if ( resave ) {
		this.save();
	}

	return this;
};

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
 * store.del( "key" ).then( function () {
 *   console.log( "Successfully deleted " + key );
 * }, function ( err ) {
 *   console.warn( "Failed to delete " + key + ": " + err.message );
 * } );
 */
DataStore.prototype.del = function ( record, reindex, batch ) {
	record    = record.key ? record : this.get ( record );
	reindex   = ( reindex !== false );
	batch     = ( batch === true );
	var self  = this,
	    defer = deferred.factory();

	if ( record === undefined ) {
		defer.reject( new Error( label.invalidArguments ) );
	}
	else {
		if ( this.events ) {
			self.dispatch( "beforeDelete", record );
		}

		if ( this.uri === null || this.callback !== null ) {
			this.delComplete( record, reindex, batch, defer );
		}
		else {
			client.request( this.buildUri( record.key ), "DELETE", null, utility.merge( {withCredentials: this.credentials}, this.headers ) ).then( function () {
				self.delComplete( record, reindex, batch, defer );
			}, function ( e ) {
				self.dispatch( "failedDelete", e );
				defer.reject( e );
			} );
		}
	}

	return defer;
};

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
DataStore.prototype.delComplete = function ( record, reindex, batch, defer ) {
	var self = this;

	delete this.indexes.key[record.key];
	delete this.versions[record.key];

	this.total--;
	this.views = {};

	if ( !batch ) {
		array.remove( this.records, record.index );

		if ( reindex ) {
			this.reindex();
		}
		else {
			array.each( record.indexes, function ( i ) {
				array.remove( self.indexes[i[0]][i[1]], record.index );

				if ( self.indexes[i[0]][i[1]].length === 0 ) {
					delete self.indexes[i[0]][i[1]];
				}
			} );
		}

		if ( this.autosave ) {
			this.purge( record.key );
		}

		if ( this.events ) {
			this.dispatch( "afterDelete", record );
		}

		array.each( this.lists, function ( i ) {
			i.refresh();
		} );
	}
	else {
		this.records[record.index] = null;
	}

	return defer.resolve( record.key );
};

/**
 * Exports a subset or complete record set of DataStore
 *
 * @method dump
 * @memberOf keigai.DataStore
 * @param  {Array} args   [Optional] Sub-data set of DataStore
 * @param  {Array} fields [Optional] Fields to export, defaults to all
 * @return {Array}        Records
 * @example
 * var data = store.dump();
 */
DataStore.prototype.dump = function ( args, fields ) {
	args       = args || this.records;
	var self   = this,
	    custom = ( fields instanceof Array && fields.length > 0 ),
	    key    = this.key !== null,
	    fn;

	if ( custom ) {
		fn = function ( i ) {
			var record = {};

			array.each( fields, function ( f ) {
				record[f] = f === self.key ? i.key : utility.clone( i.data[f], true );
			} );

			return record;
		};
	}
	else {
		fn = function ( i ) {
			var record = {};

			if ( key ) {
				record[self.key] = i.key;
			}

			utility.iterate( i.data, function ( v, k ) {
				record[k] = utility.clone( v, true );
			} );

			return record;
		};
	}

	return args.map( fn );
};

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
 * var record = store.get( "key" );
 */
DataStore.prototype.get = function ( record, offset ) {
	var type = typeof record,
	    self = this,
	    result;

	if ( type === "undefined" ) {
		result = this.records;
	}
	else if ( type === "string" ) {
		if ( record.indexOf( "," ) === -1 ) {
			result = this.records[this.indexes.key[record]];
		}
		else {
			result = string.explode( record ).map( function ( i ) {
				if ( !isNaN( i ) ) {
					return self.records[parseInt( i, 10 )];
				}
				else {
					return self.records[self.indexes.key[i]];
				}
			} );
		}
	}
	else if ( type === "number" ) {
		if ( isNaN( offset ) ) {
			result = this.records[parseInt( record, 10 )];
		}
		else {
			result = array.limit( this.records, parseInt( record, 10 ), parseInt( offset, 10 ) );
		}
	}

	return utility.clone( result, true );
},

/**
 * Performs an (INNER/LEFT/RIGHT) JOIN on two DataStores
 *
 * @method join
 * @memberOf keigai.DataStore
 * @param  {String} arg   DataStore to join
 * @param  {String} field Field in both DataStores
 * @param  {String} join  Type of JOIN to perform, defaults to `inner`
 * @return {Object} {@link keigai.Deferred}
 * var data = store.join( otherStore, "commonField" );
 */
DataStore.prototype.join = function ( arg, field, join ) {
	join          = join || "inner";
	var self      = this,
	    defer     = deferred.factory(),
	    results   = [],
	    deferreds = [],
	    key       = field === this.key,
	    keys      = array.merge( array.keys( this.records[0].data ), array.keys( arg.records[0].data ) ),
	    fn;

	if ( join === "inner" ) {
		fn = function ( i ) {
			var where  = {},
			    record = i.data,
			    defer  = deferred.factory();

			where[field] = key ? i.key : record[field];
			
			arg.select( where ).then( function ( match ) {
				if ( match.length > 2 ) {
					defer.reject( new Error( label.databaseMoreThanOne ) );
				}
				else if ( match.length === 1 ) {
					results.push( utility.merge( record, match[0].data ) );
					defer.resolve( true );
				}
				else {
					defer.resolve( false );
				}
			} );

			deferreds.push( defer );
		};
	}
	else if ( join === "left" ) {
		fn = function ( i ) {
			var where  = {},
				record = i.data,
			    defer  = deferred.factory();

			where[field] = key ? i.key : record[field];

			arg.select( where ).then( function ( match ) {
				if ( match.length > 2 ) {
					defer.reject( new Error( label.databaseMoreThanOne ) );
				}
				else if ( match.length === 1 ) {
					results.push( utility.merge( record, match[0].data ) );
					defer.resolve( true );
				}
				else {
					array.each( keys, function ( i ) {
						if ( record[i] === undefined ) {
							record[i] = null;
						}
					} );

					results.push( record );
					defer.resolve( true );
				}
			} );

			deferreds.push( defer );
		};
	}
	else if ( join === "right" ) {
		fn = function ( i ) {
			var where  = {},
			    record = i.data,
			    defer  = deferred.factory();

			where[field] = key ? i.key : record[field];
			
			self.select( where ).then( function ( match ) {
				if ( match.length > 2 ) {
					defer.reject( new Error( label.databaseMoreThanOne ) );
				}
				else if ( match.length === 1 ) {
					results.push( utility.merge( record, match[0].data ) );
					defer.resolve( true );
				}
				else {
					array.each( keys, function ( i ) {
						if ( record[i] === undefined ) {
							record[i] = null;
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

	utility.when( deferreds ).then( function () {
		defer.resolve( results );
	}, function ( e ) {
		defer.reject( e );
	} );
	
	return defer;
};

/**
 * Retrieves only 1 field/property
 *
 * @method only
 * @memberOf keigai.DataStore
 * @param  {String} arg Field/property to retrieve
 * @return {Array}      Array of values
 * @example
 * var ages = store.only( "age" );
 */
DataStore.prototype.only = function ( arg ) {
	if ( arg === this.key ) {
		return this.records.map( function ( i ) {
			return i.key;
		} );
	}
	else {
		return this.records.map( function ( i ) {
			return i.data[arg];
		} );
	}
};

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
DataStore.prototype.purge = function ( arg ) {
	return this.storage( arg || this, "remove" );
};

/**
 * Reindexes the DataStore
 *
 * @method reindex
 * @memberOf keigai.DataStore
 * @return {Object} {@link keigai.DataStore}
 * @example
 * store.reindex();
 */
DataStore.prototype.reindex = function () {
	var self = this,
	    i    = -1,
	    tmp  = [];

	this.views   = {};
	this.indexes = {key: {}};

	if ( this.total > 0 ) {
		array.each( this.records, function ( record ) {
			if ( record !== undefined ) {
				tmp[++i]     = record;
				record.index = i;
				self.indexes.key[record.key] = i;
				self.setIndexes( record );
			}
		} );
	}

	this.records = tmp;

	return this;
};

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
DataStore.prototype.restore = function ( arg ) {
	return this.storage( arg || this, "get" );
};

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
DataStore.prototype.save = function ( arg ) {
	return this.storage( arg || this, "set" );
};

/**
 * Selects records (not by reference) based on an explicit description
 *
 * @method select
 * @memberOf keigai.DataStore
 * @param  {Object} where Object describing the WHERE clause
 * @return {Object} {@link keigai.Deferred}
 * @example
 * var adults;
 *
 * store.select( {age: function ( i ) { return i >= 21; } } ).then( function ( records ) {
 *   adults = records;
 * }, function ( err ) {
 *   ...
 * } );
 */
DataStore.prototype.select = function ( where ) {
	var self      = this,
	    defer     = deferred.factory(),
	    functions = [],
	    clauses, cond, index, result, sorted, values, worker;

	if ( !( where instanceof Object ) ) {
		defer.reject( new Error( label.invalidArguments ) );
	}
	else {
		utility.iterate( where, function ( v, k ) {
			if ( typeof v == "function" ) {
				this[k] = v.toString();
				functions.push( k );
			}
		} );

		if ( webWorker ) {
			try {
				worker = utility.worker( defer );
				worker.postMessage( {cmd: "select", indexes: this.indexes, records: this.records, where: json.encode( where ), functions: functions} );
			}
			catch ( e ) {
				// Probably IE10, which doesn't have the correct security flag for local loading
				webWorker = false;

				this.select( where ).then( function ( arg ) {
					defer.resolve( arg );
				}, function ( e ) {
					defer.reject( e );
				} );
			}
		}
		else {
			clauses = array.fromObject( where );
			sorted  = array.flat( clauses ).filter( function ( i, idx ) { return idx % 2 === 0; } ).sort( array.sort );
			index   = sorted.join( "|" );
			values  = sorted.map( function ( i ) { return where[i]; } ).join( "|" );
			cond    = "return ( ";

			if ( functions.length === 0 && this.indexes[index] ) {
				result = ( this.indexes[index][values] || [] ).map( function ( i ) {
					return self.records[i];
				} );
			}
			else {
				if ( clauses.length > 1 ) {
					array.each( clauses, function ( i, idx ) {
						var b1 = "( ";

						if ( idx > 0 ) {
							b1 = " && ( ";
						}

						if ( i[1] instanceof Function ) {
							cond += b1 + i[1].toString() + "( rec.data[\"" + i[0] + "\"] ) )";
						}
						else if ( !isNaN( i[1] ) ) {
							cond += b1 + "rec.data[\"" + i[0] + "\"] === " + i[1] + " )";
						}
						else {
							cond += b1 + "rec.data[\"" + i[0] + "\"] === \"" + i[1] + "\" )";
						}
					} );
				}
				else {
					if ( clauses[0][1] instanceof Function ) {
						cond += clauses[0][1].toString() + "( rec.data[\"" + clauses[0][0] + "\"] )";
					}
					else if ( !isNaN( clauses[0][1] ) ) {
						cond += "rec.data[\"" + clauses[0][0] + "\"] === " + clauses[0][1];
					}
					else {
						cond += "rec.data[\"" + clauses[0][0] + "\"] === \"" + clauses[0][1] + "\"";
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
DataStore.prototype.set = function ( key, data, batch, overwrite ) {
	data       = utility.clone( data, true );
	batch      = ( batch === true );
	overwrite  = ( overwrite === true );
	var self   = this,
	    events = this.events,
	    defer  = deferred.factory(),
	    record = key !== null ? this.get( key ) || null : data[this.key] ? this.get( data[this.key] ) || null : null,
	    method = "POST",
	    parsed = utility.parse( self.uri || "" ),
	    uri;

	if ( typeof data == "string" ) {
		if ( data.indexOf( "//" ) === -1 ) {
			// Relative path to store, i.e. a child
			if ( data.charAt( 0 ) !== "/" ) {
				uri = this.buildUri( data );
			}
			// Root path, relative to store, i.e. a domain
			else if ( self.uri !== null && regex.root.test( data ) ) {
				uri = parsed.protocol + "//" + parsed.host + data;
			}
			else {
				uri = data;
			}
		}
		else {
			uri = data;
		}

		key = uri.replace( regex.not_endpoint, "" );

		if ( string.isEmpty( key ) ) {
			defer.reject( new Error( label.invalidArguments ) );
		}
		else {
			if ( !batch && events ) {
				self.dispatch( "beforeSet", {key: key, data: data} );
			}

			client.request( uri, "GET", null, utility.merge( {withCredentials: self.credentials}, self.headers ) ).then( function ( arg ) {
				self.setComplete( record, key, self.source ? utility.walk( arg, self.source ) : arg, batch, overwrite, defer );
			}, function ( e ) {
				self.dispatch( "failedSet", e );
				defer.reject( e );
			} );
		}
	}
	else {
		if ( !batch && events ) {
			self.dispatch( "beforeSet", {key: key, data: data} );
		}

		if ( batch || this.uri === null ) {
			this.setComplete( record, key, data, batch, overwrite, defer );
		}
		else {
			if ( key !== null ) {
				method = "PUT";
				uri    = this.buildUri( key );

				if ( client.allows( uri, "patch" ) ) {
					method = "PATCH";
				}
				else if ( record !== null && !overwrite ) {
					utility.iterate( record.data, function ( v, k ) {
						data[k] = v;
					} );
				}
			}
			else {
				uri = this.uri;
			}

			client.request( uri, method, data, utility.merge( {withCredentials: this.credentials}, this.headers ) ).then( function ( arg ) {
				self.setComplete( record, key, self.source ? utility.walk( arg, self.source ) : arg, batch, overwrite, defer );
			}, function ( e ) {
				self.dispatch( "failedSet", e );
				defer.reject( e );
			} );
		}
	}

	return defer;
};

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
DataStore.prototype.setComplete = function ( record, key, data, batch, overwrite, defer ) {
	// Clearing views
	this.views = {};

	// Setting key
	if ( !key ) {
		if ( this.key !== null && data[this.key] ) {
			key = data[this.key].toString();
		}
		else {
			key = utility.uuid();
		}
	}

	// Removing primary key from data
	if ( this.key ) {
		delete data[this.key];
	}

	// Create
	if ( record === null ) {
		record = {
			index   : this.total++,
			key     : key,
			data    : data,
			indexes : []
		};

		this.indexes.key[key]         = record.index;
		this.records[record.index]    = record;

		if ( this.versioning ) {
			this.versions[record.key] = lru.factory( VERSIONS );
			this.versions[record.key].nth = 0;
		}
	}
	// Update
	else {
		if ( this.versioning ) {
			if ( this.versions[record.key] === undefined ) {
				this.versions[record.key]     = lru.factory( VERSIONS );
				this.versions[record.key].nth = 0;
			}

			this.versions[record.key].set( "v" + ( ++this.versions[record.key].nth ), this.dump( [record] )[0] );
		}

		if ( overwrite ) {
			record.data = {};
		}

		utility.iterate( data, function ( v, k ) {
			record.data[k] = v;
		} );
	}

	this.setIndexes( record );

	if ( !batch ) {
		if ( this.autosave ) {
			this.save();
		}

		if ( this.events ) {
			this.dispatch( "afterSet", record );
		}

		array.each( this.lists, function ( i ) {
			i.refresh();
		} );
	}

	defer.resolve( record );

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
DataStore.prototype.setExpires = function ( arg ) {
	var id      = this.id + "Expire",
	    expires = arg,
	    self    = this;

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

	utility.repeat( function () {
		if ( self.uri === null ) {
			self.setExpires( null );

			return false;
		}

		self.dispatch( "beforeExpire");
		cache.expire( self.uri );
		self.dispatch( "expire");
		self.dispatch( "afterExpire");
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
DataStore.prototype.setIndexes = function ( arg ) {
	var self     = this,
	    delimter = "|";

	arg.indexes = [];

	array.each( this.index, function ( i ) {
		var keys   = i.split( delimter ),
		    values = "";

		if ( self.indexes[i] === undefined ) {
			self.indexes[i] = {};
		}

		array.each( keys, function ( k, kdx ) {
			values += ( kdx > 0 ? delimter : "" ) + arg.data[k];
		} );

		if ( self.indexes[i][values] === undefined ) {
			self.indexes[i][values] = [];
		}

		if ( !array.contains( self.indexes[i][values], arg.index ) ) {
			self.indexes[i][values].push( arg.index );
			arg.indexes.push( [i, values] );
		}
	} );

	return this;
};

/**
 * Sets the RESTful API end point
 *
 * @method setUri
 * @memberOf keigai.DataStore
 * @param  {String} arg API collection end point
 * @return {Object}     Deferred
 * @example
 * store.setUri( "..." ).then( function ( records ) {
 *   ...
 * }, function ( err ) {
 *   ...
 * } );
 */
DataStore.prototype.setUri = function ( arg ) {
	var defer = deferred.factory(),
	    parsed;

	if ( arg !== null && string.isEmpty( arg ) ) {
		defer.reject( new Error( label.invalidArguments ) );
	}

	if ( arg === null ) {
		this.uri = arg;
	}
	else {
		parsed   = utility.parse( arg );
		this.uri = parsed.protocol + "//" + parsed.host + parsed.path;

		if ( !string.isEmpty( parsed.auth ) && !this.headers.authorization && !this.headers.Authorization ) {
			this.headers.Authorization = "Basic " + btoa( decodeURIComponent( parsed.auth ) );
		}

		this.on( "expire", function () {
			this.sync();
		}, "resync", this );

		cache.expire( this.uri );

		this.sync().then( function (arg ) {
			defer.resolve( arg );
		}, function ( e ) {
			defer.reject( e );
		} );
	}

	return defer;
};

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
 * store.sort( "age desc, name" ).then( function ( records ) {
 *   ...
 * }, function ( err ) {
 *   ...
 * } );
 */
DataStore.prototype.sort = function ( query, create, where ) {
	create      = ( create === true || ( where instanceof Object ) );
	var self    = this,
	    view    = string.toCamelCase( string.explode( query ).join( " " ) ),
	    defer   = deferred.factory(),
	    next, worker;

	// Next phase
	next = function ( records ) {
		if ( self.total === 0 ) {
			defer.resolve( [] );
		}
		else if ( !create && self.views[view] ) {
			defer.resolve( self.views[view] );
		}
		else if ( webWorker ) {
			defer.then( function ( arg ) {
				self.views[view] = arg;

				return self.views[view];
			}, function ( e ) {
				utility.error( e );
			} );

			try {
				worker = utility.worker( defer );
				worker.postMessage( {cmd: "sort", indexes: self.indexes, records: records, query: query} );
			}
			catch ( e ) {
				// Probably IE10, which doesn't have the correct security flag for local loading
				webWorker = false;

				self.views[view] = array.keySort( records, query, "data" );
				defer.resolve( self.views[view] );
			}
		}
		else {
			self.views[view] = array.keySort( records, query, "data" );
			defer.resolve( self.views[view] );
		}
	};

	if ( !where ) {
		next( utility.clone( this.records, true ) );
	}
	else {
		this.select( where ).then( next, function ( e ) {
			defer.reject( e );
		} );
	}

	return defer;
};

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
DataStore.prototype.storage = function ( obj, op, type ) {
	var self    = this,
	    record  = false,
	    mongo   = !string.isEmpty( this.mongodb ),
	    session = ( type === "session" && typeof sessionStorage != "undefined" ),
	    defer   = deferred.factory(),
	    data, key, result;

	if ( !regex.number_string_object.test( typeof obj ) || !regex.get_remove_set.test( op ) ) {
		defer.reject( new Error( label.invalidArguments ) );
	}
	else {
		record = ( regex.number_string.test( typeof obj ) || obj.hasOwnProperty( "data" ) );

		if ( op !== "remove" ) {
			if ( record && !( obj instanceof Object ) ) {
				obj = this.get( obj );
			}

			key = record ? obj.key : obj.id;
		}
		else if ( op === "remove" && record ) {
			key = obj.key || obj;
		}

		if ( mongo ) {
			mongodb.connect( this.mongodb, function ( e, db ) {
				if ( e ) {
					if ( db ) {
						db.close();
					}

					return defer.reject( e );
				}

				db.collection( self.id, function ( e, collection ) {
					if ( e ) {
						db.close();
						return defer.reject( e );
					}

					if ( op === "get" ) {
						if ( record ) {
							collection.find( {_id: obj.key} ).limit( 1 ).toArray( function ( e, recs ) {
								db.close();

								if ( e ) {
									defer.reject( e );
								}
								else if ( recs.length === 0 ) {
									defer.resolve( null );
								}
								else {
									delete recs[0]._id;

									self.set( key, recs[0], true ).then( function ( rec ) {
										defer.resolve( rec );
									}, function ( e ) {
										defer.reject( e );
									} );
								}
							} );
						}
						else {
							collection.find( {} ).toArray( function ( e, recs ) {
								var i, nth;

								if ( e ) {
									db.close();
									return defer.reject( e );
								}

								i   = -1;
								nth = recs.length;

								if ( nth > 0 ) {
									self.records = recs.map( function ( r ) {
										var rec = {key: r._id, index: ++i, data: {}};

										self.indexes.key[rec.key] = rec.index;
										rec.data = r;
										delete rec.data._id;
										self.setIndexes( rec );

										return rec;
									} );

									self.total = nth;
								}

								db.close();
								defer.resolve( self.records );
							} );
						}
					}
					else if ( op === "remove" ) {
						collection.remove( record ? {_id: key} : {}, {safe: true}, function ( e, arg ) {
							db.close();

							if ( e ) {
								defer.reject( e );
							}
							else {
								defer.resolve( arg );
							}
						} );
					}
					else if ( op === "set" ) {
						if ( record ) {
							collection.update( {_id: obj.key}, obj.data, {w: 1, safe: true, upsert: true}, function ( e, arg ) {
								db.close();

								if ( e ) {
									defer.reject( e );
								}
								else {
									defer.resolve( arg );
								}
							} );
						}
						else {
							// Removing all documents & re-inserting
							collection.remove( {}, {w: 1, safe: true}, function ( e ) {
								var deferreds;

								if ( e ) {
									db.close();
									return defer.reject( e );

								}
								else {
									deferreds = [];

									array.each( self.records, function ( i ) {
										var data   = {},
											defer2 = deferred.factory();

										deferreds.push( defer2 );

										utility.iterate( i.data, function ( v, k ) {
											data[k] = v;
										} );

										collection.update( {_id: i.key}, data, {w:1, safe:true, upsert:true}, function ( e, arg ) {
											if ( e ) {
												defer2.reject( e );
											}
											else {
												defer2.resolve( arg );
											}
										} );
									} );

									utility.when( deferreds ).then( function ( result ) {
										db.close();
										defer.resolve( result );
									}, function ( e ) {
										db.close();
										defer.reject( e );
									} );
								}
							} );
						}
					}
					else {
						db.close();
						defer.reject( null );
					}
				} );
			} );
		}
		else {
			if ( op === "get" ) {
				result = session ? sessionStorage.getItem( key ) : localStorage.getItem( key );

				if ( result !== null ) {
					result = json.decode( result );

					if ( record ) {
						self.set( key, result, true ).then( function ( rec ) {
							defer.resolve( rec );
						}, function ( e ) {
							defer.reject( e );
						} );
					}
					else {
						utility.merge( self, result );
						defer.resolve( self );
					}
				}
				else {
					defer.resolve( self );
				}

				// Decorating loaded state for various code paths
				defer.then( function () {
					self.loaded = true;
				}, function ( e ) {
					throw e;
				} );
			}
			else if ( op === "remove" ) {
				session ? sessionStorage.removeItem( key ) : localStorage.removeItem( key );
				defer.resolve( this );
			}
			else if ( op === "set" ) {
				data = json.encode( record ? obj.data : {total: this.total, index: this.index, indexes: this.indexes, records: this.records} );
				session ? sessionStorage.setItem( key, data ) : localStorage.setItem( key, data );
				defer.resolve( this );
			}
			else {
				defer.reject( null );
			}
		}
	}

	return defer;
};

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
 * store.sync().then( function ( records ) {
 *   ...
 * }, function ( err ) {
 *   ...
 * } );
 */
DataStore.prototype.sync = function () {
	var self   = this,
	    events = ( this.events === true ),
	    defer  = deferred.factory(),
	    success, failure;

	/**
	 * Resolves public deferred
	 *
	 * @method success
	 * @memberOf keigai.DataStore.sync
	 * @private
	 * @param  {Object} arg API response
	 * @return {Undefined}  undefined
	 */
	success = function ( arg ) {
		var data;

		if ( typeof arg != "object" ) {
			return failure( new Error( label.expectedObject ) );
		}

		if ( self.source !== null ) {
			arg = utility.walk( arg, self.source );
		}

		if ( arg instanceof Array ) {
			data = arg;
		}
		else {
			data = [arg];
		}

		self.batch( "set", data, true ).then( function ( arg ) {
			if ( events ) {
				self.dispatch( "afterSync", arg );
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
	failure = function ( e ) {
		if ( events ) {
			self.dispatch( "failedSync", e );
		}

		defer.reject( e );
	};

	if ( this.uri === null || string.isEmpty( this.uri ) ) {
		defer.reject( new Error( label.invalidArguments ) );
	}
	else {
		if ( events ) {
			this.dispatch( "beforeSync", this.uri );
		}

		if ( this.callback !== null ) {
			client.jsonp( this.uri, {callback: this.callback} ).then( success, failure );
		}
		else {
			client.request( this.uri, "GET", null, utility.merge( {withCredentials: this.credentials}, this.headers ) ).then( success, failure );
		}
	}

	return defer;
};

/**
 * Tears down a store & expires all records associated to an API
 *
 * @method teardown
 * @memberOf keigai.DataStore
 * @return {Object} {@link keigai.DataStore}
 * @example
 * store.teardown();
 */
DataStore.prototype.teardown = function () {
	var uri = this.uri,
	    id;

	if ( uri !== null ) {
		cache.expire( uri, true );

		id = this.id + "DataExpire";
		utility.clearTimers( id );

		array.each( this.records, function ( i ) {
			var recordUri = uri + "/" + i.key;

			cache.expire( recordUri, true );
		} );
	}

	array.each( this.lists, function ( i ) {
		i.teardown( true );
	} );

	this.clear( true );
	this.dispatch( "afterTeardown" );

	return this;
};

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
DataStore.prototype.undo = function ( key, version ) {
	var record   = this.get( key ),
	    defer    = deferred.factory(),
	    versions = this.versions[record.key],
	    previous;

	if ( record === undefined ) {
		defer.reject( new Error( label.invalidArguments ) );
	}
	else {
		if ( versions ) {
			previous = versions.get( version || versions.first );

			if ( previous === undefined ) {
				defer.reject( label.datastoreNoPrevVersion );
			}
			else {
				this.set( key, previous ).then( function ( arg ) {
					defer.resolve( arg );
				}, function ( e ) {
					defer.reject( e );
				} );
			}
		}
		else {
			defer.reject( label.datastoreNoPrevVersion );
		}
	}

	return defer;
};

/**
 * Returns Array of unique values of `key`
 *
 * @method unique
 * @memberOf keigai.DataStore
 * @param  {String} key Field to compare
 * @return {Array}      Array of values
 * @example
 * var ages = store.unique( "age" );
 */
DataStore.prototype.unique = function ( key ) {
	return array.unique( this.records.map( function ( i ) {
		return i.data[key];
	} ) );
};

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
DataStore.prototype.update = function ( key, data ) {
	var record = this.get( key ),
	    defer  = deferred.factory();

	if ( record === undefined ) {
		defer.reject( new Error( label.invalidArguments ) );
	}
	else {
		this.set( key, utility.merge( record.data, data ) ).then( function ( arg ) {
			defer.resolve( arg );
		}, function ( e ) {
			defer.reject( e );
		} );
	}

	return defer;
};
