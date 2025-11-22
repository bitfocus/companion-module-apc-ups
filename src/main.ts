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
	private session: snmp.Session = new snmp.Session()
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
		initVariables(this)
		this.setPresetDefinitions(GetPresetList())
		await this.configUpdated(config)
	}

	// When module gets deleted
	public async destroy(): Promise<void> {
		if (this.puller) {
			clearInterval(this.puller)
			delete this.puller
		}
		this.log('debug', `destroy ${this.id}:${this.label}`)
		this.session.close()
	}

	/**
	 * Process an updated configuration array.
	 */
	public async configUpdated(config: DeviceConfig): Promise<void> {
		this.config = config
		process.title = this.label
		if (this.puller) clearInterval(this.puller)
		if (config.host) {
			this.startConnection()
		} else {
			this.updateStatus(InstanceStatus.BadConfig)
			this.log('error', 'No Host configured')
		}
	}

	/**
	 * Creates the configuration fields for web config.
	 */
	public getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	private startConnection() {
		this.updateStatus(InstanceStatus.Connecting)
		this.pullData()
		this.puller = setInterval(() => {
			this.pullData()
		}, this.config.pullingTime)
	}

	private pullData() {
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
			{
				oids: oids,
				host: this.config.host,
				community: this.config.community,
				combinedTimeout: this.config.pullingTime,
			},
			(error: Error | null, varbinds: snmp.VarBind[]) => {
				if (error) {
					this.log('error', JSON.stringify(error))
				} else {
					this.updateStatus(InstanceStatus.Ok)
					varbinds.forEach((vb: snmp.VarBind) => {
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
