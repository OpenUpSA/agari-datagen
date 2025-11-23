const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    const schemaName = event.path.split('/').pop();
    const schemaPath = path.join(__dirname, 'data/schemas', schemaName);
    
    if (!fs.existsSync(schemaPath)) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'Schema not found',
          name: schemaName,
          path: schemaPath
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
