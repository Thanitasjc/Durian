# Create / link a Supabase Postgres project for AuraGold Durian Laravel API
#
# Prerequisites:
# 1) Generate access token: https://supabase.com/dashboard/account/tokens
# 2) In PowerShell:
#    $env:SUPABASE_ACCESS_TOKEN = "sbp_..."
#    .\scripts\setup_supabase.ps1
#
# Optional overrides:
#    $env:SUPABASE_DB_PASSWORD = "StrongPassword123!"
#    $env:SUPABASE_ORG_ID = "your-org-id"
#    $env:SUPABASE_REGION = "ap-southeast-1"

$ErrorActionPreference = "Stop"
$ProjectName = if ($env:SUPABASE_PROJECT_NAME) { $env:SUPABASE_PROJECT_NAME } else { "auragold-durian" }
$Region = if ($env:SUPABASE_REGION) { $env:SUPABASE_REGION } else { "ap-southeast-1" }
$DbPass = if ($env:SUPABASE_DB_PASSWORD) { $env:SUPABASE_DB_PASSWORD } else {
  -join ((48..57 + 65..90 + 97..122) | Get-Random -Count 24 | ForEach-Object { [char]$_ })
}

if (-not $env:SUPABASE_ACCESS_TOKEN) {
  Write-Host "Missing SUPABASE_ACCESS_TOKEN" -ForegroundColor Red
  Write-Host "Create one at https://supabase.com/dashboard/account/tokens (account: thparkin.pl@gmail.com)"
  Write-Host 'Then: $env:SUPABASE_ACCESS_TOKEN = "sbp_..."'
  exit 1
}

Write-Host "Listing organizations..." -ForegroundColor Cyan
$orgsJson = npx --yes supabase orgs list -o json 2>$null
if (-not $orgsJson) {
  Write-Host "Failed to list orgs. Is the token valid?" -ForegroundColor Red
  exit 1
}

$orgs = $orgsJson | ConvertFrom-Json
$orgId = $env:SUPABASE_ORG_ID
if (-not $orgId) {
  if ($orgs -is [System.Array]) { $orgId = $orgs[0].id } else { $orgId = $orgs.id }
}
if (-not $orgId) {
  Write-Host "No organization found on this Supabase account." -ForegroundColor Red
  exit 1
}
Write-Host "Using org: $orgId"

Write-Host "Creating project '$ProjectName' in $Region ..." -ForegroundColor Cyan
$createOut = npx --yes supabase projects create $ProjectName --org-id $orgId --db-password $DbPass --region $Region --yes 2>&1
Write-Host $createOut

Start-Sleep -Seconds 5
$projectsJson = npx --yes supabase projects list -o json 2>$null
$projects = $projectsJson | ConvertFrom-Json
$project = @($projects) | Where-Object { $_.name -eq $ProjectName } | Select-Object -First 1
if (-not $project) {
  Write-Host "Project created but could not resolve ref from list. Check dashboard." -ForegroundColor Yellow
  Write-Host "DB password (save it): $DbPass" -ForegroundColor Yellow
  exit 0
}

$ref = $project.id
if (-not $ref) { $ref = $project.ref }
Write-Host "Project ref: $ref" -ForegroundColor Green

$hostName = "db.$ref.supabase.co"
$envPath = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envPath)) {
  Copy-Item (Join-Path $PSScriptRoot "..\.env.example") $envPath
}

$envText = Get-Content $envPath -Raw
function Set-EnvValue([string]$text, [string]$key, [string]$value) {
  $pattern = "(?m)^#?\s*$key=.*$"
  $line = "$key=$value"
  if ($text -match $pattern) {
    return [regex]::Replace($text, $pattern, $line)
  }
  return $text.TrimEnd() + "`r`n$line`r`n"
}

$envText = Set-EnvValue $envText "DB_CONNECTION" "pgsql"
$envText = Set-EnvValue $envText "DB_HOST" $hostName
$envText = Set-EnvValue $envText "DB_PORT" "5432"
$envText = Set-EnvValue $envText "DB_DATABASE" "postgres"
$envText = Set-EnvValue $envText "DB_USERNAME" "postgres"
$envText = Set-EnvValue $envText "DB_PASSWORD" $DbPass
$envText = Set-EnvValue $envText "DB_SSLMODE" "require"
Set-Content -Path $envPath -Value $envText -NoNewline

Write-Host "Updated backend/.env for Supabase." -ForegroundColor Green
Write-Host "Host: $hostName"
Write-Host "Password saved in .env (also keep a copy): $DbPass" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next (wait ~1-2 min for DB to be ready):" -ForegroundColor Cyan
Write-Host "  cd backend"
Write-Host "  php artisan migrate:fresh --seed"
Write-Host "  php artisan serve"
