import psycopg2

# Try pooler endpoint
try:
    conn = psycopg2.connect('postgresql://neondb_owner:npg_nQYzaOV3cbW1@ep-ancient-rice-aocsm9nj-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')
    cur = conn.cursor()
    cur.execute("SELECT id, name, price, download_url FROM products WHERE id = '3ee82f0d-0524-4a19-b5e5-f0b0681a9219'")
    r = cur.fetchone()
    print('Pooler DB - koutu product:', r)
    if not r:
        cur.execute("SELECT count(*) FROM products")
        print('Total products in pooler DB:', cur.fetchone()[0])
        cur.execute("SELECT id, name FROM products LIMIT 5")
        for row in cur.fetchall():
            print('  ', row)
    conn.close()
except Exception as e:
    print('Pooler error:', e)

# Also check direct endpoint
try:
    conn2 = psycopg2.connect('postgresql://neondb_owner:npg_nQYzaOV3cbW1@ep-ancient-rice-aocsm9nj.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')
    cur2 = conn2.cursor()
    cur2.execute("SELECT id, name, price FROM products WHERE id = '3ee82f0d-0524-4a19-b5e5-f0b0681a9219'")
    r2 = cur2.fetchone()
    print('Direct DB - koutu product:', r2)
    conn2.close()
except Exception as e:
    print('Direct error:', e)
