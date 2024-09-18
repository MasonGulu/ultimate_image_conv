function forEachImageData(imageData, f) {
    for (let i = 0; i < imageData.height; i++) {
        for (let j = 0; j < imageData.width; j++) {
            let index   = (i*4) * imageData.width + (j*4)
            let red     = imageData.data[index]
            let green   = imageData.data[index+1]
            let blue    = imageData.data[index+2]
            let alpha   = imageData.data[index+3]
            let [nred, ngreen, nblue, nalpha] = f(red, green, blue, alpha)
            imageData.data[index]   = nred
            imageData.data[index+1] = ngreen
            imageData.data[index+2] = nblue
            imageData.data[index+3] = nalpha
        }
    }

}

class PreQuantizeFilter {
    /** 
     * @param {String} label 
     */
    constructor(label) {
        this.div = document.createElement("div")
        this.div.className = "element"
        let deleteButtonElement = document.createElement("button")
        deleteButtonElement.innerHTML = "🗑"
        deleteButtonElement.addEventListener("click", (event) => {
            removePreQuantizeFilter(this)
        })
        this.div.append(deleteButtonElement)
        let labelElement = document.createElement("h3")
        // labelElement.style = "display:inline"
        this.label = label
        labelElement.innerHTML = label
        this.div.append(labelElement)
    }
    /**
     * @param {HTMLCanvasElement} input
     * @param {HTMLCanvasElement} output
     */
    process(input, output) {
        if (this.outputCanvas != null) {
            this.div.removeChild(this.outputCanvas)
        } else {
            // first time running add linebreak
            this.div.appendChild(document.createElement("br"))
        }
        this.outputCanvas = output
        this.div.appendChild(output)
        output.width = input.width
        output.height = input.height
    }
}

class MonochromeFilter extends PreQuantizeFilter {
    label = "Monochrome"
    constructor() {
        super("Monochrome")
    }
    /**
     * @param {HTMLCanvasElement} input
     * @param {HTMLCanvasElement} output
     */
    process(input, output) {
        super.process(input, output)
        let outputCtx = output.getContext("2d")
        let inputCtx = input.getContext("2d")
        let imageData = inputCtx.getImageData(0, 0, input.width, input.height)
        forEachImageData(imageData, function(red,green,blue,alpha) {
            let average = (red+green+blue)/3
            return [average, average, average, alpha]
        })
        outputCtx.putImageData(imageData, 0, 0)
    }
}

class LevelsFilter extends PreQuantizeFilter {
    label = "Levels"
    addLevelInput(str) {
        let label = document.createElement("label")
        label.innerHTML = str
        let input = document.createElement("input")
        input.type = "range"
        input.min = 0
        input.max = 1
        input.step = 0.05
        input.value = 1
        input.addEventListener("change", (event) => {
            this.updated = true
            onSettingChange()
        })
        this.div.appendChild(label)
        this.div.appendChild(input)
        return input
    }
    constructor() {
        super("Levels")
        this.redLevelInput = this.addLevelInput("Red")
        this.greenLevelInput = this.addLevelInput("Green")
        this.blueLevelInput = this.addLevelInput("Blue")
    }

    process(input, output) {
        super.process(input, output)
        let outputCtx = output.getContext("2d")
        let inputCtx = input.getContext("2d")
        let imageData = inputCtx.getImageData(0, 0, input.width, input.height)
        let redLevel = this.redLevelInput.value
        let greenLevel = this.greenLevelInput.value
        let blueLevel = this.blueLevelInput.value
        forEachImageData(imageData, function(red,green,blue,alpha) {
            return [red * redLevel, green * greenLevel, blue * blueLevel, alpha]
        })
        outputCtx.putImageData(imageData, 0, 0)
    }
}

class NoiseFilter extends PreQuantizeFilter {
    addLevelInput(str) {
        let label = document.createElement("label")
        label.innerHTML = `${str} (1)`
        let input = document.createElement("input")
        input.type = "range"
        input.min = 0
        input.max = 255
        input.step = 1
        input.value = 255
        input.addEventListener("change", (event) => {
            label.innerHTML = `${str} (${event.target.value})`
            this.updated = true
            onSettingChange()
        })
        let button = document.createElement("button")
        button.innerHTML = "Refresh"
        button.addEventListener("click", (event) => {
            this.updated = true
            onSettingChange()
        })
        this.div.appendChild(label)
        this.div.appendChild(input)
        this.div.appendChild(button)
        return input
    }
    constructor() {
        super("Noise")
        this.noiseStrengthInput = this.addLevelInput("Strength")
        let rgbLabel = document.createElement("label")
        rgbLabel.innerHTML = "RGB Noise"
        this.div.appendChild(rgbLabel)
        this.rgbInput = document.createElement("input")
        this.rgbInput.type = "checkbox"
        this.rgbInput.addEventListener("change", () => {
            this.updated = true
            onSettingChange()
        })
        this.div.appendChild(this.rgbInput)
    }
    process(input, output) {
        super.process(input, output)
        let outputCtx = output.getContext("2d")
        let inputCtx = input.getContext("2d")
        let imageData = inputCtx.getImageData(0, 0, input.width, input.height)
        let noiseStrength = this.noiseStrengthInput.value
        let rgbNoise = this.rgbInput.checked
        forEachImageData(imageData, function(red,green,blue,alpha) {
            if (rgbNoise) {
                let rnoise = (Math.random() * noiseStrength) - (noiseStrength / 2)
                let gnoise = (Math.random() * noiseStrength) - (noiseStrength / 2)
                let bnoise = (Math.random() * noiseStrength) - (noiseStrength / 2)
                return [red + rnoise, green + gnoise, blue + bnoise, alpha]
            }
            let noise = (Math.random() * noiseStrength) - (noiseStrength / 2)
            return [red + noise, green + noise, blue + noise, alpha]
        })
        outputCtx.putImageData(imageData, 0, 0)
    }
}

function registerPreFilters() {
    registerPreQuantizeFilter("Monochrome", MonochromeFilter)
    registerPreQuantizeFilter("Levels", LevelsFilter)
    registerPreQuantizeFilter("Noise", NoiseFilter)
}