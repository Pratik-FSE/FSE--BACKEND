const express = require('express');
const projectController = require('../controllers/projectController');
const dataService = require('../services/dataService');
const { upload } = require('../middleware/middleware');

const router = express.Router();

router.get('/api/projects', projectController.getAllProjects);
router.get('/api/projects/:slug', projectController.getProjectBySlug);
router.get('/api/clients', (req, res) => {
  const clients = dataService.getClients();
  res.status(200).json(clients);
});
router.get('/api/services', (req, res) => {
  const services = dataService.getServices();
  res.status(200).json(services);
});
router.get('/api/portfolio', projectController.getPortfolio);

router.post('/api/admin/upload', upload.single('file'), (req, res) => {
  const token = req.header('x-admin-token') || req.query.token;
  if (!token || token !== process.env.ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  if (!req.file) return res.status(400).json({ error: 'file required' });

  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ ok: true, url });
});

module.exports = router;
