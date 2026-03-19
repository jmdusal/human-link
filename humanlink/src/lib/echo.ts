import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import api from '../api/axios';

(window as any).Pusher = Pusher;

export const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'humanlinkkey123', 
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8081,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8081,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    debug: true,
    // authorizer: (channel: any) => {
    //     return {
    //         authorize: (socketId: string, callback: Function) => {
    //             api.post('/broadcasting/auth', {
    //                 socket_id: socketId,
    //                 channel_name: channel.name
    //             }, {
    //                 withCredentials: true
    //             })
    //             .then(response => callback(false, response.data))
    //             .catch(error => {
    //                 console.error("Broadcast Auth Error:", error);
    //                 callback(true, error);
    //             });
    //         }
    //     };
    // },
    authorizer: (channel: any) => {
        return {
            authorize: (socketId: string, callback: Function) => {
                api.post('http://localhost:8000/broadcasting/auth', {
                    socket_id: socketId,
                    channel_name: channel.name
                }, {
                    withCredentials: true
                }
            )
                .then(response => callback(false, response.data))
                .catch(error => callback(true, error));
            }
        };
    },
});
