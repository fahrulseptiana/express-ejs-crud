const express = require('express');
const router = express.Router();
const contactController = require('../controllers/ContactController');
const upload = require('../middleware/upload');
const { validateContact, validateFileUpload } = require('../middleware/validation');

router.get('/', contactController.getAllContacts);
router.get('/contacts/create', contactController.showCreateForm);
router.post('/contacts', upload.single('photo'), validateContact, validateFileUpload, contactController.createContact);
router.get('/contacts/:id/edit', contactController.showEditForm);
router.post('/contacts/:id', upload.single('photo'), validateContact, validateFileUpload, contactController.updateContact);
router.post('/contacts/:id/delete', contactController.deleteContact);

module.exports = router;
