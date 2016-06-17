# List - AngularJS Service/Directive

An AngularJS (1.5) service for displaying data (json-format).

### Version
0.0.3.9

### Installation

#### Step 1

```sh
$ bower install ambersive-list
```
#### Step 2
You first have to declare the 'ambersive.list' module dependency inside your app module (perhaps inside your app main module).
Please be aware, that you need the following addtional modules: ambersive-router-ui-auth, ambersive-db and angular-bootstrap (if you use the core template).

```sh
angular.module('app', ['ambersive.list','ambersive.db','ambersive.routerui.auth']);
```
### Configuration

Please be aware, that you need the basic configuration of ['ambersive.routerui.auth'](https://github.com/AMBERSIVE/AngularJS---AuthSrv). Otherwise the module will throw an error.

### Useage

The following example shows how to use the list-directive. As you can see the directive offers some attributes. See the options below to see possibilities.


```sh
<datalist api="Demo" settings="settings"></datalist>

```
### Options (= attributes)

#### api (String)

If you use this attribute you need to create an API-Call (DB-Service) with our module (ambersive.db), because this module automatically calls the service/factory.

#### api-method (Default: get) (String)

In combination with the DB-Service, mentioned above, you can define the method called by the datalist.

#### template (String)

To change the complete layout you can define a new template. For minor template changes we recommend to use the following attribute.

#### sub-template (String)

This attributes controls the inner content of the datalist without change the basic structure of the datalist attribute. If you just change things like text. This is the way to define a custom template.

#### rest (String/Object)

If you do not want to use the functions of the DB-Service you can define an object or a string with the rest settings.
Please be aware that the variable has to be in the scope of the controller.

#### simple (Default: false) (True/False as string)

If you do not want to display the controls and checkboxes you can set this variable to true to hide this.


#### settings (Object)

To configurate the controls and other things you can define a settings objects.

```sh
$scope.settings = {
    actions:[
        {'label':'Delete',apiMethod:'delete',multiple:true}
    ]
};
```

##### Actions

As you can see here, the settings object above has an attribute called "actions", which affects the controls of an single entry or the global datalist controls.

Currently there are differnt ways to define an action:

```sh
$scope.settings = {
    actions:[
         {'label':'Delete',apiMethod:'delete',multiple:true}
    ]
};
```

You can also define a custom function.

```sh
$scope.settings = {
    actions:[
        {
            'label':'Say me the ID',
            fn:function(id,row){
                var deferred = $q.defer();

                if(id !== undefined){
                    alert('This entry has the ID:'+id);
                    deferred.resolve({result:RESULTDATA,refresh:false});
                }

                return deferred.promise;
            },
            multiple:false
        }
    ]
};
```

If you want to restrict the function only to the global datalist functions you can do that via the multiple attribute of an action.

```sh
$scope.settings = {
    actions:[
        {
           'label':'Print',
            fn:function(id,row){
                var deferred = $q.defer();

                if(id !== undefined){
                    window.print();
                    deferred.resolve({result:RESULTDATA,refresh:false});
                }

                return deferred.promise;
            },
            multiple:{
                only:true,
                show:true,
                single:true
            }
        }
    ]
};
```

Every action is available in the global datalist functionslist, if you define it in the action. This is possible in two ways via the attribute "multiple"

```sh
$scope.settings = {
    actions:[
         {
            label:'Delete',
            apiMethod:'delete',
            multiple:true
         }
    ]
};
```

or


```sh
$scope.settings = {
    actions:[
         {
            label:'Delete',
            apiMethod:'delete',
            multiple:{
                only:true, // Action is only shown in the global control menu
                show:true, // Action is available the global control menu => long term version of the version above
                single:true // Action is only called once
            }
         }
    ]
};
```

To restrict the access to the data or an action you can define roles. You can combine both methods.

###### User restriction for action

```sh
$scope.settings = {
    actions:[
         {
            label:'Delete',
            apiMethod:'delete',
            roles:['Admin']
         }
    ]
};
```

###### User restriction for complete data

```sh
$scope.settings = {
    roles:['Admin']
};
```

License
----
MIT