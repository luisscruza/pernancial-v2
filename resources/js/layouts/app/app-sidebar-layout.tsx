import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

interface AppSidebarLayoutProps {
    title?: string;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppSidebarLayout({ children, title, breadcrumbs }: PropsWithChildren<AppSidebarLayoutProps>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader title={title} breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
