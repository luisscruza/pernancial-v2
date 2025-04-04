import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children }: AppLayoutProps) => (
    <div className="flex h-[100vh] flex-col items-center justify-center">
        {children}
    </div>
);
