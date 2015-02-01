/**
 * Bootstraps environment
 *
 * @method bootstrap
 * @private
 * @return {Undefined} undefined
 */
let bootstrap = () => {
	let defineProperty = Object.defineProperty !== undefined;
	let target;

	// ES6 Array shims
	Array.from = Array.from || ( arg ) => { return [].slice.call( arg ); };
	Array.keys = Array.keys || ( arg ) => { return Object.keys( arg ); };

	// Describing the Client
	if ( !server ) {
		client.version = client.version();

		if ( client.ie ) {
			// IE8 and older is not supported
			if ( client.version < 9 ) {
				throw new Error( label.upgrade );
			}

			target = ( global.HTMLElement || global.Element ).prototype;

			class ClassList extends Array {
				constructor ( obj ) {
					let classes = string.explode( obj.className, " " );
					let self = this;

					array.each( classes, ( i ) => {
						self.push( i );
					} );
				}

				add ( arg ) {
					if ( !array.contains( this, arg ) ) {
						this.push( arg );
						this.updateClassName();
					}
				}

				contains ( arg ) {
					return array.contains( this, arg );
				}

				remove ( arg ) {
					if ( array.contains( this, arg ) ) {
						array.remove( this, arg );
						this.updateClassName();
					}
				}

				toggle ( arg ) {
					array[ array.contains( this, arg ) ? "remove" : "add" ]( this, arg );
					this.updateClassName();
				}

				updateClassName () {
						this.className = this.join( " " );
				}
			}

			if ( defineProperty ) {
				Object.defineProperty( target, "classList", {
					get: () => { return new ClassList( this ); },
					enumerable: true,
					configurable: true
				} );
			} else if ( Object.prototype.__defineGetter__ ) {
				target.__defineGetter__( "classList", () => { return new ClassList( this ); } );
			} else {
				throw new Error( "Could not create classList shim" );
			}

			if ( defineProperty ) {
				Object.defineProperty( Element, "getElementsByClassName", {
					get: ( arg ) => { return this.querySelectorAll( "." + arg ); },
					enumerable: true,
					configurable: true
				} );
			} else if ( Object.prototype.__defineGetter__ ) {
				target.__defineGetter__( "getElementsByClassName", ( arg ) => { return this.querySelectorAll( "." + arg ); } );
			} else {
				throw new Error( "Could not create getElementsByClassName shim" );
			}
		}
	} else {
		// XHR shim
		XMLHttpRequest = xhr();
	}

	// WeakMap shim for client & server
	if ( WeakMap === null ) {
		WeakMap = WeakMapShim;
	}

	// DataStore Worker "script"
	if ( webWorker ) {
		WORKER = global.URL.createObjectURL( utility.blob( "var " + string.fromObject( array, "array" ) + ", " + string.fromObject( regex, "regex" ) + ", " + string.fromObject( string, "string" ) + ", " + string.fromObject( utility, "utility" ) + "; onmessage = " + store.worker.toString() + ";" ) );
	}

	TIME = new Date().getTime();

	// Setting up `utility.render()`
	RENDER = global.requestAnimationFrame || ( fn ) => {
		let offset = new Date().getTime() - TIME;

		utility.defer( () => {
			fn( offset );
		}, 16, offset );
	};
}
