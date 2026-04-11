export default function NotFound() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F0F2F5]">
            <h1 className="text-9xl font-black text-slate-200 tracking-tighter">404</h1>
            <p className="text-xl font-bold text-slate-400 -mt-8">Page Not Found</p>
            <button
                onClick={() => window.history.back()}
                className="mt-6 px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
                Go Back
            </button>
        </div>
    );
}