const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
dotenv.config();

const Product = require("./Models/product");
const User = require("./Models/User");
const Order = require("./Models/Order");
const products = require("./products");

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL || process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();

        const createdAdmin = await User.create({
            name: "Admin User",
            email: "admin@example.com",
            password: "123456",
            role: "admin",
        });

        const createdCustomer = await User.create({
            name: "John Customer",
            email: "john@example.com",
            password: "123456",
            role: "customer",
        });

        const adminId = createdAdmin._id;
        const customerId = createdCustomer._id;

        const sampleProducts = products.map((product) => {
            return { ...product, user: adminId };
        });

        const createdProducts = await Product.insertMany(sampleProducts);
        console.log("Product data seeded successfully!");

        // Create sample orders for realistic dashboard and my-orders views
        const sampleOrders = [
            {
                user: customerId,
                orderItems: [
                    {
                        productId: createdProducts[0]._id,
                        name: createdProducts[0].name,
                        image: createdProducts[0].images[0]?.url || "https://picsum.photos/200",
                        price: createdProducts[0].price,
                        size: "M",
                        color: "Blue",
                        quantity: 1,
                    },
                    {
                        productId: createdProducts[1]._id,
                        name: createdProducts[1].name,
                        image: createdProducts[1].images[0]?.url || "https://picsum.photos/200",
                        price: createdProducts[1].price,
                        size: "L",
                        color: "Black",
                        quantity: 2,
                    },
                ],
                shippingAddress: {
                    firstName: "John",
                    lastName: "Customer",
                    address: "123 Fashion Blvd",
                    city: "New York",
                    postalCode: "10001",
                    country: "USA",
                    phone: "+1 555-0199",
                },
                paymentMethod: "Credit Card",
                itemsPrice: createdProducts[0].price + createdProducts[1].price * 2,
                taxPrice: 10,
                shippingPrice: 15,
                totalPrice: createdProducts[0].price + createdProducts[1].price * 2 + 25,
                isPaid: true,
                paidAt: new Date(Date.now() - 86400000),
                isDelivered: false,
                status: "Processing",
            },
            {
                user: customerId,
                orderItems: [
                    {
                        productId: createdProducts[2]._id,
                        name: createdProducts[2].name,
                        image: createdProducts[2].images[0]?.url || "https://picsum.photos/200",
                        price: createdProducts[2].price,
                        size: "S",
                        color: "Red",
                        quantity: 1,
                    },
                ],
                shippingAddress: {
                    firstName: "John",
                    lastName: "Customer",
                    address: "456 Sunset Strip",
                    city: "Los Angeles",
                    postalCode: "90001",
                    country: "USA",
                    phone: "+1 555-0288",
                },
                paymentMethod: "PayPal",
                itemsPrice: createdProducts[2].price,
                taxPrice: 5,
                shippingPrice: 10,
                totalPrice: createdProducts[2].price + 15,
                isPaid: true,
                paidAt: new Date(Date.now() - 172800000),
                isDelivered: true,
                deliveredAt: new Date(Date.now() - 86400000),
                status: "Delivered",
            },
        ];

        await Order.insertMany(sampleOrders);
        console.log("Sample orders seeded successfully!");

        process.exit(0);
    } catch (error) {
        console.error("Error seeding the data:", error);
        process.exit(1);
    }
};

seedData();
