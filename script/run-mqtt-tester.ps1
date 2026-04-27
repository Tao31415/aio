$ErrorActionPreference = "Stop"

Write-Host "========================================"
Write-Host "  Starting MQTT Tester (1 second interval)"
Write-Host "  Will stop after 5 minutes"
Write-Host "========================================"

$scriptPath = "D:\Dev\Projects\aio\script\mqtt-tester.js"
$process = Start-Process -FilePath "node.exe" -ArgumentList $scriptPath -PassThru -NoNewWindow

Write-Host "`n[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] MQTT Tester started (PID: $($process.Id))"
Write-Host "Waiting 5 minutes (300 seconds)...`n"

for ($i = 1; $i -le 300; $i++) {
    Start-Sleep -Seconds 1
    if ($i % 10 -eq 0) {
        Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Running... ($i/300 seconds)"
    }
}

Write-Host "`n[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Stopping MQTT Tester..."
Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue

Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] MQTT Tester stopped"
Write-Host "========================================"
