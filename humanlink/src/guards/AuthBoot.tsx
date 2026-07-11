import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';

/** Shows one full-screen loader while the session is resolved — avoids stacked spinners on reload. */
export default function AuthBoot({ children }: { children: React.ReactNode }) {
    const { loading } = useAuth();

    if (loading) {
        return <LoadingSpinner fullPage />;
    }

    return <>{children}</>;
}
