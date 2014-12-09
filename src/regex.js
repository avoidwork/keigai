/**
 * Regex patterns used through keigai
 *
 * `url` was authored by Diego Perini
 *
 * @namespace regex
 * @private
 * @type {Object}
 */
var regex = {
	after_space          : /\s+.*/,
	allow                : /^allow$/i,
	allow_cors           : /^access-control-allow-methods$/i,
	and                  : /^&/,
	args                 : /\((.*)\)/,
	auth                 : /\/\/(.*)\@/,
	bool                 : /^(true|false)?$/,
	caps                 : /[A-Z]/,
	cdata                : /\&|<|>|\"|\'|\t|\r|\n|\@|\$/,
	checked_disabled     : /checked|disabled/i,
	complete_loaded      : /^(complete|loaded)$/i,
	csv_quote            : /^\s|\"|\n|,|\s$/,
	del                  : /^del/,
	domain               : /^[\w.-_]+\.[A-Za-z]{2,}$/,
	down                 : /down/,
	endslash             : /\/$/,
	eol_nl               : /\n$/,
	element_update       : /id|innerHTML|innerText|textContent|type|src/,
	get_headers          : /^(head|get|options)$/,
	get_remove_set       : /get|remove|set/,
	hash                 : /^\#/,
	header_replace       : /:.*/,
	header_value_replace : /.*:\s+/,
	html                 : /^<.*>$/,
	http_body            : /200|201|202|203|206/,
	http_ports           : /80|443/,
	host                 : /\/\/(.*)\//,
	ie                   : /msie|ie|\.net|windows\snt/i,
	ip                   : /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
	is_xml               : /^<\?xml.*\?>/,
	json_maybe           : /json|plain|javascript/,
	json_wrap            : /^[\[\{]/,
	klass                : /^\./,
	no                   : /no-store|no-cache/i,
	not_dotnotation      : /-|\s/,
	not_endpoint         : /.*\//,
	null_undefined       : /null|undefined/,
	number               : /(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)|number/,
	number_format_1      : /.*\./,
	number_format_2      : /\..*/,
	number_present       : /\d{1,}/,
	number_string        : /number|string/i,
	number_string_object : /number|object|string/i,
	object_type          : /\[object Object\]/,
	patch                : /^patch$/,
	primitive            : /^(boolean|function|number|string)$/,
	priv                 : /private/,
	protocol             : /^(.*)\/\//,
	put_post             : /^(post|put)$/i,
	radio_checkbox       : /^(radio|checkbox)$/i,
	root                 : /^\/[^\/]/,
	select               : /select/i,
	selector_is          : /^:/,
	selector_complex     : /\s+|\>|\+|\~|\:|\[/,
	set_del              : /^(set|del|delete)$/,
	space_hyphen         : /\s|-/,
	string_object        : /string|object/i,
	svg                  : /svg/,
	top_bottom           : /top|bottom/i,
	url                  : /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i,
	word                 : /^\w+$/,
	xdomainrequest       : /^(get|post)$/i,
	xml                  : /xml/i
};
