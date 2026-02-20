import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, MessageCircle, Users } from 'lucide-react';
import AppLogo from './app-logo';

type NavItemWithChildren = NavItem & {
    children?: NavItem[];
};

const financeNavItems: NavItemWithChildren[] = [
    {
        title: 'Cuentas',
        href: '/',
        icon: LayoutGrid,
        children: [
            {
                title: 'Resumen',
                href: '/',
            },
            {
                title: 'Cuentas por cobrar',
                href: '/receivables',
            },
            {
                title: 'Cuentas por pagar',
                href: '/payables',
            },
        ],
    },
    {
        title: 'Presupuestos',
        href: '/budgets',
        icon: BookOpen,
    },
];

const catalogNavItems: NavItemWithChildren[] = [
    {
        title: 'Personas',
        href: '/contacts',
        icon: Users,
    },
    {
        title: 'Catalogos',
        href: '/categories',
        icon: Folder,
        children: [
            {
                title: 'Categorias',
                href: '/categories',
            },
            {
                title: 'Monedas',
                href: '/currencies',
            },
        ],
    },
];

const toolsNavItems: NavItemWithChildren[] = [
    {
        title: 'Asistente',
        href: '/finance/chat',
        icon: MessageCircle,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-3 pb-4">
                <NavMain items={financeNavItems} label="Finanzas" />
                <SidebarSeparator />
                <NavMain items={catalogNavItems} label="Catalogos" />
                <SidebarSeparator />
                <NavMain items={toolsNavItems} label="Herramientas" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
