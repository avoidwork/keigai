( function ( document ) {
	var fields  = ["name", "age"],
	    options = {pageSize: 5, order: "age desc, name"},
	    store   = keigai.store(),
        list    = keigai.list( document.querySelector( "#create-list" ), store, "{{name}}", {order: "name"} ),
        grid    = keigai.grid( document.querySelector( "#create-grid" ), store, fields, fields, options, true);

	store.setUri( "data.json" );
})( document );
