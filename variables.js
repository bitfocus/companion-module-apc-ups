const { InstanceStatus } = require('@companion-module/base')

module.exports = {
	initVariables(instance) {
		let variables = []

		variables.push({ variableId: 'ups_type', name: 'UPS Type' })
		variables.push({ variableId: 'battery_capacity', name: 'Battery capacity' })
		variables.push({ variableId: 'battery_runtime_remain', name: 'Battery runtime remain' })

		instance.setVariableDefinitions(variables)

		let startValues = {}

		startValues.ups_type = ''
		startValues.battery_capacity = ''
		startValues.battery_runtime_remain = ''

		instance.setVariableValues(startValues)
	},

	checkVariables(instance) {
		try {
			let variables = {}
		
			variables.ups_type = this.ups_type
			variables.battery_capacity = this.battery_capacity
            variables.battery_runtime_remain = this.battery_runtime_remain

			instance.setVariableValues(variables)
		}
		catch(error) {
			this.updateStatus(InstanceStatus.UnknownWarning)
			this.log('error',  `Error checking variables: ${error.toString()}`);
		}
	}
}