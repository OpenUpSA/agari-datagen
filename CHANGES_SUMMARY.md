# Changes Summary: Country-Province Validation

## Overview
Modified the dummy data generation code to ensure that `geo_loc_name_state_province_territory` values are always children (provinces/states) of the selected `geo_loc_name_country`.

## Problem
Previously, when generating dummy data, the code would randomly select any province from the entire list of African provinces, regardless of which country was selected. This could result in invalid combinations like "Country: South Africa" with "Province: Lagos" (which is in Nigeria).

## Solution
Implemented a hierarchical validation system that:
1. Loads the country-to-provinces mapping from `africa_hierarchical_enriched.json`
2. Tracks which country is selected for each row
3. Filters the province enum list to only include provinces that belong to the selected country
4. Applies this validation to all location fields: `geo_loc_name_state_province_territory`, `host_residence_geo_loc_name_state_province_territory`, and `location_of_exposure_geo_loc_name_state_province_territory`

## Files Modified

### 1. `app.js` (JavaScript/Web Interface)

**Changes:**
- Added global variable `countryToProvincesMap` to store the mapping
- Added `loadCountryProvincesMapping()` function to load and parse the hierarchical JSON
- Modified `generateDummyValue()` to accept a `rowContext` parameter and filter provinces based on the selected country
- Modified `generateDummyData()` to:
  - Track the selected country in `rowContext`
  - Generate country fields first
  - Generate province/state fields in a second pass with country context
- Added `initializeApp()` function to load mappings on page load

**Key Logic:**
```javascript
// In generateDummyValue:
if (rowContext.country && countryToProvincesMap && countryToProvincesMap[rowContext.country]) {
    const countryProvinces = countryToProvincesMap[rowContext.country];
    const validProvinces = propDetails.enum.filter(province => countryProvinces.includes(province));
    if (validProvinces.length > 0) {
        return validProvinces[Math.floor(Math.random() * validProvinces.length)];
    }
}
```

### 2. `generate_dummy_tsv.py` (Python Script)

**Changes:**
- Added `load_country_provinces_mapping()` function to load the hierarchical JSON
- Modified `generate_dummy_value()` to accept a `row_context` parameter and filter provinces based on country
- Modified `generate_dummy_data()` to:
  - Accept `country_provinces_map` parameter
  - Track country in `row_context`
  - Generate fields in two passes (country first, then provinces)
- Updated `main()` to load the mapping and pass it to `generate_dummy_data()`

**Key Logic:**
```python
# In generate_dummy_value:
if row_context.get('country') and row_context.get('country_provinces_map'):
    country = row_context['country']
    country_provinces_map = row_context['country_provinces_map']
    if country in country_provinces_map:
        country_provinces = country_provinces_map[country]
        valid_provinces = [p for p in prop_details['enum'] if p in country_provinces]
        if valid_provinces:
            return random.choice(valid_provinces)
```

## Implementation Details

### Two-Pass Generation Strategy
To ensure provinces match countries, the data generation now uses a two-pass approach:

1. **First Pass**: Generate all non-province fields, including the country field
2. **Second Pass**: Generate province/state fields using the country value from the first pass as context

This ensures the country is always available when selecting a province.

### Supported Field Combinations
The validation applies to these field pairs:
- `geo_loc_name_country` → `geo_loc_name_state_province_territory`
- `host_residence_geo_loc_name_country` → `host_residence_geo_loc_name_state_province_territory`
- `location_of_exposure_geo_loc_name_country` → `location_of_exposure_geo_loc_name_state_province_territory`

### Fallback Behavior
If the mapping fails to load or a country has no provinces in the mapping, the code falls back to selecting from the full province enum list (original behavior).

## Testing Recommendations

1. **Generate data with various schemas** (cholera, mpox, sars-cov2, etc.)
2. **Verify country-province combinations** in the generated TSV files
3. **Check edge cases**:
   - Countries with no provinces in the mapping
   - Schemas with only country fields (no province fields)
   - Schemas with province fields but no country fields

## Dependencies
- Requires `africa_hierarchical_enriched.json` to be present in the root directory
- The JSON file must be accessible via HTTP when using the web interface (served by the web server)
- Python script expects the file in the current working directory

## Backward Compatibility
The changes are backward compatible:
- If the hierarchical JSON file is not found, the code falls back to the original behavior
- Existing schemas without country-province relationships continue to work as before
- The changes only affect the filtering of enum values when both country and province fields are present
