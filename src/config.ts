import { Regex, SomeCompanionConfigField } from '@companion-module/base'

export interface DeviceConfig {
	host: string
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
