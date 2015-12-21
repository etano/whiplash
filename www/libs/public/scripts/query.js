var readonly = false;
var last_batch;

function composeQuery(){
    readonly = false;
    transition($("section#compose-query"));
    indicateMenu("compose-query");
    $("div.duplicate").css({display: "none"});
}

function loadQuery(batch_id, r){
    last_batch = batch_id; readonly = r;
    transition($("section#edit-query"));
    loadQTable($("section#edit-query widget.qtable"), batch_id);
    $("div.duplicate").css({display: "block"});
}

function duplicateQuery(batch_id){
    readonly = false;
    transition($("section#compose-query"));
    loadQTable($("section#compose-query widget.qtable"), batch_id);
    indicateMenu("compose-query");
    $("div.duplicate").css({display: "none"});
}

$(document).ready(function(){
    $(document).on("click", "widget.qtable div.add-param", addParam);
    $(document).on("click", "widget.qtable div.param > div:first-child div.remove", removeParam);
    $(document).on("click", "widget.qtable div.add-constraint", addConstraint);
    $(document).on("click", "widget.qtable div.param > div:not(:first-child) div.remove", removeConstraint);
    $(document).on("click", "widget.qtable div.add-model", registerModel);
    $(document).on("click", "widget.qtable div.add-container", registerContainer);
    $(document).on("click", "widget.qtable div.submit", submitQTable);
    $(document).on("click", "section#compose-model div.submit", composeQuery); // should go back instead
    $(document).on("click", "section#compose-container div.submit", composeQuery); // should go back instead
});
