function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFirstName() {
    const firstNames = [
        "Eleanor", "Miguel", "Sophia", "Derrick", "Lila", 
        "Ronan", "Hazel", "Victor", "Naomi", "Cedric", 
        "Brielle", "Edwin", "Faye", "Orlando", "Tess", 
        "Julius", "Vera", "Raphael", "Alma", "Silas", 
        "Gwen", "Hugo", "Mira", "Lyle", "Serena"
    ];
    return firstNames[getRandomInt(0, firstNames.length - 1)];
}

function getRandomLastName() {
    const lastNames = [
        "Barnett", "Cordova", "Dalton", "Espinosa", "Frost", 
        "Griffith", "Hancock", "Ibarra", "Jefferson", "Kramer", 
        "Landry", "Meadows", "Norton", "O'Connell", "Parrish", 
        "Quinlan", "Rosales", "Sampson", "Tobin", "Underwood", 
        "Velasquez", "Wilder", "Xavier", "Yates", "Zimmerman"
    ];
    return lastNames[getRandomInt(0, lastNames.length - 1)];
}

function getRandomCountry() {
    const countries = ["USA", "Canada", "UK", "Australia", "Germany", 
                       "France", "Spain", "Italy", "China", "India"];
    return countries[getRandomInt(0, countries.length - 1)];
}

function getRandomEmailDomain() {
    const emailDomains = ["example.com", "sample.net", "test.org", 
                          "demo.co", "mail.info"];
    return emailDomains[getRandomInt(0, emailDomains.length - 1)];
}

function generateEmail(firstName, lastName) {
    const emailTypes = [
        lastName + firstName,
        firstName + lastName,
        firstName.charAt(0) + lastName,
        lastName + firstName.charAt(0)
    ];
    const email = emailTypes[getRandomInt(0, emailTypes.length - 1)];
    return email.toLowerCase() + "@" + getRandomEmailDomain();
}

function generateRandomRow(id) {
    const firstName = getRandomFirstName();
    const lastName = getRandomLastName();
    return {
        ID: id,
        firstName: firstName,
        lastName: lastName,
        age: getRandomInt(18, 80),
        country: getRandomCountry(),
        email: generateEmail(firstName, lastName)
    };
}

function generateTable() {
    const table = [];
    for (let i = 1; i <= 100; i++) {
        table.push(generateRandomRow(i));
    }
    return table;
}

const dataTable = generateTable();
console.log(dataTable);
