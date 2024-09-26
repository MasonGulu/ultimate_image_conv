
/** @param {QuantizedImage} quant */
function scaleForPreview(quant, sx, sy) {
    let newData = []
    for (let line = 0; line < quant.height; line++) {
        let thisLine = []
        for (let col = 0; col < quant.width; col++) {
            let idx = line * quant.width + col
            let pixel = quant.data[idx]
            for (let x = 0; x < sx; x++) {
                thisLine.push(pixel)
            }
        }
        for (let y = 0; y < sy; y++) {
            newData = newData.concat(thisLine)
        }
    }
    return new QuantizedImage(newData, quant.width * sx, quant.height * sy, quant.palette)
}
function rgbArrToRgbTuples(arr) {
	var newArr = []
	for (fullrgb of arr) {
		newArr.push([
			fullrgb >> 16,
			(fullrgb >> 8) & 0xFF,
			fullrgb & 0xFF,
		])
	}
	return newArr
}
let presets = {}

// CGA Modes
presets["CGA 1b"] = {
    "scale": {
        "mode": "Stretch",
        "w": 640,
        "h": 200,
        "locked": true
    },
    "preQuantize": [],
    "quantize": {
        "palette": [[0,0,0],[0xFF,0xFF,0xFF]],
        "locked": true
    },
    "postQuantize": [],
    "preview": (quant) => {
        return scaleForPreview(quant, 1, 2)
    }
}
// should probably think of a better way to do this
// These are pre-assembled .COM files https://github.com/MasonGulu/CGA-Image-Maker/tree/master/src/com
let comHeaders = {
    //                 *         *
    "2b0H": "uAC4Bo7AuAQAzRC62QOwEO65QD++NwG/AACc/POknbgAAM0WsAI8A3QFuAMAzRAHtEywAM0hyw==",
    "2b0L": "uAC4Bo7AuAQAzRC62QOwAO65QD++NwG/AACc/POknbgAAM0WsAI8A3QFuAMAzRAHtEywAM0hyw==",
    "2b1H": "uAC4Bo7AuAQAzRC62QOwMO65QD++NwG/AACc/POknbgAAM0WsAI8A3QFuAMAzRAHtEywAM0hyw==",
    "2b1L": "uAC4Bo7AuAQAzRC62QOwIO65QD++NwG/AACc/POknbgAAM0WsAI8A3QFuAMAzRAHtEywAM0hyw==",
    "2b5H": "uAC4Bo7AuAUAzRC62QOwEO65QD++NwG/AACc/POknbgAAM0WsAI8A3QFuAMAzRAHtEywAM0hyw==",
    "2b5L": "uAC4Bo7AuAUAzRC62QOwAO65QD++NwG/AACc/POknbgAAM0WsAI8A3QFuAMAzRAHtEywAM0hyw=="
}
function save2bppCGA(mode, quant) {
    let data = Array.from(atob(comHeaders[mode]), c => c.charCodeAt(0))
    let even = []
    let odd = []
    for (let line = 0; line < quant.height; line++) {
        let lineData = []
        for (let col = 0; col < quant.width; col+=4) {
            // 4 pixels per byte
            let index = line * quant.width + col
            let byte = quant.data[index] << 6
            byte |= quant.data[index + 1] << 4
            byte |= quant.data[index + 2] << 2
            byte |= quant.data[index + 3]
            lineData.push(byte)
        }
        if (line % 2 == 0) {
            even.push(...lineData)
        } else {
            odd.push(...lineData)
        }
    }
    data.push(...even)
    let padding = Array.apply(null, Array(192)).map(function (x, i) { return 0; })
    data.push(...padding)
    data.push(...odd)
    return data
}
presets["CGA 2b0L"] = {
    "scale": {
        "mode": "Stretch",
        "w": 320,
        "h": 200,
        "locked": true
    },
    "preQuantize": [],
    "quantize": {
        "palette": [[0,0,0],[0, 0xaa, 0],[0xaa,0,0],[0xaa,0x55,0]],
        "locked": true
    },
    "postQuantize": [],
    "export": {
        "extension": ".com",
        "func": (quant) => {
            return save2bppCGA("2b0L", quant)
        },
    }
}
presets["CGA 2b0H"] = {
    "scale": {
        "mode": "Stretch",
        "w": 320,
        "h": 200,
        "locked": true
    },
    "preQuantize": [],
    "quantize": {
        "palette": rgbArrToRgbTuples([0, 0x55ff55, 0xff5555, 0xffff55]),
        "locked": true
    },
    "postQuantize": [],
    "export": {
        "extension": ".com",
        "func": (quant) => {
            return save2bppCGA("2b0H", quant)
        },
    }
}
presets["CGA 2b1L"] = {
    "scale": {
        "mode": "Stretch",
        "w": 320,
        "h": 200,
        "locked": true
    },
    "preQuantize": [],
    "quantize": {
        "palette": rgbArrToRgbTuples([0, 0x00aaaa, 0xaa00aa, 0xaaaaaa]),
        "locked": true
    },
    "postQuantize": [],
    "export": {
        "extension": ".com",
        "func": (quant) => {
            return save2bppCGA("2b1L", quant)
        },
    }
}
presets["CGA 2b1H"] = {
    "scale": {
        "mode": "Stretch",
        "w": 320,
        "h": 200,
        "locked": true
    },
    "preQuantize": [],
    "quantize": {
        "palette": rgbArrToRgbTuples([0, 0x55ffff, 0xff55ff, 0xffffff]),
        "locked": true
    },
    "postQuantize": [],
    "export": {
        "extension": ".com",
        "func": (quant) => {
            return save2bppCGA("2b1H", quant)
        },
    }
}
presets["CGA 2b5L"] = {
    "scale": {
        "mode": "Stretch",
        "w": 320,
        "h": 200,
        "locked": true
    },
    "preQuantize": [],
    "quantize": {
        "palette": rgbArrToRgbTuples([0, 0x00aaaa, 0xaa0000, 0xaaaaaa]),
        "locked": true
    },
    "postQuantize": [],
    "export": {
        "extension": ".com",
        "func": (quant) => {
            return save2bppCGA("2b5L", quant)
        },
    }
}
presets["CGA 2b5H"] = {
    "scale": {
        "mode": "Stretch",
        "w": 320,
        "h": 200,
        "locked": true
    },
    "preQuantize": [],
    "quantize": {
        "palette": rgbArrToRgbTuples([0, 0x55ffff, 0xff5555, 0xffffff]),
        "locked": true
    },
    "postQuantize": [],
    "export": {
        "extension": ".com",
        "func": (quant) => {
            return save2bppCGA("2b5H", quant)
        },
    }
}

// ComputerCraft Modes
let CCPalette = [[240, 240, 240],[242, 178, 51],[229, 127, 216],[153, 178, 242],[222, 222, 108],[127, 204, 25],[242, 178, 204],[76, 76, 76],[153, 153, 153],[76, 153, 178],[178, 102, 229],[51, 102, 204],[127, 102, 76],[87, 166, 78],[204, 76, 76],[17, 17, 17]]
/**
 * 
 * @param {QuantizedImage} quant 
 * @param {number} x 
 * @param {number} y
 * @returns {[number, number, number]} 
 */
function getBlitCharacter(quant, x, y) {
    let fg = 0
    let bg = 0
    let char = 0

    return [fg, bg, char]
}
presets["CC BIMG"] = {
        "scale": {
            "mode": "Scale To Fit",
            "w": 51 * 2,
            "h": 19 * 3,
        },
        "preQuantize": [],
        "quantize": {
            "palette": CCPalette,
            "n": 16
        },
        "postQuantize": [
            {"name": "Chunk", "w": 2, "h": 3, "n": 2}
        ]
}
presets["CC BBF"] = {
    "scale": {
        "mode": "Scale To Fit",
        "w": 51 * 2,
        "h": 19 * 3,
    },
    "preQuantize": [],
    "quantize": {
        "palette": CCPalette,
        "n": 16
    },
    "postQuantize": [
        {"name": "Chunk", "w": 2, "h": 3, "n": 2}
    ]
}
presets["CC NFP"] = {
    "scale": {
        "mode": "Scale To Fit",
        "w": 51,
        "h": 19,
    },
    "preQuantize": [],
    "quantize": {
        "palette": CCPalette,
        "n": 16
    },
    "postQuantize": [],
    "preview": (quant) => {
        return scaleForPreview(quant, 2, 3)
    },
    "export": {
        "extension": ".nfp",
        "func": (quant) => {
            let data = []
            for (let y = 0; y < quant.height; y++) {
                for (let x = 0; x < quant.width; x++) {
                    let index = y * quant.width + x
                    data.push(quant.data[index].toString(16).charCodeAt(0))
                }
                data.push("\n".charCodeAt(0))
            }
            return data
        }
    }
}

let presetPalette = []
let selectedPreset = null
function setPreset(name) {
    preQuantizePresetStageList.innerHTML = null
    preQuantizePresetStages = []
    postQuantizePresetStageList.innerHTML = null
    postQuantizePresetStages = []
    paletteMode.value = "Custom"
    paletteMode.disabled = false
    paletteMode.dispatchEvent(new Event("change"))
    imageScaleMode.disabled = false
    imageWidthInput.disabled = false
    imageHeightInput.disabled = false
    imageScalePresets.disabled = false
    nColorsInput.disabled = false
    saveOutputButton.disabled = true
    let preset = presets[name]
    selectedPreset = preset
    if (preset == null) return
    for (let i in preset.preQuantize) {
        let info = preset.preQuantize[i]
        addPreQuantizeFilter(info.name, true, info)
    }

    if (preset.scale) {
        let imageScaleLocked = preset.scale.locked
        imageScaleMode.disabled = imageScaleLocked
        imageWidthInput.disabled = imageScaleLocked
        imageHeightInput.disabled = imageScaleLocked
        imageScalePresets.disabled = imageScaleLocked
        imageWidthInput.value = preset.scale.w
        imageHeightInput.value = preset.scale.h
        imageScaleMode.value = preset.scale.mode
        fullUpdate = true
    }
    saveOutputButton.disabled = preset.export == null

    presetPalette = preset.quantize.palette
    paletteInput.value = JSON.stringify(presetPalette)
    paletteMode.value = "Preset"
    paletteMode.disabled = preset.quantize.locked
    if (preset.quantize.n) {
        nColorsInput.disabled = true
        nColorsInput.value = preset.quantize.n
    }
    paletteMode.dispatchEvent(new Event("change"))
    for (let i in preset.postQuantize) {
        let info = preset.postQuantize[i]
        addPostQuantizeFilter(info.name, true, info)
    }
}