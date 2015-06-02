"use strict";

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 __          .__             .__   ____     ________      ____   _____  
|  | __ ____ |__| _________  |__| /_   |    \_____  \    /_   | /  |  | 
|  |/ // __ \|  |/ ___\__  \ |  |  |   |      _(__  <     |   |/   |  |_
|    <\  ___/|  / /_/  > __ \|  |  |   |     /       \    |   /    ^   /
|__|_ \\___  >__\___  (____  /__|  |___| /\ /______  / /\ |___\____   | 
     \/    \/  /_____/     \/            \/        \/  \/          |__| 

2015 Jason Mulligan <jason.mulligan@avoidwork.com>
*/
(function (global) {
	var document = global.document;
	var location = global.location || {};
	var navigator = global.navigator;
	var server = typeof process !== "undefined";
	var mutation = typeof MutationObserver === "function";
	var MAX = 10;
	var VERSIONS = 100;
	var CACHE = 500;
	var EVENTS = ["readystatechange", "abort", "load", "loadstart", "loadend", "error", "progress", "timeout"];

	var Buffer = function Buffer() {};
	var Promise = global.Promise || undefined;
	var localStorage = global.localStorage || undefined;
	var XMLHttpRequest = global.XMLHttpRequest || null;
	var WeakMap = global.WeakMap || null;
	var btoa = global.btoa || undefined;
	var webWorker = typeof Blob !== "undefined" && typeof Worker !== "undefined";
	var external = undefined,
	    http = undefined,
	    https = undefined,
	    mongodb = undefined,
	    url = undefined,
	    RENDER = undefined,
	    TIME = undefined,
	    WORKER = undefined;

	if (server) {
		url = require("url");
		http = require("http");
		https = require("https");
		mongodb = require("mongodb").MongoClient;
		Buffer = require("buffer").Buffer;

		if (typeof Promise === "undefined") {
			Promise = require("es6-promise").Promise;
		}

		if (typeof localStorage === "undefined") {
			localStorage = require("localStorage");
		}

		if (typeof btoa === "undefined") {
			btoa = require("btoa");
		}
	}

	var lib = (function () {

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
			after_space: /\s+.*/,
			allow: /^allow$/i,
			allow_cors: /^access-control-allow-methods$/i,
			and: /^&/,
			args: /\((.*)\)/,
			auth: /\/\/(.*)\@/,
			bool: /^(true|false)?$/,
			boolean_number_string: /boolean|number|string/,
			caps: /[A-Z]/,
			cdata: /\&|<|>|\"|\'|\t|\r|\n|\@|\$/,
			checked_disabled: /checked|disabled/i,
			complete_loaded: /^(complete|loaded)$/i,
			csv_quote: /^\s|\"|\n|,|\s$/,
			del: /^del/,
			domain: /^[\w.-_]+\.[A-Za-z]{2,}$/,
			down: /down/,
			endslash: /\/$/,
			eol_nl: /\n$/,
			element_update: /id|innerHTML|innerText|textContent|type|src/,
			get_headers: /^(head|get|options)$/,
			get_remove_set: /get|remove|set/,
			hash: /^\#/,
			header_replace: /:.*/,
			header_value_replace: /.*:\s+/,
			html: /^<.*>$/,
			http_body: /200|201|202|203|206/,
			http_ports: /80|443/,
			host: /\/\/(.*)\//,
			ie: /msie|ie|\.net|windows\snt/i,
			ip: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
			is_xml: /^<\?xml.*\?>/,
			json_maybe: /json|plain|javascript/,
			json_wrap: /^[\[\{]/,
			klass: /^\./,
			no: /no-store|no-cache/i,
			not_dotnotation: /-|\s/,
			not_endpoint: /.*\//,
			null_undefined: /null|undefined/,
			number: /(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)|number/,
			number_format_1: /.*\./,
			number_format_2: /\..*/,
			number_present: /\d{1,}/,
			number_string: /number|string/i,
			number_string_object: /number|object|string/i,
			object_type: /\[object Object\]/,
			patch: /^patch$/,
			primitive: /^(boolean|function|number|string)$/,
			priv: /private/,
			protocol: /^(.*)\/\//,
			put_post: /^(post|put)$/i,
			radio_checkbox: /^(radio|checkbox)$/i,
			root: /^\/[^\/]/,
			select: /select/i,
			selector_is: /^:/,
			selector_complex: /\s+|\>|\+|\~|\:|\[/,
			set_del: /^(set|del|delete)$/,
			space_hyphen: /\s|-/,
			string_object: /string|object/i,
			svg: /svg/,
			top_bottom: /top|bottom/i,
			url: /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i,
			word: /^\w+$/,
			xdomainrequest: /^(get|post)$/i,
			xml: /xml/i
		};

		var LRU = (function () {
			/**
    * Creates a new Least Recently Used cache
    *
    * @constructor
    * @memberOf keigai
    * @param  {Number} max [Optional] Max size of cache, default is 1000
    * @example
    * let lru = keigai.util.lru( 50 );
    */

			function LRU() {
				var max = arguments[0] === undefined ? 1000 : arguments[0];

				_classCallCheck(this, LRU);

				this.cache = {};
				this.max = max;
				this.first = null;
				this.last = null;
				this.length = 0;
			}

			_createClass(LRU, [{
				key: "evict",

				/**
     * Evicts the least recently used item from cache
     *
     * @method evict
     * @memberOf keigai.LRU
     * @return {Object} {@link keigai.LRU}
     * @example
     * lru.evict();
     */
				value: function evict() {
					if (this.last !== null) {
						this.remove(this.last);
					}

					return this;
				}
			}, {
				key: "get",

				/**
     * Gets cached item and moves it to the front
     *
     * @method get
     * @memberOf keigai.LRU
     * @param  {String} key Item key
     * @return {Object} {@link keigai.LRUItem}
     * @example
     * let item = lru.get( "key" );
     */
				value: function get(key) {
					var item = this.cache[key];

					if (item === undefined) {
						return;
					}

					this.set(key, item.value);

					return item.value;
				}
			}, {
				key: "remove",

				/**
     * Removes item from cache
     *
     * @method remove
     * @memberOf keigai.LRU
     * @param  {String} key Item key
     * @return {Object} {@link keigai.LRUItem}
     * @example
     * lru.remove( "key" );
     */
				value: function remove(key) {
					var item = this.cache[key];

					if (item) {
						delete this.cache[key];

						this.length--;

						if (item.previous !== null) {
							this.cache[item.previous].next = item.next;
						}

						if (item.next !== null) {
							this.cache[item.next].previous = item.previous;
						}

						if (this.first === key) {
							this.first = item.previous;
						}

						if (this.last === key) {
							this.last = item.next;
						}
					}

					return item;
				}
			}, {
				key: "set",

				/**
     * Sets item in cache as `first`
     *
     * @method set
     * @memberOf keigai.LRU
     * @param  {String} key   Item key
     * @param  {Mixed}  value Item value
     * @return {Object} {@link keigai.LRU}
     * @example
     * lru.set( "key", {x: true} );
     */
				value: function set(key, value) {
					var item = this.remove(key);

					if (item === undefined) {
						item = new LRUItem(value);
					} else {
						item.value = value;
					}

					item.next = null;
					item.previous = this.first;
					this.cache[key] = item;

					if (this.first !== null) {
						this.cache[this.first].next = key;
					}

					this.first = key;

					if (this.last === null) {
						this.last = key;
					}

					if (++this.length > this.max) {
						this.evict();
					}

					return this;
				}
			}]);

			return LRU;
		})();

		/**
   * Creates a new LRUItem
   *
   * @constructor
   * @memberOf keigai
   * @param {Mixed} value Item value
   * @private
   */

		var LRUItem = function LRUItem(value) {
			_classCallCheck(this, LRUItem);

			this.next = null;
			this.previous = null;
			this.value = value;
		};

		/**
   * @namespace lru
   */
		var lru = {
			/**
    * LRU factory
    *
    * @method factory
    * @memberOf lru
    * @return {Object} {@link keigai.LRU}
    * @example
    * let lru = keigai.util.lru( 50 );
    */
			factory: function factory(max) {
				return new LRU(max);
			}
		};

		var Observable = (function () {
			/**
    * Creates a new Observable
    *
    * @constructor
    * @memberOf keigai
    * @param  {Number} arg Maximum listeners, default is 10
    * @example
    * let observer = keigai.util.observer( 50 );
    */

			function Observable() {
				var arg = arguments[0] === undefined ? MAX : arguments[0];

				_classCallCheck(this, Observable);

				this.limit = arg;
				this.listeners = {};
				this.hooks = new WeakMap();
			}

			_createClass(Observable, [{
				key: "dispatch",

				/**
     * Dispatches an event, with optional arguments
     *
     * @method dispatch
     * @memberOf keigai.Observable
     * @return {Object} {@link keigai.Observable}
     * @example
     * observer.dispatch( "event", ... );
     */
				value: function dispatch(ev) {
					for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
						args[_key - 1] = arguments[_key];
					}

					if (ev && this.listeners[ev]) {
						utility.iterate(this.listeners[ev], function (i) {
							i.handler.apply(i.scope, args);
						});
					}

					return this;
				}
			}, {
				key: "hook",

				/**
     * Hooks into `target` for a DOM event
     *
     * @method hook
     * @memberOf keigai.Observable
     * @param  {Object} target Element
     * @param  {String} ev     Event
     * @return {Object}        Element
     * @example
     * observer.hook( document.querySelector( "a" ), "click" );
     */
				value: function hook(target, ev) {
					var _this2 = this;

					if (typeof target.addEventListener !== "function") {
						throw new Error(label.invalidArguments);
					}

					var obj = this.hooks.get(target) || {};

					obj[ev] = function (arg) {
						_this2.dispatch(ev, arg);
					};

					this.hooks.set(target, obj);
					target.addEventListener(ev, this.hooks.get(target)[ev], false);

					return target;
				}
			}, {
				key: "off",

				/**
     * Removes all, or a specific listener for an event
     *
     * @method off
     * @memberOf keigai.Observable
     * @param {String} ev Event name
     * @param {String} id [Optional] Listener ID
     * @return {Object} {@link keigai.Observable}
     * @example
     * observer.off( "click", "myHook" );
     */
				value: function off(ev, id) {
					if (this.listeners[ev]) {
						if (id) {
							delete this.listeners[ev][id];
						} else {
							delete this.listeners[ev];
						}
					}

					return this;
				}
			}, {
				key: "on",

				/**
     * Adds a listener for an event
     *
     * @method on
     * @memberOf keigai.Observable
     * @param  {String}   ev      Event name
     * @param  {Function} handler Handler
     * @param  {String}   id      [Optional] Handler ID
     * @param  {String}   scope   [Optional] Handler scope, default is `this`
     * @return {Object} {@link keigai.Observable}
     * @example
     * observer.on( "click", function ( ev ) {
     *   ...
     * }, "myHook" );
     */
				value: function on(ev, handler) {
					var id = arguments[2] === undefined ? utility.uuid() : arguments[2];
					var scope = arguments[3] === undefined ? undefined : arguments[3];

					if (!this.listeners[ev]) {
						this.listeners[ev] = {};
					}

					if (array.keys(this.listeners[ev]).length >= this.limit) {
						throw new Error("Possible memory leak, more than " + this.limit + " listeners for event: " + ev);
					}

					this.listeners[ev][id] = { scope: scope || this, handler: handler };

					return this;
				}
			}, {
				key: "once",

				/**
     * Adds a short lived listener for an event
     *
     * @method once
     * @memberOf keigai.Observable
     * @param  {String}   ev      Event name
     * @param  {Function} handler Handler
     * @param  {String}   id      [Optional] Handler ID
     * @param  {String}   scope   [Optional] Handler scope, default is `this`
     * @return {Object} {@link keigai.Observable}
     * @example
     * observer.once( "click", function ( ev ) {
     *   ...
     * } );
     */
				value: function once(ev, handler) {
					var _this3 = this;

					var id = arguments[2] === undefined ? utility.uuid() : arguments[2];
					var scope = arguments[3] === undefined ? undefined : arguments[3];

					scope = scope || this;

					return this.on(ev, function () {
						for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
							args[_key2] = arguments[_key2];
						}

						handler.apply(scope, args);
						_this3.off(ev, id);
					}, id, scope);
				}
			}, {
				key: "unhook",

				/**
     * Unhooks from `target` for a DOM event
     *
     * @method unhook
     * @memberOf keigai.Observable
     * @param  {Object} target Element
     * @param  {String} ev     Event
     * @return {Object}        Element
     * @example
     * observer.unhook( document.querySelector( "a" ), "click" );
     */
				value: function unhook(target, ev) {
					var obj = this.hooks.get(target);

					if (obj) {
						target.removeEventListener(ev, obj[ev], false);
						delete obj[ev];

						if (array.keys(obj).length === 0) {
							this.hooks["delete"](target);
						} else {
							this.hooks.set(target, obj);
						}
					}

					return target;
				}
			}]);

			return Observable;
		})();

		/**
   * Observable factory
   *
   * @method factory
   * @memberOf observable
   * @return {Object} {@link keigai.Observable}
   * @example
   * let observer = keigai.util.observer( 50 );
   */
		var observable = function observable(arg) {
			return new Observable(arg);
		};

		var Base = (function () {
			/**
    * Base Object
    *
    * @constructor
    * @memberOf keigai
    */

			function Base() {
				_classCallCheck(this, Base);

				/**
     * {@link keigai.Observable}
     *
     * @abstract
     * @type {Object}
     */
				this.observer = null;
			}

			_createClass(Base, [{
				key: "addEventListener",

				/**
     * Adds an event listener
     *
     * @method addEventListener
     * @memberOf keigai.Base
     * @param  {String}   ev       Event name
     * @param  {Function} listener Function to execute
     * @param  {String}   id       [Optional] Listener ID
     * @param  {String}   scope    [Optional] Listener scope, default is `this`
     * @return {Object} {@link keigai.Base}
     * @example
     * obj.addEventListener( "event", function ( ev ) {
     *   ...
     * }, "myHook" );
     */
				value: function addEventListener(ev, listener, id, scope) {
					this.observer.on(ev, listener, id, scope || this);

					return this;
				}
			}, {
				key: "addListener",

				/**
     * Adds an event listener
     *
     * @method addListener
     * @memberOf keigai.Base
     * @param  {String}   ev       Event name
     * @param  {Function} listener Function to execute
     * @param  {String}   id       [Optional] Listener ID
     * @param  {String}   scope    [Optional] Listener scope, default is `this`
     * @return {Object} {@link keigai.Base}
     * @example
     * obj.addEventListener( "event", function ( ev ) {
     *   ...
     * }, "myHook" );
     */
				value: function addListener(ev, listener, id, scope) {
					this.observer.on(ev, listener, id, scope || this);

					return this;
				}
			}, {
				key: "dispatch",

				/**
     * Dispatches an event, with optional arguments
     *
     * @method dispatch
     * @memberOf keigai.Base
     * @return {Object} {@link keigai.Base}
     * @example
     * obj.dispatch( "event", ... );
     */
				value: function dispatch() {
					for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
						args[_key3] = arguments[_key3];
					}

					this.observer.dispatch.apply(this.observer, args);

					return this;
				}
			}, {
				key: "dispatchEvent",

				/**
     * Dispatches an event, with optional arguments
     *
     * @method dispatchEvent
     * @memberOf keigai.Base
     * @return {Object} {@link keigai.Base}
     * @example
     * obj.dispatchEvent( "event", ... );
     */
				value: function dispatchEvent() {
					for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
						args[_key4] = arguments[_key4];
					}

					this.observer.dispatch.apply(this.observer, args);

					return this;
				}
			}, {
				key: "emit",

				/**
     * Dispatches an event, with optional arguments
     *
     * @method emit
     * @memberOf keigai.Base
     * @return {Object} {@link keigai.Base}
     * @example
     * obj.emit( "event", ... );
     */
				value: function emit() {
					for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
						args[_key5] = arguments[_key5];
					}

					this.observer.dispatch.apply(this.observer, args);

					return this;
				}
			}, {
				key: "hook",

				/**
     * Hooks into `target` for an event
     *
     * @method hook
     * @memberOf keigai.Base
     * @return {Object} {@link keigai.Base}
     * @example
     * obj.hook( document.querySelector( "a" ), "click" );
     */
				value: function hook() {
					for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
						args[_key6] = arguments[_key6];
					}

					this.observer.hook.apply(this.observer, args);

					return this;
				}
			}, {
				key: "listeners",

				/**
     * Gets listeners
     *
     * @method listeners
     * @memberOf keigai.Base
     * @param  {String} ev [Optional] Event name
     * @return {Object} Listeners
     * @example
     * keigai.util.iterate( obj.listeners(), function ( fn, id ) {
     *   ...
     * } );
     */
				value: function listeners(ev) {
					return ev ? this.observer.listeners[ev] : this.observer.listeners;
				}
			}, {
				key: "off",

				/**
     * Removes an event listener
     *
     * @method off
     * @memberOf keigai.Base
     * @param  {String} ev Event name
     * @param  {String} id [Optional] Listener ID
     * @return {Object} {@link keigai.Base}
     * @example
     * obj.off( "event", "myHook" );
     */
				value: function off(ev, id) {
					this.observer.off(ev, id);

					return this;
				}
			}, {
				key: "on",

				/**
     * Adds an event listener
     *
     * @method on
     * @memberOf keigai.Base
     * @param  {String}   ev       Event name
     * @param  {Function} listener Function to execute
     * @param  {String}   id       [Optional] Listener ID
     * @param  {String}   scope    [Optional] Listener scope, default is `this`
     * @return {Object} {@link keigai.Base}
     * @example
     * obj.on( "event", function ( ev ) {
     *   ...
     * }, "myHook" );
     */
				value: function on(ev, listener, id, scope) {
					this.observer.on(ev, listener, id, scope || this);

					return this;
				}
			}, {
				key: "once",

				/**
     * Adds a short lived event listener
     *
     * @method once
     * @memberOf keigai.Base
     * @param  {String}   ev       Event name
     * @param  {Function} listener Function to execute
     * @param  {String}   id       [Optional] Listener ID
     * @param  {String}   scope    [Optional] Listener scope, default is `this`
     * @return {Object} {@link keigai.Base}
     * @example
     * obj.once( "event", function ( ev ) {
     *   ...
     * } );
     */
				value: function once(ev, listener, id, scope) {
					this.observer.once(ev, listener, id, scope || this);

					return this;
				}
			}, {
				key: "removeEventListener",

				/**
     * Removes an event listener
     *
     * @method removeEventListener
     * @memberOf keigai.Base
     * @param  {String} ev Event name
     * @param  {String} id [Optional] Listener ID
     * @return {Object} {@link keigai.Base}
     * @example
     * obj.removeListener( "event", "myHook" );
     */
				value: function removeEventListener(ev, id) {
					this.observer.off(ev, id);

					return this;
				}
			}, {
				key: "removeListener",

				/**
     * Removes an event listener
     *
     * @method removeListener
     * @memberOf keigai.Base
     * @param  {String} ev Event name
     * @param  {String} id [Optional] Listener ID
     * @return {Object} {@link keigai.Base}
     * @example
     * obj.removeListener( "event", "myHook" );
     */
				value: function removeListener(ev, id) {
					this.observer.off(ev, id);

					return this;
				}
			}]);

			return Base;
		})();

		/**
   * @namespace array
   */
		var array = {
			/**
    * Adds 'arg' to 'obj' if it is not found
    *
    * @method add
    * @memberOf array
    * @param  {Array} obj Array to receive 'arg'
    * @param  {Mixed} arg Argument to set in 'obj'
    * @return {Array}     Array that was queried
    * @example
    * let myArray = [1, 2];
    *
    * keigai.util.array.add( myArray, 3 ); // [1, 2, 3]
    * keigai.util.array.add( myArray, 1 ); // [1, 2, 3]
    */
			add: function add(obj, arg) {
				if (!array.contains(obj, arg)) {
					obj.push(arg);
				}

				return obj;
			},

			/**
    * Preforms a binary search on a sorted Array
    *
    * @method binIndex
    * @memberOf array
    * @param  {Array} obj Array to search
    * @param  {Mixed} arg Value to find index of
    * @return {Number}    Index of `arg` within `obj`
    * @example
    * let myArray = [1, 5, 10, 15, 20, 25, ...];
    *
    * keigai.util.array.binIndex( myArray, 5 ); // 1
    */
			binIndex: function binIndex(obj, arg) {
				var max = obj.length - 1;
				var min = 0;
				var idx = 0;
				var val = 0;

				while (min <= max) {
					idx = Math.floor((min + max) / 2);
					val = obj[idx];

					if (val < arg) {
						min = idx + 1;
					} else if (val > arg) {
						max = idx - 1;
					} else {
						return idx;
					}
				}

				return -1;
			},

			/**
    * Returns an Object ( NodeList, etc. ) as an Array
    *
    * @method cast
    * @memberOf array
    * @param  {Object}  obj Object to cast
    * @param  {Boolean} key [Optional] Returns key or value, only applies to Objects without a length property
    * @return {Array}       Object as an Array
    * @example
    * keigai.util.array.cast( document.querySelectorAll( "..." ) );
    */
			cast: function cast(obj, key) {
				var o = [];

				if (!isNaN(obj.length)) {
					o = Array.from(obj);
				} else if (key === true) {
					o = array.keys(obj);
				} else {
					utility.iterate(obj, function (i) {
						o.push(i);
					});
				}

				return o;
			},

			/**
    * Transforms an Array to a 2D Array of chunks
    *
    * @method chunk
    * @memberOf array
    * @param  {Array}  obj  Array to process
    * @param  {Number} size Chunk size ( integer )
    * @return {Array}       Chunked Array
    * @example
    * keigai.util.array.chunk( [0, 1, 2, 3], 2 ); // [[0, 1], [2, 3]]
    */
			chunk: function chunk(obj, size) {
				var result = [];
				var nth = number.round(obj.length / size, "up");
				var start = 0;
				var i = -1;

				while (++i < nth) {
					start = i * size;
					result.push(array.limit(obj, start, size));
				}

				return result;
			},

			/**
    * Clears an Array without destroying it
    *
    * @method clear
    * @memberOf array
    * @param  {Array} obj Array to clear
    * @return {Array}     Cleared Array
    * @example
    * let myArray = [1, 2, 3, 4, 5];
    *
    * keigai.util.array.clear( myArray );
    * myArray.length; // 0
    */
			clear: function clear(obj) {
				return obj.length > 0 ? array.remove(obj, 0, obj.length) : obj;
			},

			/**
    * Clones an Array
    *
    * @method clone
    * @memberOf array
    * @param  {Array}   obj     Array to clone
    * @param  {Boolean} shallow [Optional] Default is `true`
    * @return {Array}           Clone of Array
    * @example
    * let myArray      = [1, 2, 3, 4, 5],
    *     myArrayClone = keigai.util.array.clone( myArray );
    *
    * myArrayClone.push( 6 );
    *
    * myArray.length;      // 5
    * myArrayClone.length; // 6
    */
			clone: function clone(obj) {
				var shallow = arguments[1] === undefined ? true : arguments[1];

				return utility.clone(obj, shallow);
			},

			/**
    * Determines if obj contains arg
    *
    * @method contains
    * @memberOf array
    * @param  {Array} obj Array to search
    * @param  {Mixed} arg Value to look for
    * @return {Boolean}   True if found, false if not
    * @example
    * if ( keigai.util.array.contains( [1], 1 ) ) { ... }
    */
			contains: function contains(obj, arg) {
				return obj.indexOf(arg) > -1;
			},

			/**
    * Facade of `Array.map()`
    *
    * @method collect
    * @memberOf array
    * @param  {Array}    obj Array to iterate
    * @param  {Function} fn  Function to execute against indices
    * @return {Array}        New Array
    * @example
    * let results = keigai.util.array.collect( [...], function ( ... ) { ... } );
    */
			collect: function collect(obj, fn) {
				return obj.map(fn);
			},

			/**
    * Compacts a Array by removing `null` or `undefined` indices
    *
    * @method compact
    * @memberOf array
    * @param  {Array}   obj  Array to compact
    * @param  {Boolean} diff Indicates to return resulting Array only if there's a difference
    * @return {Array}        Compacted copy of `obj`, or null ( if `diff` is passed & no diff is found )
    * @example
    * keigai.util.array.compact( [null, "a", "b", "c", null, "d"] ); // ["a", "b", "c", "d"]
    * keigai.util.array.compact( ["a", "b", "c", "d"], true );       // null
    */
			compact: function compact(obj, diff) {
				var result = obj.filter(function (i) {
					return !regex.null_undefined.test(i);
				});

				return diff !== true ? result : result.length < obj.length ? result : null;
			},

			/**
    * Counts `value` in `obj`
    *
    * @method count
    * @memberOf array
    * @param  {Array} obj   Array to search
    * @param  {Mixed} value Value to compare
    * @return {Array}       Array of counts
    * @example
    * keigai.util.array.count( ["apple", "banana", "orange", "apple"], "apple" ); // 2
    */
			count: function count(obj, value) {
				return obj.filter(function (i) {
					return i === value;
				}).length;
			},

			/**
    * Finds the difference between two Arrays
    *
    * @method diff
    * @memberOf array
    * @param  {Array} obj1 Source Array
    * @param  {Array} obj2 Comparison Array
    * @return {Array}      Array of the differences
    * @example
    * keigai.util.array.diff( ["a"], ["a", "b"] ); // ["b"]
    */
			diff: function diff(obj1, obj2) {
				var result = undefined;

				result = obj1.filter(function (i) {
					return !array.contains(obj2, i);
				});

				result = result.concat(obj2.filter(function (i) {
					return !array.contains(obj1, i);
				}));

				return result;
			},

			/**
    * Iterates `obj` and executes `fn` with arguments [`value`, `index`].
    * Returning `false` halts iteration.
    *
    * @method each
    * @memberOf array
    * @param  {Array}    obj   Array to iterate
    * @param  {Function} fn    Function to execute on index values
    * @param  {Boolean}  async [Optional] Asynchronous iteration
    * @param  {Number}   size  [Optional] Batch size for async iteration, default is 10
    * @return {Array}          Array
    * @example
    * keigai.util.array.each( [ ... ], function ( ... ) { ... } );
    * keigai.util.array.each( [ ... ], function ( ... ) { ... }, true, 100 ); // processing batches of a 100
    */
			each: function each(obj, fn, async) {
				var size = arguments[3] === undefined ? 10 : arguments[3];

				var nth = obj.length;
				var i = undefined,
				    offset = undefined;

				if (async !== true) {
					i = -1;
					while (++i < nth) {
						if (fn.call(obj, obj[i], i) === false) {
							break;
						}
					}
				} else {
					offset = 0;

					if (size > nth) {
						size = nth;
					}

					utility.repeat(function () {
						var i = -1;
						var idx = undefined;

						while (++i < size) {
							idx = i + offset;

							if (idx === nth || fn.call(obj, obj[idx], idx) === false) {
								return false;
							}
						}

						offset += size;

						if (offset >= nth) {
							return false;
						}
					}, undefined, undefined, false);
				}

				return obj;
			},

			/**
    * Iterates `obj` in reverse and executes `fn` with arguments [`value`, `index`].
    * Returning `false` halts iteration.
    *
    * @method eachReverse
    * @memberOf array
    * @param  {Array}    obj   Array to iterate
    * @param  {Function} fn    Function to execute on index values
    * @param  {Boolean}  async [Optional] Asynchronous iteration
    * @param  {Number}   size  [Optional] Batch size for async iteration, default is 10
    * @return {Array}          Array
    * @example
    * keigai.util.array.eachReverse( [ ... ], function ( ... ) { ... } );
    * keigai.util.array.eachReverse( [ ... ], function ( ... ) { ... }, true, 100 ); // processing batches of a 100
    */
			eachReverse: function eachReverse(obj, fn, async, size) {
				var nth = obj.length;
				var i = undefined,
				    offset = undefined;

				if (async !== true) {
					i = nth;
					while (--i > -1) {
						if (fn.call(obj, obj[i], i) === false) {
							break;
						}
					}
				} else {
					size = size || 10;
					offset = nth - 1;

					if (size > nth) {
						size = nth;
					}

					utility.repeat(function () {
						var i = -1;
						var idx = undefined;

						while (++i < size) {
							idx = offset - i;

							if (idx < 0 || fn.call(obj, obj[idx], idx) === false) {
								return false;
							}
						}

						offset -= size;

						if (offset < 0) {
							return false;
						}
					}, undefined, undefined, false);
				}

				return obj;
			},

			/**
    * Determines if an Array is empty
    *
    * @method empty
    * @memberOf array
    * @param  {Array} obj Array to inspect
    * @return {Boolean}   `true` if there's no indices
    * @example
    * keigai.util.array.empty( [] );    // true
    * keigai.util.array.empty( ["a"] ); // false
    */
			empty: function empty(obj) {
				return obj.length === 0;
			},

			/**
    * Determines if two Arrays are equal
    *
    * @method equal
    * @memberOf array
    * @param  {Array} obj1 Array to compare
    * @param  {Array} obj2 Array to compare
    * @return {Boolean} `true` if the Arrays match
    * @example
    * keigai.util.array.equal( ["a"], ["a"] );      // true
    * keigai.util.array.equal( ["a"], ["a", "b"] ); // false
    */
			equal: function equal(obj1, obj2) {
				return JSON.stringify(obj1) === JSON.stringify(obj2);
			},

			/**
    * Fills `obj` with the evalution of `arg`, optionally from `start` to `offset`
    *
    * @method fill
    * @memberOf array
    * @param  {Array}  obj   Array to fill
    * @param  {Mixed}  arg   String, Number of Function to fill with
    * @param  {Number} start [Optional] Index to begin filling at
    * @param  {Number} end   [Optional] Offset from start to stop filling at
    * @return {Array}        Filled Array
    * @example
    * let myArray = ["a", "b", "c"];
    *
    * keigai.util.array.fill( myArray, function ( i ) { return i + "a"; } );
    * myArray[0]; // "aa"
    */
			fill: function fill(obj, arg, start, offset) {
				var fn = typeof arg === "function";
				var l = obj.length;
				var i = !isNaN(start) ? start : 0;
				var nth = !isNaN(offset) ? i + offset : l - 1;

				if (nth > l - 1) {
					nth = l - 1;
				}

				if (fn) {
					while (i <= nth) {
						obj[i] = arg(obj[i]);
						i++;
					}
				} else {
					while (i <= nth) {
						obj[i] = arg;
						i++;
					}
				}

				return obj;
			},

			/**
    * Returns the first Array index
    *
    * @method first
    * @memberOf array
    * @param  {Array} obj The array
    * @return {Mixed}     The first node of the array
    * @example
    * keigai.util.array.first( ["a", "b"] ); // "a"
    */
			first: function first(obj) {
				return obj[0];
			},

			/**
    * Flattens a 2D Array
    *
    * @method flat
    * @memberOf array
    * @param  {Array} obj 2D Array to flatten
    * @return {Array}     Flatten Array
    * @example
    * keigai.util.array.flat( [[0, 1], [2, 3]] ); // [0, 1, 2, 3]
    */
			flat: function flat(obj) {
				var result = [];

				result = obj.reduce(function (a, b) {
					return a.concat(b);
				}, result);

				return result;
			},

			/**
    * Iterates `obj` and executes `fn` with arguments [`value`, `index`].
    * Returning `false` halts iteration.
    *
    * @method forEach
    * @memberOf array
    * @see array.each
    * @param  {Array}    obj   Array to iterate
    * @param  {Function} fn    Function to execute on index values
    * @param  {Boolean}  async [Optional] Asynchronous iteration
    * @param  {Number}   size  [Optional] Batch size for async iteration, default is 10
    * @return {Array}          Array
    * @example
    * keigai.util.array.forEach( [ ... ], function ( ... ) { ... } );
    * keigai.util.array.forEach( [ ... ], function ( ... ) { ... }, true, 100 ); // processing batches of a 100
    */
			forEach: function forEach(obj, fn, async, size) {
				return array.each(obj, fn, async, size);
			},

			/**
    * Creates a 2D Array from an Object
    *
    * @method fromObject
    * @memberOf array
    * @param  {Object} obj Object to convert
    * @return {Array}      2D Array
    * @example
    * keigai.util.array.fromObject( {name: "John", sex: "male"} ); // [["name", "John"], ["sex", "male"]]
    */
			fromObject: function fromObject(obj) {
				return array.mingle(array.keys(obj), array.cast(obj));
			},

			/**
    * Facade of indexOf
    *
    * @method index
    * @memberOf array
    * @param  {Array} obj Array to search
    * @param  {Mixed} arg Value to find index of
    * @return {Number}    The position of arg in instance
    * @example
    * keigai.util.array.index( ["a", "b", "c"], "b" ); // 1
    */
			index: function index(obj, arg) {
				return obj.indexOf(arg);
			},

			/**
    * Returns an Associative Array as an Indexed Array
    *
    * @method indexed
    * @memberOf array
    * @param  {Array} obj Array to index
    * @return {Array}     Indexed Array
    * @example
    * let myArray = ["a", "b", "c"];
    *
    * myArray.prop = "d";
    * keigai.util.array.indexed( myArray ); ["a", "b", "c", "d"];
    */
			indexed: function indexed(obj) {
				var result = [];

				utility.iterate(obj, function (v) {
					result.push(v);
				});

				return result;
			},

			/**
    * Finds the intersections between obj1 and obj2
    *
    * @method intersect
    * @memberOf array
    * @param  {Array} obj1 Source Array
    * @param  {Array} obj2 Comparison Array
    * @return {Array}      Array of the intersections
    * @example
    * keigai.util.array.intersect( ["a", "b", "d"], ["b", "c", "d"] ); // ["b", "d"]
    */
			intersect: function intersect(obj1, obj2) {
				var a = obj1.length > obj2.length ? obj1 : obj2;
				var b = a === obj1 ? obj2 : obj1;

				return a.filter(function (key) {
					return array.contains(b, key);
				});
			},

			/**
    * Iterates an Array using an Iterator
    *
    * @method iterate
    * @memberOf array
    * @param  {Array} obj Array to iterate
    * @return {Array}     Array to iterate
    */
			iterate: function iterate(obj, fn) {
				var itr = array.iterator(obj);
				var i = -1;
				var item = undefined,
				    next = undefined;

				do {
					item = itr.next();

					if (!item.done) {
						next = fn(item.value, ++i);
					} else {
						next = false;
					}
				} while (next !== false);

				return obj;
			},

			/**
    * Creates an Array generator to iterate the indices
    *
    * @method iterator
    * @memberOf array
    * @param  {Array} obj Array to iterate
    * @return {Function}  Generator
    */
			iterator: function iterator(obj) {
				var i = -1;
				var n = obj.length;

				return {
					next: function next() {
						if (++i < n) {
							return { done: false, value: obj[i] };
						} else {
							return { done: true };
						}
					}
				};
			},

			/**
    * Keeps every element of `obj` for which `fn` evaluates to true
    *
    * @method keepIf
    * @memberOf array
    * @param  {Array}    obj Array to iterate
    * @param  {Function} fn  Function to test indices against
    * @return {Array}        Array
    * @example
    * let myArray = ["a", "b", "c"];
    *
    * keigai.util.array.keepIf( myArray, function ( i ) { return /a|c/.test( i ); } );
    * myArray[1]; // "c"
    */
			keepIf: function keepIf(obj, fn) {
				var result = undefined,
				    remove = undefined;

				result = obj.filter(fn);
				remove = array.diff(obj, result);

				array.each(remove, function (i) {
					array.remove(obj, array.index(obj, i));
				});

				return obj;
			},

			/**
    * Returns the keys in an "Associative Array"
    *
    * @method keys
    * @memberOf array
    * @param  {Mixed} obj Array or Object to extract keys from
    * @return {Array}     Array of the keys
    * @example
    * keigai.util.array.keys( {abc: true, xyz: false} ); // ["abc", "xyz"]
    */
			keys: function keys(obj) {
				return Array.keys(obj);
			},

			/**
    * Sorts an Array based on key values, like an SQL ORDER BY clause
    *
    * @method keySort
    * @memberOf array
    * @param  {Array}  obj   Array to sort
    * @param  {String} query Sort query, e.g. "name, age desc, country"
    * @param  {String} sub   [Optional] Key which holds data, e.g. "{data: {}}" = "data"
    * @return {Array}        Sorted Array
    * @example
    * let myArray = [{abc: 123124, xyz: 5}, {abc: 123124, xyz: 6}, {abc: 2, xyz: 5}];
    *
    * keigai.util.array.keySort( myArray, "abc" );           // [{abc: 2, xyz: 5}, {abc: 123124, xyz: 5}, {abc: 123124, xyz: 6}];
    * keigai.util.array.keySort( myArray, "abc, xyz desc" ); // [{abc: 2, xyz: 5}, {abc: 123124, xyz: 6}, {abc: 123124, xyz: 5}];
    */
			keySort: function keySort(obj, query, sub) {
				query = query.replace(/\s*asc/ig, "").replace(/\s*desc/ig, " desc");

				var queries = string.explode(query).map(function (i) {
					return i.split(" ");
				});
				var sorts = [];
				var braceS = "[\"";
				var braceE = "\"]";

				if (sub && sub !== "") {
					sub = "." + sub;
				} else {
					sub = "";
				}

				array.each(queries, function (i) {
					var s = ".";
					var e = "";

					if (regex.not_dotnotation.test(i[0])) {
						s = braceS;
						e = braceE;
					}

					sorts.push("try {");

					if (i[1] === "desc") {
						sorts.push("if ( a" + sub + s + i[0] + e + " < b" + sub + s + i[0] + e + " ) return 1;");
						sorts.push("if ( a" + sub + s + i[0] + e + " > b" + sub + s + i[0] + e + " ) return -1;");
					} else {
						sorts.push("if ( a" + sub + s + i[0] + e + " < b" + sub + s + i[0] + e + " ) return -1;");
						sorts.push("if ( a" + sub + s + i[0] + e + " > b" + sub + s + i[0] + e + " ) return 1;");
					}

					sorts.push("} catch (e) {");
					sorts.push("try {");
					sorts.push("if ( a" + sub + s + i[0] + e + " !== undefined ) return " + (i[1] === "desc" ? "-1" : "1") + ";");
					sorts.push("} catch (e) {}");
					sorts.push("try {");
					sorts.push("if ( b" + sub + s + i[0] + e + " !== undefined ) return " + (i[1] === "desc" ? "1" : "-1") + ";");
					sorts.push("} catch (e) {}");
					sorts.push("}");
				});

				sorts.push("return 0;");

				return obj.sort(new Function("a", "b", sorts.join("\n")));
			},

			/**
    * Returns the last index of the Array
    *
    * @method last
    * @memberOf array
    * @param  {Array}  obj Array
    * @param  {Number} arg [Optional] Negative offset from last index to return
    * @return {Mixed}      Last index( s ) of Array
    * @example
    * let myArray = [1, 2, 3, 4];
    *
    * keigai.util.array.last( myArray );    // 4
    * keigai.util.array.last( myArray, 2 ); // [3, 4]
    */
			last: function last(obj, arg) {
				var n = obj.length - 1;

				if (arg >= n + 1) {
					return obj;
				} else if (isNaN(arg) || arg === 1) {
					return obj[n];
				} else {
					return array.limit(obj, n - --arg, n);
				}
			},

			/**
    * Returns a limited range of indices from the Array
    *
    * @method limit
    * @memberOf array
    * @param  {Array}  obj    Array to iterate
    * @param  {Number} start  Starting index
    * @param  {Number} offset Number of indices to return
    * @return {Array}         Array of indices
    * @example
    * let myArray = [1, 2, 3, 4];
    *
    * keigai.util.array.limit( myArray, 0, 2 ); // [1, 2]
    * keigai.util.array.limit( myArray, 2, 2 ); // [3, 4]
    */
			limit: function limit(obj, start, offset) {
				var result = [];
				var i = start - 1;
				var nth = start + offset;
				var max = obj.length;

				if (max > 0) {
					while (++i < nth && i < max) {
						result.push(obj[i]);
					}
				}

				return result;
			},

			/**
    * Finds the maximum value in an Array
    *
    * @method max
    * @memberOf array
    * @param  {Array} obj Array to process
    * @return {Mixed}     Number, String, etc.
    * @example
    * keigai.util.array.max( [5, 3, 9, 1, 4] ); // 9
    */
			max: function max(obj) {
				return array.last(array.sorted(array.clone(obj)));
			},

			/**
    * Finds the mean of an Array ( of numbers )
    *
    * @method mean
    * @memberOf array
    * @param  {Array} obj Array to process
    * @return {Number}    Mean of the Array ( float or integer )
    * @example
    * keigai.util.array.mean( [1, 3, 5] ); // 3
    */
			mean: function mean(obj) {
				return obj.length > 0 ? array.sum(obj) / obj.length : undefined;
			},

			/**
    * Finds the median value of an Array ( of numbers )
    *
    * @method median
    * @memberOf array
    * @param  {Array} obj Array to process
    * @return {Number}    Median number of the Array ( float or integer )
    * @example
    * keigai.util.array.median( [5, 1, 3, 8] ); // 4
    * keigai.util.array.median( [5, 1, 3] );    // 3
    */
			median: function median(obj) {
				var dupe = array.sorted(array.clone(obj));
				var nth = dupe.length;
				var mid = number.round(nth / 2, "down");

				return number.odd(nth) ? dupe[mid] : (dupe[mid - 1] + dupe[mid]) / 2;
			},

			/**
    * Merges `arg` into `obj`, excluding duplicate indices
    *
    * @method merge
    * @memberOf array
    * @param  {Array} obj1 Array to receive indices
    * @param  {Array} obj2 Array to merge
    * @return {Array}      First argument
    * @example
    * let a = ["a", "b", "c"],
    *     b = ["d"];
    *
    * keigai.util.array.merge( a, b );
    * a[3]; // "d"
    */
			merge: function merge(obj1, obj2) {
				array.each(obj2, function (i) {
					array.add(obj1, i);
				});

				return obj1;
			},

			/**
    * Finds the minimum value in an Array
    *
    * @method min
    * @memberOf array
    * @param  {Array} obj Array to process
    * @return {Mixed}     Number, String, etc.
    * @example
    * keigai.util.array.min( [5, 3, 9, 1, 4] ); // 1
    */
			min: function min(obj) {
				return array.sorted(array.clone(obj))[0];
			},

			/**
    * Mingles Arrays and returns a 2D Array
    *
    * @method mingle
    * @memberOf array
    * @param  {Array} obj1 Array to mingle
    * @param  {Array} obj2 Array to mingle
    * @return {Array}      2D Array
    * @example
    * let a = ["a", "b"],
    *     b = ["c", "d"];
    *
    * keigai.util.array.mingle( a, b ); // [["a", "c"], ["b", "d"]]
    */
			mingle: function mingle(obj1, obj2) {
				var result = obj1.map(function (i, idx) {
					return [i, obj2[idx]];
				});

				return result;
			},

			/**
    * Finds the mode value of an Array
    *
    * @method mode
    * @memberOf array
    * @param  {Array} obj Array to process
    * @return {Mixed}     Mode value of the Array
    * @example
    * keigai.util.array.mode( [1, 3, 7, 1, 2, 10, 7, 7, 3, 10] );     // 7
    * keigai.util.array.mode( [1, 3, 7, 1, 2, 10, 7, 7, 3, 10, 10] ); // [7, 10]
    */
			mode: function mode(obj) {
				var values = {};
				var count = 0;
				var mode = [];
				var nth = undefined,
				    result = undefined;

				// Counting values
				array.each(obj, function (i) {
					if (!isNaN(values[i])) {
						values[i]++;
					} else {
						values[i] = 1;
					}
				});

				// Finding the highest occurring count
				count = array.max(array.cast(values));

				// Finding values that match the count
				utility.iterate(values, function (v, k) {
					if (v === count) {
						mode.push(number.parse(k));
					}
				});

				// Determining the result
				nth = mode.length;

				if (nth > 0) {
					result = nth === 1 ? mode[0] : mode;
				}

				return result;
			},

			/**
    * Finds the range of the Array ( of numbers ) values
    *
    * @method range
    * @memberOf array
    * @param  {Array} obj Array to process
    * @return {Number}    Range of the array ( float or integer )
    * @example
    * keigai.util.array.range( [5, 1, 3, 8] ); // 7
    */
			range: function range(obj) {
				return array.max(obj) - array.min(obj);
			},

			/**
    * Searches a 2D Array `obj` for the first match of `arg` as a second index
    *
    * @method rassoc
    * @memberOf array
    * @param  {Array} obj 2D Array to search
    * @param  {Mixed} arg Primitive to find
    * @return {Mixed}     Array or undefined
    * @example
    * keigai.util.array.rassoc( [[1, 3], [7, 2], [4, 3]], 3 ); // [1, 3]
    */
			rassoc: function rassoc(obj, arg) {
				var result = undefined;

				array.each(obj, function (i, idx) {
					if (i[1] === arg) {
						result = utility.clone(obj[idx], true);

						return false;
					}
				});

				return result;
			},

			/**
    * Returns Array containing the items in `obj` for which `fn()` is not true
    *
    * @method reject
    * @memberOf array
    * @param  {Array}    obj Array to iterate
    * @param  {Function} fn  Function to execute against `obj` indices
    * @return {Array}        Array of indices which fn() is not true
    * @example
    * keigai.util.array.reject( [0, 1, 2, 3, 4, 5], function ( i ) { return i % 2 > 0; } ); // [0, 2, 4]
    */
			reject: function reject(obj, fn) {
				return array.diff(obj, obj.filter(fn));
			},

			/**
    * Removes indices from an Array without recreating it
    *
    * @method remove
    * @memberOf array
    * @param  {Array}  obj   Array to remove from
    * @param  {Mixed}  start Starting index, or value to find within obj
    * @param  {Number} end   [Optional] Ending index
    * @return {Array}        Modified Array
    * @example
    * let myArray = ["a", "b", "c", "d", "e"];
    *
    * keigai.util.array.remove( myArray, 2, 3 );
    * myArray[2]; // "e"
    */
			remove: function remove(obj, start, end) {
				if (isNaN(start)) {
					start = array.index(obj, start);

					if (start === -1) {
						return obj;
					}
				} else {
					start = start || 0;
				}

				var length = obj.length;
				var remaining = obj.slice((end || start) + 1 || length);

				obj.length = start < 0 ? length + start : start;
				obj.push.apply(obj, remaining);

				return obj;
			},

			/**
    * Deletes every element of `obj` for which `fn` evaluates to true
    *
    * @method removeIf
    * @memberOf array
    * @param  {Array}    obj Array to iterate
    * @param  {Function} fn  Function to test indices against
    * @return {Array}        Array
    * @example
    * let myArray = ["a", "b", "c"];
    *
    * keigai.util.array.removeIf( myArray, function ( i ) { return /a|c/.test( i ); } );
    * myArray[0]; // "b"
    */
			removeIf: function removeIf(obj, fn) {
				var remove = obj.filter(fn);

				array.each(remove, function (i) {
					array.remove(obj, array.index(obj, i));
				});

				return obj;
			},

			/**
    * Deletes elements of `obj` until `fn` evaluates to false
    *
    * @method removeWhile
    * @memberOf array
    * @param  {Array}    obj Array to iterate
    * @param  {Function} fn  Function to test indices against
    * @return {Array}        Array
    * @example
    * let myArray = ["a", "b", "c"];
    *
    * keigai.util.array.removeWhile( myArray, function ( i ) { return /a|c/.test( i ); } );
    * myArray[0];     // "b"
    * myArray.length; // 2
    */
			removeWhile: function removeWhile(obj, fn) {
				var remove = [];

				array.each(obj, function (i) {
					if (fn(i) !== false) {
						remove.push(i);
					} else {
						return false;
					}
				});

				array.each(remove, function (i) {
					array.remove(obj, array.index(obj, i));
				});

				return obj;
			},

			/**
    * Replaces the contents of `obj1` with `obj2`
    *
    * @method replace
    * @memberOf array
    * @param  {Array} obj1 Array to modify
    * @param  {Array} obj2 Array to values to push into `obj1`
    * @return {Array}      Array to modify
    * @example
    * let myArray = ["a", "b", "c"];
    *
    * keigai.util.array.replace( myArray, [true, false] );
    * myArray[0];     // true
    * myArray.length; // 2
    */
			replace: function replace(obj1, obj2) {
				array.remove(obj1, 0, obj1.length);
				array.each(obj2, function (i) {
					obj1.push(i);
				});

				return obj1;
			},

			/**
    * Returns the "rest" of `obj` from `arg`
    *
    * @method rest
    * @memberOf array
    * @param  {Array}  obj Array to process
    * @param  {Number} arg [Optional] Start position of subset of `obj` ( positive number only )
    * @return {Array}      Array of a subset of `obj`
    * @example
    * keigai.util.array.rest( [1, 2, 3, 4, 5, 6] );    // [2, 3, 4, 5, 6]
    * keigai.util.array.rest( [1, 2, 3, 4, 5, 6], 3 ); // [4, 5, 6]
    */
			rest: function rest(obj) {
				var arg = arguments[1] === undefined ? 1 : arguments[1];

				if (arg < 1) {
					arg = 1;
				}

				return array.limit(obj, arg, obj.length);
			},

			/**
    * Finds the last index of `arg` in `obj`
    *
    * @method rindex
    * @memberOf array
    * @param  {Array} obj Array to search
    * @param  {Mixed} arg Primitive to find
    * @return {Mixed}     Index or undefined
    * @example
    * keigai.util.array.rindex( [1, 2, 3, 2, 1], 2 ); // 3
    */
			rindex: function rindex(obj, arg) {
				var result = -1;

				array.each(obj, function (i, idx) {
					if (i === arg) {
						result = idx;
					}
				});

				return result;
			},

			/**
    * Returns new Array with `arg` moved to the first index
    *
    * @method rotate
    * @memberOf array
    * @param  {Array}  obj Array to rotate
    * @param  {Number} arg Index to become the first index, if negative the rotation is in the opposite direction
    * @return {Array}      Newly rotated Array
    * @example
    * keigai.util.array.rotate( [0, 1, 2, 3, 4],  3 )[0] // 2;
    * keigai.util.array.rotate( [0, 1, 2, 3, 4], -2 )[0] // 3;
    */
			rotate: function rotate(obj, arg) {
				var nth = obj.length;
				var result = undefined;

				if (arg === 0) {
					result = obj;
				} else {
					if (arg < 0) {
						arg += nth;
					} else {
						arg--;
					}

					result = array.limit(obj, arg, nth);
					result = result.concat(array.limit(obj, 0, arg));
				}

				return result;
			},

			/**
    * Generates a series Array
    *
    * @method series
    * @memberOf array
    * @param  {Number} start  Start value the series
    * @param  {Number} end    [Optional] The end of the series
    * @param  {Number} offset [Optional] Offset for indices, default is 1
    * @return {Array}         Array of new series
    * @example
    * keigai.util.array.series( 0, 5 );     // [0, 1, 2, 3, 4]
    * keigai.util.array.series( 0, 25, 5 ); // [0, 5, 10, 15, 20]
    */
			series: function series() {
				var start = arguments[0] === undefined ? 0 : arguments[0];
				var end = arguments[1] === undefined ? undefined : arguments[1];
				var offset = arguments[2] === undefined ? 1 : arguments[2];

				end = end || start;

				var result = [];
				var n = -1;
				var nth = Math.max(0, Math.ceil((end - start) / offset));

				while (++n < nth) {
					result[n] = start;
					start += offset;
				}

				return result;
			},

			/**
    * Sorts the Array by parsing values
    *
    * @method sort
    * @memberOf array
    * @param  {Mixed} a Argument to compare
    * @param  {Mixed} b Argument to compare
    * @return {Number}  Number indicating sort order
    * @example
    * keigai.util.array.sort( 2, 3 ); // -1
    */
			sort: function sort(a, b) {
				var types = { a: typeof a, b: typeof b };
				var c = undefined,
				    d = undefined,
				    result = undefined;

				if (types.a === "number" && types.b === "number") {
					result = a - b;
				} else {
					c = a.toString();
					d = b.toString();

					if (c < d) {
						result = -1;
					} else if (c > d) {
						result = 1;
					} else if (types.a === types.b) {
						result = 0;
					} else if (types.a === "boolean") {
						result = -1;
					} else {
						result = 1;
					}
				}

				return result;
			},

			/**
    * Sorts `obj` using `array.sort`
    *
    * @method sorted
    * @memberOf array
    * @param  {Array} obj Array to sort
    * @return {Array}     Sorted Array
    * @example
    * let myArray = [5, 9, 2, 4];
    *
    * keigai.util.array.sorted( myArray );
    * myArray[0]; // 2
    */
			sorted: function sorted(obj) {
				return obj.sort(array.sort);
			},

			/**
    * Splits an Array by divisor
    *
    * @method split
    * @memberOf array
    * @param  {Array}  obj     Array to process
    * @param  {Number} divisor Integer to divide the Array by
    * @return {Array}          Split Array
    * @example
    * let myArray = [],
    *     i       = -1,
    *     results;
    *
    * while ( ++i < 100 ) {
   	 *   myArray.push( i + 1 );
   	 * }
    *
    * results = keigai.util.array.split( myArray, 21 );
    * results.length;     // 21
    * results[0].length;  // 5
    * results[19].length; // 4
    * results[19][0];     // 99
    * results[20].length; // 1
    * results[20][0];     // 100
    */
			split: function split(obj, divisor) {
				var result = [];
				var total = obj.length;
				var nth = Math.ceil(total / divisor);
				var low = Math.floor(total / divisor);
				var lower = Math.ceil(total / nth);
				var lowered = false;
				var start = 0;
				var i = -1;

				// Finding the fold
				if (number.diff(total, divisor * nth) > nth) {
					lower = total - low * divisor + low - 1;
				} else if (total % divisor > 0 && lower * nth >= total) {
					lower--;
				}

				while (++i < divisor) {
					if (i > 0) {
						start = start + nth;
					}

					if (!lowered && lower < divisor && i === lower) {
						--nth;
						lowered = true;
					}

					result.push(array.limit(obj, start, nth));
				}

				return result;
			},

			/**
    * Finds the standard deviation of an Array ( of numbers )
    *
    * @method stddev
    * @memberOf array
    * @param  {Array} obj Array to process
    * @return {Number}    Standard deviation of the Array ( float or integer )
    * @example
    * keigai.util.array.stddev( [1, 3, 5] ); // 1.632993161855452
    */
			stddev: function stddev(obj) {
				return Math.sqrt(array.variance(obj));
			},

			/**
    * Gets the summation of an Array of numbers
    *
    * @method sum
    * @memberOf array
    * @param  {Array} obj Array to sum
    * @return {Number}    Summation of Array
    * @example
    * keigai.util.array.sum( [2, 4, 3, 1] ); // 10
    */
			sum: function sum(obj) {
				var result = 0;

				if (obj.length > 0) {
					result = obj.reduce(function (prev, cur) {
						return prev + cur;
					});
				}

				return result;
			},

			/**
    * Takes the first `n` indices from `obj`
    *
    * @method take
    * @memberOf array
    * @param  {Array}  obj Array to process
    * @param  {Number} n   Offset from 0 to return
    * @return {Array}      Subset of `obj`
    * @example
    * keigai.util.array.take( [1, 2, 3, 4], 2 ); // [1, 2]
    */
			take: function take(obj, n) {
				return array.limit(obj, 0, n);
			},

			/**
    * Casts an Array to Object
    *
    * @method toObject
    * @memberOf array
    * @param  {Array} ar Array to transform
    * @return {Object}   New object
    * @example
    * keigai.util.array.toObject( ["abc", "def"] ); // {0: "abc", 1: "def"}
    */
			toObject: function toObject(ar) {
				var obj = {};
				var i = ar.length;

				while (i--) {
					obj[i.toString()] = ar[i];
				}

				return obj;
			},

			/**
    * Gets the total keys in an Array
    *
    * @method total
    * @memberOf array
    * @param  {Array} obj Array to find the length of
    * @return {Number}    Number of keys in Array
    * @example
    * let myArray = [true, true, false];
    *
    * myArray.extra = true;
    * keigai.util.array.total( myArray ); // 4
    */
			total: function total(obj) {
				return array.indexed(obj).length;
			},

			/**
    * Returns an Array of unique indices of `obj`
    *
    * @method unique
    * @memberOf array
    * @param  {Array} obj Array to process
    * @return {Array}     Array of unique indices
    * @example
    * keigai.util.array.unique( ["a", "b", "a", "c", "b", "d"] ); // ["a", "b", "c", "d"]
    */
			unique: function unique(obj) {
				var result = [];

				array.each(obj, function (i) {
					array.add(result, i);
				});

				return result;
			},

			/**
    * Finds the variance of an Array ( of numbers )
    *
    * @method variance
    * @memberOf array
    * @param  {Array} obj Array to process
    * @return {Number}    Variance of the Array ( float or integer )
    * @example
    * keigai.util.array.variance( [1, 3, 5] ); // 2.6666666666666665
    */
			variance: function variance(obj) {
				var nth = obj.length;
				var n = 0;
				var mean = undefined;

				if (nth > 0) {
					mean = array.mean(obj);

					array.each(obj, function (i) {
						n += math.sqr(i - mean);
					});

					return n / nth;
				} else {
					return n;
				}
			},

			/**
    * Converts any arguments to Arrays, then merges elements of `obj` with corresponding elements from each argument
    *
    * @method zip
    * @memberOf array
    * @param  {Array} obj  Array to transform
    * @param  {Mixed} args Argument instance or Array to merge
    * @return {Array}      Array
    * @example
    * keigai.util.array.zip( [0, 1], 1 ); // [[0, 1], [1, null]]
    */
			zip: function zip(obj, args) {
				var result = [];

				// Preparing args
				if (!(args instanceof Array)) {
					args = typeof args === "object" ? array.cast(args) : [args];
				}

				array.each(args, function (i, idx) {
					if (!(i instanceof Array)) {
						args[idx] = [i];
					}
				});

				// Building result Array
				array.each(obj, function (i, idx) {
					result[idx] = [i];
					array.each(args, function (x) {
						result[idx].push(x[idx] || null);
					});
				});

				return result;
			}
		};

		/**
   * @namespace cache
   * @private
   */
		var cache = {
			/**
    * Collection URIs
    *
    * @memberOf cache
    * @type {Object}
    */
			lru: lru.factory(CACHE),

			/**
    * Expires a URI from the local cache
    *
    * @method expire
    * @memberOf cache
    * @param  {String} uri URI of the local representation
    * @return {Boolean} `true` if successful
    */
			expire: function expire(uri) {
				if (cache.lru.cache[uri]) {
					cache.lru.remove(uri);

					return true;
				}

				return false;
			},

			/**
    * Determines if a URI has expired
    *
    * @method expired
    * @memberOf cache
    * @param  {Object} uri Cached URI object
    * @return {Boolean}    True if the URI has expired
    */
			expired: function expired(uri) {
				var item = cache.lru.cache[uri];

				return item && item.value.expires < new Date().getTime();
			},

			/**
    * Returns the cached object {headers, response} of the URI or false
    *
    * @method get
    * @memberOf cache
    * @param  {String}  uri     URI/Identifier for the resource to retrieve from cache
    * @param  {Boolean} expire  [Optional] If 'false' the URI will not expire
    * @param  {Object}  headers [Optional] Request headers
    * @return {Mixed}           URI Object {headers, response} or False
    */
			get: function get(uri, expire, headers) {
				uri = utility.parse(uri).href;
				var item = cache.lru.get(uri);

				if (!item) {
					return false;
				}

				if (expire !== false && cache.expired(uri) || !utility.equal(item.request_headers, headers)) {
					cache.expire(uri);

					return false;
				}

				return utility.clone(item, true);
			},

			/**
    * Sets, or updates an item in cache.items
    *
    * @method set
    * @memberOf cache
    * @param  {String} uri      URI to set or update
    * @param  {String} property Property of the cached URI to set
    * @param  {Mixed} value     Value to set
    * @return {Mixed}           URI Object {headers, response} or undefined
    */
			set: function set(uri, property, value) {
				uri = utility.parse(uri).href;
				var item = cache.lru.get(uri);

				if (!item) {
					item = {
						permission: 0
					};
				}

				if (property === "permission") {
					item.permission |= value;
				} else if (property === "!permission") {
					item.permission &= ~value;
				} else {
					item[property] = value;
				}

				cache.lru.set(uri, item);

				return item;
			}
		};

		/**
   * Custom Object returned from `client.request()`
   *
   * @constructor
   * @memberOf keigai
   * @extends {keigai.Base}
   * @param {Object} xhr XMLHttpRequest
   */

		var KXMLHttpRequest = (function (_Base) {
			function KXMLHttpRequest(xhr) {
				var _this4 = this;

				_classCallCheck(this, KXMLHttpRequest);

				_get(Object.getPrototypeOf(KXMLHttpRequest.prototype), "constructor", this).call(this);

				this.observer = observable();
				this.defer = deferred();
				this.xhr = xhr;

				// Hooking observer for standard events
				array.each(EVENTS, function (i) {
					_this4.hook(_this4.xhr, i);
				});
			}

			_inherits(KXMLHttpRequest, _Base);

			_createClass(KXMLHttpRequest, [{
				key: "always",
				value: function always(arg) {
					return this.defer.always.call(this.defer, arg);
				}
			}, {
				key: "done",
				value: function done(arg) {
					return this.defer.done.call(this.defer, arg);
				}
			}, {
				key: "fail",
				value: function fail(arg) {
					return this.defer.fail.call(this.defer, arg);
				}
			}, {
				key: "reject",
				value: function reject(arg) {
					return this.defer.reject.call(this.defer, arg);
				}
			}, {
				key: "resolve",
				value: function resolve(arg) {
					return this.defer.resolve.call(this.defer, arg);
				}
			}, {
				key: "then",
				value: function then(success, failure) {
					return this.defer.then.call(this.defer, success, failure);
				}
			}]);

			return KXMLHttpRequest;
		})(Base);

		/**
   * @namespace client
   */
		var client = {
			/**
    * Array Buffer is available
    *
    * @memberOf client
    * @type {Boolean}
    * @private
    */
			ab: typeof ArrayBuffer !== "undefined",

			/**
    * Blob is available
    *
    * @memberOf client
    * @type {Boolean}
    * @private
    */
			blob: typeof Blob !== "undefined",

			/**
    * Document is available
    *
    * @memberOf client
    * @type {Boolean}
    * @private
    */
			doc: typeof Document !== "undefined",

			/**
    * Internet Explorer browser
    *
    * @memberOf client
    * @type {Boolean}
    * @private
    */
			ie: !server && regex.ie.test(navigator.userAgent),

			/**
    * Client version
    *
    * @memberOf client
    * @type {Number}
    * @private
    */
			version: function version() {
				var result = 0;

				if (client.ie) {
					result = number.parse(string.trim(navigator.userAgent.replace(/( .*msie|;.*)/gi, "")) || 9, 10);
				}

				return result;
			},

			/**
    * Quick way to see if a URI allows a specific verb
    *
    * @method allows
    * @memberOf client
    * @param  {String} uri     URI to query
    * @param  {String} verb    HTTP verb
    * @param  {Object} headers [Optional] Request headers
    * @return {Boolean}        `true` if the verb is allowed, undefined if unknown
    * @private
    */
			allows: function allows(uri, verb, headers) {
				uri = utility.parse(uri).href;
				verb = verb.toLowerCase();

				var result = false;
				var bit = 0;

				if (!cache.get(uri, false, headers)) {
					result = undefined;
				} else {
					if (regex.del.test(verb)) {
						bit = 1;
					} else if (regex.get_headers.test(verb)) {
						bit = 4;
					} else if (regex.put_post.test(verb)) {
						bit = 2;
					} else if (regex.patch.test(verb)) {
						bit = 8;
					}

					result = Boolean(client.permissions(uri, headers).bit & bit);
				}

				return result;
			},

			/**
    * Gets bit value based on args
    *
    * @method bit
    * @memberOf client
    * @param  {Array} args Array of commands the URI accepts
    * @return {Number} To be set as a bit
    * @private
    */
			bit: function bit(args) {
				var result = 0;

				array.each(args, function (verb) {
					verb = verb.toLowerCase();

					if (regex.get_headers.test(verb)) {
						result |= 4;
					} else if (regex.put_post.test(verb)) {
						result |= 2;
					} else if (regex.patch.test(verb)) {
						result |= 8;
					} else if (regex.del.test(verb)) {
						result |= 1;
					}
				});

				return result;
			},

			/**
    * Determines if a URI is a CORS end point
    *
    * @method cors
    * @memberOf client
    * @param  {String} uri  URI to parse
    * @return {Boolean}     True if CORS
    * @private
    */
			cors: function cors(uri) {
				return !server && uri.indexOf("//") > -1 && uri.indexOf("//" + location.host) === -1;
			},

			/**
    * Caches the headers from the XHR response
    *
    * @method headers
    * @memberOf client
    * @param  {Object} xhr             XMLHttpRequest Object
    * @param  {String} uri             URI to request
    * @param  {String} type            Type of request
    * @param  {Object} request_headers Request headers
    * @return {Object}                 Cached URI representation
    * @private
    */
			headers: function headers(xhr, uri, type, request_headers) {
				var headers = string.trim(xhr.getAllResponseHeaders()).split("\n");
				var items = {};
				var o = {};
				var allow = null;
				var expires = new Date();
				var cors = client.cors(uri);
				var cachable = true;

				array.each(headers, function (i) {
					var header = i.split(": ");

					items[header[0].toLowerCase()] = string.trim(header[1]);

					if (allow === null) {
						if (!cors && regex.allow.test(header[0]) || cors && regex.allow_cors.test(header[0])) {
							allow = header[1];

							return false;
						}
					}
				});

				if (regex.no.test(items["cache-control"])) {
					expires = expires.getTime();
				} else if (items["cache-control"] && regex.number_present.test(items["cache-control"])) {
					expires = expires.setSeconds(expires.getSeconds() + number.parse(regex.number_present.exec(items["cache-control"])[0], 10));
				} else if (items.expires) {
					expires = new Date(items.expires).getTime();
				} else {
					cachable = false;
					expires = expires.getTime();
				}

				o.cachable = cachable;
				o.expires = expires;
				o.headers = items;
				o.timestamp = new Date();
				o.permission = client.bit(allow !== null ? string.explode(allow) : [type]);

				if (type === "get" && cachable) {
					cache.set(uri, "expires", o.expires);
					cache.set(uri, "headers", o.headers);
					cache.set(uri, "timestamp", o.timestamp);
					cache.set(uri, "permission", o.permission);
					cache.set(uri, "request_headers", request_headers);
				}

				return o;
			},

			/**
    * Parses an XHR response
    *
    * @method parse
    * @memberOf client
    * @param  {Object} xhr  XHR Object
    * @param  {String} type [Optional] content-type header value
    * @return {Mixed}       Array, Boolean, Document, Number, Object or String
    * @private
    */
			parse: function parse(xhr) {
				var type = arguments[1] === undefined ? "" : arguments[1];

				var result = undefined,
				    obj = undefined;

				if ((regex.json_maybe.test(type) || string.isEmpty(type)) && (regex.json_wrap.test(xhr.responseText) && Boolean(obj = json.decode(xhr.responseText, true)))) {
					result = obj;
				} else if (type === "text/csv") {
					result = csv.decode(xhr.responseText);
				} else if (type === "text/tsv") {
					result = csv.decode(xhr.responseText, "\t");
				} else if (regex.xml.test(type)) {
					if (type !== "text/xml") {
						xhr.overrideMimeType("text/xml");
					}

					result = xhr.responseXML;
				} else if (type === "text/plain" && regex.is_xml.test(xhr.responseText) && xml.valid(xhr.responseText)) {
					result = xml.decode(xhr.responseText);
				} else {
					result = xhr.responseText;
				}

				return result;
			},

			/**
    * Returns the permission of the cached URI
    *
    * @method permissions
    * @memberOf client
    * @param  {String} uri     URI to query
    * @param  {Object} headers [Optional] Request headers
    * @return {Object}         Contains an Array of available commands, the permission bit and a map
    * @private
    */
			permissions: function permissions(uri, headers) {
				var cached = cache.get(uri, false, headers);
				var bit = !cached ? 0 : cached.permission;
				var result = { allows: [], bit: bit, map: { partial: 8, read: 4, write: 2, "delete": 1, unknown: 0 } };

				if (bit & 1) {
					result.allows.push("DELETE");
				}

				if (bit & 2) {
					result.allows.push("POST");
					result.allows.push("PUT");
				}

				if (bit & 4) {
					result.allows.push("GET");
				}

				if (bit & 8) {
					result.allows.push("PATCH");
				}

				return result;
			},

			/**
    * Creates a JSONP request
    *
    * @method jsonp
    * @memberOf client
    * @param  {String} uri  URI to request
    * @param  {Mixed}  args Custom JSONP handler parameter name, default is "callback"; or custom headers for GET request ( CORS )
    * @return {Object} {@link keigai.Deferred}
    * @example
    * keigai.util.jsonp( "http://somedomain.com/resource?callback=", function ( arg ) {
    *   // `arg` is the coerced response body
    * }, function ( err ) {
    *   // Handle `err`
    * } );
    */
			jsonp: function jsonp(uri, args) {
				var defer = deferred();
				var callback = "callback";
				var cbid = undefined,
				    s = undefined;

				if (external === undefined) {
					if (!global.keigai) {
						global.keigai = { callback: {} };
					}

					external = "keigai";
				}

				if (args instanceof Object && !args.callback) {
					callback = args.callback;
				}

				do {
					cbid = utility.genId().slice(0, 10);
				} while (global.callback[cbid]);

				uri = uri.replace(callback + "=?", callback + "=" + external + ".callback." + cbid);

				global.callback[cbid] = function (arg) {
					utility.clearTimers(cbid);
					delete global.callback[cbid];
					defer.resolve(arg);
					element.destroy(s);
				};

				s = element.create("script", { src: uri, type: "text/javascript" }, utility.dom("head")[0]);

				utility.defer(function () {
					utility.clearTimers(cbid);
					delete global.callback[cbid];
					defer.reject(new Error(label.requestTimeout));
				}, 30000, cbid);

				return defer;
			},

			/**
    * KXMLHttpRequest factory
    *
    * @method kxhr
    * @memberOf client
    * @param {Object} xhr XMLHttpRequest
    * @return {Object} {@link keigai.KXMLHttpRequest}
    * @private
    */
			kxhr: function kxhr(xhr) {
				return new KXMLHttpRequest(xhr);
			},

			/**
    * Creates an XmlHttpRequest to a URI ( aliased to multiple methods )
    *
    * The returned Deferred will have an .xhr
    *
    * @method request
    * @memberOf client
    * @param  {String}   uri     URI to query
    * @param  {String}   type    [Optional] Type of request ( DELETE/GET/POST/PUT/PATCH/HEAD/OPTIONS ), default is `GET`
    * @param  {Mixed}    args    [Optional] Data to send with the request
    * @param  {Object}   headers [Optional] Custom request headers ( can be used to set withCredentials )
    * @return {Object}   {@link keigai.KXMLHttpRequest}
    * @example
    * keigai.util.request( "http://keigai.io" ).then( function ( arg ) {
    *   // `arg` is the coerced response body
    * }, function ( err ) {
    *   // Handle `err`
    * } );
    */
			request: function request(uri) {
				var type = arguments[1] === undefined ? "GET" : arguments[1];
				var args = arguments[2] === undefined ? undefined : arguments[2];
				var headers = arguments[3] === undefined ? undefined : arguments[3];

				uri = utility.parse(uri).href;
				type = type.toLowerCase();
				headers = headers instanceof Object ? headers : null;

				var cors = client.cors(uri);
				var kxhr = client.kxhr(!client.ie || (!cors || client.version > 9) ? new XMLHttpRequest() : new XDomainRequest());
				var payload = (regex.put_post.test(type) || regex.patch.test(type)) && args ? args : null;
				var cached = type === "get" ? cache.get(uri, false, headers) : false;
				var contentType = null;
				var doc = client.doc;
				var ab = client.ab;
				var blob = client.blob;

				// Only GET & POST is supported by XDomainRequest (so useless!)
				if (client.ie && client.version === 9 && cors && !regex.xdomainrequest.test(type)) {
					throw new Error(label.notAvailable);
				}

				// Hooking custom events
				kxhr.on("readystatechange", function (ev) {
					var state = kxhr.xhr.readyState;

					if (state === 1) {
						kxhr.dispatch("beforeXHR", kxhr.xhr, ev);
					} else if (state === 4) {
						kxhr.dispatch("afterXHR", kxhr.xhr, ev);
					}
				});

				if (client.allows(uri, type, headers) === false) {
					kxhr.dispatch("beforeXHR", kxhr.xhr, null);
					kxhr.xhr.status = 405;
					kxhr.reject(new Error(label.methodNotAllowed));
					utility.delay(function () {
						kxhr.dispatch("afterXHR", kxhr.xhr, null);
					});
				} else if (type === "get" && Boolean(cached)) {
					// Decorating XHR for proxy behavior
					if (server) {
						kxhr.xhr.readyState = 4;
						kxhr.xhr.status = 200;
						kxhr.xhr._resheaders = cached.headers;
					}

					kxhr.dispatch("beforeXHR", kxhr.xhr, null);
					kxhr.resolve(cached.response);
					utility.delay(function () {
						kxhr.dispatch("afterXHR", kxhr.xhr, null);
					});
				} else {
					utility.delay(function () {
						kxhr.xhr.open(type.toUpperCase(), uri, true);

						// Setting content-type value
						if (headers !== null && headers.hasOwnProperty("content-type")) {
							contentType = headers["content-type"];
						}

						if (cors && contentType === null) {
							contentType = "text/plain";
						}

						// Transforming payload
						if (payload !== null) {
							if (payload.hasOwnProperty("xml")) {
								payload = payload.xml;
							}

							if (doc && payload instanceof Document) {
								payload = xml.decode(payload);
							}

							if (typeof payload === "string" && regex.is_xml.test(payload)) {
								contentType = "application/xml";
							}

							if (!(ab && payload instanceof ArrayBuffer) && !(blob && payload instanceof Blob) && !(payload instanceof Buffer) && payload instanceof Object) {
								contentType = "application/json";
								payload = json.encode(payload);
							}

							if (contentType === null && (ab && payload instanceof ArrayBuffer || blob && payload instanceof Blob)) {
								contentType = "application/octet-stream";
							}

							if (contentType === null) {
								contentType = "application/x-www-form-urlencoded; charset=UTF-8";
							}
						}

						// Setting headers for everything except IE9 CORS requests
						if (!client.ie || (!cors || client.version > 9)) {
							if (headers === null) {
								headers = {};
							}

							if (typeof cached === "object" && cached.headers.hasOwnProperty("etag")) {
								headers.etag = cached.headers.etag;
							}

							if (contentType !== null) {
								headers["content-type"] = contentType;
							}

							if (headers.hasOwnProperty("callback")) {
								delete headers.callback;
							}

							headers["x-requested-with"] = "XMLHttpRequest";

							utility.iterate(headers, function (v, k) {
								if (v !== null && k !== "withCredentials") {
									kxhr.xhr.setRequestHeader(k, v);
								}
							});

							// Cross Origin Resource Sharing ( CORS )
							if (typeof kxhr.xhr.withCredentials === "boolean" && headers !== null && typeof headers.withCredentials === "boolean") {
								kxhr.xhr.withCredentials = headers.withCredentials;
							}
						}

						kxhr.on("load", function () {
							var xdr = client.ie && kxhr.xhr.readyState === undefined;
							var shared = true;
							var o = undefined,
							    r = undefined,
							    t = undefined,
							    redirect = undefined;

							if (!xdr && kxhr.xhr.readyState === 4) {
								switch (kxhr.xhr.status) {
									case 200:
									case 201:
									case 202:
									case 203:
									case 204:
									case 205:
									case 206:
										o = client.headers(kxhr.xhr, uri, type, headers);

										if (type === "head") {
											return kxhr.resolve(o.headers);
										} else if (type === "options") {
											return kxhr.resolve(o.headers);
										} else if (type !== "delete") {
											if (server && regex.priv.test(o.headers["cache-control"])) {
												shared = false;
											}

											if (regex.http_body.test(kxhr.xhr.status)) {
												t = o.headers["content-type"] || "";
												r = client.parse(kxhr.xhr, t);

												if (r === undefined) {
													kxhr.reject(new Error(label.serverError));
												}
											}

											if (type === "get" && shared && o.cachable) {
												cache.set(uri, "response", o.response = utility.clone(r, true));
											} else {
												cache.expire(uri, true);
											}
										} else if (type === "delete") {
											cache.expire(uri, true);
										}

										switch (kxhr.xhr.status) {
											case 200:
											case 202:
											case 203:
											case 206:
												kxhr.resolve(r);
												break;
											case 201:
												if ((o.headers.location === undefined || string.isEmpty(o.headers.location)) && !string.isUrl(r)) {
													kxhr.resolve(r);
												} else {
													redirect = string.trim(o.headers.Location || r);
													client.request(redirect).then(function (arg) {
														if (type === "get" && shared && o.cachable) {
															cache.set(uri, "response", arg);
														}

														kxhr.resolve(arg);
													}, function (e) {
														kxhr.reject(e);
													});
												}
												break;
											case 204:
											case 205:
												kxhr.resolve(null);
												break;
										}
										break;
									case 304:
										kxhr.resolve(r);
										break;
									case 401:
										kxhr.reject(new Error(kxhr.xhr.responseText || label.serverUnauthorized));
										break;
									case 403:
										cache.set(uri, "!permission", client.bit([type]));
										kxhr.reject(new Error(kxhr.xhr.responseText || label.serverForbidden));
										break;
									case 405:
										cache.set(uri, "!permission", client.bit([type]));
										kxhr.reject(new Error(kxhr.xhr.responseText || label.serverInvalidMethod));
										break;
									default:
										kxhr.reject(new Error(kxhr.xhr.responseText || label.serverError));
								}
							} else if (xdr) {
								r = client.parse(kxhr.xhr, "text/plain");
								cache.set(uri, "permission", client.bit(["get"]));
								cache.set(uri, "response", r);
								kxhr.resolve(r);
							}
						});

						kxhr.on("error", function (e) {
							kxhr.reject(e);
						});

						// Sending request
						kxhr.xhr.send(payload !== null ? payload : undefined);
					});
				}

				return kxhr;
			},

			/**
    * Scrolls to a position in the view using a two point bezier curve
    *
    * @method scroll
    * @memberOf client
    * @param  {Array}  dest Coordinates
    * @param  {Number} ms   [Optional] Milliseconds to scroll, default is 250, min is 100
    * @return {Object} {@link Deferred}
    * @private
    */
			scroll: function scroll(dest, ms) {
				var defer = deferred();
				var start = client.scrollPos();
				var t = 0;

				ms = (!isNaN(ms) ? ms : 250) / 100;

				utility.repeat(function () {
					var pos = math.bezier(start[0], start[1], dest[0], dest[1], ++t / 100);

					window.scrollTo(pos[0], pos[1]);

					if (t === 100) {
						defer.resolve(true);
						return false;
					}
				}, ms, "scrolling");

				return defer;
			},

			/**
    * Returns the current scroll position of the View
    *
    * @method scrollPos
    * @memberOf client
    * @return {Array} Describes the scroll position
    * @private
    */
			scrollPos: function scrollPos() {
				return [window.scrollX || 0, window.scrollY || 0];
			}
		};

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
			decode: function decode(arg) {
				var delimiter = arguments[1] === undefined ? "," : arguments[1];

				var regex = new RegExp(delimiter + "(?=(?:[^\"]|\"(?:[^\"])[^\"]*\")*$)");
				var rows = string.trim(arg).split("\n");
				var keys = rows.shift().split(delimiter);
				var result = undefined;

				result = rows.map(function (r) {
					var obj = {};
					var row = r.split(regex);

					array.each(keys, function (i, idx) {
						obj[i] = utility.coerce((row[idx] || "").replace(/^"|"$/g, ""));
					});

					return obj;
				});

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
			encode: function encode(arg) {
				var delimiter = arguments[1] === undefined ? "," : arguments[1];
				var header = arguments[2] === undefined ? true : arguments[2];

				var obj = json.decode(arg, true) || arg;
				var result = "";

				// Prepares input based on CSV rules
				var prepare = function prepare(input) {
					var output = undefined;

					if (input instanceof Array) {
						output = "\"" + input.toString() + "\"";

						if (regex.object_type.test(output)) {
							output = "\"" + csv.encode(input, delimiter) + "\"";
						}
					} else if (input instanceof Object) {
						output = "\"" + csv.encode(input, delimiter) + "\"";
					} else if (regex.csv_quote.test(input)) {
						output = "\"" + input.replace(/"/g, "\"\"") + "\"";
					} else {
						output = input;
					}

					return output;
				};

				if (obj instanceof Array) {
					if (obj[0] instanceof Object) {
						if (header) {
							result = array.keys(obj[0]).join(delimiter) + "\n";
						}

						result += obj.map(function (i) {
							return csv.encode(i, delimiter, false);
						}).join("\n");
					} else {
						result += prepare(obj, delimiter) + "\n";
					}
				} else {
					if (header) {
						result = array.keys(obj).join(delimiter) + "\n";
					}

					result += array.cast(obj).map(prepare).join(delimiter) + "\n";
				}

				return result.replace(regex.eol_nl, "");
			}
		};

		var DataListFilter = (function (_Base2) {
			/**
    * Creates a new DataListFilter
    *
    * @constructor
    * @memberOf keigai
    * @extends {keigai.Base}
    * @param  {Object} element  Element to receive the filter
    * @param  {Object} list     {@link keigai.DataList}
    * @param  {Number} debounce [Optional] Milliseconds to debounce
    * @example
    * let store  = keigai.store( [...] ),
    *     list   = keigai.list( document.querySelector( "#list" ), store, "{{field}}" ),
    *     filter = keigai.filter( document.querySelector( "input.filter" ), list, "field" );
    */

			function DataListFilter(element, list, debounce) {
				_classCallCheck(this, DataListFilter);

				_get(Object.getPrototypeOf(DataListFilter.prototype), "constructor", this).call(this);

				this.debounce = debounce;
				this.element = element;
				this.filters = {};
				this.list = list;
				this.observer = observable();
			}

			_inherits(DataListFilter, _Base2);

			_createClass(DataListFilter, [{
				key: "set",

				/**
     * Set the filters
     *
     * Create an object based on comma separated key string
     *
     * @method set
     * @memberOf keigai.DataListFilter
     * @param  {String} fields Comma separated filters
     * @return {Object} {@link keigai.DataListFilter}
     * @example
     * filter.set( "firstName, lastName, email" );
     */
				value: function set(fields) {
					var _this5 = this;

					this.filters = {};
					array.each(string.explode(fields), function (v) {
						_this5.filters[v] = "";
					});

					return this;
				}
			}, {
				key: "teardown",

				/**
     * Removes listeners, and DOM hooks to avoid memory leaks
     *
     * @method teardown
     * @memberOf keigai.DataListFilter
     * @return {Object} {@link keigai.DataListFilter}
     * @example
     * filter.teardown();
     */
				value: function teardown() {
					this.observer.unhook(this.element, "keyup");
					this.observer.unhook(this.element, "input");
					this.element = null;

					return this;
				}
			}, {
				key: "update",

				/**
     * Applies the input value as a filter against the DataList based on specific fields
     *
     * @method update
     * @memberOf keigai.DataListFilter
     * @fires keigai.DataList#beforeFilter Fires before filter
     * @fires keigai.DataList#afterFilter Fires after filter
     * @return {Object} {@link keigai.DataListFilter}
     * @example
     * filter.update(); // Debounced execution
     */
				value: function update() {
					var _this6 = this;

					utility.defer(function () {
						var val = element.val(_this6.element).toString();

						_this6.list.dispatch("beforeFilter", _this6.element, val);

						if (!string.isEmpty(val)) {
							utility.iterate(_this6.filters, function (v, k) {
								var queries = string.explode(val);

								// Ignoring trailing commas
								queries = queries.filter(function (i) {
									return !string.isEmpty(i);
								});

								// Shaping valid pattern
								array.each(queries, function (i, idx) {
									queries[idx] = "^.*" + string.escape(i).replace(/(^\*|\*$)/g, "").replace(/\*/g, ".*") + ".*";
								});

								_this6.filters[k] = queries.join(",");
							});

							_this6.list.filter = _this6.filters;
						} else {
							_this6.list.filter = null;
						}

						_this6.list.pageIndex = 1;
						_this6.list.refresh();
						_this6.list.dispatch("afterFilter", _this6.element);
					}, this.debounce, this.element.id + "Debounce");

					return this;
				}
			}]);

			return DataListFilter;
		})(Base);

		/**
   * DataListFilter factory
   *
   * @method factory
   * @memberOf filter
   * @param  {Object} target   Element to receive the filter
   * @param  {Object} list     {@link keigai.DataList}
   * @param  {String} filters  Comma delimited string of fields to filter by
   * @param  {Number} debounce [Optional] Milliseconds to debounce, default is `250`
   * @return {Object} {@link keigai.DataListFilter}
   * @example
   * let store  = keigai.store( [...] ),
   *     list   = keigai.list( document.querySelector( "#list" ), store, "{{field}}" ),
   *     filter = keigai.filter( document.querySelector( "input.filter" ), list, "field" );
   */
		var filter = function filter(target, list, filters) {
			var debounce = arguments[3] === undefined ? 250 : arguments[3];

			var ref = [list];
			var obj = new DataListFilter(target, ref[0], debounce).set(filters);

			// Decorating `target` with the appropriate input `type`
			element.attr(target, "type", "text");

			// Setting up a chain of Events
			obj.observer.hook(obj.element, "keyup");
			obj.observer.hook(obj.element, "input");
			obj.on("keyup", obj.update, "keyup");
			obj.on("input", obj.update, "input");

			return obj;
		};

		var DataGrid = (function (_Base3) {
			/**
    * Creates a new DataGrid
    *
    * @constructor
    * @memberOf keigai
    * @extends {keigai.Base}
    * @param  {Object}  target   Element to receive DataGrid
    * @param  {Object}  store    DataStore
    * @param  {Array}   fields   Array of fields to display
    * @param  {Array}   sortable [Optional] Array of sortable columns/fields
    * @param  {Object}  options  [Optional] DataList options
    * @param  {Boolean} filtered [Optional] Create an input to filter the DataGrid
    * @example
    * let fields  = ["name", "age"],
    *     options = {pageSize: 5, order: "age desc, name"},
    *     store   = keigai.store( [...] ),
    *     grid    = keigai.grid( document.querySelector( "#grid" ), store, fields, fields, options, true );
    */

			function DataGrid(target, store, fields) {
				var sortable = arguments[3] === undefined ? [] : arguments[3];
				var options = arguments[4] === undefined ? {} : arguments[4];
				var filtered = arguments[5] === undefined ? false : arguments[5];

				_classCallCheck(this, DataGrid);

				_get(Object.getPrototypeOf(DataGrid.prototype), "constructor", this).call(this);

				var sortOrder = undefined;

				if (options.order && !string.isEmpty(options.order)) {
					sortOrder = string.explode(options.order).map(function (i) {
						return i.replace(regex.after_space, "");
					});
				}

				this.element = element.create("section", { "class": "grid" }, target);
				this.fields = fields;
				this.filtered = filtered;
				this.list = null;
				this.observer = observable();
				this.options = options;
				this.store = store;
				this.sortable = sortable;
				this.sortOrder = sortOrder || sortable;
			}

			_inherits(DataGrid, _Base3);

			_createClass(DataGrid, [{
				key: "add",

				/**
     * Adds an item to the DataGrid
     *
     * @method add
     * @memberOf keigai.DataGrid
     * @param {Object} record New DataStore record (shapes should match)
     * @return {Object}       {@link keigai.DataGrid}
     * @example
     * grid.add( {name: "John Doe", age: 34} );
     */
				value: function add(record) {
					var _this7 = this;

					this.store.set(null, record).then(null, function (e) {
						utility.error(e);
						_this7.dispatch("error", e);
					});

					return this;
				}
			}, {
				key: "dump",

				/**
     * Exports data grid records
     *
     * @method dump
     * @memberOf keigai.DataGrid
     * @return {Array} Record set
     * @example
     * let data = grid.dump();
     */
				value: function dump() {
					return this.store.dump(this.list.records, this.fields);
				}
			}, {
				key: "refresh",

				/**
     * Refreshes the DataGrid
     *
     * @method refresh
     * @memberOf keigai.DataGrid
     * @fires keigai.DataGrid#beforeRefresh Fires before refresh
     * @fires keigai.DataGrid#afterRefresh Fires after refresh
     * @return {Object} {@link keigai.DataGrid}
     * @example
     * grid.refresh();
     */
				value: function refresh() {
					var _this8 = this;

					var sort = [];
					this.dispatch("beforeRefresh", this.element);

					if (this.sortOrder.length > 0) {
						array.each(this.sortOrder, function (i) {
							var obj = element.find(_this8.element, ".header span[data-field='" + i + "']")[0];

							sort.push(string.trim(i + " " + (element.data(obj, "sort") || "")));
						});

						this.options.order = this.list.order = sort.join(", ");
					}

					this.list.where = null;
					utility.merge(this.list, this.options);
					this.list.refresh();
					this.dispatch("afterRefresh", this.element);

					return this;
				}
			}, {
				key: "remove",

				/**
     * Removes an item from the DataGrid
     *
     * @method remove
     * @memberOf keigai.DataGrid
     * @param {Mixed} record Record, key or index
     * @return {Object} {@link keigai.DataGrid}
     * @example
     * grid.remove( "key" );
     */
				value: function remove(record) {
					var _this9 = this;

					this.store.del(record).then(null, function (e) {
						utility.error(e);
						_this9.dispatch("error", e);
					});

					return this;
				}
			}, {
				key: "sort",

				/**
     * Sorts the DataGrid when a column header is clicked
     *
     * @method sort
     * @memberOf keigai.DataGrid
     * @param  {Object} ev Event
     * @return {Object} {@link keigai.DataGrid}
     */
				value: function sort(ev) {
					var target = utility.target(ev);
					var field = undefined;

					// Stopping event propogation
					utility.stop(ev);

					// Refreshing list if target is sortable
					if (element.hasClass(target, "sortable")) {
						field = element.data(target, "field");
						element.data(target, "sort", element.data(target, "sort") === "asc" ? "desc" : "asc");
						array.remove(this.sortOrder, field);
						this.sortOrder.splice(0, 0, field);
						this.refresh();
					}

					return this;
				}
			}, {
				key: "teardown",

				/**
     * Tears down the DataGrid
     *
     * @method teardown
     * @memberOf keigai.DataGrid
     * @return {Object} {@link keigai.DataGrid}
     * @example
     * grid.teardown();
     */
				value: function teardown() {
					this.observer.unhook(element.find(this.element, "ul.header")[0], "click");
					this.list.teardown();
					element.destroy(this.element);
					this.element = null;

					return this;
				}
			}, {
				key: "update",

				/**
     * Updates an item in the DataGrid
     *
     * @method update
     * @memberOf keigai.DataGrid
     * @param {Mixed}  key  Key or index
     * @param {Object} data New property values
     * @return {Object}     {@link keigai.DataGrid}
     * @example
     * grid.update( "key", {name: "Jim Smith"} );
     */
				value: function update(key, data) {
					var _this10 = this;

					this.store.update(key, data).then(null, function (e) {
						utility.error(e);
						_this10.dispatch("error", e);
					});

					return this;
				}
			}]);

			return DataGrid;
		})(Base);

		/**
   * DataGrid factory
   *
   * @method factory
   * @memberOf grid
   * @fires keigai.DataGrid#change Fires when the DOM changes
   * @param  {Object}  target      Element to receive DataGrid
   * @param  {Object}  store       DataStore
   * @param  {Array}   fields      Array of fields to display
   * @param  {Array}   sortable    [Optional] Array of sortable columns/fields
   * @param  {Object}  options     [Optional] DataList options
   * @param  {Boolean} filtered    [Optional] Create an input to filter the data grid
   * @param  {Number}  debounce    [Optional] DataListFilter input debounce, default is 250
   * @return {Object} {@link keigai.DataGrid}
   * @example
   * let fields  = ["name", "age"],
   *     options = {pageSize: 5, order: "age desc, name"},
   *     store   = keigai.store(),
   *     grid    = keigai.grid( document.querySelector( "#grid" ), store, fields, fields, options, true );
   *
   * store.setUri( "data.json" ).then( null, function ( e ) {
   *   ...
   * } );
   */
		var grid = function grid(target, store, fields, sortable, options, filtered) {
			var debounce = arguments[6] === undefined ? 250 : arguments[6];

			var ref = [store];
			var obj = new DataGrid(target, ref[0], fields, sortable, options, filtered);
			var template = "";
			var header = element.create("li", {}, element.create("ul", { "class": "header" }, obj.element));
			var width = 100 / obj.fields.length + "%";
			var css = "display:inline-block;width:" + width;
			var sort = obj.options.order ? string.explode(obj.options.order) : [];

			// Creating DataList template based on fields
			array.each(obj.fields, function (i) {
				var trimmed = i.replace(/.*\./g, "");
				var el = element.create("span", {
					innerHTML: string.capitalize(string.unCamelCase(string.unhyphenate(trimmed, true)).replace(/_|-/g, " "), true),
					style: css,
					"data-field": i
				}, header);

				// Adding CSS class if "column" is sortable
				if (array.contains(obj.sortable, i)) {
					element.addClass(el, "sortable");

					// Applying default sort, if specified
					if (sort.filter(function (x) {
						return x.indexOf(i) === 0;
					}).length > 0) {
						element.data(el, "sort", array.contains(sort, i + " desc") ? "desc" : "asc");
					}
				}

				template += "<span class=\"" + i + "\" data-field=\"" + i + "\" style=\"" + css + "\">{{" + i + "}}</span>";
			});

			// Setting click handler on sortable "columns"
			if (obj.sortable.length > 0) {
				obj.observer.hook(header.parentNode, "click", obj.sort, "sort", obj);
			}

			if (obj.filtered === true) {
				obj.options.listFiltered = true;
				obj.options.listFilter = obj.fields.join(",");
			}

			obj.options.debounce = debounce;

			// Creating DataList
			ref.push(list.factory(obj.element, ref[0], template, obj.options));

			// Setting by-reference DataList on DataGrid
			obj.list = ref[1];

			// Setting up a chain of Events
			obj.on("beforeRefresh", function (arg) {
				element.dispatch(arg, "beforeRefresh");
			}, "bubble");

			obj.on("afterRefresh", function (arg) {
				element.dispatch(arg, "afterRefresh");
			}, "bubble");

			obj.on("click", function (e) {
				if (element.hasClass(e.currentTarget, "header")) {
					obj.sort(e);
				}
			}, "header");

			obj.list.on("change", function () {
				for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
					args[_key7] = arguments[_key7];
				}

				obj.dispatch.apply(obj, ["change"].concat(args));
			}, "change");

			obj.list.on("beforeFilter", function () {
				for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
					args[_key8] = arguments[_key8];
				}

				obj.dispatch.apply(obj, ["beforeFilter"].concat(args));
			}, "beforeFilter");

			obj.list.on("afterFilter", function () {
				for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
					args[_key9] = arguments[_key9];
				}

				obj.dispatch.apply(obj, ["afterFilter"].concat(args));
			}, "afterFilter");

			return obj;
		};

		var DataList = (function (_Base4) {
			/**
    * Creates a new DataList
    *
    * @constructor
    * @memberOf keigai
    * @extends {keigai.Base}
    * @example
    * let store = keigai.store( [...] ),
    *     list  = keigai.list( document.querySelector("#list"), store, "{{name}}", {order: "name"} );
    */

			function DataList(element, store, template) {
				_classCallCheck(this, DataList);

				_get(Object.getPrototypeOf(DataList.prototype), "constructor", this).call(this);

				this.callback = null;
				this.current = [];
				this.element = element;
				this.emptyMsg = label.noData;
				this.filter = null;
				this.filtered = [];
				this.id = utility.genId();
				this.items = [];
				this.listFilter = null;
				this.mutation = null;
				this.observer = observable();
				this.pageIndex = 1;
				this.pageSize = null;
				this.pageRange = 5;
				this.pagination = "bottom"; // "top" or "bottom|top" are also valid
				this.placeholder = "";
				this.order = "";
				this.records = [];
				this.template = template;
				this.total = 0;
				this.store = store;
				this.where = null;
			}

			_inherits(DataList, _Base4);

			_createClass(DataList, [{
				key: "add",

				/**
     * Adds an item to the DataList
     *
     * @method add
     * @memberOf keigai.DataList
     * @param {Object} record New DataStore record (shapes should match)
     * @return {Object}       {@link keigai.DataList}
     * @example
     * list.add( {name: "John Doe", age: 34} );
     */
				value: function add(record) {
					var _this11 = this;

					this.store.set(null, record).then(null, function (e) {
						utility.error(e);
						_this11.dispatch("error", e);
					});

					return this;
				}
			}, {
				key: "dump",

				/**
     * Exports data list records
     *
     * @method dump
     * @memberOf keigai.DataList
     * @return {Array} Record set
     * @example
     * let data = list.dump();
     */
				value: function dump() {
					return this.store.dump(this.records);
				}
			}, {
				key: "page",

				/**
     * Changes the page index of the DataList
     *
     * @method page
     * @memberOf keigai.DataList
     * @param  {Number} n Page to view
     * @return {Object}   {@link keigai.DataList}
     * @example
     * list.page( 2 );
     */
				value: function page(n) {
					this.pageIndex = n;

					return this.refresh();
				}
			}, {
				key: "pages",

				/**
     * Adds pagination Elements to the View, executed from `DataList.refresh()`
     *
     * @method pages
     * @memberOf keigai.DataList
     * @return {Object} {@link keigai.DataList}
     * @example
     * list.pages();
     */
				value: function pages() {
					var _this12 = this;

					var obj = this.element;
					var page = this.pageIndex;
					var pos = this.pagination;
					var range = this.pageRange;
					var mid = Math.floor(range / 2);
					var start = page - mid;
					var end = page + mid;
					var total = list.pages(this);
					var diff = undefined;

					// Removing the existing controls
					array.each(utility.dom("#" + obj.id + "-pages-top, #" + obj.id + "-pages-bottom"), function (i) {
						if (i) {
							_this12.observer.unhook(i, "click");
							element.destroy(i);
						}
					});

					// Halting because there's 1 page, or nothing
					if (this.filter && this.filtered.length === 0 || this.total === 0 || total === 1) {
						return this;
					}

					// Getting the range to display
					if (start < 1) {
						diff = number.diff(start, 1);
						start = start + diff;
						end = end + diff;
					}

					if (end > total) {
						end = total;
						start = end - range + 1;

						if (start < 1) {
							start = 1;
						}
					}

					if (number.diff(start, end) >= range) {
						--end;
					}

					array.each(string.explode(pos), function (i) {
						var current = false;
						var more = page > 1;
						var next = page + 1 <= total;
						var last = page >= total;
						var el = undefined,
						    n = undefined;

						// Setting up the list
						el = element.create("ul", {
							"class": "list pages hidden " + i,
							id: obj.id + "-pages-" + i
						}, obj, i === "bottom" ? "after" : "before");

						// First page
						element.create(more ? "a" : "span", {
							"class": "first page",
							"data-page": 1,
							innerHTML: "&lt;&lt;"
						}, element.create("li", {}, el));

						// Previous page
						element.create(more ? "a" : "span", {
							"class": "prev page",
							"data-page": page - 1,
							innerHTML: "&lt;"
						}, element.create("li", {}, el));

						// Rendering the page range
						n = start - 1;
						while (++n <= end) {
							current = n === page;
							element.create(current ? "span" : "a", {
								"class": current ? "current page" : "page",
								"data-page": n,
								innerHTML: n
							}, element.create("li", {}, el));
						}

						// Next page
						element.create(next ? "a" : "span", {
							"class": "next page",
							"data-page": next ? page + 1 : null,
							innerHTML: "&gt;"
						}, element.create("li", {}, el));

						// Last page
						element.create(last ? "span" : "a", {
							"class": "last page",
							"data-page": last ? null : total,
							innerHTML: "&gt;&gt;"
						}, element.create("li", {}, el));

						// Adding to DOM
						element.removeClass(el, "hidden");

						// Pagination listener
						_this12.observer.hook(el, "click");
					});

					return this;
				}
			}, {
				key: "refresh",

				/**
     * Refreshes element
     *
     * @method refresh
     * @memberOf keigai.DataList
     * @extends {keigai.Base}
     * @fires keigai.DataList#beforeRefresh Fires before refresh
     * @fires keigai.DataList#afterRefresh Fires after refresh
     * @fires keigai.DataList#error Fires on error
     * @param  {Boolean} create [Optional] Recreates cached View of data
     * @return {Object} {@link keigai.DataList}
     * @example
     * list.refresh();
     */
				value: function refresh() {
					var _this13 = this;

					var create = arguments[0] === undefined ? false : arguments[0];

					var el = this.element;
					var template = typeof this.template === "object";
					var filter = this.filter !== null;
					var items = [];
					var callback = typeof this.callback === "function";
					var reg = new RegExp();
					var registry = []; // keeps track of records in the list ( for filtering )
					var range = [];
					var fn = undefined,
					    ceiling = undefined,
					    next = undefined;

					this.dispatch("beforeRefresh", el);

					// Function to create templates for the html rep
					if (!template) {
						fn = function (i) {
							var html = _this13.template;
							var items = array.unique(html.match(/\{\{[\w\.\-\[\]]+\}\}/g));

							// Replacing record key
							html = html.replace("{{" + _this13.store.key + "}}", i.key);

							// Replacing dot notation properties
							array.each(items, function (attr) {
								var key = attr.replace(/\{\{|\}\}/g, ""),
								    value = utility.walk(i.data, key);

								if (value === undefined) {
									value = "";
								}

								reg.compile(string.escape(attr), "g");
								html = html.replace(reg, value);
							});

							// Filling in placeholder value
							html = html.replace(/\{\{.*\}\}/g, _this13.placeholder);

							return "<li data-key=\"" + i.key + "\">" + html + "</li>";
						};
					} else {
						fn = function (i) {
							var obj = json.encode(_this13.template);
							var items = array.unique(obj.match(/\{\{[\w\.\-\[\]]+\}\}/g));

							// Replacing record key
							obj = obj.replace("{{" + _this13.store.key + "}}", i.key);

							// Replacing dot notation properties
							array.each(items, function (attr) {
								var key = attr.replace(/\{\{|\}\}/g, "");
								var value = utility.walk(i.data, key) || "";

								reg.compile(string.escape(attr), "g");

								// Stripping first and last " to concat to valid JSON
								obj = obj.replace(reg, json.encode(value).replace(/(^")|("$)/g, ""));
							});

							// Filling in placeholder value
							obj = json.decode(obj.replace(/\{\{.*\}\}/g, _this13.placeholder));

							return { li: obj };
						};
					}

					// Next phase
					next = function (args) {
						// Creating view of DataStore
						_this13.records = args;
						_this13.total = _this13.records.length;
						_this13.filtered = [];

						// Resetting 'view' specific arrays
						_this13.current = [];

						// Filtering records (if applicable)
						if (filter) {
							array.each(_this13.records, function (i) {
								utility.iterate(_this13.filter, function (v, k) {
									var key = undefined;

									if (array.contains(registry, i.key)) {
										return false;
									}

									key = k === _this13.store.key;

									array.each(string.explode(v), function (query) {
										var reg = new RegExp(query, "i");
										var value = !key ? utility.walk(i.data, k) : "";

										if (key && reg.test(i.key) || reg.test(value)) {
											registry.push(i.key);
											_this13.filtered.push(i);

											return false;
										}
									});
								});
							});
						}

						// Pagination
						if (_this13.pageSize !== null && !isNaN(_this13.pageIndex) && !isNaN(_this13.pageSize)) {
							ceiling = list.pages(_this13);

							// Passed the end, so putting you on the end
							if (ceiling > 0 && _this13.pageIndex > ceiling) {
								return _this13.page(ceiling);
							}
							// Paginating the items
							else if (_this13.total > 0) {
								range = list.range(_this13);
								_this13.current = array.limit(!filter ? _this13.records : _this13.filtered, range[0], range[1]);
							}
						} else {
							_this13.current = !filter ? _this13.records : _this13.filtered;
						}

						// Processing records & generating templates
						array.each(_this13.current, function (i) {
							var html = fn(i);
							var hash = btoa(html);

							items.push({ key: i.key, template: html, hash: hash });
						});

						// Updating element
						utility.render(function () {
							var destroy = [];
							var callbacks = [];
							var i = undefined,
							    nth = undefined;

							if (items.length === 0) {
								element.html(el, "<li class=\"empty\">" + _this13.emptyMsg + "</li>");
							} else {
								if (_this13.items.length === 0) {
									element.html(el, items.map(function (i) {
										return i.template;
									}).join(""));

									if (callback) {
										array.each(array.cast(el.childNodes), function (i) {
											_this13.callback(i);
										});
									}
								} else {
									array.each(items, function (i, idx) {
										if (_this13.items[idx] !== undefined && _this13.items[idx].hash !== i.hash) {
											element.data(element.html(el.childNodes[idx], i.template.replace(/<li data-key=\"\d+\">|<\/li>/g, "")), "key", i.key);
											callbacks.push(idx);
										} else if (_this13.items[idx] === undefined) {
											element.create(i.template, null, el);
											callbacks.push(idx);
										}
									});

									if (items.length < _this13.items.length) {
										i = items.length - 1;
										nth = _this13.items.length;

										while (++i < nth) {
											destroy.push(i);
										}

										array.each(destroy.reverse(), function (i) {
											element.destroy(el.childNodes[i]);
										});
									}

									if (callback) {
										array.each(callbacks, function (i) {
											_this13.callback(el.childNodes[i]);
										});
									}
								}
							}

							// Updating reference for next change
							_this13.items = items;

							// Rendering pagination elements
							if (_this13.pageSize !== null && regex.top_bottom.test(_this13.pagination) && !isNaN(_this13.pageIndex) && !isNaN(_this13.pageSize)) {
								_this13.pages();
							} else {
								array.each(utility.$("#" + el.id + "-pages-top, #" + el.id + "-pages-bottom"), function (i) {
									element.destroy(i);
								});
							}

							_this13.dispatch("afterRefresh", el);
						});
					};

					// Consuming records based on sort
					if (this.where === null) {
						string.isEmpty(this.order) ? next(this.store.get()) : this.store.sort(this.order, create).then(next, function (e) {
							utility.error(e);
							_this13.dispatch("error", e);
						});
					} else if (string.isEmpty(this.order)) {
						this.store.select(this.where).then(next, function (e) {
							utility.error(e);
							_this13.dispatch("error", e);
						});
					} else {
						this.store.sort(this.order, create, this.where).then(next, function (e) {
							utility.error(e);
							_this13.dispatch("error", e);
						});
					}

					return this;
				}
			}, {
				key: "remove",

				/**
     * Removes an item from the DataList
     *
     * @method remove
     * @memberOf keigai.DataList
     * @param {Mixed} record Record, key or index
     * @return {Object} {@link keigai.DataList}
     * @example
     * // Adding a click handler to 'trash' Elements
     * keigai.util.array.cast( document.querySelectorAll( ".list .trash" ) ).forEach( function ( i ) {
     *   i.addEventListener( "click", ( ev ) => {
     *     let key = keigai.util.element.data( keigai.util.target( ev ).parentNode, "key" );
     *
     *     list.remove( key );
     *   }, false );
     * } );
     */
				value: function remove(record) {
					var _this14 = this;

					this.store.del(record).then(null, function (e) {
						utility.error(e);
						_this14.dispatch("error", e);
					});

					return this;
				}
			}, {
				key: "sort",

				/**
     * Sorts data list & refreshes element
     *
     * @method sort
     * @memberOf keigai.DataList
     * @param  {String} order SQL "ORDER BY" clause
     * @return {Object} {@link keigai.DataList}
     * @example
     * list.sort( "age, name" );
     */
				value: function sort(order) {
					this.order = order;

					return this.refresh();
				}
			}, {
				key: "teardown",

				/**
     * Tears down references to the DataList
     *
     * @method teardown
     * @memberOf keigai.DataList
     * @param  {Boolean} destroy [Optional] `true` will remove the DataList from the DOM
     * @return {Object} {@link keigai.DataList}
     * @example
     * list.teardown();
     */
				value: function teardown() {
					var _this15 = this;

					var destroy = arguments[0] === undefined ? false : arguments[0];

					var el = this.element;
					var id = el.id;

					array.each(this.store.lists, function (i, idx) {
						if (i.id === _this15.id) {
							array.remove(_this15.store.lists, idx);

							return false;
						}
					});

					if (this.listFilter) {
						this.listFilter.teardown();
					}

					array.each(utility.$("#" + id + "-pages-top, #" + id + "-pages-bottom"), function (i) {
						_this15.observer.unhook(i, "click");

						if (destroy) {
							element.destroy(i);
						}
					});

					this.observer.unhook(el, "click");

					if (destroy) {
						element.destroy(el);
					}

					this.element = null;

					return this;
				}
			}, {
				key: "update",

				/**
     * Updates an item in the DataList
     *
     * @method update
     * @memberOf keigai.DataList
     * @param {Mixed}  key  Key or index
     * @param {Object} data New property values
     * @return {Object}     {@link keigai.DataList}
     * @example
     * list.update( "key", {name: "Jim Smith"} );
     */
				value: function update(key, data) {
					var _this16 = this;

					this.store.update(key, data).then(null, function (e) {
						utility.error(e);
						_this16.dispatch("error", e);
					});

					return this;
				}
			}]);

			return DataList;
		})(Base);

		/**
   * @namespace list
   */
		var list = {
			/**
    * Creates an instance of DataList
    *
    * @method factory
    * @memberOf list
    * @fires keigai.DataList#change Fires when the DOM changes
    * @param  {Object} target   Element to receive the DataList
    * @param  {Object} store    {@link keigai.DataStore}
    * @param  {Mixed}  template Record field, template ( $.tpl ), or String, e.g. "<p>this is a {{field}} sample.</p>", fields are marked with {{ }}
    * @param  {Object} options  Optional parameters to set on the DataList
    * @return {Object} {@link keigai.DataList}
    * @example
    * let store = keigai.store( [...] ),
    *     list  = keigai.list( document.querySelector("#list"), store, "{{name}}", {order: "name"} );
    */
			factory: function factory(target, store, template, options) {
				var ref = [store];
				var obj = new DataList(element.create("ul", { "class": "list", id: utility.genId(null, true) }, target), ref[0], template);

				if (options instanceof Object) {
					if (options.listFiltered && options.listFilter) {
						obj.listFilter = filter(element.create("input", {
							id: obj.element.id + "-filter",
							"class": "filter",
							placeholder: "Filter"
						}, target, "first"), obj, options.listFilter, options.debounce);
						delete options.listFilter;
						delete options.listFiltered;
						delete options.debounce;
					}

					utility.merge(obj, options);
				}

				obj.store.lists.push(obj);

				// Setting up a chain of Events
				obj.on("beforeRefresh", function (arg) {
					element.dispatch(arg, "beforeRefresh");
				}, "bubble");

				obj.on("afterRefresh", function (arg) {
					element.dispatch(arg, "afterRefresh");
				}, "bubble");

				obj.on("change", function (arg) {
					element.dispatch(obj.element, "change", arg);
				}, "change");

				obj.on("click", function (e) {
					var target = utility.target(e);
					var page = undefined;

					utility.stop(e);

					if (target.nodeName === "A") {
						page = element.data(target, "page");

						if (!isNaN(page)) {
							obj.page(page);
						}
					}
				}, "pagination");

				if (mutation) {
					obj.mutation = new MutationObserver(function (arg) {
						obj.dispatch("change", arg);
					});

					obj.mutation.observe(obj.element, { childList: true, subtree: true });
				}

				// Rendering if not tied to an API or data is ready
				if (obj.store.uri === null || obj.store.loaded) {
					obj.refresh();
				}

				return obj;
			},

			/**
    * Calculates the total pages
    *
    * @method pages
    * @memberOf list
    * @return {Number} Total pages
    * @private
    */
			pages: function pages(obj) {
				if (isNaN(obj.pageSize)) {
					throw new Error(label.invalidArguments);
				}

				return Math.ceil((!obj.filter ? obj.total : obj.filtered.length) / obj.pageSize);
			},

			/**
    * Calculates the page size as an Array of start & finish
    *
    * @method range
    * @memberOf list
    * @return {Array}  Array of start & end numbers
    * @private
    */
			range: function range(obj) {
				var start = obj.pageIndex * obj.pageSize - obj.pageSize;
				var end = obj.pageSize;

				return [start, end];
			}
		};

		var Deferred = (function () {
			/**
    * Creates a new Deferred
    *
    * @constructor
    * @memberOf keigai
    */

			function Deferred() {
				var _this17 = this;

				_classCallCheck(this, Deferred);

				this.promise = promise.factory();
				this.onDone = [];
				this.onAlways = [];
				this.onFail = [];

				// Setting handlers to execute Arrays of Functions
				this.promise.then(function (arg) {
					array.each(_this17.onDone, function (i) {
						i(arg);
					});

					array.each(_this17.onAlways, function (i) {
						i(arg);
					});

					_this17.onAlways = [];
					_this17.onDone = [];
					_this17.onFail = [];
				}, function (arg) {
					array.each(_this17.onFail, function (i) {
						i(arg);
					});

					array.each(_this17.onAlways, function (i) {
						i(arg);
					});

					_this17.onAlways = [];
					_this17.onDone = [];
					_this17.onFail = [];
				});
			}

			_createClass(Deferred, [{
				key: "always",

				/**
     * Registers a function to execute after Promise is reconciled
     *
     * @method always
     * @memberOf keigai.Deferred
     * @param  {Function} arg Function to execute
     * @return {Object} {@link keigai.Deferred}
     * @example
     * let deferred = keigai.util.defer();
     *
     * deferred.always( function () {
     *     ...
     * } ).then( function () {
     *     ...
     * } );
     *
     * ...
     *
     * deferred.resolve( true );
     */
				value: function always(arg) {
					this.onAlways.push(arg);

					return this;
				}
			}, {
				key: "catch",

				/**
     * Catches errors from the Promise
     *
     * @method  catch
     * @memberOf keigai.Deferred
     * @param  {Function} arg Function to execute
     * @return {Object} {@link keigai.Deferred}
     * @example
     * let deferred = keigai.util.defer();
     *
     * deferred.catch( function ( err ) {
     *   ...
     * } );
     */
				value: function _catch(arg) {
					return this.promise["catch"](arg);
				}
			}, {
				key: "done",

				/**
     * Registers a function to execute after Promise is resolved
     *
     * @method done
     * @memberOf keigai.Deferred
     * @param  {Function} arg Function to execute
     * @return {Object} {@link keigai.Deferred}
     * @example
     * let deferred = keigai.util.defer();
     *
     * deferred.done( function ( ... ) {
     *   ...
     * } );
     */
				value: function done(arg) {
					this.onDone.push(arg);

					return this;
				}
			}, {
				key: "fail",

				/**
     * Registers a function to execute after Promise is rejected
     *
     * @method fail
     * @memberOf keigai.Deferred
     * @param  {Function} arg Function to execute
     * @return {Object} {@link keigai.Deferred}
     * @example
     * let deferred = keigai.util.defer();
     *
     * deferred.fail( function ( ... ) {
     *   ...
     * } );
     */
				value: function fail(arg) {
					this.onFail.push(arg);

					return this;
				}
			}, {
				key: "reject",

				/**
     * Rejects the Promise
     *
     * @method reject
     * @memberOf keigai.Deferred
     * @param  {Mixed} arg Rejection outcome
     * @return {Object} {@link keigai.Deferred}
     * @example
     * let deferred = keigai.util.defer();
     *
     * deferred.reject( new Error( "Something went wrong" ) );
     */
				value: function reject(arg) {
					this.promise.reject.call(this.promise, arg);

					return this;
				}
			}, {
				key: "resolve",

				/**
     * Resolves the Promise
     *
     * @method resolve
     * @memberOf keigai.Deferred
     * @param  {Mixed} arg Resolution outcome
     * @return {Object} {@link keigai.Deferred}
     * @example
     * let deferred = keigai.util.defer();
     *
     * deferred.resolve( true );
     */
				value: function resolve(arg) {
					this.promise.resolve.call(this.promise, arg);

					return this;
				}
			}, {
				key: "then",

				/**
     * Registers handler(s) for the Promise
     *
     * @method then
     * @memberOf keigai.Deferred
     * @param  {Function} success Executed when/if promise is resolved
     * @param  {Function} failure [Optional] Executed when/if promise is broken
     * @return {Object} {@link Promise}
     * @example
     * let deferred = keigai.util.defer();
     *
     * deferred.then( function ( ... ) { ... }, function ( err ) { ... } )
     *         .then( function ( ... ) { ... }, function ( err ) { ... } );
     *
     * ...
     *
     * deferred.resolve( true );
     */
				value: function then(success, failure) {
					return this.promise.then(success, failure);
				}
			}]);

			return Deferred;
		})();

		/**
   * Deferred factory
   *
   * @method factory
   * @memberOf deferred
   * @return {Object} {@link keigai.Deferred}
   * @example
   * let deferred = keigai.util.defer();
   *
   * deferred.then( function ( ... ) { ... }, function ( err ) { ... } )
   * deferred.always( function ( ... ) { ... } );
   *
   * ...
   *
   * deferred.resolve( true );
   */
		var deferred = function deferred() {
			return new Deferred();
		};

		/**
   * @namespace element
   */
		var element = {
			/**
    * Adds a CSS class to an Element
    *
    * @method addClass
    * @memberOf element
    * @param  {Object} obj Element
    * @param  {String} arg CSS class
    * @return {Object}     Element
    * @example
    * keigai.util.element.addClass( document.querySelector( "#target" ), "newClass" );
    */
			addClass: function addClass(obj, arg) {
				element.klass(obj, arg, true);
			},

			/**
    * Appends an Element to an Element
    *
    * @method appendTo
    * @memberOf element
    * @param  {Object} obj   Element
    * @param  {Object} child Child Element
    * @return {Object}       Element
    * @example
    * keigai.util.element.appendTo( document.querySelector( "#target" ), document.querySelector( "#something" ) );
    */
			appendTo: function appendTo(obj, child) {
				obj.appendChild(child);

				return obj;
			},

			/**
    * Gets or sets an Element attribute
    *
    * @method attr
    * @memberOf element
    * @param  {Object} obj   Element
    * @param  {String} key   Attribute name
    * @param  {Mixed}  value Attribute value
    * @return {Object}       Element
    * @example
    * keigai.util.element.attr( document.querySelector( "select" ), "selected", "option 1" );
    */
			attr: function attr(obj, key, value) {
				var target = undefined,
				    result = undefined;

				if (regex.svg.test(obj.namespaceURI)) {
					if (value === undefined) {
						result = obj.getAttributeNS(obj.namespaceURI, key);

						if (result === null || string.isEmpty(result)) {
							result = undefined;
						} else {
							result = utility.coerce(result);
						}

						return result;
					} else {
						obj.setAttributeNS(obj.namespaceURI, key, value);
					}
				} else {
					if (typeof value === "string") {
						value = string.trim(value);
					}

					if (regex.checked_disabled.test(key) && value === undefined) {
						return utility.coerce(obj[key]);
					} else if (regex.checked_disabled.test(key) && value !== undefined) {
						obj[key] = value;
					} else if (obj.nodeName === "SELECT" && key === "selected" && value === undefined) {
						return utility.dom("#" + obj.id + " option[selected=\"selected\"]")[0] || utility.dom("#" + obj.id + " option")[0];
					} else if (obj.nodeName === "SELECT" && key === "selected" && value !== undefined) {
						target = utility.dom("#" + obj.id + " option[selected=\"selected\"]")[0];

						if (target !== undefined) {
							target.selected = false;
							target.removeAttribute("selected");
						}

						target = utility.dom("#" + obj.id + " option[value=\"" + value + "\"]")[0];
						target.selected = true;
						target.setAttribute("selected", "selected");
					} else if (value === undefined) {
						result = obj.getAttribute(key);

						if (result === null || string.isEmpty(result)) {
							result = undefined;
						} else {
							result = utility.coerce(result);
						}

						return result;
					} else {
						obj.setAttribute(key, value);
					}
				}

				return obj;
			},

			/**
    * Clears an object's innerHTML, or resets it's state
    *
    * @method clear
    * @memberOf element
    * @param  {Object} obj Element
    * @return {Object}     Element
    * @example
    * keigai.util.element.clear( document.querySelector( "#something" ) );
    */
			clear: function clear(obj) {
				if (typeof obj.reset === "function") {
					obj.reset();
				} else if (obj.value !== undefined) {
					element.update(obj, { innerHTML: "", value: "" });
				} else {
					element.update(obj, { innerHTML: "" });
				}

				return obj;
			},

			/**
    * Creates an Element in document.body or a target Element.
    * An id is generated if not specified with args.
    *
    * @method create
    * @memberOf element
    * @param  {String} type Type of Element to create, or HTML String
    * @param  {Object} args [Optional] Properties to set
    * @param  {Object} obj  [Optional] Target Element
    * @param  {Mixed}  pos  [Optional] "first", "last" or Object describing how to add the new Element, e.g. {before: referenceElement}, default is "last"
    * @return {Mixed}       Element that was created, or an Array if `type` is a String of multiple Elements (frag)
    * @example
    * keigai.util.element.create( "div", {innerHTML: "Hello World!"}, document.querySelector( "#something" ) );
    * keigai.util.element.create( "&lt;div&gt;Hello World!&lt;/div&gt;" );
    */
			create: function create(type, args, obj, pos) {
				var svg = false;
				var frag = false;
				var fragment = undefined,
				    result = undefined;

				// Removing potential HTML template formatting
				type = type.replace(/\t|\n|\r/g, "");

				if (obj) {
					svg = obj.namespaceURI && regex.svg.test(obj.namespaceURI);
				} else {
					obj = document.body;
				}

				// String injection, create a frag and apply it
				if (regex.html.test(type)) {
					frag = true;
					fragment = element.frag(type);
					result = fragment.childNodes.length === 1 ? fragment.childNodes[0] : array.cast(fragment.childNodes);
				}
				// Original syntax
				else {
					if (!svg && !regex.svg.test(type)) {
						fragment = document.createElement(type);
					} else {
						fragment = document.createElementNS("http://www.w3.org/2000/svg", type);
					}

					if (args instanceof Object) {
						element.update(fragment, args);
					}
				}

				if (!pos || pos === "last") {
					obj.appendChild(fragment);
				} else if (pos === "first") {
					element.prependChild(obj, fragment);
				} else if (pos === "after") {
					pos = { after: obj };
					obj = obj.parentNode;
					obj.insertBefore(fragment, pos.after.nextSibling);
				} else if (pos.after) {
					obj.insertBefore(fragment, pos.after.nextSibling);
				} else if (pos === "before") {
					pos = { before: obj };
					obj = obj.parentNode;
					obj.insertBefore(fragment, pos.before);
				} else if (pos.before) {
					obj.insertBefore(fragment, pos.before);
				} else {
					obj.appendChild(fragment);
				}

				return !frag ? fragment : result;
			},

			/**
    * Gets or sets a CSS style attribute on an Element
    *
    * @method css
    * @memberOf element
    * @param  {Object} obj   Element
    * @param  {String} key   CSS to put in a style tag
    * @param  {String} value [Optional] Value to set
    * @return {Object}       Element
    * @example
    * keigai.util.element.css( document.querySelector( "#something" ), "font-weight", "bold" );
    * keigai.util.element.css( document.querySelector( "#something" ), "font-weight" ); // "bold"
    */
			css: function css(obj, key, value) {
				if (!regex.caps.test(key)) {
					key = string.toCamelCase(key);
				}

				if (value !== undefined) {
					obj.style[key] = value;
					return obj;
				} else {
					return obj.style[key];
				}
			},

			/**
    * Data attribute facade acting as a getter (with coercion) & setter
    *
    * @method data
    * @memberOf element
    * @param  {Object} obj   Element
    * @param  {String} key   Data key
    * @param  {Mixed}  value Boolean, Number or String to set
    * @return {Mixed}        undefined, Element or value
    * @example
    * // Setting
    * keigai.util.element.data( document.querySelector( "#something" ), "id", "abc-1234" );
    *
    * // Getting
    * keigai.util.element.data( document.querySelector( "#something" ), "id" ); // "abc-1234"
    *
    * // Unsetting
    * keigai.util.element.data( document.querySelector( "#something" ), "id", null );
    *
    * // Setting a `null` value can be done by using a String
    * keigai.util.element.data( document.querySelector( "#something" ), "id", "null" );
    */
			data: function data(obj, key, value) {
				if (value !== undefined) {
					obj.setAttribute("data-" + key, regex.json_wrap.test(value) ? json.encode(value) : value);

					return obj;
				} else {
					return utility.coerce(obj.getAttribute("data-" + key));
				}
			},

			/**
    * Destroys an Element
    *
    * @method destroy
    * @memberOf element
    * @param  {Object} obj Element
    * @return {Undefined} undefined
    * @example
    * keigai.util.element.destroy( document.querySelector( "#something" ) );
    */
			destroy: function destroy(obj) {
				if (obj.parentNode !== null) {
					obj.parentNode.removeChild(obj);
				}

				return undefined;
			},

			/**
    * Disables an Element
    *
    * @method disable
    * @memberOf element
    * @param  {Object} obj Element
    * @return {Object}     Element
    * @example
    * keigai.util.element.disable( document.querySelector( "#something" ) );
    */
			disable: function disable(obj) {
				if (typeof obj.disabled === "boolean" && !obj.disabled) {
					obj.disabled = true;
				}

				return obj;
			},

			/**
    * Dispatches a DOM Event from an Element
    *
    * `data` will appear as `Event.detail`
    *
    * @method dispatch
    * @memberOf element
    * @param  {Object}  obj        Element which dispatches the Event
    * @param  {String}  type       Type of Event to dispatch
    * @param  {Object}  data       [Optional] Data to include with the Event
    * @param  {Boolean} bubbles    [Optional] Determines if the Event bubbles, defaults to `true`
    * @param  {Boolean} cancelable [Optional] Determines if the Event can be canceled, defaults to `true`
    * @return {Object}             Element which dispatches the Event
    * @example
    * keigai.util.element.dispatch( document.querySelector( "#something" ), "click" );
    */
			dispatch: function dispatch(obj, type) {
				var data = arguments[2] === undefined ? {} : arguments[2];
				var bubbles = arguments[3] === undefined ? true : arguments[3];
				var cancelable = arguments[4] === undefined ? true : arguments[4];

				var ev = undefined;

				if (!obj) {
					return;
				}

				try {
					ev = new CustomEvent(type);
				} catch (e) {
					ev = document.createEvent("CustomEvent");
				}

				ev.initCustomEvent(type, bubbles, cancelable, data);
				obj.dispatchEvent(ev);

				return obj;
			},

			/**
    * Enables an Element
    *
    * @method enable
    * @memberOf element
    * @param  {Object} obj Element
    * @return {Object}     Element
    * @example
    * keigai.util.element.enable( document.querySelector( "#something" ) );
    */
			enable: function enable(obj) {
				if (typeof obj.disabled === "boolean" && obj.disabled) {
					obj.disabled = false;
				}

				return obj;
			},

			/**
    * Finds descendant childNodes of Element matched by arg
    *
    * @method find
    * @memberOf element
    * @param  {Object} obj Element to search
    * @param  {String} arg Comma delimited string of descendant selectors
    * @return {Mixed}      Array of Elements or undefined
    * @example
    * keigai.util.element.find( document.querySelector( "#something" ), "p" );
    */
			find: function find(obj, arg) {
				var result = [];

				array.each(string.explode(arg), function (i) {
					result = result.concat(array.cast(obj.querySelectorAll(i)));
				});

				return result;
			},

			/**
    * Creates a document fragment
    *
    * @method frag
    * @memberOf element
    * @param  {String} arg [Optional] innerHTML
    * @return {Object}     Document fragment
    * @example
    * let frag = keigai.util.element.frag( "Hello World!" );
    */
			frag: function frag(arg) {
				var obj = document.createDocumentFragment();

				if (arg) {
					array.each(array.cast(element.create("div", { innerHTML: arg }, obj).childNodes), function (i) {
						obj.appendChild(i);
					});

					obj.removeChild(obj.childNodes[0]);
				}

				return obj;
			},

			/**
    * Determines if Element has descendants matching arg
    *
    * @method has
    * @memberOf element
    * @param  {Object} obj Element
    * @param  {String} arg Type of Element to find
    * @return {Boolean}    `true` if 1 or more Elements are found
    * @example
    * if ( keigai.util.element.has( document.querySelector( "#something" ), "p" ) ) {
    *   ...
    * }
    */
			has: function has(obj, arg) {
				var result = element.find(obj, arg);

				return !isNaN(result.length) && result.length > 0;
			},

			/**
    * Determines if obj has a specific CSS class
    *
    * @method hasClass
    * @memberOf element
    * @param  {Object} obj Element
    * @param  {String} arg CSS class to test for
    * @return {Boolean}    `true` if Element has `arg`
    * @example
    * if ( keigai.util.element.hasClass( document.querySelector( "#something" ), "someClass" ) ) {
    *   ...
    * }
    */
			hasClass: function hasClass(obj, arg) {
				return obj.classList.contains(arg);
			},

			/**
    * Returns a Boolean indidcating if the Object is hidden
    *
    * @method hidden
    * @memberOf element
    * @param  {Object} obj Element
    * @return {Boolean}   `true` if hidden
    * @example
    * if ( keigai.util.element.hidden( document.querySelector( "#something" ) ) ) {
    *   ...
    * }
    */
			hidden: function hidden(obj) {
				return obj.style.display === "none" || obj.hidden === true;
			},

			/**
    * Gets or sets an Elements innerHTML
    *
    * @method html
    * @memberOf element
    * @param  {Object} obj Element
    * @param  {String} arg [Optional] innerHTML value
    * @return {Object}     Element
    * @example
    * keigai.util.element.html( document.querySelector( "#something" ), "Hello World!" );
    * keigai.util.element.html( document.querySelector( "#something" ) ); // "Hello World!"
    */
			html: function html(obj, arg) {
				if (arg === undefined) {
					return obj.innerHTML;
				} else {
					obj.innerHTML = arg;
					return obj;
				}
			},

			/**
    * Determines if Element is equal to `arg`, supports nodeNames & CSS2+ selectors
    *
    * @method is
    * @memberOf element
    * @param  {Object} obj Element
    * @param  {String} arg Property to query
    * @return {Boolean}    `true` if a match
    * @example
    * if ( keigai.util.element.is( document.querySelector( "#something" ), "div" ) ) {
    *   ...
    * }
    *
    * if ( keigai.util.element.is( document.querySelector( "#something" ), ":first-child" ) ) {
    *   ...
    * }
    */
			is: function is(obj, arg) {
				if (regex.selector_is.test(arg)) {
					return element.find(obj.parentNode, obj.nodeName.toLowerCase() + arg).filter(function (i) {
						return i.id === obj.id;
					}).length === 1;
				} else {
					return new RegExp(arg, "i").test(obj.nodeName);
				}
			},

			/**
    * Adds or removes a CSS class
    *
    * @method klass
    * @memberOf element
    * @param  {Object}  obj Element
    * @param  {String}  arg Class to add or remove ( can be a wildcard )
    * @param  {Boolean} add Boolean to add or remove, defaults to true
    * @return {Object}      Element
    * @example
    * // Adding a class
    * keigai.util.element.klass( document.querySelector( "#something" ), "newClass" );
    *
    * // Removing a class
    * keigai.util.element.klass( document.querySelector( "#something" ), "newClass", false );
    */
			klass: function klass(obj, arg) {
				var add = arguments[2] === undefined ? true : arguments[2];

				arg = string.explode(arg, " ");

				if (add) {
					array.each(arg, function (i) {
						obj.classList.add(i);
					});
				} else {
					array.each(arg, function (i) {
						if (i !== "*") {
							obj.classList.remove(i);
						} else {
							array.each(obj.classList, function (x) {
								obj.classList.remove(x);
							});

							return false;
						}
					});
				}

				return obj;
			},

			/**
    * Finds the position of an Element
    *
    * @method position
    * @memberOf element
    * @param  {Object} obj Element
    * @return {Array}      Coordinates [left, top, right, bottom]
    * @example
    * let pos = keigai.util.element.position( document.querySelector( "#something" ) );
    */
			position: function position() {
				var obj = arguments[0] === undefined ? document.body : arguments[0];

				var left = undefined,
				    top = undefined,
				    right = undefined,
				    bottom = undefined,
				    height = undefined,
				    width = undefined;

				left = top = 0;
				width = obj.offsetWidth;
				height = obj.offsetHeight;

				if (obj.offsetParent) {
					top = obj.offsetTop;
					left = obj.offsetLeft;

					while (obj = obj.offsetParent) {
						left += obj.offsetLeft;
						top += obj.offsetTop;
					}

					right = document.body.offsetWidth - (left + width);
					bottom = document.body.offsetHeight - (top + height);
				} else {
					right = width;
					bottom = height;
				}

				return [left, top, right, bottom];
			},

			/**
    * Prepends an Element to an Element
    *
    * @method prependChild
    * @memberOf element
    * @param  {Object} obj   Element
    * @param  {Object} child Child Element
    * @return {Object}       Element
    * @example
    * keigai.util.element.prependChild( document.querySelector( "#target" ), document.querySelector( "#something" ) );
    */
			prependChild: function prependChild(obj, child) {
				return obj.childNodes.length === 0 ? obj.appendChild(child) : obj.insertBefore(child, obj.childNodes[0]);
			},

			/**
    * Removes an Element attribute
    *
    * @method removeAttr
    * @memberOf element
    * @param  {Object} obj Element
    * @param  {String} key Attribute name
    * @return {Object}     Element
    * @example
    * keigai.util.element.removeAttr( document.querySelector( "a" ), "href" );
    */
			removeAttr: function removeAttr(obj, key) {
				if (regex.svg.test(obj.namespaceURI)) {
					obj.removeAttributeNS(obj.namespaceURI, key);
				} else if (obj.nodeName === "SELECT" && key === "selected") {
					array.each(element.find(obj, "option"), function (i) {
						if (i.selected === true) {
							i.selected = false;
							i.removeAttribute("selected");

							return false;
						}
					});
				} else {
					obj.removeAttribute(key);
				}

				return obj;
			},

			/**
    * Removes a CSS class from Element
    *
    * @method removeClass
    * @memberOf element
    * @param  {Object} obj Element
    * @param  {String} arg CSS class
    * @return {Object}     Element
    * @example
    * keigai.util.element.removeClass( document.querySelector( "#target" ), "existingClass" );
    */
			removeClass: function removeClass(obj, arg) {
				element.klass(obj, arg, false);
			},

			/**
    * Scrolls to the position of an Element
    *
    * @method scrollTo
    * @memberOf element
    * @param  {Object} obj        Element to scroll to
    * @param  {Number} ms         [Optional] Milliseconds to scroll, default is 250, min is 100
    * @param  {Number} offsetTop  [Optional] Offset from top of Element
    * @param  {Number} offsetLeft [Optional] Offset from left of Element
    * @return {Object} {@link Deferred}
    * @example
    * keigai.util.element.scrollTo( document.querySelector( "#something" ) ).then( () => {
    *   ...
    * } );
    */
			scrollTo: function scrollTo(obj, ms, offsetTop, offsetLeft) {
				var pos = array.remove(element.position(obj), 2, 3);

				if (!isNaN(offsetTop)) {
					pos[0] += offsetTop;
				}

				if (!isNaN(offsetLeft)) {
					pos[1] += offsetLeft;
				}

				return client.scroll(pos, ms);
			},

			/**
    * Serializes the elements of an Element
    *
    * @method serialize
    * @memberOf element
    * @param  {Object}  obj    Element
    * @param  {Boolean} string [Optional] true if you want a query string, default is false ( JSON )
    * @param  {Boolean} encode [Optional] true if you want to URI encode the value, default is true
    * @return {Mixed}          String or Object
    * @example
    * let userInput = keigai.util.element.serialize( document.querySelector( "form" ) );
    */
			serialize: function serialize(obj) {
				var string = arguments[1] === undefined ? true : arguments[1];
				var encode = arguments[2] === undefined ? true : arguments[2];

				var registry = {};
				var children = undefined,
				    result = undefined;

				children = obj.nodeName === "FORM" ? obj.elements ? array.cast(obj.elements) : obj.find("button, input, select, textarea") : [obj];

				array.each(children, function (i) {
					var id = i.id || i.name || i.type;

					if (i.nodeName === "FORM") {
						utility.merge(registry, json.decode(element.serialize(i)));
					} else if (!registry[id]) {
						registry[id] = element.val(i);
					}
				});

				if (!string) {
					result = registry;
				} else {
					result = "";

					utility.iterate(registry, function (v, k) {
						encode ? result += "&" + encodeURIComponent(k) + "=" + encodeURIComponent(v) : result += "&" + k + "=" + v;
					});

					result = result.replace(regex.and, "?");
				}

				return result;
			},

			/**
    * Returns the size of the Element
    *
    * @method size
    * @memberOf element
    * @param  {Object} obj Element
    * @return {Array}      [width, height]
    * @example
    * let size = keigai.util.element.size( document.querySelector( "#something" ) );
    */
			size: function size(obj) {
				return [obj.offsetWidth + number.parse(obj.style.paddingLeft || 0) + number.parse(obj.style.paddingRight || 0) + number.parse(obj.style.borderLeft || 0) + number.parse(obj.style.borderRight || 0), obj.offsetHeight + number.parse(obj.style.paddingTop || 0) + number.parse(obj.style.paddingBottom || 0) + number.parse(obj.style.borderTop || 0) + number.parse(obj.style.borderBottom || 0)];
			},

			/**
    * Getter / setter for an Element's text
    *
    * @method text
    * @memberOf element
    * @param  {Object} obj Element
    * @param  {String} arg [Optional] Value to set
    * @return {Object}     Element
    * @example
    * let obj  = document.querySelector( "#something" ),
    *     text = keigai.util.element.text( obj );
    *
    * keigai.util.element.text( obj, text + ", and some more text" );
    */
			text: function text(obj, arg) {
				var key = obj.textContent ? "textContent" : "innerText";
				var payload = {};
				var set = false;

				if (typeof arg !== "undefined") {
					set = true;
					payload[key] = arg;
				}

				return set ? element.update(obj, payload) : obj[key];
			},

			/**
    * Toggles a CSS class
    *
    * @method toggleClass
    * @memberOf element
    * @param  {Object} obj Element
    * @param  {String} arg CSS class to toggle
    * @return {Object}     Element
    * @example
    * let obj = document.querySelector( "#something" );
    *
    * keigai.util.element.toggleClass( obj, "someClass" );
    */
			toggleClass: function toggleClass(obj, arg) {
				obj.classList.toggle(arg);

				return obj;
			},

			/**
    * Updates an Element
    *
    * @method update
    * @memberOf element
    * @param  {Object}  obj  Element
    * @param  {Object} args Properties to set
    * @return {Object}      Element
    * @example
    * keigai.util.element.update( document.querySelector( "#something" ), {innerHTML: "Hello World!", "class": "new"} );
    */
			update: function update(obj, args) {
				utility.iterate(args, function (v, k) {
					if (regex.element_update.test(k)) {
						obj[k] = v;
					} else if (k === "class") {
						!string.isEmpty(v) ? element.addClass(obj, v) : element.removeClass(obj, "*");
					} else if (k.indexOf("data-") === 0) {
						element.data(obj, k.replace("data-", ""), v);
					} else {
						element.attr(obj, k, v);
					}
				});

				return obj;
			},

			/**
    * Gets or sets the value of Element
    *
    * @method val
    * @memberOf element
    * @param  {Object} obj   Element
    * @param  {Mixed}  value [Optional] Value to set
    * @return {Object}       Element
    * @example
    * keigai.util.element.val( document.querySelector( "input[type='text']" ), "new value" );
    */
			val: function val(obj, value) {
				var ev = "input";
				var output = undefined;

				if (value === undefined) {
					if (regex.radio_checkbox.test(obj.type)) {
						if (string.isEmpty(obj.name)) {
							throw new Error(label.expectedProperty);
						}

						array.each(utility.dom("input[name='" + obj.name + "']"), function (i) {
							if (i.checked) {
								output = i.value;
								return false;
							}
						});
					} else if (regex.select.test(obj.type)) {
						output = null;
						array.each(element.find(obj, "option"), function (i) {
							if (i.selected === true) {
								output = i.value;
								return false;
							}
						});
					} else if (obj.value) {
						output = obj.value;
					} else if (obj.placeholder) {
						output = obj.placeholder === obj.innerText ? undefined : obj.innerText;
					} else {
						output = element.text(obj);
					}

					if (output !== undefined) {
						output = utility.coerce(output);

						if (typeof output === "string") {
							output = string.trim(output);
						}
					} else {
						output = "";
					}
				} else {
					value = value.toString();

					if (regex.radio_checkbox.test(obj.type)) {
						ev = "click";

						array.each(utility.dom("input[name='" + obj.name + "']"), function (i) {
							if (i.value === value) {
								i.checked = true;
								output = i;
								return false;
							}
						});
					} else if (regex.select.test(obj.type)) {
						ev = "change";

						array.each(element.find(obj, " option"), function (i) {
							if (i.value === value) {
								i.selected = true;
								output = i;
								return false;
							}
						});
					} else {
						obj.value !== undefined ? obj.value = value : element.text(obj, value);
					}

					element.dispatch(obj, ev);

					output = obj;
				}

				return output;
			}
		};

		/**
   * @namespace json
   */
		var json = {
			/**
    * Decodes the argument
    *
    * @method decode
    * @memberOf json
    * @param  {String}  arg    String to parse
    * @param  {Boolean} silent [Optional] Silently fail
    * @return {Mixed}          Entity resulting from parsing JSON, or undefined
    * @example
    * let x = keigai.util.json.decode( ..., true );
    *
    * if ( x ) {
    *   ...
    * } else {
    *   ... // invalid JSON, with `Error` suppressed by `silent`
    * }
    */
			decode: function decode(arg, silent) {
				try {
					return JSON.parse(arg);
				} catch (e) {
					if (silent !== true) {
						utility.error(e, [arg, silent]);
					}

					return undefined;
				}
			},

			/**
    * Encodes `arg` as JSON
    *
    * @method encode
    * @memberOf json
    * @param  {Mixed}   arg    Primative
    * @param  {Boolean} silent [Optional] Silently fail
    * @return {String}         JSON, or undefined
    * @example
    * let x = keigai.util.json.encode( ..., true );
    *
    * if ( x ) {
    *   ...
    * } else {
    *   ... // invalid JSON, with `Error` suppressed by `silent`
    * }
    */
			encode: function encode(arg, silent) {
				try {
					return JSON.stringify(arg);
				} catch (e) {
					if (silent !== true) {
						utility.error(e, [arg, silent]);
					}

					return undefined;
				}
			}
		};

		/**
   * @namespace label
   * @private
   */
		var label = {
			/**
    * Expected a Number
    *
    * @type {String}
    * @memberOf label
    */
			expectedNumber: "Expected a Number",

			/**
    * Expected a property, and it was not set
    *
    * @type {String}
    * @memberOf label
    */
			expectedProperty: "Expected a property, and it was not set",

			/**
    * Expected an Object
    *
    * @type {String}
    * @memberOf label
    */
			expectedObject: "Expected an Object",

			/**
    * One or more arguments is invalid
    *
    * @type {String}
    * @memberOf label
    */
			invalidArguments: "One or more arguments is invalid",

			/**
    * INVALID_STATE_ERR: Headers have not been received
    *
    * @type {String}
    * @memberOf label
    */
			invalidStateNoHeaders: "INVALID_STATE_ERR: Headers have not been received",

			/**
    * Synchronous XMLHttpRequest requests are not supported
    *
    * @type {String}
    * @memberOf label
    */
			invalidStateNoSync: "Synchronous XMLHttpRequest requests are not supported",

			/**
    * INVALID_STATE_ERR: Object is not open
    *
    * @type {String}
    * @memberOf label
    */
			invalidStateNotOpen: "INVALID_STATE_ERR: Object is not open",

			/**
    * INVALID_STATE_ERR: Object is sending
    *
    * @type {String}
    * @memberOf label
    */
			invalidStateNotSending: "INVALID_STATE_ERR: Object is sending",

			/**
    * INVALID_STATE_ERR: Object is not usable
    *
    * @type {String}
    * @memberOf label
    */
			invalidStateNotUsable: "INVALID_STATE_ERR: Object is not usable",

			/**
    * Error when deferred is rejected for invalid request
    *
    * @type {String}
    * @memberOf label
    */
			methodNotAllowed: "Method not allowed",

			/**
    * Default `emptyMsg` of DataLists
    *
    * @type {String}
    * @memberOf label
    */
			noData: "Nothing to display",

			/**
    * Requested method is not available
    *
    * @type {String}
    * @memberOf label
    */
			notAvailable: "Requested method is not available",

			/**
    * No previous version of a record
    *
    * @type {String}
    * @memberOf label
    */
			datastoreNoPrevVersion: "No previous version found",

			/**
    * HTTP request timed out
    *
    * @type {String}
    * @memberOf label
    */
			requestTimeout: "Request timed out",

			/**
    * Server error has occurred
    *
    * @type {String}
    * @memberOf label
    */
			serverError: "Server error has occurred",

			/**
    * Forbidden to access URI
    *
    * @type {String}
    * @memberOf label
    */
			serverForbidden: "Forbidden to access URI",

			/**
    * Method not allowed
    *
    * @type {String}
    * @memberOf label
    */
			serverInvalidMethod: "Method not allowed",

			/**
    * Authorization required to access URI
    *
    * @type {String}
    * @memberOf label
    */
			serverUnauthorized: "Authorization required to access URI",

			/**
    * Your browser is too old to use keigai, please upgrade
    *
    * @type {String}
    * @memberOf label
    */
			upgrade: "Your browser is too old to use keigai, please upgrade"
		};

		/**
   * @namespace math
   */
		var math = {
			/**
    * Generates bezier curve coordinates for up to 4 points, last parameter is `t`
    *
    * Two point example: (0, 10, 0, 0, 1) means move straight up
    *
    * @method bezier
    * @memberOf math
    * @return {Array} Coordinates
    * @example
    * // Moving straight down
    * let p1 = keigai.util.math.bezier( 0, 10, 2000, 10, 0 ),
    *     p2 = keigai.util.math.bezier( 0, 10, 2000, 10, 0.5 ),
    *     p3 = keigai.util.math.bezier( 0, 10, 2000, 10, 0.75 ),
    *     p4 = keigai.util.math.bezier( 0, 10, 2000, 10, 0.9 ),
    *     p5 = keigai.util.math.bezier( 0, 10, 2000, 10, 1 );
    */
			bezier: function bezier() {
				for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
					args[_key10] = arguments[_key10];
				}

				var a = array.cast(args);
				var t = a.pop();
				var P = array.chunk(a, 2);
				var n = P.length;
				var c = undefined,
				    S0 = undefined,
				    Q0 = undefined,
				    Q1 = undefined,
				    Q2 = undefined,
				    C0 = undefined,
				    C1 = undefined,
				    C2 = undefined,
				    C3 = undefined;

				if (n < 2 || n > 4) {
					throw new Error(label.invalidArguments);
				}

				// Setting variables
				c = [];
				S0 = 1 - t;
				Q0 = math.sqr(S0);
				Q1 = 2 * S0 * t;
				Q2 = math.sqr(t);
				C0 = Math.pow(S0, 3);
				C1 = 3 * Q0 * t;
				C2 = 3 * S0 * Q2;
				C3 = Math.pow(t, 3);

				// Straight
				if (n === 2) {
					c.push(S0 * P[0][0] + t * P[1][0]);
					c.push(S0 * P[0][1] + t * P[1][1]);
				}
				// Quadratic
				else if (n === 3) {
					c.push(Q0 * P[0][0] + Q1 * P[1][0] + (Q2 + P[2][0]));
					c.push(Q0 * P[0][1] + Q1 * P[1][1] + (Q2 + P[2][1]));
				}
				// Cubic
				else if (n === 4) {
					c.push(C0 * P[0][0] + C1 * P[1][0] + C2 * P[2][0] + C3 * P[3][0]);
					c.push(C0 * P[0][1] + C1 * P[1][1] + C2 * P[2][1] + C3 * P[3][1]);
				}

				return c;
			},

			/**
    * Finds the distance between 2 Arrays of coordinates
    *
    * @method dist
    * @memberOf math
    * @param  {Array} a Coordinates [x, y]
    * @param  {Array} b Coordinates [x, y]
    * @return {Number}  Distance between `a` & `b`
    * @example
    * let dist = keigai.util.math.dist( [4, 40], [-10, 12] );
    */
			dist: function dist(a, b) {
				return Math.sqrt(math.sqr(b[0] - a[0]) + math.sqr(b[1] - a[1]));
			},

			/**
    * Squares a Number
    *
    * @method sqr
    * @memberOf math
    * @param  {Number} n Number to square
    * @return {Number}   Squared value
    * @example
    * let sqr = keigai.util.math.sqr( 23 );
    */
			sqr: function sqr(n) {
				return n * n;
			}
		};

		/**
   * @namespace number
   */
		var number = {
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
			diff: function diff(num1, num2) {
				return Math.abs(num1 - num2);
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
			even: function even(arg) {
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
			format: function format(arg) {
				var delimiter = arguments[1] === undefined ? "," : arguments[1];
				var every = arguments[2] === undefined ? 3 : arguments[2];

				arg = arg.toString();

				var d = arg.indexOf(".") > -1 ? "." + arg.replace(regex.number_format_1, "") : "";
				var a = arg.replace(regex.number_format_2, "").split("").reverse();
				var p = Math.floor(a.length / every);
				var i = 1;
				var b = -1;
				var n = undefined;

				while (++b < p) {
					n = i === 1 ? every : every * i + (i === 2 ? 1 : i - 1);
					a.splice(n, 0, delimiter);
					i++;
				}

				a = a.reverse().join("");

				if (a.charAt(0) === delimiter) {
					a = a.substring(1);
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
			half: function half(a, b) {
				return b ? a / b === 0.5 : a / 2;
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
			odd: function odd(arg) {
				return !number.even(arg);
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
			parse: function parse(arg, base) {
				return base === undefined ? parseFloat(arg) : parseInt(arg, base);
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
			random: function random() {
				var arg = arguments[0] === undefined ? 100 : arguments[0];

				return Math.floor(Math.random() * (arg + 1));
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
			round: function round(arg, direction) {
				arg = number.parse(arg);

				if (direction === undefined || string.isEmpty(direction)) {
					return number.parse(arg.toFixed(0));
				} else if (regex.down.test(direction)) {
					return ~ ~arg;
				} else {
					return Math.ceil(arg);
				}
			}
		};

		/**
   * @namespace promise
   */
		var promise = {
			/**
    * "Unboxed" Promise factory
    *
    * @method factory
    * @memberOf promise
    * @return {Object} {@link Promise}
    */
			factory: function factory() {
				var promise = undefined,
				    pCatch = undefined,
				    pResolve = undefined,
				    pReject = undefined,
				    pThen = undefined;

				promise = new Promise(function (resolve, reject) {
					pResolve = resolve;
					pReject = reject;
				});

				pCatch = function () {
					for (var _len11 = arguments.length, args = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
						args[_key11] = arguments[_key11];
					}

					return promise["catch"].apply(promise, args);
				};

				pThen = function () {
					for (var _len12 = arguments.length, args = Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
						args[_key12] = arguments[_key12];
					}

					return promise.then.apply(promise, args);
				};

				return { "catch": pCatch, resolve: pResolve, reject: pReject, then: pThen };
			}
		};

		var DataStore = (function (_Base5) {
			/**
    * Creates a new DataStore
    *
    * @constructor
    * @memberOf keigai
    * @extends {keigai.Base}
    * @example
    * let store = keigai.store();
    */

			function DataStore() {
				_classCallCheck(this, DataStore);

				_get(Object.getPrototypeOf(DataStore.prototype), "constructor", this).call(this);

				this.autosave = false;
				this.callback = null;
				this.credentials = null;
				this.lists = [];
				this.events = true;
				this.expires = null;
				this.headers = { Accept: "application/json" };
				this.ignore = [];
				this.index = [];
				this.indexes = { key: {} };
				this.key = null;
				this.loaded = false;
				this.mongodb = "";
				this.observer = observable();
				this.records = [];
				this.source = null;
				this.total = 0;
				this.versions = {};
				this.versioning = true;
				this.views = {};
				this.uri = null;
			}

			_inherits(DataStore, _Base5);

			_createClass(DataStore, [{
				key: "batch",

				/**
     * Batch sets or deletes data in the store
     *
     * @method batch
     * @memberOf keigai.DataStore
     * @param  {String}  type Type of action to perform ( set/del/delete )
     * @param  {Array}   data Array of keys or indices to delete, or Object containing multiple records to set
     * @param  {Boolean} sync [Optional] Syncs store with data, if true everything is erased
     * @return {Object} {@link keigai.Deferred}
     * @fires keigai.DataStore#beforeBatch Fires before the batch is queued
     * @fires keigai.DataStore#afterBatch Fires after the batch is queued
     * @fires keigai.DataStore#failedBatch Fires when an exception occurs
     * @example
     * store.batch( "set", [...] ).then( ( records ) => {
     *   ...
     * }, ( err ) => {
     *   ...
     * } );
     */
				value: function batch(type, data) {
					var _this18 = this;

					var sync = arguments[2] === undefined ? false : arguments[2];

					var self = this;
					var events = this.events;
					var defer = deferred();
					var deferreds = [];
					var patch = [];

					if (!regex.set_del.test(type) || sync && regex.del.test(type) || typeof data !== "object") {
						defer.reject(new Error(label.invalidArguments));
					} else {
						if (events) {
							this.dispatch("beforeBatch", data);
						}

						if (sync) {
							this.clear(sync);
						}

						if (data.length === 0) {
							this.loaded = true;

							if (events) {
								this.dispatch("afterBatch", this.records);
							}

							defer.resolve(this.records);
						} else {
							// Batch deletion will create a sparse array, which will be compacted before re-indexing
							if (type === "del") {
								array.each(data, function (i) {
									deferreds.push(_this18.del(i, false, true));
								});
							} else {
								array.each(data, function (i) {
									deferreds.push(_this18.set(i[_this18.key] || null, i, true));
								});
							}

							this.loaded = false;

							utility.when(deferreds).then(function (args) {
								_this18.loaded = true;

								if (events) {
									_this18.dispatch("afterBatch", args);
								}

								// Forcing a clear of views to deal with async nature of workers & staggered loading
								array.each(_this18.lists, function (i) {
									i.refresh(true);
								});

								if (type === "del") {
									_this18.records = array.compact(_this18.records);
									_this18.reindex();
								}

								if (_this18.autosave) {
									_this18.save();
								}

								defer.resolve(args);
							}, function (e) {
								if (events) {
									_this18.dispatch("failedBatch", e);
								}

								defer.reject(e);
							});
						}
					}

					return defer;
				}
			}, {
				key: "buildUri",

				/**
     * Builds a URI
     *
     * @method buildUri
     * @memberOf keigai.DataStore
     * @param  {String} key Record key
     * @return {String}     URI
     * @example
     * let uri = store.buildUri( "key" );
     */
				value: function buildUri(key) {
					var parsed = utility.parse(this.uri);

					return parsed.protocol + "//" + parsed.host + parsed.pathname.replace(regex.endslash, "") + "/" + key;
				}
			}, {
				key: "clear",

				/**
     * Clears the data object, unsets the uri property
     *
     * @method clear
     * @memberOf keigai.DataStore
     * @param  {Boolean} sync [Optional] Boolean to limit clearing of properties
     * @return {Object} {@link keigai.DataStore}
     * @fires keigai.DataStore#beforeClear Fires before the data is cleared
     * @fires keigai.DataStore#afterClear Fires after the data is cleared
     * @example
     * // Resyncing the records, if wired to an API
     * store.clear( true );
     *
     * // Resetting the store
     * store.clear();
     */
				value: function clear() {
					var sync = arguments[0] === undefined ? true : arguments[0];

					var events = this.events === true;
					var resave = this.autosave === true;

					if (!sync) {
						if (events) {
							this.dispatch("beforeClear");
						}

						array.each(this.lists, function (i) {
							if (i) {
								i.teardown(true);
							}
						});

						this.autosave = false;
						this.callback = null;
						this.credentials = null;
						this.lists = [];
						this.events = true;
						this.expires = null;
						this.headers = { Accept: "application/json" };
						this.ignore = [];
						this.index = [];
						this.indexes = { key: {} };
						this.key = null;
						this.loaded = false;
						this.records = [];
						this.source = null;
						this.total = 0;
						this.versions = {};
						this.versioning = true;
						this.views = {};
						this.uri = null;

						if (events) {
							this.dispatch("afterClear");
						}
					} else {
						this.indexes = { key: {} };
						this.loaded = false;
						this.records = [];
						this.total = 0;
						this.views = {};

						array.each(this.lists, function (i) {
							if (i) {
								i.refresh();
							}
						});
					}

					if (resave) {
						this.save();
					}

					return this;
				}
			}, {
				key: "del",

				/**
     * Deletes a record based on key or index
     *
     * @method del
     * @memberOf keigai.DataStore
     * @param  {Mixed}   record  Record, key or index
     * @param  {Boolean} reindex [Optional] `true` if DataStore should be reindexed
     * @param  {Boolean} batch   [Optional] `true` if part of a batch operation
     * @return {Object} {@link keigai.Deferred}
     * @fires keigai.DataStore#beforeDelete Fires before the record is deleted
     * @fires keigai.DataStore#afterDelete Fires after the record is deleted
     * @fires keigai.DataStore#failedDelete Fires if the store is RESTful and the action is denied
     * @example
     * store.del( "key" ).then( () => {
     *   console.log( "Successfully deleted " + key );
     * }, ( err ) => {
     *   console.warn( "Failed to delete " + key + ": " + err.message );
     * } );
     */
				value: function del(record) {
					var _this19 = this;

					var reindex = arguments[1] === undefined ? true : arguments[1];
					var batch = arguments[2] === undefined ? false : arguments[2];

					record = record.key ? record : this.get(record);

					var defer = deferred();

					if (record === undefined) {
						defer.reject(new Error(label.invalidArguments));
					} else {
						if (this.events) {
							this.dispatch("beforeDelete", record);
						}

						if (this.uri === null || this.callback !== null) {
							this.delComplete(record, reindex, batch, defer);
						} else {
							client.request(this.buildUri(record.key), "DELETE", null, utility.merge({ withCredentials: this.credentials }, this.headers)).then(function () {
								_this19.delComplete(record, reindex, batch, defer);
							}, function (e) {
								_this19.dispatch("failedDelete", e);
								defer.reject(e);
							});
						}
					}

					return defer;
				}
			}, {
				key: "delComplete",

				/**
     * Delete completion
     *
     * @method delComplete
     * @memberOf keigai.DataStore
     * @param  {Object}  record  DataStore record
     * @param  {Boolean} reindex `true` if DataStore should be reindexed
     * @param  {Boolean} batch   `true` if part of a batch operation
     * @param  {Object}  defer   Deferred instance
     * @return {Object} {@link keigai.DataStore}
     * @private
     */
				value: function delComplete(record, reindex, batch, defer) {
					var _this20 = this;

					delete this.indexes.key[record.key];
					delete this.versions[record.key];
					this.total--;
					this.views = {};

					if (!batch) {
						array.remove(this.records, record.index);

						if (reindex) {
							this.reindex();
						} else {
							array.each(record.indexes, function (i) {
								array.remove(_this20.indexes[i[0]][i[1]], record.index);

								if (_this20.indexes[i[0]][i[1]].length === 0) {
									delete _this20.indexes[i[0]][i[1]];
								}
							});
						}

						if (this.autosave) {
							this.purge(record.key);
						}

						if (this.events) {
							this.dispatch("afterDelete", record);
						}

						array.each(this.lists, function (i) {
							i.refresh();
						});
					} else {
						this.records[record.index] = null;
					}

					return defer !== undefined ? defer.resolve(record.key) : record.key;
				}
			}, {
				key: "dump",

				/**
     * Exports a subset or complete record set of DataStore
     *
     * @method dump
     * @memberOf keigai.DataStore
     * @param  {Array} args   [Optional] Sub-data set of DataStore
     * @param  {Array} fields [Optional] Fields to export, defaults to all
     * @return {Array}        Records
     * @example
     * let data = store.dump();
     */
				value: function dump(args, fields) {
					var _this21 = this;

					args = args || this.records;

					var custom = fields instanceof Array && fields.length > 0;
					var key = this.key !== null;
					var fn = undefined;

					if (custom) {
						fn = function (i) {
							var record = {};

							array.each(fields, function (f) {
								record[f] = f === _this21.key ? isNaN(i.key) ? i.key : Number(i.key) : utility.clone(i.data[f], true);
							});

							return record;
						};
					} else {
						fn = function (i) {
							var record = {};

							if (key) {
								record[_this21.key] = isNaN(i.key) ? i.key : Number(i.key);
							}

							utility.iterate(i.data, function (v, k) {
								record[k] = utility.clone(v, true);
							});

							return record;
						};
					}

					return args.map(fn);
				}
			}, {
				key: "get",

				/**
     * Retrieves the current version of a record(s) based on key or index
     *
     * If the key is an integer, cast to a string before sending as an argument!
     *
     * @method get
     * @memberOf keigai.DataStore
     * @param  {Mixed}  record Key, index or Array of pagination start & end; or comma delimited String of keys or indices
     * @param  {Number} offset [Optional] Offset from `record` for pagination
     * @return {Mixed}         Individual record, or Array of records
     * @example
     * let record = store.get( "key" );
     */
				value: function get(record, offset) {
					var _this22 = this;

					var type = typeof record;
					var result = undefined;

					if (type === "undefined") {
						result = this.records;
					} else if (type === "string") {
						if (record.indexOf(",") === -1) {
							result = this.records[this.indexes.key[record]];
						} else {
							result = string.explode(record).map(function (i) {
								if (!isNaN(i)) {
									return _this22.records[parseInt(i, 10)];
								} else {
									return _this22.records[_this22.indexes.key[i]];
								}
							});
						}
					} else if (type === "number") {
						if (isNaN(offset)) {
							result = this.records[parseInt(record, 10)];
						} else {
							result = array.limit(this.records, parseInt(record, 10), parseInt(offset, 10));
						}
					}

					return utility.clone(result, true);
				}
			}, {
				key: "join",

				/**
     * Performs an (INNER/LEFT/RIGHT) JOIN on two DataStores
     *
     * @method join
     * @memberOf keigai.DataStore
     * @param  {String} arg   DataStore to join
     * @param  {String} field Field in both DataStores
     * @param  {String} join  Type of JOIN to perform, defaults to `inner`
     * @return {Object} {@link keigai.Deferred}
     * let data = store.join( otherStore, "commonField" );
     */
				value: (function (_join) {
					function join(_x, _x2) {
						return _join.apply(this, arguments);
					}

					join.toString = function () {
						return _join.toString();
					};

					return join;
				})(function (arg, field) {
					var _this23 = this;

					var join = arguments[2] === undefined ? "inner" : arguments[2];

					var defer = deferred();
					var results = [];
					var deferreds = [];
					var key = field === this.key;
					var keys = array.merge(array.keys(this.records[0].data), array.keys(arg.records[0].data));
					var fn = undefined;

					if (join === "inner") {
						fn = function (i) {
							var where = {},
							    record = i.data,
							    defer = deferred();

							where[field] = key ? i.key : record[field];

							arg.select(where).then(function (match) {
								if (match.length > 2) {
									defer.reject(new Error(label.databaseMoreThanOne));
								} else if (match.length === 1) {
									results.push(utility.merge(record, match[0].data));
									defer.resolve(true);
								} else {
									defer.resolve(false);
								}
							});

							deferreds.push(defer);
						};
					} else if (join === "left") {
						fn = function (i) {
							var where = {},
							    record = i.data,
							    defer = deferred();

							where[field] = key ? i.key : record[field];

							arg.select(where).then(function (match) {
								if (match.length > 2) {
									defer.reject(new Error(label.databaseMoreThanOne));
								} else if (match.length === 1) {
									results.push(utility.merge(record, match[0].data));
									defer.resolve(true);
								} else {
									array.each(keys, function (i) {
										if (record[i] === undefined) {
											record[i] = null;
										}
									});

									results.push(record);
									defer.resolve(true);
								}
							});

							deferreds.push(defer);
						};
					} else if (join === "right") {
						fn = function (i) {
							var where = {},
							    record = i.data,
							    defer = deferred();

							where[field] = key ? i.key : record[field];

							_this23.select(where).then(function (match) {
								if (match.length > 2) {
									defer.reject(new Error(label.databaseMoreThanOne));
								} else if (match.length === 1) {
									results.push(utility.merge(record, match[0].data));
									defer.resolve(true);
								} else {
									array.each(keys, function (i) {
										if (record[i] === undefined) {
											record[i] = null;
										}
									});

									results.push(record);
									defer.resolve(true);
								}
							});

							deferreds.push(defer);
						};
					}

					array.each(utility.clone(join === "right" ? arg.records : this.records, true), fn);

					utility.when(deferreds).then(function () {
						defer.resolve(results);
					}, function (e) {
						defer.reject(e);
					});

					return defer;
				})
			}, {
				key: "only",

				/**
     * Retrieves only 1 field/property
     *
     * @method only
     * @memberOf keigai.DataStore
     * @param  {String} arg Field/property to retrieve
     * @return {Array}      Array of values
     * @example
     * let ages = store.only( "age" );
     */
				value: function only(arg) {
					if (arg === this.key) {
						return this.records.map(function (i) {
							return i.key;
						});
					} else {
						return this.records.map(function (i) {
							return i.data[arg];
						});
					}
				}
			}, {
				key: "purge",

				/**
     * Purges DataStore or record from persistant storage
     *
     * @method purge
     * @memberOf keigai.DataStore
     * @param  {Mixed} arg  [Optional] String or Number for record
     * @return {Object}     Record or store
     * @example
     * store.purge();
     */
				value: function purge(arg) {
					return this.storage(arg || this, "remove");
				}
			}, {
				key: "reindex",

				/**
     * Reindexes the DataStore
     *
     * @method reindex
     * @memberOf keigai.DataStore
     * @return {Object} {@link keigai.DataStore}
     * @example
     * store.reindex();
     */
				value: function reindex() {
					var _this24 = this;

					var i = -1;
					var tmp = [];

					this.views = {};
					this.indexes = { key: {} };

					if (this.total > 0) {
						array.each(this.records, function (record) {
							if (record !== undefined) {
								tmp[++i] = record;
								record.index = i;
								_this24.indexes.key[record.key] = i;
								_this24.setIndexes(record);
							}
						});
					}

					this.records = tmp;

					return this;
				}
			}, {
				key: "restore",

				/**
     * Restores DataStore or record persistant storage
     *
     * @method restore
     * @memberOf keigai.DataStore
     * @param  {Mixed} arg  [Optional] String or Number for record
     * @return {Object}     Record or store
     * @example
     * store.restore();
     */
				value: function restore(arg) {
					return this.storage(arg || this, "get");
				}
			}, {
				key: "save",

				/**
     * Saves DataStore or record to persistant storage, or sessionStorage
     *
     * @method save
     * @memberOf keigai.DataStore
     * @param  {Mixed} arg  [Optional] String or Number for record
     * @return {Object} {@link keigai.Deferred}
     * @example
     * store.save();
     */
				value: function save(arg) {
					return this.storage(arg || this, "set");
				}
			}, {
				key: "select",

				/**
     * Selects records (not by reference) based on an explicit description
     *
     * @method select
     * @memberOf keigai.DataStore
     * @param  {Object} where Object describing the WHERE clause
     * @return {Object} {@link keigai.Deferred}
     * @example
     * let adults;
     *
     * store.select( {age: function ( i ) { return i >= 21; } } ).then( function ( records ) {
     *   adults = records;
     * }, ( err ) => {
     *   adults = [];
     *   console.error( err.stack || err.message || err );
     * } );
     */
				value: function select(where) {
					var _this25 = this;

					var defer = deferred();
					var functions = [];
					var clauses = undefined,
					    cond = undefined,
					    index = undefined,
					    result = undefined,
					    sorted = undefined,
					    values = undefined,
					    worker = undefined;

					if (!(where instanceof Object)) {
						defer.reject(new Error(label.invalidArguments));
					} else {
						utility.iterate(where, function (v, k) {
							if (typeof v === "function") {
								_this25[k] = v.toString();
								functions.push(k);
							}
						});

						if (webWorker) {
							try {
								worker = utility.worker(defer);
								worker.postMessage({
									cmd: "select",
									indexes: this.indexes,
									records: this.records,
									where: json.encode(where),
									functions: functions
								});
							} catch (e) {
								// Probably IE10, which doesn't have the correct security flag for local loading
								webWorker = false;

								this.select(where).then(function (arg) {
									defer.resolve(arg);
								}, function (e) {
									defer.reject(e);
								});
							}
						} else {
							clauses = array.fromObject(where);
							sorted = array.flat(clauses).filter(function (i, idx) {
								return idx % 2 === 0;
							}).map(function (i) {
								return i.toString();
							}).sort(array.sort);
							index = sorted.join("|");
							values = sorted.map(function (i) {
								return where[i];
							}).join("|");
							cond = "return ( ";

							if (functions.length === 0 && this.indexes[index]) {
								result = (this.indexes[index][values] || []).map(function (i) {
									return _this25.records[i];
								});
							} else {
								if (clauses.length > 1) {
									array.each(clauses, function (i, idx) {
										var b1 = "( ";

										if (idx > 0) {
											b1 = " && ( ";
										}

										if (i[1] instanceof Function) {
											cond += b1 + i[1].toString() + "( rec.data[\"" + i[0] + "\"] ) )";
										} else if (!isNaN(i[1])) {
											cond += b1 + "rec.data[\"" + i[0] + "\"] === " + i[1] + " )";
										} else {
											cond += b1 + "rec.data[\"" + i[0] + "\"] === \"" + i[1] + "\" )";
										}
									});
								} else {
									if (clauses[0][1] instanceof Function) {
										cond += clauses[0][1].toString() + "( rec.data[\"" + clauses[0][0] + "\"] )";
									} else if (!isNaN(clauses[0][1])) {
										cond += "rec.data[\"" + clauses[0][0] + "\"] === " + clauses[0][1];
									} else {
										cond += "rec.data[\"" + clauses[0][0] + "\"] === \"" + clauses[0][1] + "\"";
									}
								}

								cond += " );";

								result = utility.clone(this.records, true).filter(new Function("rec", cond));
							}

							defer.resolve(result);
						}
					}

					return defer;
				}
			}, {
				key: "set",

				/**
     * Creates or updates an existing record
     *
     * @method set
     * @memberOf keigai.DataStore
     * @param  {Mixed}   key       [Optional] Integer or String to use as a Primary Key
     * @param  {Object}  data      Key:Value pairs to set as field values
     * @param  {Boolean} batch     [Optional] True if called by data.batch
     * @param  {Boolean} overwrite [Optional] Overwrites the existing record, if found
     * @return {Object} {@link keigai.Deferred}
     * @fires keigai.DataStore#beforeSet Fires before the record is set
     * @fires keigai.DataStore#afterSet Fires after the record is set, the record is the argument for listeners
     * @fires keigai.DataStore#failedSet Fires if the store is RESTful and the action is denied
     * @example
     * // Creating a new record
     * store.set( null, {...} );
     *
     * // Updating a record
     * store.set( "key", {...} );
     */
				value: function set(key, data) {
					var _this26 = this;

					var batch = arguments[2] === undefined ? false : arguments[2];
					var overwrite = arguments[3] === undefined ? false : arguments[3];

					data = utility.clone(data, true);

					var events = this.events;
					var defer = deferred();
					var record = key !== null ? this.get(key) || null : data[this.key] ? this.get(data[this.key]) || null : null;
					var method = "POST";
					var parsed = utility.parse(this.uri || "");
					var uri = undefined,
					    odata = undefined,
					    rdefer = undefined;

					var patch = function patch(overwrite, data, ogdata) {
						var ndata = [];

						if (overwrite) {
							array.each(array.keys(ogdata), function (k) {
								if (k !== _this26.key && data[k] === undefined) {
									ndata.push({ op: "remove", path: "/" + k });
								}
							});
						}

						utility.iterate(data, function (v, k) {
							if (k !== _this26.key && ogdata[k] === undefined) {
								ndata.push({ op: "add", path: "/" + k, value: v });
							} else if (json.encode(ogdata[k]) !== json.encode(v)) {
								ndata.push({ op: "replace", path: "/" + k, value: v });
							}
						});

						return ndata;
					};

					if (typeof data === "string") {
						if (data.indexOf("//") === -1) {
							// Relative path to store, i.e. a child
							if (data.charAt(0) !== "/") {
								uri = this.buildUri(data);
							}
							// Root path, relative to store, i.e. a domain
							else if (this.uri !== null && regex.root.test(data)) {
								uri = parsed.protocol + "//" + parsed.host + data;
							} else {
								uri = data;
							}
						} else {
							uri = data;
						}

						key = uri.replace(regex.not_endpoint, "");

						if (string.isEmpty(key)) {
							defer.reject(new Error(label.invalidArguments));
						} else {
							if (!batch && events) {
								this.dispatch("beforeSet", { key: key, data: data });
							}

							client.request(uri, "GET", null, utility.merge({ withCredentials: this.credentials }, this.headers)).then(function (arg) {
								_this26.setComplete(record, key, _this26.source ? utility.walk(arg, _this26.source) : arg, batch, overwrite, defer);
							}, function (e) {
								_this26.dispatch("failedSet", e);
								defer.reject(e);
							});
						}
					} else {
						if (!batch && events) {
							this.dispatch("beforeSet", { key: key, data: data });
						}

						if (batch || this.uri === null) {
							this.setComplete(record, key, data, batch, overwrite, defer);
						} else {
							if (key !== null) {
								uri = this.buildUri(key);
								method = "PATCH";
								odata = utility.clone(data, true);
								data = patch(overwrite, data, this.dump([record])[0]);
							} else {
								// Dropping query string
								uri = parsed.protocol + "//" + parsed.host + parsed.pathname;
							}

							rdefer = client.request(uri, method, data, utility.merge({ withCredentials: this.credentials }, this.headers));
							rdefer.then(function (arg) {
								var change = undefined;

								if (rdefer.xhr.status !== 204 && rdefer.xhr.status < 300) {
									change = key === null ? _this26.source ? utility.walk(arg, _this26.source) : arg : odata;
								} else {
									change = odata;
								}

								_this26.setComplete(record, key, change, batch, overwrite, defer);
							}, function (e) {
								if (method === "PATCH") {
									method = "PUT";
									data = utility.clone(odata, true);

									utility.iterate(record.data, function (v, k) {
										data[k] = v;
									});

									client.request(uri, method, data, utility.merge({ withCredentials: _this26.credentials }, _this26.headers)).then(function () {
										_this26.setComplete(record, key, odata, batch, overwrite, defer);
									}, function (e) {
										_this26.dispatch("failedSet", e);
										defer.reject(e);
									});
								} else {
									_this26.dispatch("failedSet", e);
									defer.reject(e);
								}
							});
						}
					}

					return defer;
				}
			}, {
				key: "setComplete",

				/**
     * Set completion
     *
     * @method setComplete
     * @memberOf keigai.DataStore
     * @param  {Mixed}   record    DataStore record, or `null` if new
     * @param  {String}  key       Record key
     * @param  {Object}  data      Record data
     * @param  {Boolean} batch     `true` if part of a batch operation
     * @param  {Boolean} overwrite Overwrites the existing record, if found
     * @param  {Object}  defer     Deferred instance
     * @return {Object} {@link keigai.DataStore}
     * @private
     */
				value: function setComplete(record, key, data, batch, overwrite, defer) {
					// Clearing views
					this.views = {};

					// Setting key
					if (key === null) {
						if (this.key !== null && data[this.key] !== undefined && data[this.key] !== null) {
							key = data[this.key].toString();
						} else {
							key = utility.uuid();
						}
					}

					// Removing primary key from data
					if (this.key) {
						delete data[this.key];
					}

					// Create
					if (record === null) {
						record = {
							index: this.total++,
							key: key,
							data: data,
							indexes: []
						};

						this.indexes.key[key] = record.index;
						this.records[record.index] = record;

						if (this.versioning) {
							this.versions[record.key] = lru.factory(VERSIONS);
							this.versions[record.key].nth = 0;
						}
					}
					// Update
					else {
						if (this.versioning) {
							if (this.versions[record.key] === undefined) {
								this.versions[record.key] = lru.factory(VERSIONS);
								this.versions[record.key].nth = 0;
							}

							this.versions[record.key].set("v" + ++this.versions[record.key].nth, this.dump([record])[0]);
						}

						// By reference
						record = this.records[record.index];

						if (overwrite) {
							record.data = {};
						}

						utility.iterate(data, function (v, k) {
							record.data[k] = v;
						});

						// Snapshot that's safe to hand out
						record = utility.clone(record, true);
					}

					this.setIndexes(record);

					if (!batch) {
						if (this.autosave) {
							this.save();
						}

						if (this.events) {
							this.dispatch("afterSet", record);
						}

						array.each(this.lists, function (i) {
							i.refresh();
						});
					}

					if (defer !== undefined) {
						defer.resolve(record);
					}

					return this;
				}
			}, {
				key: "setExpires",

				/**
     * Gets or sets an explicit expiration of data
     *
     * @method setExpires
     * @memberOf keigai.DataStore
     * @param  {Number} arg Milliseconds until data is stale
     * @return {Object} {@link keigai.DataStore}
     * @example
     * store.setExpires( 5 * 60 * 1000 ); // Resyncs every 5 minutes
     */
				value: function setExpires(arg) {
					var _this27 = this;

					var id = this.id + "Expire";
					var expires = arg;

					// Expiry cannot be less than a second, and must be a valid scenario for consumption; null will disable repetitive expiration
					if (arg !== null && this.uri === null || arg !== null && (isNaN(arg) || arg < 1000)) {
						throw new Error(label.invalidArguments);
					}

					if (this.expires === arg) {
						return;
					}

					this.expires = arg;

					utility.clearTimers(id);

					if (arg === null) {
						return;
					}

					utility.repeat(function () {
						if (_this27.uri === null) {
							_this27.setExpires(null);

							return false;
						}

						_this27.dispatch("beforeExpire");
						cache.expire(_this27.uri);
						_this27.dispatch("expire");
						_this27.dispatch("afterExpire");
					}, expires, id, false);
				}
			}, {
				key: "setIndexes",

				/**
     * Sets indexes for a record using `store.indexes`
     *
     * Composite indexes are supported, but require keys be in alphabetical order, e.g. "age|name"
     *
     * @method setIndexes
     * @memberOf keigai.DataStore
     * @param  {Object} arg DataStore Record
     * @return {Object} {@link keigai.DataStore}
     * @example
     * store.setIndexes( record );
     */
				value: function setIndexes(arg) {
					var _this28 = this;

					var delimter = "|";

					arg.indexes = [];

					array.each(this.index, function (i) {
						var keys = i.split(delimter);
						var values = "";

						if (_this28.indexes[i] === undefined) {
							_this28.indexes[i] = {};
						}

						array.each(keys, function (k, kdx) {
							values += (kdx > 0 ? delimter : "") + arg.data[k];
						});

						if (_this28.indexes[i][values] === undefined) {
							_this28.indexes[i][values] = [];
						}

						if (!array.contains(_this28.indexes[i][values], arg.index)) {
							_this28.indexes[i][values].push(arg.index);
							arg.indexes.push([i, values]);
						}
					});

					return this;
				}
			}, {
				key: "setUri",

				/**
     * Sets the RESTful API end point
     *
     * @method setUri
     * @memberOf keigai.DataStore
     * @param  {String} arg API collection end point
     * @return {Object}     Deferred
     * @example
     * store.setUri( "..." ).then( ( records ) => {
     *   ...
     * }, ( err ) => {
     *   ...
     * } );
     */
				value: function setUri(arg) {
					var _this29 = this;

					var defer = deferred();
					var parsed = undefined;

					if (arg !== null && string.isEmpty(arg)) {
						defer.reject(new Error(label.invalidArguments));
					}

					if (arg === null) {
						this.uri = arg;
					} else {
						parsed = utility.parse(arg);
						this.uri = parsed.protocol + "//" + parsed.host + parsed.path;

						if (!string.isEmpty(parsed.auth) && !this.headers.authorization && !this.headers.Authorization) {
							this.headers.Authorization = "Basic " + btoa(decodeURIComponent(parsed.auth));
						}

						this.on("expire", function () {
							_this29.sync();
						}, "resync");

						cache.expire(this.uri);

						this.sync().then(function (arg) {
							defer.resolve(arg);
						}, function (e) {
							defer.reject(e);
						});
					}

					return defer;
				}
			}, {
				key: "sort",

				/**
     * Creates, or returns a cached view of the records (not by reference)
     *
     * @method sort
     * @memberOf keigai.DataStore
     * @param  {String} query  SQL ( style ) order by
     * @param  {String} create [Optional, default behavior is true, value is false] Boolean determines whether to recreate a view if it exists
     * @param  {Object} where  [Optional] Object describing the WHERE clause
     * @return {Object} {@link keigai.Deferred}
     * @example
     * store.sort( "age desc, name" ).then( ( records ) => {
     *   ...
     * }, ( err ) => {
     *   ...
     * } );
     */
				value: function sort(query, create, where) {
					var _this30 = this;

					create = create === true || where instanceof Object;

					var view = string.toCamelCase(string.explode(query).join(" "));
					var defer = deferred();

					// Next phase
					var next = function next(records) {
						var worker = undefined;

						if (_this30.total === 0) {
							defer.resolve([]);
						} else if (!create && _this30.views[view]) {
							defer.resolve(_this30.views[view]);
						} else if (webWorker) {
							defer.then(function (arg) {
								_this30.views[view] = arg;

								return _this30.views[view];
							}, function (e) {
								utility.error(e);
							});

							try {
								worker = utility.worker(defer);
								worker.postMessage({ cmd: "sort", indexes: _this30.indexes, records: records, query: query });
							} catch (e) {
								// Probably IE10, which doesn't have the correct security flag for local loading
								webWorker = false;

								_this30.views[view] = array.keySort(records, query, "data");
								defer.resolve(_this30.views[view]);
							}
						} else {
							_this30.views[view] = array.keySort(records, query, "data");
							defer.resolve(_this30.views[view]);
						}
					};

					if (!where) {
						next(utility.clone(this.records, true));
					} else {
						this.select(where).then(next, function (e) {
							defer.reject(e);
						});
					}

					return defer;
				}
			}, {
				key: "storage",

				/**
     * Storage interface
     *
     * SQL/NoSQL backends will be used if configured in lieu of localStorage (node.js only)
     *
     * @method storage
     * @memberOf keigai.DataStore
     * @param  {Mixed}  obj  Record ( Object, key or index ) or store
     * @param  {Object} op   Operation to perform ( get, remove or set )
     * @param  {String} type [Optional] Type of Storage to use ( local, session [local] )
     * @return {Object} {@link keigai.Deferred}
     * @example
     * store.storage( store, "set" );
     */
				value: function storage(obj, op, type) {
					var _this31 = this;

					var self = this;
					var record = false;
					var mongo = !string.isEmpty(this.mongodb);
					var session = type === "session" && typeof sessionStorage !== "undefined";
					var defer = deferred();
					var data = undefined,
					    key = undefined,
					    result = undefined;

					if (!regex.number_string_object.test(typeof obj) || !regex.get_remove_set.test(op)) {
						defer.reject(new Error(label.invalidArguments));
					} else {
						record = regex.number_string.test(typeof obj) || obj.hasOwnProperty("data");

						if (op !== "remove") {
							if (record && !(obj instanceof Object)) {
								obj = this.get(obj);
							}

							key = record ? obj.key : obj.id;
						} else if (op === "remove" && record) {
							key = obj.key || obj;
						}

						if (mongo) {
							mongodb.connect(this.mongodb, function (e, db) {
								if (e) {
									if (db) {
										db.close();
									}

									return defer.reject(e);
								}

								db.collection(_this31.id, function (e, collection) {
									if (e) {
										db.close();
										return defer.reject(e);
									}

									if (op === "get") {
										if (record) {
											collection.find({ _id: obj.key }).limit(1).toArray(function (e, recs) {
												db.close();

												if (e) {
													defer.reject(e);
												} else if (recs.length === 0) {
													defer.resolve(null);
												} else {
													delete recs[0]._id;

													_this31.set(key, recs[0], true).then(function (rec) {
														defer.resolve(rec);
													}, function (e) {
														defer.reject(e);
													});
												}
											});
										} else {
											collection.find({}).toArray(function (e, recs) {
												var i = undefined,
												    nth = undefined;

												if (e) {
													db.close();
													return defer.reject(e);
												}

												i = -1;
												nth = recs.length;

												if (nth > 0) {
													_this31.records = recs.map(function (r) {
														var rec = { key: r._id, index: ++i, data: {} };

														_this31.indexes.key[rec.key] = rec.index;
														rec.data = r;
														delete rec.data._id;
														_this31.setIndexes(rec);

														return rec;
													});

													_this31.total = nth;
												}

												db.close();
												defer.resolve(_this31.records);
											});
										}
									} else if (op === "remove") {
										collection.remove(record ? { _id: key } : {}, { safe: true }, function (e, arg) {
											db.close();

											if (e) {
												defer.reject(e);
											} else {
												defer.resolve(arg);
											}
										});
									} else if (op === "set") {
										if (record) {
											collection.update({ _id: obj.key }, obj.data, {
												w: 1,
												safe: true,
												upsert: true
											}, function (e, arg) {
												db.close();

												if (e) {
													defer.reject(e);
												} else {
													defer.resolve(arg);
												}
											});
										} else {
											// Removing all documents & re-inserting
											collection.remove({}, { w: 1, safe: true }, function (e) {
												var deferreds = undefined;

												if (e) {
													db.close();
													return defer.reject(e);
												} else {
													deferreds = [];

													array.each(_this31.records, function (i) {
														var data = {};
														var defer2 = deferred();

														deferreds.push(defer2);

														utility.iterate(i.data, function (v, k) {
															data[k] = v;
														});

														collection.update({ _id: i.key }, data, {
															w: 1,
															safe: true,
															upsert: true
														}, function (e, arg) {
															if (e) {
																defer2.reject(e);
															} else {
																defer2.resolve(arg);
															}
														});
													});

													utility.when(deferreds).then(function (result) {
														db.close();
														defer.resolve(result);
													}, function (e) {
														db.close();
														defer.reject(e);
													});
												}
											});
										}
									} else {
										db.close();
										defer.reject(null);
									}
								});
							});
						} else {
							if (op === "get") {
								result = session ? sessionStorage.getItem(key) : localStorage.getItem(key);

								if (result !== null) {
									result = json.decode(result);

									if (record) {
										this.set(key, result, true).then(function (rec) {
											defer.resolve(rec);
										}, function (e) {
											defer.reject(e);
										});
									} else {
										utility.merge(self, result);
										defer.resolve(self);
									}
								} else {
									defer.resolve(self);
								}

								// Decorating loaded state for various code paths
								defer.then(function () {
									_this31.loaded = true;
								}, function (e) {
									throw e;
								});
							} else if (op === "remove") {
								session ? sessionStorage.removeItem(key) : localStorage.removeItem(key);
								defer.resolve(this);
							} else if (op === "set") {
								data = json.encode(record ? obj.data : {
									total: this.total,
									index: this.index,
									indexes: this.indexes,
									records: this.records
								});
								session ? sessionStorage.setItem(key, data) : localStorage.setItem(key, data);
								defer.resolve(this);
							} else {
								defer.reject(null);
							}
						}
					}

					return defer;
				}
			}, {
				key: "sync",

				/**
     * Syncs the DataStore with a URI representation
     *
     * @method sync
     * @memberOf keigai.DataStore
     * @return {Object} {@link keigai.Deferred}
     * @fires keigai.DataStore#beforeSync Fires before syncing the DataStore
     * @fires keigai.DataStore#afterSync Fires after syncing the DataStore
     * @fires keigai.DataStore#failedSync Fires when an exception occurs
     * @example
     * store.sync().then( ( records ) => {
     *   ...
     * }, ( err ) => {
     *   ...
     * } );
     */
				value: function sync() {
					var _this32 = this;

					var events = this.events === true;
					var defer = deferred();

					/**
      * Resolves public deferred
      *
      * @method success
      * @memberOf keigai.DataStore.sync
      * @private
      * @param  {Object} arg API response
      * @return {Undefined}  undefined
      */
					var success = function success(arg) {
						var data = undefined;

						if (typeof arg !== "object") {
							return failure(new Error(label.expectedObject));
						}

						if (_this32.source !== null) {
							arg = utility.walk(arg, _this32.source);
						}

						if (arg instanceof Array) {
							data = arg;
						} else {
							data = [arg];
						}

						_this32.batch("set", data, true).then(function (arg) {
							if (events) {
								_this32.dispatch("afterSync", arg);
							}

							defer.resolve(arg);
						}, failure);
					};

					/**
      * Rejects public deferred
      *
      * @method failure
      * @memberOf keigai.DataStore.sync
      * @private
      * @param  {Object} e Error instance
      * @return {Undefined} undefined
      */
					var failure = function failure(e) {
						if (events) {
							_this32.dispatch("failedSync", e);
						}

						defer.reject(e);
					};

					if (this.uri === null || string.isEmpty(this.uri)) {
						defer.reject(new Error(label.invalidArguments));
					} else {
						if (events) {
							this.dispatch("beforeSync", this.uri);
						}

						if (this.callback !== null) {
							client.jsonp(this.uri, { callback: this.callback }).then(success, failure);
						} else {
							client.request(this.uri, "GET", null, utility.merge({ withCredentials: this.credentials }, this.headers)).then(success, failure);
						}
					}

					return defer;
				}
			}, {
				key: "teardown",

				/**
     * Tears down a store & expires all records associated to an API
     *
     * @method teardown
     * @memberOf keigai.DataStore
     * @return {Object} {@link keigai.DataStore}
     * @example
     * store.teardown();
     */
				value: function teardown() {
					var uri = this.uri;
					var id = undefined;

					if (uri !== null) {
						cache.expire(uri, true);

						id = this.id + "DataExpire";
						utility.clearTimers(id);

						array.each(this.records, function (i) {
							var recordUri = uri + "/" + i.key;

							cache.expire(recordUri, true);
						});
					}

					array.each(this.lists, function (i) {
						i.teardown(true);
					});

					this.clear(true);
					this.dispatch("afterTeardown");

					return this;
				}
			}, {
				key: "undo",

				/**
     * Undoes the last modification to a record, if it exists
     *
     * @method undo
     * @memberOf keigai.DataStore
     * @param  {Mixed}  key     Key or index
     * @param  {String} version [Optional] Version to restore
     * @return {Object}         Deferred
     * @example
     * // Didn't like the new version, so undo the change
     * store.undo( "key", "v1" );
     */
				value: function undo(key, version) {
					var record = this.get(key);
					var defer = deferred();
					var versions = this.versions[record.key];
					var previous = undefined;

					if (record === undefined) {
						defer.reject(new Error(label.invalidArguments));
					} else {
						if (versions) {
							previous = versions.get(version || versions.first);

							if (previous === undefined) {
								defer.reject(label.datastoreNoPrevVersion);
							} else {
								this.set(key, previous).then(function (arg) {
									defer.resolve(arg);
								}, function (e) {
									defer.reject(e);
								});
							}
						} else {
							defer.reject(label.datastoreNoPrevVersion);
						}
					}

					return defer;
				}
			}, {
				key: "unique",

				/**
     * Returns Array of unique values of `key`
     *
     * @method unique
     * @memberOf keigai.DataStore
     * @param  {String} key Field to compare
     * @return {Array}      Array of values
     * @example
     * let ages = store.unique( "age" );
     */
				value: function unique(key) {
					return array.unique(this.records.map(function (i) {
						return i.data[key];
					}));
				}
			}, {
				key: "update",

				/**
     * Applies a difference to a record
     *
     * Use `data.set()` if `data` is the complete field set
     *
     * @method update
     * @memberOf keigai.DataStore
     * @param  {Mixed}  key  Key or index
     * @param  {Object} data Key:Value pairs to set as field values
     * @return {Object} {@link keigai.Deferred}
     * @example
     * store.update( "key", {age: 34} );
     */
				value: function update(key, data) {
					var record = this.get(key);
					var defer = deferred();

					if (record === undefined) {
						defer.reject(new Error(label.invalidArguments));
					} else {
						this.set(key, utility.merge(record.data, data)).then(function (arg) {
							defer.resolve(arg);
						}, function (e) {
							defer.reject(e);
						});
					}

					return defer;
				}
			}]);

			return DataStore;
		})(Base);

		/**
   * @namespace store
   */
		var store = {
			/**
    * Decorates a DataStore on an Object
    *
    * @method factory
    * @memberOf store
    * @param  {Mixed}  recs [Optional] Data to set with this.batch
    * @param  {Object} args [Optional] Arguments to set on the store
    * @return {Object} {@link keigai.DataStore}
    * @example
    * let store = keigai.store(null, {key: "guid"});
    *
    * store.setUri( "http://..." ).then( ( records ) => {
    *   // Do something with the records
    * }, ( e ) => {
    *   // Handle `e`
    * } );
    */
			factory: function factory(recs, args) {
				var obj = new DataStore();

				if (args instanceof Object) {
					utility.merge(obj, args);
				}

				if (recs !== null && typeof recs === "object") {
					obj.batch("set", recs);
				}

				return obj;
			},

			/**
    * DataStore worker handler
    *
    * @method worker
    * @memberOf store
    * @param  {Object} ev Event
    * @return {Undefined} undefined
    * @private
    */
			worker: function worker(ev) {
				var cmd = ev.data.cmd;
				var records = ev.data.records;
				var clauses = undefined,
				    cond = undefined,
				    functions = undefined,
				    indexes = undefined,
				    index = undefined,
				    result = undefined,
				    sorted = undefined,
				    where = undefined,
				    values = undefined;

				if (cmd === "select") {
					where = JSON.parse(ev.data.where);
					functions = ev.data.functions;
					clauses = array.fromObject(where);
					sorted = array.flat(clauses).filter(function (i, idx) {
						return idx % 2 === 0;
					}).sort(array.sort);
					index = sorted.join("|");
					values = sorted.map(function (i) {
						return where[i];
					}).join("|");
					indexes = ev.data.indexes;
					cond = "return ( ";

					if (functions.length === 0 && indexes[index]) {
						result = (indexes[index][values] || []).map(function (i) {
							return records[i];
						});
					} else {
						if (clauses.length > 1) {
							array.each(clauses, function (i, idx) {
								var b1 = "( ";

								if (idx > 0) {
									b1 = " && ( ";
								}

								if (array.contains(functions, i[0])) {
									cond += b1 + i[1] + "( rec.data[\"" + i[0] + "\"] ) )";
								} else if (!isNaN(i[1])) {
									cond += b1 + "rec.data[\"" + i[0] + "\"] === " + i[1] + " )";
								} else {
									cond += b1 + "rec.data[\"" + i[0] + "\"] === \"" + i[1] + "\" )";
								}
							});
						} else {
							if (array.contains(functions, clauses[0][0])) {
								cond += clauses[0][1] + "( rec.data[\"" + clauses[0][0] + "\"] )";
							} else if (!isNaN(clauses[0][1])) {
								cond += "rec.data[\"" + clauses[0][0] + "\"] === " + clauses[0][1];
							} else {
								cond += "rec.data[\"" + clauses[0][0] + "\"] === \"" + clauses[0][1] + "\"";
							}
						}

						cond += " );";

						result = records.filter(new Function("rec", cond));
					}
				} else if (cmd === "sort") {
					result = array.keySort(records, ev.data.query, "data");
				}

				postMessage(result);
			}
		};

		/**
   * @namespace string
   */
		var string = {
			/**
    * Capitalizes the String
    *
    * @method capitalize
    * @memberOf string
    * @param  {String}  obj String to capitalize
    * @param  {Boolean} all [Optional] Capitalize each word
    * @return {String}      Capitalized String
    * @example
    * keigai.util.string.capitalize( "hello" ); // "Hello"
    */
			capitalize: function capitalize(obj) {
				var all = arguments[1] === undefined ? false : arguments[1];

				var result = undefined;

				if (all) {
					result = string.explode(obj, " ").map(function (i) {
						return i.charAt(0).toUpperCase() + i.slice(1);
					}).join(" ");
				} else {
					result = obj.charAt(0).toUpperCase() + obj.slice(1);
				}

				return result;
			},

			/**
    * Escapes meta characters within a string
    *
    * @method escape
    * @memberOf string
    * @param  {String} obj String to escape
    * @return {String}     Escaped string
    * @example
    * keigai.util.string.escape( "{hello}" ); // "\{hello\}"
    */
			escape: function escape(obj) {
				return obj.replace(/[\-\[\]{}()*+?.,\\\/\^\$|#\s]/g, "\\$&");
			},

			/**
    * Splits a string on comma, or a parameter, and trims each value in the resulting Array
    *
    * @method explode
    * @memberOf string
    * @param  {String} obj String to capitalize
    * @param  {String} arg String to split on
    * @return {Array}      Array of the exploded String
    * @example
    * keigai.util.array.each( keigai.util.string.explode( "abc, def" ), ( i ) => {
    *   ...
    * } );
    */
			explode: function explode(obj) {
				var arg = arguments[1] === undefined ? "," : arguments[1];

				return string.trim(obj).split(new RegExp("\\s*" + arg + "\\s*"));
			},

			/**
    * Creates a String representation of an Object, preserving Functions
    *
    * Nested Objects are not supported
    *
    * @method fromObject
    * @memberOf string
    * @param  {Object} obj  Object to convert
    * @param  {String} name [Optional] Name of Object
    * @return {String}      String representation
    * @example
    * keigai.util.string.fromObject( {a: true, b: false}, "stats" ); // "stats = {'a': true,'b':false}"
    */
			fromObject: function fromObject(obj, name) {
				var result = (name ? name + " = {" : "{") + "\n";

				utility.iterate(obj, function (v, k) {
					result += "\"" + k + "\":" + v.toString() + ",\n";
				});

				result = result.replace(/\[object Object\]/g, "{}").replace(/,\n$/, "\n") + "}";

				return result;
			},

			/**
    * Replaces all spaces in a string with dashes
    *
    * @method hyphenate
    * @memberOf string
    * @param  {String} obj   String to hyphenate
    * @param {Boolean} camel [Optional] Hyphenate camelCase
    * @return {String}       String with dashes instead of spaces
    * @example
    * keigai.util.string.hyphenate( "hello world" ); // "hello-world"
    */
			hyphenate: function hyphenate(obj) {
				var camel = arguments[1] === undefined ? false : arguments[1];

				var result = string.trim(obj).replace(/\s+/g, "-");

				if (camel === true) {
					result = result.replace(/([A-Z])/g, "-$1").toLowerCase();
				}

				return result;
			},

			/**
    * Tests if a string is a boolean
    *
    * @method isBoolean
    * @memberOf string
    * @param  {String}  obj String to test
    * @return {Boolean}     Result of test
    * @example
    * if ( keigai.util.string.isBoolean( ... ) {
    *   ...
    * } );
    */
			isBoolean: function isBoolean(obj) {
				return regex.bool.test(obj);
			},

			/**
    * Tests if a string is empty
    *
    * @method isEmpty
    * @memberOf string
    * @param  {String}  obj String to test
    * @return {Boolean}     Result of test
    * @example
    * if ( !keigai.util.string.isEmpty( ... ) {
    *   ...
    * } );
    */
			isEmpty: function isEmpty(obj) {
				return string.trim(obj) === "";
			},

			/**
    * Tests if a string is a number
    *
    * @method isNumber
    * @memberOf string
    * @param  {String}  obj String to test
    * @return {Boolean}     Result of test
    * @example
    * if ( keigai.util.string.isNumber( ... ) {
    *   ...
    * } );
    */
			isNumber: function isNumber(obj) {
				return regex.number.test(obj);
			},

			/**
    * Tests if a string is a URL
    *
    * @method isUrl
    * @memberOf string
    * @param  {String}  obj String to test
    * @return {Boolean}     Result of test
    * @example
    * if ( keigai.util.string.isUrl( ... ) {
    *   ...
    * } );
    */
			isUrl: function isUrl(obj) {
				return regex.url.test(obj);
			},

			/**
    * Transforms the case of a String into CamelCase
    *
    * @method toCamelCase
    * @memberOf string
    * @param  {String} obj String to capitalize
    * @return {String}     Camel case String
    * @example
    * keigai.util.string.toCamelCase( "hello world" ); // "helloWorld"
    */
			toCamelCase: function toCamelCase(obj) {
				var s = string.trim(obj).replace(/\.|_|-|\@|\[|\]|\(|\)|\#|\$|\%|\^|\&|\*|\s+/g, " ").toLowerCase().split(regex.space_hyphen);
				var r = [];

				array.each(s, function (i, idx) {
					r.push(idx === 0 ? i : string.capitalize(i));
				});

				return r.join("");
			},

			/**
    * Returns singular form of the string
    *
    * @method singular
    * @memberOf string
    * @param  {String} obj String to transform
    * @return {String}     Transformed string
    * @example
    * keigai.util.string.singular( "cans" ); // "can"
    */
			singular: function singular(obj) {
				return obj.replace(/oe?s$/, "o").replace(/ies$/, "y").replace(/ses$/, "se").replace(/s$/, "");
			},

			/**
    * Casts a String to a Function
    *
    * @method toFunction
    * @memberOf string
    * @param  {String} obj String to cast
    * @return {Function}   Function
    * @example
    * let fn = someFunction.toString();
    *
    * ...
    *
    * let func = keigai.util.string.toFunction( fn );
    */
			toFunction: function toFunction(obj) {
				var args = string.trim(obj.replace(/^.*\(/, "").replace(/[\t|\r|\n|\"|\']+/g, "").replace(/\).*/, ""));
				var body = string.trim(obj.replace(/^.*\{/, "").replace(/\}$/, ""));

				return Function.apply(Function, string.explode(args).concat([body]));
			},

			/**
    * Trims the whitespace around a String
    *
    * @method trim
    * @memberOf string
    * @param  {String} obj String to capitalize
    * @return {String}     Trimmed String
    * @example
    * keigai.util.string.trim( "  hello world " ); // "hello world"
    */
			trim: function trim(obj) {
				return obj.replace(/^(\s+|\t+|\n+)|(\s+|\t+|\n+)$/g, "");
			},

			/**
    * Uncamelcases the String
    *
    * @method unCamelCase
    * @memberOf string
    * @param  {String} obj String to uncamelcase
    * @return {String}     Uncamelcased String
    */
			unCamelCase: function unCamelCase(obj) {
				return string.trim(obj.replace(/([A-Z])/g, " $1").toLowerCase());
			},

			/**
    * Uncapitalizes the String
    *
    * @method uncapitalize
    * @memberOf string
    * @param  {String} obj String to uncapitalize
    * @return {String}     Uncapitalized String
    * @example
    * keigai.util.string.uncapitalize( "Hello" ); // "hello"
    */
			uncapitalize: function uncapitalize(obj) {
				var result = string.trim(obj);

				return result.charAt(0).toLowerCase() + result.slice(1);
			},

			/**
    * Replaces all hyphens with spaces
    *
    * @method unhyphenate
    * @memberOf string
    * @param  {String}  obj  String to unhypenate
    * @param  {Boolean} caps [Optional] True to capitalize each word
    * @return {String}       Unhyphenated String
    * @example
    * keigai.util.string.unhyphenate( "hello-world" );       // "hello world"
    * keigai.util.string.unhyphenate( "hello-world", true ); // "Hello World"
    */
			unhyphenate: function unhyphenate(obj) {
				var caps = arguments[1] === undefined ? false : arguments[1];

				if (caps !== true) {
					return string.explode(obj, "-").join(" ");
				} else {
					return string.explode(obj, "-").map(function (i) {
						return string.capitalize(i);
					}).join(" ");
				}
			}
		};

		/**
   * @namespace utility
   */
		var utility = {
			/**
    * Collection of timers
    *
    * @memberOf utility
    * @type {Object}
    * @private
    */
			timer: {},

			/**
    * Creates Elements or Queries the DOM using CSS selectors
    *
    * @method $
    * @memberOf utility
    * @param  {Mixed} arg HTML, or Comma delimited string of CSS selectors
    * @return {Array}     Array of matching Elements
    * @example
    * let $ = keigai.util.$;
    *
    * // Looking for Elements
    * $( ".someClass" ).forEach( function ( i ) {
    *   ...
    * } );
    *
    * // Creating an H1 Element
    * $( "&lt;h1&gt;" ).forEach( function ( i ) {
    *   ...
    * } );
    */
			$: function $(arg) {
				var result = undefined;

				// Nothing
				if (!arg) {}
				// HTML
				else if (regex.html.test(arg)) {
					result = [element.create(arg)];
				}
				// CSS selector(s)
				else {
					arg = string.trim(arg);

					if (arg.indexOf(",") === -1) {
						result = utility.dom(arg);

						if (result) {
							if (isNaN(result.length)) {
								result = [result];
							}
						} else {
							result = [];
						}
					} else {
						result = [];

						array.each(string.explode(arg), function (query) {
							var obj = utility.dom(query);

							if (obj instanceof Array) {
								result = result.concat(obj);
							} else if (obj) {
								result.push(obj);
							}
						});
					}
				}

				return result;
			},

			/**
    * Writes the banner to the console
    *
    * @method banner
    * @memberOf utility
    * @return {Undefined} undefined
    * @example
    * keigai.util.banner();
    */
			banner: function banner() {
				console.log([" __          .__             .__   ____     ________      ____   _____  ", "|  | __ ____ |__| _________  |__| /_   |    \\_____  \\    /_   | /  |  | ", "|  |/ // __ \\|  |/ ___\\__  \\ |  |  |   |      _(__  <     |   |/   |  |_", "|    <\\  ___/|  / /_/  > __ \\|  |  |   |     /       \\    |   /    ^   /", "|__|_ \\\\___  >__\\___  (____  /__|  |___| /\\ /______  / /\\ |___\\____   | ", "     \\/    \\/  /_____/     \\/            \\/        \\/  \\/          |__| "].join("\n"));
			},

			/**
    * Creates an instance of Base
    *
    * @method base
    * @memberOf utility
    * @param  {Object} arg [Optional] Decorative Object
    * @return {Object}     Instance of Base
    */
			base: function base(arg) {
				var obj = new Base();

				if (arg instanceof Object) {
					utility.merge(obj, arg);
				}

				obj.observer = observable();

				return obj;
			},

			/**
    * Blob factory
    *
    * @method blob
    * @memberOf utility
    * @param  {String} arg String to convert to a Blob
    * @return {Object}     Blob
    * @private
    */
			blob: function blob(arg) {
				var obj = undefined;

				try {
					obj = new Blob([arg], { type: "application/javascript" });
				} catch (e) {
					if (!global.BlobBuilder) {
						global.BlobBuilder = global.MSBlobBuilder || global.WebKitBlobBuilder || global.MozBlobBuilder;
					}

					obj = new global.BlobBuilder().append(arg).getBlob();
				}

				return obj;
			},

			/**
    * Clears deferred & repeating functions
    *
    * @method clearTimers
    * @memberOf utility
    * @param  {String} id ID of timer( s )
    * @return {Undefined} undefined
    * @example
    * keigai.util.clearTimers( 'helloWorld' );
    */
			clearTimers: function clearTimers(id) {
				if (utility.timer[id]) {
					clearTimeout(utility.timer[id]);
					delete utility.timer[id];
				}
			},

			/**
    * Clones an Object
    *
    * @method clone
    * @memberOf utility
    * @param  {Object}  obj     Object to clone
    * @param  {Boolean} shallow [Optional] Create a shallow clone, which doesn't maintain prototypes, default is `false`
    * @return {Object}          Clone of obj
    * @example
    * let x = {a: true, b: false},
    *     y = keigai.util.clone( x, true );
    *
    * y.a; // true
    */
			clone: function clone(obj) {
				var shallow = arguments[1] === undefined ? false : arguments[1];

				var clone = undefined,
				    result = undefined;

				if (shallow === true) {
					return obj !== undefined && obj !== null ? JSON.parse(JSON.stringify(obj)) : obj;
				} else if (!obj || regex.primitive.test(typeof obj) || obj instanceof RegExp) {
					return obj;
				} else if (obj instanceof Array) {
					result = [];

					array.each(obj, function (i, idx) {
						result[idx] = utility.clone(i);
					});

					return result;
				} else if (!server && !client.ie && obj instanceof Document) {
					return xml.decode(xml.encode(obj));
				} else if (typeof obj.__proto__ !== "undefined") {
					return utility.extend(obj.__proto__, obj);
				} else if (obj instanceof Object) {
					// If JSON encoding fails due to recursion, the original Object is returned because it's assumed this is for decoration
					clone = json.encode(obj, true);

					if (clone !== undefined) {
						clone = json.decode(clone);

						// Decorating Functions that would be lost with JSON encoding/decoding
						utility.iterate(obj, function (v, k) {
							if (typeof v === "function") {
								clone[k] = v;
							}
						});
					} else {
						clone = obj;
					}

					return clone;
				} else {
					return obj;
				}
			},

			/**
    * Coerces a String to a Type
    *
    * @method coerce
    * @memberOf utility
    * @param  {String} value String to coerce
    * @return {Mixed}        Primitive version of the String
    * @example
    * keigai.util.coerce( "1" ); // 1
    */
			coerce: function coerce(value) {
				var tmp = undefined;

				if (value === null || value === undefined) {
					return undefined;
				} else if (value === "true") {
					return true;
				} else if (value === "false") {
					return false;
				} else if (value === "null") {
					return null;
				} else if (value === "undefined") {
					return undefined;
				} else if (value === "") {
					return value;
				} else if (!isNaN(tmp = Number(value))) {
					return tmp;
				} else if (regex.json_wrap.test(value)) {
					return json.decode(value, true) || value;
				} else {
					return value;
				}
			},

			/**
    * Recompiles a RegExp by reference
    *
    * This is ideal when you need to recompile a regex for use within a conditional statement
    *
    * @method compile
    * @memberOf utility
    * @param  {Object} regex     RegExp
    * @param  {String} pattern   Regular expression pattern
    * @param  {String} modifiers Modifiers to apply to the pattern
    * @return {Boolean}          true
    * @private
    */
			compile: function compile(reg, pattern, modifiers) {
				reg.compile(pattern, modifiers);

				return true;
			},

			/**
    * Curries a Function
    *
    * Note: Function to curry must return a Function
    *
    * @method curry
    * @memberOf utility
    * @return {Function} Curried Function
    * @example
    * function f ( a, b ) {
    *   return function ( n ) {
    *     return ( a + b ) * n;
    *   };
    * }
    *
    * let g = keigai.util.curry( f, 2, 8 );
    *
    * g( 5 ); // 50
    */
			curry: function curry(fn) {
				for (var _len13 = arguments.length, x = Array(_len13 > 1 ? _len13 - 1 : 0), _key13 = 1; _key13 < _len13; _key13++) {
					x[_key13 - 1] = arguments[_key13];
				}

				var cfn = fn.apply(fn, x);

				return function () {
					for (var _len14 = arguments.length, y = Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {
						y[_key14] = arguments[_key14];
					}

					return cfn.apply(cfn, y);
				};
			},

			/**
    * Defers the execution of Function by at least the supplied milliseconds.
    * Timing may vary under "heavy load" relative to the CPU & client JavaScript engine.
    *
    * @method defer
    * @memberOf utility
    * @param  {Function} fn Function to defer execution of
    * @param  {Number}   ms Milliseconds to defer execution
    * @param  {Number}   id [Optional] ID of the deferred function
    * @return {String}      ID of the timer
    * @example
    * keigai.util.defer( () => {
    *   console.log( 'hello world' );
    * }, 1000, 'helloWorld' );
    */
			defer: function defer(fn) {
				var ms = arguments[1] === undefined ? 0 : arguments[1];
				var id = arguments[2] === undefined ? undefined : arguments[2];

				if (typeof id === "string") {
					utility.clearTimers(id);
				} else {
					id = utility.uuid(true);
				}

				utility.timer[id] = setTimeout(function () {
					utility.clearTimers(id);
					fn();
				}, ms);

				return id;
			},

			/**
    * Async delay strategy
    *
    * @method delay
    * @memberOf promise
    * @return {Function} Delay method
    * @example
    * keigai.util.next( function () {
    *   console.log( 'On the next tick' );
    * } );
    */
			delay: (function () {
				if (typeof setImmediate !== "undefined") {
					return function (arg) {
						setImmediate(arg);
					};
				} else if (typeof process !== "undefined") {
					return process.nextTick;
				} else {
					return function (arg) {
						setTimeout(arg, 0);
					};
				}
			})(),

			/**
    * Queries DOM with fastest method
    *
    * @method dom
    * @memberOf utility
    * @param  {String} arg DOM query
    * @return {Mixed}      undefined, Element, or Array of Elements
    * @private
    */
			dom: function dom(arg) {
				var result = undefined;

				if (!regex.selector_complex.test(arg)) {
					if (regex.hash.test(arg)) {
						result = document.getElementById(arg.replace(regex.hash, "")) || undefined;
					} else if (regex.klass.test(arg)) {
						result = array.cast(document.getElementsByClassName(arg.replace(regex.klass, "")));
					} else if (regex.word.test(arg)) {
						result = array.cast(document.getElementsByTagName(arg));
					} else {
						result = array.cast(document.querySelectorAll(arg));
					}
				} else {
					result = array.cast(document.querySelectorAll(arg));
				}

				return result;
			},

			/**
    * Encodes a UUID to a DOM friendly ID
    *
    * @method domId
    * @memberOf utility
    * @param  {String} UUID
    * @return {String} DOM friendly ID
    * @private
    */
			domId: function domId(arg) {
				return "a" + arg.replace(/-/g, "").slice(1);
			},

			/**
    * Equality verification
    *
    * @method equal
    * @memberOf utility
    * @param  {Mixed}   a Argument to compare
    * @param  {Array}   b Argument to compare
    * @return {Boolean}   `true` if equal
    * @private
    */
			equal: function equal(a, b) {
				return json.encode(a, true) === json.encode(b, true);
			},

			/**
    * Error handling, with history in `error.log`
    *
    * @method error
    * @memberOf utility
    * @param  {Mixed}   e       Error object or message to display
    * @param  {Array}   args    Array of arguments from the callstack
    * @param  {Mixed}   scope   Entity that was "this"
    * @param  {Boolean} warning [Optional] Will display as console warning if true
    * @return {Object}          Error descriptor
    * @private
    */
			error: function error(e, args, scope, warning) {
				var o = {
					arguments: args ? array.cast(args) : [],
					message: e.message || e,
					number: e.number ? e.number & 65535 : undefined,
					scope: scope,
					stack: e.stack || undefined,
					timestamp: new Date().toUTCString(),
					type: e.type || "TypeError"
				};

				utility.log(o.stack || o.message, warning !== true ? "error" : "warn");

				return o;
			},

			/**
    * Creates a "class" extending Object, with optional decoration. SuperClass can be called from `super` property.
    *
    * @method extend
    * @memberOf utility
    * @param  {Object} obj Object to extend
    * @param  {Object} arg [Optional] Object for decoration
    * @return {Object}     Decorated obj
    * @example
    * let extendObj = keigai.util.extend( someObj, {newProperty: value} );
    */
			extend: function extend(obj, arg) {
				var o = Object.create(obj);

				if (arg instanceof Object) {
					utility.merge(o, arg);
				}

				o["super"] = obj;

				return o;
			},

			/**
    * Generates an ID value
    *
    * @method genId
    * @memberOf utility
    * @param  {Mixed}   obj [Optional] Object to receive id
    * @param  {Boolean} dom [Optional] Verify the ID is unique in the DOM, default is false
    * @return {Mixed}       Object or id
    * @example
    * let id = keigai.util.genId();
    */
			genId: function genId(obj) {
				var dom = arguments[1] === undefined ? false : arguments[1];

				var id = undefined;

				if (obj && (obj.id || obj instanceof Array || (typeof obj === "string" || obj instanceof String))) {
					return obj;
				}

				if (dom) {
					do {
						id = utility.domId(utility.uuid(true));
					} while (utility.dom("#" + id));
				} else {
					id = utility.domId(utility.uuid(true));
				}

				if (obj && typeof obj === "object") {
					obj.id = id;

					return obj;
				} else {
					return id;
				}
			},

			/**
    * Iterates an Object and executes a function against the properties.
    * Returning `false` halts iteration.
    *
    * @method iterate
    * @memberOf utility
    * @param  {Object}   obj Object to iterate
    * @param  {Function} fn  Function to execute against properties
    * @return {Object}       Object
    * @example
    * keigai.util.iterate( {...}, ( value, key ) => {
    *   ...
    * } );
    */
			iterate: function iterate(obj, fn) {
				array.each(Object.keys(obj), function (i) {
					return fn.call(obj, obj[i], i);
				});

				return obj;
			},

			/**
    * Writes argument to the console
    *
    * @method log
    * @memberOf utility
    * @param  {String} arg    String to write to the console
    * @param  {String} target [Optional] Target console, default is "log"
    * @return {Undefined}     undefined
    * @example
    * keigai.util.log( "Something bad happened", "warn" );
    */
			log: function log(arg) {
				var target = arguments[1] === undefined ? "log" : arguments[1];

				var msg = typeof arg !== "object" ? "[" + new Date().toLocaleTimeString() + "] " + arg : arg;

				console[target](msg);
			},

			/**
    * Merges obj with arg
    *
    * @method merge
    * @memberOf utility
    * @param  {Object} obj Object to decorate
    * @param  {Object} arg Decoration
    * @return {Object}     Decorated Object
    * @example
    * let obj = {a: true};
    *
    * keigai.util.merge( obj, {b: false} )
    * console.log(obj); // {a: true, b: false}
    */
			merge: function merge(obj, arg) {
				var keys = obj instanceof Array ? array.keys(obj) : [];

				utility.iterate(arg, function (v, k) {
					if (!array.contains(keys, k) || v instanceof Function) {
						obj[k] = v;
					} else if (obj[k] instanceof Array && v instanceof Array) {
						array.merge(obj[k], v);
					} else if (v instanceof Function) {
						obj[k] = v;
					} else if (obj[k] instanceof Object && v instanceof Object) {
						utility.iterate(v, function (x, y) {
							obj[k][y] = utility.clone(x);
						});
					} else {
						obj[k] = utility.clone(v);
					}
				});

				return obj;
			},

			/**
    * Parses a URI into an Object
    *
    * @method parse
    * @memberOf utility
    * @param  {String} uri URI to parse
    * @return {Object}     Parsed URI
    * @example
    * let parsed = keigai.util.parse( location.href );
    *
    * parsed;
    * {
    *   auth     : "",
    *   hash     : "",
    *   host     : "",
    *   hostname : "",
    *   query    : {},
    *   pathname : "",
    *   port     : n,
    *   protocol : "",
    *   search   : "",
    * }
    */
			parse: function parse(uri) {
				var obj = {};
				var host = undefined,
				    parsed = undefined,
				    protocol = undefined;

				if (uri === undefined) {
					uri = !server ? location.href : "";
				}

				if (!server) {
					obj = document.createElement("a");
					obj.href = uri;
					host = obj.href.match(regex.host)[1];
					protocol = obj.href.match(regex.protocol)[1];
				} else {
					obj = url.parse(uri);
				}

				if (server) {
					utility.iterate(obj, function (v, k) {
						if (v === null) {
							obj[k] = undefined;
						}
					});
				}

				parsed = {
					auth: server ? null : regex.auth.exec(uri),
					protocol: obj.protocol || protocol,
					hostname: obj.hostname || host,
					port: obj.port ? number.parse(obj.port, 10) : "",
					pathname: obj.pathname,
					search: obj.search || "",
					hash: obj.hash || "",
					host: obj.host || host
				};

				// 'cause IE is ... IE; required for data.batch()
				if (client.ie) {
					if (parsed.protocol === ":") {
						parsed.protocol = location.protocol;
					}

					if (string.isEmpty(parsed.hostname)) {
						parsed.hostname = location.hostname;
					}

					if (string.isEmpty(parsed.host)) {
						parsed.host = location.host;
					}

					if (parsed.pathname.charAt(0) !== "/") {
						parsed.pathname = "/" + parsed.pathname;
					}
				}

				parsed.auth = obj.auth || (parsed.auth === null ? "" : parsed.auth[1]);
				parsed.href = obj.href || parsed.protocol + "//" + (string.isEmpty(parsed.auth) ? "" : parsed.auth + "@") + parsed.host + parsed.pathname + parsed.search + parsed.hash;
				parsed.path = obj.path || parsed.pathname + parsed.search;
				parsed.query = utility.queryString(null, parsed.search);

				return parsed;
			},

			/**
    * Creates a partially applied Function
    *
    * @method partial
    * @memberOf utility
    * @return {Function} Partial Function
    * @example
    * function f ( a, b ) {
    *   return a + b;
    * }
    *
    * let g = keigai.util.partial( f, 2 );
    *
    * g( 2 ); // 4
    */
			partial: function partial(fn) {
				for (var _len15 = arguments.length, args = Array(_len15 > 1 ? _len15 - 1 : 0), _key15 = 1; _key15 < _len15; _key15++) {
					args[_key15 - 1] = arguments[_key15];
				}

				return function () {
					for (var _len16 = arguments.length, args2 = Array(_len16), _key16 = 0; _key16 < _len16; _key16++) {
						args2[_key16] = arguments[_key16];
					}

					return fn.apply(fn, args.concat(args2));
				};
			},

			/**
    * Prevents default behavior of an Event
    *
    * @method prevent
    * @memberOf utility
    * @param  {Object} ev Event
    * @return {Object}    Event
    * @example
    * keigai.util.prevent( Event );
    */
			prevent: function prevent(ev) {
				if (typeof ev.preventDefault === "function") {
					ev.preventDefault();
				}

				return ev;
			},

			/**
    * Parses a query string & coerces values
    *
    * @method queryString
    * @memberOf utility
    * @param  {String} arg     [Optional] Key to find in the querystring
    * @param  {String} qstring [Optional] Query string to parse
    * @return {Mixed}          Value or Object of key:value pairs
    */
			queryString: function queryString(arg) {
				var qstring = arguments[1] === undefined ? "" : arguments[1];

				var obj = {};
				var result = (qstring || location.search || "").replace(/.*\?/, "");

				array.each(result.split("&"), function (prop) {
					var item = prop.split("=");

					if (string.isEmpty(item[0])) {
						return;
					}

					if (item[1] === undefined) {
						item[1] = "";
					} else {
						item[1] = utility.coerce(decodeURIComponent(item[1]));
					}

					if (obj[item[0]] === undefined) {
						obj[item[0]] = item[1];
					} else if (!(obj[item[0]] instanceof Array)) {
						obj[item[0]] = [obj[item[0]]];
						obj[item[0]].push(item[1]);
					} else {
						obj[item[0]].push(item[1]);
					}
				});

				return typeof arg === "string" ? utility.walk(obj, arg) : obj;
			},

			/**
    * Accepts Deferreds or Promises as arguments, or an Array of either
    *
    * @method race
    * @memberOf utility
    * @return {Object} {@link keigai.Deferred}
    * @example
    * let deferreds = [],
    *     defer1    = keigai.util.defer(),
    *     defer2    = keigai.util.defer();
    *
    * deferreds.push( defer1 );
    * deferreds.push( defer2 );
    *
    * // Executes when one deferred is resolved or rejected
    * keigai.util.race( deferreds ).then( function ( arg ) ) {
    *   ...
    * }, function ( err ) {
    *   ...
    * } );
    *
    * ...
    *
    * defer1.resolve( true );
    * defer2.resolve( true );
    */
			race: function race() {
				for (var _len17 = arguments.length, args = Array(_len17), _key17 = 0; _key17 < _len17; _key17++) {
					args[_key17] = arguments[_key17];
				}

				var defer = deferred();

				// Did we receive an Array? if so it overrides any other arguments
				if (args[0] instanceof Array) {
					args = args[0];
				}

				// None, end on next tick
				if (args.length === 0) {
					defer.resolve(null);
				}
				// Setup and wait
				else {
					Promise.race(args).then(function (results) {
						defer.resolve(results);
					}, function (e) {
						defer.reject(e);
					});
				}

				return defer;
			},

			/**
    * Asynchronous DOM rendering (cannot be cancelled, suggested for reactive behavior)
    *
    * @method render
    * @memberOf utility
    * @param  {Function} fn Function to execute on next 'frame'
    * @return {Object} {@link keigai.Deferred}
    * @example
    * keigai.util.render( function () {
    *     return keitai.util.element.html( document.querySelector( "#id" ), "Hello World" )
    * } ).then( function ( arg ) {
    *     // arg is the return value of your function
    * }, function ( e ) {
    *     // Handle e
    * } );
    */
			render: function render(fn) {
				var defer = deferred();

				RENDER(function (arg) {
					try {
						defer.resolve(fn(arg));
					} catch (e) {
						defer.reject(e);
					}
				});

				return defer;
			},

			/**
    * Creates a recursive function. Return false from the function to halt recursion.
    *
    * @method repeat
    * @memberOf utility
    * @param  {Function} fn  Function to execute repeatedly
    * @param  {Number}   ms  Milliseconds to stagger the execution
    * @param  {String}   id  [Optional] Timeout ID
    * @param  {Boolean}  now Executes `fn` and then setup repetition, default is `true`
    * @return {String}       Timeout ID
    * @example
    * keigai.util.repeat( function () {
    *   ...
    *
    *   // Cancelling repetition at some point in the future
    *   if ( someCondition ) {
    *     return false;
    *   }
    * }, 1000, "repeating" );
    */
			repeat: function repeat(fn) {
				var ms = arguments[1] === undefined ? 10 : arguments[1];
				var id = arguments[2] === undefined ? utility.uuid(true) : arguments[2];
				var now = arguments[3] === undefined ? true : arguments[3];

				var recursive = undefined;

				// Could be valid to return false from initial execution
				if (now && fn() === false) {
					return;
				}

				recursive = function () {
					if (fn() !== false) {
						utility.defer(recursive, ms, id);
					}
				};

				utility.defer(recursive, ms, id);

				return id;
			},

			/**
    * Stops an Event from bubbling, & prevents default behavior
    *
    * @method stop
    * @memberOf utility
    * @param  {Object} ev Event
    * @return {Object}    Event
    * @example
    * keigai.util.stop( Event );
    */
			stop: function stop(ev) {
				if (typeof ev.stopPropagation === "function") {
					ev.stopPropagation();
				}

				utility.prevent(ev);

				return ev;
			},

			/**
    * Returns the Event target
    *
    * @method target
    * @memberOf utility
    * @param  {Object} ev Event
    * @return {Object}    Event target
    * @example
    * let target = keigai.util.target( Event );
    */
			target: function target(ev) {
				return ev.target || ev.srcElement;
			},

			/**
    * Generates a version 4 UUID
    *
    * @method uuid
    * @memberOf utility
    * @param  {Boolean} strip [Optional] Strips - from UUID
    * @return {String}        UUID
    * @example
    * let uuid4 = keigai.util.uuid();
    */
			uuid: function uuid(strip) {
				function s() {
					return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
				}

				var r = [8, 9, "a", "b"];
				var o = s() + s() + "-" + s() + "-4" + s().substr(0, 3) + "-" + r[Math.floor(Math.random() * 4)] + s().substr(0, 3) + "-" + s() + s() + s();

				if (strip === true) {
					o = o.replace(/-/g, "");
				}

				return o;
			},

			/**
    * Walks `obj` and returns `arg`, for when you can't easily access `arg`
    *
    * @method  walk
    * @memberOf utility
    * @param  {Mixed}  obj  Object or Array
    * @param  {String} arg  String describing the property to return
    * @return {Mixed}       Target or undefined
    * @example
    * let obj = {a: [{b: true}]};
    *
    * keigai.util.walk( obj, "a[0].b" ); // true
    */
			walk: function walk(obj, arg) {
				var output = obj;

				array.each(arg.replace(/\]$/, "").replace(/\]/g, ".").replace(/\.\./g, ".").split(/\.|\[/), function (i) {
					if (output[i] === undefined || output[i] === null) {
						output = undefined;
						return false;
					}

					output = output[i];
				});

				return output;
			},

			/**
    * Accepts Deferreds or Promises as arguments, or an Array of either
    *
    * @method when
    * @memberOf utility
    * @return {Object} {@link keigai.Deferred}
    * @example
    * let deferreds = [],
    *     defer1    = keigai.util.defer(),
    *     defer2    = keigai.util.defer();
    *
    * deferreds.push( defer1 );
    * deferreds.push( defer2 );
    *
    * // Executes when both deferreds have resolved or one has rejected
    * keigai.util.when( deferreds ).then( function ( args ) {
    *   ...
    * }, function ( err ) {
    *   ...
    * } );
    *
    * ...
    *
    * defer1.resolve( true );
    * defer2.resolve( true );
    */
			when: function when() {
				for (var _len18 = arguments.length, args = Array(_len18), _key18 = 0; _key18 < _len18; _key18++) {
					args[_key18] = arguments[_key18];
				}

				var defer = deferred();

				// Did we receive an Array? if so it overrides any other arguments
				if (args[0] instanceof Array) {
					args = args[0];
				}

				// None, end on next tick
				if (args.length === 0) {
					defer.resolve(null);
				}
				// Setup and wait
				else {
					Promise.all(args).then(function (results) {
						defer.resolve(results);
					}, function (e) {
						defer.reject(e);
					});
				}

				return defer;
			},

			/**
    * Worker factory
    *
    * @method worker
    * @memberOf utility
    * @param  {Object} defer Deferred to receive message from Worker
    * @return {Object}       Worker
    * @private
    */
			worker: function worker(defer) {
				var obj = new Worker(WORKER);

				obj.onerror = function (err) {
					defer.reject(err);
					obj.terminate();
				};

				obj.onmessage = function (ev) {
					defer.resolve(ev.data);
					obj.terminate();
				};

				return obj;
			}
		};

		/**
   * XMLHttpRequest shim for node.js
   *
   * @method xhr
   * @private
   * @return {Object} XMLHttpRequest instance
   */
		var xhr = function xhr() {
			var UNSENT = 0;
			var OPENED = 1;
			var HEADERS_RECEIVED = 2;
			var LOADING = 3;
			var DONE = 4;
			var ERR_REFUSED = /ECONNREFUSED/;
			var ready = new RegExp(HEADERS_RECEIVED + "|" + LOADING);

			var headers = {
				"user-agent": "keigai/1.3.14 node.js/" + process.versions.node.replace(/^v/, "") + " (" + string.capitalize(process.platform) + " V8/" + process.versions.v8 + " )",
				"content-type": "text/plain",
				accept: "*/*"
			};

			/**
    * Dispatches an event
    *
    * @method dispatch
    * @memberOf xhr
    * @param  {Object} obj In
    * @param  {String} arg Event to dispatch
    * @return {Object}     XMLHttpRequest instance
    */
			var dispatch = function dispatch(obj, arg) {
				var fn = "on" + arg;

				if (typeof obj[fn] === "function") {
					obj[fn]();
				}

				obj.dispatchEvent(arg);

				return obj;
			};

			/**
    * Changes the readyState of an XMLHttpRequest
    *
    * @method state
    * @memberOf xhr
    * @param  {String} arg New readyState
    * @return {Object}     XMLHttpRequest instance
    */
			var state = function state(obj, arg) {
				if (obj.readyState !== arg) {
					obj.readyState = arg;
					dispatch(obj, "readystatechange");

					if (obj.readyState === DONE && !obj._error) {
						dispatch(obj, "load");
						dispatch(obj, "loadend");
					}
				}

				return obj;
			};

			/**
    * Response handler
    *
    * @method success
    * @memberOf xhr
    * @param  {Object} obj {@link keigai.XMLHttpRequest}
    * @param  {Object} res HTTP(S) Response Object
    * @return {Undefined}  undefined
    */
			var success = function success(obj, res) {
				state(obj, HEADERS_RECEIVED);
				obj.status = res.statusCode;
				obj._resheaders = res.headers;

				if (obj._resheaders["set-cookie"] && obj._resheaders["set-cookie"] instanceof Array) {
					obj._resheaders["set-cookie"] = obj._resheaders["set-cookie"].join(";");
				}

				res.on("data", function (arg) {
					res.setEncoding("utf8");

					if (obj._send) {
						if (arg) {
							obj.responseText += arg;
						}

						state(obj, LOADING);
					}
				});

				res.on("end", function () {
					if (obj._send) {
						state(obj, DONE);
						obj._send = false;
					}
				});
			};

			/**
    * Response error handler
    *
    * @method failure
    * @memberOf xhr
    * @param  {Object} obj {@link keigai.XMLHttpRequest}
    * @param  {Object} e   Error
    * @return {Undefined}  undefined
    */
			var failure = function failure(obj, e) {
				obj.status = ERR_REFUSED.test(e.message) ? 503 : 500;
				obj.statusText = "";
				obj.responseText = e.message;
				obj._error = true;
				obj._send = false;
				dispatch(obj, "error");
				state(obj, DONE);
			};

			var XMLHttpRequest = (function (_Base6) {
				/**
     * Creates a new XMLHttpRequest
     *
     * @constructor
     * @private
     * @memberOf xhr
     * @return {Object} XMLHttpRequest instance
     */

				function XMLHttpRequest() {
					_classCallCheck(this, XMLHttpRequest);

					_get(Object.getPrototypeOf(XMLHttpRequest.prototype), "constructor", this).call(this);

					this.onabort = null;
					this.onerror = null;
					this.onload = null;
					this.onloadend = null;
					this.onloadstart = null;
					this.onreadystatechange = null;
					this.readyState = UNSENT;
					this.response = null;
					this.responseText = "";
					this.responseType = "";
					this.responseXML = null;
					this.status = UNSENT;
					this.statusText = "";
					this.observer = observable();

					// Psuedo private for prototype chain
					this._error = false;
					this._headers = {};
					this._params = {};
					this._request = null;
					this._resheaders = {};
					this._send = false;
				}

				_inherits(XMLHttpRequest, _Base6);

				_createClass(XMLHttpRequest, [{
					key: "abort",

					/**
      * Aborts a request
      *
      * @method abort
      * @memberOf XMLHttpRequest
      * @return {Object} XMLHttpRequest instance
      */
					value: function abort() {
						if (this._request !== null) {
							this._request.abort();
							this._request = null;
							this.responseText = "";
							this.responseXML = "";
							this._error = true;
							this._headers = {};

							if (this._send === true || ready.test(this.readyState)) {
								this._send = false;
								state(this, DONE);
							}

							dispatch(this, "abort");
							this.readyState = UNSENT;
						}

						return this;
					}
				}, {
					key: "getAllResponseHeaders",

					/**
      * Gets all response headers
      *
      * @method getAllResponseHeaders
      * @memberOf XMLHttpRequest
      * @return {Object} Response headers
      */
					value: function getAllResponseHeaders() {
						var result = "";

						if (this.readyState < HEADERS_RECEIVED) {
							throw new Error(label.invalidStateNoHeaders);
						}

						utility.iterate(this._resheaders, function (v, k) {
							result += k + ": " + v + "\n";
						});

						return result;
					}
				}, {
					key: "getResponseHeader",

					/**
      * Gets a specific response header
      *
      * @method getResponseHeader
      * @memberOf XMLHttpRequest
      * @param  {String} header Header to get
      * @return {String}        Response header value
      */
					value: function getResponseHeader(header) {
						if (this.readyState < HEADERS_RECEIVED || this._error) {
							throw new Error(label.invalidStateNoHeaders);
						}

						return this._resheaders[header] || this._resheaders[header.toLowerCase()];
					}
				}, {
					key: "open",

					/**
      * Prepares an XMLHttpRequest instance to make a request
      *
      * @method open
      * @memberOf XMLHttpRequest
      * @param  {String}  method   HTTP method
      * @param  {String}  url      URL to receive request
      * @param  {Boolean} async    [Optional] Asynchronous request
      * @param  {String}  user     [Optional] Basic auth username
      * @param  {String}  password [Optional] Basic auth password
      * @return {Object}           XMLHttpRequest instance
      */
					value: function open(method, url, async, user, password) {
						var _this33 = this;

						if (async !== true) {
							throw new Error(label.invalidStateNoSync);
						}

						this.abort();
						this._error = false;
						this._params = {
							method: method,
							url: url,
							async: async || true,
							user: user || null,
							password: password || null
						};

						utility.iterate(headers, function (v, k) {
							_this33._headers[k] = v;
						});

						this.readyState = OPENED;

						return this;
					}
				}, {
					key: "overrideMimeType",

					/**
      * Overrides the Content-Type of the request
      *
      * @method overrideMimeType
      * @memberOf XMLHttpRequest
      * @param  {String} mime Mime type of the request ( media type )
      * @return {Object}      XMLHttpRequest instance
      */
					value: function overrideMimeType(mime) {
						this._headers["content-type"] = mime;

						return this;
					}
				}, {
					key: "send",

					/**
      * Sends an XMLHttpRequest request
      *
      * @method send
      * @memberOf XMLHttpRequest
      * @param  {Mixed} data [Optional] Payload to send with the request
      * @return {Object}     XMLHttpRequest instance
      */
					value: function send() {
						var _this34 = this;

						var data = arguments[0] === undefined ? null : arguments[0];

						var options = undefined,
						    parsed = undefined,
						    request = undefined,
						    obj = undefined;

						if (this.readyState < OPENED) {
							throw new Error(label.invalidStateNotOpen);
						} else if (this._send) {
							throw new Error(label.invalidStateNotSending);
						}

						parsed = utility.parse(this._params.url);
						parsed.port = parsed.port || (parsed.protocol === "https:" ? 443 : 80);

						if (this._params.user !== null && this._params.password !== null) {
							parsed.auth = this._params.user + ":" + this._params.password;
						}

						// Specifying Content-Length accordingly
						if (regex.put_post.test(this._params.method)) {
							if (data === null) {
								this._headers["content-length"] = 0;
							} else if (typeof data === "string") {
								this._headers["content-length"] = Buffer.byteLength(data);
							} else if (data instanceof Buffer || typeof data.toString === "function") {
								data = data.toString();
								this._headers["content-length"] = Buffer.byteLength(data);
							} else {
								throw new Error(label.invalidArguments);
							}
						}

						this._headers.host = parsed.host;

						if (this._headers["x-requested-with"] === "XMLHttpRequest") {
							delete this._headers["x-requested-with"];
						}

						options = {
							hostname: parsed.hostname,
							path: parsed.path,
							port: parsed.port,
							method: this._params.method,
							headers: this._headers
						};

						if (parsed.protocol === "https:") {
							options.rejectUnauthorized = false;
							options.agent = false;
						}

						if (parsed.auth) {
							options.auth = parsed.auth;
						}

						this._send = true;
						dispatch(this, "readystatechange");

						obj = parsed.protocol === "http:" ? http : https;

						request = obj.request(options, function (arg) {
							success(_this34, arg);
						}).on("error", function (e) {
							failure(_this34, e);
						});

						data === null ? request.setSocketKeepAlive(true) : request.write(data, "utf8");
						this._request = request;
						request.end();

						dispatch(this, "loadstart");

						return this;
					}
				}, {
					key: "setRequestHeader",

					/**
      * Sets a request header of an XMLHttpRequest instance
      *
      * @method setRequestHeader
      * @memberOf XMLHttpRequest
      * @param {String} header HTTP header
      * @param {String} value  Header value
      * @return {Object}       XMLHttpRequest instance
      */
					value: function setRequestHeader(header, value) {
						if (this.readyState !== OPENED) {
							throw new Error(label.invalidStateNotUsable);
						} else if (this._send) {
							throw new Error(label.invalidStateNotSending);
						}

						this._headers[header.toLowerCase()] = value;

						return this;
					}
				}]);

				return XMLHttpRequest;
			})(Base);

			return XMLHttpRequest;
		};

		/**
   * WeakMap shim
   *
   * @class
   * @private
   */

		var WeakMapShim = (function () {
			function WeakMapShim() {
				_classCallCheck(this, WeakMapShim);

				this.elements = {};
			}

			_createClass(WeakMapShim, [{
				key: "clear",
				value: function clear() {
					this.elements = {};
				}
			}, {
				key: "delete",
				value: function _delete(arg) {
					delete this.elements[arg];
				}
			}, {
				key: "has",
				value: function has(arg) {
					return this.elements[arg] !== undefined;
				}
			}, {
				key: "get",
				value: function get(arg) {
					return this.has(arg) ? this.elements[arg].value : undefined;
				}
			}, {
				key: "set",
				value: function set(arg, value) {
					this.elements[arg] = { value: value };
					return this;
				}
			}]);

			return WeakMapShim;
		})();

		/**
   * @namespace xml
   * @private
   */
		var xml = {
			/**
    * Returns XML (Document) Object from a String
    *
    * @method decode
    * @memberOf xml
    * @param  {String} arg XML String
    * @return {Object}     XML Object or undefined
    */
			decode: function decode(arg) {
				return new DOMParser().parseFromString(arg, "text/xml");
			},

			/**
    * Returns XML String from an Object or Array
    *
    * @method encode
    * @memberOf xml
    * @param  {Mixed} arg Object or Array to cast to XML String
    * @return {String}    XML String or undefined
    */
			encode: function encode(arg) {
				var wrap = arguments[1] === undefined ? true : arguments[1];
				var top = arguments[2] === undefined ? true : arguments[2];
				var key = arguments[3] === undefined ? "" : arguments[3];

				var x = wrap ? "<" + (key || "xml") + ">" : "";

				if (arg !== null && arg.xml) {
					arg = arg.xml;
				}

				if (client.doc && arg instanceof Document) {
					arg = new XMLSerializer().serializeToString(arg);
				}

				if (regex.boolean_number_string.test(typeof arg)) {
					x += xml.node(isNaN(key) ? key : "item", arg);
				} else if (arg === null || arg === undefined) {
					x += "null";
				} else if (arg instanceof Array) {
					array.each(arg, function (v) {
						x += xml.encode(v, typeof v === "object", false, "item");
					});
				} else if (arg instanceof Object) {
					utility.iterate(arg, function (v, k) {
						x += xml.encode(v, typeof v === "object", false, k);
					});
				}

				x += wrap ? "</" + (key || "xml") + ">" : "";

				if (top) {
					x = "<?xml version=\"1.0\" encoding=\"UTF8\"?>" + x;
				}

				return x;
			},

			/**
    * Encodes a value as a node
    *
    * @method node
    * @memberOf xml
    * @param  {String} name  Node name
    * @param  {String} value Node value
    * @return {String}       Node
    */
			node: function node(name, value) {
				return "<n>v</n>".replace("v", regex.cdata.test(value) ? "<![CDATA[" + value + "]]>" : value).replace(/<(\/)?n>/g, "<$1" + name + ">");
			},

			/**
    * Validates `arg` is XML
    *
    * @method valid
    * @memberOf xml
    * @param  {String} arg String to validate
    * @return {Boolean}    `true` if valid XML
    */
			valid: function valid(arg) {
				return xml.decode(arg).getElementsByTagName("parsererror").length === 0;
			}
		};

		/**
   * Bootstraps environment
   *
   * @method bootstrap
   * @private
   * @return {Undefined} undefined
   */
		var bootstrap = function bootstrap() {
			// ES6 Array shims
			if (Array.from === undefined) {
				Array.from = function (arg) {
					return [].slice.call(arg);
				};
			}

			if (Array.keys === undefined) {
				Array.keys = function (arg) {
					return Object.keys(arg);
				};
			}

			// Describing the Client
			if (!server) {
				client.version = client.version();

				if (client.ie && client.version < 10) {
					throw new Error(label.upgrade);
				}
			} else {
				// XHR shim
				XMLHttpRequest = xhr();
			}

			// WeakMap shim for client & server
			if (WeakMap === null) {
				WeakMap = WeakMapShim;
			}

			// DataStore Worker "script"
			if (webWorker) {
				try {
					WORKER = global.URL.createObjectURL(utility.blob("var " + string.fromObject(array, "array") + ", " + string.fromObject(regex, "regex") + ", " + string.fromObject(string, "string") + ", " + string.fromObject(utility, "utility") + "; onmessage = " + store.worker.toString() + ";"));
				} catch (e) {
					webWorker = false;
				}
			}

			TIME = new Date().getTime();

			// Setting up `utility.render()`
			if (global.requestAnimationFrame !== undefined) {
				RENDER = global.requestAnimationFrame;
			} else {
				RENDER = function (fn) {
					var offset = new Date().getTime() - TIME;

					utility.defer(function () {
						fn(offset);
					}, 16, offset);
				};
			}

			if (!server) {
				utility.banner();
			}
		};

		// Bootstrapping
		bootstrap();

		// Interface
		return {
			filter: filter,
			list: list.factory,
			grid: grid,
			store: store.factory,
			util: {
				$: utility.$,
				array: array,
				banner: utility.banner,
				base: utility.base,
				clearTimers: utility.clearTimers,
				clone: utility.clone,
				coerce: utility.coerce,
				curry: utility.curry,
				csv: csv,
				defer: deferred,
				delay: utility.defer,
				element: element,
				equal: utility.equal,
				extend: utility.extend,
				genId: utility.genId,
				iterate: utility.iterate,
				json: json,
				jsonp: client.jsonp,
				log: utility.log,
				lru: lru.factory,
				math: math,
				merge: utility.merge,
				next: utility.delay,
				number: number,
				observer: observable,
				parse: utility.parse,
				partial: utility.partial,
				prevent: utility.prevent,
				queryString: utility.queryString,
				race: utility.race,
				regex: regex,
				render: utility.render,
				repeat: utility.repeat,
				request: client.request,
				stop: utility.stop,
				string: string,
				target: utility.target,
				uuid: utility.uuid,
				walk: utility.walk,
				when: utility.when,
				xml: xml
			},
			version: "1.3.14"
		};
	})();

	// Node, AMD & window supported
	if (typeof exports !== "undefined") {
		module.exports = lib;
	} else if (typeof define === "function") {
		define(function () {
			return lib;
		});
	} else {
		global.keigai = lib;
	}
})(typeof global !== "undefined" ? global : window);