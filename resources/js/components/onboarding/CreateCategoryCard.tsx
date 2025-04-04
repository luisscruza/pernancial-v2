interface CreateCategoryCardProps {
    onClick: () => void;
}

export function CreateCategoryCard({ onClick }: CreateCategoryCardProps) {
    return (
        <button
            onClick={onClick}
            className="flex h-32 w-32 flex-col items-center justify-center rounded-2xl border-2 border-dashed 
                border-gray-700 transition-all hover:border-gray-600 hover:bg-gray-800"
        >
            <div className="text-3xl font-bold text-gray-500">+</div>
            <span className="mt-2 text-sm font-medium text-gray-500">Añadir categoría</span>
        </button>
    );
} 