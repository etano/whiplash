function loadExplore(){

    transition($("section#explore"));

    $.ajax({ // replace me with the real search call
        type: 'GET',
        url: api_addr+"/api/jobs/stats/",
        data: { "access_token"  : session_token },
        success: function(data){
            if(data.result.count == 0) {
                $("section#explore div#info").html("<center>Nothing to display at the moment</center>");
            } else {
                var batch_id = data.result.stats[0].batch_id;
                $("section#explore div#info").attr("batch", batch_id);

                $.ajax({
                    type: 'GET',
                    url: api_addr+"/api/jobs/"+batch_id+"/explore",
                    data: { "access_token"  : session_token },
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
        },
        error: function(request, status, err){
            alert(err);
        }
    });
}

function downloadLog(){
    var batch_id = $("section#explore div#info").attr("batch");
    var log_id = $(this).parent().parent().find("div.number").text();
    window.location = "/api/jobs/"+batch_id+"/log?id="+log_id+"&access_token="+session_token;
}

function downloadBatch(){
    var batch_id = $(this).parent().attr("batch");
    window.location = "/api/jobs/"+batch_id+"/download?access_token="+session_token;
}

$(document).ready(function(){
    $(document).on("click", "section#explore div.log", downloadLog);
    $(document).on("click", "section#view-queries div.name", downloadBatch);
});
