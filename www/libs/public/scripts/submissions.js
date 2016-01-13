function loadQueries(){
    $.ajax({
        type: 'GET',
        url: api_addr+"/api/queries/stats/",
        data: {"access_token": session_token},
        success: function(data){
            var stats = data.result;
            if(stats.length === 0) {
                $("section#view-queries div#info").html("No queries to display at the moment.");
            } else {
                $("section#view-queries div#info").empty();
                for (var i=0; i<stats.length; i++) {
                    var id = stats[i]._id;
                    var timestamp = stats[i].timestamp;
                    var resolved = parseInt(stats[i].resolved);
                    var unresolved = parseInt(stats[i].unresolved);
                    var total = parseInt(stats[i].total);
                    var pulled = parseInt(stats[i].pulled);
                    var errored = parseInt(stats[i].errored);
                    var timedout = parseInt(stats[i]['timed out']);

                    var stat = "OK";
                    var progress = 100;
                    if (resolved < total){
                        stat = resolved + "/" + total;
                        progress = Math.floor(resolved * 100 / total);
                    }
                    $("section#view-queries div#info").append("<div class='record' id='" + id + "'>" +
                                                            "<div class='shortcuts'><div class='delete'>&#xd7;</div></div>" +
                                                            "<div class='date'>" + timestamp + "</div>" +
                                                            "<div class='progress'><progress max='100' value='" + progress + "'></progress></div>" +
                                                            "<div class='status'>" + stat + "</div>" +
                                                         "</div>");
                }
            }
        },
        error: function(request, status, err){
            alert(err);
        }
    });
}

function deleteQuery(){
    var query = $(this).parent().parent();
    var id = query.attr("id");

    $.ajax({
        type: 'DELETE',
        url: api_addr+"/api/queries/",
        data: {"access_token": session_token,
               "_id": id},
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
});
