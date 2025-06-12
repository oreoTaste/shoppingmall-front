export const SkeletonCard = ( {isDarkMode}: {isDarkMode: boolean} ) => {
    return (
        <div className={`rounded-2xl shadow-lg animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`rounded-t-2xl ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'} h-52`}></div>
            <div className="p-5">
                <div className="flex justify-between items-center">
                    <div className={`h-4 w-1/3 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
                    <div className={`h-5 w-1/4 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
                </div>
                <div className={`mt-4 h-8 w-1/2 rounded float-right ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
            </div>
        </div>
    );
};