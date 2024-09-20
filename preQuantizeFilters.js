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
        labeledButton("🗑", this.div, (event) => {
            removePreQuantizeFilter(this)
        })
        labeledButton("⬆", this.div, (event) => {
            movePreQuantizeFilter(this.index, -1)
        })
        labeledButton("⬇", this.div, (event) => {
            movePreQuantizeFilter(this.index, 1)
        })
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

class NormalizeFilter extends PreQuantizeFilter {
    label = "Normalize"
    constructor() {
        super("Normalize")
        this.normalizeRed = labeledCheckbox("Red", this.div)
        this.normalizeRed.addEventListener("change", () => {
            this.updated = true
            onSettingChange()
        })
        this.normalizeGreen = labeledCheckbox("Green", this.div)
        this.normalizeGreen.addEventListener("change", () => {
            this.updated = true
            onSettingChange()
        })
        this.normalizeBlue = labeledCheckbox("Blue", this.div)
        this.normalizeBlue.addEventListener("change", () => {
            this.updated = true
            onSettingChange()
        })
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
        let maxRed = 1
        let maxGreen = 1
        let maxBlue = 1
        forEachImageData(imageData, function(red,green,blue,alpha) {
            maxRed = Math.max(red, maxRed)
            maxGreen = Math.max(green, maxGreen)
            maxBlue = Math.max(blue, maxBlue)
            return [red,green,blue,alpha]
        })
        let normalizeRed = this.normalizeRed.checked
        let normalizeBlue = this.normalizeBlue.checked
        let normalizeGreen = this.normalizeGreen.checked
        forEachImageData(imageData, function(red,green,blue,alpha) {
            if (normalizeRed) {
                red = (red / maxRed) * 255
            }
            if (normalizeBlue) {
                blue = (blue / maxBlue) * 255
            }
            if (normalizeGreen) {
                green = (green / maxGreen) * 255
            }
            return [red,green,blue,alpha]
        })
        outputCtx.putImageData(imageData, 0, 0)
    }
}

class LevelsFilter extends PreQuantizeFilter {
    label = "Levels"
    addLevelInput(str) {
        let input = labeledInput(str, this.div)
        input.type = "range"
        input.min = 0
        input.max = 1
        input.step = 0.05
        input.value = 1
        input.addEventListener("change", (event) => {
            this.updated = true
            onSettingChange()
        })
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
        let input = labeledInput(str, this.div)
        input.type = "range"
        input.min = 0
        input.max = 255
        input.step = 1
        input.value = 255
        input.addEventListener("change", (event) => {
            this.updated = true
            onSettingChange()
        })
        return input
    }
    constructor() {
        super("Noise")
        this.noiseStrengthInput = this.addLevelInput("Strength")
        let button = document.createElement("button")
        button.innerHTML = "Refresh"
        button.addEventListener("click", (event) => {
            this.updated = true
            onSettingChange()
        })
        this.div.appendChild(button)
        this.rgbInput = labeledCheckbox("RGB Noise", this.div)
        this.rgbInput.addEventListener("change", () => {
            this.updated = true
            onSettingChange()
        })
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

class RGB2YCbCrFilter extends PreQuantizeFilter {
    label = "RGB to YCbCr"
    constructor() {
        super("RGB to YCbCr")
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
            let y = 0.299 * red + 0.587 * green + 0.114 * blue
            let cb = 128 - 0.168736 * red - 0.331264 * green + 0.5 * blue
            let cr = 128 + 0.5 * red - 0.418668 * green - 0.081312 * blue
            return [y, cb, cr, alpha]
        })
        outputCtx.putImageData(imageData, 0, 0)
    }
}
class YCbCr2RGBFilter extends PreQuantizeFilter {
    label = "YCbCr to RGB"
    constructor() {
        super("YCbCr to RGB")
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
        forEachImageData(imageData, function(y,cb,cr,alpha) {
            let r = y + 1.402 * (cr - 128)
            let g = y - 0.344136 * (cb - 128) - 0.714136 * (cr - 128)
            let b = y + 1.772 * (cb - 128)
            return [r, g, b, alpha]
        })
        outputCtx.putImageData(imageData, 0, 0)
    }
}
function deg(angle) {
    return angle * (180 / Math.PI)
}
class RGB2HSIFilter extends PreQuantizeFilter {
    label = "RGB to HSI"
    constructor() {
        super("RGB to HSI")
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
        forEachImageData(imageData, function(r,g,b,alpha) {
            r /= 255
            g /= 255
            b /= 255
            let numerator = 0.5 * ((r - g) + (r - b));
            let denominator = Math.sqrt((r - g) ** 2 + (r - b) * (g - b))
            let argument = denominator === 0 ? 0 : numerator / denominator
            argument = Math.max(-1, Math.min(argument, 1))
            let theta = deg(Math.acos(argument))
            let minRGB = Math.min(r, g, b)
            let sumRGB = r + g + b
            let s = sumRGB === 0 ? 0 : 1 - (3 / sumRGB) * minRGB
            let i = (r + g + b) / 3
            let h = b > g ? 360 - theta : theta
            h = h % 360
            if (h < 0) h += 360
            return [(h / 360) * 255, s * 255, i * 255, alpha]
        })
        outputCtx.putImageData(imageData, 0, 0)
    }
}
function rad(angle) {
    return angle * (Math.PI / 180)
}
class HSI2RGBFilter extends PreQuantizeFilter {
    label = "HSI to RGB"
    constructor() {
        super("HSI to RGB")
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
        forEachImageData(imageData, function(h,s,i,alpha) {
            let r, g, b
            s /= 255
            i /= 255
            h = (h / 255) * 360
            if (h >= 0 && h < 120) {
                b = i * (1 - s)
                r = i * (1 + (s * Math.cos(rad(h))) / Math.cos(rad(60 - h)))
                g = 3 * i - (r + b)
            } else if (h >= 120 && h < 240) {
                h = h - 120
                r = i * (1 - s)
                g = i * (1 + (s * Math.cos(rad(h))) / Math.cos(rad(60 - h)))
                b = 3 * i - (r + g)
            } else {
                h = h - 240
                g = i * (1 - s)
                b = i * (1 + (s * Math.cos(rad(h))) / Math.cos(rad(60 - h)))
                r = 3 * i - (g + b)
            }
            r = Math.min(Math.max(r, 0), 1);
            g = Math.min(Math.max(g, 0), 1);
            b = Math.min(Math.max(b, 0), 1);
            return [r * 255, g * 255, b * 255, alpha]
        })
        outputCtx.putImageData(imageData, 0, 0)
    }
}

function registerPreFilters() {
    registerPreQuantizeFilter("Monochrome", MonochromeFilter)
    registerPreQuantizeFilter("Levels", LevelsFilter)
    registerPreQuantizeFilter("Noise", NoiseFilter)
    registerPreQuantizeFilter("RGB to YCbCr", RGB2YCbCrFilter)
    registerPreQuantizeFilter("YCbCr to RGB", YCbCr2RGBFilter)
    registerPreQuantizeFilter("RGB to HSI", RGB2HSIFilter)
    registerPreQuantizeFilter("HSI to RGB", HSI2RGBFilter)
    registerPreQuantizeFilter("Normalize", NormalizeFilter)
}