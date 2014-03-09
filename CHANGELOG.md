# Change Log

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
