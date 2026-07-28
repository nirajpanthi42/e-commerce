"use client";

import { createEsewaPayment } from "../services/paymentService";
import { useState } from "react";

export default function PaymentButton({ orderId }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePayment = async () => {
        // Validate orderId
        if (!orderId) {
            setError("Invalid order ID. Please try again.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('Initiating eSewa payment for order:', orderId);
            
            const data = await createEsewaPayment(orderId);
            
            console.log('Received eSewa payment data:', data);

            // Validate the response data
            if (!data) {
                throw new Error("No payment data received");
            }

            // Check for required fields (adjust based on your API response)
            const requiredFields = ['signature', 'signed_field_names', 'total_amount', 'transaction_uuid', 'product_code'];
            const missingFields = requiredFields.filter(field => !data[field]);
            
            if (missingFields.length > 0) {
                console.error('Missing required fields:', missingFields);
                throw new Error(`Invalid payment data received. Missing: ${missingFields.join(', ')}`);
            }

            // Create form programmatically
            const form = document.createElement("form");
            form.method = "POST";
            form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

            // Add all payment fields as hidden inputs
            Object.entries(data).forEach(([key, value]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });

            // Append and submit form
            document.body.appendChild(form);
            
            // Add a small delay to ensure form is added to DOM
            setTimeout(() => {
                form.submit();
                
                // Clean up form after submission
                setTimeout(() => {
                    if (document.body.contains(form)) {
                        document.body.removeChild(form);
                    }
                }, 1000);
            }, 100);

        } catch (error) {
            console.error("Payment initialization failed:", error);
            setError(error.message || "Payment initialization failed. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={handlePayment}
                disabled={isLoading || !orderId}
                className={`px-6 py-3 rounded font-medium transition-all duration-200 ${
                    isLoading || !orderId
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white transform hover:scale-[1.02]"
                }`}
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                        Redirecting to eSewa...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
                            />
                        </svg>
                        Pay with eSewa
                    </span>
                )}
            </button>
            
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 w-full">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
}