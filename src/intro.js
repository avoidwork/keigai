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
    http, https, lib, url, WORKER;

if ( server ) {
	url     = require( "url" );
	http    = require( "http" );
	https   = require( "https" );
	mongodb = require( "mongodb" ).MongoClient;
	format  = require( "util" ).format;

	if ( typeof Storage == "undefined" ) {
		localStorage = require( "localStorage" );
	}

	if ( typeof XMLHttpRequest == "undefined" ) {
		XMLHttpRequest = null;
	}
}

lib = ( function () {
"use strict";

var external, has, slice;
