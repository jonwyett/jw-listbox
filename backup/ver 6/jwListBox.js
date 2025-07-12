/*
ver 6.0.0 2023-10-24
    -Total re-write
*/

/*
TODO:
    -setting options should be a function in startup
    -searching should maintain the selected? Probably not.
     If so what if fewer things are returned then are selected?
*/

/*
NOTES:
    -all access to DM functions needs to be processed with the PK in mind
        -reordering data
        -searching
*/

function jwListBox(parentDIV, options) {
    var _self = this;
    //this is just a namespace for code clarity, (L)ist(B)ox
    var lb = { 
        //the source is in DataMaster native format so we'll match that here so 
        //it's easy work with the DM
        source: {
            fields: [],
            table: [[]]
        },
        backup: { //a backup of the data for when it's been searched
            fields: [],
            table: [[]], 
        },
        name: null,
        tableID: null,
        events: {},
        html: {},
        hasBeenSorted: false,
        selected: [], //the list of selected primary keys
        pkField: '_jwlbpk_', //the name of the primary key field (RESERVED)
        nextPK: 0, //for adding data
        dm: null, //temporary location for a DataMaster to manipulate the source
        //reloads the local dm with a copy of the source
        edit: function() {
            this.dm = new DataMaster(this.source);
        },
        //replaces the source with the working contents of the dm
        save: function() {
            debug('replacing local source');
            debug('S:' + JSON.stringify(this.source.table[0]) + '>> D:' + JSON.stringify(this.dm.table()[0]));
            this.source = this.dm.copy();
        },
        //replaces the source with the backup
        restore: function() {
            this.source.fields = JSON.parse(JSON.stringify(this.backup.fields));
            this.source.table = JSON.parse(JSON.stringify(this.backup.table));
        },
        options: {
            multiSelect: true, //to allow multi-select
            clickToSelect: true, 
            sortFields: null, 
            sortDesc: false,    
            idField: null, 
            autoSelectFirst: true, //then this is true the first row will automatically be selected on a source or search
        }

    };

    /**************************************************************************/
    /*********** PRIVATE FUNCTIONS ********************************************/
    /**************************************************************************/

    /**
     * Copies the supplied options into the local options object 
    */
    function mergeOptions(newOptions) {
        var options = JSON.parse(JSON.stringify(newOptions));
        Object.keys(options).forEach(function(key) {
            lb.options[key] = options[key];
        });
    }

    function addDefaultStyles() {
        var css = `
            .jwlb-td {
                border-right: 1px solid #dddddd;
                text-align: left; 
                padding: 2px; 
                overflow: hidden; 
                text-overflow: ellipsis;
            }

            .jwlb-th {
                font-weight: bold;
                border-right: 1px solid #dddddd; 
                text-align: left;
                padding-left: 2px; 
                overflow: hidden;
                text-overflow: ellipsis; 
            }  
            .jwlistbox-table {
                /*border-collapse: collapse;*/
                width: 100%; 
                /*table-layout: fixed; */
                white-space: nowrap; 
                cursor: pointer;  
            }
            .selected {
                background-color: black; 
                color: white;
            }   
        `;

        $('<style>')
            .html(css)
            .appendTo('head');
    }
      
    /**
     * creates a random ID for the listbox is one is not provided
     */
    function createLBName() {
        if (!lb.name) {
            var id = 'jwlb-';
            var randomNumber = '';
            for (var i = 0; i < 6; i++) {
                randomNumber += Math.floor(Math.random() * 10).toString();
            }
            lb.name = id+randomNumber;
        }
        lb.tableID = '#' + lb.name + '-table'
    }
    /******** STARTUP FUNCTIONS *************************************/
    (function startUp() { 
        if (typeof options == 'object') { mergeOptions(options); }
  
        //create the ID
        createLBName();
        
        //add the frame div
        var frameID = lb.name + '-frame';
        $('#' + parentDIV).html('<div id="' + frameID + '"><div>');
       
        //style the frame
        $('#' + frameID).css({
            'width': '100%',
            'height': '100%',
            'overflow-y': 'auto',
            'overflow-x': 'hidden'     
        });
        
        //add the table structure
        var tableHTML = `
            <table class="jwlistbox-table" id='@name'>
                <thead></thead>
                <tbody></tbody>
            </table>
            `
        tableHTML = tableHTML.replace('@name', lb.name + '-table');
        $('#' + frameID).html(tableHTML);

        //add the default styles to the page
        addDefaultStyles();
    }());

    function debug(msg) {
        emit('debug', msg);
    }

    /**
     * Emits an event.
     *
     * @param {string} eventName - The name of the event and the string to bind with 
     *                             on the client side.
     * @param {*} payload - The primary thing to send to the client.
     * @param {*} options - The secondary thing to send to the client.
     * 
     * payload/options are just placeholders; they can be anything.
     */
    function emit(eventName, payload, options) {
        if (typeof lb.events[eventName] === 'function') { 
            lb.events[eventName](payload, options, eventName);
        } else if (typeof lb.events.other === 'function') { 
            lb.events.other(payload, options, eventName);    
        }
    }

    /**
     * converts a PK to an ID
     * @param {number} pk 
     * @returns 
     */
    function pkToID(pk) {
       lb.edit();
        var id = lb.dm.search({
            query: pk,
            searchField: lb.pkField,
            returnField: lb.idField,
            style: 'table'    
        })[0][0];
        return id;
    }
    /**
     * Converts a primary key to a row number.
     *
     * @param {number} PK - The primary key to find.
     * @returns {number} - The row number or -1 if an error occurs.
     */
    function pkToRow(pk) {
        // Validation: Check if PK is null or undefined
        if (PK === null || typeof PK === 'undefined') {
          emit('error', 'PKToRow() Primary Key should not be null or undefined');
          return -1;
        }
      
        lb.edit();

        var row = lb.dm.search({
            query: PK,
            searchField: lb.pkField
        });

        // Check if the primary key exists
        if (row.length === 0) {
          emit('error','PKToRow() Primary Key not found');
          return -1;
        }
      
        //return the first index (dm.search() returns an array of matches)
        row = row[0];
        return row;
      }

    /**
     * Returns the PK of a given row
     *
     * @param {number} row - The primary key to find.
     * @returns {number} - The PK or -1 if an error occurs.
     */
    function rowToPk(row) {
        //TODO: error checking that the row is valid


        //we can just access the table directly, the first column is the PK
        return lb.source.table[row][0];
    }

    /**
     * 
     * @param {number} row - The row to get the ID of
     * @param {boolean} usePK - Use the PK instead of the row number
     * 
     * @returns {number|string} - The ID of the row
     */
    function getIDFromRow(row, usePK) {
        //TODO: Validation

        var idCol = getIDColumn();

        //convert the pk into a row
        if (usePK) {
            row = pkToRow(pk);
        }

        return lb.source.table[row][idCol];   
    }

    /**
     * Returns the index of the ID column for use in array access
     * 
     * @returns {number} - the index of the ID column
     */
    function getIDColumn() {
        return lb.fields.indexOf(lb.options.idField);
    }

    /**
     * automatically Sets the id field of the listbox
     */
    function setIDField() {
        //try the user-supplied option and verify it exists
        if (lb.options.idField && lb.source.fields.indexOf(lb.options.idField > -1)) { 
            lb.options.idField = lb.options.idField;
        } else if (lb.source.fields.indexOf('id')) { //see if there's an 'id' field
            lb.options.idField = 'id';
        } else if (lb.source.fields.indexOf('ID')) { //see if there's an 'ID' field
            lb.options.idField = 'ID';
        } else {
            lb.options.idField = lb.source.fields[1]; //use the first field (pk=0, so 1)
        }
    }

    //TODO: this is a placeholder
    function tableMode() {
        return true;
    }

    /**
     * Returns row html meant for a table
     */
    function getRowAsTDs(row) {
        var html = '';
        var tdName = '';
        for (var col=1; col<lb.source.fields.length; col++) {
            tdName = lb.name + '-td-' + row + '-' + col;
            html += '<td class="jwlb-td" id="' + tdName + '">' + lb.source.table[row][col] + '</td>'; 
        }

        return {
            html: html
        };
    }

    /**
     * returns row html based on a template
     */
    function getRowAsTemplate(row) {
        var html = '';
        
        return html;
    }

    /**
     * Scrolls to the row of the specified pk
     * @param {number} pk - the pk to scroll to
     * @param {number} speed -how fast to scroll in ms
     */
    function scrollTo(pk, speed) {
        if (typeof speed === 'undefined') { speed = 100; }
        $('#' + lb.name + '-frame').scrollTo('#' + lb.name + '-' + pk, speed);
    }

    /**
     * Scrolls to the top of the table
     * @param {number} Speed -the speed to scroll in ms
     */
    function scrollToTop(Speed) {
        if (typeof Speed === 'undefined') { Speed = 'fast'; }
        //$('#' + _Options.name + '-table-container').animate({ scrollTop: (0) }, Speed);
    }

    /**
     * Applies the selected style to the table
     */
    function applySelected() {
        debug('apply selected to ' + JSON.stringify(lb.selected));
        lb.selected.forEach((pk) => {
            $('#' + lb.name + '-' + pk).addClass('selected');
        });
    }

    /**
     * Adds a CSS class to 
     *
     * @param {string} className 
     * @param {array[number]} rows 
     * @param {array[string]} fields 
     */
    function tag(className, rows, fields) {
        
    }
    /**
     * Adds custom CSS based on user criteria
     */
    function applyAutoTags() {

    }
    /**
     * Draws the listbox when the source changes, a sort, or a search/query
     */
    function draw() {
        debug('draw');

        var html = ''

        //clear the table body
        $(lb.tableID + ' > tbody').html('');

        var elements = [];
        var cells = [];
        var rowID = '';
        
        //loop through the data and create the rows and the elements for click events
        for (var row=0; row<lb.source.table.length; row++) {
            //id = '#jwlb-12345678-12, #jwlb-name-pk
            rowID = lb.name + '-' + lb.source.table[row][0], //this is the pk
            //start the row
            html += '<tr class="jwlb-tr" id="' + rowID + '">' ;
            //add the data in template or TD mode
            html += tableMode() ? getRowAsTDs(row).html : getRowAsTemplate(row);
            //complete the row
            html += '</tr>';
            //add the new element to the elements array
            elements.push({
                id: '#' + rowID, 
                pk: lb.source.table[row][0] 
            });
        }
       //add all the rows to the table
        $(lb.tableID + ' > tbody:last-child').append(html);

        //add the row events
        elements.forEach((elem) => {
            $(elem.id).on('click', function() { _self.click(elem.pk); });
            //TODO: doubleClick
        });

        //add the cell events if table and/or required via options
        //TODO: do this.
        

    }

    /**************************************************************************/
    /*********** PUBLIC FUNCTIONS *********************************************/
    /**************************************************************************/

    /**
     * Attaches a callback function to a specified event.
     *
     * @param {string} eventName - The name of the event to which the callback will be attached.
     * @param {function} callback - The callback function to be executed when the event is emitted.
     */
    this.on = function(eventName, callback) {
        //attaches a callback function to an event
        lb.events[eventName] = callback;
    };

    /**
     * Externally fires an event emitter.
     *
     * @param {string} eventName - The name of the event to emit.
     * @param {*} payload - The data to pass along with the emitted event.
     * @param {Object} [options] - Optional settings for the emitted event.
     */
    this.externalEmit = function(eventName, payload, options) {
        emit(eventName, payload, options);
    };

    /**
     * Sets the source of the lb. Uses DataMaster options
     * @param {(object|string)} data - Recordtable, Recordset, Table, CSV, TSV
     * @param {(string[]|boolean)} [fields] - Array of fieldnames or true to use the first row as fieldnames
     * @param {object} [options] - Various advanced options
     * @param {boolean} [options.isTSV] - Tab Separated Values are being provided as the data
     * @param {boolean} [options.noCR] - Newlines are \n only, not \r\n
     */
    this.source = function(data, fields, options) {
        debug('Options: ' + JSON.stringify(lb.options));
        lb.selected = [];
        lb.dm = new DataMaster(data, fields, options);
        //generate a list of PKs
        var pks = [];
        for (var i = 1; i <= lb.dm.length(); i++) {
            pks.push(i);
        }

        lb.nextPK = lb.dm.length + 1;
        //add the PK column to the dm
        lb.dm.addColumn(lb.pkField, pks, 0);
        //sort the data
        if (lb.options.sortFields) {
            lb.options.hasBeenSorted = true;
            lb.dm.sort(lb.options.sortFields, lb.options.sortDesc);
        }
        //save the new source
        lb.save();
        //create the backup
        lb.backup = lb.dm.copy();
        //clear the selected
        lb.selected = [];
        //set the ID field
        setIDField();

        draw();

        emit('source', true);
    }
    /**
     * Sets and/or returns the selected rows based on IDs or row numbers.
     * May use or return an array if multi-select is enabled.
     * This is a wrapper for the internal `selected` command.
     * 
     * @param {(string|string[]|'all'|'none')} IDs - A single ID, array of IDs, 
     * or special strings "all" or "none".
     * @param {('add'|'remove'|'replace')} [mode='replace'] - The mode for selection. 
     * It can be 'add', 'remove', or 'replace'. Default is 'replace'.
     * @param {boolean} [useRowNumber=false] - If true, will use the row number 
     * instead of the IDs (e.g., to select the first row).
     * 
     * @returns {*} The current selection based on the function call parameters.
     * 
     * @example
     * // To set the selection based on IDs
     * this.Selected(['id1', 'id2'], 'replace');
     * 
     * @example
     * // To select all
     * this.Selected('all');
     * 
     * @remarks
     * If the list box is not set to multi-select, only the first index of a
     * passed ID array will be acted on. This may also lead to unexpected outcomes
     * if the caller treats the list box as if multi-select is enabled when it isn't.
     */
    this.selected = function(IDs, mode, useRowNumber) {
        //TODO
    }

    /**
     * The length of the ListBox, if a search has been performed it will be the 
     * limited length
     * 
     * @returns {number} - the length of the ListBox
     */
    this.length = function() {
        //an empty table still has a length of 1 since the empty row counts, so handle that
        if (lb.source.table[0].length == 0) {
            return 0;
        } else {
            return lb.source.table.length;
        }
    }

    /**
     * Exports the ListBox in a variety of formats
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
     *      getSource('recordset',{fields:[1,3,5,4]});
     */
    this.getSource = function(style, options) {
        if (typeof options === 'undefined') { options = {}; }
        
        //TODO: Fix this
        if (typeof options.startCol === 'undefined') { 
            options.startCol = 1; 
        } else {
            options.startCol ++;
        }

        lb.edit();
        return lb.dm.exportAs(style, options);
    }

    /**
     * External click event
     * 
     * @param {number} pk - the primary key
     * @param {object} option - used to show/hide sections
     */
    this.click = function(pk, options) {
        emit('click', pkToID(pk), options);

        pk = parseInt(pk); //for safety
        
        if (lb.options.clickToSelect) {
            debug('multiselect: ' + lb.options.multiSelect);
            if (lb.options.multiSelect) {
                //see if the pk is in the selected array
                var pkIndex = lb.selected.indexOf(pk);
                if (pkIndex>-1) { //found
                    // remove it
                    lb.selected.splice(pkIndex, 1);
                    //remove the class from that element
                    $('#' + lb.name + '-' + pk).removeClass('selected');
                } else {
                    //add it
                    lb.selected.push(pk);
                    //add the class
                    $('#' + lb.name + '-' + pk).addClass('selected');
                }
                emit('select', lb.selected);
            } else {
                if (lb.selected[0] != pk) { //new row clicked
                    //remove the old class using the exiting pk 
                    $('#' + lb.name + '-' + lb.selected[0]).removeClass('selected');
                    //add the selected class to the new pk row
                    $('#' + lb.name + '-' + pk).addClass('selected');
                    //update the pk
                    lb.selected[0] = pk;
                    emit('select', pk);
                } 
                
            }
        }
    }

    /**
     * Sort the listbox
     *  
     * @param {string|array} fields - the field/fields to sort by
     * @param {boolean|array} desc - sort descending  
     * @param {*} showSections - future use
     */
    this.sort = function(fields, desc, showSections) {
        
        lb.hasBeenSorted = true;
        
        lb.options.sortFields = fields;
        lb.options.sortDesc = desc;

        //sort the source
        lb.edit();
        lb.dm.sort(fields, desc);
        lb.save();

        //redraw the listbox
        draw();

        //reapply the selected classes
        applySelected();

        //reapply the auto-tags
        applyAutoTags();

        if (lb.selected.length) {
            scrollTo(lb.selected[0]); //always scroll to the first selected option?
        }


        //applyTags();
        emit('sort', {
            sortDesc: lb.sortDesc,
            showSections: showSections,
            hasBeenSorted: lb.options.hasBeenSorted,
            sortFields: lb.options.sortFields,
            
        });
    }

    this.search = function(where) {
        if (typeof where.whereFunctions ==='undefined') { where.whereFunctions = {}; }

        //restore the source from the backup
        lb.restore();

        //clear the selected values
        lb.selected = [];

        //load the source into the dm
        lb.edit();

        //limit the dm based on the search 
        lb.dm.limit({
            query: where,
            advanced: true,
            queryFunctions: where.whereFunctions
        });

        //re-sort the data if required
        if (lb.hasBeenSorted) {
           lb.dm.sort(lb.options.sortFields, lb.options.sortDesc);
        }

        //put the dm back into the source
        lb.save();

        debug('Length: ' + this.length());
        debug(JSON.stringify(lb.source.table));

        //redraw the listbox
        draw();

        //reapply the selected classes
        applySelected();

        if (lb.selected.length) {
            scrollTo(lb.selected[0]); //always scroll to the first selected option?
        }

        //applyTags();
        emit('search', where);
    }

    /**
     * Adds a new auto-tagging object to apply classes to the table based on search criteria
     * 
     * @param {object} tag 
     * 
     * Tag format:
     *  {
     *      name: {
     *          where: "lastName='foo'",
     *          whereFunctions: {
     *              myFunc: function(val) {
     *                  return val;
     *              }
     *          },
     *          fields: [],
     *          class: 'css-class'
     *      }
     *  }
     */
    this.addAutoTag = function(tag) {
        //TODO: make this not terrible
        var name = Object.keys(tag)[0];
        lb.autoTags[name] = tag[name];
        applyAutoTags();
    }

}

/**
 * This adds a function to the jQuery object that supports scrolling to a particular element
 * note that the JQuery library must be loaded before jwListBox for this to work... I think...
*/
$.fn.scrollTo = function(elem, speed) { 
    $(this).animate({
        scrollTop:  $(this).scrollTop() - $(this).offset().top + $(elem).offset().top 
    }, speed === undefined ? 'fast' : speed); 
    return this; 
};

