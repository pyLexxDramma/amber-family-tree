# Download demo photos from picsum.photos (same seeds as before) into public/demo/
# Run from project root: powershell -ExecutionPolicy Bypass -File scripts/download-demo-photos.ps1

$ErrorActionPreference = "Stop"
$base = $PSScriptRoot + "\.."
$avatars = "$base\public\demo\avatars"
$feed = "$base\public\demo\feed"

New-Item -ItemType Directory -Force -Path $avatars | Out-Null
New-Item -ItemType Directory -Force -Path $feed | Out-Null

# Member avatars m1..m17 (seed memberm1 etc.)
foreach ($i in 1..17) {
  $id = "m$i"
  $url = "https://picsum.photos/seed/member$id/400/400"
  $out = "$avatars\$id.jpg"
  Write-Host "Downloading avatar $id..."
  try {
    Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -MaximumRedirection 5
  } catch {
    Write-Warning "Failed $id : $_"
  }
}

# Feed images 1..32 (seeds angelo1..angelo30, vid1, vid2)
foreach ($i in 1..30) {
  $url = "https://picsum.photos/seed/angelo$i/800/600"
  $out = "$feed\$i.jpg"
  Write-Host "Downloading feed $i..."
  try {
    Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -MaximumRedirection 5
  } catch {
    Write-Warning "Failed feed $i : $_"
  }
}
foreach ($i in 1..2) {
  $url = "https://picsum.photos/seed/vid$i/800/600"
  $out = "$feed\$((30 + $i)).jpg"
  Write-Host "Downloading feed 3$i (vid)..."
  try {
    Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -MaximumRedirection 5
  } catch {
    Write-Warning "Failed vid $i : $_"
  }
}

# Tree hero
$treeUrl = "https://picsum.photos/seed/sokolov/1200/675"
$treeOut = "$base\public\demo\tree-hero.jpg"
Write-Host "Downloading tree-hero..."
try {
  Invoke-WebRequest -Uri $treeUrl -OutFile $treeOut -UseBasicParsing -MaximumRedirection 5
} catch {
  Write-Warning "Failed tree-hero : $_"
}

Write-Host "Done."
