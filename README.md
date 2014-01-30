# keigai

Lightweight data store library featuring two way binding & 1-n views. 

keigai has no dependencies, and offers a pluggable data store solution for any architecture by using a pub/sub (observer) paradigm for external hooks into UIs, and other work flows.

## API

### grid(target, store, fields[, sortable, options, filtered, debounce])
Returns a DataGrid instance. DataGrids combine DataStores, DataLists, & DataListFilters into fast & responsive tabular representations.

### list(target, store, template[, options])
Returns a DataList instance. DataLists are the core visual representation of a DataStore, using "handle bar" style templates.

### store([data, options])
Returns a DataStore instance. DataStores are in ram NoSQL databases, with many features found in SQL databases, such as JOINs, ORDER BYs, & WHERE clauses.

DataStores can be wired to an API through the `setUri()` method, which hooks them into the feedback loop. If you "set" or "delete" a record, the operation doesn't complete until the API provides a "success" or "failure" response.

Deferreds (Promises) are returned from methods that can "go over the wire", for easy handling of the asynchronous communication.