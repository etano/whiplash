function login() {
    var user = $("input#username").val();
    var pass = $("input#password").val();
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
            if(data.error) {
                inputFailFeedback("Bad username/password");
            } else {
                session_token = data.access_token;
                refresh_token = data.refresh_token;
                setCookie("session_token", session_token);
                setCookie("refresh_token", refresh_token);
                inputSuccessFeedback("Success!", "/users/"+user+"?access_token="+session_token);
            }
        },
        error: function(request, status, err){
            inputFailFeedback("Bad username/password");
        }
    });
}

$(document).ready(function() {
    $(document).on("click", "input#submit", login);
    $(document).on("keypress", "input#submit", onEnterDelegate(login));
});
