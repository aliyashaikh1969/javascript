const { products } = require("../../db.json");

module.exports = (req, res) => {
    if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    const product = products.find((p) => p.id === req.query.id);
    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
    }

    res.status(200).json(product);
};
