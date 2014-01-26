/**
 * Common UI labels & error messages
 *
 * @namespace label
 */
var label = {
	/**
	 * Common labels
	 *
	 * @namespace label.common
	 */
	common : {
		/**
		 * Back
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		back        : "Back",

		/**
		 * Cancel
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		cancel      : "Cancel",

		/**
		 * Clear
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		clear       : "Clear",

		/**
		 * Close
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		close       : "Close",

		/**
		 * Continue
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		cont        : "Continue",

		/**
		 * Create
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		create	    : "Create",

		/**
		 * Custom Range
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		customRange : "Custom Range",

		/**
		 * Delete
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		del         : "Delete",

		/**
		 * Edit
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		edit        : "Edit",

		/**
		 * Find
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		find        : "Find",

		/**
		 * From
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		from        : "From",

		/**
		 * Generate
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		gen         : "Generate",

		/**
		 * Go
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		go          : "Go",

		/**
		 * Loading
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		loading     : "Loading",

		/**
		 * Next
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		next        : "Next",

		/**
		 * Login
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		login       : "Login",

		/**
		 * Random
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		ran         : "Random",

		/**
		 * Reset
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		reset       : "Reset",

		/**
		 * Save
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		save        : "Save",

		/**
		 * Search
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		search      : "Search",

		/**
		 * Send
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		send        : "Send",

		/**
		 * Submit
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		submit      : "Submit",

		/**
		 * To
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		to          : "To",

		/**
		 * Today
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		today       : "Today",

		/**
		 * Yesterday
		 *
		 * @type {String}
		 * @memberOf label.common
		 */
		yesterday   : "Yesterday"
	},

	/**
	 * Days of the week
	 *
	 * @namespace label.day
	 */
	day : {
		/**
		 * Sunday
		 *
		 * @type {String}
		 * @memberOf label.day
		 */
		0 : "Sunday",

		/**
		 * Monday
		 *
		 * @type {String}
		 * @memberOf label.day
		 */
		1 : "Monday",

		/**
		 * Tuesday
		 *
		 * @type {String}
		 * @memberOf label.day
		 */
		2 : "Tuesday",

		/**
		 * Wednesday
		 *
		 * @type {String}
		 * @memberOf label.day
		 */
		3 : "Wednesday",

		/**
		 * Thursday
		 *
		 * @type {String}
		 * @memberOf label.day
		 */
		4 : "Thursday",

		/**
		 * Friday
		 *
		 * @type {String}
		 * @memberOf label.day
		 */
		5 : "Friday",

		/**
		 * Saturday
		 *
		 * @type {String}
		 * @memberOf label.day
		 */
		6 : "Saturday"
	},

	/**
	 * Error messages
	 *
	 * @namespace label.error
	 */
	error : {
		/**
		 * Failed to open the Database, possibly exceeded Domain quota
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		databaseNotOpen       : "Failed to open the Database, possibly exceeded Domain quota",

		/**
		 * Client does not support local database storage
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		databaseNotSupported  : "Client does not support local database storage",

		/**
		 * Possible SQL injection in database transaction, use the &#63; placeholder
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		databaseWarnInjection : "Possible SQL injection in database transaction, use the &#63; placeholder",

		/**
		 * More than one match found
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		databaseMoreThanOne   : "More than one match found",

		/**
		 * Could not create the Element
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		elementNotCreated     : "Could not create the Element",

		/**
		 * Could not find the Element
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		elementNotFound       : "Could not find the Element",

		/**
		 * Expected an Array
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		expectedArray         : "Expected an Array",

		/**
		 * Expected an Array or Object
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		expectedArrayObject   : "Expected an Array or Object",

		/**
		 * Expected a Boolean value
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		expectedBoolean       : "Expected a Boolean value",

		/**
		 * Expected a Number
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		expectedNumber        : "Expected a Number",

		/**
		 * Expected a property, and it was not set
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		expectedProperty      : "Expected a property, and it was not set",

		/**
		 * Expected an Object
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		expectedObject        : "Expected an Object",

		/**
		 * One or more arguments is invalid
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		invalidArguments      : "One or more arguments is invalid",

		/**
		 * Invalid Date
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		invalidDate           : "Invalid Date",

		/**
		 * The following required fields are invalid:
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		invalidFields         : "The following required fields are invalid: ",

		/**
		 * The route could not be found
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		invalidRoute          : "The route could not be found",

		/**
		 * INVALID_STATE_ERR: Headers have not been received
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		invalidStateNoHeaders : "INVALID_STATE_ERR: Headers have not been received",

		/**
		 * Synchronous XMLHttpRequest requests are not supported
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		invalidStateNoSync    : "Synchronous XMLHttpRequest requests are not supported",

		/**
		 * INVALID_STATE_ERR: Object is not open
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		invalidStateNotOpen   : "INVALID_STATE_ERR: Object is not open",

		/**
		 * INVALID_STATE_ERR: Object is sending
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		invalidStateNotSending: "INVALID_STATE_ERR: Object is sending",

		/**
		 * INVALID_STATE_ERR: Object is not usable
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		invalidStateNotUsable : "INVALID_STATE_ERR: Object is not usable",

		/**
		 * Requested method is not available
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		notAvailable          : "Requested method is not available",

		/**
		 * This feature is not supported by this platform
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		notSupported          : "This feature is not supported by this platform",

		/**
		 * Could not find the requested property
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		propertyNotFound      : "Could not find the requested property",

		/**
		 * The promise cannot be resolved while pending result
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		promisePending        : "The promise cannot be resolved while pending result",

		/**
		 * The promise has been resolved: {{outcome}}
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		promiseResolved       : "The promise has been resolved: {{outcome}}",

		/**
		 * Server error has occurred
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		serverError           : "Server error has occurred",

		/**
		 * Forbidden to access URI
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		serverForbidden       : "Forbidden to access URI",

		/**
		 * Method not allowed
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		serverInvalidMethod   : "Method not allowed",

		/**
		 * Authorization required to access URI
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		serverUnauthorized    : "Authorization required to access URI",

		/**
		 * Property is read only
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		readOnly              : "Property is read only",

		/**
		 * Your browser is too old to use keigai, please upgrade
		 *
		 * @type {String}
		 * @memberOf label.error
		 */
		upgrade               : "Your browser is too old to use keigai, please upgrade"
	},

	/**
	 * Months of the Year
	 *
	 * @namespace label.month
	 */
	month : {
		/**
		 * January
		 *
		 * @type {String}
		 * @memberOf label.month
		 */
		0  : "January",

		/**
		 * February
		 *
		 * @type {String}
		 * @memberOf label.month
		 */
		1  : "February",

		/**
		 * March
		 *
		 * @type {String}
		 * @memberOf label.month
		 */
		2  : "March",

		/**
		 * April
		 *
		 * @type {String}
		 * @memberOf label.month
		 */
		3  : "April",

		/**
		 * May
		 *
		 * @type {String}
		 * @memberOf label.month
		 */
		4  : "May",

		/**
		 * June
		 *
		 * @type {String}
		 * @memberOf label.month
		 */
		5  : "June",

		/**
		 * July
		 *
		 * @type {String}
		 * @memberOf label.month
		 */
		6  : "July",

		/**
		 * August
		 *
		 * @type {String}
		 * @memberOf label.month
		 */
		7  : "August",

		/**
		 * September
		 *
		 * @type {String}
		 * @memberOf label.month
		 */
		8  : "September",

		/**
		 * October
		 *
		 * @type {String}
		 * @memberOf label.month
		 */
		9  : "October",

		/**
		 * November
		 *
		 * @type {String}
		 * @memberOf label.month
		 */
		10 : "November",
		
		/**
		 * December
		 *
		 * @type {String}
		 * @memberOf label.month
		 */
		11 : "December"
	}
};
