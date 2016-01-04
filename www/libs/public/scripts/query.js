var executables;

function setQExecutables(){
    if(executables) return;
    $("section#compose-query select#container").attr("disabled", "true");
    $.ajax({
        type: 'GET',
        url: api_addr+"/api/executables/",
        data: { "access_token"  : session_token },
        success: function(data){
            executables = data.result;
            for(var i = 0; i < executables.length; i++)
                $("section#compose-query select#container").append("<option value='"+executables[i].name+"'>"+executables[i].name+"</option>");
            $("section#compose-query select#container").removeAttr("disabled");
            loadQParams();
        },
        error: function(request, status, err){
            alert(err);
        }
    });
}

function loadQParams(){
    var executable = $("section#compose-query select#container").val();
    var executable_json = $.grep(executables, function(e){ return e.name == executable; })[0];
    var parameters = executable_json.params.optional.concat(executable_json.params.required);

    var param_json = {};
    for(var i = 0; i < parameters.length; i++){
        param_json[parameters[i]] = "";
    }
    $("section#compose-query textarea#parameters").val(JSON.stringify(param_json));
}

function getQFilters(cb){
    var widget = $("section#compose-query");
    var executable = widget.find("select#container");
    var model = widget.find("textarea#model");
    var params = widget.find("textarea#parameters");
    var filters = {'executable':JSON.stringify({"name": executable.val()}), 'model': model.val(), 'params': params.val()};

    // Check filters are proper JSON
    var bad_filters = false;
    for (var key in filters) {
        try {
            filters[key] = JSON.parse(filters[key]);
            eval(key+".css('color','black')");
        } catch(e) {
            eval(key+".css('color','red')");
            bad_filters = true;
        }
    }

    if (bad_filters) {
        widget.find("span#n_queries").text(0);
        widget.find("span#n_results").text(0);
        widget.find("div#view_download").addClass("hidden");
    } else {
        cb(filters);
    }
}

function updateQCount(){
    var widget = $("section#compose-query");
    getQFilters(function(filters) {
        // Count matching properties
        $.ajax({
            type: 'GET',
            url: api_addr+"/api/queries/stats",
            data: { "access_token"  : session_token,
                    "filters" : JSON.stringify(filters)
            },
            success: function(data){
                var stats = data.result;
                widget.find("span#n_queries").text(stats.total);
                widget.find("span#n_results").text(stats.resolved);
            },
            error: function(request, status, err){
                alert(err);
            }
        });
    });
}

function viewQ(){
    getQFilters(function(filters) {
        var data = {"access_token":session_token, "filters":JSON.stringify(filters)};
        window.location = api_addr+"/api/queries?"+$.param(data);
    });
}

function downloadQResults(){
    getQFilters(function(filters) {
        var data = {"access_token":session_token, "filters":JSON.stringify(filters)};
        window.location = api_addr+"/api/queries/results?"+$.param(data);
    });
}

function composeQuery(){
    transition($("section#compose-query"));
    indicateMenu("compose-query");
    setQExecutables();
    roundCentering();
}

$(document).ready(function(){
    $(document).on("change", "section#compose-query select#container", loadQParams);
    $(document).on("change", "section#compose-query select#container", updateQCount);
    $(document).on("change", "section#compose-query textarea", updateQCount);
    $(document).on("click", "section#compose-query div#queries_results div#queries", viewQ);
    $(document).on("click", "section#compose-query div#queries_results div#results", downloadQResults);
});
