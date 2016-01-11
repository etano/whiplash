var executables;

function setQExecutables(){
    if(executables) return;
    $("section#compose-query select#executable_name").attr("disabled", "true");
    $.ajax({
        type: 'GET',
        url: api_addr+"/api/executables/",
        data: { "access_token"  : session_token },
        success: function(data){
            executables = data.result;
            for(var i = 0; i < executables.length; i++)
                $("section#compose-query select#executable_name").append("<option value='"+executables[i].name+"'>"+executables[i].name+"</option>");
            $("section#compose-query select#executable_name").removeAttr("disabled");
            loadQParams();
        },
        error: function(request, status, err){
            alert(err);
        }
    });
}

function loadQParams(){
    var executable_name = $("section#compose-query select#executable_name").val();
    var executable_json = $.grep(executables, function(e){ return e.name === executable_name; })[0];
    var params = executable_json.params.optional.concat(executable_json.params.required);

    var param_json = {};
    for(var i = 0; i < params.length; i++){
        param_json[params[i]] = "";
    }
    $("section#compose-query textarea#parameters_filter").val(JSON.stringify(param_json));
    updateCounts();
}

function getQFilters(cb){
    var widget = $("section#compose-query");
    var inputs = {'executable': widget.find("select#executable_name"),
                  'model': widget.find("textarea#models_filter"),
                  'params': widget.find("textarea#parameters_filter"),
                  'results': widget.find("textarea#results_filter"),
                  'fields': widget.find("textarea#results_fields")};
    var fields = inputs['fields'].val().replace(/\s/g,'');
    if (fields !== '') {
        fields = fields.split(',');
    }
    var filters = {'executable': JSON.stringify({"name": inputs['executable'].val()}),
                   'model': inputs['model'].val(),
                   'params': inputs['params'].val(),
                   'results': inputs['results'].val(),
                   'fields': fields};

    // Check filters are proper JSON
    var bad_filters = false;
    for (var key in filters) {
        if (key !== 'fields') {
            try {
                filters[key] = JSON.parse(filters[key]);
                inputs[key].css('color','black');
            } catch(e) {
                inputs[key].css('color','red');
                bad_filters = true;
            }
        }
    }

    if (bad_filters) {
        cb(0,bad_filters);
    } else {
        cb(filters,0);
    }
}

function updateQueryCount(){
    var widget = $("section#compose-query");
    getQFilters(function(filters,err) {
        if (!err) {
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
                },
                error: function(request, status, err){
                    alert(err);
                }
            });
        } else {
            widget.find("span#n_queries").text(0);
        }
    });
}

function updateModelCount(){
    var widget = $("section#compose-query");
    getQFilters(function(filters,err) {
        if (!err) {
            $.ajax({
                type: 'GET',
                url: api_addr+"/api/models/count",
                data: { "access_token"  : session_token,
                        "filter" : JSON.stringify(filters['model'])
                },
                success: function(data){
                    var n_models = data.result;
                    widget.find("span#n_models").text(n_models);
                },
                error: function(request, status, err){
                    alert(err);
                }
            });
        } else {
            widget.find("span#n_models").text(0);
        }
    });
}

function updateResultCount(){
    var widget = $("section#compose-query");
    getQFilters(function(filters,err) {
        if (!err) {
            // Count matching properties
            $.ajax({
                type: 'GET',
                url: api_addr+"/api/queries/results/count",
                data: { "access_token"  : session_token,
                        "filters" : JSON.stringify(filters)
                },
                success: function(data){
                    var n_results = data.result;
                    widget.find("span#n_results").text(n_results);
                },
                error: function(request, status, err){
                    alert(err);
                }
            });
        } else {
            widget.find("span#n_results").text(0);
        }
    });
}

function updateCounts(){
    updateQueryCount();
    updateModelCount();
    updateResultCount();
}

function viewModels(){
    getQFilters(function(filters,err) {
        if (!err) {
            var data = {"access_token":session_token, "filters":JSON.stringify(filters['model'])};
            window.location = api_addr+"/api/models?"+$.param(data);
        }
    });
}

function viewQ(){
    getQFilters(function(filters,err) {
        if (!err) {
            var data = {"access_token":session_token, "filters":JSON.stringify(filters)};
            window.location = api_addr+"/api/queries?"+$.param(data);
        }
    });
}

function downloadQResults(){
    getQFilters(function(filters,err) {
        if (!err) {
            var data = {"access_token":session_token, "filters":JSON.stringify(filters)};
            window.location = api_addr+"/api/queries/results?"+$.param(data);
        }
    });
}

function composeQuery(){
    transition($("section#compose-query"));
    indicateMenu("compose-query");
    setQExecutables();
    roundCentering();
}

$(document).ready(function(){
    $(document).on("change", "section#compose-query select#executable_name", loadQParams);
    $(document).on("change", "section#compose-query select#executable_name", updateCounts);
    $(document).on("change", "section#compose-query textarea", updateCounts);
    $(document).on("click", "section#compose-query div.button_row div#models", viewModels);
    $(document).on("click", "section#compose-query div.button_row div#queries", viewQ);
    $(document).on("click", "section#compose-query div.button_row div#results", downloadQResults);
});
