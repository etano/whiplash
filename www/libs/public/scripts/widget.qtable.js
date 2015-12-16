function constraintSelect(){
    return "<select>"+
               "<option value='value'>Value</option>"+
               "<option value='min'>Min Value</option>"+
               "<option value='max'>Max Value</option>"+
               "<option value='step'>Step</option>"+
           "</select>";
}

function addParam(){
    var parameters = $(this).prev(".parameters");
    parameters.find("div.table > div.row").append("<div class='param'>"+
          "<div class='row'>"+
              "<div class='label'><select disabled><option value='name'>Name</option></select></div><div class='value'><input type='text' value=''></div><div class='remove'>×</div>"+
          "</div>"+
          "<div class='row'>"+
              "<div class='label'>"+constraintSelect()+
              "</div><div class='value'><input type='text' value=''></div><div class='remove'>×</div>"+
          "</div>"+
          "<div class='button add-constraint'>Add constraint</div>"+
      "</div>");
    parameters.animate({scrollLeft: parameters.find("div.table").width(), scrollTop: 0 });
}

function removeParam(e){
    if($(this).closest("widget.qtable").hasClass("readonly")) return;
    $(this).parent().parent().remove();
}

function addConstraint(){
    $("<div class='row'>"+
          "<div class='label'>"+constraintSelect()+"</div><div class='value'><input type='text' value=''></div><div class='remove'>×</div>"+
      "</div>").insertAfter($(this).prev());
}

function removeConstraint(){
    if($(this).closest("widget.qtable").hasClass("readonly")) return;
    $(this).parent().remove();
} 

function submitQTable(){
    var widget = $(this).closest("widget.qtable");
    var query = { model : widget.find("input.model").val(),
                  container : widget.find("select.container").val(),
                  parameters : [ ]
                };
    widget.find("div.parameters div.param").each(function(i){
        var constraints = [];
        $(this).find("div.row").each(function(k){
            constraints.push({ attr  : $(this).find("div.label > select").val(),
                               value : $(this).find("div.value > input").val() });
        });
        query.parameters.push(constraints);
    });

    alert(JSON.stringify(query));
    return;
    $.ajax({
        type: 'POST',
        url: api_addr+"/api/jobs/compose",
        data: { "access_token"  : session_token, "query" : query },
        success: function(data){
            alert(data);
        },
        error: function(request, status, err){
            alert(err);
        }
    });
}

function loadQTable(widget, batch){
    $.ajax({
        type: 'GET',
        url: api_addr+"/api/jobs/"+batch+"/table",
        data: { "access_token"  : session_token },
        success: function(data){
            var query = data.result.query;

            widget.find("input.model").val(query.model);
            widget.find("select.container").val(query.container);

            for(var i = 1; i < query.parameters.length; i++)
                widget.find("div.add-param").click();

            if(readonly) widget.find('input:text, select').prop("disabled", true);

            widget.find("div.parameters div.param").each(function(i){
                var constraints = query.parameters[i];
                $(this).find("div.row").each(function(k){
                    $(this).find("div.label > select").val(constraints[k].attr);
                    $(this).find("div.value > input").val(constraints[k].value);
                });
            });
        },
        error: function(request, status, err){
            alert(err);
        }
    });
}

function initQTable(widget){
    roundCentering();
    if(readonly){
        widget.addClass("readonly");
        widget.find('input:text, select').prop("disabled", true);
    }
}
