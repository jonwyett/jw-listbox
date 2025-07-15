# JwListBox API Reference

Welcome to the complete API reference for JwListBox. This document provides detailed information on the component's public methods, options, and events. For a quick start and overview, please see the [README.md](README.md) file.

## Table of Contents

-   [Core Concepts](#1-core-concepts-the-headless-ui-philosophy)
-   [Initialization](#2-initialization)
-   [Configuration (Setters)](#3-configuration-setters)
    -   [Data & Display](#data--display)
    -   [Behavior & Selection](#behavior--selection)
    -   [Styling & Theming](#styling--theming)
-   [Data Operations](#4-data-operations)
-   [Selection API](#5-selection-api)
-   [Data Retrieval (Getters)](#6-data-retrieval-getters)
-   [Advanced Formatting](#7-advanced-formatting)
-   [Event Handling](#8-event-handling)
    -   [Interaction Events](#interaction-events)
    -   [Lifecycle Events](#lifecycle-events)
-   [Special Modes & Utilities](#9-special-modes--utilities)

---

## 1. Core Concepts: The Headless UI Philosophy

JwListBox is designed as a "headless" component. It provides a powerful engine for data rendering and state management but is unopinionated about surrounding UI controls like search boxes or pagination. You control the listbox through its comprehensive API, giving you 100% flexibility over your application's layout and logic.

A key concept is the separation of the master dataset (`dm`) from the visible dataset (`viewDm`).

-   **`listbox.dm`**: A public `DataMaster` instance holding the complete, original dataset. Perform complex, non-visual queries here.
-   **`listbox.viewDm`**: A public `DataMaster` instance holding the data currently being rendered (after sorting/filtering). The component's `.render()` method reads exclusively from this instance.

## 2. Initialization

### `new JwListBox(parent, [options])`

Initializes a new JwListBox instance.

-   **`parent`** `(string|HTMLElement)`: A CSS selector string or a direct DOM element reference for the container where the listbox will be injected. This container should have a defined size (e.g., `height: 400px`) and will have its `position` set to `relative` if it is currently `static`.
-   **`[options]`** `(Object)`: An optional configuration object. Any valid option can be set here, corresponding to the available `.set...()` methods (e.g., `{ source: myData, idField: 'id' }`).

**Example (Simple):**
```javascript
const listbox = new JwListBox('#my-list-container');
```

**Example (With Options):**
```javascript
const listbox = new JwListBox('#app', {
  source: myInitialData,
  idField: 'userId',
  displayMode: 'grid',
  useDefaultStyles: true
});
```

---

## 3. Configuration (Setters)

All setter methods are chainable (they return `this`).

### Data & Display

#### `.setSource(data, [options])`
Sets the data source for the listbox. This will replace any existing data. Auto-detects the format of the `data` parameter.

-   **`data`** `(Array<Object>|Array<Array>|string|DataMaster)`: The data to display. Can be a recordset, a table, a CSV string, or a pre-existing `DataMaster` instance.
-   **`[options]`** `(Object)`: Options passed directly to the `DataMaster` factory methods (e.g., `{ headers: ['name', 'age'] }` for table data).

**Example:**
```javascript
// From a recordset (array of objects)
listbox.setSource(myData);

// From a table (array of arrays) with headers
listbox.setSource([['id', 'name'], [1, 'Alice']], { headersInFirstRow: true });

// From a CSV string
const csvData = "id,name\n1,Alice\n2,Bob";
listbox.setSource(csvData, { headersInFirstRow: true });
```

#### `.setDisplayMode(mode)`
Sets the display mode.
-   **`mode`** `(string)`: `'list'` (renders a `<ul>`) or `'grid'` (renders a `<table>`).

#### `.setTemplate(template)`
Sets the HTML template to use when `displayMode` is `'list'`.
-   **`template`** `(string|HTMLElement)`: An HTML string, a CSS selector for a `<template>` tag (preferred), or a CSS selector for a `<div>`.

#### `.setPrintTemplate(template)`
Sets a separate HTML template to be used when `printMode()` is activated.
-   **`template`** `(string|HTMLElement)`: Template source, same as `.setTemplate()`.

#### `.setIdField(fieldName)`
Sets which field from your source data should be used as the primary public identifier for rows.
-   **`fieldName`** `(string|null)`: The name of the field. If `null` or the field is not found, the row's 0-based index will be used.

#### `.setShowTableHeaders(enabled)`
Shows or hides the `<thead>` in `'grid'` mode.
-   **`enabled`** `(boolean)`: `true` to show headers (default), `false` to hide them.

#### `.setColumnWidths(widths)`
Sets column widths for `'grid'` mode.
-   **`widths`** `(Object)`: An object mapping field names to CSS width values (e.g., `{ name: '200px', email: '30%' }`).

### Behavior & Selection

#### `.setClickToSelect(enabled)`
Enables or disables the default behavior where clicking a row selects it.
-   **`enabled`** `(boolean)`: `true` (default) enables selection on click. If `false`, a `click` event is still emitted, but the selection state is not changed automatically.

#### `.setSelectionMode(mode)`
Sets how clicks interact with multi-selection.
-   **`mode`** `(string)`:
    -   `'replace'` (default): A standard click replaces the selection. Ctrl/Cmd+click toggles selection for a single row. Shift+click performs a range selection.
    -   `'toggle'`: Every standard click toggles the selection state of the clicked row.

#### `.setAutoSelectFirst(enabled)`
Automatically selects the first row in the list when data is loaded or changed.
-   **`enabled`** `(boolean)`: `true` to enable, `false` (default) to disable.

#### `.setAutoSectionHide(enabled)`
In `'grid'` mode with sections, this controls if clicking a section header automatically toggles its collapsed/expanded state.
-   **`enabled`** `(boolean)`: `true` to enable, `false` (default) to disable.

#### `.setClickOnCells(enabled)`
Controls whether a separate `cellClick` event is emitted in addition to the `click` event when a cell is clicked in `'grid'` mode.
-   **`enabled`** `(boolean)`: `true` to enable `cellClick` events, `false` (default) to disable.

### Styling & Theming

#### `.setUseDefaultStyles(useStyles)`
Controls whether the default cosmetic styles (colors, padding, etc.) are applied.
-   **`useStyles`** `(boolean)`: `true` (default) to apply styles. `false` provides a "blank slate" with only structural CSS, perfect for custom themes.

---

## 4. Data Operations

These methods modify the component's underlying data or its current view.

#### `.sort(fieldOrFields, isDescending, showSections)`
Sorts the currently displayed data.
-   **`fieldOrFields`** `(string|Array<string>)`: The field name(s) to sort by.
-   **`[isDescending]`** `(boolean|Array<boolean>)`: The sort direction(s). Defaults to `false` (ascending).
-   **`[showSections]`** `(boolean)`: If `true`, groups rows into collapsible sections based on the primary sort field.

#### `.search(filter)`
Filters the view to show only rows that match the filter. This is non-destructive to the master dataset.
-   **`filter`** `(Object|Function)`: An object of key-value pairs (e.g., `{ status: 'active' }`) or a filter function `(row => row.age > 30)`.

#### `.where(clauseString, [queryFunctions])`
Filters the view using a SQL-like WHERE clause string.
-   **`clauseString`** `(string)`: The WHERE clause (e.g., `"status = 'active' AND age > 30"`).

#### `.clearSearch()`
Removes any active search/filter and restores the view to the full dataset.

#### `.addData(data, [afterId])`
Adds new data to the listbox.
-   **`data`** `(Object|Array<Object>)`: A single row object or an array of row objects to add.
-   **`[afterId]`** `(*)`: The public ID of the row after which the new data should be inserted. If omitted, data is added to the end.

#### `.removeData(ids)`
Removes one or more rows by their public ID.
-   **`ids`** `(*|Array<*>)`: A single public ID or an array of public IDs to remove.

#### `.updateRow(rowId, dataOrField, [newValue])`
Updates a single row's data. Performs an efficient "smart render" to update only the affected DOM.
-   **`rowId`** `(*)`: The public ID of the row to update.
-   **`dataOrField`** `(Object|string)`: An object with the new data for the row, or a string specifying a single field to update.
-   **`[newValue]`** `(*)`: The new value, required if `dataOrField` is a field name.

---

## 5. Selection API

#### `.getSelected()`
Returns an array of the public IDs of all currently selected rows.
-   **Returns:** `(Array<*>)`

#### `.setSelected(ids)`
Programmatically sets the selection, replacing any current selection.
-   **`ids`** `(*|Array<*>)`: A single public ID or an array of public IDs to select.

#### `.clearSelection()`
Deselects all rows.

---

## 6. Data Retrieval (Getters)

#### `.getRowData(publicId)`
Gets the complete data object for a single row by its public ID.
-   **`publicId`** `(*)`: The public ID of the row to retrieve.
-   **Returns:** `(Object|null)` The row's data object, or `null` if not found.

#### `.getFieldValue(publicId, fieldName)`
Gets the value of a single field for a specific row.
-   **`publicId`** `(*)`: The public ID of the row.
-   **`fieldName`** `(string)`: The name of the field whose value you want.
-   **Returns:** `(*|undefined)` The field's value, or `undefined` if not found.

#### `.getSelectedAs(fieldName)`
A convenience method that returns an array of values from a specified field for all selected rows.
-   **`fieldName`** `(string)`: The name of the field to retrieve values from.
-   **Returns:** `(Array<*>)` An array of values (e.g., `['a@a.com', 'b@b.com']`).

#### `.findRows(filter)`
Performs a non-destructive search on the master dataset and returns the matching data without changing the current view.
-   **`filter`** `(Object|Function)`: A filter object or function, same as `.search()`.
-   **Returns:** `(Array<Object>)` An array of matching data objects.

#### `.length()`
Returns the number of rows currently visible in the listbox.
-   **Returns:** `(number)`

---

## 7. Advanced Formatting

#### `.tag(rowId, cssClass, [options])`
Programmatically applies a CSS class to a specific row or cell. This is a direct DOM manipulation and does not trigger a re-render.
-   **`rowId`** `(*)`: The public ID of the row to tag.
-   **`cssClass`** `(string)`: The CSS class to add.
-   **`[options]`** `(Object)`:
    -   **`field`** `(string)`: If in grid mode, apply the tag to this specific cell instead of the whole row.
    -   **`useRowIndex`** `(boolean)`: If `true`, treats `rowId` as a 0-based index instead of a public ID.

#### `.removeTag(rowId, cssClass, [options])`
Programmatically removes a CSS class from a row or cell. Parameters are the same as `.tag()`.

#### `.addFormat(ruleObject)`
Adds a declarative rule to automatically apply a CSS class to rows or cells during render. **Note: These rules are only applied in `'grid'` mode.**
-   **`ruleObject`** `(Object)`: An object defining the rule:
    -   **`name`** `(string)`: A unique name for the rule (for removal).
    -   **`searchField`** `(string)`: The data field to test.
    -   **`match`** `(*|RegExp|Function)`: The value, pattern, or function predicate to match against.
    -   **`tag`** `(string)`: The CSS class to apply.
    -   **`[target]`** `(string)`: `'row'` (default) or `'cell'`.

---

## 8. Event Handling

Use the `.on(eventName, callback)` method to subscribe to events.

### Interaction Events

| Event Name       | Description                                                                                                                                                                                          | Payload Object                                                                                                                                                                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`click`**      | Fired when a row is clicked.                                                                                                                                                                         | `{ id, internalId, index, rowData, rowElement, originalEvent, [field, value, cellElement] }` (Cell properties are included in grid mode).                                                                                                                                                   |
| **`dblclick`**   | Fired when a row is double-clicked.                                                                                                                                                                  | Same as `click`.                                                                                                                                                                                                                                                                                   |
| **`select`**     | Fired whenever the selection state changes.                                                                                                                                                          | `{ selectedIds: Array<*>, selectedData: Array<Object>, selectionCount: number }`                                                                                                                                                                                                      |
| **`cellClick`**  | Fired when a specific cell is clicked in grid mode. Requires `setClickOnCells(true)`.                                                                                                                 | Same as the augmented `click` payload, guaranteed to have `field`, `value`, and `cellElement`.                                                                                                                                                                                                   |
| **`headerClick`**| Fired when a column header is clicked in grid mode.                                                                                                                                                  | `{ field: string, headerElement: HTMLElement, originalEvent: Event }`                                                                                                                                                                                                                               |
| **`rowMouseEnter`**| Fired when the mouse pointer enters a row.                                                                                                                                                         | Row-level payload: `{ id, internalId, index, rowData, rowElement, originalEvent }`                                                                                                                                                                                                                  |
| **`rowMouseLeave`**| Fired when the mouse pointer leaves a row.                                                                                                                                                           | Row-level payload.                                                                                                                                                                                                                                                                                   |
| **`keydown`**    | Fired when a key is pressed while the component has focus.                                                                                                                                             | `{ key: string, code: string, ctrlKey: boolean, shiftKey: boolean, originalEvent: Event }`                                                                                                                                                                                                           |
| **`more`**       | Fired when the "Load More" button is clicked.                                                                                                                                                        | `{ currentRowCount: number, timestamp: number }`                                                                                                                                                                                                                                                    |

### Lifecycle Events

| Event Name         | Description                                                      | Payload Object                                                                                                                                                                      |
| ------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`beforeRender`** | Fired at the start of the `render()` method, before DOM changes. | `{ displayMode: string, recordCount: number }`                                                                                                                                      |
| **`render`**       | Fired at the end of the `render()` method, after DOM changes.    | `{ displayMode: string, recordCount: number }`                                                                                                                                      |
| **`destroy`**      | Fired after the component has been fully destroyed and cleaned up. | `{}` (Empty object)                                                                                                                                                                 |
| **`error`**        | Fired when a recoverable error occurs.                           | `{ code: string, message: string, method: string, timestamp: number }`                                                                                                               |
| **`log`**          | Fired for internal logging messages (for debugging).             | `{ level: string, message: string, data: *, timestamp: number }`                                                                                                                    |

---

## 9. Special Modes & Utilities

#### `.printMode(enable)`
Switches the component to use the `printTemplate` for a printer-friendly layout.
-   **`[enable]`** `(boolean)`: `true` (default) to enable, `false` to disable.

#### `.showLoading(show, [message])`
Shows or hides a loading overlay on top of the component.
-   **`[show]`** `(boolean)`: `true` (default) to show, `false` to hide.
-   **`[message]`** `(string)`: A custom message to display. Defaults to "Loading...".

#### `.showLoadMore(show, [message])`
Shows or hides a "Load More" button at the bottom of the list, which fires a `more` event on click.
-   **`[show]`** `(boolean)`: `true` (default) to show, `false` to hide.
-   **`[message]`** `(string)`: Custom text for the button. Defaults to "Load More".