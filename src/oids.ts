import { BatteryStatus, OutputStatus, SelfTestResult, TransferReason } from './enums.js'
import snmp from 'snmp-native'

/**
 * To add a new OID:
 * 1. Add the OID as a number[] in the UPS_OIDS object
 * 2. Add a transform function in the upsOidDataTransforms object
 * 3. Add a variable name in the UPS_OID_VARIABLE_NAMES object
 * 4. If the OID returns an enum value, add it to the enums.ts file
 * */

/**
 *  OIDs for APC UPS devices. Values as number[]
 * */

export const UPS_OIDS = {
	ups_type: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 1, 1, 1, 0], // UPS Type
	battery_capacity: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 2, 3, 1, 0], // Battery capacity
	battery_runtime_remain: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 2, 2, 3, 0], // Battery runtime remain
	battery_temperature: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 2, 3, 2, 0], // Battery Temperature
	battery_replace: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 2, 2, 4, 0], // Battery Replace
	battery_status: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 2, 1, 1, 0], // Battery Status
	battery_time_on_battery: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 2, 1, 2, 0], // Battery - Time on battery
	battery_voltage: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 2, 3, 4, 0], // Battery Voltage
	input_voltage: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 3, 3, 1, 0], // Input Voltage
	input_frequency: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 3, 3, 4, 0], // Input Frequency
	last_transfer_reason: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 3, 2, 5, 0], // Last Transfer Reason
	output_active_power: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 4, 2, 8, 0], // Output Active Power
	output_voltage: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 4, 3, 1, 0], // Output Voltage
	output_frequency: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 4, 3, 2, 0], // Output Frequency
	output_load_percent: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 4, 3, 3, 0], // Output Load Percent
	output_current: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 4, 3, 4, 0], // Output Current
	output_efficiency: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 4, 3, 5, 0], // Output Efficiency
	output_energy_use: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 4, 3, 6, 0], // Output Energy Use
	output_status: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 4, 1, 1, 0], // Output Status
	diagnostic_comms: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 8, 1, 0], // Diagnostic Comms
	self_test_result: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 7, 2, 3, 0], // Self Test - Last Result
	self_test_date: [1, 3, 6, 1, 4, 1, 318, 1, 1, 1, 7, 2, 4, 0], // Self Test - Last Date
} as const satisfies Record<string, number[]>

/**
 *  Data transform functions for each OID by name
 * */
export const upsOidDataTransforms = {
	ups_type: (vb: snmp.VarBind): string => String(vb.value), // UPS Type
	battery_capacity: (vb: snmp.VarBind): number => (vb.value as number) / 10, // Battery capacity
	battery_runtime_remain: (vb: snmp.VarBind): number => (vb.value as number) / 100, // Battery runtime remain
	battery_temperature: (vb: snmp.VarBind): number => (vb.value as number) / 10, // Battery Temperature
	battery_replace: (vb: snmp.VarBind): boolean => (vb.value == 2 ? true : false), // Battery Replace
	battery_status: (vb: snmp.VarBind): string => BatteryStatus[vb.value as number], // Battery Status
	battery_time_on_battery: (vb: snmp.VarBind): number => (vb.value as number) / 100, // Battery - Time on battery
	battery_voltage: (vb: snmp.VarBind): number => (vb.value as number) / 10, // Battery Voltage
	input_voltage: (vb: snmp.VarBind): number => (vb.value as number) / 10, // Input Voltage
	input_frequency: (vb: snmp.VarBind): number => (vb.value as number) / 10, // Input Frequency
	last_transfer_reason: (vb: snmp.VarBind): string => TransferReason[vb.value as number], // Last Transfer Reason
	output_active_power: (vb: snmp.VarBind): number => (vb.value as number) / 10, // Output Active Power
	output_voltage: (vb: snmp.VarBind): number => (vb.value as number) / 10, // Output Voltage
	output_frequency: (vb: snmp.VarBind): number => (vb.value as number) / 10, // Output Frequency
	output_load_percent: (vb: snmp.VarBind): number => (vb.value as number) / 10, // Output Load Percent
	output_current: (vb: snmp.VarBind): number => (vb.value as number) / 10, // Output Current
	output_efficiency: (vb: snmp.VarBind): number => (vb.value as number) / 10, // Output Efficiency
	output_energy_use: (vb: snmp.VarBind): number => (vb.value as number) / 100, // Output Energy Use
	output_status: (vb: snmp.VarBind): string => OutputStatus[vb.value as number], // Output Status
	diagnostic_comms: (vb: snmp.VarBind): boolean => (vb.value == 1 ? true : false), // Diagnostic Comms
	self_test_result: (vb: snmp.VarBind): string => SelfTestResult[vb.value as number], // Self Test - Last Result
	self_test_date: (vb: snmp.VarBind): string => String(vb.value), // Self Test - Last Date
} satisfies Record<UpsFieldName, (vb: snmp.VarBind) => string | number | boolean>

export const UPS_OID_VARIABLE_NAMES: Record<UpsFieldName, string> = {
	ups_type: 'UPS Type',
	battery_capacity: 'Battery capacity (%)',
	battery_runtime_remain: 'Battery runtime remain (S)',
	battery_temperature: 'Battery temperature (C)',
	battery_replace: 'Battery replacement required',
	battery_status: 'Battery status',
	battery_time_on_battery: 'Time on battery (S)',
	battery_voltage: 'Battery voltage (V)',
	input_voltage: 'Input voltage (V)',
	input_frequency: 'Input frequency (Hz)',
	last_transfer_reason: 'Last transfer reason',
	output_active_power: 'Total output active power (W)',
	output_voltage: 'Output voltage (V)',
	output_frequency: 'Output frequency (Hz)',
	output_load_percent: 'Output load (%)',
	output_current: 'Output current (A)',
	output_efficiency: 'Output efficiency (%)',
	output_energy_use: 'Output energy use (kWh)',
	output_status: 'Output status',
	diagnostic_comms: 'SNMP agent to UPS comms OK',
	self_test_result: 'Self test result',
	self_test_date: 'Self test date',
} as const

// Convert number to string
type NumToStr<N extends number> = `${N}`

// Type-level join of a readonly tuple of numbers into "a,b,c" format
type JoinWithComma<T extends readonly number[]> = T extends readonly [infer Head, ...infer Tail]
	? Head extends number
		? Tail extends readonly number[]
			? Tail['length'] extends 0
				? `${NumToStr<Head>}`
				: `${NumToStr<Head>},${JoinWithComma<Tail>}`
			: never
		: never
	: ''

function convertObjectValuesToStringsExact<T extends Record<string, readonly number[]>>(
	obj: T,
): { [K in keyof T]: JoinWithComma<T[K]> } {
	const out = {} as { [K in keyof T]: JoinWithComma<T[K]> }

	for (const k of Object.keys(obj) as Array<keyof T>) {
		// Runtime join (exact same format as type-level JoinWithComma)
		out[k] = obj[k].join(',') as unknown as JoinWithComma<T[typeof k]>
	}

	return out
}

function reverseObject<T extends Record<string, string>>(obj: T): { [K in keyof T as T[K]]: K } {
	const out: any = {}
	for (const k in obj) {
		out[obj[k]] = k
	}
	return out
}

export type UpsFieldName = keyof typeof UPS_OIDS

/**
 *  All OIDs transformed into a number[][] array for snmp-native
 * */
export const UPS_OID_VALUES = (): snmp.OID[] => {
	const oids: snmp.OID[] = []
	Object.values(UPS_OIDS).forEach((v) => {
		oids.push([...v])
	})
	return oids
}

/**
 *  All OIDs transformed into a [key: string]: string object
 * */

export const UPS_OID_STRINGS = convertObjectValuesToStringsExact(UPS_OIDS) // Map OID names to string representations of their OIDs

/**
 *  All OIDs transformed into a string[]
 * */
export const UPS_OID_STRING_VALUES = Object.values(UPS_OID_STRINGS) // Array of OID string values

/**
 *  All OIDs transformed to [oid: string]: string object to lookup name by OID string
 * */

export const UPS_OID_NAMES = reverseObject(UPS_OID_STRINGS) satisfies Record<string, UpsFieldName>

/**
 *  Typeguard to check if a string is a valid UPS OID name key
 * */

export function isUpsOidNameKey(key: string): key is keyof typeof UPS_OID_NAMES {
	return key in UPS_OID_NAMES
}

export type UpsOidDataTransforms = typeof upsOidDataTransforms

/**
 *  Interface representing the data structure for UPS OID data
 * This is generated from the upsOidDataTransforms object
 * The class main.ts uses this to type the APC_Data object
 * */

export type UPS_Oid_Data_Interface = {
	[K in keyof UpsOidDataTransforms]: ReturnType<UpsOidDataTransforms[K]>
}

export function isUpsOidKey(key: string): key is keyof typeof upsOidDataTransforms {
	return key in upsOidDataTransforms
}

export function createDefaultUPSData(): UPS_Oid_Data_Interface {
	// collect as Partial with base types
	const out: Partial<Record<keyof UPS_Oid_Data_Interface, string | number | boolean>> = {}

	for (const k of Object.keys(upsOidDataTransforms) as Array<keyof UPS_Oid_Data_Interface>) {
		// get a sample runtime return value to detect base type
		const sample = upsOidDataTransforms[k]({ value: undefined } as any)
		const t = typeof sample

		if (t === 'string') out[k] = ''
		else if (t === 'number') out[k] = 0
		else out[k] = false
	}

	// single assertion here prevents per-key "never" errors
	return out as UPS_Oid_Data_Interface
}
