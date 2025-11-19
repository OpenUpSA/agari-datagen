
# Data Generation Tool

## Usage

Generate dummy TSV data with associated FASTA files:

```bash
python generate_dummy_tsv.py mpox.json 50 mpox.zip --spread 10 --tsv-name mpox.tsv
```

### Parameters

- `schemas/mpox.json` - Schema file defining the data structure
- `50` - Number of records to generate
- `mpox.zip` - Output zip file containing generated data
- `--spread 10` - Number of FASTA files to create (spread across records)
- `--tsv-name mpox.tsv` - Name of the TSV file inside the zip
