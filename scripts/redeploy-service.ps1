<#
Redeploy a single service to local kind cluster.
Usage:
  .\scripts\redeploy-service.ps1 -Service notification -Folder Backend\notification-system -Image enterprise-notification:dev
#>
param(
  [Parameter(Mandatory=$true)][string]$Service,
  [Parameter(Mandatory=$true)][string]$Folder,
  [Parameter(Mandatory=$true)][string]$Image,
  [string]$KindName = "dev-cluster",
  [string]$Namespace = "enterprise-dev"
)

Set-StrictMode -Version Latest

function Exec-Log($cmd) { Write-Host ">> $cmd"; iex $cmd }

if (-not (Test-Path $Folder)) { Throw "Folder $Folder not found" }

Push-Location $Folder
# Build: prefer npm for frontend, mvnw for Java, fallback to nothing
if (Test-Path "package.json") {
  Write-Host "Building Node frontend in $Folder"
  Exec-Log "npm install"
  Exec-Log "npm run build"
} elseif (Test-Path ".\mvnw") {
  Write-Host "Building Java module in $Folder"
  Exec-Log ".\mvnw -DskipTests package"
} elseif (Test-Path "pom.xml") {
  Write-Host "Building Java module (no mvnw) in $Folder"
  Exec-Log "mvn -DskipTests package"
} else {
  Write-Host "No recognized build file in $Folder — skipping build step"
}

# Docker build if Dockerfile exists
if (Test-Path "Dockerfile") {
  Exec-Log "docker build -t $Image ."
  Pop-Location
  Exec-Log "kind load docker-image $Image --name $KindName"
} else {
  Pop-Location
  Write-Host "No Dockerfile in $Folder — skipping docker build. Make sure k8s manifest references an image present in cluster."
}

# Update the deployment image and rollout
Write-Host "Updating deployment/$Service image to $Image"
Exec-Log "kubectl -n $Namespace set image deployment/$Service $Service=$Image --record"
Exec-Log "kubectl -n $Namespace rollout status deployment/$Service --timeout=120s"

Write-Host "Done redeploying $Service."