const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const apiPath = event.path.replace('/.netlify/functions/api', '');

  try {
    // Get list of schemas
    if (apiPath === '/schemas') {
      const schemasDir = path.join(__dirname, '..', '..', 'schemas');
      const files = fs.readdirSync(schemasDir);
      const schemaFiles = files.filter(f => f.endsWith('.json'));
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(schemaFiles)
      };
    }

    // Get specific schema
    if (apiPath.startsWith('/schema/')) {
      const schemaName = apiPath.replace('/schema/', '');
      const schemaPath = path.join(__dirname, '..', '..', 'schemas', schemaName);
      const data = fs.readFileSync(schemaPath, 'utf8');
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: data
      };
    }

    // Get list of FASTA files
    if (apiPath === '/fastas') {
      const fastasDir = path.join(__dirname, '..', '..', 'fastas');
      const files = fs.readdirSync(fastasDir);
      const fastaFiles = files.filter(f => f.endsWith('.fasta') || f.endsWith('.fa'));
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(fastaFiles)
      };
    }

    // Get specific FASTA file
    if (apiPath.startsWith('/fasta/')) {
      const fastaName = apiPath.replace('/fasta/', '');
      const fastaPath = path.join(__dirname, '..', '..', 'fastas', fastaName);
      const data = fs.readFileSync(fastaPath, 'utf8');
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'text/plain' },
        body: data
      };
    }

    return {
      statusCode: 404,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Not found' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
