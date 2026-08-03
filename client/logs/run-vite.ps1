$ErrorActionPreference = 'SilentlyContinue'
$dir = 'C:\Users\hp\Desktop\rm-website\rm-consulting\client'
while ($true) {
  Start-Process -FilePath 'node' -ArgumentList 'node_modules/vite/bin/vite.js','--port=3000','--host=0.0.0.0' -WorkingDirectory $dir -RedirectStandardOutput "$dir\logs\vite-out.log" -RedirectStandardError "$dir\logs\vite-err.log" -Wait
  Start-Sleep -Seconds 3
}
