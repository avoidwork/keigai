/**
 * @namespace string
 * @private
 */
var string = {
	/**
	 * Capitalizes the String
	 *
	 * @method capitalize
	 * @memberOf string
	 * @param  {String}  obj String to capitalize
	 * @param  {Boolean} all [Optional] Capitalize each word
	 * @return {String}      Capitalized String
	 */
	capitalize : function ( obj, all ) {
		all = ( all === true );

		var result;

		if ( all ) {
			result = string.explode( obj, " " ).map( function ( i ) {
				return i.charAt( 0 ).toUpperCase() + i.slice( 1 );
			} ).join(" ");
		}
		else {
			result = obj.charAt( 0 ).toUpperCase() + obj.slice( 1 );
		}

		return result;
	},

	/**
	 * Escapes meta characters within a string
	 *
	 * @method escape
	 * @memberOf string
	 * @param  {String} obj String to escape
	 * @return {String}     Escaped string
	 */
	escape : function ( obj ) {
		return obj.replace( /[\-\[\]{}()*+?.,\\\^\$|#\s]/g, "\\$&" );
	},

	/**
	 * Splits a string on comma, or a parameter, and trims each value in the resulting Array
	 *
	 * @method explode
	 * @memberOf string
	 * @param  {String} obj String to capitalize
	 * @param  {String} arg String to split on
	 * @return {Array}      Array of the exploded String
	 */
	explode : function ( obj, arg ) {
		arg = arg || ",";

		return string.trim( obj ).split( new RegExp( "\\s*" + arg + "\\s*" ) );
	},

	/**
	 * Replaces all spaces in a string with dashes
	 *
	 * @method hyphenate
	 * @memberOf string
	 * @param  {String} obj   String to hyphenate
	 * @param {Boolean} camel [Optional] Hyphenate camelCase
	 * @return {String}       String with dashes instead of spaces
	 */
	hyphenate : function ( obj, camel ) {
		var result = string.trim( obj ).replace( /\s+/g, "-" );

		if ( camel === true ) {
			result = result.replace( /([A-Z])/g, "-$1" ).toLowerCase();
		}

		return result;
	},

	/**
	 * Creates a String representation of an Object, preserving Functions
	 *
	 * Nested Objects are not supported
	 *
	 * @method fromObject
	 * @memberOf string
	 * @param  {Object} obj  Object to convert
	 * @param  {String} name [Optional] Name of Object
	 * @return {String}      String representation
	 */
	fromObject : function ( obj, name ) {
		var result = ( name ? name + " = {" : "{" ) + "\n";

		utility.iterate( obj, function ( v, k ) {
			result += "\"" + k + "\":" + v.toString() + ",\n";
		} );

		result = result.replace( /\[object Object\]/g, "{}" ).replace( /,\n$/, "\n" ) + "}";

		return result;
	},

	/**
	 * Tests if a string is a boolean
	 *
	 * @method isBoolean
	 * @memberOf string
	 * @param  {String}  obj String to test
	 * @return {Boolean}     Result of test
	 */
	isBoolean : function ( obj ) {
		return regex.bool.test( obj );
	},

	/**
	 * Tests if a string is empty
	 *
	 * @method isEmpty
	 * @memberOf string
	 * @param  {String}  obj String to test
	 * @return {Boolean}     Result of test
	 */
	isEmpty : function ( obj ) {
		return string.trim( obj ) === "";
	},

	/**
	 * Tests if a string is a number
	 *
	 * @method isNumber
	 * @memberOf string
	 * @param  {String}  obj String to test
	 * @return {Boolean}     Result of test
	 */
	isNumber : function ( obj ) {
		return regex.number.test( obj );
	},

	/**
	 * Tests if a string is a URL
	 *
	 * @method isUrl
	 * @memberOf string
	 * @param  {String}  obj String to test
	 * @return {Boolean}     Result of test
	 */
	isUrl : function ( obj ) {
		return regex.url.test( obj );
	},

	/**
	 * Transforms the case of a String into CamelCase
	 *
	 * @method toCamelCase
	 * @memberOf string
	 * @param  {String} obj String to capitalize
	 * @return {String}     Camel case String
	 */
	toCamelCase : function ( obj ) {
		var s = string.trim( obj ).replace( /\.|_|-|\@|\[|\]|\(|\)|\#|\$|\%|\^|\&|\*|\s+/g, " " ).toLowerCase().split( regex.space_hyphen ),
		    r = [];

		array.each( s, function ( i, idx ) {
			r.push( idx === 0 ? i : string.capitalize( i ) );
		});

		return r.join( "" );
	},

	/**
	 * Returns singular form of the string
	 *
	 * @method singular
	 * @memberOf string
	 * @param  {String} obj String to transform
	 * @return {String}     Transformed string
	 */
	singular : function ( obj ) {
		return obj.replace( /oe?s$/, "o" ).replace( /ies$/, "y" ).replace( /ses$/, "se" ).replace( /s$/, "" );
	},

	/**
	 * Casts a String to a Function
	 *
	 * @method toFunction
	 * @memberOf string
	 * @param  {String} obj String to cast
	 * @return {Function}   Function
	 */
	toFunction : function ( obj ) {
		var args = string.trim( obj.replace( /^.*\(/, "" ).replace( /[\t|\r|\n|\"|\']+/g, "" ).replace( /\).*/, "" ) ),
		    body = string.trim( obj.replace( /^.*\{/, "" ).replace( /\}$/, "" ) );

		return Function.apply( Function, string.explode( args ).concat( [body] ) );
	},

	/**
	 * Trims the whitespace around a String
	 *
	 * @method trim
	 * @memberOf string
	 * @param  {String} obj String to capitalize
	 * @return {String}     Trimmed String
	 */
	trim : function ( obj ) {
		return obj.replace( /^(\s+|\t+)|(\s+|\t+)$/g, "" );
	},

	/**
	 * Uncamelcases the String
	 *
	 * @method unCamelCase
	 * @memberOf string
	 * @param  {String} obj String to uncamelcase
	 * @return {String}     Uncamelcased String
	 */
	unCamelCase : function ( obj ) {
		return string.trim( obj.replace( /([A-Z])/g, " $1" ).toLowerCase() );
	},

	/**
	 * Uncapitalizes the String
	 *
	 * @method uncapitalize
	 * @memberOf string
	 * @param  {String} obj String to uncapitalize
	 * @return {String}     Uncapitalized String
	 */
	uncapitalize : function ( obj ) {
		obj = string.trim( obj );

		return obj.charAt( 0 ).toLowerCase() + obj.slice( 1 );
	},

	/**
	 * Replaces all hyphens with spaces
	 *
	 * @method unhyphenate
	 * @memberOf string
	 * @param  {String}  obj  String to unhypenate
	 * @param  {Boolean} caps [Optional] True to capitalize each word
	 * @return {String}       Unhyphenated String
	 */
	unhyphenate : function ( obj, caps ) {
		if ( caps !== true ) {
			return string.explode( obj, "-" ).join( " " );
		}
		else {
			return string.explode( obj, "-" ).map( function ( i ) {
				return string.capitalize( i );
			} ).join( " " );
		}
	}
};