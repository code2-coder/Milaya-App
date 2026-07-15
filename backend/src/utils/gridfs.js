import mongoose from "mongoose";

let gfsBucket;

mongoose.connection.once("open", () => {
  gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });
  console.log("GridFS Bucket initialized");
});

export const getGfsBucket = () => {
  if (!gfsBucket) {
    throw new Error("GridFS Bucket is not initialized yet");
  }
  return gfsBucket;
};
