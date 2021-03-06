( function ( global ) {
const document = global.document;
const location = global.location || {};
const navigator = global.navigator;
const server = typeof process !== "undefined";
const mutation = typeof MutationObserver === "function";
const MAX = 10;
const VERSIONS = 100;
const CACHE = 500;
const EVENTS = [ "readystatechange", "abort", "load", "loadstart", "loadend", "error", "progress", "timeout" ];

let Buffer = function () {};
let Promise = global.Promise || undefined;
let localStorage = global.localStorage || undefined;
let XMLHttpRequest = global.XMLHttpRequest || null;
let WeakMap = global.WeakMap || null;
let btoa = global.btoa || undefined;
let webWorker = typeof Blob !== "undefined" && typeof Worker !== "undefined";
let external, http, https, mongodb, url, RENDER, TIME, WORKER;

if ( server ) {
	url = require( "url" );
	http = require( "http" );
	https = require( "https" );
	mongodb = require( "mongodb" ).MongoClient;
	Buffer = require( "buffer" ).Buffer;

	if ( typeof Promise === "undefined" ) {
		Promise = require( "es6-promise" ).Promise;
	}

	if ( typeof localStorage === "undefined" ) {
		localStorage = require( "localStorage" );
	}

	if ( typeof btoa === "undefined" ) {
		btoa = require( "btoa" );
	}
}

let lib = ( function () {
