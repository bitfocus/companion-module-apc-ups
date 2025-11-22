import {
	type CompanionStaticUpgradeProps,
	type CompanionStaticUpgradeResult,
	type CompanionUpgradeContext,
	type CompanionStaticUpgradeScript,
} from '@companion-module/base'

import type { DeviceConfig } from './config.js'

function CommunityString(
	_context: CompanionUpgradeContext<DeviceConfig>,
	props: CompanionStaticUpgradeProps<DeviceConfig>,
): CompanionStaticUpgradeResult<DeviceConfig> {
	const result: CompanionStaticUpgradeResult<DeviceConfig> = {
		updatedActions: [],
		updatedConfig: null,
		updatedFeedbacks: [],
	}

	result.updatedConfig = {
		host: props.config?.host ?? '',
		pullingTime: props.config?.pullingTime ?? 60000,
		community: props.config?.community ?? 'public',
	}
	return result
}

export const UpgradeScripts: CompanionStaticUpgradeScript<DeviceConfig>[] = [CommunityString]
