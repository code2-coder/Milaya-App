import express from "express";
import {
  getAllShipments,
  getOrdersForShipment,
  getShipmentDetails,
  createShipment,
  updateShipment,
  updateShipmentStatus,
  syncTrackingNow,
  addShipmentNote,
  addDeliveryProof,
  duplicateShipment,
  deleteShipment,
  bulkShipmentAction,
  exportShipments,
} from "../controllers/shipmentController.js";
import {
  getAllCouriers,
  createCourier,
  updateCourier,
  toggleCourier,
  deleteCourier,
} from "../controllers/courierController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

const adminOrStaff = authorizeRoles("admin", "staff");
const adminOnly = authorizeRoles("admin");

// Shipment routes
router
  .route("/admin/shipments")
  .get(isAuthenticatedUser, adminOrStaff, getAllShipments)
  .post(isAuthenticatedUser, adminOnly, createShipment);

router
  .route("/admin/shipments/orders")
  .get(isAuthenticatedUser, adminOnly, getOrdersForShipment);

router
  .route("/admin/shipments/export")
  .get(isAuthenticatedUser, adminOnly, exportShipments);

router
  .route("/admin/shipments/bulk")
  .post(isAuthenticatedUser, adminOnly, bulkShipmentAction);

router
  .route("/admin/shipments/:id")
  .get(isAuthenticatedUser, adminOrStaff, getShipmentDetails)
  .put(isAuthenticatedUser, adminOnly, updateShipment)
  .delete(isAuthenticatedUser, adminOnly, deleteShipment);

router
  .route("/admin/shipments/:id/status")
  .patch(isAuthenticatedUser, adminOrStaff, updateShipmentStatus);

router
  .route("/admin/shipments/:id/notes")
  .post(isAuthenticatedUser, adminOrStaff, addShipmentNote);

router
  .route("/admin/shipments/:id/delivery-proof")
  .post(isAuthenticatedUser, adminOnly, addDeliveryProof);

router
  .route("/admin/shipments/:id/sync-tracking")
  .post(isAuthenticatedUser, adminOnly, syncTrackingNow);

router
  .route("/admin/shipments/:id/duplicate")
  .post(isAuthenticatedUser, adminOnly, duplicateShipment);

// Courier routes
router
  .route("/admin/couriers")
  .get(isAuthenticatedUser, adminOrStaff, getAllCouriers)
  .post(isAuthenticatedUser, adminOnly, createCourier);

router
  .route("/admin/couriers/:id")
  .put(isAuthenticatedUser, adminOnly, updateCourier)
  .delete(isAuthenticatedUser, adminOnly, deleteCourier);

router
  .route("/admin/couriers/:id/toggle")
  .patch(isAuthenticatedUser, adminOnly, toggleCourier);

export default router;
