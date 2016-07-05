/**
 * Datalist for AngularJS
 * @version v0.0.1.0
 * @link http://www.ambersive.com
 * @licence MIT License, http://www.opensource.org/licenses/MIT
 */

(function(window, document, undefined) {

    'use strict';

    angular.module('ambersive.list',['ui.router','ambersive.routerui.auth']);

    angular.module('ambersive.list').provider('$datalistSettings',[
        function(){

            var values = {
                langChooseAll:'Choose all',
                langRefresh:'Refresh',
                langPleaseWait:'Please wait',
                langBtnNext:'Next',
                langBtnPrevious:'Previous',
                langTextNoPermission:'You do not have enough permission to see this data.',
                langTextNotLogged:'Please login to see this data',
                langSearchBtn:'Search',
                langSearchPlaceholder:'Searchterm',
                langNoEntries:'No entries avaiable',
                langErrorData: 'Data could not be loaded.',
                template:'src/views/ambersive.list.default.html',
                entriesPerPage:10
            };

            return({
                setValue: function (name,value) {
                    if(values[name] === undefined){return;}
                    values[name] = value;
                },
                $get: function () {
                    return {
                        all:values,
                        template:values.template,
                        langChooseAll:values.langChooseAll,
                        langRefresh:values.langRefresh,
                        langPleaseWait:values.langPleaseWait,
                        langBtnPrevious:values.langBtnPrevious,
                        langBtnNext:values.langBtnNext,
                        langTextNoPermission:values.langTextNoPermission,
                        langTextNotLogged:values.langTextNotLogged,
                        langSearchBtn:values.langSearchBtn,
                        langSearchPlaceholder:values.langSearchPlaceholder,
                        langNoEntries:values.langNoEntries,
                        langErrorData:values.langErrorData,
                        entriesPerPage:values.entriesPerPage
                    };
                }
            });

        }
    ]);

    angular.module('ambersive.list').config(['$urlRouterProvider',
        function($urlRouterProvider) {

        }
    ]);

    angular.module('ambersive.list').run(['$rootScope','$state','$log',
        function($rootScope,$state,$log){

        }
    ]);

    angular.module('ambersive.list').factory('DatalistSrv',['$q','$log','$state','$rootScope',
        function($q,$log,$state,$rootScope){

            var DatalistSrv     = {},
                User            = {};

            DatalistSrv.isAuthenticated = false;

            /**
             * Check the permissions
             * @returns {boolean}
             */

            DatalistSrv.checkPermission = function(settings){

                var accessGranted       = true,
                    authenticatedNeeded = false,
                    check               = function(){
                        if(settings.permission !== undefined && settings.permission.roles !== undefined){
                            var neededRoles = settings.permission.roles;


                            if(angular.isArray(neededRoles) && neededRoles.length > 0){
                                authenticatedNeeded = true;
                            }

                            if((angular.isArray(neededRoles) && DatalistSrv.isAuthenticated === false && authenticatedNeeded === true) || (User.roles === undefined && authenticatedNeeded === true)){
                                return false;
                            }

                            accessGranted = User.roles.some(function(role){
                                return (neededRoles.indexOf(role) > -1);
                            });

                            if(authenticatedNeeded === true && accessGranted === false){
                                return false;
                            }

                        }
                        return true;
                    };
                return check();
            };

            /**
             * Broadcasts
             */

            $rootScope.$on('$stateAuthenticationUser',function(event,args){
                User = args.user;
                if(args.user.roles !== undefined && DatalistSrv.isAuthenticated === false){
                    DatalistSrv.isAuthenticated = true;
                    return;
                }
                DatalistSrv.isAuthenticated = false;
            });

            return DatalistSrv;

        }
    ]);

    angular.module('ambersive.list').directive('datalist',['$compile',
        function($compile){

            var directive = {};

            directive.restrict = 'E';

            directive.scope = {
                template:'@',
                subTemplate:'@',
                searchTemplate:'@',
                rest:'=',
                api:'@',
                apiMethod:'@',
                settings:'=',
                simple:'@',
                id:'@'
            };

            directive.replace = true;

            directive.transclude = true;

            directive.controller = ['$compile','$scope','$rootScope','$state','$element','$log','$timeout','$templateCache','$http','$q','$datalistSettings','DB','DatalistSrv',
                function($compile,$scope,$rootScope,$state,$element,$log,$timeout,$templateCache,$http,$q,$datalistSettings,DB,DatalistSrv){

                    var datalist            = this,
                        settings            = {};

                    $scope.datalist = datalist;

                    datalist.getTemplateByUrl       = false;
                    datalist.data                   = [];
                    datalist.result                 = {};
                    datalist.loading                = true;
                    datalist.errorOccured           = false;
                    datalist.errorMessage           = '';
                    datalist.actionLoading          = false;

                    datalist.selectedItems          = [];
                    datalist.allSelected            = false;

                    datalist.actionItems            = [];

                    datalist.langChooseAll          = $datalistSettings.langChooseAll;
                    datalist.langRefresh            = $datalistSettings.langRefresh;
                    datalist.langPleaseWait         = $datalistSettings.langPleaseWait;
                    datalist.langBtnPrevious        = $datalistSettings.langBtnPrevious;
                    datalist.langBtnNext            = $datalistSettings.langBtnNext;
                    datalist.entriesPerPage         = $datalistSettings.entriesPerPage;
                    datalist.langTextNoPermission   = $datalistSettings.langTextNoPermission;
                    datalist.langTextNotLogged      = $datalistSettings.langTextNotLogged;
                    datalist.langSearchBtn          = $datalistSettings.langSearchBtn;
                    datalist.langSearchPlaceholder  = $datalistSettings.langSearchPlaceholder;
                    datalist.langNoEntries          = $datalistSettings.langNoEntries;
                    
                    datalist.currentPage            = 0;

                    datalist.authenticated          = DatalistSrv.isAuthenticated;
                    datalist.accessGranted          = true;
                    datalist.searchTerm             = '';
                    /**
                     * Get parameters
                     */

                    if($scope.template !== undefined){ datalist.templateUrl = $scope.template;} else { datalist.templateUrl = $datalistSettings.template;}
                    if($scope.subTemplate !== undefined){datalist.subTemplate = $scope.subTemplate;}
                    if($scope.settings !== undefined){ settings = $scope.settings; }
                    if($scope.rest !== undefined){ datalist.rest = $scope.rest;}
                    if($scope.api !== undefined){ datalist.api = $scope.api;}
                    if($scope.apiMethod !== undefined){ datalist.apiMethod = $scope.apiMethod; } else { datalist.apiMethod = 'get';}

                    datalist.simple = ($scope.simple === 'true' && $scope.simple !== undefined);
                    
                    // Fallbacks
                    
                    if(settings.search === undefined){
                        settings.search = false;
                    }

                    if(settings.pagination === undefined){
                        settings.pagination = true;
                    }

                    $scope.$watch('datalist.currentPage', function() {

                        if(angular.isArray(datalist.result)){

                            if(settings.pagination === true) {

                                var start   = (datalist.entriesPerPage * datalist.currentPage) - datalist.entriesPerPage,
                                    stop    = datalist.entriesPerPage,
                                    data    = angular.copy(datalist.result);

                                $timeout(function () {
                                    datalist.data = data.splice(start, stop);
                                    $scope.$apply();
                                });

                            } else {

                                $timeout(function () {
                                    datalist.data = angular.copy(datalist.result);
                                    $scope.$apply();
                                });

                            }

                        }
                        else if(angular.isObject(datalist.result)){
                            datalist.getData(datalist.currentPage);
                        }

                    });

                    /**
                     * Functions
                     */

                    $scope.warn = function(msg){
                        $log.warn(msg);
                    };

                    /***
                     * Filter function to show/hide a function for multiple action call if no entry is selected
                     * @param action
                     * @returns {*}
                     */

                    datalist.checkActionForMultiple = function(action){

                        if(action.multiple === undefined){
                            return;
                        }

                        if(angular.isObject(action.multiple)){

                            var show = (action.multiple.show || false),
                                only = (action.multiple.only || false);

                            if(show === true){
                                return action;
                            }

                            if(show === false && datalist.selectedItems.length > 0){
                                return action;
                            }

                        } else {

                            var available = (action.multiple || false);

                            if(available === true && datalist.selectedItems.length > 0){
                                return action;
                            }

                        }

                    };

                    /***
                     * Filter function to show/hide a function for a single action call
                     * @param action
                     * @returns {*}
                     */

                    datalist.checkActionForSingle = function(action){

                        if(DatalistSrv.checkPermission(action) === false){
                            return;
                        }

                        var onlyMultiple = false;

                        if(action.multiple !== undefined){
                            if(angular.isObject(action.multiple)){
                                onlyMultiple = (action.multiple.only || false);
                            }
                        }

                        if(onlyMultiple === false) {
                            return action;
                        }

                    };

                    /***
                     * Set the actions menu
                     * @returns undefined
                     */

                    datalist.getMenu = function(){
                        if(settings.actions !== undefined){
                            datalist.actions = angular.copy(settings.actions).filter(datalist.checkActionForSingle);
                            datalist.actionsMultiple = angular.copy(settings.actions).filter(datalist.checkActionForMultiple);
                        }
                    };

                    datalist.rowDisabled = function(id){
                        if(datalist.actionLoading === true && (datalist.selectedItems.indexOf(id) > -1 || datalist.actionItems.indexOf(id) > -1)){
                            return true;
                        }
                        return false;
                    };

                    /***
                     * Function for checkbox and radiobox filtering
                     * @param row
                     * @returns {boolean}
                     */

                    datalist.controlFilter = function(row){

                        var visible = false;

                        if(settings.controlFilter === undefined){
                            return true;
                        }

                        visible = settings.controlFilter(row);

                        if(visible === undefined){
                            visible = true;
                        }

                        return visible;

                    };

                    datalist.startSearch = function () {
                        datalist.getData(null,datalist.searchTerm);
                    };

                    /***
                     * Init function
                     */

                    datalist.init = function(){


                        var template    = null,
                            templateUrl = null;

                        /**
                         * Menus
                         */

                        datalist.getMenu();

                        /**
                         * Get Template
                         */

                        template = $templateCache.get(datalist.templateUrl);

                        if(template === undefined && datalist.templateUrl !== undefined){

                            $scope.getTemplateByUrl = true;

                            datalist.getData();

                            $http.get(datalist.templateUrl, {}).then(function (result) {
                                if (result.status === 200) {
                                    template = result.data;

                                    $element.html(template);
                                    $element.replaceWith($compile($element.html())($scope));

                                } else {
                                    $scope.warn('ambersive.list: $http loading template failed');
                                }
                            }, function () {
                                $scope.warn('aambersive.list: $http loading template failed');
                            });

                        }

                        $scope.templateHtml = template;

                    };

                    /***
                     * Get the data for this list
                     * @returns {*}
                     */

                    datalist.getData = function(page,searchTerm){
                        var deferred        = $q.defer(),
                            api             = {},
                            apiData         = {},
                            restExtention   = '',
                            resultFn        = function(result){

                                var data = result;

                                if(result.data !== undefined){
                                    data = result.data;
                                }

                                datalist.currentPage = page;

                                if(angular.isArray(data)){
                                    datalist.result         = data;
                                    datalist.total          = data.length;
                                    datalist.loading        = false;

                                    $timeout(function(){
                                        $scope.$apply();
                                    },0);

                                }
                                else if(angular.isObject(data)){

                                    datalist.total = data.length;

                                    if(result.total !== undefined) {
                                        datalist.total = data.total;
                                    }

                                    if(data.entries !== undefined){
                                        datalist.result = data.entries;
                                    } else {
                                        datalist.result = data;
                                    }

                                    $timeout(function(){
                                        $scope.$apply();
                                    },0);

                                    datalist.loading = false;

                                }
                                deferred.resolve();
                            };

                        if(page === undefined || page === 0 || page === null){
                            page = 1;
                        }

                        datalist.accessGranted = DatalistSrv.checkPermission(settings);
                        datalist.authenticated = DatalistSrv.isAuthenticated;
                        if(datalist.accessGranted === false){
                            datalist.loading = false;
                            return;
                        }

                        datalist.loading        = true;
                        datalist.errorOccured   = false;

                        if(datalist.api !== undefined){
                            api = DB(datalist.api);
                            
                            apiData = $state.params;
                            apiData.page = page;

                            if(searchTerm !== undefined && searchTerm !== ''){
                                apiData.search = searchTerm;
                            }

                            api.$has(datalist.apiMethod).then(function(methodExists) {

                                if(methodExists === true) {

                                    api[datalist.apiMethod](apiData).then(
                                        function (result) {

                                            resultFn(result);
                                            datalist.data = datalist.result;
                                            deferred.resolve();

                                        },
                                        function (errorResult) {

                                            datalist.data = [];

                                            datalist.errorOccured = true;

                                            if (errorResult !== null && errorResult.message !== undefined) {
                                                datalist.errorMessage = errorResult.message;
                                            } else {
                                                datalist.errorMessage = $datalistSettings.langErrorData;
                                            }

                                            deferred.reject(errorResult);

                                        }
                                    );

                                } else {

                                    datalist.data           = [];
                                    datalist.errorOccured   = true;
                                    datalist.errorMessage   = $datalistSettings.langErrorData;
                                    deferred.reject({});

                                }

                            });

                        }
                        else if (datalist.rest !== undefined){

                            restExtention = '';

                            if(searchTerm !== undefined  && searchTerm !== ''){
                                restExtention = '?search='+searchTerm;
                            }

                            if(angular.isString(datalist.rest)){

                                $http.get(datalist.rest+restExtention, {}).then(function successCallback(response) {
                                    resultFn(response.data);
                                }, function errorCallback(response) {
                                    $log.warn('aambersive.list: $http get error (rest)');
                                    deferred.resolve();
                                });

                            }
                            else if(angular.isObject(datalist.rest)){
                                $http(datalist.rest+restExtention).then(function successCallback(response) {
                                    resultFn(response.data);
                                }, function errorCallback(response) {
                                    $log.warn('aambersive.list: $http get error (rest)');
                                    deferred.resolve();
                                });
                            }

                        }
                        else {
                            deferred.resolve();
                        }

                        return deferred.promise;
                    };

                    /***
                     * Refresh the data for this list
                     * @param event
                     */

                    datalist.refresh = function(event){

                        if(event !== undefined) {
                            event.preventDefault();
                        }

                        datalist.selectedItems = [];
                        datalist.selectAll = false;

                        if(datalist.actionLoading === true){
                            return;
                        }

                        datalist.getData(datalist.currentPage);
                        datalist.getMenu();
                    };

                    /**
                     * Call a single action
                     * @param action
                     * @param row
                     * @param event
                     */

                    datalist.callAction = function(action,row,event,entries){

                        if(entries === undefined){
                            entries = [row.id];
                        }

                        if(event !== undefined) {
                            event.preventDefault();
                        }

                        var actionClass = {},
                            actionCaller,
                            removeIdFromActionItem = function(id){

                                var index = datalist.actionItems.indexOf(id);

                                if(index > -1){
                                    datalist.actionItems.splice(index,1);
                                }

                                datalist.actionLoading = false;

                            };

                        datalist.actionLoading = true;
                        datalist.actionItems.push(row.id);

                        if(action.apiMethod !== undefined){
                            actionClass     = DB(datalist.api);
                            actionCaller    = function(){
                                actionClass[action.apiMethod](row.id,row).then(
                                    function(result,refresh){

                                        if(refresh === undefined){
                                            refresh = true;
                                        }

                                        if(action.successFn !== undefined && angular.isFunction(action.successFn)){
                                            action.successFn(result,$element);
                                        }

                                        if(refresh === true){
                                            datalist.getData(datalist.currentPage);
                                        }

                                        removeIdFromActionItem(row.id);

                                    },
                                    function(errorResult){

                                        if(action.errorFn !== undefined && angular.isFunction(action.errorFn)){
                                            action.errorFn(errorResult,$element);
                                        }

                                        removeIdFromActionItem(row.id);

                                    }
                                );
                            };

                            if(action.preFn !== undefined){

                                action.preFn(entries).then(
                                    function(sF){
                                        actionCaller();
                                    },
                                    function(eF){
                                        removeIdFromActionItem(row.id);
                                    }
                                );

                            } else {

                                actionCaller();

                            }
                        }
                        else if(action.fn !== undefined){

                            actionCaller    = function() {
                                action.fn(row.id, row).then(
                                    function successHandler(response) {

                                        if (response !== undefined && response.refresh === undefined) {
                                            response.refresh = true;
                                        }

                                        if (action.successFn !== undefined && angular.isFunction(action.successFn)) {
                                            action.successFn(response.result, $element);
                                        }

                                        if (response !== undefined && response.refresh === true) {
                                            datalist.getData(datalist.currentPage);
                                        }

                                        removeIdFromActionItem(row.id);

                                    },
                                    function errorHandler(errorResult) {
                                        if (action.errorFn !== undefined && angular.isFunction(action.errorFn)) {
                                            action.errorFn(errorResult, $element);
                                        }

                                        if (errorResult.refresh === undefined) {
                                            errorResult.refresh = true;
                                        }

                                        if (errorResult !== undefined && errorResult.refresh === true) {
                                            datalist.getData(datalist.currentPage);
                                        }

                                        removeIdFromActionItem(row.id);
                                    }
                                );
                            };

                            if(action.preFn !== undefined){

                                action.preFn(entries).then(
                                    function(sF){
                                        actionCaller();
                                    },
                                    function(eF){
                                        removeIdFromActionItem(row.id);
                                    }
                                );

                            } else {

                                actionCaller();

                            }

                        }

                    };

                    /**
                     * Call a multiple entry action
                     * @param action
                     * @param entries
                     * @param event
                     */

                    datalist.callActionMultiple = function(action,entries,event){

                        if(event !== undefined) {
                            event.preventDefault();
                        }

                        if(datalist.actionLoading === true){
                            return;
                        }

                        datalist.actionLoading = true;

                        var actionClass = {},
                            callFn      = null,
                            counter     = 0,
                            counterFn   = function(response,single,refresh){

                                if(single === undefined){ single = false; }

                                if(single === true){
                                    datalist.actionLoading = false;
                                    return;
                                }

                                counter++;

                                if(counter === entries.length){
                                    datalist.actionLoading = false;

                                    if(refresh === true){

                                        datalist.refresh();

                                    }

                                }
                            },
                            singleCall = false,
                            actionCaller;

                        if(action.apiMethod !== undefined){

                            actionClass = DB(datalist.api);

                            callFn = function(entry){
                                actionClass[action.apiMethod](entry).then(
                                    function (result, refresh) {

                                        counterFn(result,singleCall,action.refresh);

                                    },
                                    function (errorResult) {

                                        counterFn(errorResult,singleCall,action.refresh);

                                    }
                                );
                            };

                            actionCaller = function(){

                                if(action.multiple !== undefined && action.multiple.single === true){

                                    singleCall = true;
                                    callFn(0);

                                } else {
                                    entries.forEach(function (entry, index) {

                                        actionClass[action.apiMethod](entry).then(
                                            function (result, refresh) {

                                                counterFn(result,false,action.refresh);

                                            },
                                            function (errorResult) {

                                                counterFn(errorResult,false,action.refresh);

                                            }
                                        );

                                    });
                                }

                            };

                            if(action.preFn !== undefined){

                                action.preFn(entries).then(
                                    function(sF){
                                        actionCaller();
                                    },
                                    function(eF){

                                        datalist.actionItems = [];
                                        datalist.actionLoading = false;

                                    }
                                );

                            } else {

                                actionCaller();

                            }


                        }
                        else if(action.fn !== undefined){

                            callFn = function(entry){
                                action.fn(entry).then(
                                    function successHandler(result,refresh){
                                        counterFn(result,singleCall,action.refresh);
                                    },
                                    function errorHandler(errorResult){
                                        counterFn(errorResult,singleCall,action.refresh);
                                    }
                                );
                            };

                            actionCaller = function(){

                                if(action.multiple !== undefined && action.multiple.single === true){

                                    singleCall = true;
                                    callFn(0);

                                } else {

                                    entries.forEach(function(entry,index){

                                        callFn(entry);

                                    });

                                }

                            };

                            if(action.preFn !== undefined){

                                action.preFn(entries).then(
                                    function(sF){
                                        actionCaller();
                                    },
                                    function(eF){

                                        datalist.actionItems = [];
                                        datalist.actionLoading = false;

                                    }
                                );

                            } else {

                                actionCaller();

                            }


                        }

                    };

                    /***
                     * Toggle item data selection
                     * @param event
                     * @param row
                     */

                    datalist.toggleItem = function(event,row){

                        var index = datalist.selectedItems.indexOf(row.id);

                        if(row.isSelected === true && index === -1){
                            datalist.selectedItems.push(row.id);
                        } else {
                            datalist.selectedItems.splice(index, 1);
                        }

                        if(datalist.data.length === datalist.selectedItems.length){
                            datalist.allSelected = true;
                        } else {
                            datalist.allSelected = false;
                        }

                        datalist.getMenu();

                    };

                    /***
                     * Select all list entries for further actions
                     * @param event
                     */

                    datalist.selectAll = function(event){

                        datalist.selectedItems = [];

                        var setter = function(element){

                            var index = datalist.selectedItems.indexOf(element.id);

                            element.isSelected = datalist.allSelected;

                            if(element.isSelected === true && index === -1) {
                                datalist.selectedItems.push(element.id);
                            } else {
                                datalist.selectedItems.splice(index, 1);
                            }

                        };

                        datalist.data.filter(setter);
                        datalist.getMenu();

                    };
 
                    datalist.init();

                    $scope.$watch('datalist.singleSelected',function(value){

                        $rootScope.$broadcast('$datalistSelectedValue',{value:value});

                    });

                    /***
                     * Broadcasts
                     */

                    $scope.$on('$stateAuthenticationUser',function(event,args){

                        datalist.getMenu();
                        datalist.getData();
                    });

                    $scope.$on('$updateLists',function(event,args){

                        datalist.getMenu();
                        datalist.getData();
                    });

                    $scope.$on('$updateListsSingle',function(event,args){
                        
                        if(args.id === $scope.id) {

                            datalist.getMenu();
                            datalist.getData();

                        }

                    });

                }
            ];

            directive.link = function(scope,element,attrs){
                try {

                    if(scope.getTemplateByUrl === true){
                        return;
                    }

                    if(scope.templateHtml === undefined){
                        scope.warn('ambersive.list: template is undefined');
                        return;
                    }

                    scope.datalist.getData();
                    element.html(scope.templateHtml);
                    element.replaceWith($compile(element.html())(scope));

                } catch(err){
                    scope.warn(err);
                }
            };

            return directive;
        }
    ]);

})(window, document, undefined);