const { uniqueNamesGenerator, adjectives, colors, animals } = window.uniqueNamesGenerator;

function generateUniqueName() {
    return uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: '', style: 'capital' });
}

function generateRandomNumber(min = 1, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomDate() {
    const daysBack = Math.floor(Math.random() * 365);
    const date = new Date();
    date.setDate(date.getDate() - daysBack);
    return date.toISOString().split('T')[0];
}

function generateInvalidDate() {
    const invalid = ['2023-13-01', '2023-02-30', '2023-00-15', 'not-a-date', '99/99/9999', ''];
    return invalid[Math.floor(Math.random() * invalid.length)];
}

function generateDNASequence(length) {
    const bases = ['A', 'C', 'G', 'T'];
    let sequence = '';
    for (let i = 0; i < length; i++) {
        sequence += bases[Math.floor(Math.random() * bases.length)];
    }
    return sequence;
}

function parseConstraints(constraintsText) {
    const constraints = {};
    const lines = constraintsText.split('\n').filter(line => line.trim());
    for (const line of lines) {
        const equalMatch = line.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)\s*$/);
        const lessThanMatch = line.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*<\s*(\d+)\s*$/);
        const greaterThanMatch = line.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*>\s*(\d+)\s*$/);
        if (equalMatch) {
            const [, field, value] = equalMatch;
            const trimmedValue = value.trim();
            // Check if it's a comma-separated list (for arrays)
            if (trimmedValue.includes(',')) {
                const values = trimmedValue.split(',').map(v => v.trim());
                constraints[field.trim()] = { type: 'equals', value: values };
            } else {
                constraints[field.trim()] = { type: 'equals', value: trimmedValue };
            }
        } else if (lessThanMatch) {
            const [, field, value] = lessThanMatch;
            constraints[field.trim()] = { type: 'lessThan', value: parseInt(value) };
        } else if (greaterThanMatch) {
            const [, field, value] = greaterThanMatch;
            constraints[field.trim()] = { type: 'greaterThan', value: parseInt(value) };
        }
    }
    return constraints;
}

function applyConstraint(constraint, propDetails) {
    if (constraint.type === 'equals') {
        // If constraint.value is an array, randomly select one value
        if (Array.isArray(constraint.value)) {
            return constraint.value[Math.floor(Math.random() * constraint.value.length)];
        }
        return constraint.value;
    }
    if (constraint.type === 'lessThan') {
        const max = Math.min(constraint.value - 1, propDetails.maximum || constraint.value - 1);
        const min = propDetails.minimum || 1;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    if (constraint.type === 'greaterThan') {
        const min = Math.max(constraint.value + 1, propDetails.minimum || constraint.value + 1);
        const max = propDetails.maximum || constraint.value + 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return null;
}

function generateDummyValue(propDetails, constraint = null) {
    if (constraint) {
        const constrainedValue = applyConstraint(constraint, propDetails);
        if (constrainedValue !== null) return constrainedValue;
    }
    const propType = propDetails.type || 'string';
    if (propDetails.enum) return propDetails.enum[Math.floor(Math.random() * propDetails.enum.length)];
    if (propType === 'array') {
        const items = propDetails.items || {};
        if (items.enum) {
            const numItems = Math.min(3, Math.max(1, Math.floor(Math.random() * 3) + 1));
            const shuffled = [...items.enum].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, numItems);
        }
        const count = Math.floor(Math.random() * 3) + 1;
        return Array(count).fill(null).map(() => generateUniqueName());
    }
    if (propType === 'string') {
        if (propDetails.format === 'date') return generateRandomDate();
        return generateUniqueName();
    }
    if (propType === 'number' || propType === 'integer') {
        const max = propDetails.maximum || 100;
        const min = propDetails.minimum || 1;
        if (propType === 'number') return Math.round((Math.random() * (max - min) + min) * 100) / 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return generateUniqueName();
}

function injectError(value, propDetails, errorTypes) {
    if (!errorTypes || errorTypes.length === 0) return value;
    const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    const propType = propDetails.type || 'string';
    switch (errorType) {
        case 'missing': return '';
        case 'invalidDate':
            if (propType === 'string' && propDetails.format === 'date') return generateInvalidDate();
            break;
        case 'outOfRange':
            if (propType === 'number' || propType === 'integer') {
                if (propDetails.maximum) return propDetails.maximum + Math.floor(Math.random() * 100) + 1;
                if (propDetails.minimum) return propDetails.minimum - Math.floor(Math.random() * 100) - 1;
            }
            break;
        case 'invalidEnum':
            if (propDetails.enum) return 'INVALID_' + generateUniqueName();
            break;
        case 'wrongType':
            if (propType === 'number' || propType === 'integer') return 'not_a_number';
            if (propType === 'string') return 12345;
            break;
    }
    return value;
}

async function processFastaFile(filename) {
    const response = await fetch(`/api/fasta/${filename}`);
    const text = await response.text();
    const lines = text.split('\n');
    const headers = [];
    for (const line of lines) {
        if (line.startsWith('>')) {
            const header = line.substring(1).trim();
            if (header) headers.push(header);
        }
    }
    return { filename, headers };
}

function generateDummyData(schema, numRows, submissionName, constraints, errorConfig, numFastaFiles) {
    const properties = schema.properties || {};
    const required = schema.required || [];
    const data = [];
    const submissionBase = submissionName.replace(/\s+/g, '_').toUpperCase();
    
    // Calculate which FASTA file each row should belong to
    const rowsPerFasta = Math.floor(numRows / numFastaFiles);
    const remainder = numRows % numFastaFiles;
    
    const shouldAddErrors = errorConfig.enabled;
    const errorRate = errorConfig.rate / 100;
    const errorTypes = errorConfig.types;
    
    for (let i = 0; i < numRows; i++) {
        const row = {};
        const rowNum = i + 1;
        const addErrorToThisRow = shouldAddErrors && Math.random() < errorRate;
        const isolateId = `${submissionBase}_${rowNum}_${generateUniqueName()}`;
        
        // Calculate which FASTA file index this row belongs to
        let fastaFileNum = 1;
        if (numFastaFiles > 1) {
            // Distribute rows: first (remainder) files get (rowsPerFasta + 1) rows, rest get rowsPerFasta
            let cumulativeRows = 0;
            for (let f = 1; f <= numFastaFiles; f++) {
                const thisFileRows = rowsPerFasta + (f <= remainder ? 1 : 0);
                if (i < cumulativeRows + thisFileRows) {
                    fastaFileNum = f;
                    break;
                }
                cumulativeRows += thisFileRows;
            }
        }
        
        for (const [propName, propDetails] of Object.entries(properties)) {
            let value;
            const constraint = constraints[propName];
            if (propName === 'isolate_id') {
                value = isolateId;
            } else if (propName === 'fasta_file_name') {
                value = `${submissionBase}_FILE_${fastaFileNum}.fasta`;
                row._fastaFileNumber = fastaFileNum;
            } else if (propName === 'fasta_header_name') {
                value = isolateId;
            } else {
                value = generateDummyValue(propDetails, constraint);
            }
            if (addErrorToThisRow && Math.random() < 0.3) {
                value = injectError(value, propDetails, errorTypes);
            }
            row[propName] = value;
        }
        for (const req of required) {
            if (!row[req] && !addErrorToThisRow) {
                row[req] = generateDummyValue(properties[req] || {}, constraints[req]);
            }
        }
        data.push(row);
    }
    return data;
}

function dataToTSV(data) {
    if (data.length === 0) return '';
    const internalFields = ['_originalFastaFile'];
    const headers = Object.keys(data[0]).filter(h => !internalFields.includes(h));
    let tsv = headers.join('\t') + '\n';
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            if (Array.isArray(value)) return value.join(', ');
            return value;
        });
        tsv += values.join('\t') + '\n';
    }
    return tsv;
}

const logDiv = document.getElementById('log');
function clearLog() { logDiv.innerHTML = ''; logDiv.classList.remove('hidden'); }
function log(message, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logDiv.appendChild(entry);
    logDiv.scrollTop = logDiv.scrollHeight;
}

document.getElementById('addErrors').addEventListener('change', function(e) {
    const errorOptions = document.getElementById('errorOptions');
    if (e.target.checked) errorOptions.classList.remove('hidden');
    else errorOptions.classList.add('hidden');
});

async function loadSchemas() {
    try {
        const response = await fetch('/api/schemas');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        console.log('Raw response:', text);
        const schemas = JSON.parse(text);
        console.log('Parsed schemas:', schemas);
        
        if (!Array.isArray(schemas)) {
            throw new Error('Schemas response is not an array');
        }
        
        const select = document.getElementById('schemaFile');
        select.innerHTML = '<option value="">Select a schema...</option>';
        schemas.forEach(schema => {
            const option = document.createElement('option');
            option.value = schema;
            option.textContent = schema.replace('.json', '');
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load schemas:', error);
        document.getElementById('schemaFile').innerHTML = '<option value="">Error loading schemas</option>';
    }
}

loadSchemas();

document.getElementById('generatorForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    clearLog();
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    
    try {
        const submissionName = document.getElementById('submissionName').value.trim();
        const schemaFile = document.getElementById('schemaFile').value;
        const numRows = parseInt(document.getElementById('numRows').value);
        const fileCount = parseInt(document.getElementById('fileCount').value);
        const zipName = document.getElementById('zipName').value;
        const constraintsText = document.getElementById('fieldConstraints').value;
        const addErrors = document.getElementById('addErrors').checked;
        
        const constraints = parseConstraints(constraintsText);
        if (Object.keys(constraints).length > 0) {
            log(`Applied constraints to ${Object.keys(constraints).length} field(s)`, 'info');
        }
        
        const errorConfig = { enabled: addErrors, rate: addErrors ? parseInt(document.getElementById('errorRate').value) : 0, types: [] };
        if (addErrors) {
            if (document.getElementById('errorMissing').checked) errorConfig.types.push('missing');
            if (document.getElementById('errorInvalidDate').checked) errorConfig.types.push('invalidDate');
            if (document.getElementById('errorOutOfRange').checked) errorConfig.types.push('outOfRange');
            if (document.getElementById('errorInvalidEnum').checked) errorConfig.types.push('invalidEnum');
            if (document.getElementById('errorWrongType').checked) errorConfig.types.push('wrongType');
            log(`Error injection enabled: ${errorConfig.rate}% of rows`, 'info');
        }
        
        const tsvName = `${submissionName.replace(/\s+/g, '_').toLowerCase()}.tsv`;
        
        log('Loading JSON schema...');
        const schemaResponse = await fetch(`/api/schema/${schemaFile}`);
        const schema = await schemaResponse.json();
        log('Schema loaded successfully', 'success');
        
        log(`Generating ${numRows} rows across ${fileCount} FASTA file(s)...`);
        const data = generateDummyData(schema, numRows, submissionName, constraints, errorConfig, fileCount);
        log('Data generated successfully', 'success');
        
        log('Converting to TSV format...');
        const tsvContent = dataToTSV(data);
        
        log('Creating ZIP archive...');
        const zip = new JSZip();
        zip.file(tsvName, tsvContent);
        log(`Added ${tsvName} to archive`);
        
        // Group rows by FASTA file
        log('Generating FASTA files...');
        const fastaFileGroups = {};
        for (const row of data) {
            const fileName = row.fasta_file_name;
            if (fileName) {
                if (!fastaFileGroups[fileName]) {
                    fastaFileGroups[fileName] = [];
                }
                fastaFileGroups[fileName].push(row);
            }
        }
        
        // Generate each FASTA file
        for (const [fileName, rows] of Object.entries(fastaFileGroups)) {
            const fastaLines = [];
            for (const row of rows) {
                // Add header line
                fastaLines.push(`>${row.fasta_header_name}`);
                // Generate random DNA sequence (1-5 million base pairs, mimicking real bacterial genomes)
                const sequenceLength = Math.floor(Math.random() * (5000000 - 1000000 + 1)) + 1000000;
                const sequence = generateDNASequence(sequenceLength);
                // Wrap at 70 characters per line (standard FASTA format)
                for (let i = 0; i < sequence.length; i += 70) {
                    fastaLines.push(sequence.substring(i, i + 70));
                }
            }
            zip.file(fileName, fastaLines.join('\n'));
            log(`  Added ${fileName} (${rows.length} sequences)`);
        }
        log(`Added ${Object.keys(fastaFileGroups).length} FASTA file(s) to archive`, 'success');
        
        log('Generating ZIP file...');
        const blob = await zip.generateAsync({type: 'blob'});
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = zipName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        log(`✓ Successfully created ${zipName}`, 'success');
        log(`Archive contains: 1 TSV file and ${Object.keys(fastaFileGroups).length} FASTA file(s)`, 'success');
    } catch (error) {
        log(`✗ Error: ${error.message}`, 'error');
        console.error(error);
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate & Download';
    }
});
