
# Dummy TSV Generator

Generate dummy TSV data with randomized FASTA files based on JSON schema.

## Features

- Generate TSV data from JSON schemas
- Randomize FASTA file names and headers
- Add field constraints to limit values
- Optionally inject validation errors for testing
- Use unique-names-generator for readable random names
- **Hierarchical validation**: Ensures provinces/states are children of their respective countries

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
- `africa_hierarchical_enriched.json` - Hierarchical geographic data for country-province validation

## Hierarchical Geographic Validation

The generator automatically validates that `geo_loc_name_state_province_territory` values are children of the selected `geo_loc_name_country`. This uses the `africa_hierarchical_enriched.json` file to build a country-to-provinces mapping at runtime.

When a country is selected, the generator will:
1. Filter the available provinces to only those belonging to that country
2. Randomly select from the valid provinces for that country
3. Fall back to the full province list if no mapping is found

This applies to all geographic field pairs:
- `geo_loc_name_country` → `geo_loc_name_state_province_territory`
- `host_residence_geo_loc_name_country` → `host_residence_geo_loc_name_state_province_territory`
- `location_of_exposure_geo_loc_name_country` → `location_of_exposure_geo_loc_name_state_province_territory`

## Legacy Python Tool

The original Python tool is still available:

```bash
python generate_dummy_tsv.py mpox.json 50 mpox.zip --spread 10 --tsv-name mpox.tsv
```
