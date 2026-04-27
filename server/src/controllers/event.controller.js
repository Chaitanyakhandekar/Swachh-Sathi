import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/apiUtils.js";
import { Event } from "../models/event.model.js";
import { Location } from "../models/location.model.js";
import { EventStatusLog } from "../models/eventStatusLog.model.js";
import { cacheService } from "../services/cache.service.js";
import { EventVolunteer } from "../models/eventVolunteer.model.js";
import { redis } from "../redis/config.js";

const createEvent = asyncHandler(async (req, res) => {
    const { title, description, date, startTime, endTime, locationId, maxVolunteers, creditsReward } = req.body;

    if ([title, description, date, startTime, endTime, locationId].some(f => !f || f.trim() === "")) {
        throw new ApiError(400, "All required fields are necessary.");
    }

    const location = await Location.findById(locationId);
    if (!location) {
        throw new ApiError(404, "Location not found.");
    }

    const event = await Event.create({
        title,
        description,
        date,
        startTime,
        endTime,
        locationId,
        organizerId: req.user._id,
        maxVolunteers: maxVolunteers || 100,
        creditsReward: creditsReward || 10,
        location: location.location
    });

    await cacheService.invalidateAllEventsCache();

    return res.status(201).json(new ApiResponse(201, event, "Event created successfully."));
});

const getAllEvents = asyncHandler(async (req, res) => {
    const { city, status, page = 1, limit = 10 } = req.query;
    
    let cacheKey = "all";
    if (city) cacheKey += `:city:${city}`;
    if (status) cacheKey += `:status:${status}`;

    try {
        const cached = await redis.get(`events:${cacheKey}`);
        if (cached) {
            return res.status(200).json(new ApiResponse(200, JSON.parse(cached), "Events fetched from cache."));
        }
    } catch {}

    const filter = {};
    if (city) {
        const locations = await Location.find({ city: { $regex: city, $options: "i" } }).select("_id");
        filter.locationId = { $in: locations.map(l => l._id) };
    }
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const events = await Event.find(filter)
        .populate("locationId", "name address city")
        .populate("organizerId", "name username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Event.countDocuments(filter);
    
    const result = { events, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) };
    
    try {
        await redis.setex(`events:${cacheKey}`, 300, JSON.stringify(result));
    } catch {}
    return res.status(200).json(new ApiResponse(200, result, "Events fetched successfully."));
});

const getNearbyEvents = asyncHandler(async (req, res) => {
    const { lat, lng, radiusKm = 10 } = req.query;

    if (!lat || !lng) {
        throw new ApiError(400, "Latitude and longitude are required.");
    }

    const cacheKey = `events:geo:${lat}:${lng}:${radiusKm}`;
    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return res.status(200).json(new ApiResponse(200, JSON.parse(cached), "Events fetched from cache."));
        }
    } catch {}

    const events = await Event.aggregate([
        {
            $geoNear: {
                near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                distanceField: "distance",
                maxDistance: parseFloat(radiusKm) * 1000,
                spherical: true
            }
        },
        { $match: { status: { $in: ["UPCOMING", "ONGOING"] } } },
        { $sort: { distance: 1 } },
        { $limit: 50 }
    ]);

    try {
        await redis.setex(cacheKey, 300, JSON.stringify(events));
    } catch {}

    return res.status(200).json(new ApiResponse(200, events, "Nearby events fetched successfully."));
});

const getEventById = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Valid event ID is required.");
    }

    const cached = await cacheService.getEventById(eventId);
    if (cached) {
        return res.status(200).json(new ApiResponse(200, cached, "Event fetched from cache."));
    }

    const event = await Event.findById(eventId)
        .populate("locationId", "name address city state location")
        .populate("organizerId", "name username");

    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    await cacheService.setEventById(eventId, event);

    return res.status(200).json(new ApiResponse(200, event, "Event fetched successfully."));
});

const updateEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { title, description, date, startTime, endTime, maxVolunteers, creditsReward } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Valid event ID is required.");
    }

    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
        throw new ApiError(403, "You can only update your own events.");
    }

    const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $set: { title, description, date, startTime, endTime, maxVolunteers, creditsReward } },
        { new: true }
    ).populate("locationId", "name address city");

    await cacheService.invalidateEventCache(eventId);

    return res.status(200).json(new ApiResponse(200, updatedEvent, "Event updated successfully."));
});

const deleteEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new ApiError(400, "Valid event ID is required.");
    }

    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "Event not found.");
    }

    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
        throw new ApiError(403, "You can only delete your own events.");
    }

    await Event.findByIdAndDelete(eventId);
    await EventVolunteer.deleteMany({ eventId });
    
    await cacheService.invalidateEventCache(eventId);

    return res.status(200).json(new ApiResponse(200, null, "Event deleted successfully."));
});

const getEventsByCity = asyncHandler(async (req, res) => {
    const { city } = req.query;

    if (!city || city.trim() === "") {
        throw new ApiError(400, "City name is required.");
    }

    const cached = await cacheService.getEventsByCity(city);
    if (cached) {
        return res.status(200).json(new ApiResponse(200, cached, "Events fetched from cache."));
    }

    const locations = await Location.find({ city: { $regex: city, $options: "i" } }).select("_id");
    const events = await Event.find({ locationId: { $in: locations.map(l => l._id) } })
        .populate("locationId", "name address city")
        .populate("organizerId", "name username")
        .sort({ date: 1 });

    await cacheService.setEventsByCity(city, events);

    return res.status(200).json(new ApiResponse(200, events, "Events fetched successfully."));
});

const getMyEvents = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const filter = { organizerId: req.user._id };
    if (status) filter.status = status;

    const events = await Event.find(filter)
        .populate("locationId", "name address city")
        .sort({ date: -1 });

    return res.status(200).json(new ApiResponse(200, events, "Your events fetched successfully."));
});

export {
    createEvent,
    getAllEvents,
    getNearbyEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getEventsByCity,
    getMyEvents
};