
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

let presets = {}
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
    },
    "export": {
        "extension": ".com",
        "func": () => {},
    }
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
        "func": () => {},
    }
}
let CCPalette = [[240, 240, 240],[242, 178, 51],[229, 127, 216],[153, 178, 242],[222, 222, 108],[127, 204, 25],[242, 178, 204],[76, 76, 76],[153, 153, 153],[76, 153, 178],[178, 102, 229],[51, 102, 204],[127, 102, 76],[87, 166, 78],[204, 76, 76],[17, 17, 17]]
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
        ],
        "export": {
            "extension": ".bimg",
            "func": () => {},
        }
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
    ],
    "export": {
        "extension": ".bbf",
        "func": () => {},
    }
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
        "func": () => {},
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