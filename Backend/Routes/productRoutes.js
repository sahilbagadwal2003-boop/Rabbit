const express = require("express");
const Product = require("../Models/product");
const { protect, admin } = require("../middleware/authmiddleware");

const router = express.Router();

router.post("/", protect, admin, async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            collections,
            material,
            gender,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku,
        } = req.body;

        const product = new Product({
            name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            collections,
            material,
            gender,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku,
            user: req.user._id,
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

router.put("/:id", protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const {
            name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            collections,
            material,
            gender,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku,
        } = req.body;

        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = price;
        if (discountPrice !== undefined) product.discountPrice = discountPrice;
        if (countInStock !== undefined) product.countInStock = countInStock;
        if (category !== undefined) product.category = category;
        if (brand !== undefined) product.brand = brand;
        if (sizes !== undefined) product.sizes = sizes;
        if (colors !== undefined) product.colors = colors;
        if (collections !== undefined) product.collections = collections;
        if (material !== undefined) product.material = material;
        if (gender !== undefined) product.gender = gender;
        if (images !== undefined) product.images = images;
        if (isFeatured !== undefined) product.isFeatured = isFeatured;
        if (isPublished !== undefined) product.isPublished = isPublished;
        if (tags !== undefined) product.tags = tags;
        if (dimensions !== undefined) product.dimensions = dimensions;
        if (weight !== undefined) product.weight = weight;
        if (sku !== undefined) product.sku = sku;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        await product.deleteOne();
        res.json({ message: "Product removed" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

router.get("/", async (req, res) => {
    try {
        const {
            collection,
            size,
            color,
            gender,
            minPrice,
            maxPrice,
            sortBy,
            search,
            category,
            brand,
            limit,
        } = req.query;

        let query = {};

        if (collection && collection.toLocaleLowerCase() !=="all"){
         query.collections = collection};
        if (category && category.toLocaleLowerCase() !=="all")
            { query.category = category};
        
        if (brand) {
            query.brand = {$in: brand.split(",")};
        }
        if (size) {
            query.sizes = { $in: size.split(",") };
        }
        if (color) {
            query.colors = { $in: color.split(",") };
        }
         if (gender) {
            query.gender = gender;
        }
      
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        let sort = {};
        if (sortBy === "priceAsc") sort.price = 1;
        else if (sortBy === "priceDesc") sort.price = -1;
        else if (sortBy === "newest") sort.createdAt = -1;
        else if (sortBy === "popularity") sort.rating = -1;

        let products = await Product.find(query).sort(sort).limit(Number(limit) || 0);

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});


router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

module.exports = router;