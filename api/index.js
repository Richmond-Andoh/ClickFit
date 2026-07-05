const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const app = express();

// On Vercel, only /tmp is writable
var uploadDir = '/tmp/upload_images';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    var ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext);
  }
});

var fileFilter = function (req, file, cb) {
  var allowed = /\.(jpg|jpeg|png|gif|webp|bmp)$/i;
  if (allowed.test(path.extname(file.originalname))) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, gif, webp, bmp) are allowed'));
  }
};

var upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

app.use(express.json());

// Serve uploaded images from /tmp
app.get('/upload_images/:filename', function (req, res) {
  var filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

app.get('/api/objects', function (req, res) {
  var opts = {
    hostname: 'api.restful-api.dev',
    path: '/objects',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    timeout: 5000
  };

  var proxyReq = https.request(opts, function (proxyRes) {
    var data = '';
    proxyRes.setEncoding('utf-8');
    proxyRes.on('data', function (chunk) {
      data += chunk;
    });
    proxyRes.on('end', function () {
      try {
        var parsed = JSON.parse(data);
        res.json(parsed);
      } catch (e) {
        res.status(500).json({ message: 'Failed to parse response from upstream' });
      }
    });
    proxyRes.on('error', function () {
      res.status(500).json({ message: 'Error reading upstream response' });
    });
  });

  proxyReq.on('timeout', function () {
    proxyReq.destroy();
    res.status(504).json({ message: 'Upstream request timed out' });
  });

  proxyReq.on('error', function () {
    res.status(500).json({ message: 'Error connecting to upstream' });
  });

  proxyReq.end();
});

app.post('/api/upload', function (req, res) {
  upload.single('image')(req, res, function (err) {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, error: 'File too large (max 5MB)' });
        }
        return res.status(400).json({ success: false, error: err.message });
      }
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    res.json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: '/upload_images/' + req.file.filename
    });
  });
});

app.get('/api/uploads', function (req, res) {
  fs.readdir(uploadDir, function (err, files) {
    if (err) {
      return res.status(500).json({ success: false, error: 'Could not list uploads' });
    }
    var images = [];
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      if (/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f)) {
        images.push({
          filename: f,
          url: '/upload_images/' + f
        });
      }
    }
    res.json({ success: true, images: images });
  });
});

module.exports = app;
