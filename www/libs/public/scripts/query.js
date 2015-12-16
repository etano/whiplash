var readonly = false;
var last_batch;

function composeQuery(){
    readonly = false;
    transition($("section#compose-query"));
    indicateMenu("compose-query");
}

function loadQuery(batch_id, r){
    last_batch = batch_id; readonly = r;
    transition($("section#edit-query"));
    loadQTable($("section#edit-query widget.qtable"), batch_id);
}

$(document).ready(function(){
    $(document).on("click", "widget.qtable div.add-param", addParam);
    $(document).on("click", "widget.qtable div.param > div:first-child div.remove", removeParam);
    $(document).on("click", "widget.qtable div.add-constraint", addConstraint);
    $(document).on("click", "widget.qtable div.param > div:not(:first-child) div.remove", removeConstraint);
    $(document).on("click", "widget.qtable div.submit", submitQTable);
});
