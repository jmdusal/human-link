import { useState, useEffect } from 'react';
import { echo } from '../../lib/echo';

export const useNotifications = (userId: number | undefined) => {
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (!userId) return;

        const channel = echo.private(`App.Models.User.${userId}`)
            .notification((notification: any) => {
                setNotifications((prev) => [notification, ...prev]);
            });

        return () => {
            echo.leave(`App.Models.User.${userId}`);
        };
    }, [userId]);

    return { notifications, setNotifications };
};