// api/middleware/middleware.js
const Projects = require('../projects/projects-model');
const Actions = require('../actions/actions-model');

// normalize DB booleans on the way out
const mapProject = p => p && ({
  id: p.id,
  name: p.name,
  description: p.description,
  completed: Boolean(p.completed),
});
const mapAction = a => a && ({
  id: a.id,
  project_id: a.project_id,
  description: a.description,
  notes: a.notes,
  completed: Boolean(a.completed),
});

async function validateProjectId(req, res, next) {
  try {
    const project = await Projects.get(req.params.id);
    if (!project) return res.status(404).json({ message: 'project not found' });
    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
}

// mode-aware validator: on PUT, completed is required and must be boolean
function validateProjectPayload(mode = 'post') {
  return (req, res, next) => {
    const { name, description, completed } = req.body || {};

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'name is required' });
    }
    if (typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ message: 'description is required' });
    }

    if (mode === 'put') {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'completed is required and must be a boolean' });
      }
    } else {
      if (completed !== undefined && typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'completed must be a boolean' });
      }
    }

    next();
  };
}

async function validateActionId(req, res, next) {
  try {
    const action = await Actions.get(req.params.id);
    if (!action) return res.status(404).json({ message: 'action not found' });
    req.action = action;
    next();
  } catch (err) {
    next(err);
  }
}

// Action payload validator. On POST, project_id is required and must exist.
// On PUT, if project_id is provided, it must be valid.
function validateActionPayload(mode = 'post') {
  return async (req, res, next) => {
    try {
      const { description, notes, completed, project_id } = req.body || {};

      if (typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({ message: 'description is required' });
      }
      if (description.trim().length > 128) {
        return res.status(400).json({ message: 'description cannot exceed 128 chars' });
      }
      if (typeof notes !== 'string' || !notes.trim()) {
        return res.status(400).json({ message: 'notes are required' });
      }
      if (completed !== undefined && typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'completed must be a boolean' });
      }

      if (mode === 'post') {
        if (typeof project_id !== 'number') {
          return res.status(400).json({ message: 'project_id is required and must be a number' });
        }
        const project = await Projects.get(project_id);
        if (!project) {
          return res.status(400).json({ message: 'project_id does not reference an existing project' });
        }
      } else {
        if (project_id !== undefined) {
          if (typeof project_id !== 'number') {
            return res.status(400).json({ message: 'project_id must be a number' });
          }
          const project = await Projects.get(project_id);
          if (!project) {
            return res.status(400).json({ message: 'project_id does not reference an existing project' });
          }
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  validateProjectId,
  validateProjectPayload,
  validateActionId,
  validateActionPayload,
  mapProject,
  mapAction,
};
