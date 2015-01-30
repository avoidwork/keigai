/**
 * WeakMap shim
 *
 * @class
 * @private
 */
class WeakMapShim {
	constructor () {
		this.elements = {};
	}

	clear () {
		this.elements = {};
	}

	delete ( arg ) {
		delete this.elements[ arg ];
	}

	has ( arg ) {
		return this.elements[ arg ] !== undefined;
	}

	get ( arg ) {
		return this.has( arg ) ? this.elements[ arg ].value : undefined;
	}

	set ( arg, value ) {
		this.elements[ arg ] = { value: value };
		return this;
	}
}
