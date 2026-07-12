import { useEffect, useMemo } from 'react';
import { Circle, CircleMarker, MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
    label?: string;
    className?: string;
}

function Recenter({ latitude, longitude }: { latitude: number; longitude: number }) {
    const map = useMap();

    useEffect(() => {
        map.setView([latitude, longitude], map.getZoom(), { animate: true });
    }, [map, latitude, longitude]);

    return null;
}

export default function AttendanceLocationMap({
    latitude,
    longitude,
    accuracy,
    label = 'Clock-in location',
    className = '',
}: Props) {
    const center = useMemo<[number, number]>(() => [latitude, longitude], [latitude, longitude]);
    const hasAccuracy = typeof accuracy === 'number' && accuracy > 0 && accuracy < 5000;

    return (
        <div className={`w-full overflow-hidden rounded-xl border border-slate-200 ${className}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {label}
                </p>
                <p className="text-[10px] font-medium tabular-nums text-slate-500">
                    {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </p>
            </div>
            <div className="relative z-0 h-40 w-full sm:h-44">
                <MapContainer
                    center={center}
                    zoom={16}
                    scrollWheelZoom={false}
                    dragging
                    className="h-full w-full"
                    attributionControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Recenter latitude={latitude} longitude={longitude} />
                    {hasAccuracy && (
                        <Circle
                            center={center}
                            radius={accuracy}
                            pathOptions={{
                                color: '#3b82f6',
                                fillColor: '#3b82f6',
                                fillOpacity: 0.12,
                                weight: 1,
                            }}
                        />
                    )}
                    <CircleMarker
                        center={center}
                        radius={8}
                        pathOptions={{
                            color: '#1d4ed8',
                            fillColor: '#3b82f6',
                            fillOpacity: 1,
                            weight: 2,
                        }}
                    />
                </MapContainer>
            </div>
        </div>
    );
}
