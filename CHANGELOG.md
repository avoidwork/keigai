# Change Log

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
