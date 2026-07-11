/** Request browser geolocation; resolves null coords if denied/unavailable. */
export function getCurrentLocation(timeoutMs = 8000): Promise<{ latitude: number; longitude: number } | null> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return Promise.resolve(null);
    }

    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            () => resolve(null),
            { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 60_000 },
        );
    });
}
