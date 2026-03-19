import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { navItems } from '@/routes/routes';

export default function TitleUpdater() {
    const location = useLocation();
    
    useEffect(() => {
        const currentRoute = navItems.find(item => item.path === location.pathname);
        document.title = currentRoute?.title || 'Admin Portal';
    }, [location]);

    return null;
}