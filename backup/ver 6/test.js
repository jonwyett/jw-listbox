var lb = null;


$(document).ready(function() {
    jwf.addDebug(true);
    lb = new jwListBox('parent', {sortField: 'lastName'});
    lb.on('other', function(payload, options, eventName) {
        jwf.debug('lb.' + eventName + '-> ' + payload);// + ', ' + JSON.stringify(options));
    });
    lb.on('select', function(selected) {
        jwf.debug('lb.select-> ' + JSON.stringify(selected));
    });

    jwf.searchBox('search', 250, textSearch);

});

function textSearch(value) {
    jwf.debug('SEARCH: ' + value);
    var search = "'%" + value + "%'";
    lb.search(
        "OR*=" + search + " AND ID!=" + search
    );
}

function go() {
    jwf.debug('--GO');
    lb.source(lb_data);

}

function sort() {
    jwf.debug('--SORT');
    lb.sort(['country','firstName'], [false, true]);
}

function search() {
    jwf.debug('--SEARCH');
    lb.search(
        "firstName='Vera' OR country='USA'"
    );
}

function searchAgain() {
    jwf.debug('--SEARCH AGAIN');
    lb.search(
        "country='China'"
    );
}