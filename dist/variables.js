'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.initVariables = initVariables
exports.checkVariables = checkVariables
const { InstanceStatus } = require('@companion-module/base')
function initVariables(instance) {
	let variables = []
	variables.push({ variableId: 'ups_type', name: 'UPS Type' })
	variables.push({ variableId: 'battery_capacity', name: 'Battery capacity' })
	variables.push({ variableId: 'battery_runtime_remain', name: 'Battery runtime remain' })
	instance.setVariableDefinitions(variables)
	let startValues = {}
	startValues['ups_type'] = ''
	startValues['battery_capacity'] = ''
	startValues['battery_runtime_remain'] = ''
	instance.setVariableValues(startValues)
}
function checkVariables(instance) {
	try {
		let variables = {}
		variables['ups_type'] = instance.APC_Data.ups_type
		variables['battery_capacity'] = instance.APC_Data.battery_capacity
		variables['battery_runtime_remain'] = instance.APC_Data.battery_runtime_remain
		instance.setVariableValues(variables)
	} catch (error) {
		instance.updateStatus(InstanceStatus.UnknownWarning)
		instance.log('error', `Error checking variables: ${error.toString()}`)
	}
}
//# sourceMappingURL=variables.js.map
