import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { checkServiceability } from "../utils/delhiveryService.js";

//
// 📌 GET ALL ADDRESSES
//
export const getAddresses = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    addresses: user.addresses || [],
  });
});

//
// 📌 ADD NEW ADDRESS
//
export const addAddress = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const { isDefault, ...addressData } = req.body;

  if (addressData.country === "India") {
    if (!addressData.zipCode || addressData.zipCode.length !== 6) {
      return next(new ErrorHandler("Valid 6-digit India pincode is required.", 400));
    }

    const serviceability = await checkServiceability(addressData.zipCode);
    if (!serviceability.isServiceable) {
      return next(new ErrorHandler("This India pincode is not serviceable.", 400));
    }
  }

  // If this is the first address or set as default, unset others
  const isFirstAddress = !user.addresses || user.addresses.length === 0;
  const setAsDefault = isDefault || isFirstAddress;

  if (setAsDefault && user.addresses) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  const newAddress = {
    ...addressData,
    isDefault: setAsDefault,
  };

  if (!user.addresses) {
    user.addresses = [];
  }

  user.addresses.push(newAddress);
  await user.save({ validateBeforeSave: false });

  res.status(201).json({
    success: true,
    addresses: user.addresses,
  });
});

//
// 📌 UPDATE ADDRESS
//
export const updateAddress = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const address = user.addresses.id(req.params.id);

  if (!address) {
    return next(new ErrorHandler("Address not found", 404));
  }

  const { isDefault, ...updateData } = req.body;

  if (updateData.country === "India" || (address.country === "India" && updateData.zipCode)) {
    const zipCodeToCheck = updateData.zipCode || address.zipCode;
    if (!zipCodeToCheck || zipCodeToCheck.length !== 6) {
      return next(new ErrorHandler("Valid 6-digit India pincode is required.", 400));
    }

    const serviceability = await checkServiceability(zipCodeToCheck);
    if (!serviceability.isServiceable) {
      return next(new ErrorHandler("This India pincode is not serviceable.", 400));
    }
  }

  // Update fields
  Object.keys(updateData).forEach((key) => {
    address[key] = updateData[key];
  });

  // Handle default flag
  if (isDefault && !address.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
    address.isDefault = true;
  } else if (!isDefault && address.isDefault) {
    // If trying to remove default, ensure at least one address is default if possible
    address.isDefault = false;
    const otherAddress = user.addresses.find((addr) => addr._id.toString() !== req.params.id);
    if (otherAddress) {
      otherAddress.isDefault = true;
    }
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    addresses: user.addresses,
  });
});

//
// 📌 DELETE ADDRESS
//
export const deleteAddress = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const address = user.addresses.id(req.params.id);

  if (!address) {
    return next(new ErrorHandler("Address not found", 404));
  }

  const wasDefault = address.isDefault;

  // Remove the address
  user.addresses.pull({ _id: req.params.id });

  // If we deleted the default address, set the first available address as default
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Address deleted successfully",
    addresses: user.addresses,
  });
});

//
// 📌 SET DEFAULT ADDRESS
//
export const setDefaultAddress = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const address = user.addresses.id(req.params.id);

  if (!address) {
    return next(new ErrorHandler("Address not found", 404));
  }

  user.addresses.forEach((addr) => {
    addr.isDefault = false;
  });

  address.isDefault = true;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Default address updated",
    addresses: user.addresses,
  });
});
