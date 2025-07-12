const fs = require('fs');
const path = require('path');

/**
 * Extracts the complete function signature from a line of code.
 * @param {string} line - A line of JavaScript code.
 * @return {string} The extracted function signature.
 */
function extractFunctionSignature(line) {
    const functionPattern = /function\s+(\w+)\s*\(([^)]*)\)/;
    const methodAssignPattern = /this\.(\w+)\s*=\s*function\s*\(([^)]*)\)/;
    const arrowFunctionPattern = /(\w+)\s*=\s*\(([^)]*)\)\s*=>/;
    const methodPattern = /(\w+)\s*\(([^)]*)\)/;

    const match = line.match(functionPattern) || 
                  line.match(methodAssignPattern) ||
                  line.match(arrowFunctionPattern) || 
                  line.match(methodPattern);
    
    if (match) {
        const functionName = match[1];
        const params = match[2].trim();
        return `${functionName}(${params})`;
    }

    return 'UnnamedFunction()';
}

function createAnchor(name) {
    return name
        .toLowerCase()
        .replace(/[\s,()]/g, '-') // Replace spaces, commas, and parentheses with hyphens
        .replace(/[^\w-]/g, '');  // Remove any other non-word characters
}


/**
* Converts a JSDoc comment block to Markdown format.
* @param {string} jsdocComment - The JSDoc comment block.
* @return {string} The converted Markdown text.
*/
function convertToMarkdown(jsdocComment) {
   // Initialize an empty object to store extracted data
   const data = {
       description: '',
       params: [],
       returns: '',
       errors: '',
       notes: ''
   };

   // Split the comment block into lines and process each line
   const lines = jsdocComment.split('\n');
   lines.forEach(line => {
       // Remove the comment syntax (/*, */, *) from the line
       const cleanedLine = line.replace(/(\/\*\*|\*\/|\*)/g, '').trim();

       if (cleanedLine.startsWith('@param')) {
           // Extract parameter info
           const paramMatch = cleanedLine.match(/@param\s+\{(.+?)\}\s+(\S+)\s+-\s+(.+)/);
           if (paramMatch) {
               data.params.push(`- **${paramMatch[2]}** \`${paramMatch[1]}\` - ${paramMatch[3]}`);
           }
       } else if (cleanedLine.startsWith('@returns') || cleanedLine.startsWith('@return')) {
           // Extract return info
           const returnMatch = cleanedLine.match(/@returns?\s+\{(.+?)\}\s+-\s+(.+)/);
           if (returnMatch) {
               data.returns = `- (\`${returnMatch[1]}\`): ${returnMatch[2]}`;
           }
       } else if (!cleanedLine.startsWith('@')) {
           // Extract description or notes
           if (data.description) {
               data.notes += cleanedLine + '\n';
           } else {
               data.description += cleanedLine + '\n';
           }
       }
   });

   // Construct Markdown text
   let markdownText = `### Description\n- ${data.description.trim()}\n\n`;

   if (data.params.length) {
       markdownText += `### Parameters\n${data.params.join('\n')}\n\n`;
   }

   if (data.returns) {
       markdownText += `### Returns\n${data.returns}\n\n`;
   }

   if (data.errors) {
       markdownText += `### Errors\n${data.errors}\n\n`;
   }

   if (data.notes.trim()) {
       markdownText += `### Notes\n${data.notes.trim()}\n\n`;
   }

   markdownText += `### Code Examples\n\`\`\`javascript\n// Example usage\n\`\`\`\n\n`;
   markdownText += `### Comments\n- Additional comments or observations.\n`;

   return markdownText;
}


function processFile(filename) {
    const filePath = path.resolve(filename);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        let markdown = '';
        const lines = data.split('\n');
        let inComment = false;
        let commentLines = [];
        let functionName = '';
        const functionNames = []; // Array to keep track of function names

        lines.forEach((line, index) => {
            if (line.includes('/**')) {
                inComment = true;
                commentLines = [];
            } else if (inComment && line.includes('*/')) {
                inComment = false;
                functionName = extractFunctionSignature(lines[index + 1]);
                functionNames.push(functionName); // Add the function name to the array
                markdown += `# ${functionName}\n`;
                markdown += convertToMarkdown(commentLines.join('\n'));
                markdown += '\n';
            } else if (inComment) {
                commentLines.push(line);
            }
        });

        // Generate Table of Contents
        const tableOfContents = functionNames.map(name => `- [${name}](#${name.toLowerCase().replace(/[\s\(\),]/g, '-')})`).join('\n');
        markdown = `# Table of Contents\n${tableOfContents}\n\n` + markdown;

        const markdownFilename = `${path.basename(filename, path.extname(filename))}.md`;

        fs.writeFile(markdownFilename, markdown, (err) => {
            if (err) {
                console.error('Error writing Markdown file:', err);
                return;
            }
            console.log(`Markdown file created: ${markdownFilename}`);
        });
    });
}


// Get the filename from command-line arguments
const filename = process.argv[2];
if (!filename) {
    console.error('Please provide a JavaScript file name.');
    process.exit(1);
}

processFile(filename);
