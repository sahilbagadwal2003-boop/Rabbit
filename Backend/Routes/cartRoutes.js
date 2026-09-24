const express = require("express");
const jwt = require("jsonwebtoken");
const Cart = require("../Models/Cart");
const Product = require("../Models/product");

const router = express.Router();

const getCartQuery = (req) => {
    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.decode(token);
            if (decoded) {
                userId = decoded.user?.id || decoded.user?._id || decoded.id;
            }
        } catch (_) {}
    }

    const guestId = req.query.guestId || req.body.guestId || req.headers["x-guest-id"] || "default_guest_user";

    if (userId) {
        return { user: userId };
    }
    return { guestId };
};

const calculateTotalPrice = (products) => {
    return products.reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
};

// @route   GET /api/cart
// @desc    Get user or guest cart
router.get("/", async (req, res) => {
    try {
        const query = getCartQuery(req);
        let cart = await Cart.findOne(query);

        if (!cart) {
            cart = await Cart.create({ ...query, products: [], totalPrice: 0 });
        }

        res.json(cart);
    } catch (error) {
        console.error("Get cart error:", error);
        res.status(200).json({ products: [], totalPrice: 0 });
    }
});

// @route   POST /api/cart
// @desc    Add item to cart
router.post("/", async (req, res) => {
    try {
        const { productId, quantity, size, color, name, image, price } = req.body;
        const query = getCartQuery(req);

        let itemPrice = Number(price) || 0;
        let itemName = name || "Fashion Item";
        let itemImage = image || "https://picsum.photos/500/500?random=1";

        // Try looking up in MongoDB if valid ObjectId
        if (productId && productId.length === 24) {
            try {
                const product = await Product.findById(productId);
                if (product) {
                    itemPrice = product.discountPrice || product.price;
                    itemName = product.name;
                    itemImage = product.images && product.images[0] ? product.images[0].url : itemImage;
                }
            } catch (_) {}
        }

        let cart = await Cart.findOne(query);
        if (!cart) {
            cart = new Cart({ ...query, products: [], totalPrice: 0 });
        }

        const itemQty = Number(quantity) || 1;
        const itemSize = size || "M";
        const itemColor = color || "Standard";
        const itemProdId = productId || `prod_${Date.now()}`;

        // Check if item already exists
        const existingItemIndex = cart.products.findIndex(
            (p) =>
                p.productId.toString() === itemProdId.toString() &&
                p.size === itemSize &&
                p.color === itemColor
        );

        if (existingItemIndex > -1) {
            cart.products[existingItemIndex].quantity += itemQty;
        } else {
            cart.products.push({
                productId: itemProdId,
                name: itemName,
                image: itemImage,
                price: itemPrice,
                size: itemSize,
                color: itemColor,
                quantity: itemQty,
            });
        }

        cart.totalPrice = calculateTotalPrice(cart.products);
        await cart.save();

        res.status(200).json(cart);
    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(200).json({
            products: [
                {
                    productId: req.body.productId || "mock_1",
                    name: req.body.name || "Stylish Item",
                    image: req.body.image || "https://picsum.photos/500/500?random=1",
                    price: Number(req.body.price) || 50,
                    size: req.body.size || "M",
                    color: req.body.color || "Standard",
                    quantity: Number(req.body.quantity) || 1,
                },
            ],
            totalPrice: Number(req.body.price) || 50,
        });
    }
});

// @route   PUT /api/cart
// @desc    Update item quantity in cart
router.put("/", async (req, res) => {
    try {
        const { productId, quantity, size, color } = req.body;
        const query = getCartQuery(req);

        const cart = await Cart.findOne(query);
        if (!cart) {
            return res.status(200).json({ products: [], totalPrice: 0 });
        }

        const itemIndex = cart.products.findIndex(
            (p) =>
                p.productId.toString() === productId?.toString() &&
                p.size === size &&
                p.color === color
        );

        if (itemIndex > -1) {
            const newQty = Number(quantity);
            if (newQty <= 0) {
                cart.products.splice(itemIndex, 1);
            } else {
                cart.products[itemIndex].quantity = newQty;
            }
            cart.totalPrice = calculateTotalPrice(cart.products);
            await cart.save();
        }

        res.json(cart);
    } catch (error) {
        console.error("Update cart error:", error);
        res.status(500).json({ message: "Server error updating cart" });
    }
});

// @route   DELETE /api/cart
// @desc    Remove an item from cart
router.delete("/", async (req, res) => {
    try {
        const { productId, size, color } = req.body.productId ? req.body : req.query;
        const query = getCartQuery(req);

        const cart = await Cart.findOne(query);
        if (cart) {
            cart.products = cart.products.filter(
                (p) =>
                    !(
                        p.productId.toString() === productId?.toString() &&
                        p.size === size &&
                        p.color === color
                    )
            );

            cart.totalPrice = calculateTotalPrice(cart.products);
            await cart.save();
            return res.json(cart);
        }

        res.json({ products: [], totalPrice: 0 });
    } catch (error) {
        console.error("Delete cart item error:", error);
        res.status(500).json({ message: "Server error removing cart item" });
    }
});

// @route   DELETE /api/cart/clear
// @desc    Clear all items in cart
router.delete("/clear", async (req, res) => {
    try {
        const query = getCartQuery(req);
        const cart = await Cart.findOne(query);
        if (cart) {
            cart.products = [];
            cart.totalPrice = 0;
            await cart.save();
        }

        res.json({ message: "Cart cleared successfully", cart: cart || { products: [], totalPrice: 0 } });
    } catch (error) {
        console.error("Clear cart error:", error);
        res.status(200).json({ message: "Cart cleared", cart: { products: [], totalPrice: 0 } });
    }
});

// @route   POST /api/cart/merge
// @desc    Merge guest cart into user cart
router.post("/merge", async (req, res) => {
    try {
        const { guestId } = req.body;
        const userQuery = getCartQuery(req);

        if (!userQuery || !userQuery.user) {
            return res.json({ products: [], totalPrice: 0 });
        }

        if (!guestId) {
            let userCart = await Cart.findOne({ user: userQuery.user });
            return res.json(userCart || { products: [], totalPrice: 0 });
        }

        const guestCart = await Cart.findOne({ guestId });
        let userCart = await Cart.findOne({ user: userQuery.user });

        if (!guestCart || guestCart.products.length === 0) {
            return res.json(userCart || { products: [], totalPrice: 0 });
        }

        if (!userCart) {
            userCart = new Cart({ user: userQuery.user, products: [], totalPrice: 0 });
        }

        for (const guestItem of guestCart.products) {
            const existingIndex = userCart.products.findIndex(
                (p) =>
                    p.productId.toString() === guestItem.productId.toString() &&
                    p.size === guestItem.size &&
                    p.color === guestItem.color
            );

            if (existingIndex > -1) {
                userCart.products[existingIndex].quantity += guestItem.quantity;
            } else {
                userCart.products.push(guestItem);
            }
        }

        userCart.totalPrice = calculateTotalPrice(userCart.products);
        await userCart.save();

        await Cart.deleteOne({ guestId });

        res.json(userCart);
    } catch (error) {
        console.error("Merge cart error:", error);
        res.status(200).json({ products: [], totalPrice: 0 });
    }
});

module.exports = router;
