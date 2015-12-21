
function addParameter(){
    var container = $(this).closest("div.table");
    var len = container.children().length;
    $("<div class='row'>"+
          "<div class='label'><input type='text' value='' placeholder='parameter name'>Parameter #"+len+"</div><div class='remove'>×</div>"+
      "</div>").insertBefore($(this));
}

function initQContainer(widget){
    roundCentering();
    if(readonly){
        widget.addClass("readonly");
        widget.find('input:text, select').prop("disabled", true);
    }
}

$(document).ready(function(){
    $(document).on("click", "widget.qcontainer div.add-param", addParameter);
});
