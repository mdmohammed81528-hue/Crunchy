import os
import zipfile
import shutil

dist_dir = 'dist'
public_dir = 'public'

# 1. Create Netlify Deploy ZIP (all files inside dist/)
deploy_zip_path = 'crunchy-bite-netlify-deploy.zip'
print("Creating Netlify Deploy ZIP from dist/...")
with zipfile.ZipFile(deploy_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(dist_dir):
        for file in files:
            if file.endswith('.zip'):
                continue
            full_path = os.path.join(root, file)
            arcname = os.path.relpath(full_path, dist_dir)
            zipf.write(full_path, arcname)
print(f"Created {deploy_zip_path} ({os.path.getsize(deploy_zip_path)} bytes)")

# 2. Create Full Source ZIP (for GitHub / Netlify Git build)
source_zip_path = 'crunchy-bite-source.zip'
ignore_dirs = {'node_modules', '.git', 'dist', '__pycache__'}
print("Creating Source ZIP...")
with zipfile.ZipFile(source_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        for file in files:
            if file.endswith('.zip') or file.endswith('.tmp') or file == 'create_zips.py':
                continue
            full_path = os.path.join(root, file)
            arcname = os.path.relpath(full_path, '.')
            zipf.write(full_path, arcname)
print(f"Created {source_zip_path} ({os.path.getsize(source_zip_path)} bytes)")

# Also copy both zip files into dist/ and public/ so they are immediately downloadable via browser URL
os.makedirs(public_dir, exist_ok=True)
os.makedirs(dist_dir, exist_ok=True)

shutil.copy2(deploy_zip_path, os.path.join(public_dir, deploy_zip_path))
shutil.copy2(deploy_zip_path, os.path.join(dist_dir, deploy_zip_path))

shutil.copy2(source_zip_path, os.path.join(public_dir, source_zip_path))
shutil.copy2(source_zip_path, os.path.join(dist_dir, source_zip_path))

print("Zips copied to public/ and dist/ successfully!")
