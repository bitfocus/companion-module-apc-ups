"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("@companion-module/base");
const { runEntrypoint, InstanceStatus } = require('@companion-module/base');
const { DeviceConfig, GetConfigFields } = require('./config');
const { checkVariables, initVariables } = require('./variables');
const { GetPresetList } = require('./presets');
const snmp = require('snmp-native');
class ModuleInstance extends base_1.InstanceBase {
    puller;
    session;
    config = {
        host: '',
        pullingTime: 60000,
    };
    APC_Data = {
        ups_type: '',
        battery_capacity: 0,
        battery_runtime_remain: 0,
    };
    constructor(internal) {
        super(internal);
    }
    async init(config) {
        this.config = config;
        await this.configUpdated(this.config);
        if (this.puller)
            clearInterval(this.puller);
        initVariables(this);
        this.setPresetDefinitions(GetPresetList());
        this.startConnection();
    }
    // When module gets deleted
    async destroy() {
        if (this.puller) {
            delete this.puller;
            clearInterval(this.puller);
        }
        this.log('debug', 'destroy');
        return;
    }
    /**
     * Process an updated configuration array.
     */
    async configUpdated(config) {
        this.config = config;
        if (this.puller)
            clearInterval(this.puller);
        this.startConnection();
    }
    /**
     * Creates the configuration fields for web config.
     */
    getConfigFields() {
        return GetConfigFields();
    }
    startConnection() {
        // Only create a new session when needed
        if (!this.session) {
            // Create new session
            this.session = new snmp.Session();
            this.log('debug', 'session created: ' + JSON.stringify(this.session));
        }
        this.updateStatus(InstanceStatus.UnknownWarning);
        this.puller = setInterval(() => {
            this.pullData();
        }, this.config.pullingTime);
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
        ];
        this.log('debug', 'Pulling, can take up to a minute');
        this.session.getAll({ oids: oids, host: this.config.host }, (error, varbinds) => {
            if (error) {
                this.log('error', error);
            }
            else {
                this.updateStatus(InstanceStatus.Ok);
                varbinds.forEach((vb) => {
                    this.log('debug', vb.oid + ' = ' + vb.value);
                    if (vb.oid.toString() === '1,3,6,1,4,1,318,1,1,1,1,1,1,0') {
                        this.APC_Data.ups_type = vb.value;
                    }
                    else if (vb.oid.toString() === '1,3,6,1,4,1,318,1,1,1,2,2,1,0') {
                        const value = vb.value;
                        this.APC_Data.battery_capacity = Math.round(value);
                        // this.APC_Data.battery_capacity = vb.value as number
                    }
                    else if (vb.oid.toString() === '1,3,6,1,4,1,318,1,1,1,2,2,3,0') {
                        this.APC_Data.battery_runtime_remain = vb.value;
                    }
                    else {
                        this.log('debug', vb.oid + ' = ' + vb.value);
                    }
                });
            }
            checkVariables(this);
        });
        // this.session.close()
    }
}
runEntrypoint(ModuleInstance, []);
//# sourceMappingURL=main.js.map