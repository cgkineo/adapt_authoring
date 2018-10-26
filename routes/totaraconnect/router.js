var express = require('express');
var configuration = require('../../lib/configuration');
var controller = require('./controller');
var errors = require('./errors');

var router = express.Router();
var crud = controller.crudWrapper(router);

crud.get('/', (req, res, next) => {
  const URL = configuration.getConfig('rootUrl') + req.originalUrl;
  res.json({
    generate_token_url: `${URL}/generatetoken`,
    publish_course_url: `${URL}/publish/{id}`,
    tokens_url: `${URL}/tokens`,
    token_url: `${URL}/token/{id}`,
    test_connection_url: `${URL}/testconnection`,
    courses_url: `${URL}/courses`,
    scorm_url: `${URL}/scorm/{id}`
  });
});
// UI endpoints
crud.get('/generatetoken', controller.generateToken);
crud.get('/publish/:id', controller.publishCourse);
crud.get('/tokens', controller.getTokens);
crud.delete('/token/:id', controller.deleteToken);
// API endpoints
crud.get('/testconnection', controller.authenticate, controller.testConnection);
crud.get('/courses', controller.authenticate, controller.memoiseUser, controller.getCourses);
crud.get('/scorm/:id', controller.authenticate, controller.memoiseUser, controller.getScorm);
// catch-all
crud.unmatched(controller.handleUnmatched);

// Error handling
router.use(errors.handler);

module.exports = router;
