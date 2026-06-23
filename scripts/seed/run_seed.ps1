# run_seed.ps1 - Seed data cho toan bo he thong ToToRo Microservices
# Usage: powershell -ExecutionPolicy Bypass -File scripts/seed/run_seed.ps1

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== ToToRo Microservices - Data Seeder ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Seed Identity DB
Write-Host "[1/3] Seeding identity_db..." -ForegroundColor Yellow
$identitySql = Get-Content "$ScriptDir\seed_identity_db.sql" -Raw -Encoding UTF8
docker exec -i totoro-identity-db psql -U root -d identity_db -c "$identitySql"
if ($LASTEXITCODE -eq 0) { Write-Host "  -> identity_db: OK" -ForegroundColor Green }
else { Write-Host "  -> identity_db: FAILED" -ForegroundColor Red; exit 1 }

# Step 2: Seed Core DB
Write-Host "[2/3] Seeding core_db..." -ForegroundColor Yellow
$coreSql = Get-Content "$ScriptDir\seed_core_db.sql" -Raw -Encoding UTF8
docker exec -i totoro-core-db psql -U root -d core_db -c "$coreSql"
if ($LASTEXITCODE -eq 0) { Write-Host "  -> core_db: OK" -ForegroundColor Green }
else { Write-Host "  -> core_db: FAILED" -ForegroundColor Red; exit 1 }

# Step 3: Seed Social DB
Write-Host "[3/3] Seeding social_db..." -ForegroundColor Yellow
$socialSql = Get-Content "$ScriptDir\seed_social_db.sql" -Raw -Encoding UTF8
docker exec -i totoro-social-db psql -U root -d social_db -c "$socialSql"
if ($LASTEXITCODE -eq 0) { Write-Host "  -> social_db: OK" -ForegroundColor Green }
else { Write-Host "  -> social_db: FAILED" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "=== Seed completed! ===" -ForegroundColor Cyan
Write-Host "All users password: Test@1234"
Write-Host "Roles: 1 ADMIN, 10 LANDLORD, 19 USER (30 total)"
Write-Host "Listings: 30 (18 ACTIVE, 5 PENDING, 4 INACTIVE, 3 REJECTED)"
