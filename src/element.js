/**
 * @namespace element
 */
let element = {
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
	addClass: ( obj, arg ) => {
		element.klass( obj, arg, true );
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
	appendTo: ( obj, child ) => {
		obj.appendChild( child );

		return obj;
	},

	/**
	 * Gets or sets an Element attribute
	 *
	 * @method attr
	 * @memberOf element
	 * @param  {Object} obj   Element
	 * @param  {String} name  Attribute name
	 * @param  {Mixed}  value Attribute value
	 * @return {Object}       Element
	 * @example
	 * keigai.util.element.attr( document.querySelector( "select" ), "selected", "option 1" );
	 */
	attr: ( obj, key, value ) => {
		let target, result;

		if ( regex.svg.test( obj.namespaceURI ) ) {
			if ( value === undefined ) {
				result = obj.getAttributeNS( obj.namespaceURI, key );

				if ( result === null || string.isEmpty( result ) ) {
					result = undefined;
				} else {
					result = utility.coerce( result );
				}
			} else {
				obj.setAttributeNS( obj.namespaceURI, key, value );
			}
		} else {
			if ( typeof value === "string" ) {
				value = string.trim( value );
			}

			if ( regex.checked_disabled.test( key ) && value === undefined ) {
				return utility.coerce( obj[ key ] );
			} else if ( regex.checked_disabled.test( key ) && value !== undefined ) {
				obj[ key ] = value;
			} else if ( obj.nodeName === "SELECT" && key === "selected" && value === undefined ) {
				return utility.dom( "#" + obj.id + " option[selected=\"selected\"]" )[ 0 ] || utility.dom( "#" + obj.id + " option" )[ 0 ];
			} else if ( obj.nodeName === "SELECT" && key === "selected" && value !== undefined ) {
				target = utility.dom( "#" + obj.id + " option[selected=\"selected\"]" )[ 0 ];

				if ( target !== undefined ) {
					target.selected = false;
					target.removeAttribute( "selected" );
				}

				target = utility.dom( "#" + obj.id + " option[value=\"" + value + "\"]" )[ 0 ];
				target.selected = true;
				target.setAttribute( "selected", "selected" );
			} else if ( value === undefined ) {
				result = obj.getAttribute( key );

				if ( result === null || string.isEmpty( result ) ) {
					result = undefined;
				} else {
					result = utility.coerce( result );
				}

				return result;
			} else {
				obj.setAttribute( key, value );
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
	clear: ( obj ) => {
		if ( typeof obj.reset === "function" ) {
			obj.reset();
		} else if ( obj.value !== undefined ) {
			element.update( obj, { innerHTML: "", value: "" } );
		} else {
			element.update( obj, { innerHTML: "" } );
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
	create: ( type, args, obj, pos ) => {
		let svg = false;
		let frag = false;
		let fragment, result;

		// Removing potential HTML template formatting
		type = type.replace( /\t|\n|\r/g, "" );

		if ( obj ) {
			svg = obj.namespaceURI && regex.svg.test( obj.namespaceURI );
		} else {
			obj = document.body;
		}

		// String injection, create a frag and apply it
		if ( regex.html.test( type ) ) {
			frag = true;
			fragment = element.frag( type );
			result = fragment.childNodes.length === 1 ? fragment.childNodes[ 0 ] : array.cast( fragment.childNodes );
		}
		// Original syntax
		else {
			if ( !svg && !regex.svg.test( type ) ) {
				fragment = document.createElement( type );
			} else {
				fragment = document.createElementNS( "http://www.w3.org/2000/svg", type );
			}

			if ( args instanceof Object ) {
				element.update( fragment, args );
			}
		}

		if ( !pos || pos === "last" ) {
			obj.appendChild( fragment );
		} else if ( pos === "first" ) {
			element.prependChild( obj, fragment );
		} else if ( pos === "after" ) {
			pos = { after: obj };
			obj = obj.parentNode;
			obj.insertBefore( fragment, pos.after.nextSibling );
		} else if ( pos.after ) {
			obj.insertBefore( fragment, pos.after.nextSibling );
		} else if ( pos === "before" ) {
			pos = { before: obj };
			obj = obj.parentNode;
			obj.insertBefore( fragment, pos.before );
		} else if ( pos.before ) {
			obj.insertBefore( fragment, pos.before );
		} else {
			obj.appendChild( fragment );
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
	css: ( obj, key, value ) => {
		if ( !regex.caps.test( key ) ) {
			key = string.toCamelCase( key );
		}

		if ( value !== undefined ) {
			obj.style[ key ] = value;
			return obj;
		} else {
			return obj.style[ key ];
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
	data: ( obj, key, value ) => {
		if ( value !== undefined ) {
			obj.setAttribute( "data-" + key, regex.json_wrap.test( value ) ? json.encode( value ) : value );

			return obj;
		} else {
			return utility.coerce( obj.getAttribute( "data-" + key ) );
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
	destroy: ( obj ) => {
		if ( obj.parentNode !== null ) {
			obj.parentNode.removeChild( obj );
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
	disable: ( obj ) => {
		if ( typeof obj.disabled === "boolean" && !obj.disabled ) {
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
	dispatch: ( obj, type, data={}, bubbles=true, cancelable=true ) => {
		let ev;

		if ( !obj ) {
			return;
		}

		try {
			ev = new CustomEvent( type );
		}
		catch ( e ) {
			ev = document.createEvent( "CustomEvent" );
		}

		ev.initCustomEvent( type, bubbles, cancelable, data );
		obj.dispatchEvent( ev );

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
	enable: ( obj ) => {
		if ( typeof obj.disabled === "boolean" && obj.disabled ) {
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
	find: ( obj, arg ) => {
		let result = [];

		array.iterate( string.explode( arg ), ( i ) => {
			result = result.concat( array.cast( obj.querySelectorAll( i ) ) );
		} );

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
	frag: ( arg ) => {
		let obj = document.createDocumentFragment();

		if ( arg ) {
			array.iterate( array.cast( element.create( "div", { innerHTML: arg }, obj ).childNodes ), ( i ) => {
				obj.appendChild( i );
			} );

			obj.removeChild( obj.childNodes[ 0 ] );
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
	has: ( obj, arg ) => {
		let result = element.find( obj, arg );

		return ( !isNaN( result.length ) && result.length > 0 );
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
	hasClass: ( obj, arg ) => {
		return obj.classList.contains( arg );
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
	hidden: ( obj ) => {
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
	html: ( obj, arg ) => {
		if ( arg === undefined ) {
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
	is: ( obj, arg ) => {
		if ( regex.selector_is.test( arg ) ) {
			return ( element.find( obj.parentNode, obj.nodeName.toLowerCase() + arg ).filter( ( i ) => {
				return i.id === obj.id;
			} ).length === 1 );
		} else {
			return new RegExp( arg, "i" ).test( obj.nodeName );
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
	klass: ( obj, arg, add=true ) => {
		arg = string.explode( arg, " " );

		if ( add ) {
			array.iterate( arg, ( i ) => {
				obj.classList.add( i );
			} );
		} else {
			array.iterate( arg, ( i ) => {
				if ( i !== "*" ) {
					obj.classList.remove( i );
				} else {
					array.iterate( obj.classList, ( x ) => {
						obj.classList.remove( x );
					} );

					return false;
				}
			} );
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
	position: ( obj=document.body ) => {
		let left, top, right, bottom, height, width;

		left = top = 0;
		width = obj.offsetWidth;
		height = obj.offsetHeight;

		if ( obj.offsetParent ) {
			top = obj.offsetTop;
			left = obj.offsetLeft;

			while ( obj = obj.offsetParent ) {
				left += obj.offsetLeft;
				top += obj.offsetTop;
			}

			right = document.body.offsetWidth - ( left + width );
			bottom = document.body.offsetHeight - ( top + height );
		} else {
			right = width;
			bottom = height;
		}

		return [ left, top, right, bottom ];
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
	prependChild: ( obj, child ) => {
		return obj.childNodes.length === 0 ? obj.appendChild( child ) : obj.insertBefore( child, obj.childNodes[ 0 ] );
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
	removeAttr: ( obj, key ) => {
		if ( regex.svg.test( obj.namespaceURI ) ) {
			obj.removeAttributeNS( obj.namespaceURI, key );
		} else {
			if ( obj.nodeName === "SELECT" && key === "selected" ) {
				array.iterate( element.find( obj, "option" ), ( i ) => {
					if ( i.selected === true ) {
						i.selected = false;
						i.removeAttribute( "selected" );
						return false;
					}
				} );
			} else {
				obj.removeAttribute( key );
			}
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
	removeClass: ( obj, arg ) => {
		element.klass( obj, arg, false );
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
	scrollTo: ( obj, ms, offsetTop, offsetLeft ) => {
		let pos = array.remove( element.position( obj ), 2, 3 );

		if ( !isNaN( offsetTop ) ) {
			pos[ 0 ] += offsetTop;
		}

		if ( !isNaN( offsetLeft ) ) {
			pos[ 1 ] += offsetLeft;
		}

		return client.scroll( pos, ms );
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
	serialize: ( obj, string=true, encode=true ) => {
		let registry = {};
		let children, result;

		children = obj.nodeName === "FORM" ? ( obj.elements ? array.cast( obj.elements ) : obj.find( "button, input, select, textarea" ) ) : [ obj ];

		array.iterate( children, ( i ) => {
			let id = i.id || i.name || i.type;

			if ( i.nodeName === "FORM" ) {
				utility.merge( registry, json.decode( element.serialize( i ) ) );
			} else if ( !registry[ id ] ) {
				registry[ id ] = element.val( i );
			}
		} );

		if ( !string ) {
			result = registry;
		} else {
			result = "";

			utility.iterate( registry, ( v, k ) => {
				encode ? result += "&" + encodeURIComponent( k ) + "=" + encodeURIComponent( v ) : result += "&" + k + "=" + v;
			} );

			result = result.replace( regex.and, "?" );
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
	size: ( obj ) => {
		return [
			obj.offsetWidth + number.parse( obj.style.paddingLeft || 0 ) + number.parse( obj.style.paddingRight || 0 ) + number.parse( obj.style.borderLeft || 0 ) + number.parse( obj.style.borderRight || 0 ),
			obj.offsetHeight + number.parse( obj.style.paddingTop || 0 ) + number.parse( obj.style.paddingBottom || 0 ) + number.parse( obj.style.borderTop || 0 ) + number.parse( obj.style.borderBottom || 0 )
		];
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
	text: ( obj, arg ) => {
		let key = obj.textContent ? "textContent" : "innerText";
		let payload = {};
		let set = false;

		if ( typeof arg !== "undefined" ) {
			set = true;
			payload[ key ] = arg;
		}

		return set ? element.update( obj, payload ) : obj[ key ];
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
	 * obj.addEventListener( "click", ( ev ) => {
	 *   keigai.util.element.toggleClass( obj, "active" );
	 * }, false );
	 */
	toggleClass: ( obj, arg ) => {
		obj.classList.toggle( arg );

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
	update: ( obj, args ) => {
		utility.iterate( args, ( v, k ) => {
			if ( regex.element_update.test( k ) ) {
				obj[ k ] = v;
			} else if ( k === "class" ) {
				!string.isEmpty( v ) ? element.addClass( obj, v ) : element.removeClass( obj, "*" );
			} else if ( k.indexOf( "data-" ) === 0 ) {
				element.data( obj, k.replace( "data-", "" ), v );
			} else {
				element.attr( obj, k, v );
			}
		} );

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
	val: ( obj, value ) => {
		let ev = "input";
		let output;

		if ( value === undefined ) {
			if ( regex.radio_checkbox.test( obj.type ) ) {
				if ( string.isEmpty( obj.name ) ) {
					throw new Error( label.expectedProperty );
				}

				array.iterate( utility.dom( "input[name='" + obj.name + "']" ), ( i ) => {
					if ( i.checked ) {
						output = i.value;
						return false;
					}
				} );
			} else if ( regex.select.test( obj.type ) ) {
				output = null;
				array.iterate( element.find( obj, "option" ), ( i ) => {
					if ( i.selected === true ) {
						output = i.value;
						return false;
					}
				} );
			} else if ( obj.value ) {
				output = obj.value;
			} else if ( obj.placeholder ) {
				output = obj.placeholder === obj.innerText ? undefined : obj.innerText;
			} else {
				output = element.text( obj );
			}

			if ( output !== undefined ) {
				output = utility.coerce( output );

				if ( typeof output === "string" ) {
					output = string.trim( output );
				}
			} else {
				output = "";
			}
		} else {
			value = value.toString();

			if ( regex.radio_checkbox.test( obj.type ) ) {
				ev = "click";

				array.iterate( utility.dom( "input[name='" + obj.name + "']" ), ( i ) => {
					if ( i.value === value ) {
						i.checked = true;
						output = i;
						return false;
					}
				} );
			} else if ( regex.select.test( obj.type ) ) {
				ev = "change";

				array.iterate( element.find( obj, " option" ), ( i ) => {
					if ( i.value === value ) {
						i.selected = true;
						output = i;
						return false;
					}
				} );
			} else {
				obj.value !== undefined ? obj.value = value : element.text( obj, value );
			}

			element.dispatch( obj, ev );

			output = obj;
		}

		return output;
	}
};
