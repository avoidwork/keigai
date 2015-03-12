# Change Log

## 1.2.0
- Created `utility.equal(a, b)` which returns a `Boolean`
- Caching request headers with response for better garbage collection, updating multiple methods
- Refactoring `client.request()` to utilize `cache` better
- Fixing `client.headers()` parsing of `Allow` header
- Fixing `client.allows()` by sending correct parameters to `client.permissions()`, & enabling for all requests
- Refactored all `array.each()` statements to `array.iterate()`
- Fixing `array.iterate()` substitution by adding second parameter to arguments
- Caching array length in `array.iterator()`
- Removing unneeded assignments in `array.keepIf()`

## 1.1.5
- Removing support for IE9, as IE11 has significant market share
- Updating dependencies
- Fixing build process for nodejs 0.12.x, & `6to5` renaming to `babel`
- Changing all "safe" equality operators to identity operators for speed (spec = less ops)
- Fixing transpiler based errors by removing `this` references regardless of ensured scope (spec)
- Fixing prototype of `KXHR` such that `Deferred` methods are decorated
- Updating wired `DataStore` tests, such that they're stateless (avoids CSRF juggling)

## 1.1.4
- Created `array.iterate()` to iterate an `Array` using an `Iterator`
- Created `array.iterator()` to return an `Iterator` for an `Array`
- Added `benchmark.js`

## 1.1.3
- Moved more `variables` to `constants`
- Another pass of default parameter values

## 1.1.2
- Specifying default value of parameter for `utility.clone()`
- Specifying default value of parameter for `array.clone()`

## 1.1.1
- Fixing a reference error for `Buffer`, due to transpiling & not using a clean env for testing

## 1.1.0
- Refactored to ES6, utilizing `6to5` to transpile to ES5
- Creating ES6 build artifact in `/lib`
- Fixed memory leak in `DataListFilter`
- Fixed composition of a filtered `DataGrid`
- Refactored `Observable` hooks to avoid collisions
- Removed `array.fib()`, & `array.percents()`
- Refactored `utility.clone()` shallow path to avoid `json{}`
- Reformatted code

## 1.0.6
- Creating `element.addClass()`, & `element.removeClass()` facades of `element.klass()` for a familiar syntax
- Fixing `element.attr()` such that `optgroup` is supported
- Removing `id` assignment from `element.create()`
- Refactored to utilize `element.addClass()` & `element.removeClass()`

## 1.0.5
- Fixing `element.val()` such that `optgroup` is supported for getting the value

## 1.0.4
- Fixing documentation
- Exposing `utility.clearTimers()` as `util.clearTimers()`, to manage repeating timers created from `util.delay()`
- Refactored `utility.extend()` to create a `super` property on the output to reference call prototype methods from decorated methods
- Fixing `utility.merge()` when using `utility.extend()` to override a prototype method via `super`

## 1.0.3
- Exposing `utility.defer()` as `util.delay()`

## 1.0.2
- Fixing Internet Explorer detection via `navigator.userAgent`
- Fixing `utility.parse()` for Internet Explorer

## 1.0.1
- Switching to uglifyjs for minification
- Removing `typeof` conditional from a few iteration functions
- Added `bower.json`

## 1.0.0
- Removing `cache.clean()`
- Removing internal cache garbage collection, opting to rely on lazy expiration; disables 'long lived' behavior in node.js
- Updating `array.clone()` with an optional second parameter for disabling shallow copies
- Updating `utility.clone()` with deep cloning of `Arrays`

## 0.9.0
- Refactoring `store.set()` to implement `rfc6902` (JSONPatch)
- Fixing `store.setComplete()` when receiving `0` for the key, and for deltas
- Fixing `store.set()` such that a wired request will drop the query string
- Fixing `store.set()` such that it handles multiple response status codes (`3xx` series not supported atm)
- Fixing `store.dump()` such that numeric keys are re-cast to `Numbers`
- Created `DataStore` tests which are wired to an API

## 0.8.6
- Creating `array.eachReverse()` to simplify those times when you want to go backwards

## 0.8.5
- Fixing a flaw in `store.setIndexes()` such that duplicate values aren't created
- Fixing a MutationObserver event dispatch error
- Exposing `utility.genId()` as `util.genId()`

## 0.8.4
- Fixing async `teardown()`

## 0.8.3
- Creating `{listFiltered: true, listFilter: "some_field"}` option for `list()`

## 0.8.2
- Fixing `store.loaded` state upon restore
- Fixing `store.setComplete()` such that `store.autosave` doesn't save an individual record
- Changing `store.get()` such that records are clones, and not by reference (for sanity)
- Fixing a reference error in `list.teardown()`, and cleaning up the pagination elements (orphaned)
- Fixing `element.serialize()`

## 0.8.1
- Fixing `DataStore` "over the wire batch deletion" by creating a sparse array and compacting it upon completion before re-indexing
- Adding unit tests for `DataStore`

## 0.8.0
- Removing an unneeded initialization from `array.mode()`
- Refactoring `DataStores` to have multiple indexes via `store.index[]` & `store.indexes{}`
- Creating `store.setIndexes()` & wiring into `store.setComplete()` for non-batch operations
- Refactoring `store.reindex()` to fix sparse array shuffling, & wiring in `store.setIndexes()`
- Replacing `store.records.slice()` statements for `utility.clone( store.records )` for deep copies
- Removing API crawling / retrieval, too many issues with circular loops and very little value in this kind of 'auto-pilot'
- Removing `store.collections`, `store.depth`, `store.leafs` & `store.maxDepth` properties
- Refactoring `store.select()` to use `store.indexes` when predicates are `Boolean`, `Number` or `String` types
- Composite indexes are supported, but must be sorted alphabetically to align with `store.select()`, e.g. `"age|name"`

## 0.7.3
- Changing `store.setUri()` to create a `Basic Auth` header if one is absent & the URI contains a `user info` segment
- Replacing all deprecated `throw` statements in various `DataStore` methods with `defer.reject()` statements
- Fixing a reference error for a label

## 0.7.2
- Fixing `store.setComplete()` such that it doesn't create a `versions` cache if `store.versioning` is `false`

## 0.7.1
- Changing `client.request()` signature by removing the `success` & `failure` parameters to embrace the `Promise` API
- Fixing `store.batch()` when dealing with an Array of URIs

## 0.7.0
- Changing `client.request()` by removing the (last) parameter `timeout` & setting `x-request-with` header
- Updating `xhr.send()` by deleting `x-request-with` header if the value is `XMLHttpRequest`

## 0.6.8
- Changing how MongoDB collections are accessed from the driver to avoid an error from an evolving API

## 0.6.7
- Updating `string.trim()` to remove leading/trailing new lines
- Adding nested quote support to `csv.decode()`, updating test

## 0.6.6
- Ensuring DataStore versioning works when restoring from mongodb
- Adding an optional parameter to `data.set()` to overwrite the record in persistent storage
- Fixing reference errors in `store.delComplete()`

## 0.6.5
- Upgrading mongodb driver

## 0.6.4
- Rewriting `store.storage()`, & fixing mongodb interaction
- Fixing `store.clear()` such that it can erase persistent storage (mongodb collections)
- Fixing `store.setComplete()` such that `DataList` refreshing isn't tied to `DataStore` events

## 0.6.3
- Fixing `csv.decode()`

## 0.6.2
- Fixing `client.request()` by re-throwing an error if there is no handler defined
- Removing `server` check when coercing `payload` as the `instanceof` will work with the shim provided in `intro.js`

## 0.6.1
- Fixing `string.escape('/');`

## 0.6.0
- Moved `json.csv()` to `csv.encode()`
- Created `csv.decode()`
- Added automatic coercion for CSV/TSV documents retrieved with over HTTP

## 0.5.5
- Created `utility.curry()` as `keigai.util.curry()` to simplify currying
- Created `utility.partial()` as `keigai.util.partial()` to simplify partial applications

## 0.5.4
- Fixed a reference error in `store.delComplete()`
- Updated a docblock example

## 0.5.3
- Changing how a DataStore expires by firing 'beforeExpire' before the URI is expired from local cache

## 0.5.2
- Creating `utility.base()` to return an instance of Base, public as `keigai.util.base()`

## 0.5.1
- Removing 'race()' from unboxed 'Promise'
- Creating 'utility.race()' which wraps 'Promise.race()'


## 0.5.0
- Refactoring `promise.factory()` to use native `Promises`, & `utility.when()` to use `Promise.all()`
- Added node.js dependency for `Promise` shim
- Removed invalid `Deferred.isResolved()`, `Deferred.isRejected()`, & `Deferred.state()`

## 0.4.3
- Fix `utility.render()` by passing `requestAnimationFrame()` argument or closest millisecond, & change the fallback to a naive 16ms delay

## 0.4.2
- Fix `Observable.hook()` when called on non-DOM Objects
- Refactor `XMLHttpRequest` shim to use an `Observable` instance
- Created `Base.dispatchEvent()`

## 0.4.1
- Fixed `array.keySort()` when one side of the comparison is `undefined`

## 0.4.0
- Updating `client.headers()` to not cache responses which do not have an explicit expiration
- Created `utility.render()` to schedule DOM manipulation
- Refactored `list.refresh()` to render the difference on a render frame via `utility.render()`, & removed the `redraw` parameter
- Ensuring `DataStore` keys are `Strings`

## 0.3.6
- Fixing `store.setExpires()` ... old abaaso logic in place didn't work with the new `LRU` cache

## 0.3.5
- Fixing `utility.when()` to handle the new `KXMLHttpRequest` type
- Changing `KXMLHttpRequest` instances to be decorated with the `defer` property for `utility.when()`

## 0.3.4
- DataGrid CSS tweak to add ellipsis by default
- Replacing "-" or "_" in DataGrid header row with " "

## 0.3.3
- Refactoring `array.keySort()` to be 'safe'

## 0.3.2
- Refactoring `utility.walk()` to be 'safe'
- Fixing `list.refresh()` such that it can deal with `undefined` returned from `utility.walk()`

## 0.3.1
- Extending `array.keySort()` to support deep sorting

## 0.3.0
- Refactored `client.request()` to utilize a `KXMLHttpRequest` instance which is basically an `observable` with `deferred` methods, and it contains the original `XMLHttpRequest` to maintain the existing API; `beforeXHR` & `afterXHR` events are now present

## 0.2.19
- Fixing sending Buffers over the wire

## 0.2.18
- Fixing the error message returned from `client.request()`, such that it's the server response if supplied
- Fixing `content-length` header decoration for outbound requests

## 0.2.17
- Fixing XHR shim for node.js
- Fixing XHR 201 handling

## 0.2.16
- Fixing URL parsing

## 0.2.15
- Fixing error handling in XHR requests

## 0.2.14
- Fixing `DataStore.setComplete()` when receiving an Array of URIs

## 0.2.13
- Fixing `element.dispatch()`, `utility.delay()`, `DataStore.select()`, & `DataStore.sort()` for Internet Explorer 10
- Created `utility.blob()`, & `utility.worker()` to maintain DRY

## 0.2.12
- Updating `filter.factory()` to set the `type` of the `input`

## 0.2.11
- Fixing `DataStore.batch()` refresh of related `DataList` instances when doing back to back batch "sets" (e.g. sync with an API, & then batch "set" local data, subverting the feedback loop)

## 0.2.10
- Fixing `Base` inheritance with an abstract `observer`, which is initialized within constructors

## 0.2.9
- Created `Base` & `base.factory()`
- Refactored `DataGrid`, `DataList`, `DataListFilter`, & `DataStore` to extend `Base`
- Marking `DataList.constructor` as @private

## 0.2.8
- Updated docblocks, & added examples
- Fixed `array.split()`, & `Observable.unhook()`
- Defaulting second parameter of `client.request()` to `GET`
- Removed `client.script()`, `client.size()`, & `client.stylesheet()`
- Added `addEventListener()`, `removeEventListener()`, & `removeListener()` facades on prototypes for consistent APIs
- Created `DataGrid.add()`, `DataGrid.remove()`, & `DataGrid.update()` as a simple abstraction of the underlying `DataStore`
- Created `DataList.add()`, `DataList.remove()`, & `DataList.update()` as a simple abstraction of the underlying `DataStore`
- Exposed `keigai.util.repeat()`

## 0.2.7
- Fixed alignment mistakes
- Fixed docblocks
- Added a JSDoc3 template for documentation
- Renamed `keigai.util.el` to `keigai.util.element`

## 0.2.6
- Refactored `cache{}` to be an abstraction around an `LRU` instance, with a max size of 500

## 0.2.5
- Fixing `DataStore.setComplete()` handling of key
- Removing an unneeded variable from `client.request()`
- Removing timeout on `setSocketKeepAlive()` within node.js XHR shim
- Made other minor changes to the XHR shim

## 0.2.4
- Implemented all `abaaso.array` methods
- Implemented `abaaso.math`
- Added `client.script()`, `client.scroll()`, `client.scrollTo()`, `client.scrollPos()`, `client.size()`, & `client.stylesheet()`
- Added `element.appendTo()`, `element.clear()`, `element.disable()`, `element.enable()`, `element.has()`, `element.hidden()`, `element.position()`, `element.removeAttr()`, `element.scrollTo()`, `element.serialize()`, `element.size()`, & `element.toggleClass()`
- Added `number.even()`, `number.half()`, `number.odd()`, `number.random()`, & `number.round()`
- Added `string.hyphenate()`, `string.singular()`, `string.toFunction()`, & `string.uncapitalize()`
- Updated `keigai.utils`
- Fixed some `label` reference errors
- Added `nodeunit` unit tests

## 0.2.3
- Fixing `client.headers()` by trimming values
- Created `el.css(obj, key, value)`, & `el.html( obj[, arg] )` to manipulate CSS attributes of DOM Elements
- Created `element.is()` for easy testing of DOM elements
- Created `regex.caps` to test strings for capital letters
- Created `number.format()` to create formatted strings from numbers,
- Added `number` to `keigai.util`

## 0.2.2
- Created `keigai.util` to expose utility methods

## 0.2.1
- Setting `key` argument in `DataStore.setComplete()` to correct an erroneous PUT to an API

## 0.2.0
- Created `MutationObserver` on `DataList`.`mutation`, which dispatches `change` events
- Created `DataGrid` `change` event, also dispatches from `DataGrid.element`
- Created `DataGrid` `beforeFilter` event, also dispatches from `DataGrid.element`
- Created `DataGrid` `afterFilter` event, also dispatches from `DataGrid.element`
- Created `DataGrid` `beforeRefresh` event, also dispatches from `DataGrid.element`
- Created `DataGrid` `afterRefresh` event, also dispatches from `DataGrid.element`
- Created `DataList` `change` event, also dispatches from `DataList.element`
- Created `DataList` `beforeFilter` event, also dispatches from `DataList.element`
- Created `DataList` `afterFilter` event, also dispatches from `DataList.element`
- Created `DataList` `beforeRefresh` event, also dispatches from `DataList.element`
- Created `DataList` `afterRefresh` event, also dispatches from `DataList.element`

## 0.1.8
- Fixing `DataStore.crawl()` reference error
- Removing an unused property from `DataStores`

## 0.1.7
- Fixing `element.val()` for Firefox

## 0.1.6
- Clearing `DataStore.views` from `DataStore.setComplete()`
- Updating all `DataList.refresh()` calls to not clear cached views
- Adding SASS source & CSS output files for DataGrids
- Adding a `placeholder` attribute to the optional `DataListFilter` instantiated from a `DataGrid`

## 0.1.5
- Terminating web workers, so they're short lived

## 0.1.4
- Adding error handling to `DataStore.select()` and `DataStore.sort()` when Web Workers are leveraged

## 0.1.3
- Fixing `DataStore.select()` Worker code path

## 0.1.2
- Standardized `DataStores` to use `dispatch()` for events
- Fixing a reference error in `grid.factory()`
- Implemented observer events that were missed in 0.1.1

## 0.1.1
- Implemented `keigai.filter()`, `keigai.list()`, `keigai.grid()`, & `keigai.store()`

## 0.1.0
- Initial version, forked from `abaaso:pre-4.0`
