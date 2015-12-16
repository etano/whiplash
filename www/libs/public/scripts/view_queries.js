function loadQueries(){
    $.ajax({
        type: 'GET',
        url: api_addr+"/api/jobs/stats/",
        data: { "access_token"  : session_token },
        success: function(data){
            if(data.result.count == 0) {
                $("section#view-queries div#info").html("No queries to display at the moment.");
            } else {
                $("section#view-queries div#info").empty();
                for(var i = 0; i < data.result.count; i++){
                    var name = data.result.stats[i].name;
                    var time = data.result.stats[i].time;
                    var done = parseInt(data.result.stats[i].done);
                    var togo = parseInt(data.result.stats[i].togo);
                    var now  = parseInt(data.result.stats[i].now);
                    var batch_id = data.result.stats[i].batch_id;
                    var submitted = data.result.stats[i].submitted;

                    var stat = "OK";
                    var progress = 100;
                    if(togo > 0 || now > 0){
                        stat = done + "/" + (done + togo + now);
                        progress = Math.floor(done * 100 / (done + togo + now));
                    }
                    if(submitted){
                        $("section#view-queries div#info").append("<div class='record' batch='" + batch_id + "'>" +
                                                                "<div class='shortcuts'><div class='delete'>&#xd7;</div></div>" +
                                                                "<div class='name'>" + name + "</div>" +
                                                                "<div class='date'>" + time + "</div>" +
                                                                "<div class='progress'><progress max='100' value='" + progress + "'></progress></div>" +
                                                                "<div class='status'>" + stat + "</div>" +
                                                             "</div>");
                    }else{
                        $("section#view-queries div#info").append("<div class='record mock' batch='" + batch_id + "'>" +
                                                                "<div class='shortcuts'><div class='delete'>&#xd7;</div></div>" +
                                                                "<div class='name'>" + name + "</div>" +
                                                                "<div class='date'>" + time + "</div>" +
                                                                "<div class='progress'>Not submitted</div>" +
                                                                "<div class='status'></div>" +
                                                             "</div>");
                    }
                }
            }
        },
        error: function(request, status, err){
            alert(err);
        }
    });
}

function copyQuery(){
    var batch_id = last_batch;

    $.ajax({
        type: 'POST',
        url: api_addr+"/api/jobs/"+batch_id,
        data: { "access_token"  : session_token },
        success: function(data){
            duplicateQuery(data.result.batch_id);
        },
        error: function(request, status, err){
            alert(err);
        }
    });
}

function deleteQuery(){
    var query = $(this).parent().parent();
    var batch_id = query.attr("batch");

    $.ajax({
        type: 'DELETE',
        url: api_addr+"/api/jobs/"+batch_id,
        data: { "access_token"  : session_token },
        success: function(data){
            query.remove();
        },
        error: function(request, status, err){
            alert(err);
        }
    });
}

$(document).ready(function(){
    $(document).on("click", "section#view-queries div.delete", deleteQuery);
    $(document).on("click", "section#view-queries div.name", loadExplore);
});
