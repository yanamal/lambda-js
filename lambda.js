
let named_symbols = {
    'TRUE': [{'lambda':'a'}, {'lambda':'b'}, 'a'],
    'FALSE': [{'lambda':'a'}, {'lambda':'b'}, 'b'],
    'NOT': [{'lambda':'a'}, 'a','FALSE','TRUE'],
    'AND':[{'lambda':'a'}, {'lambda':'b'}, 'a', 'b', 'FALSE'],
    //'OR': [{'lambda':'e'}, {'lambda':'f'}, 'e', 'TRUE', 'f'],
    'Y': [{'lambda':'f'}, [{'lambda': 'x'}, 'f', ['x', 'x']], [{'lambda': 'x'}, 'f', ['x', 'x']]]
}


let expand = function(symbol) {
    if (symbol in named_symbols) {
        return named_symbols[symbol]
    }
    return symbol
}


let recursively_replace = function(l, input_expression, to_replace) {
    // recursively replace to_replace with input_expression in l
    // stop if same variable becomes "bound" in subexpression (i.e. we encounter another lambda to_replace. ...)
    let new_l = JSON.parse(JSON.stringify(l)) // make a copy of l
    for (let i = 0; i < new_l.length; i++) {
        e = new_l[i]
        if(e==to_replace) {
            // This is the symbol to be replaced
            console.log(`replacing ${e} with ${input_expression}`)
            new_l[i] = JSON.parse(JSON.stringify(input_expression))
            console.log(new_l)
        }
        else if(Array.isArray(e)) {
            // this is a sub-expression - recurse
            console.log(`recursing into ${e}`)
            new_l[i] = recursively_replace(e, input_expression, to_replace)
            console.log(new_l)
        }
        else {
            // this must be a lambda expression - check that it doesn't bind the very same variable we are trying to replace(if it does, stop replacing here)
            if(e['lambda']==to_replace) {
                console.log(`stopping at ${e}`)
                console.log(e)
                break;
            }
        }
    }
    return new_l
}

let apply_lambda = function(l, input_expression) {
    if( l.length> 0 // if there actually are any symbols in the lambda expression (list of symbols)
        && 'lambda' in l[0] ){ // if first symbol is actually a lambda
        to_replace = l[0]['lambda']
        replace_in = l.slice(1)
        console.log(input_expression, to_replace)
        console.log(replace_in)
        return recursively_replace(replace_in, input_expression, to_replace)
    }
    return null; // not a lambda up front; do nothing.
}


// given an expression, take a step in evaluating/expanding it.
// This is a recursve function: if the first elemen of the expression is an array (i.e. another non-trivial expression),
// it recurses into that array, passing the original expression as parent/context.
let evaluate_step = function(lambda_expression, parent_expression = null) {
    // TODO: this modifies lambda_expression in place.
    if (!Array.isArray(lambda_expression)){
        return [lambda_expression, 'Single token remaining, can\'t expand further']
    }

    if (lambda_expression.length == 0) {
        return [null, 'Eliminate empty parens'] // probably will never happen in normal cases?
    }

    let first_token = lambda_expression[0]

    if(Array.isArray(first_token)) {
        // nested parens - recurse
        //console.log(lambda_expression, lambda_expression.length, first_token)
        [lambda_expression[0], message] = evaluate_step(first_token, lambda_expression)

        // Now that we consumed a sub-expression from lambda_expression, we may have ended up with (possibly several layers of) parens that contain just one thing.
        // keep discarding the parens until this is not the case.
        // we do this here to simplify the expression as soon as possible, and not have to deal with several unnesting steps
        while(lambda_expression.length === 1 && Array.isArray(lambda_expression[0])){
            console.log('unnesting')
            lambda_expression = lambda_expression[0] // unnest in place
        }


        return [lambda_expression, message]
    }

    if(typeof first_token === 'string') {
        // This is a symbol/variable; try to look it up in named symbols

        // special case: don't expand if it's the only one remaining, and this is a top-level expression
        if(parent_expression === null && lambda_expression.length === 1){
            return [lambda_expression, 'Done: just one token remaining.']
        }


        if(first_token in named_symbols) {
            lambda_expression[0] = named_symbols[first_token]
            return [lambda_expression, `Replaced symbol '${first_token}' with expression`] 
        }
        else {
            return [lambda_expression, `stuck: undefined symbol '${first_token}'`]
        }
    }

    // if reached here, assume first_token is a lambda.
    // try to apply the lambda to the rest of the expression, using the next symbol from the parent 
    // (here we assume that we're always expanding the very first symbol from the parent)
    if(parent_expression !== null && parent_expression.length > 1){
        let value = parent_expression[1] // TODO: do deep copy, in case the expression is a complex one?..
        lambda_expression = apply_lambda(lambda_expression, value)
        // TODO: handle (unlikely, broken) case that apply_lambda returns null
        parent_expression.splice(1,1) // remove the element we just substituted in
        return [lambda_expression, `Applied lambda: replaced '${first_token.lambda}' with '${value}'`]
    }
    else if(parent_expression !== null){
        // We are nested inside some other parens, but there's no other thing inside those parens (parent_expression.length == 1)
        // Assume that the paren unnesting will take care of it
        return [lambda_expression, `(Unnesting extraneous parentheses)`]
    }
    else {
        return [lambda_expression, `stuck: can't apply lambda (nothing to apply it to)`]
    }

}


let draw_expression = function(lambda_expression) {
    let expr = $('<span>')
    if(Array.isArray(lambda_expression)){
        // this is a list of tokens/symbols/whatever
        expr.addClass('list')
        children = lambda_expression.map(draw_expression)
        expr.append(children)
    }
    else {
        // this is just a single token/symbol/whatever
        expr.addClass('token')
        if(typeof lambda_expression === 'string') {
            // this is a symbol or variable
            expr.text(lambda_expression)
        }
        else {
            //this is a lambda thing
            expr.html('&lambda;'+lambda_expression['lambda']+'.')
        }
    }
    return expr
}