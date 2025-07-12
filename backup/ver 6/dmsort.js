var data = require('./data').data;
var DataMaster = require('./datamaster').DataMaster;

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
     * Perform a SQL-like query of the data
     * @param {object} query 
     * @param {string} [query.select] - the fields you want returned
     * @param {string} [query.where] - the search
     * @param {string|array} [query.orderBy] - the sort
     * @param {object} [query.sortPrimers] - sorting primers {field: function()}
     * @param {object} [query.queryFunctions] - an object of functions to use in the where statement
     * @param {('table'|'recordset'|'recordtable'|'spreadsheet'|'csv')} [style] - the return style
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
    this.query = function(query, style, options) {
        if (typeof style == 'undefined') { style = 'recordset'; }
        
        //put the backup into the local datamaster
        reset();

        //if where was provided, perform a limit
        if (query.hasOwnProperty('where')) {
            debug('WHERE: ' + query.where);
            if (typeof query.queryFunctions ==='undefined') { query.queryFunctions = {}; }
            dm.limit({
                query: query.where,
                advanced: true,
                queryFunctions: query.queryFunctions
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
        return dm.exportAs(style, options);
    }

    this.dm = dm;
}

var dq = new DataQuery(data);

var res1 = new DataMaster(
    dq.query({
        select: 'ID, country, lastName, firstName, age',
        where: "(country='France' OR country='USA') AND age='/age(75)'",
        orderBy: 'country, age desc',
        sortPrimers: {},
        queryFunctions: {
            age: function(age, limit) {
                if (age < limit) {
                    return true;
                }
                return false;
            }
        }
    })
);

console.log(res1.print(true));


var res2 = new DataMaster(
    dq.query({
        select: 'ID, country, lastName, firstName, age',
        where: "(country='France' OR country='USA') AND age='/age(75)'",
        orderBy: 'age desc, firstName',
        sortPrimers: {},
        queryFunctions: {
            age: function(age, limit) {
                if (age < limit) {
                    return true;
                }
                return false;
            }
        }
    })
);
console.log(res2.print(true));


//console.log(dq.dm.print(true));



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
/*
var dm = new DataMaster(data);
var myData = dm.exportAs('recordset');

var primer = function(val) {
    return val == 'France' ? 'XXXX' : val;
}
myData.sort(multiFieldSort(['country', 'age'], [false, false], [primer, null]));
myData = new DataMaster(myData);
console.log(myData.print(true));
*/


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
    return { fields: fields, orders: orders };
}
  
/*  
  // Example usage:
  // Assuming the input is a string like "ORDER BY name DESC, age ASC, salary"
  const result = parseOrderByClause("name, age DESC, salary");
  if (typeof result === 'string') {
    console.log(result); // Handle the error
  } else {
    console.log('Fields:', result.fields); // ['name', 'age', 'salary']
    console.log('Orders:', result.orders); // [true, false, false]
  }
  */

  /*
  var dm = new DataMaster(data);
  dm.sort(['firstName','foo','lastName'], [true, false]);
  console.log(dm.print(true));
*/
