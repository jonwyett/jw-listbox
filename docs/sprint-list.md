# JwListBox: Sprint List & Development Plan

This document outlines the development plan for the `JwListBox` component, broken down into sequential sprints. Each sprint builds upon the previous one and includes specific architectural constraints derived from the Project Overview and Style Guide.

## Sprint 1: The Control Chassis (The Foundation)

**Goal:** Build the foundational, reusable architecture for a modern JavaScript control. This sprint focuses on the "how" rather than the "what." Much of the functionality will be placeholders.

**Features:**
1.  **Module Structure:** Implement the IIFE wrapper and universal export logic.
2.  **Class Scaffold:** Create the `JwListBox` class structure (constructor, private/public method organization).
3.  **Options & Fluent API:** Implement default options handling and the foundation for the fluent API (setter methods returning `this`). Implement the `.configure(options)` convenience method.
4.  **DOM Integration & Wrapper:**
    *   Implement logic to find the user's parent container.
    *   Implement the "safe positioning check" (set parent to `position: relative` if `static`).
    *   Create and inject the `.jw-listbox-wrapper`.
5.  **CSS Injection:** Implement the `_injectStyles()` mechanism (ensuring it only runs once) with placeholder base styles.
6.  **Event Bus:** Implement the public `.on()` method and the private `_emit()` mechanism.
7.  **Rendering Pipeline (The Dirty Flag):**
    *   Implement `_isDirty`, `_requestRender()`, and the public `render()` method.
    *   **Constraint:** `_requestRender()` **must** use `requestAnimationFrame` to batch updates.
    *   The `render()` method should initially just render placeholder content (e.g., "Listbox Initialized").
8.  **Error Handling:** Implement the `_handleError()` system that emits an `error` event using the agreed-upon structure (`{ code, message, method, timestamp }`).
9.  **Lifecycle:** Implement the public `.destroy()` method to clean up DOM elements, listeners, and references.

## Sprint 2: Data Integration & Basic List Rendering

**Goal:** Integrate `DataMaster`, establish the internal data mapping, and render the data in the default 'list' mode (`<ul>`).

**Features:**
1.  **DataMaster Integration:**
    *   Implement the `setSource(data)` method.
    *   Initialize `this.dm` (master data) and `this.viewDm` (visible data) using `DataMaster` factory methods.
2.  **The Row Map (`_rowMap`):**
    *   Implement the `_buildRowMap()` logic.
    *   **Constraint:** The map must link the raw data objects (keys) to internal metadata `{ id, element }` (values). `DataMaster` instances must remain pristine.
3.  **Basic List Mode Rendering (`<ul>`):**
    *   Update `render()` to handle `displayMode: 'list'`.
    *   Create the `<ul>` container.
    *   Iterate over `this.viewDm` and render `<li>` elements for each row.
    *   **Constraint:** Stamp the internal ID onto the `<li>` using `data-internal-id`.
    *   **Constraint:** Update the `_rowMap` with the reference to the newly created `<li>`.
    *   (Content can be a simple string representation of the data; templating comes next).

## Sprint 3: The Templating Engine

**Goal:** Implement the secure templating system for 'list' mode.

**Features:**
1.  **Template Source Handling:** Implement `_getTemplate()` to load the template from a `<template>` tag (preferred), a `<div>` selector, or a raw string.
2.  **Template Parsing & Security:**
    *   Implement the parsing logic for the template syntax.
    *   **Constraint:** Implement `{{fieldName}}` for **escaped** output (Secure by default against XSS).
    *   **Constraint:** Implement `{{{fieldName}}}` for **raw HTML** output (The "danger hatch").
3.  **Rendering Update:** Update the `render()` logic (for 'list' mode) to use the parsed template instead of the basic string representation.

## Sprint 4: Selection, Events, and Accessibility (A11y)

**Goal:** Implement user interaction, selection state management, and core accessibility features.

**Features:**
1.  **Event Delegation:**
    *   **Constraint:** Implement click handling using a **single** event listener on the `<ul>` (or `<tbody>`) container. Use `event.target.closest()` to identify the clicked row.
2.  **Selection State:**
    *   Implement internal selection tracking (e.g., `this._selection = new Set()`).
    *   Implement configuration options: `clickToSelect`, `multiSelect`, `autoSelectFirst`.
3.  **Visual Feedback:** Apply the `.jw-listbox__row--selected` class to selected items.
4.  **Public Events:** Emit `click`, `doubleclick` and `select` events with relevant payload data.
5.  **Public API Methods:** Implement `getSelected()`, `setSelected(ids)`, and `clearSelection()`.
6.  **A11y - ARIA Roles:**
    *   Apply `role="listbox"` to the `<ul>`.
    *   Apply `role="option"` to the `<li>`.
    *   Apply `aria-selected="true/false"` dynamically.
    *   Apply `aria-multiselectable` based on options.
7.  **A11y - Keyboard Navigation:** Implement `ArrowUp`, `ArrowDown`, `Home`, and `End` key navigation for single selection, including focus management (`tabindex`).



## Sprint 5: Grid Mode

**Goal:** Implement the alternative `<table>` rendering mode and its specific configurations.

**Features:**
1.  **Grid Mode Rendering (`<table>`):**
    *   Update `render()` to handle `displayMode: 'grid'`.
    *   Implement rendering of `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`.
2.  **Dynamic Switching:** Implement `setDisplayMode(mode)` to switch between 'list' and 'grid', destroying the old container and creating the new one.
3.  **Configuration:**
    *   Implement `showTableHeaders` option.
    *   Implement `setColumnWidths(widths)`.
4.  **Header Events:** Implement click handling on `<th>` elements and emit a `headerClick` event.

## Sprint 6: Data Operations - Sorting and Searching

**Goal:** Implement the public API wrappers for sorting and filtering the data, utilizing `DataMaster`.

**Features:**
1.  **Sorting:**
    *   Implement the public `sort(field, isDescending)` method.
    *   This should operate on `this.viewDm` and trigger a render.
    *   Implement persistence of sort state (so new data added later respects the current sort).
2.  **Searching/Filtering:**
    *   Implement the public `search(filter)` method.
    *   **Constraint:** This must search the master `this.dm` and assign the result to `this.viewDm`.
    *   Implement `clearSearch()` to restore `this.viewDm` from `this.dm`.

## Sprint 7: Data Operations - CRUD & Targeted Updates

**Goal:** Implement methods to add, remove, and update data with efficient, targeted DOM manipulation.

**Features:**
1.  **`UpdateRow` / `ModifyCell`:**
    *   Update the data in `DataMaster`.
    *   **Constraint:** Implement "Smart Render" logic: Find the specific DOM element (using `_rowMap`) and update only that element's content, rather than a full re-render.
2.  **`RemoveData`:**
    *   Remove data from `DataMaster` and `_rowMap`.
    *   **Constraint:** Implement "Smart Render" logic: Find the specific `<li>`/`<tr>` and call `.remove()` on it.
3.  **`AddData`:**
    *   Add data to `DataMaster` and `_rowMap`.
    *   **Constraint:** Implement "Smart Render" logic: Create the new `<li>`/`<tr>` and insert it at the correct position in the DOM.

## Sprint 8: Advanced Formatting (Tags and Formats)

**Goal:** Implement the conditional formatting rules and manual tagging features.

**Features:**
1.  **Manual Tagging:** Implement the public `tag(rowId, cssClass, field, remove)` method. This should apply/remove classes directly to the DOM elements.
2.  **Conditional Formatting (`AddFormat`):**
    *   Implement the logic to store formatting rules (`match`, `searchField`, `tag`).
    *   Update the main `render()` method to evaluate these rules for every row/cell during rendering and apply the appropriate CSS classes.
    *   Implement `RemoveFormat` and `ClearAllFormats`.

**Context Addendum**

**Objective:** Implement two distinct systems for dynamically applying CSS classes to component elements: a programmatic system (**Manual Tagging**) and a rule-based, automatic system (**Conditional Formats**). The implementation must be mode-aware to ensure predictable behavior.

---

#### **1. Manual Tagging (`.tag()` method)**

- **Functionality:** Provides an imperative method to programmatically add or remove a CSS class from a specific row or cell.
- **Implementation:**
    - The public method `tag(rowId, cssClass, options)` will be created.
    - It must perform a direct, targeted DOM update on the `classList` of the specified element.
    - This method must not trigger a full component re-render.
    - In **Grid Mode**, it targets the `<tr>` (default) or a specific `<td>` (if a `field` option is provided).
    - In **List Mode**, it targets the top-level `<li>` element for the given row.

#### **2. Conditional Formats (`.addFormat()` method)**

- **Functionality:** Provides a declarative, rule-based system for automatically applying CSS classes during render.
- **Implementation:**
    - The public methods `addFormat(ruleObject)`, `removeFormat(ruleName)`, and `clearAllFormats()` will be created to manage an internal collection of formatting rules.
    - A `ruleObject` must define properties for `name`, `match` criteria, the `searchField` to test, the `tag` (CSS class) to apply, and the `target` ('row' or 'cell').
    - The core `render()` method will be updated to process these rules.

#### **3. Mode-Specific Behavior**

- **Grid Mode (`displayMode: 'grid'`):**
    - The `render()` method **must** evaluate all active Conditional Format rules for each `<tr>` and `<td>` it generates and apply the specified classes accordingly.
- **List Mode (`displayMode: 'list'`):**
    - The `render()` method **must ignore** the Conditional Formats rules. The template itself is considered the sole authority for conditional class application in this mode.
    - The rules defined via `.addFormat()` **must be preserved** internally when switching out of and back into Grid Mode. They are not to be deleted or disabled, merely ignored during the template rendering process.
- **Template Engine Requirement:**
    - The templating engine must support dynamic attribute generation (e.g., `<div class="status-{{status}}">`) to serve as the primary conditional formatting mechanism in List Mode.

## Sprint 9: Section Headers & Grouping

**Goal:** Implement automatic grouping and collapsible section headers.

**Features:**
1.  **Section Rendering:** Update the `render()` logic (likely tied to the `sort()` method) to detect changes in the sorted field's value and insert section header rows (`<li>` or `<tr>` with a distinct class).
2.  **Collapsing/Expanding:** Implement logic to show/hide rows within a section when the header is clicked.
3.  **Configuration:** Implement the `autoSectionHide` option.
4.  **Events:** Emit the `click-section` event.

## Sprint 10: Special Modes & Utilities

**Goal:** Implement remaining specialized features and data export utilities.

**Features:**
1.  **Print Mode:** Implement `PrintMode()` which switches to a specific `printTemplate` and potentially alters the layout (e.g., removing scrollbars).
2.  **Loading Indicators:** Implement `ShowLoading()` and `ShowLoadMore()` (which emits a `more` event).
3.  **Data Export:** Implement `GetSource(format)` (wrapping `DataMaster`'s `.toCsv()`, `.toRecordset()`, `.toTable()`).
4.  **Metadata:** Implement `Length()`, `GetFields()`.