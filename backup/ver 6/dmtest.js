const { DataQuery, DataMaster } = require('./datamaster');

var data = require('./data').data;
//var DataMaster = require('./datamaster').DataMaster;

var dm = new DataMaster(data);
var dq = new DataQuery(data);
console.log(dm.print(true));

var firstName = dq.query({
    select: 'firstName',
    where: "ID='99'"
});

var lastName = dq.query({
    select: 'lastName',
    where: "ID='99'"
});
console.log(firstName);
console.log(lastName);

/*
dq.update({
    where: 'country="usa"',
    set: 'age="$newAge("<",">")", email="NONE"',
    setFunctions: {
        newAge: function(age, params) {
            return params[0] + age + params[1];
        }
    }
});

dq.delete({
    where: 'country="France" OR country="Spain"'
});
*/
var res = null;
res = dq.query({});

res = dq.query({
    where: 'Country="usa"'
}, true);














console.log(dq.print(true));

