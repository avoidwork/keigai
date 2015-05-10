/**
 * @namespace xml
 * @private
 */
let xml = {
	/**
	 * Returns XML (Document) Object from a String
	 *
	 * @method decode
	 * @memberOf xml
	 * @param  {String} arg XML String
	 * @return {Object}     XML Object or undefined
	 */
	decode: function ( arg ) {
		return new DOMParser().parseFromString( arg, "text/xml" );
	},

	/**
	 * Returns XML String from an Object or Array
	 *
	 * @method encode
	 * @memberOf xml
	 * @param  {Mixed} arg Object or Array to cast to XML String
	 * @return {String}    XML String or undefined
	 */
	encode: function ( arg, wrap=true, top=true, key="" ) {
		let x = wrap ? "<" + ( key || "xml" ) + ">" : "";

		if ( arg !== null && arg.xml ) {
			arg = arg.xml;
		}

		if ( client.doc && ( arg instanceof Document ) ) {
			arg = ( new XMLSerializer() ).serializeToString( arg );
		}

		if ( regex.boolean_number_string.test( typeof arg ) ) {
			x += xml.node( isNaN( key ) ? key : "item", arg );
		} else if ( arg === null || arg === undefined ) {
			x += "null";
		} else if ( arg instanceof Array ) {
			array.each( arg, function ( v ) {
				x += xml.encode( v, ( typeof v === "object" ), false, "item" );
			} );
		} else if ( arg instanceof Object ) {
			utility.iterate( arg, function ( v, k ) {
				x += xml.encode( v, ( typeof v === "object" ), false, k );
			} );
		}

		x += wrap ? "</" + ( key || "xml" ) + ">" : "";

		if ( top ) {
			x = "<?xml version=\"1.0\" encoding=\"UTF8\"?>" + x;
		}

		return x;
	},

	/**
	 * Encodes a value as a node
	 *
	 * @method node
	 * @memberOf xml
	 * @param  {String} name  Node name
	 * @param  {String} value Node value
	 * @return {String}       Node
	 */
	node: function ( name, value ) {
		return "<n>v</n>".replace( "v", ( regex.cdata.test( value ) ? "<![CDATA[" + value + "]]>" : value ) ).replace( /<(\/)?n>/g, "<$1" + name + ">" );
	},

	/**
	 * Validates `arg` is XML
	 *
	 * @method valid
	 * @memberOf xml
	 * @param  {String} arg String to validate
	 * @return {Boolean}    `true` if valid XML
	 */
	valid: function ( arg ) {
		return ( xml.decode( arg ).getElementsByTagName( "parsererror" ).length === 0 );
	}
};
