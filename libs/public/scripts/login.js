function redirect(path){
    var www_server = window.location.host;
    window.location.href = "http://"+www_server+path;
}

function login(){
    var user = $("section#login > input.login").val();
    var pass = $("section#login > input.passwd").val();
    var keep = $("input#keep").is(':checked');

    $.ajax({
        type: 'POST',
        url: "/auth",
        data: { "user": user, "pass": pass, "keep": keep },
        success: function(data){
            if($.trim(data) == "fail"){
                inputFailFeedback($("section#login"));
            }else{
                $("section#login").css("left", "-100%");
                setTimeout(function(){
                    window.location.replace(www_server);
                }, 150);
            }
        },
        error: function(request, status, err){
            alert("Error: "+err);
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
        url: "/register",
        data: { "user": user, "pass": pass },
        success: function(data){
            if($.trim(data) == "fail"){
                inputFailFeedback($("section#register"));
            }else{
                inputSuccessFeedback($("section#register"));
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
        type: 'POST',
        url: "/forgot",
        data: { "user": user, "pass": pass },
        success: function(data){
            if($.trim(data) == "fail"){
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

$(document).ready(function(){
    $(document).on("click", "section#login div#keep", viewEaster);
    $(document).on("click", "section#menu div#apply", viewRegister);
    $(document).on("click", "section#menu div#forgot", viewForgot);
    $(document).on("click", "section#menu div#docs", viewDocs);

    $(document).on("click", "section#login input.submit", login);
    $(document).on("click", "section#register input.submit", register);
    $(document).on("click", "section#forgot input.submit", forgot);
});
