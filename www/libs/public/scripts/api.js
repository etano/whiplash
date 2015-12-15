function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4()+s4()+'-'+s4()+'-'+s4()+'-'+s4()+'-'+s4()+s4()+s4();
}

/* orig version
function createClient(){
    var client_name = $("section#create-client > input#client_name").val();
    var client_id = $("section#create-client > input#client_id").val();
    var client_secret = $("section#create-client > input#client_secret").val();

    $.ajax({
        type: 'POST',
        url: api_addr+"/api/clients",
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
            inputFailFeedback($("section#create-client"));
        }
    });
}
*/

function createClient(){
    var user = $("section#create-client > input.login").val();
    var pass = $("section#create-client > input.passwd").val();


    $.ajax({
        type: 'POST',
        url: api_addr+"/api/users/token",
        data: { "grant_type"    : "password",
                "username"      : user,
                "password"      : pass,
                "client_id"     : www_client_id,
                "client_secret" : www_client_secret
              },
        success: function(data){
            if(data.error){
                inputFailFeedback($("section#create-client"));
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
                var client_name = $("section#create-client > input#client_name").val();
                var client_id = guid();
                $.ajax({
                    type: 'POST',
                    url: api_addr+"/api/clients",
                    data: { "client_name"   : client_name,
                            "client_id"     : client_id,
                            "access_token"  : session_token
                          },
                    success: function(data2){
                        if(data2.error){
                            inputFailFeedback($("section#create-client"));
                        }else{
                            var client_secret = data2.obj;
                            $("body").click();
                            $.ajax({
                                type: 'POST',
                                url: api_addr+"/api/users/token",
                                data: { "grant_type"    : "password",
                                        "username"      : user,
                                        "password"      : pass,
                                        "client_id"     : client_id,
                                        "client_secret" : client_secret
                                      },
                                success: function(data3){
                                    if(data3.error){
                                        inputFailFeedback($("section#create-client"));
                                    }else{
                                        appendToken(client_name, client_id, client_secret, data3.refresh_token, data3.access_token);
                                    }
                                },
                                error: function(request, status, err){
                                    inputFailFeedback($("section#create-client"));
                                }
                            });
                        }
                    },
                    error: function(request, status, err){
                        inputFailFeedback($("section#create-client"));
                    }
                });
            }
        },
        error: function(request, status, err){
            inputFailFeedback($("section#create-client"));
        }
    });
}

function fetchClients(){
    $.ajax({
        type: 'GET',
        url: api_addr+"/api/clients",
        data: { "access_token"  : session_token },
        success: function(data){
            if($.trim(data.status) == "OK"){
                for(var i = 0; i < data.objs.length; i++){
                    var t = data.objs[i];
                    appendToken(t.name, t.clientId, t.clientSecret, t.refreshToken, t.accessToken);
                }
            }
        },
        error: function(request, status, err){
            alert(err);
        }
    });
}

function deleteClient(){
    var token = $(this).parent();
    var client_id = token.find("div.client_id").text();

    // refresh existing token
    $.ajax({
        type: 'DELETE',
        url: api_addr+"/api/clients",
        data: { "access_token" : session_token,
                "client_id" : client_id
              },
        success: function(data){
            if($.trim(data.status) == "OK"){
                token.remove();
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

    /*
    // create new token
    if(refresh_value == "-"){
        var user = $("section#login > input.login").val(); // cookie login wouldn't work
        var pass = $("section#login > input.passwd").val();
        
        $.ajax({
            type: 'POST',
            url: api_addr+"/api/users/token",
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
                    token.find("div.access_value").text(data.access_token);
                }
            },
            error: function(request, status, err){
                alert(err);
            }
        });
        return;
    }
    */
    // refresh existing token
    $.ajax({
        type: 'POST',
        url: api_addr+"/api/users/token",
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
                token.find("div.access_value").text(data.access_token);
            }
        },
        error: function(request, status, err){
            alert(err);
        }
    });
}

function loadAPI(){
    $("section#api").html("<div id='info'></div><div class='add'>Add</div>");
    //appendToken("www", www_client_id, www_client_secret, refresh_token, session_token);
    appendToken("Monch", www_client_id, www_client_secret, refresh_token, www_client_secret, "online");
    appendToken("iPhone", www_client_id, www_client_secret, refresh_token, www_client_secret, "offline");
    appendToken("192.168.13.44", www_client_id, www_client_secret, refresh_token, www_client_secret, "online");
    fetchClients();
}

function appendToken(client_host, client_id, client_secret, refresh, access, state){
    if($("section#api > div#info > div.header").length == 0){
        $("section#api > div#info").append("<div class='header record'>"+
                                               "<div class='status'></div>" +
                                               "<div class='host'>Host</div>" +
                                               "<div class='client_id hidden'> Client Id </div>" +
                                               "<div class='client_secret hidden'> Client Secret </div>" +
                                               "<div class='refresh_value hidden'> Refresh Token </div>" +
                                               "<div class='access_value'> Access Token </div>" +
                                           "</div>");
    }
    $("section#api > div#info").append("<div class='row record'>"+
                                           "<div class='status'><div class='" + state + "'></div></div>" +
                                           "<div class='host'>" + client_host + "</div>" +
                                           "<div class='client_id hidden'>" + client_id + "</div>" +
                                           "<div class='client_secret hidden'>" + client_secret + "</div>" +
                                           "<div class='refresh_value hidden'>" + refresh + "</div>" +
                                           "<div class='access_value'>" + access + "</div>" +
                                           "<div class='actions'><div class='delete'>Delete</div><div class='auth auth-" + state + "'>Authorize</div></div>" +
                                       "</div>");
}

function viewCreateClientForm(){
    $("section#create-client > input:text").val('');
    $("section#create-client").css("display", "block");
    $(document).one("click", "body", function(){
        $("section#create-client").css("display", "none");
    });
}

$(document).ready(function(){
    $(document).on("click", "div.delete", deleteClient);
    $(document).on("click", "div.add", viewCreateClientForm);
    $(document).on("click", "section#create-client", function(e){ e.stopPropagation(); });
    $(document).on("click", "section#create-client input.submit", createClient);

    $(document).on("click", "section#api div.row > div.host, section#api div.row > div.access_value", function(){
        var input = $(this);
        var value = input.text();
        CopyToClipboard(value);
        input.text("Copied");
        setTimeout(function(){
            input.text(value);
        }, 500);
    });
});
