const express = require("express");
const Order = require("../Models/Order");
const { softProtect } = require("../middleware/authmiddleware");

const router = express.Router();

router.use(softProtect);

// @route   GET /api/admin/orders
// @desc    Fetch all orders for admin
router.get("/", async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error("Admin fetch orders error:", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
});

// @route   PUT /api/admin/orders/bulk
// @desc    Bulk update order statuses or payment
router.put("/bulk", async (req, res) => {
    try {
        const { orderIds, status, isPaid, isDelivered } = req.body;

        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ message: "No order IDs provided" });
        }

        const updateFields = {};
        if (status !== undefined) updateFields.status = status;
        if (isPaid !== undefined) {
            updateFields.isPaid = isPaid;
            if (isPaid) updateFields.paidAt = Date.now();
        }
        if (isDelivered !== undefined) {
            updateFields.isDelivered = isDelivered;
            if (isDelivered) updateFields.deliveredAt = Date.now();
        }

        await Order.updateMany(
            { _id: { $in: orderIds } },
            { $set: updateFields }
        );

        const updatedOrders = await Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.json({ message: "Bulk update successful", orders: updatedOrders });
    } catch (error) {
        console.error("Admin bulk update error:", error);
        res.status(500).json({ message: "Failed to bulk update orders" });
    }
});

// @route   POST /api/admin/orders/bulk-delete
// @desc    Bulk delete orders
router.post("/bulk-delete", async (req, res) => {
    try {
        const { orderIds } = req.body;

        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ message: "No order IDs provided" });
        }

        await Order.deleteMany({ _id: { $in: orderIds } });

        res.json({ message: "Bulk delete successful", deletedCount: orderIds.length });
    } catch (error) {
        console.error("Admin bulk delete error:", error);
        res.status(500).json({ message: "Failed to bulk delete orders" });
    }
});

// @route   GET /api/admin/orders/:id
// @desc    Fetch single order
router.get("/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "name email");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(order);
    } catch (error) {
        console.error("Admin fetch order details error:", error);
        res.status(500).json({ message: "Failed to fetch order details" });
    }
});

// @route   PUT /api/admin/orders/:id
// @desc    Update single order
router.put("/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const { status, isPaid, isDelivered } = req.body;

        if (status !== undefined) order.status = status;
        if (isPaid !== undefined) {
            order.isPaid = isPaid;
            if (isPaid && !order.paidAt) order.paidAt = Date.now();
        }
        if (isDelivered !== undefined) {
            order.isDelivered = isDelivered;
            if (isDelivered && !order.deliveredAt) order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error("Admin update order error:", error);
        res.status(500).json({ message: "Failed to update order" });
    }
});

// @route   DELETE /api/admin/orders/:id
// @desc    Delete single order
router.delete("/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        await order.deleteOne();
        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Admin delete order error:", error);
        res.status(500).json({ message: "Failed to delete order" });
    }
});

module.exports = router;
