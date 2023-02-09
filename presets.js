import { combineRgb } from '@companion-module/base'

module.exports = {
    getPresets() {
        const presets = {}
        presets[`battery`] = {
            type: 'button', 
            category: 'Status', 
            name: `Battery status`, // A name for the preset. Shown to the user when they hover over it
            style: {
                // This is the minimal set of style properties you must define
                text: `UPS BAT\\n$(battery_capacity) %`, // You can use variables from your module here
                size: 'auto',
                color: combineRgb(255, 255, 255),
                bgcolor: combineRgb(0, 0, 0),
            },
            steps: [
                {
                    down: [],
                    up: [],
                },
            ],
            feedbacks: [],
        }
        return presets
    }
}
