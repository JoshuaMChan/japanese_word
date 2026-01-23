#!/usr/bin/env python3
"""
Sort verbs.json by kanaStart + kanaEnd
"""
import json
import sys

def sort_verbs(input_file, output_file=None):
    """
    Sort verbs by kanaStart + kanaEnd
    
    Args:
        input_file: Path to input JSON file
        output_file: Path to output JSON file (default: overwrite input file)
    """
    # Read the JSON file
    with open(input_file, 'r', encoding='utf-8') as f:
        verbs = json.load(f)
    
    # Sort by kanaStart + kanaEnd
    sorted_verbs = sorted(verbs, key=lambda v: v.get('kanaStart', '') + v.get('kanaEnd', ''))
    
    # Determine output file
    if output_file is None:
        output_file = input_file
    
    # Write the sorted JSON back
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(sorted_verbs, f, ensure_ascii=False, indent=2)
    
    print(f"Sorted {len(sorted_verbs)} verbs and saved to {output_file}")

if __name__ == '__main__':
    input_file = '../src/assets/verbs.json'
    
    # Allow command line argument for input file
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    
    # Allow second argument for output file
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    sort_verbs(input_file, output_file)

