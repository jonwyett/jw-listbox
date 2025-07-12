# Project Style & Architecture Guide

## 1. Philosophy & Guiding Principles

This document defines the development standards for all modern JavaScript components built under this project. The goal is to produce code that is professional, maintainable, robust, and consistent.

Our guiding principles are:

**Clarity over Brevity**: Code should be self-documenting wherever possible.

**Consistency over Preference**: All code will follow these conventions, even if they conflict with an individual's personal style.

**User-Centric Design**: Components must be easy to use, secure by default, and accessible.

**Zero Dependencies**: Components must be written in pure, modern vanilla JavaScript and have no external runtime dependencies.

## 2. JavaScript Language & Syntax

The entire codebase uses ECMAScript 2015 (ES6) and newer features as the baseline.

**Class Definitions**: All stateful components must use the class syntax.

```javascript
class MyComponent {
    constructor(options) {
        // ...
    }
}
```

**Variable Declarations**:
- `const` is the default. Use it for any variable that will not be reassigned.
- `let` is for exceptions. Use it only when a variable's value must be reassigned (e.g., loop counters, state flags).
- `var` is forbidden. It will not be used anywhere in the codebase to enforce block-scoping and prevent hoisting-related bugs.

**Arrow Functions**: Arrow functions should be used for all anonymous functions and event handlers to preserve the lexical `this` context.

```javascript
// Good: `this` is correctly bound to the class instance
this.container.addEventListener('click', (event) => {
    this._handleClick(event);
});
```

**Template Literals**: String concatenation must be done with template literals (backticks) for improved readability, especially for multi-line strings.

```javascript
// Good
const html = `
  <div class="${className}">
    <p>${content}</p>
  </div>
`;
```

**Semicolons**: Semicolons are mandatory at the end of all statements to prevent ambiguity and potential errors from Automatic Semicolon Insertion (ASI).

## 3. Naming Conventions

**Classes**: must use PascalCase (e.g., `JwListBox`, `DataMaster`).

**Methods & Functions**: must use camelCase (e.g., `render`, `setSource`).

**Variables & Properties**: must use camelCase (e.g., `const userOptions`, `this.wrapperElement`).

**Private Members**: All internal class properties and methods that are not part of the public API must be prefixed with a single underscore (`_`) (e.g., `this._options`, `_requestRender()`).

**Constants**: Variables holding constant, unchanging values (like lookup keys or event names) should be written in UPPER_SNAKE_CASE.

**Descriptive Names**: Prefer clarity over brevity. Use `rowIndex` instead of `r`, `element` instead of `el`.

## 4. Architectural Patterns

### 4.1. Module Structure (IIFE)

The entire library must be wrapped in an Immediately Invoked Function Expression (IIFE) to create a private scope and prevent pollution of the global namespace. A universal export block will be used to expose the public API.

```javascript
(function(global) {
    'use strict';

    // All private helper functions and class definitions go here.

    class MyComponent { /* ... */ }

    // Explicitly expose the public API.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = MyComponent; // Node.js
    } else {
        global.MyComponent = MyComponent; // Browser
    }
}(this || window));
```

### 4.2. Class Structure

Component classes must be organized in the following order to ensure consistency and readability:

1. Public Properties (if any)
2. Private Properties
3. `constructor()`
4. Public Getters/Setters
5. Public API Methods
6. Private Event Handlers (e.g., `_handleClick`, `_handleScroll`)
7. Private Helper Methods (e.g., `_createWrapper`, `_injectStyles`)
8. `destroy()`

### 4.3. Function Organization

**Stateless Helpers**: Pure utility functions that do not rely on instance state (e.g., a data formatter) should be defined as standalone functions within the IIFE's private scope, outside any class.

**Stateful Helpers**: Functions that rely on an instance's state (`this._options`, etc.) must be defined as private methods within the class.

### 4.4. DOM Interaction

**DOM Wrapper**: The component must create its own top-level wrapper element, which is then injected into the user-provided parent. The component will not inject its internal structure directly into the user's container.

**Parent Container**: The component is responsible for ensuring the user-provided parent container is a valid positioning context. It must programmatically set `position: relative` on the parent if, and only if, its current position is `static`.

### 4.5. Styling (CSS)

**Core Styles**: Essential, structural CSS must be injected into the document `<head>` via a `<style>` tag by the component itself. This logic must ensure styles are only injected once per page load.

**Class Naming**: All generated elements must use a consistent, BEM-like (Block, Element, Modifier) naming convention to allow for user customization and theming. The convention is `.jw-component__element--modifier`.

Example: `.jw-listbox__row--selected`

### 4.6. Event Handling

**Event Delegation**: Event listeners must be attached to a single parent container, not to individual child elements. The handler will use `event.target.closest('selector')` to identify which child element triggered the event. This is mandatory for performance and clean code.

**Public Event API**: Components must expose a public `.on(eventName, callback)` method for users to subscribe to events. An internal `_emit(eventName, payload)` method will be used to fire these events.

### 4.7. Error Handling

**Central Handler**: All predictable user errors (e.g., invalid parameters) must be funneled through a single private method (e.g., `_handleError`).

**Error Event**: The error handler will fire a public error event via the `.on()` system, passing a structured error object: `{ code, message, method, timestamp }`.

**Catastrophic Errors**: Unexpected internal errors (bugs in the library) should be allowed to throw, or be caught and re-thrown with more context, to ensure they are surfaced immediately during development.

## 5. Accessibility (A11y)

Accessibility is a non-negotiable requirement. All components must be designed with A11y as a primary consideration.

**Semantic HTML**: Use the correct HTML element for the job (`<table>` for grids, `<ul>` for lists, `<button>` for buttons).

**ARIA Roles**: Apply all relevant WAI-ARIA roles and attributes (`role="listbox"`, `role="option"`, `aria-selected`, `aria-multiselectable`).

**Keyboard Navigation**: All functionality must be 100% operable via the keyboard. This includes selection, activation, and scrolling.

**Focus Management**: The component must manage focus intelligently, following established patterns for composite widgets.