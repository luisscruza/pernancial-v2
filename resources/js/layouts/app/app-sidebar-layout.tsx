import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, title }: PropsWithChildren<{ title: string }>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader title={title} />
                {children}
            </AppContent>
        </AppShell>
    );
}
