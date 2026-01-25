export default function Loading() {
    return (
        <div className='min-h-screen flex items-center justify-center font-[family-name:var(--font-geist-sans)]'>
            <div className='flex flex-col items-center gap-y-3'>
                <div className='h-12 w-12 rounded-full border-4 border-blue border-t-dark animate-spin' />
                <p className='text-xl text-dark'>Loading stock data...</p>
            </div>
        </div>
    );
}
