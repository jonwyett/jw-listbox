        let listbox1, listbox2;
        
        function log(message) {
            const debugOutput = document.getElementById('debug-output');
            debugOutput.textContent += new Date().toLocaleTimeString() + ': ' + message + '\n';
            console.log(message);
        }
        
        function clearDebug() {
            document.getElementById('debug-output').textContent = '';
        }
        
        // Test data with various field types
        const testData = [
            { 
                id: 1, 
                name: 'Alice Johnson', 
                email: 'alice@example.com',
                html: '<strong>Admin</strong>',
                xss: '<scr' + 'ipt>alert("xss")</scr' + 'ipt>Dangerous'
            },
            { 
                id: 2, 
                name: 'Bob Smith', 
                email: 'bob@example.com',
                html: '<em>User</em>',
                xss: '<img src="x" onerror="alert(\'xss\')">Malicious'
            },
            { 
                id: 3, 
                name: 'Charlie Brown', 
                email: 'charlie@example.com',
                html: '<span style="color: blue;">Editor</span>',
                xss: 'javascript:alert("xss")'
            }
        ];
        
        function testDefaultRendering() {
            log('=== Testing Default Rendering (No Template) ===');
            
            if (listbox1) listbox1.destroy();
            
            listbox1 = new JwListBox('#container1');
            listbox1.on('error', (error) => {
                log('Error: ' + JSON.stringify(error));
            });
            
            listbox1.setSource(testData);
            log('Default rendering applied - should show field: value format');
        }
        
        function testStringTemplate() {
            log('=== Testing String Template ===');
            
            if (listbox1) listbox1.destroy();
            
            const template = `
                <div class="user-card" style="border: 1px solid #ddd; padding: 10px; margin: 5px 0; border-radius: 4px;">
                    <h4 style="margin: 0 0 5px 0; color: #333;">{{name}}</h4>
                    <p style="margin: 0; color: #666;">Email: {{email}}</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.9em;">ID: {{id}}</p>
                </div>
            `;
            
            listbox1 = new JwListBox('#container1');
            listbox1.on('error', (error) => {
                log('Error: ' + JSON.stringify(error));
            });
            
            listbox1.setTemplate(template).setSource(testData);
            log('String template applied');
        }
        
        function testTemplateElement() {
            log('=== Testing <template> Element ===');
            
            if (listbox1) listbox1.destroy();
            
            listbox1 = new JwListBox('#container1');
            listbox1.on('error', (error) => {
                log('Error: ' + JSON.stringify(error));
            });
            
            listbox1.setTemplate('#user-template').setSource(testData);
            log('Template element (#user-template) applied');
        }
        
        function testDivTemplate() {
            log('=== Testing <div> Template ===');
            
            if (listbox1) listbox1.destroy();
            
            listbox1 = new JwListBox('#container1');
            listbox1.on('error', (error) => {
                log('Error: ' + JSON.stringify(error));
            });
            
            listbox1.setTemplate('#div-template').setSource(testData);
            log('Div template (#div-template) applied');
        }
        
        function testRawHtmlSyntax() {
            log('=== Testing Raw HTML {{{syntax}}} ===');
            
            if (listbox1) listbox1.destroy();
            
            const template = `
                <div style="padding: 10px; border-bottom: 1px solid #eee;">
                    <h4>{{name}} - Status: {{{html}}}</h4>
                    <p>Email: {{email}}</p>
                    <small>Raw HTML field will render as HTML, name/email will be escaped</small>
                </div>
            `;
            
            listbox1 = new JwListBox('#container1');
            listbox1.on('error', (error) => {
                log('Error: ' + JSON.stringify(error));
            });
            
            listbox1.setTemplate(template).setSource(testData);
            log('Raw HTML syntax test - triple braces should render as HTML, double braces should be escaped');
        }
        
        function testMixedSyntax() {
            log('=== Testing Mixed {{escaped}} and {{{raw}}} Syntax ===');
            
            if (listbox1) listbox1.destroy();
            
            const template = `
                <div style="padding: 10px; border: 1px solid #ccc; margin: 5px 0;">
                    <h4>User: {{name}} (ID: {{id}})</h4>
                    <p>Email: {{email}}</p>
                    <p>HTML Status: {{{html}}}</p>
                    <p>XSS Test (escaped): {{xss}}</p>
                    <p>XSS Test (raw - dangerous!): {{{xss}}}</p>
                    <small>Notice how double braces are safe (escaped) while triple braces could be dangerous</small>
                </div>
            `;
            
            listbox1 = new JwListBox('#container1');
            listbox1.on('error', (error) => {
                log('Error: ' + JSON.stringify(error));
            });
            
            listbox1.setTemplate(template).setSource(testData);
            log('Mixed syntax test - compare double braces (safe) vs triple braces (potentially dangerous)');
        }
        
        function testErrorHandling() {
            log('=== Testing Error Handling ===');
            
            if (listbox1) listbox1.destroy();
            if (listbox2) listbox2.destroy();
            
            // Test 1: Invalid selector
            log('Test 1: Invalid template selector');
            listbox1 = new JwListBox('#container1');
            listbox1.on('error', (error) => {
                log('Expected Error 1: ' + JSON.stringify(error));
            });
            
            listbox1.setTemplate('#nonexistent-template').setSource(testData);
            
            // Test 2: Invalid template type
            setTimeout(() => {
                log('Test 2: Invalid template type');
                listbox2 = new JwListBox('#container2');
                listbox2.on('error', (error) => {
                    log('Expected Error 2: ' + JSON.stringify(error));
                });
                
                listbox2.setTemplate(123).setSource(testData); // Invalid type
            }, 1000);
        }
        
        // Auto-initialize with default rendering
        setTimeout(() => {
            log('Auto-initializing with default rendering...');
            testDefaultRendering();
        }, 500);
