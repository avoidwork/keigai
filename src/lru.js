class LRU {
	/**
	 * Creates a new Least Recently Used cache
	 *
	 * @constructor
	 * @memberOf keigai
	 * @param  {Number} max [Optional] Max size of cache, default is 1000
	 * @example
	 * let lru = keigai.util.lru( 50 );
	 */
	constructor ( max=1000 ) {
		this.cache = {};
		this.max = max;
		this.first = null;
		this.last = null;
		this.length = 0;
	}

	/**
	 * Evicts the least recently used item from cache
	 *
	 * @method evict
	 * @memberOf keigai.LRU
	 * @return {Object} {@link keigai.LRU}
	 * @example
	 * lru.evict();
	 */
	evict () {
		if ( this.last !== null ) {
			this.remove( this.last );
		}

		return this;
	}

	/**
	 * Gets cached item and moves it to the front
	 *
	 * @method get
	 * @memberOf keigai.LRU
	 * @param  {String} key Item key
	 * @return {Object} {@link keigai.LRUItem}
	 * @example
	 * let item = lru.get( "key" );
	 */
	get ( key ) {
		let item = this.cache[ key ];

		if ( item === undefined ) {
			return;
		}

		this.set( key, item.value );

		return item.value;
	}

	/**
	 * Removes item from cache
	 *
	 * @method remove
	 * @memberOf keigai.LRU
	 * @param  {String} key Item key
	 * @return {Object} {@link keigai.LRUItem}
	 * @example
	 * lru.remove( "key" );
	 */
	remove ( key ) {
		let item = this.cache[ key ];

		if ( item ) {
			delete this.cache[ key ];

			this.length--;

			if ( item.previous !== null ) {
				this.cache[ item.previous ].next = item.next;
			}

			if ( item.next !== null ) {
				this.cache[ item.next ].previous = item.previous;
			}

			if ( this.first === key ) {
				this.first = item.previous;
			}

			if ( this.last === key ) {
				this.last = item.next;
			}
		}

		return item;
	}

	/**
	 * Sets item in cache as `first`
	 *
	 * @method set
	 * @memberOf keigai.LRU
	 * @param  {String} key   Item key
	 * @param  {Mixed}  value Item value
	 * @return {Object} {@link keigai.LRU}
	 * @example
	 * lru.set( "key", {x: true} );
	 */
	set ( key, value ) {
		let item = this.remove( key );

		if ( item === undefined ) {
			item = new LRUItem( value );
		} else {
			item.value = value;
		}

		item.next = null;
		item.previous = this.first;
		this.cache[ key ] = item;

		if ( this.first !== null ) {
			this.cache[ this.first ].next = key;
		}

		this.first = key;

		if ( this.last === null ) {
			this.last = key;
		}

		if ( ++this.length > this.max ) {
			this.evict();
		}

		return this;
	}
}

/**
 * Creates a new LRUItem
 *
 * @constructor
 * @memberOf keigai
 * @param {Mixed} value Item value
 * @private
 */
class LRUItem {
	constructor ( value ) {
		this.next = null;
		this.previous = null;
		this.value = value;
	}
}

/**
 * @namespace lru
 */
let lru = {
	/**
	 * LRU factory
	 *
	 * @method factory
	 * @memberOf lru
	 * @return {Object} {@link keigai.LRU}
	 * @example
	 * let lru = keigai.util.lru( 50 );
	 */
	factory: function ( max ) {
		return new LRU( max );
	}
};
