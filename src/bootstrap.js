/**
 * Bootstraps environment
 *
 * @method bootstrap
 * @private
 * @return {Undefined} undefined
 */
let bootstrap = function () {
	// ES6 Array shims
	if ( Array.from === undefined ) {
		Array.from = function ( arg ) {
			return [].slice.call( arg );
		};
	}

	// Describing the Client
	if ( !server ) {
		client.version = client.version();

		if ( client.ie && client.version < 10 ) {
			throw new Error( label.upgrade );
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
		try {
			WORKER = global.URL.createObjectURL( utility.blob( "var " + string.fromObject( array, "array" ) + ", " + string.fromObject( regex, "regex" ) + ", " + string.fromObject( string, "string" ) + ", " + string.fromObject( utility, "utility" ) + "; onmessage = " + store.worker.toString() + ";" ) );
		}
		catch ( e ) {
			webWorker = false;
		}
	}

	TIME = new Date().getTime();

	// Setting up `utility.render()`
	if ( global.requestAnimationFrame !== undefined ) {
		RENDER = global.requestAnimationFrame
	} else {
		RENDER = function ( fn ) {
			let offset = new Date().getTime() - TIME;

			utility.defer( function () {
				fn( offset );
			}, 16, offset );
		};
	}

	if ( !server ) {
		utility.banner();
	}
};
