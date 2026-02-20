import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, title, breadcrumbs }: AppLayoutProps) => (
    <AppLayoutTemplate title={title} breadcrumbs={breadcrumbs}>
        {children}
    </AppLayoutTemplate>
);
