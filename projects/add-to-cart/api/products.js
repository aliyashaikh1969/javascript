const { products } = require("../db.json");

module.exports = (req, res) => {
    if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    const { category } = req.query;
    const result = category ? products.filter((p) => p.category === category) : products;

    res.status(200).json(result);
};
