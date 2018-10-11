module.exports = {
  Route: 'totaraconnect',
  Filenames: {
    Publish: 'publish.zip',
    SCORM: '-SCORM.zip'
  },
  Messages: {
    Success: {
      ConnectionTest: "Connection successful",
      TokenRevoke: "Token revoked successfully",
      Publish: "Course published successfully"
    },
    Fail: {
      UserAuth: "Cannot authenticate user",
      NoCourse: "No course specified",
      NoSecret: "A 'jwtSecret' value needs to be defined in config.json",
      NoSpoor: "Spoor must be enabled to publish course",
      CourseUnknown: "No courses found with specified ID",
      CourseNotPublished: "Requested courses aren't accessible. Check that they have been published",
      CoursePerm: "User doesn't have permission to view course",
      TokenGen: "Failed to generate authorisation token",
      TokenInvalid: "Authorisation token is not valid",
      TokenNoData: "Didn't generate token, no data passed",
      UnexpectedToken: "Expected an authorisation token, received ",
      PermissionsCheck: "Failed permissions check",
      InvalidQuery: "Invalid value passed with query for "
    },
    HttpStatuses: {
      400: "Bad client request",
      401: "Server couldn't authenticate request",
      404: "Server couldn't find requested resource",
      500: "Internal server error"
    }
  }
};
