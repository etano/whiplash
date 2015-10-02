<!DOCTYPE html>
<html>
<head> 
    <title>Whiplash DB</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="apple-mobile-web-app-capable" content="yes">
    <link rel="stylesheet" href="css/main.css" type="text/css" />
    <script src="scripts/jquery/jquery-2.1.1.min.js"></script>
    <script src="scripts/main.js"></script>
</head> 
<body>
    <section id="logo">Whiplash DB</section>
    <section id="upload">
        <form id="upload" method="post">
            <input type="file" class="file" name="myfile" id="myfile-input" onchange="upload();" />
            <label for="myfile-input">Upload dataset</label>
        </form>
    </section>
</body>
</html>
