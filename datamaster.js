/**
 * ver 5.0.1 25/07/10
 * - remove refreces to table generator
 * ver 5.0.0 25/07/10
 * - total refactor and major upgrade
**/

(function(global) {
    'use strict';

    // --- Helper Functions (Stateless, defined outside of class) ---
    
    /**
     * Creates a deep copy of data using JSON serialization
     * @param {*} data - Data to copy
     * @returns {*} Deep copy of the data or error indicator
     */
    function deepCopy(data) {
        if (data === undefined) {
            return undefined;
        }
        if (data === null) {
            return null;
        }
        try {
            return JSON.parse(JSON.stringify(data));
        } catch (error) {
            return { error: true, message: 'Failed to create deep copy: ' + error.message };
        }
    }

    /**
     * Converts a recordset to a table format
     * @param {Array<Object>} recordset - Array of objects
     * @returns {Object} Object with fields array and table array, or error indicator
     */
    function recordsetToTable(recordset) {
        if (!Array.isArray(recordset)) {
            return { error: true, message: 'Input must be an array' };
        }
        
        if (recordset.length === 0) {
            return { fields: [], table: [] };
        }
        
        if (typeof recordset[0] !== 'object' || recordset[0] === null) {
            return { error: true, message: 'Array elements must be objects' };
        }
        
        const fields = Object.keys(recordset[0]);
        const table = [];
        
        for (let i = 0; i < recordset.length; i++) {
            if (typeof recordset[i] !== 'object' || recordset[i] === null) {
                return { error: true, message: 'All array elements must be objects' };
            }
            
            const row = [];
            for (let j = 0; j < fields.length; j++) {
                const fieldName = fields[j];
                if (recordset[i].hasOwnProperty(fieldName)) {
                    row.push(recordset[i][fieldName]);
                } else {
                    row.push(null);
                }
            }
            table.push(row);
        }
        
        return { fields, table };
    }

    /**
     * Converts a table to a recordset format
     * @param {Array<Array>} table - 2D array of data
     * @param {Array<string>} fields - Field names
     * @returns {Array<Object>} Array of objects or error indicator
     */
    function tableToRecordset(table, fields) {
        if (!Array.isArray(table)) {
            return { error: true, message: 'Table must be an array' };
        }
        
        if (!Array.isArray(fields)) {
            return { error: true, message: 'Fields must be an array' };
        }
        
        if (table.length === 0) {
            return [];
        }
        
        const recordset = [];
        
        for (let row = 0; row < table.length; row++) {
            if (!Array.isArray(table[row])) {
                return { error: true, message: 'All table rows must be arrays' };
            }
            
            const record = {};
            for (let field = 0; field < fields.length; field++) {
                if (typeof fields[field] !== 'string') {
                    return { error: true, message: 'All field names must be strings' };
                }
                record[fields[field]] = table[row][field] !== undefined ? table[row][field] : null;
            }
            recordset.push(record);
        }
        
        return recordset;
    }

    /**
     * Converts CSV string to table format
     * @param {string} csvString - CSV data as string
     * @param {Object} options - Parsing options
     * @returns {Object} Object with fields array and table array, or error indicator
     */
    function csvToTable(csvString, options = {}) {
        if (typeof csvString !== 'string') {
            return { error: true, message: 'CSV input must be a string' };
        }
        
        if (csvString.length === 0) {
            return { fields: [], table: [] };
        }
        
        const isTSV = options.isTSV || false;
        const headersInFirstRow = options.headersInFirstRow || false;
        const sep = isTSV ? '\t' : ',';
        const cr = options.noCR ? '\n' : '\r\n';
        
        const table = [];
        let cell = '';
        let row = [];
        let started = false;
        let protectedMode = false;
        let cursor = 0;
        
        function isChar(str) {
            let test = '';
            const l = str.length;
            for (let i = 0; i < l; i++) {
                test += csvString[cursor + i];
            }
            if (str === test) {
                cursor += l;
                return true;
            }
            return false;
        }
        
        while (cursor < csvString.length) {
            if (started) {
                if (protectedMode) {
                    if (isChar('\"' + sep)) {
                        row.push(cell);
                        cell = '';
                        started = false;
                        protectedMode = false;
                    } else if (isChar('"' + cr)) {
                        row.push(cell);
                        cell = '';
                        table.push(row);
                        row = [];
                        started = false;
                        protectedMode = false;
                    } else if (isChar('\"\"')) {
                        cell += '"';
                    } else {
                        cell += csvString[cursor];
                        cursor++;
                    }
                } else {
                    if (isChar(sep)) {
                        row.push(cell);
                        cell = '';
                        started = false;
                        protectedMode = false;
                    } else if (isChar(cr)) {
                        row.push(cell);
                        cell = '';
                        table.push(row);
                        row = [];
                        started = false;
                        protectedMode = false;
                    } else if (isChar('""')) {
                        cell += '"';
                    } else {
                        cell += csvString[cursor];
                        cursor++;
                    }
                }
            } else {
                if (isChar('"')) {
                    protectedMode = true;
                    started = true;
                } else if (isChar(sep)) {
                    row.push(cell);
                    cell = '';
                    started = false;
                    protectedMode = false;
                } else if (isChar(cr)) {
                    table.push(row);
                    row = [];
                    cell = '';
                    started = false;
                    protectedMode = false;
                } else {
                    cell = csvString[cursor];
                    started = true;
                    protectedMode = false;
                    cursor++;
                }
            }
        }
        
        // Handle any remaining data
        if (cell || row.length > 0) {
            if (cell) row.push(cell);
            if (row.length > 0) table.push(row);
        }
        
        let fields = [];
        let dataTable = table;
        
        if (headersInFirstRow && table.length > 0) {
            fields = table[0];
            dataTable = table.slice(1);
            
            // Validate field names
            for (let i = 0; i < fields.length; i++) {
                if (fields[i] === null || fields[i] === undefined) {
                    fields[i] = 'Field' + i;
                } else {
                    fields[i] = fields[i].toString();
                }
            }
        } else {
            // Generate numeric field names
            if (table.length > 0) {
                for (let i = 0; i < table[0].length; i++) {
                    fields.push(i.toString());
                }
            }
        }
        
        return { fields, table: dataTable };
    }

    /**
     * Converts table data to CSV string
     * @param {Array<Array>} table - 2D array of data
     * @param {Array<string>} fields - Field names
     * @param {Object} options - Export options
     * @returns {string} CSV formatted string or error indicator
     */
    function tableToCsv(table, fields, options = {}) {
        if (!Array.isArray(table)) {
            return { error: true, message: 'Table must be an array' };
        }
        
        if (!Array.isArray(fields)) {
            return { error: true, message: 'Fields must be an array' };
        }
        
        const newLineString = options.newLineString || '\r\n';
        const includeHeaders = options.includeHeaders !== false;
        
        function escape(val) {
            if (val === null || val === undefined) {
                return '""';
            }
            try {
                val = val.toString();
                // Replace quotes with double quotes
                val = val.replace(/"/g, '""');
                // Wrap in quotes if contains comma, newline, or quotes
                if (val.includes(',') || val.includes('\n') || val.includes('\r') || val.includes('"')) {
                    val = '"' + val + '"';
                }
                return val;
            } catch (error) {
                return '""'; // Return empty quoted string on conversion failure
            }
        }
        
        let csv = '';
        
        if (includeHeaders && fields.length > 0) {
            csv += fields.map(escape).join(',') + newLineString;
        }
        
        for (let r = 0; r < table.length; r++) {
            if (!Array.isArray(table[r])) {
                return { error: true, message: 'All table rows must be arrays' };
            }
            
            const row = [];
            for (let c = 0; c < table[r].length; c++) {
                row.push(escape(table[r][c]));
            }
            csv += row.join(',') + newLineString;
        }
        
        return csv;
    }

    /**
     * Checks if an item is in a list using soft equivalence (1 == '1')
     * @param {Array} list - The list to check against
     * @param {*} item - The item to find
     * @returns {boolean} True if item is found
     */
    function itemInList(list, item) {
        if (!Array.isArray(list)) {
            return false;
        }
        
        for (let i = 0; i < list.length; i++) {
            if (list[i] == item) { // Soft check
                return true;
            }
        }
        
        return false;
    }

    /**
     * Returns a single column from a table
     * @param {Array<Array>} table - 2D array of data
     * @param {number} column - The index of the column to return
     * @param {boolean} [distinct=false] - Whether to return only unique values
     * @returns {Array} Array of column values
     */
    function getTableColumn(table, column, distinct = false) {
        if (!Array.isArray(table)) {
            return [];
        }
        
        const col = [];
        
        try {
            for (let row = 0; row < table.length; row++) {
                if (!Array.isArray(table[row]) || column >= table[row].length) {
                    continue;
                }
                
                if (distinct) {
                    if (!itemInList(col, table[row][column])) {
                        col.push(table[row][column]);
                    }
                } else {
                    col.push(table[row][column]);
                }
            }
            return col;
        } catch (error) {
            return [];
        }
    }

    /**
     * Returns a single row from a table
     * @param {Array<Array>} table - 2D array of data
     * @param {number} rowIndex - The index of the row to return
     * @returns {Array|null} Array of row values or null if not found
     */
    function getTableRow(table, rowIndex) {
        if (!Array.isArray(table)) {
            return null;
        }
        
        if (rowIndex < 0 || rowIndex >= table.length) {
            return null;
        }
        
        try {
            const row = table[rowIndex];
            if (!Array.isArray(row)) {
                return null;
            }
            
            // Return a copy of the row to prevent external modification
            return [...row];
        } catch (error) {
            return null;
        }
    }

    /**
     * Tests if a row is a duplicate based on specified column indexes
     * @param {Array} rowData - The row to test
     * @param {Array<Array>} existingTable - The table to check against
     * @param {Array<number>} columnIndexes - The column indexes to compare
     * @returns {boolean} True if the row is a duplicate
     */
    function isRowDuplicate(rowData, existingTable, columnIndexes) {
        if (!Array.isArray(rowData) || !Array.isArray(existingTable) || !Array.isArray(columnIndexes)) {
            return false;
        }
        
        for (let existingRow = 0; existingRow < existingTable.length; existingRow++) {
            if (!Array.isArray(existingTable[existingRow])) {
                continue; // Skip invalid rows
            }
            
            let isMatch = true;
            
            // Check all specified columns for a match
            for (let col = 0; col < columnIndexes.length; col++) {
                const columnIndex = columnIndexes[col];
                
                // Use soft comparison to match original behavior
                if (existingTable[existingRow][columnIndex] != rowData[columnIndex]) {
                    isMatch = false;
                    break;
                }
            }
            
            if (isMatch) {
                return true; // Found a duplicate
            }
        }
        
        return false; // No duplicate found
    }

    /**
     * Generates a comparator function for sorting an array of arrays based on
     * multiple fields and corresponding sort orders.
     * @param {Array<number>} fields - Array of column indices to sort by
     * @param {Array<boolean>} directions - Array of booleans where true = descending, false = ascending
     * @param {Array<Function>} [primers] - Optional array of functions to transform each field before comparison
     * @returns {Function} Comparator function for Array.prototype.sort
     */
    function multiFieldSort(fields, directions, primers) {
        if (!Array.isArray(fields) || !Array.isArray(directions)) {
            return function() { return 0; }; // Return neutral comparator if invalid inputs
        }
        
        return function(a, b) {
            // Validate that both items are arrays
            if (!Array.isArray(a) || !Array.isArray(b)) {
                return 0;
            }
            
            // Iterate over each field provided
            for (let i = 0; i < fields.length; i++) {
                const field = fields[i];
                const isDescending = directions[i] || false;
                const primer = primers && primers[i];
                
                // Determine sort order (1 for ascending, -1 for descending)
                const sortOrder = isDescending ? -1 : 1;
                
                // Get values from both arrays
                let valueA = a[field];
                let valueB = b[field];
                
                // Apply primer function if provided
                if (typeof primer === 'function') {
                    try {
                        valueA = primer(valueA);
                        valueB = primer(valueB);
                    } catch (error) {
                        // If primer fails, continue with original values
                        valueA = a[field];
                        valueB = b[field];
                    }
                }
                
                // Handle null/undefined values - sort them to the end
                if (valueA == null && valueB == null) {
                    continue; // Both null, check next field
                }
                if (valueA == null) {
                    return 1; // Null values go to end regardless of sort order
                }
                if (valueB == null) {
                    return -1; // Null values go to end regardless of sort order
                }
                
                // Perform the comparison for the current field
                if (valueA > valueB) {
                    return sortOrder;
                } else if (valueA < valueB) {
                    return -sortOrder;
                }
                // If values are equal, continue to next field
            }
            
            // All fields are equal
            return 0;
        };
    }

    /**
     * Validates and converts field references to column indexes
     * @param {Array<string>} fieldNames - The field names array
     * @param {Array<string|number>} fields - Fields to validate and convert
     * @returns {Object} Object with {success: boolean, indexes: Array<number>, error: string}
     */
    function validateAndConvertFields(fieldNames, fields) {
        if (!Array.isArray(fieldNames) || !Array.isArray(fields)) {
            return { success: false, indexes: [], error: 'Invalid field names or fields array' };
        }
        
        const validIndexes = [];
        
        for (let i = 0; i < fields.length; i++) {
            let columnIndex;
            
            if (typeof fields[i] === 'number') {
                if (fields[i] < 0 || fields[i] >= fieldNames.length) {
                    return { 
                        success: false, 
                        indexes: [], 
                        error: `Field index ${fields[i]} is out of bounds` 
                    };
                }
                columnIndex = fields[i];
            } else if (typeof fields[i] === 'string') {
                columnIndex = fieldNames.indexOf(fields[i]);
                if (columnIndex === -1) {
                    return { 
                        success: false, 
                        indexes: [], 
                        error: `Field '${fields[i]}' not found` 
                    };
                }
            } else {
                return { 
                    success: false, 
                    indexes: [], 
                    error: 'Field references must be strings or numbers' 
                };
            }
            
            validIndexes.push(columnIndex);
        }
        
        return { success: true, indexes: validIndexes, error: null };
    }

    /**
     * Reorders table data and fields based on the specified field order
     * @param {Array<Array>} table - The table data to reorder
     * @param {Array<string>} fields - The current field names
     * @param {Array<string|number>} order - The fields/indexes to keep and their order
     * @returns {Object} Object with {success: boolean, table: Array<Array>, fields: Array<string>, error: string}
     */
    function reorderTableData(table, fields, order) {
        if (!Array.isArray(table) || !Array.isArray(fields) || !Array.isArray(order)) {
            return { 
                success: false, 
                table: [], 
                fields: [], 
                error: 'Invalid table, fields, or order parameters' 
            };
        }
        
        if (order.length === 0) {
            return { 
                success: false, 
                table: [], 
                fields: [], 
                error: 'Order array cannot be empty' 
            };
        }
        
        try {
            // Validate and convert field references to indexes
            const validation = validateAndConvertFields(fields, order);
            if (!validation.success) {
                return { 
                    success: false, 
                    table: [], 
                    fields: [], 
                    error: validation.error 
                };
            }
            
            const fieldIndexes = validation.indexes;
            const newTable = [];
            const newFields = [];
            
            // Build new field names array
            for (let i = 0; i < order.length; i++) {
                if (typeof order[i] === 'number') {
                    // If order item was an index, use the field name at that index
                    newFields.push(fields[order[i]]);
                } else {
                    // If order item was a field name, use it directly
                    newFields.push(order[i]);
                }
            }
            
            // Reorder each row
            for (let r = 0; r < table.length; r++) {
                if (!Array.isArray(table[r])) {
                    continue; // Skip invalid rows
                }
                
                const newRow = [];
                for (let i = 0; i < fieldIndexes.length; i++) {
                    const columnIndex = fieldIndexes[i];
                    newRow.push(table[r][columnIndex] !== undefined ? table[r][columnIndex] : null);
                }
                newTable.push(newRow);
            }
            
            return { 
                success: true, 
                table: newTable, 
                fields: newFields, 
                error: null 
            };
            
        } catch (error) {
            return { 
                success: false, 
                table: [], 
                fields: [], 
                error: 'Failed to reorder data: ' + error.message 
            };
        }
    }

    // --- START: Upgraded Query Engine Helpers from DataQuery ---

    /**
     * Performs case-insensitive string comparison with wildcard support
     * @param {*} value - The value to compare
     * @param {*} query - The query pattern to match against
     * @param {boolean} [forceCaseSensitivity=false] - Whether to force case sensitivity
     * @returns {boolean} True if value matches query pattern
     */
    function looseCaseInsensitiveCompare(value, query, forceCaseSensitivity = false) {
        // Check for null or undefined
        if (value == null || query == null) {
            return false;
        }
        
        // Convert to string
        value = String(value);
        query = String(query);
        
        // Make case-insensitive unless forceCaseSensitivity is true
        if (!forceCaseSensitivity) {
            value = value.toLowerCase();
            query = query.toLowerCase();
        }
        
        // Handle wildcards
        let regexStr = '';
        for (let i = 0; i < query.length; i++) {
            if (query[i] === '%') {
                regexStr += '.*';
            } else if (query[i] === '_') {
                regexStr += '.';
            } else {
                // Escape special regex characters
                regexStr += query[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            }
        }
        
        try {
            const regex = new RegExp(`^${regexStr}$`);
            return regex.test(value);
        } catch (error) {
            return false;
        }
    }

    /**
     * Parses a function string into name and parameters
     * @param {string} functionString - The function string to parse
     * @returns {Object|string} Object with name and params properties, or original string if parsing fails
     */
    function parseFunctionString(functionString) {
        const openParenIndex = functionString.indexOf('(');
        const closeParenIndex = functionString.lastIndexOf(')');

        const functionName = openParenIndex === -1 ? functionString : functionString.substring(0, openParenIndex);
        let params = [];

        if (openParenIndex !== -1 && closeParenIndex > openParenIndex) {
            const paramsString = functionString.substring(openParenIndex + 1, closeParenIndex).trim();
            if (paramsString) {
                // Regex to split by comma, but not inside quotes
                const paramRegex = /(".*?"|'.*?'|[^,]+)/g;
                let match;
                while ((match = paramRegex.exec(paramsString)) !== null) {
                    let param = match[0].trim();
                    // Attempt to convert type if not quoted
                    if ((param.startsWith("'") && param.endsWith("'")) || (param.startsWith('"') && param.endsWith('"'))) {
                        params.push(param.substring(1, param.length - 1));
                    } else if (!isNaN(param) && param !== '') {
                        params.push(parseFloat(param));
                    } else if (param === 'true') {
                        params.push(true);
                    } else if (param === 'false') {
                        params.push(false);
                    } else {
                        params.push(param);
                    }
                }
            }
        }

        return {
            name: functionName,
            params: params
        };
    }

    /**
     * Evaluates a single operation (e.g., "1='smith'")
     * @param {Array} data - The row data to evaluate against
     * @param {Array} fields - The field names
     * @param {string} operation - The operation string
     * @param {Object} [queryFunctions={}] - Custom query functions
     * @returns {string} 'true' or 'false'
     */
    function evaluateSingleOperation(data, fields, operation, queryFunctions = {}) {
        // Input validation
        if (!Array.isArray(data)) {
            return 'false';
        }
        if (!Array.isArray(fields)) {
            return 'false';
        }
        if (typeof operation !== 'string') {
            return 'false';
        }
        if (operation.trim() === '') {
            return 'false';
        }
        
        const operatorPattern = /(>=|<=|!=|=|>|<)/g;
        const parts = operation.split(operatorPattern);
        
        if (parts.length !== 3) {
            return 'false';
        }
        
        // Trim the parts to handle extraneous whitespace
        const index = parts[0].trim();
        const operator = parts[1].trim();
        const value = parts[2].trim();
        
        // Validate operator
        if (!['>=', '<=', '!=', '=', '>', '<'].includes(operator)) {
            return 'false';
        }
        
        // Handle case where value is not quoted - this is an ERROR condition
        let cleanValue;
        if (value.length >= 2 && 
            ((value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') ||
             (value.charAt(0) === "'" && value.charAt(value.length - 1) === "'"))) {
            // Value is properly quoted
            cleanValue = value.substring(1, value.length - 1);
        } else {
            // Value is not quoted - this is a malformed query that should error
            return 'ERROR_UNQUOTED_VALUE';
        }
        
        // Verify that the index is valid
        const columnIndex = parseInt(index);
        if (isNaN(columnIndex) || columnIndex < 0 || columnIndex >= data.length) {
            return 'false';
        }
        
        // Check if the corresponding field exists
        if (columnIndex >= fields.length) {
            return 'false';
        }
        
        // Handle null/undefined data values
        const cellValue = data[columnIndex];
        if (cellValue === null || cellValue === undefined) {
            // For null/undefined values, only exact matches with empty string or specific null checks work
            if (cleanValue === '' || cleanValue === 'null' || cleanValue === 'undefined') {
                return operator === '=' ? 'true' : 'false';
            }
            return operator === '!=' ? 'true' : 'false';
        }
        
        let matchFound = false;

        if (cleanValue.charAt(0) === '@') {
            const functionString = cleanValue.substring(1);
            
            // Validate function string is not empty
            if (functionString.trim() === '') {
                matchFound = false;
            } else {
                const functionParts = parseFunctionString(functionString);
                
                // Validate function parts were parsed correctly
                if (!functionParts || typeof functionParts.name !== 'string' || functionParts.name.trim() === '') {
                    matchFound = false;
                } else {
                    const functionName = functionParts.name;
                    const functionParams = functionParts.params;
                    
                    // Validate queryFunctions object
                    if (!queryFunctions || typeof queryFunctions !== 'object') {
                        matchFound = false;
                    } else if (typeof queryFunctions[functionName] === 'function') {
                        try {
                            const options = {
                                value: data[columnIndex],
                                field: fields[columnIndex],
                                params: functionParams,
                                row: fields.reduce((obj, field, index) => {
                                    obj[field] = data[index];
                                    return obj;
                                }, {})
                            };
                            const result = queryFunctions[functionName](options);
                            // Ensure function returns a boolean-like value
                            matchFound = Boolean(result);
                        } catch (error) {
                            console.error(`Error executing query function "${functionName}":`, error);
                            matchFound = false;
                        }
                    } else {
                        // Fallback for strings that start with @ but aren't functions, e.g. '@username'
                        matchFound = looseCaseInsensitiveCompare(data[columnIndex], cleanValue);
                    }
                }
            }
            // Invert for '!=' only if it's a function or fallback string match
            if (operator === '!=') {
                matchFound = !matchFound;
            }
        } else {
            const isComparison = ['>', '<', '>=', '<='].includes(operator);

            if (isComparison) {
                // For numeric comparisons, validate both values can be parsed as numbers
                const cellValueStr = String(data[columnIndex]);
                const numCellValue = parseFloat(cellValueStr);
                const numQueryValue = parseFloat(cleanValue);

                // Handle edge cases for numeric parsing
                if (isNaN(numCellValue) || isNaN(numQueryValue)) {
                    matchFound = false;
                } else if (!isFinite(numCellValue) || !isFinite(numQueryValue)) {
                    // Handle Infinity cases
                    matchFound = false;
                } else {
                    // Perform numeric comparison
                    switch (operator) {
                        case '>': matchFound = numCellValue > numQueryValue; break;
                        case '<': matchFound = numCellValue < numQueryValue; break;
                        case '>=': matchFound = numCellValue >= numQueryValue; break;
                        case '<=': matchFound = numCellValue <= numQueryValue; break;
                        default: matchFound = false; break;
                    }
                }
            } else { // Operator is '=' or '!='
                // For equality comparisons, handle various data types safely
                try {
                    matchFound = looseCaseInsensitiveCompare(data[columnIndex], cleanValue);
                    if (operator === '!=') {
                        matchFound = !matchFound;
                    }
                } catch (error) {
                    console.error(`Error in comparison operation:`, error);
                    matchFound = false;
                }
            }
        }

        return matchFound ? 'true' : 'false';
    }

    /**
     * Replaces field expressions with boolean results
     * @param {Array} data - The row data to evaluate against
     * @param {Array} fields - The field names
     * @param {string} query - The query string with field expressions
     * @param {Object} [queryFunctions={}] - Custom query functions
     * @returns {string} Query string with expressions replaced by boolean values
     */
    function replaceAndEvaluateExpressions(data, fields, query, queryFunctions = {}) {
        const regex = /\d+\s*(?:>=|<=|!=|=|>|<)\s*(?:"[^"]*"|'[^']*')/g;
        let modifiedStr = query;
        let match;
        
        // Use a temporary string for replacement to avoid issues with repeated expressions
        let tempQuery = query;
        const replacements = [];

        while ((match = regex.exec(tempQuery)) !== null) {
            const expression = match[0];
            const evaluatedValue = evaluateSingleOperation(data, fields, expression, queryFunctions);
            
            // Check if evaluateSingleOperation returned an error
            if (evaluatedValue.startsWith('ERROR_')) {
                // Return error immediately instead of continuing
                return evaluatedValue;
            }
            
            replacements.push({ expression, evaluatedValue });
        }

        // Check for unmatched comparison expressions (likely unquoted values)
        const unquotedPattern = /\d+\s*(?:>=|<=|!=|=|>|<)\s*[^"'\s\(\)]+/g;
        const unquotedMatches = query.match(unquotedPattern);
        
        if (unquotedMatches) {
            // Filter out matches that were already processed (quoted values)
            const processedExpressions = replacements.map(r => r.expression);
            const unprocessedMatches = unquotedMatches.filter(match => 
                !processedExpressions.some(processed => processed.includes(match))
            );
            
            if (unprocessedMatches.length > 0) {
                return 'ERROR_UNQUOTED_VALUE';
            }
        }

        for (const rep of replacements) {
            // Replace only the first occurrence to handle queries with identical conditions
            modifiedStr = modifiedStr.replace(rep.expression, rep.evaluatedValue);
        }
        
        return modifiedStr;
    }

    /**
     * Evaluates a logical expression with AND/OR operators
     * @param {string} expression - The boolean expression to evaluate
     * @returns {boolean} The result of the logical evaluation
     */
    function evaluateLogicalExpression(expression) {
        const orParts = expression.split(' OR ');
        
        for (const orPart of orParts) {
            const andParts = orPart.split(' AND ');
            let andResult = true;
            
            for (const andPart of andParts) {
                if (andPart.trim() === 'false') {
                    andResult = false;
                    break;
                }
            }
            
            if (andResult) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Evaluates nested expressions with parentheses
     * @param {string} expression - The expression to evaluate
     * @returns {string} 'true' or 'false'
     */
    function evaluateNestedExpression(expression) {
        // Keep processing until no parentheses are left
        while (expression.includes('(')) {
            const closeParenIndex = expression.indexOf(')');
            if (closeParenIndex === -1) break; // Malformed expression

            const openParenIndex = expression.lastIndexOf('(', closeParenIndex);
            if (openParenIndex === -1) break; // Malformed expression

            const innerExpression = expression.substring(openParenIndex + 1, closeParenIndex);
            const innerResult = evaluateLogicalExpression(innerExpression) ? 'true' : 'false';
            
            expression = expression.substring(0, openParenIndex) + innerResult + expression.substring(closeParenIndex + 1);
        }
        
        // Evaluate the final flat expression
        return evaluateLogicalExpression(expression) ? 'true' : 'false';
    }

    /**
     * Expands the * operator to match all fields
     * @param {string} query - The query string with potential * operators
     * @param {Array<string>} fields - The field names to expand against
     * @returns {string} Query string with * operators expanded
     */
    function expandAllFields(query, fields) {
        // Regular expression to match OR*=, OR*!=, AND*=, AND*!=
        const pattern = /(OR|AND)\s*\*\s*(=|!=)\s*('[^']+'|"[^"]+")/g;
        
        // Replacement function
        const replaceMatch = (match, logicalOperator, operator, value) => {
            // Create conditions for each field, ensuring field names are not part of the value
            const conditions = fields.map(column => `${column}${operator}${value}`);
            const joiner = logicalOperator.trim() === 'OR' ? ' OR ' : ' AND ';
            return ` ${logicalOperator} (` + conditions.join(joiner) + ')';
        };
        
        // Perform the replacement
        return query.replace(pattern, replaceMatch);
    }

    /**
     * Parses ORDER BY clause string into fields and order directions
     * @param {string} orderByClause - String like "field1 ASC, field2 DESC" or "ORDER BY field1 ASC, field2 DESC"
     * @returns {Object} Object with fields array and desc array (boolean values), or error string
     */
    function parseOrderByClause(orderByClause) {
        // Check if the input is a string
        if (typeof orderByClause !== 'string') {
            return 'Error: Input must be a string';
        }
    
        // Trim the input and remove 'ORDER BY' if present
        orderByClause = orderByClause.trim();
        const orderByPattern = /^ORDER\s+BY\s+/i;
        if (orderByPattern.test(orderByClause)) {
            orderByClause = orderByClause.replace(orderByPattern, '');
        }
    
        // Split the clause by commas to get individual field clauses
        const fieldClauses = orderByClause.split(/\s*,\s*/);
    
        const fields = [];
        const orders = [];
    
        // Iterate over each field clause to extract field names and order
        for (let i = 0; i < fieldClauses.length; i++) {
            const fieldClause = fieldClauses[i].trim();
    
            // Default order is ascending (false)
            let order = false;
            let fieldName = fieldClause;
    
            // Check if the clause ends with DESC, indicating descending order
            if (fieldClause.toUpperCase().endsWith(' DESC')) {
                order = true;
                fieldName = fieldClause.substring(0, fieldClause.length - 5).trim();
            }
            // Check if the clause ends with ASC, and remove it
            else if (fieldClause.toUpperCase().endsWith(' ASC')) {
                fieldName = fieldClause.substring(0, fieldClause.length - 4).trim();
            }
    
            // Add the field name and order to the respective arrays
            fields.push(fieldName);
            orders.push(order);
        }
    
        // Return the arrays in an object
        return { fields: fields, desc: orders };
    }

    // --- END: Upgraded Query Engine Helpers ---


    // --- The DataMaster Class ---
    
    class DataMaster {
        /**
         * Constructor is simple, meant for internal use by the factories
         * @param {Array<Array>} table - 2D array of data
         * @param {Array<string>} fields - Field names
         * @param {Object} options - Configuration options
         */
        constructor(table, fields, options = {}) {
            // Initialize with safe defaults first
            this._table = [];
            this._fields = [];
            this._options = this._validateOptions(options);
            
            // Validate and set table
            if (Array.isArray(table)) {
                let validTable = true;
                for (let i = 0; i < table.length; i++) {
                    if (!Array.isArray(table[i])) {
                        validTable = false;
                        break;
                    }
                }
                if (validTable) {
                    this._table = table;
                }
            }
            
            // Validate and set fields
            if (Array.isArray(fields)) {
                this._fields = fields.map((field, index) => {
                    if (typeof field === 'string') {
                        return field;
                    }
                    return field !== null && field !== undefined ? field.toString() : 'Field' + index;
                });
            }
        }
        
        /**
         * Validates and normalizes options
         * @private
         */
        _validateOptions(options) {
            if (typeof options !== 'object' || options === null) {
                options = {};
            }
            
            const validErrorModes = ['standard', 'strict', 'silent'];
            const errorMode = validErrorModes.includes(options.errorMode) ? options.errorMode : 'standard';
            const onError = typeof options.onError === 'function' ? options.onError : null;
            
            return {
                errorMode,
                onError
            };
        }
        
        /**
         * Executes a programmatic filter (object or function) against the DataMaster data
         * @private
         * @param {Object|Function} filter - Object with field-value pairs for AND filtering, or function that receives row object
         * @returns {Object} Object with {success: boolean, table: Array<Array>, indices: Array<number>, error: string}
         */
        _executeProgrammaticFilter(filter) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return { success: false, table: [], indices: [], error: 'Invalid table or fields state' };
            }
            
            if (typeof filter === 'undefined' || filter === null) {
                return { success: false, table: [], indices: [], error: 'Filter parameter is required' };
            }
            
            try {
                const resultData = [];
                const resultIndices = [];
                
                if (typeof filter === 'function') {
                    // Function-based filtering
                    for (let i = 0; i < this._table.length; i++) {
                        if (!Array.isArray(this._table[i])) continue;
                        
                        const rowObject = this._fields.reduce((obj, field, index) => {
                            obj[field] = this._table[i][index];
                            return obj;
                        }, {});
                        
                        try {
                            if (filter(rowObject)) {
                                resultData.push([...this._table[i]]);
                                resultIndices.push(i);
                            }
                        } catch (filterError) {
                            continue;
                        }
                    }
                } else if (typeof filter === 'object' && filter !== null) {
                    // Object-based filtering (field-value pairs with AND logic)
                    const filterKeys = Object.keys(filter);
                    
                    for (let i = 0; i < this._table.length; i++) {
                        if (!Array.isArray(this._table[i])) continue;
                        
                        let rowMatches = true;
                        
                        for (const key of filterKeys) {
                            const fieldIndex = this._fields.indexOf(key);
                            if (fieldIndex === -1) {
                                rowMatches = false;
                                break;
                            }
                            
                            const cellValue = this._table[i][fieldIndex];
                            const filterValue = filter[key];
                            
                            if (!looseCaseInsensitiveCompare(cellValue, filterValue)) {
                                rowMatches = false;
                                break;
                            }
                        }
                        
                        if (rowMatches) {
                            resultData.push([...this._table[i]]);
                            resultIndices.push(i);
                        }
                    }
                } else {
                    return { success: false, table: [], indices: [], error: 'Filter must be an object or function' };
                }
                
                return { success: true, table: resultData, indices: resultIndices, error: null };
                
            } catch (error) {
                return { success: false, table: [], indices: [], error: 'Failed to execute programmatic filter: ' + error.message };
            }
        }

        /**
         * Executes a WHERE clause against the DataMaster data
         * @private
         * @param {string} clauseString - The WHERE clause to execute
         * @param {Object} [queryFunctions={}] - Custom query functions
         * @returns {Object} Object with {success: boolean, table: Array<Array>, indices: Array<number>, error: string}
         */
        _executeWhere(clauseString, queryFunctions = {}) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return { success: false, table: [], indices: [], error: 'Invalid table or fields state' };
            }
            
            if (typeof clauseString !== 'string') {
                return { success: false, table: [], indices: [], error: 'Clause string must be a string' };
            }
            
            if (clauseString.length === 0) {
                return { success: false, table: [], indices: [], error: 'Clause string cannot be empty' };
            }
            
            try {
                // Run the expansion for the * operator
                let query = expandAllFields(clauseString, this._fields);
                const resultData = [];
                const resultIndices = [];
                
                // Convert field names to array indices
                for (let i = 0; i < this._fields.length; i++) {
                    const fieldName = this._fields[i];
                    // Use a regex that captures the field name and any of the valid operators that follow it.
                    // The \b ensures we match whole words only, preventing "ID" from matching "ORDER BY ID".
                    const regex = new RegExp(`\\b${fieldName}\\b(\\s*(?:>=|<=|!=|=|>|<))`, 'g');
                    query = query.replace(regex, `${i}$1`);
                }
                // Loop through the data and add matches to the result
                for (let d = 0; d < this._table.length; d++) {
                    if (!Array.isArray(this._table[d])) {
                        continue; // Skip invalid rows
                    }
                    // Convert the query into a string of boolean logic
                    const booleanExpression = replaceAndEvaluateExpressions(
                        this._table[d], 
                        this._fields, 
                        query, 
                        queryFunctions
                    );
                    
                    // Check if replaceAndEvaluateExpressions returned an error
                    if (booleanExpression.startsWith('ERROR_')) {
                        // Return error immediately instead of continuing
                        let errorMessage = 'Query evaluation failed';
                        if (booleanExpression === 'ERROR_UNQUOTED_VALUE') {
                            errorMessage = 'Query syntax error: Values must be quoted (e.g., field=\'value\' not field=value)';
                        }
                        return { 
                            success: false, 
                            table: [], 
                            indices: [], 
                            error: errorMessage 
                        };
                    }
                    
                    // Evaluate the entire expression
                    const result = evaluateNestedExpression(booleanExpression);
                    
                    // If the result is true, add that row to the result
                    if (result === 'true') {
                        resultData.push([...this._table[d]]); // Add a copy of the row
                        resultIndices.push(d);
                    }
                }
                
                return { success: true, table: resultData, indices: resultIndices, error: null };
                
            } catch (error) {
                return { success: false, table: [], indices: [], error: 'Failed to execute WHERE clause: ' + error.message };
            }
        }
        
        /**
         * Central error handler - THE ONLY PLACE WHERE ERRORS ARE THROWN
         * @private
         * @param {string} errorMessage - The error message
         * @param {string} errorType - The type of error ('UserError', 'InternalError', etc.)
         * @param {string} returnTypeHint - Hint for return type ('DataMaster', 'Array', 'String', 'Primitive')
         */
        _handleError(errorMessage, errorType = 'UserError', returnTypeHint = 'DataMaster') {
            const errorObject = {
                message: errorMessage,
                type: errorType,
                timestamp: new Date().toISOString()
            };
            
            // Call the onError callback if provided
            if (this._options.onError) {
                try {
                    this._options.onError(errorObject);
                } catch (callbackError) {
                    console.error('Error in onError callback:', callbackError.message);
                }
            }
            
            // Define catastrophic error types that always throw regardless of errorMode
            const catastrophicErrorTypes = [
                'InternalError',
                'StateCorruption', 
                'LogicError',
                'CriticalError',
                'NullReference'
            ];
            
            // For catastrophic errors, always throw regardless of errorMode
            if (catastrophicErrorTypes.includes(errorType)) {
                throw new Error(`CRITICAL: ${errorMessage} (${errorType})`);
            }
            
            // For user errors, handle based on configured errorMode
            switch (this._options.errorMode) {
                case 'strict':
                    throw new Error(errorMessage);
                    
                case 'silent':
                    console.error(errorMessage);
                    return this._createErrorValueByType(errorType, errorMessage, returnTypeHint);
                    
                case 'standard':
                default:
                    return this._createErrorValueByType(errorType, errorMessage, returnTypeHint);
            }
        }
        
        /**
         * Creates an error value based on the expected return type
         * @private
         * @param {string} errorType - The type of error
         * @param {string} errorMessage - The error message
         * @param {string} returnTypeHint - The expected return type
         */
        _createErrorValueByType(errorType, errorMessage, returnTypeHint) {
            switch (returnTypeHint) {
                case 'DataMaster':
                    return new DataMaster(
                        [[errorType, errorMessage]],
                        ['ErrorType', 'Message'],
                        this._options
                    );
                    
                case 'Array':
                    return [{ ErrorType: errorType, Message: errorMessage }];
                    
                case 'String':
                    // Return a properly formatted CSV error string
                    const escapedType = errorType.replace(/"/g, '""');
                    const escapedMessage = errorMessage.replace(/"/g, '""');
                    return `"${escapedType}","${escapedMessage}"`;
                    
                case 'Primitive':
                default:
                    return null;
            }
        }
        
        // --- Static Factory Methods ---
        
        /**
         * Creates a DataMaster from a recordset (array of objects)
         * @param {Array<Object>} recordset - Array of objects
         * @param {Object} options - Configuration options
         * @returns {DataMaster} New DataMaster instance
         */
        static fromRecordset(recordset, options = {}) {
            const dm = new DataMaster([], [], options);
            
            if (!Array.isArray(recordset)) {
                return dm._handleError('Input must be an array', 'UserError', 'DataMaster');
            }
            
            const result = recordsetToTable(recordset);
            if (result.error) {
                return dm._handleError(result.message, 'UserError', 'DataMaster');
            }
            
            return new DataMaster(result.table, result.fields, options);
        }
        
        /**
         * Creates a DataMaster from a table (2D array)
         * @param {Array<Array>} table - 2D array of data
         * @param {Object} options - Configuration options including headers
         * @returns {DataMaster} New DataMaster instance
         */
        static fromTable(table, options = {}) {
            const dm = new DataMaster([], [], options);
            
            if (!Array.isArray(table)) {
                return dm._handleError('Input must be an array', 'UserError', 'DataMaster');
            }
            
            let fields = options.headers || [];
            let dataTable = table;
            
            if (options.headersInFirstRow && table.length > 0) {
                if (!Array.isArray(table[0])) {
                    return dm._handleError('First row must be an array when headersInFirstRow is true', 'UserError', 'DataMaster');
                }
                fields = table[0];
                dataTable = table.slice(1);
            } else if (fields.length === 0 && table.length > 0) {
                if (!Array.isArray(table[0])) {
                    return dm._handleError('First row must be an array', 'UserError', 'DataMaster');
                }
                // Generate numeric field names
                for (let i = 0; i < table[0].length; i++) {
                    fields.push(i.toString());
                }
            }
            
            return new DataMaster(dataTable, fields, options);
        }
        
        /**
         * Creates a DataMaster from CSV string
         * @param {string} csvString - CSV data as string
         * @param {Object} options - Configuration options
         * @returns {DataMaster} New DataMaster instance
         */
        static fromCsv(csvString, options = {}) {
            const dm = new DataMaster([], [], options);
            
            if (typeof csvString !== 'string') {
                return dm._handleError('Input must be a string', 'UserError', 'DataMaster');
            }
            
            const result = csvToTable(csvString, options);
            if (result.error) {
                return dm._handleError(result.message, 'UserError', 'DataMaster');
            }
            
            return new DataMaster(result.table, result.fields, options);
        }
        
        
        // --- Pure Serialization Methods (Non-Mutating) ---
        
        /**
         * Converts DataMaster to recordset format
         * @returns {Array<Object>} Array of objects
         */
        toRecordset() {
            const result = tableToRecordset(this._table, this._fields);
            if (result.error) {
                return this._handleError(result.message, 'InternalError', 'Array');
            }
            return result;
        }
        
        /**
         * Converts DataMaster to table format
         * @param {Object} options - Export options
         * @returns {Array<Array>} 2D array with optional headers
         */
        toTable(options = {}) {
            if (typeof options !== 'object' || options === null) {
                options = {};
            }
            
            const tableCopy = deepCopy(this._table);
            if (tableCopy.error) {
                return this._handleError(tableCopy.message, 'InternalError', 'Array');
            }
            
            if (options.includeHeaders) {
                const fieldsCopy = deepCopy(this._fields);
                if (fieldsCopy.error) {
                    return this._handleError(fieldsCopy.message, 'InternalError', 'Array');
                }
                return [fieldsCopy, ...tableCopy];
            }
            
            return tableCopy;
        }
        
        /**
         * Converts DataMaster to CSV string
         * @param {Object} options - Export options
         * @returns {string} CSV formatted string
         */
        toCsv(options = {}) {
            if (typeof options !== 'object' || options === null) {
                options = {};
            }
            
            const result = tableToCsv(this._table, this._fields, options);
            if (result.error) {
                return this._handleError(result.message, 'InternalError', 'String');
            }
            return result;
        }
        
        // --- Data Extraction Methods (Non-Mutating) ---
        
        /**
         * Returns the number of rows in the DataMaster
         * @returns {number} Number of rows
         */
        length() {
            if (!Array.isArray(this._table)) {
                return this._handleError('Invalid table state', 'StateError', 'Primitive');
            }
            return this._table.length;
        }
        
        /**
         * Returns a copy of the field names
         * @returns {Array<string>} Array of field names
         */
        fields() {
            if (!Array.isArray(this._fields)) {
                return this._handleError('Invalid fields state', 'StateError', 'Array');
            }
            const result = deepCopy(this._fields);
            if (result.error) {
                return this._handleError(result.message, 'InternalError', 'Array');
            }
            return result;
        }
        
        /**
         * Returns a single column from the DataMaster
         * @param {string|number} column - The column name or index to return
         * @param {boolean} [distinct=false] - Whether to return only unique values
         * @returns {Array} Array of column values or error indicator
         */
        getColumn(column, distinct = false) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', 'Array');
            }
            
            if (this._table.length === 0) {
                return [];
            }
            
            let columnIndex;
            
            // Handle column parameter
            if (typeof column === 'number') {
                if (column < 0 || column >= this._fields.length) {
                    return this._handleError('Column index out of bounds', 'UserError', 'Array');
                }
                columnIndex = column;
            } else if (typeof column === 'string') {
                columnIndex = this._fields.indexOf(column);
                if (columnIndex === -1) {
                    return this._handleError(`Column '${column}' not found`, 'UserError', 'Array');
                }
            } else {
                return this._handleError('Column must be a string or number', 'UserError', 'Array');
            }
            
            // Use the utility function to get the column
            const result = getTableColumn(this._table, columnIndex, distinct);
            
            // Return a deep copy to prevent external modification
            const resultCopy = deepCopy(result);
            if (resultCopy.error) {
                return this._handleError(resultCopy.message, 'InternalError', 'Array');
            }
            
            return resultCopy;
        }
        
        /**
         * Returns a single row from the DataMaster
         * @param {number} rowIndex - The row index to return
         * @param {('array'|'object'|'recordset'|'recordtable')} [style='array'] - The return format
         * @param {string|number} [idField] - If provided, search for row by ID instead of index
         * @returns {Array|Object|Array<Object>|Object} Row data in specified format or error indicator
         */
        getRow(rowIndex, style = 'array', idField = null) {
            // Determine return type hint based on style
            let returnTypeHint = 'Array'; // Default for 'array' style
            switch (style.toLowerCase()) {
                case 'recordset':
                    returnTypeHint = 'Array';
                    break;
                case 'object':
                case 'recordtable':
                    returnTypeHint = 'Primitive'; // Objects can't be represented as error data easily
                    break;
                default:
                    returnTypeHint = 'Array';
            }
            
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', returnTypeHint);
            }
            
            if (this._table.length === 0) {
                return this._handleError('Table is empty', 'UserError', returnTypeHint);
            }
            
            let actualRowIndex = rowIndex;
            
            // Handle ID-based row lookup
            if (idField !== null && idField !== undefined) {
                const idColumnIndex = typeof idField === 'number' ? idField : this._fields.indexOf(idField);
                
                if (idColumnIndex === -1) {
                    return this._handleError(`ID field '${idField}' not found`, 'UserError', returnTypeHint);
                }
                
                // Search for the row with matching ID
                let rowFound = false;
                for (let i = 0; i < this._table.length; i++) {
                    if (this._table[i] && this._table[i][idColumnIndex] == rowIndex) { // Soft comparison
                        actualRowIndex = i;
                        rowFound = true;
                        break;
                    }
                }
                
                if (!rowFound) {
                    return this._handleError(`Row with ID '${rowIndex}' not found`, 'UserError', returnTypeHint);
                }
            } else {
                // Validate row index
                if (typeof rowIndex !== 'number' || rowIndex < 0 || rowIndex >= this._table.length) {
                    return this._handleError('Row index out of bounds', 'UserError', returnTypeHint);
                }
            }
            
            // Get the row using the utility function
            const rowData = getTableRow(this._table, actualRowIndex);
            if (rowData === null) {
                return this._handleError('Failed to retrieve row data', 'InternalError', returnTypeHint);
            }
            
            // Return based on requested style
            switch (style.toLowerCase()) {
                case 'array':
                    return rowData;
                    
                case 'object':
                    const obj = {};
                    for (let i = 0; i < this._fields.length && i < rowData.length; i++) {
                        obj[this._fields[i]] = rowData[i];
                    }
                    return obj;
                    
                case 'recordset':
                    const recordset = [];
                    const record = {};
                    for (let i = 0; i < this._fields.length && i < rowData.length; i++) {
                        record[this._fields[i]] = rowData[i];
                    }
                    recordset.push(record);
                    return recordset;
                    
                case 'recordtable':
                    return {
                        fields: [...this._fields],
                        table: [rowData]
                    };
                    
                default:
                    return this._handleError(`Unknown return style '${style}'`, 'UserError', returnTypeHint);
            }
        }
        
        /**
         * Gets the value of a single cell
         * @param {number} row - The row index
         * @param {string|number} column - The column name or index
         * @returns {*} The cell value or error indicator
         */
        getCell(row, column) {
            // Validate row parameter
            if (typeof row !== 'number' || row < 0 || row >= this._table.length) {
                return this._handleError('Row index out of bounds', 'UserError', 'Primitive');
            }
            
            let columnIndex;
            
            // Handle column parameter
            if (typeof column === 'number') {
                if (column < 0 || column >= this._fields.length) {
                    return this._handleError('Column index out of bounds', 'UserError', 'Primitive');
                }
                columnIndex = column;
            } else if (typeof column === 'string') {
                columnIndex = this._fields.indexOf(column);
                if (columnIndex === -1) {
                    return this._handleError(`Column '${column}' not found`, 'UserError', 'Primitive');
                }
            } else {
                return this._handleError('Column must be a string or number', 'UserError', 'Primitive');
            }
            
            // Validate that the row exists and has the expected structure
            if (!Array.isArray(this._table[row])) {
                return this._handleError('Invalid row structure', 'InternalError', 'Primitive');
            }
            
            // Return the cell value (could be undefined, null, or any value)
            return this._table[row][columnIndex];
        }
        
        /**
         * Creates a deep copy of this DataMaster instance
         * @returns {DataMaster} New DataMaster instance
         */
        clone() {
            const tableCopy = deepCopy(this._table);
            if (tableCopy.error) {
                return this._handleError(tableCopy.message, 'InternalError', 'DataMaster');
            }
            
            const fieldsCopy = deepCopy(this._fields);
            if (fieldsCopy.error) {
                return this._handleError(fieldsCopy.message, 'InternalError', 'DataMaster');
            }
            
            return new DataMaster(tableCopy, fieldsCopy, this._options);
        }
        
        /**
         * Exports a string representation of the DataMaster
         * @param {boolean} [consoleMode=false] - true is meant for console output false is meant for html
         * @returns {string} String representation of the DataMaster
         */
        debug(consoleMode = false) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', 'String');
            }
            
            // Set formatting based on console mode
            const newline = consoleMode ? '\r\n' : '<br>';
            const space = consoleMode ? ' ' : '&nbsp;';
            
            /**
             * Left-pads a value to a specified length
             * @param {*} value - Value to pad
             * @param {number} length - Target length
             * @returns {string} Padded string
             */
            function lPad(value, length) {
                if (typeof value === 'number') { 
                    value = value.toString(); 
                }
                if (typeof value !== 'string') {
                    value = new Array(length + 1).join(space);
                } else {
                    if (value.length < length) {
                        for (let c = value.length; c < length; c++) {
                            value += space;
                        }
                    }
                }
                return value;
            }
            
            // Calculate column widths
            const pads = [];
            let val = '';
            
            // Initialize with field name lengths
            for (let i = 0; i < this._fields.length; i++) {
                pads[i] = this._fields[i].length;
            }
            
            // Find maximum width for each column
            for (let r = 0; r < this._table.length; r++) {
                for (let c = 0; c < this._fields.length; c++) {
                    val = this._table[r][c];
                    if (val === true) { val = 'true'; }
                    else if (val === false) { val = 'false'; }
                    else if (val === null) { val = 'null'; }
                    else if (typeof val === 'undefined') { val = 'undefined'; }
                    if (val.toString().length > pads[c]) { 
                        pads[c] = val.toString().length; 
                    }
                }
            }
            
            // Build the output string
            let out = newline;
            out += '--|';
            for (let f = 0; f < this._fields.length; f++) {
                out += lPad(this._fields[f], pads[f]) + '|';
            }
            out += newline;
            
            for (let row = 0; row < this._table.length; row++) {
                out += row + (row < 10 ? ' |' : '|');
                for (let col = 0; col < this._table[row].length; col++) {
                    val = this._table[row][col];
                    if (val === true) { val = 'true'; }
                    else if (val === false) { val = 'false'; }
                    else if (val === null) { val = 'null'; }
                    else if (typeof val === 'undefined') { val = 'undefined'; }
                    out += lPad(val, pads[col]) + '|';
                }
                out += newline;
            }
            
            return out;
        }
        
        /**
         * Exports a string representation of the DataMaster (alias for debug)
         * @param {boolean} [consoleMode=false] - true is meant for console output false is meant for html
         * @returns {string} String representation of the DataMaster
         */
        print(consoleMode = false) {
            return this.debug(consoleMode);
        }
        
        /**
         * Pivots the table (transposes rows and columns)
         * NOTE: This function assumes that your table data has row headers, because that's what the new
         * columns will be called. Add row headers using addColumn if necessary before running this.
         * @returns {DataMaster} this for chaining
         */
        pivot() {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', 'DataMaster');
            }
            
            if (this._table.length === 0) {
                return this._handleError('Cannot pivot empty table', 'UserError', 'DataMaster');
            }
            
            if (this._fields.length < 2) {
                return this._handleError('Cannot pivot table with less than 2 columns', 'UserError', 'DataMaster');
            }
            
            try {
                const pivot = {
                    table: [],
                    fields: []
                };
                
                // Create the full pivoted table structure
                // We skip the first column (length-1) because it becomes row headers
                for (let f = 0; f < this._fields.length - 1; f++) {
                    const data = [];
                    // Create a blank row with length+1 because we need a spot for the fields to become row headers
                    for (let r = 0; r < this._table.length + 1; r++) {
                        data.push(null); // Use null instead of 'XXX' for better data integrity
                    }
                    pivot.table.push(data);
                }
                
                // The new fields will be the first column values
                pivot.fields = getTableColumn(this._table, 0);
                pivot.fields.unshift(this._fields[0]); // Keep the first column header
                
                // Place the fields into the first column of the new table
                for (let r = 0; r < this._fields.length - 1; r++) {
                    pivot.table[r][0] = this._fields[r + 1]; // Skip first field
                }
                
                // Fill in the data
                for (let c = 0; c < this._fields.length - 1; c++) { // Skip the first column as that's now field names
                    for (let r = 0; r < this._table.length; r++) {
                        // Add 1 to the _table column so we skip the field names
                        // Add 1 to the pivot.table row because we've already put in the row headers
                        // which aren't in the original table data
                        if (this._table[r] && this._table[r][c + 1] !== undefined) {
                            pivot.table[c][r + 1] = this._table[r][c + 1];
                        }
                    }
                }
                
                // Update the internal state
                this._table = pivot.table;
                this._fields = pivot.fields;
                
                return this; // For chaining
                
            } catch (error) {
                return this._handleError('Pivot operation failed: ' + error.message, 'InternalError', 'DataMaster');
            }
        }
        
        // --- Placeholder comments for other methods ---
        
        // --- Mutating Methods (return this) ---
        
        /**
         * Adds a row to the DataMaster
         * @param {Array|Object} data - The row data as array or object
         * @param {number} [location] - The index at which to place the new row, shifting existing rows
         * @returns {DataMaster} this for chaining
         */
        addRow(data, location) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', 'DataMaster');
            }
            
            if (typeof data === 'undefined') {
                data = [];
            }
            
            let cleanRow;
            
            try {
                if (!Array.isArray(data)) {
                    // Assume an object was passed - convert to array format
                    cleanRow = new Array(this._fields.length);
                    
                    // Initialize with nulls
                    for (let c = 0; c < cleanRow.length; c++) {
                        cleanRow[c] = null;
                    }
                    
                    // Fill the array from the object using field names
                    if (typeof data === 'object' && data !== null) {
                        Object.keys(data).forEach(key => {
                            const fieldIndex = this._fields.indexOf(key);
                            if (fieldIndex !== -1) {
                                cleanRow[fieldIndex] = data[key];
                            }
                        });
                    }
                } else {
                    // Array was passed - validate and adjust length
                    cleanRow = [...data]; // Create a copy
                    
                    // Trim if too long
                    if (cleanRow.length > this._fields.length) {
                        cleanRow = cleanRow.slice(0, this._fields.length);
                    } else if (cleanRow.length < this._fields.length) {
                        // Pad with nulls if too short
                        for (let i = cleanRow.length; i < this._fields.length; i++) {
                            cleanRow.push(null);
                        }
                    }
                }
                
                // Handle location parameter
                if (typeof location === 'number') {
                    // Ensure location is in bounds
                    if (location < 0) location = 0;
                    if (location > this._table.length) location = this._table.length;
                    
                    // Insert at specified location
                    this._table.splice(location, 0, cleanRow);
                } else {
                    // Add to end if location not specified
                    this._table.push(cleanRow);
                }
                
            } catch (error) {
                return this._handleError('Failed to add row: ' + error.message, 'InternalError', 'DataMaster');
            }
            
            return this; // For chaining
        }
        
        /**
         * Removes a row from the DataMaster
         * @param {number} index - Index of the row to remove
         * @returns {DataMaster} this for chaining
         */
        removeRow(index) {
            if (!Array.isArray(this._table)) {
                return this._handleError('Invalid table state', 'StateError', 'DataMaster');
            }
            
            if (typeof index !== 'number') {
                return this._handleError('Row index must be a number', 'UserError', 'DataMaster');
            }
            
            if (index < 0 || index >= this._table.length) {
                return this._handleError('Row index out of bounds', 'UserError', 'DataMaster');
            }
            
            try {
                this._table.splice(index, 1);
            } catch (error) {
                return this._handleError('Failed to remove row: ' + error.message, 'InternalError', 'DataMaster');
            }
            
            return this; // For chaining
        }
        
        /**
         * Adds a new column to the DataMaster
         * @param {string} name - The column/field name
         * @param {Array} [data] - The data to add. If undefined, nulls will be added
         * @param {string|number} [location] - Index or fieldname to place the column
         * @returns {DataMaster} this for chaining
         */
        addColumn(name, data, location) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', 'DataMaster');
            }
            
            if (typeof name !== 'string') {
                return this._handleError('Column name must be a string', 'UserError', 'DataMaster');
            }
            
            if (typeof data === 'undefined') {
                data = [];
            }
            
            if (!Array.isArray(data)) {
                return this._handleError('Column data must be an array', 'UserError', 'DataMaster');
            }
            
            try {
                // Create a properly sized column with the provided data
                const cleanColumn = data.slice(0, this._table.length);
                
                // Pad with nulls if data is shorter than table
                if (cleanColumn.length < this._table.length) {
                    for (let i = cleanColumn.length; i < this._table.length; i++) {
                        cleanColumn.push(null);
                    }
                }
                
                // Handle location parameter
                if (typeof location !== 'undefined') {
                    let insertIndex;
                    
                    if (typeof location === 'number') {
                        insertIndex = location;
                    } else if (typeof location === 'string') {
                        insertIndex = this._fields.indexOf(location);
                        if (insertIndex === -1) {
                            return this._handleError(`Location field '${location}' not found`, 'UserError', 'DataMaster');
                        }
                    } else {
                        return this._handleError('Location must be a string or number', 'UserError', 'DataMaster');
                    }
                    
                    // Ensure insertIndex is in bounds
                    if (insertIndex < 0) insertIndex = 0;
                    if (insertIndex > this._fields.length) insertIndex = this._fields.length;
                    
                    // Insert field name
                    this._fields.splice(insertIndex, 0, name);
                    
                    // Insert data into each row
                    for (let r = 0; r < this._table.length; r++) {
                        this._table[r].splice(insertIndex, 0, cleanColumn[r]);
                    }
                } else {
                    // Add to end if location not specified
                    this._fields.push(name);
                    
                    // Add data to end of each row
                    for (let r = 0; r < this._table.length; r++) {
                        this._table[r].push(cleanColumn[r]);
                    }
                }
                
            } catch (error) {
                return this._handleError('Failed to add column: ' + error.message, 'InternalError', 'DataMaster');
            }
            
            return this; // For chaining
        }
        
        /**
         * Removes a column from the DataMaster
         * @param {string|number} column - The column name or index to remove
         * @returns {DataMaster} this for chaining
         */
        removeColumn(column) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', 'DataMaster');
            }
            
            let columnIndex;
            
            // Handle column parameter
            if (typeof column === 'number') {
                if (column < 0 || column >= this._fields.length) {
                    return this._handleError('Column index out of bounds', 'UserError', 'DataMaster');
                }
                columnIndex = column;
            } else if (typeof column === 'string') {
                columnIndex = this._fields.indexOf(column);
                if (columnIndex === -1) {
                    return this._handleError(`Column '${column}' not found`, 'UserError', 'DataMaster');
                }
            } else {
                return this._handleError('Column must be a string or number', 'UserError', 'DataMaster');
            }
            
            try {
                // Remove field name
                this._fields.splice(columnIndex, 1);
                
                // Remove data from each row
                for (let r = 0; r < this._table.length; r++) {
                    this._table[r].splice(columnIndex, 1);
                }
                
            } catch (error) {
                return this._handleError('Failed to remove column: ' + error.message, 'InternalError', 'DataMaster');
            }
            
            return this; // For chaining
        }
        
        /**
         * Modifies a cell value
         * @param {number} row - The row index
         * @param {string|number} column - The column name or index
         * @param {*} value - The new value for the cell
         * @returns {DataMaster} this for chaining
         */
        modifyCell(row, column, value) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', 'DataMaster');
            }
            
            // Validate row parameter
            if (typeof row !== 'number') {
                return this._handleError('Row index must be a number', 'UserError', 'DataMaster');
            }
            
            if (row < 0 || row >= this._table.length) {
                return this._handleError('Row index out of bounds', 'UserError', 'DataMaster');
            }
            
            let columnIndex;
            
            // Handle column parameter
            if (typeof column === 'number') {
                if (column < 0 || column >= this._fields.length) {
                    return this._handleError('Column index out of bounds', 'UserError', 'DataMaster');
                }
                columnIndex = column;
            } else if (typeof column === 'string') {
                columnIndex = this._fields.indexOf(column);
                if (columnIndex === -1) {
                    return this._handleError(`Column '${column}' not found`, 'UserError', 'DataMaster');
                }
            } else {
                return this._handleError('Column must be a string or number', 'UserError', 'DataMaster');
            }
            
            // Validate that the row exists and has the expected structure
            if (!Array.isArray(this._table[row])) {
                return this._handleError('Invalid row structure', 'InternalError', 'DataMaster');
            }
            
            try {
                // Modify the cell value
                this._table[row][columnIndex] = value;
            } catch (error) {
                return this._handleError('Failed to modify cell: ' + error.message, 'InternalError', 'DataMaster');
            }
            
            return this; // For chaining
        }
        /**
         * Formats the cells in a column based on a formatting function
         * This is an in-place replacement of the original data
         * @param {string|number} column - The column name or index to format
         * @param {function} formatFn - Function to modify/format the data
         * @returns {DataMaster} this for chaining
         */
        formatColumn(column, formatFn) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', 'DataMaster');
            }
            
            if (typeof formatFn !== 'function') {
                return this._handleError('Format function must be a function', 'UserError', 'DataMaster');
            }
            
            let columnIndex;
            
            // Handle column parameter
            if (typeof column === 'number') {
                if (column < 0 || column >= this._fields.length) {
                    return this._handleError('Column index out of bounds', 'UserError', 'DataMaster');
                }
                columnIndex = column;
            } else if (typeof column === 'string') {
                columnIndex = this._fields.indexOf(column);
                if (columnIndex === -1) {
                    return this._handleError(`Column '${column}' not found`, 'UserError', 'DataMaster');
                }
            } else {
                return this._handleError('Column must be a string or number', 'UserError', 'DataMaster');
            }
            
            try {
                // Apply formatting function to each cell in the column
                for (let row = 0; row < this._table.length; row++) {
                    if (!Array.isArray(this._table[row])) {
                        continue; // Skip invalid rows
                    }
                    
                    try {
                        // Apply the formatting function to the cell value
                        this._table[row][columnIndex] = formatFn(this._table[row][columnIndex]);
                    } catch (formatError) {
                        // Continue processing other cells if one formatting fails
                        // This maintains the original behavior of silently handling format errors
                        continue;
                    }
                }
            } catch (error) {
                return this._handleError('Failed to format column: ' + error.message, 'InternalError', 'DataMaster');
            }
            
            return this; // For chaining
        }
        
        /**
         * Formats the cells in a row based on a formatting function
         * This is an in-place replacement of the original data
         * @param {number} row - The row index to format
         * @param {function} formatFn - Function to modify/format the data
         * @returns {DataMaster} this for chaining
         */
        formatRow(row, formatFn) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', 'DataMaster');
            }
            
            if (typeof formatFn !== 'function') {
                return this._handleError('Format function must be a function', 'UserError', 'DataMaster');
            }
            
            if (typeof row !== 'number') {
                return this._handleError('Row index must be a number', 'UserError', 'DataMaster');
            }
            
            if (row < 0 || row >= this._table.length) {
                return this._handleError('Row index out of bounds', 'UserError', 'DataMaster');
            }
            
            // Validate that the row exists and has the expected structure
            if (!Array.isArray(this._table[row])) {
                return this._handleError('Invalid row structure', 'InternalError', 'DataMaster');
            }
            
            try {
                // Apply formatting function to each cell in the row
                for (let col = 0; col < this._table[row].length; col++) {
                    try {
                        // Apply the formatting function to the cell value
                        this._table[row][col] = formatFn(this._table[row][col]);
                    } catch (formatError) {
                        // Continue processing other cells if one formatting fails
                        // This maintains the original behavior of silently handling format errors
                        continue;
                    }
                }
            } catch (error) {
                return this._handleError('Failed to format row: ' + error.message, 'InternalError', 'DataMaster');
            }
            
            return this; // For chaining
        }
        /**
         * Sorts the DataMaster by one or more fields
         * @param {string|number|Array<string|number>} fields - Field name(s) or index(es) to sort by
         * @param {boolean|Array<boolean>} [directions=false] - Sort direction(s): true = descending, false = ascending
         * @param {Function|Array<Function>} [primers] - Optional transformation function(s) for sorting
         * @returns {DataMaster} this for chaining
         */
        sort(fields, directions, primers) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', 'DataMaster');
            }
            
            if (this._table.length <= 1) {
                return this; // Nothing to sort or single row
            }
            
            if (typeof fields === 'undefined') {
                return this._handleError('Fields parameter is required for sorting', 'UserError', 'DataMaster');
            }
            
            // Normalize inputs to arrays
            let fieldsArray = Array.isArray(fields) ? fields : [fields];
            let directionsArray = Array.isArray(directions) ? directions : [directions || false];
            let primersArray = Array.isArray(primers) ? primers : [primers];
            
            if (fieldsArray.length === 0) {
                return this._handleError('At least one field must be specified for sorting', 'UserError', 'DataMaster');
            }
            
            // Ensure directions array matches fields length
            while (directionsArray.length < fieldsArray.length) {
                directionsArray.push(false); // Default to ascending
            }
            
            // Ensure primers array matches fields length (if any primers provided)
            if (primers) {
                while (primersArray.length < fieldsArray.length) {
                    primersArray.push(null); // Fill with null for missing primers
                }
            } else {
                primersArray = new Array(fieldsArray.length).fill(null);
            }
            
            try {
                // Validate and convert field references to column indexes
                const validation = validateAndConvertFields(this._fields, fieldsArray);
                if (!validation.success) {
                    return this._handleError(validation.error, 'UserError', 'DataMaster');
                }
                
                // Create the comparator function
                const comparator = multiFieldSort(validation.indexes, directionsArray, primersArray);
                
                // Sort the table in place
                this._table.sort(comparator);
                
            } catch (error) {
                return this._handleError('Failed to sort table: ' + error.message, 'InternalError', 'DataMaster');
            }
            
            return this; // For chaining
        }
        
        /**
         * Sums column values and adds a summary row
         * @param {Object} [options] - Configuration options
         * @param {string} [options.label] - Label for the summary row (placed in first column)
         * @param {Array<string|number>} [options.columns] - Columns to sum (default: all numeric columns)
         * @param {boolean} [options.isAverage=false] - Calculate averages instead of sums
         * @param {*} [options.nanValue] - Value to use for non-numeric results
         * @returns {DataMaster} this for chaining
         */
        sumColumns(options = {}) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', 'DataMaster');
            }
            
            if (this._table.length === 0) {
                return this._handleError('Cannot sum columns of empty table', 'UserError', 'DataMaster');
            }
            
            if (this._fields.length === 0) {
                return this._handleError('Cannot sum columns without field definitions', 'UserError', 'DataMaster');
            }
            
            try {
                const { label, columns, isAverage = false, nanValue } = options;
                
                // Determine which columns to sum
                let columnsToSum = columns;
                if (!columnsToSum) {
                    // Default to all columns except first if label exists
                    columnsToSum = [];
                    const startIndex = typeof label === 'string' ? 1 : 0;
                    for (let i = startIndex; i < this._fields.length; i++) {
                        columnsToSum.push(i);
                    }
                }
                
                // Validate and convert column references to indexes
                const validation = validateAndConvertFields(this._fields, columnsToSum);
                if (!validation.success) {
                    return this._handleError(validation.error, 'UserError', 'DataMaster');
                }
                
                const columnIndexes = validation.indexes;
                
                // Initialize sums array with nulls
                const sums = new Array(this._fields.length).fill(null);
                const avgCounts = new Array(this._fields.length).fill(0);
                
                // Set label in first column if provided
                if (typeof label === 'string') {
                    sums[0] = label;
                }
                
                // Calculate sums for specified columns
                for (let c = 0; c < columnIndexes.length; c++) {
                    const columnIndex = columnIndexes[c];
                    let sum = 0;
                    let count = 0;
                    
                    for (let r = 0; r < this._table.length; r++) {
                        if (!Array.isArray(this._table[r])) {
                            continue; // Skip invalid rows
                        }
                        
                        const cellValue = this._table[r][columnIndex];
                        const numValue = parseFloat(cellValue);
                        
                        if (!isNaN(numValue) && isFinite(numValue)) {
                            sum += numValue;
                            count++;
                        }
                    }
                    
                    // Store result
                    if (count > 0) {
                        sums[columnIndex] = isAverage ? sum / count : sum;
                        avgCounts[columnIndex] = count;
                    } else {
                        sums[columnIndex] = isAverage ? 0 : 0;
                    }
                }
                
                // Handle NaN values if specified
                if (typeof nanValue !== 'undefined') {
                    for (let i = 0; i < sums.length; i++) {
                        if (typeof sums[i] === 'number' && isNaN(sums[i])) {
                            sums[i] = nanValue;
                        }
                    }
                }
                
                // Add the summary row
                this.addRow(sums);
                
            } catch (error) {
                return this._handleError('Failed to sum columns: ' + error.message, 'InternalError', 'DataMaster');
            }
            
            return this; // For chaining
        }
        
        /**
         * Sums row values and adds a summary column
         * @param {Object} [options] - Configuration options
         * @param {string} [options.label='Total'] - Label for the summary column
         * @param {Array<number>} [options.rows] - Row indexes to sum (default: all rows)
         * @param {boolean} [options.isAverage=false] - Calculate averages instead of sums
         * @param {*} [options.nanValue] - Value to use for non-numeric results
         * @returns {DataMaster} this for chaining
         */
        sumRows(options = {}) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', 'DataMaster');
            }
            
            if (this._table.length === 0) {
                return this._handleError('Cannot sum rows of empty table', 'UserError', 'DataMaster');
            }
            
            try {
                const { label = 'Total', rows, isAverage = false, nanValue } = options;
                
                // Determine which rows to sum
                let rowsToSum = rows;
                if (!rowsToSum) {
                    // Default to all rows
                    rowsToSum = [];
                    for (let i = 0; i < this._table.length; i++) {
                        rowsToSum.push(i);
                    }
                }
                
                // Validate row indexes
                for (let r = 0; r < rowsToSum.length; r++) {
                    const rowIndex = rowsToSum[r];
                    if (typeof rowIndex !== 'number' || rowIndex < 0 || rowIndex >= this._table.length) {
                        return this._handleError(`Row index ${rowIndex} is out of bounds`, 'UserError', 'DataMaster');
                    }
                }
                
                // Initialize sums array
                const sums = new Array(this._table.length).fill(null);
                const avgCounts = new Array(this._table.length).fill(0);
                
                // Calculate row sums
                for (let r = 0; r < rowsToSum.length; r++) {
                    const rowIndex = rowsToSum[r];
                    
                    if (!Array.isArray(this._table[rowIndex])) {
                        sums[rowIndex] = null;
                        continue;
                    }
                    
                    let sum = 0;
                    let count = 0;
                    
                    for (let c = 0; c < this._table[rowIndex].length; c++) {
                        const cellValue = this._table[rowIndex][c];
                        const numValue = parseFloat(cellValue);
                        
                        if (!isNaN(numValue) && isFinite(numValue)) {
                            sum += numValue;
                            count++;
                        }
                    }
                    
                    // Store result
                    if (count > 0) {
                        sums[rowIndex] = isAverage ? sum / count : sum;
                        avgCounts[rowIndex] = count;
                    } else {
                        sums[rowIndex] = isAverage ? 0 : 0;
                    }
                }
                
                // Handle NaN values if specified
                if (typeof nanValue !== 'undefined') {
                    for (let i = 0; i < sums.length; i++) {
                        if (typeof sums[i] === 'number' && isNaN(sums[i])) {
                            sums[i] = nanValue;
                        }
                    }
                }
                
                // Add the summary column
                this.addColumn(label, sums);
                
            } catch (error) {
                return this._handleError('Failed to sum rows: ' + error.message, 'InternalError', 'DataMaster');
            }
            
            return this; // For chaining
        }
        
        /**
         * Reorders the DataMaster columns and removes unwanted fields
         * @param {Array<string|number>} fields - The fields to keep and their order
         * @returns {DataMaster} this for chaining
         */
        reorder(fields) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', 'DataMaster');
            }
            
            if (!Array.isArray(fields)) {
                return this._handleError('Fields parameter must be an array', 'UserError', 'DataMaster');
            }
            
            if (fields.length === 0) {
                return this._handleError('At least one field must be specified for reordering', 'UserError', 'DataMaster');
            }
            
            try {
                // Use the helper function to reorder the data
                const result = reorderTableData(this._table, this._fields, fields);
                
                if (!result.success) {
                    return this._handleError(result.error, 'UserError', 'DataMaster');
                }
                
                // Update the internal state with reordered data
                this._table = result.table;
                this._fields = result.fields;
                
            } catch (error) {
                return this._handleError('Failed to reorder data: ' + error.message, 'InternalError', 'DataMaster');
            }
            
            return this; // For chaining
        }
        
        /**
         * Modifies existing field names using a mapping object
         * @param {Object} fieldMap - Object mapping old field names to new field names
         * @param {boolean} [reorderAfter=false] - Whether to reorder data to match the mapping order
         * @returns {DataMaster} this for chaining
         */
        modifyFieldNames(fieldMap, reorderAfter = false) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', 'DataMaster');
            }
            
            if (typeof fieldMap !== 'object' || fieldMap === null || Array.isArray(fieldMap)) {
                return this._handleError('Field map must be an object', 'UserError', 'DataMaster');
            }
            
            const mappingKeys = Object.keys(fieldMap);
            if (mappingKeys.length === 0) {
                return this._handleError('Field map cannot be empty', 'UserError', 'DataMaster');
            }
            
            try {
                // Validate that all keys in the mapping exist as current field names
                for (let i = 0; i < mappingKeys.length; i++) {
                    const oldFieldName = mappingKeys[i];
                    const fieldIndex = this._fields.indexOf(oldFieldName);
                    
                    if (fieldIndex === -1) {
                        return this._handleError(`Field '${oldFieldName}' not found`, 'UserError', 'DataMaster');
                    }
                }
                
                // Apply the field name changes
                for (let i = 0; i < mappingKeys.length; i++) {
                    const oldFieldName = mappingKeys[i];
                    const newFieldName = fieldMap[oldFieldName];
                    
                    if (typeof newFieldName !== 'string') {
                        return this._handleError(`New field name for '${oldFieldName}' must be a string`, 'UserError', 'DataMaster');
                    }
                    
                    const fieldIndex = this._fields.indexOf(oldFieldName);
                    this._fields[fieldIndex] = newFieldName;
                }
                
                // If reorderAfter is true, reorder the data to match the mapping order
                if (reorderAfter) {
                    const newOrder = mappingKeys.map(oldField => fieldMap[oldField]);
                    const result = reorderTableData(this._table, this._fields, newOrder);
                    
                    if (!result.success) {
                        return this._handleError(result.error, 'InternalError', 'DataMaster');
                    }
                    
                    this._table = result.table;
                    this._fields = result.fields;
                }
                
            } catch (error) {
                return this._handleError('Failed to modify field names: ' + error.message, 'InternalError', 'DataMaster');
            }
            
            return this; // For chaining
        }
        
        /**
         * Sets the field names to new values
         * @param {Array<string>} fields - The new field names
         * @returns {DataMaster} this for chaining
         */
        setFieldNames(fields) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', 'DataMaster');
            }
            
            if (!Array.isArray(fields)) {
                return this._handleError('Fields must be an array', 'UserError', 'DataMaster');
            }
            
            if (fields.length === 0) {
                return this._handleError('Fields array cannot be empty', 'UserError', 'DataMaster');
            }
            
            try {
                // Validate that all field names are strings
                for (let i = 0; i < fields.length; i++) {
                    if (typeof fields[i] !== 'string') {
                        return this._handleError(`Field name at index ${i} must be a string`, 'UserError', 'DataMaster');
                    }
                }
                
                // Replace field names up to the shorter of the two arrays
                const maxLength = Math.min(fields.length, this._fields.length);
                for (let i = 0; i < maxLength; i++) {
                    this._fields[i] = fields[i];
                }
                
            } catch (error) {
                return this._handleError('Failed to set field names: ' + error.message, 'InternalError', 'DataMaster');
            }
            
            return this; // For chaining
        }
        
        /**
         * Replaces values in specified fields using a query pattern
         * @param {string|RegExp} query - The pattern to search for (string will be converted to case-insensitive global RegExp)
         * @param {*} newValue - The value to replace matches with
         * @param {Array<string|number>|string|number} [fields] - Fields to search in (defaults to all fields)
         * @returns {DataMaster} this for chaining
         */
        replace(query, newValue, fields) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', 'DataMaster');
            }
            
            if (typeof query === 'undefined') {
                return this._handleError('Query parameter is required', 'UserError', 'DataMaster');
            }
            
            if (typeof newValue === 'undefined') {
                return this._handleError('New value parameter is required', 'UserError', 'DataMaster');
            }
            
            // Default to all fields if none specified
            if (typeof fields === 'undefined') {
                fields = this._fields;
            }
            
            // Convert single field to array
            if (!Array.isArray(fields)) {
                fields = [fields];
            }
            
            // Convert string query to case-insensitive global RegExp
            let regex;
            if (!(query instanceof RegExp)) {
                try {
                    regex = new RegExp(query.toString(), 'ig');
                } catch (error) {
                    return this._handleError('Invalid query pattern: ' + error.message, 'UserError', 'DataMaster');
                }
            } else {
                regex = query;
            }
            
            try {
                // Process each specified field
                for (let f = 0; f < fields.length; f++) {
                    let columnIndex;
                    
                    // Handle field parameter (string or number)
                    if (typeof fields[f] === 'number') {
                        if (fields[f] < 0 || fields[f] >= this._fields.length) {
                            continue; // Skip invalid column indexes
                        }
                        columnIndex = fields[f];
                    } else if (typeof fields[f] === 'string') {
                        columnIndex = this._fields.indexOf(fields[f]);
                        if (columnIndex === -1) {
                            continue; // Skip fields that don't exist
                        }
                    } else {
                        continue; // Skip invalid field references
                    }
                    
                    // Process each row in the column
                    for (let row = 0; row < this._table.length; row++) {
                        if (!Array.isArray(this._table[row])) {
                            continue; // Skip invalid rows
                        }
                        
                        let cell = this._table[row][columnIndex];
                        
                        // Treat null/undefined as empty string for replacement
                        if (cell === null || cell === undefined) {
                            cell = '';
                        }
                        
                        // Perform the replacement
                        try {
                            this._table[row][columnIndex] = cell.toString().replace(regex, newValue);
                        } catch (replaceError) {
                            // Continue processing other cells if one replacement fails
                            continue;
                        }
                    }
                }
            } catch (error) {
                return this._handleError('Failed to replace values: ' + error.message, 'InternalError', 'DataMaster');
            }
            
            return this; // For chaining
        }
        
        /**
         * Limits the DataMaster to only rows that match the filter criteria (destructive operation)
         * @param {Object|Function} filter - Object with field-value pairs for AND filtering, or function that receives row object
         * @returns {DataMaster} this for chaining
         */
        limit(filter) {
            try {
                // Execute the programmatic filter using the unified engine
                const result = this._executeProgrammaticFilter(filter);
                
                if (!result.success) {
                    return this._handleError(result.error, 'UserError', 'DataMaster');
                }
                
                // Update the internal table with filtered data (destructive operation)
                this._table = result.table;
                
            } catch (error) {
                return this._handleError('Failed to limit data: ' + error.message, 'InternalError', 'DataMaster');
            }
            
            return this; // For chaining
        }
        
        /**
         * Executes a WHERE clause and removes non-matching rows (destructive operation)
         * @param {string} clauseString - The WHERE clause to execute (supports field names, =, !=, AND, OR, parentheses, wildcards, custom functions)
         * @param {Object} [queryFunctions={}] - Custom query functions for advanced filtering
         * @returns {DataMaster} this for chaining
         */
        limitWhere(clauseString, queryFunctions = {}) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', 'DataMaster');
            }
            
            if (typeof clauseString !== 'string') {
                return this._handleError('Clause string must be a string', 'UserError', 'DataMaster');
            }
            
            if (clauseString.length === 0) {
                return this._handleError('Clause string cannot be empty', 'UserError', 'DataMaster');
            }
            
            try {
                // Execute the WHERE clause using the internal engine
                const result = this._executeWhere(clauseString, queryFunctions);
                
                if (!result.success) {
                    return this._handleError(result.error, 'UserError', 'DataMaster');
                }
                
                // Update the internal table with filtered data (destructive operation)
                this._table = result.table;
                
            } catch (error) {
                return this._handleError('Failed to execute WHERE clause: ' + error.message, 'InternalError', 'DataMaster');
            }
            
            return this; // For chaining
        }
        
        /**
         * Removes duplicate entries from the table based on the specified fields
         * @param {Array|string|number} [fields] - The fields to match on for duplicate detection
         * @returns {DataMaster} this for chaining
         */
        removeDuplicates(fields) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', 'DataMaster');
            }
            
            if (this._table.length === 0) {
                return this; // No table data to process
            }
            
            // Default to all fields if none specified
            if (typeof fields === 'undefined') {
                fields = [...this._fields]; // Create a copy
            }
            
            // Convert to array if only one field provided
            if (!Array.isArray(fields)) {
                fields = [fields];
            }
            
            if (fields.length === 0) {
                return this._handleError('At least one field must be specified for duplicate detection', 'UserError', 'DataMaster');
            }
            
            try {
                // Generate column indexes for the specified fields
                const columnIndexes = [];
                for (let f = 0; f < fields.length; f++) {
                    let columnIndex;
                    
                    if (typeof fields[f] === 'number') {
                        if (fields[f] < 0 || fields[f] >= this._fields.length) {
                            return this._handleError(`Field index ${fields[f]} is out of bounds`, 'UserError', 'DataMaster');
                        }
                        columnIndex = fields[f];
                    } else if (typeof fields[f] === 'string') {
                        columnIndex = this._fields.indexOf(fields[f]);
                        if (columnIndex === -1) {
                            return this._handleError(`Field '${fields[f]}' not found`, 'UserError', 'DataMaster');
                        }
                    } else {
                        return this._handleError('Field references must be strings or numbers', 'UserError', 'DataMaster');
                    }
                    
                    columnIndexes.push(columnIndex);
                }
                
                const newTable = [];
                
                // Check each row for duplicates
                for (let row = 0; row < this._table.length; row++) {
                    if (!Array.isArray(this._table[row])) {
                        continue; // Skip invalid rows
                    }
                    
                    if (!isRowDuplicate(this._table[row], newTable, columnIndexes)) {
                        newTable.push([...this._table[row]]); // Add a copy of the row
                    }
                }
                
                // Replace the table with the deduplicated version
                this._table = newTable;
                
            } catch (error) {
                return this._handleError('Failed to remove duplicates: ' + error.message, 'InternalError', 'DataMaster');
            }
            
            return this; // For chaining
        }

        
        // --- Non-Mutating Methods (return new values) ---
        
        /**
         * Searches and returns a new DataMaster instance with filtered data
         * @param {Object|Function} filter - Object with field-value pairs for AND filtering, or function that receives row object
         * @returns {DataMaster} New DataMaster instance with filtered data
         */
        search(filter) {
            try {
                // Execute the programmatic filter using the unified engine
                const result = this._executeProgrammaticFilter(filter);
                
                if (!result.success) {
                    return this._handleError(result.error, 'UserError', 'DataMaster');
                }
                
                // Return new DataMaster instance with filtered data
                return new DataMaster(result.table, [...this._fields], this._options);
                
            } catch (error) {
                return this._handleError('Failed to search data: ' + error.message, 'InternalError', 'DataMaster');
            }
        }
        
        /**
         * Executes a WHERE clause and returns a new DataMaster instance with matching rows
         * @param {string} clauseString - The WHERE clause to execute (supports field names, =, !=, AND, OR, parentheses, wildcards, custom functions)
         * @param {Object} [queryFunctions={}] - Custom query functions for advanced filtering
         * @returns {DataMaster} New DataMaster instance with filtered data
         */
        where(clauseString, queryFunctions = {}) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', 'DataMaster');
            }
            
            if (typeof clauseString !== 'string') {
                return this._handleError('Clause string must be a string', 'UserError', 'DataMaster');
            }
            
            if (clauseString.length === 0) {
                return this._handleError('Clause string cannot be empty', 'UserError', 'DataMaster');
            }
            
            try {
                // Execute the WHERE clause using the internal engine
                const result = this._executeWhere(clauseString, queryFunctions);
                
                if (!result.success) {
                    return this._handleError(result.error, 'UserError', 'DataMaster');
                }
                
                // Return new DataMaster instance with filtered data (Clone on Select pattern)
                return new DataMaster(result.table, [...this._fields], this._options);
                
            } catch (error) {
                return this._handleError('Failed to execute WHERE clause: ' + error.message, 'InternalError', 'DataMaster');
            }
        }
        
        /**
         * Returns the positional indices of rows that match the filter criteria
         * @param {Object|Function} filter - Object with field-value pairs for AND filtering, or function that receives row object
         * @returns {Array<number>} Array of row indices that match the filter
         */
        getIndices(filter) {
            try {
                // Execute the programmatic filter using the unified engine
                const result = this._executeProgrammaticFilter(filter);
                
                if (!result.success) {
                    return this._handleError(result.error, 'UserError', 'Array');
                }
                
                // Return only the indices
                return result.indices;
                
            } catch (error) {
                return this._handleError('Failed to get indices: ' + error.message, 'InternalError', 'Array');
            }
        }
        
        /**
         * Returns the positional indices of rows that match the WHERE clause
         * @param {string} clauseString - The WHERE clause to execute (supports field names, =, !=, AND, OR, parentheses, wildcards, custom functions)
         * @param {Object} [queryFunctions={}] - Custom query functions for advanced filtering
         * @returns {Array<number>} Array of row indices that match the WHERE clause
         */
        getIndicesWhere(clauseString, queryFunctions = {}) {
            if (!Array.isArray(this._table) || !Array.isArray(this._fields)) {
                return this._handleError('Invalid table or fields state', 'StateError', 'Array');
            }
            
            if (typeof clauseString !== 'string') {
                return this._handleError('Clause string must be a string', 'UserError', 'Array');
            }
            
            if (clauseString.length === 0) {
                return this._handleError('Clause string cannot be empty', 'UserError', 'Array');
            }
            
            try {
                // Execute the WHERE clause using the internal engine
                const result = this._executeWhere(clauseString, queryFunctions);
                
                if (!result.success) {
                    return this._handleError(result.error, 'UserError', 'Array');
                }
                
                // Return only the indices
                return result.indices;
                
            } catch (error) {
                return this._handleError('Failed to get indices with WHERE clause: ' + error.message, 'InternalError', 'Array');
            }
        }
        
        /**
         * Unified query engine for declarative data manipulation.
         * Adheres to the mutability contract: 'select' returns a new instance,
         * while 'update' and 'delete' modify the instance in-place and return `this`.
         * @param {string} verb - The action to perform: 'select', 'update', or 'delete'.
         * @param {Object} options - Configuration object for the query.
         * @returns {DataMaster|this} A new DataMaster instance for 'select', or `this` for mutators.
         */
        query(verb, options = {}) {
            if (typeof verb !== 'string') {
                return this._handleError("Query verb must be a string ('select', 'update', 'delete').", 'UserError', 'DataMaster');
            }

            switch (verb.toLowerCase()) {
                case 'select':
                    return this._executeQuerySelect(options);
                case 'update':
                    return this._executeQueryUpdate(options);
                case 'delete':
                    return this._executeQueryDelete(options);
                default:
                    return this._handleError(`Unsupported query verb: '${verb}'.`, 'UserError', 'DataMaster');
            }
        }

        /**
         * Internal handler for 'select' queries.
         * @private
         * @param {Object} options - Query options.
         * @returns {DataMaster} A new, transformed DataMaster instance.
         */
        _executeQuerySelect(options) {
            // "Clone on Select" pattern: all operations are on a temporary clone.
            const tempDM = this.clone();

            // 1. WHERE clause: Filter the rows (destructive on the clone).
            if (options.where) {
                if (typeof options.where === 'string') {
                    const whereResult = tempDM.limitWhere(options.where, options.queryFunctions);
                    
                    // Check if limitWhere returned an error DataMaster
                    if (whereResult._fields.includes('ErrorType')) {
                        return whereResult; // Return the error DataMaster immediately
                    }
                } else {
                    tempDM.limit(options.where);
                }
            }

            // 2. ORDER BY clause: Sort the remaining rows.
            if (options.orderBy) {
                const sortParams = parseOrderByClause(options.orderBy);
                if (typeof sortParams === 'string') {
                    return this._handleError(sortParams, 'UserError', 'DataMaster');
                }
                tempDM.sort(sortParams.fields, sortParams.desc);
            }

            // 3. SELECT fields: Reorder/limit columns.
            if (options.fields) {
                let fieldsToSelect = options.fields;
                if (fieldsToSelect !== '*') {
                    if (typeof fieldsToSelect === 'string') {
                        fieldsToSelect = fieldsToSelect.split(',').map(f => f.trim());
                    }
                    tempDM.reorder(fieldsToSelect);
                }
            }

            // 4. PAGINATION: Apply limit and offset.
            if (options.limit !== undefined || options.offset !== undefined) {
                const offset = options.offset || 0;
                const limit = options.limit;
                
                // Validate offset
                if (typeof offset !== 'number' || offset < 0 || !Number.isInteger(offset)) {
                    return this._handleError('Offset must be a non-negative integer', 'UserError', 'DataMaster');
                }
                
                // Validate limit (if provided)
                if (limit !== undefined && (typeof limit !== 'number' || limit < 0 || !Number.isInteger(limit))) {
                    return this._handleError('Limit must be a non-negative integer', 'UserError', 'DataMaster');
                }
                
                // Apply pagination by slicing the table data
                const currentTable = tempDM._table;
                let paginatedTable;
                
                if (limit !== undefined) {
                    paginatedTable = currentTable.slice(offset, offset + limit);
                } else {
                    paginatedTable = currentTable.slice(offset);
                }
                
                tempDM._table = paginatedTable;
            }
            
            // Return the fully transformed clone.
            return tempDM;
        }

        /**
         * Internal handler for 'update' queries.
         * @private
         * @param {Object} options - Query options.
         * @returns {this} The mutated DataMaster instance.
         */
        _executeQueryUpdate(options) {
            // Validation: 'where' and 'set' are mandatory.
            if (!options.where) {
                return this._handleError("UPDATE statements require a 'where' clause.", 'UserError', 'DataMaster');
            }
            if (!options.set || typeof options.set !== 'object' || Array.isArray(options.set)) {
                return this._handleError("UPDATE statements require a 'set' object.", 'UserError', 'DataMaster');
            }

            // 1. Find rows to update using the non-destructive index search.
            let indicesToUpdate;
            if (typeof options.where === 'string') {
                indicesToUpdate = this.getIndicesWhere(options.where, options.queryFunctions);
            } else {
                indicesToUpdate = this.getIndices(options.where);
            }

            // Check if getIndices returned an error array
            if (Array.isArray(indicesToUpdate) && indicesToUpdate.length > 0 && typeof indicesToUpdate[0] === 'object' && indicesToUpdate[0].ErrorType) {
                 return this._handleError(indicesToUpdate[0].Message, 'UserError', 'DataMaster');
            }

            // 2. Perform the update using .modifyCell()
            const fieldsToUpdate = Object.keys(options.set);
            for (const rowIndex of indicesToUpdate) {
                for (const field of fieldsToUpdate) {
                    this.modifyCell(rowIndex, field, options.set[field]);
                }
            }

            return this;
        }

        /**
         * Internal handler for 'delete' queries.
         * @private
         * @param {Object} options - Query options.
         * @returns {this} The mutated DataMaster instance.
         */
        _executeQueryDelete(options) {
            // Validation: 'where' is mandatory.
            if (!options.where) {
                return this._handleError("DELETE statements require a 'where' clause.", 'UserError', 'DataMaster');
            }

            // 1. Find rows to delete using the non-destructive index search.
            let indicesToDelete;
            if (typeof options.where === 'string') {
                indicesToDelete = this.getIndicesWhere(options.where, options.queryFunctions);
            } else {
                indicesToDelete = this.getIndices(options.where);
            }
            
            // Check if getIndices returned an error array
            if (Array.isArray(indicesToDelete) && indicesToDelete.length > 0 && typeof indicesToDelete[0] === 'object' && indicesToDelete[0].ErrorType) {
                 return this._handleError(indicesToDelete[0].Message, 'UserError', 'DataMaster');
            }

            // 2. IMPORTANT: Sort indices in descending order to prevent shifting issues.
            indicesToDelete.sort((a, b) => b - a);

            // 3. Perform the deletion using .removeRow()
            for (const rowIndex of indicesToDelete) {
                this.removeRow(rowIndex);
            }

            return this;
        }
    }
    
    // --- Conversion Utilities ---
    
    const converters = {
        recordsetToTable,
        tableToRecordset,
        csvToTable,
        tableToCsv
    };
    
    
    // --- Public API Assembly ---
    
    // --- Universal Export Logic ---
    
    if (typeof module !== 'undefined' && module.exports) {
        // Node.js - Export DataMaster as the default export with convenience functions
        const DataMasterWithConvenience = Object.assign(DataMaster, {
            fromTable: DataMaster.fromTable.bind(DataMaster),
            fromRecordset: DataMaster.fromRecordset.bind(DataMaster),
            fromCsv: DataMaster.fromCsv.bind(DataMaster),
            converters
        });
        
        module.exports = DataMasterWithConvenience;
    } else {
        // Browser - Expose DataMaster with convenience functions
        const DataMasterWithConvenience = Object.assign(DataMaster, {
            fromTable: DataMaster.fromTable.bind(DataMaster),
            fromRecordset: DataMaster.fromRecordset.bind(DataMaster),
            fromCsv: DataMaster.fromCsv.bind(DataMaster),
            converters
        });
        
        global.DataMaster = DataMasterWithConvenience;
    }
    
}(this || window));