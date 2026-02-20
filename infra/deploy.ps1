# Deploy SunCorp Hackathon Quiz to Azure
# Usage: .\infra\deploy.ps1 -AdminPassword "suncorphack"

param(
    [Parameter(Mandatory=$true)]
    [string]$AdminPassword,

    [string]$ResourceGroup = "suncorp_hack_rg",
    [string]$Location = "australiaeast"
)

$ErrorActionPreference = "Stop"

Write-Host "=== SunCorp Hackathon Quiz - Azure Deployment ===" -ForegroundColor Cyan

# 1. Ensure resource group exists
Write-Host "`n[1/5] Ensuring resource group '$ResourceGroup' exists..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location --output none

# 2. Deploy Bicep infrastructure
Write-Host "[2/5] Deploying infrastructure with Bicep..." -ForegroundColor Yellow
$deployment = az deployment group create `
    --resource-group $ResourceGroup `
    --template-file "$PSScriptRoot\main.bicep" `
    --parameters adminPassword=$AdminPassword `
    --output json | ConvertFrom-Json

$swaName = $deployment.properties.outputs.staticWebAppName.value
$funcName = $deployment.properties.outputs.functionAppName.value
$swaUrl = $deployment.properties.outputs.staticWebAppUrl.value
$funcUrl = $deployment.properties.outputs.functionAppUrl.value

Write-Host "  Static Web App: $swaName" -ForegroundColor Gray
Write-Host "  Function App:   $funcName" -ForegroundColor Gray

# 3. Deploy Azure Functions
Write-Host "[3/5] Deploying Azure Functions..." -ForegroundColor Yellow
Push-Location "$PSScriptRoot\..\api"
func azure functionapp publish $funcName --javascript
Pop-Location

# 4. Deploy frontend to Static Web App
Write-Host "[4/5] Deploying frontend to Static Web App..." -ForegroundColor Yellow
$swaToken = az staticwebapp secrets list --name $swaName --resource-group $ResourceGroup --query "properties.apiKey" -o tsv

npx @azure/static-web-apps-cli deploy "$PSScriptRoot\..\frontend" `
    --deployment-token $swaToken `
    --env production

# 5. Lock down CORS
Write-Host "[5/5] Locking down CORS to SWA hostname..." -ForegroundColor Yellow
$swaHostname = $deployment.properties.outputs.staticWebAppUrl.value
az functionapp cors remove -g $ResourceGroup -n $funcName --allowed-origins "*" 2>$null
az functionapp cors add -g $ResourceGroup -n $funcName --allowed-origins $swaHostname

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Participant page: $swaUrl/index.html" -ForegroundColor Cyan
Write-Host "Admin page:       $swaUrl/admin.html" -ForegroundColor Cyan
Write-Host "Function API:     $funcUrl" -ForegroundColor Cyan
