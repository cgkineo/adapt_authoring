var express = require('express');
var controller = require('./controller');
var errors = require('./errors');

var router = express.Router();
var crud = controller.crudWrapper(router);

crud.get('/generatetoken', controller.generateToken);

// the below should only come from the UI
crud.get('/publish/:id', controller.publishCourse);
crud.get('/tokens', controller.getTokens);
crud.delete('/token/:id', controller.deleteToken);

// Token authentication middleware
router.use(controller.authenticate);

crud.get('/testconnection', controller.testConnection);

// Stores the request's user details for use later
router.use(controller.memoiseUser);

crud.get('/courses', controller.getCourses);
crud.get('/scorm/:id', controller.getScorm);

// Error handling
router.use(errors.handler);

module.exports = router;
