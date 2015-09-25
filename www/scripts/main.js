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
});
                                
