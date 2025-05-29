const uploader = require('../../utilities/singleUploader');

const avatarUpload = uploader(
  process.env.UPLOADS_BASE,
  ['image/jpeg', 'image/jpg', 'image/png'],
  1000000,
  'Only .jpg, jpeg or .png format allowed!',
);

module.exports = (req, res, next) => {
  avatarUpload.array('avatar', 5)(req, res, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload avatar',
        error: err.message,
      });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select an image file.',
      });
    }
    console.log(
      'Saved file paths:',
      req.files.map((file) => file.path),
    );

    next();
  });
};
