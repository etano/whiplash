var QTableFixture = fixture(function(){
    //$(document).on("change", $("widget.qtable select#executable_name"), attach_context(QTable.prototype.showFilters, function(){ return QTable.instance; }));
    //$(document).on("click",  $("widget.qtable select#executable_name"), attach_context(QTable.prototype.showFilters, function(){ return QTable.instance; }));
    $(document).on("change", $("widget.qtable select#executable_name"), attach_context(QTable.prototype.updateCounts, function(){ return QTable.instance; }));
    $(document).on("change", $("widget.qtable textarea"), attach_context(QTable.prototype.updateCounts, function(){ return QTable.instance; }));
});

var QTable = function(widget){
    var instance = QTable.instance = this;
    this.widget = widget;

    if(QTable.executables){
        instance.showFilters();
    }else{
        instance.widget.find("select#executable_name").attr("disabled", "true");
        $.ajax({
            type: 'GET',
            url: api_addr+"/api/executables/",
            data: { "access_token"  : session_token },
            success: function(data){
                QTable.executables = data.result;
                instance.showFilters();
            },
            error: function(request, status, err){
                alert(err);
            }
        });
    }
    roundCentering();
    QTableFixture();
};

QTable.prototype.showFilters = function(){
    var select = this.widget.find("select#executable_name");
    select.empty();
    for(var i = 0; i < QTable.executables.length; i++)
        select.append("<option value='"+QTable.executables[i].name+"'>"+QTable.executables[i].name+"</option>");
    select.removeAttr("disabled");

    if (QTable.executables.length > 0) {
        var executable_name = select.val();
        var executable_json = $.grep(QTable.executables, function(e){ return e.name == executable_name; })[0];
        var params = executable_json.params.optional.concat(executable_json.params.required);

        var param_json = {};
        for(var i = 0; i < params.length; i++){
            param_json[params[i]] = "";
        }
        this.widget.find("textarea#params_filter").val(JSON.stringify(param_json));
    }
    this.updateCounts();
};

QTable.prototype.updateCounts = function(){
    this.updateModelCount();
};

QTable.prototype.updateQueryCount = function(){
    var widget = this.widget;
    this.getFilters(function(filters,fields,err){
        if(!err){
            $.ajax({
                type: 'GET',
                url: api_addr+"/api/queries/status",
                data: { "access_token"  : session_token,
                        "filters" : JSON.stringify(filters),
                        "fields" : JSON.stringify(fields)
                },
                success: function(data){
                    var status = data.result;
                    widget.find("span#n_queries").text(status.total);
                    widget.find("span#n_results").text(status.resolved);
                },
                error: function(request, status, err){
                    alert(err);
                }
            });
        }else{
            widget.find("span#n_queries").text(0);
            widget.find("span#n_results").text(0);
        }
    });
};

QTable.prototype.updateModelCount = function(){
    var widget = this.widget;
    this.getFilters(function(filters,fields,err) {
        if(!err){
            $.ajax({
                type: 'GET',
                url: api_addr+"/api/models/count",
                data: { "access_token": session_token,
                        "filter": JSON.stringify(filters['input_model'])
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
};

QTable.prototype.getFilters = function(callback){
    var widget = this.widget;
    var filter_inputs = {'executable': widget.find("select#executable_name"),
                         'input_model': widget.find("textarea#input_model_filter"),
                         'params': widget.find("textarea#params_filter"),
                         'output_model': widget.find("textarea#output_model_filter")};
    var field_inputs = {'executable': widget.find("textarea#executable_fields"),
                        'input_model': widget.find("textarea#input_model_fields"),
                        'params': widget.find("textarea#params_fields"),
                        'output_model': widget.find("textarea#output_model_fields")};
    var key;
    var fields = {};
    for (key in field_inputs) {
        fields[key] = field_inputs[key].val().replace(/\s/g,'');
        if (fields[key] !== '') {
            fields[key] = fields[key].split(',');
        }
    }
    var filters = {};
    for (key in filter_inputs) {
        filters[key] = filter_inputs[key].val();
        if (filters[key] === '') {
            filters[key] = '{}';
        }
    }
    filters['executable'] = JSON.stringify({"name": filters['executable']});

    // Check filters are proper JSON
    var bad_filters = false;
    for (key in filters) {
        try {
            filters[key] = JSON.parse(filters[key]);
            filter_inputs[key].css('color','black');
        } catch(e) {
            filter_inputs[key].css('color','red');
            bad_filters = true;
        }
    }

    if (bad_filters) {
        callback(0,0,bad_filters);
    } else {
        callback(filters,fields,0);
    }

};

function viewModels(){
    QTable.instance.getFilters(function(filters,fields,err) {
        if(!err){
            var data = { "access_token": session_token, "filters": JSON.stringify(filters['model']), "fields": JSON.stringify([]) };
            window.location = api_addr+"/api/models?"+$.param(data);
        }
    });
}

function submitQuery(){
    QTable.instance.getFilters(function(filters,fields,err) {
        if(!err){
            $.ajax({
                type: 'GET',
                url: api_addr+"/api/queries/submit",
                data: { "access_token"  : session_token,
                        "filters" : JSON.stringify(filters),
                        "fields" : JSON.stringify(fields),
                        "timeout" : 3600, // FIXME: should be given as option
                        "n_rep" : 1 // FIXME: should be given as option
                },
                success: function(data){
                    viewQueries();
                },
                error: function(request, status, err){
                    alert(err);
                }
            });
        } else {
            alert(err);
        }
    });
}

function downloadBatch(){
    var batch_id = $(this).parent().attr("batch");
    window.location = api_addr+"/api/jobs/"+batch_id+"/download?access_token="+session_token;
}

$(document).ready(function(){
    $(document).on("click", "widget.qtable div.button_row div#models", viewModels);
    $(document).on("click", "widget.qtable div.button_row div#submit", submitQuery);
    $(document).on("click", "info.queries div.name", downloadBatch);
});
