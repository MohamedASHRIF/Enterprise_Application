

param(
  [switch]$DeleteClusterAfter = $false,
  [switch]$SkipBuild = $true,
  [switch]$Dev = $false
)

$ErrorActionPreference = 'Stop'

function Check-Tool($cmd, $hint) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    Write-Host "Missing required tool: $cmd. $hint" -ForegroundColor Red
    return $false
  }
  return $true
}

# tools
 $toolsOk = $true
 $toolsOk = (Check-Tool -cmd "docker" -hint "Install Docker Desktop and ensure Docker is running.") -and $toolsOk
 $toolsOk = (Check-Tool -cmd "kubectl" -hint "Install kubectl: https://kubernetes.io/docs/tasks/tools/") -and $toolsOk
 # Helm is optional for this script (manifests are applied with kubectl). Warn if missing but don't fail.
 if (-not (Get-Command helm -ErrorAction SilentlyContinue)) {
   Write-Host "Warning: helm not found. Helm is optional for this script; continuing without helm." -ForegroundColor Yellow
 } else {
   $toolsOk = $true
 }

# kind might be in %USERPROFILE%\bin; prefer full path fallback
$kindExe = "$env:USERPROFILE\bin\kind.exe"
if (Get-Command kind -ErrorAction SilentlyContinue) {
  $kindExe = "kind"
} elseif (-Not (Test-Path $kindExe)) {
  Write-Host "kind not found in PATH or $kindExe. Please install kind (see README)" -ForegroundColor Red
  exit 1
}

if (-not $toolsOk) { Write-Host "Install required tools and re-run."; exit 1 }

# ensure Docker is running
try { docker version | Out-Null } catch { Write-Host "Docker not running or not accessible. Start Docker Desktop and re-run." -ForegroundColor Red; exit 1 }

# create cluster if missing
$clusterName = 'dev-cluster'
$clusters = & $kindExe get clusters
if (-not ($clusters -match $clusterName)) {
  Write-Host "Creating kind cluster: $clusterName ..."
  & $kindExe create cluster --name $clusterName
  if ($LASTEXITCODE -ne 0) { Write-Host "kind cluster creation failed" -ForegroundColor Red; exit 1 }
} else { Write-Host "Kind cluster $clusterName already exists. Using existing cluster." }

# show context
Write-Host "Current kubectl context: $(kubectl config current-context)"

# build images (optional)
$images = @{
  frontend = @{ path = './frontend'; image = 'enterprise-frontend:dev' }
  auth = @{ path = './auth/authentication'; image = 'enterprise-auth:dev' }
  notification = @{ path = './Backend/notification-system'; image = 'enterprise-notification:dev' }
  employee = @{ path = './employee-service'; image = 'enterprise-employee:dev' }
  chatbot = @{ path = './chatbot-backend'; image = 'enterprise-chatbot:dev' }
  admin = @{ path = './admin'; image = 'enterprise-admin:dev' }
  customer = @{ path = './Customer_Service/customer_service'; image = 'enterprise-customer:dev' }
}

if (-not $SkipBuild) {
  foreach ($svc in $images.GetEnumerator()) {
    $name = $svc.Key; $p = $svc.Value.path; $img = $svc.Value.image
    if (Test-Path $p) {
      Write-Host "Building $name from $p -> $img"
      docker build -t $img $p
      if ($LASTEXITCODE -ne 0) { Write-Host "Docker build failed for $name" -ForegroundColor Yellow; continue }
      Write-Host "Loading $img into kind cluster..."
      & $kindExe load docker-image $img --name $clusterName
    } else {
      Write-Host "Path not found: $p - skipping $name" -ForegroundColor Yellow
    }
  }
} else {
  Write-Host "Skipping image builds (SkipBuild=true). Assuming images are already present locally." -ForegroundColor Yellow
}

# create namespace
$nsFile = Join-Path (Get-Location) 'k8s\namespace.yml'
if (Test-Path $nsFile) {
  kubectl apply -f $nsFile
} else {
  kubectl create namespace enterprise-dev --dry-run=client -o yaml | kubectl apply -f -
}

# apply secrets and postgres and manifests
$manifests = @(
  'k8s/db-secret.yml',
  'k8s/postgres-deployment.yml',
  'k8s/auth-deployment.yml',
  'k8s/employee-deployment.yml',
  'k8s/chatbot-deployment.yml',
  'k8s/admin-deployment.yml',
  'k8s/customer-deployment.yml',
  'k8s/notification-deployment.yml',
  'k8s/frontend-deployment.yml'
)

foreach ($m in $manifests) {
  if (Test-Path $m) {
    Write-Host "Applying $m"
    kubectl apply -f $m
  } else { Write-Host "Manifest not found: $m" -ForegroundColor Yellow }
}

# patch images to local dev tags
function Patch-Image($deploy, $container, $image) {
  try {
    Write-Host "Patching deployment $deploy -> $image"
  & kubectl -n enterprise-dev set image "deployment/$deploy" "${container}=${image}" | Out-Null
  } catch {
    Write-Host ("Failed to patch image for {0}: {1}" -f $deploy, $_.Exception.Message) -ForegroundColor Yellow
  }
}

Patch-Image -deploy 'frontend' -container 'frontend' -image 'enterprise-frontend:dev'
Patch-Image -deploy 'notification' -container 'notification' -image 'enterprise-notification:dev'
Patch-Image -deploy 'auth' -container 'auth' -image 'enterprise-auth:dev'
Patch-Image -deploy 'employee' -container 'employee' -image 'enterprise-employee:dev'
Patch-Image -deploy 'chatbot' -container 'chatbot' -image 'enterprise-chatbot:dev'
Patch-Image -deploy 'admin' -container 'admin' -image 'enterprise-admin:dev'
Patch-Image -deploy 'customer' -container 'customer' -image 'enterprise-customer:dev'

# ensure imagePullPolicy is IfNotPresent so kind uses local images
function Set-ImagePullPolicy($deployment, $containerName) {
  $patchObj = @{ spec = @{ template = @{ spec = @{ containers = @(@{ name = $containerName; imagePullPolicy = 'IfNotPresent' }) } } } }
  $patchJson = $patchObj | ConvertTo-Json -Depth 10
  $tmp = New-TemporaryFile
  try {
    Set-Content -LiteralPath $tmp -Value $patchJson -Encoding UTF8
    & kubectl -n enterprise-dev patch "deployment/$deployment" --type=merge --patch-file $tmp
  } finally {
    Remove-Item -LiteralPath $tmp -ErrorAction SilentlyContinue
  }
}
Set-ImagePullPolicy -deployment 'frontend' -containerName 'frontend'
Set-ImagePullPolicy -deployment 'notification' -containerName 'notification'
Set-ImagePullPolicy -deployment 'auth' -containerName 'auth'
Set-ImagePullPolicy -deployment 'employee' -containerName 'employee'
Set-ImagePullPolicy -deployment 'chatbot' -containerName 'chatbot'
Set-ImagePullPolicy -deployment 'admin' -containerName 'admin'
Set-ImagePullPolicy -deployment 'customer' -containerName 'customer'

# If running in local dev mode, apply dev-only patches:
if ($Dev) {
  Write-Host "Dev mode enabled: applying dev-only patches (postgres emptyDir, notification imagePullPolicy)" -ForegroundColor Cyan

  # Patch postgres deployment to use an emptyDir for pgdata (kind doesn't provision PVs by default)
  try {
    $pgPatchObj = @{ spec = @{ template = @{ spec = @{ volumes = @(@{ name = 'pgdata'; emptyDir = @{} }) } } } }
  $pgPatchJson = $pgPatchObj | ConvertTo-Json -Depth 10
  Write-Host "Patching postgres deployment volumes -> emptyDir"
  $tmpPg = New-TemporaryFile
  try {
    Set-Content -LiteralPath $tmpPg -Value $pgPatchJson -Encoding UTF8
    & kubectl -n enterprise-dev patch "deployment/postgres" --type=merge --patch-file $tmpPg
  } finally {
    Remove-Item -LiteralPath $tmpPg -ErrorAction SilentlyContinue
  }
    Write-Host "Restarting postgres deployment to pick up volume change"
    & kubectl -n enterprise-dev rollout restart "deployment/postgres"
  } catch {
    Write-Host "Warning: failed to patch postgres deployment: $($_.Exception.Message)" -ForegroundColor Yellow
  }

  # Ensure notification uses the local image (already built/loaded by this script) and IfNotPresent
  try {
    Write-Host "Setting notification deployment image to enterprise-notification:dev"
    & kubectl -n enterprise-dev set image "deployment/notification" "notification=enterprise-notification:dev" | Out-Null
  $notifPatchObj = @{ spec = @{ template = @{ spec = @{ containers = @(@{ name = 'notification'; imagePullPolicy = 'IfNotPresent' }) } } } }
  $notifPatch = $notifPatchObj | ConvertTo-Json -Depth 10
  $tmpNotif = New-TemporaryFile
  try {
    Set-Content -LiteralPath $tmpNotif -Value $notifPatch -Encoding UTF8
    & kubectl -n enterprise-dev patch "deployment/notification" --type=merge --patch-file $tmpNotif
  } finally {
    Remove-Item -LiteralPath $tmpNotif -ErrorAction SilentlyContinue
  }
  } catch {
    Write-Host "Warning: failed to patch notification deployment: $($_.Exception.Message)" -ForegroundColor Yellow
  }
}

# wait for postgres
Write-Host "Waiting for postgres pod to be ready (timeout 180s)"
try { kubectl -n enterprise-dev wait --for=condition=ready pod -l app=postgres --timeout=180s } catch { Write-Host "Postgres pod not ready within timeout" -ForegroundColor Yellow }

# wait for deployments
$deploys = @('postgres','auth','employee','chatbot','admin','customer','notification','frontend')
foreach ($d in $deploys) {
  Write-Host "Waiting for deployment $d rollout (timeout 180s)"
  try { kubectl -n enterprise-dev rollout status deployment/$d --timeout=180s } catch { Write-Host "Deployment $d failed to roll out in time" -ForegroundColor Yellow }
}

# show pods
kubectl -n enterprise-dev get pods -o wide
kubectl -n enterprise-dev get svc

# smoke test: port-forward frontend svc -> localhost:3000
$svcName = 'frontend'
$localPort = 3000
$svcPort = 80
$pfJob = $null
  try {
  Write-Host "Port-forwarding svc/$svcName to localhost:$localPort (background)"
  $pfJob = Start-Job -ScriptBlock { param($n,$s,$l,$p) kubectl -n $n port-forward ("svc/{0}" -f $s) ("{0}:{1}" -f $l,$p) } -ArgumentList 'enterprise-dev',$svcName,$localPort,$svcPort
  Start-Sleep -Seconds 4
  $url = "http://127.0.0.1:$localPort/"
  Write-Host "Attempting GET $url"
  $resp = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 10 -ErrorAction SilentlyContinue
  if ($resp -and $resp.StatusCode -eq 200) { Write-Host "Smoke test OK (200)" -ForegroundColor Green } else { Write-Host "Smoke test failed or non-200 response." -ForegroundColor Yellow }
} finally {
  if ($pfJob) {
    Write-Host "Stopping port-forward job"
  Stop-Job $pfJob -ErrorAction SilentlyContinue
  Remove-Job $pfJob -ErrorAction SilentlyContinue
  }
}

# final status
Write-Host "Final deployment status:" 
kubectl -n enterprise-dev get pods,svc -o wide

if ($DeleteClusterAfter) {
  Write-Host "Deleting kind cluster $clusterName as requested..."
  & $kindExe delete cluster --name $clusterName
}

Write-Host "Script finished."