Excellent plan. Breaking these final features into logical, targeted "Polish Sprints" is the right way to manage the work. You are correct that most of these are independent, but a few can be grouped together for efficiency.

Here is the proposed Polish Sprint List, designed to bring the new `JwListBox` to full feature parity with the original in a structured manner.

---

### **JwListBox: Polish Sprint List**

#### **Sprint 11: Core Data Retrieval API**

**Objective:** Restore the most critical and frequently used data-getter methods from the original library. This sprint focuses on empowering the developer to easily query data from the component without needing to interact with the raw `DataMaster` instance for common tasks.

**Features & Requirements:**

1.  **Implement `.getRowData(publicId)`:**
    *   **WHAT:** Create a public method that accepts a row's public ID.
    *   **ACCEPTS:** A single public ID (from the `idField` or row index).
    *   **RETURNS:** The complete data object (recordset) for the matching row, or `null` if not found.
    *   **CONSTRAINT:** This method must be a "read-only" operation and must not trigger a render. It should search the master `this.dm` instance to ensure it can find data even if it's currently filtered out of the view.

2.  **Implement `.getFieldValue(publicId, fieldName)`:**
    *   **WHAT:** Create a public method that gets the value of a single cell.
    *   **ACCEPTS:** A row's public ID and a string `fieldName`.
    *   **RETURNS:** The value of the specified field for the matching row, or `undefined` if not found.
    *   **CONSTRAINT:** This is also a read-only operation. It can be implemented efficiently by calling the new `.getRowData()` internally.

---

#### **Sprint 12: Advanced Selection & Search API**

**Objective:** Implement the remaining advanced data retrieval methods that operate on the component's state (selection and filtering).

**Features & Requirements:**

1.  **Implement `.getSelectedAs(fieldName)`:**
    *   **WHAT:** Create a public method to get an array of values from a specified column for all currently selected rows.
    *   **ACCEPTS:** A string `fieldName`.
    *   **RETURNS:** An array of values (e.g., `['a@a.com', 'b@b.com']`). If no rows are selected, it should return an empty array.
    *   **CONSTRAINT:** This method must be highly efficient, iterating over the `this._selection` set and using the `_rowMap` to look up the data, avoiding full-table scans.

2.  **Implement `.findRows(filter)`:**
    *   **WHAT:** Create a public method to perform a non-destructive search on the master dataset.
    *   **ACCEPTS:** A filter object or function, identical to what `DataMaster.search()` accepts.
    *   **RETURNS:** An array of data objects (a recordset) for all matching rows.
    *   **CONSTRAINT:** This method **must not** change the `this.viewDm` or trigger a render. It is a pure data-querying utility.

---

#### **Sprint 13: Event Payload & Interaction Polish**

**Objective:** Enhance the user interaction experience by enriching event payloads and implementing the `clickOnCells` behavior. These features are related as they both deal with the specifics of a click event.

**Features & Requirements:**

1.  **Enrich `click` Event Payload:**
    *   **WHAT:** The payload for the primary `click` event needs to be more detailed.
    *   **CONSTRAINT:** When in `'grid'` mode, the internal `_handleClick` logic must be updated to detect if the `event.target` was a `<td>` (or a child of one). If so, the emitted `click` payload **must** be augmented with the `field`, `value`, and `cellElement` properties, as defined in our architectural documents.

2.  **Implement `clickOnCells` Option:**
    *   **WHAT:** Implement the public `.setClickOnCells(boolean)` method and its corresponding constructor option.
    *   **CONSTRAINT:** When this option is `true`, the component must emit a distinct `cellClick` event in addition to the standard `click` event. The `cellClick` event should only fire when a specific cell (not just the row padding) is clicked in grid mode. Its payload must be the full, rich cell-specific payload.

---

#### **Sprint 14: Final API & Metadata Methods**

**Objective:** Implement the remaining low-priority utility methods for completeness.

**Features & Requirements:**

1.  **Implement `.setFieldNames(nameMap)` (Low Priority):**
    *   **WHAT:** Create a method to rename fields at runtime.
    *   **ACCEPTS:** An object mapping old names to new names (e.g., `{ oldName: 'newName' }`).
    *   **CONSTRAINT:** This method would need to call a corresponding method on the `DataMaster` instance (assuming it exists or can be added) and then trigger a full re-render.

2.  **Implement `.getDetails()` (Low Priority):**
    *   **WHAT:** Create a method that returns a snapshot of the component's state.
    *   **RETURNS:** An object containing useful metadata, such as `{ visibleRows: 50, totalRows: 1000, isFiltered: true, selectionCount: 3 }`.
    *   **CONSTRAINT:** This should be a simple data-gathering method with no side effects.

This sprint list provides a clear and logical path to achieving full feature parity in a controlled, testable manner.