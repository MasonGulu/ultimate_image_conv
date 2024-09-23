let CCPalette = [[240, 240, 240],[242, 178, 51],[229, 127, 216],[153, 178, 242],[222, 222, 108],[127, 204, 25],[242, 178, 204],[76, 76, 76],[153, 153, 153],[76, 153, 178],[178, 102, 229],[51, 102, 204],[127, 102, 76],[87, 166, 78],[204, 76, 76],[17, 17, 17]]

let presets = {
    "CGA 1bpp": {
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
        "preview": () => {},
        "export": {
            "extension": ".com",
            "func": () => {},
        }
    },
    "CC BIMG": {
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
        "preview": () => {},
        "export": {
            "extension": ".com",
            "func": () => {},
        }
    }
}

let presetPalette = []
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