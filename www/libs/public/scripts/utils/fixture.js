function fixture(fn, context){
    var result;

    return function(){
        if(fn){
            result = fn.apply(context || this, arguments);
            fn = null;
        }
        return result;
    };
}

function attach_context(fn, context_fn){
    return function(){
        return fn.apply(context_fn(), arguments);
    };
}

