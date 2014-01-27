/**
 * @namespace element
 * @private
 */
var element = {
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
		observer.remove( obj );

		if ( obj.parentNode !== null ) {
			obj.parentNode.removeChild( obj );
		}

		return undefined;
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
	 * Determines if Element is equal to arg, supports nodeNames & CSS2+ selectors
	 *
	 * @method is
	 * @memberOf element
	 * @param  {Mixed}   obj Element
	 * @param  {String}  arg Property to query
	 * @return {Boolean}     True if a match
	 */
	is : function ( obj, arg ) {
		if ( regex.selector_is.test( arg ) ) {
			utility.id( obj );
			return ( element.find( obj.parentNode, obj.nodeName.toLowerCase() + arg ).filter( function ( i ) {
				return ( i.id === obj.id );
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
	 * Updates an Element
	 *
	 * @method update
	 * @memberOf element
	 * @param  {Mixed}  obj  Element
	 * @param  {Object} args Properties to set
	 * @return {Object}      Element
	 */
	update : function ( obj, args ) {
		args = args || {};

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
			else if ( k === "id" ) {
				var o = observer.listeners;

				if ( o[obj.id] ) {
					o[k] = o[obj.id];
					delete o[obj.id];
				}
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
			}

			if ( typeof output == "string" ) {
				output = string.trim( output );
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
