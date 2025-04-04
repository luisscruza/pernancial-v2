import { SidebarTrigger } from '@/components/ui/sidebar';

export function AppSidebarHeader({ title }: { title: string}) {
    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2 w-full max-w-screen">
                <SidebarTrigger className="block md:hidden -ml-1" />
                <div className="flex items-center w-full justify-center gap-2">
                    <h1 className="text-xl font-bold">{title}</h1>
                </div>
            </div>
        </header>
    );
}
