$port = 3333
$root = Split-Path -Parent $PSScriptRoot
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving $root on http://localhost:$port/"

$handler = {
    param($ctx, $root)
    $mimeMap = @{
        '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='application/javascript; charset=utf-8';
        '.json'='application/json; charset=utf-8'; '.svg'='image/svg+xml'; '.png'='image/png'; '.jpg'='image/jpeg';
        '.jpeg'='image/jpeg'; '.webp'='image/webp'; '.gif'='image/gif'; '.ico'='image/x-icon'; '.mp4'='video/mp4';
        '.mov'='video/quicktime'; '.webm'='video/webm'; '.woff'='font/woff'; '.woff2'='font/woff2'; '.ttf'='font/ttf'
    }
    $req = $ctx.Request; $res = $ctx.Response
    try {
        $res.KeepAlive = $false
        $rel = [Uri]::UnescapeDataString($req.Url.AbsolutePath) -replace '/', [IO.Path]::DirectorySeparatorChar
        if ($rel -eq [IO.Path]::DirectorySeparatorChar) { $rel = [IO.Path]::DirectorySeparatorChar + 'index.html' }
        $file = Join-Path $root $rel.TrimStart([IO.Path]::DirectorySeparatorChar)

        if (Test-Path $file -PathType Leaf) {
            $ext = [IO.Path]::GetExtension($file).ToLower()
            $mime = $mimeMap[$ext]; if (-not $mime) { $mime = 'application/octet-stream' }
            $res.ContentType = $mime
            $res.Headers['Cache-Control'] = 'no-cache'
            $res.AddHeader('Accept-Ranges', 'bytes')
            $all = [IO.File]::ReadAllBytes($file)
            $total = $all.Length; $start = 0; $end = $total - 1
            $rangeHeader = $req.Headers['Range']
            if ($rangeHeader -and $rangeHeader -match 'bytes=(\d*)-(\d*)') {
                if ($matches[1] -ne '') { $start = [int64]$matches[1] }
                if ($matches[2] -ne '') { $end = [int64]$matches[2] }
                if ($end -ge $total) { $end = $total - 1 }
                if ($start -lt 0 -or $start -gt $end) { $start = 0 }
                $res.StatusCode = 206
                $res.AddHeader('Content-Range', "bytes $start-$end/$total")
            } else { $res.StatusCode = 200 }
            $len = [int]($end - $start + 1)
            $res.ContentLength64 = $len
            if ($req.HttpMethod -ne 'HEAD') {
                # single write avoids Nagle/delayed-ACK stalls
                $res.OutputStream.Write($all, [int]$start, $len)
            }
        } else {
            $res.StatusCode = 404
            $msg = [Text.Encoding]::UTF8.GetBytes('Not Found')
            $res.ContentLength64 = $msg.Length
            $res.OutputStream.Write($msg, 0, $msg.Length)
        }
    } catch {
    } finally { try { $res.OutputStream.Close() } catch {} }
}

$pool = [RunspaceFactory]::CreateRunspacePool(2, 16)
$pool.Open()

while ($listener.IsListening) {
    try { $ctx = $listener.GetContext() } catch { continue }
    $ps = [PowerShell]::Create()
    $ps.RunspacePool = $pool
    [void]$ps.AddScript($handler).AddArgument($ctx).AddArgument($root)
    [void]$ps.BeginInvoke()
}
