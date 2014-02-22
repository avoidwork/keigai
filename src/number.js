/**
 * @namespace number
 * @private
 */
var number = {
	/**
	 * Returns the difference of arg
	 *
	 * @method diff
	 * @memberOf number
	 * @param {Number} arg Number to compare
	 * @return {Number}    The absolute difference
	 */
	diff : function ( num1, num2 ) {
		if ( isNaN( num1 ) || isNaN( num2 ) ) {
			throw new Error( label.expectedNumber );
		}

		return Math.abs( num1 - num2 );
	},

	/**
	 * Formats a Number to a delimited String
	 *
	 * @method format
	 * @memberOf number
	 * @param  {Number} arg       Number to format
	 * @param  {String} delimiter [Optional] String to delimit the Number with
	 * @param  {String} every     [Optional] Position to insert the delimiter, default is 3
	 * @return {String}           Number represented as a comma delimited String
	 */
	format : function ( arg, delimiter, every ) {
		if ( isNaN( arg ) ) {
			throw new Error( label.error.expectedNumber );
		}

		arg       = arg.toString();
		delimiter = delimiter || ",";
		every     = every     || 3;

		var d = arg.indexOf( "." ) > -1 ? "." + arg.replace( regex.number_format_1, "" ) : "",
		    a = arg.replace( regex.number_format_2, "" ).split( "" ).reverse(),
		    p = Math.floor( a.length / every ),
		    i = 1, n, b;

		for ( b = 0; b < p; b++ ) {
			n = i === 1 ? every : ( every * i ) + ( i === 2 ? 1 : ( i - 1 ) );
			a.splice( n, 0, delimiter );
			i++;
		}

		a = a.reverse().join( "" );

		if ( a.charAt( 0 ) === delimiter ) {
			a = a.substring( 1 );
		}

		return a + d;
	},

	/**
	 * Parses the number
	 *
	 * @method parse
	 * @memberOf number
	 * @param  {Mixed}  arg  Number to parse
	 * @param  {Number} base Integer representing the base or radix
	 * @return {Number}      Integer or float
	 */
	parse : function ( arg, base ) {
		return ( base === undefined ) ? parseFloat( arg ) : parseInt( arg, base );
	}
};
