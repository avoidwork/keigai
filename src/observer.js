/**
 * @namespace observer
 * @private
 */
var observer = {
	/**
	 * Collection of external event listeners
	 *
	 * @memberOf observer
	 * @type {Object}
	 */
	elisteners : {},

	/**
	 * If `true`, events are ignored
	 *
	 * @memberOf observer
	 * @type {Boolean}
	 */
	ignore : false,

	/**
	 * Collection of listeners
	 *
	 * @memberOf observer
	 * @type {Object}
	 */
	listeners : {},

	/**
	 * Boolean indicating if events are logged to the console
	 *
	 * @memberOf observer
	 * @type {Boolean}
	 */
	log : false,

	/**
	 * Maximum amount of handlers per event
	 *
	 * @memberOf observer
	 * @type {Number}
	 */
	maxListeners : 10,

	/**
	 * Queue of events to fire
	 *
	 * @memberOf observer
	 * @type {Array}
	 */
	queue : [],

	/**
	 * If `true`, events are queued
	 *
	 * @memberOf observer
	 * @type {Boolean}
	 */
	silent : false,

	/**
	 * Adds a handler for an event
	 *
	 * @method add
	 * @memberOf observer
	 * @param  {Mixed}    obj    Primitive
	 * @param  {String}   events Comma delimited string of events
	 * @param  {Function} fn     Event handler
	 * @param  {String}   id     [Optional / Recommended] ID for the listener
	 * @param  {String}   scope  [Optional / Recommended] ID of the object or element to be set as 'this'
	 * @param  {String}   st     [Optional] Application state, default is current
	 * @return {Mixed}           Primitive
	 */
	add : function ( obj, events, fn, id, scope, st ) {
		var oId      = observer.id( obj ),
		    instance = regex.observer_globals.test( oId ) || ( !/\//g.test( oId ) && oId !== "keigai" ) ? obj : null,
		    jsonp    = /^afterjsonp$/i,
		    add      = false,
		    reg      = false;

		if ( !oId || !events || typeof fn != "function" ) {
			throw new Error( label.invalidArguments );
		}

		// Preparing variables
		id    = id    || utility.uuid();
		scope = scope || obj;
		st    = st    || "active";

		if ( instance ) {
			add = typeof instance.addEventListener == "function";
			reg = typeof instance.attachEvent == "object" || add;
		}

		// Preparing
		if ( !observer.listeners[oId] ) {
			observer.listeners[oId]     = {};
			observer.listeners[oId].all = {};
		}

		if ( st !== "all" && !observer.listeners[oId][st] ) {
			observer.listeners[oId][st] = {};
		}

		// Setting event listeners (with DOM hooks if applicable)
		array.each( string.explode( events ), function ( ev ) {
			var eId = oId + "_" + ev;

			// Creating caches if not present
			if ( !observer.listeners[oId].all[ev] ) {
				observer.listeners[oId].all[ev] = lru( observer.maxListeners );
			}

			if ( st !== "all" && !observer.listeners[oId][st][ev] ) {
				observer.listeners[oId][st][ev] = lru( observer.maxListeners );
			}

			// Hooking event listener
			if ( reg && !jsonp.test( ev ) && !observer.elisteners[eId] ) {
				observer.elisteners[eId] = function ( e ) {
					observer.fire( oId, ev, e );
				};

				instance[add ? "addEventListener" : "attachEvent"]( ( add ? "" : "on" ) + ev, observer.elisteners[eId], false );
			}

			observer.listeners[oId][st][ev].set( id, {fn: fn, scope: scope} );
		} );

		return obj;
	},

	/**
	 * Discard observer events
	 *
	 * @method discard
	 * @memberOf observer
	 * @param  {Boolean} arg [Optional] Boolean indicating if events will be ignored
	 * @return {Boolean}     Current setting
	 */
	discard : function ( arg ) {
		return arg === undefined ? observer.ignore : ( observer.ignore = ( arg === true ) );
	},

	/**
	 * Fires an event
	 *
	 * @method fire
	 * @memberOf observer
	 * @param  {Mixed}  obj    Primitive
	 * @param  {String} events Comma delimited string of events
	 * @return {Mixed}         Primitive
	 */
	fire : function ( obj, events ) {
		var args, cache, item, oId;

		if ( !observer.ignore ) {
			if ( observer.silent ) {
				observer.queue.push( array.cast( arguments ) );
			}
			else {
				oId = observer.id( obj );

				if ( observer.listeners[oId] ) {
					args = array.remove( array.cast( arguments ), 0, 1 );

					array.each( string.explode( events ), function ( ev ) {
						if ( observer.log ) {
							utility.log( oId + " fired " + ev );
						}

						array.each( observer.states(), function ( st ) {
							if ( observer.listeners[oId][st] && observer.listeners[oId][st][ev] ) {
								cache = observer.listeners[oId][st][ev];

								if ( cache.length > 0 ) {
									item  = cache.cache[cache.last];

									do {
										if ( item.value.fn.apply( item.value.scope, args ) !== false && item.next ) {
											item = cache.cache[item.next];
										}
										else {
											return false;
										}
									}
									while ( item );
								}
							}
						} );
					} );
				}
				else if ( observer.log ) {
					array.each( string.explode( events ), function ( ev ) {
						utility.log( oId + " fired " + ev );
					} );
				}
			}
		}

		return obj;
	},

	/**
	 * Gets the Observer id of arg
	 *
	 * @method id
	 * @memberOf observer
	 * @param  {Mixed}  Object or String
	 * @return {String} Observer id
	 */
	id : function ( arg ) {
		var id;

		if ( arg === global ) {
			id = "window";
		}
		else if ( !server && arg === document ) {
			id = "document";
		}
		else if ( !server && arg === document.body ) {
			id = "body";
		}
		else {
			utility.genId( arg );
			id = arg.id || ( typeof arg.toString == "function" ? arg.toString() : arg );
		}

		return id;
	},

	/**
	 * Gets the listeners for an event
	 *
	 * @method list
	 * @memberOf observer
	 * @param  {Mixed}  obj Primitive
	 * @param  {String} ev  Event being queried
	 * @return {Mixed}      Primitive
	 */
	list : function ( obj, ev ) {
		var oId    = observer.id( obj ),
		    result = {},
		    events, states;

		// Do nothing
		if ( !observer.listeners[oId] ) {
		}
		// All events
		else if ( !ev ) {
			events = [];
			states = array.keys( observer.listeners[oId] );

			array.each( states, function ( st ) {
				array.merge( events, array.keys( observer.listeners[oId][st] ) );
			} );

			array.each( events, function ( ev ) {
				result[ev] = {};
			} );

			array.each( states, function ( st ) {
				if ( observer.listeners[oId][st] ) {
					array.each( array.keys( observer.listeners[oId][st] ), function ( ev ) {
						if ( observer.listeners[oId][st][ev].length > 0 ) {
							result[ev][st] = {};

							utility.iterate( observer.listeners[oId][st][ev].cache, function ( v, k ) {
								result[ev][st][k] = v.value;
							} );
						}
					} );
				}
			} );
		}
		// Specific event
		else {
			array.each( observer.states(), function ( st ) {
				if ( observer.listeners[oId][st] && observer.listeners[oId][st][ev] && observer.listeners[oId][st][ev].length > 0 ) {
					result[st] = {};

					utility.iterate( observer.listeners[oId][st][ev].cache, function ( v, k ) {
						result[st][k] = v.value;
					} );
				}
			} );
		}

		return result;
	},

	/**
	 * Adds a listener for a single execution
	 *
	 * @method once
	 * @memberOf observer
	 * @param  {Mixed}    obj    Primitive
	 * @param  {String}   events Comma delimited string of events being fired
	 * @param  {Function} fn     Event handler
	 * @param  {String}   id     [Optional / Recommended] ID for the listener
	 * @param  {String}   scope  [Optional / Recommended] ID of the object or element to be set as 'this'
	 * @param  {String}   st     [Optional] Application state, default is current
	 * @return {Mixed}           Primitive
	 */
	once : function ( obj, events, fn, id, scope, st ) {
		id    = id    || utility.uuid();
		scope = scope || obj;
		st    = st    || "active";

		if ( !obj || !events || typeof fn != "function" ) {
			throw new Error( label.invalidArguments );
		}

		array.each( string.explode( events ), function ( ev ) {
			observer.add( obj, ev, function () {
				fn.apply( scope, arguments );
				observer.remove( obj, ev, id, st );
			}, id, scope, st );
		} );

		return obj;
	},

	/**
	 * Pauses observer events, and queues them
	 *
	 * @method pause
	 * @memberOf observer
	 * @param  {Boolean} arg Boolean indicating if events will be queued
	 * @return {Boolean}     Current setting
	 */
	pause : function ( arg ) {
		if ( arg === true ) {
			observer.silent = arg;
		}
		else if ( arg === false ) {
			observer.silent = arg;

			array.each( observer.queue, function ( i ) {
				observer.fire.apply( observer, i );
			} );

			observer.queue = [];
		}

		return observer.silent;
	},

	/**
	 * Removes listeners
	 *
	 * @method remove
	 * @memberOf observer
	 * @param  {Mixed}  obj    Primitive
	 * @param  {String} events [Optional] Comma delimited string of events being removed
	 * @param  {String} id     [Optional] Listener id
	 * @param  {String} st     [Optional] Application state, default is current
	 * @return {Mixed}         Primitive
	 */
	remove : function ( obj, events, id, st ) {
		var oId   = observer.id( obj ),
		    add   = typeof obj.addEventListener == "function",
		    reg   = typeof obj.attachEvent == "object" || add,
		    regex = /.*_/,
		    states, total, unhook;

		/**
		 * Removes DOM event hook
		 *
		 * @method unhook
		 * @memberOf observer.remove
		 * @private
		 * @param  {Mixed}  eId Event ID
		 * @param  {Number} ev  Event
		 * @return {Undefined}  undefined
		 */
		unhook = function ( eId, ev ) {
			if ( reg ) {
				obj[add ? "removeEventListener" : "detachEvent"]( ( add ? "" : "on" ) + ev, this[eId], false );
			}

			delete this[eId];
		};

		if ( observer.listeners[oId] ) {
			if ( !events ) {
				utility.iterate( observer.elisteners, function ( v, k ) {
					if ( k.indexOf( oId + "_" ) === 0 ) {
						unhook.call( this, k, k.replace( regex, "" ) );
					}
				} );

				delete observer.listeners[oId];
			}
			else {
				events = string.explode( events );
				st     = st || "active";
				states = array.keys( observer.listeners[oId] );
				total  = 0;

				// Total listeners
				array.each( states, function ( s ) {
					array.each( events, function ( e ) {
						if ( observer.listeners[oId][s][e] ) {
							total += observer.listeners[oId][s][e].length;
						}
					} );
				} );

				array.each( events, function ( ev ) {
					if ( observer.listeners[oId][st][ev] ) {
						// Specific listener
						if ( id ) {
							observer.listeners[oId][st][ev].remove( id );

							if ( --total === 0 ) {
								array.each( states, function ( s ) {
									delete observer.listeners[oId][s][ev];
								} );

								unhook.call( observer.elisteners, oId + "_" + ev, ev );
							}
						}
						// All listeners for the event
						else {
							array.each( states, function ( s ) {
								delete observer.listeners[oId][s][ev];
							} );

							unhook.call( observer.elisteners, oId + "_" + ev, ev );
						}
					}
				} );
			}
		}

		return obj;
	},

	/**
	 * Returns an Array of active observer states
	 *
	 * @method states
	 * @memberOf observer
	 * @return {Array} Array of active states
	 */
	states : function () {
		return ["all", "active"];
	}
};
