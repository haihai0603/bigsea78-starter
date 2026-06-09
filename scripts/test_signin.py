import urllib.request, json

url = 'https://bigsea78.top/api/auth/sign-in'
data = json.dumps({'email': 'bigsea@bigsea78.top', 'password': 'Bigsea78!'}).encode()
req = urllib.request.Request(url, data=data, headers={
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
})
try:
    resp = urllib.request.urlopen(req, timeout=15)
    print('Status:', resp.status)
    print('Body:', resp.read().decode())
except Exception as e:
    print('Error:', e)
    if hasattr(e, 'read'):
        print('Response body:', e.read().decode())
