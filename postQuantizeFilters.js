
class PostQuantizeFilter {
    /** 
     * @param {String} label 
     */
    constructor(label, desc, locked) {
        this.div = document.createElement("div")
        this.div.className = "element"
        if (locked) {
            this.div.className = "element preset"
        }
        if (!locked) {
            let deleteButtonElement = document.createElement("button")
            deleteButtonElement.innerHTML = "🗑"
            deleteButtonElement.addEventListener("click", (event) => {
                removePostQuantizeFilter(this)
            })
            this.div.append(deleteButtonElement)
        }
        let labelElement = document.createElement("h3")
        // labelElement.style = "display:inline"
        this.label = label
        labelElement.innerHTML = label
        this.div.append(labelElement)
        if (desc != null) {
            let descElement = document.createElement("p")
            descElement.innerHTML = desc
            this.div.append(descElement)
        }
    }

    /** @param {QuantizedImage} quant */
    process(quant) {
        if (this.outputCanvas == null) {
            this.div.appendChild(document.createElement("br"))
            this.outputCanvas = document.createElement("canvas")
            this.div.appendChild(this.outputCanvas)
        }
        this.outputCanvas.width = quant.width
        this.outputCanvas.height = quant.height
    }
}

function forEachChunk(q, x0, y0, w, h, func) {
    for (let y = y0; y < y0 + h; y++) {
        for (let x = x0; x < x0 + w; x++) {
            if (x >= q.width) continue
            if (y >= q.height) continue
            let i = y * q.width + x
            func(i)
        }
    }
}

/**
 * 
 * @param {QuantizedImage} q 
 * @param {*} x0 
 * @param {*} y0 
 * @param {*} w 
 * @param {*} h 
 */
function chunkHistogram(q, x0, y0, w, h) {
    let hist = []
    forEachChunk(q, x0, y0, w, h, (i) => {
        let color = q.data[i]
        hist[color] = (hist[color] || 0) + 1
    })
    return hist
}

function sortHistogram(a, wrong) {
    let list = []
    for (let i in a) {
        list.push({count:a[i],index:i})
    }
    list.sort((a, b) => {
        if (wrong) {
            return a.count > b.count
        }
        return a.count < b.count
    })
    return list
}

function calculateClosestColors(palette, sh, limit) {
    let lookup = []
    for (let fromIndex = 0; fromIndex < palette.length; fromIndex++) {
        let closest = 1000000000
        let from = palette[fromIndex]
        for (let toIndex = 0; toIndex < Math.min(sh.length, limit); toIndex++) {
            let to = palette[sh[toIndex].index]
            let dist = Math.sqrt((from[0] - to[0])**2 + (from[1] - to[1])**2 + (from[2] - to[2])**2)
            if (dist < closest) {
                closest = dist
                lookup[fromIndex] = sh[toIndex].index
            }
        }
    }
    return lookup
}

function isColorWithinFirstI(hist, color, i) {
    for (let j = 0; j < i; j++) {
        if (j >= hist.length) return false
        if (hist[j].index == color) return true
    }
    return false;
}

class ChunkFilter extends PostQuantizeFilter {
    label = "Chunk"
    addInput(label,locked) {
        let input = labeledInput(label, this.div)
        input.disabled = locked
        input.type = "number"
        input.min = 1
        input.value = 1
        input.addEventListener("change", (event) => {
            this.updated = true
            onSettingChange()
        })
        return input
    }
    constructor(locked, args) {
        super("Chunk", null, locked)
        this.blockWidthInput = this.addInput("Width", locked)
        this.blockHeightInput = this.addInput("Height", locked)
        this.blockColorInput = this.addInput("# Colors", locked)
        this.invertHistogram = labeledCheckbox("Invert Histogram", this.div)
        this.invertHistogram.disabled = locked
        this.invertHistogram.addEventListener("change", () => {
            onSettingChange()
        })
        args = args || {}
        this.blockWidthInput.value = args.w || 1
        this.blockHeightInput.value = args.h || 1
        this.blockColorInput.value = args.n || 1
    }

    /** @param {QuantizedImage} quant */
    process(quant) {
        super.process(quant)
        let blockW = Number(this.blockWidthInput.value)
        let blockH = Number(this.blockHeightInput.value)
        let blockColors = Number(this.blockColorInput.value)
        let blocksWide = quant.width / blockW
        let blocksTall = quant.height / blockH
        for (let blockY = 0; blockY < blocksTall; blockY++) {
            for (let blockX = 0; blockX < blocksWide; blockX++) {
                let sh = sortHistogram(chunkHistogram(quant, blockX * blockW, blockY * blockH, blockW, blockH),
                    this.invertHistogram.checked)
                let closestColors = calculateClosestColors(quant.palette, sh, blockColors)
                forEachChunk(quant, blockX * blockW, blockY * blockH, blockW, blockH, (i) => {
                    if (!isColorWithinFirstI(sh, quant.data[i], blockColors)) {
                        let newColor = closestColors[quant.data[i]]
                        quant.data[i] = newColor
                    }
                })
            }
        }
        let ctx = this.outputCanvas.getContext("2d")
        ctx.putImageData(quant.render(), 0, 0)
        return quant
    }
}

function registerPostFilters() {
    registerPostQuantizeFilter("Chunk", ChunkFilter)
}