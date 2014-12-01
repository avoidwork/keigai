/**
 * Bootstraps environment
 *
 * @method bootstrap
 * @private
 * @return {Undefined} undefined
 */
function bootstrap () {
	// Describing the Client
	if ( !server ) {
		client.version = client.version();

		// IE8 and older is not supported
		if ( client.ie && client.version < 9 ) {
			throw new Error( label.upgrade );
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

	// DataStore Worker "script"
	if ( webWorker ) {
		WORKER = global.URL.createObjectURL( utility.blob( "var " + string.fromObject( array, "array" ) + ", " + string.fromObject( regex, "regex" ) + ", " + string.fromObject( string, "string" ) + ", " + string.fromObject( utility, "utility" ) + "; onmessage = " + store.worker.toString() + ";" ) );
	}

	TIME = new Date().getTime();

	// Setting up `utility.render()`
	RENDER = global.requestAnimationFrame || function ( fn ) {
		var offset = new Date().getTime() - TIME;

		utility.defer( function () {
			fn( offset );
		}, 16, offset );
	};
}
