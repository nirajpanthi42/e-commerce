const API_URL = 'https://e-commerce-3-23ca.onrender.com/api' 

export const createEsewaPayment = async (orderId) => {
    try {
        if (!orderId) {
            throw new Error('Order ID is required');
        }

        console.log('🔵 Creating payment for order:', orderId);

        // Get auth token if needed
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/payment/esewa/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: JSON.stringify({ orderId }),
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Payment data received:', data);
        return data;

    } catch (error) {
        console.error('❌ Payment creation failed:', error);
        throw error;
    }
};