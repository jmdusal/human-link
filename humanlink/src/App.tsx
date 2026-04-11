import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { navItems } from '@/routes/routes';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/authentication/Login';
import NotFound from '@/components/ui/NotFound';
// import { Lock } from 'lucide-react';
import AppToaster from '@/components/shared/AppToaster';
import TitleUpdater from '@/guards/TitleUpdater';
import RootRedirect from '@/guards/RootRedirect';
import PrivateRoute from '@/guards/PrivateRoute';


export default function App() {
    return (
        <BrowserRouter>
        <ThemeProvider>
        
            <AuthProvider>
                <TitleUpdater />
                <AppToaster />
                
                <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                        <Route path="/" element={<RootRedirect />} />
                        <Route path="/login" element={<LoginPage />} />
                        
                        <Route element={<DashboardLayout />}>
                            {navItems
                            // .filter(item => item.path !== '/workspaces/:slug')
                            .filter(item => !item.hidden)
                            .map((item) => (
                                <React.Fragment key={item.path}>

                                    <Route
                                        path={item.path}
                                        element={
                                            <PrivateRoute permission={item.permission}>
                                                {item.component}
                                            </PrivateRoute>
                                        }
                                    />

                                    {item.children?.map((child: any) => {
                                        const fullPath = child.path.startsWith('/') 
                                            ? child.path 
                                            : `${item.path}/${child.path}`.replace(/\/+/g, '/');

                                        return (
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
                                    })}
                                </React.Fragment>
                            ))}
                        </Route>
                        
                        {/* this navItem will not load the dashboardlayout */}
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

                        {/* <Route
                            path="/workspaces/:slug"
                            element={
                                <PrivateRoute permission="workspaces-view">
                                    <Workspace />
                                </PrivateRoute>
                            }
                        /> */}
                        {/* <Route    element={<DashboardLayout />}>
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
                        </Route> */}

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
                
            </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}