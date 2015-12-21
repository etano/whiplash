function addTag(){
    $("<div class='row'>"+
          "<div class='label'><input type='text' value='' placeholder='tag name'></div><div class='value'><input type='text' value='' placeholder='tag value'></div><div class='remove'>×</div>"+
      "</div>").insertAfter($(this).prev());
}

function initQModel(widget){
    roundCentering();
    if(readonly){
        widget.addClass("readonly");
        widget.find('input:text, select').prop("disabled", true);
    }
}

$(document).ready(function(){
    $(document).on("click", "widget.qmodel div.add-constraint", addTag);
});
