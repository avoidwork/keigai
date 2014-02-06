# Change Log

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
