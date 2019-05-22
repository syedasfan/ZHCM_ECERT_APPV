/*global history */
sap.ui.define([
	"zhcm/ecert/appv/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/GroupHeaderListItem",
	"sap/ui/Device"
], function(BaseController, JSONModel, Filter, FilterOperator, GroupHeaderListItem, Device) {
	"use strict";
	return BaseController.extend("zhcm.ecert.appv.controller.Master", {
		//	formatter: formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
		 * @public
		 */
		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("master").attachMatched(this._onObjectMatched, this);
			this.filterArr = [];
				this._readMaster();
		},
		_onObjectMatched: function(oEvent) {
			if (oEvent.getParameter("name") !== "master") {
				return;
			} else {
				
				
				//	this.byId("tb1").getParent().setVisible(false);
				var oModel = new JSONModel();
				
				if(!window.history.status){
					this._readMaster();
					
					debugger;
				}
			
				delete window.history.status;
				/*	oModel.loadData(jQuery.sap.getModulePath("zhcm.ecert.appv", "/model/EmployeeListSet.json"), "", false);*/
				//	oModel.loadData("model/EmployeeListSet.json", "", false);
				/*oModel.getData().results.forEach(function (obj) {
					obj.PayPeriodStartDate = new Date(obj.PayPeriodStartDate);
					obj.PayPeriodEndDate = new Date(obj.PayPeriodEndDate);
				});
				this.byId("list").setModel(oModel,"alMaster");*/
			}
		},
		handleRefresh:function(){
			this.getOwnerComponent().getModel().read("/EmployeeListSet", {
				success: this.empDataSuccess.bind(this),
				error: this.empDataError.bind(this)
			});
				this.byId("pullToRefresh").hide();
		},
		_readMaster: function() {
			this.byId("list").attachEventOnce("updateFinished", function(e) {
				this.onUpdateFinished(e);
			}.bind(this));
			this.getOwnerComponent().getModel().read("/EmployeeListSet", {
				success: this.empDataSuccess.bind(this),
				error: this.empDataError.bind(this)
			});
		},
		empDataSuccess: function(oData, oResponse) {
			var jsonMod = new sap.ui.model.json.JSONModel();
			oData.results.forEach(function(obj) {

				obj.PayPeriodStartDate = new Date(obj.PayPeriodStartDate);
				obj.PayPeriodEndDate = new Date(obj.PayPeriodEndDate);
				obj.CertifiedDate = new Date(obj.CertifiedDate);

			});
			this.byId("list").data({
				"result": oData
			});
			jsonMod.setData(oData);
			this.byId("list").setModel(jsonMod, "alMaster");
			this.byId("page").setTitle("Employee List (" + oData.results.length + ")");
			this._onCountCheck(oData.results);

		},
		_onCountCheck: function(data) {
			this.filterArr= [];
			var finArr = [];
			var finobj = {
				"status": "",
				"count": ""
			};
			var certified = data.filter(function(el) {
				return el.IsCertified == 'C';
			});
			if(certified.length > 0){
				finobj.status = "Certified";
				this.filterArr.push(finobj);
			}
		//	finobj.count = certified.length;
			
			var finobj = {
				"status": "",
				"count": ""
			};
			var rejected = data.filter(function(el) {
				return el.IsCertified == 'D';
			});
			if(rejected.length > 0){
				finobj.status = "Declined";
				this.filterArr.push(finobj);
			}
		//	finobj.status = "Declined";
		//	finobj.count = rejected.length;
		//	this.filterArr.push(finobj);
			var finobj = {
				"status": "",
				"count": ""
			};
			var noAct = data.filter(function(el) {
				return el.IsCertified == '';
			});
			if(noAct.length > 0){
				finobj.status = "No Action";
					this.filterArr.push(finobj);
			}
			//finobj.status = "No Action";
		//	finobj.count = noAct.length;
		
			var finobj = {
				"status": "",
				"count": ""
			};

			this.getView().setModel(new JSONModel({
				filteredBy: "All"
			}), "FilterModel");
		},
		onSelect: function(e) {
			var jsonMod = new sap.ui.model.json.JSONModel();
			var filArr = [];
			var status = e.getSource().getBindingContext().getObject().status;
			var data = this.byId("list").data().result;

					if (status == "Declined") {
					
						var filArr = data.results.filter(function(el) {
							return el.IsCertified === 'D';
						});
					}
					if (status == "No Action") {
					
						var filArr = data.results.filter(function(el) {
							return el.IsCertified == '';
						});
					}
					if (status == "Certified") {
					
						var filArr = data.results.filter(function(el) {
							return el.IsCertified == 'C';
						});
					}
					this.getView().setModel(new JSONModel({
					filteredBy: status
				}), "FilterModel");
				jsonMod.setData({
					"results": filArr
				});
				this.byId("list").setModel(jsonMod, "alMaster");
			/*if (e.getSource().getSelectedItem().length > 0) {
				var filArr = [];

				var oItem = e.getSource().getSelectedItem();
				var cer = [];
				rej = [];
				noAct = [];
				var cert = "",
					reje = "",
					noActi = "";
				for (var i = 0; i < oItem.length; i++) {
					var locobj = oItem[i].getBindingContext().getObject();
					var data = this.byId("list").data().result;

					if (locobj.status == "Declined") {
						reje = "Declined";
						var rej = data.results.filter(function(el) {
							return el.IsCertified === 'D';
						});
					}
					if (locobj.status == "No Action") {
						noActi = "No Action";
						var noAct = data.results.filter(function(el) {
							return el.IsCertified == '';
						});
					}
					if (locobj.status == "Certified") {
						cert = "Certified";
						var cer = data.results.filter(function(el) {
							return el.IsCertified == 'C';
						});
					}

				}
				var filArr1 = [];
				filArr = filArr1.concat(noAct).concat(cer).concat(rej);
				jsonMod.setData({
					"results": filArr
				});
				this.byId("list").setModel(jsonMod, "alMaster");
			
			
			  var selectedFilter;
            if(cert !="" && reje !="" && noActi !="" ){
                 selectedFilter = cert+","+reje+","+noActi;
            }
             else if(cert !="" && reje !=""  ){
                 selectedFilter = cert+","+reje;
            }
            else if(reje !="" && noActi !=""  ){
                 selectedFilter = reje+","+noActi;
            }
              else if(cert !="" && noActi !=""  ){
                 selectedFilter = cert+","+noActi;
            }else{
              selectedFilter = cert+" "+reje+" "+noActi;    
            }
				this.getView().setModel(new JSONModel({
					filteredBy: selectedFilter
				}), "FilterModel");
			} else {

				jsonMod.setData(this.byId("list").data().result);
				this.byId("list").setModel(jsonMod, "alMaster");
				var selectedFilter = "All";
				this.getView().setModel(new JSONModel({
					filteredBy: selectedFilter
				}), "FilterModel");
			}*/
			var bReplace = !Device.system.phone;
			if(bReplace){
				if (filArr.length>0){
					this.byId("list").getItems()[0].setSelected(true);
				var oBinding = this.byId("list").getItems()[0];
			
				this.getRouter().navTo("object", {
					Pernr: oBinding.getBindingContext("alMaster").getProperty("Pernr"),
					PayrollPeriod: oBinding.getBindingContext("alMaster").getProperty("PayrollPeriod"),
					PayrollYear: oBinding.getBindingContext("alMaster").getProperty("PayrollYear")
				}, bReplace);
				this.byId("page").setTitle("Employee List(" + jsonMod.getData().results.length + ")");
				} else {
					
						this.getRouter().navTo("NotFound");
				this.byId("page").setTitle("Employee List(0)");
				}
			}
			else{
					this.byId("page").setTitle("Employee List(" + filArr.length + ")");
			}
			
				this.filterPopOver.close();
				
		/*	if (this.byId("list").getItems().length === 0) {
				this.getRouter().navTo("NotFound");
				this.byId("page").setTitle("Employee List(0)");
			} else {
			this.byId("list").getItems()[0].setSelected(true);
				var oBinding = this.byId("list").getItems()[0];
				var bReplace = !Device.system.phone;
				this.getRouter().navTo("object", {
					Pernr: oBinding.getBindingContext("alMaster").getProperty("Pernr"),
					PayrollPeriod: oBinding.getBindingContext("alMaster").getProperty("PayrollPeriod"),
					PayrollYear: oBinding.getBindingContext("alMaster").getProperty("PayrollYear")
				}, bReplace);
				this.byId("page").setTitle("Employee List(" + jsonMod.getData().results.length + ")");

			}
*/
		},
		onAfterPopoverClose:function(oEvent){
		var listId =oEvent.oSource.mAggregations.content[0];	
		this.onSelect(listId);
		},
		onFinished: function() {
			this.filterPopOver.getContent()[0].getItems().forEach(function(i) {
				var oContext = i.getBindingContext().getObject();
				var oCB = i.$().find('.sapMCb');
				var oCheckBox = sap.ui.getCore().byId(oCB.attr('id'));
				if (oContext.status == "All") {
					oCheckBox.setVisible(false);
				}
			});
		},
	/*	getHeaderFooterOptions: function() {
		var s = this;
		var objHdrFtr = {
		
			onRefresh: jQuery.proxy(function(searchField, fnRefreshCompleted) { //pull to refresh
				this._fnRefreshCompleted = fnRefreshCompleted;
				this._searchField = searchField;
				this._isMasterRefresh = true;
				s._initialize();
			}, s)
		};
		objHdrFtr.bSuppressBookmarkButton = true;
		return objHdrFtr;
	},*/
		onFilterSelect: function(e) {
			var selectedFilter = e.oSource.getBindingContext().getObject().status;
			this.getView().setModel(new JSONModel({
				filteredBy: selectedFilter
			}), "FilterModel");
		},
		
		onOpenViewSettings: function(e) {
		
			if (!this.filterPopOver) {
				this.filterPopOver = sap.ui.xmlfragment("zhcm.ecert.appv.view.Fragments.Filter", this);
				this.getView().addDependent(this.filterPopOver);
				this.filterPopOver.getContent()[0].attachEventOnce("updateFinished", function(e) {
					this.onFinished();
				}.bind(this));
			
			//	this.filterPopOver.attachAfterOpen(function() {
				//	this.disablePointerEvents();
			//	}, this);
			//	this.filterPopOver.attachAfterClose(function() {
			//		this.enablePointerEvents();
		//		}, this);
			}
			    
				var jsonMod = new sap.ui.model.json.JSONModel(this.filterArr);
				this.filterPopOver.setModel(jsonMod);

			this.filterPopOver.openBy(e.getSource());

		},
		empDataError: function(oResponse) {
			debugger;
		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * After list data is available, this handler method updates the
		 * master list counter and hides the pull to refresh control, if
		 * necessary.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function(oEvent) {
			if (oEvent.getSource().getMode() == "None") {
				return;
			}
			var oItem = oEvent.getSource().getItems()[0];
			oItem.setSelected(true);
			/*	var firstItem = this.getView().byId("list").getItems()[0]; 
				this.getView().byId("list").setSelectedItem(firstItem,true);*/
			sap.ui.getCore().setModel(oItem.getBindingContext("alMaster").getObject(), "mastModel");
			this.getRouter().navTo("object", {
				Pernr: oItem.getBindingContext("alMaster").getProperty("Pernr"),
				PayrollPeriod: oItem.getBindingContext("alMaster").getProperty("PayrollPeriod"),
				PayrollYear: oItem.getBindingContext("alMaster").getProperty("PayrollYear")
			});
		},

		/**
		 * Event handler for the master search field. Applies current
		 * filter value and triggers a new search. If the search field's
		 * 'refresh' button has been pressed, no new search is triggered
		 * and the list binding is refresh instead.
		 * @param {sap.ui.base.Event} oEvent the search event
		 * @public
		 */
		onSearch: function(oEvent) {
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("EmployeeName", FilterOperator.StartsWith, sQuery));
			}
			// filter binding

			var oList = this.byId("list");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
			var bReplace = !Device.system.phone;
			if(bReplace){
			if (oBinding.getLength() == 0) {
				this.getRouter().navTo("NotFound");
				//	this.getRouter().getTargets().display("notFound");
			} else {
				//	this.getRouter().getTargets()._oLastDisplayedTarget = null;
				var bReplace = !Device.system.phone;
				/*	sap.ui.getCore().setModel(oBinding._getContexts("alMaster")[0].getObject(),"mastModel");*/
				/*this.getRouter().navTo("object",{
						objectId: oBinding._getContexts("alMaster")[0].getProperty("Pernr")
				}, bReplace);*/
				this.getRouter().navTo("object", {
					Pernr: oBinding._getContexts()[0].getProperty("Pernr"),
					PayrollPeriod: oBinding._getContexts()[0].getProperty("PayrollPeriod"),
					PayrollYear: oBinding._getContexts()[0].getProperty("PayrollYear")
				}, bReplace);
				oList.getItems()[0].setSelected(true);
			}	
			}
			
			this.byId("page").setTitle("Employee List (" + oBinding.getLength() + ")");
		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		
		handleChange: function(oEvent) {

			var oCustomFilter = this._oDialog.getFilterItems()[0];
			oCustomFilter.setFilterCount(1);
			oCustomFilter.setSelected(true);

			// Set the custom filter's count and selected properties
			// if the value has changed
			/*if (oNewValue !== this.filterPreviousValue) {
				oCustomFilter.setFilterCount(1);
				oCustomFilter.setSelected(true);
			} else {
				oCustomFilter.setFilterCount(0);
				oCustomFilter.setSelected(false);
			}*/

		},
		handleResetFilters: function(oEvent) {

			this._oDialog.getFilterItems()[0]._control._aElements[1].setSelectedKey("");
			//	this._oDialog.getFilterItems()[0]._control._aElements[1].removeSelection();
			this._oDialog.getFilterItems()[0]._control._aElements[3].setValue("");
			var oCustomFilter = this._oDialog.getFilterItems()[0];

			oCustomFilter.setFilterCount(0);
			oCustomFilter.setSelected(false);
			/*	var oCustomFilter = this._oDialog.getFilterItems()[0];
				var oSlider = oCustomFilter.getCustomControl();
				oSlider.setValue("");
				oCustomFilter.setFilterCount(0);
				oCustomFilter.setSelected(false);*/
			///////
		},
		handleConfirm: function(oEvent) {

			/*	var rageSel = this._oDialog.getFilterItems()[0].getCustomControl().getValue();
				var splDate = rageSel.split('-');
				var dateFrom = new Date(splDate[0]);
				var dateTo = new Date(splDate[1]);*/
			var FilterArr = [];
			var filterText = "Filtered  By: ";
			var r = "",
				c = "",
				n = "";
			this.byId("filterBarLabel").getParent().setVisible(false);
			if (oEvent.getParameters().filterKeys.Rej != undefined) {
				FilterArr.push(new sap.ui.model.Filter("IsCertified", sap.ui.model.FilterOperator.EQ, "D"));
				var r = "Declined";
				this.byId("filterBarLabel").getParent().setVisible(true);
			}
			if (oEvent.getParameters().filterKeys.Cer != undefined) {
				FilterArr.push(new sap.ui.model.Filter("IsCertified", sap.ui.model.FilterOperator.EQ, "C"));
				var c = "Certified";
				this.byId("filterBarLabel").getParent().setVisible(true);
			}
			if (oEvent.getParameters().filterKeys.Nac != undefined) {
				FilterArr.push(new sap.ui.model.Filter("IsCertified", sap.ui.model.FilterOperator.EQ, ""));
				var n = "No Action";
				this.byId("filterBarLabel").getParent().setVisible(true);
			}
			this.byId("filterBarLabel").setText(filterText + r + c + n);
			var oList = this.byId("list");
			/*var firstItem = this.getView().byId("list").getItems()[0]; 
			this.getView().byId("list").setSelectedItem(firstItem,true); */
			var oBinding = oList.getBinding("items");
			oBinding.filter(FilterArr);
			if (oBinding.getLength() == 0) {
				this.getRouter().navTo("NotFound");
				//this.getRouter().getTargets().display("notFound");
			} else {
				//	this.getRouter().getTargets()._oLastDisplayedTarget = null;
				var bReplace = !Device.system.phone;
				sap.ui.getCore().setModel(oBinding._getContexts()[0].getObject(), "mastModel");
				this.getRouter().navTo("object", {
					Pernr: oBinding._getContexts()[0].getProperty("Pernr"),
					PayrollPeriod: oBinding._getContexts()[0].getProperty("PayrollPeriod"),
					PayrollYear: oBinding._getContexts()[0].getProperty("PayrollYear")
				}, bReplace);
				oList.getItems()[0].setSelected(true);
				/*this.getRouter().navTo("object",{
						Pernr: oBinding._getContexts()[0].getProperty("Pernr")
				}, bReplace);*/
			}
			this.byId("page").setTitle("Employee List (" + oBinding.getLength() + ")");

		},

	
		onConfirmViewSettingsDialog: function(oEvent) {

		},

		/**
		 * Event handler for the list selection event
		 * @param {sap.ui.base.Event} oEvent the list selectionChange event
		 * @public
		 */
		onSelectionChange: function(oEvent) {
			this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
		},

		
	
	
		onNavBack: function() {

			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				target: {
					semanticObject: "#"
				}
			});
		
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		_showDetail: function(oItem) {
			var bReplace = !Device.system.phone;
			sap.ui.getCore().setModel(oItem.getBindingContext("alMaster").getObject(), "mastModel");
			this.getRouter().navTo("object", {
				Pernr: oItem.getBindingContext("alMaster").getProperty("Pernr"),
				PayrollPeriod: oItem.getBindingContext("alMaster").getProperty("PayrollPeriod"),
				PayrollYear: oItem.getBindingContext("alMaster").getProperty("PayrollYear")
			}, bReplace);
		},
	bReset : function(e){
		
		var bReplace = !Device.system.phone;
             var jsonMod1 =new sap.ui.model.json.JSONModel(this.filterArr);
            //  this.filterPopOver.setModel(jsonMod1);    
              var jsonMod =new sap.ui.model.json.JSONModel();
              jsonMod.setData(this.byId("list").data().result);                 
                 this.byId("list").setModel(jsonMod,"alMaster");
                 this.byId("searchField").setValue("");
                 
                var selectedFilter = "All";
             this.getView().setModel(new JSONModel({
                    filteredBy: selectedFilter
                }), "FilterModel");
                if(bReplace){
                 this._showDetail(this.byId("list").getItems()[0]);
                }
               
                this.byId("list").getItems()[0].setSelected(true);
                this.byId("page").setTitle("Employee List (" + this.byId("list").data().result.results.length + ")");
               // this.filterPopOver.close();         
        
		
		
	},
		 onReset : function(e){
		 	var bReplace = !Device.system.phone;
             var jsonMod1 =new sap.ui.model.json.JSONModel(this.filterArr);
              this.filterPopOver.setModel(jsonMod1);    
              var jsonMod =new sap.ui.model.json.JSONModel();
              jsonMod.setData(this.byId("list").data().result);                 
                 this.byId("list").setModel(jsonMod,"alMaster");
                 this.byId("searchField").setValue("");
                 
                var selectedFilter = "All";
             this.getView().setModel(new JSONModel({
                    filteredBy: selectedFilter
                }), "FilterModel");
                if(bReplace){
                 this._showDetail(this.byId("list").getItems()[0]);
                }
               
                this.byId("list").getItems()[0].setSelected(true);
                this.byId("page").setTitle("Employee List (" + this.byId("list").data().result.results.length + ")");
                this.filterPopOver.close();         
        }
             	

	});

});