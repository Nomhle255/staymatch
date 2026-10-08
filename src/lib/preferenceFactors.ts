// The "What matters most to you?" factors.
// `key` is what gets saved in the database, so don't rename keys once
// students have saved preferences.
export const FACTORS = [
	{ key: 'price', label: 'Low price' },
	{ key: 'proximity', label: 'Close to university', needsUniversity: true },
	{ key: 'verified', label: 'Verified listing' },
	{ key: 'wifi', label: 'Wi-Fi' },
	{ key: 'water', label: 'Water included' },
	{ key: 'electricity', label: 'Electricity included' },
	{ key: 'furnished', label: 'Furnished' },
	{ key: 'parking', label: 'Parking available' },
	{ key: 'security', label: '24/7 security' },
	{ key: 'fenced', label: 'Fenced' },
	{ key: 'burglarBars', label: 'Burglar bars' },
	{ key: 'ceiling', label: 'Ceiling' },
	{ key: 'tiledFloors', label: 'Tiled floors' },
] as const

export type FactorKey = (typeof FACTORS)[number]['key']

export const FACTOR_KEYS: string[] = FACTORS.map((f) => f.key)

// "Any match" dropdown: value is the minimum match score (0-100)
export const MIN_MATCH_OPTIONS = [
	{ value: 0, label: 'Any match' },
	{ value: 50, label: '50% or better' },
	{ value: 70, label: '70% or better' },
	{ value: 85, label: '85% or better' },
]