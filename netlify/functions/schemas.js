const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    // Look for schemas in the bundled data directory
    const schemasDir = path.join(__dirname, 'data/schemas');
    
    if (!fs.existsSync(schemasDir)) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'Schemas directory not found',
          path: schemasDir,
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
