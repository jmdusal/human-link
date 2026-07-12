export type GeoPosition = {
    latitude: number;
    longitude: number;
    accuracy: number | null;
};

export async function getCurrentPosition(
    options?: PositionOptions,
): Promise<GeoPosition | null> {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return null;
    }

    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: Number.isFinite(position.coords.accuracy)
                        ? position.coords.accuracy
                        : null,
                });
            },
            () => resolve(null),
            {
                enableHighAccuracy: true,
                timeout: 12000,
                maximumAge: 0,
                ...options,
            },
        );
    });
}
