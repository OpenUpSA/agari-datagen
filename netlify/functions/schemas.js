const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    const schemasDir = path.join(__dirname, '../../schemas');
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
      body: JSON.stringify({ error: 'Failed to read schemas directory', details: error.message }),
    };
  }
};
