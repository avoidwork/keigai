/**
 * Bootstraps framework
 *
 * @function bootstrap
 * @memberOf keigai
 * @return {Undefined} undefined
 */
function bootstrap () {
	// Removes references to deleted DOM elements, avoiding memory leaks
	function cleanup ( obj ) {
		observer.remove( obj );

		if ( utility.observers[obj.id] ) {
			delete utility.observers[obj.id];
		}

		array.each( array.cast( obj.childNodes ), function ( i ) {
			cleanup( i );
		} );
	}

	// Second phase
	function init () {
		// Cache garbage collector (every minute)
		utility.repeat( function () {
			cache.clean();
		}, 60000, "cacheGarbageCollector");
	}

	// Repeating function to call init()
	function fn () {
		if ( regex.complete_loaded.test( document.readyState ) ) {
			init();

			return false;
		}
	}

	// Creating error log
	utility.error.log = [];

	// Describing the Client
	if ( !server ) {
		client.version = client.version();

		// IE8 and older is not supported
		if ( client.ie && client.version < 9 ) {
			throw new Error( label.error.upgrade );
		}

		// getElementsByClassName shim for IE9
		if ( Element.prototype.getElementsByClassName === undefined ) {
			Element.prototype.getElementsByClassName = function ( arg ) {
				return document.querySelectorAll( "." + arg );
			};
		}

		// classList shim for IE9
		if ( !document.documentElement.classList ) {
			( function ( view ) {
				var ClassList, getter, proto, target, descriptor;

				if ( !( "HTMLElement" in view ) && !( "Element" in view ) ) {
					return;
				}

				ClassList = function ( obj ) {
					var classes = string.explode( obj.className, " " ),
					    self    = this;

					array.each( classes, function ( i ) {
						self.push( i );
					} );

					this.updateClassName = function () {
						obj.className = this.join( " " );
					};
				};

				getter = function () {
					return new ClassList( this );
				};

				proto  = ClassList.prototype = [];
				target = ( view.HTMLElement || view.Element ).prototype;

				proto.add = function ( arg ) {
					if ( !array.contains( this, arg ) ) {
						this.push( arg );
						this.updateClassName();
					}
				};

				proto.contains = function ( arg ) {
					return array.contains( this, arg );
				};

				proto.remove = function ( arg ) {
					if ( array.contains( this, arg ) ) {
						array.remove( this, arg );
						this.updateClassName();
					}
				};

				proto.toggle = function ( arg ) {
					array[array.contains( this, arg ) ? "remove" : "add"]( this, arg );
					this.updateClassName();
				};

				if ( Object.defineProperty ) {
					descriptor = {
						get          : getter,
						enumerable   : true,
						configurable : true
					};

					Object.defineProperty( target, "classList", descriptor );
				}
				else if ( Object.prototype.__defineGetter__) {
					target.__defineGetter__( "classList", getter );
				}
				else {
					throw new Error( "Could not create classList shim" );
				}
			} )( global );
		}
	}
	else {
		// XHR shim
		XMLHttpRequest = xhr();
	}

	// Caching functions
	has   = Object.prototype.hasOwnProperty;
	slice = Array.prototype.slice;

	// Setting events & garbage collection
	if ( !server ) {
		// DOM 4+
		if ( typeof MutationObserver == "function" ) {
			utility.observers.document = new MutationObserver( function ( arg ) {
				array.each( arg, function ( record ) {
					// Added Elements
					array.each( array.cast( record.addedNodes ).filter( function ( obj ) {
						return obj.id !== undefined;
					} ), function( obj ) {
						utility.genId( obj, true );

						if ( !utility.observers[obj.id] ) {
							utility.observers[obj.id] = new MutationObserver( function ( arg ) {
								observer.fire( obj, "change", arg );
							} );

							utility.observers[obj.id].observe( obj, {attributes: true, attributeOldValue: true, childList: true, characterData: true, characterDataOldValue: true, subtree: true} );
						}
					} );

					// Removed Elements
					array.each( array.cast( record.removedNodes ).filter( function ( obj ) {
						return obj.id !== undefined;
					} ), function ( obj ) {
						cleanup( obj );
					} );
				} );
			} );

			utility.observers.document.observe( document, {childList: true, subtree: true} );
		}
		// DOM 3 (slow!)
		else {
			observer.add( global, "DOMNodeRemoved", function ( e ) {
				var obj = utility.target( e );

				if ( obj.id && ( e.relatedNode instanceof Element ) ) {
					cleanup( obj );
				}
			}, "mutation", global, "all");
		}
	}

	// Initializing
	if ( typeof exports != "undefined" || typeof define == "function" || regex.complete_loaded.test( document.readyState ) ) {
		init();
	}
	else if ( typeof document.addEventListener == "function" ) {
		document.addEventListener( "DOMContentLoaded" , function () {
			init();
		}, false );
	}
	else if ( typeof document.attachEvent == "function" ) {
		document.attachEvent( "onreadystatechange" , fn );
	}
	else {
		utility.repeat( fn );
	}
}
