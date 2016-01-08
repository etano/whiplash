
var QTableFixture = fixture(function(){
    $(document).on("change", $("widget.qtable select.container"), attach_context(QTable.prototype.showFilters, function(){ return QTable.instance; }));
    $(document).on("click",  $("widget.qtable select.container"), attach_context(QTable.prototype.showFilters, function(){ return QTable.instance; }));

    $(document).on("keyup keypress blur change", $("widget.qtable select.container"), attach_context(QTable.prototype.updateCounts, function(){ return QTable.instance; }));
    $(document).on("keyup keypress blur change", $("widget.qtable textarea"),         attach_context(QTable.prototype.updateCounts, function(){ return QTable.instance; }));
});

var QTable = function(widget){
    var instance = QTable.instance = this;
    this.widget = widget;

    if(QTable.executables){
        instance.showFilters();
    }else{
        instance.widget.find("select.container").attr("disabled", "true");
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
    var select = this.widget.find("select.container");
    select.empty();
    for(var i = 0; i < QTable.executables.length; i++)
        select.append("<option value='"+QTable.executables[i].name+"'>"+QTable.executables[i].name+"</option>");
    select.removeAttr("disabled");

    var executable = select.val();
    var executable_json = $.grep(QTable.executables, function(e){ return e.name == executable; })[0];
    var parameters = executable_json.params.optional.concat(executable_json.params.required);

    var param_json = {};
    for(var i = 0; i < parameters.length; i++){
        param_json[parameters[i]] = "";
    }
    this.widget.find("textarea#parameters").val(JSON.stringify(param_json));
    this.updateCounts();
};

QTable.prototype.updateCounts = function(){
    this.updateQueryCount();
    this.updateModelCount();
};

QTable.prototype.updateQueryCount = function(){
    var widget = this.widget;
    this.getFilters(function(filters,err){
        if(!err){
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
        }else{
            widget.find("span#n_queries").text(0);
            widget.find("span#n_results").text(0);
        }
    });
};

QTable.prototype.updateModelCount = function(){
    var widget = this.widget;
    this.getFilters(function(filters,err) {
        if(!err){
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
};

QTable.prototype.getFilters = function(callback){
    var executable = this.widget.find("select.container");
    var model = this.widget.find("textarea#model");
    var params = this.widget.find("textarea#parameters");
    var filters = { 'executable': JSON.stringify({"name": executable.val()}), 'model': model.val(), 'params': params.val() };

    // Check filters are proper JSON
    var bad_filters = false;
    for(var key in filters){
        try {
            filters[key] = JSON.parse(filters[key]);
            eval(key+".css('color','black')");
        } catch(e) {
            eval(key+".css('color','red')");
            bad_filters = true;
        }
    }

    if(bad_filters){
        callback(0,bad_filters);
    }else{
        callback(filters,0);
    }
};

function viewModels(){
    QTable.instance.getFilters(function(filters,err) {
        if(!err){
            var data = { "access_token": session_token, "filters": JSON.stringify(filters['model']) };
            window.location = api_addr+"/api/models?"+$.param(data);
        }
    });
}

function viewQ(){
    QTable.instance.getFilters(function(filters,err) {
        if(!err){
            var data = { "access_token": session_token, "filters": JSON.stringify(filters) };
            window.location = api_addr+"/api/queries?"+$.param(data);
        }
    });
}

function downloadQResults(){
    QTable.instance.getFilters(function(filters,err) {
        if(!err){
            var data = { "access_token": session_token, "filters": JSON.stringify(filters) };
            window.location = api_addr+"/api/queries/results?"+$.param(data);
        }
    });
}

function composeQuery(){
    transition($("section#compose-query"));
    indicateMenu("compose-query");
}

$(document).ready(function(){
    $(document).on("click", "section#compose-query div.button_row div#models", viewModels);
    $(document).on("click", "section#compose-query div.button_row div#queries", viewQ);
    $(document).on("click", "section#compose-query div.button_row div#results", downloadQResults);
});
