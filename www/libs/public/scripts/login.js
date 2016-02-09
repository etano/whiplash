var www_client_id = "www-browser";
var www_client_secret = "fd5834157ee2388e65ec195cd74b670570a9f4cea490444ff5c70bb4fd8243ba";

function logout(){
    removeCookie("session_token");
    removeCookie("refresh_token");
    viewLogin();
}

function login(){
    var user = $("section#login > input.login").val();
    var pass = $("section#login > input.passwd").val();
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
                inputFailFeedback($("section#login"));
            }else{
                session_token = data.access_token;
                refresh_token = data.refresh_token;
                setCookie("session_token", session_token);
                setCookie("refresh_token", refresh_token);
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
    var email = $("section#register > input.email").val();

    $.ajax({
        type: 'POST',
        url: api_addr+"/api/users",
        data: { "username": user, "password": pass, "email": email, "server_token": server_token },
        success: function(data){
            if($.trim(data) != "OK"){
                inputFailFeedback($("section#register"));
            }else{
                $.ajax({
                    type: 'POST',
                    url: api_addr+"/api/users/token",
                    data: { "grant_type"    : "password",
                            "username"      : user,
                            "password"      : pass,
                            "client_id"     : www_client_id,
                            "client_secret" : www_client_secret
                          },
                    success: function(data2){
                        if(data2.error){
                            inputFailFeedback($("section#register"));
                        }else{
                            session_token = data2.access_token;
                            refresh_token = data2.refresh_token;
                            $.ajax({
                                type: 'POST',
                                url: api_addr+"/api/clients",
                                data: { "client_name"   : user+"-python",
                                        "client_id"     : user+"-python",
                                        "client_secret" : pass,
                                        "access_token"  : session_token
                                      },
                                success: function(data3){
                                    if(data3.error){
                                        inputFailFeedback($("section#register"));
                                    }else{
                                        $.ajax({
                                            type: 'POST',
                                            url: api_addr+"/api/clients",
                                            data: { "client_name"   : user+"-scheduler",
                                                    "client_id"     : user+"-scheduler",
                                                    "client_secret" : pass,
                                                    "access_token"  : session_token
                                                  },
                                            success: function(data4){
                                                if(data4.error){
                                                    inputFailFeedback($("section#register"));
                                                }else{
                                                    $.ajax({
                                                        type: 'POST',
                                                        url: api_addr+"/api/users/token",
                                                        data: { "grant_type"    : "password",
                                                                "username"      : user,
                                                                "password"      : pass,
                                                                "client_id"     : user+"-scheduler",
                                                                "client_secret" : pass
                                                              },
                                                        success: function(data5){
                                                            if(data5.error){
                                                                inputFailFeedback($("section#register"));
                                                            }else{
                                                                transition($("section#login"));
                                                                // TODO: email
                                                            }
                                                        },
                                                        error: function(request, status, err){
                                                            inputFailFeedback($("section#register"));
                                                        }
                                                    });
                                                }
                                            },
                                            error: function(request, status, err){
                                                inputFailFeedback($("section#register"));
                                            }
                                        });
                                    }
                                },
                                error: function(request, status, err){
                                    inputFailFeedback($("section#register"));
                                }
                            });
                        }
                    },
                    error: function(request, status, err){
                        inputFailFeedback($("section#register"));
                    }
                });
            }
        },
        error: function(request, status, err){
            inputFailFeedback($("section#register"));
        }
    });
}

function forgot(){
    var user = $("section#forgot > input.login").val();
    var pass = $("section#forgot > input.passwd").val();

    $.ajax({
        type: 'PUT',
        url: api_addr+"/api/users/"+user,
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

