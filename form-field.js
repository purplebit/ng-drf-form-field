'use strict';

/* 
 * An AngularJS form field directive that uses Django Rest Framework's 
 * metadata in order to generate the field with the 
 * proper validation, input type, choices, etc.
 *  
 *
 * Usage:
 * ------
 * 
 *  <form-field metadata="metadata" key="title" ng-model="formModel" 
 *                  name="title"></form-field>
 * metadata : object
 *      this object is received from the server, it consists of attributes
 *      describing how the input should look like, is it a text, textarea, number
 *      etc.
 * formModel : object
 *      ng-model binds each input field with the formModel, all the input values
 *       stored in formModel object as properties.
 * key : string
 *      key is property on the metadata to read the meta-information from.
 *      i.e by specifying key="title", directive would build input from 
 *       metadata.title.
 * 
 * Creating Label
 * --------------
 * It's possible to create a label instead of an input.
 * <form-field label metadata="metadata" key="title"></form-field>
 * 
 * 
 * Validation 
 * ----------
 * Validation works in the same way as with regular input.
 * <form name="userForm">
 *  
 *      <form-field metadata="metadata" key="username" ng-model="formModel" 
 *                  name="username"></form-field>
 *      <p ng-show="useForm.username.$error.minlength" class="help-block">Username is too short.</p>
 * 
 * </form>
 * 
*/
angular.module('mainApp')
    .directive('formField', function ($compile) {

        var integerField = function() {
            var template = document.createElement('input');
            template.type = 'number';
            return template;
        };

        var checkBoxField = function() {
            var template = document.createElement('input');
            template.type = 'checkbox';
            return template;
        };

        var textAreaField = function() {
            var template = document.createElement('textarea');
            return template;
        };

        var stringField = function() {
            var template = document.createElement('input');
            template.type = 'text';
            return template;
        };

        var choiceField = function(metaField) {
            var template = document.createElement('select');
            var option = document.createElement('option');

            for (var i = 0, max = metaField.choices.length; i < max; i += 1) {
                option = document.createElement('option');
                /* jshint camelcase:false */
                option.text = metaField.choices[i].display_name;
                /* jshint camelcase:true */
                option.value = metaField.choices[i].value;
                template.add(option);
            }

            return template;
        };

        var dateTimeField = function() {
            var template = document.createElement('input');
            template.type = 'datetime';
            return template;
        };

        var labelElement = function(metaField) {
            var template = document.createElement('label');

            console.log(metaField);
            // label value
            template.innerText = metaField.label;
            return template;
        };

        /*
         * Copy all attributes defined on the directive itself
         * to the input element, i.e id, class, etc.
        */
        var inheritAttributes = function(element, attributes, template) {
            for (var attr in attributes.$attr) {
                if (attributes.$attr[attr] === 'ng-model') {
                    template.setAttribute('ng-model', attributes[attr] + '.' + attributes.key);
                } else if (attributes.$attr[attr] === 'ng-click') {
                    template.setAttribute('ng-click', '$parent.' + attributes[attr]);
                } else {
                    template.setAttribute(attributes.$attr[attr], attributes[attr]);
                }
            }

            return template;
        };

        /*
         * Convert DRF attributes into HTML attributes
         * and attach them to the input element.
         */
        var attachAttributes = function(template, metafield) {
            var attributes = {
                'required': 'ng-required',
                'read_only': 'ng-readonly',
                'max_length': 'ng-maxlength'
            };

            angular.forEach(attributes, function(value, attr) {
                if ( attr in metafield) {
                    template.setAttribute(value, String(metafield[attr]));
                }
            });

            return template;
        };


        var field = function(scope, element, attributes) {

            var deregister = scope.$watch('metadata', function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    var node,
                        metaField = scope.metadata[scope.key];

                    // element creation
                    if ('label' in attributes) {
                        node = labelElement(metaField);
                    } else if (metaField.type in types) {
                        node = types[metaField.type](metaField);
                        node = attachAttributes(node, metaField);
                    } else {
                        node = types.string(scope, element, attributes);
                        node = attachAttributes(node, metaField);
                    }
                    
                    // copy all attributes from directive tag to input tag
                    node = inheritAttributes(element, attributes, node, scope);

                    // create angular template from string containing html code
                    var template = angular.element(node.outerHTML);

                    // replace directive tag with generated input tag 
                    element.replaceWith(template);

                    // compile the template
                    var linkFn = $compile(template);

                    // link the compiled template with the scope
                    linkFn(scope);

                    // deregister watch
                    deregister();
                }

            });

        };

        // Django Rest Framework fields and corresponding functions;
        var types = {
            'field': textAreaField,
            'string': stringField,
            'integer': integerField,
            'boolean': checkBoxField,
            'choice': choiceField,
            'datetime': dateTimeField
        };

        var directive = {
            restrict: 'E',
            scope: {
                metadata: '=',
                formModel: '=ngModel',
                key: '@'
            },
            link: field,
        };

        return directive;

    });