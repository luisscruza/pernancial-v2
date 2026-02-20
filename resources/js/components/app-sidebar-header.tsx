import { Breadcrumbs } from '@/components/breadcrumbs';
import { QuickTransactionCommand } from '@/components/quick-transaction-command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';

interface AppSidebarHeaderProps {
    title?: string;
    breadcrumbs?: BreadcrumbItem[];
}

export function AppSidebarHeader({ title, breadcrumbs = [] }: AppSidebarHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const resolvedTitle = title ?? breadcrumbs.at(-1)?.title;

    return (
        <>
            <QuickTransactionCommand />
            <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
                <div className="flex w-full items-center gap-3">
                    <SidebarTrigger className="-ml-1 md:hidden" />
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                        <div className="min-w-0">{resolvedTitle && <h1 className="truncate text-xl font-bold">{resolvedTitle}</h1>}</div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                className="text-muted-foreground hidden h-9 gap-2 px-3 text-sm lg:flex"
                                onClick={() => {
                                    // open command palette
                                }}
                            >
                                <Search className="h-4 w-4" />
                                <span>Buscar cuenta...</span>
                                <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
                                    <span className="text-xs">⌘</span>K
                                </kbd>
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="size-10 rounded-full p-1">
                                        <Avatar className="size-8 overflow-hidden rounded-full">
                                            <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>
            {breadcrumbs.length > 1 && (
                <div className="border-sidebar-border/70 flex w-full border-b px-6 md:px-4">
                    <div className="flex h-12 w-full items-center justify-start text-neutral-500">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
