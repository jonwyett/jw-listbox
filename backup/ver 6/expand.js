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

// Example usage
const query = "foo";
const fields = ['col1', 'col2', 'col3'];
console.log(expandAllFields(query, fields));
