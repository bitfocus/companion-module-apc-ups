const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const { checkVariables, initVariables } = require('./variables')
const snmp = require('snmp-native')

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		// Assign the methods from the listed files to this class
		this.puller = undefined
		this.ups = undefined
		this.ups_type = ''
		this.battery_capacity = ''
		this.battery_runtime_remain = ''
	}

	async init(config) {
		this.config = config
		this.updateStatus(InstanceStatus.Connecting)
		if (this.puller) clearInterval(this.puller)
		if (this.session) this.session.close()
		initVariables(this)
		this.startConnection()
	}

	// When module gets deleted
	async destroy() {
		if (this.puller) {
			delete this.puller
			clearInterval(this.puller)
		}
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
		if (this.puller) clearInterval(this.puller)
		this.startConnection()
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 8,
				regex: Regex.IP,
			},
			{
				type: 'number',
				id: 'pullingTime',
				label: 'Set interval to pull data in msec',
				width: 8,
				min: 5000,
				max: 86400000,
				default: 60000,
			},
		]
	}

	updateActions() {
		UpdateActions(this)
	}

	startConnection() {
		this.session = new snmp.Session()
		this.log('debug', 'session' + JSON.stringify(this.session))
		this.updateStatus(InstanceStatus.Ok)
		
		this.pullData()

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
		if (this.session) {
			this.session.getAll({ oids: oids, host: this.config.host }, (error, varbinds) => {
				if (error) {
					this.log('error', error)
				} else {
					varbinds.forEach((vb) => {
						if (vb.oid.toString() === '1,3,6,1,4,1,318,1,1,1,1,1,1,0') {
							this.ups_type = vb.value
						} else if (vb.oid.toString() === '1,3,6,1,4,1,318,1,1,1,2,2,1,0') {
							this.battery_capacity = vb.value
						} else if (vb.oid.toString() === '1,3,6,1,4,1,318,1,1,1,2,2,3,0') {
							this.battery_runtime_remain = vb.value
						} else {
							this.log('debug', vb.oid + ' = ' + vb.value)
						}
					})
				}
				this.session.close()
				this.log('debug', 'ups_type' + this.ups_type)
				this.log('debug', 'battery_capacity' + this.battery_capacity)
				this.log('debug', 'battery_runtime_remain' + this.battery_runtime_remain)
				checkVariables(this)
			})
		}

	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
