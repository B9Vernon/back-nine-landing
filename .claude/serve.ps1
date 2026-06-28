$port = 3333
$root = Split-Path -Parent $PSScriptRoot
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving $root on http://localhost:$port/"

$mimeMap = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.svg'  = 'image/svg+xml'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.webp' = 'image/webp'
    '.gif'  = 'image/gif'
    '.ico'  = 'image/x-icon'
    '.mp4'  = 'video/mp4'
    '.mov'  = 'video/quicktime'
    '.webm' = 'video/webm'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
    '.ttf'  = 'font/ttf'
}

while ($listener.IsListening) {
    try {
        $ctx = $listener.GetContext()
    } catch { continue }

    $req = $ctx.Request
    $res = $ctx.Response
    try {
        $rel = [Uri]::UnescapeDataString($req.Url.AbsolutePath)
        $rel = $rel -replace '/', [IO.Path]::DirectorySeparatorChar
        if ($rel -eq [IO.Path]::DirectorySeparatorChar) { $rel = [IO.Path]::DirectorySeparatorChar + 'index.html' }
        $file = Join-Path $root $rel.TrimStart([IO.Path]::DirectorySeparatorChar)

        if (Test-Path $file -PathType Leaf) {
            $ext = [IO.Path]::GetExtension($file).ToLower()
            $mime = $mimeMap[$ext]
            if (-not $mime) { $mime = 'application/octet-stream' }
            $res.ContentType = $mime
            $res.Headers['Cache-Control'] = 'no-cache'
            $res.AddHeader('Accept-Ranges', 'bytes')

            $fs = [IO.File]::Open($file, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::Read)
            try {
                $total = $fs.Length
                $rangeHeader = $req.Headers['Range']
                $start = 0
                $end = $total - 1

                if ($rangeHeader -and $rangeHeader -match 'bytes=(\d*)-(\d*)') {
                    $s = $matches[1]; $e = $matches[2]
                    if ($s -ne '') { $start = [int64]$s }
                    if ($e -ne '') { $end = [int64]$e }
                    if ($end -ge $total) { $end = $total - 1 }
                    if ($start -gt $end) { $start = 0 }
                    $res.StatusCode = 206
                    $res.AddHeader('Content-Range', "bytes $start-$end/$total")
                } else {
                    $res.StatusCode = 200
                }

                $len = $end - $start + 1
                $res.ContentLength64 = $len

                if ($req.HttpMethod -ne 'HEAD') {
                    $fs.Seek($start, [IO.SeekOrigin]::Begin) | Out-Null
                    $buffer = New-Object byte[] 65536
                    $remaining = $len
                    while ($remaining -gt 0) {
                        $toRead = [Math]::Min($buffer.Length, $remaining)
                        $read = $fs.Read($buffer, 0, $toRead)
                        if ($read -le 0) { break }
                        $res.OutputStream.Write($buffer, 0, $read)
                        $remaining -= $read
                    }
                }
            } finally {
                $fs.Close()
            }
        } else {
            $res.StatusCode = 404
            $msg = [Text.Encoding]::UTF8.GetBytes('Not Found')
            $res.ContentLength64 = $msg.Length
            $res.OutputStream.Write($msg, 0, $msg.Length)
        }
    } catch {
        # client disconnects / range aborts are normal; ignore
    } finally {
        try { $res.OutputStream.Close() } catch {}
    }
}
