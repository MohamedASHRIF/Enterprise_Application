<#
Port-forward helper for common services. Use Start-PortForwards to start jobs and Stop-PortForwards to stop them.
#>

function Start-PortForwards {
  param(
    [string]$Namespace = "enterprise-dev"
  )
  $map = @{
    "frontend" = "3000:80"
    "notification" = "8080:8080"
    "auth" = "8081:8080"
    "employee" = "8082:8080"
    "admin" = "8083:8080"
    "customer" = "8084:8080"
    "chatbot" = "8085:8080"
    "postgres" = "5433:5432"
    "rabbitmq-amqp" = "5673:5672"
    "rabbitmq-mgmt" = "15673:15672"
  }

  $jobs = @()
  foreach($k in $map.Keys) {
    $ports = $map[$k]
    if ($k -like 'rabbitmq*') { $svc = 'svc/rabbitmq' }
    elseif ($k -eq 'postgres') { $svc = 'svc/postgres' }
    else { $svc = "svc/$k" }
    Write-Host "Starting port-forward for $svc -> $ports"
    $job = Start-Job -ScriptBlock { param($s,$p,$n) kubectl -n $n port-forward $s $p } -ArgumentList $svc,$ports,$Namespace
    $jobs += $job
    Start-Sleep -Milliseconds 200
  }
  Write-Host "Port-forward jobs started. Use Stop-PortForwards to stop them."
  return $jobs
}

function Stop-PortForwards {
  $running = Get-Job | Where-Object { $_.State -eq 'Running' -and ($_.Command -match 'port-forward' -or $_.Command -match 'kubectl') }
  foreach($j in $running) {
    Write-Host "Stopping job Id=$($j.Id) Name=$($j.Name)"
    Stop-Job -Id $j.Id -Force
    Remove-Job -Id $j.Id -Force
  }
  Write-Host "Stopped port-forward jobs."
}

Export-ModuleMember -Function Start-PortForwards,Stop-PortForwards
