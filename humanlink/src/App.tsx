import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { navItems } from '@/routes/routes';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/authentication/Login';
import NotFound from '@/components/NotFound';
// import { Lock } from 'lucide-react';
import AppToaster from '@/components/AppToaster';
import TitleUpdater from '@/guards/TitleUpdater';
import RootRedirect from '@/guards/RootRedirect';
import PrivateRoute from '@/guards/PrivateRoute';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <TitleUpdater />
                <AppToaster />
                
                <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                        <Route path="/" element={<RootRedirect />} />
                        <Route path="/login" element={<LoginPage />} />

                        <Route element={<DashboardLayout />}>
                            {navItems.map((item) => (
                                <Route
                                    key={item.path}
                                    path={item.path}
                                    element={
                                        <PrivateRoute permission={item.permission}>
                                            {item.component}
                                        </PrivateRoute>
                                    }
                                />
                            ))}
                        </Route>

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </AuthProvider>
        </BrowserRouter>
    );
}