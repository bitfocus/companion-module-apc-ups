import { type CompanionVariableDefinitions, InstanceStatus } from '@companion-module/base'
import type ModuleInstance from './main.js'
import { UPS_OID_VARIABLE_NAMES, type UPS_Oid_Data_Interface, type UpsFieldName } from './oids.js'

/** One variable per polled OID, keyed by the same name as the field in APC_Data */
export type VariablesSchema = UPS_Oid_Data_Interface

export function initVariables(instance: ModuleInstance): void {
	const variables = {} as CompanionVariableDefinitions<VariablesSchema>
	for (const [k, v] of Object.entries(UPS_OID_VARIABLE_NAMES) as [UpsFieldName, string][]) {
		variables[k] = { name: v }
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
