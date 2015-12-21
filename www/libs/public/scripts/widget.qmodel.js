function addTag(){

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
