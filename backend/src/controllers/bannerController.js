import Banner from "../models/bannerModel.js";
import uploadService from "../services/UploadService.js";
import { clearCache } from "../middlewares/cache.js";

// CREATE Banner
export const createBanner = async (req, res) => {
  try {
    const { title, subtitle, image, link } = req.body;
    let imageUrl = image;

    if (image && image.startsWith("data:image")) {
      const result = await uploadService.uploadMedia(image, {
        folder: "milaya/banners",
      });
      imageUrl = result.url || result.secure_url;
    }

    const banner = await Banner.create({
      title,
      subtitle,
      image: imageUrl,
      link,
    });

    clearCache("/api/v1/banner");

    res.status(201).json({
      success: true,
      banner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET all banners
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).lean();

    res.status(200).json({
      success: true,
      banners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET single banner
export const getSingleBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id).lean();

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      banner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE banner
export const updateBanner = async (req, res) => {
  try {
    let banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    let updateData = { ...req.body };

    // If the user uploaded a new image (base64)
    if (req.body.image && req.body.image.startsWith("data:image")) {
      const result = await uploadService.uploadMedia(req.body.image, {
        folder: "milaya/banners",
      });
      updateData.image = result.url || result.secure_url;
    }

    banner = await Banner.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    clearCache("/api/v1/banner");

    res.status(200).json({
      success: true,
      banner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE banner
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    await banner.deleteOne();

    clearCache("/api/v1/banner");

    res.status(200).json({
      success: true,
      message: "Banner deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
