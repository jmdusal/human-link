import { useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';
import type { Attendance } from '@/types';
import Card from '@/components/ui/Card';

interface Props {
    attendances: Attendance[];
    selectedAttendanceId?: number | null;
    onSelect?: (attendance: Attendance) => void;
}

interface MapPoint {
    id: string;
    attendanceId: number;
    lat: number;
    lng: number;
    label: string;
    kind: 'start' | 'end';
    ip?: string | null;
    time?: string | null;
}

function toNumber(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') return null;
    const n = typeof value === 'number' ? value : parseFloat(value);
    return Number.isFinite(n) ? n : null;
}

function FitBounds({ points }: { points: MapPoint[] }) {
    const map = useMap();

    useEffect(() => {
        if (!map || points.length === 0 || !window.google?.maps) return;

        if (points.length === 1) {
            map.setCenter({ lat: points[0].lat, lng: points[0].lng });
            map.setZoom(14);
            return;
        }

        const bounds = new window.google.maps.LatLngBounds();
        points.forEach((point) => bounds.extend({ lat: point.lat, lng: point.lng }));
        map.fitBounds(bounds, 48);
    }, [map, points]);

    return null;
}

function AttendanceMapInner({ attendances, selectedAttendanceId, onSelect }: Props) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const points = useMemo(() => {
        const result: MapPoint[] = [];

        attendances.forEach((item) => {
            const startLat = toNumber(item.startLatitude);
            const startLng = toNumber(item.startLongitude);
            const endLat = toNumber(item.endLatitude);
            const endLng = toNumber(item.endLongitude);
            const name = item.user?.name ?? `User #${item.userId}`;

            if (startLat !== null && startLng !== null) {
                result.push({
                    id: `${item.id}-start`,
                    attendanceId: item.id,
                    lat: startLat,
                    lng: startLng,
                    label: `${name} · start`,
                    kind: 'start',
                    ip: item.startIp,
                    time: item.startedAt,
                });
            }

            if (endLat !== null && endLng !== null) {
                result.push({
                    id: `${item.id}-end`,
                    attendanceId: item.id,
                    lat: endLat,
                    lng: endLng,
                    label: `${name} · end`,
                    kind: 'end',
                    ip: item.endIp,
                    time: item.endedAt,
                });
            }
        });

        return result;
    }, [attendances]);

    const active = points.find((p) => p.id === activeId) ?? null;
    const defaultCenter = points[0]
        ? { lat: points[0].lat, lng: points[0].lng }
        : { lat: 14.5995, lng: 120.9842 };

    useEffect(() => {
        if (!selectedAttendanceId) return;
        const match = points.find((p) => p.attendanceId === selectedAttendanceId);
        if (match) setActiveId(match.id);
    }, [selectedAttendanceId, points]);

    return (
        <Card className="!p-0 overflow-hidden border-slate-200 h-full min-h-[420px] flex flex-col">
            <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">Clock locations</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                    {points.length > 0
                        ? `${points.length} pin${points.length === 1 ? '' : 's'} from captured GPS`
                        : 'No GPS coordinates for this selection yet'}
                </p>
            </div>
            <div className="flex-1 min-h-[360px]">
                <Map
                    defaultCenter={defaultCenter}
                    defaultZoom={12}
                    mapId="humanlink-attendance"
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                    style={{ width: '100%', height: '100%' }}
                >
                    <FitBounds points={points} />
                    {points.map((point) => (
                        <AdvancedMarker
                            key={point.id}
                            position={{ lat: point.lat, lng: point.lng }}
                            onClick={() => {
                                setActiveId(point.id);
                                const attendance = attendances.find((a) => a.id === point.attendanceId);
                                if (attendance) onSelect?.(attendance);
                            }}
                        >
                            <div
                                className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow ${
                                    point.kind === 'start' ? 'bg-emerald-500' : 'bg-indigo-500'
                                }`}
                            />
                        </AdvancedMarker>
                    ))}
                    {active && (
                        <InfoWindow
                            position={{ lat: active.lat, lng: active.lng }}
                            onCloseClick={() => setActiveId(null)}
                        >
                            <div className="text-xs space-y-1 min-w-[140px]">
                                <p className="font-bold text-slate-800">{active.label}</p>
                                {active.time && (
                                    <p className="text-slate-500">
                                        {new Date(active.time).toLocaleString()}
                                    </p>
                                )}
                                {active.ip && <p className="text-slate-500">IP: {active.ip}</p>}
                            </div>
                        </InfoWindow>
                    )}
                </Map>
            </div>
        </Card>
    );
}

export default function AttendanceLocationMap(props: Props) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

    if (!apiKey) {
        return (
            <Card className="border-slate-200 h-full min-h-[420px] flex items-center justify-center p-6">
                <div className="text-center space-y-2">
                    <p className="text-sm font-bold text-slate-700">Google Maps not configured</p>
                    <p className="text-xs text-slate-400 max-w-xs">
                        Set <code className="font-mono">VITE_GOOGLE_MAPS_API_KEY</code> in the UI env to show clock-in locations.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <APIProvider apiKey={apiKey}>
            <AttendanceMapInner {...props} />
        </APIProvider>
    );
}
