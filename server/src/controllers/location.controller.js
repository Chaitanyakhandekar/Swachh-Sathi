import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/apiUtils.js";
import { Location } from "../models/location.model.js";

const createLocation = asyncHandler(async (req, res) => {
    const { name, address, city, state, pincode, coordinates } = req.body;

    if ([name, address, city, state].some(f => !f || f.trim() === "")) {
        throw new ApiError(400, "Name, address, city, and state are required.");
    }

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
        throw new ApiError(400, "Valid coordinates [longitude, latitude] are required.");
    }

    const location = await Location.create({
        name,
        address,
        city,
        state,
        pincode: pincode || "",
        location: {
            type: "Point",
            coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
        }
    });

    return res.status(201).json(new ApiResponse(201, location, "Location created successfully."));
});

const getAllLocations = asyncHandler(async (req, res) => {
    const { city } = req.query;
    const filter = city ? { city: { $regex: city, $options: "i" } } : {};

    const locations = await Location.find(filter).sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, locations, "Locations fetched successfully."));
});

const getNearbyLocations = asyncHandler(async (req, res) => {
    const { lat, lng, radiusKm = 10 } = req.query;

    if (!lat || !lng) {
        throw new ApiError(400, "Latitude and longitude are required.");
    }

    const locations = await Location.aggregate([
        {
            $geoNear: {
                near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                distanceField: "distance",
                maxDistance: parseFloat(radiusKm) * 1000,
                spherical: true
            }
        },
        { $sort: { distance: 1 } },
        { $limit: 50 }
    ]);

    return res.status(200).json(new ApiResponse(200, locations, "Nearby locations fetched successfully."));
});

const getLocationById = asyncHandler(async (req, res) => {
    const { locationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(locationId)) {
        throw new ApiError(400, "Valid location ID is required.");
    }

    const location = await Location.findById(locationId);
    if (!location) {
        throw new ApiError(404, "Location not found.");
    }

    return res.status(200).json(new ApiResponse(200, location, "Location fetched successfully."));
});

const updateLocation = asyncHandler(async (req, res) => {
    const { locationId } = req.params;
    const { name, address, city, state, pincode, coordinates } = req.body;

    if (!mongoose.Types.ObjectId.isValid(locationId)) {
        throw new ApiError(400, "Valid location ID is required.");
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (pincode) updateData.pincode = pincode;
    if (coordinates) {
        updateData.location = {
            type: "Point",
            coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
        };
    }

    const location = await Location.findByIdAndUpdate(locationId, { $set: updateData }, { new: true });

    if (!location) {
        throw new ApiError(404, "Location not found.");
    }

    return res.status(200).json(new ApiResponse(200, location, "Location updated successfully."));
});

const deleteLocation = asyncHandler(async (req, res) => {
    const { locationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(locationId)) {
        throw new ApiError(400, "Valid location ID is required.");
    }

    const location = await Location.findByIdAndDelete(locationId);
    if (!location) {
        throw new ApiError(404, "Location not found.");
    }

    return res.status(200).json(new ApiResponse(200, null, "Location deleted successfully."));
});

export {
    createLocation,
    getAllLocations,
    getNearbyLocations,
    getLocationById,
    updateLocation,
    deleteLocation
};