import Settings from "../models/settings.js";
import Product from "../models/product.js";

/**
 * Calculate shipping cost based on country, order total, and shipping method
 * @param {string} country - Destination country
 * @param {number} orderTotal - Order total in base currency
 * @param {string} shippingMethod - "standard" or "express"
 * @returns {Promise<Object>} Shipping info with amount and details
 */
export const calculateShipping = async (
    country,
    orderTotal,
    shippingMethod = "standard"
) => {
    let settings = await Settings.findOne();

    if (!settings) {
        // Initialize with defaults if not found
        settings = new Settings();
        await settings.save();
    }

    let shippingAmount = 0;
    let isFreeShipping = false;
    let shippingDetails = "";

    const countryLower = (country || "").toLowerCase();

    if (countryLower === "australia") {
        if (shippingMethod === "express") {
            shippingAmount = settings.australiaShipping.expressShippingPrice;
            shippingDetails = `Express Post: ₹${shippingAmount.toFixed(2)}`;
        } else {
            // Standard shipping
            if (orderTotal >= settings.australiaShipping.freeShippingThreshold) {
                shippingAmount = 0;
                isFreeShipping = true;
                shippingDetails = `Standard Delivery: FREE (Order over ₹${settings.australiaShipping.freeShippingThreshold})`;
            } else {
                shippingAmount = settings.australiaShipping.standardShippingPrice;
                shippingDetails = `Standard Delivery: ₹${shippingAmount.toFixed(2)}`;
            }
        }
    } else if (countryLower === "india") {
        if (shippingMethod === "express") {
            shippingAmount = 1000;
            shippingDetails = `Express Delivery: ₹${shippingAmount.toFixed(2)}`;
        } else {
            shippingAmount = 0; // Standard shipping is FREE for India
            isFreeShipping = true;
            shippingDetails = `Standard Delivery: FREE`;
        }
    } else {
        // Default for other countries
        shippingAmount = 2000;
        shippingDetails = `International Shipping: ₹2000`;
    }

    return {
        country,
        shippingMethod,
        shippingAmount: Number(shippingAmount.toFixed(2)),
        isFreeShipping,
        shippingDetails,
        freeShippingThreshold:
            countryLower === "australia"
                ? settings.australiaShipping.freeShippingThreshold
                : null,
    };
};

/**
 * Calculate packaging cost
 * @param {string} packagingOption - "standard" or "exquisite"
 * @returns {Promise<Object>} Packaging info
 */
export const calculatePackaging = async (packagingOption = "standard") => {
    let settings = await Settings.findOne();

    if (!settings) {
        settings = new Settings();
        await settings.save();
    }

    let packagingAmount = 0;
    let packagingName = settings.packaging.standardPackagingName;

    if (packagingOption === "exquisite") {
        packagingAmount = settings.packaging.exquisitePackagingPrice;
        packagingName = settings.packaging.exquisitePackagingName;
    }

    return {
        packagingOption,
        packagingName,
        packagingAmount: Number(packagingAmount.toFixed(2)),
    };
};

/**
 * Calculate order totals (items + tax + shipping + packaging)
 * @param {number} itemsPrice - Total price of items
 * @param {number} taxRate - Tax rate (0.1 for 10%)
 * @param {number} shippingAmount - Shipping cost
 * @param {number} packagingAmount - Packaging cost
 * @returns {Object} Breakdown of all costs
 */
export const calculateOrderTotals = (
    itemsPrice,
    taxRate = 0.1,
    shippingAmount = 0,
    packagingAmount = 0
) => {
    const taxAmount = Number((itemsPrice * taxRate).toFixed(2));
    const totalAmount = Number(
        (itemsPrice + taxAmount + shippingAmount + packagingAmount).toFixed(2)
    );

    return {
        itemsPrice: Number(itemsPrice.toFixed(2)),
        taxAmount,
        taxRate: taxRate * 100 + "%",
        shippingAmount,
        packagingAmount,
        totalAmount,
        breakdown: {
            items: `₹${itemsPrice.toFixed(2)}`,
            tax: `₹${taxAmount.toFixed(2)} (${taxRate * 100}%)`,
            shipping: `₹${shippingAmount.toFixed(2)}`,
            packaging: `₹${packagingAmount.toFixed(2)}`,
            total: `₹${totalAmount.toFixed(2)}`,
        },
    };
};

/**
 * Get all available shipping options for a country
 * @param {string} country - Destination country
 * @param {number} orderTotal - Order total
 * @returns {Promise<Array>} Array of shipping options
 */
export const getShippingOptions = async (country, orderTotal) => {
    const standardShipping = await calculateShipping(country, orderTotal, "standard");
    const expressShipping = await calculateShipping(country, orderTotal, "express");

    return [
        {
            id: "standard",
            name: "Standard Delivery",
            description: standardShipping.shippingDetails,
            price: standardShipping.shippingAmount,
            isFree: standardShipping.isFreeShipping,
            deliveryDays: "5-7 business days",
        },
        {
            id: "express",
            name: "Express Post",
            description: expressShipping.shippingDetails,
            price: expressShipping.shippingAmount,
            isFree: false,
            deliveryDays: "2-3 business days",
        },
    ];
};

/**
 * Validate order prices against database and exchange rates
 * @param {Object} reqBody - Request body containing order details
 * @returns {Promise<Object|boolean>} Verified amounts or false if invalid
 */
export const validateOrderPrices = async (reqBody) => {
    const { orderItems, shippingInfo, itemsPrice, shippingAmount, packagingAmount = 0, shippingMethod = "standard", packagingOption = "standard", totalAmount } = reqBody;
    const country = shippingInfo?.country || "";
    
    let expectedItemsPrice = 0;
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) return false;
        let basePrice = product.price;
        if (item.size && product.variants && product.variants.length > 0) {
            const variant = product.variants.find((v) => v.size === item.size);
            if (variant) basePrice = variant.price;
        }
        expectedItemsPrice += basePrice * item.quantity;
    }

    const shippingInfoCalculated = await calculateShipping(country, expectedItemsPrice, shippingMethod);
    const expectedShippingAmount = shippingInfoCalculated.shippingAmount;

    let expectedPackagingAmount = 0;
    if (country.toLowerCase() !== "india") {
        const packagingInfoCalculated = await calculatePackaging(packagingOption);
        expectedPackagingAmount = packagingInfoCalculated.packagingAmount;
    }

    const expectedTotalAmount = Number((expectedItemsPrice + expectedShippingAmount + expectedPackagingAmount).toFixed(2));

    const tolerance = 15;
    const itemsPriceDiff = Math.abs(itemsPrice - expectedItemsPrice);
    const shippingDiff = Math.abs(shippingAmount - expectedShippingAmount);
    const packagingDiff = Math.abs(packagingAmount - expectedPackagingAmount);
    const totalDiff = Math.abs(totalAmount - expectedTotalAmount);

    if (itemsPriceDiff > tolerance || shippingDiff > tolerance || packagingDiff > tolerance || totalDiff > tolerance) {
        return false;
    }

    return { itemsPrice: expectedItemsPrice, shippingAmount: expectedShippingAmount, packagingAmount: expectedPackagingAmount, totalAmount: expectedTotalAmount, taxAmount: 0 };
};
