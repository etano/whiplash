var api_addr = "http://localhost:1337";
var session_token = "";
var refresh_token = "";
var www_client_id = "admin-www";
var www_client_secret = "c70de9b4b73029b87c08e6fa6710e7f87082573c";

function getCookie(cname){
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function setCookie(cname, cvalue, expires) {
    if(expires){
        var d = new Date();
        d.setTime(d.getTime() + expires*1000);
        var expires_utc = d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; expires=" + expires_utc;
    }else{
        document.cookie = cname + "=" + cvalue;
    }
}

function removeCookie(cname) {
    setCookie(cname, "", -1);
}

function redirect(path){
    var www_server = window.location.host;
    var prefix = "http://";
    setTimeout(function () {
        window.location.href = prefix+www_server+path;
    }, 500);
}

function onEnterDelegate(callback){
    return function(e){
        if(e.which == 13){
            e.preventDefault();
            callback();
            return false;
        }
    }
}

function inputFailFeedback(message) {
    $("#response").html(message);
}

function inputSuccessFeedback(message, path) {
    $("#response").html(message);
    redirect(path);
}

function logout() {
    removeCookie("session_token");
    removeCookie("refresh_token");
    redirect("/login");
}

$(document).ready(function() {
    session_token = getCookie("session_token");
    refresh_token = getCookie("refresh_token");

    $(document).on("click", "#logout", logout);
});
