function loadQParams(){
    var widget = $(this).closest("widget.qtable");
    widget.find("div.parameter").remove();

    $.ajax({
        type: 'GET',
        url: api_addr+"/api/jobs/13/table", // replace me with the real back-end hook
        data: { "access_token"  : session_token },
        success: function(data){
            var query = data.result.query;

            for(var i = 0; i < query.parameters.length; i++){
                var param = $("<div class='row parameter'></div>");
                param.append("<div class='label'><input type='text' value='' placeholder='filter (empty)'>"+ query.parameters[i][0].value +":</div>");
                param.insertBefore(widget.find("div.table div.submit").parent());
            }
        },
        error: function(request, status, err){
            alert(err);
        }
    });
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
    return;
    alert(JSON.stringify(query));
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
