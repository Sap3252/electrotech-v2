# Script para ejecutar backups programados de ElectroTech
# Ejecutar con: powershell -ExecutionPolicy Bypass -File ejecutar-backups.ps1
# Configurar en Task Scheduler para ejecutar cada minuto

$baseUrl = "http://localhost:3000"
$token = "electrotech-backup-2025"

$url = "$baseUrl/api/backup/ejecutar-programados?token=$token"

try {
    $response = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 120
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] Ejecutados: $($response.ejecutados), Fallidos: $($response.fallidos)"
    
    # Escribir en log
    $logFile = Join-Path $PSScriptRoot "backup-scheduler.log"
    Add-Content -Path $logFile -Value $logMessage
    
    if ($response.ejecutados -gt 0 -or $response.fallidos -gt 0) {
        Write-Host $logMessage
        foreach ($resultado in $response.resultados) {
            $detalleLog = "  - $($resultado.nombre): $($resultado.estado)"
            if ($resultado.archivo) {
                $detalleLog += " -> $($resultado.archivo)"
            }
            if ($resultado.error) {
                $detalleLog += " ERROR: $($resultado.error)"
            }
            Add-Content -Path $logFile -Value $detalleLog
        }
    }
}
catch {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $errorMessage = "[$timestamp] ERROR: $($_.Exception.Message)"
    
    $logFile = Join-Path $PSScriptRoot "backup-scheduler.log"
    Add-Content -Path $logFile -Value $errorMessage
    
    Write-Error $errorMessage
}
