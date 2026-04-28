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
        caption: req.body.caption || "",
        type: req.body.type || "GALLERY"
    });

    await Event.findByIdAndUpdate(eventId, { $addToSet: { images: uploadData.secure_url } });

    return res.status(201).json(new ApiResponse(201, photo, "Photo uploaded successfully."));
});

const uploadBeforeAfterPhoto = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { type, beforePhotoId, caption } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Valid event ID is required.");
    }

    if (!["BEFORE", "AFTER"].includes(type)) {
        throw new ApiError(400, "Type must be BEFORE or AFTER.");
    }

    if (!req.file) {
        throw new ApiError(400, "Photo file is required.");
    }

    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    let linkedBeforeId = null;
    
    if (type === "AFTER" && beforePhotoId) {
        const beforePhoto = await EventPhoto.findById(beforePhotoId);
        if (beforePhoto && beforePhoto.eventId.toString() === eventId) {
            linkedBeforeId = beforePhotoId;
        }
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
        caption: caption || "",
        type,
        transformationId: linkedBeforeId
    });

    if (linkedBeforeId) {
        await EventPhoto.findByIdAndUpdate(beforePhotoId, { transformationId: photo._id });
    }

    await Event.findByIdAndUpdate(eventId, { $addToSet: { images: uploadData.secure_url } });

    return res.status(201).json(new ApiResponse(201, photo, `${type} photo uploaded successfully.`));
});

const getBeforeAfterPairs = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Valid event ID is required.");
    }

    const beforePhotos = await EventPhoto.find({ eventId, type: "BEFORE" })
        .populate("uploadedBy", "name username avatar")
        .sort({ createdAt: -1 });

    const pairs = await Promise.all(
        beforePhotos.map(async (before) => {
            const after = await EventPhoto.findOne({ 
                transformationId: before._id,
                type: "AFTER"
            }).populate("uploadedBy", "name username avatar");
            
            return {
                before: before,
                after: after
            };
        })
    );

    return res.status(200).json(new ApiResponse(200, pairs, "Before/After pairs fetched successfully."));
});

const getEventPhotos = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { type } = req.query;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Valid event ID is required.");
    }

    const filter = { eventId };
    if (type) filter.type = type;

    const photos = await EventPhoto.find(filter)
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
    uploadBeforeAfterPhoto,
    getBeforeAfterPairs,
    getEventPhotos,
    deleteEventPhoto
};