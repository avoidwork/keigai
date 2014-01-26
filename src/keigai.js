/**
 * Creates a new DataStore
 *
 * @method keigai
 * @param  {Object} obj  Object
 * @param  {Mixed}  recs [Optional] Data to set with this.batch
 * @param  {Object} args [Optional] Arguments to set on the store
 * @return {Object} {@link DataStore}
 */
function keigai ( obj, recs, args ) {
	return datastore.decorator( obj, recs, args );
}

/**
 * Setting constructor loop
 *
 * @method constructor
 * @memberOf keigai
 * @private
 * @type {Function}
 */
keigai.prototype.constructor = keigai;

/**
 * Version of keigai
 *
 * @memberOf keigai
 * @type {String}
 */
keigai.version = "{{VERSION}}";
