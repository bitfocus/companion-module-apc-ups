'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.GetConfigFields = GetConfigFields
const base_1 = require('@companion-module/base')
function GetConfigFields() {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 8,
			regex: base_1.Regex.IP,
		},
		{
			type: 'textinput',
			id: 'community',
			label: 'Community String',
			width: 8,
			regex: base_1.Regex.SOMETHING,
			default: 'public',
		},
		{
			type: 'number',
			id: 'pullingTime',
			label: 'Set interval to pull data in msec',
			width: 8,
			min: 5000,
			max: 86400000,
			default: 60000,
		},
	]
}
//# sourceMappingURL=config.js.map
