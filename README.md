# keigai

keigai is a lightweight data store library featuring two way binding, 1-n reactive views, MVCC inspired versioning & API abstraction.

keigai has no dependencies, and offers a pluggable data store solution for any architecture by using a pub/sub (observer) paradigm for external hooks into UIs, and other work flows.

## Example
This example shows a how a data store can have many reactive UI components linked to it. This is running on http://keigai.io

```javascript
var fields  = ["name", "age"],
    options = {pageSize: 5, order: "age desc, name"},
    store   = keigai.store(),
    list    = keigai.list( document.querySelector( "#create-list" ), store, "{{name}}", {order: "name"} ),
    grid    = keigai.grid( document.querySelector( "#create-grid" ), store, fields, fields, options, true);

store.setUri( "data.json" );
```

## API

### filter (target, list, filters[, debounce])
Returns a DataListFilter instance. DataListFilters provide a fast & easy way for the end user to refine the contents of a DataList or DataGrid. Wildcards are supported.

### grid (target, store, fields[, sortable, options, filtered, debounce])
Returns a DataGrid instance. DataGrids combine DataStores, DataLists, & DataListFilters into fast & responsive tabular representations.

### list (target, store, template[, options])
Returns a DataList instance. DataLists are the core visual representation of a DataStore, using "handle bar" style templates.

### store ([data, options])
Returns a DataStore instance. DataStores are in ram NoSQL databases, with many features found in SQL databases, such as JOINs, ORDER BYs, & WHERE clauses.

DataStores can be wired to an API through the `setUri()` method, which hooks them into the feedback loop. If you "set" or "delete" a record, the operation doesn't complete until the API provides a "success" or "failure" response.

Deferreds (Promises) are returned from methods that can "go over the wire", for easy handling of the asynchronous communication.

### util
Utility belt of functions for manipulating data & the DOM.
