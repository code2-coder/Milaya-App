import OrderRepository from "../repositories/OrderRepository.js";
import ProductRepository from "../repositories/ProductRepository.js";
import { validateOrderPrices } from "../utils/shippingCalculator.js";

export class OrderService {
  async createOrder(orderData, userId) {
    const verifiedTotals = await validateOrderPrices(orderData);
    if (!verifiedTotals) {
      throw new Error("Order pricing validation failed. Please refresh your cart and try again.");
    }

    const {
      orderItems,
      shippingInfo,
      shippingMethod = "standard",
      packagingOption = "standard",
      paymentMethod,
      paymentInfo
    } = orderData;

    return OrderRepository.create({
      orderItems,
      shippingInfo,
      itemsPrice: verifiedTotals.itemsPrice,
      taxAmount: verifiedTotals.taxAmount,
      shippingAmount: verifiedTotals.shippingAmount,
      packagingAmount: verifiedTotals.packagingAmount,
      shippingMethod,
      packagingOption,
      totalAmount: verifiedTotals.totalAmount,
      paymentMethod,
      paymentInfo,
      user: userId
    });
  }

  async getUserOrders(userId) {
    return OrderRepository.find(
      { user: userId },
      { populate: { path: "orderItems.returnActive" }, lean: true }
    );
  }

  async getOrderDetails(orderId) {
    const order = await OrderRepository.findById(orderId, {
      populate: [
        { path: "user", select: "name email" },
        { path: "orderItems.returnActive" }
      ],
      lean: true
    });

    if (!order) {
      throw new Error("No Order found with this ID");
    }

    return order;
  }

  async getAllOrders() {
    const orders = await OrderRepository.find(
      {},
      { populate: { path: "user", select: "name email" }, lean: true }
    );

    const totalAmount = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    return {
      orders,
      totalAmount
    };
  }

  async updateOrder(orderId, { status, trackingId, trackingUrl }) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new Error("No Order found with this ID");
    }

    if (order.orderStatus === "Delivered") {
      throw new Error("Order already delivered");
    }

    // Deduct stock when order moves from Processing to Shipped or Delivered
    if (
      order.orderStatus === "Processing" &&
      (status === "Shipped" || status === "Delivered")
    ) {
      for (const item of order.orderItems) {
        const product = await ProductRepository.findById(item.product);
        if (!product) {
          throw new Error(`Product not found with ID ${item.product}`);
        }
        product.stock -= item.quantity;
        await product.save({ validateBeforeSave: false });
      }
    }

    if (status) order.orderStatus = status;
    if (trackingId !== undefined) order.trackingId = trackingId;
    if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;
    if (status === "Delivered") order.deliveredAt = Date.now();

    await order.save();
    return order;
  }

  async deleteOrder(orderId) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new Error("No Order found with this ID");
    }
    return OrderRepository.deleteById(orderId);
  }
}

export default new OrderService();
