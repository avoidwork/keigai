/**
 * @namespace csv
 */
let csv = {
	/**
	 * Converts CSV to an Array of Objects
	 *
	 * @method decode
	 * @memberOf csv
	 * @param  {String} arg       CSV string
	 * @param  {String} delimiter [Optional] Delimiter to split columns on, default is ","
	 * @return {Array}            Array of Objects
	 */
	decode: ( arg, delimiter="," ) => {
		let regex = new RegExp( delimiter + "(?=(?:[^\"]|\"(?:[^\"])[^\"]*\")*$)" );
		let rows = string.trim( arg ).split( "\n" );
		let keys = rows.shift().split( delimiter );
		let result;

		result = rows.map( ( r ) => {
			let obj = {};
			let row = r.split( regex );

			array.each( keys, ( i, idx ) => {
				obj[ i ] = utility.coerce( ( row[ idx ] || "" ).replace( /^"|"$/g, "" ) );
			} );

			return obj;
		} );

		return result;
	},

	/**
	 * Encodes an Array, JSON, or Object as CSV
	 *
	 * @method encode
	 * @memberOf csv
	 * @param  {Mixed}   arg       JSON, Array or Object
	 * @param  {String}  delimiter [Optional] Character to separate fields
	 * @param  {Boolean} header    [Optional] `false` to disable keys names as first row
	 * @return {String}            CSV string
	 * @example
	 * let csv = keigai.util.csv.encode( [{prop:"value"}, {prop:"value2"}] );
	 *
	 * console.log( csv );
	 * "prop
	 *  value
	 *  value2"
	 */
	encode: ( arg, delimiter=",", header=true ) => {
		let obj = json.decode( arg, true ) || arg;
		let result = "";

		// Prepares input based on CSV rules
		let prepare = ( input ) => {
			let output;

			if ( input instanceof Array ) {
				output = "\"" + input.toString() + "\"";

				if ( regex.object_type.test( output ) ) {
					output = "\"" + csv.encode( input, delimiter ) + "\"";
				}
			} else if ( input instanceof Object ) {
				output = "\"" + csv.encode( input, delimiter ) + "\"";
			} else if ( regex.csv_quote.test( input ) ) {
				output = "\"" + input.replace( /"/g, "\"\"" ) + "\"";
			} else {
				output = input;
			}

			return output;
		};

		if ( obj instanceof Array ) {
			if ( obj[ 0 ] instanceof Object ) {
				if ( header ) {
					result = ( array.keys( obj[ 0 ] ).join( delimiter ) + "\n" );
				}

				result += obj.map( ( i ) => {
					return csv.encode( i, delimiter, false );
				} ).join( "\n" );
			} else {
				result += ( prepare( obj, delimiter ) + "\n" );
			}

		} else {
			if ( header ) {
				result = ( array.keys( obj ).join( delimiter ) + "\n" );
			}

			result += ( array.cast( obj ).map( prepare ).join( delimiter ) + "\n" );
		}

		return result.replace( regex.eol_nl, "" );
	}
};
