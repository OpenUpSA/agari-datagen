const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    const fastasDir = path.join(__dirname, '../../fastas');
    const files = fs.readdirSync(fastasDir);
    const fastaFiles = files.filter(f => f.endsWith('.fasta') || f.endsWith('.fa'));
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(fastaFiles),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to read fastas directory', details: error.message }),
    };
  }
};
