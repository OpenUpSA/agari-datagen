# Dummy TSV Generator - Web Version

A web-based tool to generate dummy TSV data with randomized FASTA files based on JSON schemas.

## Quick Start

1. Start the server:
   ```bash
   node server.js
   ```

2. Open your browser to: http://localhost:3000

3. Select a schema from the dropdown, configure options, and click "Generate & Download"

## Features

- **Automatic schema loading**: Schemas are loaded from the `schemas/` folder
- **Automatic FASTA loading**: All FASTA files from the `fastas/` folder are used
- **Dropdown selection**: No need to manually upload files
- **Random generation**: FASTA filenames and headers are randomized
- **ZIP download**: Get a complete ZIP with TSV and randomized FASTA files

## Requirements

- Node.js (no npm packages needed - uses built-in modules only)

## How It Works

1. The server loads all `.json` files from `schemas/` folder
2. The server loads all `.fasta` and `.fa` files from `fastas/` folder
3. You select a schema from the dropdown
4. The generator processes all FASTA files, randomizing names and headers
5. Dummy data is generated based on the schema
6. A ZIP file is created with the TSV and selected randomized FASTA files
7. The ZIP is automatically downloaded to your browser
