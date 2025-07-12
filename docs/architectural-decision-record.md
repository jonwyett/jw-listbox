# JwListBox: Architectural Decision Record & Design Rationale

## Preamble

This document captures the key architectural decisions made during the design phase of the `JwListBox` component. Its purpose is to preserve the context and reasoning behind major technical choices, serving as a guide for development and future maintenance. It explains not just *what* we decided, but *why* we decided it.

---

## 1. Core Philosophy: Modern, Dependency-Free

- **Decision:** The library will be written in modern, vanilla JavaScript (ES6+) and will have **zero runtime dependencies**. The jQuery dependency from the original library will be completely removed.
- **Rationale:**
    - **Universality & Interoperability:** A dependency-free component can be used in any project (React, Vue, Svelte, Angular, or plain JS) without forcing the host project to include a specific library like jQuery. This dramatically increases its utility.
    - **Performance & Size:** Eliminating large dependencies like jQuery results in a smaller final bundle size and avoids loading redundant code.
    - **Modern Standards:** The native DOM API is now powerful and expressive enough to handle all the tasks for which jQuery was once essential (selectors, event handling, animations). Adhering to modern standards makes the code more performant (e.g., CSS transitions over JS animations) and future-proof.
    - **Clarity:** A firm commitment to "no jQuery" forces us to use modern, standard solutions and prevents a "messy hybrid" codebase where two different paradigms are mixed.

## 2. API Design: Fluent Setters over "Options Soup"

- **Decision:** The primary method for configuration will be a fluent, chainable API of setter methods (e.g., `listbox.setSource(data).setSort('name')`), not a massive constructor options object. The constructor will only require the essential parent element selector. A `.configure(options)` method will be provided as a convenience wrapper.
- **Rationale:**
    - **Readability & Discoverability:** A fluent API reads like a set of human-readable instructions. In a modern IDE, typing `listbox.` will trigger autocompletion, making the full API surface discoverable to the developer.
    - **Robustness (Order of Operations):** This pattern, combined with a batched rendering pipeline, solves the "fragility" of the old library. A developer can call setters in any order, and the component will intelligently perform a single, correct render, preventing race conditions and visual flicker.
    - **Type Safety & Validation:** Each setter method is a distinct function, allowing for clear parameter validation and strong typing (in a TypeScript environment). It's easier to validate `setColumnWidths(widths)` than to validate a `widths` key inside a giant, unstructured options object.

## 3. Rendering Pipeline: Batched & Targeted

- **Decision:** State-changing methods will not trigger a render directly. They will set a `_isDirty` flag and schedule a single render using `window.requestAnimationFrame`. For simple mutations (`removeRow`, `modifyCell`), the DOM will be updated surgically without a full re-render.
- **Rationale:**
    - **Performance:** Batching all changes from a chained API call (e.g., `.setSource().setSort()`) into a single render pass is vastly more performant and prevents the UI flicker that multiple, rapid re-renders would cause. `requestAnimationFrame` is the browser's native, highly optimized way to schedule work right before a repaint.
    - **Efficiency:** For operations like removing a single row, re-rendering the entire list is wasteful. A targeted DOM update (`element.remove()`) is faster, more efficient, and preserves the state of other elements (like focus or scroll position). This creates a much smoother user experience.

## 4. Data Management: `DataMaster` Facade & Invisible PK

- **Decision:** `JwListBox` will use the `jw-datamaster` library as its data engine. It will not modify the user's data. A parallel `_rowMap` (`Map<rowObject, {id, element}>`) will be used to manage internal primary keys and map data rows to their live DOM elements.
- **Rationale:**
    - **Separation of Concerns:** This is the most significant architectural decision. It separates the complex problem of data manipulation from the complex problem of UI rendering. `JwListBox` can focus on being an excellent View/Controller, while `DataMaster` focuses on being a robust Model.
    - **Data Integrity:** The user's data remains pristine. By storing our internal state in a parallel map, we can give the user direct "escape hatch" access to their `DataMaster` instance without them seeing our internal `_internalId` fields. This builds trust and enables powerful, advanced use cases.
    - **Performance & Reliability:** The `_rowMap` provides an O(1) lookup from a data object to its DOM element, which is critical for performant, targeted DOM updates ("smart rendering"). It also provides a 100% reliable internal ID, regardless of whether the user's data has a unique key.

## 5. DOM Structure: Dual-Mode & Controlled Wrapper

- **Decision:** The component will render into either a `<table>` (for 'grid' mode) or a `<ul>` (for 'list' mode), not a one-size-fits-all `<table>`. This structure will be injected inside a controlled wrapper `<div>`, which itself lives inside the user's container. The component will ensure the user's container is a valid positioning context.
- **Rationale:**
    - **Semantic Correctness & Accessibility:** Using the right HTML element for the job is crucial for A11y. A grid of data *is* a `<table>`. A list of templated items *is* a `<ul>`. This provides invaluable context to assistive technologies. Forcing a template into a `<table>` is semantically incorrect and confusing.
    - **Layout Freedom:** Using a `<ul>` for templates frees the developer from the rigid constraints of the table layout model, allowing them to use modern CSS like Flexbox and Grid to their full potential.
    - **Robust Integration ("It Just Works"):** By creating our own wrapper and programmatically ensuring the parent has `position: relative`, we take responsibility for the layout context. This removes a common point of failure and frustration for the user, ensuring the component fills its container predictably without requiring manual CSS shenanigans.

## 6. Event Handling: Delegation over Inline

- **Decision:** All user interactions (e.g., `click`) will be handled by a single event listener on a parent container. Inline `onclick` attributes are forbidden. This eliminates the need for the component to know its own variable name.
- **Rationale:**
    - **Performance:** One event listener is orders of magnitude more memory-efficient and performant for large lists than attaching a listener to every single row.
    - **Security (CSP):** Modern Content Security Policies often block inline event handlers. The delegation pattern is CSP-compliant and considered a security best practice.
    - **Architectural Cleanliness:** This decouples the component from the global namespace. It no longer needs a "weird" `name` property in its configuration just to call back to itself. This makes the component fully encapsulated.
    - **Power:** The event delegation pattern provides the full `event` object to the handler, allowing for easy implementation of advanced interactions like checking for modifier keys (`event.ctrlKey`, `event.shiftKey`).

## 7. Templating: Secure by Default

- **Decision:** The templating engine will support `{{escaped}}` and `{{{raw}}}` syntax. The default behavior (`{{...}}`) **must** be to escape HTML content to prevent XSS vulnerabilities.
- **Rationale:**
    - **Trust & Responsibility:** A third-party library must not be a vector for security attacks. Most data displayed in a listbox is dynamic and potentially user-generated. By escaping HTML by default, we protect the application and its users from XSS attacks that could be injected via the data source.
    - **Explicit is Better than Implicit:** Forcing the developer to use a different, more "dangerous" looking syntax (`{{{...}}}`) for rendering raw HTML makes it a conscious, deliberate choice. This prevents accidental vulnerabilities and follows the principle of "secure by default."