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
			WORKER = global.URL.createObjectURL(utility.blob("var " + string.fromObject(array, "array") + ", " + string.fromObject(regex, "regex") + ", " + string.fromObject(string, "string") + ", " + string.fromObject(utility, "utility") + "; onmessage = " + store.worker.toString() + ";"));
		}
		catch ( e ) {
			webWorker = false;
		}
	}

	TIME = new Date().getTime();

	// Setting up `utility.render()`
	RENDER = global.requestAnimationFrame || ( fn ) => {
		let offset = new Date().getTime() - TIME;

		utility.defer( () => {
			fn( offset );
		}, 16, offset );
	};

	if ( !server ) {
		utility.banner();
	}
}
