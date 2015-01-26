( global ) => {
let document = global.document;
let location = global.location;
let navigator = global.navigator;
let server = typeof process != "undefined";
let webWorker = typeof Blob != "undefined" && typeof Worker != "undefined";
let MAX = 10;
let VERSIONS = 100;
let CACHE = 500;
let EVENTS = [ "readystatechange", "abort", "load", "loadstart", "loadend", "error", "progress", "timeout" ];
let Promise = global.Promise || undefined;
let localStorage = global.localStorage || undefined;
let XMLHttpRequest = global.XMLHttpRequest || null;
let WeakMap = global.WeakMap || null;
let btoa = global.btoa || undefined;
let format, http, https, lib, mongodb, url, RENDER, TIME, WORKER;

if ( server ) {
	url = require( "url" );
	http = require( "http" );
	https = require( "https" );
	mongodb = require( "mongodb" ).MongoClient;
	format = require( "util" ).format;

	if ( typeof Promise == "undefined" ) {
		Promise = require( "es6-promise" ).Promise;
	}

	if ( typeof localStorage == "undefined" ) {
		localStorage = require( "localStorage" );
	}

	if ( typeof btoa == "undefined" ) {
		btoa = require( "btoa" );
	}
}
else if ( typeof Buffer == "undefined" ) {
	Buffer = () => {};
}

let lib = () => {
	let external, has;
