/*globals $:false */

/*
ver 6.5.1 2022-06-30
    -moved variable declaration in sumtable to remove out of scope warning
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
ver 2.1.1
    -added default behavior for getLayout(null)
ver 2.1.0
    -added getLayout/userTemplates
ver 2.0.1
    -debug CSS position=fixed
ver 2.0.0
    -removed params from request
*/

var jwf = {
    /****** DEPRECIATED ****************************************************************/

    dataColumnToArray: function(data, column) {
        //strips out a single column from a table or a recordset and returns as an array
        //  -data, a table or recordset
        //  -column, the column number or name
        var col = [];
        for (var row=0; row<data.length; row++) {
            col.push(data[row][column]);
        }
    
        return col;
    },

    recordtableToRecordset: function(recordtable) {
        //converts a recordtable to a recordset
        //  -recordtable, the recordtable to convert
    
        var res = [];
        var rowData;
        for (var row=0; row<recordtable.table.length; row++) {
            rowData = {};
            for (var field=0; field<recordtable.fields.length; field++) {
                rowData[recordtable.fields[field]] = recordtable.table[row][field];
            }
            res.push(rowData);
        }
        return res;
    },
    
    recordsetToRecordtable: function(recordset) {
        //converts a recordset to a recordtable
        //  -recordset, the data to convert
        
        //turns out I already did this! will keep the function just for symmetry
        return this.recordsetToTable(recordset, true);
    },

    recordsetToTable: function(data, getFields) {
        //converts data from a recordset style to a table style
    
        var table = [];
        var rowData = [];
        var keys = [];
        for (var row=0; row<data.length; row++) {
            //initialize the row
            rowData = [];
            //initialize the keys
            keys = Object.keys(data[row]);
            for (var col=0; col<keys.length; col++) {
                rowData.push(data[row][keys[col]]);
            }
            table.push(rowData);
        }
        
        if (getFields) {
            return {
                table: table,
                fields: keys
            };
        } else {
            return table;
        }
    },

    tableToCSV: function (data, columnNames, newLineString, startCol) {
        //converts the source into a CSV string
        //  -data, the data to convert
        //  -fieldnames, an array of column names
        //  -newLineString: string, the newline character
        //  -startCol: int, the table column to start from, meant to skip ID fields
        //  -removeNewLines: bool, if true will remove newlines

        if (typeof newLineString === 'undefined' || newLineString === null) { newLineString = '\r\n'; }
        if (typeof startCol === 'undefined') { startCol = 0; } 

        var CSV = '';
        var keyCount = 0;
        //start by adding the fieldnames
        columnNames.forEach(function(name) {
            if (keyCount >= startCol) {
                if (name.indexOf(',') >-1) {
                    CSV += '"' + name + '",';
                }
                else {
                    CSV += name + ',';
                }
            }
            keyCount++;  
        });

        CSV = CSV.substring(0, CSV.length-1); //remove trailing ,
        CSV += newLineString; //add the line break
        
        //now iterate through the table
        var val = '';
        for (var row=0; row<data.length; row++) {
            for (var col=startCol; col<data[row].length; col++) { //skip the PK
                if (data[row][col]) {
                    val = data[row][col].toString();
                    val = val.replace(/(\r\n|\r|\n)/g, ' '); //kill newlines
                    if (val.indexOf(',') >-1) {
                        CSV += '"' + val + '",';
                    }
                    else {
                        CSV += val + ',';
                    }
                } else {
                    CSV += ',';
                }
            }
            CSV = CSV.substring(0, CSV.length-1); //remove trailing ,
            CSV += newLineString; //add the line break
        }

        return CSV;
    },
    
    reconfigureData: function(data, fields, convertToTable) {
        //this function takes a table or a recordset and re-configures it, usually to pretty it up for end users
        //  -data: array, the table or recordset data
        //  -fields: array[], the columns to return, in order supplied
        //  -convertToTable: bool, if true a recordset will be returned as a table, overrides .names
        /*
            Depending on the data type (table/recordset) and the way fields are specified the function will
            return various results.
            1) data=table, fields=[1,3,6]
                -a table containing columns 1,3,6
            2) data=table, fields=[[1,'id'],[3,'name'],[6,'cost']]
                -a recordset will be created from columns 1,3,6 with the field names: id, name, cost
            3) data=recordset, fields=['id','name',cost]
                -a recordset will be returned with only the the fields id, name, cost 
            4) data=recordset, fields=[['id','Product#'],['name','Item'],['cost','Expense']]
                -a recordset will be returned with the fields id, name, and cost renamed to Product#, Item and Expense
            5) data=recordset, fields=['id','name','cost] convertToTable=true
                - a table will be returned with only the columns for id, name and cost
    
            Any other combination of data,fields and convertToTable will not be gracefully handled and will likely
            return gibberish. So don't do that.
        */
        
        if (typeof data === 'undefined') { return null; }
    
        try {
        
            var res = [];
            var rowData;
            var row, field;
        
            if (data[0].constructor === Array) { //data is a table
                for (row=0; row<data.length; row++) {
                    if (fields[0].constructor === Array) { //user is asking to convert to recordset
                        rowData = {};
                        for (field=0; field<fields.length; field++) {
                            rowData[fields[field][1]] = data[row][fields[field][0]];   
                        }  
                        res.push(rowData);    
                    } else {
                        rowData = [];
                        for (field=0; field<fields.length; field++) {
                            rowData.push(data[row][fields[field]]);
                        }
                        res.push(rowData);
                    }
                }    
            } else { //data is a recordset                
                if (convertToTable) {
                    for(row=0; row<data.length; row++) {
                        rowData = [];
                        for (field=0; field<fields.length; field++) {
                            rowData.push(data[row][fields[field]]);
                        }
                        res.push(rowData);
                    }
                } else {
                    if (fields[0].constructor === Array) {
                        for (row=0; row<data.length; row++) {
                            rowData = {};
                            for (field=0; field<fields.length; field++) {
                                rowData[fields[field][1]] = data[row][fields[field][0]];
                            }
                            res.push(rowData); 
                        } 
                    } else {
                        for (row=0; row<data.length; row++) {
                            rowData = {};
                            for (field=0; field<fields.length; field++) {
                                rowData[fields[field]] = data[row][fields[field]];
                            }
                            res.push(rowData);
                        } 
                    } 
                }  
            }
            return res;       
        } catch(e) {
            return data; //if anything goes wrong just send back the original data
        }
    },
     
    getDataFromTable: function(data, searchTerm, searchCol, returnCol, returnAll) {
        /*
            Takes data in a table or recordset format and returns the value in the
            returnCol for the first match of searchTerm in the searchCol
            -data and searchTerm are required
            -if searchCol is undefined or null the whole row will be searched
            -if returnCol is undefined the entire row will be returned
            -if a match is not found function will return 'undefined'
            -return all will return an array of all matches found
        */
        
        if (typeof data === 'undefined' || typeof searchTerm === 'undefined') { return undefined; }
        if (typeof searchCol === 'undefined') { searchCol = null; }

        if (data[0].constructor !== Array) {
            var rKeys = Object.keys(data[0]); //assume all rows have the same keys
            var k;
            if (typeof searchCol === 'string') { 
                for (k=0; k<rKeys.length; k++) {
                    if (rKeys[k] === searchCol) { searchCol = k; }
                }
            }  
            if (typeof returnCol === 'string') {
                for (k=0; k<rKeys.length; k++) {
                    if (rKeys[k] === returnCol) { returnCol = k; }
                }    
            }
        }

        var matchRow = -1;
        var keys;
        var matches = [];
        for(var row=0; row<data.length; row++) {
            keys = Object.keys(data[row]);
            if (searchCol === null) {
                for (var col=0; col<keys.length; col ++) {
                    if (data[row][keys[col]] == searchTerm) { //soft
                        matchRow = row;
                    }
                }
            } else if (data[row][keys[searchCol]] == searchTerm) { matchRow = row; } //soft
            if (matchRow != -1) {
                if (typeof returnCol === 'undefined' || returnCol === null) {
                    if (returnAll) {
                        matches.push(data[row]);
                        matchRow = -1;
                    } else {
                        return data[row];
                    }
                } else {
                    if (returnAll) {
                        matches.push(data[row][returnCol]);
                        matchRow = -1;
                    } else {
                        return data[row][keys[returnCol]];
                    }
                }
            }  
        }
        if (returnAll && matches.length > 0) {
            return matches;
        } else {
            return undefined;
        }    
    },

    sumTable: function(options) {
        //adds a summation column and/or row to a table
        /*
            options = {
                data: the table to sum 
                sumRows: sum the rows
                sumCols: sum the columns
                xAxisLabels: do the columns have labels (across)
                yAxisLabels: do the rows have labels (up-down)
                rowTotalLabel: the label at the top-right
                colTotalLabel: the label at the bottom-left
            }
        */
        //TODO: fix this issue:
        //if you pass a table with variant row lengths this will crash
    
        //check for a valid options object
        if (typeof options !== 'object') { return options; } //invalid options provided
        
        var data;
        //break the reference:
        try {
            data = JSON.parse(JSON.stringify(options.data));
            if (data.length === 0) { return data; } //no data provided
        } catch(e) {
            return options;
        }
        
    
        var rowStart = options.xAxisLabels ? 1: 0; //skip the first wor if there's a header
        var colStart = options.yAxisLabels ? 1: 0; //skip the first column if there's a header
        var row, col, sum;
        
        if (options.sumRows) {
            for (row = rowStart; row<data.length; row++) {
                sum = 0;
                for (col = colStart; col<data[row].length; col++) {
                    sum += data[row][col];
                }
                data[row].push(sum); //push the sum into the row
            }
        }
        
        
        if (options.rowTotalLabel && options.xAxisLabels) { data[0].push(options.rowTotalLabel); } 
        
        
        if (options.sumCols) {
            var sumRow = [];
            if (options.colTotalLabel && options.yAxisLabels) { sumRow.push(options.colTotalLabel); }
            for (col = colStart; col<data[0].length; col++) { 
                sum = 0;
                for (row = rowStart; row<data.length; row++) { //skip the empty row
                    sum += data[row][col];
                }
                sumRow.push(sum); //push the sum into summed row array
            }
            data.push(sumRow); //push the summed row array into the table
        }
    
        return data;
    },
    
    sumRecordset: function(options, returnRecordTable) {
        //sums a recordset
        /*
            options = {
                data: the table to sum 
                sumRows: sum the rows
                sumCols: sum the columns
                yAxisLabels: do the rows have labels (up-down)
                rowTotalLabel: the label at the top-right
                colTotalLabel: the label at the bottom-left
            }
            -returnRecordTable: true = return recordtable instead of recordset
        */
        
        //first convert to a recordtable
        var data = this.recordsetToTable(options.data, true);
        data.fields.push(options.rowTotalLabel); 

        var params = {
            data: data.table,
            sumRows: options.sumRows,
            sumCols: options.sumCols,
            yAxisLabels: options.yAxisLabels,
            xAxisLabels: false, //the table does not have column names, this is in data.fields
            rowTotalLabel: options.rowTotalLabel ? options.rowTotalLabel : 'Total',
            colTotalLabel: options.colTotalLabel ? options.colTotalLabel : 'Total'
        };

        var summed = this.sumTable(params);

        //the result is now effectively a recordtable

        if (returnRecordTable) {
            return {
                table: summed,
                fields: data.fields    
            };
        } else {
            return this.recordtableToRecordset({
                table: summed,
                fields: data.fields
            });
        }
    },

    /****** END DEPRECIATED ************************************************************/


    /**
     * splits a 1d array into a 2d array using the given chunk size
     * @param {array} data - the original array
     * @param {int} chunkSize - the size of each row in the new array
     */
    splitArrayIntoChunks: function(data, chunkSize) {
        var output = [];
        var start = 0;
        var end = chunkSize;
        for (var r=0; r<data.length/chunkSize; r++) {
            output.push(data.slice(start, end));
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
     * Converts rem units to px
     * @param {number} rems -number of rems
     * @returns {number} - number in px
     */
    rem2px: function(rems) {
        var html = document.getElementsByTagName('html')[0];
        return parseInt(window.getComputedStyle(html).fontSize) * rems;        
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
     * Validates that an object can represent a date
     * @param {Object} d - A date string or date object
     * @returns {boolean} - Is the date valid
     */
    isValidDate: function(d) {
        d = new Date(d);
        // @ts-ignore
        return d instanceof Date && !isNaN(d);
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

    formatDate: function(fullDate, formatString) {
        try {
            var myDate = new Date(fullDate);    
            var fDate = "";
            var year = myDate.getFullYear();
            var month = myDate.getMonth() + 1;
            var date = myDate.getDate();
            // @ts-ignore
            if (month < 10) { month = '0' + month; }
            // @ts-ignore
            if (date < 10) { date = '0' + date; }
            if (formatString === 'short') {
                fDate += year;
                fDate += '/' + month;
                fDate += '/' + date;
                return fDate;
            } else if (formatString === 'YY/MM/DD') {
                fDate += year.toString().substr(-2);
                fDate += '/' + month;
                fDate += '/' + date;
                return fDate;
            } else if (formatString === 'TEMPLATE') {
            } else {
                return fullDate; //no format string provided
            }   
        }  catch (e) {
            return fullDate; //something went wrong
        }
        

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
    
    request: function() {
        /* Standardized server request
        USAGE: var myRequest = new jwf.request();
        This will return an object with the standard jwServer Request API
        */
        this.options = {
            type: 'json', 
            style: 'recordset',
            mode: 'normal' 
        };

        this.limit = false; //number of records to return, false = no limit
        this.offset = 0; //number of records to skip
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


    sortBy: function(field, reverse, primer) {
        /*USAGE:
        Sort by price high to low
        homes.sort(sort_by('price', true, parseInt));

        Sort by city, case-insensitive, A-Z
        homes.sort(jwf.sortBy('city', false, function(a){return a.toUpperCase()}));
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

    setDefaults: function(options, defaults) {
        /* Simple function to add default values to an object
            example:
            myFunction(options) {
                var defaults = {name: "Bob", age: 7, happy: true};
                var child = addDefaults(options, defaults);
                return info.name + ' is' + info.age ' years old.';
            }
            alert(myFunction({age:10})); //Note that we are only specifying an age
            //result will alert "Bob is 10 years old."

            Primary use-cases would be for assigning default values to functions that take an options argument or
            for passing data back to a server where only some of the required values are supplied by the user.
            Currently this only supports the master object, not sub-objects. 
        */
            Object.keys(defaults).forEach(function(key) {
                if (typeof options[key] === 'undefined') {
                    options[key] = defaults[key];
                }
            });
    },
 

    debugCount: 0,
    
    debug: function(info) {
        var debugtxt = $('#debug').html();
        jwf.debugCount++; 
        $('#debug').empty();
        $('#debug').html(jwf.debugCount + ": " + info + '</br>' + debugtxt); 
    },

    debugVisible: false,

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
    
    mod: function(n, d) {
        //mimics the MOD(n,d) method in Excel - returns the remainder of a division as a whole number.
        return n - d * Math.floor(n/d);
    },

    findKey: function(obj, value) {
        //returns the first key that corresponds to 'value'
        //(reverse dictionary lookup)
        
        var keys = Object.keys(obj);
        for (var i=0; i<keys.length; i++) {
            if (obj[keys[i]] === value) {
                return keys[i];
            }
        }
        return false;
    },

    keyExists: function(obj, keyToFind) {
        //determines if a given key exists in the obj
        var found = false;
        Object.keys(obj).forEach(function(key) {
            if (key == keyToFind) {
                found = true;
            }
        }); 
        return found;
    },

    itemInList: function(list, item) {
        //checks to see if an item is in a list, such as a particular string
        //this looks for a soft equivalence, so 1 = '1' etc
        //  -list: array[], the list of things to check against
        //  -item: the thing we're checking for
    
        if (list.constructor !== Array) { return false; }
    
        for (var i=0; i<list.length; i++) {
            if (list[i] == item) { return true; } //soft check
        }
    
        return false;
    },

    /**
     * Returns a distinct listing of items in a particular field
     * 
     * @param {array} data 
     * @param {number} [column] 
     */
    selectDistinct: function(data, column) {
        //returns a distinct listing of items in a particular field
        //  -data: the table or recordset to check against
        //  -column: the column name or number to return depending on if its a table or recordset
        // if column is not passed then a 1-dimensional array is assumed 
        /* ex:
            data = [
                [1, 'hello'],
                [2, 'world],
                [3, 'world], //duplicate
                [4, 'foo'], 
                [5, 'foo] //duplicate
            ]
            selectDistinct(data, 1) returns:
            ['hello','world',foo]
        */
        if (typeof column === 'undefined') { column = 'none';}

        try {
            var items = [];
            for (var row=0; row<data.length; row++) {
                if (column !== 'none') {
                    if (!this.itemInList(items, data[row][column])) {
                        items.push(data[row][column]);
                    }
                } else {
                    if (!this.itemInList(items, data[row])) {
                        items.push(data[row]);
                    }    
                }
            }
            return items;
        } catch(e) {
            return [];
        }
    },

    /**
     * Removes null, undefined and empty strings from a 1 dimensional array
     * @param {array} list 
     */
    removeNullsFromList: function(list) {
        var noNulls = [];
        list.forEach(function(item) {
            if (item !== null && typeof item !== 'undefined' && item !== '') {
                noNulls.push(item);
            }
        });

        return noNulls;
    },

    /**
     * Converts a 1-dimensional array into a table (a 2d array)
     * @param {array} list 
     * @param {number} [columnCount = 1]
     */
    listToTable: function(list, columnCount) {
        if (typeof columnCount === 'undefined') { columnCount = 1; }
        var table = [];
        list.forEach(function(item) {
            var row = [];
            for (var i=0;  i<columnCount; i++) {
                row.push(item);
            }
            table.push(row);
        });
        return table;
    },

    stripMod43: function(code) {
        //this strips the mode43 checksum from a code39 barcode (if it exists).
        
        var prefix = code.substr(0,code.length-1);
        var mod43 = code.substr(code.length-1,1);
        var sum = 0;
        for (var i=0; i<prefix.length; i++) {
            sum += jwf.code39[prefix[i]]; //sum the code39 values from the code39 object
        }
        if (mod43 === jwf.findKey(jwf.code39, jwf.mod(sum,43))) {  
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
                return "#" + jwf.color.componentToHex(r) + jwf.color.componentToHex(g) + jwf.color.componentToHex(b);
            },

            componentToHex: function(c) {
                var hex = c.toString(16);
                return hex.length == 1 ? "0" + hex : hex;
            }, 

            accessToHex: function(ColorNum) {
                var rgb = jwf.color.accessToRGB(ColorNum);
                return jwf.color.rgbToHex(rgb.r, rgb.g, rgb.b);
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

    decimalToHex: function (d, padding) {
        //converts a decimal value into it's hex equivalent and adds left padding
        var hex = Number(d).toString(16);
        padding = typeof (padding) === "undefined" || padding === null ? padding = 0 : padding;
        while (hex.length < padding) {
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
    
    arrayToString: function(data, separator, onFail) {
        //Converts an array to a string using the separator
        //  -data: array[], the array of items
        //  -separator: string, the char or sequence to place btw each item
        //  -onFail: string, a sequence to use when the array item cannot be turned into a string
    
        if (typeof data === 'undefined' || data == [] || data === null) { return null; }
        if (typeof onFail === 'undefined') { onFail = 'null'; }
    
        var res = '';
        for (var i=0; i<data.length; i++) {
            try {
                res += data[i].toString() + separator;
            } catch(e) {
                res += onFail + separator;
            }
            
        }
    
        res = res.substr(0, res.length - separator.length);
    
        return res;
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

    Gate: function(lockNames, locked) {
        //creates a "Gate" with multiple locks
        //emits 'locked' or 'unlocked' when the state changes from all locks locked to all locks unlocked and visa versa
        //example use is to lock various locks when running async code, unlocking when complete and then running a function
        //  -locknames: array[string], a list of lock names
        //  -locked: bool, true=the gate should start locked
    
        //check for valid params
        if (lockNames.constructor !== Array) { return null; } //must supply an array of lock names
        if (typeof locked === 'undefined') { locked = false; } //unlocked by default
        var _locks = {}; //the main locks object
        var _state = 'unlocked';
        if (locked === true) { _state = 'locked'; }
    
        //create the locks
        /* format:
        locks = {
            myLock: false,
            anotherLock: false
        };
        */
        for (var i=0; i<lockNames.length; i++) {
            _locks[lockNames[i]] = locked; 
        }
    
        function checkGate() {
            //checks the gate to see if it's state has changed
            
            var unlocked = true; //start with the assumption that all locks are open
            //iterate through the locks and see if any are unlocked, if they are set allLocked to false
            Object.keys(_locks).forEach(function(lock) {
                if (_locks[lock] === true) { unlocked = false; } //something's locked, so the gate is locked
            });
    
            if (_state === 'locked' && unlocked === true) {
                _state = 'unlocked';
                emit(_state);
            // @ts-ignore
            } else if (_state === 'unlocked' && unlocked === false) {
                _state = 'locked';
                emit(_state);
            }
    
        }
    
        this.lock = function(lock, locked) {
            //lock or unlock a specific lock
            //  -lock: string, the name of the locked
            //  -locked: bool, true=locked
            try {
                _locks[lock] = locked;
                checkGate();
                return true;
            } catch (error) {
                return false;
            }
        };
    
        this.state = function() {
            //returns an object that represents the state of the gate
            /*
                {
                    state: 'locked'/'unlocked',
                    locks: {
                        mylock: true //locked,
                        anotherLock: false //unlocked
                    }
                }
            */
    
            var res = {};
            res.state = _state;
            res.locks = {};
    
            Object.keys(_locks).forEach(function(lock) {
                res.locks[lock] = _locks[lock];
            });
    
            return res;
        };
    
        /*******************   Custom Emitter Code  **************************************************/
        var _events = {};
        this.on = function(event, callback) {
            //attaches a callback function to an event
            _events[event] = callback;    
        };
        function emit(event, payload) {
            //emits an event
            /*
                -event: the name of the event and the string to bind with on the client side
                -payload: the primary thing to send to the client
            */
            if (typeof _events[event] === 'function') { //the client has registered the event
                _events[event](payload);
            } else if (typeof _events.other === 'function') { //the event is unregistered and the client has asked for other
                _events.other(payload, event);    
            }
            //the client wants all events in this callback
            if  (typeof _events.all === 'function') {
                _events.all(payload, event);
            }    
        }
        /*******************************************************************************************/
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

            outerloop:
            for (var i = 0; i < cssSheets.length; i++) {

                //using IE or FireFox/Standards Compliant
                // @ts-ignore
                rules =  (typeof cssSheets[i].cssRules != "undefined") ? cssSheets[i].cssRules : cssSheets[i].rules;

                for (var j = 0; j < rules.length; j++) {
                    if (rules[j].selectorText == selector) {
                            haveRule = true;
                            break outerloop;
                    }
                }
            }
        }
        return haveRule;
    },

    /* The following 2 functions are modified from
    Underscore.js 1.8.3
    http://underscorejs.org
    (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
    */
    now: Date.now || function() {
        return new Date().getTime();
    },

    debounce: function(func, wait, immediate) {
        var timeout, args, context, timestamp, result;
    
        var later = function() {
          var last = jwf.now() - timestamp;
    
          if (last < wait && last >= 0) {
            timeout = window.setTimeout(later, wait - last);
          } else {
            timeout = null;
            if (!immediate) {
              result = func.apply(context, args);
              if (!timeout) context = args = null;
            }
          }
        };
    
        return function() {
          context = this;
          args = arguments;
          timestamp = jwf.now();
          var callNow = immediate && !timeout;
          if (!timeout) timeout = window.setTimeout(later, wait);
          if (callNow) {
            result = func.apply(context, args);
            context = args = null;
          }
    
          return result;
        };
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
      
      }

};
