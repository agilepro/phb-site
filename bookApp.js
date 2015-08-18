
function parsePageParams() {
    var param = [];
    var curPath = window.location.href;
    var hashPos = curPath.indexOf("#/");
    if (hashPos>0) {
        var tail = curPath.substring(hashPos+2);
        var elems = tail.split("/");
        for(var i=0; i<elems.length; i++) {
            var part = elems[i];
            var equalsPos = part.indexOf("=");
            if (equalsPos>0) {
                var paramName = part.substring(0,equalsPos);
                var paramVal = part.substring(equalsPos+1);
                //console.log("found a parameter: "+paramName+" = "+paramVal);
                param[paramName]=decodeURIComponent(paramVal);
            }
        }
    }
    return param;
}

function setAddressBar(param) {
    var curPath = window.location.toString();
    var hashPos = curPath.indexOf("#");
    var newAddr = "";
    if (hashPos>0) {
        newAddr = curPath.substring(0,hashPos+1);
    }
    else {
        newAddr = curPath + "#";
    }
    for (var key in param) {
        if (param.hasOwnProperty(key)) {
            newAddr = newAddr + "/"+key+"="+window.encodeURIComponent(param[key]);
        }
    }
    window.location = newAddr;
}


var bookApp = angular.module('bookApp', []);
bookApp.factory('bookFactory', function($http) {
    return {
        list: function(callback) {
            $http.get('booklist.json').success(callback);
        }
    }
});
bookApp.controller('bookCtrl', function ($scope, $http, bookFactory, $rootScope, $location) {
    $scope.books = new Array();
    $scope.selectedBook = "bookmtu";
    $scope.tabmode=1;
    $scope.param=[];
    $scope.filter="";

    $rootScope.$on('$locationChangeSuccess', function (event, location) {
        $scope.param = parsePageParams();
        $scope.filter="";
        if( !(typeof $scope.param.titleFilter === 'undefined')) {
            $scope.filter=$scope.param.titleFilter;
        }
        if( !(typeof $scope.param.book === 'undefined')) {
            $scope.selectedBook=$scope.param.book;
        }
    });

    $scope.rereadData = function() {
        bookFactory.list( function(data) {
            $scope.data = data;
            $scope.books = data.list;
            $scope.randomize();
        });
    }
    $scope.rereadData();
    $scope.selBook = $scope.books[0];
    $scope.selectBook = function() {
        if ($scope.param.book === undefined) {
            $scope.param.book = "bookthinking";
        }
        for (var i=0; i<$scope.books.length; i++) {
            if ($scope.books[i].key == $scope.param.book) {
                $scope.selBook = $scope.books[i];
            }
        }
    }
    $scope.updateBook = function(newBook) {
        $scope.param.book = newBook;
        $scope.selectBook();
        window.location="Detail.htm#/book="+newBook;
        window.scrollTo(0,0)
    }
    $scope.filteredBooks = [];
    $scope.searchTitles = function() {
        var filterSet = [];
        $scope.param.titleFilter = $scope.filter;
        setAddressBar($scope.param);
        var lcFilter = $scope.filter.toLowerCase();
        for (var i=0; i<$scope.books.length; i++) {
            var title = $scope.books[i].title.toLowerCase();
            if (title.indexOf(lcFilter)>=0) {
                filterSet.push($scope.books[i]);
            }
        }
        return filterSet;
    }
    $scope.selectAuthor = function() {
        var filterSet = [];
        for (var i=0; i<$scope.books.length; i++) {
            var authors = $scope.books[i].authors;
            for (var j=0; j<authors.length; j++) {
                var oneAuth = authors[j];
                if (oneAuth == $scope.param.author) {
                    filterSet.push($scope.books[i]);
                }
            }
        }
        $scope.filteredBooks = filterSet;
    }
    $scope.selectCat = function() {
        var filterSet = [];
        for (var i=0; i<$scope.books.length; i++) {
            var cats = $scope.books[i].cats;
            for (var j=0; j<cats.length; j++) {
                var oneCat = cats[j];
                if (oneCat == $scope.param.cat) {
                    filterSet.push($scope.books[i]);
                }
            }
        $scope.filteredBooks = filterSet;
        }
    }
    $scope.findRelated = function(searchCat) {
        var ret = [];
        for (var i=0; i<$scope.books.length; i++) {
            var cats = $scope.books[i].cats;
            for (var j=0; j<cats.length; j++) {
                var oneCat = cats[j];
                if (oneCat == searchCat) {
                    ret.push($scope.books[i]);
                }
            }
        }
        return ret;
    }
    $scope.randomize = function() {
        for (var i=0; i<$scope.books.length; i++) {
            $scope.books[i].rand = Math.random();
        }
        $scope.books.sort(function(a, b){return a.rand-b.rand});
        $scope.groupBooks();
    }
    $scope.groupBooks = function() {
        var res = [];
        var row =  [];
        for (var i=0; i<$scope.books.length; i++) {
            row.push($scope.books[i]);
            if (i % 100 == 99) {
                res.push(row);
                row = [];
            }
        }
        if ($scope.books.length % 100 != 99) {
            res.push(row);
        }
        $scope.groupedBooks = res;
    }
    $scope.getAuthors = function() {
        var temp = [];
        for (var i=0; i<$scope.books.length; i++) {
            temp = temp.concat($scope.books[i].authors);
        }
        temp = eliminateDups(temp);
        temp.sort();
        return temp;
    }
});

bookApp.filter('encode', function() {
    return window.encodeURIComponent;
});

bookApp.filter('btoa', function() {
    return function (str) {
        return window.btoa(encodeURIComponent(escape(str)));
    }
});

bookApp.filter('atob', function() {
    return function(str) {
        return unescape(decodeURIComponent(window.atob(str)));
    }
});

function eliminateDups(a) {
    var temp = {};
    for (var i = 0; i < a.length; i++)
        temp[a[i]] = true;
    var r = [];
    for (var k in temp)
        r.push(k);
    return r;
}