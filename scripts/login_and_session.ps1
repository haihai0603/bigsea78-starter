$ErrorActionPreference = 'Continue'
$headers = @{ 'Content-Type' = 'application/json'; 'User-Agent' = 'Mozilla/5.0' }
$body = '{"email":"bigsea@bigsea78.top","password":"Bigsea78!"}'

# Sign in
$loginResp = curl.exe -s -X POST "https://bigsea78.top/api/auth/sign-in" -H "Content-Type: application/json" -H "User-Agent: Mozilla/5.0" --data-binary "$env:TEMP\login.json"
Write-Host "Login response: $loginResp"

# Read the saved cookie from previous curl run
$cookieFile = "$env:TEMP\curl_cookie_$(whoami).txt"
Write-Host "Checking for cookie file: $cookieFile"
