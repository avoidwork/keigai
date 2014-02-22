/**
 * @namespace element
 * @private
 */
var element = {
	/**
	 * Appends `a` in `b`
	 *
	 * @memberOf appendTo
	 * @memberOf element
	 * @param  {Object} a Element being appended
	 * @param  {Object} b Element being appended to
	 * @return {Object}   Element being appended to
	 */
	appendTo : function ( a, b ) {
		b.appendChild( a );

		return b;
	},

	/**
	 * Gets or sets an Element attribute
	 *
	 * @method attr
	 * @memberOf element
	 * @param  {Mixed}  obj   Element
	 * @param  {String} name  Attribute name
	 * @param  {Mixed}  value Attribute value
	 * @return {Object}       Element
	 */
	attr : function ( obj, key, value ) {
		var target, result;

		if ( regex.svg.test( obj.namespaceURI ) ) {
			if ( value === undefined ) {
				result = obj.getAttributeNS( obj.namespaceURI, key );

				if ( result === null || string.isEmpty( result ) ) {
					result = undefined;
				}
				else {
					result = utility.coerce( result );
				}
			}
			else {
				obj.setAttributeNS( obj.namespaceURI, key, value );
			}
		}
		else {
			if ( typeof value == "string" ) {
				value = string.trim( value );
			}

			if ( regex.checked_disabled.test( key ) && value === undefined ) {
				return utility.coerce( obj[key] );
			}
			else if ( regex.checked_disabled.test( key ) && value !== undefined ) {
				obj[key] = value;
			}
			else if ( obj.nodeName === "SELECT" && key === "selected" && value === undefined ) {
				return utility.dom( "#" + obj.id + " option[selected=\"selected\"]" )[0] || utility.dom( "#" + obj.id + " option" )[0];
			}
			else if ( obj.nodeName === "SELECT" && key === "selected" && value !== undefined ) {
				target = utility.dom( "#" + obj.id + " option[selected=\"selected\"]" )[0];

				if ( target !== undefined ) {
					target.selected = false;
					target.removeAttribute( "selected" );
				}

				target = utility.dom( "#" + obj.id + " option[value=\"" + value + "\"]" )[0];
				target.selected = true;
				target.setAttribute( "selected", "selected" );
			}
			else if ( value === undefined ) {
				result = obj.getAttribute( key );

				if ( result === null || string.isEmpty( result ) ) {
					result = undefined;
				}
				else {
					result = utility.coerce( result );
				}

				return result;
			}
			else {
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
	 * @param  {Mixed} obj Element
	 * @return {Object}    Element
	 */
	clear : function ( obj ) {
		if ( typeof obj.reset == "function" ) {
			obj.reset();
		}
		else if ( obj.value !== undefined ) {
			element.update( obj, {innerHTML: "", value: ""} );
		}
		else {
			element.update( obj, {innerHTML: ""} );
		}

		return obj;
	},

	/**
	 * Creates an Element in document.body or a target Element.
	 * An id is generated if not specified with args.
	 *
	 * @method create
	 * @memberOf element
	 * @param  {String} type   Type of Element to create, or HTML String
	 * @param  {Object} args   [Optional] Properties to set
	 * @param  {Mixed}  target [Optional] Target Element
	 * @param  {Mixed}  pos    [Optional] "first", "last" or Object describing how to add the new Element, e.g. {before: referenceElement}
	 * @return {Mixed}         Element that was created, or an Array if `type` is a String of multiple Elements (frag)
	 */
	create : function ( type, args, target, pos ) {
		var svg  = false,
		    frag = false,
		    obj, uid, result;

		// Removing potential HTML template formatting
		type = type.replace( /\t|\n|\r/g, "" );

		if ( target ) {
			svg = target.namespaceURI && regex.svg.test( target.namespaceURI );
		}
		else {
			target = document.body;
		}
		
		if ( args instanceof Object && args.id && !utility.dom( "#" + args.id ) ) {
			uid = args.id;
			delete args.id;
		}
		else if ( !svg ) {
			uid = utility.genId( undefined, true );
		}

		// String injection, create a frag and apply it
		if ( regex.html.test( type ) ) {
			frag   = true;
			obj    = element.frag( type );
			result = obj.childNodes.length === 1 ? obj.childNodes[0] : array.cast( obj.childNodes );
		}
		// Original syntax
		else {
			if ( !svg && !regex.svg.test( type ) ) {
				obj = document.createElement( type );
			}
			else {
				obj = document.createElementNS( "http://www.w3.org/2000/svg", type );
			}

			if ( uid ) {
				obj.id = uid;
			}

			if ( args instanceof Object ) {
				element.update( obj, args );
			}
		}

		if ( !pos || pos === "last" ) {
			target.appendChild( obj );
		}
		else if ( pos === "first" ) {
			element.prependChild( target, obj );
		}
		else if ( pos === "after" ) {
			pos = {};
			pos.after = target;
			target    = target.parentNode;
			target.insertBefore( obj, pos.after.nextSibling );
		}
		else if ( pos.after ) {
			target.insertBefore( obj, pos.after.nextSibling );
		}
		else if ( pos === "before" ) {
			pos = {};
			pos.before = target;
			target     = target.parentNode;
			target.insertBefore( obj, pos.before );
		}
		else if ( pos.before ) {
			target.insertBefore( obj, pos.before );
		}
		else {
			target.appendChild( obj );
		}

		return !frag ? obj : result;
	},

	/**
	 * Gets or sets a CSS style attribute on an Element
	 *
	 * @method css
	 * @param  {Mixed}  obj   Element
	 * @param  {String} key   CSS to put in a style tag
	 * @param  {String} value [Optional] Value to set
	 * @return {Object}       Element
	 */
	css : function ( obj, key, value ) {
		if ( !regex.caps.test( key ) ) {
			key = string.toCamelCase( key );
		}

		if ( value !== undefined ) {
			obj.style[key] = value;
			return obj;
		}
		else {
			return obj.style[key];
		}
	},

	/**
	 * Data attribute facade acting as a getter (with coercion) & setter
	 *
	 * @method data
	 * @memberOf element
	 * @param  {Mixed}  obj   Element
	 * @param  {String} key   Data key
	 * @param  {Mixed}  value Boolean, Number or String to set
	 * @return {Mixed}        undefined, Element or value
	 */
	data : function ( obj, key, value ) {
		if ( value !== undefined ) {
			obj.setAttribute( "data-" + key, regex.json_wrap.test( value ) ? json.encode( value ) : value );

			return obj;
		}
		else {
			return utility.coerce( obj.getAttribute( "data-" + key ) );
		}
	},

	/**
	 * Destroys an Element
	 *
	 * @method destroy
	 * @memberOf element
	 * @param  {Mixed} obj Element
	 * @return {Undefined} undefined
	 */
	destroy : function ( obj ) {
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
	 * @param  {Mixed} obj Element
	 * @return {Object}    Element
	 */
	disable : function ( obj ) {
		if ( typeof obj.disabled == "boolean" && !obj.disabled ) {
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
	 * @param  {Object}  data       Data to include with the Event
	 * @param  {Boolean} bubbles    [Optional] Determines if the Event bubbles, defaults to `true`
	 * @param  {Boolean} cancelable [Optional] Determines if the Event can be canceled, defaults to `true`
	 * @return {Object}             Element which dispatches the Event
	 */
	dispatch : function ( obj, type, data, bubbles, cancelable ) {
		var ev = new CustomEvent( type );

		bubbles    = ( bubbles    !== false );
		cancelable = ( cancelable !== false );

		ev.initCustomEvent( type, bubbles, cancelable, data || {} );
		obj.dispatchEvent( ev );

		return obj;
	},

	/**
	 * Enables an Element
	 *
	 * @method enable
	 * @memberOf element
	 * @param  {Mixed} obj Element
	 * @return {Object}    Element
	 */
	enable : function ( obj ) {
		if ( typeof obj.disabled == "boolean" && obj.disabled ) {
			obj.disabled = false;
		}

		return obj;
	},

	/**
	 * Finds descendant childNodes of Element matched by arg
	 *
	 * @method find
	 * @memberOf element
	 * @param  {Mixed}  obj Element to search
	 * @param  {String} arg Comma delimited string of descendant selectors
	 * @return {Mixed}      Array of Elements or undefined
	 */
	find : function ( obj, arg ) {
		var result = [];

		utility.genId( obj, true );

		array.each( string.explode( arg ), function ( i ) {
			result = result.concat( utility.dom( "#" + obj.id + " " + i ) );
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
	 */
	frag : function ( arg ) {
		var obj = document.createDocumentFragment();

		if ( arg ) {
			array.each( array.cast( element.create( "div", {innerHTML: arg}, obj ).childNodes ), function ( i ) {
				obj.appendChild( i );
			} );

			obj.removeChild( obj.childNodes[0] );
		}

		return obj;
	},

	/**
	 * Determines if Element has descendants matching arg
	 *
	 * @method has
	 * @memberOf element
	 * @param  {Mixed}   obj Element or Array of Elements or $ queries
	 * @param  {String}  arg Type of Element to find
	 * @return {Boolean}     True if 1 or more Elements are found
	 */
	has : function ( obj, arg ) {
		var result = element.find( obj, arg );

		return ( !isNaN( result.length ) && result.length > 0 );
	},

	/**
	 * Determines if obj has a specific CSS class
	 *
	 * @method hasClass
	 * @memberOf element
	 * @param  {Mixed} obj Element
	 * @return {Mixed}     Element, Array of Elements or undefined
	 */
	hasClass : function ( obj, klass ) {
		return obj.classList.contains( klass );
	},

	/**
	 * Returns a Boolean indidcating if the Object is hidden
	 *
	 * @method hidden
	 * @memberOf element
	 * @param  {Mixed} obj Element
	 * @return {Boolean}   `true` if hidden
	 */
	hidden : function ( obj ) {
		return obj.style.display === "none" || ( typeof obj.hidden == "boolean" && obj.hidden );
	},

	/**
	 * Gets or sets an Elements innerHTML
	 *
	 * @method html
	 * @param  {Object} obj Element
	 * @param  {String} arg [Optional] innerHTML value
	 * @return {Object}     Element
	 */
	html : function ( obj, arg ) {
		if ( arg === undefined ) {
			return obj.innerHTML;
		}
		else {
			 obj.innerHTML = arg;
			 return obj;
		}
	},

	/**
	 * Determines if Element is equal to arg, supports nodeNames & CSS2+ selectors
	 *
	 * @method is
	 * @param  {Mixed}   obj Element
	 * @param  {String}  arg Property to query
	 * @return {Boolean}     True if a match
	 */
	is : function ( obj, arg ) {
		if ( regex.selector_is.test( arg ) ) {
			return ( element.find( obj.parentNode, obj.nodeName.toLowerCase() + arg ).filter( function ( i ) {
				return i.id === obj.id;
			} ).length === 1 );
		}
		else {
			return new RegExp( arg, "i" ).test( obj.nodeName );
		}
	},

	/**
	 * Adds or removes a CSS class
	 *
	 * @method klass
	 * @memberOf element
	 * @param  {Mixed}   obj Element
	 * @param  {String}  arg Class to add or remove ( can be a wildcard )
	 * @param  {Boolean} add Boolean to add or remove, defaults to true
	 * @return {Object}      Element
	 */
	klass : function ( obj, arg, add ) {
		add = ( add !== false );
		arg = string.explode( arg, " " );

		if ( add ) {
			array.each( arg, function ( i ) {
				obj.classList.add( i );
			} );
		}
		else {
			array.each( arg, function ( i ) {
				if ( i !== "*" ) {
					obj.classList.remove( i );
				}
				else {
					array.each( obj.classList, function ( x ) {
						this.remove( x );
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
	 * @param  {Mixed} obj Element
	 * @return {Array}     Coordinates [left, top, right, bottom]
	 */
	position : function ( obj ) {
		obj = obj || document.body;
		var left, top, right, bottom, height, width;

		left   = top = 0;
		width  = obj.offsetWidth;
		height = obj.offsetHeight;

		if ( obj.offsetParent ) {
			top    = obj.offsetTop;
			left   = obj.offsetLeft;

			while ( obj = obj.offsetParent ) {
				left += obj.offsetLeft;
				top  += obj.offsetTop;
			}

			right  = document.body.offsetWidth  - ( left + width );
			bottom = document.body.offsetHeight - ( top  + height );
		}
		else {
			right  = width;
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
	 */
	prependChild : function ( obj, child ) {
		return obj.childNodes.length === 0 ? obj.appendChild( child ) : obj.insertBefore( child, obj.childNodes[0] );
	},

	/**
	 * Removes an Element attribute
	 *
	 * @method removeAttr
	 * @memberOf element
	 * @param  {Mixed}  obj Element
	 * @param  {String} key Attribute name
	 * @return {Object}     Element
	 */
	removeAttr : function ( obj, key ) {
		var target;

		if ( regex.svg.test( obj.namespaceURI ) ) {
			obj.removeAttributeNS( obj.namespaceURI, key );
		}
		else {
			if ( obj.nodeName === "SELECT" && key === "selected") {
				target = utility.dom( "#" + obj.id + " option[selected=\"selected\"]" )[0];

				if ( target ) {
					target.selected = false;
					target.removeAttribute( "selected" );
				}
			}
			else {
				obj.removeAttribute( key );
			}
		}

		return obj;
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
	 */
	scrollTo : function ( obj, ms, offsetTop, offsetLeft ) {
		var pos = array.remove( element.position( obj ), 2, 3 );

		if ( !isNaN( offsetTop ) ) {
			pos[0] += offsetTop;
		}

		if ( !isNaN( offsetLeft ) ) {
			pos[1] += offsetLeft;
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
	 */
	serialize : function ( obj, string, encode ) {
		string       = ( string === true );
		encode       = ( encode !== false );
		var children = [],
		    registry = {},
		    result;

		children = obj.nodeName === "FORM" ? ( obj.elements ? array.cast( obj.elements ) : obj.find( "button, input, select, textarea" ) ) : [obj];

		array.each( children, function ( i ) {
			if ( i.nodeName === "FORM" ) {
				utility.merge( registry, json.decode( element.serialize( i ) ) );
			}
			else if ( !registry[i.name] ) {
				registry[i.name] = element.val( i );
			}
		} );

		if ( !string ) {
			result = json.encode( registry );
		}
		else {
			result = "";

			utility.iterate( registry, function ( v, k ) {
				encode ? result += "&" + encodeURIComponent( k ) + "=" + encodeURIComponent( v ) : result += "&" + k + "=" + v;
			} );

			result = result.replace( regex.and, "?" );
		}

		return result;
	},

	/**
	 * Returns the size of the Object
	 *
	 * @method size
	 * @memberOf element
	 * @param  {Mixed} obj Element
	 * @return {Object}    Size {height: n, width:n}
	 */
	size : function ( obj ) {
		return {
			height : obj.offsetHeight + number.parse( obj.style.paddingTop  || 0 ) + number.parse( obj.style.paddingBottom || 0 ) + number.parse( obj.style.borderTop  || 0 ) + number.parse( obj.style.borderBottom || 0 ),
			width  : obj.offsetWidth  + number.parse( obj.style.paddingLeft || 0 ) + number.parse( obj.style.paddingRight  || 0 ) + number.parse( obj.style.borderLeft || 0 ) + number.parse( obj.style.borderRight  || 0 )
		};
	},

	/**
	 * Getter / setter for an Element's text
	 *
	 * @method text
	 * @memberOf element
	 * @param  {Object} obj Element
	 * @param  {String} arg [Optional] Value to set
	 * @return {Object}     Element
	 */
	text : function ( obj, arg ) {
		var key     = obj.textContent ? "textContent" : "innerText",
		    payload = {},
		    set     = false;

		if ( typeof arg != "undefined" ) {
			set          = true;
			payload[key] = arg;
		}

		return set ? element.update( obj, payload ) : obj[key];
	},

	/**
	 * Toggles a CSS class
	 *
	 * @method toggleClass
	 * @memberOf element
	 * @param  {Object} obj Element, or $ query
	 * @param  {String} arg CSS class to toggle
	 * @return {Object}     Element
	 */
	toggleClass : function ( obj, arg ) {
		obj.classList.toggle( arg );

		return obj;
	},

	/**
	 * Updates an Element
	 *
	 * @method update
	 * @memberOf element
	 * @param  {Mixed}  obj  Element
	 * @param  {Object} args Properties to set
	 * @return {Object}      Element
	 */
	update : function ( obj, args ) {
		utility.iterate( args, function ( v, k ) {
			if ( regex.element_update.test( k ) ) {
				obj[k] = v;
			}
			else if ( k === "class" ) {
				!string.isEmpty( v ) ? element.klass( obj, v ) : element.klass( obj, "*", false );
			}
			else if ( k.indexOf( "data-" ) === 0 ) {
				element.data( obj, k.replace( "data-", "" ), v );
			}
			else {
				element.attr ( obj, k, v );
			}
		} );

		return obj;
	},

	/**
	 * Gets or sets the value of Element
	 *
	 * @method val
	 * @memberOf element
	 * @param  {Mixed}  obj   Element
	 * @param  {Mixed}  value [Optional] Value to set
	 * @return {Object}       Element
	 */
	val : function ( obj, value ) {
		var ev = "input",
		    output;

		if ( value === undefined ) {
			if ( regex.radio_checkbox.test( obj.type ) ) {
				if ( string.isEmpty( obj.name ) ) {
					throw new Error( label.expectedProperty );
				}

				array.each( utility.dom( "input[name='" + obj.name + "']" ), function ( i ) {
					if ( i.checked ) {
						output = i.value;
						return false;
					}
				} );
			}
			else if ( regex.select.test( obj.type ) ) {
				output = obj.options[obj.selectedIndex].value;
			}
			else if ( obj.value ) {
				output = obj.value;
			}
			else {
				output = element.text( obj );
			}

			if ( output !== undefined ) {
				output = utility.coerce( output );

				if ( typeof output == "string" ) {
					output = string.trim( output );
				}
			}
			else {
				output = "";
			}
		}
		else {
			value = value.toString();

			if ( regex.radio_checkbox.test( obj.type ) ) {
				ev = "click";

				array.each( utility.dom( "input[name='" + obj.name + "']" ), function ( i ) {
					if ( i.value === value ) {
						i.checked = true;
						output = i;
						return false;
					}
				} );
			}
			else if ( regex.select.test( obj.type ) ) {
				ev = "change";

				array.each( element.find( obj, "> *" ), function ( i ) {
					if ( i.value === value ) {
						i.selected = true;
						output = i;
						return false;
					}
				} );
			}
			else {
				obj.value !== undefined ? obj.value = value : element.text( obj, value );
			}

			element.dispatch( obj, ev );

			output = obj;
		}

		return output;
	}
};
