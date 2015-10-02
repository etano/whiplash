<?php
session_start();

if($_SESSION["authorized"]!=TRUE){
    die("not authorized");
}
$target_dir = "uploads/";
$target_file = $target_dir . basename($_FILES["myfile"]["name"]);

if ($_FILES["myfile"]["size"] > (99 * 1024 * 1024)) die("error");
if(move_uploaded_file($_FILES["myfile"]["tmp_name"], $target_file)) echo "success";
else die("error");
?>
