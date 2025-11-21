import { InstanceBase } from '@companion-module/base'

export interface InstanceBaseExt<TConfig> extends InstanceBase<TConfig> {
	[x: string]: any
	APC_Data: APS_Data_Interface
	config: TConfig
}

export interface APS_Data_Interface {
	ups_type: string
	battery_capacity: number
	battery_runtime_remain: number
}
