import { describe, expect, it } from 'vitest'
import type { CompanionStaticUpgradeProps, CompanionUpgradeContext } from '@companion-module/base'
import { UpgradeScripts } from '../upgrades.js'
import type { DeviceConfig } from '../config.js'

const context: CompanionUpgradeContext<DeviceConfig> = {
	currentConfig: { host: '', community: 'public', pullingTime: 60000 },
}

function props(config: DeviceConfig | null): CompanionStaticUpgradeProps<DeviceConfig, undefined> {
	return { config, secrets: null, actions: [], feedbacks: [] }
}

describe('upgrade 0: community string', () => {
	const [communityString] = UpgradeScripts

	it('adds the default community to a config saved before it existed', () => {
		const saved = { host: '192.0.2.10', pullingTime: 30000 } as DeviceConfig

		const result = communityString(context, props(saved))

		expect(result.updatedConfig).toEqual({ host: '192.0.2.10', pullingTime: 30000, community: 'public' })
	})

	it('keeps a community that is already set', () => {
		const saved = { host: '192.0.2.10', pullingTime: 30000, community: 'private' }

		const result = communityString(context, props(saved))

		expect(result.updatedConfig).toEqual(saved)
	})

	it('writes a complete default config when there is none', () => {
		const result = communityString(context, props(null))

		expect(result.updatedConfig).toEqual({ host: '', pullingTime: 60000, community: 'public' })
		expect(result.updatedActions).toEqual([])
		expect(result.updatedFeedbacks).toEqual([])
	})
})
