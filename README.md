
# Dummy TSV Generator

Generate dummy TSV data with randomized FASTA files based on JSON schema.

## Features

- Generate TSV data from JSON schemas
- Randomize FASTA file names and headers
- Add field constraints to limit values
- Optionally inject validation errors for testing
- Use unique-names-generator for readable random names

## Local Development

```bash
npm install
npm start
```

Then open http://localhost:3000

## Netlify Deployment

This project is configured to deploy on Netlify:

1. Connect your GitHub repository to Netlify
2. Use these build settings:
   - **Build command:** (leave empty or `echo 'No build needed'`)
   - **Publish directory:** `.`
   - **Functions directory:** `.netlify/functions`

The configuration is in `netlify.toml`.

## Usage

1. Select a JSON schema from the dropdown
2. Enter a submission name (e.g., "MPOX", "COVID")
3. Set the number of rows to generate
4. Optionally add field constraints
5. Optionally enable validation error injection
6. Click "Generate & Download"

## File Structure

- `index.html` - Main application interface
- `app.js` - JavaScript logic
- `server.js` - Local development server
- `.netlify/functions/api.js` - Netlify serverless function
- `schemas/` - JSON schema files
- `fastas/` - FASTA files for randomization

## Legacy Python Tool

The original Python tool is still available:

```bash
python generate_dummy_tsv.py mpox.json 50 mpox.zip --spread 10 --tsv-name mpox.tsv
```
