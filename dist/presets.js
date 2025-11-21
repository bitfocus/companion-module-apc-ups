'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.GetPresetList = GetPresetList
const base_1 = require('@companion-module/base')
function GetPresetList() {
	const presets = {}
	presets[`battery`] = {
		type: 'button',
		category: 'Status',
		name: `Battery status`,
		style: {
			text: `UPS BAT\\n$(APC_UPS_Monitor:battery_capacity) %`,
			size: 'auto',
			color: (0, base_1.combineRgb)(255, 255, 255),
			bgcolor: (0, base_1.combineRgb)(0, 153, 0),
		},
		steps: [
			{
				down: [],
				up: [],
			},
		],
		feedbacks: [],
	}
	return presets
}
//# sourceMappingURL=presets.js.map
