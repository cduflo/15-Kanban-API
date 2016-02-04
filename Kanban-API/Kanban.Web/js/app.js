angular.module('kanban', ['ngResource']);
angular.module('kanban').value('apiUrl', 'http://localhost:52972/api');
angular.module('kanban').controller('IndexController', function ($scope, $resource ,apiUrl) {
    var Listresource = $resource(apiUrl + '/lists/:listID', { listID: '@id' });
    var lists = Listresource.query();
    $scope.lists = lists;

    function activate() {
        var lists = Listresource.query();
        $scope.lists = lists;
    };
 
    $scope.newList = {};

    $scope.addList = function () {
        Listresource.save($scope.newList, function () {
            alert('save successful');
            activate();
        });
    };

    activate();
});