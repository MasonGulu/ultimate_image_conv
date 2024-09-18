
// Input Stage
/** @type {HTMLInputElement} */
let fileInput
/** @type {HTMLOptionElement} */
let presetInput
/** @type {HTMLImageElement} */
let imageInput
/** @type {HTMLButtonElement} */
let processButton
/** @type {HTMLInputElement} */
let autoProcessCheckbox
/** @type {HTMLCanvasElement} */
let canvasInput

// Pre-quantize Stage
/** @type {HTMLDivElement} */
let preQuantizeStageList
/** @type {HTMLOptionElement} */
let preQuantizeStageSelect

// Quantize Stage
/** @type {HTMLInputElement} */
let nColorsInput
/** @type {HTMLInputElement} */
let ditherModeInput
/** @type {HTMLCanvasElement} */
let quantizeCanvas

// Post-quantize Stage
/** @type {HTMLDivElement} */
let postQuantizeStageList
/** @type {HTMLOptionElement} */
let postQuantizeStageSelect

// Output Stage
/** @type {HTMLButtonElement} */
let saveOutputButton

// Preview Stage
/** @type {HTMLButtonElement} */
let savePreviewButton

// Registry and stage information
/**
 * @type {Map<string,PreQuantizeFilter>}
 */
let preQuantizeFilterRegistry = {}

/**
 * @type {PreQuantizeFilter[]}
 */
let preQuantizeStages = []

/**
 * @type {Map<string,PostQuantizeFilter>}
 */
let postQuantizeFilterRegistry = {}

/**
 * @type {PostQuantizeFilter[]}
 */
let postQuantizeStages = []

/**
 * @param {string} label
 */
function addPreQuantizeFilter(label) {
    if (preQuantizeFilterRegistry[label] == null) {
        return
    }
    filter = new preQuantizeFilterRegistry[label]
    preQuantizeStageList.appendChild(filter.div)
    preQuantizeStages.push(filter)
    fullUpdate = true
    onSettingChange()
}

/**
 * @param {PreQuantizeFilter} filter 
 */
function registerPreQuantizeFilter(label, filter) {
    preQuantizeFilterRegistry[label] = filter
    let option = document.createElement("option")
    option.innerHTML = label
    preQuantizeStageSelect.appendChild(option)
    preQuantizeStageSelect.value = ""
}

/**
 * @param {PreQuantizeFilter} filter 
 */
function removePreQuantizeFilter(filter) {
    preQuantizeStageList.removeChild(filter.div)
    let index = preQuantizeStages.indexOf(filter)
    if (index !== -1) {
        preQuantizeStages.splice(index, 1)
    }
    fullUpdate = true
    onSettingChange()
}

/**
 * @param {string} label
 */
function addPostQuantizeFilter(label) {
    if (postQuantizeFilterRegistry[label] == null) {
        return
    }
    filter = new postQuantizeFilterRegistry[label]
    postQuantizeStageList.appendChild(filter.div)
    postQuantizeStages.push(filter)
    fullUpdate = true
    onSettingChange()
}
/**
 * @param {PostQuantizeFilter} filter 
 */
function registerPostQuantizeFilter(label, filter) {
    postQuantizeFilterRegistry[label] = filter
    let option = document.createElement("option")
    option.innerHTML = label
    postQuantizeStageSelect.appendChild(option)
    postQuantizeStageSelect.value = ""
}
/**
 * @param {PostQuantizeFilter} filter 
 */
function removePostQuantizeFilter(filter) {
    postQuantizeStageList.removeChild(filter.div)
    let index = postQuantizeStages.indexOf(filter)
    if (index !== -1) {
        postQuantizeStages.splice(index, 1)
    }
    fullUpdate = true
    onSettingChange()
}

let fullUpdate = true
let quantizeUpdate = false
let previousQuants = []
function process() {
    let previousCanvas = canvasInput
    let updated = fullUpdate
    fullUpdate = false
    for (let i = 0; i < preQuantizeStages.length; i++) {
        let stage = preQuantizeStages[i]
        let thisCanvas = document.createElement("canvas")
        updated = updated || stage.updated
        if (updated) {
            stage.process(previousCanvas, thisCanvas)
            stage.updated = false
        }
        previousCanvas = stage.outputCanvas
    }
    updated = updated || quantizeUpdate
    quantizeUpdate = false
    if (updated) {
        let previousCtx = previousCanvas.getContext("2d")
        let imageData = previousCtx.getImageData(0, 0, previousCanvas.width, previousCanvas.height)
        let previousQuant = new QuantizedImage()
        previousQuant.process(imageData, nColorsInput.value, ditherModeInput.value)
        quantizeCanvas.width = previousCanvas.width
        quantizeCanvas.height = previousCanvas.height
        let quantizeCtx = quantizeCanvas.getContext("2d")
        quantizeCtx.putImageData(previousQuant.render(), 0, 0)
        previousQuants[0] = previousQuant
    }
    for (let i = 0; i < postQuantizeStages.length; i++) {
        let stage = postQuantizeStages[i]
        updated = updated || stage.updated
        if (updated) {
            let thisQuant = previousQuants[i].copy()
            previousQuants[i+1] = stage.process(thisQuant)
        }
    }
}

function loadPageElements() {
    // Input Stage
    fileInput = document.getElementById("fileInput")
    presetInput = document.getElementById("presets")
    imageInput = document.getElementById("imageInput")
    canvasInput = document.getElementById("imageInputCanvas")
    autoProcessCheckbox = document.getElementById("autoProcessCheckbox")
    processButton = document.getElementById("processButton")

    fileInput.addEventListener("change", (event) => {
		let selectedFile = event.target.files[0]
		let reader = new FileReader()

		reader.onload = function(event) {
			imageInput.src = event.target.result
		}
		
		reader.readAsDataURL(selectedFile)
	})
    imageInput.addEventListener("load", (event) => {
        let canvasContext = canvasInput.getContext("2d")
        canvasInput.width = imageInput.width
        canvasInput.height = imageInput.height
        canvasContext.drawImage(imageInput, 0, 0)
        fullUpdate = true
        onSettingChange()
    })
    processButton.addEventListener("click", () => {
        fullUpdate = true
        process()
    })

    // Pre-quantize Stage
    preQuantizeStageList = document.getElementById("preQuantizeStageList")
    preQuantizeStageSelect = document.getElementById("preQuantizeStageSelect")

    preQuantizeStageSelect.addEventListener("change", (event) => {
        addPreQuantizeFilter(event.target.value)
        preQuantizeStageSelect.value = ""
    })

    // Quantize Stage
    nColorsInput = document.getElementById("nColors")
    ditherModeInput = document.getElementById("ditherMode")
    quantizeCanvas = document.getElementById("quantizeCanvas")

    nColorsInput.addEventListener("change", () => {
        quantizeUpdate = true
        onSettingChange()
    })
    ditherModeInput.addEventListener("change", () => {
        quantizeUpdate = true
        onSettingChange()
    })

    // Post-quantize Stage
    postQuantizeStageList = document.getElementById("postQuantizeStageList")
    postQuantizeStageSelect = document.getElementById("postQuantizeStageSelect")

    postQuantizeStageSelect.addEventListener("change", (event) => {
        addPostQuantizeFilter(event.target.value)
        postQuantizeStageSelect.value = ""
    })

    // Output Stage
    saveOutputButton = document.getElementById("saveOutputButton")

    // Preview Stage
    savePreviewButton = document.getElementById("savePreviewButton")
}

function onSettingChange() {
    if (autoProcessCheckbox.checked) {
        process()
    }
}

window.addEventListener("load", function() {
    loadPageElements()
    registerPreFilters()
    registerPostFilters()
})
