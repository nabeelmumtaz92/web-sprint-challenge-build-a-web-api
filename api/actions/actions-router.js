// api/actions/actions-router.js
const express = require('express');
const Actions = require('./actions-model');
const {
  validateActionId,
  validateActionPayload,
  mapAction,
} = require('../middleware/middleware');

const router = express.Router();

// [GET] /api/actions
router.get('/', async (req, res, next) => {
  try {
    const actions = await Actions.get();
    res.json(actions.map(mapAction));
  } catch (err) {
    next(err);
  }
});

// [GET] /api/actions/:id
router.get('/:id', validateActionId, (req, res) => {
  res.json(mapAction(req.action));
});

// [POST] /api/actions
router.post('/', validateActionPayload('post'), async (req, res, next) => {
  try {
    const { project_id, description, notes, completed } = req.body;
    const created = await Actions.insert({
      project_id,
      description: description.trim(),
      notes: notes.trim(),
      completed: completed ?? false,
    });
    res.status(201).json(mapAction(created));
  } catch (err) {
    next(err);
  }
});

// [PUT] /api/actions/:id
router.put('/:id', validateActionId, validateActionPayload('put'), async (req, res, next) => {
  try {
    const { project_id, description, notes, completed } = req.body;

    const changes = {
      description: description.trim(),
      notes: notes.trim(),
      completed: completed !== undefined ? completed : Boolean(req.action.completed),
    };
    if (project_id !== undefined) changes.project_id = project_id;

    const updated = await Actions.update(req.params.id, changes);
    res.json(mapAction(updated));
  } catch (err) {
    next(err);
  }
});

// [DELETE] /api/actions/:id
router.delete('/:id', validateActionId, async (req, res, next) => {
  try {
    await Actions.remove(req.params.id);
    res.status(204).end(); // no response body
  } catch (err) {
    next(err);
  }
});

module.exports = router;
