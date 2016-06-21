// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {

	var Origin = require('coreJS/app/origin');
	var SchemasModel = require('coreJS/scaffold/models/schemasModel');

	var Schemas = function(schemaName) {
		var configModel = Origin.editor.data.config;

        if (configModel) {
            // Remove any extensions and components that are not enabled on this course
            var enabledExtensions = configModel.get('_enabledExtensions');
            var enabledExtensionsKeys = [];
      
            // Grab the targetAttribute
            _.each(enabledExtensions, function(value, key) {
                enabledExtensionsKeys.push(value.targetAttribute);
            });

            // Get the schema
            var schema = JSON.parse(JSON.stringify(Origin.schemas.get(schemaName)));
            // Compare the enabledExtensions against the current schemas
            if (schema._extensions) {
                _.each(schema._extensions.properties, function(value, key) {
                    if (!_.contains(enabledExtensionsKeys, key)) {
                        delete schema._extensions.properties[key];
                    }
                });
            }
      
            if (schemaName == 'course') {
                // Remove unrequired globals from the course
                if (schema._globals && schema._globals.properties._extensions) {
                    _.each(schema._globals.properties._extensions.properties, function(value, key) {
                        if (!_.contains(enabledExtensionsKeys, key)) {
                            delete schema._globals.properties._extensions.properties[key];
                        }
                    });
                }

                // Go through each _enabledComponents and find it in the schemas
                if (schema._globals && schema._globals.properties._components) {
                    
                    var enabledComponents = configModel.get('_enabledComponents');
                    
                    var enabledComponentsKeys = _.pluck(enabledComponents, '_component');
                    _.each(schema._globals.properties._components.properties, function(value, key) {
                        if (!_.contains(enabledComponentsKeys, key)) {
                            delete schema._globals.properties._components.properties[key];
                        }
                    });

                }
                
            }

			// Maybe this is a little bit broken
			// But if something doesn't have properties object 
			// - remove it all together
			if (schema.properties && !schema.properties.properties) {
				delete schema.properties;
			}

			// Return the modified schema
			return schema;

		} else {
            var schema = JSON.parse(JSON.stringify(Origin.schemas.get(schemaName)));
            delete schema._extensions;
            // Remove globals as these are appended to the course model
            delete schema.globals;
            return schema;
        }
	};

	return Schemas;
})