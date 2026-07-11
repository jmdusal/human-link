import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { navItems } from '@/routes/routes';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/authentication/Login';
import ForgotPasswordPage from '@/pages/authentication/ForgotPassword';
import ResetPasswordPage from '@/pages/authentication/ResetPassword';
import VerifyEmailPage from '@/pages/authentication/VerifyEmail';
import NotFound from '@/components/ui/NotFound';
import AppToaster from '@/components/shared/AppToaster';
import TitleUpdater from '@/guards/TitleUpdater';
import RootRedirect from '@/guards/RootRedirect';
import PrivateRoute from '@/guards/PrivateRoute';
import AuthBoot from '@/guards/AuthBoot';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';


export default function App() {
    return (
        <BrowserRouter>
        <ThemeProvider>
        
            <AuthProvider>
                <TitleUpdater />
                <AppToaster />
                
                <AuthBoot>
                <Suspense fallback={<LoadingSpinner fullPage />}>
                    <Routes>
                        <Route path="/" element={<RootRedirect />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        <Route path="/verify-email" element={<VerifyEmailPage />} />
                        
                        <Route element={<DashboardLayout />}>
                            {(() => {
                                const registered = new Set<string>();
                                const routes: React.ReactElement[] = [];

                                navItems
                                    .filter((item) => !item.hidden)
                                    .forEach((item) => {
                                        if (item.path && item.component && !registered.has(item.path)) {
                                            registered.add(item.path);
                                            routes.push(
                                                <Route
                                                    key={item.path}
                                                    path={item.path}
                                                    element={
                                                        <PrivateRoute permission={item.permission}>
                                                            {item.component}
                                                        </PrivateRoute>
                                                    }
                                                />
                                            );
                                        }

                                        item.children?.forEach((child: any) => {
                                            const fullPath = child.path.startsWith('/')
                                                ? child.path
                                                : `${item.path}/${child.path}`.replace(/\/+/g, '/');

                                            if (registered.has(fullPath)) {
                                                return;
                                            }

                                            registered.add(fullPath);
                                            routes.push(
                                                <Route
                                                    key={fullPath}
                                                    path={fullPath}
                                                    element={
                                                        <PrivateRoute permission={child.permission}>
                                                            {child.component}
                                                        </PrivateRoute>
                                                    }
                                                />
                                            );
                                        });
                                    });

                                return routes;
                            })()}
                        </Route>
                        
                        {navItems
                            .filter((item) => item.hidden)
                            .map((item) => (
                                <Route
                                    key={item.path}
                                    path={item.path}
                                    element={
                                        <PrivateRoute permission={item.permission}>
                                            {item.component}
                                        </PrivateRoute>
                                    }
                                />
                            ))
                        }

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
                </AuthBoot>
                
            </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}