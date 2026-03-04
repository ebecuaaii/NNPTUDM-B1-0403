// routes/roles.js
const express = require("express");
const router = express.Router();
const { dataRole, dataUser } = require("./data/data.js");

const nowISO = () => new Date().toISOString();

// GET /roles - list
router.get("/", (req, res) => {
    res.json(dataRole);
});

// GET /roles/:id - detail
router.get("/:id", (req, res) => {
    const role = dataRole.find((r) => r.id === req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json(role);
});

// POST /roles - create
router.post("/", (req, res) => {
    const { id, name, description } = req.body || {};
    if (!id || !name) return res.status(400).json({ message: "id và name là bắt buộc" });
    if (dataRole.some((r) => r.id === id)) return res.status(409).json({ message: "Role id đã tồn tại" });

    const newRole = {
        id,
        name,
        description: description || "",
        creationAt: nowISO(),
        updatedAt: nowISO(),
    };
    dataRole.push(newRole);
    res.status(201).json(newRole);
});

// PUT /roles/:id - update (full)
router.put("/:id", (req, res) => {
    const role = dataRole.find((r) => r.id === req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    const { name, description } = req.body || {};
    if (!name) return res.status(400).json({ message: "name là bắt buộc" });

    role.name = name;
    role.description = description || "";
    role.updatedAt = nowISO();

    // Option: update embedded role info inside users
    dataUser.forEach((u) => {
        if (u.role?.id === role.id) {
            u.role.name = role.name;
            u.role.description = role.description;
            u.updatedAt = nowISO();
        }
    });

    res.json(role);
});

// PATCH /roles/:id - update (partial)
router.patch("/:id", (req, res) => {
    const role = dataRole.find((r) => r.id === req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    const { name, description } = req.body || {};
    if (name !== undefined) role.name = name;
    if (description !== undefined) role.description = description;
    role.updatedAt = nowISO();

    // update embedded role in users
    dataUser.forEach((u) => {
        if (u.role?.id === role.id) {
            if (name !== undefined) u.role.name = name;
            if (description !== undefined) u.role.description = description;
            u.updatedAt = nowISO();
        }
    });

    res.json(role);
});

// DELETE /roles/:id - delete
router.delete("/:id", (req, res) => {
    const idx = dataRole.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Role not found" });

    // Nếu muốn chặn xóa role đang có user:
    const hasUsers = dataUser.some((u) => u.role?.id === req.params.id);
    if (hasUsers) return res.status(400).json({ message: "Role đang có user, không thể xóa" });

    const deleted = dataRole.splice(idx, 1)[0];
    res.json({ message: "Deleted", deleted });
});

// GET /roles/:id/users - lấy tất cả user thuộc role
router.get("/:id/users", (req, res) => {
    const role = dataRole.find((r) => r.id === req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    const users = dataUser.filter((u) => u.role?.id === req.params.id);
    res.json({ role, users, total: users.length });
});

module.exports = router;