import { InstanceBase, InstanceStatus, runEntrypoint, type SomeCompanionConfigField } from '@companion-module/base'
import { type DeviceConfig, GetConfigFields } from './config.js'
import { checkVariables, initVariables } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { GetPresetList } from './presets.js'
import {
	UPS_OID_NAMES,
	type UPS_Oid_Data_Interface,
	UPS_OID_VALUES,
	upsOidDataTransforms,
	isUpsOidNameKey,
} from './oids.js'
import snmp from 'snmp-native'

export class ModuleInstance extends InstanceBase<DeviceConfig> {
	private puller: NodeJS.Timeout | undefined
	private session: snmp.Session = new snmp.Session()
	public config: DeviceConfig = {
		host: '',
		community: 'public',
		pullingTime: 60000,
	}

	public APC_Data: UPS_Oid_Data_Interface = {
		ups_type: '',
		battery_capacity: 0,
		battery_runtime_remain: 0,
		battery_temperature: 0,
		battery_replace: false,
		battery_status: '',
		battery_time_on_battery: 0,
		battery_voltage: 0,
		input_voltage: 0,
		input_frequency: 0,
		last_transfer_reason: '',
		output_active_power: 0,
		output_voltage: 0,
		output_frequency: 0,
		output_load_percent: 0,
		output_current: 0,
		output_efficiency: 0,
		output_energy_use: 0,
		output_status: '',
		diagnostic_comms: false,
		self_test_result: '',
		self_test_date: '',
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
	private setUpsField<K extends keyof UPS_Oid_Data_Interface>(key: K, value: UPS_Oid_Data_Interface[K]) {
		this.APC_Data[key] = value
	}

	private pullData() {
		this.log('debug', 'Pulling, can take up to a minute')
		this.session.getAll(
			{
				oids: UPS_OID_VALUES(),
				host: this.config.host,
				community: this.config.community,
				combinedTimeout: this.config.pullingTime,
			},
			(error: Error | null, varbinds: snmp.VarBind[]) => {
				if (error) {
					this.log('error', JSON.stringify(error))
					this.updateStatus(InstanceStatus.ConnectionFailure, error.message)
				} else {
					this.updateStatus(InstanceStatus.Ok)
					varbinds.forEach((vb: snmp.VarBind) => {
						const oidString = vb.oid.join(',')
						if (!isUpsOidNameKey(oidString)) {
							this.log('warn', `Unrecognised OID ${vb.oid} has value of ${vb.value}`)
							return
						}
						const oidName = UPS_OID_NAMES[oidString]
						this.log('debug', `${oidName} has value of ${vb.value}`)
						const value = upsOidDataTransforms[oidName](vb)
						this.setUpsField(oidName, value)
					})
				}
				checkVariables(this)
			},
		)
		// this.session.close()
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
