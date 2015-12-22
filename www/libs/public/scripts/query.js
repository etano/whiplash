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
    var query = { model : widget.find("input.model").val(),
                  container : widget.find("select.container").val(),
                  parameters : [ ]
                };
    widget.find("div.table div.parameter").each(function(i){
        query.parameters.push({ name  : $(this).find("div.label").text(),
                                value : $(this).find("div.label > input").val() });
    });

    loadExplore();
    alert(JSON.stringify(query));
    return;

    $.ajax({
        type: 'POST',
        url: api_addr+"/api/search", // implement me
        data: { "access_token"  : session_token, "query" : query },
        success: function(data){
            alert(data);
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
