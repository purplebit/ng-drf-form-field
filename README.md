ng-drf-form-field
=================

An AngularJS form field directive that uses Django Rest Framework's metadata in order to generate the field with the proper validation, input type, choices, etc.


Usage example:

controller.js

    'use strict';

    angular.module('mainApp')
        .controller('ParentCtrl', [
            '$scope',
            'ResourceForm',
            function ($scope, ResourceForm) {

                // get the meta data from server
                var promise = ResourceForm.options('RESOURCE_URL');

                // populate
                $scope.metadata = {};
                promise.then(function(response) {
                    $scope.metadata = response.data.actions.POST;
                });

                // this object will be used to read from/write to 
                $scope.formModel = {
                    title: 'Mega mouse',
                    duration: 0,
                    active: false
                };
            }
    ]);


service.js - responsible for getting the meta data, returns a promise
    'use strict';

    angular.module('mainApp')
        .service('ResourceForm', [
            '$http',
            function ResourceForm($http) {
                this.options = function(url) {
                    var promise = $http({method: 'OPTIONS', url: url});
                    return promise;
                };
            }
    ]);

In view you can use <form-field></form-field>, three parameters are required
	- metadata -- that's the data object received from the server describing how each field look like
	- key -- tells the directive what field it should render (title, username, duration etc.)
	- ng-model="formModel" -- tells the directive what object should be used for storing the input values (hardcoded to formModel)

If you creating a Label element, ng-model should be skipped.

View

    <form name="movieForm" method="POST" novalidate>

        <div class="form-group" ng-class="{ 'has-error': !movieForm.title.$valid }">
            <!-- A label -->
            <form-field label metadata="metadata" key="title" class="col-sm-2 control-label"></form-field>
            <div class="col-sm-10">
                <!-- An input -->
                <form-field metadata="metadata" key="title" class="form-control" id="title" ng-model="formModel" name="title"></form-field>
                <!-- Form validation -->
                <p ng-show="movieForm.title.$error.maxlength" class="help-block">Title is too long</p>
                <p ng-show="movieForm.title.$error.required" class="help-block">Title is required</p>
            </div>
        </div>

    </form>