# 1. Kill all Node processes to release locks on temp files
Write-Host "Killing all Node/Metro processes..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2. Delete temporary Metro files
Write-Host "Clearing temporary Metro caches..." -ForegroundColor Yellow
Remove-Item -Path "$env:TEMP\metro-*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:TEMP\haste-map-*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:TEMP\expo-*" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Delete project cache folders
Write-Host "Clearing project cache folders (.expo and node_modules/.cache)..." -ForegroundColor Yellow
Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\react-native-css-interop\.cache" -Recurse -Force -ErrorAction SilentlyContinue

# 4. Verify and apply patches
Write-Host "Applying patches..." -ForegroundColor Yellow
npm run postinstall

Write-Host "--------------------------------------------------------" -ForegroundColor Green
Write-Host "CLEANUP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "Please do the following:" -ForegroundColor Yellow
Write-Host "1. Force close (swipe away) the Expo Go app on your phone." -ForegroundColor Cyan
Write-Host "2. Run this command to start Metro clean:" -ForegroundColor Cyan
Write-Host "   npx expo start --clear" -ForegroundColor White
Write-Host "3. Open Expo Go and enjoy error-free chatting!" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Green
