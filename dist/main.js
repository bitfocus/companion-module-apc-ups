'use strict'
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, '__esModule', { value: true })
const base_1 = require('@companion-module/base')
const base_2 = require('@companion-module/base')
const config_1 = require('./config')
const variables_1 = require('./variables')
const upgrades_1 = require('./upgrades')
const presets_1 = require('./presets')
const snmp_native_1 = __importDefault(require('snmp-native'))
class ModuleInstance extends base_1.InstanceBase {
	puller
	session
	config = {
		host: '',
		community: 'public',
		pullingTime: 60000,
	}
	APC_Data = {
		ups_type: '',
		battery_capacity: 0,
		battery_runtime_remain: 0,
	}
	constructor(internal) {
		super(internal)
	}
	async init(config) {
		this.config = config
		process.title = this.label
		await this.configUpdated(this.config)
		if (this.puller) clearInterval(this.puller)
		;(0, variables_1.initVariables)(this)
		this.setPresetDefinitions((0, presets_1.GetPresetList)())
		this.startConnection()
	}
	// When module gets deleted
	async destroy() {
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
	async configUpdated(config) {
		this.config = config
		process.title = this.label
		if (this.puller) clearInterval(this.puller)
		this.startConnection()
	}
	/**
	 * Creates the configuration fields for web config.
	 */
	getConfigFields() {
		return (0, config_1.GetConfigFields)()
	}
	startConnection() {
		// Only create a new session when needed
		if (!this.session) {
			// Create new session
			this.session = new snmp_native_1.default.Session()
			this.log('debug', 'session created: ' + JSON.stringify(this.session))
		}
		this.updateStatus(base_2.InstanceStatus.UnknownWarning)
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
		const oids = [
			[1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 1, 1, 1, 0],
			[1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 2, 2, 1, 0],
			[1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 2, 2, 3, 0],
		]
		this.log('debug', 'Pulling, can take up to a minute')
		this.session.getAll({ oids: oids, host: this.config.host, community: this.config.community }, (error, varbinds) => {
			if (error) {
				this.log('error', error)
			} else {
				this.updateStatus(base_2.InstanceStatus.Ok)
				varbinds.forEach((vb) => {
					this.log('debug', vb.oid + ' = ' + vb.value)
					if (vb.oid.toString() === '1,3,6,1,4,1,318,1,1,1,1,1,1,0') {
						this.APC_Data.ups_type = vb.value
					} else if (vb.oid.toString() === '1,3,6,1,4,1,318,1,1,1,2,2,1,0') {
						const value = vb.value
						this.APC_Data.battery_capacity = Math.round(value)
						// this.APC_Data.battery_capacity = vb.value as number
					} else if (vb.oid.toString() === '1,3,6,1,4,1,318,1,1,1,2,2,3,0') {
						this.APC_Data.battery_runtime_remain = vb.value
					} else {
						this.log('debug', vb.oid + ' = ' + vb.value)
					}
				})
			}
			;(0, variables_1.checkVariables)(this)
		})
		// this.session.close()
	}
}
;(0, base_2.runEntrypoint)(ModuleInstance, upgrades_1.UpgradeScripts)
//# sourceMappingURL=main.js.map
