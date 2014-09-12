/**
 * @namespace string
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
	 * @example
	 * keigai.util.string.capitalize( "hello" ); // "Hello"
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
	 * @example
	 * keigai.util.string.escape( "{hello}" ); // "\{hello\}"
	 */
	escape : function ( obj ) {
		return obj.replace( /[\-\[\]{}()*+?.,\\\/\^\$|#\s]/g, "\\$&" );
	},

	/**
	 * Splits a string on comma, or a parameter, and trims each value in the resulting Array
	 *
	 * @method explode
	 * @memberOf string
	 * @param  {String} obj String to capitalize
	 * @param  {String} arg String to split on
	 * @return {Array}      Array of the exploded String
	 * @example
	 * keigai.util.array.each( keigai.util.string.explode( "abc, def" ), function ( i ) {
	 *   ...
	 * } );
	 */
	explode : function ( obj, arg ) {
		arg = arg || ",";

		return string.trim( obj ).split( new RegExp( "\\s*" + arg + "\\s*" ) );
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
	 * @example
	 * keigai.util.string.fromObject( {a: true, b: false}, "stats" ); // "stats = {'a': true,'b':false}"
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
	 * Replaces all spaces in a string with dashes
	 *
	 * @method hyphenate
	 * @memberOf string
	 * @param  {String} obj   String to hyphenate
	 * @param {Boolean} camel [Optional] Hyphenate camelCase
	 * @return {String}       String with dashes instead of spaces
	 * @example
	 * keigai.util.string.hyphenate( "hello world" ); // "hello-world"
	 */
	hyphenate : function ( obj, camel ) {
		var result = string.trim( obj ).replace( /\s+/g, "-" );

		if ( camel === true ) {
			result = result.replace( /([A-Z])/g, "-$1" ).toLowerCase();
		}

		return result;
	},

	/**
	 * Tests if a string is a boolean
	 *
	 * @method isBoolean
	 * @memberOf string
	 * @param  {String}  obj String to test
	 * @return {Boolean}     Result of test
	 * @example
	 * if ( keigai.util.string.isBoolean( ... ) {
	 *   ...
	 * } );
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
	 * @example
	 * if ( !keigai.util.string.isEmpty( ... ) {
	 *   ...
	 * } );
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
	 * @example
	 * if ( keigai.util.string.isNumber( ... ) {
	 *   ...
	 * } );
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
	 * @example
	 * if ( keigai.util.string.isUrl( ... ) {
	 *   ...
	 * } );
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
	 * @example
	 * keigai.util.string.toCamelCase( "hello world" ); // "helloWorld"
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
	 * @example
	 * keigai.util.string.singular( "cans" ); // "can"
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
	 * @example
	 * var fn = someFunction.toString();
	 *
	 * ...
	 *
	 * var func = keigai.util.string.toFunction( fn );
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
	 * @example
	 * keigai.util.string.trim( "  hello world " ); // "hello world"
	 */
	trim : function ( obj ) {
		return obj.replace( /^(\s+|\t+|\n+)|(\s+|\t+|\n+)$/g, "" );
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
	 * @example
	 * keigai.util.string.uncapitalize( "Hello" ); // "hello"
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
	 * @example
	 * keigai.util.string.unhyphenate( "hello-world" );       // "hello world"
	 * keigai.util.string.unhyphenate( "hello-world", true ); // "Hello World"
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
