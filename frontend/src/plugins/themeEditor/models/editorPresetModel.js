// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
	var EditorModel = require('modules/editor/global/models/editorModel');

	var EditorPresetModel = EditorModel.extend({
		urlRoot: '/api/content/themepreset',
	});
	
	return EditorPresetModel;
});
