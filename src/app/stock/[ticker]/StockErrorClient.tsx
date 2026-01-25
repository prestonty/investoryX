"use client";

export default function StockErrorClient() {

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 font-[family-name:var(--font-geist-sans)]'>
            <div className='max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg text-dark'>
                <div className='text-center'>
                    <h1 className='text-2xl font-bold mb-4'>
                        Stock Data Unavailable
                    </h1>
                    <p className='text-gray-600 mb-6'>
                        We&apos;re having trouble loading the stock information
                        right now. This could be due to:
                    </p>
                    <ul className='text-left text-sm text-gray-600 space-y-2 mb-6'>
                        <li>- Market data service temporarily unavailable</li>
                        <li>- Network connectivity issues</li>
                        <li>- Stock symbol not found</li>
                    </ul>
                    <div className='space-y-3'>
                        <button
                            onClick={() => window.location.reload()}
                            className='w-full px-4 py-2 bg-blue text-white font-semibold rounded hover:bg-blue-700 transition-colors'
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className='w-full px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded hover:bg-gray-300 transition-colors'
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
