import type { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'
import type { DeviceConfig } from './config.js'
import type { InstanceBaseExt } from './utils.js'

import { InstanceStatus } from '@companion-module/base'

export function initVariables(instance: InstanceBaseExt<DeviceConfig>): void {
	const variables: CompanionVariableDefinition[] = []

	variables.push({ variableId: 'ups_type', name: 'UPS Type' })
	variables.push({ variableId: 'battery_capacity', name: 'Battery capacity' })
	variables.push({ variableId: 'battery_runtime_remain', name: 'Battery runtime remain' })

	instance.setVariableDefinitions(variables)

	const startValues: CompanionVariableValues = {}

	startValues['ups_type'] = ''
	startValues['battery_capacity'] = ''
	startValues['battery_runtime_remain'] = ''

	instance.setVariableValues(startValues)
}

export function checkVariables(instance: InstanceBaseExt<DeviceConfig>): void {
	try {
		const variables: CompanionVariableValues = {}

		variables['ups_type'] = instance.APC_Data.ups_type
		variables['battery_capacity'] = instance.APC_Data.battery_capacity
		variables['battery_runtime_remain'] = instance.APC_Data.battery_runtime_remain
		instance.setVariableValues(variables)
	} catch (error: any) {
		instance.updateStatus(InstanceStatus.UnknownWarning)
		instance.log('error', `Error checking variables: ${error.toString()}`)
	}
}
