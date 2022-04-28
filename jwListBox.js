/*
ver 5.1.0 2022-04-26
    -updated RemoveFormat to actually remove the format from the table
    -added ClearAllFormats
    -added option to this.click: 
        'useID' will let you trigger based on the ID, not just the PK
ver 5.0.0 2020-05-05
    -change click on multiselect, second passed value is now an object
ver 4.1.3 2019-05-17
    -fixed issue with setDefaultFieldNames when table data supplied 
ver 4.1.2 2019-05-15
    -added SkipPK to tableToRecordset
ver 4.1.1 2019-05-10
    -fixed issue with GetSource as recordset
ver 4.1.0 2019-03-15
    -added GetFields
ver 4.0.1 2019-03-08
    -code cleanup
ver 4.0.0 2019-03-07
    -fixed bug with getRowData when using recordset
    -getRowData no longer returns PK
ver 3.5.1 2019-02-21
    -fixed bug in tableToRecordset
ver 3.5.0 2019-02-20
    -added getFieldValue/this.GetFieldValue
    -added this.GetSelectedAs
    -moved jwlistbox-table styling to common style section
ver 3.4.0 2019-02-07
    -added StartCol to tableToCSV
    -tableToCSV improvements and bugfixes
ver 3.3.0 2019-02-06
    -added printMode
    -added tableToCSV
    -added this.GetSource
ver 3.2.2 2019-01-24
    -fixed issue with this.Length
    -fixed bug in getDataStyle with empty source
    -fixed issue with Selected where IDs=0 resolved as false (so you cant select the 1st row);
ver 3.2.1 2018-06-26
    -jsHint style corrections
ver 3.2.0 2018-06-25
    -emitter for named event uses same var style as for all and other (Payload, Options, EventName)
ver 3.1.1 2018-06-15
    -switched table containter from absolute to relative
    -replace nulls with blank when filling rows from template
    -don't search null fields
    -bugfixes
ver 3.1.0 2018-06-12
    -added sections
ver 3.0.0 2018-05-29
*/

/*
    TODO:
        -replace jwf.getlayout with built-in version
        -replace jwf.verifystyle with built-in version
        
        -move name, parent out of _Options
        -there's a glitch when swithing back and forth between unusally different lists (widths issue?)
*/

/*
This class simulates a Visual Studio style listbox, and then some.
It takes data in either a "recordset" or a "table" format and then displays a scrollable
table with said data.
"Recordset" style is:
[
    {id:1, name:"Alice", age:7},
    {id:2, name:"Bob", age:16},
    {id:3, name:"Cindy", age:15}
]

"Table" style is:
[
    [1, "Alice", 7],
    [2, "Bob", 16],
    [3, "Cindy", 15]
]

You may also supply a row template in standard HTML and use @colname or @colnum to do a global replace
based on the column names which are auto-generated for table style data or based on the keys if recordset
style. These are also user modifiable after the fact
*/

/* 
public functions:
    -Clear() - clears the listbox
    -Source(source); - set/update the source for the listbox
    -AddData(data, afterID, speeed) - adds data to the listbox, will insert either at the end or after the supplied ID
    -RemoveData(id, speed) - removes data by ID, the speed controls the animation in milliseconds
    -UpdateRow(ID, NewData) - Updates a row with new data, must supply the entire row's data
    -SetWidths(widths) - set the column widths using an array of standard CSS (only when not using a template)
    -FieldNames(names) - sets or gets the field names
    -Sort(columnName/columnNumber, DESC) - internally sort the data
    -Search(searchterm, columnName/columnNumber) - internally limits the data shown, use Search(false) to unlimit

    -GetFieldData(id, field) - returns the field value of the row matching a specific ID
    -GetRowData(id, useRowNumber) - returns the entire row based on an id. If useRowNumber=true it will use the row number insted
    -FindRows(SearchText, OnlyThisField) - similar to search, but just returns the matching rows (always an array)
    -click(id) - you may initiated a click event without actually clicking with the mouse
    -dblclick(id) - you may initiated a double-click event without actually clicking with the mouse
    -Selected(id) - gets or sets the selected values, may be return a single value or an array based on multiselect
    
    -AddFormat(format object) - add a format style
    -RemoveFormat(name, partialMatch) - remove a format style, TODO: partialMatch = true will match names more broadly
    -ClearAllFormats() - Clear all formats form the listbox

    -Length() - gets the length of the listbox (when used with Search/Limit it will show the limited length)
    -Details() - gets various data about the current list (including length)
*/

function jwListBox(_Name, _Parent) { 
    // you may pass an options object in the Name param
    // in this param style "Parent" will be ignored, so the 2 ways to create this are:
    //  new jstListBox(name, parent);
    //  new jwListBox({
    //      Name: "something",
    //      Parent: "else",
    //      SomeOption: "something",
    //      AnotherOption: "else"
    //  });

    /******** GLOBAL VARS *******************************************/
    var _Self = this; 
    var _Events = {}; //use for eventemitter

    //various templates
    var _TableHTML = "<div id='@name-table-container' tabindex='0'>" +
                        "<table class='jwlistbox-table' id='@name'>" +
                            "<thead>" +
                            "</thead>" +
                            "<tbody>" +
                            "</tbody>" +
                        "</table>" +
                    "</div> ";
    var _LoadingHTML = '<div id="@name-loading" style="display:none"></div>';
    //var _LoadMoreHTML = '<tr class="jwlb-tr" id="@name-loadMore">@loadMore</tr>';
    var _LoadMoreHTML = '<tr class="jwlb-tr" id=@name-loadMore>' + 
                            '<td colspan="@columns" onclick="@name.click(' + "'more')" + '">' +
                                '@loadMore' + 
                            '</td>' + 
                        '</tr>';
    var _SectionHTML = '<tr class="jwlb-tr" id=@name-section-@sectionID>' + 
                            '<td colspan="@columns" onclick="@name.click(' + "'section','@sectionID')" + '">' +
                                '@sectionTemplate' + 
                            '</td>' + 
                        '</tr>';

    //this is the master source object, it's essentially just a namespace
    var _Source = {
        data: [], //the primary data for the listbox
        fieldNames: {}, //the field/column names, format: {"FieldName":0, "FieldName":1}
        backup: [], //a backup of the data when it's been searched
        hasBeenSearched: false, //has it been searched
        searchTerm: null, //what was the searchterm
        searchField: null, //what was the search field
        hasBeenSorted: false, //has it been sorted 
        sortField: null, //what was the sort field
        sortDESC: false,    //was it sorted descending
        pkField: '_jwlbpk_', //the name of the primary key field (RESERVED)
        idField: null, //the field name for the ID
        nextPK: 0, //the next PK
        selected: [], //the list of selected primary keys
        tags: [], //a listing of client-supplied custom tags [{tag:'mytag', id:12345, field:'lastName'}]
        sections: {}, //a listing of sections: {ID: {name: "Name", visible: true}}
        nextSectionID: 0 //the ID for the next section (internal auto-increment, unique)
    };
    /******** END GLOBAL VARS *******************************************/

    /******** DEFUALT OPTIONS *******************************************/
    var _Options = {
        name: null, 
        parent: null, 
        rowTemplate: null, 
        printTemplate: null, //if this is set by user it will be used for printMode
        loadingTemplate: '@caption', 
        loadMoreTemplate:'<div style="text-align: center; font-weight:bold">@caption</div>', 
        loadPrevTemplate: '@caption', //TODO
        sectionTemplate: '<div class="jwlistbox-section-header" style="text-align: left; font-weight:bold">@sectionName</div>',
        widths: [], //the widths of the columns,
        fieldNames: {}, //{column:name, column:name} --> {0:id, 1:firstName, 2:lastName}
        idField: null, //use id, ID or the first value/column
        sortField: null, //if supplied will auto-sort the list
        sortDESC: false, //used with sortField
        //this tells the list box to treat mouse clicks and keypresses as a selection
        //it also auto-selects the first option in the list when the source is changed (new/sorted/limited)
        clickToSelect: true, //this will add code to the row so that clicking on it will select it
        autoSectionHide: true, //this will show/hide the sections when they are clicked on
        multiSelect: false, //to allow multi-select
        autoSelectFirst: true, //then this is true the first row will automatically be selected on a source or search
        formats: {}, //auto-formating rules
        printMode: false //when set to true the output will be suitible for printing, not as a listbox
    };
    /******** END DEFUALT OPTIONS *******************************************/


    /******** PUBLIC VARS *******************************************/
    /******** END PUBLIC VARS *******************************************/


    /******** PRIVATE PROTOTYPES *************************************/
    /******** END PRIVATE PROTOTYPES *************************************/


    /******** PRIVATE FUNCTONS *************************************/
    function debug(msg) {
        // @ts-ignore
        //jwf.debug(msg);
        // @ts-ignore
        //window.parent.debug(msg);
    }

    function emit(EventName, Payload, Options) {
        //emits an event
        /*
            -EventName: the name of the event and the string to bind with on the client side
            -Payload: the primary thing to send to the client
            -Options: the secondary thing to send to the client
        */
        //payload/options are just placeholders, they can be anything.
        if (typeof _Events[EventName] === 'function') { //the client has registered the event
            _Events[EventName](Payload, Options, EventName);
        //the event is unregistered and the client has asked for other
        } else if (typeof _Events.other === 'function') { 
            _Events.other(Payload, Options, EventName);    
        }
        //the client wants all events in this callback
        if  (typeof _Events.all=== 'function') {
            _Events.all(Payload, Options, EventName);
        }


    }

    function Timer() {
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
        var start = performance.now();
        
        this.lap = function(note) {
            if (typeof note === 'undefined') { note = 'UNDEFINED'; }
            laps.push({
                time: performance.now(),
                note: note
            });
        };
        this.report = function() {
            var report = {};
            var now = performance.now();
            report.total = Math.round(now-start);
            var lastLap = start;
            laps.forEach(function(lap) {
                report[lap.note] = Math.round(lap.time - lastLap);
                lastLap = lap.time;
            });
            return report;
        };
    }

    /******** STARTUP FUNCTONS *************************************/
    (function startUp() {  
        debug('executing startup');
        //proccess the contructor params
        proccessOptions(_Name);

        //create the table structure within the parent
        createTable();
        
        //apply styling 
        applyStyles();
    }());

    function proccessOptions(Options) {
        //test to see if Name was passed as a string or an object
        
        if (typeof Options === 'object') {
            //iterate through the existing options and add missing keys to the "Name" options object
            //basically we're filling Name with missing options and then copying it back into _Options
            Object.keys(_Options).forEach(function(key) {
                if (typeof Options[key] === 'undefined') {
                    Options[key] = _Options[key];
                }
            });
            _Options = Options;

            //since the name and parent should have been provided in the options object, save them into
            //the global vars
        } else {
            _Options.name = _Name;
            _Options.parent = _Parent;
        }

        //now process the other options
        
        //convert '#id' style into the respective div pattern
        // @ts-ignore
        _Options.rowTemplate = jwf.getLayout(_Options.rowTemplate); 
        // @ts-ignore
        _Options.printTemplate = jwf.getLayout(_Options.printTemplate); 
        // @ts-ignore
        _Options.loadingTemplate = jwf.getLayout(_Options.loadingTemplate);
        // @ts-ignore
        _Options.loadMoreTemplate = jwf.getLayout(_Options.loadMoreTemplate);
        // @ts-ignore
        _Options.sectionTemplate = jwf.getLayout(_Options.sectionTemplate);

        _Source.idField = _Options.idField;
    }

    function createTable() {
        debug('creating table');
        //modify the template with the _Options.name
        _TableHTML = _TableHTML.replace(/@name/g, _Options.name);
        // @ts-ignore
        $('#' + _Options.parent).append(_TableHTML);

        //Add keypress handling via jQuery
        // @ts-ignore
        $('#' + _Options.name + "-table-container").keyup(function(e){ 
            _Self.keyup(e);
        });
        //prevent window auto-scrolling with arrows
        // @ts-ignore
        $('#' + _Options.name + "-table-container").keydown(function(e) {
            var key = e.which || e.keyCode;
            if(key === 38 || key === 40) {
                e.preventDefault();
                return false;
            }
            return true;
        });

        //add in the loading div
        _LoadingHTML = _LoadingHTML.replace(/@name/g, _Options.name);
        // @ts-ignore
        $('#' + _Options.parent).append(_LoadingHTML);
    }

    function applyStyles() {
        //apply styles
        // @ts-ignore
        $('#' + _Options.parent).css({
            "position": "relative"
        });
        
        // @ts-ignore
        $('#' + _Options.name + '-table-container').css({
            "outline": "none",
            "position": "relative",
            "width": "100%",
            "height": "100%",
            "overflow-y": "auto",
            "overflow-x": "hidden",
            "-webkit-overflow-scrolling": "touch"
        });

        //append some common styles. 
        // @ts-ignore
        $('body').append("<style> " +
                ".jwlb-td-th{ " +
                    "border-right: 1px solid #dddddd; " +
                    "text-align: left; " +
                    "padding: 2px; " +
                    "overflow: hidden; " +
                    "text-overflow: ellipsis; } " +
                ".jwlistbox-table { " + 
                    "border-collapse: collapse; " +
                    "width: 100%; " +
                    "table-layout: fixed; " +
                    "white-space: nowrap; " +
                    "cursor: pointer;" +
                "</style>"
        );

        //dont overwrite custom "selected" styles
        // @ts-ignore
        if (jwf.verifyStyle('.selected') === false) {
            // @ts-ignore
            $('body').append("<style> " + 
                            ".selected{" + 
                            "background-color: black; " +
                            "color: white;} " 
            );
        }    
    }
    /******** END STARTUP FUNCTIONS *************************************/

    function resetSource() {
        //used to set the listbox source back to a starting state
        _Source.data = []; 
        _Source.fieldNames = {}; 
        _Source.backup = []; 
        _Source.hasBeenSearched = false; 
        _Source.searchTerm = null; 
        _Source.searchField = null;
        _Source.hasBeenSorted = false;
        _Source.sortField = null;
        _Source.sortDESC = false;
        _Source.pkField = '_jwlbpk_';
        _Source.idField = null;
        _Source.nextPK = 0;
        _Source.selected = [];
        _Source.tags = [];
    }

    function clearTable() {
        // @ts-ignore
        $("#" + _Options.name + " > tbody").empty();    
    }

    function copyData(Data, Optimize) {
        //makes a copy of a table, useful to avoid a reference
        //set optimize = true if copying a table/recordset
        if (Optimize) {
            var newData = [];
            var newRow = [];
            var keys = [];
            for (var row=0; row<Data.length; row++) {
                newRow = [];
                keys = Object.keys(Data[row]); //this will return column indexes if the row is an array
                //doing it this way allows the function to work with both recordset and table style
                for (var col=0; col<keys.length; col++) {
                    newRow.push(Data[row][keys[col]]); 
                }
                newData.push(newRow);
            }
            return newData;
        }
        else {
            //this will work for all circumstances but is marginally slower for larget object
            return JSON.parse(JSON.stringify(Data)); 
        }
    }

    function getFieldColumn(Field, IgnorePK) {
        //converts a fieldname into a column number and validates it
        //if ignorePK = true then it subtracts one from the field column
        debug('Fields:' + JSON.stringify(_Source.fieldNames));
        if (typeof Field === 'string') {
            if (keyExists(_Source.fieldNames, Field)) {
                Field = _Source.fieldNames[Field]; //this will set Field to the column number
            } else {
                return null; //the field is not valid
            }
        } else if (typeof Field === 'number') { //user supplied a column number for Field
            if (Field < 0 || Field > _Source.fieldNames.length) { //there will always be a fieldname for every column
                return null; //the sort field is not valid
            } else {
                Field ++; //skip primary key
            }
        } else {
            return null; //the user supplied somthing weird for Field;
        }

        if (IgnorePK) { Field--; }
        return Field;
    }

    function getRowNumber(ID, UsePK, Source) {
        //returns the row corresponding to the given ID or PK
        //if the list is limited this will only work on the limit
        
        if (typeof Source === 'undefined') { Source = _Source.data; }

        var testCol = idColumn(); //returns the col number associated with the id field

        if (UsePK) { testCol = 0; } //if UsePK then the testCol will be 0

        for (var row=0; row<Source.length; row++) {
            if (Source[row][testCol] == ID) { //soft check
                return row;
            }
        }
        
        return null; //not found
    }

    function getPK(ID, UseRow) {
        //returns the primary key for a row based on ID or Row Number
        //if the list is limited this will only work on the limit

        //UseRow is a quick response (ID will be the row number):
        if (UseRow && ID >= 0 && ID < _Source.data.length) {
            return _Source.data[ID][0];
        } else {
            var testCol = idColumn(); //returns the col number associated with the id field
            for (var row=0; row<_Source.data.length; row++) {
                if (_Source.data[row][testCol] == ID) { //soft check    
                    return _Source.data[row][0]; //this is the primary key field
                }
            }    
        }

        return null; //not found
    }

    function getID(Row, UsePK) {
        //returns the ID for a row based on the row number or PK

        var idCol = idColumn();
        //default response is simple:
        if (!UsePK && Row > -1 && Row < _Source.data.length) {
            return _Source.data[Row][idCol];
        } else { //otherwise test agains the PK field
            var PK = Row; //for code clarity
            for (var row=0; row<_Source.data.length; row++) {
                if (_Source.data[row][0] == PK) { //soft check against the PK privided and the PK column
                    return _Source.data[row][idCol]; //return the ID field associated with the PK row that was found
                }
            }       
        }

        return null; //not found
    }

    function getRowData(PK, Recordset, UseRow) {
        if (UseRow) { PK = getPK(PK, true); }
        if (testPK(PK)) {
            var col = 0;
            var row = _Source.data[getRowNumber(PK, true)]; //PK is already determined to be valid
            var fields = {};
            if (Recordset) {
                var fieldNames = Object.keys(_Source.fieldNames); //get the field names
                for (col=1; col<fieldNames.length; col++) { //for each column of the row
                    fields[fieldNames[col]] = row[col]; //add an element the the fields object fieldname = row[col]
                }
                return fields; //row now converted from an array to a dictionary
            } else {
                var rowData = [];
                for (col=1; col<row.length; col++) {
                    rowData.push(row[col]);
                }
                return rowData;
            }
            
        }
        
        return null; //blank row
    }

    function getFieldValue(PK, Field, UseRow) {
        //returns the value of a particular field given a PK/row
        //  -PK: num, the PK
        //  -Field: num, the column of the field
        //  -Recordset: bool, WHAT IS THIS FOR?
        //  -UseRow: bool, use the row number instead of the PK
        
        if (UseRow) { PK = getPK(PK, true); } //convert from row to PK
        if (testPK(PK)) { //verify that the PK exists
            var fieldRow = Field; 
            var fieldNames = Object.keys(_Source.fieldNames); //get the field names
                  
            if (typeof Field === 'string') { //convert into the table row
                fieldRow = _Source.fieldNames[Field];   
            } 

            //verify that the row is in range
            if (fieldRow > fieldNames.length +1) { return null; } //invalid row

            //return the field value
            return _Source.data[getRowNumber(PK, true)][fieldRow]; 
              
        } else {
            return null;
        }
    }

    function testPK(PK) {
        //verifies that a PK is in the source
        for (var row=0; row<_Source.data.length; row++) {
            if (_Source.data[row][0] === PK) {
                return true;
            }
        }
        return false;
    }

    function addPKtoData(Data) {
        //Adds a primary key to a data object
        var data = copyData(Data, true); 
        for (var row=0; row<data.length; row++) {
            data[row].unshift(_Source.nextPK);
            _Source.nextPK ++;        
        }
        return data;
    }

    function stripPKFromData(Data) {
        //removes the primary key field from a data object
        var data = copyData(Data, true); 
        for (var row=0; row<data.length; row++) {
            data[row].shift(); //strip the first index for each row
        }
        return data;
    }

    function getDataStyle(Data) {
        //checks to see if the data is in table or recordset format
        //checks to see if the first row of the table is an array
        //debug(JSON.stringify(Data.length));
        if (Data.length > 0) { //make sure source isn't empty
            if (Data[0].constructor === Array) { 
                return 'table';
            } else {
                return 'recordset';
            }
        } else {
            return false;
        }
    }

    function tableToCSV(Data, NewLineString, StartCol) {
        //converts the source into a CSV string
        //  -Data, the data to convert
        //  -NewLineString: string, the newline character
        //  -StartCol: int, the table column to start from, meant to skip ID fields

        if (typeof NewLineString === 'undefined' || NewLineString === null) { NewLineString = '\r\n'; }
        if (typeof StartCol === 'undefined') {
            StartCol = 1; //skip the internal PK
        } else {
            StartCol++;
        }

        var CSV = '';
        var keyCount = 0;
        //start by added the fieldnames
        Object.keys(_Source.fieldNames).forEach(function(key) {
            if (keyCount >= StartCol) {
                if (key.indexOf(',') >-1) {
                    CSV += '"' + key + '",';
                }
                else {
                    CSV += key + ',';
                }
            }
            keyCount++;  
        });

        CSV = CSV.substring(0, CSV.length-1); //remove trailing ,
        CSV += NewLineString; //add the line break
        
        //now iterate through the table
        var val = '';
        for (var row=0; row<Data.length; row++) {
            for (var col=StartCol; col<Data[row].length; col++) { //skip the PK
                if (Data[row][col]) {
                    val = Data[row][col].toString();
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
            CSV += NewLineString; //add the line break
        }

        return CSV;
    }

    function tableToRecordset(Table, FieldNames) {
        //converts table data into recordset style
        //uses the field names specified
        //TODO: allow more forgiving inputs, such as autogenerateing field names, etc.
    
        //all params are required
        if (typeof Table === 'undefined' || typeof FieldNames === 'undefined') { return null; }
    
        var recordset = [];
        var rowData = {};
        
        for (var row=0; row<Table.length; row++) {
            //initialize the rowData
            rowData = {};
            //check to make sure there are enough fieldNames for the row, fail out if not

            if (FieldNames.length !== Table[row].length) { return null; }
    
            //iterate through the table row and create the row object, skip the pk
            for (var col=1; col<Table[row].length; col++) {
                rowData[FieldNames[col]] = Table[row][col]; 
            }
      
            recordset.push(rowData); //push the row into the table
        }
        return recordset;
    }
    
    function recordsetToTable(Recordset) {
        //converts data from a recordset style to a table style
    
        var table = [];
        var rowData = [];
        var keys = [];
        for (var row=0; row<Recordset.length; row++) {
            //initialize the row
            rowData = [];
            //initialize the keys
            keys = Object.keys(Recordset[row]);
            for (var col=0; col<keys.length; col++) {
                rowData.push(Recordset[row][keys[col]]);
            }
            table.push(rowData);
        }
    
        return table;
    }

    function setIDField() {
        //determins what value to use for the ID field
        debug('Finding idField... (current is: ' + _Source.idField + ')');
        if (!_Options.idField) { //it's null, so figure out what it should be            
            if (keyExists(_Source.fieldNames,'id')) { //the use supplied a field called 'id'
                _Source.idField = 'id';
            } else if (keyExists(_Source.fieldNames,'ID')) { //the use supplied a field called 'ID'
                _Source.idField = 'ID';
            } else {
                //the keyname associated with column 1
                _Source.idField = findKey(_Source.fieldNames, 1); 
            }
        } else {
            debug('ID Field was supplied in the options: ' + _Source.idField + '(' + _Options.idField + ')');
            _Source.idField = _Options.idField;
        }
        debug('idField: ' + _Source.idField);
    }

    function idColumn() {
        //returns the column number of the idField
        return _Source.fieldNames[_Source.idField];
    }

    function keyExists(Obj, KeyToFind) {
        //determins if a given key exists in the obj
        var found = false;
        Object.keys(Obj).forEach(function(key) {
            if (key == KeyToFind) { //soft check
                found = true;
            }
        }); 
        return found;
    }

    function findKey(Obj, Value) {
        //returns the first key that cooresponds to 'value'
        //(reverse dictionary lookup)
        
        var keys = Object.keys(Obj);
        for (var i=0; i<keys.length; i++) {
            if (Obj[keys[i]] === Value) {
                return keys[i];
            }
        }

        return false;
    }

    function setDefaultFieldNames(RowData) {
        //sets the field names from the supplied RowData. 
        //by default the names are set to 0,1,2,3,etc
        //if a recordset is passed then the keys from the first row will be used
        //if the names have been supplied in the startup options those will be used

        //first create the primary key
        _Source.fieldNames[_Source.pkField] = 0;
        
        //set the names based on the data
        //this will return a list of numbers for table data
        //it's +1 becase when a user refers to column "0" it's actually column 1 in the table
        var fieldNames = Object.keys(RowData);
        debug('Supplied Field Names: ' + fieldNames);
    
        var col;
        for (col=0; col<fieldNames.length; col++) {
            setFieldName(fieldNames[col], col+1);
        }
        
        //now iterate over any names supplied in the startup options
        //this will overwrite some, none, or all of the field names depending on what was supplied
        for (col=0; col<_Options.fieldNames.length; col++) {
            //remove the existing number-based field name (+1 because of the PK)
            delete _Source.fieldNames[col+1]; 
            setFieldName(_Options.fieldNames[col], col+1);
        }

        //if the user supplied fieldNames then remove the fieldname "0" which may have been added if the RowData was a table
        if (_Options.fieldNames.length > 0) { delete _Source.fieldNames['0']; }
        

        debug('FieldNames: ' + JSON.stringify(_Source.fieldNames));
    }

    function setFieldName(FieldName, Column) {
        //sets a field name
        _Source.fieldNames[FieldName] = Column;
    }

    function getFieldName(Column) {
        var found = null;
        Object.keys(_Source.fieldNames).forEach(function(FieldName) {
            if (_Source.fieldNames[FieldName] === Column) { found = FieldName; }
        });
        return found;
    }

    function setDefaultSort() {
        //run this to auto-sort the listbox
        if (_Options.sortField) {
            _Source.sortField = _Options.sortField;
            _Source.sortDESC = _Options.sortDESC;
            _Source.data = sort(_Source.data, _Source.sortField, _Source.sortDESC);
            _Source.hasBeenSorted = true;
        }
    }

    function applyWidths(Widths) {
        //applies the widths to the table
        
        // @ts-ignore
        $("#" + _Options.name + " thead th").remove(); //remove any header information
        
        //re-add the headers
        for (var i=0; i<Widths.length; i++) {
            // @ts-ignore
            $('#' + _Options.name + " > thead").append("<th class='jwlb-td-th' id='jwlb-col" + i + "'></th>");
        }

        //add the CSS to each header
        for (i=0; i<Widths.length; i++) {
            // @ts-ignore
            $('#' + _Options.name + ' #jwlb-col' + i).css({
                "width": Widths[i],
                "min-width": Widths[i]
            });
        }
    }

    function sortBy(Field, Reverse, Primer) {
        /*USAGE:
        Sort by price high to low
        homes.sort(sort_by('price', true, parseInt));
    
        Sort by city, case-insensitive, A-Z
        homes.sort(jwf.sortBy('city', false, function(a){return a.toUpperCase()}));
        */
        var key = Primer ? 
                function(x) { return Primer(x[Field]); } : 
                function(x) { return x[Field]; };
        
        Reverse = !Reverse ? 1 : -1;
        
        return function (a, b) {
            // @ts-ignore
            return a = key(a), b = key(b), Reverse * ((a > b) - (b > a));
            }; 
    }

    
    function insertData(Data, Source, InsertIndex) {
        //calls a complex splice command to insert a multi-dimensional array into an existing one
        /*
            -Data: the data to insert (must be in table format)
            -Source: insert into this
            -InsertIndex: the index to insert into. If not specified will just concat to the end.
        */
        
        //out of bounds InsertIndexes will just insert at the beginning or the end

        //explicietly test against these 3 types to determine if we should just append
        if (typeof InsertIndex === 'undefined' ||
                    InsertIndex === false ||
                    InsertIndex === null) {
            
            InsertIndex = Source.length; //sppend it to the end
            //Source.splice.apply(Source, [Source.length,0].concat(Data));
        } 
        /*  If I'm understanding this correctly...
            First we're creating an array that simulates the params of the Array.Splice function.
            In this case [index, numToRemove, newItem1, newItem3, newItemX] using the concat command.
            Array.splice.apply() takes as it's arguments the array to act on and an array of splice params.
            The need for this is that Array.splice() will not take an array for the list of items to add, only an
            Argument list (which is a weird choice in my opinion). The apply() function runs the splice function
            by feeding the supplied array values as a list of parameters.
        */
            
        //CMD: Array1.splice.apply(Array1, [insertAtIndex,numToDelete].concat(Array2))
        //Source = copyData(Source, true);
       // Data = copyData(Data, true);
        
        Source.splice.apply(Source, [InsertIndex,0].concat(Data));
        
        return Source;    
    }
    


    function findInsertRow(NewRow, Source, Field, DESC) {
        //returns the row at which to splice in the given data
        //if the Source is not sorted this will still work, but it will be odd.
        
        //if the new row data does not match the fomat of the existing data this will fail

        if (NewRow.length != Source[0].length ) { return false; } 

        var col = getFieldColumn(Field);
        var row = 0;

        if (col === null) { return false; } //invalid column

        NewRow = copyData(NewRow); //break the reference
        
        if (DESC) {
            for (row=0; row<Source.length; row++) {
                if (!isNaN(Source[row][col])) { //a string that is really a number
                    if (parseInt(NewRow[col]) > Source[row][col]) {
                        return row - 1;
                    }   
                } else {
                    //do uppercase comparison and force the row field into a string (it should already be, but just in case)
                    if (Source[row][col].toUpperCase() < NewRow[col].toString().toUpperCase()) {
                        return row - 1;
                    }
                }
            }
            //if not found return the last row (since this is DESC)
            return Source.length-1;
        } else {
            for (row=Source.length-1; row>=0; row--) {
                if (!isNaN(Source[row][col])) { //a string that is really a number
                    if (parseInt(NewRow[col]) > Source[row][col]) {
                        return row;
                    }   
                } else {
                    //do uppercase comparison and force the row field into a string (it should already be, but just in case)
                    if (NewRow[col].toString().toUpperCase() > Source[row][col].toUpperCase()) {
                        return row;
                    }
                }
            }
            //if not found return -1 as this needs to be inserted before the first row
            return -1;

        }
    }

    function sort(Data, Field, DESC) {
        debug('sort() Sorting by ' + Field);
        //does an in-place sort of Data, so we're using a reference 
        //first verify that there is data to sort
        
        //Both Data and Field are required
        if (typeof Data === 'undefined' || typeof Field === 'undefined') { return false; }

        if (Data.length === 0) { return false; }

        var primer; //this is the function to apply to each row to determin sort order
        
        //verify that the Field is in the Source
        Field = getFieldColumn(Field);


        if (!Field) { return false; } //the field supplied was invalid

        //Field will now be a column number

        //set the primer based on the field type
        //determine if the field should be treated like a number:
        debug('Data length: ' + Data.length);
        if (isNaN(Data[0][Field])) { //not a number, not even a string representation
            primer = function(a){ return a.toUpperCase(); }; //convert everything to uppercase
        } else {
            primer = parseFloat; //so now number strings we be evaluated as numbers
        }

        Data.sort(sortBy(Field, DESC, primer));

        return Data;
    }

    function applyFormats() {
        //applies the formats to the table
        var formats = _Options.formats; //just for code readabililty
        var names = Object.keys(formats);
        names.forEach(function(name) {
            //first get a table of the matching rows in the source
            var matches = limit(_Source.data, formats[name].match, formats[name].searchField);
            debug(JSON.stringify(matches));
            //iterate through the results and add the tag to the table
            for (var i=0; i<matches.length; i++) {
                //if the mode is field then send the test field, otherwise send false
                var searchField = formats[name].mode === 'field'? formats[name].searchField : false;
                addTag(formats[name].tag, matches[i][0], searchField, formats[name].tagField);
                applyTag(matches[i][0], formats[name].tag, formats[name].tagField);
            }
        });

    }

    function applyTag(RowPKs, Tag, TagField, Remove, UseRowNumber) {
        /*
            -RowPKs: the row PKs to apply the tag to
            -Tag: the tag (css) name
            -TagField: if you only want the tag applied to a specific field
            -Remove: removes a tag
            -UseRowNumber: uses a row instead of a PK, i.e. tag the first row
        */
        //if no RowPKs (or row numbers) supplied then exit immedietely
        if (typeof RowPKs === 'undefined') { return false; }
        //further down test if tagField=null to avoid falsy 0 column
        if (typeof TagField === 'undefined' || TagField === 'row') { TagField = null; } 
        if (RowPKs.constructor != Array) { RowPKs = [RowPKs]; } //expects an array but a single value allowed
        
        //debug('Applying tag "' + Tag + '" to: ' + JSON.stringify(RowPKs) + ' on field ' + getFieldName(TagField) + '(' + TagField + ')');

        var elem = null;
        RowPKs.forEach(function(row) {
            //convert the row# to the PK
            if (UseRowNumber) { row = getPK(row, true); } 

            //use jQuery to find the field or the row
            if (TagField != null) {
                if (_Options.rowTemplate === null) { //for standard lists
                    TagField = getFieldColumn(TagField);
                    // @ts-ignore
                    elem = $('#' + _Options.name + '-' + row + ' td:nth-child(' + TagField + ')');
                    //looks like $('#myListBox-4:nth-child(1)');
                } else { //for template-based rows
                    var className = getFieldName(TagField); 
                    //this selector finds the first matching class within the row
                    // @ts-ignore
                    elem = $('#' + _Options.name + '-' + row).find('.' + className + ':first');   
                }
                
            } else {
                // @ts-ignore
                elem = $('#' + _Options.name + '-' + row); 
            }

            //add or remove the tag
            if (Remove) {
                elem.removeClass(Tag);
            } else {
                elem.addClass(Tag);
            }            
        });

    }

    function addTag(Tag, PK, SearchField, TagField, UseRow) {
        //adds a tag to the tag list
        //todo: prevent dupes

        if (UseRow) { PK = getPK(PK, true); } //convert to a PK

        if (testPK(PK)) {
            _Source.tags.push({
                tag: Tag,
                pk: PK,
                searchField: SearchField,
                tagField: TagField
            });    
        } else {
            debug('Invalid PK for tag: ' + PK);
        }
    }

    function removeTag(Tag, PK, SearchField, UseRow) {
        //removes a tag from the tag list
        debug('Removing tag ' + Tag);
        if (UseRow) { PK = getPK(PK, true); } //convert to a PK
        for (var i=0; i<_Source.tags.length; i++) {
            if (_Source.tags[i].tag === Tag) {
                if (_Source.tags[i].pk === PK && _Source.tags[i].searchField === SearchField) {
                    _Source.tags.splice(i, 1); //remove that element
                }
            }
        }
    }

    function applyTags() {
        //applies the tags saved in _Source.tags
        debug('Apply all Tags:' + JSON.stringify(_Source.tags));
        _Source.tags.forEach(function(tag) {
            applyTag(tag.pk, tag.tag, tag.tagField);
        });
    }


    function drawRows(Data, AfterPK, Speed, Before) {
        //draws rows into the table
        //  -AfterPK: int, is the ID of the row after which the rows should be inserted
        //  -Speed: int, is the animation speed //TODO: does this work?
        //  -Before: bool, switches the AfterPK to mean BeforePK
        //  -PrintMode: bool, if true does not include table structure, designed for printing.
        //      Currently PrintMode will only work with a template, otherwise will be ignored.

        if (typeof AfterPK !== 'number') {
            AfterPK = null; 
        }
        var HTML = '';
        var PK = null;
        
        for (var row=0; row<Data.length; row++) {
            /* this looks like:
                <tr 
                    class="jwlb-tr"
                    id="Name-3"
                    onclick=jwlb_name.click("3")
                    ondblclick=jwlb_name.dblclick("3")
                >
            */    

            PK = Data[row][0];

            //create the base row HTML
            if (!_Options.printMode) {
            HTML += '<tr class="jwlb-tr" id="' + _Options.name + '-' + PK +
                '" onclick=' + _Options.name + ".click('" + PK +
                "') ondblclick=" + _Options.name + ".dblclick('" + PK + "')>";
            } 
            /* This is removed as the clickToSelect flag should still fire a click event
            if (_Options.clickToSelect) {
                HTML += '<tr class="jwlb-tr" id="' + _Options.name + '-' + PK +
                '" onclick=' + _Options.name + ".click('" + PK +
                "') ondblclick=" + _Options.name + ".dblclick('" + PK + "')>";
            } else { //don't add the onclick/ondblclick handlers
                HTML += '<tr class="jwlb-tr" id="' + _Options.name + '-' + PK + '">';
            }
            */
            //now get the row itself either as table td's or a template

            if (_Options.rowTemplate) {
                if (!_Options.printMode) { HTML += "<td class='jwlb-td-th'>"; } //only add table struture if not PrintMode
                HTML += getRowHtmlAsTemplate(Data[row]); //get the row via the supplied template
                if (!_Options.printMode) { HTML += "</td>"; }
            } else {
                HTML += getRowHtmlAsTDs(Data[row]); //get the row "as" a table structure    
            }
            //finalize the row
            HTML += "</tr>";
        }

        //We now have HTML for 1 or more rows to insert either at the end of the table or after the supplied afterPK
        if (AfterPK != null) {
            if (Before) {
                // @ts-ignore
                $("#" + _Options.name + '-' + AfterPK).before(HTML);
            } else {
                // @ts-ignore
                $("#" + _Options.name + '-' + AfterPK).after(HTML);
            }
            
        } else {
            debug('Appending at the end...');
            // @ts-ignore
            $("#" + _Options.name).append(HTML);    
        }
        
    }

    function getRowHtmlAsTDs(RowData) {
        //returns html for a row in a <td> style

        var HTML = '';
        //the startcol is 1 because the 0th col is the PK   
        var startCol = 1;
                    
        //iterate over each column in the row, skipping col 0 as that is the PK
        for (var col=1; col<RowData.length; col++) {
            //<td class='jwlb-td-th'>Hello World</td>";
            HTML += "<td class='jwlb-td-th'>" + RowData[col] + "</td>"; 
        }

        return HTML;
    }

    function getRowHtmlAsTemplate(RowData) {
        //returns html for a row based on a template
        /*use @fieildName in your template to insert field data
            ex: <div id="@lastName"> will become <div id="Smith"> for recordset data
            ex: <div id="@2"> will become <div id="Alice"> assuming Alice is the 2nd column in your table data
            use @jwListBoxName to insert the name of your listbox
            ex: <button onclick="@jwListBoxName.click(@jwListBoxName.Selected(@memberID), 'add')">
                -This will create a button that calls the Selected() command using the memberID field, so:
                <button onclick="myListBox.click(myListBox.Selected(12345), 'add')"> 
                which will create a button that selects the row instead of just clicking anywhere on it.
                (Make sure to set the clickToSelect flag - false)
        */
        var HTML = '';
        if (_Options.printMode === true && _Options.printTemplate) {
            HTML = _Options.printTemplate;
        } else {
            HTML = _Options.rowTemplate;
        }
        
        var fieldName = null;
        var fieldText = null; //the value of the field;
        //iterate over every column in the row 
        for (var col=1; col<RowData.length; col++) {
            //get the fieldname for the column index
            fieldName = findKey(_Source.fieldNames, col);
            //if the fieldname was found (should always be true, but just in case)
            if (fieldName) {
                fieldText = RowData[col] === null? '' : RowData[col]; //replace nulls with
                HTML = HTML.replace(new RegExp('@' + fieldName, 'g'), fieldText);     
            }

        }
        
        return HTML;
    }

    function selected(IDs, Mode, UseRowNumber) {
        //Gets or sets the selected rows as IDs
        //May return an array or a single value depending on multiselect  
        
        //cleanSelectedIDs(IDs)
        if (IDs || IDs === 0) { //if we need to modify the IDs
            if (typeof IDs === 'string') {
                IDs = IDs.toLowerCase(); //to avoid case issues
                //clear the existing selection
                if (IDs === 'all' || IDs === 'none') {
                    applyTag(_Source.selected, 'selected', null, true); //remove all the selected tags
                    _Source.selected = []; //wipe the selected array
                }
                if (IDs === 'all') {
                    //select every PK in the source
                    _Source.data.forEach(function(row) {
                        var PK = row[0];
                        applyTag(PK, 'selected'); //add the tag
                        _Source.selected.push(PK);
                    });       
                } 
            } else {
                //force IDs into an array
                if (IDs.constructor !== Array) { IDs = [IDs]; }
                //set default behaivior
                if (typeof Mode === 'undefined') { Mode = 'replace'; } 
                Mode = Mode.toLowerCase(); //to avoid case issues

                if (_Options.multiSelect) {
                    if (Mode === 'replace') {
                        //remove the tags
                        applyTag(_Source.selected, 'selected', null, true);   
                        //wipe the selected array
                        _Source.selected = []; 
                        //add the IDs and new tags
                        IDs.forEach(function(ID) {
                            var PK = getPK(ID, UseRowNumber); 
                            applyTag(PK, 'selected'); 
                            _Source.selected.push(PK);  
                        });    
                    } else if (Mode === 'add') {
                        //add the IDs and new tags
                        IDs.forEach(function(ID) {
                            var PK = getPK(ID, UseRowNumber); 
                            applyTag(PK, 'selected'); 
                            _Source.selected.push(PK);  
                        });        
                    } else if (Mode === 'remove') {
                        //remove the tag and remove the PK from the selected
                        IDs.forEach(function(ID) {
                            var PK = getPK(ID, UseRowNumber); 
                            applyTag(PK, 'selected', null, true); 
                            removePKFromSelected(PK); 
                        });       
                    }

                    IDs.forEach(function(ID) {
                        var PK = getPK(ID, UseRowNumber);
                        if (PK != null) {
                            applyTag(PK, 'selected');
                        }
                    });
                } else { //single-select
                    //If an array was passed just use the first index
                    if (IDs.constructor === Array) { IDs = IDs[0]; }
                    var PK = getPK(IDs, UseRowNumber); //convert to PK
                    //For single-select we ignore the mode
                    applyTag(_Source.selected[0], 'selected', null, true); //remove the old tag
                    _Source.selected[0] = PK; //update the selected
                    applyTag(PK, 'selected'); //add the new tag
                }
            }
        }

        //this will always run, so the return from setting selected will be the selected
        if (_Options.multiSelect) {
            var res = [];
            for (var i=0; i<_Source.selected.length; i++) {
                res.push(getID(_Source.selected[i], true));
            }
            if (res.length === 0 ) { res = null; } //none selected, converts from [null]
            return res;
        } else {
            return getID(_Source.selected[0], true); //get the id via the PK
        }  
    }

    function cleanSelectedIDs(IDs) {
        //this helper function compares the IDs that the user is trying to select to the
        //available IDs

        //TODO!!!
    }

    function selectFirstRow() {
        //selects first row of the listbox
        debug('select first row: ' + _Options.autoSelectFirst);
        _Source.selected = []; //clear the selected items  
        if (_Options.autoSelectFirst) {
            _Source.selected.push(getPK(0, true)); //get's the PK of the first row
            applyTag(_Source.selected, 'selected'); 
            emit('select', selected(), _Options.multiSelect); //emits the selected values (which will be just the first row)
        }         
    }

    function scrollTo(PK, speed) {
        if (typeof speed === 'undefined') { speed = 100; }
        // @ts-ignore
        $('#' + _Options.name + '-table-container').scrollTo('#' + _Options.name + '-' + PK, speed);
    }

    function scrollToTop(Speed) {
        //scrolls the div to the top of the table
        
        if (typeof Speed === 'undefined') { Speed = 'fast'; }
        // @ts-ignore
        $('#' + _Options.name + '-table-container').animate({ scrollTop: (0) }, Speed);

    }

    function limit(Data, SearchTerm, Field) {
        //Searches (or limits, same thing) the provided data
        //If field is undefined then the entire row will be tested
        //If SearchTerm = undefined, or false then all data will be returned (no search/limit)
        //takes and returns a table
        debug('Getting limit for ' + SearchTerm + ' on ' + Field);
        if (typeof SearchTerm === 'undefined') { return Data; }


        var timer = new Timer();
        var newData = [];
        var data = Data; //copy the data individually when a search matches
        timer.lap('Copy Data');
                
        //convert dos/unix style wildcards into RegEX wuildcards
        SearchTerm = SearchTerm.toString().replace(/%/g, '.*'); //only need toString() once.
        SearchTerm = SearchTerm.replace(/_/g, '.');   
        SearchTerm = SearchTerm.replace(/\*/g, '.*');   
        SearchTerm = SearchTerm.replace(/\?/g, '.');  

        if (Field) {
            Field = getFieldColumn(Field); //convert field to a col number and verify it
            if (!Field) { return Data; } //invalid field provided so don't search
            for (var i=0; i<data.length; i++) {
                //test for lowercase only
                if (data[i][Field].toString().toLowerCase().search(new RegExp(SearchTerm,'i')) > -1) {
                    newData.push(copyData(Data[i])); //if the string is found in the field, add the row to newSource
                }
            }
            timer.lap('Search Field');    
        } else { //search the whole row
            for (var row=0; row<data.length; row++) { 
                for (var col=1; col<data[row].length; col++) { //skip the PK                      
                    if (data[row][col] !== null) {
                        if (data[row][col].toString().toLowerCase().search(new RegExp(SearchTerm,'i')) > -1) {
                            newData.push(copyData(data[row])); //if the string is found, add the row to newSource
                            break; //don't keep checking
                        }  
                    } 
                }
            }
            timer.lap('Search all fields');    
        }

        debug('Limit Report: Results: ' + newData.length + ', Timing: ' + JSON.stringify(timer.report()));
        
        return newData;
    }

    function pkInSelected(PK) {
        for (var i=0; i<_Source.selected.length; i++) {
            if (_Source.selected[i] == PK) { return true; } //soft check
        }
        return false;
    }

    function removePKFromSelected(PK) {
        var found = -1;
        for (var i=0; i<_Source.selected.length; i++) {
            if (_Source.selected[i] === PK) {
                found = i;
                break;
            }
        }
        if (found > -1) {
            _Source.selected.splice(i,1);    
        }
    }

    function insertSection(SectionName, BeforePK) {
        debug('Insert section: ' + SectionName);
                
        //inserts a section header into the table and the source
        /*
            -SectionName: The name of the section
            -BeforePK: The PK of the first item of a new section
        */

        //add the section to the source
        _Source.sections[_Source.nextSectionID] = {};
        _Source.sections[_Source.nextSectionID].name = SectionName;
        _Source.sections[_Source.nextSectionID].visible = true;

        //get number of columns
        var cols = Object.keys(_Source.fieldNames).length - 1; //-1 for the pk
        if (_Options.rowTemplate) { cols = 1; } //no columns when useing a template

        //replace the section name inside the template
        var sectionHTML = _Options.sectionTemplate.replace(/@sectionName/g, SectionName);

        //insert the user template into the html for the row
        var html = _SectionHTML.replace(/@sectionTemplate/g, sectionHTML);

        //replace the name of the listbox
        html = html.replace(/@name/g, _Options.name);

        //replace the column count in the colspan
        html = html.replace(/@columns/g, cols.toString());

        debug('Next section ID: ' + _Source.nextSectionID.toString());
        //replace the section ID
        html = html.replace(/@sectionID/g, _Source.nextSectionID.toString());

        debug('Inserting before ' + BeforePK + ' (' + html.length + ')');
        //insert the section HTML
        // @ts-ignore
        $("#" + _Options.name + '-' + BeforePK).before(html);

        //finally increment the next section id
        _Source.nextSectionID ++;

    }

    function drawSections(Field) {
        debug('Draw Sections...');
        //draws the sections into the table
        /*
            -Field: The field to base the section headers on
        */
       
        //validate the field and switch to column number if it isn't already
        Field = getFieldColumn(Field);
        debug('Section field: ' + Field);
        if (Field === null) { return false; }

        //wipe the existing sections and reset the next section ID back to 0
        _Source.sections = {};
        _Source.nextSectionID = 0;

        var currentSection = '';
        //iterate through the entire list
        for (var row=0; row<_Source.data.length; row++) {
            //if the value of the field of this row does not match currentSection
            if (_Source.data[row][Field] != currentSection) {
                //isert the new section
                insertSection(_Source.data[row][Field], _Source.data[row][getFieldColumn(_Source.pkField)]);
                //update the currentSection
                currentSection = _Source.data[row][Field];
            }
        }
    }
    
    function clickSection(SectionID) {
        var sectionName = _Source.sections[SectionID].name;
        debug('Click section: ' + SectionID + ' (' + sectionName + ')');
    }

    /******** END PRIVATE FUNCTIONS *************************************/

    /******** PUBLIC FUNCTIONS ******************************************/

    this.Clear = function() {
        //clears the lisbox, simply a wrapper for setting a blank source
        _Self.Source([[]]);
        debug(_Self.Selected());
    };

    this.SetWidths = function(Widths) {
        //takes an array of HTML (CSS) widths and applies them to the table.
        //doesn't work if using a template.
        _Options.widths = copyData(Widths); //to prevent weirdness if the passed var is modified by the caller
        applyWidths(_Options.widths);

    };

    this.SetOptions = function(Options) {
        //TODO:
        //Updates the list options (except name and parent) and runs needed code
    };

    this.PrintMode = function(PrintMode) {
        //sets the class to printmode or back to normal
        //  -Printmode: bool, true for printMode
        _Options.printMode = PrintMode;
        
        if (_Options.printMode) {
            var printHTML = '<div id="' + _Options.name + '" style="flex-direction: column"</div>';
            //create a new container for the print version, id=@name-print
            $('#' + _Options.parent).html(printHTML);

            //draw the rows:
            drawRows(_Source.data);
        } else {
            $('#' + _Options.parent).html(''); //wipe the entire listbox structure
            createTable(); //re-create the table
            this.Source(null, null, true);
        }
    };

    this.Source = function(Data, Options, NoRebuild) {
        //Wipes, sets the inital source and draws the listbox
        //if NoRebuild is set to true then this will just redraw from the existing data
        var timer = new Timer();
        //if no new options supplied use the existing ones
        if (typeof Options === 'undefined') { Options = _Options; }

        

        if (!NoRebuild) {
            debug('Clearing table...');
            clearTable(); //removes the table from the screen

            debug('re-processing startup options');
            proccessOptions(Options); //use the existing options object
            debug('Applying Widths...');
            applyWidths(_Options.widths);

            debug('Reseting Source');
            resetSource(); //reset the source
        
            debug('Filling Source');
            if (getDataStyle(Data) === 'recordset') {
                debug('Converting from recordset...');
                _Source.data = addPKtoData(recordsetToTable(Data));
            } else if (getDataStyle(Data) === 'table') {
                _Source.data = addPKtoData(copyData(Data, true)); //make a copy, not reference
            }
            else {
                return false; //something basic was wrong with the data
            }

            debug('Setting default field names...');
            setDefaultFieldNames(Data[0]);
            
            debug('Setting ID Field...');
            setIDField();

            debug('Setting default sort...');
            setDefaultSort(); //if the user supplied the options to sort this will do it
        }

        debug('Drawing Rows...');
        drawRows(_Source.data);

        selectFirstRow();
        scrollToTop();

        emit('source');

        debug('Build Source: ' + JSON.stringify(timer.report()));
        return true;
    };

    this.GetSource = function(Mode, AllData, NewLineString, StartCol) {
        //returns the source as either a table, recordset or string of CSV data
        //  -Mode: string ['recordset', 'table', 'csv'], how the data should be returned
        //  -AllData: bool, return the entire source or the limited source (default)
        //  -NewLineString: string, only for mode=csv, specifies an alternate newline string
        //  -StartCol: int, the table column to start from, meant to skip ID fields

        //TODO: StartCol needs to work with all mode settings, not just CSV
        
        if (typeof Mode === 'undefined') { Mode = 'recordset'; }

        Mode = Mode.toLowerCase();

        if (Mode === 'recordset') {
            var recordset = null;

            var fieldNames = [];
            Object.keys(_Source.fieldNames).forEach(function(key) {
                fieldNames.push(key);
            });
            //fieldNames.shift(); //remove dummy first field
            
            if (AllData) {
                recordset = tableToRecordset(_Source.backup, fieldNames);
            } else {
                recordset = tableToRecordset(_Source.data, fieldNames);
            }
            
            return recordset;
            
        } else if (Mode === 'table') {
            if (AllData) {
                return _Source.backup; //the entire source
            } else {
                return _Source.data; //the limited data
            }
        } else if (Mode === 'csv') {
            if (AllData) {
                return tableToCSV(_Source.backup, NewLineString, StartCol);
            } else {
                return tableToCSV(_Source.data, NewLineString, StartCol);
            }   
        } else {
            return false;
        }
    };

    this.GetFields = function() {
        //returns the field names as an array
        
        return _Source.fieldNames.slice(1, _Source.fieldNames.length);

    };

    this.AddData = function(Data, Speed, AfterID, UseRow, Append, ForceAfterID) {
        //Adds data to the listbox
        /*
            -Data: the data to add
            -Speed: the animation speed
            -AfterID: add the data after this ID. NOTE: this will be ignored if a sort has been performed
            -UseRow: The AfterID will be treated as a row
            -Append: if this is true the data will just be appended to the end, optimization for adding large
                    pre-sorted datasets in chuncks
            -ForceAfterID: if this flag is set the AfterID will be respected even if there's been a sort
        */

        if (Data.constructor != Array) { Data = [Data]; } //force an array

        if (typeof Data === 'undefined') { return false; }
        if (typeof Speed === 'undefined') { Speed = 0; }

        var before = false; //used to draw the row before the PK instead of after if inserting at the top

        //convert to table data id needed
        if (getDataStyle(Data) === 'recordset') {
            _Source.data = recordsetToTable(Data);
        }

        //add the primary key
        Data = addPKtoData(Data); //this also makes a copy, not a reference
        /*
        //sort the data, just to avoid bugs
        if (_Source.hasBeenSorted) {
            Data = sort(Data, _Source.sortField, _Source.sortDESC);
        }
        */

        var insertIndex = null;
        //we are now going to run some tests to see where to insert the data
        //If the list wasn't sorted and no afterid was supplied, treat this like an append
        if (typeof AfterID === 'undefined' && !_Source.hasBeenSorted) { debug ('Append = true'); Append = true; }
        //if the attend flag is set we will skip this
        if (!Append) {
            //loop through each item in the data
            Data.forEach(function(rowData) {
                var insertIndex = null;
                //defult behavior, not forced
                if (!ForceAfterID) {
                    //has it been sorted?
                    if (_Source.hasBeenSorted) {                        
                        //find the insertindex using the first data element
                        insertIndex = findInsertRow(rowData, _Source.data, _Source.sortField, _Source.sortDESC);
                    } else {
                        if (AfterID) {
                            insertIndex = getRowNumber(AfterID);
                        } //else insertIndex will still be null = the end
                    }
                } else {
                    //force the AfterID
                    insertIndex = getRowNumber(AfterID);
                }

                //check to see if insertindex is the top
                before = false; //assume it isn't
                if (insertIndex === -1) {
                    insertIndex = 0;
                    before = true;
                }

                //we now have an insert index, it may be null, the sorted index or a user supplied index

                //test if the source has been searched
                if (_Source.hasBeenSearched) {
                    //find the insert location in the backup
                    var backupInsertIndex = findInsertRow(rowData, _Source.backup, _Source.sortField, _Source.sortDESC);
                    //check to see if the insertrow is the top
                    if (backupInsertIndex === -1) { backupInsertIndex = 0; }
                    //insert the data into the backup
                    _Source.backup = insertData([rowData], _Source.backup, backupInsertIndex);
                    //limit the data based on the search, force into an array
                    rowData = limit([rowData], _Source.searchTerm, _Source.searchField);
                    //rowdata may be a 1-index table or []
                    if (rowData.length > 0) { //if it's a table turn it back into a row
                        rowData = rowData[0];
                    }
                }

                //finally insert the data (if it exists) into the source and draw it in the table
                if (rowData.length > 0) {
                    //draw into the table
                    //if there was an insertindex set the PK, else set it null
                    var PK = null;
                    if (insertIndex != null) {
                        PK = getPK(insertIndex, true); //get the PK of the row where we want to insert
                    } 
                    drawRows([rowData], PK, Speed, before); //force rowdata into an array

                    //insert into the source
                    //(special case) we need to see if this goes at the beginning of the table or not 
                    //if it does, then insert at the found row
                    //if it doesn't go at the top (before = false) then splice it into the next row
                    if (!before) {
                        // @ts-ignore
                        insertIndex++; //it goes after the found row
                    }
                    _Source.data = insertData([rowData], _Source.data, insertIndex);
                }
            });   
        } else { //just append
            //test if the source has been searched
            if (_Source.hasBeenSearched) {
                //insert the data into the backup
                _Source.backup = insertData(Data, _Source.backup);
                //limit the data based on the search, force into an array
                Data = limit(Data, _Source.searchTerm, _Source.searchField);
            }

            //finally insert the data (if it exists) into the source and draw it in the table
            if (Data.length > 0) {
                //insert into the source
                _Source.data = insertData(Data, _Source.data);
                //draw on the table
                //if there was an insertindex set the PK, else set it null
                var PK = getPK(_Source.data.length, true); //get the PK of the last row
                drawRows(Data, PK); 
            }    
        }  
        
        //finally apply the existing formats
        applyFormats();
    };

    this.RemoveData = function(IDs, Speed, UseRow) {
        //removes data from the list box based on the ID or the row
        if (IDs.constructor != Array) { IDs = [IDs]; } //force into an array
        var row, PK, elem;

        IDs.forEach(function(ID) {
             //remove from the table
            PK = getPK(ID, UseRow);
            if (PK != null) {
                // @ts-ignore
                elem = $('#' + _Options.name + '-' + PK);
                // @ts-ignore
                $(elem).hide(Speed, function() {
                    // @ts-ignore
                    $(elem).remove();
                });

                //remove from the primary
                //find the row in source.data
                row = getRowNumber(PK, true);
                if (row != null) {
                    _Source.data.splice(row, 1);
                }

                //remove from the backup
                //find the row in the source.backup
                row = getRowNumber(PK, true, _Source.backup);
                if (row != null) {
                    _Source.backup.splice(row, 1);
                }

                //remove from selected
                row = getRowNumber(PK, true, _Source.selected);
                if (row != null) {
                    _Source.selected.splice(row, 1);
                }
            }
        });
    };

    this.UpdateRow = function(ID, Field, NewValue, UseRow) {
        //updates a row of the lisbox based on the ID or the row
        //this will not update the information displayed in a template
        //you will need to handle this externally or remove the row then re-add it
        debug('Update row ID: ' + ID + ' Field:' + Field + ' to ' + NewValue);
        
        //all vars required
        if (typeof ID === 'undefined' ||
            typeof Field === 'undefined' ||
            typeof NewValue === 'undefined') {
                return false;
        }

        var row;
        var PK = getPK(ID, UseRow);
        var col = getFieldColumn(Field);
        if (PK != null && col != null) {
           //update the row in the source
            row = getRowNumber(PK, true);
            if (row != null) { _Source.data[row][col] = NewValue; }
            //update the row in the backup
            row = getRowNumber(PK, true, _Source.backup);
            if (row != null) { _Source.backup[row][col] = NewValue; }
            //update the table
            // @ts-ignore
            $('#' + _Options.name + '-' + PK + ' td:nth-child(' + col + ')').html(NewValue);
            applyFormats();
        }
    };
    
    this.Sort = function(Field, DESC, ShowSections) {
        /*
            Field: the fielname or column number to sort on
            DESC: Sort descending
            ShowSections: Insert section headers
        */

        debug('this.Sort(' + Field + ',' + DESC + ', ' + ShowSections + ')');
        //sorts the listbox. Also sets the internal sort if data is added later
        
        //make sure the Field is valid            
        Field = getFieldColumn(Field);
        if (!Field) { return false; } //invalid field provided

        Field--; //subtract 1 from the field, since the internal sort function will add it back

        //check to see if the table has been sorted and if so sort the backup as well
        //use the size of the backup data instead of the flag, might prevent a bug trying ot sort empty data
        if (_Source.backup.length > 0) { 
            _Source.backup = sort(_Source.backup, Field, DESC);
        }

        //set the sort options
        _Source.hasBeenSorted = true;
        _Source.sortField = Field;
        _Source.sortDESC = DESC;

        //sort the source
        _Source.data = sort(_Source.data, Field, DESC);

        //redraw the listbox
        var timer = new Timer();

        clearTable(); //removes the table from the screen 
        _Source.sections = {}; //wipe the section headers just to be safe  //TODO: needed?

        drawRows(_Source.data);

        if (ShowSections) {
            drawSections(Field);
        }

        applyTag(_Source.selected, 'selected');
        scrollTo(_Source.selected[0]); //always scroll to the first selected option?
        applyTags();

        emit('sort', {
            hasBeenSorted: _Source.hasBeenSorted,
            sortField: _Source.sortField,
            sortDESC: _Source.sortDESC,
            showSections: ShowSections
        });

        debug('Sort Source: ' + JSON.stringify(timer.report()));
    };

    this.DisplaySection = function(SectionName, Display) {
        //hides or shows a section
        /*
            -SectionName: the name/title of the section
            -Hide: true=hide, false = show
        */

        debug('Displaying section ' + SectionName + ' ' + Display);

        //get the ID associated with the name
        var sectionID = null;
        Object.keys(_Source.sections).forEach(function(ID) {
            if (_Source.sections[ID].name === SectionName) {
                sectionID = ID;
            }
        });

        //section was not found, quit
        if (sectionID === null) { return false; }

        //Display was not specified so reverse current condition
        if (typeof Display === 'undefined') {
            // @ts-ignore
            Display = !_Source.sections[sectionID].visible;
        }

        //set the visibility to the correct value
        // @ts-ignore
        _Source.sections[sectionID].visible = Display;
            
        var rowIDs = _Self.FindRows(SectionName, _Source.sortField, true);
        debug('Found ' + rowIDs.length + ' rows in section: ' + JSON.stringify(rowIDs));
        _Self.DisplayRows(rowIDs, Display);
    };

    this.DisplayAllSections = function(Display) {
        //expands/collapses all the sections

        Object.keys(_Source.sections).forEach(function(ID) {
            _Self.DisplaySection(_Source.sections[ID].name, Display);
        });
    };

    this.GetSectionHeader = function(SectionName) {
        //returns the jQuery element of the matching section header
        //useful when applying styling to a specific section
        //get the ID associated with the name
        var sectionID = null;
        Object.keys(_Source.sections).forEach(function(ID) {
            if (_Source.sections[ID].name === SectionName) {
                sectionID = ID;
            }
        });

        //section was not found, quit
        if (sectionID === null) { return false; }

        // @ts-ignore
        return $('#' + _Options.name + '-section-' + sectionID);
    };

    this.Search = function(SearchTerm, Field) {
        //limits the listbox to the rows that match the searchterm.
        //Also set's an internal search flag if data is added later

        if (!_Source.hasBeenSearched) { //the source has not been searched
            _Source.backup = copyData(_Source.data, true); //make a backup of the data
        }
        debug('SearchTerm >' + SearchTerm + '< (' + typeof SearchTerm + ')');
        if (SearchTerm === '' || SearchTerm === false) { //a blank string or explicitely false
            _Source.data = copyData(_Source.backup, true); //restore from backup
            //clear the searched flag and the saved values
            _Source.hasBeenSearched = true;
            _Source.searchTerm = null;
            _Source.searchField = null;
        } else {
            //set the searched flag and add the term and the field to the source
            _Source.hasBeenSearched = true;
            _Source.searchTerm = SearchTerm;
            _Source.searchField = Field;

            _Source.data = limit(_Source.backup, SearchTerm, Field); //search the backup
        }
        
        //redraw the table
        clearTable();
        drawRows(_Source.data);
        selectFirstRow();
        scrollToTop();
        applyTags();

        emit('search', {
            hasBeenSearched: _Source.hasBeenSearched,
            searchTerm: _Source.searchTerm,
            searchField: _Source.searchField    
        });

    };

    this.DisplayRows = function(RowIDs, Display) {
        //hides all rows were a certain Field matches a certain value
        //useful for hiding/showing sections
        /*
            -Rows: a list of or a single row ID
            -Hide: true=hide, false = show
        */

        //force into an array
        if (RowIDs.constructor != Array) { RowIDs = [RowIDs]; }

        var PK = null;
        var elem = null;

        for (var i=0; i<RowIDs.length; i++) {
            //get the PK for each of the provided rowIDs
            PK = getPK(RowIDs[i]);
            if (PK !== null) {
                // @ts-ignore
                elem = $('#' + _Options.name + '-' + PK);
                if (Display) {
                    elem.show();
                } else {
                    elem.hide();
                }
            }
        }

    };

    this.GetRowNumber = function(ID) {
        //returns a row number for a given ID
        return getRowNumber(ID);
    };

    this.GetFieldValue = function(ID, Field, UseRow) {
        //returns the value of a specified field based on the ID or the row
        //wrapper for internal getFieldValue;
        var PK = getPK(ID, UseRow);
        return getFieldValue(PK, Field, false);
    };

    this.GetRowData = function(ID, Recordset, UseRow) {
        //returns the entire row basd on the ID or the row.
        //May be asked to return data in table or recordset format
        
        //the PK may be an ID or a row at first
        var PK = null;
        if (!UseRow) { PK = getPK(ID); } //convert what should be an ID into a PK
        
        //PK should either be a valid PK and UseRow=false, or a number and UseRow=true
        return getRowData(PK, Recordset, UseRow); 
    };

    this.GetRowName = function(ID, UseRowNumber) {
        //returns the name of the HTML element associated with the row
        var PK = getPK(ID, UseRowNumber);
        if (PK === null) {
            return null; //ID was not found in the source
        } else {
            return _Options.name + '-' + PK;
        }
    };

    this.GetRowElement = function(ID, UseRowNumber) {
        //returns the jQuery element associated with the row    
        var PK = getPK(ID, UseRowNumber);
        if (PK === null) {
            return null; //ID was not found in the source
        } else {
            // @ts-ignore
            return $('#' + _Options.name + '-' + PK);
        }
    };

    this.GetFieldElement = function(ID, Field, UseRowNumber) {
        //returns the jQuery element associated with the field within the row
        //NOTE that this only works for column based listboxes, not those based on templates
        //If you need to identify part of a row using a template include an id element in the template
        //ex: <span id="MySpan-@LastName">
        //Then use #MySpan-Smith to reference it. 

        //first make sure that the field is valid
        var col = getFieldColumn(Field);
        if (col === null) { return null; } //invalid field

        col--; //since there's no PK in the document

        var PK = getPK(ID, UseRowNumber);
        if (PK === null) {
            return null; //ID was not found in the source
        } else {
            // @ts-ignore
            var elem = $('#' + _Options.name + '-' + PK + ' td:nth-child(' + col + ')');
            //this will most likly fail if a template is used
            //we're  just going to switch undefined-->null for consistancy
            if (typeof elem === 'undefined') {
                return null;
            } else {
                return elem;
            }
        }
    };

    this.FindRows = function(SearchTerm, Field, OnlyRowIDs) {
        //Returns an array of rows in either table or recordset data based on a search term and search field
        /* 
            -SearchTerm: the term to search for
            -Field: the field to search on. undefined = whole row
            -OnlyRowIDs: returns a list of just the RowIds
        */
        var data = limit(_Source.data, SearchTerm, Field);

        if (OnlyRowIDs) {
            //create a simple list with just the IDs of the matching rows
            var idCol = idColumn();
            debug('Limiting data to just row IDs... col:' + idCol);
            var IDs = [];
            for (var row=0; row<data.length; row++) {
                IDs.push(data[row][idCol]);
            }
            return IDs;
        } else {
            //return the matching rows without the PK column
            return stripPKFromData(data);
        }
    };

    this.Selected = function(IDs, Mode, UseRowNumber) {
        //Sets and/or returns the selected rows based on IDs or row numbers
        //May use/return an array if multi-select is enabled
        //a wrapper for internal selected command
        /*
            -IDs a single or array of IDs, may also be "all" or "none"
            -Mode: add/remove/replace default = replace, i.e. all currently selected will be replace with provided
            -UseRowNumber: only for setting IDs, will use the row number instead of the IDs (ex: select first row)
        */
        //If a list box is not set to multiselect then only the first index of a passed ID array will be acted on.
        //This may also cause some unexpected outcomes if the caller is treating it as multiselect enabled
        
        //if the user supplied a new selection then emit that fact
        if (IDs) {
            emit('select', IDs, _Options.multiSelect);
        }
        return selected(IDs, Mode, UseRowNumber);
    };

    this.GetSelectedAs = function(Column) {
        //returns an alternate column of data using the selected fields
        //  -Column: num/string: the column of data you want instead of the ID column


        if (_Options.multiSelect) {
            var res = [];
            for (var i=0; i<_Source.selected.length; i++) {
                res.push(getFieldValue(_Source.selected[i], Column));
            }
            if (res.length === 0 ) { res = null; } //none selected, converts from [null]
            return res;
        } else {
            return getFieldValue(_Source.selected[0], Column); 
        }  
    };

    this.AddFormat = function(Formats) {
        //todo: support some method of formating and tagging on a template
        //todo: allow field/searchField/tagField morphism

        //adds a value-based formating to a field/row
        /* Format Object format:
            {
                name: {
                    mode: "Mode",
                    searchField: "fieldName",
                    tagField: "fieldName", //Or use just 'field' if they are both the same 
                    match: "Pattern", 
                    tag: "CSS tag"
                }
            } 
            -mode: row/field -apply the tag to the row or the cell
            -field: the patern must find a match in a particular column. false for all columns.
            -match: String or RegExp match
            -tag: a css classname
        */
        
        var formatNames = Object.keys(Formats); //get a list of the format names provided       
        formatNames.forEach(function(name) { //loop through each one
            _Options.formats[name] = Formats[name]; //add or replace the existing format
            //convert into a column (and set to null if field doesn't exists), set ignorePK = true
            _Options.formats[name].searchField = getFieldColumn(_Options.formats[name].searchField, true);
            debug('TagField:' + _Options.formats[name].tagField + ' = ' + getFieldColumn(_Options.formats[name].tagField, false));
            //for the tag field we need to see if we're dealing with a template or column style //TODO: is this true?
            if (_Options.rowTemplate === null) {
                _Options.formats[name].tagField = getFieldColumn(_Options.formats[name].tagField, true);
            } else {
                _Options.formats[name].tagField = getFieldColumn(_Options.formats[name].tagField, false);
            }
            
        });

        debug('FORMATS: ' + JSON.stringify(_Options.formats));
        
        applyFormats(); //apply the formats
    };

    this.RemoveFormat = function(FormatName) {
        //removes a value-based format
        if (typeof _Options.formats[FormatName] !== 'undefined') {
          $('#' + _Options.name).find('*').each(function() {
            $(this).removeClass(_Options.formats[FormatName].tag);
          });
          delete _Options.formats[FormatName]; //remove the format from the options
        }         
    };

    /**
     * Removes all existing formats from the table and from the _Options
     */
    this.ClearAllFormats = function() {
      var formatNames = Object.keys(_Options.formats);
      formatNames.forEach(function (format) {
        $('#' + _Options.name).find('*').each(function() {
          $(this).removeClass(_Options.formats[format].tag);
        });
        delete _Options.formats[format];
      });
    }

    this.Tag = function(RowIDs, Tag, Field, Remove, UseRowNumber) {
        //adds or removes a custom CSS class to the rows/fields provided
        /*
            -RowIDs: an array of row IDs to apply the tag to
            -Tag: a CSS class name
            -Field: if this is set to a column number or field name only that field will get the tag
            -Remove: if set to true then the tag will be removed
            -UseRowNumber: if set to true the row number will be used instead of the ID
        */
        //TODO: how will this handle non-unique IDs? Maybe it shouldn't
        //TODO: test this more
        
        //if only a single ID supplied make it an array
        if (RowIDs.constructor != Array) { RowIDs = [RowIDs]; }
        var PK;
        RowIDs.forEach(function(ID) {
            PK = getPK(ID, UseRowNumber);
            if (Remove) {
                removeTag(Tag, PK, Field);
            } else {
                addTag(Tag, PK, Field);
            }
            applyTag(PK, Tag, Field, Remove); 
        });

    };

    this.ClearTags = function() {
        //removes all custom tags from the listbox
        //TODO
    };

    this.Length = function() {
        //returns the length of the listbox. If a search has been performed length will be the limited length
        return _Source.data.length;
    };

    this.Details = function() {
        //returns various details about the listbox
        var res = {};
        res.length = _Source.data.length;
        res.totol = _Source.hasBeenSearched? _Source.backup.length : _Source.data.length;
        res.options = _Options;

        res = copyData(res); //so you're not passing a reference to anything back

        return res;
    };

    this.ShowLoading = function(Show, Caption) {
        //displays or hides the loading div: #myList-loading
        /*
            -Show: true/false
            -Caption: text to display, use @caption in your template if desired
        */
        
        if (typeof Caption === 'undefined') { Caption = 'Loading...'; }
        var html = _Options.loadingTemplate.replace(/@caption/g, Caption);
        // @ts-ignore
        var table = $('#' + _Options.name);
        // @ts-ignore
        var loading = $('#' + _Options.name + '-loading');
        if (Show) {
            table.hide(0, function() {
                loading.html(html);
                loading.show();
            });
        } else {
            loading.hide(0, function() {
                table.show();
            });  
        }
    };

    this.ShowLoadMore = function(Show, Caption, ShowLoadPrevious) {
        //displays or hides an inline notification/clickable item to allow loading more results
        /*
            -Show: true/false
            -//TODO: ShowLoadPrevious: instead of at the bottom for load more it will be at the top
                this is useful if you need to limit the total results in your listbox
            -Caption: If a template is not provided, this will control the displayed text
        */

        if (typeof Caption === 'undefined') { Caption = '--- Load More ---'; }

        //get number of columns
        var cols = Object.keys(_Source.fieldNames).length - 1; //-1 for the pk
        if (_Options.rowTemplate) { cols = 1; } //no columns when useing a template
        
        //replace the caption inside the template
        var templateHTML = _Options.loadMoreTemplate.replace(/@caption/g, Caption);

        //insert the user template into the html for the row
        var html = _LoadMoreHTML.replace(/@loadMore/g, templateHTML);

        //replace the name of the listbox
        html = html.replace(/@name/g, _Options.name);

        //replace the column count in the colspan
        // @ts-ignore
        html = html.replace(/@columns/g, cols);

        if (Show) {
            // @ts-ignore
           $("#" + _Options.name).append(html);
        } else {
            // @ts-ignore
            $('#' + _Options.name + '-loadMore').remove();
        }

    };

    this.click = function(PK, Option) {
        //a mouse click
        //this is called from the page via an inline onclick event for every row
        
        /*
            -PK: either the PK of the row or a special opion like 'more' or 'section
            -Options: placeholder. Used by section to tell which sectionID
        */

        if (Option === 'useID') { PK = getPK(PK); }
        //first see if this is a load more/previous click //TODO: previous
        //this is exit the function if either is true
        if (PK === 'more') {
            //the 'load more' row was clicked
            emit('more');
            return true;
        } else if (PK === 'prev') {
            //the 'load previous' row was clicked
            emit('prev');
            return true;
        } else if (PK === 'section') {
            //a section header was clicked
            if (_Options.autoSectionHide) {
                _Self.DisplaySection(_Source.sections[Option].name);
            }
            emit('click-section', _Source.sections[Option].name);
            clickSection(Option);
            return true;
        }
        
        //assume we got a valid PK //TODO validate?

        PK = parseInt(PK); //convert to a number
        debug('----' + _Options.name + ' clicked with PK: ' + PK);
        //only modify the selction if clicktoselect is set
        if (_Options.clickToSelect) {
            if (_Options.multiSelect) {
                //determine if the passed ID is already selected
                if (pkInSelected(PK)) {
                    applyTag(PK, 'selected', null, true); //if true then remove the tag
                    removePKFromSelected(PK); //and remove the ID 
                } else {
                    _Source.selected.push(PK); //else add it
                    applyTag(PK, 'selected'); //and tag it
                }
            } else {
                applyTag(_Source.selected[0], 'selected', null, true);
                //update _Source.selected
                _Source.selected[0] = PK;
                applyTag(_Source.selected[0], 'selected');
            }

            emit('click', selected(), {multiSelect: _Options.multiSelect, id:getID(PK)});
        } else { //repond with the rowID that was clicked
            emit('click', getID(PK));
        }
    };

    this.dblclick = function(PK) {
        //a mouse double-click
        //TODO: if multiselect then wipe all and remove tags, set the new selected and tag to PK

        emit('dblclick', selected(), _Options.multiSelect);
    };

    this.keyup = function(event) {
        //a key up event
        //this function is not intended to be executed manually but it must be public
        //this is for using the arrow keys to scroll the listbox

        if (_Options.multiSelect) { return false; } //don't handle keypresses when multiselect is true

        var key = event.which || event.keyCode;
        debug("this.keyUp, The Unicode value is: " + key);
        if (key === 40) { //down arrow
            var nextRow = getRowNumber(_Source.selected[0], true); //get the current row of the selected value
            //if nothing selected nextRow will be null
            //also make sure we're not going beyond the end of the listbox 
            if (typeof nextRow === 'number' && nextRow <= _Source.data.length-2) {  //-2 so you last move down from the 2nd to last
                nextRow++; //the next row...
                _Self.click(getPK(nextRow, true)); //simulate a click to the next row in the listbox
                //we want to scroll with some headroom, so we need to figure out the PK of 3 rows up
                //calculate from the next row, but first make sure we're far enought down
                if (nextRow >= 4) {
                    scrollTo(getPK(nextRow-3, true)); //the PK of the row 4 back
                }
            }
        } else if (key === 38) { //up arrow
            //(same as above but reversed)
            var prevRow = getRowNumber(_Source.selected[0], true); //get the current row of the selected value
            if (typeof prevRow === 'number' && prevRow >= 1) {  //1 so you don't move up from top (0)
                prevRow--; //the prev row...   
                _Self.click(getPK(prevRow, true)); //simulate a click to the prev row in the listbox 
                if (prevRow >= 3) {
                    scrollTo(getPK(prevRow-3, true)); //the PK of the row 4 back
                }
            }
        }
    };

    this.on = function(EventName, Callback) {
        //attaches a callback function to an event
        _Events[EventName] = Callback;
    };


    /******** END PUBLIC FUNCTIONS *************************************/

} //END OF jwListBox


//This adds a function to the jQuery object that supports scrolling to a particular element
// @ts-ignore
jQuery.fn.scrollTo = function(elem, speed) { 
    // @ts-ignore
    $(this).animate({
        // @ts-ignore
        scrollTop:  $(this).scrollTop() - $(this).offset().top + $(elem).offset().top 
    }, speed === undefined ? 'fast' : speed); 
    return this; 
};