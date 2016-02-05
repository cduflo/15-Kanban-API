angular.module('kanban', ['ngResource']);
angular.module('kanban').value('apiUrl', 'http://localhost:52972/api');
angular.module('kanban').controller('IndexController', function ($scope, $resource ,apiUrl) {
    var ListResource = $resource(apiUrl + '/lists/:listID', { listID: '@listID' }, {
        'cards': {
            url: apiUrl + '/lists/:listID/cards',
            method: 'GET',
            isArray: true,
        }
    });

    function activate() {
        ListResource.query(function (data) {
            $scope.lists = data;

            $scope.lists.forEach(function (list) {
                list.cards = ListResource.cards({ listID: list.ListID });
            });
        });
    }
 
    $scope.newList = {};
    $scope.newCard = {};
    //$scope.dCard = {};

    $scope.addList = function () {
        ListResource.save($scope.newList, function () {
            alert('save successful');
            activate();
        });
    };

    $scope.addCard = function () {
        ListResource.save($scope.newList, function () {
            alert('save successful');
            activate();
        });
    };

    $scope.delList = function (list) {
        list.$delete(function(){
            activate();
        })
    };

    $scope.delCard = function (card) {
        ListResource.delete(card.cardID, function () {
            alert('delete successful');
            activate();
        })
    };

    activate();
});