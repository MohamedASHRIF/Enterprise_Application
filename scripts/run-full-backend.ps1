# Full rebuild + deploy script for local kind cluster
# Run from repository root in PowerShell
param(
    [string]$KindName = "dev-cluster",
    [string]$Namespace = "enterprise-dev",
    [string]$TimeoutDeploy = "180s"
)

Set-StrictMode -Version Latest

function Exec-Log($cmd) {
    Write-Host ">> $cmd"
    iex $cmd
}

# 1) Build Java services
$javaModules = @(
  "admin",
  "auth\authentication",
  "Backend\notification-system",
  "Customer_Service\customer_service",
  "employee-service",
  "chatbot-backend"
)
foreach($m in $javaModules) {
  Write-Host "`n== Building $m =="
  if (-not (Test-Path $m)) { Write-Warning "$m not found, skipping"; continue }
  Push-Location $m
  if(Test-Path ".\mvnw") { Exec-Log ".\mvnw -DskipTests package" } else { Exec-Log "mvn -DskipTests package" }
  Pop-Location
}

# 2) Build frontend
Write-Host "`n== Building frontend (npm) =="
if (Test-Path "frontend\package.json") {
  Push-Location frontend
  Exec-Log "npm install"
  Exec-Log "npm run build"
  Pop-Location
} else {
  Write-Host "No frontend package.json found, skipping frontend build."
}

# 3) Build Docker images and load into kind
$images = @{
  "admin" = "enterprise-admin:dev"
  "auth\authentication" = "enterprise-auth:dev"
  "Backend\notification-system" = "enterprise-notification:dev"
  "Customer_Service\customer_service" = "enterprise-customer:dev"
  "employee-service" = "enterprise-employee:dev"
  "chatbot-backend" = "enterprise-chatbot:dev"
  "frontend" = "enterprise-frontend:dev"
}

foreach($kv in $images.GetEnumerator()) {
  $folder = $kv.Key
  $tag = $kv.Value
  if (-not (Test-Path $folder)) { Write-Warning "Folder $folder not found, skipping $tag"; continue }

  Write-Host "`n== Building image $tag from $folder =="
  Push-Location $folder
  if (Test-Path "Dockerfile") {
    Exec-Log "docker build -t $tag ."
    Exec-Log "kind load docker-image $tag --name $KindName"
  } else {
    Write-Warning "No Dockerfile in $folder - skipping docker build for $tag"
  }
  Pop-Location
}

# 4) Apply infra manifests
Write-Host "`n== Applying infra manifests =="
Exec-Log "kubectl apply -f k8s/postgres-deployment.yml"
Exec-Log "kubectl apply -f k8s/rabbitmq-deployment.yml"

Write-Host "Waiting for infra deployments to become available..."
Exec-Log "kubectl -n $Namespace wait --for=condition=available deployment/postgres --timeout=$TimeoutDeploy"
Exec-Log "kubectl -n $Namespace wait --for=condition=available deployment/rabbitmq --timeout=$TimeoutDeploy"

# 5) Apply all k8s manifests
Write-Host "`n== Applying all k8s manifests =="
Exec-Log "kubectl apply -f k8s/"

# 6) Wait for main backend deployments
$deployments = @("notification","auth","admin","employee","customer","chatbot","frontend")
foreach($d in $deployments) {
  Write-Host "Waiting for deployment/$d..."
  Exec-Log "kubectl -n $Namespace wait --for=condition=available deployment/$d --timeout=$TimeoutDeploy"
}

Write-Host "`n== All deployments waited for. Showing pods: =="
Exec-Log "kubectl -n $Namespace get pods -o wide"

# 7) Start port-forwards
Write-Host "`n== Starting port-forwards for common services =="
Start-Job -ScriptBlock { kubectl -n enterprise-dev port-forward svc/frontend 3000:80 } | Out-Null
Start-Job -ScriptBlock { kubectl -n enterprise-dev port-forward svc/notification 8080:8080 } | Out-Null
Start-Job -ScriptBlock { kubectl -n enterprise-dev port-forward svc/auth 8081:8080 } | Out-Null
Start-Job -ScriptBlock { kubectl -n enterprise-dev port-forward svc/employee 8082:8080 } | Out-Null
Start-Job -ScriptBlock { kubectl -n enterprise-dev port-forward svc/admin 8083:8080 } | Out-Null
Start-Job -ScriptBlock { kubectl -n enterprise-dev port-forward svc/customer 8084:8080 } | Out-Null
Start-Job -ScriptBlock { kubectl -n enterprise-dev port-forward svc/chatbot 8085:8080 } | Out-Null
Start-Job -ScriptBlock { kubectl -n enterprise-dev port-forward svc/postgres 5433:5432 } | Out-Null
Start-Job -ScriptBlock { kubectl -n enterprise-dev port-forward svc/rabbitmq 5673:5672 } | Out-Null
Start-Job -ScriptBlock { kubectl -n enterprise-dev port-forward svc/rabbitmq 15673:15672 } | Out-Null

Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"
Write-Host "Port-forwards started and browser opened at http://localhost:3000"
