/**
 * JwListBox Component
 * Codename: Project Janus
 *
 * A modern, high-performance, and dependency-free list/grid component.
 *
 * @version 0.9.0 (Sprint 9: Section Headers & Grouping)
 */
(function(global) {
    'use strict';

    // A one-time flag to ensure styles are only ever injected once per page load.
    let stylesInjected = false;

    // Essential CSS for the component - separated into structural and cosmetic rules.
    const coreCss = `
        /* === STRUCTURAL RULES (Always Applied) === */
        /* Core layout and positioning */
        .jw-listbox-wrapper {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;
        }
        .jw-listbox__body {
            height: 100%;
            overflow: auto;
        }
        .jw-listbox__list {
            margin: 0;
            padding: 0;
            list-style: none;
        }
        .jw-listbox__row {
            cursor: pointer;
        }
        .jw-listbox__table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }
        .jw-listbox__header {
            cursor: pointer;
            text-align: left;
        }
        .jw-listbox__cell {
            text-align: left;
        }
        .jw-listbox__row--focused {
            outline: none;
        }
        .jw-listbox__section-header {
            cursor: pointer;
        }
        .jw-listbox__section-header--collapsed .jw-listbox__section-toggle::before {
            content: '► ';
        }
        .jw-listbox__section-header--expanded .jw-listbox__section-toggle::before {
            content: '▼ ';
        }
        .jw-listbox__section-content--hidden {
            display: none;
        }
        .jw-listbox__loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .jw-listbox__paging-control {
            text-align: center;
            cursor: pointer;
        }
        .jw-listbox__paging-cell {
            text-align: center;
        }
        
        /* Grid sticky header structure */
        .jw-listbox__grid-container {
            height: 100%;
            overflow: auto;
        }
        .jw-listbox__grid-container .jw-listbox__table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }
        .jw-listbox__grid-container .jw-listbox__header {
            position: sticky;
            top: 0;
            z-index: 1;
        }
        
        /* === COSMETIC RULES (Can be disabled with .jw-listbox--unstyled) === */
        /* Default styling for visual appearance */
        .jw-listbox-wrapper:not(.jw-listbox--unstyled) .jw-listbox__row {
            padding: 8px 12px;
            border-bottom: 1px solid #e0e0e0;
            transition: background-color 0.15s ease;
        }
        .jw-listbox-wrapper:not(.jw-listbox--unstyled) .jw-listbox__row:hover {
            background-color: #f5f5f5;
        }
        .jw-listbox-wrapper:not(.jw-listbox--unstyled) .jw-listbox__row--selected {
            background-color: #007bff;
            color: white;
        }
        .jw-listbox-wrapper:not(.jw-listbox--unstyled) .jw-listbox__row--focused {
            box-shadow: inset 0 0 0 2px #007bff;
        }
        .jw-listbox-wrapper:not(.jw-listbox--unstyled) .jw-listbox__paging-control {
            padding: 12px;
            background-color: #f8f9fa;
            border-bottom: 1px solid #e0e0e0;
            font-weight: 500;
            color: #6c757d;
        }
        .jw-listbox-wrapper:not(.jw-listbox--unstyled) .jw-listbox__paging-control:hover {
            background-color: #e9ecef;
            color: #495057;
        }
        .jw-listbox-wrapper:not(.jw-listbox--unstyled) .jw-listbox__header {
            padding: 12px;
            background-color: #f8f9fa;
            border-bottom: 2px solid #dee2e6;
            font-weight: 600;
            color: #495057;
        }
        .jw-listbox-wrapper:not(.jw-listbox--unstyled) .jw-listbox__header:hover {
            background-color: #e9ecef;
        }
        .jw-listbox-wrapper:not(.jw-listbox--unstyled) .jw-listbox__cell {
            padding: 8px 12px;
            border-bottom: 1px solid #e0e0e0;
        }
        .jw-listbox-wrapper:not(.jw-listbox--unstyled) .jw-listbox__section-header {
            padding: 10px 12px;
            background-color: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            font-weight: 600;
            color: #495057;
        }
        .jw-listbox-wrapper:not(.jw-listbox--unstyled) .jw-listbox__section-header:hover {
            background-color: #e9ecef;
        }
        .jw-listbox-wrapper:not(.jw-listbox--unstyled) .jw-listbox__loading-overlay {
            background-color: rgba(255, 255, 255, 0.9);
            color: #495057;
            font-size: 16px;
        }
        .jw-listbox-wrapper:not(.jw-listbox--unstyled) .jw-listbox__load-more-button {
            padding: 8px 16px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 14px;
        }
        .jw-listbox-wrapper:not(.jw-listbox--unstyled) .jw-listbox__load-more-button:hover {
            background-color: #0056b3;
        }
        .jw-listbox-wrapper:not(.jw-listbox--unstyled) .jw-listbox__load-more-button:disabled {
            background-color: #6c757d;
            opacity: 0.6;
        }
    `;

    class JwListBox {
        // --- Private Properties ---
        _options = {};
        _events = {};
        _isDirty = false;
        _wrapperEl = null;
        _bodyEl = null; // Will hold the <ul> or <tbody>
        _internalIdCounter = 0;
        _selection = new Set(); // Tracks selected public IDs
        _focusedIndex = -1; // Index of currently focused row for keyboard nav
        
        // --- DataMaster Integration ---
        dm = null; // Master data instance
        viewDm = null; // View data instance (after filtering/sorting)
        _rowMap = new Map(); // Maps row indices to { internalId, publicId, element, data }
        
        // --- Advanced Formatting (Sprint 8) ---
        _manualTags = new Map(); // Maps internal IDs to { rowClasses: Set, cellClasses: Map<field, Set> }
        _conditionalFormats = new Map(); // Maps rule names to format rule objects
        
        // --- Section Headers & Grouping (Sprint 9) ---
        _currentSortField = null; // Current field being sorted for section grouping
        _showSections = false; // Whether to show section headers
        _sectionStates = new Map(); // Maps section values to collapsed/expanded state
        _autoSectionHide = false; // Auto-collapse sections on header click
        
        // --- Paging (Sprint 25) ---
        _pagingOptions = null; // Paging configuration object
        _currentPage = 0; // Current page index (0-based) - kept for compatibility
        _windowStart = 0; // Current window start index for virtual pagination
        _totalRecords = 0; // Total records for server-side paging

        /**
         * Initializes a new JwListBox instance.
         * @param {string|HTMLElement} parent - A CSS selector or DOM element for the container.
         * @param {object} [options={}] - Initial configuration options.
         */
        constructor(parent, options = {}) {
            this._log('info', 'Initializing JwListBox', { parent, options });
            
            const parentEl = typeof parent === 'string' ? document.querySelector(parent) : parent;

            if (!parentEl) {
                const error = 'Parent element not found.';
                this._log('error', error, { parent });
                console.error('JwListBox Error:', error);
                return;
            }
            this._parentEl = parentEl;
            this._log('debug', 'Parent element found', { element: parentEl });

            // --- Default Options ---
            const defaultOptions = {
                displayMode: 'grid', // 'list' or 'grid'
                template: null, // Template for 'list' mode rendering
                idField: null, // Field name to use as public identifier
                clickToSelect: true, // Enable click-to-select behavior
                preventAutoSelection: false, // When true, clicks emit events but don't change selection
                selectionMode: 'replace', // 'replace' (click replaces, Ctrl+click toggles) or 'toggle' (click toggles)
                autoSelectFirst: false, // Auto-select first row on load/search
                showTableHeaders: true, // Show column headers in grid mode
                columnWidths: null, // Object mapping field names to widths for grid mode
                autoSectionHide: false, // Auto-collapse/expand sections on header click
                clickOnCells: false, // When true, emits cellClick events for individual cell clicks in grid mode
                useDefaultStyles: true // When false, disables default cosmetic styles (.jw-listbox--unstyled)
            };
            this._options = { ...defaultOptions, ...options };
            this._log('debug', 'Options configured', this._options);

            // --- Core Setup ---
            this._log('debug', 'Creating wrapper...');
            this._createWrapper();
            this._log('debug', 'Injecting styles...');
            this._injectStyles();

            // --- Initial Render ---
            // We can configure before the first render happens.
            if (options) {
                this._log('debug', 'Applying initial configuration...');
                this.configure(options);
            }
            this._log('debug', 'Requesting initial render...');
            this._requestRender();
            this._log('info', 'JwListBox initialization complete');
        }

        // --- Public API Methods ---

        /**
         * Configures the listbox with multiple options at once.
         * @param {object} options - A key-value object of configuration options.
         * @returns {JwListBox} The instance for chaining.
         */
        configure(options) {
            for (const key in options) {
                const setterName = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
                if (typeof this[setterName] === 'function') {
                    this[setterName](options[key]);
                }
            }
            return this;
        }

        /**
         * Registers a callback for a specific event.
         * @param {string} eventName - The name of the event (e.g., 'select', 'error').
         * @param {Function} callback - The function to execute when the event fires.
         * @returns {JwListBox} The instance for chaining.
         */
        on(eventName, callback) {
            if (typeof callback === 'function') {
                // Initialize event array if it doesn't exist
                if (!this._events[eventName]) {
                    this._events[eventName] = [];
                }
                // Add callback to the array
                this._events[eventName].push(callback);
            } else {
                this._handleError({
                    code: 'INVALID_CALLBACK',
                    message: `A non-function was passed to .on('${eventName}')`,
                    method: 'on'
                });
            }
            return this;
        }

        /**
         * Renders the component based on its current state. This is the core drawing method.
         * It is scheduled automatically but can be called manually for advanced use cases.
         */
        render() {
            this._log('debug', 'Render called', { isDirty: this._isDirty });
            
            if (!this._isDirty) {
                this._log('debug', 'Render skipped - not dirty');
                return;
            }

            // Emit beforeRender lifecycle event
            this._emit('beforeRender', {
                displayMode: this._options.displayMode,
                recordCount: this.viewDm ? this.viewDm.toRecordset().length : 0
            });

            this._log('info', 'Starting render process');
            
            // Clear existing content
            this._bodyEl.innerHTML = '';
            this._log('debug', 'Cleared existing content');

            // If no data, show placeholder
            if (!this.viewDm || this.viewDm.toRecordset().length === 0) {
                this._log('warn', 'No data to display', { 
                    hasViewDm: !!this.viewDm, 
                    recordCount: this.viewDm ? this.viewDm.toRecordset().length : 0 
                });
                this._bodyEl.innerHTML = `<p>JwListBox: No data to display.</p>`;
                this._isDirty = false;
                return;
            }

            // Handle client-side paging
            let renderDm = this.viewDm; // Default to full viewDm
            
            if (this._pagingOptions && !this._pagingOptions.dataProvider) {
                this._log('info', 'Applying client-side virtual pagination');
                
                // Calculate virtual pagination window from the full viewDm
                const pageSize = this._pagingOptions.pageSize;
                const windowStart = this._windowStart;
                const windowEnd = windowStart + pageSize;
                
                // Use DataMaster's slice method to get the window
                renderDm = this.viewDm.slice(windowStart, windowEnd);
                
                this._log('debug', 'Client-side virtual paging details', {
                    totalRecords: this.viewDm.length(),
                    pageSize: pageSize,
                    windowStart: windowStart,
                    windowEnd: windowEnd,
                    windowRecords: renderDm.length()
                });
                
                // Update total records count
                this._totalRecords = this.viewDm.length();
            }

            const recordCount = renderDm.toRecordset().length;
            this._log('info', `Rendering ${recordCount} records in ${this._options.displayMode} mode`);

            // Temporarily replace viewDm with renderDm for rendering
            const originalViewDm = this.viewDm;
            this.viewDm = renderDm;

            // Rebuild row map with correct index offset for virtual pagination
            const indexOffset = this._pagingOptions && !this._pagingOptions.dataProvider ? this._windowStart : 0;
            this._buildRowMap(false, indexOffset);

            // Render based on display mode
            if (this._options.displayMode === 'list') {
                this._renderListMode();
            } else if (this._options.displayMode === 'grid') {
                this._renderGridMode();
            } else {
                this._log('error', `Unknown display mode: ${this._options.displayMode}`);
                this._bodyEl.innerHTML = `<p>Unknown display mode: ${this._options.displayMode}</p>`;
            }

            // Restore original viewDm
            this.viewDm = originalViewDm;

            this._isDirty = false;
            this._log('info', 'Render process complete');
            
            // Update visual selection after render to maintain selection across window changes
            this._updateVisualSelection();
            
            // Emit render lifecycle event
            this._emit('render', {
                displayMode: this._options.displayMode,
                recordCount: this.viewDm ? this.viewDm.toRecordset().length : 0
            });
            
            // Emit windowChange event for paging (both client-side and server-side)
            if (this._pagingOptions) {
                const windowStart = this._windowStart;
                const windowEnd = Math.min(windowStart + this._pagingOptions.pageSize, this._totalRecords);
                
                this._emit('windowChange', {
                    windowStart: windowStart,
                    windowEnd: windowEnd,
                    totalRecords: this._totalRecords,
                    pageSize: this._pagingOptions.pageSize,
                    currentPage: Math.floor(windowStart / this._pagingOptions.pageSize)
                });
            }
        }

        /**
         * Destroys the component, cleaning up all DOM elements, event listeners, and references.
         */
        destroy() {
            // Emit beforeDestroy lifecycle event
            this._emit('beforeDestroy', {
                recordCount: this.viewDm ? this.viewDm.toRecordset().length : 0
            });

            // Remove event listeners using the same bound references
            if (this._bodyEl && this._boundHandlers) {
                this._bodyEl.removeEventListener('click', this._boundHandlers.bodyClick);
                this._bodyEl.removeEventListener('dblclick', this._boundHandlers.bodyDblClick);
                this._bodyEl.removeEventListener('contextmenu', this._boundHandlers.bodyContextMenu);
                this._bodyEl.removeEventListener('mouseenter', this._boundHandlers.bodyMouseEnter, true);
                this._bodyEl.removeEventListener('mouseleave', this._boundHandlers.bodyMouseLeave, true);
            }
            if (this._wrapperEl && this._boundHandlers) {
                this._wrapperEl.removeEventListener('keydown', this._boundHandlers.keyDown);
            }

            // Remove the component's DOM structure
            if (this._wrapperEl) {
                this._wrapperEl.remove();
            }

            // Nullify properties to prevent memory leaks and help garbage collection
            this._parentEl = null;
            this._wrapperEl = null;
            this._bodyEl = null;
            this._boundHandlers = null;
            this._events = {};
            this._options = {};
            this.dm = null;
            this.viewDm = null;
            this._rowMap.clear();
            this._internalIdCounter = 0;
            this._selection.clear();
            this._focusedIndex = -1;
            
            // Emit destroy lifecycle event
            this._emit('destroy', {});
        }

        // --- Placeholder Fluent Setters (to be implemented in later sprints) ---
        /**
         * Sets the data source for the listbox using DataMaster factory methods.
         * Auto-detects data format and uses appropriate factory method.
         * @param {Array|string|DataMaster} data - The data to display
         * @param {object} [options={}] - Options for DataMaster factory methods
         * @returns {JwListBox} The instance for chaining
         */
        setSource(data, options = {}) {
            this._log('info', 'setSource called', { dataType: typeof data, dataLength: Array.isArray(data) ? data.length : 'N/A', options });
            
            try {
                // Check if DataMaster is available
                this._log('debug', 'Checking DataMaster availability');
                if (typeof DataMaster === 'undefined') {
                    throw new Error('DataMaster library is not available. Please ensure datamaster.js is loaded before jw-listbox.js.');
                }
                this._log('debug', 'DataMaster is available');

                let detectedFormat = 'unknown';
                
                // If it's already a DataMaster instance, use it directly
                if (data && typeof data === 'object' && data.constructor && data.constructor.name === 'DataMaster') {
                    detectedFormat = 'DataMaster instance';
                    this._log('debug', 'Using existing DataMaster instance');
                    this.dm = data;
                }
                // Auto-detect format and use appropriate factory method
                else if (typeof data === 'string') {
                    detectedFormat = 'CSV string';
                    this._log('debug', 'Creating DataMaster from CSV string', { length: data.length });
                    this.dm = DataMaster.fromCsv(data, options);
                }
                else if (Array.isArray(data)) {
                    if (data.length > 0 && typeof data[0] === 'object' && !Array.isArray(data[0])) {
                        detectedFormat = 'recordset (array of objects)';
                        this._log('debug', 'Creating DataMaster from recordset', { records: data.length, sampleRecord: data[0] });
                        this.dm = DataMaster.fromRecordset(data, options);
                    }
                    else {
                        detectedFormat = 'table (array of arrays)';
                        this._log('debug', 'Creating DataMaster from table', { rows: data.length });
                        this.dm = DataMaster.fromTable(data, options);
                    }
                }
                else {
                    throw new Error('Unsupported data format');
                }

                this._log('info', `DataMaster created from ${detectedFormat}`);
                
                // Validate DataMaster was created successfully
                if (!this.dm) {
                    throw new Error('Failed to create DataMaster instance');
                }
                
                const masterRecordCount = this.dm.toRecordset().length;
                this._log('debug', `Master DataMaster contains ${masterRecordCount} records`);

                // Initialize viewDm as a clone of the master data
                this._log('debug', 'Cloning master data to viewDm');
                this.viewDm = this.dm.clone();
                
                const viewRecordCount = this.viewDm.toRecordset().length;
                this._log('debug', `View DataMaster contains ${viewRecordCount} records`);
                
                // Clear selection and focus when data changes
                this._selection.clear();
                this._focusedIndex = -1;
                
                // Build the row map
                this._log('debug', 'Building row map');
                this._buildRowMap();
                this._log('debug', `Row map built with ${this._rowMap.size} entries`);
                
                // Trigger re-render
                this._log('debug', 'Requesting render after data source change');
                this._requestRender();
                
                this._log('info', 'setSource completed successfully');
                
            } catch (error) {
                this._log('error', 'setSource failed', { error: error.message, stack: error.stack });
                this._handleError({
                    code: 'INVALID_DATA_SOURCE',
                    message: `Failed to set data source: ${error.message}`,
                    method: 'setSource'
                });
            }
            
            return this;
        }

        /**
         * Sets the template for list mode rendering.
         * @param {string|HTMLElement} template - Template source: HTML string, CSS selector for <template> or <div>
         * @returns {JwListBox} The instance for chaining
         */
        setTemplate(template) {
            this._log('info', 'setTemplate called', { templateType: typeof template, template });
            
            try {
                // Validate template parameter
                if (template === null || template === undefined) {
                    this._options.template = null;
                    this._log('debug', 'Template set to null (will use default rendering)');
                } else if (typeof template === 'string' || template instanceof HTMLElement) {
                    this._options.template = template;
                    this._log('debug', 'Template set successfully');
                } else {
                    throw new Error('Template must be a string, HTMLElement, or null');
                }
                
                this._requestRender();
                this._log('info', 'setTemplate completed successfully');
                
            } catch (error) {
                this._log('error', 'setTemplate failed', { error: error.message });
                this._handleError({
                    code: 'INVALID_TEMPLATE',
                    message: `Failed to set template: ${error.message}`,
                    method: 'setTemplate'
                });
            }
            
            return this;
        }

        /**
         * Sets the display mode for the listbox.
         * @param {string} mode - 'list' or 'grid'
         * @returns {JwListBox} The instance for chaining
         */
        setDisplayMode(mode) {
            if (mode !== 'list' && mode !== 'grid') {
                this._handleError({
                    code: 'INVALID_DISPLAY_MODE',
                    message: `Display mode must be 'list' or 'grid', got: ${mode}`,
                    method: 'setDisplayMode'
                });
                return this;
            }
            
            this._options.displayMode = mode;
            this._requestRender();
            return this;
        }

        /**
         * Sets the field to use as the public identifier for rows.
         * @param {string|null} fieldName - The field name or null to use index-based IDs
         * @returns {JwListBox} The instance for chaining
         */
        setIdField(fieldName) {
            this._log('info', 'setIdField called', { fieldName });
            
            if (fieldName !== null && typeof fieldName !== 'string') {
                this._handleError({
                    code: 'INVALID_ID_FIELD',
                    message: `ID field must be a string or null, got: ${typeof fieldName}`,
                    method: 'setIdField'
                });
                return this;
            }
            
            this._options.idField = fieldName;
            
            // Rebuild row map if we have data
            if (this.viewDm) {
                this._buildRowMap();
                this._requestRender();
            }
            
            this._log('info', 'setIdField completed successfully');
            return this;
        }


        /**
         * Enables or disables click-to-select behavior.
         * @param {boolean} enabled - Whether to enable click-to-select
         * @returns {JwListBox} The instance for chaining
         */
        setClickToSelect(enabled) {
            this._log('info', 'setClickToSelect called', { enabled });
            
            if (typeof enabled !== 'boolean') {
                this._handleError({
                    code: 'INVALID_CLICK_TO_SELECT',
                    message: `clickToSelect must be a boolean, got: ${typeof enabled}`,
                    method: 'setClickToSelect'
                });
                return this;
            }
            
            this._options.clickToSelect = enabled;
            this._log('info', 'setClickToSelect completed successfully');
            return this;
        }

        /**
         * Sets the selection interaction mode.
         * @param {string} mode - 'replace' (click replaces selection) or 'toggle' (click toggles selection)
         * @returns {JwListBox} The instance for chaining
         */
        setSelectionMode(mode) {
            this._log('info', 'setSelectionMode called', { mode });
            
            if (mode !== 'replace' && mode !== 'toggle') {
                this._handleError({
                    code: 'INVALID_SELECTION_MODE',
                    message: `selectionMode must be 'replace' or 'toggle', got: ${mode}`,
                    method: 'setSelectionMode'
                });
                return this;
            }
            
            this._options.selectionMode = mode;
            this._log('info', `Selection mode set to '${mode}': ${mode === 'replace' ? 'Click replaces selection (use Ctrl+click to toggle)' : 'Click toggles selection'}`);
            return this;
        }

        /**
         * Controls whether clicks automatically change selection state.
         * @param {boolean} prevent - When true, clicks emit events but don't change selection
         * @returns {JwListBox} The instance for chaining
         */
        setPreventAutoSelection(prevent) {
            this._log('info', 'setPreventAutoSelection called', { prevent });
            
            if (typeof prevent !== 'boolean') {
                this._handleError({
                    code: 'INVALID_PREVENT_AUTO_SELECTION',
                    message: `preventAutoSelection must be a boolean, got: ${typeof prevent}`,
                    method: 'setPreventAutoSelection'
                });
                return this;
            }
            
            this._options.preventAutoSelection = prevent;
            this._log('info', `Prevent auto-selection set to ${prevent}: ${prevent ? 'Clicks will emit events but not change selection' : 'Clicks will change selection normally'}`);
            return this;
        }

        /**
         * Enables or disables auto-selecting the first row.
         * @param {boolean} enabled - Whether to auto-select first row
         * @returns {JwListBox} The instance for chaining
         */
        setAutoSelectFirst(enabled) {
            this._log('info', 'setAutoSelectFirst called', { enabled });
            
            if (typeof enabled !== 'boolean') {
                this._handleError({
                    code: 'INVALID_AUTO_SELECT_FIRST',
                    message: `autoSelectFirst must be a boolean, got: ${typeof enabled}`,
                    method: 'setAutoSelectFirst'
                });
                return this;
            }
            
            this._options.autoSelectFirst = enabled;
            this._log('info', 'setAutoSelectFirst completed successfully');
            return this;
        }

        /**
         * Enables or disables table headers in grid mode.
         * @param {boolean} enabled - Whether to show table headers
         * @returns {JwListBox} The instance for chaining
         */
        setShowTableHeaders(enabled) {
            this._log('info', 'setShowTableHeaders called', { enabled });
            
            if (typeof enabled !== 'boolean') {
                this._handleError({
                    code: 'INVALID_SHOW_TABLE_HEADERS',
                    message: `showTableHeaders must be a boolean, got: ${typeof enabled}`,
                    method: 'setShowTableHeaders'
                });
                return this;
            }
            
            this._options.showTableHeaders = enabled;
            
            // Re-render if currently in grid mode
            if (this._options.displayMode === 'grid') {
                this._requestRender();
            }
            
            this._log('info', 'setShowTableHeaders completed successfully');
            return this;
        }

        /**
         * Sets column widths for grid mode.
         * @param {object|null} widths - Object mapping field names to CSS width values
         * @returns {JwListBox} The instance for chaining
         */
        setColumnWidths(widths) {
            this._log('info', 'setColumnWidths called', { widths });
            
            if (widths !== null && (typeof widths !== 'object' || Array.isArray(widths))) {
                this._handleError({
                    code: 'INVALID_COLUMN_WIDTHS',
                    message: `columnWidths must be an object or null, got: ${typeof widths}`,
                    method: 'setColumnWidths'
                });
                return this;
            }
            
            this._options.columnWidths = widths;
            
            // Apply widths if currently in grid mode
            if (this._options.displayMode === 'grid') {
                this._applyColumnWidths();
            }
            
            this._log('info', 'setColumnWidths completed successfully');
            return this;
        }

        /**
         * Enables or disables auto-collapse/expand of sections on header click.
         * @param {boolean} enabled - Whether to enable auto section hide/show
         * @returns {JwListBox} The instance for chaining
         */
        setAutoSectionHide(enabled) {
            this._log('info', 'setAutoSectionHide called', { enabled });
            
            if (typeof enabled !== 'boolean') {
                this._handleError({
                    code: 'INVALID_AUTO_SECTION_HIDE',
                    message: `autoSectionHide must be a boolean, got: ${typeof enabled}`,
                    method: 'setAutoSectionHide'
                });
                return this;
            }
            
            this._options.autoSectionHide = enabled;
            this._log('info', 'setAutoSectionHide completed successfully');
            return this;
        }

        /**
         * Enables or disables the clickOnCells feature for grid mode.
         * @param {boolean} enabled - Whether to emit cellClick events for individual cell clicks
         * @returns {JwListBox} The instance for chaining
         */
        setClickOnCells(enabled) {
            this._log('info', 'setClickOnCells called', { enabled });
            
            if (typeof enabled !== 'boolean') {
                this._handleError({
                    code: 'INVALID_CLICK_ON_CELLS',
                    message: `clickOnCells must be a boolean, got: ${typeof enabled}`,
                    method: 'setClickOnCells'
                });
                return this;
            }
            
            this._options.clickOnCells = enabled;
            this._log('info', 'setClickOnCells completed successfully');
            return this;
        }
        
        /**
         * Sets whether to use the default cosmetic styles.
         * @param {boolean} useStyles - Whether to use default styles (true) or disable them (false)
         * @returns {JwListBox} The instance for chaining
         */
        setUseDefaultStyles(useStyles) {
            this._log('info', 'setUseDefaultStyles called', { useStyles });
            
            if (typeof useStyles !== 'boolean') {
                this._handleError({
                    code: 'INVALID_USE_DEFAULT_STYLES',
                    message: `useDefaultStyles must be a boolean, got: ${typeof useStyles}`,
                    method: 'setUseDefaultStyles'
                });
                return this;
            }
            
            this._options.useDefaultStyles = useStyles;
            
            // Update the wrapper element class immediately
            if (this._wrapperEl) {
                if (useStyles) {
                    this._wrapperEl.classList.remove('jw-listbox--unstyled');
                } else {
                    this._wrapperEl.classList.add('jw-listbox--unstyled');
                }
            }
            
            this._log('info', 'setUseDefaultStyles completed successfully');
            return this;
        }

        // --- Public Selection API Methods ---

        /**
         * Gets the currently selected public IDs.
         * @returns {Array} Array of selected public IDs
         */
        getSelected() {
            return Array.from(this._selection);
        }

        /**
         * Sets the selection to the specified public IDs.
         * @param {Array|*} ids - Array of public IDs or single ID to select
         * @returns {JwListBox} The instance for chaining
         */
        setSelected(ids) {
            this._log('info', 'setSelected called', { ids });
            
            // Convert single ID to array
            const idsArray = Array.isArray(ids) ? ids : [ids];
            
            // Clear current selection
            this._selection.clear();
            
            // Add valid IDs to selection
            idsArray.forEach(id => {
                if (this._isValidPublicId(id)) {
                    this._selection.add(id);
                } else {
                    this._log('warn', `ID not found in current data: ${id}`);
                }
            });
            
            // All selection modes support multi-selection via the API
            // The difference is only in user interaction behavior
            
            this._updateVisualSelection();
            this._emitSelectionEvent();
            this._log('info', 'setSelected completed successfully');
            return this;
        }

        /**
         * Clears all selections.
         * @returns {JwListBox} The instance for chaining
         */
        clearSelection() {
            this._log('info', 'clearSelection called');
            
            if (this._selection.size > 0) {
                this._selection.clear();
                this._updateVisualSelection();
                this._emitSelectionEvent();
            }
            
            this._log('info', 'clearSelection completed successfully');
            return this;
        }

        // --- Programmatic Interaction API Methods ---

        /**
         * Programmatically triggers a click event on a row.
         * @param {*} publicId - The public ID of the row to click
         * @param {Object} [options={}] - Options for the synthetic click
         * @param {boolean} [options.ctrlKey=false] - Whether to simulate Ctrl key being held
         * @param {boolean} [options.shiftKey=false] - Whether to simulate Shift key being held
         * @returns {JwListBox} The instance for chaining
         */
        click(publicId, options = {}) {
            this._log('info', 'click called', { publicId, options });
            
            if (!this._isValidPublicId(publicId)) {
                this._handleError({
                    code: 'INVALID_PUBLIC_ID',
                    message: `Invalid public ID for click: ${publicId}`,
                    method: 'click'
                });
                return this;
            }
            
            // Find the row element
            const rowElement = this._findRowElementByPublicId(publicId);
            if (!rowElement) {
                this._handleError({
                    code: 'ROW_NOT_FOUND',
                    message: `Row element not found for public ID: ${publicId}`,
                    method: 'click'
                });
                return this;
            }
            
            // Create synthetic event
            const syntheticEvent = {
                target: rowElement,
                currentTarget: rowElement,
                type: 'click',
                ctrlKey: Boolean(options.ctrlKey),
                shiftKey: Boolean(options.shiftKey),
                metaKey: false,
                altKey: false,
                button: 0,
                buttons: 1,
                bubbles: true,
                cancelable: true,
                defaultPrevented: false,
                preventDefault: () => { syntheticEvent.defaultPrevented = true; },
                stopPropagation: () => {},
                stopImmediatePropagation: () => {},
                synthetic: true // Mark as synthetic for debugging
            };
            
            // Trigger the internal click handling
            this._handleBodyEvent('click', syntheticEvent);
            
            this._log('info', 'Programmatic click completed successfully');
            return this;
        }

        /**
         * Programmatically triggers a double-click event on a row.
         * @param {*} publicId - The public ID of the row to double-click
         * @param {Object} [options={}] - Options for the synthetic double-click
         * @param {boolean} [options.ctrlKey=false] - Whether to simulate Ctrl key being held
         * @param {boolean} [options.shiftKey=false] - Whether to simulate Shift key being held
         * @returns {JwListBox} The instance for chaining
         */
        dblclick(publicId, options = {}) {
            this._log('info', 'dblclick called', { publicId, options });
            
            if (!this._isValidPublicId(publicId)) {
                this._handleError({
                    code: 'INVALID_PUBLIC_ID',
                    message: `Invalid public ID for dblclick: ${publicId}`,
                    method: 'dblclick'
                });
                return this;
            }
            
            // Find the row element
            const rowElement = this._findRowElementByPublicId(publicId);
            if (!rowElement) {
                this._handleError({
                    code: 'ROW_NOT_FOUND',
                    message: `Row element not found for public ID: ${publicId}`,
                    method: 'dblclick'
                });
                return this;
            }
            
            // Create synthetic event
            const syntheticEvent = {
                target: rowElement,
                currentTarget: rowElement,
                type: 'dblclick',
                ctrlKey: Boolean(options.ctrlKey),
                shiftKey: Boolean(options.shiftKey),
                metaKey: false,
                altKey: false,
                button: 0,
                buttons: 1,
                bubbles: true,
                cancelable: true,
                defaultPrevented: false,
                preventDefault: () => { syntheticEvent.defaultPrevented = true; },
                stopPropagation: () => {},
                stopImmediatePropagation: () => {},
                synthetic: true // Mark as synthetic for debugging
            };
            
            // Trigger the internal double-click handling
            this._handleBodyEvent('dblclick', syntheticEvent);
            
            this._log('info', 'Programmatic dblclick completed successfully');
            return this;
        }

        // --- Data Operations API Methods (Sprint 6) ---

        /**
         * Sorts the data by the specified field(s) and direction(s).
         * @param {string|Array<string>} fieldOrFields - The field name(s) to sort by
         * @param {boolean|Array<boolean>} [isDescending=false] - Sort direction(s). Defaults to ascending.
         * @param {boolean} [showSections=false] - Whether to group data into collapsible sections based on the sorted field's value
         * @returns {JwListBox} The instance for chaining
         */
        sort(fieldOrFields, isDescending = false, showSections = false) {
            this._log('info', 'sort called', { fieldOrFields, isDescending, showSections });
            
            try {
                if (!this.viewDm) {
                    throw new Error('No data available to sort');
                }
                
                // Apply sort to viewDm (affects current view)
                this.viewDm.sort(fieldOrFields, isDescending);
                
                // Store section state
                this._showSections = showSections;
                if (showSections) {
                    // Store the primary sort field for section grouping
                    this._currentSortField = Array.isArray(fieldOrFields) ? fieldOrFields[0] : fieldOrFields;
                    this._log('debug', 'Enabled sections for field', { sortField: this._currentSortField });
                } else {
                    this._currentSortField = null;
                    this._sectionStates.clear();
                }
                
                // Handle server-side paging integration
                if (this._pagingOptions && this._pagingOptions.dataProvider) {
                    // Reset to first page for server-side paging
                    this._windowStart = 0;
                    this._currentPage = 0;
                    
                    // Store sort parameters for server-side requests
                    this._sortParams = {
                        fieldOrFields: fieldOrFields,
                        isDescending: isDescending,
                        showSections: showSections
                    };
                    
                    // Clear selection
                    this._selection.clear();
                    this._focusedIndex = -1;
                    
                    // Load data with new sort parameters
                    this._loadServerSideWindow();
                    return this;
                }
                
                // Rebuild row map with new order and clear selection
                this._selection.clear();
                this._focusedIndex = -1;
                this._buildRowMap();
                
                // Trigger re-render
                this._requestRender();
                
                this._log('info', 'sort completed successfully');
                
            } catch (error) {
                this._log('error', 'sort failed', { error: error.message });
                this._handleError({
                    code: 'SORT_ERROR',
                    message: `Failed to sort data: ${error.message}`,
                    method: 'sort'
                });
            }
            
            return this;
        }

        /**
         * Searches/filters the data using an object filter or function, returning matching rows.
         * This modifies the view to show only matching results.
         * @param {Object|Function} filter - Object with key-value pairs or filter function
         * @returns {JwListBox} The instance for chaining
         */
        search(filter) {
            this._log('info', 'search called', { filter });
            
            try {
                if (!this.dm) {
                    throw new Error('No data available to search');
                }
                
                // Handle server-side paging integration
                if (this._pagingOptions && this._pagingOptions.dataProvider) {
                    // Reset to first page for server-side paging
                    this._windowStart = 0;
                    this._currentPage = 0;
                    
                    // Store filter parameters for server-side requests
                    this._filterParams = filter;
                    
                    // Clear selection
                    this._selection.clear();
                    this._focusedIndex = -1;
                    
                    // Load data with new filter parameters
                    this._loadServerSideWindow();
                    return this;
                }
                
                // Search the master data and update view
                this.viewDm = this.dm.search(filter);
                
                // Rebuild row map and clear selection
                this._selection.clear();
                this._focusedIndex = -1;
                this._buildRowMap();
                
                // Trigger re-render
                this._requestRender();
                
                const resultCount = this.viewDm.toRecordset().length;
                this._log('info', `search completed successfully - ${resultCount} results found`);
                
            } catch (error) {
                this._log('error', 'search failed', { error: error.message });
                this._handleError({
                    code: 'SEARCH_ERROR',
                    message: `Failed to search data: ${error.message}`,
                    method: 'search'
                });
            }
            
            return this;
        }

        /**
         * Searches/filters the data using a SQL-like WHERE clause string.
         * This modifies the view to show only matching results.
         * @param {string} clauseString - The WHERE clause logic
         * @param {Object} [queryFunctions] - Custom query functions for advanced filtering
         * @returns {JwListBox} The instance for chaining
         */
        where(clauseString, queryFunctions) {
            this._log('info', 'where called', { clauseString, queryFunctions });
            
            try {
                if (!this.dm) {
                    throw new Error('No data available to query');
                }
                
                // Search the master data with WHERE clause and update view
                this.viewDm = this.dm.where(clauseString, queryFunctions);
                
                // Rebuild row map and clear selection
                this._selection.clear();
                this._focusedIndex = -1;
                this._buildRowMap();
                
                // Trigger re-render
                this._requestRender();
                
                const resultCount = this.viewDm.toRecordset().length;
                this._log('info', `where completed successfully - ${resultCount} results found`);
                
            } catch (error) {
                this._log('error', 'where failed', { error: error.message });
                this._handleError({
                    code: 'WHERE_ERROR',
                    message: `Failed to execute WHERE clause: ${error.message}`,
                    method: 'where'
                });
            }
            
            return this;
        }

        /**
         * Destructively filters the master data using an object filter or function.
         * Unlike search(), this permanently removes rows from the underlying dataset.
         * @param {Object|Function} filter - Object with key-value pairs or filter function
         * @returns {JwListBox} The instance for chaining
         */
        limit(filter) {
            this._log('info', 'limit called', { filter });
            
            try {
                if (!this.dm) {
                    throw new Error('No master data available to limit');
                }
                
                // Apply limit to master data (destructive - permanently removes rows)
                this.dm.limit(filter);
                
                // Sync view with modified master data
                this.viewDm = this.dm.clone();
                
                // Rebuild row map and clear selection
                this._selection.clear();
                this._focusedIndex = -1;
                this._buildRowMap();
                
                // Trigger re-render
                this._requestRender();
                
                const resultCount = this.viewDm.toRecordset().length;
                this._log('info', `limit completed successfully - ${resultCount} rows remaining in dataset`);
                
            } catch (error) {
                this._log('error', 'limit failed', { error: error.message });
                this._handleError({
                    code: 'LIMIT_ERROR',
                    message: `Failed to limit data: ${error.message}`,
                    method: 'limit'
                });
            }
            
            return this;
        }

        /**
         * Destructively filters the master data using a SQL-like WHERE clause.
         * Unlike where(), this permanently removes rows from the underlying dataset.
         * @param {string} clauseString - The WHERE clause logic
         * @param {Object} [queryFunctions] - Custom query functions for advanced filtering
         * @returns {JwListBox} The instance for chaining
         */
        limitWhere(clauseString, queryFunctions) {
            this._log('info', 'limitWhere called', { clauseString, queryFunctions });
            
            try {
                if (!this.dm) {
                    throw new Error('No master data available to limit');
                }
                
                // Apply limitWhere to master data (destructive - permanently removes rows)
                this.dm.limitWhere(clauseString, queryFunctions);
                
                // Sync view with modified master data
                this.viewDm = this.dm.clone();
                
                // Rebuild row map and clear selection
                this._selection.clear();
                this._focusedIndex = -1;
                this._buildRowMap();
                
                // Trigger re-render
                this._requestRender();
                
                const resultCount = this.viewDm.toRecordset().length;
                this._log('info', `limitWhere completed successfully - ${resultCount} rows remaining in dataset`);
                
            } catch (error) {
                this._log('error', 'limitWhere failed', { error: error.message });
                this._handleError({
                    code: 'LIMIT_WHERE_ERROR',
                    message: `Failed to execute limitWhere clause: ${error.message}`,
                    method: 'limitWhere'
                });
            }
            
            return this;
        }

        /**
         * Executes a SQL-like query on the data using DataMaster's query engine.
         * SELECT operates on current view data (non-destructive filtering).
         * UPDATE/DELETE operate on master data (destructive operations).
         * @param {string} verb - The operation: 'select', 'update', or 'delete'
         * @param {Object} options - Query options (fields, where, orderBy, set, etc.)
         * @returns {JwListBox} The instance for chaining
         */
        query(verb, options) {
            this._log('info', 'query called', { verb, options });
            
            try {
                if (!this.dm) {
                    throw new Error('No data available to query');
                }
                
                let result;
                
                if (verb === 'select') {
                    // SELECT queries operate on current view data (non-destructive)
                    if (!this.viewDm) {
                        throw new Error('No view data available for SELECT query');
                    }
                    result = this.viewDm.query(verb, options);
                    this.viewDm = result;
                } else {
                    // UPDATE/DELETE queries operate on master data (destructive)
                    result = this.dm.query(verb, options);
                    // Sync view with modified master data
                    this.viewDm = this.dm.clone();
                }
                
                // Rebuild row map and clear selection
                this._selection.clear();
                this._focusedIndex = -1;
                this._buildRowMap();
                
                // Trigger re-render
                this._requestRender();
                
                const resultCount = this.viewDm.toRecordset().length;
                this._log('info', `query (${verb}) completed successfully - ${resultCount} rows in view`);
                
            } catch (error) {
                this._log('error', 'query failed', { error: error.message });
                this._handleError({
                    code: 'QUERY_ERROR',
                    message: `Failed to execute query: ${error.message}`,
                    method: 'query'
                });
            }
            
            return this;
        }

        /**
         * Clears any active search/filter and restores the full dataset view.
         * @returns {JwListBox} The instance for chaining
         */
        clearSearch() {
            this._log('info', 'clearSearch called');
            
            try {
                if (!this.dm) {
                    this._log('warn', 'No master data available - nothing to restore');
                    return this;
                }
                
                // Restore view to full master data
                this.viewDm = this.dm.clone();
                
                // Rebuild row map and clear selection
                this._selection.clear();
                this._focusedIndex = -1;
                this._buildRowMap();
                
                // Trigger re-render
                this._requestRender();
                
                const resultCount = this.viewDm.toRecordset().length;
                this._log('info', `clearSearch completed successfully - restored ${resultCount} rows`);
                
            } catch (error) {
                this._log('error', 'clearSearch failed', { error: error.message });
                this._handleError({
                    code: 'CLEAR_SEARCH_ERROR',
                    message: `Failed to clear search: ${error.message}`,
                    method: 'clearSearch'
                });
            }
            
            return this;
        }

        /**
         * Controls the visibility of a specific section by its value.
         * @param {*} sectionValue - The value of the section to show/hide
         * @param {boolean} [show=true] - Whether to show (true) or hide (false) the section
         * @returns {JwListBox} The instance for chaining
         */
        displaySection(sectionValue, show = true) {
            this._log('info', 'displaySection called', { sectionValue, show });
            
            if (!this._showSections || !this._currentSortField) {
                this._log('warn', 'displaySection called but sections are not enabled');
                return this;
            }
            
            // Update section state
            this._sectionStates.set(sectionValue, show ? 'expanded' : 'collapsed');
            
            // Update DOM elements
            this._updateSectionVisibility(sectionValue, show);
            
            this._log('info', 'displaySection completed successfully');
            return this;
        }

        // --- Data CRUD Operations (Sprint 7) ---

        /**
         * Updates a single row by its public ID or modifies a specific cell.
         * Uses smart rendering to update only the affected DOM element.
         * @param {*} rowId - The public ID of the row to update
         * @param {object|string} dataOrField - If object: complete row data; if string: field name
         * @param {*} [newValue] - New value for the field (used when dataOrField is a field name)
         * @returns {JwListBox} The instance for chaining
         */
        updateRow(rowId, dataOrField, newValue) {
            this._log('info', 'updateRow called', { rowId, dataOrField, newValue });
            
            try {
                if (!this.dm || !this.viewDm) {
                    throw new Error('No data available to update');
                }
                
                // Find the row in both master and view data
                let masterRowIndex = -1;
                let viewRowIndex = -1;
                
                // Find in master data
                const masterRecordset = this.dm.toRecordset();
                for (let i = 0; i < masterRecordset.length; i++) {
                    const row = masterRecordset[i];
                    const publicId = this._options.idField ? row[this._options.idField] : i;
                    if (publicId === rowId) {
                        masterRowIndex = i;
                        break;
                    }
                }
                
                if (masterRowIndex === -1) {
                    throw new Error(`Row with ID ${rowId} not found in master data`);
                }
                
                // Find in view data
                const viewRecordset = this.viewDm.toRecordset();
                for (let i = 0; i < viewRecordset.length; i++) {
                    const row = viewRecordset[i];
                    const publicId = this._options.idField ? row[this._options.idField] : i;
                    if (publicId === rowId) {
                        viewRowIndex = i;
                        break;
                    }
                }
                
                // Check if updating a single field or entire row
                if (typeof dataOrField === 'string') {
                    // Single field update
                    const fieldName = dataOrField;
                    this._log('debug', `Updating single field '${fieldName}' for row ${rowId}`);
                    
                    // Update master data
                    this.dm.modifyCell(masterRowIndex, fieldName, newValue);
                    
                    // Update view data if row is visible
                    if (viewRowIndex !== -1) {
                        this.viewDm.modifyCell(viewRowIndex, fieldName, newValue);
                        
                        // Smart render: update only the affected element
                        // Find the current row index in the row map by public ID
                        const currentRowIndex = this._findRowIndexByPublicId(rowId);
                        if (currentRowIndex !== -1) {
                            this._smartUpdateCell(currentRowIndex, fieldName, newValue);
                        } else {
                            this._log('warn', 'Could not find current row index for smart update, falling back to full render');
                            this._requestRender();
                        }
                    }
                    
                } else if (typeof dataOrField === 'object' && dataOrField !== null) {
                    // Complete row update
                    this._log('debug', `Updating entire row for row ${rowId}`);
                    
                    // Update all fields in master data
                    for (const [fieldName, value] of Object.entries(dataOrField)) {
                        this.dm.modifyCell(masterRowIndex, fieldName, value);
                    }
                    
                    // Update view data if row is visible
                    if (viewRowIndex !== -1) {
                        for (const [fieldName, value] of Object.entries(dataOrField)) {
                            this.viewDm.modifyCell(viewRowIndex, fieldName, value);
                        }
                        
                        // Smart render: update the entire row
                        // Find the current row index in the row map by public ID
                        const currentRowIndex = this._findRowIndexByPublicId(rowId);
                        if (currentRowIndex !== -1) {
                            this._smartUpdateRow(currentRowIndex, dataOrField);
                        } else {
                            this._log('warn', 'Could not find current row index for smart row update, falling back to full render');
                            this._requestRender();
                        }
                    }
                    
                } else {
                    throw new Error('Invalid update data: must be an object (for full row) or string (for field name)');
                }
                
                this._log('info', 'updateRow completed successfully');
                
            } catch (error) {
                this._log('error', 'updateRow failed', { error: error.message });
                this._handleError({
                    code: 'UPDATE_ROW_ERROR',
                    message: `Failed to update row: ${error.message}`,
                    method: 'updateRow'
                });
            }
            
            return this;
        }

        /**
         * Removes data by public ID(s). Uses smart rendering to remove only the affected DOM elements.
         * @param {*|Array} ids - Single ID or array of IDs to remove
         * @returns {JwListBox} The instance for chaining
         */
        removeData(ids) {
            this._log('info', 'removeData called', { ids });
            
            try {
                if (!this.dm || !this.viewDm) {
                    throw new Error('No data available to remove');
                }
                
                // Convert single ID to array
                const idsArray = Array.isArray(ids) ? ids : [ids];
                const removedElements = [];
                
                this._log('debug', `Removing ${idsArray.length} row(s)`);
                
                // Process each ID
                for (const rowId of idsArray) {
                    // Find and remove from master data
                    let masterRowIndex = -1;
                    const masterRecordset = this.dm.toRecordset();
                    
                    for (let i = 0; i < masterRecordset.length; i++) {
                        const row = masterRecordset[i];
                        const publicId = this._options.idField ? row[this._options.idField] : i;
                        if (publicId === rowId) {
                            masterRowIndex = i;
                            break;
                        }
                    }
                    
                    if (masterRowIndex === -1) {
                        this._log('warn', `Row with ID ${rowId} not found in master data, skipping`);
                        continue;
                    }
                    
                    // Remove from master data
                    this.dm.removeRow(masterRowIndex);
                    
                    // Find and remove from view data
                    let viewRowIndex = -1;
                    const viewRecordset = this.viewDm.toRecordset();
                    
                    for (let i = 0; i < viewRecordset.length; i++) {
                        const row = viewRecordset[i];
                        const publicId = this._options.idField ? row[this._options.idField] : i;
                        if (publicId === rowId) {
                            viewRowIndex = i;
                            break;
                        }
                    }
                    
                    if (viewRowIndex !== -1) {
                        // Store element for smart removal
                        const rowData = this._rowMap.get(viewRowIndex);
                        if (rowData && rowData.element) {
                            removedElements.push(rowData.element);
                        }
                        
                        // Remove from view data
                        this.viewDm.removeRow(viewRowIndex);
                    }
                    
                    // Remove from selection if selected
                    this._selection.delete(rowId);
                }
                
                // Smart render: remove DOM elements directly
                removedElements.forEach(element => {
                    element.remove();
                });
                
                // Rebuild row map due to changed indices (preserve elements since we did smart removal)
                this._buildRowMap(true);
                
                // Update focus if needed
                if (this._focusedIndex >= this.viewDm.toRecordset().length) {
                    this._focusedIndex = Math.max(0, this.viewDm.toRecordset().length - 1);
                }
                
                // Update visual selection and focus
                this._updateVisualSelection();
                this._updateFocusVisual();
                this._emitSelectionEvent();
                
                this._log('info', `removeData completed successfully - removed ${removedElements.length} elements`);
                
            } catch (error) {
                this._log('error', 'removeData failed', { error: error.message });
                this._handleError({
                    code: 'REMOVE_DATA_ERROR',
                    message: `Failed to remove data: ${error.message}`,
                    method: 'removeData'
                });
            }
            
            return this;
        }

        /**
         * Adds new data to the dataset. Uses smart rendering to insert only the new DOM elements.
         * @param {object|Array} data - Single row object or array of row objects to add
         * @param {*} [afterId] - Public ID to insert after (if not specified, adds to end)
         * @returns {JwListBox} The instance for chaining
         */
        addData(data, afterId) {
            this._log('info', 'addData called', { data, afterId });
            
            try {
                if (!this.dm || !this.viewDm) {
                    throw new Error('No existing data - use setSource() to initialize data first');
                }
                
                // Convert single object to array
                const dataArray = Array.isArray(data) ? data : [data];
                this._log('debug', `Adding ${dataArray.length} row(s)`);
                
                // Find insertion point in master data
                let masterInsertIndex = this.dm.toRecordset().length; // Default to end
                
                if (afterId !== undefined) {
                    const masterRecordset = this.dm.toRecordset();
                    for (let i = 0; i < masterRecordset.length; i++) {
                        const row = masterRecordset[i];
                        const publicId = this._options.idField ? row[this._options.idField] : i;
                        if (publicId === afterId) {
                            masterInsertIndex = i + 1;
                            break;
                        }
                    }
                }
                
                // Add to master data using efficient addRow method
                dataArray.forEach((newRow, index) => {
                    this.dm.addRow(newRow, masterInsertIndex + index);
                });
                
                // Check if new rows should appear in current view by applying current filters
                // For now, we'll take a simple approach and add to view if no filters are active
                // In a more sophisticated implementation, we would check against current search/filter state
                const currentViewCount = this.viewDm.toRecordset().length;
                const currentMasterCount = this.dm.toRecordset().length;
                
                if (currentViewCount === currentMasterCount - dataArray.length) {
                    // View shows all data, so add new rows to view as well
                    this._log('debug', 'Adding new rows to view (no filters active)');
                    
                    // Find insertion point in view data  
                    let viewInsertIndex = this.viewDm.toRecordset().length; // Default to end
                    
                    if (afterId !== undefined) {
                        const viewRecordset = this.viewDm.toRecordset();
                        for (let i = 0; i < viewRecordset.length; i++) {
                            const row = viewRecordset[i];
                            const publicId = this._options.idField ? row[this._options.idField] : i;
                            if (publicId === afterId) {
                                viewInsertIndex = i + 1;
                                break;
                            }
                        }
                    }
                    
                    // Add to view data using efficient addRow method
                    dataArray.forEach((newRow, index) => {
                        this.viewDm.addRow(newRow, viewInsertIndex + index);
                    });
                    
                    // Smart render: create and insert new DOM elements and get them back
                    const newElements = this._smartAddRows(dataArray, viewInsertIndex);
                    
                    // Rebuild row map and link new elements
                    this._buildRowMap();
                    this._linkNewElementsToRowMap(newElements, viewInsertIndex);
                    
                } else {
                    this._log('debug', 'View is filtered - new rows may not be visible');
                    // View is filtered, so new rows may not be visible
                    // User would need to clear search or the new rows would need to match current filters
                    
                    // Still rebuild row map for master data changes
                    this._buildRowMap();
                }
                
                this._log('info', `addData completed successfully - added ${dataArray.length} row(s)`);
                
            } catch (error) {
                this._log('error', 'addData failed', { error: error.message });
                this._handleError({
                    code: 'ADD_DATA_ERROR',
                    message: `Failed to add data: ${error.message}`,
                    method: 'addData'
                });
            }
            
            return this;
        }

        // --- Advanced Formatting Methods (Sprint 8) ---

        /**
         * Applies a CSS class tag to a specific row or cell.
         * This method performs direct DOM manipulation without triggering a re-render.
         * @param {*} rowId - The public ID of the row to tag
         * @param {string} cssClass - The CSS class name to apply
         * @param {Object} [options={}] - Options for tagging
         * @param {string} [options.field] - Field name to tag specific cell (grid mode only)
         * @param {boolean} [options.useRowIndex] - If true, rowId is treated as a row index instead of public ID
         * @returns {JwListBox} The instance for chaining
         */
        tag(rowId, cssClass, options = {}) {
            this._log('info', 'tag called', { rowId, cssClass, options });
            
            try {
                if (!cssClass || typeof cssClass !== 'string') {
                    throw new Error('cssClass must be a non-empty string');
                }
                
                let element = null;
                let internalId = null;
                
                // Find the element
                if (options.useRowIndex) {
                    // Use row index
                    const rowData = this._rowMap.get(rowId);
                    if (!rowData) {
                        throw new Error(`Row at index ${rowId} not found`);
                    }
                    element = rowData.element;
                    internalId = rowData.internalId;
                } else {
                    // Use public ID
                    element = this._findRowElementByPublicId(rowId);
                    if (!element) {
                        throw new Error(`Row with ID '${rowId}' not found`);
                    }
                    internalId = parseInt(element.getAttribute('data-internal-id'));
                }
                
                // Apply the tag based on mode and field option
                if (options.field && this._options.displayMode === 'grid') {
                    // Tag specific cell in grid mode
                    const cellElement = element.querySelector(`[data-field="${options.field}"]`);
                    if (!cellElement) {
                        throw new Error(`Cell with field '${options.field}' not found in row`);
                    }
                    cellElement.classList.add(cssClass);
                    this._trackManualTag(internalId, cssClass, options.field);
                    this._log('debug', `Tagged cell ${options.field} in row ${rowId} with class ${cssClass}`);
                } else {
                    // Tag entire row
                    element.classList.add(cssClass);
                    this._trackManualTag(internalId, cssClass);
                    this._log('debug', `Tagged row ${rowId} with class ${cssClass}`);
                }
                
                this._log('info', 'tag completed successfully');
                
            } catch (error) {
                this._log('error', 'tag failed', { error: error.message });
                this._handleError({
                    code: 'TAG_ERROR',
                    message: `Failed to apply tag: ${error.message}`,
                    method: 'tag'
                });
            }
            
            return this;
        }

        /**
         * Removes a CSS class tag from a specific row or cell.
         * @param {*} rowId - The public ID of the row to untag
         * @param {string} cssClass - The CSS class name to remove
         * @param {Object} [options={}] - Options for untagging
         * @param {string} [options.field] - Field name to untag specific cell (grid mode only)
         * @param {boolean} [options.useRowIndex] - If true, rowId is treated as a row index instead of public ID
         * @returns {JwListBox} The instance for chaining
         */
        removeTag(rowId, cssClass, options = {}) {
            this._log('info', 'removeTag called', { rowId, cssClass, options });
            
            try {
                if (!cssClass || typeof cssClass !== 'string') {
                    throw new Error('cssClass must be a non-empty string');
                }
                
                let element = null;
                let internalId = null;
                
                // Find the element
                if (options.useRowIndex) {
                    // Use row index
                    const rowData = this._rowMap.get(rowId);
                    if (!rowData) {
                        throw new Error(`Row at index ${rowId} not found`);
                    }
                    element = rowData.element;
                    internalId = rowData.internalId;
                } else {
                    // Use public ID
                    element = this._findRowElementByPublicId(rowId);
                    if (!element) {
                        throw new Error(`Row with ID '${rowId}' not found`);
                    }
                    internalId = parseInt(element.getAttribute('data-internal-id'));
                }
                
                // Remove the tag based on mode and field option
                if (options.field && this._options.displayMode === 'grid') {
                    // Remove tag from specific cell in grid mode
                    const cellElement = element.querySelector(`[data-field="${options.field}"]`);
                    if (!cellElement) {
                        throw new Error(`Cell with field '${options.field}' not found in row`);
                    }
                    cellElement.classList.remove(cssClass);
                    this._untrackManualTag(internalId, cssClass, options.field);
                    this._log('debug', `Removed tag ${cssClass} from cell ${options.field} in row ${rowId}`);
                } else {
                    // Remove tag from entire row
                    element.classList.remove(cssClass);
                    this._untrackManualTag(internalId, cssClass);
                    this._log('debug', `Removed tag ${cssClass} from row ${rowId}`);
                }
                
                this._log('info', 'removeTag completed successfully');
                
            } catch (error) {
                this._log('error', 'removeTag failed', { error: error.message });
                this._handleError({
                    code: 'REMOVE_TAG_ERROR',
                    message: `Failed to remove tag: ${error.message}`,
                    method: 'removeTag'
                });
            }
            
            return this;
        }

        /**
         * Adds a conditional formatting rule that automatically applies CSS classes during render.
         * Rules are only applied in grid mode - they are ignored in list mode.
         * @param {Object} ruleObject - The formatting rule
         * @param {string} ruleObject.name - Unique name for the rule
         * @param {string} ruleObject.searchField - Field name to test the condition against
         * @param {string|RegExp|Function} ruleObject.match - Value, pattern, or function predicate to match
         * @param {string} ruleObject.tag - CSS class to apply when condition is met
         * @param {string} [ruleObject.target='row'] - Target element type: 'row' or 'cell'
         * @returns {JwListBox} The instance for chaining
         */
        addFormat(ruleObject) {
            this._log('info', 'addFormat called', { ruleObject });
            
            try {
                if (!ruleObject || typeof ruleObject !== 'object') {
                    throw new Error('ruleObject must be an object');
                }
                
                const { name, searchField, match, tag, target = 'row' } = ruleObject;
                
                if (!name || typeof name !== 'string') {
                    throw new Error('Rule name must be a non-empty string');
                }
                
                if (!searchField || typeof searchField !== 'string') {
                    throw new Error('searchField must be a non-empty string');
                }
                
                if (match === undefined || match === null) {
                    throw new Error('match value is required');
                }
                
                if (!tag || typeof tag !== 'string') {
                    throw new Error('tag must be a non-empty string');
                }
                
                if (!['row', 'cell'].includes(target)) {
                    throw new Error('target must be either "row" or "cell"');
                }
                
                // Store the rule
                this._conditionalFormats.set(name, {
                    name,
                    searchField,
                    match,
                    tag,
                    target
                });
                
                // If we're in grid mode, trigger a re-render to apply the new rule
                if (this._options.displayMode === 'grid') {
                    this._requestRender();
                }
                
                this._log('info', `addFormat completed successfully - added rule '${name}'`);
                
            } catch (error) {
                this._log('error', 'addFormat failed', { error: error.message });
                this._handleError({
                    code: 'ADD_FORMAT_ERROR',
                    message: `Failed to add format rule: ${error.message}`,
                    method: 'addFormat'
                });
            }
            
            return this;
        }

        /**
         * Removes a conditional formatting rule by name.
         * @param {string} ruleName - The name of the rule to remove
         * @returns {JwListBox} The instance for chaining
         */
        removeFormat(ruleName) {
            this._log('info', 'removeFormat called', { ruleName });
            
            try {
                if (!ruleName || typeof ruleName !== 'string') {
                    throw new Error('ruleName must be a non-empty string');
                }
                
                const existed = this._conditionalFormats.delete(ruleName);
                
                if (!existed) {
                    this._log('warn', `Format rule '${ruleName}' not found`);
                } else {
                    // If we're in grid mode, trigger a re-render to remove the rule's effects
                    if (this._options.displayMode === 'grid') {
                        this._requestRender();
                    }
                    this._log('info', `removeFormat completed successfully - removed rule '${ruleName}'`);
                }
                
            } catch (error) {
                this._log('error', 'removeFormat failed', { error: error.message });
                this._handleError({
                    code: 'REMOVE_FORMAT_ERROR',
                    message: `Failed to remove format rule: ${error.message}`,
                    method: 'removeFormat'
                });
            }
            
            return this;
        }

        /**
         * Removes all conditional formatting rules.
         * @returns {JwListBox} The instance for chaining
         */
        clearAllFormats() {
            this._log('info', 'clearAllFormats called');
            
            try {
                const ruleCount = this._conditionalFormats.size;
                this._conditionalFormats.clear();
                
                // If we're in grid mode, trigger a re-render to remove all rule effects
                if (this._options.displayMode === 'grid') {
                    this._requestRender();
                }
                
                this._log('info', `clearAllFormats completed successfully - cleared ${ruleCount} rules`);
                
            } catch (error) {
                this._log('error', 'clearAllFormats failed', { error: error.message });
                this._handleError({
                    code: 'CLEAR_FORMATS_ERROR',
                    message: `Failed to clear format rules: ${error.message}`,
                    method: 'clearAllFormats'
                });
            }
            
            return this;
        }

        // --- Sprint 11: Core Data Retrieval API ---

        /**
         * Gets the complete data object for a row by its public ID.
         * @param {*} publicId - The row's public ID (from idField or row index)
         * @returns {Object|null} The complete data object for the matching row, or null if not found
         */
        getRowData(publicId) {
            this._log('debug', 'getRowData called', { publicId });
            
            if (!this.dm) {
                this._log('warn', 'getRowData: No data source available');
                return null;
            }
            
            try {
                // Search in master data to ensure we can find even filtered-out rows
                const masterRecordset = this.dm.toRecordset();
                const idField = this._options.idField;
                
                this._log('debug', `Searching ${masterRecordset.length} records with idField: ${idField}`);
                
                for (const row of masterRecordset) {
                    let rowPublicId;
                    
                    if (idField && row.hasOwnProperty(idField)) {
                        rowPublicId = row[idField];
                    } else {
                        // For index-based IDs, we need to find the original index
                        // Since master data doesn't maintain original indices after operations,
                        // we'll search by row reference if available, otherwise by position
                        const originalIndex = masterRecordset.indexOf(row);
                        rowPublicId = originalIndex;
                    }
                    
                    if (rowPublicId === publicId) {
                        this._log('debug', `Found row data for publicId: ${publicId}`, { rowData: row });
                        return { ...row }; // Return a copy to prevent external mutation
                    }
                }
                
                this._log('debug', `No row found for publicId: ${publicId}`);
                return null;
                
            } catch (error) {
                this._handleError({
                    code: 'GET_ROW_DATA_ERROR',
                    message: `Failed to get row data: ${error.message}`,
                    method: 'getRowData'
                });
                return null;
            }
        }

        /**
         * Gets the value of a specific field for a row by its public ID.
         * @param {*} publicId - The row's public ID (from idField or row index)
         * @param {string} fieldName - The name of the field to retrieve
         * @returns {*} The value of the specified field, or undefined if not found
         */
        getFieldValue(publicId, fieldName) {
            this._log('debug', 'getFieldValue called', { publicId, fieldName });
            
            if (typeof fieldName !== 'string') {
                this._handleError({
                    code: 'INVALID_FIELD_NAME',
                    message: 'Field name must be a string',
                    method: 'getFieldValue'
                });
                return undefined;
            }
            
            const rowData = this.getRowData(publicId);
            if (rowData === null) {
                this._log('debug', `No row found for publicId: ${publicId}`);
                return undefined;
            }
            
            const fieldValue = rowData[fieldName];
            this._log('debug', `Field value retrieved`, { publicId, fieldName, value: fieldValue });
            
            return fieldValue;
        }

        // --- Sprint 12: Advanced Selection & Search API ---

        /**
         * Gets an array of values from a specified column for all currently selected rows.
         * @param {string} fieldName - The name of the field to retrieve values from
         * @returns {Array} Array of values from the specified field for selected rows (empty if no selection)
         */
        getSelectedAs(fieldName) {
            this._log('debug', 'getSelectedAs called', { fieldName, selectionSize: this._selection.size });
            
            if (typeof fieldName !== 'string') {
                this._handleError({
                    code: 'INVALID_FIELD_NAME',
                    message: 'Field name must be a string',
                    method: 'getSelectedAs'
                });
                return [];
            }
            
            if (this._selection.size === 0) {
                this._log('debug', 'No rows selected, returning empty array');
                return [];
            }
            
            try {
                const result = [];
                
                // Iterate over the selection set and use _rowMap for efficient lookups
                for (const publicId of this._selection) {
                    // Find the row in the current view data using _rowMap
                    let rowData = null;
                    
                    // Search through _rowMap to find the row with this publicId
                    for (const [index, mapEntry] of this._rowMap.entries()) {
                        if (mapEntry.publicId === publicId) {
                            rowData = mapEntry.data;
                            break;
                        }
                    }
                    
                    // If not found in view data, fall back to master data
                    if (!rowData && this.dm) {
                        const masterData = this.dm.toRecordset();
                        const idField = this._options.idField;
                        
                        for (const row of masterData) {
                            let rowPublicId;
                            if (idField && row.hasOwnProperty(idField)) {
                                rowPublicId = row[idField];
                            } else {
                                rowPublicId = masterData.indexOf(row);
                            }
                            
                            if (rowPublicId === publicId) {
                                rowData = row;
                                break;
                            }
                        }
                    }
                    
                    if (rowData && rowData.hasOwnProperty(fieldName)) {
                        result.push(rowData[fieldName]);
                        this._log('debug', `Added field value for publicId ${publicId}`, { fieldName, value: rowData[fieldName] });
                    } else {
                        this._log('warn', `Field '${fieldName}' not found for selected row with publicId: ${publicId}`);
                        result.push(undefined);
                    }
                }
                
                this._log('debug', `getSelectedAs completed`, { fieldName, resultCount: result.length, values: result });
                return result;
                
            } catch (error) {
                this._handleError({
                    code: 'GET_SELECTED_AS_ERROR',
                    message: `Failed to get selected values: ${error.message}`,
                    method: 'getSelectedAs'
                });
                return [];
            }
        }

        /**
         * Performs a non-destructive search on the master dataset and returns matching data.
         * @param {Object|Function} filter - Filter object (key-value pairs) or filter function
         * @returns {Array} Array of data objects (recordset) for all matching rows
         */
        findRows(filter) {
            this._log('debug', 'findRows called', { filter });
            
            if (!this.dm) {
                this._log('warn', 'findRows: No data source available');
                return [];
            }
            
            if (!filter) {
                this._handleError({
                    code: 'INVALID_FILTER',
                    message: 'Filter parameter is required',
                    method: 'findRows'
                });
                return [];
            }
            
            try {
                // Use DataMaster's search method to perform the search on master data
                const searchResult = this.dm.search(filter);
                const resultRecordset = searchResult.toRecordset();
                
                this._log('debug', `findRows completed`, { 
                    filterType: typeof filter, 
                    matchCount: resultRecordset.length,
                    totalRows: this.dm.toRecordset().length
                });
                
                // Return a copy of the data to prevent external mutation
                return resultRecordset.map(row => ({ ...row }));
                
            } catch (error) {
                this._handleError({
                    code: 'FIND_ROWS_ERROR',
                    message: `Failed to find rows: ${error.message}`,
                    method: 'findRows'
                });
                return [];
            }
        }

        // --- Sprint 14: Final API & Metadata Methods ---

        /**
         * Renames fields at runtime using a mapping object.
         * @param {Object} nameMap - Object mapping old names to new names (e.g., { oldName: 'newName' })
         * @returns {JwListBox} The instance for chaining
         */
        setFieldNames(nameMap) {
            this._log('debug', 'setFieldNames called', { nameMap });
            
            if (!nameMap || typeof nameMap !== 'object' || Array.isArray(nameMap)) {
                this._handleError({
                    code: 'INVALID_NAME_MAP',
                    message: 'nameMap must be a non-array object',
                    method: 'setFieldNames'
                });
                return this;
            }
            
            if (!this.dm) {
                this._handleError({
                    code: 'NO_DATA_SOURCE',
                    message: 'No data source available for field renaming',
                    method: 'setFieldNames'
                });
                return this;
            }
            
            try {
                // Get current field names from DataMaster
                const currentFields = this.dm.getFieldNames();
                const newFields = [...currentFields];
                let hasChanges = false;
                
                // Apply the name mapping
                for (let i = 0; i < currentFields.length; i++) {
                    const oldName = currentFields[i];
                    if (nameMap.hasOwnProperty(oldName)) {
                        const newName = nameMap[oldName];
                        if (typeof newName !== 'string') {
                            this._handleError({
                                code: 'INVALID_NEW_NAME',
                                message: `New field name for '${oldName}' must be a string, got: ${typeof newName}`,
                                method: 'setFieldNames'
                            });
                            return this;
                        }
                        newFields[i] = newName;
                        hasChanges = true;
                        this._log('debug', `Mapping field '${oldName}' to '${newName}'`);
                    }
                }
                
                if (!hasChanges) {
                    this._log('warn', 'No valid field mappings found in nameMap');
                    return this;
                }
                
                // Apply the new field names to both master and view DataMaster instances
                this.dm.setFieldNames(newFields);
                if (this.viewDm && this.viewDm !== this.dm) {
                    this.viewDm.setFieldNames(newFields);
                }
                
                // Trigger a full re-render since field names have changed
                this._requestRender();
                
                this._log('info', 'setFieldNames completed successfully', { 
                    appliedMappings: Object.keys(nameMap).filter(key => currentFields.includes(key)),
                    newFields: newFields
                });
                
            } catch (error) {
                this._handleError({
                    code: 'SET_FIELD_NAMES_ERROR',
                    message: `Failed to set field names: ${error.message}`,
                    method: 'setFieldNames'
                });
            }
            
            return this;
        }

        /**
         * Returns a snapshot of the component's current state and metadata.
         * @returns {Object} Object containing useful metadata about the component state
         */
        getDetails() {
            this._log('debug', 'getDetails called');
            
            try {
                const details = {
                    // Data information
                    totalRows: this.dm ? this.dm.toRecordset().length : 0,
                    visibleRows: this.viewDm ? this.viewDm.toRecordset().length : 0,
                    isFiltered: false,
                    
                    // Selection information
                    selectionCount: this._selection.size,
                    selectedIds: Array.from(this._selection),
                    
                    // Component configuration
                    displayMode: this._options.displayMode,
                    idField: this._options.idField,
                    clickToSelect: this._options.clickToSelect,
                    showTableHeaders: this._options.showTableHeaders,
                    clickOnCells: this._options.clickOnCells,
                    
                    // Field information
                    fieldNames: this.dm ? this.dm.getFieldNames() : [],
                    fieldCount: this.dm ? this.dm.getFieldNames().length : 0,
                    
                    // State information
                    focusedIndex: this._focusedIndex,
                    hasData: !!(this.dm && this.dm.toRecordset().length > 0),
                    isRendered: !!(this._bodyEl && this._bodyEl.children.length > 0),
                    
                    // Advanced features state
                    sectionsEnabled: this._showSections,
                    sectionCount: this._sectionStates.size,
                    formatRulesCount: this._conditionalFormats.size,
                    manualTagsCount: this._manualTags.size,
                    
                    // Component dimensions (if rendered)
                    containerHeight: this._wrapperEl ? this._wrapperEl.offsetHeight : 0,
                    containerWidth: this._wrapperEl ? this._wrapperEl.offsetWidth : 0
                };
                
                // Determine if data is filtered
                if (this.dm && this.viewDm && this.dm !== this.viewDm) {
                    details.isFiltered = true;
                }
                
                this._log('debug', 'getDetails completed', details);
                return details;
                
            } catch (error) {
                this._handleError({
                    code: 'GET_DETAILS_ERROR',
                    message: `Failed to get component details: ${error.message}`,
                    method: 'getDetails'
                });
                
                // Return minimal details object on error
                return {
                    error: true,
                    totalRows: 0,
                    visibleRows: 0,
                    isFiltered: false,
                    selectionCount: 0,
                    selectedIds: [],
                    displayMode: this._options.displayMode || 'list',
                    hasData: false,
                    isRendered: false
                };
            }
        }

        // --- Private Helper Methods ---

        /**
         * Fires an event, triggering all registered callbacks.
         * @private
         * @param {string} eventName - The name of the event to fire.
         * @param {*} [payload] - The data to pass to the callbacks.
         */
        _emit(eventName, payload) {
            if (this._events[eventName] && Array.isArray(this._events[eventName])) {
                // Iterate over all registered callbacks for this event
                this._events[eventName].forEach((callback, index) => {
                    try {
                        callback(payload);
                    } catch (error) {
                        console.error(`JwListBox: Error in '${eventName}' event handler #${index}:`, error);
                    }
                });
            }
        }

        /**
         * Emits a log message through the logging system.
         * @private
         * @param {string} level - Log level: 'debug', 'info', 'warn', 'error'
         * @param {string} message - The log message
         * @param {*} [data] - Additional data to include
         */
        _log(level, message, data = null) {
            const logEntry = {
                timestamp: Date.now(),
                level: level,
                message: message,
                data: data
            };
            
            // Always log to console for debugging
            console[level] ? console[level](`JwListBox [${level}]:`, message, data || '') : console.log(`JwListBox [${level}]:`, message, data || '');
            
            // Emit through event system for subscribers
            this._emit('log', logEntry);
        }

        /**
         * Schedules a single, batched render for the next animation frame.
         * @private
         */
        _requestRender() {
            if (this._isDirty) {
                this._log('debug', 'Render already requested, skipping');
                return;
            }
            this._log('debug', 'Requesting render via requestAnimationFrame');
            this._isDirty = true;
            window.requestAnimationFrame(() => {
                this._log('debug', 'requestAnimationFrame callback executing');
                this.render();
            });
        }

        /**
         * Centralized error handler. Emits a public 'error' event.
         * @private
         * @param {{code: string, message: string, method: string}} errorDetails
         */
        _handleError(errorDetails) {
            const errorObject = {
                ...errorDetails,
                timestamp: Date.now()
            };
            this._emit('error', errorObject);
        }

        /**
         * Creates the main component wrapper and injects it into the parent.
         * Sets up event delegation for all user interactions.
         * @private
         */
        _createWrapper() {
            // Ensure the parent is a valid positioning context.
            const parentPosition = window.getComputedStyle(this._parentEl).position;
            if (parentPosition === 'static') {
                this._parentEl.style.position = 'relative';
            }

            // Create and inject the main wrapper.
            this._wrapperEl = document.createElement('div');
            this._wrapperEl.className = 'jw-listbox-wrapper';
            this._wrapperEl.setAttribute('tabindex', '0'); // Make focusable for keyboard events
            
            // Apply unstyled class if useDefaultStyles is false
            if (!this._options.useDefaultStyles) {
                this._wrapperEl.classList.add('jw-listbox--unstyled');
            }
            
            this._parentEl.appendChild(this._wrapperEl);

            // Create the body element where content will be rendered.
            this._bodyEl = document.createElement('div');
            this._bodyEl.className = 'jw-listbox__body';
            this._wrapperEl.appendChild(this._bodyEl);

            // Set up event delegation
            this._setupEventDelegation();
        }

        /**
         * Sets up event delegation for all user interactions.
         * @private
         */
        _setupEventDelegation() {
            // Store bound method references for proper cleanup
            this._boundHandlers = {
                bodyClick: (event) => this._handleBodyEvent('click', event),
                bodyDblClick: (event) => this._handleBodyEvent('dblclick', event),
                bodyContextMenu: (event) => this._handleBodyEvent('contextmenu', event),
                bodyMouseEnter: (event) => this._handleBodyEvent('mouseenter', event),
                bodyMouseLeave: (event) => this._handleBodyEvent('mouseleave', event),
                keyDown: (event) => this._handleKeyDown(event)
            };

            // Event delegation on the body element for row/cell events
            this._bodyEl.addEventListener('click', this._boundHandlers.bodyClick);
            this._bodyEl.addEventListener('dblclick', this._boundHandlers.bodyDblClick);
            this._bodyEl.addEventListener('contextmenu', this._boundHandlers.bodyContextMenu);
            this._bodyEl.addEventListener('mouseenter', this._boundHandlers.bodyMouseEnter, true);
            this._bodyEl.addEventListener('mouseleave', this._boundHandlers.bodyMouseLeave, true);

            // Keyboard events on the wrapper (which is focusable)
            this._wrapperEl.addEventListener('keydown', this._boundHandlers.keyDown);
        }

        /**
         * Handles all body-level events through event delegation.
         * @private
         * @param {string} eventType - The type of event
         * @param {Event} event - The original browser event
         */
        _handleBodyEvent(eventType, event) {
            // Check for section header clicks first (Sprint 9)
            const sectionHeaderElement = event.target.closest('.jw-listbox__section-header');
            if (sectionHeaderElement && eventType === 'click') {
                this._handleSectionHeaderClick(sectionHeaderElement, event);
                return; // Section header clicks don't trigger row events
            }
            
            // Check for paging control clicks (before row check)
            const pagingControlElement = event.target.closest('.jw-listbox__paging-control');
            if (pagingControlElement && eventType === 'click') {
                this._handlePagingControlClick(pagingControlElement, event);
                return; // Paging clicks don't trigger row events
            }
            
            // Check for table header clicks (before row check)
            const headerElement = event.target.closest('.jw-listbox__header');
            if (headerElement && eventType === 'click') {
                this._handleHeaderClick(headerElement, event);
                return; // Header clicks don't trigger row events
            }
            
            const rowElement = event.target.closest('.jw-listbox__row');
            if (!rowElement) {
                return; // Not a row-level event
            }

            this._log('debug', `Handling ${eventType} event on row`, { 
                eventType, 
                targetTagName: event.target.tagName,
                rowInternalId: rowElement.getAttribute('data-internal-id')
            });
            
            // For grid mode, detect if click was on a specific cell and include cell info
            const cellElement = this._options.displayMode === 'grid' ? event.target.closest('.jw-listbox__cell') : null;
            
            // Create row payload with optional cell information
            let payload;
            if (cellElement && cellElement !== rowElement) {
                // Grid mode with cell information
                payload = this._createCellEventPayload(cellElement, rowElement, event);
            } else {
                // Standard row event
                payload = this._createRowEventPayload(rowElement, event);
            }
            
            const rowEventName = eventType === 'mouseenter' ? 'rowMouseEnter' :
                               eventType === 'mouseleave' ? 'rowMouseLeave' :
                               eventType === 'contextmenu' ? 'rowContextMenu' :
                               eventType; // 'click' or 'dblclick' keep original names
            
            // Handle selection for click events
            if (eventType === 'click' && this._options.clickToSelect && !this._options.preventAutoSelection && payload) {
                this._handleRowSelection(payload, event);
            }
            
            // Emit cellClick event if clickOnCells is enabled and this is a cell click in grid mode
            if (eventType === 'click' && this._options.clickOnCells && cellElement && cellElement !== rowElement && this._options.displayMode === 'grid') {
                this._emit('cellClick', payload);
            }
            
            this._emit(rowEventName, payload);
        }

        /**
         * Handles keyboard events on the component wrapper.
         * @private
         * @param {KeyboardEvent} event - The keyboard event
         */
        _handleKeyDown(event) {
            this._log('debug', 'Handling keydown event', { 
                key: event.key, 
                code: event.code, 
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                altKey: event.altKey
            });

            // Handle keyboard navigation
            this._handleKeyboardNavigation(event);

            const payload = {
                key: event.key,
                code: event.code,
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                altKey: event.altKey,
                originalEvent: event
            };

            this._emit('keydown', payload);
        }

        /**
         * Injects the component's essential CSS into the document head.
         * @private
         */
        _injectStyles() {
            if (stylesInjected) {
                return;
            }
            const styleElement = document.createElement('style');
            styleElement.id = 'jw-listbox-styles';
            styleElement.textContent = coreCss;
            document.head.appendChild(styleElement);
            stylesInjected = true;
        }

        /**
         * Builds the internal row map that links data rows to DOM elements and IDs.
         * Implements the three-tiered ID system: internalId, publicId, index.
         * @private
         * @param {boolean} [preserveElements=false] - Whether to try preserving existing DOM element references
         * @param {number} [indexOffset=0] - Offset to add to row indices for virtual pagination
         */
        _buildRowMap(preserveElements = false, indexOffset = 0) {
            this._log('debug', 'Building row map', { preserveElements, indexOffset });
            
            // Store existing element references if preserving
            const existingElements = new Map();
            if (preserveElements) {
                // Find DOM elements directly and map them by their data-public-id attribute
                const domElements = this._bodyEl.querySelectorAll('.jw-listbox__row[data-public-id]');
                domElements.forEach(element => {
                    const publicId = element.getAttribute('data-public-id');
                    // Convert publicId back to its original type if it was numeric
                    let typedPublicId = publicId;
                    if (!isNaN(publicId) && publicId !== '') {
                        typedPublicId = parseInt(publicId);
                    }
                    existingElements.set(typedPublicId, element);
                });
                this._log('debug', `Preserving ${existingElements.size} existing DOM elements by data-public-id`);
            }
            
            this._rowMap.clear();
            this._internalIdCounter = 0;
            
            if (!this.viewDm) {
                this._log('warn', 'Cannot build row map - no viewDm available');
                return;
            }
            
            const recordset = this.viewDm.toRecordset();
            const idField = this._options.idField;
            this._log('debug', `Processing ${recordset.length} records for row map with idField: ${idField}`);
            
            recordset.forEach((row, index) => {
                const internalId = ++this._internalIdCounter;
                
                // Determine public ID based on idField configuration
                const adjustedIndex = index + indexOffset; // Use adjusted index for virtual pagination
                let publicId;
                if (idField && row.hasOwnProperty(idField)) {
                    publicId = row[idField];
                    this._log('debug', `Using field '${idField}' value '${publicId}' as public ID for row ${adjustedIndex}`);
                } else {
                    publicId = adjustedIndex; // Use adjusted index when no ID field
                    if (idField) {
                        this._log('warn', `ID field '${idField}' not found in row data, using adjusted index ${adjustedIndex} as public ID`);
                    } else {
                        this._log('debug', `Using adjusted index ${adjustedIndex} as public ID for row ${adjustedIndex}`);
                    }
                }
                
                // Try to restore existing element if preserving
                let element = null;
                if (preserveElements && existingElements.has(publicId)) {
                    element = existingElements.get(publicId);
                    this._log('debug', `Restored DOM element for public ID ${publicId}`);
                }
                
                this._rowMap.set(index, {
                    internalId: internalId,
                    publicId: publicId,
                    data: row,
                    element: element
                });
                
                this._log('debug', `Row ${index}: internalId=${internalId}, publicId=${publicId}, hasElement=${!!element}`, { row });
            });
            
            this._log('info', `Row map built successfully with ${this._rowMap.size} entries`);
        }

        /**
         * Renders the component in list mode using a <ul> structure.
         * @private
         */
        _renderListMode() {
            this._log('debug', 'Starting list mode rendering');
            
            // Create the main <ul> container
            const ulElement = document.createElement('ul');
            ulElement.className = 'jw-listbox__list';
            ulElement.setAttribute('role', 'listbox');
            ulElement.setAttribute('aria-multiselectable', 'true');
            this._log('debug', 'Created <ul> container with ARIA attributes');
            
            // Generate sections if enabled
            if (this._showSections) {
                const sections = this._generateSections();
                this._log('debug', `Rendering ${sections.length} sections in list mode`);
                
                let renderedCount = 0;
                sections.forEach(section => {
                    // Create section header
                    const sectionHeader = this._createSectionHeader(section.value, section.isCollapsed, 'list');
                    ulElement.appendChild(sectionHeader);
                    
                    // Create section rows
                    section.rows.forEach(({ row, index }) => {
                        const rowData = this._rowMap.get(index);
                        if (!rowData) {
                            this._log('warn', `Row index ${index} not found in row map, skipping`, { row });
                            return;
                        }
                        
                        const liElement = document.createElement('li');
                        liElement.className = `jw-listbox__row jw-listbox__section-content${section.isCollapsed ? ' jw-listbox__section-content--hidden' : ''}`;
                        liElement.setAttribute('data-internal-id', rowData.internalId);
                        liElement.setAttribute('data-public-id', rowData.publicId);
                        liElement.setAttribute('data-index', index);
                        liElement.setAttribute('role', 'option');
                        liElement.setAttribute('aria-selected', 'false');
                        
                        const content = this._renderRowContent(row);
                        liElement.innerHTML = content;
                        
                        // Update the row map with the DOM element reference
                        rowData.element = liElement;
                        
                        ulElement.appendChild(liElement);
                        renderedCount++;
                    });
                });
                
                this._log('info', `Rendered ${renderedCount} list items in ${sections.length} sections`);
            } else {
                // Normal rendering without sections
                const recordset = this.viewDm.toRecordset();
                this._log('debug', `Rendering ${recordset.length} records as list items`);
                
                let renderedCount = 0;
                recordset.forEach((row, index) => {
                    const rowData = this._rowMap.get(index);
                    if (!rowData) {
                        this._log('warn', `Row index ${index} not found in row map, skipping`, { row });
                        return; // Skip if not in row map
                    }
                    
                    // Create the <li> element
                    const liElement = document.createElement('li');
                    liElement.className = 'jw-listbox__row';
                    liElement.setAttribute('data-internal-id', rowData.internalId);
                    liElement.setAttribute('data-public-id', rowData.publicId);
                    liElement.setAttribute('data-index', index);
                    liElement.setAttribute('role', 'option');
                    liElement.setAttribute('aria-selected', 'false');
                    this._log('debug', `Created <li> for row ${index} with internal ID ${rowData.internalId}, public ID ${rowData.publicId}`);
                    
                    // For Sprint 2, render simple string representation
                    // In Sprint 3, this will use the templating engine
                    const content = this._renderRowContent(row);
                    liElement.innerHTML = content;
                    this._log('debug', `Row ${index} content: ${content}`);
                    
                    // Update the row map with the DOM element reference
                    rowData.element = liElement;
                    
                    ulElement.appendChild(liElement);
                    renderedCount++;
                });
                
                this._log('info', `Rendered ${renderedCount} list items`);
            }
            
            // Add paging controls if enabled
            if (this._pagingOptions) {
                this._addPagingControls(ulElement, 'list');
            }
            
            this._bodyEl.appendChild(ulElement);
            
            // Handle auto-selection and visual updates
            this._handlePostRenderUpdates();
            
            this._log('debug', 'List mode rendering complete');
        }

        /**
         * Renders the component in grid mode using a <table> structure.
         * @private
         */
        _renderGridMode() {
            this._log('debug', 'Starting grid mode rendering');
            
            const recordset = this.viewDm.toRecordset();
            this._log('debug', `Rendering ${recordset.length} records as table rows`);
            
            // Get field names from first record
            const fieldNames = recordset.length > 0 ? Object.keys(recordset[0]) : [];
            this._log('debug', `Detected fields: [${fieldNames.join(', ')}]`);
            
            // Create the grid container for sticky headers
            const gridContainer = document.createElement('div');
            gridContainer.className = 'jw-listbox__grid-container';
            gridContainer.setAttribute('role', 'grid');
            gridContainer.setAttribute('aria-multiselectable', 'true');
            this._log('debug', 'Created grid container with ARIA attributes');
            
            // Create the main table with sticky headers
            const tableElement = document.createElement('table');
            tableElement.className = 'jw-listbox__table';
            
            // Create table header if enabled
            if (this._options.showTableHeaders && fieldNames.length > 0) {
                const theadElement = document.createElement('thead');
                const headerRowElement = document.createElement('tr');
                headerRowElement.className = 'jw-listbox__header-row';
                
                fieldNames.forEach(fieldName => {
                    const thElement = document.createElement('th');
                    thElement.className = 'jw-listbox__header';
                    thElement.textContent = this._formatHeaderText(fieldName);
                    thElement.setAttribute('data-field', fieldName);
                    thElement.setAttribute('scope', 'col');
                    headerRowElement.appendChild(thElement);
                });
                
                theadElement.appendChild(headerRowElement);
                tableElement.appendChild(theadElement);
                this._log('debug', 'Created sticky table headers');
            }
            
            // Create table body
            const tbodyElement = document.createElement('tbody');
            tbodyElement.className = 'jw-listbox__tbody';
            
            // Generate sections if enabled
            if (this._showSections) {
                const sections = this._generateSections();
                this._log('debug', `Rendering ${sections.length} sections in grid mode`);
                
                let renderedCount = 0;
                sections.forEach(section => {
                    // Create section header
                    const sectionHeader = this._createSectionHeader(section.value, section.isCollapsed, 'grid');
                    tbodyElement.appendChild(sectionHeader);
                    
                    // Create section rows
                    section.rows.forEach(({ row, index }) => {
                        const rowData = this._rowMap.get(index);
                        if (!rowData) {
                            this._log('warn', `Row index ${index} not found in row map, skipping`, { row });
                            return;
                        }
                        
                        const trElement = document.createElement('tr');
                        trElement.className = `jw-listbox__row jw-listbox__section-content${section.isCollapsed ? ' jw-listbox__section-content--hidden' : ''}`;
                        trElement.setAttribute('data-internal-id', rowData.internalId);
                        trElement.setAttribute('data-public-id', rowData.publicId);
                        trElement.setAttribute('data-index', index);
                        trElement.setAttribute('role', 'row');
                        trElement.setAttribute('aria-selected', 'false');
                        
                        // Create cells for each field
                        fieldNames.forEach(fieldName => {
                            const tdElement = document.createElement('td');
                            tdElement.className = 'jw-listbox__cell';
                            tdElement.setAttribute('data-field', fieldName);
                            tdElement.setAttribute('role', 'gridcell');
                            
                            const cellValue = row[fieldName];
                            const displayValue = this._formatCellValue(fieldName, cellValue);
                            tdElement.innerHTML = displayValue;
                            
                            // Apply conditional formatting to cell (Sprint 8)
                            this._applyConditionalFormats(tdElement, row, fieldName);
                            
                            // Apply manual tags to cell (Sprint 8)
                            this._applyManualTags(tdElement, rowData.internalId, fieldName);
                            
                            trElement.appendChild(tdElement);
                        });
                        
                        // Apply conditional formatting to row (Sprint 8)
                        this._applyConditionalFormats(trElement, row);
                        
                        // Apply manual tags to row (Sprint 8)
                        this._applyManualTags(trElement, rowData.internalId);
                        
                        // Update the row map with the DOM element reference
                        rowData.element = trElement;
                        
                        tbodyElement.appendChild(trElement);
                        renderedCount++;
                    });
                });
                
                this._log('info', `Rendered ${renderedCount} table rows in ${sections.length} sections`);
            } else {
                // Normal rendering without sections
                let renderedCount = 0;
                recordset.forEach((row, index) => {
                    const rowData = this._rowMap.get(index);
                    if (!rowData) {
                        this._log('warn', `Row index ${index} not found in row map, skipping`, { row });
                        return; // Skip if not in row map
                    }
                    
                    // Create the <tr> element
                    const trElement = document.createElement('tr');
                    trElement.className = 'jw-listbox__row';
                    trElement.setAttribute('data-internal-id', rowData.internalId);
                    trElement.setAttribute('data-public-id', rowData.publicId);
                    trElement.setAttribute('data-index', index);
                    trElement.setAttribute('role', 'row');
                    trElement.setAttribute('aria-selected', 'false');
                    this._log('debug', `Created <tr> for row ${index} with internal ID ${rowData.internalId}, public ID ${rowData.publicId}`);
                    
                    // Create cells for each field
                    fieldNames.forEach(fieldName => {
                        const tdElement = document.createElement('td');
                        tdElement.className = 'jw-listbox__cell';
                        tdElement.setAttribute('data-field', fieldName);
                        tdElement.setAttribute('role', 'gridcell');
                        
                        const cellValue = row[fieldName];
                        const displayValue = this._formatCellValue(fieldName, cellValue);
                        tdElement.innerHTML = displayValue;
                        
                        // Apply conditional formatting to cell (Sprint 8)
                        this._applyConditionalFormats(tdElement, row, fieldName);
                        
                        // Apply manual tags to cell (Sprint 8)
                        this._applyManualTags(tdElement, rowData.internalId, fieldName);
                        
                        trElement.appendChild(tdElement);
                    });
                    
                    // Apply conditional formatting to row (Sprint 8)
                    this._applyConditionalFormats(trElement, row);
                    
                    // Apply manual tags to row (Sprint 8)
                    this._applyManualTags(trElement, rowData.internalId);
                    
                    // Update the row map with the DOM element reference
                    rowData.element = trElement;
                    
                    tbodyElement.appendChild(trElement);
                    renderedCount++;
                });
                
                this._log('info', `Rendered ${renderedCount} table rows`);
            }
            
            // Add paging controls if enabled
            if (this._pagingOptions) {
                this._addPagingControls(tbodyElement, 'grid');
            }
            
            tableElement.appendChild(tbodyElement);
            gridContainer.appendChild(tableElement);
            
            this._bodyEl.appendChild(gridContainer);
            
            // Apply column widths if specified
            this._applyColumnWidths();
            
            // Handle auto-selection and visual updates
            this._handlePostRenderUpdates();
            
            this._log('debug', 'Grid mode rendering complete');
        }

        /**
         * Adds paging controls to the specified container element.
         * @private
         * @param {HTMLElement} container - The container element (ul or table)
         * @param {string} mode - The display mode ('list' or 'grid')
         */
        _addPagingControls(container, mode) {
            this._log('debug', 'Adding paging controls', { mode });
            
            // Check if we need to show Load Previous control
            const showLoadPrevious = this._windowStart > 0;
            
            // Check if we need to show Load More control
            const showLoadMore = this._hasMorePages();
            
            this._log('debug', 'Paging control visibility', { 
                showLoadPrevious, 
                showLoadMore, 
                currentPage: this._currentPage,
                totalRecords: this._totalRecords,
                pageSize: this._pagingOptions.pageSize
            });
            
            // Add Load Previous control at the beginning if needed
            if (showLoadPrevious) {
                const loadPreviousElement = this._createPagingControl('previous', mode);
                container.insertBefore(loadPreviousElement, container.firstChild);
            }
            
            // Add Load More control at the end if needed
            if (showLoadMore) {
                const loadMoreElement = this._createPagingControl('more', mode);
                container.appendChild(loadMoreElement);
            }
        }

        /**
         * Creates a paging control element.
         * @private
         * @param {string} type - The control type ('previous' or 'more')
         * @param {string} mode - The display mode ('list' or 'grid')
         * @returns {HTMLElement} The paging control element
         */
        _createPagingControl(type, mode) {
            const isPrevious = type === 'previous';
            const template = isPrevious ? this._pagingOptions.loadPreviousTemplate : this._pagingOptions.loadMoreTemplate;
            
            // Create arrow text for virtual pagination
            const arrowText = isPrevious ? '▲ Load Previous ▲' : '▼ Load More ▼';
            
            let element;
            if (mode === 'list') {
                element = document.createElement('li');
                element.className = `jw-listbox__paging-control jw-listbox__paging-control--${type}`;
                element.setAttribute('data-action', type);
                element.style.textAlign = 'center';
                element.style.cursor = 'pointer';
            } else {
                element = document.createElement('tr');
                element.className = `jw-listbox__paging-control jw-listbox__paging-control--${type}`;
                element.setAttribute('data-action', type);
                element.style.cursor = 'pointer';
                
                // Create a single cell that spans all columns
                const cell = document.createElement('td');
                cell.className = 'jw-listbox__paging-cell';
                cell.style.textAlign = 'center';
                
                // Get column count from the table headers or data
                const recordset = this.viewDm.toRecordset();
                const columnCount = recordset.length > 0 ? Object.keys(recordset[0]).length : 1;
                cell.setAttribute('colspan', columnCount);
                
                element.appendChild(cell);
            }
            
            // Use template if provided, otherwise use arrow text
            let content;
            if (template) {
                // Templates will be implemented in later sprints
                content = template;
            } else {
                content = this._escapeHtml(arrowText);
            }
            
            // Set the content
            const targetElement = mode === 'list' ? element : element.querySelector('.jw-listbox__paging-cell');
            targetElement.innerHTML = content;
            
            return element;
        }

        /**
         * Checks if there are more pages available.
         * @private
         * @returns {boolean} True if there are more pages
         */
        _hasMorePages() {
            if (!this._pagingOptions) return false;
            
            const totalRecords = this._totalRecords;
            const pageSize = this._pagingOptions.pageSize;
            const windowStart = this._windowStart;
            
            // Check if there are more records beyond the current window
            return windowStart + pageSize < totalRecords;
        }

        /**
         * Loads more data by moving the virtual window forward.
         * @private
         */
        async _loadMoreData() {
            if (!this._hasMorePages()) {
                this._log('debug', 'No more pages available');
                return;
            }
            
            const halfPageSize = Math.floor(this._pagingOptions.pageSize / 2);
            
            // Move the window forward by half-page (same for both modes)
            this._windowStart += halfPageSize;
            
            this._log('debug', 'Loading more data', {
                oldWindowStart: this._windowStart - halfPageSize,
                newWindowStart: this._windowStart,
                pageSize: this._pagingOptions.pageSize,
                halfPageSize: halfPageSize
            });
            
            // Check if we're in server-side paging mode
            if (this._pagingOptions.dataProvider) {
                // Emit 'more' event before server-side data loading
                this._emit('more', {
                    page: Math.floor(this._windowStart / this._pagingOptions.pageSize),
                    pageSize: this._pagingOptions.pageSize,
                    windowStart: this._windowStart,
                    windowEnd: this._windowStart + this._pagingOptions.pageSize,
                    totalRecords: this._totalRecords
                });
                
                // Server-side paging - load data for current window
                await this._loadServerSideWindow();
            } else {
                // Client-side paging - re-render with the new window position
                this._requestRender();
            }
        }

        /**
         * Loads previous data by moving the virtual window backward.
         * @private
         */
        async _loadPreviousData() {
            if (this._windowStart <= 0) {
                this._log('debug', 'No previous pages available');
                return;
            }
            
            const halfPageSize = Math.floor(this._pagingOptions.pageSize / 2);
            
            // Move the window backward by half-page (same for both modes)
            this._windowStart = Math.max(0, this._windowStart - halfPageSize);
            
            this._log('debug', 'Loading previous data', {
                oldWindowStart: this._windowStart + halfPageSize,
                newWindowStart: this._windowStart,
                pageSize: this._pagingOptions.pageSize,
                halfPageSize: halfPageSize
            });
            
            // Check if we're in server-side paging mode
            if (this._pagingOptions.dataProvider) {
                // Emit 'previous' event before server-side data loading
                this._emit('previous', {
                    page: Math.floor(this._windowStart / this._pagingOptions.pageSize),
                    pageSize: this._pagingOptions.pageSize,
                    windowStart: this._windowStart,
                    windowEnd: this._windowStart + this._pagingOptions.pageSize,
                    totalRecords: this._totalRecords
                });
                
                // Server-side paging - load data for current window
                await this._loadServerSideWindow();
            } else {
                // Client-side paging - re-render with the new window position
                this._requestRender();
            }
        }

        /**
         * Loads data from the server-side dataProvider for the current window.
         * @private
         */
        async _loadServerSideWindow() {
            if (!this._pagingOptions || !this._pagingOptions.dataProvider) {
                this._log('warn', 'Cannot load server-side window - no dataProvider configured');
                return;
            }
            
            const windowStart = this._windowStart;
            const windowEnd = windowStart + this._pagingOptions.pageSize;
            
            this._log('info', `Loading server-side window: ${windowStart}-${windowEnd}`);
            
            try {
                // Prepare context for dataProvider (using window position)
                const context = {
                    page: Math.floor(windowStart / this._pagingOptions.pageSize),
                    pageSize: this._pagingOptions.pageSize,
                    windowStart: windowStart,
                    windowEnd: windowEnd,
                    sort: this._getSortContext(),
                    filter: this._getFilterContext()
                };
                
                this._log('debug', 'Calling dataProvider with context', context);
                
                // Call the dataProvider function
                const result = await this._pagingOptions.dataProvider(context);
                
                // Validate result
                if (!result || typeof result !== 'object') {
                    throw new Error('dataProvider must return an object');
                }
                
                if (!Array.isArray(result.data)) {
                    throw new Error('dataProvider result must contain a data array');
                }
                
                if (typeof result.totalRecords !== 'number' || result.totalRecords < 0) {
                    throw new Error('dataProvider result must contain a valid totalRecords number');
                }
                
                // Update internal state
                this._totalRecords = result.totalRecords;
                this._currentPage = Math.floor(windowStart / this._pagingOptions.pageSize);
                
                this._log('info', `Server-side window ${windowStart}-${windowEnd} loaded successfully`, {
                    recordsLoaded: result.data.length,
                    totalRecords: result.totalRecords
                });
                
                // Update data masters with new data
                this.dm = DataMaster.fromRecordset(result.data);
                this.viewDm = this.dm;
                
                // Rebuild row map for new data
                this._buildRowMap();
                
                // Trigger re-render
                this._requestRender();
                
            } catch (error) {
                this._log('error', `Failed to load server-side window ${windowStart}-${windowEnd}`, error);
                this._handleError({
                    code: 'SERVER_SIDE_LOAD_FAILED',
                    message: `Failed to load window ${windowStart}-${windowEnd}: ${error.message}`,
                    method: '_loadServerSideWindow'
                });
            }
        }

        /**
         * Gets the current sort context for server-side requests.
         * @private
         * @returns {object} Sort context object
         */
        _getSortContext() {
            return this._sortParams || {};
        }

        /**
         * Gets the current filter context for server-side requests.
         * @private
         * @returns {object} Filter context object
         */
        _getFilterContext() {
            return this._filterParams || {};
        }

        /**
         * Renders the content for a single row using the templating engine.
         * @private
         * @param {object} row - The data row object
         * @returns {string} HTML content for the row
         */
        _renderRowContent(row) {
            this._log('debug', 'Rendering row content', { row });
            
            try {
                // If no template is set, use default rendering
                if (!this._options.template) {
                    this._log('debug', 'Using default rendering (no template set)');
                    const fields = Object.keys(row);
                    const values = fields.map(field => `${field}: ${this._escapeHtml(String(row[field]))}`).join(', ');
                    return `<span class="jw-listbox__row-content">${values}</span>`;
                }
                
                // Get the template HTML
                const templateHtml = this._getTemplate();
                if (!templateHtml) {
                    this._log('warn', 'Template could not be retrieved, falling back to default');
                    const fields = Object.keys(row);
                    const values = fields.map(field => `${field}: ${this._escapeHtml(String(row[field]))}`).join(', ');
                    return `<span class="jw-listbox__row-content">${values}</span>`;
                }
                
                // Parse the template with row data
                const parsedContent = this._parseTemplate(templateHtml, row);
                this._log('debug', 'Template parsed successfully', { templateLength: templateHtml.length, resultLength: parsedContent.length });
                
                return parsedContent;
                
            } catch (error) {
                this._log('error', 'Template rendering failed, using fallback', { error: error.message });
                // Fallback to simple rendering
                const fields = Object.keys(row);
                const values = fields.map(field => `${field}: ${this._escapeHtml(String(row[field]))}`).join(', ');
                return `<span class="jw-listbox__row-content">${values}</span>`;
            }
        }

        /**
         * Escapes HTML to prevent XSS attacks.
         * @private
         * @param {string} text - The text to escape
         * @returns {string} HTML-escaped text
         */
        _escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        /**
         * Retrieves the template HTML from various sources.
         * @private
         * @returns {string|null} The template HTML string or null if not found
         */
        _getTemplate() {
            // Check for print mode and use printTemplate if available
            const templateToUse = this._options.printMode && this._options.printTemplate 
                ? this._options.printTemplate 
                : this._options.template;
                
            this._log('debug', 'Getting template', { 
                template: templateToUse, 
                printMode: this._options.printMode,
                usingPrintTemplate: this._options.printMode && this._options.printTemplate
            });
            
            if (!templateToUse) {
                this._log('debug', 'No template configured');
                return null;
            }
            
            try {
                // If template is already a string, return it directly
                if (typeof templateToUse === 'string') {
                    // Check if it might be a CSS selector
                    // CSS selectors are typically short and start with # (ID) or . (class)
                    // or are simple element selectors without HTML-like content
                    const template = templateToUse.trim();
                    const isLikelySelector = (
                        (template.startsWith('#') || template.startsWith('.')) &&
                        !template.includes('<') && 
                        !template.includes('>') &&
                        template.length < 100 // Reasonable selector length limit
                    );
                    
                    if (isLikelySelector) {
                        this._log('debug', 'Template appears to be a CSS selector, attempting to find element');
                        const element = document.querySelector(templateToUse);
                        
                        if (!element) {
                            this._log('warn', 'Template selector did not match any element', { selector: templateToUse });
                            return null;
                        }
                        
                        // Handle <template> elements
                        if (element.tagName.toLowerCase() === 'template') {
                            this._log('debug', 'Found <template> element');
                            return element.innerHTML;
                        }
                        
                        // Handle regular elements (like hidden <div>)
                        this._log('debug', 'Found regular element, using innerHTML');
                        return element.innerHTML;
                    } else {
                        // Assume it's raw HTML
                        this._log('debug', 'Treating template as raw HTML string');
                        return templateToUse;
                    }
                }
                
                // If template is an HTMLElement
                if (templateToUse instanceof HTMLElement) {
                    this._log('debug', 'Template is HTMLElement, using innerHTML');
                    return templateToUse.innerHTML;
                }
                
                this._log('warn', 'Template type not supported', { templateType: typeof templateToUse });
                return null;
                
            } catch (error) {
                this._log('error', 'Error getting template', { error: error.message });
                this._handleError({
                    code: 'TEMPLATE_RETRIEVAL_ERROR',
                    message: `Failed to retrieve template: ${error.message}`,
                    method: '_getTemplate'
                });
                return null;
            }
        }

        /**
         * Handles row selection logic for click events.
         * @private
         * @param {object} payload - The row event payload
         * @param {Event} event - The original click event
         */
        _handleRowSelection(payload, event) {
            if (!payload) return;
            
            const publicId = payload.id;
            const isSelected = this._selection.has(publicId);
            const selectionMode = this._options.selectionMode;
            
            if (event.shiftKey && this._focusedIndex >= 0) {
                // Shift+click: range selection (works in both modes)
                this._handleRangeSelection(payload.index);
            } else if (selectionMode === 'toggle') {
                // Toggle mode: every click toggles selection (like Ctrl+click)
                if (isSelected) {
                    this._selection.delete(publicId);
                } else {
                    this._selection.add(publicId);
                }
            } else if (selectionMode === 'replace') {
                if (event.ctrlKey || event.metaKey) {
                    // Replace mode with Ctrl/Cmd: toggle selection
                    if (isSelected) {
                        this._selection.delete(publicId);
                    } else {
                        this._selection.add(publicId);
                    }
                } else {
                    // Replace mode: replace selection with clicked item
                    this._selection.clear();
                    this._selection.add(publicId);
                }
            }
            
            // Update focus
            this._focusedIndex = payload.index;
            
            this._updateVisualSelection();
            this._emitSelectionEvent();
        }

        /**
         * Handles range selection for shift+click.
         * @private
         * @param {number} endIndex - The end index of the range
         */
        _handleRangeSelection(endIndex) {
            const startIndex = this._focusedIndex;
            const minIndex = Math.min(startIndex, endIndex);
            const maxIndex = Math.max(startIndex, endIndex);
            
            // Clear current selection
            this._selection.clear();
            
            // Select range
            for (let i = minIndex; i <= maxIndex; i++) {
                const rowData = this._rowMap.get(i);
                if (rowData) {
                    this._selection.add(rowData.publicId);
                }
            }
        }

        /**
         * Handles keyboard navigation.
         * @private
         * @param {KeyboardEvent} event - The keyboard event
         */
        _handleKeyboardNavigation(event) {
            if (!this.viewDm || this.viewDm.toRecordset().length === 0) {
                return;
            }
            
            const recordCount = this.viewDm.toRecordset().length;
            let newIndex = this._focusedIndex;
            
            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    newIndex = Math.min(this._focusedIndex + 1, recordCount - 1);
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    newIndex = Math.max(this._focusedIndex - 1, 0);
                    break;
                case 'Home':
                    event.preventDefault();
                    newIndex = 0;
                    break;
                case 'End':
                    event.preventDefault();
                    newIndex = recordCount - 1;
                    break;
                case 'Enter':
                case ' ':
                    event.preventDefault();
                    if (this._focusedIndex >= 0) {
                        this._handleKeyboardSelection(event);
                    }
                    return;
                default:
                    return; // Don't handle other keys
            }
            
            // Update focus if index changed
            if (newIndex !== this._focusedIndex) {
                this._focusedIndex = newIndex;
                this._updateFocusVisual();
                
                // Auto-select with keyboard if clickToSelect is enabled
                // Only in 'replace' mode without modifiers to avoid unexpected behavior
                if (this._options.clickToSelect && 
                    this._options.selectionMode === 'replace' && 
                    !event.shiftKey && !event.ctrlKey && !event.metaKey) {
                    const rowData = this._rowMap.get(this._focusedIndex);
                    if (rowData) {
                        this._selection.clear();
                        this._selection.add(rowData.publicId);
                        this._updateVisualSelection();
                        this._emitSelectionEvent();
                    }
                }
            }
        }

        /**
         * Handles selection via keyboard (Enter/Space).
         * @private
         * @param {KeyboardEvent} event - The keyboard event
         */
        _handleKeyboardSelection(event) {
            const rowData = this._rowMap.get(this._focusedIndex);
            if (!rowData) return;
            
            const publicId = rowData.publicId;
            const isSelected = this._selection.has(publicId);
            const selectionMode = this._options.selectionMode;
            
            if (selectionMode === 'toggle') {
                // Toggle mode: Enter/Space toggles selection
                if (isSelected) {
                    this._selection.delete(publicId);
                } else {
                    this._selection.add(publicId);
                }
            } else if (selectionMode === 'replace') {
                if (event.ctrlKey || event.metaKey) {
                    // Replace mode with Ctrl/Cmd: toggle selection
                    if (isSelected) {
                        this._selection.delete(publicId);
                    } else {
                        this._selection.add(publicId);
                    }
                } else {
                    // Replace mode: replace selection
                    this._selection.clear();
                    this._selection.add(publicId);
                }
            }
            
            this._updateVisualSelection();
            this._emitSelectionEvent();
        }

        /**
         * Updates the visual selection state of all rows.
         * @private
         */
        _updateVisualSelection() {
            this._rowMap.forEach((rowData, index) => {
                if (rowData.element) {
                    const isSelected = this._selection.has(rowData.publicId);
                    rowData.element.classList.toggle('jw-listbox__row--selected', isSelected);
                    rowData.element.setAttribute('aria-selected', isSelected ? 'true' : 'false');
                }
            });
        }

        /**
         * Updates the visual focus state.
         * @private
         */
        _updateFocusVisual() {
            // Remove existing focus
            this._rowMap.forEach((rowData) => {
                if (rowData.element) {
                    rowData.element.classList.remove('jw-listbox__row--focused');
                    rowData.element.removeAttribute('tabindex');
                }
            });
            
            // Add focus to current row
            if (this._focusedIndex >= 0) {
                const focusedRowData = this._rowMap.get(this._focusedIndex);
                if (focusedRowData && focusedRowData.element) {
                    focusedRowData.element.classList.add('jw-listbox__row--focused');
                    focusedRowData.element.setAttribute('tabindex', '0');
                    focusedRowData.element.focus();
                }
            }
        }

        /**
         * Checks if a public ID exists in the current data.
         * @private
         * @param {*} publicId - The public ID to check
         * @returns {boolean} True if the ID exists
         */
        _isValidPublicId(publicId) {
            for (const [index, rowData] of this._rowMap) {
                if (rowData.publicId === publicId) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Emits a selection event with the current selection state.
         * @private
         */
        _emitSelectionEvent() {
            const selectedIds = Array.from(this._selection);
            const selectedData = [];
            
            // Gather data for selected rows
            this._rowMap.forEach((rowData) => {
                if (this._selection.has(rowData.publicId)) {
                    selectedData.push(rowData.data);
                }
            });
            
            const payload = {
                selectedIds: selectedIds,
                selectedData: selectedData,
                selectionCount: this._selection.size
            };
            
            this._emit('select', payload);
        }

        /**
         * Updates ARIA attributes based on current configuration.
         * @private
         */
        _updateAriaAttributes() {
            if (this._bodyEl) {
                // Update for list mode
                const listContainer = this._bodyEl.querySelector('.jw-listbox__list');
                if (listContainer) {
                    listContainer.setAttribute('role', 'listbox');
                    listContainer.setAttribute('aria-multiselectable', 'true');
                }
                
                // Update for grid mode
                const gridContainer = this._bodyEl.querySelector('.jw-listbox__table');
                if (gridContainer) {
                    gridContainer.setAttribute('role', 'grid');
                    gridContainer.setAttribute('aria-multiselectable', 'true');
                }
            }
        }

        /**
         * Handles post-render updates like auto-selection and visual state.
         * @private
         */
        _handlePostRenderUpdates() {
            // Update visual selection state for existing selections
            this._updateVisualSelection();
            
            // Handle auto-select first row
            if (this._options.autoSelectFirst && this._selection.size === 0 && this._rowMap.size > 0) {
                const firstRowData = this._rowMap.get(0);
                if (firstRowData) {
                    this._selection.add(firstRowData.publicId);
                    this._focusedIndex = 0;
                    this._updateVisualSelection();
                    this._emitSelectionEvent();
                }
            }
            
            // Set initial focus if no row is focused
            if (this._focusedIndex < 0 && this._rowMap.size > 0) {
                this._focusedIndex = 0;
            }
            
            // Update focus visual
            this._updateFocusVisual();
        }

        /**
         * Creates a rich event payload for row-level events.
         * @private
         * @param {HTMLElement} rowElement - The row DOM element
         * @param {Event} originalEvent - The original browser event
         * @returns {object} Rich event payload
         */
        _createRowEventPayload(rowElement, originalEvent) {
            if (!rowElement) {
                this._log('warn', 'Cannot create row event payload - no row element provided');
                return null;
            }
            
            const internalId = parseInt(rowElement.getAttribute('data-internal-id'));
            const publicId = rowElement.getAttribute('data-public-id');
            const index = parseInt(rowElement.getAttribute('data-index'));
            
            // Convert publicId back to its original type if it was numeric
            let typedPublicId = publicId;
            if (!isNaN(publicId) && publicId !== '') {
                typedPublicId = parseInt(publicId);
            }
            
            const rowData = this._getRowDataFromMap(internalId, index);
            
            return {
                id: typedPublicId,
                internalId: internalId,
                index: index,
                rowData: rowData ? rowData.data : null,
                rowElement: rowElement,
                originalEvent: originalEvent
            };
        }

        /**
         * Creates a rich event payload for cell-level events.
         * @private
         * @param {HTMLElement} cellElement - The cell DOM element
         * @param {HTMLElement} rowElement - The row DOM element
         * @param {Event} originalEvent - The original browser event
         * @returns {object} Rich event payload
         */
        _createCellEventPayload(cellElement, rowElement, originalEvent) {
            const rowPayload = this._createRowEventPayload(rowElement, originalEvent);
            if (!rowPayload) {
                return null;
            }
            
            // Enhanced field detection for grid mode
            const field = cellElement.getAttribute('data-field') || 'content';
            const value = cellElement.textContent;
            
            return {
                ...rowPayload,
                field: field,
                value: value,
                cellElement: cellElement
            };
        }

        /**
         * Handles paging control click events.
         * @private
         * @param {HTMLElement} buttonElement - The clicked paging button element
         * @param {Event} event - The original click event
         */
        async _handlePagingControlClick(buttonElement, event) {
            const action = buttonElement.getAttribute('data-action');
            
            this._log('debug', `Paging control clicked: ${action}`, { action, windowStart: this._windowStart });
            
            // Prevent default behavior
            event.preventDefault();
            
            // Show loading state
            const originalContent = buttonElement.innerHTML;
            const loadingText = this._pagingOptions.loadingText || 'Loading...';
            const loadingTemplate = this._pagingOptions.loadingTemplate;
            
            if (loadingTemplate) {
                buttonElement.innerHTML = loadingTemplate;
            } else {
                buttonElement.innerHTML = `<span class="jw-listbox__loading">${loadingText}</span>`;
            }
            
            // Disable the button during loading
            buttonElement.disabled = true;
            
            try {
                // Handle the action based on paging mode
                if (!this._pagingOptions.dataProvider) {
                    this._log('info', `Handling client-side virtual paging action: ${action}`);
                    
                    if (action === 'previous') {
                        await this._loadPreviousData();
                    } else if (action === 'more') {
                        await this._loadMoreData();
                    }
                } else {
                    this._log('info', `Handling server-side paging action: ${action}`);
                    
                    if (action === 'previous') {
                        await this._loadPreviousData();
                    } else if (action === 'more') {
                        await this._loadMoreData();
                    }
                }
            } catch (error) {
                this._log('error', `Error handling paging action: ${action}`, error);
                
                // Restore original button content on error
                buttonElement.innerHTML = originalContent;
                buttonElement.disabled = false;
                
                // Re-throw to be handled by calling code
                throw error;
            }
        }

        /**
         * Handles header click events in grid mode.
         * @private
         * @param {HTMLElement} headerElement - The clicked header element
         * @param {Event} event - The original click event
         */
        _handleHeaderClick(headerElement, event) {
            const field = headerElement.getAttribute('data-field');
            const headerText = headerElement.textContent;
            
            this._log('debug', `Header clicked: ${field}`, { field, headerText });
            
            const payload = {
                field: field,
                headerText: headerText,
                headerElement: headerElement,
                originalEvent: event
            };
            
            this._emit('headerClick', payload);
        }

        /**
         * Handles clicks on section headers for collapsing/expanding sections.
         * @private
         * @param {HTMLElement} sectionHeaderElement - The clicked section header element
         * @param {Event} event - The click event
         */
        _handleSectionHeaderClick(sectionHeaderElement, event) {
            const sectionValue = sectionHeaderElement.getAttribute('data-section-value');
            const isCurrentlyCollapsed = sectionHeaderElement.classList.contains('jw-listbox__section-header--collapsed');
            
            this._log('debug', `Section header clicked: ${sectionValue}`, { 
                sectionValue, 
                isCurrentlyCollapsed,
                autoSectionHide: this._options.autoSectionHide 
            });
            
            // Emit click-section event
            const payload = {
                sectionValue: sectionValue,
                isCollapsed: isCurrentlyCollapsed,
                sectionHeaderElement: sectionHeaderElement,
                originalEvent: event
            };
            this._emit('click-section', payload);
            
            // Handle auto-collapse/expand if enabled
            if (this._options.autoSectionHide) {
                const newState = !isCurrentlyCollapsed;
                this.displaySection(sectionValue, !newState); // displaySection expects show=true for expanded
                this._log('debug', `Auto-toggled section ${sectionValue} to ${newState ? 'collapsed' : 'expanded'}`);
            }
        }

        /**
         * Formats header text for display (converts camelCase to Title Case).
         * @private
         * @param {string} fieldName - The field name to format
         * @returns {string} Formatted header text
         */
        _formatHeaderText(fieldName) {
            // Convert camelCase to Title Case
            return fieldName
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();
        }

        /**
         * Generates section data for the current view.
         * @private
         * @returns {Array} Array of section objects with { value, rows, isCollapsed }
         */
        _generateSections() {
            if (!this._showSections || !this._currentSortField) {
                return [];
            }
            
            const recordset = this.viewDm.toRecordset();
            const sections = [];
            let currentSection = null;
            
            recordset.forEach((row, index) => {
                const sectionValue = row[this._currentSortField];
                
                if (!currentSection || currentSection.value !== sectionValue) {
                    // Start new section
                    const isCollapsed = this._sectionStates.get(sectionValue) === 'collapsed';
                    currentSection = {
                        value: sectionValue,
                        rows: [],
                        isCollapsed: isCollapsed
                    };
                    sections.push(currentSection);
                }
                
                currentSection.rows.push({ row, index });
            });
            
            return sections;
        }

        /**
         * Creates a section header element.
         * @private
         * @param {*} sectionValue - The value for this section
         * @param {boolean} isCollapsed - Whether the section is collapsed
         * @param {string} mode - 'list' or 'grid'
         * @returns {HTMLElement} The section header element
         */
        _createSectionHeader(sectionValue, isCollapsed, mode) {
            const headerElement = mode === 'list' 
                ? document.createElement('li')
                : document.createElement('tr');
                
            headerElement.className = `jw-listbox__section-header jw-listbox__section-header--${isCollapsed ? 'collapsed' : 'expanded'}`;
            headerElement.setAttribute('data-section-value', String(sectionValue));
            headerElement.setAttribute('role', 'separator');
            
            const toggleElement = document.createElement('span');
            toggleElement.className = 'jw-listbox__section-toggle';
            
            const textElement = document.createElement('span');
            textElement.textContent = `${this._currentSortField}: ${sectionValue}`;
            
            if (mode === 'list') {
                headerElement.appendChild(toggleElement);
                headerElement.appendChild(textElement);
            } else {
                // For grid mode, create a cell that spans all columns
                const fieldNames = this.viewDm.toRecordset().length > 0 ? Object.keys(this.viewDm.toRecordset()[0]) : [];
                const cellElement = document.createElement('td');
                cellElement.colSpan = fieldNames.length;
                cellElement.appendChild(toggleElement);
                cellElement.appendChild(textElement);
                headerElement.appendChild(cellElement);
            }
            
            return headerElement;
        }

        /**
         * Updates the visibility of a section's content.
         * @private
         * @param {*} sectionValue - The section value to update
         * @param {boolean} show - Whether to show or hide the section
         */
        _updateSectionVisibility(sectionValue, show) {
            const sectionHeader = this._bodyEl.querySelector(`[data-section-value="${sectionValue}"]`);
            if (!sectionHeader) {
                return;
            }
            
            // Update header appearance
            sectionHeader.className = sectionHeader.className.replace(
                /jw-listbox__section-header--(collapsed|expanded)/,
                `jw-listbox__section-header--${show ? 'expanded' : 'collapsed'}`
            );
            
            // Find and update content elements
            let currentElement = sectionHeader.nextElementSibling;
            while (currentElement && !currentElement.classList.contains('jw-listbox__section-header')) {
                if (show) {
                    currentElement.classList.remove('jw-listbox__section-content--hidden');
                } else {
                    currentElement.classList.add('jw-listbox__section-content--hidden');
                }
                currentElement = currentElement.nextElementSibling;
            }
        }

        /**
         * Applies column widths to the table in grid mode.
         * @private
         */
        _applyColumnWidths() {
            if (this._options.displayMode !== 'grid' || !this._options.columnWidths) {
                return;
            }
            
            this._log('debug', 'Applying column widths', { columnWidths: this._options.columnWidths });
            
            // Apply widths to the single table structure (sticky headers)
            const table = this._bodyEl.querySelector('.jw-listbox__grid-container .jw-listbox__table');
            if (table) {
                // Apply widths to header cells
                const headerCells = table.querySelectorAll('.jw-listbox__header');
                headerCells.forEach(header => {
                    const field = header.getAttribute('data-field');
                    if (field && this._options.columnWidths[field]) {
                        header.style.width = this._options.columnWidths[field];
                        this._log('debug', `Set width for header ${field}: ${this._options.columnWidths[field]}`);
                    }
                });
                
                // Apply widths to all cells in the first row to set column widths
                const firstRow = table.querySelector('.jw-listbox__row');
                if (firstRow) {
                    const cells = firstRow.querySelectorAll('.jw-listbox__cell');
                    cells.forEach(cell => {
                        const field = cell.getAttribute('data-field');
                        if (field && this._options.columnWidths[field]) {
                            cell.style.width = this._options.columnWidths[field];
                        }
                    });
                }
            }
        }

        /**
         * Parses a template string with row data, handling {{field}} and {{{field}}} syntax.
         * @private
         * @param {string} template - The template HTML string
         * @param {object} row - The data row object
         * @returns {string} The parsed template with data substituted
         */
        _parseTemplate(template, row) {
            this._log('debug', 'Parsing template', { templateLength: template.length, rowFields: Object.keys(row) });
            
            try {
                let result = template;
                
                // Process {{{field}}} (raw HTML) first to avoid interference with {{field}}
                const rawPattern = /\{\{\{(\w+)\}\}\}/g;
                result = result.replace(rawPattern, (match, fieldName) => {
                    this._log('debug', `Processing raw HTML field: ${fieldName}`);
                    
                    if (row.hasOwnProperty(fieldName)) {
                        const value = row[fieldName];
                        this._log('debug', `Raw field ${fieldName} found`, { value });
                        return String(value); // No escaping for raw HTML
                    } else {
                        this._log('warn', `Raw field ${fieldName} not found in row data`);
                        return match; // Return original if field not found
                    }
                });
                
                // Process {{field}} (escaped HTML)
                const escapedPattern = /\{\{(\w+)\}\}/g;
                result = result.replace(escapedPattern, (match, fieldName) => {
                    this._log('debug', `Processing escaped field: ${fieldName}`);
                    
                    if (row.hasOwnProperty(fieldName)) {
                        const value = row[fieldName];
                        this._log('debug', `Escaped field ${fieldName} found`, { value });
                        return this._escapeHtml(String(value)); // Escape for security
                    } else {
                        this._log('warn', `Escaped field ${fieldName} not found in row data`);
                        return match; // Return original if field not found
                    }
                });
                
                this._log('debug', 'Template parsing completed', { originalLength: template.length, resultLength: result.length });
                return result;
                
            } catch (error) {
                this._log('error', 'Template parsing failed', { error: error.message });
                this._handleError({
                    code: 'TEMPLATE_PARSING_ERROR',
                    message: `Failed to parse template: ${error.message}`,
                    method: '_parseTemplate'
                });
                throw error; // Re-throw to trigger fallback rendering
            }
        }

        /**
         * Smart update for a single cell in the current view.
         * @private
         * @param {number} viewRowIndex - Index of the row in the view data
         * @param {string} fieldName - Name of the field to update
         * @param {*} newValue - New value for the cell
         */
        _smartUpdateCell(viewRowIndex, fieldName, newValue) {
            this._log('debug', 'Smart updating cell', { viewRowIndex, fieldName, newValue });
            
            const rowData = this._rowMap.get(viewRowIndex);
            if (!rowData || !rowData.element) {
                this._log('debug', 'Row element not found, rebuilding row map with preserved elements');
                this._buildRowMap(true); // Preserve existing DOM elements
                
                // Try again after rebuilding
                const rebuiltRowData = this._rowMap.get(viewRowIndex);
                if (!rebuiltRowData || !rebuiltRowData.element) {
                    this._log('debug', 'Smart update failed after rebuild, falling back to full render');
                    this._requestRender();
                    return;
                }
                // Use the rebuilt row data
                this._performSmartCellUpdate(rebuiltRowData, fieldName, newValue);
                return;
            }
            
            this._performSmartCellUpdate(rowData, fieldName, newValue);
        }

        /**
         * Performs the actual smart cell update operation.
         * @private
         * @param {object} rowData - Row data from the row map
         * @param {string} fieldName - Name of the field to update
         * @param {*} newValue - New value for the cell
         */
        _performSmartCellUpdate(rowData, fieldName, newValue) {
            if (this._options.displayMode === 'grid') {
                // Grid mode: find the specific cell
                const cellElement = rowData.element.querySelector(`[data-field="${fieldName}"]`);
                if (cellElement) {
                    const displayValue = this._formatCellValue(fieldName, newValue);
                    cellElement.innerHTML = displayValue;
                    this._log('debug', `Updated cell ${fieldName} in grid mode`);
                } else {
                    this._log('warn', `Cell with field ${fieldName} not found in grid row`);
                }
            } else {
                // List mode: re-render the entire row content (since it uses templates)
                // We need to find the updated row data from viewDm
                const viewRecordset = this.viewDm.toRecordset();
                const updatedRowData = viewRecordset.find(row => {
                    const publicId = this._options.idField ? row[this._options.idField] : viewRecordset.indexOf(row);
                    return publicId === rowData.publicId;
                });
                
                if (updatedRowData) {
                    const newContent = this._renderRowContent(updatedRowData);
                    rowData.element.innerHTML = newContent;
                    this._log('debug', 'Updated entire row content in list mode');
                } else {
                    this._log('warn', 'Could not find updated row data for list mode update');
                }
            }
        }

        /**
         * Smart update for an entire row in the current view.
         * @private
         * @param {number} viewRowIndex - Index of the row in the view data
         * @param {object} newRowData - New data for the row
         */
        _smartUpdateRow(viewRowIndex, newRowData) {
            this._log('debug', 'Smart updating entire row', { viewRowIndex, newRowData });
            
            const rowData = this._rowMap.get(viewRowIndex);
            if (!rowData || !rowData.element) {
                this._log('debug', 'Row element not found, rebuilding row map with preserved elements');
                this._buildRowMap(true); // Preserve existing DOM elements
                // Try again after rebuilding
                const rebuiltRowData = this._rowMap.get(viewRowIndex);
                if (!rebuiltRowData || !rebuiltRowData.element) {
                    this._log('debug', 'Smart row update failed after rebuild, falling back to full render');
                    this._requestRender();
                    return;
                }
                // Use the rebuilt row data
                this._performSmartRowUpdate(rebuiltRowData, newRowData);
                return;
            }
            
            this._performSmartRowUpdate(rowData, newRowData);
        }

        /**
         * Performs the actual smart row update operation.
         * @private
         * @param {object} rowData - Row data from the row map
         * @param {object} newRowData - New data for the row
         */
        _performSmartRowUpdate(rowData, newRowData) {
            if (this._options.displayMode === 'grid') {
                // Grid mode: update all cells
                const cells = rowData.element.querySelectorAll('.jw-listbox__cell');
                cells.forEach(cell => {
                    const fieldName = cell.getAttribute('data-field');
                    if (fieldName && newRowData.hasOwnProperty(fieldName)) {
                        const displayValue = this._formatCellValue(fieldName, newRowData[fieldName]);
                        cell.innerHTML = displayValue;
                    }
                });
                this._log('debug', 'Updated all cells in grid row');
            } else {
                // List mode: re-render the entire row content
                // Find the updated row data from viewDm
                const viewRecordset = this.viewDm.toRecordset();
                const updatedRowData = viewRecordset.find(row => {
                    const publicId = this._options.idField ? row[this._options.idField] : viewRecordset.indexOf(row);
                    return publicId === rowData.publicId;
                });
                
                if (updatedRowData) {
                    const newContent = this._renderRowContent(updatedRowData);
                    rowData.element.innerHTML = newContent;
                    this._log('debug', 'Updated entire row content in list mode');
                } else {
                    this._log('warn', 'Could not find updated row data for list mode update');
                }
            }
        }

        /**
         * Smart add for new rows, creating and inserting DOM elements.
         * @private
         * @param {Array} dataArray - Array of new row objects
         * @param {number} insertIndex - Index where to insert the new rows
         * @returns {Array<HTMLElement>} Array of created DOM elements
         */
        _smartAddRows(dataArray, insertIndex) {
            this._log('debug', 'Smart adding rows', { dataCount: dataArray.length, insertIndex });
            
            const container = this._options.displayMode === 'grid' ? 
                this._bodyEl.querySelector('.jw-listbox__tbody') : 
                this._bodyEl.querySelector('.jw-listbox__list');
                
            if (!container) {
                this._log('warn', 'Cannot smart add rows - container not found, falling back to full render');
                this._requestRender();
                return [];
            }
            
            // Get the element to insert before (or null to append at end)
            const existingRows = container.children;
            const insertBeforeElement = insertIndex < existingRows.length ? existingRows[insertIndex] : null;
            
            const createdElements = [];
            
            dataArray.forEach((newRow, arrayIndex) => {
                const actualIndex = insertIndex + arrayIndex;
                
                let newElement;
                
                if (this._options.displayMode === 'grid') {
                    // Create table row
                    const trElement = document.createElement('tr');
                    trElement.className = 'jw-listbox__row';
                    trElement.setAttribute('role', 'row');
                    trElement.setAttribute('aria-selected', 'false');
                    
                    // Get field names from existing data structure
                    const fieldNames = Object.keys(newRow);
                    
                    // Create cells
                    fieldNames.forEach(fieldName => {
                        const tdElement = document.createElement('td');
                        tdElement.className = 'jw-listbox__cell';
                        tdElement.setAttribute('data-field', fieldName);
                        tdElement.setAttribute('role', 'gridcell');
                        const displayValue = this._formatCellValue(fieldName, newRow[fieldName]);
                        tdElement.innerHTML = displayValue;
                        trElement.appendChild(tdElement);
                    });
                    
                    // Insert the row
                    if (insertBeforeElement) {
                        container.insertBefore(trElement, insertBeforeElement);
                    } else {
                        container.appendChild(trElement);
                    }
                    
                    newElement = trElement;
                    this._log('debug', `Created and inserted grid row at position ${actualIndex}`);
                    
                } else {
                    // Create list item
                    const liElement = document.createElement('li');
                    liElement.className = 'jw-listbox__row';
                    liElement.setAttribute('role', 'option');
                    liElement.setAttribute('aria-selected', 'false');
                    
                    // Render content using template
                    const content = this._renderRowContent(newRow);
                    liElement.innerHTML = content;
                    
                    // Insert the row
                    if (insertBeforeElement) {
                        container.insertBefore(liElement, insertBeforeElement);
                    } else {
                        container.appendChild(liElement);
                    }
                    
                    newElement = liElement;
                    this._log('debug', `Created and inserted list row at position ${actualIndex}`);
                }
                
                createdElements.push(newElement);
            });
            
            this._log('debug', `Smart add completed - inserted ${dataArray.length} rows`);
            return createdElements;
        }

        /**
         * Links newly created DOM elements to their corresponding row map entries.
         * @private
         * @param {Array<HTMLElement>} newElements - Array of created DOM elements
         * @param {number} startIndex - Starting index where elements were inserted
         */
        _linkNewElementsToRowMap(newElements, startIndex) {
            this._log('debug', 'Linking new elements to row map', { 
                elementCount: newElements.length, 
                startIndex 
            });
            
            newElements.forEach((element, arrayIndex) => {
                const rowIndex = startIndex + arrayIndex;
                const rowData = this._rowMap.get(rowIndex);
                
                if (rowData) {
                    rowData.element = element;
                    
                    // Also set the data attributes on the element
                    element.setAttribute('data-internal-id', rowData.internalId);
                    element.setAttribute('data-public-id', rowData.publicId);
                    element.setAttribute('data-index', rowIndex);
                    
                    this._log('debug', `Linked element at index ${rowIndex} to row map`, {
                        internalId: rowData.internalId,
                        publicId: rowData.publicId
                    });
                } else {
                    this._log('warn', `No row data found for index ${rowIndex} when linking elements`);
                }
            });
            
            this._log('debug', 'Element linking completed');
        }

        /**
         * Finds the current row index in the row map by public ID.
         * @private
         * @param {*} publicId - The public ID to search for
         * @returns {number} The row index, or -1 if not found
         */
        _findRowIndexByPublicId(publicId) {
            for (const [index, rowData] of this._rowMap) {
                if (rowData.publicId === publicId) {
                    return index;
                }
            }
            return -1;
        }

        /**
         * Finds the DOM element for a row by public ID.
         * @private
         * @param {*} publicId - The public ID to search for
         * @returns {Element|null} The row element, or null if not found
         */
        _findRowElementByPublicId(publicId) {
            for (const [index, rowData] of this._rowMap) {
                if (rowData.publicId === publicId) {
                    return rowData.element;
                }
            }
            return null;
        }

        /**
         * Formats a cell value for display with visual enhancements.
         * @private
         * @param {string} fieldName - The name of the field
         * @param {*} value - The value to format
         * @returns {string} HTML string for display
         */
        _formatCellValue(fieldName, value) {
            if (value == null) {
                return '';
            }
            
            // Special formatting for isActive field
            if (fieldName === 'isActive' || fieldName === 'active') {
                const isActive = Boolean(value);
                return `<span class="jw-listbox__status-badge jw-listbox__status-badge--${isActive ? 'active' : 'inactive'}">
                    ${isActive ? '✓ Active' : '✗ Inactive'}
                </span>`;
            }
            
            // Special formatting for boolean fields
            if (typeof value === 'boolean') {
                return `<span class="jw-listbox__boolean-${value}">
                    ${value ? '✓ True' : '✗ False'}
                </span>`;
            }
            
            // Special formatting for salary field
            if (fieldName === 'salary' && typeof value === 'number') {
                return `$${value.toLocaleString()}`;
            }
            
            // Special formatting for email field
            if (fieldName === 'email') {
                return `<a href="mailto:${this._escapeHtml(String(value))}" style="color: #007acc; text-decoration: none;">
                    ${this._escapeHtml(String(value))}
                </a>`;
            }
            
            // Default: escape HTML and return as string
            return this._escapeHtml(String(value));
        }

        /**
         * Tracks a manually applied CSS class for persistence across re-renders.
         * @private
         * @param {number} internalId - The internal ID of the row
         * @param {string} cssClass - The CSS class that was applied
         * @param {string} [field] - The field name if this is a cell-level tag
         */
        _trackManualTag(internalId, cssClass, field = null) {
            if (!this._manualTags.has(internalId)) {
                this._manualTags.set(internalId, {
                    rowClasses: new Set(),
                    cellClasses: new Map()
                });
            }
            
            const tagData = this._manualTags.get(internalId);
            
            if (field) {
                // Track cell-level tag
                if (!tagData.cellClasses.has(field)) {
                    tagData.cellClasses.set(field, new Set());
                }
                tagData.cellClasses.get(field).add(cssClass);
            } else {
                // Track row-level tag
                tagData.rowClasses.add(cssClass);
            }
        }

        /**
         * Removes tracking for a manually applied CSS class.
         * @private
         * @param {number} internalId - The internal ID of the row
         * @param {string} cssClass - The CSS class to stop tracking
         * @param {string} [field] - The field name if this is a cell-level tag
         */
        _untrackManualTag(internalId, cssClass, field = null) {
            const tagData = this._manualTags.get(internalId);
            if (!tagData) return;
            
            if (field) {
                // Remove cell-level tag
                const cellClasses = tagData.cellClasses.get(field);
                if (cellClasses) {
                    cellClasses.delete(cssClass);
                    if (cellClasses.size === 0) {
                        tagData.cellClasses.delete(field);
                    }
                }
            } else {
                // Remove row-level tag
                tagData.rowClasses.delete(cssClass);
            }
            
            // Clean up empty entries
            if (tagData.rowClasses.size === 0 && tagData.cellClasses.size === 0) {
                this._manualTags.delete(internalId);
            }
        }

        /**
         * Applies manual tags to an element based on tracked tag data.
         * Called during render to restore manually applied tags.
         * @private
         * @param {HTMLElement} element - The row or cell element
         * @param {number} internalId - The internal ID of the row
         * @param {string} [field] - The field name if this is a cell element
         */
        _applyManualTags(element, internalId, field = null) {
            const tagData = this._manualTags.get(internalId);
            if (!tagData) return;
            
            if (field) {
                // Apply cell-level tags
                const cellClasses = tagData.cellClasses.get(field);
                if (cellClasses) {
                    cellClasses.forEach(cssClass => {
                        element.classList.add(cssClass);
                    });
                }
            } else {
                // Apply row-level tags
                tagData.rowClasses.forEach(cssClass => {
                    element.classList.add(cssClass);
                });
            }
        }

        /**
         * Applies conditional formatting rules to an element in grid mode.
         * @private
         * @param {HTMLElement} element - The row or cell element to potentially tag
         * @param {Object} rowData - The data object for this row
         * @param {string} [field] - The field name if this is a cell element
         */
        _applyConditionalFormats(element, rowData, field = null) {
            // Only apply conditional formats in grid mode
            if (this._options.displayMode !== 'grid') {
                return;
            }
            
            this._conditionalFormats.forEach(rule => {
                const { searchField, match, tag, target } = rule;
                
                // Check if we should apply this rule to this element
                const shouldApplyToRow = !field && target === 'row';
                const shouldApplyToCell = field && target === 'cell' && field === searchField;
                
                if (!shouldApplyToRow && !shouldApplyToCell) {
                    return; // Rule doesn't apply to this element
                }
                
                // Get the value to test
                const testValue = rowData[searchField];
                
                // Check if the value matches the rule
                let matches = false;
                if (typeof match === 'function') {
                    // Function predicate
                    matches = match(testValue);
                } else if (match instanceof RegExp) {
                    // Regular expression
                    matches = match.test(String(testValue));
                } else {
                    // Exact match
                    matches = testValue === match;
                }
                
                // Apply the tag if it matches
                if (matches) {
                    element.classList.add(tag);
                }
            });
        }

        /**
         * Switches to print mode using the printTemplate for a printer-friendly layout.
         * @param {boolean} [enable=true] - Whether to enable print mode
         * @returns {JwListBox} The instance for chaining
         */
        printMode(enable = true) {
            this._log('info', 'printMode called', { enable });
            
            try {
                this._options.printMode = enable;
                
                if (enable && !this._options.printTemplate) {
                    this._log('warn', 'Print mode enabled but no printTemplate configured');
                }
                
                // Trigger re-render to apply print template
                this._requestRender();
                
                this._emit('printModeChanged', { printMode: enable });
                
            } catch (error) {
                this._handleError({
                    code: 'PRINT_MODE_ERROR',
                    message: `Failed to set print mode: ${error.message}`,
                    method: 'printMode'
                });
            }
            
            return this;
        }

        /**
         * Shows or hides a loading indicator overlay.
         * @param {boolean} [show=true] - Whether to show the loading indicator
         * @param {string} [message='Loading...'] - Custom loading message
         * @returns {JwListBox} The instance for chaining
         */
        showLoading(show = true, message = 'Loading...') {
            this._log('info', 'showLoading called', { show, message });
            
            try {
                if (show) {
                    // Create loading overlay if it doesn't exist
                    if (!this._loadingEl) {
                        this._loadingEl = document.createElement('div');
                        this._loadingEl.className = 'jw-listbox__loading-overlay';
                        
                        const messageEl = document.createElement('div');
                        messageEl.className = 'jw-listbox__loading-message';
                        this._loadingEl.appendChild(messageEl);
                        
                        this._wrapperEl.appendChild(this._loadingEl);
                    }
                    
                    // Update message and show
                    const messageEl = this._loadingEl.querySelector('.jw-listbox__loading-message');
                    messageEl.textContent = message;
                    this._loadingEl.style.display = 'flex';
                    
                } else {
                    // Hide loading overlay
                    if (this._loadingEl) {
                        this._loadingEl.style.display = 'none';
                    }
                }
                
                this._emit('loadingChanged', { loading: show, message });
                
            } catch (error) {
                this._handleError({
                    code: 'LOADING_ERROR',
                    message: `Failed to toggle loading indicator: ${error.message}`,
                    method: 'showLoading'
                });
            }
            
            return this;
        }

        /**
         * Shows or hides a "load more" button that emits a 'more' event when clicked.
         * @param {boolean} [show=true] - Whether to show the load more button
         * @param {string} [message='Load More'] - Custom button text
         * @returns {JwListBox} The instance for chaining
         */
        showLoadMore(show = true, message = 'Load More') {
            this._log('info', 'showLoadMore called', { show, message });
            
            try {
                if (show) {
                    // Create load more button if it doesn't exist
                    if (!this._loadMoreEl) {
                        this._loadMoreEl = document.createElement('div');
                        this._loadMoreEl.className = 'jw-listbox__load-more';
                        
                        const buttonEl = document.createElement('button');
                        buttonEl.className = 'jw-listbox__load-more-button';
                        buttonEl.addEventListener('click', () => {
                            this._emit('more', {
                                currentRowCount: this.length(),
                                timestamp: Date.now()
                            });
                        });
                        
                        this._loadMoreEl.appendChild(buttonEl);
                        this._wrapperEl.appendChild(this._loadMoreEl);
                    }
                    
                    // Update message and show
                    const buttonEl = this._loadMoreEl.querySelector('.jw-listbox__load-more-button');
                    buttonEl.textContent = message;
                    this._loadMoreEl.style.display = 'block';
                    
                } else {
                    // Hide load more button
                    if (this._loadMoreEl) {
                        this._loadMoreEl.style.display = 'none';
                    }
                }
                
                this._emit('loadMoreChanged', { showLoadMore: show, message });
                
            } catch (error) {
                this._handleError({
                    code: 'LOAD_MORE_ERROR',
                    message: `Failed to toggle load more button: ${error.message}`,
                    method: 'showLoadMore'
                });
            }
            
            return this;
        }

        /**
         * Exports the current data in various formats using DataMaster capabilities.
         * @param {string} [format='recordset'] - Export format: 'recordset', 'table', 'csv'
         * @param {boolean} [allData=false] - Whether to export all data (master) or just visible data (view)
         * @param {Object} [options={}] - Format-specific options
         * @returns {Array|string} The exported data
         */
        getSource(format = 'recordset', allData = false, options = {}) {
            this._log('info', 'getSource called', { format, allData, options });
            
            try {
                if (!this.dm || !this.viewDm) {
                    throw new Error('No data available to export');
                }
                
                const sourceDm = allData ? this.dm : this.viewDm;
                
                switch (format.toLowerCase()) {
                    case 'recordset':
                        return sourceDm.toRecordset();
                        
                    case 'table':
                        return sourceDm.toTable(options);
                        
                    case 'csv':
                        return sourceDm.toCsv(options);
                        
                    default:
                        throw new Error(`Unsupported export format: ${format}`);
                }
                
            } catch (error) {
                this._handleError({
                    code: 'EXPORT_ERROR',
                    message: `Failed to export data: ${error.message}`,
                    method: 'getSource'
                });
                return null;
            }
        }

        /**
         * Gets the total number of rows currently displayed (after filtering/searching).
         * @returns {number} The number of visible rows
         */
        length() {
            try {
                if (!this.viewDm) {
                    return 0;
                }
                return this.viewDm.toRecordset().length;
                
            } catch (error) {
                this._log('error', 'length failed', { error: error.message });
                return 0;
            }
        }

        /**
         * Gets a list of all field names from the data.
         * @param {boolean} [fromMaster=false] - Whether to get fields from master data or view data
         * @returns {Array<string>} Array of field names
         */
        getFields(fromMaster = false) {
            this._log('info', 'getFields called', { fromMaster });
            
            try {
                const sourceDm = fromMaster ? this.dm : this.viewDm;
                
                if (!sourceDm) {
                    return [];
                }
                
                const recordset = sourceDm.toRecordset();
                if (recordset.length === 0) {
                    return [];
                }
                
                return Object.keys(recordset[0]);
                
            } catch (error) {
                this._handleError({
                    code: 'GET_FIELDS_ERROR',
                    message: `Failed to get field names: ${error.message}`,
                    method: 'getFields'
                });
                return [];
            }
        }

        /**
         * Sets the print template for use in print mode.
         * @param {string|HTMLElement} template - The template string or element
         * @returns {JwListBox} The instance for chaining
         */
        setPrintTemplate(template) {
            this._log('info', 'setPrintTemplate called');
            
            try {
                this._options.printTemplate = template;
                
                // If currently in print mode, trigger re-render
                if (this._options.printMode) {
                    this._requestRender();
                }
                
            } catch (error) {
                this._handleError({
                    code: 'SET_PRINT_TEMPLATE_ERROR',
                    message: `Failed to set print template: ${error.message}`,
                    method: 'setPrintTemplate'
                });
            }
            
            return this;
        }

        /**
         * Enables, disables, or configures paging for the listbox.
         * @param {object|boolean|null} options - Paging configuration object, false to disable, or null to disable
         * @returns {JwListBox} The instance for chaining
         */
        usePaging(options) {
            this._log('info', 'usePaging called', { options });
            
            // Handle disable paging
            if (options === false || options === null) {
                this._log('info', 'Disabling paging');
                this._pagingOptions = null;
                this._currentPage = 0;
                this._totalRecords = 0;
                this._requestRender();
                return this;
            }
            
            // Validate options
            if (typeof options !== 'object' || options === null) {
                this._handleError({
                    code: 'INVALID_PAGING_OPTIONS',
                    message: 'usePaging() requires an options object, false, or null',
                    method: 'usePaging'
                });
                return this;
            }
            
            // Default paging options
            const defaultPagingOptions = {
                pageSize: 50,
                loadMoreText: 'Load More',
                loadPreviousText: 'Load Previous',
                loadMoreTemplate: null,
                loadPreviousTemplate: null,
                loadingText: 'Loading...',
                loadingTemplate: null,
                dataProvider: null // Function for server-side paging
            };
            
            // If paging is already active, merge with existing options
            if (this._pagingOptions) {
                this._pagingOptions = { ...this._pagingOptions, ...options };
                this._log('info', 'Updated existing paging options');
            } else {
                this._pagingOptions = { ...defaultPagingOptions, ...options };
                this._log('info', 'Enabled paging with new options');
            }
            
            // Validate required options
            if (!Number.isInteger(this._pagingOptions.pageSize) || this._pagingOptions.pageSize <= 0) {
                this._handleError({
                    code: 'INVALID_PAGE_SIZE',
                    message: 'pageSize must be a positive integer',
                    method: 'usePaging'
                });
                return this;
            }
            
            // If dataProvider is provided, validate it's a function
            if (this._pagingOptions.dataProvider && typeof this._pagingOptions.dataProvider !== 'function') {
                this._handleError({
                    code: 'INVALID_DATA_PROVIDER',
                    message: 'dataProvider must be a function',
                    method: 'usePaging'
                });
                return this;
            }
            
            // Reset to first page when enabling or reconfiguring
            this._currentPage = 0;
            
            // If we have a dataProvider, we're in server-side mode
            if (this._pagingOptions.dataProvider) {
                this._log('info', 'Server-side paging mode enabled');
                // Initialize with empty data - will be populated by first dataProvider call
                this._totalRecords = 0;
                this._windowStart = 0;
                
                // Load initial data - this will trigger render automatically
                this._loadServerSideWindow();
            } else {
                this._log('info', 'Client-side paging mode enabled');
                // Set total records from current dm
                if (this.dm) {
                    this._totalRecords = this.dm.toRecordset().length;
                }
                
                // Trigger render for client-side paging
                this._requestRender();
            }
            return this;
        }

        /**
         * Appends new rows to the DOM below the current content.
         * @private
         * @param {Array} newData - Array of data records to append
         */
        _appendRowsToDOM(newData) {
            this._log('debug', 'Appending rows to DOM', { recordCount: newData.length });
            
            // Find the container and the load more control
            const container = this._options.displayMode === 'grid' ? 
                this._bodyEl.querySelector('tbody') : 
                this._bodyEl.querySelector('ul');
            
            if (!container) {
                this._log('error', 'Container not found for appending rows');
                return;
            }
            
            // Find the load more control to insert before it
            const loadMoreControl = container.querySelector('[data-action="more"]');
            
            // Create and insert new rows
            newData.forEach(row => {
                const rowElement = this._createRowElement(row);
                if (loadMoreControl) {
                    container.insertBefore(rowElement, loadMoreControl);
                } else {
                    container.appendChild(rowElement);
                }
            });
        }

        /**
         * Prepends new rows to the DOM above the current content.
         * @private
         * @param {Array} newData - Array of data records to prepend
         */
        _prependRowsToDOM(newData) {
            this._log('debug', 'Prepending rows to DOM', { recordCount: newData.length });
            
            // Find the container and the load previous control
            const container = this._options.displayMode === 'grid' ? 
                this._bodyEl.querySelector('tbody') : 
                this._bodyEl.querySelector('ul');
            
            if (!container) {
                this._log('error', 'Container not found for prepending rows');
                return;
            }
            
            // Find the load previous control or the first data row
            const loadPrevControl = container.querySelector('[data-action="previous"]');
            const insertPoint = loadPrevControl ? loadPrevControl.nextSibling : container.firstChild;
            
            // Create and insert new rows in reverse order to maintain proper order
            newData.reverse().forEach(row => {
                const rowElement = this._createRowElement(row);
                if (insertPoint) {
                    container.insertBefore(rowElement, insertPoint);
                } else {
                    container.appendChild(rowElement);
                }
            });
        }

        /**
         * Updates the visibility of paging controls based on current state.
         * @private
         */
        _updatePagingControls() {
            this._log('debug', 'Updating paging controls');
            
            const container = this._options.displayMode === 'grid' ? 
                this._bodyEl.querySelector('tbody') : 
                this._bodyEl.querySelector('ul');
            
            if (!container) {
                this._log('error', 'Container not found for updating paging controls');
                return;
            }
            
            // Update load previous control
            const loadPrevControl = container.querySelector('[data-action="previous"]');
            if (this._windowStart > 0) {
                if (!loadPrevControl) {
                    const newPrevControl = this._createPagingControl('previous', this._options.displayMode);
                    container.insertBefore(newPrevControl, container.firstChild);
                }
            } else {
                if (loadPrevControl) {
                    loadPrevControl.remove();
                }
            }
            
            // Update load more control
            const loadMoreControl = container.querySelector('[data-action="more"]');
            if (this._hasMorePages()) {
                if (!loadMoreControl) {
                    const newMoreControl = this._createPagingControl('more', this._options.displayMode);
                    container.appendChild(newMoreControl);
                }
            } else {
                if (loadMoreControl) {
                    loadMoreControl.remove();
                }
            }
        }

        /**
         * Creates a single row element from data.
         * @private
         * @param {Object} row - The data row object
         * @returns {HTMLElement} The created row element
         */
        _createRowElement(row) {
            const element = this._options.displayMode === 'grid' ? 
                this._createGridRowElement(row) : 
                this._createListRowElement(row);
            
            // Add the new row to the row map
            const publicId = this._getPublicIdFromRow(row);
            const internalId = this._getInternalIdFromRow(row);
            
            // Use a high base for virtual pagination keys to avoid conflicts with main rendering indices
            const virtualKey = 10000 + internalId;
            
            // Set the virtual key as the data-index attribute
            element.setAttribute('data-index', virtualKey);
            
            this._rowMap.set(virtualKey, {
                internalId: internalId,
                publicId: publicId,
                data: row,
                element: element
            });
            
            return element;
        }

        /**
         * Creates a grid row element (tr) from data.
         * @private
         * @param {Object} row - The data row object
         * @returns {HTMLElement} The created tr element
         */
        _createGridRowElement(row) {
            const tr = document.createElement('tr');
            tr.className = 'jw-listbox__row';
            
            // Add data attributes
            const publicId = this._getPublicIdFromRow(row);
            const internalId = this._getInternalIdFromRow(row);
            
            tr.setAttribute('data-public-id', publicId);
            tr.setAttribute('data-internal-id', internalId);
            // Note: data-index will be set by _createRowElement with virtual key
            
            // Create cells for each field
            const fieldNames = Object.keys(row);
            fieldNames.forEach(fieldName => {
                const td = document.createElement('td');
                td.className = 'jw-listbox__cell';
                td.setAttribute('data-field', fieldName);
                td.innerHTML = this._formatCellValue(fieldName, row[fieldName]);
                tr.appendChild(td);
            });
            
            return tr;
        }

        /**
         * Creates a list row element (li) from data.
         * @private
         * @param {Object} row - The data row object
         * @returns {HTMLElement} The created li element
         */
        _createListRowElement(row) {
            const li = document.createElement('li');
            li.className = 'jw-listbox__row';
            
            // Add data attributes
            const publicId = this._getPublicIdFromRow(row);
            const internalId = this._getInternalIdFromRow(row);
            
            li.setAttribute('data-public-id', publicId);
            li.setAttribute('data-internal-id', internalId);
            // Note: data-index will be set by _createRowElement with virtual key
            
            // Render content using template
            li.innerHTML = this._renderRowContent(row);
            
            return li;
        }

        /**
         * Gets the public ID from a data row.
         * @private
         * @param {Object} row - The data row object
         * @returns {*} The public ID
         */
        _getPublicIdFromRow(row) {
            return this._options.idField ? row[this._options.idField] : row;
        }

        /**
         * Gets or assigns an internal ID from a data row.
         * @private
         * @param {Object} row - The data row object
         * @returns {number} The internal ID
         */
        _getInternalIdFromRow(row) {
            // For virtual pagination, we need to create internal IDs dynamically
            // Check if this row already has an internal ID in the row map
            const publicId = this._getPublicIdFromRow(row);
            
            // Look for existing internal ID in the row map
            for (const [internalId, rowData] of this._rowMap) {
                if (rowData.publicId === publicId) {
                    return internalId;
                }
            }
            
            // Create a new internal ID for this row
            const internalId = ++this._internalIdCounter;
            return internalId;
        }

        /**
         * Gets row data from the row map, handling both index-based and internalId-based keys.
         * @private
         * @param {number} internalId - The internal ID of the row
         * @param {number} index - The index of the row (may be null for virtual pagination)
         * @returns {Object|null} The row data object
         */
        _getRowDataFromMap(internalId, index) {
            // First try to get by index (for main rendering rows)
            if (index !== null && !isNaN(index) && this._rowMap.has(index)) {
                return this._rowMap.get(index);
            }
            
            // Then try to get by internalId (for virtual pagination rows)
            if (this._rowMap.has(internalId)) {
                return this._rowMap.get(internalId);
            }
            
            // If not found by either key, search by internalId in the data
            for (const [key, rowData] of this._rowMap) {
                if (rowData.internalId === internalId) {
                    return rowData;
                }
            }
            
            // Debug logging
            console.log(`_getRowDataFromMap: Could not find row data for internalId=${internalId}, index=${index}`);
            console.log(`Row map keys:`, Array.from(this._rowMap.keys()));
            
            return null;
        }
    }

    // --- Universal Export ---
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = JwListBox; // Node.js
    } else {
        global.JwListBox = JwListBox; // Browser
    }

}(this || window));