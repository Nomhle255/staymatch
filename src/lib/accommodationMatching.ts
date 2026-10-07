type PreferenceInput = {
  propertyType: string | null
  priceRange: string
  maxDistance: number
  ratings: unknown
  minMatch: number
  university: {
    latitude: number | null
    longitude: number | null
  } | null
}

type AccommodationInput = {
  price: number
  propertyType: string
  amenities: string[]
  status: string
  latitude: number
  longitude: number
}

const MAX_SCORED_DISTANCE_KM = 10

function matchesPriceRange(price: number, range: string) {
  switch (range) {
    case 'Under M500':
      return price < 500
    case 'M500 – M800':
      return price >= 500 && price <= 800
    case 'M800 – M1,000':
      return price > 800 && price <= 1000
    case 'Above M1,000':
      return price > 1000
    default:
      return true
  }
}

function distanceKm(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  if (![latitudeA, longitudeA, latitudeB, longitudeB].every(Number.isFinite)) {
    return null
  }

  const toRadians = (value: number) => (value * Math.PI) / 180
  const earthRadiusKm = 6371
  const latitudeDelta = toRadians(latitudeB - latitudeA)
  const longitudeDelta = toRadians(longitudeB - longitudeA)
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(latitudeA)) *
      Math.cos(toRadians(latitudeB)) *
      Math.sin(longitudeDelta / 2) ** 2

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function hasAmenity(amenities: string[], keywords: string[]) {
  return amenities.some((amenity) => {
    const normalizedAmenity = amenity.toLowerCase()
    return keywords.some((keyword) => normalizedAmenity.includes(keyword))
  })
}

function getSatisfaction(
  accommodation: AccommodationInput,
  factor: string,
  distance: number | null,
  priceBounds: { min: number; max: number },
) {
  switch (factor) {
    case 'price': {
      const range = priceBounds.max - priceBounds.min
      if (range <= 0) return 1
      return Math.max(
        0,
        Math.min(1, 1 - (accommodation.price - priceBounds.min) / range),
      )
    }
    case 'distance':
      return distance === null
        ? 0
        : 1 - Math.min(distance, MAX_SCORED_DISTANCE_KM) / MAX_SCORED_DISTANCE_KM
    case 'verified':
      return accommodation.status === 'VERIFIED' ? 1 : 0
    case 'wifi':
      return hasAmenity(accommodation.amenities, ['wifi', 'wi-fi', 'internet']) ? 1 : 0
    case 'water':
      return hasAmenity(accommodation.amenities, ['water']) ? 1 : 0
    case 'electricity':
      return hasAmenity(accommodation.amenities, ['electricity']) ? 1 : 0
    case 'furnished':
      return hasAmenity(accommodation.amenities, ['furnished']) ? 1 : 0
    case 'parking':
      return hasAmenity(accommodation.amenities, ['parking']) ? 1 : 0
    case 'security':
      return hasAmenity(accommodation.amenities, ['security']) ? 1 : 0
    case 'fenced':
      return hasAmenity(accommodation.amenities, ['fenced']) ? 1 : 0
    case 'burglarBars':
      return hasAmenity(accommodation.amenities, ['burglar', 'buglar']) ? 1 : 0
    case 'ceiling':
      return hasAmenity(accommodation.amenities, ['ceiling']) ? 1 : 0
    case 'tiledFloors':
      return hasAmenity(accommodation.amenities, ['tile', 'tiled']) ? 1 : 0
    default:
      return 0
  }
}

export function getAccommodationMatchScore(
  accommodation: AccommodationInput,
  preference: PreferenceInput,
) {
  if (
    preference.propertyType &&
    preference.propertyType !== accommodation.propertyType
  ) {
    return null
  }

  if (!matchesPriceRange(accommodation.price, preference.priceRange)) {
    return null
  }

  const distance = preference.university
    ? distanceKm(
        preference.university.latitude ?? Number.NaN,
        preference.university.longitude ?? Number.NaN,
        accommodation.latitude,
        accommodation.longitude,
      )
    : null

  if (
    preference.maxDistance > 0 &&
    (distance === null || distance > preference.maxDistance)
  ) {
    return null
  }

  const ratings =
    preference.ratings && typeof preference.ratings === 'object'
      ? (preference.ratings as Record<string, unknown>)
      : {}
  const activeFactors = Object.entries(ratings).filter(
    ([, weight]) => typeof weight === 'number' && weight > 0,
  ) as Array<[string, number]>

  if (activeFactors.length === 0) {
    return preference.minMatch === 0 ? 100 : null
  }

  const priceBounds = {
    min: 0,
    max: Math.max(accommodation.price, 1),
  }
  const possible = activeFactors.reduce((total, [, weight]) => total + weight, 0)
  const earned = activeFactors.reduce(
    (total, [factor, weight]) =>
      total + weight * getSatisfaction(accommodation, factor, distance, priceBounds),
    0,
  )
  const score = Math.round((earned / possible) * 100)

  return score >= preference.minMatch ? score : null
}