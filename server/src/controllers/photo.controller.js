import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/apiUtils.js";
import { EventPhoto } from "../models/eventPhoto.model.js";
import { Event } from "../models/event.model.js";
import { uploadFileOnCloudinary, deleteFileFromCloudinary } from "../services/cloudinary.service.js";

const uploadEventPhoto = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Valid event ID is required.");
    }

    if (!req.file) {
        throw new ApiError(400, "Photo file is required.");
    }

    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    const localPath = req.file.path;
    const uploadData = await uploadFileOnCloudinary(localPath);

    if (!uploadData.success) {
        throw new ApiError(500, "Photo upload failed.");
    }

    const photo = await EventPhoto.create({
        eventId,
        uploadedBy: req.user._id,
        imageUrl: uploadData.secure_url,
        cloudinaryId: uploadData.public_id,
        caption: req.body.caption || ""
    });

    await Event.findByIdAndUpdate(eventId, { $addToSet: { images: uploadData.secure_url } });

    return res.status(201).json(new ApiResponse(201, photo, "Photo uploaded successfully."));
});

const getEventPhotos = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Valid event ID is required.");
    }

    const photos = await EventPhoto.find({ eventId })
        .populate("uploadedBy", "name username avatar")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, photos, "Photos fetched successfully."));
});

const deleteEventPhoto = asyncHandler(async (req, res) => {
    const { photoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(photoId)) {
        throw new ApiError(400, "Valid photo ID is required.");
    }

    const photo = await EventPhoto.findById(photoId);
    if (!photo) {
        throw new ApiError(404, "Photo not found.");
    }

    const event = await Event.findById(photo.eventId);
    const isEventOrganizer = event?.organizerId?.toString() === req.user._id.toString();
    const isPhotoOwner = photo.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "ADMIN";

    if (!isPhotoOwner && !isEventOrganizer && !isAdmin) {
        throw new ApiError(403, "You can only delete your own photos.");
    }

    await deleteFileFromCloudinary(photo.cloudinaryId);
    await EventPhoto.findByIdAndDelete(photoId);
    await Event.findByIdAndUpdate(photo.eventId, { $pull: { images: photo.imageUrl } });

    return res.status(200).json(new ApiResponse(200, null, "Photo deleted successfully."));
});

export {
    uploadEventPhoto,
    getEventPhotos,
    deleteEventPhoto
};