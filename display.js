// Logic for displaying lambda calculus calculatons
// in elements with ids 'expression' and 'symbols'


expr = ['AND', 'FALSE', 'TRUE'] // global var storing "current" expression


function make_row(message, expression) {
    row = $('<tr ">')
    message_col = $('<td style="width:50%">').append(message)
    expr_col = $('<td class="expr">').append(draw_expression(expr))
    row.append(message_col)
    row.append(expr_col)
    return row
}

function parse_expression_string(expr_str) {
    // TODO: parse nesting, lambdas
    return expr_str.split(' ')
}

// reset the #expression element to just contain the current expression
// (probably to be coupled with some kind of expression-resetting)
function reset_expression_element(){
    $('#expression').empty()
    $('#expression').append(make_row('',expr))
}

function set_expr_reset_display(expr_obj) {
    expr = expr_obj
    reset_expression_element()
}

// Show expression to evaluate:
$('#expression').append(make_row('',expr))
$('#expression').click(function(){
    [expr, message] = evaluate_step(expr)
    // Hacks - modify the previous row to highlight changes, based on the message
    ft = $('#expression .expr').last().find('.token').first() // the first token of the last expression
    if(message.startsWith('Replaced')) {
        ft.css('background-color', 'antiquewhite')
    }
    else if(message.startsWith('Applied')) {
        ft.css('background-color', 'lightgreen')
        ft.parent().next().css('background-color', 'lightgreen')
    }
    // draw new expression
    $('#expression').append(make_row(message, expr))
})

// Show named symbols:
for(s_name in named_symbols) {
    s_div = $('<div>')
    s_div.append(s_name + ' = ')
    s_div.append(draw_expression(named_symbols[s_name]))
    $('#symbols').append(s_div)
}