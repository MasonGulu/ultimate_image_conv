function deepClone(a) {
    let na = []
    for (let i = 0; i < a.length; i++) {
        if (Array.isArray(a[i])) {
            na[i] = deepClone(a[i])
        } else {
            na[i] = a[i]
        }
    }
    return na
}

class QuantizedImage {
    constructor(data, width, height, palette) {
        this.data = data
        this.width = width
        this.height = height
        this.palette = palette
    }

    process(imageData, nColors, ditherMode, palette) {
        let opts = {
            "colors": nColors,
            "palette": palette
        }
        if (ditherMode == "None") ditherMode = null
        let q = new RgbQuant(opts)
        if (this.palette == null) {
            q.sample(imageData)
            this.palette = q.palette(true)
        }
        this.width = imageData.width
        this.height = imageData.height
        this.data = q.reduce(imageData, 2, ditherMode)
    }

    render() {
        let imageData = new ImageData(this.width, this.height)
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let index = y * this.width + x
                let color = this.palette[this.data[index]]
                let i = index * 4
                imageData.data[i] = color[0]
                imageData.data[i+1] = color[1]
                imageData.data[i+2] = color[2]
                imageData.data[i+3] = 255
            }
        }
        return imageData
    }

    copy() {
        return new QuantizedImage(deepClone(this.data), this.width, this.height, deepClone(this.palette))
    }
}
