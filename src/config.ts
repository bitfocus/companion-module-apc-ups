import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface DeviceConfig {
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
			label: 'Set interval to pull data in msec',
			width: 8,
			min: 5000,
			max: 86400000,
			default: 60000,
		},
	]
}
