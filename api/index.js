const express = require("express");
const router = express.Router();
const ctrlTask = require("../controller");

router.get("/contacts", ctrlTask.get);

router.get("/contacts/:contactId", ctrlTask.getById);

router.post("/contacts", ctrlTask.create);

router.put("/contacts/:contactId", ctrlTask.update);

router.patch("/contacts/:contactId/status", ctrlTask.updateStatus);

router.delete("/contacts/:contactId", ctrlTask.remove);

module.exports = router;
