import { type CompanionVariableDefinition, InstanceStatus } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { UPS_OID_VARIABLE_NAMES } from './oids.js'

export function initVariables(instance: ModuleInstance): void {
	const variables: CompanionVariableDefinition[] = []
	for (const [k, v] of Object.entries(UPS_OID_VARIABLE_NAMES) as [
		keyof typeof UPS_OID_VARIABLE_NAMES,
		(typeof UPS_OID_VARIABLE_NAMES)[keyof typeof UPS_OID_VARIABLE_NAMES],
	][]) {
		variables.push({ variableId: k, name: v })
	}

	instance.setVariableDefinitions(variables)

	instance.setVariableValues(instance.APC_Data)
}

export function checkVariables(instance: ModuleInstance): void {
	try {
		instance.setVariableValues(instance.APC_Data)
	} catch (error: any) {
		instance.updateStatus(InstanceStatus.UnknownWarning)
		instance.log('error', `Error checking variables: ${error.toString()}`)
	}
}
