import { Fragment, useEffect, useMemo } from 'react';
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Attendance } from '@/types';

interface Props {
    attendances: Attendance[];
    selectedId?: number | null;
    onSelect?: (id: number) => void;
    className?: string;
    heightClassName?: string;
}

function FitMarkers({
    points,
}: {
    points: Array<{ latitude: number; longitude: number }>;
}) {
    const map = useMap();

    useEffect(() => {
        if (points.length === 0) return;

        if (points.length === 1) {
            map.setView([points[0].latitude, points[0].longitude], 16, { animate: true });
            return;
        }

        const bounds = points.map((point) => [point.latitude, point.longitude] as [number, number]);
        map.fitBounds(bounds, { padding: [28, 28], maxZoom: 16, animate: true });
    }, [map, points]);

    return null;
}

function FocusSelected({
    latitude,
    longitude,
}: {
    latitude: number;
    longitude: number;
}) {
    const map = useMap();

    useEffect(() => {
        map.panTo([latitude, longitude], { animate: true });
    }, [map, latitude, longitude]);

    return null;
}

export default function AttendancePresentMap({
    attendances,
    selectedId = null,
    onSelect,
    className = '',
    heightClassName = 'h-56 sm:h-64',
}: Props) {
    const markers = useMemo(() => {
        return attendances
            .filter((item) => item.startLatitude != null && item.startLongitude != null)
            .map((item) => ({
                id: item.id,
                name: item.user?.name || 'Unknown',
                latitude: item.startLatitude as number,
                longitude: item.startLongitude as number,
                accuracy: item.startAccuracy,
            }));
    }, [attendances]);

    const fitPoints = useMemo(
        () => markers.map(({ latitude, longitude }) => ({ latitude, longitude })),
        [markers],
    );

    const selectedMarker = useMemo(() => {
        if (selectedId == null) return null;
        return markers.find((marker) => marker.id === selectedId) ?? null;
    }, [markers, selectedId]);

    const center = useMemo<[number, number]>(() => {
        if (markers.length === 0) return [0, 0];
        if (selectedMarker) return [selectedMarker.latitude, selectedMarker.longitude];
        return [markers[0].latitude, markers[0].longitude];
    }, [markers, selectedMarker]);

    if (markers.length === 0) {
        return (
            <div className={`flex ${heightClassName} items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-400 ${className}`}>
                No clock-in locations for this day.
            </div>
        );
    }

    return (
        <div className={`w-full overflow-hidden rounded-xl border border-slate-200 ${className}`}>
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Clock-in map
                </p>
                <p className="text-[10px] font-medium text-slate-500">
                    {markers.length} pin{markers.length === 1 ? '' : 's'}
                </p>
            </div>
            <div className={`relative z-0 w-full ${heightClassName}`}>
                <MapContainer
                    center={center}
                    zoom={15}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                    attributionControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <FitMarkers points={fitPoints} />
                    {selectedMarker && (
                        <FocusSelected
                            latitude={selectedMarker.latitude}
                            longitude={selectedMarker.longitude}
                        />
                    )}
                    {markers.map((marker) => {
                        const isSelected = selectedId === marker.id;
                        return (
                            <Fragment key={marker.id}>
                                {typeof marker.accuracy === 'number'
                                    && marker.accuracy > 0
                                    && marker.accuracy < 5000
                                    && isSelected && (
                                    <Circle
                                        center={[marker.latitude, marker.longitude]}
                                        radius={marker.accuracy}
                                        pathOptions={{
                                            color: '#3b82f6',
                                            fillColor: '#3b82f6',
                                            fillOpacity: 0.12,
                                            weight: 1,
                                        }}
                                    />
                                )}
                                <CircleMarker
                                    center={[marker.latitude, marker.longitude]}
                                    radius={isSelected ? 10 : 7}
                                    pathOptions={{
                                        color: isSelected ? '#1e40af' : '#1d4ed8',
                                        fillColor: isSelected ? '#2563eb' : '#3b82f6',
                                        fillOpacity: 1,
                                        weight: 2,
                                    }}
                                    eventHandlers={{
                                        click: () => onSelect?.(marker.id),
                                    }}
                                >
                                    <Popup>{marker.name}</Popup>
                                </CircleMarker>
                            </Fragment>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
}
