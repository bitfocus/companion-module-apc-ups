import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

// A type alias, not an interface: InstanceTypes requires config to satisfy JsonObject, and interfaces don't
export type DeviceConfig = {
	host: string
	community: string
	pullingTime: number
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 8,
			regex: Regex.IP,
		},
		{
			type: 'textinput',
			id: 'community',
			label: 'Community String',
			width: 8,
			regex: Regex.SOMETHING,
			default: 'public',
		},
		{
			type: 'number',
			id: 'pullingTime',
			label: 'Poll Interval (ms)',
			width: 8,
			min: 5000,
			max: 86400000,
			default: 60000,
		},
	]
}
