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
	decode: ( arg ) => {
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
	encode: ( arg, wrap=true, top=true ) => {
		try {
			let x = wrap ? "<xml>" : "";

			/**
			 * Encodes a value as a node
			 *
			 * @method node
			 * @memberOf xml.encode
			 * @private
			 * @param  {String} name  Node name
			 * @param  {String} value Node value
			 * @return {String}       Node
			 */
			let node = ( name, value ) => {
				let output = "<n>v</n>";

				output = output.replace( "v", ( regex.cdata.test( value ) ? "<![CDATA[" + value + "]]>" : value ) );
				return output.replace( /<(\/)?n>/g, "<$1" + name + ">" );
			};

			if ( arg !== null && arg.xml ) {
				arg = arg.xml;
			}

			if ( arg instanceof Document ) {
				arg = ( new XMLSerializer() ).serializeToString( arg );
			}

			if ( regex.boolean_number_string.test( typeof arg ) ) {
				x += node( "item", arg );
			}
			else if ( typeof arg == "object" ) {
				utility.iterate( arg, ( v, k ) => {
					x += xml.encode( v, ( typeof v == "object" ), false ).replace( /item|xml/g, isNaN( k ) ? k : "item" );
				} );
			}

			x += wrap ? "</xml>" : "";

			if ( top ) {
				x = "<?xml version=\"1.0\" encoding=\"UTF8\"?>" + x;
			}

			return x;
		}
		catch ( e ) {
			utility.error( e, [arg, wrap, top], this );

			return undefined;
		}
	},

	/**
	 * Validates `arg` is XML
	 *
	 * @method valid
	 * @memberOf xml
	 * @param  {String} arg String to validate
	 * @return {Boolean}    `true` if valid XML
	 */
	valid: ( arg ) => {
		return ( xml.decode( arg ).getElementsByTagName( "parsererror" ).length === 0 );
	}
};
