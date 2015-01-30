/**
 * @namespace number
 */
let number = {
	/**
	 * Returns the difference of arg
	 *
	 * @method diff
	 * @memberOf number
	 * @param {Number} arg Number to compare
	 * @return {Number}    The absolute difference
	 * @example
	 * keigai.util.number.diff( -3, 8 ); // 11
	 */
	diff: ( num1, num2 ) => {
		return Math.abs( num1 - num2 );
	},

	/**
	 * Tests if an number is even
	 *
	 * @method even
	 * @memberOf number
	 * @param {Number} arg Number to test
	 * @return {Boolean}   True if even, or undefined
	 * @example
	 * let n = keigai.util.number.random( 10 );
	 *
	 * if ( keigai.util.number.even( n ) ) {
	 *   ...
	 * }
	 */
	even: ( arg ) => {
		return arg % 2 === 0;
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
	 * @example
	 * keigai.util.number.format( 1000 ); // "1,000"
	 */
	format: ( arg, delimiter=",", every=3 ) => {
		arg = arg.toString();

		let d = arg.indexOf( "." ) > -1 ? "." + arg.replace( regex.number_format_1, "" ) : "";
		let a = arg.replace( regex.number_format_2, "" ).split( "" ).reverse();
		let p = Math.floor( a.length / every );
		let i = 1;
		let n, b;

		for ( b = 0; b < p; b++ ) {
			n = i === 1 ? every: ( every * i ) + ( i === 2 ? 1: ( i - 1 ) );
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
	 * Returns half of a, or true if a is half of b
	 *
	 * @method half
	 * @memberOf number
	 * @param  {Number} a Number to divide
	 * @param  {Number} b [Optional] Number to test a against
	 * @return {Mixed}    Boolean if b is passed, Number if b is undefined
	 * @example
	 * if ( keigai.util.number.half( 2, 4 ) ) {
	 *   ...
	 * } );
	 */
	half: ( a, b ) => {
		return b ? ( ( a / b ) === 0.5 ): ( a / 2 );
	},

	/**
	 * Tests if a number is odd
	 *
	 * @method odd
	 * @memberOf number
	 * @param  {Number} arg Number to test
	 * @return {Boolean}    True if odd, or undefined
	 * @example
	 * let n = keigai.util.number.random( 10 );
	 *
	 * if ( keigai.util.number.odd( n ) ) {
	 *   ...
	 * }
	 */
	odd: ( arg ) => {
		return !number.even( arg );
	},

	/**
	 * Parses the number
	 *
	 * @method parse
	 * @memberOf number
	 * @param  {Mixed}  arg  Number to parse
	 * @param  {Number} base Integer representing the base or radix
	 * @return {Number}      Integer or float
	 * @example
	 * // Unsure if `n` is an int or a float
	 * keigai.util.number.parse( n );
	 */
	parse: ( arg, base ) => {
		return ( base === undefined ) ? parseFloat( arg ) : parseInt( arg, base );
	},

	/**
	 * Generates a random number between 0 and `arg`
	 *
	 * @method random
	 * @memberOf number
	 * @param  {Number} arg Ceiling for random number, default is 100
	 * @return {Number}     Random number
	 * @example
	 * let n = keigai.util.math.random( 10 );
	 */
	random: ( arg=100 ) => {
		return Math.floor( Math.random() * ( arg + 1 ) );
	},

	/**
	 * Rounds a number up or down
	 *
	 * @method round
	 * @memberOf number
	 * @param  {Number} arg       Number to round
	 * @param  {String} direction [Optional] "up" or "down"
	 * @return {Number}           Rounded interger
	 * @example
	 * keigai.util.math.round( n, "down" );
	 */
	round: ( arg, direction ) => {
		arg = number.parse( arg );

		if ( direction === undefined || string.isEmpty( direction ) ) {
			return number.parse( arg.toFixed( 0 ) );
		} else if ( regex.down.test( direction ) ) {
			return ~~( arg );
		} else {
			return Math.ceil( arg );
		}
	}
};
