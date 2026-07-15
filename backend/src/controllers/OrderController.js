import OrderService from "../services/OrderService.js";
import { sendResponse } from "../helpers/response.js";

export class OrderController {
  async newOrder(req, res, next) {
    try {
      const order = await OrderService.createOrder(req.body, req.user._id);
      return sendResponse(res, 201, true, "Order created successfully", { order });
    } catch (error) {
      next(error);
    }
  }

  async myOrders(req, res, next) {
    try {
      const orders = await OrderService.getUserOrders(req.user._id);
      return sendResponse(res, 200, true, "User orders fetched successfully", { orders });
    } catch (error) {
      next(error);
    }
  }

  async getOrderDetails(req, res, next) {
    try {
      const order = await OrderService.getOrderDetails(req.params.id);
      return sendResponse(res, 200, true, "Order details fetched successfully", { order });
    } catch (error) {
      next(error);
    }
  }

  async allOrders(req, res, next) {
    try {
      const result = await OrderService.getAllOrders();
      return sendResponse(res, 200, true, "All orders fetched successfully", {
        totalAmount: result.totalAmount,
        orders: result.orders
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOrder(req, res, next) {
    try {
      const order = await OrderService.updateOrder(req.params.id, req.body);
      return sendResponse(res, 200, true, "Order updated successfully", { order });
    } catch (error) {
      next(error);
    }
  }

  async deleteOrder(req, res, next) {
    try {
      await OrderService.deleteOrder(req.params.id);
      return sendResponse(res, 200, true, "Order deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
