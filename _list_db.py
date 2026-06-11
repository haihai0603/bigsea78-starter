import psycopg2
conn = psycopg2.connect('postgresql://neondb_owner:npg_nQYzaOV3cbW1@ep-ancient-rice-aocsm9nj.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')
cur = conn.cursor()

# List all products with id and name
cur.execute("SELECT id, name, price, download_url FROM products WHERE active = 1 ORDER BY created_at DESC")
for r in cur.fetchall():
    print(f"{r[0]} | {r[1]} | {r[2]} | {r[3]}")

conn.close()
