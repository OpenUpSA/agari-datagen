const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    // Try multiple possible paths
    let schemasDir;
    const possiblePaths = [
      path.join(__dirname, '../../schemas'),
      path.join(process.cwd(), 'schemas'),
      '/opt/build/repo/schemas'
    ];
    
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        schemasDir = testPath;
        break;
      }
    }
    
    if (!schemasDir) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'Schemas directory not found',
          tried: possiblePaths,
          cwd: process.cwd(),
          dirname: __dirname
        }),
      };
    }
    
    const files = fs.readdirSync(schemasDir);
    const schemaFiles = files.filter(f => f.endsWith('.json'));
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(schemaFiles),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to read schemas directory', 
        details: error.message,
        stack: error.stack
      }),
    };
  }
};
