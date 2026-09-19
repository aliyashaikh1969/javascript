const { reviews } = require("../db.json");
const generateId = require("./_lib/generateId");

module.exports = (req, res) => {
    if (req.method === "GET") {
        res.status(200).json(reviews);
        return;
    }

    if (req.method === "POST") {
        // not persisted (see api/orders.js) - the product page already appends
        // this response to its in-memory review list and re-renders immediately
        const review = { ...req.body, id: generateId() };
        res.status(201).json(review);
        return;
    }

    res.status(405).json({ error: "Method not allowed" });
};
