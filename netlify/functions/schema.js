const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    const schemaName = event.path.split('/').pop();
    
    // Try multiple possible paths
    const possibleBasePaths = [
      path.join(__dirname, '../../schemas'),
      path.join(process.cwd(), 'schemas'),
      '/opt/build/repo/schemas'
    ];
    
    let schemaPath;
    for (const basePath of possibleBasePaths) {
      const testPath = path.join(basePath, schemaName);
      if (fs.existsSync(testPath)) {
        schemaPath = testPath;
        break;
      }
    }
    
    if (!schemaPath) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'Schema not found',
          name: schemaName,
          tried: possibleBasePaths
        }),
      };
    }
    
    const data = fs.readFileSync(schemaPath, 'utf8');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: data,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Failed to read schema', details: error.message }),
    };
  }
};
