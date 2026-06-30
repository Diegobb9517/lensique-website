$path = "C:\Users\bauti\AppData\Local\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\local-agent-mode-sessions\9859966b-2681-4ff9-9365-862abfcbf45b\e5afd8c5-173d-4ccc-ac74-594517472379\local_97fb2b59-d2b1-4991-8e52-38f64ea8ea93\outputs\Asesor_ZEISS.html"
$content = Get-Content -Path $path -Raw
$content = $content -replace 'data:image\/[^;]+;base64,[A-Za-z0-9+/=]+', 'BASE64_PLACEHOLDER'
Set-Content -Path 'asesor_stripped.html' -Value $content
