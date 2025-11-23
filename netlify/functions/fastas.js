exports.handler = async (event, context) => {
  // Return a fixed list of virtual FASTA files
  // We'll generate the content on-demand
  const fastaFiles = [];
  for (let i = 1; i <= 100; i++) {
    fastaFiles.push(`FASTA_${String(i).padStart(3, '0')}.fasta`);
  }
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(fastaFiles),
  };
};
