import api from './axios';

/**
 * Get shipping cost for an order
 * @param {string} country - Destination country
 * @param {number} orderTotal - Order total amount
 * @param {string} shippingMethod - "standard" or "express"
 * @returns {Promise<Object>} Shipping cost details
 */
export const getShippingCost = async (
    country,
    orderTotal,
    shippingMethod = "standard"
) => {
    try {
        const response = await api.post('/settings/shipping', {
            country,
            orderTotal,
            shippingMethod,
        });

        if (response.data && response.data.success) {
            return response.data;
        }
        throw new Error('Invalid shipping response');
    } catch (error) {
        console.error('Error fetching shipping cost:', error);
        return {
            success: false,
            shippingAmount: 0,
            error: error.message,
        };
    }
};

/**
 * Get all available shipping options for a country
 * @param {string} country - Destination country
 * @param {number} orderTotal - Order total
 * @returns {Promise<Object>} Shipping options with prices
 */
export const getShippingOptions = async (country, orderTotal) => {
    try {
        // Fetch both standard and express options
        const [standardRes, expressRes] = await Promise.all([
            api.post('/settings/shipping', {
                country,
                orderTotal,
                shippingMethod: 'standard',
            }),
            api.post('/settings/shipping', {
                country,
                orderTotal,
                shippingMethod: 'express',
            }),
        ]);

        let options = [
                {
                    id: 'standard',
                    name: 'Standard Delivery',
                    description: standardRes.data.shippingDetails || '',
                    price: standardRes.data.shippingAmount,
                    isFree: standardRes.data.isFreeShipping,
                    freeThreshold: standardRes.data.freeShippingThreshold,
                    deliveryDays: '5-7 business days',
                },
                {
                    id: 'express',
                    name: 'Express Post',
                    description: expressRes.data.shippingDetails || '',
                    price: expressRes.data.shippingAmount,
                    isFree: false,
                    deliveryDays: '2-3 business days',
                },
            ];

        if (country?.toLowerCase() === 'india') {
            options = options.filter(opt => opt.id === 'standard');
        }

        return {
            success: true,
            options,
        };
    } catch (error) {
        console.error('Error fetching shipping options:', error);
        return {
            success: false,
            options: [],
            error: error.message,
        };
    }
};

/**
 * Get packaging options
 * @returns {Promise<Object>} Available packaging options
 */
export const getPackagingOptions = async (country = '') => {
    try {
        const response = await api.get('/settings/packaging-options');

        let options = [];
        if (response.data && response.data.success) {
            options = response.data.packagingOptions;
        } else {
            throw new Error('Invalid packaging response');
        }

        if (country?.toLowerCase() === 'india') {
            options = options.filter(opt => opt.id === 'standard');
        }
        return options;
    } catch (error) {
        console.error('Error fetching packaging options:', error);
        // Return default options
        let options = [
            {
                id: 'standard',
                name: 'Standard Milaya Presentation Sachet',
                price: 0,
                description: 'Included with every purchase',
            },
            {
                id: 'exquisite',
                name: 'Exquisite Gift Packaging',
                price: 5,
                description: 'Premium luxury gift box with decorative presentation',
            },
        ];

        if (country?.toLowerCase() === 'india') {
            options = options.filter(opt => opt.id === 'standard');
        }
        return options;
    }
};

/**
 * Get packaging text for different pages
 * @param {string} page - "product", "shipping", "faq", or "checkout"
 * @returns {Promise<string>} Packaging text
 */
export const getPackagingText = async (page = 'product') => {
    try {
        const response = await api.get(`/settings/packaging-text?page=${page}`);

        if (response.data && response.data.success) {
            return response.data.text;
        }
        throw new Error('Invalid packaging text response');
    } catch (error) {
        console.error('Error fetching packaging text:', error);
        return 'Every piece arrives in our signature Milaya presentation sachet.';
    }
};

/**
 * Calculate order totals
 * @param {number} itemsPrice - Total price of items
 * @param {number} shippingAmount - Shipping cost
 * @param {number} packagingAmount - Packaging cost (optional)
 * @param {number} taxRate - Tax rate (default 0.1 for 10%)
 * @returns {Object} Order totals breakdown
 */
export const calculateOrderTotals = (
    itemsPrice = 0,
    shippingAmount = 0,
    packagingAmount = 0,
    taxRate = 0.1
) => {
    const taxAmount = Number((itemsPrice * taxRate).toFixed(2));
    const totalAmount = Number(
        (itemsPrice + taxAmount + shippingAmount + packagingAmount).toFixed(2)
    );

    return {
        itemsPrice: Number(itemsPrice.toFixed(2)),
        taxAmount,
        shippingAmount,
        packagingAmount,
        totalAmount,
        taxPercentage: (taxRate * 100).toFixed(0),
    };
};

/**
 * Format shipping display
 * @param {Object} shippingInfo - Shipping information
 * @returns {string} Formatted shipping display
 */
export const formatShippingDisplay = (shippingInfo) => {
    if (!shippingInfo) return 'Not available';

    const { shippingAmount, isFreeShipping, shippingMethod } = shippingInfo;

    if (isFreeShipping) {
        return `${shippingMethod === 'express' ? 'Express Post' : 'Standard Delivery'} - FREE`;
    }

    return `${shippingMethod === 'express' ? 'Express Post' : 'Standard Delivery'} - A$${shippingAmount.toFixed(2)}`;
};
