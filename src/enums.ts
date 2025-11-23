export enum TransferReason {
	'No Events' = 1,
	'High line voltage' = 2,
	'Brownout' = 3,
	'Blackout' = 4,
	'Small momentary sag' = 5,
	'Deep momentary sag' = 6,
	'Small momentary spike' = 7,
	'Large momentary spike' = 8,
	'UPS Self Test' = 9,
	'Excessive input voltage fluctiation' = 10,
}

export enum SelfTestResult {
	'Ok' = 1,
	'Failed' = 2,
	'Invalid Test' = 3,
	'Test In Progress' = 4,
}

export enum BatteryStatus {
	'Unknown' = 1,
	'Normal' = 2,
	'Low' = 3,
}

export enum OutputStatus {
	'Unknown' = 1,
	'On Line' = 2,
	'On Battery' = 3,
	'On Smart Boost' = 4,
	'Timed Sleeping' = 5,
	'Software Bypass' = 6,
	'Off' = 7,
	'Rebooting' = 8,
	'Switched Bypass' = 9,
	'Hardware Failure Bypass' = 10,
	'Sleeping Until Power Return' = 11,
	'On Smart Trim' = 12,
}
