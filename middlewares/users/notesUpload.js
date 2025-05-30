const uploader = require('../../utilities/singleUploader');

const notesUpload = uploader(
  process.env.UPLOADS_BASE,
  [
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ], // txt, doc, docx
  5000000, // 5MB
  'Only .txt, .doc, or .docx formats are allowed!',
);

module.exports = (req, res, next) => {
  notesUpload.array('notes', 5)(req, res, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload notes',
        error: err.message,
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a valid notes file.',
      });
    }

    console.log(
      'Received notes files:',
      req.files.map((f) => f.originalname),
    );
    next();
  });
};
