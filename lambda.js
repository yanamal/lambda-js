
let named_symbols = {
    'TRUE': [{'lambda':'x'}, {'lambda':'y'}, 'x'],
    'FALSE': [{'lambda':'w'}, {'lambda':'z'}, 'z'],
    'NOT': [{'lambda':'a'}, 'a','FALSE','TRUE'],
    'AND':[{'lambda':'b'}, {'lambda':'c'}, 'b', 'c', 'FALSE'],
    'OR': [{'lambda':'e'}, {'lambda':'f'}, 'e', 'TRUE', 'f'],
}


let expand = function(symbol) {
    if (symbol in named_symbols) {
        return named_symbols[symbol]
    }
    return symbol
}


let apply_lambda = function(l, input_symbol) {
    if( l.length> 0 // if there actually are any symbols in the lambda expression (list of symbols)
        && 'lambda' in l[0] ){ // if first symbol is actually a lambda
        to_replace = l[0]['lambda']
        return l.slice(1).map(e => (e==to_replace)?input_symbol:e)
        // TODO: recurse.
    }
    return null; // not a lambda up front; do nothing.
}

// given an expression, take a step in evaluating/expanding it
let evaluate_step = function(lambda_expression, parent_expression = null) {
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
        if(lambda_expression.length === 1){
            // TODO: do it as an explicit step?.. sometimes several in a row need to happen, but for some reason the recursion is iffy.
            console.log('unnesting')
            return [lambda_expression[0], message] // unnest in place if it's the only thing left
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
            return [lambda_expression, `Replaced symbol '${first_token}' with formula`] 
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
            expr.html('&lambda;.'+lambda_expression['lambda'])
        }
    }
    return expr
}