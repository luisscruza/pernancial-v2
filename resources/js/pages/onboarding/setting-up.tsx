"use client";

import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/animated-list";
import React from "react";
import { router } from "@inertiajs/react";

interface Item {
    name: string;
    description: string;
    icon: string;
    color: string;
    time: string;
}

let notifications = [
    {
        name: "Creando cuenta...",
        description: "Configurando tu perfil financiero",
        time: "1s ago",
        icon: "💸",
        color: "#00C9A7",
    },
    {
        name: "Definiendo moneda base",
        description: "EUR seleccionado como moneda principal",
        time: "1s ago",
        icon: "💶",
        color: "#4A7AFF",
    },
    {
        name: "Creando categorías",
        description: "Categorías predeterminadas configuradas",
        time: "1s ago",
        icon: "🏷️",
        color: "#FF6B6B",
    },
    {
        name: "Configurando cuentas",
        description: "Cuenta de ahorros creada",
        time: "1s ago",
        icon: "🏦",
        color: "#9775FA",
    },
    {
        name: "Añadiendo presupuestos",
        description: "Presupuesto mensual configurado",
        time: "1s ago",
        icon: "📊",
        color: "#FFB800",
    },
    {
        name: "Configurando período contable",
        description: "Ciclo mensual establecido",
        time: "1s ago",
        icon: "📅",
        color: "#63E6BE",
    },
    {
        name: "Añadiendo transacción",
        description: "Primera transacción registrada",
        time: "1s ago",
        icon: "📝",
        color: "#FF9F43",
    },
    {
        name: "Configurando conversión de divisas",
        description: "Tasas de cambio actualizadas",
        time: "1s ago",
        icon: "🔄",
        color: "#54BAB9",
    },
];

notifications = Array.from({ length: 10 }, () => notifications).flat();

const Notification = ({ name, description, icon, color, time }: Item) => {
    return (
        <figure
            className={cn(
                "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4",
                // animation styles
                "transition-all duration-200 ease-in-out hover:scale-[103%]",
                // light styles
                "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
                // dark styles
                "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
            )}
        >
            <div className="flex flex-row items-center gap-3">
                <div
                    className="flex size-10 items-center justify-center rounded-2xl"
                    style={{
                        backgroundColor: color,
                    }}
                >
                    <span className="text-lg">{icon}</span>
                </div>
                <div className="flex flex-col overflow-hidden">
                    <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white ">
                        <span className="text-sm sm:text-lg">{name}</span>
                        <span className="mx-1">·</span>
                        <span className="text-xs text-gray-500">{time}</span>
                    </figcaption>
                    <p className="text-sm font-normal dark:text-white/60">
                        {description}
                    </p>
                </div>
            </div>
        </figure>
    );
};

export default function SettingUp({
    className,
}: {
    className?: string;
}) {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            router.visit(route('accounts'));
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col items-center h-screen">
            <div
                className={cn(
                    "relative flex h-[400px] w-full flex-col items-center justify-center overflow-hidden p-2",
                    className,
                )}
            >
                <div className="relative flex flex-col h-full w-full items-center justify-center">
                    <div className="flex-1 overflow-hidden flex items-center px-5">
                        <AnimatedList>
                            {notifications.map((item, idx) => (
                                <Notification {...item} key={idx} />
                            ))}
                        </AnimatedList>
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background"></div>
                </div>

            </div>
            <h2 className="mt-12 text-xl font-medium text-center z-10">Creando cuenta... un momento</h2>
            <p className="text-sm text-center z-10">
                Pronto podrás empezar a usar tu cuenta...
            </p>
        </div>
    );
}
