"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPresetList = void 0;
const base_1 = require("@companion-module/base");
function GetPresetList() {
    const presets = {};
    presets[`battery`] = {
        type: 'button',
        category: 'Status',
        name: `Battery status`,
        style: {
            text: `UPS BAT\\n$(APC_UPS_Monitor:battery_capacity) %`,
            size: 'auto',
            color: (0, base_1.combineRgb)(0, 153, 0),
            bgcolor: (0, base_1.combineRgb)(0, 0, 0),
        },
        steps: [
            {
                down: [],
                up: [],
            },
        ],
        feedbacks: [],
    };
    return presets;
}
exports.GetPresetList = GetPresetList;
//# sourceMappingURL=presets.js.map