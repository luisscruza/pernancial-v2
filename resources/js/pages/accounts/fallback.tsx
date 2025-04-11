import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export default function Fallback() {
    return (
        <motion.div layout className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-4 w-20" />
                </div>
            ))}
        </motion.div>
    );
}
