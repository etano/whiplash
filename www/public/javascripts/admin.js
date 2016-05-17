function delete_user() {
    var user = this.id;

    $.ajax({
        type: 'DELETE',
        url: api_addr+"/api/users",
        data: {
            "filter": JSON.stringify({"username": user}),
            "access_token": session_token
        },
        success: function(data) {
            get_users();
        },
        error: function(request, status, err) {
            $("#users").html("Trouble connecting to server");
        }
    });
}

function get_users() {
    $.ajax({
        type: 'GET',
        url: api_addr+"/api/users",
        data: {
            "filter": {},
            "fields": [],
            "access_token": session_token
        },
        success: function(data) {
            if (data.result) {
                if (data.result.length > 0) {
                    var users_HTML = "<table>";
                    for (var i=0; i<data.result.length; i++) {
                        var username = data.result[i].username;
                        if (username !== "admin") {
                            users_HTML += "<tr><td>"+username+" <a href=\"#\" id=\""+username+"\" class=\"user-delete\">delete</a></td></tr>";
                        }
                    }
                    users_HTML += "</table>";
                    $("#users").html(users_HTML);
                } else {
                    $("#users").html("No users found");
                }
            } else {
                $("#users").html("No users found");
            }
        },
        error: function(request, status, err) {
            $("#users").html("Trouble connecting to server");
        }
    });
}

function create_user() {
    var user = $("input#username").val();
    var pass = $("input#password").val();
    var pass2 = $("input#password2").val();

    if (pass !== pass2) {
       inputFailFeedback("Passwords do not match");
    } else if (!user || !pass) {
       inputFailFeedback("You must fill out all fields");
    } else {
        // Create new user
        $.ajax({
            type: 'POST',
            url: api_addr+"/api/users",
            data: {
                "username": user,
                "password": pass,
                "email": user+"@whiplash.ethz.ch",
                "access_token": session_token
            },
            success: function(data) {
                if ($.trim(data) != "OK") {
                    inputFailFeedback("Bad input");
                } else {
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
                                inputFailFeedback("Trouble connecting to server 6");
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
                                            inputFailFeedback("Trouble connecting to server 5");
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
                                                        inputFailFeedback("Trouble connecting to server 4");
                                                    } else {
                                                        // Redirect
                                                        inputSuccessFeedback("Success!","/users/admin?access_token="+session_token);
                                                    }
                                                },
                                                error: function(request, status, err) {
                                                    inputFailFeedback("Trouble connecting to server 3");
                                                }
                                            });
                                        }
                                    },
                                    error: function(request, status, err) {
                                        inputFailFeedback("Trouble connecting to server 2");
                                    }
                                });
                            }
                        },
                        error: function(request, status, err) {
                            inputFailFeedback("Trouble connecting to server 1");
                        }
                    });
                }
            },
            error: function(request, status, err) {
                inputFailFeedback("Trouble connecting to server 0");
            }
        });
    }
}

$(document).ready(function() {
    $(document).on("click", "input#submit", create_user);
    $(document).on("keypress", "input#submit", onEnterDelegate(create_user));

    $(document).on("click", "#users .user-delete", delete_user);
    get_users();
});
