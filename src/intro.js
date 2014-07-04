( function ( global ) {

var document  = global.document,
    location  = global.location,
    navigator = global.navigator,
    server    = typeof process != "undefined",
    webWorker = typeof Blob != "undefined" && typeof Worker != "undefined",
    MAX       = 10,
    VERSIONS  = 100,
    CACHE     = 500,
    EVENTS    = ["readystatechange", "abort", "load", "loadstart", "loadend", "error", "progress", "timeout"],
    format, http, https, lib, mongodb, url, RENDER, TIME, WORKER;

if ( server ) {
	url     = require( "url" );
	http    = require( "http" );
	https   = require( "https" );
	mongodb = require( "mongodb" ).MongoClient;
	format  = require( "util" ).format;

	if ( typeof Promise == "undefined" ) {
		Promise = require( "es6-promise" ).Promise;
	}

	if ( typeof Storage == "undefined" ) {
		localStorage = require( "localStorage" );
	}

	if ( typeof XMLHttpRequest == "undefined" ) {
		XMLHttpRequest = null;
	}

	if ( typeof btoa == "undefined" ) {
		btoa = require( "btoa" );
	}
}
else if ( typeof Buffer == "undefined" ) {
	Buffer = function () {};
}

lib = ( function () {
"use strict";

var external, has, slice;
