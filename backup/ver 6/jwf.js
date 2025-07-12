/*globals $:false */

/*
TODO:
    

*/

/*
ver 8.8.0 2023-11-03
    -added multiFieldSort
ver 8.7.0 2023-10-13
    -added groupTableByKey
ver 8.6.0 2023-10-10
    -re-added "short" to formatDate, un-braking the change to 9.x.x
ver 9.4.0 2023-10-10 (8.6.0 if short date re-added)
    -added getElementDimensions
    -added logDimensionsOnResize
ver 9.3.0 2023-10-03 (8.5.0 if short date re-added)
    -added dddd=Monday to formatDate
ver 9.2.0 2023-10-03 (8.4.0 if short date re-added)
    -added leftPad
ver 9.1.0 2023-10-03 (8.3.0 if short date re-added)
    -added compareTables
ver 9.0.0 2023-09-29
    -replaced formateDate with one that uses a YYYY/MM/DD style (no 'short date')
ver 8.2.0 2023-08-30
    -added looseCaseInsensitiveCompare
ver 8.1.0 2023-08-28
    -added loopTemplate
ver 8.0.0 2023-08-23
-updated ensure2D so that it considers [{}] to be 2D already
-BREAKING: remove setDefaults (redundant with mergeObjects)
    -added convertToRecordset
    -added convertToTable
        -NOTE: After having removed a bunch of Datamaster functions from the
            library I went ahead a put a few general ones back in. The thinking
            was that these functions are simple and general enough to not 
            require invoking and supporting the entire Datamaster library

_______________________________________________________________________________    
ver 7.1.0 2023-08-21
    -add getDataStyle

ver 7.0.0 2023-08-18
    -Remove legacy datamaster functions
    -remove gate (jw-gate)
    -Update splitArrayIntoChunks
    -replace rem2px with convertToPixels
    -remove request
    -added mergeObjects
    -removed keyExists since Object.hasOwnProperty exists
    -replaced findKey with findProperties
    -replaced itemInList with isStringInArray
    -replaced removeNullsFromList with removeNullFromArray 
    -removed arrayToString because of Array.join()
    -Removed listToTable - same as splitArrayIntoChunks
    -removed selectDistinct (Datamaster)

_______________________________________________________________________________    
ver 6.5.0 2021-02-12
    -add splitArrayIntoChunks
ver 6.4.0 2020-07-17
    -add removeDiacritics
ver 6.3.0 2020-06-19
    -add selectDistinct when no column specified now assumes 1-dimensional array
    -add selectDistinct jsDoc
    -add removeNullsFromList
ver 6.2.0 2020-05-21
    -add formatNumber
ver 6.1.3 2019-06-18
    -fix a bunch of spelling, mostly in comments
ver 6.1.2 2019-06-11
    -DataMaster add jsDoc
ver 6.1.1 2019-06-04
    -DataMaster separated into own variable.
        -Non-breaking since jwdm convenience variable was only thing ever used 
            and it still exists
    -DataMaster.debug better column formatting
ver 6.1.0 2019-06-03
    -Add DataMaster.pivot
ver 6.0.0 2019-05-31
    -DataMaster:    
        -Modified several function params (breaking change)
        -addRow/AddColumn can now add at arbitrary location
        -exportAs can now export as CSV
        -getColumn supports distinct
        -now supports chaining for one-shot use ex:
            myCSV = new DataMaster(myData)
                .sort('Totals')
                .reorder(['Totals','Name','Score'])
                .exportAs('csv');

    -current list of depreciated functions:
        -dataColumnToArray
        -recordtableToRecordset
        -recordsetToRecordtable
        -recordsetToTable
        -reconfigureData
        -getDataFromTable
        -sumTable
        -sumRecordset  
        -tableToCSV
_______________________________________________________________________________      
ver 5.6.0 2019-05-30
    -DataMaster.modifyFieldNames can now reorder/limit fields as well.
    -DataMaster.sumColumns now takes label as first param to match addRows
    -changed debug font to monospace
    -moved debug window over a bit
    -bugfixes
    -added DataMaster.copy
ver 5.5.0 2019-05-29
    -Added DataMaster
    -Functions to depreciate:
        -dataColumnToArray
        -recordtableToRecordset
        -recordsetToRecordtable
        -recordsetToTable
        -reconfigureData
        -getDataFromTable
        -sumTable
        -sumRecordset   
ver 5.4.1 2019-04-26
    -createHTMLtable row ids and lastrow class
    -createHTMLTable columns have colN class
ver 5.3.1 2019-04-25
    -sumTable error/no data handling
ver 5.3.0 2019-04-23
    -fixes to createHTMLTable
    -added sumRecordset
ver 5.2.1 2019-04-19
    -added width to createHTMLTable
    -convert createHTMLTable params to object (non-breaking since never deployed)
    -added sumTable
ver 5.2.0 2019-04-17
    -added createHTMLTable
ver 5.1.0 2019-03-29
    -added dataColumnToArray
ver 5.0.0 2019-03-15
    -added reconfigureData
    -added recordsetToRecordtable
    -added recordtableToRecordset
    -code cleanup
    -recordsetToTable returns object compatible with recordtable
_______________________________________________________________________________
ver 4.8.0 2019-03-14
    -added itemInList
    -added selectDistinct
ver 4.7.0 2019-03-13
    -added arrayToString
ver 4.6.0 2019-03-06
    -added locked param to Gate
    -fixed recordset issues with getDataFromTable
ver 4.5.0 2019-02-27
    -added Gate
ver 4.4.2 2019-02-22
    -tableToCSV newline to space
    -tabletoCSV removeNewLines mandatory
ver 4.4.1 2019-02-21
    -tableToCSV now removes newlines.
ver 4.4.0 2019-02-20
    -recordSetToTable added getFields
ver 4.3.1 2019-02-19
    -fillSelect: removed constructor === array check, was causing problems, not sure why
ver 4.3.0 2019-02-14
    -added tableToCSV
    -added downloadTextFile
ver 4.2.0 2019-02-06
    -added selectElement
    -added copyText
ver 4.1.0 2019-01-30
    -added error checking to formatDate
    -added 'YY/MM/DD' to formatDate
ver 4.0.0 2019-01-17
    -renamed to jwf.js
    -added generic functions from other JS
        -rem2pix
        -recordsetToTable
        -isValidDate
        -fillSelect
        -formatDate
        -formatTime
_______________________________________________________________________________
ver 3.2.3 2019-01-16
    -added cut/paste to searchbox
ver 3.2.2 2018-08-21
    -getDataFromTable does soft check
ver 3.2.1 2018-08-15
    -fixed comments for getDataFromTable
ver 3.2.0 2018-07-30
    -renamed getRowFromTable-->getDataFromTable
    -getDataFromTable can now return all matches
ver 3.1.0 2018-07-26
    -added getRowFromTable()
ver 3.0.0
    -modified searchbox to use object for both return types

*/

/*globals $:false */


var jwf = {
    /***************************************************************************/
    /**Begin Datamaster-style routines *******************************************/
    /***************************************************************************/
    
    /**
     * Groups an array of objects by a specified key.
     *
     * @param {Array<Object>} table - The array of objects to be grouped.
     * @param {string} key - The key by which to group the objects.
     * @param {boolean} preserveKeyData - Whether to keep the key in the grouped objects.
     *
     * @returns {Object|String}
     *  - Returns an object where each property is an array of objects grouped by the key.
     *  - Returns a string containing an error message if input validation fails.
     *
     * @example
     * const table = [
     *  { name: "alice", age: 23, funny: true },
     *  { name: "bob", age: 23, funny: false },
     *  { name: "claire", age: 21, funny: true }
     * ];
     * groupTableByKey(table, "age", true);
     */

    groupTableByKey: function(table, key, preserveKeyData) {
        // Validate input
        if (!Array.isArray(table)) {
        return "Input table should be an array.";
        }
    
        if (typeof key !== "string") {
        return "Key should be a string.";
        }
    
        if (typeof preserveKeyData !== "boolean") {
        return "preserveKeyData should be a boolean.";
        }
    
        var groupedTable = {};
    
        for (var i = 0; i < table.length; i++) {
        var row = table[i];
    
        if (row.hasOwnProperty(key)) {
            var keyValue = row[key];
    
            // Initialize array if not exists
            if (!groupedTable.hasOwnProperty(keyValue)) {
            groupedTable[keyValue] = [];
            }
    
            // Remove key if preserveKeyData is false
            if (!preserveKeyData) {
            var clonedRow = Object.assign({}, row);
            delete clonedRow[key];
            groupedTable[keyValue].push(clonedRow);
            } else {
            groupedTable[keyValue].push(row);
            }
        } else {
            return "Key does not exist in one or more table rows.";
        }
        }
    
        return groupedTable;
    },
    
    /**
     * Converts a table (a 2D array) into an array of objects based on the provided
     * field names. If a value in the table is null, the corresponding property in
     * the object will be set to null.
     *
     * @param {Array<Array<string>>} table - The 2D array to convert.
     * @param {Array<string>} fields - The array of field names to assign.
     * @returns {Array<Object>|false} The resulting array of objects, or false if
     * an error occurs.
     */
    convertToRecordset: function (table, fields) {
        if (!Array.isArray(table) || !Array.isArray(fields)) {
            return false;
        }
    
        if (fields.some(field => typeof field !== 'string')) {
            return false;
        }
    
        var recordset = []; // Initialize the array of objects as an empty array.
    
        // Iterate through each row in the table.
        for (var i = 0; i < table.length; i++) {
            var obj = {}; // Initialize a new object for the current row.
        
            // Iterate through each field name in the fields array.
            for (var j = 0; j < fields.length; j++) {
                var field = fields[j];
                var value = table[i][j];
        
                // Add the field to the object with the corresponding value, even if null.
                obj[field] = value;
            }
        
            // Add the completed object to the array of objects.
            recordset.push(obj);
        }
    
        return recordset; // Return the completed array of objects.
    },


    /**
     * Converts an array of objects into a table (a 2D array) based on the provided
     * field names. If a field is missing in an object, null will be placed in the
     * table.
     *
     * @param {Array<Object>} data - The array of objects to convert.
     * @param {Array<string>} fields - The array of field names to extract.
     * @returns {Array<Array<string|null>>} The resulting 2D array.
     */
    convertToTable: function (data, fields) {
        if (!Array.isArray(data) || !Array.isArray(fields)) {
            return false;
        }
    
        if (fields.some(field => typeof field !== 'string')) {
            return false;
        }
    
        var table = []; // Initialize the table as an empty array.
    
        // Iterate through each object in the input array.
        for (var i = 0; i < data.length; i++) {
            var row = []; // Initialize a new row for the current object.
        
            // Iterate through each field name in the fields array.
            for (var j = 0; j < fields.length; j++) {
                var field = fields[j];
        
                // Check if the current object contains the specified field.
                if (data[i] !== null &&
                    typeof data[i] === 'object' &&
                    data[i].hasOwnProperty(field)) {
                // Add the value of the current field to the row.
                row.push(data[i][field]);
                } else {
                // If the field is missing, add null to the row.
                row.push(null);
                }
            }
        
            // Add the completed row to the table.
            table.push(row);
        }
    
        return table; // Return the completed table.
    },
    
    /**
     * Determines the style of a given input as per predefined criteria.
     *
     * @param {Array|Object} input - The input array or object.
     * @returns {string} Returns one of the following strings based on the input's
     *                   style: 'array', 'object', 'table', 'recordset', 'unknown'.
     */
    getDataStyle: function (input) {
        if (Array.isArray(input)) {
          if (input.length > 0 && Array.isArray(input[0])) {
            return 'table'; // 2d array
          }
          if (input.length > 0 && typeof input[0] === 'object' &&
              !Array.isArray(input[0])) {
            return 'recordset'; // Array of simple objects
          }
          return 'array'; // 1d array
        }
        if (typeof input === 'object' && input !== null) {
          return 'object'; // Simple object
        }
        return 'unknown'; // Unrecognized style
      },

    /**
     * Ensure the given input is wrapped in a 2D array. 
     * If the input is a 1D array (excluding arrays of objects) or an object, it wraps it into 2D.
     * If the conversion is not possible, or the input is already 2D, it returns the original input.
     * 
     * @param {Array|Object} input - The input which can be an object, 1D array, or 2D array.
     * @returns {Array|*} - Returns a 2D array if the conversion is successful, or the original input if not.
     * 
     * @example
     * const obj = { foo: 'bar', hello: 'world' };
     * ensure2D(obj);  // Returns: [{ foo: 'bar', hello: 'world' }]
     * 
     * const oneDArray = [1, 2, 3, 4];
     * ensure2D(oneDArray);  // Returns: [[1, 2, 3, 4]]
     * 
     * const arrayofObjects = [{ foo: 'bar' }, { hello: 'world' }];
     * ensure2D(arrayofObjects);  // Returns: [{ foo: 'bar' }, { hello: 'world' }]
     * 
     * const twoDArray = [[1, 2], [3, 4]];
     * ensure2D(twoDArray);  // Returns: [[1, 2], [3, 4]]
     * 
     * const invalidInput = 'string';
     * ensure2D(invalidInput);  // Returns: 'string'
     */
    ensure2D: function(input) {
        if (Array.isArray(input)) {
            if (!Array.isArray(input[0]) && typeof input[0] !== 'object') {
                return [input];
            }
            return input; // Return the original input if it's already 2D or an array of objects
        } else if (typeof input === 'object' && input !== null) {
            return [input];
        }
        return input; // Return the original input if it's neither array nor object
    },
    
    /* Compares two tables (arrays of objects) to check if they have the same
    * records with the same keys and values.
    *
    * @param {Array<Object>} table1 - The first table to compare.
    * @param {Array<Object>} table2 - The second table to compare.
    * @param {boolean} [strict=false] - Whether to enforce strict equality and 
    *                                    key order.
    * @returns {boolean|string} Returns true if tables are identical based on the
    *                           strict parameter, otherwise returns an error string.
    */
    compareTables: function (table1, table2, strict) {
        // Check if both tables have the same length
        if (table1.length !== table2.length) {
        return "Tables have different number of records.";
        }
    
        for (let i = 0; i < table1.length; i++) {
        const record1 = table1[i];
        const record2 = table2[i];
    
        // Get keys for both records
        const keys1 = Object.keys(record1);
        const keys2 = Object.keys(record2);
    
        // Check if both records have the same number of keys
        if (keys1.length !== keys2.length) {
            return "Records have different number of keys.";
        }
    
        // Sort keys if not in strict mode
        if (!strict) {
            keys1.sort();
            keys2.sort();
        }
    
        // Check if keys are the same (and in the same order if in strict mode)
        for (let j = 0; j < keys1.length; j++) {
            if (keys1[j] !== keys2[j]) {
            return "Keys are different between records.";
            }
        }
    
        // Check if values for each key are the same
        for (let j = 0; j < keys1.length; j++) {
            const key = keys1[j];
            if (strict) {
            if (record1[key] !== record2[key]) {
                return "Values are different for the same key.";
            }
            } else {
            if (record1[key] != record2[key]) {
                return "Values are different for the same key.";
            }
            }
        }
        }
    
        // If loop completes without returning, tables are identical
        return true;
    },

    /**
     * Generates a comparator function for sorting an array of objects or arrays based on
     * multiple fields and corresponding sort orders.
     *
     * @param {string[]|number[]} fields - An array of property names (for objects) or indices
     * (for arrays) to sort by. For each field, the sorting will be applied in the order they
     * appear in this array.
     * @param {boolean[]} directions - An array of booleans where each corresponds to a field
     * in the fields array. A value of `true` indicates sorting in descending order, and `false`
     * indicates ascending order.
     * @param {Function[]} [primers] - An optional array of functions to transform each field
     * before comparison. Each primer should correspond to a field in the fields array. If no
     * primer is needed for a particular field, `null` or `undefined` can be provided.
     *
     * @returns {Function} A comparator function that can be used with Array.prototype.sort to
     * sort an array of objects or arrays based on multiple fields and orders.
     *
     * @example
     * // Sorting an array of arrays by the first column in ascending order,
     * // and then by the third column in descending order.
     * array.sort(multiFieldSort([0, 2], [false, true]));
     *
     * @example
     * // Sorting an array of objects by the 'name' property in ascending order,
     * // and then by the 'age' property in descending order.
     * arrayOfObjects.sort(multiFieldSort(['name', 'age'], [false, true]));
     */
    multiFieldSort: function(fields, directions, primers) {
        // Return a function that will be used to sort the array.
        return function (a, b) {
            // Iterate over each field provided.
            for (var i = 0; i < fields.length; i++) {
                // Get the field to sort by and its corresponding direction.
                var field = fields[i];
                var isDescending = directions[i];
                var primer = primers && primers[i];

                // Determine the sort order (1 for ascending, -1 for descending).
                var sortOrder = isDescending ? -1 : 1;

                // Initialize key function without primer.
                var key = function(x) {
                    return x[field];
                };
                
                // If a primer is provided, modify the key function to use it.
                if (primer) {
                    key = function(x) {
                        return primer(x[field]);
                    };
                }
                
                // Retrieve the values from the objects 'a' and 'b' using the key function.
                var valueA = key(a);
                var valueB = key(b);

                // Perform the comparison for the current field.
                if (valueA > valueB) {
                    return sortOrder;
                } else if (valueA < valueB) {
                    return -sortOrder;
                }
                // If the two values are equal, continue to the next field.
            }
            // All fields are equal.
            return 0;
        };
    },

    /***************************************************************************/
    /**End Datamaster-style routines *******************************************/
    /***************************************************************************/
    
    /**
     * Pads the left side of a string with a specified character up to a given length.
     *
     * @param {any} content - The content that needs to be padded. This can be of any type,
     *                        but it will be converted to a string.
     * @param {number} length - The total desired length of the resulting string after padding.
     *                          If the content's length is already equal to or greater than this
     *                          length, no padding is applied.
     * @param {any} pad - The character used for padding. This can be of any type, but only
     *                    the first character of its string representation will be used.
     *                    If not provided, the default padding character is a space (' ').
     * @returns {string} - The padded string.
     */
    leftPad: function (content, length, pad) {
        // Convert content to string to ensure consistent behavior.
        content = String(content);

        // Determine the padding character. If pad is not provided or it's falsy (except 0),
        // default to a space. Then, take only the first character of the string representation.
        pad = String(pad || pad === 0 ? pad : ' ')[0];

        // Calculate how many pad characters are needed to reach the desired length.
        // If content's length is already equal to or greater than the specified length,
        // then no padding is required (left will be 0).
        var left = Math.max(length - content.length, 0);

        // Create the padded string and return it.
        return pad.repeat(left) + content;
    },

    /**
     * Compares two values using loose equality with optional case sensitivity.
     * Supports SQL-like wildcard '%' and '_' in the query string.
     *
     * @param {any} value - The value to be compared.
     * @param {any} query - The query string for comparison. Can include '%' and '_'.
     * @param {boolean} [forceCaseSensitivity=false] - Whether to enforce case
     *                                                 sensitivity in the comparison.
     *
     * @returns {boolean} - Returns true if the comparison is successful,
     *                      otherwise returns false.
     *                      Returns false if input is null or undefined.
     */
    looseCaseInsensitiveCompare: function (value, query, forceCaseSensitivity) {
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
        regexStr += query[i].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      }
    }
  
    const regex = new RegExp(`^${regexStr}$`);
    const result = regex.test(value);
  
    return result;
  },

    /**
     * Merges two objects by value, returning a new object that contains a deep copy of the combined properties of obj1 and obj2.
     *
     * @param {Object} obj1 - The first object.
     * @param {Object} obj2 - The second object.
     * @returns {Object|boolean} Returns the combined object if both inputs are proper objects.
     *   Returns false if either input is not an object.
     */

    mergeObjects: function(obj1, obj2) {
        // Check if obj1 and obj2 are proper objects; if not, return false
        if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
        return false;
        }

        // Create a deep copy of obj1 to avoid modifying the original
        var result = JSON.parse(JSON.stringify(obj1));

        // Iterate through each key in obj2
        for (var key in obj2) {
            if (obj2.hasOwnProperty(key)) {
                // If the property is an object and not null, recurse into that object
                if (typeof obj2[key] === 'object' && obj2[key] !== null) {
                // Merge the nested objects, creating a new object for the key in result if necessary
                result[key] = this.mergeObjects(result[key] || {}, JSON.parse(JSON.stringify(obj2[key])));
                } else {
                // Otherwise, just set the value from obj2 in result
                result[key] = obj2[key];
                }
            }
        }

        // Return the combined object by value
        return result;
    },
    
    /**
     * Converts a 1D array into a 2D array using the given chunk size.
     * If the array length is not evenly divisible by chunkSize, the last array will have its extra values set to the specified fill value or null.
     *
     * @param {array} data - The original array
     * @param {int} chunkSize - The size of each row in the new array
     * @param {*} [fillValue=null] - The value to fill missing elements in the last chunk
     * @return {array} The 2D array with the original data split into chunks
     */
    splitArrayIntoChunks: function(data, chunkSize, fillValue) {
        if (chunkSize <= 0) {
            return "Error: chunkSize must be greater than 0";
        }

        fillValue = fillValue === undefined ? null : fillValue;
        var output = [];
        var start = 0;
        var end = chunkSize;

        for (var r = 0; r < Math.ceil(data.length / chunkSize); r++) {
            var chunk = data.slice(start, end);

            // If this is the last iteration and the chunk is not full, fill with the specified value
            while (chunk.length < chunkSize) {
                chunk.push(fillValue);
            }

            output.push(chunk);
            start += chunkSize;
            end += chunkSize;
        }

        return output;
    },

    

    /**
     * Formats numbers in various ways
     * @param {number} number -The number to format
     * @param {string} mode -commas
     */
    formatNumber: function(number, mode) {
        if (typeof number === 'undefined') { return null; 
        }
        var res = number;

        if (typeof mode === 'undefined') { mode = 'commas'; }

        if (mode === 'commas') {
            res = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        return res;
    },

    
    
    
    /**
     * Validates that an object can represent a date
     * @param {Object} d - A date string or date object
     * @returns {boolean} - Is the date valid
     */
    isValidDate: function(d) {
        d = new Date(d);
        // @ts-ignore
        return d instanceof Date && !isNaN(d);
    },

    formatDate: function (date, formatString) {
        date = new Date(date);
        
        //for backwards compatibility
        if (formatString === 'short') { formatString = 'YYYY/MM/DD'; }

        // Helper function to pad numbers with leading zeros
        function padNumber(num, size) {
          var s = num.toString();
          while (s.length < size) s = "0" + s;
          return s;
        }
      
        // Helper function to get ordinal suffix
        function getOrdinalSuffix(day) {
          if (day % 10 === 1 && day !== 11) return 'st';
          if (day % 10 === 2 && day !== 12) return 'nd';
          if (day % 10 === 3 && day !== 13) return 'rd';
          return 'th';
        }
      
        // Replace format operators, ordered by length
        return formatString.replace(/yyyy|yyy|yy|y|mmm|mm|m|dddd|ddd|dd|do|d/gi, 
        function(match) {
          var lowerMatch = match.toLowerCase();
          switch (lowerMatch) {
            case 'yyyy':
            case 'yyy':
            case 'y':
              return date.getFullYear().toString();
            case 'yy':
              return (date.getFullYear() % 100).toString();
            case 'm':
              return (date.getMonth() + 1).toString();
            case 'mm':
              return padNumber(date.getMonth() + 1, 2);
            case 'mmm':
              var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return monthNames[date.getMonth()];
            case 'd':
              return date.getDate().toString();
            case 'do':
              var day = date.getDate();
              return day + getOrdinalSuffix(day);
            case 'dd':
              return padNumber(date.getDate(), 2);
            case 'ddd':
              var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              return dayNames[date.getDay()];
            case 'dddd':
                var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                return dayNames[date.getDay()];
            default:
              return match;
          }
        });
      },

    formatTime: function(fullTime, formatString) {
        if (fullTime === null) { 
            return '';
        } else {
            if (typeof formatString === 'undefined') { formatString = 'short'; }
            var myTime = new Date(fullTime); 
            var hours = myTime.getHours();
            var ampm = ' pm';
            if (hours < 12) { ampm = ' am'; }
            if (hours > 12) { hours -= 12; } 
            

            var mins = myTime.getMinutes();
            // @ts-ignore
            if (mins < 10) { mins = '0' + mins; }

            return hours + ':' + mins + ampm;
        } 
    },

    sortBy: function(field, reverse, primer) {
        /*USAGE:
        Sort by price high to low
        homes.sort(sort_by('price', true, parseInt));

        Sort by city, case-insensitive, A-Z
        homes.sort(jwt.sortBy('city', false, function(a){return a.toUpperCase()}));
        */
    var key = primer ? 
            function(x) {return primer(x[field]);} : 
            function(x) {return x[field];};

    reverse = !reverse ? 1 : -1;

    return function (a, b) {
        // @ts-ignore
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        }; 
    },
   
    mod: function(n, d) {
        //mimics the MOD(n,d) method in Excel - returns the remainder of a division as a whole number.
        return n - d * Math.floor(n/d);
    },

    /**
     * Finds properties in an object that match a given value.
     *
     * @param {Object} obj - The object to search.
     * @param {*} value - The value to find.
     * @param {boolean} [strict=false] - If true, performs strict comparison; 
     *                                    if false, performs loose comparison 
     *                                    and ignores case for strings.
     * @param {boolean} [returnAll=false] - If true, returns all matching properties;
     *                                       if false, returns the first match.
     * @return {(string|string[]|boolean)} - Returns the first matching property as a string,
     *                                      or an array of all matching properties,
     *                                      or false if the input is invalid.
     */
    findProperties: function (obj, value, strict, returnAll) {
        // Validate that obj is a non-null object
        if (typeof obj !== 'object' || obj === null) {
            return false;
        }

        var matchingKeys = [];
        for (var key in obj) {
            var objValue = obj[key];
            var compareValue = value;

            // If not strict, convert strings to lowercase for case-insensitive comparison
            if (!strict) {
                if (typeof objValue === 'string') {
                objValue = objValue.toLowerCase();
                }
                if (typeof compareValue === 'string') {
                compareValue = compareValue.toLowerCase();
                }
            }

            // Perform either strict or loose comparison based on the strict parameter
            var isMatch = strict ? objValue === compareValue : objValue == compareValue;

            // If a match is found, either return immediately or add to the list
            if (isMatch) {
                if (returnAll) {
                    matchingKeys.push(key);
                } else {
                    return key;
                }
            }
        }

        // Return either the array of all matches or a message if no matches are found
        return returnAll ? matchingKeys : false;
    },

    /**
     * Checks if a string value is present in an array.
     *
     * @param {Array} array - The array to search within.
     * @param {string} value - The string value to search for.
     * @param {boolean} [strict=false] - If true, performs a strict comparison;
     *                                   if false, performs a loose comparison 
     *                                   and ignores the case of strings.
     * @return {boolean} - Returns true if the value is found in the array
     *                            
     */
    isStringInArray: function (array, value, strict) {
        // Validate that the value is a string
        if (typeof value !== 'string') {
            return false;
        }
    
        // Validate that the array is an actual array
        if (!Array.isArray(array)) {
            return false;
        }
    
        // Convert value to lowercase if not in strict mode
        if (!strict) {
            value = value.toLowerCase();
        }
    
        // Iterate over the array, checking for the value
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            // Convert item to lowercase if not in strict mode
            if (!strict && typeof item === 'string') {
                item = item.toLowerCase();
            }
    
            // Perform either strict or loose comparison based on the strict parameter
            if (strict ? item === value : item == value) {
                return true;
            }
        }
    
        return false;
    },
  

    /**
     * Removes all null values from a 1D array.
     *
     * @param {Array} array - The array from which to remove null values.
     * @return {Array|string} - Returns a new array with null values removed,
     *                          or an error message if the input is invalid.
     */
    removeNullsFromArray: function (array) {
        // Validate that the input is an array
        if (!Array.isArray(array)) {
            return false;
        }
    
        // Use the Array.prototype.filter method to create a new array without null values
        return array.filter(function(item) {
            return item !== null;
        });
    },
  

    stripMod43: function(code) {
        //this strips the mode43 checksum from a code39 barcode (if it exists).
        
        var prefix = code.substr(0,code.length-1);
        var mod43 = code.substr(code.length-1,1);
        var sum = 0;
        for (var i=0; i<prefix.length; i++) {
            sum += jwt.code39[prefix[i]]; //sum the code39 values from the code39 object
        }
        if (mod43 === jwt.findKey(jwt.code39, jwt.mod(sum,43))) {  
            //do a reverse key:value lookup based on the the remainder of the sum/43
            //if it = the code39 value for that remainder then strip the last char
            //because the last char is in fact the mod43 char.
            return prefix; 
        }
        else {
            return code;
        }

    },

    code39: {0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,
            "A":10,"B":11,"C":12,"D":13,"E":14,"F":15,"G":16,"H":17,"I":18,"J":19,
            "K":20,"L":21,"M":22,"N":23,"O":24,"P":25,"Q":26,"R":27,"S":28,"T":29,
            "U":30,"V":31,"W":32,"X":33,"Y":33,"Z":35,"-":36,".":37," ":38,"$":39,
            "/":40,"+":41,"%":42},

    color: {
            accessToRGB: function(ColorNum) {
                var rgb = {};
                var Green=256, Blue = 65536;
                var temp = 0;
                
                temp = ColorNum % Blue;
                rgb.b = (ColorNum-temp)/Blue;
                temp = ColorNum - (rgb.b * Blue);
                rgb.r = temp % Green;
                temp -= rgb.r;
                rgb.g = temp/Green;
                
                return rgb;
            },

            rgbToHex: function(r, g, b) {
                return "#" + jwt.color.componentToHex(r) + jwt.color.componentToHex(g) + jwt.color.componentToHex(b);
            },

            componentToHex: function(c) {
                var hex = c.toString(16);
                return hex.length == 1 ? "0" + hex : hex;
            }, 

            accessToHex: function(ColorNum) {
                var rgb = jwt.color.accessToRGB(ColorNum);
                return jwt.color.rgbToHex(rgb.r, rgb.g, rgb.b);
            }
    },

    bufferToArray: function (data) {
        //TODO: support different array data types
        //converts a buffer of hex data into an array of ACII data
        var myArray = [];
        var hex = data.toString('hex');  
        for (var i = 0; i < hex.length; i += 2) {
          myArray.push(hex.substr(i, 2));
        }
        return myArray;
    },

    /**
     * Converts an integer to a hexadecimal string, left-padded with zeros to a specified length.
     *
     * @param {number} number - The integer to convert to hexadecimal.
     * @param {number} outputLength - The length of the resulting string.
     * @return {string|string} - Returns the hexadecimal string, left-padded to the specified length,
     *                           or an error message if the input is invalid.
     */
    decimalToHex: function (number, outputLength) {
        //converts a decimal value into it's hex equivalent and adds left padding
        var hex = Number(number).toString(16);
        outputLength = typeof (outputLength) === "undefined" || outputLength === null ? outputLength = 0 : outputLength;
        while (hex.length < outputLength) {
            hex = "0" + hex;
        }
        return hex;
    },

    timer: function () {
        //class for running performance tests.
        //outputs an object consisting of timing events in milliseconds
        /*
            USAGE:
                var timer = new Timer();
                someLongFunction();
                timer.lap('Did some long function');
                someOtherLongFunction();
                timer.lap('Did more slow stuff');
                alert(JSON.stringify(timer.report()));
            OUTPUT: {
                "total: 45",
                "Did some long function": 13,
                'Did more slow stuff': 32
            }
        */
        
        var laps = [];
        var start = getTime();
    
        this.lap = function(note) {
            if (typeof note === 'undefined') { note = 'UNDEFINED'; }
            laps.push({
                time: getTime(),
                note: note
            });
        };
        this.report = function() {
            var report = {};
            var now = getTime();
            report.total = Math.round(now-start);
            var lastLap = start;
            laps.forEach(function(lap) {
                report[lap.note] = Math.round(lap.time - lastLap);
                lastLap = lap.time;
            });
            return report;
        };
    
        function getTime() {
            //this is an imperfect bug 'good enough' way to check if we are in a browser or under node.js
            if (typeof window === 'undefined') {
                var hrTime = process.hrtime();
                return hrTime[0] + hrTime[1]/1000000;
            } else {
                return performance.now();
            }
        }
    },

    now: Date.now || function() {
        return new Date().getTime();
    },

    /* 
        The following function is from Stack Overflow
        Link: https://stackoverflow.com/questions/18123501/replacing-accented-characters-with-plain-ascii-ones
        User: https://stackoverflow.com/users/318752/jeroen
    */
    removeDiacritics: function  (str) {

        var defaultDiacriticsRemovalMap = [
          {'base':'A', 'letters':/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},
          {'base':'AA','letters':/[\uA732]/g},
          {'base':'AE','letters':/[\u00C6\u01FC\u01E2]/g},
          {'base':'AO','letters':/[\uA734]/g},
          {'base':'AU','letters':/[\uA736]/g},
          {'base':'AV','letters':/[\uA738\uA73A]/g},
          {'base':'AY','letters':/[\uA73C]/g},
          {'base':'B', 'letters':/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
          {'base':'C', 'letters':/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
          {'base':'D', 'letters':/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},
          {'base':'DZ','letters':/[\u01F1\u01C4]/g},
          {'base':'Dz','letters':/[\u01F2\u01C5]/g},
          {'base':'E', 'letters':/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},
          {'base':'F', 'letters':/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
          {'base':'G', 'letters':/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},
          {'base':'H', 'letters':/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},
          {'base':'I', 'letters':/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},
          {'base':'J', 'letters':/[\u004A\u24BF\uFF2A\u0134\u0248]/g},
          {'base':'K', 'letters':/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},
          {'base':'L', 'letters':/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},
          {'base':'LJ','letters':/[\u01C7]/g},
          {'base':'Lj','letters':/[\u01C8]/g},
          {'base':'M', 'letters':/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
          {'base':'N', 'letters':/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},
          {'base':'NJ','letters':/[\u01CA]/g},
          {'base':'Nj','letters':/[\u01CB]/g},
          {'base':'O', 'letters':/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},
          {'base':'OI','letters':/[\u01A2]/g},
          {'base':'OO','letters':/[\uA74E]/g},
          {'base':'OU','letters':/[\u0222]/g},
          {'base':'P', 'letters':/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
          {'base':'Q', 'letters':/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
          {'base':'R', 'letters':/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},
          {'base':'S', 'letters':/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},
          {'base':'T', 'letters':/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},
          {'base':'TZ','letters':/[\uA728]/g},
          {'base':'U', 'letters':/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},
          {'base':'V', 'letters':/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
          {'base':'VY','letters':/[\uA760]/g},
          {'base':'W', 'letters':/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
          {'base':'X', 'letters':/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
          {'base':'Y', 'letters':/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},
          {'base':'Z', 'letters':/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},
          {'base':'a', 'letters':/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},
          {'base':'aa','letters':/[\uA733]/g},
          {'base':'ae','letters':/[\u00E6\u01FD\u01E3]/g},
          {'base':'ao','letters':/[\uA735]/g},
          {'base':'au','letters':/[\uA737]/g},
          {'base':'av','letters':/[\uA739\uA73B]/g},
          {'base':'ay','letters':/[\uA73D]/g},
          {'base':'b', 'letters':/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
          {'base':'c', 'letters':/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
          {'base':'d', 'letters':/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},
          {'base':'dz','letters':/[\u01F3\u01C6]/g},
          {'base':'e', 'letters':/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},
          {'base':'f', 'letters':/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
          {'base':'g', 'letters':/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},
          {'base':'h', 'letters':/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},
          {'base':'hv','letters':/[\u0195]/g},
          {'base':'i', 'letters':/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},
          {'base':'j', 'letters':/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
          {'base':'k', 'letters':/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},
          {'base':'l', 'letters':/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},
          {'base':'lj','letters':/[\u01C9]/g},
          {'base':'m', 'letters':/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
          {'base':'n', 'letters':/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},
          {'base':'nj','letters':/[\u01CC]/g},
          {'base':'o', 'letters':/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},
          {'base':'oi','letters':/[\u01A3]/g},
          {'base':'ou','letters':/[\u0223]/g},
          {'base':'oo','letters':/[\uA74F]/g},
          {'base':'p','letters':/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
          {'base':'q','letters':/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
          {'base':'r','letters':/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},
          {'base':'s','letters':/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},
          {'base':'t','letters':/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},
          {'base':'tz','letters':/[\uA729]/g},
          {'base':'u','letters':/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},
          {'base':'v','letters':/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
          {'base':'vy','letters':/[\uA761]/g},
          {'base':'w','letters':/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
          {'base':'x','letters':/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
          {'base':'y','letters':/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},
          {'base':'z','letters':/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}
        ];
      
        for(var i=0; i<defaultDiacriticsRemovalMap.length; i++) {
          str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
        }
      
        return str;
      
    },



    /*************************************************************************/
    /*************************************************************************/
    
    /**************      WEB TOOLS             *******************************/
    
    /*************************************************************************/
    /*************************************************************************/

    /**
     * Uses a template to render a recordset, one row for each record.
     * 
     * @example:
     *  Template:
     *      <span><b>First Name: </b>@firstName<b> Last Name: </b>@lastName</span><br>
     * 
     *  data:
     *   [
     *      {firstName: "Abe", lastName: "anderson"},
     *      {firstName: "Sally", lastName: "Smith"}
     *   ]
     * 
     * @param {object} data - the data in recordset [{}] format
     * @param {string} templateID - the ID of the template to use
     * @param {*} parentID - the ID of the parent DIV 
     */
    
    loopTemplate: function(data, templateID, parentID) {
        //get the template as a string
        var template = '';
        template = document.getElementById(templateID).innerHTML;

        //generate the content by iterating through the recordset and replacing
        //all the @fieldName tags where they match
        var content = '';
        var row = '';
        for (var i=0; i<data.length; i++) {
            //create a new row based on the template
            var row = template;
            //iterate through the recordset and replace all the @tags with the value
            Object.keys(data[i]).forEach(function(fieldName) {
                row = row.replace(new RegExp('@' + fieldName, 'g'), data[i][fieldName]);
            });
            content = content + row;
        }

        //insert the generated html into the parent div
        document.getElementById(parentID).innerHTML = content;
    },

    /**
    * Selects (highlights) the content of an element such as a DIV
    * @param {string} elementID - the element to highlight/select
    */
    selectElement: function(elementID) {
        var range = null;
        // @ts-ignore
        if (document.selection) {
            // @ts-ignore
            range = document.body.createTextRange();
            // @ts-ignore
            range.moveToElementText(document.getElementById(elementID));
            range.select();
        } else if (window.getSelection) {
            range = document.createRange();
            // @ts-ignore
            range.selectNode(document.getElementById(elementID));
            window.getSelection().addRange(range);
        }
    },

    /**
     * Copy text/content to the clipboard
     * @param {string} elementID -The container element
     * @param {*} delay - how long to wait before de-selecting the element
     * 
     */
    copyText: function(elementID, delay) {
        if (typeof delay === 'undefined') { delay = 250; }

        this.selectElement(elementID);
        document.execCommand("copy");
                setTimeout(function() {
                    if (window.getSelection) {
                        if (window.getSelection().empty) {  // Chrome
                            window.getSelection().empty();
                        } else if (window.getSelection().removeAllRanges) {  // Firefox
                            window.getSelection().removeAllRanges();
                        }
                    // @ts-ignore
                    } else if (document.selection) {  // IE?
                        // @ts-ignore
                        document.selection.empty();
                    }
        }, delay);
    },
    /**
     * Creates handlers for a text box to run a search
     * @param {string} controlName -Name of the text box
     * @param {number} typeSpeed -Delay in ms to wait after keypresses
     * @param {function} searchFunc -command to run to initiate the search 
     * @param {function} [enterFunc] -command to run when enter key is pressed
     * 
     * -Search and enter funcs pass the value of the text box
     */
    searchBox: function(controlName, typeSpeed, searchFunc, enterFunc) {
        var typing;

        function runSearch() {
            window.clearTimeout(typing);
            typing = window.setTimeout(function() {
                if (typeof searchFunc === 'function') {
                    var value = $('#' + controlName).val();
                    searchFunc(value);
                }
            }, typeSpeed);
        }

        function runEnter() {
            if (typeof enterFunc === 'function') {
                var value = $('#' + controlName).val();
                enterFunc(value);
            }
        }

        $('#' + controlName).on('keyup', function(e) {
            var key = e.which || e.keyCode;
            if (key === 13) {
                runEnter();    
            } else {
                runSearch();   
            }
        });

        // @ts-ignore
        $('#' + controlName).on('paste', function(e) {
            runSearch();   
        });

        // @ts-ignore
        $('#' + controlName).on('cut', function(e) {
            runSearch();   
        });
        
    },

    /**
     * Converts provided CSS units (rem, em, vw, vh) into pixel values.
     * 
     * @param {string} unitString - The unit string to be converted. Examples: '2rem', '3em', '50vw'.
     *                            If only the unit (e.g., 'em') is provided:
     *                            - For 'rem' and 'em', a default value of 1 is assumed.
     *                            - For 'vw' and 'vh', a default value of 100 is assumed.
     * @param {string} [parentId] - The ID of the parent element (only applicable when unit is 'em').
     *                            If not provided and unit is 'em', document's font size is used.
     * 
     * @returns {number} The computed pixel value.
     * 
     * @throws Will throw an error if the provided unit string is invalid or if the parent element is not found.
     */
    convertToPixels: function(unitString, parentId = null) {
        let value;
        let unit;

        // Parse the unitString
        const match = unitString.match(/^([\d.]+)?(rem|em|vh|vw)$/);

        if (!match) {
            throw new Error('Invalid unit string provided.');
        }

        if (match[1]) {
            value = parseFloat(match[1]);
        } else {
            if (match[2] === "rem" || match[2] === "em") {
                value = 1;
            } else {
                value = 100;
            }
        }

        unit = match[2];

        let computedValue;

        switch (unit) {
            case 'rem':
                const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
                computedValue = value * rootFontSize;
                break;
            case 'em':
                if (parentId) {
                    const parentElement = document.getElementById(parentId);
                    if (!parentElement) {
                        throw new Error('Parent element not found.');
                    }
                    const parentFontSize = parseFloat(getComputedStyle(parentElement).fontSize);
                    computedValue = value * parentFontSize;
                } else {
                    const defaultFontSize = parseFloat(getComputedStyle(document.body).fontSize);
                    computedValue = value * defaultFontSize;
                }
                break;
            case 'vw':
                computedValue = value * window.innerWidth / 100;
                break;
            case 'vh':
                computedValue = value * window.innerHeight / 100;
                break;
            default:
                throw new Error('Invalid unit provided.');
        }

        return computedValue;
    },

    /**
     * Gets the width and height of a screen element or the viewport.
     * 
     * If a string (ID of an element) is provided, it will return the dimensions 
     * of the element with that ID. If a DOM object is provided, it will return
     * the dimensions of that element. If no parameter or an invalid parameter is
     * provided, it will return the viewport dimensions.
     * 
     * @param {string|HTMLElement} [input] - The ID of a DOM element or the DOM element itself.
     * @returns {Object|string} An object with width and height properties or an error string.
     */
    getElementDimensions: function(input) {
        var element;

        if (typeof input === 'string') {
            element = document.getElementById(input);
            if (!element) {
                return "Element with ID '" + input + "' not found.";
            }
        } else {
            element = input;
        }

        if (!element && typeof window !== 'undefined') {
            // Return viewport dimensions if no element provided
            return {
                width: window.innerWidth || document.documentElement.clientWidth,
                height: window.innerHeight || document.documentElement.clientHeight
            };
        }

        if (element && element.nodeType === 1) {
            // Return dimensions of the DOM object if provided
            return {
                width: element.offsetWidth,
                height: element.offsetHeight
            };
        }

        return "Invalid argument provided or environment not supported.";
    },


    /**
     * Initiates a download of a text file
     * @param {string} filename -The filename
     * @param {string} text -The context of the file
     */
    downloadTextFile: function(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    },
    /**
     * Fills a select control with data from a table or recordset
     * @param {string} controlID - The control to fill
     * @param {Object} data - The table or recordset
     * @param {string|number} idField - The field in the table/recordset to use as the id
     * @param {string|number} valuefield - The field to use as the value
     * @param {string} [defaultValue] - The default value of the select control
     */
    fillSelect: function(controlID, data, idField, valueField, defaultValue) {
        //fills a select control with the data from a table or recordset
        
        var html = "";
        var row = 0;
        //verify that we have an array as our primary object
        //if (data.constructor !== Array) { return false; } //TODO: Restore this check
        if (data[0].constructor === Array) {
            for (row=0; row<data.length; row++){
                html += '<option value="' + data[row][0] + '">';
                html += data[row][1];
                html += '</option>';
            }
        } else { //assume recordset
            //TODO: allow default behavior
            //quit if the id or value fields are not defined
            if (typeof idField === 'undefined' || typeof valueField === 'undefined') { return false; }
            for (row=0; row<data.length; row++){
                html += '<option value="' + data[row][idField] + '">';
                html += data[row][valueField];
                html += '</option>';
            }
        }

        $('#' + controlID).html(html);

        if (typeof defaultValue !== 'undefined') {
            $('#' + controlID).val(defaultValue);
        }
    },
    //the first time you call an error/popup/progressbar/etc it removes the 
    //content from the page and stores it inside this object as a string. On further calls it 
    //uses the stored version. This helps prevent id collisions and you can feel confident that
    //only one copy of the layout structure is ever on the page at one time.
    userTemplates: {}, 

    getLayout: function(layout) {
        /*  Returns a string value to be used as HTML layout
            will either return the contents of a div using the #id style or
            will return the same string that was passed
                -layout: the #id or string
        */
        if (layout) {
            if (layout.substring(0,1) === '#') {
                //loads the content of the message via the id supplied
                var id = layout.substring(1,layout.length); // #layout --> layout
                if (typeof jwf.userTemplates[id] === 'undefined') {
                    jwf.userTemplates[id] = $(layout).html(); //not loaded so add to the template array
                    $(layout).remove(); //remove it from the page
                }
                return jwf.userTemplates[id];
            } else {
                return layout; //pass back the original layout string
            }
        } else {
            return '';
        }
    },

    debugCount: 0,
    debugVisible: false,

    debug: function(info) {
        var debugtxt = $('#debug').html();
        jwf.debugCount++; 
        $('#debug').empty();
        $('#debug').html(jwf.debugCount + ": " + info + '</br>' + debugtxt); 
    },


    addDebug: function(visible) {
        var cssParent = {
            'background-color': 'white',
            'color': 'black',
            'position': 'fixed',
            'width': '300px',
            'height': '40px',
            'left': '50px',
            'margin-bottom': '0px',
            'bottom':'0',
            'border': '1px solid black',
            'box-shadow': '10px 10px 5px 0px rgba(0,0,0,0.15)',
            'border-top-left-radius': '15px',
            'border-top-right-radius': '15px',
            'padding': '5px',   
            'transition': '0.25s',
            'z-index': '999',
            'display': 'block',
            'font-family': 'monospace' 
        };

        var cssDebug = {
            'position': 'absolute',
            'height': '95%',
            'width': '99%',
            'overflow-y': 'scroll',
            'padding': '5px',
        };
        
        var cssShow = {
            'font-family': 'Arial, Helvetica, sans-serif',
            'font-size': 'x-large',
            'position':'absolute',
            'right':'0px',
            'margin': '5px',
            'margin-right': '25px',
            'color': 'gray'
        };

        var html = '<!--***********************************************--><div id="debug-parent"><div id="debug"></div><div id="debug-show">Debug</div></div>';

        $(document.body).append(html);
        $('#debug-parent').css(cssParent);
        $('#debug').css(cssDebug);
        $('#debug-show').css(cssShow);

        $('#debug-show').click(function() {
            if (jwf.debugVisible === true) {
                $('#debug-parent').css({"height":"40px", "width": "300px"});
                jwf.debugVisible = false;
            } else {
                $('#debug-parent').css({"height":"45%", "width": "90%"});
                jwf.debugVisible = true;
            }
        });
        //set to visible if specified by user
        if (visible === true) {
            $('#debug-parent').css({"height":"45%", "width": "90%"});
            jwf.debugVisible = true;
        }
    },

    /**
     * Listens for the window resize event and calls `getElementDimensions` after
     * a delay of 500ms to retrieve the new viewport dimensions, then prints the
     * result to the console.
     */
     logDimensionsOnResize: function() {
        var resizeTimeout;
        var _self = this;
        // This event listener will be triggered whenever the window is resized.
        window.addEventListener('resize', function() {
            // If there's an existing timeout, clear it
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            
            // Set a new timeout to avoid calling the function multiple times 
            // during a resize event
            resizeTimeout = setTimeout(function() {
                var dimensions = _self.getElementDimensions();
                _self.debug("New Dimensions: " + JSON.stringify(dimensions));
            }, 500);
        });
    },


    createHTMLTable: function(options) {
        //creates an html table and returns as a string
        /*
            -options {
                data: The data to display in either table or recordset format
                fields: [string], provide or override the field names (column headers)
                    -false = no header row
                    -blank, null = try to get from data or no header row
                id: string, an ID to apply to the table
                class: string, a class or classes to apply to the table
                widths: array of CSS widths
        */

    if (typeof options.widths === 'undefined' || options.widths === null) { options.widths = []; }

        var html = '';
        var table = '<table '; //start the table
        if (typeof options.id === 'string') { table += 'id="@id" '; } //add an id tag
        if (typeof options.class === 'string') { table += 'class="@class"'; } //add a class tag
        table +='>@cols@header<tbody>@body</tbody></table>'; //finish the template

        //if the fields are blank, try to get them from the first row
        if (options.fields === null || typeof options.fields === 'undefined') {
            if (options.data[0].constructor === Array) {
                options.fields = false; //no fields provided and no fields available
            } else {
                options.fields = [];
                Object.keys(options.data[0]).forEach(function(field) {
                    options.fields.push(field);
                });                        
            }
        }


        var header = '';
        var body = '';
        var cols = '';
        if (options.id) {
            cols = '<colgroup>';
            for(var c=0; c<options.data[0].length; c++) {
                cols += '<col class="' + options.id + '-col-' + c + '">';
            }
            cols += '</colgroup>';
        }

        //create the header
        if (options.fields) {
            header = '<thead><tr>';
            for (var field=0; field<options.fields.length; field++) {
                header += '<th class="' + ' col' + field + '">' + options.fields[field] + '</th>';
            }
            header += '</tr></thead>';
        }

        //create the body
        if (options.data[0].constructor !== Array) {
            options.data = this.recordsetToTable(options.data);
        }
        var name = ''; //this is used to give every cell a unique id

        for (var row=0; row<options.data.length; row++) {
            body += '<tr id="' + options.id + '-row-' + row + '"';
            if (row === options.data.length-1) {
                body += 'class="lastrow"';
            } 
            body += '>';
            for (var col=0; col<options.data[row].length; col++) {
                var width = options.widths[col] ? options.widths[col] : '';
                if (options.id) { name = options.id + '-' + row + '-' + col; }
                body += '<td id="' + name + '" class="col' + col + '" style="width:' + width + '">' + options.data[row][col] + '</td>';
            }
            body += '</tr>';
        }

        html = table.replace('@id', options.id)
            .replace('@class', options.class)
            .replace('@cols', cols)
            .replace('@header', header)
            .replace('@body', body);

    return html;
    },

    verifyStyle: function(selector) {
        /* This function is from experts-exchange
        user: ljo8877
        ID: 15625961, 2006-01-05
        https://www.experts-exchange.com/questions/21685655/JavaScript-Checking-if-a-CSS-class-exists.html
        */
        var rules;
        var haveRule = false;

        if (typeof document.styleSheets != "undefined") {   //is this supported
            var cssSheets = document.styleSheets;

            outerLoop:
            for (var i = 0; i < cssSheets.length; i++) {

                //using IE or FireFox/Standards Compliant
                // @ts-ignore
                rules =  (typeof cssSheets[i].cssRules != "undefined") ? cssSheets[i].cssRules : cssSheets[i].rules;

                for (var j = 0; j < rules.length; j++) {
                    if (rules[j].selectorText == selector) {
                            haveRule = true;
                            break outerLoop;
                    }
                }
            }
        }
        return haveRule;
    },






    


};


/******************************************************************************/
/******************************************************************************/
if (typeof window === 'undefined') {
    //node.js
    module.exports = jwf;
} 


