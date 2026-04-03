const ContactModel = require('../models/ContactModel');
const fs = require('fs');
const path = require('path');
const { supabase } = require('../config/supabase');
const { uploadToSupabase, deleteFromSupabase } = require('../middleware/upload');

const deleteLocalPhoto = (photoUrl) => {
  if (!photoUrl) return;
  const filePath = path.join(__dirname, '..', 'public', photoUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

exports.getAllContacts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', sort = 'name', order = 'asc' } = req.query;
    const result = await ContactModel.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sort,
      order
    });
    res.render('contacts/list', {
      contacts: result.contacts,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      },
      query: { search, sort, order }
    });
  } catch (err) {
    next(err);
  }
};

exports.showCreateForm = (req, res) => {
  res.render('contacts/create');
};

exports.createContact = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    if (await ContactModel.checkPhoneExists(phone)) {
      return next(new Error('Phone number already exists'));
    }
    
    let photo_url = null;
    if (req.file) {
      // Use Supabase if configured, otherwise use local storage
      if (supabase) {
        photo_url = await uploadToSupabase(req.file);
        // Delete local file after successful upload
        deleteLocalPhoto('/uploads/contacts/' + req.file.filename);
      } else {
        photo_url = '/uploads/contacts/' + req.file.filename;
      }
    }
    
    await ContactModel.create({ name, phone, photo_url });
    res.redirect('/?message=Contact created successfully');
  } catch (err) {
    next(err);
  }
};

exports.showEditForm = async (req, res, next) => {
  try {
    const contact = await ContactModel.findById(req.params.id);
    if (!contact) return res.status(404).send('Contact not found');
    res.render('contacts/edit', { contact });
  } catch (err) {
    next(err);
  }
};

exports.updateContact = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const contact = await ContactModel.findById(req.params.id);
    if (!contact) return res.status(404).send('Contact not found');
    if (await ContactModel.checkPhoneExists(phone, req.params.id)) {
      return next(new Error('Phone number already exists'));
    }

    let photo_url = contact.photo_url;
    if (req.file) {
      // Delete old photo
      if (contact.photo_url) {
        if (supabase) {
          await deleteFromSupabase(contact.photo_url);
        } else {
          deleteLocalPhoto(contact.photo_url);
        }
      }
      
      // Upload new photo
      if (supabase) {
        photo_url = await uploadToSupabase(req.file);
        deleteLocalPhoto('/uploads/contacts/' + req.file.filename);
      } else {
        photo_url = '/uploads/contacts/' + req.file.filename;
      }
    }

    await ContactModel.update(req.params.id, { name, phone, photo_url });
    res.redirect('/?message=Contact updated successfully');
  } catch (err) {
    next(err);
  }
};

exports.deleteContact = async (req, res, next) => {
  try {
    const contact = await ContactModel.findById(req.params.id);
    if (!contact) return res.status(404).send('Contact not found');
    
    // Delete photo
    if (contact.photo_url) {
      if (supabase) {
        await deleteFromSupabase(contact.photo_url);
      } else {
        deleteLocalPhoto(contact.photo_url);
      }
    }
    
    await ContactModel.delete(req.params.id);
    res.redirect('/?message=Contact deleted successfully');
  } catch (err) {
    next(err);
  }
};

// Export contacts to JSON
exports.exportContacts = async (req, res, next) => {
  try {
    const { search = '', sort = 'name', order = 'asc' } = req.query;
    const result = await ContactModel.findAll({
      page: 1,
      limit: 10000, // Get all contacts
      search,
      sort,
      order
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.json');
    res.json(result.contacts);
  } catch (err) {
    next(err);
  }
};
