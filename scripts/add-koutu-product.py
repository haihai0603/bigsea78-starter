import psycopg2, uuid, oss2, os
from datetime import datetime

# Step 1: Upload exe to OSS
# Credentials from environment or ZH.xlsx
import os
oss_access_key = os.environ.get('OSS_ACCESS_KEY_ID', '')
oss_secret_key = os.environ.get('OSS_SECRET_ACCESS_KEY', '')
if not oss_access_key or not oss_secret_key:
    print('Error: Set OSS_ACCESS_KEY_ID and OSS_SECRET_ACCESS_KEY env vars')
    exit(1)

print("Uploading to OSS...")
auth = oss2.Auth(oss_access_key, oss_secret_key)
bucket = oss2.Bucket(auth, 'https://oss-cn-hongkong.aliyuncs.com', 'bigsea78')

local_file = r'D:\1-dylx\17-自研软件\1-抠图软件\dist\AI抠图工具.exe'
remote_key = 'software/AI抠图工具_v2.0.exe'
file_size = os.path.getsize(local_file)
print(f"File size: {file_size / (1024*1024):.1f}MB")

def progress(consumed, total):
    pct = consumed / total * 100
    print(f"  {consumed/(1024*1024):.0f}/{total/(1024*1024):.0f}MB ({pct:.0f}%)")

oss2.resumable_upload(bucket, remote_key, local_file, progress_callback=progress, num_threads=4)
bucket.put_object_acl(remote_key, oss2.OBJECT_ACL_PUBLIC_READ)
download_url = f'https://bigsea78.oss-cn-hongkong.aliyuncs.com/{remote_key}'
print(f"Upload done! URL: {download_url}")

# Step 2: Insert product into Neon DB
print("\nInserting product into database...")
conn = psycopg2.connect('postgresql://neondb_owner:npg_nQYzaOV3cbW1@ep-ancient-rice-aocsm9nj.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')
cur = conn.cursor()

product_id = str(uuid.uuid4())
metadata = '{"highlights": ["AI自动去背景", "支持4种图片格式", "边缘美化效果自然", "完全免费无广告", "无需安装双击即用"]}'

cur.execute("""
INSERT INTO products (id, name, description, price, currency, category, cover_image, download_url, metadata, active, created_at, updated_at)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
""", (
    product_id,
    'AI智能抠图工具',
    '基于AI模型的智能抠图工具，一键去除背景，支持JPG/PNG/WEBP/BMP格式。边缘美化，效果自然。完全免费，无广告，无水印。Windows系统，无需安装，双击即用。',
    0,
    'cny',
    'software',
    None,  # cover image TBD
    download_url,
    metadata,
    1,
))

conn.commit()
print(f"Product inserted! ID: {product_id}")
print(f"Product page: https://bigsea78.top/product/{product_id}")

cur.close()
conn.close()
