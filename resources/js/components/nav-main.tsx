import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

type NavItemWithChildren = NavItem & {
    children?: NavItem[];
};

export function NavMain({ items = [], label = 'Platform' }: { items: NavItemWithChildren[]; label?: string }) {
    const page = usePage();
    const isItemActive = (item: NavItemWithChildren) => {
        if (item.href === page.url) {
            return true;
        }

        return item.children?.some((child) => child.href === page.url) ?? false;
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="text-sidebar-foreground/60 text-[0.7rem] tracking-[0.18em] uppercase">{label}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const isActive = isItemActive(item);
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild isActive={isActive} tooltip={{ children: item.title }} className="transition-colors">
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span className={isActive ? 'font-semibold' : ''}>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                                {item.children && item.children.length > 0 ? (
                                    <SidebarMenuSub>
                                        {item.children.map((child) => (
                                            <SidebarMenuSubItem key={child.title}>
                                                <SidebarMenuSubButton asChild isActive={child.href === page.url}>
                                                    <Link href={child.href} prefetch>
                                                        <span className="bg-sidebar-foreground/50 inline-flex size-1.5 rounded-full" />
                                                        <span>{child.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                ) : null}
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
