import ProductService from "../services/ProductService.js";
import { sendResponse } from "../helpers/response.js";
import { clearCache } from "../middlewares/cache.js";

export class ProductController {
  async getProducts(req, res, next) {
    try {
      const result = await ProductService.getProducts(req.query);
      return sendResponse(res, 200, true, "Products fetched successfully", {
        results: result.count,
        totalProducts: result.totalProducts,
        products: result.products
      });
    } catch (error) {
      next(error);
    }
  }

  async getAdminProducts(req, res, next) {
    try {
      const products = await ProductService.getAdminProducts();
      return sendResponse(res, 200, true, "Admin products fetched successfully", { products });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      return sendResponse(res, 200, true, "Product details fetched successfully", { product });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req, res, next) {
    try {
      const product = await ProductService.createProduct(req.body, req.user._id);
      clearCache("/api/v1/products");
      return sendResponse(res, 201, true, "Product created successfully", { product });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);
      clearCache("/api/v1/products");
      return sendResponse(res, 200, true, "Product updated successfully", { product });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      await ProductService.deleteProduct(req.params.id);
      clearCache("/api/v1/products");
      return sendResponse(res, 200, true, "Product deleted successfully");
    } catch (error) {
      next(error);
    }
  }


  // --- REVIEWS ---
  async createProductReview(req, res, next) {
    try {
      const product = await ProductService.addProductReview(req.body.productId, req.body, req.user._id);
      return sendResponse(res, 200, true, "Review added successfully", { product });
    } catch (error) {
      next(error);
    }
  }

  async getProductReviews(req, res, next) {
    try {
      const reviews = await ProductService.getProductReviews(req.query.id);
      return sendResponse(res, 200, true, "Product reviews fetched successfully", { reviews });
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req, res, next) {
    try {
      const product = await ProductService.deleteProductReview(req.query.productId, req.query.id);
      return sendResponse(res, 200, true, "Review deleted successfully", { product });
    } catch (error) {
      next(error);
    }
  }

  // --- VISUAL SEARCH ---
  async visualSearchProducts(req, res, next) {
    try {
      const results = await ProductService.visualSearch(req.body.embedding);
      return sendResponse(res, 200, true, "Visual search matches fetched", {
        results: results.length,
        products: results
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
