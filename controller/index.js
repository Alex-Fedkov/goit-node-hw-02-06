const service = require("../models");

const get = async (req, res, next) => {
  try {
    const contacts = await service.getAllContacts();
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
};

const getById = async (req, res, next) => {
  try {
    const contact = await service.getContactById(req.params.contactId);
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
};

const create = async (req, res, next) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "missing required name field",
    });
  }
  try {
    const contact = await service.createContact(req.body);
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
};

const remove = async (req, res, next) => {
  try {
    const isSuccess = await service.removeContact(req.params.contactId);
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
};

const updateStatus = async (req, res, next) => {
  const { contactId } = req.params;
  const { favorite = false } = req.body;

  try {
    const contact = await service.updateContact(contactId, { favorite });
    if (contact) {
      res.json({
        status: "success",
        code: 200,
        data: { contact },
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: `Not found contact id: ${contactId}`,
        data: "Not Found",
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const update = async (req, res, next) => {
  const { name, email, phone } = req.body;
  if (name || email || phone) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "missing fields",
    });
  }
  try {
    const updatedContact = await service.updateContact(
      req.params.contactId,
      req.body
    );
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
  res.json({ message: "successfully deleted" });
};

module.exports = {
  get,
  getById,
  create,
  update,
  updateStatus,
  remove,
};
