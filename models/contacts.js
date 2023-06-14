const fs = require("fs/promises");
const path = require("path");
const contactsFile = path.resolve("./models/contacts.json");
const shortId = require("shortid");

const onErr = (err) => {
  console.log(err);
  process.exit(1);
};

const listContacts = async () => {
  try {
    console.log("contactsFile", contactsFile);
    const data = await fs.readFile(contactsFile);
    console.log("data", data);
    return JSON.parse(data);
  } catch (error) {
    onErr(error);
  }
};

const getContactById = async (contactId) => {
  try {
    const data = await listContacts();
    return data.find(({ id }) => id === contactId);
  } catch (error) {
    onErr(error);
  }
};

const removeContact = async (contactId) => {
  try {
    const oldContactsList = await listContacts();
    const newContactsList = oldContactsList.filter(
      ({ id }) => id !== contactId
    );

    if (oldContactsList.length !== newContactsList.length) {
      await fs.writeFile(contactsFile, JSON.stringify(newContactsList));
      return true;
    }

    return false;
  } catch (error) {
    onErr(error);
  }
};

const addContact = async (body) => {
  try {
    const data = await listContacts();
    const newContact = {
      id: shortId(),
      ...body,
    };

    await fs.writeFile(contactsFile, JSON.stringify([...data, newContact]));
    return newContact;
  } catch (error) {
    onErr(error);
  }
};

const updateContact = async (contactId, body) => {
  try {
    const data = await listContacts();
    const oldContact = data.find(({ id }) => id === contactId);
    console.log("body", body);

    if (oldContact) {
      const newContactsList = data.filter(({ id }) => id !== contactId);
      const updatedContact = { ...oldContact, ...body };
      console.log("updatedContact ", updatedContact);
      await fs.writeFile(
        contactsFile,
        JSON.stringify([...newContactsList, updatedContact])
      );
      return updatedContact;
    }

    return false;
  } catch (error) {
    onErr(error);
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
