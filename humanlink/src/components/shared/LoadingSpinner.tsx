export const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full w-full min-h-[400px]">
        <div className="relative h-12 w-12">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    </div>
);