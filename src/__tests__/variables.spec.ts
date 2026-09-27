import { describe, expect, it, vi } from 'vitest'
import { InstanceStatus, type CompanionVariableDefinitions } from '@companion-module/base'
import { checkVariables, initVariables, type VariablesSchema } from '../variables.js'
import { createDefaultUPSData, UPS_OIDS } from '../oids.js'
import type ModuleInstance from '../main.js'

function fakeInstance() {
	const setVariableDefinitions = vi.fn<(defs: CompanionVariableDefinitions<VariablesSchema>) => void>()
	const setVariableValues = vi.fn<(values: Partial<VariablesSchema>) => void>()
	const updateStatus = vi.fn()
	const log = vi.fn()
	const self = {
		APC_Data: createDefaultUPSData(),
		setVariableDefinitions,
		setVariableValues,
		updateStatus,
		log,
	} as unknown as ModuleInstance
	return { self, setVariableDefinitions, setVariableValues, updateStatus, log }
}

describe('initVariables', () => {
	it('defines one variable per polled OID, keyed by variable id', () => {
		const { self, setVariableDefinitions } = fakeInstance()

		initVariables(self)

		const defs = setVariableDefinitions.mock.calls[0][0]
		expect(Object.keys(defs).sort()).toEqual(Object.keys(UPS_OIDS).sort())
		expect(defs.battery_capacity).toEqual({ name: 'Battery capacity (%)' })
		expect(defs.output_status).toEqual({ name: 'Output status' })
	})

	it('publishes the current values straight away', () => {
		const { self, setVariableValues } = fakeInstance()

		initVariables(self)

		expect(setVariableValues).toHaveBeenCalledWith(self.APC_Data)
	})
})

describe('checkVariables', () => {
	it('reports a warning rather than throwing when the values are rejected', () => {
		const { self, setVariableValues, updateStatus, log } = fakeInstance()
		setVariableValues.mockImplementation(() => {
			throw new Error('rejected')
		})

		expect(() => checkVariables(self)).not.toThrow()
		expect(updateStatus).toHaveBeenCalledWith(InstanceStatus.UnknownWarning)
		expect(log).toHaveBeenCalledWith('error', 'Error checking variables: Error: rejected')
	})
})
