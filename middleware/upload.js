const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { supabase } = require('../config/supabase');

// Only create upload directory if Supabase is NOT configured (local storage)
const uploadDir = 'public/uploads/contacts';
if (!supabase && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Skip if Supabase is configured (files go to cloud)
    if (supabase) {
      cb(null, '/tmp'); // Temp directory for processing
    } else {
      cb(null, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: jpg, png, gif, webp'), false);
  }
};

// Create upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Upload to Supabase Storage if configured
async function uploadToSupabase(file) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const fileBuffer = fs.readFileSync(file.path);
  const fileName = `contacts/${Date.now()}-${path.basename(file.filename)}`;
  
  const { data, error } = await supabase.storage
    .from('contact-photos')
    .upload(fileName, fileBuffer, {
      contentType: file.mimetype,
      upsert: false
    });
  
  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('contact-photos')
    .getPublicUrl(fileName);
  
  return urlData.publicUrl;
}

// Delete from Supabase Storage
async function deleteFromSupabase(photoUrl) {
  if (!supabase || !photoUrl) return;
  
  // Extract file name from URL
  const urlParts = photoUrl.split('/');
  const fileName = urlParts.slice(-2).join('/'); // Gets "contacts/filename"
  
  const { error } = await supabase.storage
    .from('contact-photos')
    .remove([fileName]);
  
  if (error) {
    console.error('Failed to delete from Supabase:', error.message);
  }
}

module.exports = { upload, uploadToSupabase, deleteFromSupabase };
