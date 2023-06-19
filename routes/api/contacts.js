const express = require("express");

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require("../../models/contacts");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts();
    return res.status(200).json({
      status: "success",
      code: 200,
      data: {
        contacts,
      },
    });
  } catch (error) {
    next(error);
  }
  res.json({ message: "template message" });
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.contactId);
    if (contact) {
      return res.status(200).json({
        status: "success",
        code: 200,
        data: {
          contact,
        },
      });
    }
    return res.status(404).json({
      status: "error",
      code: 404,
      message: "Not Found",
    });
  } catch (error) {
    next(error);
  }
  res.json({ message: "template message" });
});

router.post("/", async (req, res, next) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "missing required name field",
    });
  }
  try {
    const contact = await addContact(req.body);
    return res.status(201).json({
      status: "success",
      code: 201,
      data: {
        contact,
      },
    });
  } catch (error) {
    next(error);
  }
  res.json({ message: "template message" });
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const isSuccess = await removeContact(req.params.contactId);
    if (isSuccess) {
      return res.status(200).json({
        status: "success",
        code: 200,
        message: "Contact successfully deleted",
      });
    }
    return res.status(404).json({
      status: "error",
      code: 404,
      message: "Not Found",
    });
  } catch (error) {
    next(error);
  }
  res.json({ message: "template message" });
});

router.put("/:contactId", async (req, res, next) => {
  const { name, email, phone } = req.body;
  if (name || email || phone) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "missing fields",
    });
  }
  try {
    const updatedContact = await updateContact(req.params.contactId, req.body);
    if (updatedContact) {
      return res.status(200).json({
        status: "success",
        code: 200,
        data: {
          contact: updatedContact,
        },
      });
    }
    return res.status(404).json({
      status: "error",
      code: 404,
      message: "Not Found",
    });
  } catch (error) {
    next(error);
  }
  res.json({ message: "template message" });
});

module.exports = router;
