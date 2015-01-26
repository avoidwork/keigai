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
		return this.elements[ arg ].value;
	}

	set ( arg, value ) {
		this.elements[ arg ] = { value: value };
		return this;
	}
}
