var api_addr;
var server_token;
var session_token;
var refresh_token;

function redirect(path){
    var www_server = window.location.host;
    var prefix = "http://";
    window.location.href = prefix+www_server+path;
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

function indicateMenu(id){
    $("section#menu div.active").removeClass("active");
    $("section#menu div#"+id).addClass("active");

    if( $(window).scrollTop() > 92 ){
        $(window).scrollTop(0);
        $("section#menu, section#tagline, div#title").css({top: "-=100px"});
        $("section#menu, section#tagline, div#title").animate({top: "+=100px"}, "fast");
    }
}

function makeWidgets(view){
    view.find("widget").each(function(){
        var clone = $("widget."+$(this).attr("class").split(' ')[0]+".prototype").clone(); // using first class
        var constructor = clone.attr("constructor");
        clone.removeClass("prototype");
        clone.insertAfter($(this));
        $(this).remove();

        if(constructor) eval(constructor+"(clone);");
    });
}

function transition(target){
    if(target.position().left > 0) return;
    indicateMenu(target.attr("id"));
    makeWidgets(target);
    $(".transit").css("left", "-50%");

    target.addClass('notransition');
    target.css("left", "150%");

    setTimeout(function(){
        target.removeClass('notransition');
        target.css("left", "50%");
    }, 50);
}

function viewDocs(){
    redirect("/docs/");
}

function viewQueries(){
    transition($("section#view-queries"));
    loadQueries();
}

function viewMain(){
    $("section#menu > div.hidden").removeClass("hidden");
    $("section#menu > div#login").addClass("hidden");
    $("section#menu > div#register").addClass("hidden");
    composeQuery();
}

function viewLogin(){
    $("section#menu > div.hidden").removeClass("hidden");
    $("section#menu > div#logout").addClass("hidden");
    $("section#menu > div#view-queries").addClass("hidden");
    $("section#menu > div#compose-query").addClass("hidden");
    transition($("section#login"));
}

function roundCentering(){
    $("section.centered").each(function(i){
        var y = Math.ceil($(this).height()/2),
            x = Math.ceil($(this).width()/2);
        
        $(this).css('transform', 'translateX(-' + x + 'px) translateY(-' + y + 'px)');
        $(this).css('-webkit-transform', 'translateX(-' + x + 'px) translateY(-' + y + 'px)');
    });
}

$(document).ready(function(){
    roundCentering();

    $(document).on("click", "div#title, section#tagline",     function(){ redirect("/"); });
    $(document).on("click", "section#login div#forgot",       function(){ transition($("section#forgot"));       });
    $(document).on("click", "section#menu div#login",         function(){ transition($("section#login"));        });
    $(document).on("click", "section#menu div#register",      function(){ transition($("section#register"));     });
    $(document).on("click", "section#menu div#view-queries",  viewQueries);
    $(document).on("click", "section#menu div#compose-query", composeQuery);
    $(document).on("click", "section#menu div#docs",          viewDocs);

    $(document).on("click", "section#menu div#logout", logout);
    $(document).on("click", "section#login input.submit", login);
    $(document).on("click", "section#register input.submit", register);
    $(document).on("click", "section#forgot input.submit", forgot);

    server_token = getCookie("server_token");
    api_addr = getCookie("api_addr");

    session_token = getCookie("session_token");
    refresh_token = getCookie("refresh_token");
    if(session_token) setTimeout(function(){ viewMain(); }, 1000);
    else setTimeout(function(){ viewLogin(); }, 100);
    //viewMain();
});
