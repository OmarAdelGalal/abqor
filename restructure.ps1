New-Item -ItemType Directory -Force -Path "src/app/(student)"
Move-Item -Path "src/app/dashboard" -Destination "src/app/(student)/dashboard"
Move-Item -Path "src/app/learning" -Destination "src/app/(student)/learning"
Move-Item -Path "src/app/notifications" -Destination "src/app/(student)/notifications"
Move-Item -Path "src/app/account" -Destination "src/app/(student)/account" -ErrorAction SilentlyContinue

Write-Host "Directory restructure complete! Please delete this script."
