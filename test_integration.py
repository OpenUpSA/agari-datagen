#!/usr/bin/env python3
"""
Integration test: Generate sample data and verify country-province relationships
"""

import json
import sys

# Add the current directory to the path to import from generate_dummy_tsv
sys.path.insert(0, '.')

from generate_dummy_tsv import load_country_provinces_mapping, generate_dummy_value, generate_dummy_data

def test_generate_data():
    """Test generating data with country-province validation"""
    print("Integration Test: Generating sample data with validation\n")
    
    # Load the mapping
    mapping = load_country_provinces_mapping()
    
    if not mapping:
        print("✗ Failed to load mapping")
        return False
    
    # Load schema
    try:
        with open('schemas/cholera.json', 'r') as f:
            schema = json.load(f)
    except Exception as e:
        print(f"✗ Failed to load schema: {e}")
        return False
    
    # Generate 10 rows of data
    print("Generating 10 test rows...\n")
    data = generate_dummy_data(schema, 10, [], spread_evenly=False, country_provinces_map=mapping)
    
    if not data:
        print("✗ No data generated")
        return False
    
    print(f"✓ Generated {len(data)} rows\n")
    
    # Verify country-province relationships
    print("Verifying country-province relationships:\n")
    valid_count = 0
    invalid_count = 0
    
    for i, row in enumerate(data, 1):
        country = row.get('geo_loc_name_country')
        province = row.get('geo_loc_name_state_province_territory')
        
        if country and province:
            # Check if the province is valid for the country
            if country in mapping:
                valid_provinces = mapping[country]
                if province in valid_provinces:
                    print(f"  Row {i}: ✓ {country} → {province}")
                    valid_count += 1
                else:
                    print(f"  Row {i}: ✗ {country} → {province} (INVALID - not in {country})")
                    invalid_count += 1
            else:
                print(f"  Row {i}: ? {country} → {province} (country not in mapping)")
        elif country:
            print(f"  Row {i}: {country} → (no province)")
        elif province:
            print(f"  Row {i}: (no country) → {province}")
        else:
            print(f"  Row {i}: (no country or province)")
    
    print(f"\nResults:")
    print(f"  Valid: {valid_count}")
    print(f"  Invalid: {invalid_count}")
    
    if invalid_count > 0:
        print("\n✗ FAILED: Found invalid country-province combinations!")
        return False
    else:
        print("\n✓ SUCCESS: All country-province combinations are valid!")
        return True

if __name__ == "__main__":
    success = test_generate_data()
    sys.exit(0 if success else 1)
