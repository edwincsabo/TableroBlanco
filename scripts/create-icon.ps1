Add-Type -AssemblyName System.Drawing
$iconDirectory = Join-Path $PSScriptRoot '..\build'
New-Item -ItemType Directory -Path $iconDirectory -Force | Out-Null
$bitmap = [System.Drawing.Bitmap]::new(256,256)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::FromArgb(23,108,98))
$pen = [System.Drawing.Pen]::new([System.Drawing.Color]::White,18)
$pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawLine($pen,70,162,100,92)
$graphics.DrawLine($pen,111,179,156,70)
$graphics.DrawLine($pen,161,170,192,97)
$bitmap.Save((Join-Path $iconDirectory 'icon.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$icon=[System.Drawing.Icon]::FromHandle($bitmap.GetHicon())
$stream=[System.IO.File]::OpenWrite((Join-Path $iconDirectory 'icon.ico'))
$icon.Save($stream)
$stream.Dispose()
$icon.Dispose()
$pen.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
