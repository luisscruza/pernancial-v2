import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    title: string;
}

export default ({ children, title, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate title={title} {...props}>
        {children}
    </AppLayoutTemplate>
);
