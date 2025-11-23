const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    const fastaName = event.path.split('/').pop();
    
    // Try multiple possible paths
    const possibleBasePaths = [
      path.join(__dirname, '../../fastas'),
      path.join(process.cwd(), 'fastas'),
      '/opt/build/repo/fastas'
    ];
    
    let fastaPath;
    for (const basePath of possibleBasePaths) {
      const testPath = path.join(basePath, fastaName);
      if (fs.existsSync(testPath)) {
        fastaPath = testPath;
        break;
      }
    }
    
    if (!fastaPath) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'FASTA file not found',
          name: fastaName,
          tried: possibleBasePaths
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
