(function (module) {
    mifosX.controllers = _.extend(module, {
        MakeDataTableEntryController: function (scope, location, routeParams, resourceFactory, dateFilter, $rootScope) {
            scope.tableName = routeParams.tableName;
            scope.entityId = routeParams.entityId;
            scope.fromEntity = routeParams.fromEntity;
            scope.columnHeaders = [];
            scope.formData = {};
            scope.formDat = {};
            scope.tf = "HH:mm";
            scope.client=false;
            scope.group=false;
            scope.center=false;
            scope.office=false;
            scope.savingsaccount=false;
            scope.loanproduct = false;
            scope.showSelect = true;
            scope.villageName;
            scope.dataTableName = '';

            if (routeParams.fromEntity == 'client') {
                    scope.clientName = $rootScope.clientname;
                    scope.client=true;
            }
            if (routeParams.fromEntity == 'group') {
                    scope.groupName = $rootScope.groupNameDataParameter;
                    scope.group=true;
            }
            if (routeParams.fromEntity == 'center') {
                    scope.centerName = $rootScope.centerName;
                    scope.center=true;
            }
            if (routeParams.fromEntity == 'loan') {
                    scope.loanproductName = $rootScope.loanproductName;
                    scope.loanproduct = true;
                    scope.clientId = $rootScope.clientId;
                    scope.LoanHolderclientName = $rootScope.LoanHolderclientName;
            }
            if (routeParams.fromEntity == 'office') {
                    scope.officeName =  $rootScope.officeName;
                    scope.office=true;
            }
            if (routeParams.fromEntity == 'savings') {
                    scope.savingsAccount =  $rootScope.savingsAccount;
                    scope.savingsaccount=true;
                    scope.clientId=$rootScope.clientId;
                    scope.savingsaccountholderclientName=$rootScope.savingsaccountholderclientName;
            }
            if(scope.tableName =='Address' && scope.fromEntity == 'client'){
                scope.showSelect=false;
            }

            resourceFactory.DataTablesResource.getTableDetails({ datatablename: scope.tableName, entityId: scope.entityId, genericResultSet: 'true' }, function (data) {

                var colName = data.columnHeaders[0].columnName;
                if (colName == 'id') {
                    data.columnHeaders.splice(0, 1);
                }

                colName = data.columnHeaders[0].columnName;
                if (colName == 'gl_journal_entry_id') {
                    scope.dataTableName = 'acc_gl_journal_entry';
                }
                if (colName == 'client_id' || colName == 'office_id' || colName == 'group_id' || colName == 'center_id' || colName == 'loan_id' || colName == 'savings_account_id' || colName == 'gl_journal_entry_id') {
                    data.columnHeaders.splice(0, 1);
                    scope.isCenter = colName == 'center_id' ? true : false;
                }

                for (var i in data.columnHeaders) {
                    if (data.columnHeaders[i].columnDisplayType == 'DATETIME') {
                        scope.formDat[data.columnHeaders[i].columnName] = {};
                    }
                }
                scope.columnHeaders = data.columnHeaders;

            });

            // this function fetch all data of particular village id and assign new value to column name of address table

            scope.changeVillage = function(id) {
                scope.villageId = id.id;
                scope.villageName = id.value;

                if (scope.tableName == "Address" && scope.fromEntity == "client") {
                    resourceFactory.villageResource.get({villageId: scope.villageId}, function (data) {
                        scope.villageData = data;
                        for (var i in scope.columnHeaders) {
                            if (scope.columnHeaders [i].columnName == "Taluk") {
                                scope.formData[scope.columnHeaders[i].columnName] = data.taluk;
                            } else if (scope.columnHeaders[i].columnName == "District") {
                                scope.formData[scope.columnHeaders[i].columnName] = data.district;
                            } else if (scope.columnHeaders[i].columnName == "State") {
                                scope.formData[scope.columnHeaders[i].columnName] = data.state;
                            } else if (scope.columnHeaders[i].columnName == "Pincode") {
                                scope.formData[scope.columnHeaders[i].columnName] = data.pincode;
                            }

                        }
                    });
                }
            }

            //return input type
            scope.fieldType = function (type) {
                var fieldType = "";
                if (type) {
                    if (type == 'CODELOOKUP' || type == 'CODEVALUE') {
                        fieldType = 'SELECT';
                    } else if (type == 'DATE') {
                        fieldType = 'DATE';
                    } else if (type == 'DATETIME') {
                        fieldType = 'DATETIME';
                    } else if (type == 'BOOLEAN') {
                        fieldType = 'BOOLEAN';
                    } else {
                        fieldType = 'TEXT';
                    }
                }
                return fieldType;
            };

            scope.dateTimeFormat = function () {
                for (var i in scope.columnHeaders) {
                    if(scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                        return scope.df + " " + scope.tf;
                    }
                }
                return scope.df;
            };

            scope.cancel = function () {
                if (scope.fromEntity == 'client') {
                    location.path('/viewclient/' + routeParams.entityId).search({});
                } else if (scope.fromEntity == 'group') {                    
                    location.path('/viewgroup/' + routeParams.entityId).search({});
                } else if (scope.fromEntity == 'center') {                    
                    location.path('/viewcenter/' + routeParams.entityId).search({});
                } else if (scope.fromEntity == 'loan') {                    
                    location.path('/viewloanaccount/' + routeParams.entityId).search({});
                } else if (scope.fromEntity == 'savings') {
                    location.path('/viewsavingaccount/' + routeParams.entityId).search({});
                } else if (scope.fromEntity == 'office') {
                    location.path('/viewoffice/' + routeParams.entityId).search({});
                } else if (scope.fromEntity == 'journalentry') {
                    location.path('/viewtransactions/' + routeParams.entityId).search({});
                };
            };
            scope.submit = function () {
                if(scope.showSelect==false){
                    for(var i in scope.columnHeaders){
                        if(scope.columnHeaders [i].columnName == "Village Name"){
                            this.formData[scope.columnHeaders[i].columnName] = scope.villageName;
                        }
                    }
                }
                var params = {datatablename: scope.tableName, entityId: scope.entityId, genericResultSet: 'true', command: scope.dataTableName};
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.dateTimeFormat();
                //below logic, for the input field if data is not entered, this logic will put "", because
                //if no data entered in input field , that field name won't send to server side.
                for (var i = 0; i < scope.columnHeaders.length; i++) {
                    if (!_.contains(_.keys(this.formData), scope.columnHeaders[i].columnName)) {
                        this.formData[scope.columnHeaders[i].columnName] = "";
                    }
                    if (scope.columnHeaders[i].columnDisplayType == 'DATE') {
                        this.formData[scope.columnHeaders[i].columnName] = dateFilter(this.formDat[scope.columnHeaders[i].columnName],
                            this.formData.dateFormat);
                    } else if (scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                        this.formData[scope.columnHeaders[i].columnName] = dateFilter(this.formDat[scope.columnHeaders[i].columnName].date, scope.df)
                        + " " + dateFilter(this.formDat[scope.columnHeaders[i].columnName].time, scope.tf);
                    }
                }


                resourceFactory.DataTablesResource.save(params, this.formData, function (data) {
                    var destination = "";
                    if (data.loanId) {
                        destination = '/viewloanaccount/' + data.loanId;
                    } else if (data.savingsId) {
                        destination = '/viewsavingaccount/' + data.savingsId;
                    } else if (data.clientId) {
                        destination = '/viewclient/' + data.clientId;
                    } else if (data.groupId) {
                        if (scope.isCenter) {
                            destination = '/viewcenter/' + data.groupId;
                        } else {
                            destination = '/viewgroup/' + data.groupId;
                        }
                    } else if (data.transactionId) {
                        destination = '/viewtransactions/' + data.transactionId;
                    } else if (data.officeId) {
                        destination = '/viewoffice/' + data.officeId;
                    }
                    location.path(destination);
                });
            };

        }
    });
    mifosX.ng.application.controller('MakeDataTableEntryController', ['$scope', '$location', '$routeParams', 'ResourceFactory', 'dateFilter', '$rootScope', mifosX.controllers.MakeDataTableEntryController]).run(function ($log) {
        $log.info("MakeDataTableEntryController initialized");
    });
}(mifosX.controllers || {}));
