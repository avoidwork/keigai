/**
 * @namespace csv
 */
var csv = {
	/**
	 * Converts CSV to an Array of Objects
	 *
	 * @method decode
	 * @memberOf csv
	 * @param  {String} arg       CSV string
	 * @param  {String} delimiter [Optional] Delimiter to split columns on, default is ","
	 * @return {Array}            Array of Objects
	 */
	decode : function ( arg, delimiter ) {
		delimiter  = delimiter || ",";
		var regex  = new RegExp( delimiter + "(?=(?:[^\"]|\"[^\"]*\")*$)" ),
		    rows   = arg.split( "\n" ),
		    keys   = rows.shift().split( delimiter ),
		    result = [],
		    nth    = rows.length,
		    x      = keys.length,
		    i      = -1,
		    n, obj, row;

		while ( ++i < nth ) {
			obj = {};
			row = rows[i].split( regex );

			n = -1;
			while ( ++n  < x ) {
				obj[keys[n]] = utility.coerce( ( row[n] || "" ).replace( /^"|"$/g, "" ) );
			}

			result.push( obj );
		}

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
	 * var csv = keigai.util.csv.encode( [{prop:"value"}, {prop:"value2"}] );
	 *
	 * console.log( csv );
	 * "prop
	 *  value
	 *  value2"
	 */
	encode : function ( arg, delimiter, header ) {
		var obj    = json.decode( arg, true ) || arg,
		    result = "";

		delimiter  = delimiter || ",";
		header     = ( header !== false );

		// Prepares input based on CSV rules
		function prepare ( input ) {
			var output;

			if ( input instanceof Array ) {
				output = "\"" + input.toString() + "\"";

				if ( regex.object_type.test( output ) ) {
					output = "\"" + csv.encode( input, delimiter ) + "\"";
				}
			}
			else if ( input instanceof Object ) {
				output = "\"" + csv.encode( input, delimiter ) + "\"";
			}
			else if ( regex.csv_quote.test( input ) ) {
				output = "\"" + input.replace( /"/g, "\"\"" ) + "\"";
			}
			else {
				output = input;
			}

			return output;
		}

		if ( obj instanceof Array ) {
			if ( obj[0] instanceof Object ) {
				if ( header ) {
					result = ( array.keys( obj[0] ).join( delimiter ) + "\n" );
				}

				result += obj.map( function ( i ) {
					return csv.encode( i, delimiter, false );
				} ).join( "\n" );
			}
			else {
				result += ( prepare( obj, delimiter ) + "\n" );
			}

		}
		else {
			if ( header ) {
				result = ( array.keys( obj ).join( delimiter ) + "\n" );
			}

			result += ( array.cast( obj ).map( prepare ).join( delimiter ) + "\n" );
		}

		return result.replace( regex.eol_nl , "");
	}
};
