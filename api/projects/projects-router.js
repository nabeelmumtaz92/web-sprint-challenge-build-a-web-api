// api/projects/projects-router.js
const express = require('express');
const Projects = require('./projects-model');
const {
  validateProjectId,
  validateProjectPayload,
  mapProject,
  mapAction,
} = require('../middleware/middleware');

const router = express.Router();

// [GET] /api/projects
router.get('/', async (req, res, next) => {
  try {
    const projects = await Projects.get();
    res.json(projects.map(mapProject));
  } catch (err) {
    next(err);
  }
});

// [GET] /api/projects/:id
router.get('/:id', validateProjectId, (req, res) => {
  res.json(mapProject(req.project));
});

// [POST] /api/projects
router.post('/', validateProjectPayload('post'), async (req, res, next) => {
  try {
    const { name, description, completed } = req.body;
    const created = await Projects.insert({
      name: name.trim(),
      description: description.trim(),
      completed: completed ?? false,
    });
    res.status(201).json(mapProject(created));
  } catch (err) {
    next(err);
  }
});

// [PUT] /api/projects/:id
router.put(
  '/:id',
  validateProjectId,
  validateProjectPayload('put'),
  async (req, res, next) => {
    try {
      const { name, description, completed } = req.body; // completed required & boolean
      const updated = await Projects.update(req.params.id, {
        name: name.trim(),
        description: description.trim(),
        completed,
      });
      res.json(mapProject(updated));
    } catch (err) {
      next(err);
    }
  }
);

// [DELETE] /api/projects/:id
router.delete('/:id', validateProjectId, async (req, res, next) => {
  try {
    await Projects.remove(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// [GET] /api/projects/:id/actions
router.get('/:id/actions', validateProjectId, async (req, res, next) => {
  try {
    const actions = await Projects.getProjectActions(req.params.id);
    res.json(actions.map(mapAction));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
