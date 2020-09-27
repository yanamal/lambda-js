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

// Prepare, but do not yet display, the next step in the evaluation 
// (return info necessary for display)
function prepare_next_step() {
    [expr, _message] = evaluate_step(expr)

    // Hacks - modify the previous row to highlight changes, based on the message
    let ft = $('#expression .expr').last().find('.token').first() // the first token of the last expression

    let highlight_color = ''
    let highlight_elems = []
    let active_elem = $('#expression .expr').last() // By default, the active (clickable) element is the whole previous expression
    if(_message.startsWith('Replaced')) {
        highlight_color = 'antiquewhite'
        highlight_elems = [ft] // the replaced  token
        active_elem = ft
    }
    else if(_message.startsWith('Applied')) {
        highlight_color = 'lightgreen'
        active_elem = ft.parent().next() // The thing being applied to the lambda
        highlight_elems = [
            ft, // The replaced lambda
            active_elem
        ]
    }

    return {
        message: _message,
        highlight_color: highlight_color,
        highlight_elems: highlight_elems,
        active_elem: active_elem
    }
}

function show_next_step(){
    // prepare the next step
    let next_step = prepare_next_step()
    console.log(next_step)
    let message = next_step.message
    
    //highlght appropriate elements from previous step
    for(el of next_step.highlight_elems)  {
        el.css('background-color', next_step.highlight_color)
    }
    // show the next step and message
    $('#expression').append(make_row(message, expr))

    // set up next clickable element
    next_step.active_elem.one('click', show_next_step)
}

// Show expression to evaluate:
$('#expression').one('click',show_next_step)

// Show named symbols:
for(s_name in named_symbols) {
    s_div = $('<div>')
    s_div.append(s_name + ' = ')
    s_div.append(draw_expression(named_symbols[s_name]))
    $('#symbols').append(s_div)
}