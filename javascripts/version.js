( function ( keigai ) {
var $        = keigai.util.$,
    element  = keigai.util.element,
    $version = $( "#version" )[0];

if ( $version !== undefined ) {
	element.html( $version, keigai.version );
}
} )( keigai );
