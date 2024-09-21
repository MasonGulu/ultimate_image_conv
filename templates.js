function labeledCheckbox(str, div) {
    let checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    let label = document.createElement("label")
    label.innerHTML = str
    label.appendChild(checkbox)
    div.appendChild(label)
    return checkbox
}


function labeledInput(str, div) {
    let input = document.createElement("input")
    let label = document.createElement("label")
    label.innerHTML = str
    label.appendChild(input)
    div.appendChild(label)
    return input
}

function labeledButton(str, div, callback) {
    let button = document.createElement("button")
    button.innerHTML = str
    button.addEventListener("click", callback)
    div.appendChild(button)
    return button
}