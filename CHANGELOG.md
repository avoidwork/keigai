# Change Log

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
