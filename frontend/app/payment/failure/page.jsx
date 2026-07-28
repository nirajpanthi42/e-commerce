"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiAlertCircle } from 'react-icons/fi';

export default function PaymentFailurePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="bg-red-100 rounded-full p-4 w-24 h-24 mx-auto flex items-center justify-center mb-6">
                    <FiAlertCircle className="text-5xl text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                <p className="text-gray-600 mb-6">
                    Your payment could not be processed. Don't worry, you haven't been charged.
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => router.back()}
                        className="block w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                        Try Again
                    </button>
                    <Link 
                        href="/cart"
                        className="block w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                        Return to Cart
                    </Link>
                    <Link 
                        href="/"
                        className="block w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}