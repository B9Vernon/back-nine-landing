$port = 3333
$root = Split-Path -Parent $PSScriptRoot
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving $root on http://localhost:$port/"
while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    $path = $req.Url.LocalPath -replace '/', [IO.Path]::DirectorySeparatorChar
    if ($path -eq '\') { $path = '\index.html' }
    $file = Join-Path $root $path.TrimStart('\')
    if (Test-Path $file -PathType Leaf) {
        $bytes = [IO.File]::ReadAllBytes($file)
        $ext = [IO.Path]::GetExtension($file)
        $mime = switch ($ext) {
            '.html' { 'text/html' } '.css' { 'text/css' } '.js' { 'application/javascript' }
            '.svg'  { 'image/svg+xml' } '.png' { 'image/png' } '.jpg' { 'image/jpeg' }
            default { 'application/octet-stream' }
        }
        $res.ContentType = $mime
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $res.StatusCode = 404
    }
    $res.OutputStream.Close()
}
