#!/usr/bin/env python3
"""
Upload all files in a folder to the folio API endpoint.

Usage:
    python upload_files.py --token <bearer_token> --folder <path_to_folder> \
        --folio <folio_url> --project-id <project_id> --submission-id <submission_id>
"""

import argparse
import os
import sys
from pathlib import Path
import requests


def upload_file(file_path, folio_url, project_id, submission_id, token):
    """Upload a single file to the API endpoint."""
    url = f"{folio_url}/projects/{project_id}/submissions/{submission_id}/upload2"
    
    filename = os.path.basename(file_path)
    
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    try:
        with open(file_path, 'rb') as f:
            files = {
                'file': (filename, f, 'text/plain')
            }
            
            response = requests.post(url, headers=headers, files=files)
            
            if response.status_code in [200, 201]:
                print(f"✓ Successfully uploaded: {filename}")
                return True
            else:
                print(f"✗ Failed to upload {filename}: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        print(f"✗ Error uploading {filename}: {str(e)}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description='Upload all files in a folder to the folio API endpoint'
    )
    parser.add_argument('--token', required=True, help='Bearer token for authentication')
    parser.add_argument('--folder', required=True, help='Path to folder containing files to upload')
    parser.add_argument('--folio', required=True, help='Folio API base URL (e.g., http://localhost:8080)')
    parser.add_argument('--project-id', required=True, help='Project ID')
    parser.add_argument('--submission-id', required=True, help='Submission ID')
    parser.add_argument('--pattern', default='*', help='File pattern to match (default: *)')
    
    args = parser.parse_args()
    
    folder_path = Path(args.folder)
    
    if not folder_path.exists():
        print(f"Error: Folder '{args.folder}' does not exist")
        sys.exit(1)
    
    if not folder_path.is_dir():
        print(f"Error: '{args.folder}' is not a directory")
        sys.exit(1)
    
    # Get all files matching the pattern
    files = list(folder_path.glob(args.pattern))
    files = [f for f in files if f.is_file()]
    
    if not files:
        print(f"No files found in '{args.folder}' matching pattern '{args.pattern}'")
        sys.exit(0)
    
    print(f"Found {len(files)} file(s) to upload")
    print(f"Uploading to: {args.folio}/projects/{args.project_id}/submissions/{args.submission_id}/upload2")
    print("-" * 60)
    
    success_count = 0
    fail_count = 0
    
    for file_path in sorted(files):
        if upload_file(file_path, args.folio, args.project_id, args.submission_id, args.token):
            success_count += 1
        else:
            fail_count += 1
    
    print("-" * 60)
    print(f"Upload complete: {success_count} succeeded, {fail_count} failed")
    
    if fail_count > 0:
        sys.exit(1)


if __name__ == '__main__':
    main()
