/**
 * @namespace array
 * @private
 */
var array = {
	/**
	 * Adds 'arg' to 'obj' if it is not found
	 *
	 * @method add
	 * @memberOf array
	 * @param  {Array} obj Array to receive 'arg'
	 * @param  {Mixed} arg Argument to set in 'obj'
	 * @return {Array}     Array that was queried
	 */
	add : function ( obj, arg ) {
		if ( !array.contains( obj, arg ) ) {
			obj.push( arg );
		}

		return obj;
	},

	/**
	 * Returns an Object ( NodeList, etc. ) as an Array
	 *
	 * @method cast
	 * @memberOf array
	 * @param  {Object}  obj Object to cast
	 * @param  {Boolean} key [Optional] Returns key or value, only applies to Objects without a length property
	 * @return {Array}       Object as an Array
	 */
	cast : function ( obj, key ) {
		key   = ( key === true );
		var o = [];

		if ( !isNaN( obj.length ) ) {
			o = slice.call( obj );
		}
		else if ( key ) {
			o = array.keys( obj );
		}
		else {
			utility.iterate( obj, function ( i ) {
				o.push( i );
			} );
		}

		return o;
	},

	/**
	 * Determines if obj contains arg
	 *
	 * @method contains
	 * @memberOf array
	 * @param  {Array} obj Array to search
	 * @param  {Mixed} arg Value to look for
	 * @return {Boolean}   True if found, false if not
	 */
	contains : function ( obj, arg ) {
		return obj.indexOf( arg ) > -1;
	},

	/**
	 * Finds the difference between array1 and array2
	 *
	 * @method diff
	 * @memberOf array
	 * @param  {Array} array1 Source Array
	 * @param  {Array} array2 Comparison Array
	 * @return {Array}        Array of the differences
	 */
	diff : function ( array1, array2 ) {
		var result = [];

		array.each( array1, function ( i ) {
			if ( !array.contains( array2, i ) ) {
				array.add( result, i );
			}
		} );

		array.each( array2, function ( i ) {
			if ( !array.contains( array1, i ) ) {
				array.add( result, i );
			}
		} );

		return result;
	},

	/**
	 * Iterates `obj` and executes `fn` with arguments [`value`, `index`].
	 * Returning `false` halts iteration.
	 *
	 * @method each
	 * @memberOf array
	 * @param  {Array}    obj   Array to iterate
	 * @param  {Function} fn    Function to execute on index values
	 * @param  {Boolean}  async [Optional] Asynchronous iteration
	 * @param  {Number}   size  [Optional] Batch size for async iteration, default is 10
	 * @return {Array}          Array
	 */
	each : function ( obj, fn, async, size ) {
		var nth = obj.length,
		    i, offset;

		if ( async !== true ) {
			i = -1;
			while ( ++i < nth ) {
				if ( fn.call( obj, obj[i], i ) === false ) {
					break;
				}
			}
		}
		else {
			size   = size || 10;
			offset = 0;

			if ( size > nth ) {
				size = nth;
			}

			utility.repeat( function () {
				var i = -1,
				    idx;

				while ( ++i < size ) {
					idx = i + offset;

					if ( idx === nth || fn.call( obj, obj[idx], idx ) === false ) {
						return false;
					}
				}

				offset += size;

				if ( offset >= nth ) {
					return false;
				}
			}, undefined, undefined, false );
		}

		return obj;
	},

	/**
	 * Creates a 2D Array from an Object
	 *
	 * @method fromObject
	 * @memberOf array
	 * @param  {Object} obj Object to convert
	 * @return {Array}      2D Array
	 */
	fromObject : function ( obj ) {
		return array.mingle( array.keys( obj ), array.cast( obj ) );
	},

	/**
	 * Sorts an Array based on key values, like an SQL ORDER BY clause
	 *
	 * @method sort
	 * @memberOf array
	 * @param  {Array}  obj   Array to sort
	 * @param  {String} query Sort query, e.g. "name, age desc, country"
	 * @param  {String} sub   [Optional] Key which holds data, e.g. "{data: {}}" = "data"
	 * @return {Array}        Sorted Array
	 */
	keySort : function ( obj, query, sub ) {
		query       = query.replace( /\s*asc/ig, "" ).replace( /\s*desc/ig, " desc" );
		var queries = string.explode( query ).map( function ( i ) { return i.split( " " ); } ),
		    sorts   = [];

		if ( sub && sub !== "" ) {
			sub = "." + sub;
		}
		else {
			sub = "";
		}

		array.each( queries, function ( i ) {
			if ( i[1] === "desc" ) {
				sorts.push( "if ( a" + sub + "[\"" + i[0] + "\"] < b" + sub + "[\"" + i[0] + "\"] ) return 1;" );
				sorts.push( "if ( a" + sub + "[\"" + i[0] + "\"] > b" + sub + "[\"" + i[0] + "\"] ) return -1;" );
			}
			else {
				sorts.push( "if ( a" + sub + "[\"" + i[0] + "\"] < b" + sub + "[\"" + i[0] + "\"] ) return -1;" );
				sorts.push( "if ( a" + sub + "[\"" + i[0] + "\"] > b" + sub + "[\"" + i[0] + "\"] ) return 1;" );
			}
		} );

		sorts.push( "else return 0;" );

		return obj.sort( new Function( "a", "b", sorts.join( "\n" ) ) );
	},

	/**
	 * Returns the keys in an "Associative Array"
	 *
	 * @method keys
	 * @memberOf array
	 * @param  {Mixed} obj Array or Object to extract keys from
	 * @return {Array}     Array of the keys
	 */
	keys : function ( obj ) {
		return Object.keys( obj );
	},

	/**
	 * Returns the last index of the Array
	 *
	 * @method last
	 * @memberOf array
	 * @param  {Array}  obj Array
	 * @param  {Number} arg [Optional] Negative offset from last index to return
	 * @return {Mixed}      Last index( s ) of Array
	 */
	last : function ( obj, arg ) {
		var n = obj.length - 1;

		if ( arg >= ( n + 1 ) ) {
			return obj;
		}
		else if ( isNaN( arg ) || arg === 1 ) {
			return obj[n];
		}
		else {
			return array.limit( obj, ( n - ( --arg ) ), n );
		}
	},

	/**
	 * Returns a limited range of indices from the Array
	 *
	 * @method limit
	 * @memberOf array
	 * @param  {Array}  obj    Array to iterate
	 * @param  {Number} start  Starting index
	 * @param  {Number} offset Number of indices to return
	 * @return {Array}         Array of indices
	 */
	limit : function ( obj, start, offset ) {
		var result = [],
		    i      = start - 1,
		    nth    = start + offset,
		    max    = obj.length;

		if ( max > 0 ) {
			while ( ++i < nth && i < max ) {
				result.push( obj[i] );
			}
		}

		return result;
	},

	/**
	 * Merges `arg` into `obj`, excluding duplicate indices
	 *
	 * @method merge
	 * @param  {Array} obj Array to receive indices
	 * @param  {Array} arg Array to merge
	 * @return {Array}     obj
	 */
	merge : function ( obj, arg ) {
		array.each( arg, function ( i ) {
			array.add( obj, i );
		} );

		return obj;
	},

	/**
	 * Mingles Arrays and returns a 2D Array
	 *
	 * @method mingle
	 * @memberOf array
	 * @param  {Array} obj1 Array to mingle
	 * @param  {Array} obj2 Array to mingle
	 * @return {Array}      2D Array
	 */
	mingle : function ( obj1, obj2 ) {
		var result;

		result = obj1.map( function ( i, idx ) {
			return [i, obj2[idx]];
		} );

		return result;
	},

	/**
	 * Removes indices from an Array without recreating it
	 *
	 * @method remove
	 * @memberOf array
	 * @param  {Array}  obj   Array to remove from
	 * @param  {Mixed}  start Starting index, or value to find within obj
	 * @param  {Number} end   [Optional] Ending index
	 * @return {Array}        Modified Array
	 */
	remove : function ( obj, start, end ) {
		if ( isNaN( start ) ) {
			start = obj.indexOf( start );

			if ( start === -1 ) {
				return obj;
			}
		}
		else {
			start = start || 0;
		}

		var length    = obj.length,
		    remaining = obj.slice( ( end || start ) + 1 || length );

		obj.length = start < 0 ? ( length + start ) : start;
		obj.push.apply( obj, remaining );

		return obj;
	},

	/**
	 * Sorts the Array by parsing values
	 *
	 * @method sort
	 * @memberOf array
	 * @param  {Mixed} a Argument to compare
	 * @param  {Mixed} b Argument to compare
	 * @return {Number}  Number indicating sort order
	 */
	sort : function ( a, b ) {
		var types = {a: typeof a, b: typeof b},
		    c, d, result;

		if ( types.a === "number" && types.b === "number" ) {
			result = a - b;
		}
		else {
			c = a.toString();
			d = b.toString();

			if ( c < d ) {
				result = -1;
			}
			else if ( c > d ) {
				result = 1;
			}
			else if ( types.a === types.b ) {
				result = 0;
			}
			else if ( types.a === "boolean" ) {
				result = -1;
			}
			else {
				result = 1;
			}
		}

		return result;
	},

	/**
	 * Returns an Array of unique indices of `obj`
	 *
	 * @method unique
	 * @memberOf array
	 * @param  {Array} obj Array to parse
	 * @return {Array}     Array of unique indices
	 */
	unique : function ( obj ) {
		var result = [];

		array.each( obj, function ( i ) {
			array.add( result, i );
		} );

		return result;
	}
};
