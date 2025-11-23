// Generate random DNA sequence
function generateDNASequence(length) {
  const bases = ['A', 'T', 'G', 'C'];
  let sequence = '';
  for (let i = 0; i < length; i++) {
    sequence += bases[Math.floor(Math.random() * bases.length)];
  }
  return sequence;
}

// Generate FASTA content with multiple sequences
function generateFastaContent(numSequences = 5) {
  let content = '';
  const sequenceLength = 500; // Base pairs per sequence
  
  for (let i = 0; i < numSequences; i++) {
    content += `>Sequence_${i + 1}\n`;
    const sequence = generateDNASequence(sequenceLength);
    // Break into 80 character lines (FASTA format)
    for (let j = 0; j < sequence.length; j += 80) {
      content += sequence.substring(j, j + 80) + '\n';
    }
  }
  
  return content;
}

exports.handler = async (event, context) => {
  try {
    const fastaName = event.path.split('/').pop();
    
    // Generate FASTA content on the fly
    // Use the filename as seed for consistent results per file
    const numSequences = 5 + (fastaName.charCodeAt(0) % 5); // 5-10 sequences
    const content = generateFastaContent(numSequences);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
      },
      body: content,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Failed to generate FASTA file', details: error.message }),
    };
  }
};
