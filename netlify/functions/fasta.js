const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    const fastaName = event.path.split('/').pop();
    const fastaPath = path.join(__dirname, 'data/fastas', fastaName);
    
    if (!fs.existsSync(fastaPath)) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'FASTA file not found',
          name: fastaName,
          path: fastaPath
        }),
      };
    }
    
    const data = fs.readFileSync(fastaPath, 'utf8');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
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
      body: JSON.stringify({ error: 'Failed to read FASTA file', details: error.message }),
    };
  }
};
