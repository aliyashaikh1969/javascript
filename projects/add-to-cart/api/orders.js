const generateId = require("./_lib/generateId");

// Serverless functions are stateless, so this does not persist orders to
// db.json - each request may run on a different instance and writes to the
// filesystem don't survive past it anyway. That's fine here: the checkout
// flow only needs the response back to store as "lastOrder" in localStorage,
// which is what the confirmation page actually reads from.
module.exports = (req, res) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    const order = { ...req.body, id: generateId() };
    res.status(201).json(order);
};
