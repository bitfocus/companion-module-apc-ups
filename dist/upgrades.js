'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.UpgradeScripts = void 0
function CommunityString(_context, props) {
	const result = {
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
exports.UpgradeScripts = [CommunityString]
//# sourceMappingURL=upgrades.js.map
