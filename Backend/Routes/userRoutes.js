const express = require("express");
const User = require("../Models/User");
const jwt = require("jsonwebtoken");
const { protect, admin } = require("../middleware/authmiddleware");

const router = express.Router();

const generateToken = (user) => {
    return jwt.sign(
        { user: { id: user._id, role: user.role } },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );
};

router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide name, email, and password" });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        user = new User({
            name,
            email,
            password,
            role: role || "customer",
        });

        await user.save();

        const token = generateToken(user);

        res.status(201).json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: error.message || "Server error during registration" });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user);

        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: error.message || "Server error during login" });
    }
});
router.get("/profile", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Server error getting profile" });
    }
});


router.put("/profile", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        const token = generateToken(updatedUser);

        res.json({
            token,
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            },
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: error.message || "Server error updating profile" });
    }
});

router.get("/", protect, admin, async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error("Admin get users error:", error);
        res.status(500).json({ message: "Server error getting users" });
    }
});

router.get("/:id", protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("Admin get user by id error:", error);
        res.status(500).json({ message: "Server error getting user" });
    }
});

router.put("/:id", protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.role) {
            user.role = req.body.role.toLowerCase();
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        console.error("Admin update user error:", error);
        res.status(500).json({ message: error.message || "Server error updating user" });
    }
});

router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "Cannot delete logged-in admin user" });
        }

        await user.deleteOne();
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Admin delete user error:", error);
        res.status(500).json({ message: "Server error deleting user" });
    }
});

module.exports = router;