import { InstanceBase, type SomeCompanionConfigField } from '@companion-module/base'
import { type APS_Data_Interface } from './utils.js'

import { runEntrypoint, InstanceStatus } from '@companion-module/base'
import { type DeviceConfig, GetConfigFields } from './config.js'
import { checkVariables, initVariables } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { GetPresetList } from './presets.js'
import snmp from 'snmp-native'

class ModuleInstance extends InstanceBase<DeviceConfig> {
	private puller: NodeJS.Timeout | undefined
	private session: any
	public config: DeviceConfig = {
		host: '',
		community: 'public',
		pullingTime: 60000,
	}

	public APC_Data: APS_Data_Interface = {
		ups_type: '',
		battery_capacity: 0,
		battery_runtime_remain: 0,
	}

	constructor(internal: unknown) {
		super(internal)
	}

	public async init(config: DeviceConfig): Promise<void> {
		this.config = config
		process.title = this.label
		await this.configUpdated(this.config)

		if (this.puller) clearInterval(this.puller)

		initVariables(this)
		this.setPresetDefinitions(GetPresetList())

		this.startConnection()
	}

	// When module gets deleted
	public async destroy(): Promise<void> {
		if (this.puller) {
			delete this.puller
			clearInterval(this.puller)
		}
		this.log('debug', 'destroy')
		return
	}

	/**
	 * Process an updated configuration array.
	 */
	public async configUpdated(config: DeviceConfig): Promise<void> {
		this.config = config
		process.title = this.label
		if (this.puller) clearInterval(this.puller)
		this.startConnection()
	}

	/**
	 * Creates the configuration fields for web config.
	 */
	public getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	startConnection() {
		// Only create a new session when needed
		if (!this.session) {
			// Create new session
			this.session = new snmp.Session()
			this.log('debug', 'session created: ' + JSON.stringify(this.session))
		}
		this.updateStatus(InstanceStatus.UnknownWarning)

		this.puller = setInterval(() => {
			this.pullData()
		}, this.config.pullingTime)
	}

	pullData() {
		/**
		 * oids
		 * UPS Type 				1.3.6.1.4.1.318.1.1.1.1.1.1.0
		 * Battery capacity 		1.3.6.1.4.1.318.1.1.1.2.2.1.0
		 * Battery runtime remain 	1.3.6.1.4.1.318.1.1.1.2.2.3.0
		 */
		const oids: number[][] = [
			[1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 1, 1, 1, 0],
			[1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 2, 2, 1, 0],
			[1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 2, 2, 3, 0],
		]
		this.log('debug', 'Pulling, can take up to a minute')
		this.session.getAll(
			{ oids: oids, host: this.config.host, community: this.config.community },
			(error: any, varbinds: any) => {
				if (error) {
					this.log('error', error)
				} else {
					this.updateStatus(InstanceStatus.Ok)
					varbinds.forEach((vb: { oid: string; value: string | number }) => {
						this.log('debug', vb.oid + ' = ' + vb.value)
						if (vb.oid.toString() === '1,3,6,1,4,1,318,1,1,1,1,1,1,0') {
							this.APC_Data.ups_type = vb.value as string
						} else if (vb.oid.toString() === '1,3,6,1,4,1,318,1,1,1,2,2,1,0') {
							const value = vb.value as number
							this.APC_Data.battery_capacity = Math.round(value)
							// this.APC_Data.battery_capacity = vb.value as number
						} else if (vb.oid.toString() === '1,3,6,1,4,1,318,1,1,1,2,2,3,0') {
							this.APC_Data.battery_runtime_remain = vb.value as number
						} else {
							this.log('debug', vb.oid + ' = ' + vb.value)
						}
					})
				}
				checkVariables(this)
			},
		)
		// this.session.close()
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
