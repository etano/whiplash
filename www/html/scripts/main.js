var loading = false;
var loading_lock = false;

function stopProgress(){
    loading = false;
}

function startProgress(){
    if(!loading){
        loading = true;
        if(loading_lock == true) return;
        loading_lock = true;
        showProgress();
    }
}

function showProgress(){
    $("section#upload").animate({opacity: .3}, 400).animate({opacity: 1}, 400, function(){
        if(loading) showProgress();
        else loading_lock = false;
    });
}

function login(){
    var user = $("form#login > input#login-user").val();
    var pass = $("form#login > input#login-pass").val();
    $.ajax({
        type: 'POST',
        url: "login.php",
        data: {"user":user,"pass":pass},
        success: function(data){
            if( $.trim(data) == "fail" ){
                alert("user/pass not verified");
            }else{
                $("section#login").css("opacity",0);
                $("section#login").css("z-index",0);
                $("section#upload").css("z-index",100);
           }
        },
        error: function(request, status, err) {
            alert("err: "+err);
        }
    });
   
}

function upload(){
    var filelist = $("form#upload").find("input.file")[0].files || []; if(filelist.length == 0) return;
    var formData = new FormData();
    formData.append("myfile", filelist[0]);

    $.ajax({
        type: 'POST',
        url: "upload.php",
        data: formData,
        success: function(data){
            if( $.trim(data) == "success" ){
                $("label").html("Upload complete");
                $("label").addClass("complete");
            }else{
                $("label").html("Upload failed");
                $("label").addClass("failed");
            }
            $("form#upload")[0].reset();
        },
        error: function(request, status, err) {
            $("label").html("Upload failed");
            $("label").addClass("failed");
        },
        contentType: false,
        processData: false,
        cache: false
    });

}

$(document).ready(function(){
    $(document).bind('ajaxStart', startProgress);
    $(document).bind('ajaxStop', stopProgress);
    $(document).on("click", "label", function(){ $(this).removeClass("complete"); $(this).removeClass("failed"); $(this).text("Upload dataset"); });
    $(document).on("click", "input#login-submit", login);
});
                                
