'use client'

import { useEffect, useRef, useState } from 'react'

export type Weights = Record<string, number>

export type SavedPreferences = {
	propertyType: string | null
	priceRange: string
	maxDistance: number
	ratings: Weights
	minMatch: number
	universityId: string | null
}

type Options = {
	propertyType: string | null
	priceRange: string
	maxDistance: number
	ratings: Weights
	minMatch: number
	universityId: string | null

	// Called once with the saved values so you can fill your existing state
	onLoad: (saved: SavedPreferences) => void
	debounceMs?: number
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useSavedPreferences({
	propertyType,
	priceRange,
	maxDistance,
	ratings,
	minMatch,
	universityId,
	onLoad,
	debounceMs = 800,
}: Options) {
	const [loaded, setLoaded] = useState(false)
	const [status, setStatus] = useState<SaveStatus>('idle')

	// Stop saving when the student is not logged in
	const canSave = useRef(true)

	// Prevent saving immediately after loading existing preferences
	const skipNextSave = useRef(true)

	const onLoadRef = useRef(onLoad)
	onLoadRef.current = onLoad

	// Load saved preferences once
	useEffect(() => {
		let cancelled = false

		const load = async () => {
			try {
				const response = await fetch('/api/students/preferences')

				if (response.status === 401) {
					canSave.current = false
					return
				}

				const data = await response.json().catch(() => null)

				if (!cancelled && response.ok && data?.preference) {
					const savedUniversityId =
						data.preference.universityId === null ||
						data.preference.universityId === undefined
							? null
							: String(data.preference.universityId)

					onLoadRef.current({
						propertyType:
							data.preference.propertyType ?? null,
						priceRange:
							data.preference.priceRange ?? '',
						maxDistance:
							data.preference.maxDistance ?? 0,
						ratings:
							data.preference.ratings ?? {},
						minMatch:
							data.preference.minMatch ?? 0,
						universityId: savedUniversityId,
					})
				}
			} catch (error) {
				console.warn(
					'Failed to load saved preferences:',
					error,
				)
			} finally {
				if (!cancelled) {
					setLoaded(true)
				}
			}
		}

		load()

		return () => {
			cancelled = true
		}
	}, [])

	// Save preferences after values change
	useEffect(() => {
		if (!loaded || !canSave.current) {
			return
		}

		// Skip the first save caused by loading existing preferences
		if (skipNextSave.current) {
			skipNextSave.current = false
			return
		}

		const timer = setTimeout(async () => {
			try {
				setStatus('saving')

				const response = await fetch(
					'/api/students/preferences',
					{
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							propertyType,
							priceRange,
							maxDistance,
							ratings,
							minMatch,
							universityId,
						}),
					},
				)

				if (response.status === 401) {
					canSave.current = false
					setStatus('idle')
					return
				}

				setStatus(response.ok ? 'saved' : 'error')
			} catch (error) {
				console.warn(
					'Failed to save preferences:',
					error,
				)
				setStatus('error')
			}
		}, debounceMs)

		return () => clearTimeout(timer)

		// ratings is an object, so compare its contents
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		loaded,
		JSON.stringify(ratings),
		propertyType,
		priceRange,
		maxDistance,
		minMatch,
		universityId,
		debounceMs,
	])

	return {
		loaded,
		status,
	}
}