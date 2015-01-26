/**
 * @namespace cache
 * @private
 */
let cache = {
	/**
	 * Collection URIs
	 *
	 * @memberOf cache
	 * @type {Object}
	 */
	lru: lru.factory( CACHE ),

	/**
	 * Expires a URI from the local cache
	 *
	 * @method expire
	 * @memberOf cache
	 * @param  {String} uri URI of the local representation
	 * @return {Boolean} `true` if successful
	 */
	expire: ( uri ) => {
		if ( cache.lru.cache[ uri ] ) {
			cache.lru.remove( uri );

			return true;
		}

		return false;
	},

	/**
	 * Determines if a URI has expired
	 *
	 * @method expired
	 * @memberOf cache
	 * @param  {Object} uri Cached URI object
	 * @return {Boolean}    True if the URI has expired
	 */
	expired: ( uri ) => {
		let item = cache.lru.cache[ uri ];

		return item && item.value.expires < new Date().getTime();
	},

	/**
	 * Returns the cached object {headers, response} of the URI or false
	 *
	 * @method get
	 * @memberOf cache
	 * @param  {String}  uri    URI/Identifier for the resource to retrieve from cache
	 * @param  {Boolean} expire [Optional] If 'false' the URI will not expire
	 * @param  {Boolean} silent [Optional] If 'true', the event will not fire
	 * @return {Mixed}          URI Object {headers, response} or False
	 */
	get: ( uri, expire ) => {
		uri = utility.parse( uri ).href;
		let item = cache.lru.get( uri );

		if ( !item ) {
			return false;
		}

		if ( expire !== false && cache.expired( uri ) ) {
			cache.expire( uri );

			return false;
		}

		return utility.clone( item, true );
	},

	/**
	 * Sets, or updates an item in cache.items
	 *
	 * @method set
	 * @memberOf cache
	 * @param  {String} uri      URI to set or update
	 * @param  {String} property Property of the cached URI to set
	 * @param  {Mixed} value     Value to set
	 * @return {Mixed}           URI Object {headers, response} or undefined
	 */
	set: ( uri, property, value ) => {
		uri = utility.parse( uri ).href;
		let item = cache.lru.get( uri );

		if ( !item ) {
			item = {
				permission: 0
			};
		}

		if ( property === "permission" ) {
			item.permission |= value;
		}
		else if ( property === "!permission" ) {
			item.permission &= ~value;
		}
		else {
			item[ property ] = value;
		}

		cache.lru.set( uri, item );

		return item;
	}
};
