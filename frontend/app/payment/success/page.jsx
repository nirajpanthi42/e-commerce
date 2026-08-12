// app/payment/success/page.jsx
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiLoader, FiXCircle } from 'react-icons/fi';

const API_URL ='http://localhost:8000/api';

// Separate component that uses useSearchParams
function PaymentVerification() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState('verifying');
    const [orderDetails, setOrderDetails] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const orderId = searchParams.get('orderId');
                const transaction_uuid = searchParams.get('transaction_uuid');

                console.log('Verifying payment:', { orderId, transaction_uuid });

                if (!orderId || !transaction_uuid) {
                    setStatus('error');
                    return;
                }

                // Verify payment with backend
                const response = await fetch(`${API_URL}/payment/esewa/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId,
                        transaction_uuid,
                        status: 'success'
                    })
                });

                const data = await response.json();

                if (data.success) {
                    setStatus('success');
                    setOrderDetails(data.order);
                    // Clear cart
                    localStorage.removeItem('cart');
                } else {
                    setStatus('failed');
                }
            } catch (error) {
                console.error('Verification failed:', error);
                setStatus('error');
            }
        };

        verifyPayment();
    }, [searchParams]);

    if (status === 'verifying') {
        return (
            <div className="text-center">
                <FiLoader className="animate-spin text-5xl text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Verifying Payment</h2>
                <p className="text-gray-600 mt-2">Please wait while we confirm your payment...</p>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="bg-green-100 rounded-full p-4 w-24 h-24 mx-auto flex items-center justify-center mb-6">
                    <FiCheckCircle className="text-5xl text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-gray-600 mb-6">
                    Your payment has been processed successfully.
                </p>
                {orderDetails && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm text-gray-600">Order ID: <span className="font-medium">{orderDetails.id}</span></p>
                        <p className="text-sm text-gray-600">Amount: <span className="font-medium">NPR {orderDetails.totalAmount}</span></p>
                        <p className="text-sm text-gray-600">Status: <span className="text-green-600 font-medium">Paid</span></p>
                    </div>
                )}
                <div className="space-y-3">
                    <Link 
                        href="/orders"
                        className="block w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                        View My Orders
                    </Link>
                    <Link 
                        href="/"
                        className="block w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="bg-red-100 rounded-full p-4 w-24 h-24 mx-auto flex items-center justify-center mb-6">
                <FiXCircle className="text-5xl text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-6">
                We couldn't verify your payment. Please contact support if you've been charged.
            </p>
            <div className="space-y-3">
                <Link 
                    href="/contact"
                    className="block w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                    Contact Support
                </Link>
                <Link 
                    href="/"
                    className="block w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
}

// Loading fallback component
function LoadingFallback() {
    return (
        <div className="text-center">
            <div className="animate-pulse">
                <div className="bg-gray-200 rounded-full p-4 w-24 h-24 mx-auto mb-6"></div>
                <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
            </div>
        </div>
    );
}

// Main page component wrapped with Suspense
export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <Suspense fallback={<LoadingFallback />}>
                <PaymentVerification />
            </Suspense>
        </div>
    );
}