#!/usr/bin/env python3
"""
Script to generate dummy TSV data based on a JSON schema and create a zip archive
containing the TSV and relevant FASTA files with random names and headers.
"""

import json
import csv
import random
import string
from datetime import datetime, timedelta
import argparse
import ast
import zipfile
import os
import tempfile
import glob
import shutil


def generate_random_string(length=20):
    """Generate a random string."""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


def generate_random_filename(extension='.fasta'):
    """Generate a random filename."""
    return generate_random_string(12) + extension


def create_randomized_fasta_files(source_dir='fastas'):
    """
    Create randomized copies of FASTA files in a temporary directory.
    Returns: (temp_dir, file_mapping_list)
    """
    # Find all FASTA files in source directory
    fasta_pattern = os.path.join(source_dir, '*.fasta')
    fa_pattern = os.path.join(source_dir, '*.fa')
    fasta_files = glob.glob(fasta_pattern) + glob.glob(fa_pattern)
    fasta_files.sort()
    
    if not fasta_files:
        print(f"No FASTA files found in {source_dir} directory.")
        return None, []
    
    print(f"Found {len(fasta_files)} FASTA file(s) in {source_dir}")
    
    # Create temporary working directory
    temp_dir = tempfile.mkdtemp(prefix='fasta_work_')
    print(f"Created temporary working directory: {temp_dir}")
    
    file_mapping = []  # Keep track of old name -> new name mapping
    
    # Process each FASTA file
    for original_file in fasta_files:
        original_filename = os.path.basename(original_file)
        new_filename = generate_random_filename()
        new_filepath = os.path.join(temp_dir, new_filename)
        
        print(f"Processing: {original_filename} -> {new_filename}")
        file_mapping.append((original_filename, new_filename))
        
        try:
            # Read original file and modify headers
            with open(original_file, 'r') as f:
                lines = f.readlines()
            
            # Process lines and replace headers with random strings
            modified_lines = []
            for line in lines:
                if line.startswith('>'):
                    # Replace header with random string
                    new_header = f">{generate_random_string()}\n"
                    modified_lines.append(new_header)
                else:
                    modified_lines.append(line)
            
            # Write to new file in temp directory
            with open(new_filepath, 'w') as f:
                f.writelines(modified_lines)
            
        except Exception as e:
            print(f"Error processing {original_filename}: {e}")
    
    return temp_dir, file_mapping


def extract_headers_from_temp_dir(temp_dir, file_mapping):
    """Extract headers from files in temporary directory."""
    fasta_list = []
    
    for original_name, new_name in file_mapping:
        temp_file_path = os.path.join(temp_dir, new_name)
        
        try:
            with open(temp_file_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith('>'):
                        # Remove the '>' character and get the header
                        header = line[1:]
                        # Add to list using the new filename
                        fasta_list.append((new_name, header))
        except Exception as e:
            print(f"Error extracting from {new_name}: {e}")
    
    return fasta_list


def load_fasta_list(fasta_file):
    """Load list of (fasta_file, header) tuples from file."""
    fasta_list = []
    with open(fasta_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line:
                # Parse the tuple string
                try:
                    fasta_tuple = ast.literal_eval(line)
                    if isinstance(fasta_tuple, tuple) and len(fasta_tuple) == 2:
                        fasta_list.append(fasta_tuple)
                except:
                    continue
    return fasta_list


def generate_random_number(min_val=1, max_val=100):
    """Generate a random number."""
    return random.randint(min_val, max_val)


def generate_random_date():
    """Generate a random date within the last year."""
    days_back = random.randint(0, 365)
    date = datetime.now() - timedelta(days=days_back)
    return date.strftime('%Y-%m-%d')


def generate_dummy_value(prop_details):
    """Generate dummy value based on property details."""
    prop_type = prop_details.get('type', 'string')
    
    if 'enum' in prop_details:
        # Use random value from enum
        return random.choice(prop_details['enum'])
    
    if prop_type == 'array':
        # Handle array types
        items = prop_details.get('items', {})
        if 'enum' in items:
            # For array with enum items, pick 1-3 random values
            num_items = random.randint(1, min(3, len(items['enum'])))
            return random.sample(items['enum'], num_items)
        else:
            # Generate 1-3 random strings
            return [generate_random_string() for _ in range(random.randint(1, 3))]
    
    if prop_type == 'string':
        if 'format' in prop_details and prop_details['format'] == 'date':
            return generate_random_date()
        else:
            return generate_random_string()
    elif prop_type == 'number' or prop_type == 'integer':
        # Check for maximum constraint
        max_val = prop_details.get('maximum', 100)
        min_val = prop_details.get('minimum', 1)
        if prop_type == 'number':
            return round(random.uniform(min_val, max_val), 2)
        else:
            return random.randint(min_val, max_val)
    else:
        return generate_random_string()  # Default fallback


def generate_dummy_data(schema, num_rows, fasta_list, spread_evenly=False):
    """Generate dummy data rows."""
    properties = schema.get('properties', {})
    required = schema.get('required', [])
    
    data = []
    fasta_index = 0
    
    # If we want even spread, reorganize the fasta_list
    if spread_evenly and fasta_list:
        # Group by filename
        file_groups = {}
        for entry in fasta_list:
            filename = entry[0]
            if filename not in file_groups:
                file_groups[filename] = []
            file_groups[filename].append(entry)
        
        # Create interleaved list to ensure even distribution
        interleaved_list = []
        max_entries = max(len(group) for group in file_groups.values())
        
        for i in range(max_entries):
            for filename in sorted(file_groups.keys()):
                if i < len(file_groups[filename]):
                    interleaved_list.append(file_groups[filename][i])
        
        fasta_list = interleaved_list
    
    for row_num in range(num_rows):
        row = {}
        
        for prop_name, prop_details in properties.items():
            if prop_name == 'fasta_file_name':
                if fasta_list:
                    row[prop_name] = fasta_list[fasta_index % len(fasta_list)][0]
                else:
                    row[prop_name] = generate_random_string()
            elif prop_name == 'fasta_header_name':
                if fasta_list:
                    row[prop_name] = fasta_list[fasta_index % len(fasta_list)][1]
                    fasta_index += 1  # Move to next for next row
                else:
                    row[prop_name] = generate_random_string()
            else:
                row[prop_name] = generate_dummy_value(prop_details)
        
        # Ensure required fields are filled (they should be, but just in case)
        for req in required:
            if req not in row or not row[req]:
                row[req] = generate_dummy_value(properties.get(req, {}))
        
        data.append(row)
    
    return data


def main():
    parser = argparse.ArgumentParser(description='Generate dummy TSV data with randomized FASTA files')
    parser.add_argument('schema_file', help='Path to JSON schema file')
    parser.add_argument('num_rows', type=int, help='Number of rows to generate')
    parser.add_argument('output_zip', help='Output zip file path')
    parser.add_argument('--spread', type=int, default=None, 
                        help='Number of different FASTA files to spread data across (default: use all available)')
    parser.add_argument('--source-dir', default='fastas', 
                        help='Source directory containing original FASTA files (default: fastas)')
    parser.add_argument('--tsv-name', default='generated_data.tsv', 
                        help='Name for the TSV file in the zip archive (default: generated_data.tsv)')
    
    args = parser.parse_args()
    
    # Load schema
    with open('schemas/' + args.schema_file, 'r') as f:
        schema = json.load(f)
    
    # Create randomized FASTA files in temporary directory
    temp_dir, file_mapping = create_randomized_fasta_files(args.source_dir)
    if not temp_dir:
        return
    
    try:
        # Extract headers from the temporary files
        print(f"Extracting headers from randomized files...")
        full_fasta_list = extract_headers_from_temp_dir(temp_dir, file_mapping)
        print(f"Extracted {len(full_fasta_list)} FASTA entries")
        
        if not full_fasta_list:
            print("No FASTA entries found")
            return
        
        # Get unique FASTA files
        all_unique_files = sorted(list(set(entry[0] for entry in full_fasta_list)))
        print(f"Found {len(all_unique_files)} unique FASTA files")
        
        # Determine how many files to use
        max_spread = len(all_unique_files)
        spread = args.spread if args.spread is not None else max_spread
        spread = min(spread, max_spread)
        
        # Select the files to use
        selected_files = all_unique_files[:spread]
        print(f"Spreading data across {len(selected_files)} FASTA files")
        
        # Filter FASTA list to only include selected files
        fasta_list = [entry for entry in full_fasta_list if entry[0] in selected_files]
        print(f"Using {len(fasta_list)} FASTA entries from {len(selected_files)} files")
        
        # Generate data
        data = generate_dummy_data(schema, args.num_rows, fasta_list, spread_evenly=True)
        
        if not data:
            print("No data generated")
            return
        
        # Create temporary TSV file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.tsv', delete=False) as temp_tsv:
            temp_tsv_path = temp_tsv.name
            fieldnames = list(data[0].keys())
            
            # Process data to convert arrays to comma-separated strings
            processed_data = []
            for row in data:
                processed_row = {}
                for key, value in row.items():
                    if isinstance(value, list):
                        # Convert list to comma-separated string
                        processed_row[key] = ', '.join(str(v) for v in value)
                    else:
                        processed_row[key] = value
                processed_data.append(processed_row)
            
            writer = csv.DictWriter(temp_tsv, fieldnames=fieldnames, delimiter='\t')
            writer.writeheader()
            writer.writerows(processed_data)
        
        # Create zip archive
        with zipfile.ZipFile(args.output_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
            # Add the generated TSV
            zf.write(temp_tsv_path, arcname=args.tsv_name)
            
            # Add selected FASTA files from temp directory
            for fasta_file in selected_files:
                temp_fasta_path = os.path.join(temp_dir, fasta_file)
                if os.path.exists(temp_fasta_path):
                    zf.write(temp_fasta_path, arcname=fasta_file)
                else:
                    print(f"Warning: FASTA file {fasta_file} not found in temp directory")
        
        # Clean up temporary TSV file
        os.unlink(temp_tsv_path)
        
        print(f"Generated {args.num_rows} rows in 1 TSV file, spread across {len(selected_files)} FASTA files")
        print(f"Created zip archive: {args.output_zip}")
        print(f"Archive contains: 1 TSV file and {len(selected_files)} randomized FASTA files")
    
    finally:
        # Clean up temporary directory
        print(f"Cleaning up temporary directory: {temp_dir}")
        shutil.rmtree(temp_dir)
        print("Cleanup completed!")


if __name__ == "__main__":
    main()