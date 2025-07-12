# Project Overview: The JwListBox Component

## 1. Project Mission & Philosophy

**Mission:** To create a modern, high-performance, and developer-friendly JavaScript list/grid component named JwListBox. This component will be a spiritual successor to the legacy jwListBox_5.3.2.js, honoring its powerful feature set while rebuilding it from the ground up on a robust, modern, and dependency-free architecture.

**Core Philosophy:**

**Zero Dependencies:** The final component must be written in pure vanilla JavaScript (ES6+) and require no external libraries like jQuery.

**Developer-Friendly API:** The component should be easy to instantiate and configure. It will favor a clean, chainable, fluent API over a single, monolithic options object.

**Robust & Predictable:** The component must be resilient. Its internal state management will ensure that configuration changes can be made at any time, in any order, without breaking the component.

**Secure & Accessible by Default:** The component must adhere to modern web standards, implementing security best practices (e.g., escaping templated data) and strong accessibility (A11y) patterns (semantic HTML, ARIA roles, keyboard navigation) as foundational, non-negotiable features.

## 2. Core Architectural Pillars

### 2.1. The Data Engine: DataMaster

The JwListBox component will not manage data manipulation logic itself. It will serve as a View/Controller layer on top of the pre-existing jw-datamaster library.

**Internal Instance:** JwListBox will hold an internal instance of the DataMaster class (this.dm). This instance represents the complete, original source of data.

**Pristine Data:** The user's data within the DataMaster instance will remain pristine and unpolluted by any internal keys or properties.

**View-Specific Data:** A second DataMaster instance (this.viewDm) will be used to represent the currently visible data (after any sorting or filtering has been applied). Operations like sort() and search() will act on this viewDm.

**"Escape Hatch":** Both dm and viewDm will be publicly accessible to allow power-users to perform complex queries directly, with the understanding that they are responsible for manually triggering a re-render afterward.

### 2.2. The Rendering Engine

The rendering engine will be dynamic, intelligent, and non-destructive where possible.

**Dual-Mode Structure:** The component must support two distinct display modes:
- `'grid'` mode: Renders data into a semantic `<table>` structure. This is for columnar data.
- `'list'` mode: Renders data into a semantic `<ul>` structure. This is for use with custom templates.

The display mode must be switchable at runtime.

**Targeted DOM Updates:** For simple mutations (e.g., removeRow, modifyCell), the renderer should perform targeted, efficient DOM manipulation (e.g., removing a single `<li>`) instead of a full re-render.

**Batched Rendering:** For complex changes (e.g., sorting, filtering, changing the data source), the component will use a "dirty flag" and requestAnimationFrame to batch all changes into a single, efficient render, preventing UI flicker.

**Virtualization:** The architecture should be designed with future support for virtualization (windowing) in mind to handle very large datasets, though this is not a requirement for the initial version.

### 2.3. Internal State & Data Mapping

To keep the user's data pristine, JwListBox will use a parallel data structure to map data to its internal state.

**The Row Map (_rowMap):** A private Map object will be the bridge between the data and the view.
- **Key:** The raw row object from the DataMaster instance.
- **Value:** An object containing `{ id: <internal_pk>, element: <dom_node_ref> }`.

This map allows for the use of a reliable, invisible internal primary key and provides a performant way to find the DOM element associated with any given data row.

### 2.4. Templating System (for 'list' mode)

The component will offer a flexible and secure templating system.

**Source:** The template can be provided as a string of HTML, a CSS selector pointing to a `<template>` element (preferred), or a selector pointing to a hidden `<div>`.

**Syntax:**
- `{{fieldName}}`: For data that should be HTML-escaped (secure by default).
- `{{{fieldName}}}`: For data that should be rendered as raw HTML (the "danger hatch").

**Eventing:** Templates will not use inline onclick attributes. Behavior will be attached using event delegation on the main container.

## 3. Key Functionality & Behavior

**Fluent Configuration:** The primary method of configuration will be through chainable setter methods (e.g., `.setSource(data).setSort('name')`). A single `.configure(options)` method will also be available for convenience.

**Event-Driven:** The component will be controlled and monitored via a public `.on(eventName, callback)` API. This will be the sole method for handling events like select, click, sort, and error.

**DOM Integration:** The component will inject a controlled wrapper `<div>` into the user-provided parent element and will ensure the parent is a valid positioning context, making the component "just work" without requiring manual CSS from the user.

**Styling:** The component will inject its own essential CSS and will use a strict BEM-like class-naming convention (`.jw-listbox__element--modifier`) to allow for easy and predictable user styling and theming.

**Lifecycle Management:** The component must have a public `.destroy()` method to clean up all DOM elements, event listeners, and internal references to prevent memory leaks.

## 4. Comprehensive Feature Set

### I. Core Initialization & Configuration

* **Data Source:** Can be initialized with data in recordset (array of objects) or table (array of arrays) format. (Source())
* **Templating:**
   * Custom row template via HTML string or DOM element ID (rowTemplate).
   * Separate template for a "print mode" (printTemplate).
   * Customizable "loading" and "load more" indicators (loadingTemplate, loadMoreTemplate).
* **Display & Behavior Options:**
   * Define the unique ID field from the source data (idField).
   * Enable/disable click-to-select behavior (clickToSelect).
   * Enable/disable multi-select (multiSelect).
   * Enable/disable auto-selecting the first row on load/search (autoSelectFirst).
   * Show/hide table column headers (showTableHeaders).
   * Clickable column headers that emit events.
   * Clickable individual cells that emit events (clickOnCells).
   * Initial sort definition (sortField, sortDESC).
* **Styling:**
   * Set initial column widths for grid mode (SetWidths()).

### II. Data Manipulation & Display (Runtime)

* **Data Modification:**
   * Update the entire data source (Source()).
   * Add new data, potentially after a specific ID (AddData()).
   * Remove data by ID (RemoveData()).
   * Update a single field in a specific row (UpdateRow()).
* **Sorting:**
   * Sort the data by any column/field, ascending or descending (Sort()).
* **Filtering/Searching:**
   * Limit the displayed rows to a search term, optionally within a specific field (Search()).
   * Ability to clear the search and restore all data.
* **Sections:**
   * When sorting, automatically group data into collapsible sections based on the sorted field's value (Sort(..., ShowSections)).
   * Programmatically show/hide sections (DisplaySection()).
   * Auto-collapse/expand sections on header click (autoSectionHide).

### III. Data Retrieval & State Access ("Getters")

* **Data Export:**
   * Get the current data (or the full original dataset) as a recordset, table, or CSV string (GetSource()).
* **Row/Field Data:**
   * Get all data for a single row by its ID (GetRowData()).
   * Get the value of a specific field for a given row ID (GetFieldValue()).
   * Find all rows matching a search criteria and return their data (FindRows()).
* **Selection State:**
   * Get the currently selected ID(s) (Selected()).
   * Get data from an alternate column for the selected row(s) (GetSelectedAs()).
* **Metadata & DOM:**
   * Get a list of all field names (GetFields(), FieldNames()).
   * Get the total number of rows displayed (Length()).
   * Get the jQuery element for a row or a specific cell (GetRowElement(), GetFieldElement()).

### IV. Advanced Formatting & Styling (Runtime)

* **Conditional Formatting (formats):**
   * Define complex rules that automatically apply a CSS class to rows or cells.
   * Rules consist of a searchField, a match pattern, and the tag (CSS class) to apply.
   * Ability to add and remove these format rules at runtime (AddFormat(), RemoveFormat(), ClearAllFormats()).
* **Manual Tagging:**
   * Programmatically add or remove any arbitrary CSS class (tag) to any row or specific cell (Tag()).

### V. Events & Interactivity

* **Event Emitter:** A full event system (on()) to subscribe to events.
* **Core Events:** click, dblclick, select.
* **Special Events:** more (for "load more" button), click-section, clickCell, headerClick.
* **Programmatic Triggers:** Ability to programmatically trigger a click or dblclick on a row (click(), dblclick()).
* **Keyboard Navigation:** Arrow key navigation for selection.

### VI. Special Modes

* **Print Mode:** A mode that renders the data using the printTemplate for a printer-friendly layout (PrintMode()).
* **Loading Indicators:** Show/hide a loading overlay (ShowLoading()).