import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InstanceStatus } from '@companion-module/base'
import type snmp from 'snmp-native'
import ModuleInstance, { UpgradeScripts } from '../main.js'
import { UpgradeScripts as upgradeScriptsSource } from '../upgrades.js'
import { UPS_OIDS } from '../oids.js'
import type { DeviceConfig } from '../config.js'

type GetAllCallback = (error: Error | null, varbinds: snmp.VarBind[]) => void

const session = vi.hoisted(() => ({
	getAll: vi.fn<(options: { oids: number[][]; host: string; community: string }, callback: GetAllCallback) => void>(),
	close: vi.fn(),
}))

// Enough of InstanceBase to construct the module without a Companion host
vi.mock('@companion-module/base', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@companion-module/base')>()
	class InstanceBase {
		constructor(_internal: unknown) {}
		get id(): string {
			return 'test'
		}
		get label(): string {
			return 'APC_UPS_Monitor'
		}
		log(): void {}
		updateStatus(): void {}
		setVariableDefinitions(): void {}
		setVariableValues(): void {}
		setPresetDefinitions(): void {}
	}
	return { ...actual, InstanceBase }
})

// A real Session binds a UDP socket on construction
vi.mock('snmp-native', () => ({
	default: {
		Session: class {
			getAll = session.getAll
			close = session.close
		},
	},
}))

const config: DeviceConfig = { host: '192.0.2.10', community: 'public', pullingTime: 60000 }

// Synthetic: no capture from a real UPS is available yet. Raw values are in the units the transforms in oids.ts expect.
const varbind = (oid: readonly number[], value: unknown): snmp.VarBind => ({ oid: [...oid], value }) as snmp.VarBind
const varbinds = [
	varbind(UPS_OIDS.ups_type, 'Smart-UPS 1500'),
	varbind(UPS_OIDS.battery_capacity, 1000),
	varbind(UPS_OIDS.battery_replace, 1),
	varbind(UPS_OIDS.output_status, 2),
	varbind(UPS_OIDS.input_voltage, 2301),
]

describe('entry point', () => {
	it('exports the module class as default, and the upgrade scripts by name', () => {
		expect(new ModuleInstance({})).toBeInstanceOf(ModuleInstance)
		expect(UpgradeScripts).toBe(upgradeScriptsSource)
	})
})

describe('ModuleInstance', () => {
	let instance: ModuleInstance

	beforeEach(() => {
		vi.useFakeTimers()
		session.getAll.mockReset()
		session.close.mockReset()
		instance = new ModuleInstance({})
	})

	afterEach(async () => {
		await instance.destroy()
		vi.useRealTimers()
	})

	it('defines variables and presets, then reports bad config without a host', async () => {
		const setVariableDefinitions = vi.spyOn(instance, 'setVariableDefinitions')
		const setPresetDefinitions = vi.spyOn(instance, 'setPresetDefinitions')
		const updateStatus = vi.spyOn(instance, 'updateStatus')

		await instance.init({ ...config, host: '' })

		expect(setVariableDefinitions).toHaveBeenCalledOnce()
		expect(setPresetDefinitions).toHaveBeenCalledOnce()
		expect(updateStatus).toHaveBeenLastCalledWith(InstanceStatus.BadConfig)
		expect(session.getAll).not.toHaveBeenCalled()
	})

	it('polls on startup and every interval, publishing what comes back', async () => {
		session.getAll.mockImplementation((_options, callback) => callback(null, varbinds))
		const setVariableValues = vi.spyOn(instance, 'setVariableValues')
		const updateStatus = vi.spyOn(instance, 'updateStatus')

		await instance.init(config)

		expect(session.getAll).toHaveBeenCalledOnce()
		expect(session.getAll.mock.calls[0][0]).toMatchObject({ host: config.host, community: config.community })
		expect(updateStatus).toHaveBeenLastCalledWith(InstanceStatus.Ok)
		expect(setVariableValues).toHaveBeenLastCalledWith(
			expect.objectContaining({
				ups_type: 'Smart-UPS 1500',
				battery_capacity: 100,
				battery_replace: false,
				output_status: 'On Line',
				input_voltage: 230.1,
			}),
		)

		await vi.advanceTimersByTimeAsync(config.pullingTime)
		expect(session.getAll).toHaveBeenCalledTimes(2)
	})

	it('reports a connection failure when the poll errors', async () => {
		session.getAll.mockImplementation((_options, callback) => callback(new Error('Timeout'), []))
		const updateStatus = vi.spyOn(instance, 'updateStatus')

		await instance.init(config)

		expect(updateStatus).toHaveBeenLastCalledWith(InstanceStatus.ConnectionFailure, 'Timeout')
	})

	it('stops polling and closes the session on destroy', async () => {
		session.getAll.mockImplementation((_options, callback) => callback(null, varbinds))
		await instance.init(config)

		await instance.destroy()
		await vi.advanceTimersByTimeAsync(config.pullingTime * 2)

		expect(session.getAll).toHaveBeenCalledOnce()
		expect(session.close).toHaveBeenCalled()
	})
})
