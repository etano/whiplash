<?php
session_start();

try{
    $m = new MongoClient( "mongodb://".getenv("MONGO_PORT_27017_TCP_ADDR").":".getenv("MONGO_PORT_27017_TCP_PORT"), array("username" => $_POST["user"], "password" => $_POST["pass"]));
    $_SESSION["authorized"] = TRUE;
    $_SESSION["user"] = $_POST["user"];
}catch(Exception $e){
    $_SESSION["authorized"] = FALSE;
    die("fail");
}
?>
