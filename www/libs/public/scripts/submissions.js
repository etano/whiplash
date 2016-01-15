function loadQueries(){
    $.ajax({
        type: 'GET',
        url: api_addr+"/api/queries/status/all",
        data: {"access_token": session_token},
        success: function(data){
            var status = data.result;
            if(status.length === 0) {
                $("section#viewport div.queries#info").html("No queries to display at the moment.");
            } else {
                $("section#viewport div.queries#info").empty();
                for (var i=0; i<status.length; i++) {
                    var id = status[i]._id;
                    var timestamp = status[i].timestamp;
                    var resolved = parseInt(status[i]['resolved']);
                    var unresolved = parseInt(status[i]['unresolved']);
                    var total = parseInt(status[i]['total']);
                    var pulled = parseInt(status[i]['pulled']);
                    var errored = parseInt(status[i]['errored']);
                    var running = parseInt(status[i]['running']);
                    var notfound = parseInt(status[i]['not found']);
                    var timedout = parseInt(status[i]['timed out']);

                    var stat = "OK";
                    var progress = 100;
                    if (resolved < total){
                        stat = resolved + "/" + total;
                        progress = Math.floor(resolved * 100 / total);
                    }
                    $("section#viewport div.queries#info").append("<div class='record' id='" + id + "'>" +
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
    $(document).on("click", "section#viewport div.queries#info div.delete", deleteQuery);
});
