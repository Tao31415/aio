$response = Invoke-RestMethod -Uri "http://localhost:30000/api/v1/mqtt/tunnel-monitoring/latest?limit=1000" -Method Get
$data = $response.data

Write-Host ""
Write-Host "========================================="
Write-Host "  Database Statistics"
Write-Host "========================================="
Write-Host ""
Write-Host "Total records: $($response.total)"
Write-Host ""
Write-Host "By SN:"
Write-Host "-----------------------------------------"

$snCounts = $data | Group-Object -Property sn | Sort-Object Name
foreach ($group in $snCounts) {
    $bar = "=" * [Math]::Min([Math]::Ceiling($group.Count / 10), 50)
    Write-Host "$($group.Name): $($group.Count.ToString().PadLeft(4)) records $bar"
}

Write-Host ""
Write-Host "========================================="
