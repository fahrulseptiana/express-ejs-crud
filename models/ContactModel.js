const { db } = require('../config/database');

module.exports = {
  async findAll(options = {}) {
    return await db.findAll(options);
  },

  async findById(id) {
    return await db.findById(id);
  },

  async create(contactData) {
    return await db.create(contactData);
  },

  async update(id, contactData) {
    return await db.update(id, contactData);
  },

  async delete(id) {
    return await db.delete(id);
  },

  async checkPhoneExists(phone, excludeId = null) {
    return await db.phoneExists(phone, excludeId);
  }
};
