var access_token;
var session_token;

function redirect(path){
    var www_server = window.location.host;
    window.location.href = "http://"+www_server+path;
}

function logout(){
    removeCookie("session_token");
    redirect("/");
}

function login(){
    var user = $("section#login > input.login").val();
    var pass = $("section#login > input.passwd").val();
    var keep = $("input#keep").is(':checked');

    $.ajax({
        type: 'POST',
        url: "/api/users/token",
        data: { "username"      : user, 
                "password"      : pass,
                "grant_type"    : "password",
                "client_id"     : "www-browser",
                "client_secret" : "fd5834157ee2388e65ec195cd74b670570a9f4cea490444ff5c70bb4fd8243ba"
              },
        success: function(data){
            if(data.error){
                inputFailFeedback($("section#login"));
            }else{
                session_token = data.access_token;
                if(keep) setCookie("session_token", session_token, data.expires_in);
                else setCookie("session_token", session_token);
                viewMain();
            }
        },
        error: function(request, status, err){
            inputFailFeedback($("section#login"));
        }
    });
}

function inputFailFeedback(input){
    if(input.hasClass("fast-transition")) return;
    input.addClass("fast-transition");
                           input.css("left", "55%");
    setTimeout(function(){ input.css("left", "48%");
    setTimeout(function(){ input.css("left", "50%");
    setTimeout(function(){ input.removeClass("fast-transition");
                         }, 100);
                         }, 100);
                         }, 100);
}

function inputSuccessFeedback(input){
    $("div#confirm").addClass('notransition');
    $("div#confirm").css("left", "150%");

    input.css("left", "-100%");
    $("div#confirm").css("display", "block");

    setTimeout(function(){
        $("div#confirm").removeClass('notransition');
        $("div#confirm").css("left", "50%");
    }, 50);
}

function register(){
    var user = $("section#register > input.login").val();
    var pass = $("section#register > input.passwd").val();

    $.ajax({
        type: 'POST',
        url: "/api/users",
        data: { "username": user, "password": pass, "access_token": access_token },
        success: function(data){
            if($.trim(data) != "OK"){
                inputFailFeedback($("section#register"));
            }else{
                viewLogin();
                //inputSuccessFeedback($("section#register")); // no email for now
            }
        },
        error: function(request, status, err){
            alert("Error: "+err);
        }
    });
}

function forgot(){
    var user = $("section#forgot > input.login").val();
    var pass = $("section#forgot > input.passwd").val();

    $.ajax({
        type: 'PUT',
        url: "/api/users/"+user,
        data: { "user": user, "pass": pass },
        success: function(data){
            if($.trim(data) != "OK"){
                inputFailFeedback($("section#forgot"));
            }else{
                inputSuccessFeedback($("section#forgot"));
            }
        },
        error: function(request, status, err){
            alert("Error: "+err);
        }
    });
}

function viewLogin(){
    if($("section#login").position().left > 0) return;

    $("section#register, section#forgot, div#confirm").css("left", "-50%");
    $("section#login").addClass('notransition');
    $("section#login").css("left", "150%");
    setTimeout(function(){
        $("section#login").removeClass('notransition');
        $("section#login").css("left", "50%");
    }, 50);
}

function viewRegister(){
    if($("section#register").position().left > 0) return;

    $("section#login, section#forgot, div#confirm").css("left", "-50%");
    $("section#register").addClass('notransition');
    $("section#register").css("left", "150%");
    setTimeout(function(){
        $("section#register").removeClass('notransition');
        $("section#register").css("left", "50%");
    }, 50);
}

function viewForgot(){
    if($("section#forgot").position().left > 0) return;

    $("section#login, section#register, div#confirm").css("left", "-50%");
    $("section#forgot").addClass('notransition');
    $("section#forgot").css("left", "150%");
    setTimeout(function(){
        $("section#forgot").removeClass('notransition');
        $("section#forgot").css("left", "50%");
    }, 50);
}

function viewEaster(){
    $("section#login div#keep > span").text("Of course we will ");
}

function viewDocs(){
    redirect("/docs");
}

function viewMain(){
    $("section#login").css("left", "-50%");
    $("section#menu > div#logout").css("display", "inline-block");
    $("section#menu > div#forgot").css("display", "none");
    $("section#menu > div#apply").css("display", "none");
    
    $("section#info").css("left", "50%");
    $("section#info").html("<div>Session token: " + session_token + "</div>");
}

$(document).ready(function(){
    $(document).on("click", "section#login div#keep", viewEaster);
    $(document).on("click", "section#menu div#apply", viewRegister);
    $(document).on("click", "section#menu div#forgot", viewForgot);
    $(document).on("click", "section#menu div#docs", viewDocs);
    $(document).on("click", "section#menu div#logout", logout);

    $(document).on("click", "section#login input.submit", login);
    $(document).on("click", "section#register input.submit", register);
    $(document).on("click", "section#forgot input.submit", forgot);

    access_token = getCookie("access_token");
    session_token = getCookie("session_token");
    if(session_token) setTimeout(function(){ viewMain(); }, 1000);
});
