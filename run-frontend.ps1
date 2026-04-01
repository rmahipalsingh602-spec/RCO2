param(
    [int]$Port = 5173
)

Set-Location (Join-Path $PSScriptRoot "frontend")

$npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $npm) {
    throw "npm.cmd was not found on PATH"
}

& $npm.Source run dev -- --host 127.0.0.1 --port $Port
