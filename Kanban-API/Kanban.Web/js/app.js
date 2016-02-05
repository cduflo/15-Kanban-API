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

    var CardResource = $resource(apiUrl + '/cards/:cardID', { listID: '@cardID' });

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

    $scope.addCard = function (x,y) {
        $scope.newCard.ListID = x.ListID;
        $scope.newCard.Text = newCard[y].Text;
        CardResource.save($scope.newCard, function () {
            alert('save successful');
            activate();
        });
    };

    $scope.delList = function (list) {
        list.$remove(function(){
            activate();
        })
    };

    $scope.delCard = function (card) {
        CardResource.remove(card.cardID, function () {
            alert('delete successful');
            activate();
        })
    };

    activate();

    var curYPos = 0,
    curXPos = 0,
    curDown = false;

    //window.addEventListener('mousemove', function (e) {
    //    if (curDown === true) {
    //        window.scrollTo(document.body.scrollLeft + (curXPos - e.pageX), document.body.scrollTop + (curYPos - e.pageY));
    //    }
    //});

    //window.addEventListener('mousedown', function (e) { curDown = true; curYPos = e.pageY; curXPos = e.pageX; });
    //window.addEventListener('mouseup', function (e) { curDown = false; });
});