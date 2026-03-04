// routes/users.js
const express = require("express");
const router = express.Router();
const { dataRole, dataUser } = require("./data/data.js");

const nowISO = () => new Date().toISOString();

const pickRoleById = (roleId) => {
  const role = dataRole.find((r) => r.id === roleId);
  if (!role) return null;
  return { id: role.id, name: role.name, description: role.description };
};

// GET /users - list
router.get("/", (req, res) => {
  res.json(dataUser);
});

// GET /users/:username - detail
router.get("/:username", (req, res) => {
  const user = dataUser.find((u) => u.username === req.params.username);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// POST /users - create
router.post("/", (req, res) => {
  const {
    username,
    password,
    email,
    fullName,
    avatarUrl,
    status,
    loginCount,
    roleId, // gửi roleId để map sang role object
  } = req.body || {};

  if (!username || !password || !email) {
    return res.status(400).json({ message: "username, password, email là bắt buộc" });
  }
  if (dataUser.some((u) => u.username === username)) {
    return res.status(409).json({ message: "username đã tồn tại" });
  }

  const roleObj = roleId ? pickRoleById(roleId) : null;
  if (roleId && !roleObj) return res.status(400).json({ message: "roleId không hợp lệ" });

  const newUser = {
    username,
    password,
    email,
    fullName: fullName || "",
    avatarUrl: avatarUrl || "",
    status: status ?? true,
    loginCount: loginCount ?? 0,
    role: roleObj || null,
    creationAt: nowISO(),
    updatedAt: nowISO(),
  };

  dataUser.push(newUser);
  res.status(201).json(newUser);
});

// PUT /users/:username - update full
router.put("/:username", (req, res) => {
  const user = dataUser.find((u) => u.username === req.params.username);
  if (!user) return res.status(404).json({ message: "User not found" });

  const { password, email, fullName, avatarUrl, status, loginCount, roleId } = req.body || {};
  if (!password || !email) return res.status(400).json({ message: "password và email là bắt buộc" });

  const roleObj = roleId ? pickRoleById(roleId) : null;
  if (roleId && !roleObj) return res.status(400).json({ message: "roleId không hợp lệ" });

  user.password = password;
  user.email = email;
  user.fullName = fullName || "";
  user.avatarUrl = avatarUrl || "";
  user.status = status ?? user.status;
  user.loginCount = loginCount ?? user.loginCount;
  user.role = roleObj;
  user.updatedAt = nowISO();

  res.json(user);
});

// PATCH /users/:username - update partial
router.patch("/:username", (req, res) => {
  const user = dataUser.find((u) => u.username === req.params.username);
  if (!user) return res.status(404).json({ message: "User not found" });

  const { password, email, fullName, avatarUrl, status, loginCount, roleId } = req.body || {};

  if (roleId !== undefined) {
    const roleObj = roleId ? pickRoleById(roleId) : null;
    if (roleId && !roleObj) return res.status(400).json({ message: "roleId không hợp lệ" });
    user.role = roleObj;
  }

  if (password !== undefined) user.password = password;
  if (email !== undefined) user.email = email;
  if (fullName !== undefined) user.fullName = fullName;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (status !== undefined) user.status = status;
  if (loginCount !== undefined) user.loginCount = loginCount;

  user.updatedAt = nowISO();
  res.json(user);
});

// DELETE /users/:username - delete
router.delete("/:username", (req, res) => {
  const idx = dataUser.findIndex((u) => u.username === req.params.username);
  if (idx === -1) return res.status(404).json({ message: "User not found" });

  const deleted = dataUser.splice(idx, 1)[0];
  res.json({ message: "Deleted", deleted });
});

module.exports = router;