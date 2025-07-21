# JwListBox API Reference

Welcome to the complete API reference for JwListBox. This document provides detailed information on the component's public methods, options, and events. For a quick start and overview, please see the [README.md](README.md) file.

## Table of Contents

-   [1. Core Concepts](#1-core-concepts)
-   [2. Initialization](#2-initialization)
-   [3. Configuration (Setters)](#3-configuration-setters)
    -   [Data & Display](#data--display)
    -   [Behavior & Selection](#behavior--selection)
    -   [Styling & Theming](#styling--theming)
-   [4. Data Operations](#4-data-operations)
    -   [Non-Destructive Filtering & Sorting](#non-destructive-filtering--sorting)
    -   [Destructive Filtering](#destructive-filtering)
    -   [Row Manipulation (CRUD)](#row-manipulation-crud)
-   [5. Selection API](#5-selection-api)
-   [6. Data Retrieval (Getters)](#6-data-retrieval-getters)
-   [7. Advanced Formatting](#7-advanced-formatting)
-   [8. Event Handling](#8-event-handling)
    -   [Interaction Events](#interaction-events)
    -   [Lifecycle Events](#lifecycle-events)
-   [9. Paging & Virtualization](#9-paging--virtualization)
-   [10. Utilities](#10-utilities)

---

## 1. Core Concepts

JwListBox is designed as a "headless" component. It provides a powerful engine for data rendering and state management but is unopinionated about surrounding UI controls like search boxes or pagination buttons. You control the listbox through its comprehensive API, giving you 100% flexibility over your application's layout and logic.

A key concept is the separation of the master dataset (`dm`) from the visible dataset (`viewDm`).

-   **`listbox.dm`**: A public `DataMaster` instance holding the complete, original dataset. Perform complex, non-visual queries here.
-   **`listbox.viewDm`**: A public `DataMaster` instance holding the data currently being rendered (after sorting/filtering). The component's `.render()` method reads exclusively from this instance.

---

## 2. Initialization

### `new JwListBox(parent, [options])`

Initializes a new JwListBox instance.

-   **`parent`** `(string|HTMLElement)`: A CSS selector string or a direct DOM element reference for the container where the listbox will be injected. This container should have a defined size (e.g., `height: 400px`).
-   **`[options]`** `(Object)`: An optional configuration object. Any valid option can be set here, corresponding to the available `.set...()` methods (e.g., `{ source: myData, idField: 'id' }`).

**Example (Simple):**
```javascript
const listbox = new JwListBox('#my-list-container');
```

**Example (With Options):**
```javascript
const myInitialData = [
  { userId: 1, name: 'Alice', status: 'active' },
  { userId: 2, name: 'Bob', status: 'inactive' }
];

const listbox = new JwListBox('#app', {
  source: myInitialData,
  idField: 'userId',
  displayMode: 'grid',
  autoSelectFirst: true,
  useDefaultStyles: true
});
```

---

## 3. Configuration (Setters)

All setter methods are chainable (they return `this`).

### Data & Display

#### `.setSource(data, [options])`
Sets the data source for the listbox, replacing any existing data. Auto-detects the format of the `data` parameter.

-   **`data`** `(Array<Object>|Array<Array>|string|DataMaster)`: The data to display. Can be a recordset, a table, a CSV string, or a `DataMaster` instance.
-   **`[options]`** `(Object)`: Options passed directly to the `DataMaster` factory methods (e.g., `{ headersInFirstRow: true }` for table or CSV data).

**Example:**
```javascript
// From a recordset (array of objects)
listbox.setSource([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]);

// From a CSV string with headers
const csvData = "id,name\n1,Alice\n2,Bob";
listbox.setSource(csvData, { headersInFirstRow: true });
```

#### `.setDisplayMode(mode)`
-   **`mode`** `(string)`: `'list'` (renders a `<ul>`) or `'grid'` (renders a `<table>`).

#### `.setTemplate(template)`
Sets the HTML template for items when `displayMode` is `'list'`. Uses `{{field}}` for HTML-escaped values and `{{{field}}}` for raw HTML.
-   **`template`** `(string|HTMLElement)`: An HTML string, a CSS selector for a `<template>` tag (preferred), or a CSS selector for a `<div>`.

**Example:**
```html
<!-- In your HTML file -->
<template id="user-template">
  <div class="user-card">
    <strong>{{name}}</strong> ({{email}})
    <p>Status: {{{statusHtml}}}</p>
  </div>
</template>
```
```javascript
// In your script
listbox.setDisplayMode('list').setTemplate('#user-template');
```

#### `.setPrintTemplate(template)`
Sets a separate HTML template for `printMode()`.
-   **`template`** `(string|HTMLElement)`: Template source, same as `.setTemplate()`.

#### `.setIdField(fieldName)`
Sets which data field to use as the unique public identifier for rows.
-   **`fieldName`** `(string|null)`: The name of the field. If `null` or not found, the row's 0-based index is used.

#### `.setShowTableHeaders(enabled)`
Shows or hides the `<thead>` in `'grid'` mode.
-   **`enabled`** `(boolean)`: `true` to show headers (default), `false` to hide them.

#### `.setColumnWidths(widths)`
Sets column widths for `'grid'` mode.
-   **`widths`** `(Object)`: An object mapping field names to CSS width values.

**Example:**
```javascript
listbox.setColumnWidths({
  name: '200px',
  email: '40%',
  status: '100px'
});
```

### Behavior & Selection

#### `.setClickToSelect(enabled)`
Enables or disables the default behavior where clicking a row selects it.
-   **`enabled`** `(boolean)`: `true` (default) enables selection on click. If `false`, a `click` event is still emitted, but selection state is not changed automatically.

#### `.setSelectionMode(mode)`
Sets how clicks interact with multi-selection.
-   **`mode`** `(string)`:
    -   `'replace'` (default): A standard click replaces the selection. Ctrl/Cmd+click toggles selection for one row. Shift+click performs a range selection.
    -   `'toggle'`: Every standard click toggles the selection state of the clicked row.

#### `.setAutoSelectFirst(enabled)`
Automatically selects the first row when data is loaded or changed.
-   **`enabled`** `(boolean)`: `true` to enable, `false` (default) to disable.

#### `.setAutoSectionHide(enabled)`
In `'grid'` mode with sections, controls if clicking a section header automatically toggles its collapsed/expanded state.
-   **`enabled`** `(boolean)`: `true` to enable auto-toggle, `false` (default) to disable.

#### `.setClickOnCells(enabled)`
Controls whether a separate `cellClick` event is emitted in `'grid'` mode.
-   **`enabled`** `(boolean)`: `true` to enable `cellClick` events, `false` (default) to disable.

### Styling & Theming

#### `.setUseDefaultStyles(useStyles)`
Controls whether the default cosmetic styles (colors, padding, etc.) are applied.
-   **`useStyles`** `(boolean)`: `true` (default) to apply styles. `false` provides a "blank slate" with only structural CSS, perfect for custom themes.

---

## 4. Data Operations

### Non-Destructive Filtering & Sorting

These methods modify the `viewDm` (what's visible) without altering the master `dm` dataset.

#### `.sort(fieldOrFields, isDescending, showSections)`
Sorts the currently displayed data.
-   **`fieldOrFields`** `(string|Array<string>)`: The field name(s) to sort by.
-   **`[isDescending]`** `(boolean|Array<boolean>)`: Sort direction(s). Defaults to `false` (ascending).
-   **`[showSections]`** `(boolean)`: If `true` and in `'grid'` mode, groups rows into collapsible sections based on the primary sort field.

**Example:**
```javascript
// Sort by status descending, then by name ascending, with sections
listbox.sort(['status', 'name'], [true, false], true);
```

#### `.search(filter)`
Filters the view to show only rows that match the filter.
-   **`filter`** `(Object|Function)`: An object of key-value pairs or a filter function.

**Example:**
```javascript
// Filter by object: status is 'active' AND department is 'Sales'
listbox.search({ status: 'active', department: 'Sales' });

// Filter by function: age is over 30
listbox.search(row => row.age > 30);
```

#### `.where(clauseString, [queryFunctions])`
Filters the view using a SQL-like WHERE clause string.
-   **`clauseString`** `(string)`: The WHERE clause (e.g., `"status = 'active' AND age > 30"`).

#### `.clearSearch()`
Removes any active search/filter, restoring the view to the full dataset.

#### `.query('select', options)`
Performs a complex, non-destructive query on the current view.
-   **`options`** `(Object)`: A DataMaster query object.

**Example:**
```javascript
// Show only the name and email fields for active users, sorted by name
listbox.query('select', {
  fields: ['name', 'email'],
  where: "status = 'active'",
  orderBy: 'name'
});
```

### Destructive Filtering

These methods permanently modify the master `dm` dataset.

#### `.limit(filter)`
Permanently removes rows from the master dataset that do not match the filter.
-   **`filter`** `(Object|Function)`: Same as `.search()`.

#### `.limitWhere(clauseString, [queryFunctions])`
Permanently removes rows from the master dataset that do not match the WHERE clause.

### Row Manipulation (CRUD)

These methods modify the master `dm` dataset and intelligently update the view.

#### `.addData(data, [afterId])`
Adds new data to the listbox.
-   **`data`** `(Object|Array<Object>)` A single row or an array of rows to add.
-   **`[afterId]`** `(*)`: The public ID of the row after which to insert the new data. If omitted, data is added to the end.

**Example:**
```javascript
const newUser = { id: 101, name: 'Charlie', status: 'pending' };
listbox.addData(newUser); // Adds to the end

const newUsers = [/* ... */];
listbox.addData(newUsers, 50); // Adds the new users after the row with id 50
```

#### `.removeData(ids)`
Removes one or more rows by their public ID.
-   **`ids`** `(*|Array<*>)`: A single public ID or an array of IDs to remove.

#### `.updateRow(rowId, dataOrField, [newValue])`
Updates a single row's data with an efficient "smart render".
-   **`rowId`** `(*)`: The public ID of the row to update.
-   **`dataOrField`** `(Object|string)`: An object with new data, or a string for a single field.
-   **`[newValue]`** `(*)`: The new value (required if updating a single field).

**Example:**
```javascript
// Update a single field for row with id 2
listbox.updateRow(2, 'status', 'inactive');

// Update multiple fields for row with id 5
listbox.updateRow(5, { name: 'Alice Smith', email: 'alice.s@example.com' });
```

---

## 5. Selection API

#### `.getSelected()`
Returns an array of the public IDs of all currently selected rows.
-   **Returns:** `(Array<*>)`

#### `.setSelected(ids)`
Programmatically sets the selection, replacing any current selection.
-   **`ids`** `(*|Array<*>)`: A single public ID or an array of public IDs to select.
- **Example:** `listbox.setSelected([1, 5, 12]);`

#### `.clearSelection()`
Deselects all rows.

---

## 6. Data Retrieval (Getters)

#### `.getRowData(publicId)`
Gets the complete data object for a single row by its public ID from the master dataset.
-   **`publicId`** `(*)`: The public ID of the row to retrieve.
-   **Returns:** `(Object|null)` The row's data object, or `null` if not found.

#### `.getFieldValue(publicId, fieldName)`
Gets the value of a single field for a specific row.
-   **`publicId`** `(*)`: The public ID of the row.
-   **`fieldName`** `(string)`: The name of the field.
-   **Returns:** `(*|undefined)` The field's value, or `undefined` if not found.

#### `.getSelectedAs(fieldName)`
Returns an array of values from a specified field for all selected rows.
-   **`fieldName`** `(string)`: The field to retrieve values from.
-   **Returns:** `(Array<*>)` An array of values (e.g., `['a@a.com', 'b@b.com']`).

#### `.findRows(filter)`
Performs a non-destructive search on the **master dataset** and returns matching data without changing the view.
-   **`filter`** `(Object|Function)`: A filter object or function, same as `.search()`.
-   **Returns:** `(Array<Object>)` An array of matching data objects.

#### `.length()`
Returns the number of rows currently **visible** in the listbox.
-   **Returns:** `(number)`

#### `.getDetails()`
Returns a snapshot of the component's current state and metadata.
-   **Returns:** `(Object)` An object containing details like `totalRows`, `visibleRows`, `selectionCount`, `isFiltered`, `displayMode`, etc.

#### `.getSource(format, allData, [options])`
Exports the listbox data.
-   **`format`** `(string)`: Export format: `'recordset'` (default), `'table'`, or `'csv'`.
-   **`allData`** `(boolean)`: `true` to export the master dataset, `false` (default) to export only the visible data.
-   **Returns:** `(Array|string)` The exported data.

---

## 7. Advanced Formatting

#### `.tag(rowId, cssClass, [options])`
Programmatically applies a CSS class to a specific row or cell (direct DOM manipulation).
-   **`rowId`** `(*)`: The public ID of the row to tag.
-   **`cssClass`** `(string)`: The CSS class to add.
-   **`[options]`** `(Object)`:
    -   `field` `(string)`: If in grid mode, apply tag to this cell instead of the whole row.
    -   `useRowIndex` `(boolean)`: If `true`, treats `rowId` as a 0-based index.

**Example:** `listbox.tag(10, 'highlight-important', { field: 'status' });`

#### `.removeTag(rowId, cssClass, [options])`
Removes a CSS class previously added with `.tag()`. Parameters are the same.

#### `.addFormat(ruleObject)`
Adds a declarative rule to automatically apply a CSS class to rows or cells during render. **Note: Rules only apply in `'grid'` mode.**
-   **`ruleObject`** `(Object)`:
    -   `name` `(string)`: A unique name for the rule.
    -   `searchField` `(string)`: The data field to test.
    -   `match` `(*|RegExp|Function)`: The value, pattern, or predicate to match against.
    -   `tag` `(string)`: The CSS class to apply.
    -   `[target]` `(string)`: `'row'` (default) or `'cell'`.

**Example:**
```javascript
// Add a rule to apply the 'inactive-row' class to any row where status is 'inactive'
listbox.addFormat({
  name: 'highlightInactive',
  searchField: 'status',
  match: 'inactive',
  tag: 'inactive-row',
  target: 'row'
});
```

#### `.removeFormat(ruleName)`
Removes a conditional formatting rule by its unique name.

#### `.clearAllFormats()`
Removes all conditional formatting rules.

---

## 8. Event Handling

Use the `.on(eventName, callback)` method to subscribe to events.

**Example:**
```javascript
listbox.on('select', (payload) => {
  console.log(`${payload.selectionCount} items selected.`);
  console.log('Selected IDs:', payload.selectedIds);
});

listbox.on('render', () => {
  console.log('Listbox has finished rendering.');
});
```

### Interaction Events

| Event Name | Description | Payload Object |
| --- | --- | --- |
| **`click`** | Fired when a row is clicked. | `{ id, internalId, index, rowData, rowElement, originalEvent, [field, value, cellElement] }` (Cell properties in grid mode). |
| **`dblclick`** | Fired when a row is double-clicked. | Same as `click`. |
| **`select`** | Fired whenever the selection state changes. | `{ selectedIds: Array<*>, selectedData: Array<Object>, selectionCount: number }` |
| **`cellClick`** | Fired on cell click in grid mode. Requires `setClickOnCells(true)`. | Same as augmented `click` payload, guaranteed to have `field`, `value`, `cellElement`. |
| **`headerClick`**| Fired when a column header is clicked in grid mode. | `{ field: string, headerElement: HTMLElement, originalEvent: Event }` |
| **`rowMouseEnter`**| Fired when the mouse enters a row. | `{ id, internalId, index, rowData, rowElement, originalEvent }` |
| **`rowMouseLeave`**| Fired when the mouse leaves a row. | Row-level payload. |
| **`keydown`** | Fired when a key is pressed while the component has focus. | `{ key, code, ctrlKey, shiftKey, originalEvent }` |
| **`more`** | Fired when the "Load More" button is clicked (see Utilities). | `{ currentRowCount, timestamp }` |

### Lifecycle Events

| Event Name | Description | Payload Object |
| --- | --- | --- |
| **`beforeRender`** | Fired before DOM changes. | `{ displayMode, recordCount }` |
| **`render`** | Fired after DOM changes. | `{ displayMode, recordCount }` |
| **`destroy`** | Fired after the component is destroyed. | `{}` |
| **`error`** | Fired on a recoverable error. | `{ code, message, method, timestamp }` |

---

## 9. Paging & Virtualization

#### `.usePaging(options)`
Enables, disables, or configures client-side or server-side paging.

-   **`options`** `(Object|boolean)`:
    -   To disable, pass `false` or `null`.
    -   To enable, pass a configuration object.

**Paging Options:**
-   `pageSize` `(number)`: Number of items to show per page/window. Default: `50`.
-   `dataProvider` `(Function | null)`: If provided, enables server-side paging. If `null`, uses client-side virtual paging.

**Example (Client-Side Virtual Paging):**
```javascript
// The listbox will handle showing a window of 100 items from the full dataset.
listbox.usePaging({
  pageSize: 100
});
```

**Example (Server-Side Paging):**
```javascript
// The dataProvider function is responsible for fetching data from the server.
const fetchData = async (context) => {
  // context = { page, pageSize, sort, filter }
  const url = `/api/users?page=${context.page}&size=${context.pageSize}`;
  const response = await fetch(url);
  const json = await response.json();
  // Must return an object with `data` and `totalRecords`.
  return {
    data: json.users,
    totalRecords: json.totalUserCount
  };
};

listbox.usePaging({
  pageSize: 25,
  dataProvider: fetchData
});
```

---

## 10. Utilities

#### `.printMode(enable)`
Switches the component to use the `printTemplate` for a printer-friendly layout.
-   **`[enable]`** `(boolean)`: `true` (default) to enable, `false` to disable.

#### `.showLoading(show, [message])`
Shows or hides a loading overlay.
-   **`[show]`** `(boolean)`: `true` (default) to show, `false` to hide.
-   **`[message]`** `(string)`: Custom message. Defaults to "Loading...".

#### `.showLoadMore(show, [message])`
Shows or hides a "Load More" button that fires a `more` event on click.
-   **`[show]`** `(boolean)`: `true` (default) to show, `false` to hide.
-   **`[message]`** `(string)`: Custom button text. Defaults to "Load More".

#### `.setFieldNames(nameMap)`
Renames data fields at runtime. This affects the underlying data and grid headers.
-   **`nameMap`** `(Object)`: An object mapping old names to new names.

**Example:**
```javascript
// Rename 'userId' to 'ID' and 'email_address' to 'Email'
listbox.setFieldNames({
  userId: 'ID',
  email_address: 'Email'
});
```