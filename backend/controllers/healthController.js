const Conversation = require("../models/Conversation");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const {
  orchestrate,
  generateOnboardingStep,
  generateHomeDashboard,
  generateVendorPage,
} = require("../services/geminiService");
const { v4: uuidv4 } = require("uuid");

// POST /api/chat — Chat mode
exports.chat = async (req, res) => {
  try {
    const { message, sessionId, mode } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    const sid = sessionId || uuidv4();

    let conversation = await Conversation.findOne({ sessionId: sid });
    if (!conversation) {
      conversation = await Conversation.create({
        sessionId: sid,
        messages: [],
        context: {},
      });
    }

    conversation.messages.push({ role: "user", content: message.trim() });

    const history = conversation.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const aiResult = await orchestrate(message.trim(), history, conversation.context, mode || "chat");

    if (aiResult.context && Object.keys(aiResult.context).length) {
      conversation.context = { ...conversation.context, ...aiResult.context };
    }

    conversation.messages.push({
      role: "assistant",
      content: aiResult.message,
      uiSchema: { ui: aiResult.ui, actions: aiResult.actions },
    });

    await conversation.save();

    res.json({
      success: true,
      sessionId: sid,
      message: aiResult.message,
      page: aiResult.page,
      ui: aiResult.ui,
      actions: aiResult.actions,
      sidebar: aiResult.sidebar,
      ragSources: aiResult.ragSources,
    });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/chat/history/:sessionId
exports.getConversation = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const conversation = await Conversation.findOne({ sessionId });

    if (!conversation) {
      return res.json({ success: true, messages: [] });
    }

    const messages = conversation.messages.map((m) => ({
      role: m.role,
      content: m.content,
      uiSchema: m.uiSchema || null,
      timestamp: m.timestamp,
    }));

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: "Name and email are required" });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.json({ success: true, user, isExisting: true });
    }

    user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || "",
      role: role || "mother",
    });

    res.status(201).json({ success: true, user, isExisting: false });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found. Please sign up." });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/onboarding/step
exports.onboardingStep = async (req, res) => {
  try {
    const { userId, stepNumber, answers } = req.body;

    const result = await generateOnboardingStep(stepNumber || 1, answers || {});

    if (userId) {
      const updateFields = {};
      if (answers?.name) updateFields.name = answers.name;
      if (answers?.city) updateFields["profile.city"] = answers.city;
      if (answers?.age) updateFields["profile.age"] = Number(answers.age);
      if (answers?.pregnancyWeek) updateFields["profile.pregnancyWeek"] = Number(answers.pregnancyWeek);
      if (answers?.childAge) updateFields["profile.childAge"] = answers.childAge;
      if (answers?.bloodGroup) updateFields["profile.bloodGroup"] = answers.bloodGroup;
      if (answers?.dueDate) updateFields["profile.dueDate"] = answers.dueDate;

      if (Object.keys(updateFields).length) {
        await User.findByIdAndUpdate(userId, { $set: updateFields });
      }

      if (stepNumber >= 5) {
        await User.findByIdAndUpdate(userId, { $set: { onboarded: true } });
      }
    }

    res.json({
      success: true,
      message: result.message,
      ui: result.ui || [],
      actions: result.actions || {},
      context: result.context || {},
    });
  } catch (err) {
    console.error("Onboarding error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/dashboard
exports.dashboard = async (req, res) => {
  try {
    const { userId } = req.query;

    let userProfile = {};
    if (userId) {
      const user = await User.findById(userId).lean();
      if (user) {
        userProfile = {
          name: user.name,
          role: user.role,
          ...user.profile,
        };
      }
    }

    const result = await generateHomeDashboard(userProfile, {});

    res.json({
      success: true,
      message: result.message,
      page: "home",
      ui: result.ui || [],
      actions: result.actions || {},
      sidebar: result.sidebar || [],
    });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/vendors
exports.getVendors = async (req, res) => {
  try {
    const { type, city, userId } = req.query;

    const filter = { available: true };
    if (type && type !== "all") filter.type = type;
    if (city) filter.city = new RegExp(city, "i");

    const vendors = await Vendor.find(filter).sort({ rating: -1, verified: -1 }).limit(20).lean();

    let userProfile = {};
    if (userId) {
      const user = await User.findById(userId).lean();
      if (user) userProfile = { name: user.name, role: user.role, ...user.profile };
    }

    const result = await generateVendorPage(userProfile, type, vendors);

    res.json({
      success: true,
      message: result.message,
      ui: result.ui || [],
      actions: result.actions || {},
      vendors,
    });
  } catch (err) {
    console.error("Vendors error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/user/update
exports.updateUser = async (req, res) => {
  try {
    const { userId, updates } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: "userId required" });

    const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/actions/execute
exports.executeAction = async (req, res) => {
  try {
    const { actionType, params } = req.body;

    if (!actionType) {
      return res.status(400).json({ success: false, error: "actionType is required" });
    }

    let result;

    switch (actionType) {
      case "book_consultation":
        result = {
          success: true,
          message: `Consultation request submitted for ${params?.specialty || "general"} care.`,
          data: {
            bookingId: uuidv4().slice(0, 8).toUpperCase(),
            specialty: params?.specialty || "general",
            vendor: params?.vendorName || "Next available",
            status: "pending",
            estimatedWait: "24-48 hours",
          },
        };
        break;

      case "book_vendor":
        result = {
          success: true,
          message: `Booking request sent to ${params?.vendorName || "vendor"}.`,
          data: {
            bookingId: uuidv4().slice(0, 8).toUpperCase(),
            vendor: params?.vendorName,
            type: params?.vendorType,
            status: "pending",
          },
        };
        break;

      case "find_facility":
        result = {
          success: true,
          message: "Nearby healthcare facilities found.",
          data: {
            facilities: [
              { name: "MomKidCare Clinic - Central", distance: "1.2 km", phone: "+91-XXXXXXXXXX", type: params?.facilityType || "clinic" },
              { name: "City Women's Hospital", distance: "3.5 km", phone: "+91-XXXXXXXXXX", type: "hospital" },
              { name: "Rainbow Children's Hospital", distance: "5.1 km", phone: "+91-XXXXXXXXXX", type: "hospital" },
            ],
          },
        };
        break;

      case "emergency":
        result = {
          success: true,
          message: "Emergency alert triggered. Please call emergency services immediately.",
          data: {
            emergencyNumber: "102",
            ambulanceNumber: "108",
            nearestER: "City Women's Hospital Emergency - 3.5 km",
          },
        };
        break;

      case "schedule_reminder":
        result = {
          success: true,
          message: `Reminder set: ${params?.reminderText || "Health checkup"}`,
          data: {
            reminderId: uuidv4().slice(0, 8).toUpperCase(),
            text: params?.reminderText || "Health checkup",
            date: params?.date || "Next available slot",
          },
        };
        break;

      default: {
        // AI dynamically generates action keys — handle any unknown action
        // by searching vendors, booking, or returning a generic success
        if (actionType.startsWith("submit_") || actionType.startsWith("search_") || actionType.startsWith("find_")) {
          const searchType = params?.specialty || params?.type || params?.query || actionType.replace(/^(submit_|search_|find_)/, "").replace(/_/g, " ");
          const vendors = await Vendor.find({
            $or: [
              { specializations: { $regex: searchType, $options: "i" } },
              { type: { $regex: searchType, $options: "i" } },
              { tags: { $regex: searchType, $options: "i" } },
              { name: { $regex: searchType, $options: "i" } },
              { bio: { $regex: searchType, $options: "i" } },
            ],
          }).limit(5).lean();

          result = {
            success: true,
            message: vendors.length
              ? `Found ${vendors.length} result(s) for "${searchType}".`
              : `No exact matches for "${searchType}", but we've noted your request. Our team will connect you shortly.`,
            data: {
              requestId: uuidv4().slice(0, 8).toUpperCase(),
              results: vendors.map((v) => ({
                name: v.name,
                type: v.type,
                rating: v.rating,
                experience: v.experience,
                city: v.city,
                price: v.price,
              })),
            },
          };
        } else if (actionType.startsWith("book_") || actionType.startsWith("request_") || actionType.startsWith("schedule_")) {
          result = {
            success: true,
            message: `Your request has been submitted successfully. Our team will get back to you within 24 hours.`,
            data: {
              requestId: uuidv4().slice(0, 8).toUpperCase(),
              type: actionType,
              params,
              status: "pending",
            },
          };
        } else {
          result = {
            success: true,
            message: `Action "${actionType}" received. We're processing your request.`,
            data: { requestId: uuidv4().slice(0, 8).toUpperCase(), actionType, params },
          };
        }
      }
    }

    res.json(result);
  } catch (err) {
    console.error("Action error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};