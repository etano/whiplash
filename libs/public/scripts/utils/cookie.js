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
    document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}
