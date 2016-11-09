(function (module) {
    mifosX.controllers = _.extend(module, {
        DataTableEntryController: function (scope, location, routeParams, route, resourceFactory, $modal, dateFilter, $rootScope) {

            if (routeParams.tableName) {
                scope.tableName = routeParams.tableName;
            }
            if (routeParams.entityId) {
                scope.entityId = routeParams.entityId;
            }
            if (routeParams.resourceId) {
                scope.resourceId = routeParams.resourceId;
            }
            scope.formDat = {};
            scope.columnHeaders = [];
            scope.formData = {};
            scope.isViewMode = true;
            scope.tf = "HH:mm";
            scope.client=false;
            scope.group=false;
            scope.center=false;
            scope.office=false;
            scope.savingsaccount=false;
            scope.loanproduct = false;

            scope.showSelect = true; //
            scope.villageName;
            scope.isJournalEntry = false;
            scope.dataTableName = '';

            if(routeParams.tableName =="Address"){
                scope.showSelect=false;
            }

            if(routeParams.mode && routeParams.mode == 'edit'){
                scope.isViewMode = false;
            }

            var reqparams = {datatablename: scope.tableName, entityId: scope.entityId.toString(), genericResultSet: 'true', command: scope.dataTableName};
            if (scope.resourceId) {
                reqparams.resourceId = scope.resourceId;
            }

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
            resourceFactory.DataTablesResource.getTableDetails(reqparams, function (data) {
                for (var i in data.columnHeaders) {
                    if(data.columnHeaders[i].columnName == 'gl_journal_entry_id'){
                        scope.isJournalEntry = true;
                        reqparams.command = 'acc_gl_journal_entry';
                    }
                    if (data.columnHeaders[i].columnCode) {
                        //logic for display codeValue instead of codeId in view datatable details
                        for (var j in data.columnHeaders[i].columnValues) {
                            if(data.columnHeaders[i].columnDisplayType=='CODELOOKUP'){
                                if (data.data[0].row[i] == data.columnHeaders[i].columnValues[j].id) {
                                    data.columnHeaders[i].value = data.columnHeaders[i].columnValues[j].value;
                                }
                            } else if(data.columnHeaders[i].columnDisplayType=='CODEVALUE'){
                                if (data.data[0].row[i] == data.columnHeaders[i].columnValues[j].id) {
                                    data.columnHeaders[i].value = data.columnHeaders[i].columnValues[j].value;
                                }
                            }
                        }
                    } else {
                        data.columnHeaders[i].value = data.data[0].row[i];
                    }
                }
                scope.columnHeaders = data.columnHeaders;
                if(routeParams.mode && routeParams.mode == 'edit'){
                    scope.editDatatableEntry();
                }
            });


            // this function fetch all data of particular village id and assign new value to column name of address table

            scope.changeVillage = function(id) {
                scope.villageId = id.id;
                scope.villageName = id.value;
                if (scope.tableName == "Address") {
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
            };


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

            scope.editDatatableEntry = function () {
                scope.isViewMode = false;
                var colName = scope.columnHeaders[0].columnName;
                if (colName == 'id') {
                    scope.columnHeaders.splice(0, 1);
                }
                colName = scope.columnHeaders[0].columnName;
                if(colName == 'gl_journal_entry_id'){
                    scope.dataTableName = 'acc_gl_journal_entry';
                }
                if (colName == 'client_id' || colName == 'office_id' || colName == 'group_id' || colName == 'center_id' || colName == 'loan_id' || colName == 'savings_account_id' || colName == 'gl_journal_entry_id') {
                    scope.columnHeaders.splice(0, 1);
                    scope.isCenter = colName == 'center_id' ? true : false;
                }

                for (var i in scope.columnHeaders) {

                    if (scope.columnHeaders[i].columnDisplayType == 'DATE') {
                        scope.formDat[scope.columnHeaders[i].columnName] = scope.columnHeaders[i].value;
                    } else if (scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                        scope.formDat[scope.columnHeaders[i].columnName] = {};
                        if(scope.columnHeaders[i].value != null) {
                            scope.formDat[scope.columnHeaders[i].columnName] = {
                                date: dateFilter(new Date(scope.columnHeaders[i].value), scope.df),
                                time: dateFilter(new Date(scope.columnHeaders[i].value), scope.tf)
                            };
                        }
                    } else {
                        scope.formData[scope.columnHeaders[i].columnName] = scope.columnHeaders[i].value;
                    }
                    if (scope.columnHeaders[i].columnCode) {
                        for (var j in scope.columnHeaders[i].columnValues) {
                            if (scope.columnHeaders[i].value == scope.columnHeaders[i].columnValues[j].value) {
                                if(scope.columnHeaders[i].columnDisplayType=='CODELOOKUP'){
                                    scope.formData[scope.columnHeaders[i].columnName] = scope.columnHeaders[i].columnValues[j].id;
                                } else if(scope.columnHeaders[i].columnDisplayType=='CODEVALUE'){
                                    scope.formData[scope.columnHeaders[i].columnName] = scope.columnHeaders[i].columnValues[j].value;
                                }
                            }
                        }
                    }
                }
            };
            scope.deleteDatatableEntry = function () {
                $modal.open({
                    templateUrl: 'deletedatatable.html',
                    controller: DatatableDeleteCtrl
                });
            };
            var DatatableDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.DataTablesResource.delete(reqparams, {}, function (data) {
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
                        $modalInstance.close('delete');
                        location.path(destination);
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.backButton = function () {
                    window.history.back();
            };

            scope.cancel = function () {
                if(routeParams.mode){
                    window.history.back();
                } else{
                    route.reload();
                }

            };

            scope.submit = function () {
                if(scope.showSelect==false){
                    for(var i in scope.columnHeaders){
                        if(scope.columnHeaders [i].columnName == "Village Name"){
                            this.formData[scope.columnHeaders[i].columnName] = scope.villageName;
                        }
                    }
                }
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.dateTimeFormat();
                for (var i = 0; i < scope.columnHeaders.length; i++) {
                    if (!_.contains(_.keys(this.formData), scope.columnHeaders[i].columnName)) {
                        this.formData[scope.columnHeaders[i].columnName] = "";
                    }
                    if (scope.columnHeaders[i].columnDisplayType == 'DATE') {
                        this.formData[scope.columnHeaders[i].columnName] = dateFilter(this.formDat[scope.columnHeaders[i].columnName], this.formData.dateFormat);
                    } else if(scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                        this.formData[scope.columnHeaders[i].columnName] = dateFilter(this.formDat[scope.columnHeaders[i].columnName].date, scope.df) + " " +
                        dateFilter(this.formDat[scope.columnHeaders[i].columnName].time, scope.tf);
                    }
                }
                resourceFactory.DataTablesResource.update(reqparams, this.formData, function (data) {
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
                    } else if (scope.isJournalEntry) {
                        destination = '/viewtransactions/' + scope.entityId.toString();
                    } else if (data.officeId) {
                        destination = '/viewoffice/' + data.officeId;
                    }
                    location.path(destination);
                });
            };

        }
    });
    mifosX.ng.application.controller('DataTableEntryController', ['$scope', '$location', '$routeParams', '$route', 'ResourceFactory', '$modal', 'dateFilter','$rootScope', mifosX.controllers.DataTableEntryController]).run(function ($log) {
        $log.info("DataTableEntryController initialized");
    });
}(mifosX.controllers || {}));
