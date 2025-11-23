const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    // Try multiple possible paths
    let fastasDir;
    const possiblePaths = [
      path.join(__dirname, '../../fastas'),
      path.join(process.cwd(), 'fastas'),
      '/opt/build/repo/fastas'
    ];
    
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        fastasDir = testPath;
        break;
      }
    }
    
    if (!fastasDir) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'Fastas directory not found',
          tried: possiblePaths
        }),
      };
    }
    
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
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Failed to read fastas directory', details: error.message }),
    };
  }
};
