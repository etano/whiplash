function register() {
    var pass = $("input#password").val();
    var pass2 = $("input#password2").val();
    if (pass !== pass2) {
        inputFailFeedback("Passwords do not match");
    } else {
        // Create new user
        $.ajax({
            type: 'POST',
            url: api_addr+"/api/users/admin",
            data: { "password": pass },
            success: function(data) {
                if ($.trim(data) != "OK") {
                    inputFailFeedback(data);
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
}

$(document).ready(function() {
    $(document).on("click", "input#submit", register);
    $(document).on("keypress", "input#submit", onEnterDelegate(register));
});
