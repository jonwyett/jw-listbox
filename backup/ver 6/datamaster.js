/**
 * ver 4.0.0 2023/11/27
 *  -Added DataQuery
 *  -BREAKING: The node exports section now exports both DataMaster and DataQuery
 * ver 3.3.0 
 *  -Updated sort to allow sorting by arbitrary fields/desc
 *  -Updated getRow to allow for ID searching 
 *  -Added support for * in advanced search
 * ver 3.2.1 2023/09/07
 *  -fixed issue with constructor using "out-of-order" recordset
 * ver 3.2.0 2023/09/05
 *  -add advanced search/limit
 * ver 3.1.0 2023/08/29
 *  -updated search/limit to support multiple search fields
 *  -Fixed major bug in search/limit where multiple records were returned for each result
 * 
 * ver 3.0.0 2023/08/29
 */


/**
 * TODO
 *  -regex should maybe be detected or have a flag so it can be used in a search without a func
 *      
 * 
 */





 /**
 * Creates a DataMaster object
 * 
 * @param {(object|string)} data - Recordtable, Recordset, Table, CSV, TSV
 * @param {(string[]|boolean)} [fields] - Array of fieldnames or true to use the first row as fieldnames
 * @param {object} [options] - Various advanced options
 * @param {boolean} [options.isTSV] - Tab Separated Values are being provided as the data
 * @param {boolean} [options.noCR] - Newlines are \n only, not \r\n
 * @example
 *  var data = [
 *      ['col1','col2','col3'],
 *      ['a','b','c'],
 *      [1,2,3]
 *  ];  
 *  var myData = new DataMaster(data,true);
 */
var DataMaster = function(data, fields, options) {
    //A recordtable is a data structure consisting of data in a "table" (an array of arrays: [[]])
    //and a field listing as an array. Essentially it's a compressed recordset.
    //It is meant to simplify working with data output from a database, so it assumes that all rows
    //have the same number of columns.
    //Here is a comparison of "table", "recordset" and "recordtable" data styles:
    /* 
        table = [
            [1, 'Anna', true],
            [2, 'Bob', true],
            [3, 'Cindy', false]
        ]
        recordset = [
            {id:1, Name:'Anna', Alive:true},
            {id:2, Name:'Bob', Alive:true},
            {id:3, Name:'Cindy', Alive:false}
        ]
        recordtable = {
            fields: ['id', 'Name', 'Alive']
            data: [
                [1, 'Anna', true],
                [2, 'Bob', true],
                [3, 'Cindy', false]
            ]
        }
    */

    //Params:
    /*
        data: excepts either a table, recordset or recordtable
        fields: (array), the names of the fields.
            Will overwrite any exiting field names if data is a recordset
    */

    //Create the recordtable structure
    var _self = this;
    var _table = [];
    var _fields = [];
    this.valid = true; //this will be set to false if invalid data is passed in the constructor
    if (typeof options === 'undefined') { options = {}; }

    (function startup() {
        //determine if a table or recordset was passed
        try {
            //check for a recordtable
            if (Array.isArray(data.table) && Array.isArray(data.fields)) {
                _table = copy(data.table);
                _fields = copy(data.fields);
            } else {
                //check if the first element in the data param is an array (if so assume a table was passed)
                if (Array.isArray(data[0])) {
                    _table = copy(data); //make a copy of the data
                    createFields(); //create default fields
                    if (Array.isArray(fields)) { createFields(fields); } //create the fields based on the passed fieldnames
                    else if (fields === true) { //when set explicitly to true, the first row is treated as the fieldnames
                        createFields(_table[0]); //use the first row as the field names
                        _table.splice(0, 1); //remove the first row since it's actually the field names
                    }
                } else if (typeof data === 'string') {
                    _table = csvToTable(data, options.isTSV, options.noCR);
                    createFields(); //create default fields
                    if (Array.isArray(fields)) { createFields(fields); } //create the fields based on the passed fieldnames
                    else if (fields === true) { //when set explicitly to true, the first row is treated as the fieldnames
                        createFields(_table[0]); //use the first row as the field names
                        _table.splice(0, 1); //remove the first row since it's actually the field names
                    }
                } else { //since the first row is not an array or string,  assume a valid recordset
                    
                    var rTable = recordsetToRecordTable(data); //create a recordtable from the data
                    _table = rTable.table; //set the _table to the table part (will not be a reference to the original data)
                    createFields(); //create default fields
                    createFields(rTable.fields); //create the fields based on the fields part
                    if (fields) { createFields(fields); } //overwrite recordset fields with potentially provided fields.
                }
            }
        } catch (e) {
            this.valid = false;
        }
    })();

    /******* INTERNAL FUNCTIONS **********************************************************/

    function csvToTable(csv, isTSV, noCR) {
        //create the recordtable
        var table = [];
    
        var sep = ','; //the separator char
        if (isTSV) { sep = '\t'; }
        var cr = '\r\n'; //the carriage return char

        //LF (Newline. \n) only, no Carriage return (CR, \r)
        //this is what will be passed from an html text field
        //or from a multi-line string in javascript

        if (noCR) { cr = '\n'; }
        
        var cell = ''; //the cell buffer
        var row = []; //the row buffer
        var started = false; //have we started reading a cell yet
        var protectedMode = false; //is the cell surrounded by quotes.
        var cursor = 0; //loop var
    
        function isChar(str) {
            //this is just a helper function to make the following loop cleaner
            //char is the string you want to test against, it's meant to allow for testing
            //of multiple char strings that should be treated as a single char
            //it will use the previously declared csv and cursor vars and auto-advance
            //the cursor by the length your testing against if the match is found
            
            var test = '';
            var l = str.length;
            //for each char in the str, create a corresponding test string from the csv
            for (var i=0; i<l; i++) { test += csv[cursor+i]; }
    
            if (str === test) {
                cursor += l;
                return true;
            } else {
                return false;
            }
        }
    
        while (cursor<csv.length) {
            //we are going to reset all the vars on state change just to be safe
            if (started) { //we've entered the started state
                if (protectedMode) { //we're in protected mode
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
                    } else if (isChar('\"\"')) { //double quotes read as single quotes
                       cell += '"';
                    } else { //we found a general cell char
                        cell += csv[cursor];
                        cursor++;
                    }
                } else { //not protected mode
                    if (isChar(sep)) { //found a separator
                        row.push(cell);
                        cell = '';
                        started = false;
                        protectedMode = false;
                    } else if (isChar(cr)) { //found a carriage return
                        row.push(cell);
                        cell = '';
                        table.push(row);
                        row = [];
                        started = false;
                        protectedMode = false;
                    } else if (isChar('""')) { //double quotes read as single quotes
                        cell += '"';
                    } else {
                        cell += csv[cursor];
                        cursor++;
                    }
                }
            } else { //we are not yet reading a cell
                //remember that if isChar returns true it auto-increments the cursor
                if (isChar('"')) {//first check for a quote to see if we are in protected mode.
                    protectedMode = true;
                    started = true;
                } else if (isChar(sep)) { //we found a separator char
                    row.push(cell);
                    cell = '';
                    started = false;
                    protectedMode = false;
                } else if (isChar(cr)) { //we found a carriage return
                    table.push(row);
                    row = [];
                    cell = '';
                    started = false;
                    protectedMode = false;    
                } else { //we've found something else, so start the cell
                    cell = csv[cursor];
                    started = true;
                    protectedMode = false;  
                    cursor++; 
                }
            }
        } 
    
        return table;
    }

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
    function multiFieldSort(fields, directions, primers) {
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
    }

    function sortBy(field, desc, primer) {
        
        var key = primer ? 
                function(x) { return primer(x[field]); } : 
                function(x) { return x[field]; };
        
        desc = !desc ? 1 : -1;
        
        return function (a, b) {
            return a = key(a), b = key(b), desc * ((a > b) - (b > a));
        }; 
    }

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
    function multiFieldSort(fields, directions, primers) {
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
    }

    function copy(data) {
        return JSON.parse(JSON.stringify(data));
    }

    function findFieldIndex(fields, field) {
        if (typeof field === 'number') {
            if (field <fields.length) {
                return field;
            } else {
                return false;
            }
        } else {
            for (var f=0; f<_fields.length; f++) {
                if (fields[f] === field) { //hard check
                    return f;
                }
            }
        }
        //it wasn't found
        return false;
    }

    function createFields(fields) {
        //creates fieldnames based on the passed fields
        //if fields is undefined then creates an array of indexes: [0,1,2,3...]
        //running this twice, once with no fields and then again with fields will allow
        //passing a shorter list of fields then there are columns but still have a value 
        //for each column
        if (typeof fields === 'undefined') {
            //reset the internal fields array
            _fields = [];
            for (var i=0; i<_table[0].length; i++) {
                _fields.push(i.toString());
            }    
        } else {
            var max = (_fields.length < fields.length) ? _fields.length : fields.length; //get the shorter of the two
            for (var f=0; f<max; f++) {
                _fields[f] = fields[f];
            }
        }
    }

    function recordsetToRecordTable(data) {
        //converts recordset style data into a recordtable
        /* Params:
            -data: a data to convert
        */
        // Initialize fieldNames and table variables
        var fieldNames = Object.keys(data[0]);
        var table = [];
    
        // Fill the table array
        for (var i = 0; i < data.length; i++) {
            var row = [];
            for (var j = 0; j < fieldNames.length; j++) {
                var fieldName = fieldNames[j];
                if (data[i].hasOwnProperty(fieldName)) {
                    row.push(data[i][fieldName]);
                } 
            }
            table.push(row);
        }
        
        return {
            table: table,
            fields: fieldNames
        };
    }

    function reorderData(table, fields, order) {
        //returns data in the order of the provided fields. 
        //fields that are not provided will not be returned
        /* Params:
            -table: the table data to be reordered
            -fields: the field names for the table
            -order: the fields/indexes to be returned
        */
        var res = {
            table: [],
            fields: []
        };
        try {
            //first get the fields as indexes
            var fieldIndexes = [];
            for (var o=0; o<order.length; o++) {
                var index = findFieldIndex(fields, order[o]);
                if (index !== false) {
                    fieldIndexes.push(index);
                }
            }
            //now for each row push the values in the columns from fieldIndex array
            var rowData;
            for (var r=0; r<table.length; r++) {
                rowData = [];
                for (var i=0; i<fieldIndexes.length; i++) {
                    rowData.push(table[r][fieldIndexes[i]]);
                }
                res.table.push(rowData);
            }

            //finally push the fieldnames provided in order into the res.fields array
            //if an index was used in order convert it to a string

            for (var f=0; f<order.length; f++) {
                //if the order pushed was an index, push the fieldName at that index
                if (typeof order[f] === 'number') {
                    res.fields.push(fields[order[f]]);
                } else if (findFieldIndex(fields, order[f]) !== false) { //verify that the field in order[f] exists
                    res.fields.push(order[f]); //if so push it in
                }
            }
        }
        catch (e) { return res; }

        return res;
    }

    function itemInList(list, item) {
        //checks to see if an item is in a list, such as a particular string
        //this looks for a soft equivalence, so 1 = '1' etc
        /* Params:
            -list: array[], the list of things to check against
            -item: the thing we're checking for
        */

        if (list.constructor !== Array) { return false; }
    
        for (var i=0; i<list.length; i++) {
            if (list[i] == item) { return true; } //soft check
        }
    
        return false;
    
    
    }

    function getTableColumn(table, column, distinct) {
        //returns a single column from a table
        /* Params:
            -column: (num), the index of the column to return
            -distinct: (bool), no duplicates
        */

        var col = [];
        try {
            //push the column into an Array, row by row
            for (var row=0; row<table.length; row++) {
                if (distinct) {
                    //if distinct, see if the item is already in the col array
                    if (!itemInList(col, table[row][column])) {
                        col.push(table[row][column]); //if not then go ahead and push
                    }
                } else {
                    col.push(table[row][column]);
                }
            }
            return col;   
        } catch (e) {
            return [];
        }
    }

    function recordtableToRecordset(rTable) {
        //converts a recordtable to a recordset
        /* Params:
            -rTable: the recordtable to convert
        */
    
        var res = [];
        var rowData;
        for (var row=0; row<rTable.table.length; row++) {
            rowData = {};
            for (var field=0; field<rTable.fields.length; field++) {
                rowData[rTable.fields[field]] = rTable.table[row][field];
            }
            res.push(rowData);
        }
        return res;
    }

    function createCSV(data, options) {
        //creates a CSV string from the table data 
        /* Params:
            -data: a recordtable to convert
            -Options = {
                -startRow: (num) row to start export from
                -startCol: (num) column to start export from
                -newLineString: (string) newline character
                -removeNewLines: (bool) don't include newlines (better readability in excel)
                -skipFields: (bool) don't include column headers
            }
        */
        if (typeof options === 'undefined') { options = {}; }
        if (typeof options.newLineString === 'undefined') { options.newLineString = '\r\n'; }
        if (typeof options.startCol === 'undefined') { options.startCol = 0; } 
        if (typeof options.startRow === 'undefined') { options.startRow = 0; } 

        var CSV = '';
        
        function escape(val) {
            //escapes a string so it doesn't break the CSV format
            /* Params:
                -val: the string to escape
            */
            if (typeof val === 'undefined' || val === null) { val = ''; }
            val = val.toString();
            
            //replace multiple quotes with single quotes
            val = val.replace(/"{2,}/g, '"');
            //replace single quotes with double quotes
            val = val.replace(/"/g, '""');
            if (options.removeNewLines) {
                val = val.replace(/(\r\n|\r|\n)/g, ' ');
            }

            val = '"' + val + '"'; //encapsulate everything
            return val;
        }

        if (options.skipFields !== true) { 
            //start by adding the fieldnames
            for (var f=0; f<data.fields.length; f++) {
                CSV += escape(data.fields[f]) + ',';
            }
            CSV = CSV.substring(0, CSV.length-1); //remove trailing ,
            CSV += options.newLineString; //add the line break
        }
        
        //now iterate through the table
        for (var r=options.startRow; r<data.table.length; r++) {
            for (var c=options.startCol; c<data.table[r].length; c++) {
                CSV += escape(data.table[r][c]) + ',';
            }

            CSV = CSV.substring(0, CSV.length-1); //remove trailing ,
            CSV += options.newLineString; //add the line break
        }

        return CSV;
    }

    function advancedSearch(query, queryFunctions) {
        /*
          Here's the basics of how this function works:
          
          Table:
            Firstname | Lastname | Status | Email
            Billy     | Smith    | Normal | name@gmail.com
            Sarah     | Harper   | VIP    | name@hotmail.com
            .....     | .....    | .....  | .....
            etc..     | etc..    | etc..  | etc..
          
          Query:
          (Lastname='smith' OR Lastname='jones' OR Lastname='baker') AND ((Email='%gmail.com OR Email=%aol.com) OR Status='VIP'))
      
          1) Convert the query so that the field names are replaced with the index of the field in the table
            (1='smith' OR 1='jones' OR 1='baker) AND ((3='%gmail.com OR 3=%aol.com) OR 2='VIP'))
      
          2) Loop through the table and find each expression and evaluate them as true/false.
            For the first expression, 1='smith' the program runs a wildcard-enabled comparison between the value in 
            table[row][1] "Smith" and the value in the single-quotes 'smith' which evaluates to 'true', and then so on for
            each expression, resulting in the string:
            (true OR false OR false OR false) AND ((true OR false) OR false))
      
          3) Recursively loop though each parenthesis and then evaluate the underlying boolean
            - (true OR false OR false OR false) AND ((true OR false) OR false)) 
                - (true OR false OR false OR false) = true
            - true AND ((true OR false) OR false)) 
                - ((true OR false) OR false)) 
                  - (true OR false) = true
            - true AND (true or false)
                - (true or false) = true
            - true AND true
            - true
      
          4) If step #3 is true then add that row to the result table
      
          5) Return the result table
      
          The two main steps, #2 and #3, each use a helper function to assist them. For #2 the outer function finds the expressions
          and the inner function evaluates them against the table data. For #3 the outer function finds the parenthesis
          and then the inner function evaluates the boolean expression within. The outer function runs recursively until there
          are no more parenthesis and the final result is either true or false.
        */
      
        /*
          Query Language Specifications:
          Basic format:
          FieldName='value' AND (FieldName!='value' OR FieldName='value')
      
          -FieldName is case-sensitive
          -You may use = or != as the operator (equal/not equal)
          -The 'value' must be enclosed in single-quotes
          -The value is not case sensitive
          -The value will be checked against numbers using a loose equivalency ('23'=23=true)
          -You may use _ or % as wildcards in the value
          -You may use the OR and AND comparison operators (UPPERCASE). != is equivalent to SQL NOT AND, so effectively OR, AND, AND NOT.
          -You may (and should) use as many nested parenthesis as needed to create your order of operations
          -AND takes precedence over OR, but again, use parenthesis and order your query to avoid AND/OR ambiguities
          -The parser is not designed to handle any extra whitespace
          -If you pass anything that the parser is confused by you will get the whole data table back.
          -Functions:
            -If you pass an object of functions you may include them in the query using a '$' to designate the function: LastName='/myFunc(param1, param2)'
              -You do not need to wrap param strings in quotes
            -In this case you must supply the queryFunctions param as:
              {
                myfunc: function(testValue, params) {
                  return testValue < params[0] + params[1] ? true : false;
                }
              }
            -If there is no function match found in the queryFunctions object then the value will be tested as is:
              LastName='/missingFunc', including the /
            -Your custom function must return a boolean true/false
        */
      
        /****************************************************************************/  
        /****** Support functions ***************************************************/
        /****************************************************************************/  
      
        function looseCaseInsensitiveCompare(value, query, forceCaseSensitivity) {
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
              regexStr += query[i];
            }
          }
          var regex = new RegExp(`^${regexStr}$`);
          var result = regex.test(value);
          return result;
        }
        
        function parseFunctionString(functionString) {
          // Check for opening and closing paren 
          var openParenIndex = functionString.indexOf('(');
          var closeParenIndex = functionString.lastIndexOf(')');
        
          // Extract functionName and initialize arrayContent as empty array
          var functionName = openParenIndex === -1 ? 
            functionString : 
            functionString.substring(0, openParenIndex);
          let arrayContent = [];
        
          // Parse array content only if brackets are present
          if (openParenIndex !== -1 && closeParenIndex !== -1) {
            var arrayContentString = functionString.substring(
              openParenIndex + 1, closeParenIndex
            );
        
            // Wrap arrayContentString with brackets and evaluate to create array
            try {
              arrayContent = eval('[' + arrayContentString + ']');
            } catch (error) {
              return functionString;
            }
          }
        
          return {
            name: functionName,
            params: arrayContent
          };
        }
      
        function evaluateSingleOperation(data, operation) {
          var operatorPattern = /(=|!=)/g;
          var [index, operator, value] = operation.split(operatorPattern);
          //remove the ' ' from the value
          value = value.replace(/['"]/g, '');
          //verify that the index is valid
          if (!isNaN(index) && index < data.length) {
            var matchFound = false; 
            
            if (value.charAt(0) === '$') {
              var functionString = value.substring(1);
              var functionParts = parseFunctionString(functionString);
              var functionName = functionParts.name;
              var functionParams = functionParts.params;
              if (typeof queryFunctions !== 'undefined') {
                if (typeof queryFunctions[functionName] === 'function') {
                  matchFound = queryFunctions[functionName](data[index], functionParams);
                } else {
                  matchFound = looseCaseInsensitiveCompare(data[index], value);  
                }
              }
            } else { 
              matchFound = looseCaseInsensitiveCompare(data[index], value);
            }
            
            //invert matchFound if the operator is !=
            matchFound = operator === '!='? !matchFound : matchFound;
      
            //convert the boolean to string and return
            if (matchFound) {
              return 'true'
            } else {
              return 'false'
            }
          }
      
          return 'false';
        }
       
        function replaceAndEvaluateExpressions(data, query) {
          var regex = /\d+\s*(?:!=|=)\s*'[^']*'/g;
          let match;
          let modifiedStr = query;
        
          while ((match = regex.exec(query)) !== null) {
            var expression = match[0];
            var evaluatedValue = evaluateSingleOperation(data, expression);
            modifiedStr = modifiedStr.replace(expression, evaluatedValue);
          }
        
          return modifiedStr;
        }
      
        function evaluateLogicalExpression(expression) {
          var orParts = expression.split(' OR ');
        
          for (var orPart of orParts) {
            var andParts = orPart.split(' AND ');
            let andResult = true;
        
            for (var andPart of andParts) {
              if (andPart === 'false') {
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
      
        
        function evaluateNestedExpression(expression) {
          let start = -1;
          let end = -1;
          let depth = 0;
        
          // Find the inner-most parentheses
          for (let i = 0; i < expression.length; i++) {
            if (expression[i] === '(') {
              if (start === -1) {
                start = i;
              }
              depth++;
            } else if (expression[i] === ')') {
              depth--;
              if (depth === 0) {
                end = i;
                break;
              }
            }
          }
        
          // Base case: if no parentheses are found, evaluate the expression directly
          if (start === -1 || end === -1) {
            return evaluateLogicalExpression(expression) ? 'true' : 'false';
          }
        
          // Recursive case: evaluate the inner-most expression within the parentheses
          var innerExpression = expression.substring(start + 1, end);
          var innerResult = evaluateNestedExpression(innerExpression);
          
          // Substitute the inner result back into the original expression
          var newExpression = expression.substring(0, start) + innerResult + 
                                expression.substring(end + 1);
        
          // Recursively evaluate the new expression
          return evaluateNestedExpression(newExpression);
        }

        function expandAllFields(query, fields) {
            // Regular expression to match OR*=, OR*!=, AND*=, AND*!=
            const pattern = /(OR|AND)\*\s*(=|!=)\s*\'([^\']+)\'/g;
        
            // Replacement function
            function replaceMatch(match, logicalOperator, operator, value) {
                const conditions = fields.map(column => `${column}${operator}'${value}'`);
                const joiner = logicalOperator === 'OR' ? ' OR ' : ' AND ';
                return '(' + conditions.join(joiner) + ')';
            }
        
            // Perform the replacement
            return query.replace(pattern, replaceMatch);
        }
      
        /***************************************************************************/
        /***************************************************************************/
        /***************************************************************************/
      
        //run the expansion for the * operator
        query = expandAllFields(query, _fields);
        
        //The data to return with the matching rows
        var resultData = [];
        var resultIndices = [];
      
        //convert the query into array indices
        // Replace field names with corresponding indices
        for (let i = 0; i < _fields.length; i++) {
          var fieldName = _fields[i];
          var regExpEqual = new RegExp(fieldName + '=', 'g');
          query = query.replace(regExpEqual, i.toString() + '=');
          var regExpNotEqual = new RegExp(fieldName + '!=', 'g');
          query = query.replace(regExpNotEqual, i.toString() + '!=');
        }
        

        //Loop through the data and add matches to the result
        for (var d=0; d<_table.length; d++) {
          // this turns the query into a string of boolean logic based on the 
          // result of each logical test
          // ex: "lastName='smith' OR lastName='jones'"
          // becomes: "false OR true" (assuming those are the results of the tests)
      
          var booleanExpression = replaceAndEvaluateExpressions(_table[d], query);
      
          // This evaluates the entire expression, so for the above example it would 
          // return true, since true OR false = true
          var result = evaluateNestedExpression(booleanExpression);
          
          //if the result is true, push that row into the resultData array
          if (result == 'true') {
            resultData.push(_table[d]);
            resultIndices.push(d);
          }
        }
        
        //check to make sure the resultData is a 2D array even if nothing was passed
        if (!Array.isArray(resultData[0])) { 
          resultData = [resultData];
        }
      
        //return the results
        return {
            table: resultData,
            indices: resultIndices
        };
    }

    /******* PUBLIC FUNCTIONS **********************************************************/
    

    /**
     * Exports a string representation of the DataMaster
     * @param {boolean} [consoleMode=false] - true is meant for console output false is meant for html
     * 
     * @returns {string} String representation of the DataMaster
     */
    this.debug = function (consoleMode) {
        //debugging function
        //spits out a string that represents the recordtable
        var newline = '<br>';
        var space = '&nbsp';
        if (consoleMode) {
            newline = '\r\n';
            space = ' ';
        }
        function lPad(value, length) {
            if (typeof value === 'number') { value = value.toString(); }
            if (typeof value !== 'string') {
                value = new Array(length + 1).join(space);
            } else {
                if (value.length < length) {
                    for (var c=value.length; c<length; c++) {
                        value += space;
                    }
                }
            }
            return value;
        }

        var pads = [];
        var val = '';
        for (var i=0; i<_fields.length; i++) {
            pads[i] = _fields[i].length;      
        }
        for (var r=0; r<_table.length; r++) {
            for (var c=0; c<_fields.length; c++) {
                val = _table[r][c];
                if (val === true) { val = 'true'; }
                else if (val === false) { val = 'false'; }
                else if (val === null) { val = 'null'; }
                else if (typeof val === 'undefined') { val = 'undefined'; }
                if (val.toString().length > pads[c]) { pads[c] = val.toString().length; }
            } 
        }

        var out = newline;
        out += '--|';
        for (var f=0; f<_fields.length; f++) {
            out += lPad(_fields[f], pads[f]) + '|';
        }
        out += newline;
        for (var row = 0; row<_table.length; row++) {
            out += row + (row<10 ? ' |' : '|');
            for (var col=0; col<_table[row].length; col++) {
                val = _table[row][col];
                if (val === true) { val = 'true'; }
                else if (val === false) { val = 'false'; }
                else if (val === null) { val = 'null'; }
                else if (typeof val === 'undefined') { val = 'undefined'; }
                out += lPad(val, pads[col]) + '|';
            }
            out += newline;
        }
        
        return out;
    };

    /**
     * Exports a string representation of the DataMaster
     * @param {boolean} [consoleMode=false] - true is meant for console output false is meant for html
     * 
     * @returns {string} String representation of the DataMaster
     */
    this.print = _self.debug; //this is just an alternate way to debug/print

    /**
     * Copy the DataMaster into a new object
     * @returns {Object} {fields:[], table[]}
     */
    this.copy = function() {
        //wrapper for exportAs meant for making a copy of the DataMaster
        return _self.exportAs('recordtable') ;
    };

    /**
     * Exports the DataMaster in a variety of formats
     * @param {('table'|'recordset'|'recordtable'|'spreadsheet'|'csv')} style 
     *      The style of the exported data
     *      NOTES:
     *          'spreadsheet' uses the fields as the first row
     * @param {Object} [options]
     * @param {string[]|number[]} [options.fields] - The column names or indexes to export and the order
     *      NOTES:
     *          undefined = all columns in the existing order
     * @param {number} [options.startRow=0] - The row to start export from (csv only)
     * @param {number} [options.startCol=0] - The column to start export from (csv only)
     * @param {string} [options.newLineString="\r\n"] - The string to use for newlines
     *
     * @returns {Object|string} Different styles return different types of data
     * 
     * @example
     *      exportAs('recordset',{fields:[1,3,5,4]});
     */
    this.exportAs = function(style, options) {
        //convert style to lowercase
        
        style = style.toLowerCase();
        var res = {};
        
        //if fields were provided then 
        if (typeof options !== 'undefined') {
            if (Array.isArray(options.fields)) {
                //res will be a recordtable
                res = reorderData(_table, _fields, options.fields);
            }
        } else {
            res.table = copy(_table);
            res.fields = copy(_fields);
        }
        //we now have a copy of the full recordtable or a modified one in res

        if (style === 'table') {
            return res.table;
        } else if (style === 'recordset') {
            return recordtableToRecordset(res);
        } else if (style === 'recordtable') {
            return res;
        } else if (style === 'spreadsheet') {
            res.table.unshift(_fields);
            return res.table;
        } else if (style === 'csv') {
            return createCSV(res, options);
        } else {
            return null; //no default return type.
        }
    };

    /**
     * Returns a copy of the DataMaster table
     * @returns {Object} [[]]
     */
    this.table = function() {
        return copy(_table);
    };

    /**
     * Returns a copy of the DataMaster field list
     * @returns {string[]} ['field1','field2'...]
     */
    this.fields = function() {
        return copy(_fields);
    };

    /**
     * Returns a single column from the DataMaster
     * @param {string|number} column - The column name or index to return
     * @param {boolean} [distinct=false] - No duplicates
     * 
     * @returns {string[]|null} ['val1','val2'...]
     */
    this.getColumn = function(column, distinct) {
        var index = findFieldIndex(_fields, column);
        if (index !== false) {
            return getTableColumn(_table, index, distinct);
        } else {
            return null;
        }
        
    };

    /**
     * Returns a single row from the DataMaster, by default it used the row number, but if you supply an ID
     * field then the rowID should be the ID to search for instead
     * @param {number} rowID - The row index or ID
     * @param {('array'|'table'|'recordset'|'recordtable'|'object')} [style='array'] - The return type
     *      NOTE: 'object' returns a single object {}, 'recordset' returns [{}]
     * @param {string|number} IDField - search for and use the id, 'rowID' becomes the ID to find
     * @returns {Object} Various types
     */
    this.getRow = function(rowID, style, IDField) {
        //TODO: TEST THIS
        if (IDField) {
            var rowFound = false;
            var idCol = _fields.indexOf(IDField);
            if (idCol == -1) { return null; }
            for (var i=0; i<_table.length; i++) {
                if (_table[i][idCol] == rowID) {
                    rowID = i;
                    rowFound = true;
                    break;
                }
            }
            if (!rowFound) { return null; }
        }

        if (rowID >=0 && rowID <_table.length) {
            if (typeof style !== 'undefined' && style != null) { 
                style = style.toLowerCase();
            } else {
                style = 'array';
            }

            var res = {
                table: [_table[rowID]], //this forces it to be a table, not an array
                fields: _fields
            };

            if (style === 'table') {
                return res.table;
            } else if (style === 'array') {
                return res.table[0];
            } else if (style === 'recordset') {
                return recordtableToRecordset(res);
            } else if (style === 'recordtable') {
                return res;
            } else if (style === 'object') {
                return recordtableToRecordset(res)[0];    
            } else {
                return null; //invalid return type.
            }
        } else {
            return null;
        }
    };

    
    /**
     * Sorts the DataMaster
     * @param {string|number[]} fields - The field to sort by
     * @param {boolean} [desc] - Sort descending
     * @returns {Object} this
     */
    this.sort = function(fields, desc) {        
        if (!Array.isArray(fields)) { fields = [fields]; }
        if (!Array.isArray(desc)) { desc = [desc]; }

        var validFields = [];
        //convert the fields to columns if needed and validate
        for (var i=0; i<fields.length; i++) {
            if (isNaN(fields[i])) {
                var col = _fields.indexOf(fields[i]);
                if (col >= 0) {
                    validFields.push(col);
                }
            } else {
                if (fields[i] >=0 && fields[i] <= _fields.length) {
                    validFields.push(fields[i]);
                }
            }
        }
        //TODO:
        // -- lowercase compare?
        // -- parseFloat of strings?
        //create the primer functions?

        _table.sort(multiFieldSort(validFields, desc));

        /*
        if (field) {
            sortField(field);
        } else {
            for (var i=_fields.length-1; i>=0; i--) {
                sortField(_fields[i]);
            }
        }

        function sortField(fieldName) {
            //get the index of the field
            var index = findFieldIndex(_fields, fieldName);
            if (index !== false) {
                var primer; //this is the function to apply to each row to determine sort order
                if (isNaN(_table[0][index])) { //not a number, not even a string representation
                    primer = function(a) { 
                        try {
                            return a.toUpperCase(); //convert everything to uppercase
                        } catch(e) {
                            return a; //or just return a if you can't convert.
                        }
                    }; 
                } else {
                    primer = parseFloat; //so now number strings we be evaluated as numbers
                }

                _table.sort(sortBy(index, desc, primer));
            }
        }
        */

        return this;
    };

    /**
     * Reorders the DataMaster in place and removes fields
     * @param {string[]|number[]} fields - The fields to keep and in what order
     * @returns {Object} this
     */
    this.reorder = function(fields) {
        var rTable = reorderData(_table, _fields, fields);
        _table = rTable.table;
        _fields = rTable.fields;

        return this; //for chaining
    };

    /**
     * Searches the DataMaster
     * @param {Object} options
     * @param {string|number|function} options.query - The value to search for
     * @param {string|number|array} [options.searchFields] -The field/fields to search in, undefined for all
     * @param {string|number} [options.returnField] - The field to return
     * @param {('table'|'recordset'|'recordtable'|'index'|'array')} [options.style='index']
     *  - The style of the returned data
     *      NOTE: 'index' is an array of row indexes that match
     * @returns {Object} Various types
     */
    this.search = function(options) {
        //setup some defaults and some requirements
        if (typeof options === 'undefined') { return null; }
        if (typeof options.query === 'undefined') { return null; }
        if (typeof options.style === 'undefined') { options.style = 'index'; }

        //support the old naming conventions
        if (typeof options.searchField !== 'undefined' && typeof options.searchFields === 'undefined') {
            options.searchFields = options.searchField;
        }
        if (typeof options.return !== 'undefined' && typeof options.returnField === 'undefined') {
            options.returnField = options.return;
        }

        //this is sloppy, but we're going to check for options.Advanced and if so, reroute to the advancedSearch
        //function and return before reaching the rest of the normal/old search function
        if (options.advanced) {
            //add an empty queryFunctions object to options
            if (typeof options.queryFunctions ==='undefined') { options.queryFunctions = {}; }
            var result = advancedSearch(options.query, options.queryFunctions)
            var resultData = {
                table: result.table,
                fields: _fields
            };
            resultIndices = result.indices;
            if (options.style === 'table') {
                return resultData.table;
            } else if (options.style === 'recordset') {
                return recordtableToRecordset(resultData);    
            } else if (options.style === 'recordtable') {
                return resultData;
            } else if (options.style === 'index') {
                return resultIndices;
            } else {
                return false; //TODO: better error handling when bad style passed
            }
        }

        /****************************************************************************************/
        /** This is the old/normal search function */
        /****************************************************************************************/

        var searchIndexes = [];
        //check if searchFields was supplied
        if (typeof options.searchFields === 'undefined') {
            //put all of the fields into the search index array
            for (var i=0; i<_table[0].length; i++) {
                searchIndexes.push(i);
            }    
        } else {
            //force the searchField into an array
            if (!Array.isArray(options.searchFields)) {
                options.searchFields = [options.searchFields];
            }
            //generate the searchIndexes
            for (var s=0; s<options.searchFields.length; s++) {
                searchIndexes.push(findFieldIndex(_fields, options.searchFields[s])); 
            }
        }

        var returnIndex = findFieldIndex(_fields, options.returnField); //the field to return
        
        //we need to convert the options.return value into a valid field in case a column number was passed
        var returnField = false;
        if (returnIndex !== false) {
            returnField = _fields[returnIndex];
        } 

        var found = []; //search generates a list of row indexes 
        var res;

        var tempVal = '';
        for (var r=0; r<_table.length; r++) {
            for (var c=0; c<searchIndexes.length; c++) {
                //we're going to use a non-cased search. I can't think of a reason why we would want to 
                //only search in a case sensitive fashion, but that would be easy enough to add
                //in the same vein, numbers and strings will be treated the same. 45='45'
                if (typeof options.query === 'function') {
                    if (options.query(_table[r][searchIndexes[c]])) {
                        found.push(r);
                        break;
                    }
                } else {
                    tempVal = _table[r][searchIndexes[c]];
                    if (tempVal === null) { tempVal = ''; }
                    if (tempVal.toString().toLowerCase().search(new RegExp(options.query.toString(),'i')) > -1) {
                        found.push(r); //just save the row index
                        break;
                    }   
                }  
            }
        }
        

        //convert the found array into the various types of return structures the user may want.
        var i;
        if (options.style === 'index') {
            return found; //just return the list of row indexes 
        }  else {
            //generate a table from the found indexes based on the returnIndex
            res = [];
            if (returnIndex !== false) {
                for (i=0; i<found.length; i++) {
                    res.push(_table[found[i]][returnIndex]);
                }
            } else {
                for (i=0; i<found.length; i++) {
                    res.push(_table[found[i]]);
                }    
            }
            
            //now return the data in the appropriate format
            if (options.style === 'array') {
                return res; 
            } else {
                var rTable = {
                    table: res,
                    fields: _fields
                };
                if (returnField) { 
                    var table = [];
                    /* The following converts an array of values into a table with one column
                        input=[0,1,2]
                        result=[
                            [0],
                            [1],
                            [2]
                        ]
                    */
                    res.forEach(function(value) {
                        table.push([value]);
                    });

                    rTable.table = table;
                    rTable.fields = [returnField]; //force into an array
                } 
                if (options.style === 'table') {
                    return rTable.table;
                } else if (options.style === 'recordset') {
                    return recordtableToRecordset(rTable);    
                } else if (options.style === 'recordtable') {
                    return rTable;
                }
                
            } 
        }
        
        //Will this ever be reached?
        return this; //for chaining  
    };   

    /**
     * 
     * @param {string/RegEx} query - the value to search for 
     * @param {string|number} newValue - the replacement value
     * @param {*} fields 
     */
    this.replace = function(query, newValue, fields) {
        if (typeof query === 'undefined') { return this; }
        if (typeof newValue === 'undefined')  { return this; }
        if (typeof fields === 'undefined') { fields = _fields; }

        //convert to an array if only one field provided
        if (!Array.isArray(fields)) { fields = [fields]; }

        //if the user provided a string, make it a regex, not insensitive, global replace        
        if (!(query instanceof RegExp)) {
            query = new RegExp(query.toString(),'ig');   
        }

        //iterate over the provided fields
        for (var f=0; f<fields.length; f++) {
            //find the index of the field
            var col = findFieldIndex(_fields, fields[f]);
            //iterate down the column if it is valid
            if (col !== false) {
                for (var row=0; row<_table.length; row++) {
                    //replace the values
                    //we're going to treat nulls as empty strings
                    var cell = _table[row][col];
                    if (cell === null) { cell = ''; }
                    _table[row][col] = cell.replace(query, newValue);
                }
            }
        }

        return this; //for chaining
        
    };

    /**
     * Limits the DataMaster based on a search result
     * @param {Object} options
     * @param {string|number|function} options.query - The value to search for
     * @param {string|number} [options.searchFields] -The field to search in, undefined for all
     * 
     */
    this.limit = function(options) {        
        options.style = 'table'
        _table = _self.search(options);

        return this; //for chaining
    };

    /**
     * Modifies existing field names;
     * @param {Object} fieldMap - 2d array of fields to modify
     * @param {boolean} [reorder] - if true then the new fieldnames will be
     *  used to reorder/limit the data as well
     * @returns {Object} this
     * @example
     *      modifyFieldNames([
     *          ['firstFieldToRename','newName'],
     *          ['anotherFieldToRename', 'newname']
     *      ], true;
     */
    this.modifyFieldNames = function(fieldMap, reorder) {
        //iterate over the map
        try {
            for (var i=0; i<fieldMap.length; i++) { 
                var index = findFieldIndex(_fields, fieldMap[i][0]); //get the index of the field name
                if (index !== false) { _fields[index] = fieldMap[i][1]; }
            }

            if (reorder) {
                //create an array of the second row of the fieldmap
                var list = [];
                for (var l=0; l<fieldMap.length; l++) { list.push(fieldMap[l][1]); }
                _self.reorder(list);
            }

        } catch (e) { }   

        return this; //for chaining
    };

    /**
     * Sets the field names
     * @param {string[]} fields - The new field names
     * @returns {Object} this
     */
    this.setFieldNames = function(fields) {
        //updates the field names
        /* Params:
            -fields: (string[]), the new field names.
        */
        //replaces fields in order, if you pass fewer names then already exist in the recordtable
        //the remaining ones wont be updated.

        //get the shorter of the two fields so that if extra field names are passed they are ignored.
        var max = fields.length < _fields.length ? fields.length : _fields.length; 
        for (var f=0; f<max; f++) {
            _fields[f] = fields[f];
        }

        return this; //for chaining
    };

    /**
     * Adds a new column to the DataMaster
     * @param {string} name - The column/field name
     * @param {Object} [data] - The data to add. undefined will add nulls
     * @param {string|number} [location] - Index or fieldname to place the column.
     *  Will shift existing columns over. NOTE: undefined will place column at the end.
     * @returns {Object} this
     */
    this.addColumn = function(name, data, location) {
        if (typeof name === 'undefined') { return null; }
        if (typeof data === 'undefined') { data = []; }

        try {
            var clean; //this will be a properly formatted column
            clean = data.slice(0, _table.length); 
            if (clean.length< _table.length) { //if it's too short, add nulls to fill
                for (var i=clean.length; i<_table.length; i++) {
                    clean.push(null);
                }
            }

            //we now have a proper column with a proper name.
            var r; //for loops
            if (typeof location !== 'undefined') {
                var index = findFieldIndex(_fields, location);
                if (index !== false) {
                    _fields.splice(index, 0, name); //splice into the field list
                    for (r=0; r<_table.length; r++) {
                        _table[r].splice(index,0, data[r]); //splice into each row
                    } 
                }        
            } else {
                _fields.push(name); //stick it in the end of the stack
                for (r=0; r<_table.length; r++) {
                    _table[r].push(data[r]); //place it at the end of the row
                }     
            }

        } catch (e) {}

        return this; //for chaining
    };

    /**
     * Removes a column from the DataMaster
     * @param {string|number} column - The column to remove
     * @returns {Object} this
     */
    this.removeColumn = function(column) {
        //strips a single column from the recordtable
        /* Params:
            -column: index or field to remove
        */

        var index = findFieldIndex(_fields, column);
        if (index !== false) {
            _fields.splice(index, 1); //strip the field
            for (var r=0; r<_table.length; r++) {
                _table[r].splice(index, 1); //strip out from the row
            }
        }

        return this; //for chaining
    };

    /**
     * Adds a row to the DataMaster
     * @param {Object} data - The row data
     *  NOTE:
     *      1) array will only add items up to the existing length, extras will be skipped
     *      2) for object, only matching field names will be added, the rest skipped or set to null
     * @param {number} location - The index at which to place the new row, shifting existing rows
     *  NOTE:
     *      1) undefined: end of table
     *      2) <=0: beginning of table
     * @returns {Object} this
     */
    this.addRow = function(data, location) {
        if (typeof data === 'undefined') { data = []; }
        var clean; 
        try {
            if (!Array.isArray(data)) { //hopefully an object was passed
                clean = new Array(_fields.length); //create an array of the proper length
                
                //prefer null to undefined?
                for (var c=0; c<clean.length; c++) { clean[c] = null; } 
                
                //fill the array from the fieldIndexes of the passed object in the proper locations
                Object.keys(data).forEach(function(key) {
                    var index = findFieldIndex(_fields, key);
                    if (index !== false) {
                        clean[index] = data[key];
                    }
                });
            } else { //if an array was passed just set clean to the passed value
                clean = data;
                //see if it's too long
                if (clean.length > _fields.length) {
                    clean = clean.slice(0, _fields.length); //trim the excess
                } else if (clean.length < _fields.length) {
                    for (var i=clean.length; i<_fields.length; i++) { //start at the end of the exiting row
                        clean.push(null);
                    }
                }
            }

            //clean is now an array of the appropriate length filled with the passed data

            if (typeof location === 'number') {
                //make location in bounds
                if (location < 0) { location = 0; }
                if (location > _table.length) { location = _table.length; }
                //splice it into the table
                _table.splice(location, 0, clean);
            } else {
                //if location not defined, add row to bottom
                _table.push(clean);
            }
            
        } catch (e) {}
        
        return this; //for chaining
    };

    /**
     * Removes a row from the DataMaster
     * @param {number} index - Index of the row to remove
     * @returns {Object} this
     */
    this.removeRow = function(index) {
        if (index >=0 && index < _table.length) {
            _table.splice(index, 1);
        }

        return this; //for chaining
    };

    /**
     * Modifies a cell value
     * @param {number} row - The row
     * @param {string|number} column - The column
     * @param {string|number} value - The new value for the cell
     * @returns {Object} this
     */
    this.modifyCell = function(row, column, value) {
        try {
            var index = findFieldIndex(_fields, column);
            if (index !== false) { //findFieldIndex will either return valid num or false
                 _table[row][index] = value;   
            }
        } catch (e) { }

        return this; //for chaining
    };

    /**
     * Gets the value of a single cell
     * @param {number} row - The row
     * @param {string|number} column - The column
     * @returns {string|number} The cell value
     */
    this.getCell = function(row, column) {
        try {
            var index = findFieldIndex(_fields, column); //get the index of the field name
            if (index !== false) { //findFieldIndex will either return valid num or false
                return _table[row][index];
            }
        } catch (e) { return undefined; }
        //invalid cell
        return undefined;
    };

    /**
     * Get the length of the DataMaster table
     * @param {bool} columns - Returns the number of columns rather than rows
     * @returns {number} The length of the table
     */
    this.length = function(columns) {
        if (columns) {
            return _fields.length;
        } else {
            return _table.length;
        }   
    };

    /**
     * Sums column values
     * @param {string} [label] - If the rows have headers, this will be the label for the sums
     * @param {string[]|number[]} [columns] - The columns to sum. Undefined for all.
     * @param {bool} [isAverage] - Will create averages instead of sums
     * @param {string} [isNaNValue] - What to place in the summed/averaged cell if the value is NaN
     * @returns {Object} this
     */
    this.sumColumns = function(label, columns, isAverage) {
        //if not passed, create a column array with all columns
        if (typeof columns === 'undefined') {
            columns = [];
            for (var a=0; a<_fields.length; a++) {
                
                columns.push(a);
            }
            //remove column 0 from default column list if label exists
            if (typeof label === 'string') {
                columns.shift(); 
            }
        }
        
        //convert column array into indexes
        var clean = []; //this will hold valid column indexes
        for (var i=0; i<columns.length; i++) {
            if (typeof columns[i] === 'string') {
                var index = findFieldIndex(_fields, columns[i]);
                if (index !== false) { clean.push(index); }
            } else {
                if (columns[i]>=0 && columns[i]<_fields.length) {clean.push(columns[i]); }
            }
        }

        //we should now have an array of valid column indexes
        //create the sums array
        var sums = [];
        //this stores the number of valid numbers in a column so if a col has
        //non-number values they wont be used to compute the average
        //ex: avg[2,'foo','bar'] should equal 2, not 0.667 
        var avgCount = []; 
        for (var s=0; s<_fields.length; s++) { sums.push(null); }
        if (typeof label === 'string') { sums[0] = label; } //replace the first column with the label

        //now sum the columns from the clean array
        for (var c=0; c<clean.length; c++) {
            var sum = 0;
            var value = 0;
            avgCount[c] = 0;
            for (var r=0; r<_table.length; r++) {
                value = parseFloat(_table[r][clean[c]]);
                if (typeof value === 'number') {
                    sum += value;
                    avgCount[c] ++;
                }
            }
            sums[clean[c]] = sum;
            
            //switch to an average if requested
            if (isAverage && avgCount[c] > 0) {
                sums[clean[c]] /= avgCount[c];
            }
        }

        //if isNaNValue was passed then replace all the NaNs with it
        if (typeof isNaNValue != 'undefined') {
            for (var i=0; i<sums.length; i++) {
                if (isNaN(sums[i])) { sums[i] = isNaNValue; }
            }
        }

        //we now have a full array of the sums, so add as a new row
        this.addRow(sums);

        return this; //for chaining
    };

    /**
     * Sums rows
     * @param {string} label -The label of the new column holding the sum 
     * @param {number[]} [rows] - The rows to sum, undefined for all
     * @param {bool} [isAverage] - Will create averages instead of sums
     * @param {string} [isNaNValue] - What to place in the summed/averaged cell if the value is NaN
     * @returns {Object} this
     */
    this.sumRows = function(label, rows, isAverage, isNaNValue) {
        if (typeof label === 'undefined' || label === null) { label = 'Total'; }
        
        //create an array to hold the sums. Set to null by default
        var sums = [];
        //this stores the number of valid numbers in a row so if a row has
        //non-number values they wont be used to compute the average
        //ex: avg[2,'foo','bar'] should equal 2, not 0.667 
        var avgCount = []; 
        for (var a=0; a<_table.length; a++) { sums.push(null); }
        //if no rows were passed then create a row array with all rows in it
        if (typeof rows === 'undefined') {
            rows = [];
            for (var i=0; i<_table.length; i++) { rows.push(i); }
        }
        //we now have a row array that has all the rows we want summed
        for (var r=0; r<rows.length; r++) {
            if (rows[r]>=0 && rows[r]<_table.length) { //basic sanity check
                var sum = 0;
                avgCount[r] = 0;
                var value = 0;
                for (var c=0; c<_fields.length; c++) {
                    value = parseFloat(_table[rows[r]][c]);
                    if (typeof value === 'number') {
                        sum += value;
                        avgCount[r] ++;
                    }
                }
                sums[rows[r]] = sum;
                //switch to an average if requested
                if (isAverage && avgCount[r] > 0) {
                    sums[rows[r]] /= avgCount[r];
                }
            }
        }

        //if isNaNValue was passed then replace all the NaNs with it
        if (typeof isNaNValue != 'undefined') {
            for (var i=0; i<sums.length; i++) {
                if (isNaN(sums[i])) { sums[i] = isNaNValue; }
            }
        }

        //we now have a column of sums, so push into the table
        _self.addColumn(label, sums);

        return this; //for chaining
    };

    /**
     * Pivots the table (so rows become cols)
     *  NOTE: 1) This function assumes that your table data has row headers, because that's what the new
        columns will be called. Add in row headers using addColumn if necessary before running this. 
        @returns {Object} this
     */
    this.pivot = function() {
        var c, f, r; //for loops

        var pivot = { 
            table: [],
            fields: []
        };

        try {

            //first create the full pivoted table structure
            for (f=0; f<_fields.length-1; f++) { //_fields.length-1 because we're skipping the column names
                data = [];
                //create a blank row
                //length+1 because we need a spot for the fields to become row headers
                for (r=0; r<_table.length+1; r++) { 
                    data.push('XXX'); //TODO: switch to nulls, I think XXX was just for debugging
                }
                pivot.table.push(data);
            }

            //the new fields will be the first column values
            pivot.fields = getTableColumn(_table, 0);
            pivot.fields.unshift(_fields[0]); //keep the first column header
            //place the fields into the first column of the new table
            for (r=0; r<_fields.length-1; r++) { //for each field
                pivot.table[r][0] = _fields[r+1]; //skip first field
            }     
            
            for (c=0; c<_fields.length-1; c++) { //skip the first column as that's now field names
                for (r=0; r<_table.length; r++) { //still do each row
                    //add 1 to the _table column so we skip the field names
                    //add 1 to the pivot.table row because we've already put in the row headers 
                    //which aren't in the original table data
                    pivot.table[c][r+1] = _table[r][c+1]; 
                }
            }
            
            _table = pivot.table;
            _fields = pivot.fields;   
        } catch(e) {
            console.log(e);
        }

        return this; //for chaining   
    };


    /**
     * Removes duplicate entries from the table based on the fields supplied
     * @param {array|string|number} [fields] - the fields to match on
     */
    this.removeDuplicates = function(fields) {
        if (_table.length === 0) { return this; } //no table data!
        if (typeof fields === 'undefined') {
            fields = _fields;
        }
        //convert to an array if only one field provided
        if (!Array.isArray(fields)) { fields = [fields]; }
        
        
        var newTable = []; //table with no dupes
        
        //Generate a table of cols based on the fields provided
        // i.e. 'lastName -> 3'
        var testCol = null;
        var cols = [];
        for (var f=0; f<fields.length; f++) {
            testCol = findFieldIndex(_fields, fields[f]);
            if (testCol !== false) {
                cols.push(testCol);
            }
        }

        //put the first table column into the new table
        newTable.push(_table[0]);

        //iterate over the entire datamaster
        for (var row=0; row<_table.length; row++) {
            if (!testForMatch(_table[row])) {
                newTable.push(_table[row]);
            }    
        }

        function testForMatch(rowData) {
            //iterate over the entire new table
            for (var row=0; row<newTable.length; row++) {
                //just test the first col, since if it isn't a match then we're set
                //do a soft check
                if (newTable[row][cols[0]] == rowData[cols[0]]) {
                    //check each other col, if it's not a match return false
                    //start with the second column since we've already checked the first
                    for (col=1; col<cols.length; col++) {
                        if (newTable[row][col] != rowData[col]) {
                            return false; //not a full match!
                        }
                    }
                    //to get here the first check was true and so were the others
                    return true; 
                } 
            }
        }

        //copy the new table into the master table
        _table = newTable;
        return this;
    };

    
    /**
     * Formats the cells in a table based on a formatting function passed by the user.
     * This is an in-place replacement of the original data
     * The format function is wrapped in a simple try/catch
     * @param {string|number} column - The column name or index to return 
     * @param {function} format - How to modify/format the data
     * @returns 
     */
    this.formatColumn = function(column, format) {
        if (typeof format != 'function') { return this; }

        var index = findFieldIndex(_fields, column);
        if (index === false) { return this; }

        for (var row=0; row<_table.length; row++) {
            try {
                _table[row][index] = format(_table[row][index]);
            } catch (e) {
                //console.log(e);
            }
        }
        
        return this;
    };

    /**
     * Formats the cells in a table based on a formatting function passed by the user.
     * This is an in-place replacement of the original data
     * The format function is wrapped in a simple try/catch
     * @param {string|number} column - The column name or index to return 
     * @param {function} format - How to modify/format the data
     * @returns 
     */
     this.formatRow = function(row, format) {
        if (typeof format != 'function') { return this; }

        if (row > _self.length()) { return this; }

        for (var col=0; col<_table[row].length; col++) {
            //console.log(col + ':' + _table[row][col]);
            try {
                _table[row][col] = format(_table[row][col]);
            } catch (e) {
                //console.log(e);
            }
        }
        
        return this;
    };

};  

/*****************************************************************/
/***************   END DATAMASTER   ******************************/
/*****************************************************************/

var DataQuery = function(data, fields, options) {
    
    var backup = null; //to hold the original data
    var dm = null; //a DataMaster to edit
    
    function reset() { 
         dm = new DataMaster(backup);
    }

    function debug(msg) {
        if (typeof msg == 'object') { msg = JSON.stringify(msg); }
        //console.log(msg);
    }

    (function startup() {
        dm = new DataMaster(data, fields, options);
        backup = dm.copy();
        debug('DataQuery ready, ' + dm.length() + ' rows.');
    })();

    /**
     * Converts a string like myFunc('param1','param2') into the name of the function
     * and an array of params
     * @param {string} functionString 
     * @returns 
     */
    function parseFunctionString(functionString) {
        // Check for opening and closing paren 
        var openParenIndex = functionString.indexOf('(');
        var closeParenIndex = functionString.lastIndexOf(')');
        
        // Extract functionName and initialize arrayContent as empty array
        var functionName = openParenIndex === -1 ? 
            functionString : 
            functionString.substring(0, openParenIndex);
        let arrayContent = [];
        
        // Parse array content only if brackets are present
        if (openParenIndex !== -1 && closeParenIndex !== -1) {
            var arrayContentString = functionString.substring(
            openParenIndex + 1, closeParenIndex
            );
        
            // Wrap arrayContentString with brackets and evaluate to create array
            try {
                arrayContent = eval('[' + arrayContentString + ']');
            } catch (error) {
                return functionString;
            }
        }
        
        return {
            name: functionName,
            params: arrayContent
        };
    }

    /**
     * Parses an SQL ORDER BY clause and converts it into two arrays.
     * The first array contains the field names, and the second contains
     * boolean values representing the sort order (true for DESC, false for ASC).
     *
     * @param {string} orderByClause - The ORDER BY clause to be parsed.
     * @returns {Object|string} An object with two properties: 'fields' and 'orders',
     * both of which are arrays. 'fields' contains the names of the fields, and 'orders'
     * contains boolean values for the sort order (true for DESC, false for ASC).
     * If the input is not a string, it returns an error string.
     *
     * @example
     * // returns { fields: ['name', 'age', 'salary'], orders: [true, false, false] }
     * parseOrderByClause("ORDER BY name DESC, age ASC, salary");
     *
     * @example
     * // returns 'Error: Input must be a string'
     * parseOrderByClause(123);
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
    
        // Default order is ascending
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
    function ensure2D (input) {
        if (Array.isArray(input)) {
            if (!Array.isArray(input[0]) && typeof input[0] !== 'object') {
                return [input];
            }
            return input; // Return the original input if it's already 2D or an array of objects
        } else if (typeof input === 'object' && input !== null) {
            return [input];
        }
        return input; // Return the original input if it's neither array nor object
    }
      
    /*********************************************************************************************/
    /****************    PUBLIC FUNCTIONS    *****************************************************/
    /*********************************************************************************************/

    /**
     * Perform a SQL-like query of the data
     * @param {object} query 
     * @param {string} [query.select] - the fields you want returned
     * @param {string} [query.where] - the search
     * @param {string|array} [query.orderBy] - the sort
     * @param {object} [query.sortPrimers] - sorting primers {field: function()}
     * @param {object} [query.whereFunctions] - an object of functions to use in the where statement
     * @param {('table'|'recordset'|'recordtable'|'spreadsheet'|'csv')} [style] - the return style
     * @param {boolean} limit - if true the DataQuery will be limited to the results of the query
     * @param {Object} [options]
     * @param {string[]|number[]} [options.fields] - The column names or indexes to export and the order
     *      NOTES:
     *          undefined = all columns in the existing order
     * @param {number} [options.startRow=0] - The row to start export from (csv only)
     * @param {number} [options.startCol=0] - The column to start export from (csv only)
     * @param {string} [options.newLineString="\r\n"] - The string to use for newlines
     *
     * @returns {Object|string} Different styles return different types of data
     */
    this.query = function(query, limit, style, options) {
        if (typeof style == 'undefined') { style = 'recordset'; }
        
        //put the backup into the local datamaster
        reset();

        //if where was provided, perform a limit
        if (query.hasOwnProperty('where')) {
            debug('WHERE: ' + query.where);
            query.where = query.where.replaceAll('"', "'");
            if (typeof query.whereFunctions ==='undefined') { query.whereFunctions = {}; }
            dm.limit({
                query: query.where,
                advanced: true,
                queryFunctions: query.whereFunctions
            });
        }

        //if orderBy was provide, sort
        if (query.hasOwnProperty('orderBy')) {
            if (typeof query.desc ==='undefined') { query.desc = false; }  
            //TODO: un-comment when DataMaster supports multi-field sorting
            //if (!Array.isArray(query.orderBy)) { query.orderBy = [query.orderBy]; }  
            var sort = parseOrderByClause(query.orderBy);
            debug(JSON.stringify(sort));
            dm.sort(sort.fields, sort.desc);
        }

        //if select was provided, reorder the data
        if (query.hasOwnProperty('select')) { 
            if (query.select != '*') {
                var fields = query.select.replace(/, /g, ','); // Replace ', ' with ','
                var fields = fields.split(','); // Split string into an array

                // Now we should trim any spaces left in the array elements
                for (var i = 0; i < fields.length; i++) {
                    fields[i] = fields[i].trim();
                }
            } else {
                fields = dm.fields();
            }
            
            debug('fields: ' + JSON.stringify(fields));
            
            dm.reorder(fields);
        }

        if (limit) {
            //put the modified data back into the backup
            backup = dm.copy();   
        }

        return dm.exportAs(style, options);
    }

    /**
     * Updates data in the DataQuery
     * 
     * @param {object} query 
     * @param {string} [query.set] - the fields and their new values
     * @param {string} [query.where] - the search
     * @param {object} [query.whereFunctions] - an object of functions to use in the where statement
     * @param {object} [query.setFunctions] - an object of functions to use in the SET statement
     * @returns 
     */
    this.update = function(query) {
        

        if (typeof style == 'undefined') { style = 'recordset'; }

        //if SET wasn't provided just exit
        if (!query.hasOwnProperty('set')) {
            return null;
        }

        //put the backup into the local datamaster
        reset();

        //set the rowsToUpdate to the whole table by default
        var rowsToUpdate = Array.from({ length: dm.length() }, (_, index) => index );

        //if where was provided, perform a limit
        if (query.hasOwnProperty('where')) {
            debug('WHERE: ' + query.where);
            query.where = query.where.replaceAll('"', "'");
            if (typeof query.whereFunctions ==='undefined') { query.whereFunctions = {}; }
            rowsToUpdate = dm.search({
                query: query.where,
                advanced: true,
                queryFunctions: query.whereFunctions
            });
        }   

        //rowsToUpdate will now either be all rows or the rows that matched the query
        
        //convert the SET statement into field/value pairs
        query.set = query.set.replaceAll('"', "'"); //convert " -> '
        var fields = query.set.split(', ');
        var updateList = {};

        for (var i = 0; i < fields.length; i++) {
            var parts = fields[i].split('=');

            //this will return if a field is provided without a "=" part
            if (parts.length !== 2) {
                return null;
            }

            var key = parts[0];
            var value = parts[1].replace(/^'(.*)'$/, '$1');

            updateList[key] = value;
        }

        //console.log(updateList);
        //loop through the rowsToUpdate and then each field to update
        var updateVal = null;
        rowsToUpdate.forEach((row)=> {
            Object.keys(updateList).forEach((field)=> {
                updateVal = updateList[field];
                //check if the set value is a query function
                if (updateVal.charAt(0) === '$') {
                    var functionString = updateVal.substring(1);
                    var functionParts = parseFunctionString(functionString);
                    var functionName = functionParts.name;
                    var functionParams = functionParts.params;
                    if (typeof query.setFunctions !== 'undefined') {
                        if (typeof query.setFunctions[functionName] === 'function') {
                            //set the updateVal to the existing val
                            updateVal = dm.getCell(row, field);
                            //now set it to the queryFunction return
                            updateVal = query.setFunctions[functionName](updateVal, functionParams);
                        }
                    }
                }

                dm.modifyCell(row, field, updateVal);    
            });
        });

        //put the modified data back into the backup
        backup = dm.copy();        
    }

    /**
     * Deletes data in the DataQuery
     * 
     * @param {object} query 
     * @param {string} [query.where] - the search
     * @param {object} [query.whereFunctions] - an object of functions to use in the where statement
     * @returns 
     */
    this.delete = function(query) {
        if (typeof style == 'undefined') { style = 'recordset'; }

        //if WHERE wasn't provided just exit
        if (!query.hasOwnProperty('where')) {
            return null;
        }

        //put the backup into the local datamaster
        reset();

        //convert " to '
        query.where = query.where.replaceAll('"', "'");

        //create a dummy whereFunctions if not provided
        if (typeof query.whereFunctions ==='undefined') { query.whereFunctions = {}; }

        //determine the rows to delete based on the WHERE clause
        var rowsToDelete = dm.search({
            query: query.where,
            advanced: true,
            queryFunctions: query.whereFunctions
        });

        //revers sort the rowsToDelete so the row numbers don't change as we start removing them
        rowsToDelete.sort(function(a, b) {
            return b - a; // Sorting in descending order
        });   
        
        //iterate through rowsToDelete and delete the rows
        rowsToDelete.forEach((row)=> {
            dm.removeRow(row);
        });

        //put the modified data back into the backup
        backup = dm.copy();   
    }

    /**
     * Adds data to the DataQuery.
     * You may provide a single row as an array or object or multiple rows
     * as a 2d array or array of objects. You do not need to provide every field,
     * missing data will be set to null
     * 
     * @param {object:array} data - the data to add
     */
    this.insert = function(data) {
        //put the backup into the local datamaster
        reset();
        
        data = ensure2D(data);

        data.forEach((rowData)=> {
            dm.addRow(rowData);
        });

        //put the modified data back into the backup
        backup = dm.copy();  
    }

    /**
     * Prints the full data from the DataQuery
     * 
     * @param {boolean} console - format for console output
     * @returns 
     */
    this.print = function(console) {
        reset();
        return dm.print(console);
    }
}

/*****************************************************************/
/***************   END DATAQUERY  ******************************/
/*****************************************************************/


if (typeof window === 'undefined') {
    exports.DataMaster = DataMaster;
    exports.DataQuery = DataQuery;
} 
