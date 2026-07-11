interface LoadingSpinnerProps {
    fullPage?: boolean;
}

export const LoadingSpinner = ({ fullPage = false }: LoadingSpinnerProps) => {
    const spinner = (
        <div className={`flex items-center justify-center w-full ${fullPage ? 'h-full' : 'h-full min-h-[400px]'}`}>
            <div className="relative h-12 w-12">
                <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
                <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-[#F0F2F5]">
                {spinner}
            </div>
        );
    }

    return spinner;
};
