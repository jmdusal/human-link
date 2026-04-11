import React, { useState, useRef, useEffect } from 'react';
import { Bell, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { echo } from '@/lib/echo';
import { useAuth } from '@/context/AuthContext';

export default function NotificationDropdown() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleNewNotification = (notification: any) => {
        console.log("🔥 FULL NOTIFICATION RECEIVED:", notification);

        setNotifications((prev) => {
            if (prev.find(n => n.id === notification.id)) return prev;

            const displayTitle = notification.title || 
                                notification.data?.title || 
                                notification.message || 
                                notification.data?.message || 
                                "New Notification";

            return [
                {
                    id: notification.id || Math.random().toString(),
                    title: displayTitle,
                    time: 'Just now',
                    read: false
                },
                ...prev
            ];
        });
    };

    useEffect(() => {
        if (!user?.id) return;

        const channelName = `App.Models.User.${user.id}`;
        console.log("Listening on:", channelName);
        const channel = echo.private(channelName);

        channel.listenToAll((event: any, data: any) => {
            console.log("RAW WEBSOCKET EVENT:", event, data);

            if (event.includes('NewActivityNotification') || event.includes('BroadcastNotificationCreated')) {
                handleNewNotification(data);
            }
        });

        channel.notification((n: any) => {
            console.log("Laravel Notification Listener:", n);
            handleNewNotification(n);
        });

        return () => echo.leave(channelName);
    }, [user?.id]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-xl shadow-sm border transition-all duration-200 
                ${isOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-100 text-slate-500 hover:text-blue-600'}`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-[24px] shadow-xl overflow-hidden z-50"
                    >
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                    {unreadCount} New
                                </span>
                            )}
                        </div>

                        <div className="max-h-[350px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start gap-3">
                                            {!n.read && <Circle className="fill-blue-500 text-blue-500 mt-1.5 shrink-0" size={8} />}
                                            <div className={!n.read ? "" : "pl-5"}>
                                                <p className="text-sm font-medium text-slate-800 leading-tight">{n.title}</p>
                                                <p className="text-[11px] text-slate-400 mt-1">{n.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-10 text-center text-slate-400 text-sm">
                                    No notifications yet
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}