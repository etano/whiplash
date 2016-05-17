function register() {
    var email = $("input#email").val();
    var pass = $("input#password").val();
    var user = email;

    // Create new user
    $.ajax({
        type: 'POST',
        url: api_addr+"/api/users",
        data: { "username": user, "password": pass, "email": email, "server_token": server_token },
        success: function(data) {
            alert(data);
            if ($.trim(data) != "OK") {
                inputFailFeedback("Bad input");
            } else {
                // Create user www tokens
                $.ajax({
                    type: 'POST',
                    url: api_addr+"/api/users/token",
                    data: {
                        "grant_type"    : "password",
                        "username"      : user,
                        "password"      : pass,
                        "client_id"     : www_client_id,
                        "client_secret" : www_client_secret
                    },
                    success: function(data) {
                        if (data.error) {
                            inputFailFeedback("Trouble connecting to server");
                        } else {
                            // Create user python client
                            session_token = data.access_token;
                            refresh_token = data.refresh_token;
                            $.ajax({
                                type: 'POST',
                                url: api_addr+"/api/clients",
                                data: {
                                    "client_name"   : user+"-python",
                                    "client_id"     : user+"-python",
                                    "client_secret" : pass,
                                    "access_token"  : session_token
                                },
                                success: function(data) {
                                    if (data.error) {
                                        inputFailFeedback("Trouble connecting to server");
                                    } else {
                                        // Create user scheduler client
                                        $.ajax({
                                            type: 'POST',
                                            url: api_addr+"/api/clients",
                                            data: {
                                                "client_name"   : user+"-scheduler",
                                                "client_id"     : user+"-scheduler",
                                                "client_secret" : pass,
                                                "access_token"  : session_token
                                            },
                                            success: function(data){
                                                if (data.error) {
                                                    inputFailFeedback("Trouble connecting to server");
                                                } else {
                                                    // Create user scheduler tokens
                                                    $.ajax({
                                                        type: 'POST',
                                                        url: api_addr+"/api/users/token",
                                                        data: {
                                                            "grant_type"    : "password",
                                                            "username"      : user,
                                                            "password"      : pass,
                                                            "client_id"     : user+"-scheduler",
                                                            "client_secret" : pass
                                                        },
                                                        success: function(data) {
                                                            if (data.error) {
                                                                inputFailFeedback("Trouble connecting to server");
                                                            } else {
                                                                // Redirect to login
                                                                inputSuccessFeedback("Success!","/login");
                                                            }
                                                        },
                                                        error: function(request, status, err) {
                                                            inputFailFeedback("Trouble connecting to server");
                                                        }
                                                    });
                                                }
                                            },
                                            error: function(request, status, err) {
                                                inputFailFeedback("Trouble connecting to server");
                                            }
                                        });
                                    }
                                },
                                error: function(request, status, err) {
                                    inputFailFeedback("Trouble connecting to server");
                                }
                            });
                        }
                    },
                    error: function(request, status, err) {
                        inputFailFeedback("Trouble connecting to server");
                    }
                });
            }
        },
        error: function(request, status, err) {
            inputFailFeedback("Trouble connecting to server");
        }
    });
}

$(document).ready(function() {
    $(document).on("click", "input#submit", register);
    $(document).on("keypress", "input#submit", onEnterDelegate(register));
});
