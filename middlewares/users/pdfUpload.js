const uploader = require('../../utilities/singleUploader');

const pdfUpload = uploader(
  process.env.UPLOADS_BASE,
  ['application/pdf'],
  5000000, // 5MB size limit (adjust as needed)
  'Only PDF format is allowed!',
);

module.exports = (req, res, next) => {
  pdfUpload.array('pdf', 5)(req, res, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload PDF',
        error: err.message,
      });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a PDF file.',
      });
    }

    console.log(
      'Received PDF files:',
      req.files.map((f) => f.originalname),
    );
    next();
  });
};
