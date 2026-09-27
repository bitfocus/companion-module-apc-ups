import { describe, expect, it, vi } from 'vitest'
import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import { PresetId, UpdatePresets } from '../presets.js'
import { UPS_OID_VARIABLE_NAMES } from '../oids.js'
import type ModuleInstance from '../main.js'
import type { ModuleTypes } from '../main.js'

function build() {
	const setPresetDefinitions =
		vi.fn<
			(structure: CompanionPresetSection<ModuleTypes>[], presets: CompanionPresetDefinitions<ModuleTypes>) => void
		>()
	UpdatePresets({ setPresetDefinitions } as unknown as ModuleInstance)
	const [structure, presets] = setPresetDefinitions.mock.calls[0]
	return { structure, presets }
}

describe('presets', () => {
	it('lists every preset in the Status section', () => {
		const { structure, presets } = build()

		expect(structure).toEqual([{ id: 'status', name: 'Status', definitions: [PresetId.Battery] }])
		expect(Object.keys(presets)).toEqual([PresetId.Battery])
	})

	it('builds the battery preset as a simple button', () => {
		const { presets } = build()

		expect(presets[PresetId.Battery]).toMatchObject({
			type: 'simple',
			name: 'Battery status',
			steps: [{ down: [], up: [] }],
			feedbacks: [],
		})
	})

	it('only shows variables the module defines', () => {
		const { presets } = build()
		const preset = presets[PresetId.Battery]
		if (preset?.type !== 'simple') throw new Error('expected a simple preset')

		const shown = [...preset.style.text.matchAll(/\$\([^:)]+:([^)]+)\)/g)].map((match) => match[1])
		expect(shown).toEqual(['battery_capacity'])
		for (const variableId of shown) {
			expect(Object.keys(UPS_OID_VARIABLE_NAMES)).toContain(variableId)
		}
	})
})
