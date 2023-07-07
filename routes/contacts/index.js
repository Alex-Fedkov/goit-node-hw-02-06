const express = require("express");
const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
} = require("../../controllers/contacts");
const validate = require("./validation-contacts");
const { auth } = require("../../middlewares/userMiddlewares");

const router = express.Router();
router.get("/", auth, listContacts);
router.get("/:contactId", auth, getContactById);
router.post("/", auth, validate.createContact, addContact);
router.delete("/:contactId", auth, removeContact);
router.put("/:contactId", auth, validate.updateContact, updateContact);
router.patch(
  "/:contactId/favorite",
  auth,
  validate.updateStatusContact,
  updateStatusContact
);

module.exports = router;
