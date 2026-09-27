import { combineRgb, type CompanionPresetDefinitions, type CompanionPresetSection } from '@companion-module/base'
import type ModuleInstance from './main.js'
import type { ModuleTypes } from './main.js'

export enum PresetId {
	Battery = 'battery',
}

export function UpdatePresets(self: ModuleInstance): void {
	const presets: CompanionPresetDefinitions<ModuleTypes> = {
		[PresetId.Battery]: {
			type: 'simple',
			name: `Battery status`,
			style: {
				text: `UPS BAT\\n$(APC_UPS_Monitor:battery_capacity) %`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 153, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		},
	}

	const structure: CompanionPresetSection<ModuleTypes>[] = [
		{
			id: 'status',
			name: 'Status',
			definitions: [PresetId.Battery],
		},
	]

	self.setPresetDefinitions(structure, presets)
}
