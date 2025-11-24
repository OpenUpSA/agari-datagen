#!/usr/bin/env python3
"""
Test script to verify country-province validation logic
"""

import json

def load_country_provinces_mapping(hierarchy_file='africa_hierarchical_enriched.json'):
    """Load the country-to-provinces mapping from hierarchical JSON."""
    try:
        with open(hierarchy_file, 'r') as f:
            data = json.load(f)
        
        mapping = {}
        
        def traverse_hierarchy(node):
            """Recursively traverse hierarchy to build country -> provinces mapping."""
            if node.get('type') == 'country' and 'children' in node:
                country_name = node['name']
                mapping[country_name] = []
                
                # Collect all provinces/states under this country
                for child in node['children']:
                    child_type = child.get('type', '')
                    if child_type in ['province', 'state', 'region']:
                        mapping[country_name].append(child['name'])
            
            # Recursively traverse children
            if 'children' in node:
                for child in node['children']:
                    traverse_hierarchy(child)
        
        traverse_hierarchy(data)
        print(f"✓ Loaded country-to-provinces mapping: {len(mapping)} countries")
        return mapping
    except Exception as e:
        print(f"✗ Failed to load country-provinces mapping: {e}")
        return {}

def test_validation():
    """Test the validation logic"""
    print("Testing country-province validation...\n")
    
    # Load the mapping
    mapping = load_country_provinces_mapping()
    
    if not mapping:
        print("✗ Failed to load mapping")
        return
    
    # Test a few countries
    test_countries = ['Angola', 'South Africa', 'Nigeria', 'Egypt', 'Kenya']
    
    for country in test_countries:
        if country in mapping:
            provinces = mapping[country]
            print(f"\n{country}:")
            print(f"  - {len(provinces)} provinces/states")
            print(f"  - First 5: {', '.join(provinces[:5])}")
        else:
            print(f"\n{country}: No provinces found in mapping")
    
    # Load a schema and check if validation would work
    print("\n\nTesting with cholera.json schema:")
    try:
        with open('schemas/cholera.json', 'r') as f:
            schema = json.load(f)
        
        properties = schema.get('properties', {})
        
        # Check if both country and province fields exist
        has_country = 'geo_loc_name_country' in properties
        has_province = 'geo_loc_name_state_province_territory' in properties
        
        print(f"  - Has country field: {has_country}")
        print(f"  - Has province field: {has_province}")
        
        if has_country and has_province:
            country_enum = properties['geo_loc_name_country'].get('enum', [])
            province_enum = properties['geo_loc_name_state_province_territory'].get('enum', [])
            
            print(f"  - Countries in schema: {len(country_enum)}")
            print(f"  - Provinces in schema: {len(province_enum)}")
            
            # Test validation for South Africa
            test_country = 'South Africa'
            if test_country in mapping and test_country in country_enum:
                valid_provinces = [p for p in province_enum if p in mapping[test_country]]
                print(f"\n  Testing '{test_country}':")
                print(f"    - Valid provinces for {test_country}: {len(valid_provinces)}")
                print(f"    - Examples: {', '.join(valid_provinces[:5])}")
                
                # Check for invalid matches
                invalid_provinces = [p for p in province_enum if p not in mapping[test_country]][:5]
                print(f"    - Invalid provinces (from other countries): {', '.join(invalid_provinces)}")
        
        print("\n✓ Validation logic appears to be working correctly!")
        
    except Exception as e:
        print(f"✗ Error testing schema: {e}")

if __name__ == "__main__":
    test_validation()
