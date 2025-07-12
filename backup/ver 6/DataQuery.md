# DataQuery Syntax  


## Introduction  
DataQuery uses a SQL-like syntax for 3 of its functions: `query()`, `update()` and `delete()`. All 3 share a common WHERE string with the following basic syntax:
`field='value' BOOLEAN field!='value'` so for example: ` where: "firstName='Susan' AND lastName!='Smith'" `

### Basic Syntax 
- You may use AND, OR, = or != (not equal) in your logic
- You may (and should) use parentheses, including nested parentheses 
- You may use wildcards: '%' = match any, '_' = match one
- You may pass a function to be used to evaluate the value where the function returns true/false if the value matches your criteria
- The syntax is **not** flexible:
    - AND, OR must be capitalized
    - Field names are case sensitive
    - Values are *not* case sensitive
    - All params, including numbers, must be enclosed in quotes
    - Spacing must either exist or not exist based on context and it must be exactly 1 space when required

 ### Here is a moderately complex example:
 ```JavaScript
 
function minAge(age, minAge) {
    return age >= minAge ? true : false;
}

res = myDataQuery.query({
    where: "(lastName='sm%' OR lastName='Jones') AND (country!='France' OR age='$minAge('21')')",
    whereFunctions: {
        minAge: minAge
    }
});

 
 
 ```
In that example we're looking for any lastNames that start with 'sm' or is 'Jones' and the country must not be 'France' or the minimum age is greater than 21. This brings us to functions and their syntax/use.

### Custom Functions

Custom functions allow you to provide your own test for values and in this way you can mimic any standard SQL function like 'BETWEEN' or language feature like 'IN'. It's also required if you want to use RegEx in your test, just put the RegEx in your function. 
Be aware that the syntax for functions in the WHERE clause differs from how parameters appear in your JavaScript function. Here's how it works:

**Simple Example:**
```JavaScript
// Test for rows where the age is between 20-30 inclusive

var res = myDataQuery.query({
    where: "age='$ageInRange()'",
    whereFunctions: {
        ageInRange: function(testValue) {
            return testValue >=20 && testValue<=30
        }
    }
});

```
*Breakdown:*
- We've passed a function that tests if the age is between 20-30 inclusive as part of the 'whereFunctions' property.
- In the WHERE clause we've indicated to the parser that we're referencing a function instead of a test string as the value by appending a `'$'` before the function name. You may still use `'$'` as a regular string test value, just don't include a function with that exact same name, so you could test if the value is literally `'$smith'`, or even `'$smith()'`, just don't include a smith() function in your whereFunctions object.
- The function still needs to be placed inside quotes just like a regular string value
- In our function, we include a 'testValue' parameter, though it's not in the WHERE syntax. Each row's field value will be the function's first parameter, so include at least one to enable evaluation.

**More Complex Example:**  
In this example we're going to use a more generic function that can take user parameters instead of using hard-coded ones, useful if you want to run a query multiple times with user-provided test values for example.
```JavaScript
// A custom function to test if a value is in range
function valInRange(val, params) {
    /** 
     * val is the value to test
     * 
     * params will be an array of parameters such that
     *  - params[0] is the lower bound
     *  - params[1] is the upper bound
     *  - params[2] specifies whether the range is inclusive
    **/

    if (params[2]) {
        // its inclusive so increment/decrement the range bounds by 1
        params[0]--;
        params[1]++;
    }

    return val>params[0] && val<params[1];   
}

var res = myDataQuery.query({
    where: "age='$valInRange('20','30','true')'",
    whereFunctions: {
        valInRange: valInRange
    }
});

```
*Breakdown:*
- Syntax: "$functionName('userParam1','userParam2','userParam3')"
- Each parameter is enclosed within quotes. It's fine that the entire function clause is also enclosed within the same style of quotes, that's what the parser expects/requires.
- There must not be a space after the comma separating the parameters.
- The parameters will be turned into a parameter array, so in this example the 3 passed parameters are refactored into 2 parameters passed to the function: 1) the test value based on the row being tested, 2) an array of the user supplied parameters.
- The parameters can be any valid JavaScript as the parser uses the eval() function to create the array of params. They still need to be enclosed in quotes even if they aren't strings. The parser uses the quotes to find the parameters.
- In the actual function definition there are two params, 1) the value to test, 2) the parameter array. 

Custom functions may also be used as part of a SET statement. Instead of returning true/false they should return the new value. As an example you could create a custom function to format floats to currency: 2312.351 -> $2,312.35. Another use case might be the total replacement of the value such as formalizing country names e.g., "USA" -> United States of America (or visa-versa).

**ALL Operator**  
You may use the expressions ``OR*=``, ``OR*!=``, ``AND*=`` and ``AND*!=`` to represent the idea of OR ALL, i.e. "Does any field = value?". A good use for this is when you want to see if your test value matches anything in your data, example:
```JavaScript
var res = myDataQuery.query({
    where: "OR*='%foo%'"
});
```
This will expand internally to be ```(field1='%foo%' OR field2='%foo%')``` etc.
Since we didn't include a SELECT property it will return all the fields. Note that you still need to incorporate a preceding "AND" or "OR" in more complex statements like this:
```JavaScript
var res = myDataQuery.query({
    where: "Country!='brazil' AND OR*='%foo%'"
});

// will expand to: "Country='brazil' AND (field1='%foo%' OR field2='%foo%' OR Country='%foo%')"
```
This will return all the rows where the Country is explicitly brazil and %foo% is also found in any other field. 

## Error Handling ##
In general, if you provide invalid syntax the WHERE clause will simply be ignored.























