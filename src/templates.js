angular.module('ambersive.list').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('src/views/ambersive.list.default.html',
    "<script type=text/ng-template id=datalistElement.html><div class=\"row\">\n" +
    "        <div class=\"col-xs-10\">\n" +
    "            <div class=\"radiobox\" ng-if=\"settings.radio === true\">\n" +
    "                <label>\n" +
    "                    <input type=\"radio\" ng-model=\"datalist.singleSelected\" value=\"{{row.id}}\"  ng-disabled=\"datalist.rowDisabled(row.id)\" ng-if=\"datalist.controlFilter(row)\">\n" +
    "                    <div ng-if=\"datalist.subTemplate === undefined\">{{row.title}}</div>\n" +
    "                    <div ng-if=\"datalist.subTemplate !== undefined\" ng-include=\"datalist.subTemplate\"></div>\n" +
    "                </label>\n" +
    "            </div>\n" +
    "            <div class=\"checkbox\" ng-if=\"datalist.actions.length > 0 && settings.radio !== true\">\n" +
    "                <label>\n" +
    "                    <input type=\"checkbox\" ng-model=\"row.isSelected\" ng-click=\"datalist.toggleItem($event,row)\" ng-disabled=\"datalist.rowDisabled(row.id)\" ng-if=\"datalist.controlFilter(row)\">\n" +
    "                    <div ng-if=\"datalist.subTemplate === undefined\">{{row.title}}</div>\n" +
    "                    <div ng-if=\"datalist.subTemplate !== undefined\" ng-include=\"datalist.subTemplate\"></div>\n" +
    "                </label>\n" +
    "            </div>\n" +
    "            <div ng-if=\"(datalist.actions.length === 0 || datalist.actions === undefined) && datalist.subTemplate === undefined && settings.radio !== true\">\n" +
    "                {{row.title}}\n" +
    "            </div>\n" +
    "            <div ng-if=\"(datalist.actions.length === 0 || datalist.actions === undefined) && datalist.subTemplate !== undefined  && settings.radio !== true\" ng-include=\"datalist.subTemplate\"></div>\n" +
    "        </div>\n" +
    "        <div class=\"col-xs-2\">\n" +
    "            <div class=\"pull-right\" ng-if=\"datalist.actions.length > 0\">\n" +
    "                <div class=\"item dropdown\" uib-dropdown>\n" +
    "                    <a href=\"#\" class=\"btn btn-link dropdown-toggle\" uib-dropdown-toggle>\n" +
    "                        <i class=\"fa fa-chevron-down\" ng-if=\"datalist.rowDisabled(row.id) === false || data.actionLoading === false\"></i>\n" +
    "                        <i ng-include=\"'datalistElementLoadingIcon.html'\" ng-if=\"datalist.rowDisabled(row.id) === true || data.actionLoading === true\"></i>\n" +
    "                    </a>\n" +
    "                    <ul class=\"dropdown-menu dropdown-menu-right\">\n" +
    "                        <li ng-repeat=\"action in datalist.actions\" ng-disabled=\"datalist.actionLoading\"><a ng-click=\"datalist.callAction(action,row,event)\"><i ng-if=\"action.icon\" class=\"{{action.icon}}\"></i> {{action.label}}</a></li>\n" +
    "                    </ul>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div></script><script type=text/ng-template id=datalistElementEmpty.html><div class=\"row\">\n" +
    "        <div class=\"col-xs-12\">\n" +
    "            {{datalist.langNoEntries}}\n" +
    "        </div>\n" +
    "    </div></script><script type=text/ng-template id=datalistElementError.html><div class=\"row\">\n" +
    "        <div class=\"col-xs-12\">\n" +
    "            {{datalist.errorMessage}}\n" +
    "        </div>\n" +
    "    </div></script><script type=text/ng-template id=datalistElementLoadingIcon.html><div class=\"loader loader--style3\" title=\"2\">\n" +
    "        <svg width=\"20\" height=\"20\" version=\"1.1\" id=\"loader-1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 50 50\" style=\"enable-background:new 0 0 50 50;\" xml:space=\"preserve\">\n" +
    "          <path fill=\"#000\" d=\"M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z\">\n" +
    "            <animateTransform attributeType=\"xml\"\n" +
    "              attributeName=\"transform\"\n" +
    "              type=\"rotate\"\n" +
    "              from=\"0 25 25\"\n" +
    "              to=\"360 25 25\"\n" +
    "              dur=\"0.6s\"\n" +
    "              repeatCount=\"indefinite\"/>\n" +
    "            </path>\n" +
    "          </svg>\n" +
    "    </div></script><div class=datalist_container><div class=\"row search-container\" ng-if=\"settings.search === true\"><div class=col-xs-12><form class=form-inline role=search ng-submit=datalist.startSearch()><div class=form-group><input ng-model=datalist.searchTerm class=form-control placeholder={{datalist.langSearchPlaceholder}}></div><button type=submit class=\"btn btn-default\">{{datalist.langSearchBtn}}</button></form></div></div><div class=\"panel panel-default\" ng-if=\"datalist.simple === false\"><div class=panel-heading><div class=row ng-if=\"settings.headline !== undefined || settings.description !== undefined\"><div class=col-xs-12><strong ng-if=settings.headline>{{settings.headline}}</strong><p ng-if=settings.description>{{settings.description}}</p></div></div><div class=row><div class=col-xs-10><div class=checkbox ng-if=\"datalist.actions.length > 0 && settings.radio !== true\"><label><input type=checkbox ng-model=datalist.allSelected ng-click=datalist.selectAll($event) ng-disabled=\"loading || datalist.actionLoading\"> <span translate>{{datalist.langChooseAll}}</span></label></div></div><div class=col-xs-2><div class=\"item dropdown pull-right\" uib-dropdown><i class=\"btn btn-link\" ng-include=\"'datalistElementLoadingIcon.html'\" ng-if=\"datalist.actionLoading === true\"></i> <a href=# class=\"btn btn-link dropdown-toggle\" ng-if=\"datalist.actionLoading !== true\" uib-dropdown-toggle><i class=\"fa fa-chevron-down\"></i></a><ul class=\"dropdown-menu dropdown-menu-right\"><li ng-disabled=datalist.actionLoading><a ng-click=datalist.refresh($event) ng-disabled=datalist.actionLoading><i class=\"fa fa-refresh\"></i> <span translate>{{datalist.langRefresh}}</span></a></li><li ng-repeat=\"action in datalist.actionsMultiple\" ng-disabled=datalist.actionLoading><a ng-click=datalist.callActionMultiple(action,datalist.selectedItems,event) ng-disabled=datalist.actionLoading><i ng-if=action.icon class={{action.icon}}></i> {{action.label}}</a></li></ul></div></div></div></div><ul class=list-group><li class=list-group-item ng-if=\"datalist.errorOccured === false && datalist.accessGranted === false && datalist.authenticated === false\">{{datalist.langTextNotLogged}}</li><li class=list-group-item ng-if=\"datalist.errorOccured === false && datalist.accessGranted === false && datalist.authenticated === true\">{{datalist.langTextNoPermission}}</li><li class=list-group-item ng-if=\"datalist.errorOccured === false && datalist.loading === false && datalist.accessGranted === true && datalist.data.length > 0\" ng-repeat=\"row in datalist.data\" ng-include=\"'datalistElement.html'\"></li><li class=list-group-item ng-if=\"datalist.errorOccured === false && datalist.loading === false && datalist.accessGranted === true && datalist.data.length === 0\" ng-include=\"'datalistElementEmpty.html'\"></li><li class=list-group-item ng-if=\"datalist.errorOccured === true\" ng-include=\"'datalistElementError.html'\"></li><li class=\"list-group-item text-center\" ng-if=\"datalist.errorOccured === false && datalist.loading === true\"><i ng-include=\"'datalistElementLoadingIcon.html'\"></i> {{datalist.langPleaseWait}}</li></ul></div><div class=datalist-simple ng-if=\"datalist.simple === true\"><li class=list-group-item ng-if=\"datalist.accessGranted === false && datalist.authenticated === false\">{{datalist.langTextNotLogged}}</li><li class=list-group-item ng-if=\"datalist.accessGranted === false && datalist.authenticated === true\">{{datalist.langTextNoPermission}}</li><div class=datalist-item ng-if=\"datalist.loading === false && datalist.accessGranted === true &&  datalist.subTemplate === undefined\" ng-repeat=\"row in datalist.data\">{{row.title}}</div><div class=datalist-item ng-if=\"datalist.loading === false && datalist.accessGranted === true && datalist.subTemplate !== undefined\" ng-repeat=\"row in datalist.data\" ng-include=datalist.subTemplate></div><div class=text-center ng-if=\"datalist.loading === true\"><i ng-include=\"'datalistElementLoadingIcon.html'\"></i> {{datalist.langPleaseWait}}</div></div><uib-pager ng-if=\"settings.pagination === true\" total-items=datalist.total items-per-page=datalist.entriesPerPage previous-text={{datalist.langBtnPrevious}} next-text={{datalist.langBtnNext}} ng-model=datalist.currentPage></uib-pager></div>"
  );

}]);
