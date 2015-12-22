var executables;

function fetchQParams(){
    if(executables) return;
    $("widget.qtable select").attr("disabled", "true");
    $.ajax({
        type: 'GET',
        url: api_addr+"/api/executables/info",
        data: { "access_token"  : session_token },
        success: function(data){
            executables = data.result;
            for(var i = 0; i < executables.length; i++)
                $("widget.qtable select").append("<option value='"+executables[i].name+"'>"+executables[i].name+"</option>");
            $("widget.qtable select").removeAttr("disabled");
        },
        error: function(request, status, err){
            alert(err);
        }
    });
}

function loadQParams(){
    var widget = $(this).closest("widget.qtable");
    var executable = $(this).val();
    var parameters = $.grep(executables, function(e){ return e.name == executable; })[0].params;

    widget.find("div.parameter").remove();
    for(var i = 0; i < parameters.length; i++){
        var param = $("<div class='row parameter'></div>");
        param.append("<div class='label'><input type='text' value='' placeholder='filter (empty)'>"+ parameters[i] +":</div>");
        param.insertBefore(widget.find("div.table div.submit").parent());
    }
}

function submitQTable(){
    var widget = $(this).closest("widget.qtable");
    var query = { model : widget.find("input.model").val(), container : widget.find("select.container").val(), parameters : [ ] };
    widget.find("div.table div.parameter").each(function(i){
        query.parameters.push({ name  : $(this).find("div.label").text(), value : $(this).find("div.label > input").val() });
    });

    //alert(JSON.stringify(query));
    transition($("section#explore"));

    $.ajax({
        type: 'GET',
        url: api_addr+"/api/properties/search",
        data: { "access_token"  : session_token, "query" : query },
        success: function(data){
            if(data.result.count == 0) {
                $("section#explore div#info").html("No details to explore at the moment.");
            } else {
                $("section#explore div#info").empty();
                for(var i = 0; i < data.result.count; i++){
                    var record = "<div class='record'>" +
                                 "<div class='shortcuts'><div class='button log'>Log</div></div>" +
                                 "<div class='number'>"      + data.result.runs[i].id    + "</div>" +
                                 "<div class='app'>App: "     + data.result.runs[i].app   + "</div>" +
                                 "<div class='model'>Model: " + data.result.runs[i].model + "</div>";
    
                    for(var p = 0; p < data.result.runs[i].params.length; p++) record += "<div class='param'>" + data.result.runs[i].params[p].name + ": " +
                                                                                                                 data.result.runs[i].params[p].value + "</div>";
                    record += "</div>";
                    $("section#explore div#info").append(record);
                }
            }
        },
        error: function(request, status, err){
            alert(err);
        }
    });
}

function initQTable(widget){
    fetchQParams();
    roundCentering();
}

function composeQuery(){
    transition($("section#compose-query"));
    indicateMenu("compose-query");
}

$(document).ready(function(){
    $(document).on("change", "widget.qtable select.container", loadQParams);
    $(document).on("click", "widget.qtable div.submit", submitQTable);
});
