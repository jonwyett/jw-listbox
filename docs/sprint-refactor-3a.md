### **Sprint 3a (Refactor): The Public Contract & Extensibility Framework**

**Goal:** To refactor the existing component architecture to implement a robust, extensible public contract. This involves standardizing the ID system, introducing lifecycle events, enriching all event payloads, and expanding the surface area of supported user interaction events. This sprint is critical for enabling advanced developer interaction and control.

---

#### **Part 1: The Standardized ID System**

**Requirement:** The component's internal handling of identifiers must be upgraded to a flexible, three-tiered system. The goal is to provide developers with predictable and powerful ways to identify rows.

**Acceptance Criteria:**
- The component must maintain its own 100% unique, internal-only ID for each data row (the `internalId` currently managed by `_rowMap`).
- A new configuration option, `idField`, must be implemented via a public `.setIdField(fieldName)` method.
- When an `idField` is specified, the component will use the value from that field in the source data as the primary **public identifier**.
- If no `idField` is specified, the component must default to using the 0-based `index` of the row within the current view (`_viewDm`) as its primary public identifier.

#### **Part 2: Lifecycle Events**

**Requirement:** The component must emit events at key points in its lifecycle to allow developers to hook into its rendering and teardown processes.

**Acceptance Criteria:**
- An event named `beforeRender` **must** be emitted at the beginning of the public `render()` method, before any DOM manipulation occurs.
- An event named `render` **must** be emitted at the end of the public `render()` method, after all DOM updates for that cycle are complete. This serves as the "post-render" hook.
- An event named `beforeDestroy` **must** be emitted at the beginning of the public `destroy()` method.
- An event named `destroy` **must** be emitted at the end of the public `destroy()` method, after all cleanup is finished.

#### **Part 3: Rich Event Payloads**

**Requirement:** All event payloads must be refactored to be rich and consistent, providing the developer with all necessary context (data, identifiers, and DOM references).

**Acceptance Criteria:**
- All row-level events (e.g., `click`, `dblclick`, `select`) **must** emit a payload object with the following required structure:
  ```
  {
      id: <any>,                  // The value from the user's designated `idField`, or the row index if not set.
      internalId: <number>,       // The component's internal, guaranteed-unique ID.
      index: <number>,            // The 0-based index of the row in the current view.
      rowData: <object>,          // The full, raw data object for the row.
      rowElement: <HTMLElement>,  // A direct reference to the <li> or <tr> DOM element.
      originalEvent: <Event>      // The raw browser Event object that initiated the action.
  }
  ```
- All cell-level events (`cellClick`, etc.) **must** emit a payload containing all the fields from the row-level payload, **plus** the following:
  ```
  {
      // ...all row-level properties...
      field: <string>,              // The field name of the clicked cell's column.
      value: <any>,                 // The data value of the specific cell.
      cellElement: <HTMLElement>    // A direct reference to the <td> or equivalent element.
  }
  ```

#### **Part 4: Expanded Event Surface**

**Requirement:** The component must listen for and emit a wider range of standard user interactions, all implemented via the existing Event Delegation pattern.

**Acceptance Criteria:**
- The component **must** listen for and emit the following events, each providing the appropriate rich payload as defined in Part 3:
    - `contextmenu` (emitted as `rowContextMenu` or `cellContextMenu`)
    - `mouseenter` (emitted as `rowMouseEnter`)
    - `mouseleave` (emitted as `rowMouseLeave`)
    - `keydown` (emitted with a payload including key details like `key`, `code`, `ctrlKey`, etc., when the main component wrapper has focus).
- A new configuration option, `clickOnCells`, must be implemented via a public `.setClickOnCells(boolean)` method to enable/disable the `cellClick` event.