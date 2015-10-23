var server_token;
var session_token;
var refresh_token;

var www_client_id = "www-browser";
var www_client_secret = "fd5834157ee2388e65ec195cd74b670570a9f4cea490444ff5c70bb4fd8243ba";

function redirect(path){
    var www_server = window.location.host;
    var prefix = "https://";
    if(!location.port) prefix = "http://";
    window.location.href = prefix+www_server+path;
}

function transition(target, source){
    target.addClass('notransition');
    target.css("left", "150%");

    source.css("left", "-100%");
    target.css("display", "block");

    setTimeout(function(){
        target.removeClass('notransition');
        target.css("left", "50%");
    }, 50);
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

function logout(){
    removeCookie("session_token");
    removeCookie("refresh_token");
    redirect("/");
}

function login(){
    var user = $("section#login > input.login").val();
    var pass = $("section#login > input.passwd").val();
    var keep = $("input#keep").is(':checked');

    $.ajax({
        type: 'POST',
        url: "/api/users/token",
        data: { "grant_type"    : "password",
                "username"      : user,
                "password"      : pass,
                "client_id"     : www_client_id,
                "client_secret" : www_client_secret
              },
        success: function(data){
            if(data.error){
                inputFailFeedback($("section#login"));
            }else{
                session_token = data.access_token;
                refresh_token = data.refresh_token;
                if(keep){
                    setCookie("session_token", session_token, data.expires_in);
                    setCookie("refresh_token", refresh_token, data.expires_in);
                }else{
                    setCookie("session_token", session_token);
                    setCookie("refresh_token", refresh_token);
                }
                viewMain();
            }
        },
        error: function(request, status, err){
            inputFailFeedback($("section#login"));
        }
    });
}

function register(){
    var user = $("section#register > input.login").val();
    var pass = $("section#register > input.passwd").val();

    $.ajax({
        type: 'POST',
        url: "/api/users",
        data: { "username": user, "password": pass, "server_token": server_token },
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

function createClient(){
    var client_name = $("section#create-client > input#client_name").val();
    var client_id = $("section#create-client > input#client_id").val();
    var client_secret = $("section#create-client > input#client_secret").val();

    $.ajax({
        type: 'POST',
        url: "/api/clients",
        data: { "client_id"     : client_id,
                "client_name"   : client_name,
                "client_secret" : client_secret,
                "access_token"  : session_token
              },
        success: function(data){
            if($.trim(data) != "OK"){
                inputFailFeedback($("section#create-client"));
            }else{
                $("body").click();
                appendToken(client_name, client_id, client_secret, "-", "-");
            }
        },
        error: function(request, status, err){
            alert(err);
        }
    });
}

function fetchClients(){
    $.ajax({
        type: 'GET',
        url: "/api/clients",
        data: { "access_token"  : session_token },
        success: function(data){
            if($.trim(data.status) == "OK"){
                for(var i = 0; i < data.objs.length; i++){
                    var t = data.objs[i];
                    appendToken(t.name, t.clientId, t.clientSecret, "-", "-");
                }
            }
        },
        error: function(request, status, err){
            alert(err);
        }
    });
}

function refreshToken(){
    var token = $(this).parent();
    var client_id = token.find("div.client_id").text();
    var client_secret = token.find("div.client_secret").text();
    var refresh_value = token.find("div.refresh_value").text();

    // create new token
    if(refresh_value == "-"){
        var user = $("section#login > input.login").val(); // cookie login wouldn't work
        var pass = $("section#login > input.passwd").val();
        
        $.ajax({
            type: 'POST',
            url: "/api/users/token",
            data: { "grant_type"    : "password",
                    "username"      : user,
                    "password"      : pass,
                    "client_id"     : client_id,
                    "client_secret" : client_secret
                  },
            success: function(data){
                if(data.error){
                    alert(data.error);
                }else{
                    token.find("div.refresh_value").text(data.refresh_token);
                    token.find("div.session_value").text(data.access_token);
                }
            },
            error: function(request, status, err){
                alert(err);
            }
        });
        return;
    }

    // refresh existing token
    $.ajax({
        type: 'POST',
        url: "/api/users/token",
        data: { "grant_type"    : "refresh_token",
                "client_id"     : client_id,
                "client_secret" : client_secret,
                "refresh_token" : refresh_value
              },
        success: function(data){
            if(data.error){
                alert(data.error);
            }else{
                if(client_id == "www-browser"){
                    session_token = data.access_token;
                    refresh_token = data.refresh_token;
                    setCookie("session_token", session_token, data.expires_in);
                    setCookie("refresh_token", refresh_token, data.expires_in);
                }

                token.find("div.refresh_value").text(data.refresh_token);
                token.find("div.session_value").text(data.access_token);
            }
        },
        error: function(request, status, err){
            alert(err);
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

function viewStats(){
    transition($("section#stats"), $("section#access"));
    loadStats();
}
function viewMain(){
    $("section#login").css("left", "-50%");
    $("section#menu > div#logout").css("display", "inline-block");
    $("section#menu > div#access").css("display", "inline-block");
    $("section#menu > div#stats").css("display", "inline-block");
    $("section#menu > div#forgot").css("display", "none");
    $("section#menu > div#apply").css("display", "none");
    $("section#access").css("left", "50%");
    
    loadAccess();
}

function viewAccess(){
    transition($("section#access"), $("section#stats"));
    loadAccess();
}

function viewCreateClientForm(){
    $("section#create-client > input:text").val('');
    $("section#create-client").css("display", "block");
    $(document).one("click", "body", function(){
        $("section#create-client").css("display", "none");
    });
}

function loadStats(){
    $("section#stats").html("<div id='info'></div>");
    $.ajax({
        type: 'GET',
        url: "/api/properties/total_time",
        data: { "access_token"  : session_token },
        success: function(data){
            var time = data.total_time;
            $("section#stats div#info").html("Time for completion estimate: " + time);
        },
        error: function(request, status, err){
            alert(err);
        }
    });
}

function loadAccess(){
    $("section#access").html("<div id='token-table'></div><action id='create-client'>Create client</action>");
    $("section#access > div#token-table").append("<div class='header'>"+
                                                   "<div class='type'>Type</div>" +
                                                   "<div class='client_id'> Client Id </div>" +
                                                   "<div class='client_secret'> Client Secret </div>" +
                                                   "<div class='refresh_value'> Refresh Token </div>" + 
                                                   "<div class='session_value'> Session Token </div>" + 
                                               "</div>");
    appendToken("www", www_client_id, www_client_secret, refresh_token, session_token);
    fetchClients();
}

function appendToken(client_name, client_id, client_secret, refresh, session){
    $("section#access > div#token-table").append("<div class='token'>"+
                                                   "<div class='type'>" + client_name + "</div>" +
                                                   "<div class='client_id'>" + client_id + "</div>" +
                                                   "<div class='client_secret'>" + client_secret + "</div>" +
                                                   "<div class='refresh_value'>" + refresh + "</div>" + 
                                                   "<div class='session_value'>" + session + "</div>" + 
                                                   "<action class='refresh'>↻</action>" +
                                               "</div>");
}

$(document).ready(function(){
    $(document).on("click", "section#login div#keep", viewEaster);
    $(document).on("click", "section#menu div#apply", viewRegister);
    $(document).on("click", "section#menu div#forgot", viewForgot);
    $(document).on("click", "section#menu div#docs", viewDocs);
    $(document).on("click", "section#menu div#access", viewAccess);
    $(document).on("click", "section#menu div#stats", viewStats);
    $(document).on("click", "section#menu div#logout", logout);

    $(document).on("click", "section#login input.submit", login);
    $(document).on("click", "section#register input.submit", register);
    $(document).on("click", "section#forgot input.submit", forgot);

    $(document).on("click", "action.refresh", refreshToken);
    $(document).on("click", "action#create-client", viewCreateClientForm);
    $(document).on("click", "section#create-client", function(e){ e.stopPropagation(); });
    $(document).on("click", "section#create-client input.submit", createClient);

    $(document).on("click", "section#access > div#token-table > div.token > div", function(){
        var input = $(this);
        var value = input.text();
        CopyToClipboard(value);
        input.text("Copied");
        setTimeout(function(){
            input.text(value);
        }, 500);
    });

    server_token = getCookie("server_token");
    session_token = getCookie("session_token");
    refresh_token = getCookie("refresh_token");
    if(session_token) setTimeout(function(){ viewMain(); }, 1000);

    if(location.href.indexOf("https://") == -1 && !location.port)
        location.href = location.href.replace("http://", "https://"); 
});
