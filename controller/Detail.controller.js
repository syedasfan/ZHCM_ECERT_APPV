/*global location */
sap.ui.define([
	"zhcm/ecert/appv/controller/BaseController",
	"sap/ui/model/json/JSONModel", "sap/m/MessageBox", "zhcm/ecert/appv/control/ObjectAttributeCustom"
], function(BaseController, JSONModel, MessageBox, ObjectAttributeCustom) {
	"use strict";

	return BaseController.extend("zhcm.ecert.appv.controller.Detail", {

		//	formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("object").attachMatched(this._onObjectDetMatched, this);
			//this._onObjectDetMatched();

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function() {
			/*
							var oViewModel = this.getModel("detailView");

							sap.m.URLHelper.triggerEmail(
								null,
								oViewModel.getProperty("/shareSendEmailSubject"),
								oViewModel.getProperty("/shareSendEmailMessage")
							);
						*/
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectDetMatched: function(oEvent) {
			//	var that = this;
			/*	var sObjectId =  oEvent.getParameter("arguments").objectId;
				var sDateString =  oEvent.getParameter("arguments").dateString;
				var oModel =new JSONModel();
				oModel.loadData("model/EmployeeInfoSet.json", "", false);
				oModel.getData().IList.forEach(function(obj){
					if(sObjectId == obj.Pernr){
						var oModData = new JSONModel();
						oModData.setData(obj);
						that.byId("FormChange480_Trial").setModel(oModData);
						that.byId("objectHeader").setTitle(obj.EmployeeName);
						that.byId("objAttribute").setText(sDateString);
					}
				});*/
			if (oEvent.getParameter("name") !== "object") {
				return;
			} else {
				this.byId("page").mAggregations.customHeader.getContentRight()[0].setIcon("sap-icon://feeder-arrow");
				this.busy = new sap.m.BusyDialog({
					text: 'Processing Detail Data...'
				});
				this.busy.open();
				var sPernr = oEvent.getParameter("arguments").Pernr;
				var sPayrollPeriod = oEvent.getParameter("arguments").PayrollPeriod;
				var sPayrollYear = oEvent.getParameter("arguments").PayrollYear;
				this._readHeaderDetail(sPernr, sPayrollPeriod, sPayrollYear);
				this._oPanelExpnd(true);
				var oPage = this.getView().byId("page");     //Get Hold of page
				oPage.scrollTo(0,0); 
				/*	this._readTimeInfoSet(sPernr, sPayrollPeriod, sPayrollYear);
					this._readWorkSchelSet(sPernr, sPayrollPeriod, sPayrollYear);
					this._readSumInfoSet(sPernr, sPayrollPeriod, sPayrollYear);
					this._readDefaultCostSet(sPernr, sPayrollPeriod, sPayrollYear);*/

			}
			/*	this.getModel().metadataLoaded().then( function() {
					var sObjectPath = this.getModel().createKey("Categories", {
						CategoryID :  sObjectId
					});
					this._bindView("/" + sObjectPath);
				}.bind(this));*/
		},
		_oPanelExpnd: function(parm) {
			this.byId("idtimesheet").setExpanded(parm);
			this.byId("idtimesheetAdjInfo").setExpanded(parm);
			this.byId("idworkSchdule").getParent().setExpanded(parm);
			this.byId("idSummary").getParent().setExpanded(parm);
			this.byId("idDefCosting").getParent().setExpanded(parm);
		},
		onClickPanelClose: function(e) {
			if (e.getSource().getIcon().indexOf("feeder-arrow") !== -1) {
				this._oPanelExpnd(false);
				e.getSource().setIcon("sap-icon://navigation-down-arrow");
			} else {
				this._oPanelExpnd(true);
				e.getSource().setIcon("sap-icon://feeder-arrow");
			}

		},

		_readHeaderDetail: function(Pernr, PayrollPeriod, PayrollYear) {

			var filter = [];
			filter.push(new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, Pernr));
			filter.push(new sap.ui.model.Filter("PayrollPeriod", sap.ui.model.FilterOperator.EQ, PayrollPeriod));
			filter.push(new sap.ui.model.Filter("PayrollYear", sap.ui.model.FilterOperator.EQ, PayrollYear));
			this.getOwnerComponent().getModel().read("/EmployeeInfoSet", {
				filters: filter,
				success: this.empDataSuccess.bind(this),
				error: this.empDataError.bind(this)
			});
		},
		empDataSuccess: function(oData, oResponse) {

			var jsonMod = new sap.ui.model.json.JSONModel();
			jsonMod.setData(oData);
			this.byId("idObjList").setModel(jsonMod, "alMaster");
			var sPernr = oData.results[0].Pernr;
			var sPayrollPeriod = oData.results[0].PayrollPeriod;
			var sPayrollYear = oData.results[0].PayrollYear;
			this._readTimeInfoSet(sPernr, sPayrollPeriod, sPayrollYear);
			this._readWorkSchelSet(sPernr, sPayrollPeriod, sPayrollYear);
			this._readSumInfoSet(sPernr, sPayrollPeriod, sPayrollYear);
			this._readDefaultCostSet(sPernr, sPayrollPeriod, sPayrollYear);
			this.busy.close();
		},

		empDataError: function(oResponse) {

		},

		_readTimeInfoSet: function(Pernr, PayrollPeriod, PayrollYear) {

			var filter = [];

			filter.push(new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, Pernr));
			filter.push(new sap.ui.model.Filter("PayrollPeriod", sap.ui.model.FilterOperator.EQ, PayrollPeriod));
			filter.push(new sap.ui.model.Filter("PayrollYear", sap.ui.model.FilterOperator.EQ, PayrollYear));
			this.getOwnerComponent().getModel().read("/TimesheetInfoSet", {
				filters: filter,
				success: this.TimeDataSuccess.bind(this),
				error: this.TimeDataError.bind(this)
			});
			this.readAdj(Pernr, PayrollPeriod, PayrollYear);
		},

		TimeDataSuccess: function(oData, oResponse) {

			var jsonMod = new sap.ui.model.json.JSONModel();
			this.setTimeAndAttendance(oData.results);
		/*for (var i = 0; i < oData.results.length; i++) {
				oData.results[i].LeaveShort = oData.results[i].EmployeeComments;
				oData.results[i].showLinkText = "Show More";
				if (oData.results[i].EmployeeComments.length > 1) {
					oData.results[i].LeaveShort = oData.results[i].EmployeeComments.substring(0, 1).concat('...');
				}
			}*/	
			jsonMod.setData(oData);
			/*	this.byId("idTimesheet").setModel(jsonMod, "alTimeSheet");
				this.byId("idTimesheet").getModel("alTimeSheet").refresh();*/

		},
		TimeDataError: function(oResponse) {
			var jsonMod = new sap.ui.model.json.JSONModel([]);
			var s = this;
			s.byId("idtimesheet").removeAllContent();
		/*	s.byId("idtimesheet").addContent(s.setCommonTimeList(datas, true));*/
			var oList = new sap.m.List({});
			oList.setModel(jsonMod);
			s.byId("idtimesheet").addContent(oList);
			
			/*	this.byId("idTimesheet").setModel(jsonMod, "alTimeSheet");*/
		},
		readAdj: function(Pernr, PayrollPeriod, PayrollYear) {

			var filter = [];
			filter.push(new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, Pernr));
			filter.push(new sap.ui.model.Filter("PayrollPeriod", sap.ui.model.FilterOperator.EQ, PayrollPeriod));
			filter.push(new sap.ui.model.Filter("PayrollYear", sap.ui.model.FilterOperator.EQ, PayrollYear));
			this.getOwnerComponent().getModel().read("/TimesheetAdjInfoSet", {
				filters: filter,
				success: this.TimeAdjDataSuccess.bind(this),
				error: this.TimeAdjDataError.bind(this)
			});

		},
		TimeAdjDataSuccess: function(oData, oResponse) {

			var jsonMod = new sap.ui.model.json.JSONModel();
			this.setAdjustedTimeAndAttendance(oData.results);
			jsonMod.setData(oData);
			/*	this.byId("idTimesheet2").setModel(jsonMod, "alTimeSheet2");
				this.byId("idTimesheet2").getModel("alTimeSheet2").refresh();*/

			if (oData.results.length > 0) {
				this.byId("idtimesheetAdjInfo").setVisible(true);
			} else {
				this.byId("idtimesheetAdjInfo").setVisible(false);
				/*	this.byId("idTimesheet2").getParent().setVisible(false);*/
			}
		},
		TimeAdjDataError: function(oResponse) {
			var jsonMod = new sap.ui.model.json.JSONModel();
			jsonMod.setData({
				"results": []
			});
			this.byId("idtimesheetAdjInfo").setVisible(false);
			/*	this.byId("idTimesheet2").setModel(jsonMod, "alTimeSheet2");
				this.byId("idTimesheet2").getParent().setVisible(false);*/
		},
		_readSumInfoSet: function(Pernr, PayrollPeriod, PayrollYear) {

			var filter = [];
			filter.push(new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, Pernr));
			filter.push(new sap.ui.model.Filter("PayrollPeriod", sap.ui.model.FilterOperator.EQ, PayrollPeriod));
			filter.push(new sap.ui.model.Filter("PayrollYear", sap.ui.model.FilterOperator.EQ, PayrollYear));

			/*filter.push(new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, '00289636'));
			filter.push(new sap.ui.model.Filter("PayrollPeriod", sap.ui.model.FilterOperator.EQ, '01'));
			filter.push(new sap.ui.model.Filter("PayrollYear", sap.ui.model.FilterOperator.EQ, '2016'));*/
			this.getOwnerComponent().getModel().read("/SummaryInfoSet", {
				filters: filter,
				success: this.SumDataSuccess.bind(this),
				error: this.SumDataError.bind(this)
			});
		},
		SumDataSuccess: function(oData, oResponse) {

			var jsonMod = new sap.ui.model.json.JSONModel();
			jsonMod.setData(oData);
			this.byId("idSummary").setModel(jsonMod, "alSModule");

		},
		SumDataError: function(oResponse) {
			var jsonMod = new sap.ui.model.json.JSONModel();
			jsonMod.setData({
				"results": []
			});
			this.byId("idSummary").setModel(jsonMod, "alSModule");
		},

		_readDefaultCostSet: function(Pernr, PayrollPeriod, PayrollYear) {

			var filter = [];

			filter.push(new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, Pernr));
			filter.push(new sap.ui.model.Filter("PayrollPeriod", sap.ui.model.FilterOperator.EQ, PayrollPeriod));
			filter.push(new sap.ui.model.Filter("PayrollYear", sap.ui.model.FilterOperator.EQ, PayrollYear));
			this.getOwnerComponent().getModel().read("/DefaultCostingInfoSet", {
				filters: filter,
				success: this.DefCostDataSuccess.bind(this),
				error: this.DefCostDataError.bind(this)
			});
		},

		DefCostDataSuccess: function(oData, oResponse) {

			var jsonMod = new sap.ui.model.json.JSONModel();
			jsonMod.setData(oData);

			this.byId("idDefCosting").setModel(jsonMod, "alDfCost");
			this.byId("idDefCosting").getParent().setModel(jsonMod, "alDfCost");

		},
		DefCostDataError: function(oResponse) {
			var jsonMod = new sap.ui.model.json.JSONModel();
			jsonMod.setData({
				"results": []
			});
			this.byId("idDefCosting").setModel(jsonMod, "alDfCost");
		},

		_readWorkSchelSet: function(Pernr, PayrollPeriod, PayrollYear) {

			var filter = [];
			filter.push(new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, Pernr));
			filter.push(new sap.ui.model.Filter("PayrollPeriod", sap.ui.model.FilterOperator.EQ, PayrollPeriod));
			filter.push(new sap.ui.model.Filter("PayrollYear", sap.ui.model.FilterOperator.EQ, PayrollYear));
			this.getOwnerComponent().getModel().read("/WorkScheduleInfoSet", {
				filters: filter,
				success: this.WorkDataSuccess.bind(this),
				error: this.WorkDataError.bind(this)
			});
		},
		WorkDataSuccess: function(oData, oResponse) {

			var jsonMod = new sap.ui.model.json.JSONModel();
			jsonMod.setData(oData);
			this.byId("idworkSchdule").setModel(jsonMod, "alWModule");
			this.byId("idworkSchdule").getParent().setModel(jsonMod, "alWModule");

		},
		WorkDataError: function(oResponse) {
			var jsonMod = new sap.ui.model.json.JSONModel();
			jsonMod.setData({
				"results": []
			});
			this.byId("idworkSchdule").setModel(jsonMod, "alWModule");
		},

		onArroveButtonPress: function() {

			var obj = this.byId("idObjList").getModel("alMaster");
			debugger;
			var mainobj = {
				"PayPeriodStartDate": obj.getData().results[0].PayPeriodStartDate,
				"Pernr": obj.getData().results[0].Pernr,
				"PayPeriodEndDate": obj.getData().results[0].PayPeriodEndDate,
				"PayrollPeriod": obj.getData().results[0].PayrollPeriod,
				"EmployeeName": obj.getData().results[0].EmployeeName,
				"PayrollYear": obj.getData().results[0].PayrollYear,
				"IsApproved": true,
				"IsRejected": false,
				"RejectNotes": ""
			};
			this.getOwnerComponent().getModel().create("/ApproveRejectHeaderInfoSet", mainobj, {

				success: this.ApproveDataSuccess.bind(this),
				error: this.ApproveDataError.bind(this)
			});

		},
		ApproveDataSuccess: function(oData, oResponse) {
			this.getRouter().navTo("master");
			sap.m.MessageToast.show("Record Approved");
			// sap.m.MessageToast.show(oResponse.data.Status);

			debugger;
		},
		ApproveDataError: function(oResponse) {

			debugger;
		},
		onRejectButtonPress: function() {

			this._getCommentDialog().open();
		},

		_getCommentDialog: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("zhcm.ecert.appv.view.Fragments.comment", this);
			}
			var Jmodel = new sap.ui.model.json.JSONModel();
			Jmodel.setData(this.byId("idObjList").getModel("alMaster").getData());
			this._oDialog.setModel(Jmodel, "alMaster");
			return this._oDialog;
		},
		onOk: function(e) {
			var obj = this.byId("idObjList").getModel("alMaster");
			debugger;
			var mainobj = {
				"PayPeriodStartDate": obj.getData().results[0].PayPeriodStartDate,
				"Pernr": obj.getData().results[0].Pernr,
				"PayPeriodEndDate": obj.getData().results[0].PayPeriodEndDate,
				"PayrollPeriod": obj.getData().results[0].PayrollPeriod,
				"EmployeeName": obj.getData().results[0].EmployeeName,
				"PayrollYear": obj.getData().results[0].PayrollYear,
				"IsApproved": false,
				"IsRejected": true,
				"RejectNotes": e.getSource().getParent().getContent()[2].getValue()
			};
			this.getOwnerComponent().getModel().create("/ApproveRejectHeaderInfoSet", mainobj, {

				success: this.RejectDataSuccess.bind(this),
				error: this.RejectDataError.bind(this)
			});

			this._getCommentDialog().close();
			e.getSource().getParent().getContent()[2].setValue("");
		},
		RejectDataSuccess: function(oData, oResponse) {
			this.getRouter().navTo("master");
			sap.m.MessageToast.show("Record Rejected");
			//sap.m.MessageToast.show(oResponse.data.Status);
			/*ap.m.MessageBox.success(oResponse.data.Status);*/

			debugger;
		},
		RejectDataError: function(oResponse) {
			debugger;
		},
		onCancel: function() {
			this._getCommentDialog().close();
		},

		_bindView: function(sObjectPath) {

		},

		_onBindingChange: function() {

		},

		_onMetadataLoaded: function() {

		},
		onNavBack: function(){
			window.history.go(-1);
			window.history.status = "B";
		debugger;	
		},
		onClickIcon: function(e) {
			var object = e.getSource().data().obj;
			this._getExtCommentDialog().open();
			this._extoDialog.getContent()[1].setValue(object.EmployeeComments);
			this._getExtCommentDialog().data({
				obj: object
			
			});
		},
		_getExtCommentDialog: function() {
			if (!this._extoDialog) {
				this._extoDialog = sap.ui.xmlfragment("zhcm.ecert.appv.view.Fragments.extComment", this);
			}

			return this._extoDialog;
		},
		onEXTCOk: function(e) {
			var obj = e.getSource().getParent().data().obj;
			var newComment = e.getSource().getParent().getContent()[3].getValue();
			var mainObj = {
				"Counter": obj.Counter,
				"Pernr": obj.Pernr,
				"PayrollPeriod": obj.PayrollPeriod,
				"PayrollYear": obj.PayrollYear,
				"Comments": newComment
			};
			 
				this.getOwnerComponent().getModel().create("/EditCommentsSet", mainObj, {
					success: this.CommentDataSuccess.bind(this),
					error: this.CommentDataError.bind(this)
				});
			

			this._getExtCommentDialog().close();
			e.getSource().getParent().getContent()[3].setValue("");

		},
		CommentDataSuccess: function(oData, oResponse) {
			sap.m.MessageToast.show(oResponse.data.Status);
			this._readTimeInfoSet(oResponse.data.Pernr, oResponse.data.PayrollPeriod, oResponse.data.PayrollYear);
			debugger;
		},
		CommentDataError: function(oResponse) {
			debugger;
		},
		onEXTCCancel: function() {
			this._getExtCommentDialog().close();
		},
		onTextSelect: function(e) {
			//	e.oSource.oParent.getItems()[1].setWidth("50rem");
			e.oSource.oParent.getItems()[1].setWrapping(true);
			if (e.oSource.getText() == "Show More") {
				var obj = e.oSource.getParent().getParent().getBindingContext('alTimeSheet').getObject();
				obj.LeaveShort = obj.EmployeeComments;
				obj.showLinkText = "Show Less";
			} else {
				var obj = e.oSource.getParent().getParent().getBindingContext('alTimeSheet').getObject();
				obj.LeaveShort = obj.EmployeeComments.substring(0, 10).concat('...');
				obj.showLinkText = "Show More";
			}
			e.oSource.getParent().getParent().getParent().getModel('alTimeSheet').refresh();
			//e.oSource.setVisible(false);
		},

		setTimeAndAttendance: function(datas) {
			var s = this;
			s.byId("idtimesheet").removeAllContent();
			s.byId("idtimesheet").addContent(s.setCommonTimeList(datas, true));
		},
		setCommonTimeList: function(datas, bool) {
			var s = this;
			var oList = new sap.m.List({});
			for (var i = 0; i < datas.length; i++) {
				var S = new sap.m.ObjectListItem({
					title: datas[i].WorkdayDate,
					number: datas[i].WorkHours,
					numberUnit: "hrs"
				});
				/*	if (datas[i].WorkdayDate) {
						S.setIntro(s.getDayOfWeek(datas[i].WorkdayDate) + " " + s.formatToMMDDYYYY(datas[i].Workdate));
					}*/
				if (datas[i].Operation) {
					S.setFirstStatus(new sap.m.ObjectStatus({
						text: datas[i].Operation,
						state: "Error"
					}));
				}
				if (datas[i].AbsenceType.length > 0) {
					S.addAttribute(new sap.m.ObjectAttribute({
						text: datas[i].AbsenceType
					}));
				}
				if (datas[i].WorkTimes.length > 0) {
					S.addAttribute(new sap.m.ObjectAttribute({
						text: datas[i].WorkTimes
					}));
				}

				/*	if(datas[i].EmployeeComments && datas[i].Counter.length === 0){
						S.addAttribute(new ObjectAttributeCustom({
								text: datas[i].ItComments,
								active: false,
								lineLimit: 100
							}).data({"obj":datas[i]}));	
					}*/
				/*	if(!bool){
						S.addAttribute(new ObjectAttributeCustom({
								text: datas[i].ItComments,
								active: false,
								lineLimit: 100
							}).data({"obj":datas[i]}));
						
					}else*/
				if (datas[i].EmployeeComments.length > 0 && datas[i].Counter.length > 0 && bool) {
					S.addAttribute(new ObjectAttributeCustom({

						text: datas[i].EmployeeComments,
						active: false,
						iconActive: true,
						lineLimit: 100,
						icon: "sap-icon://edit",

						iconPress: jQuery.proxy(function(e) {
							s.onClickIcon(e);
						})
					}).data({
						"obj": datas[i]
					}));
				} else {
					S.addAttribute(new ObjectAttributeCustom({
						text: datas[i].EmployeeComments,
						active: false,
						iconActive: false,
						lineLimit: 100
					}).data({
						"obj": datas[i]
					}));
				}

				if (datas[i].ItComments.length > 0) {
				/*	S.addAttribute(new sap.m.ObjectAttribute({
						text: datas[i].ItComments
					}));*/
					S.addAttribute(new ObjectAttributeCustom({
							text: datas[i].ItComments,
							active: false,
							lineLimit: 100
						}).data({"obj":datas[i]}));
				}

					//if (datas[i].Employeecomments) {
					//DH: if SYSTEM or if its an adjusted time dont allow employee to edit commment
					/*	if (!bool || datas[i].Counter.length === 0) {
									if (datas[i].EmployeeComments) {
										S.addAttribute(new ObjectAttributeCustom({
											text: datas[i].EmployeeComments,
											active: false,
											lineLimit: 100
										}).data({"obj":datas[i]}));
									}
								} else {
									S.addAttribute(new ObjectAttributeCustom({
										
										text: datas[i].EmployeeComments,
										active: false,
										iconActive: true,
										lineLimit: 100,
										icon: "sap-icon://edit",
										customData: [{
												key: "counter",
												value: datas[i].Counter
										}, {
												key: "type",
											value: datas[i].Attendancetype
									},
										{
											key: "times",
											value: datas[i].Starttime + "-" + datas[i].Endtime
									}],
									iconPress: jQuery.proxy(function(e) {
										s.onClickIcon(e);
									})
								}).data({"obj":datas[i]}));
							}
							*/

				if (datas[i].PostedBy.length > 0) {
					S.addAttribute(new sap.m.ObjectAttribute({
						text: datas[i].PostedBy
					}));
				}
				if (datas[i].Costing1.length > 0) {
					S.addAttribute(new sap.m.ObjectAttribute({
						text: datas[i].Costing1
					}));
				}
				if (datas[i].Costing2.length > 0) {
					S.addAttribute(new sap.m.ObjectAttribute({
						text: datas[i].Costing2
					}));
				}
				if (datas[i].Costing3.length > 0) {
					S.addAttribute(new sap.m.ObjectAttribute({
						text: datas[i].Costing3
					}));
				}
				if (datas[i].Costing4.length > 0) {
					S.addAttribute(new sap.m.ObjectAttribute({
						text: datas[i].Costing4
					}));
				}
				if (datas[i].Costing5.length > 0) {
					S.addAttribute(new sap.m.ObjectAttribute({
						text: datas[i].Costing5
					}));
				}
				if (datas[i].Costing6.length > 0) {
					S.addAttribute(new sap.m.ObjectAttribute({
						text: datas[i].Costing6
					}));
				}
				if (datas[i].Costing7.length > 0) {
					S.addAttribute(new sap.m.ObjectAttribute({
						text: datas[i].Costing7
					}));
				}

				/*if (datas[i].Ppacomments) {
					S.addAttribute(new zhcm.ecert.timesheet.controls.ObjectAttributeCustom({
						title: "HR/TA Comments",
						text: datas[i].Ppacomments,
						active: false,
						lineLimit: 100
					}));
				}*/
				/*			if (datas[i].Uname) {
								var posted = new sap.m.ObjectAttribute({
									text: datas[i].Uname
								});
								if (s.valPost.indexOf(datas[i].Uname) === -1) {
									posted.addStyleClass("ecertAlert");
								} else {
									posted.setTitle('Posted by');
								}
								S.addAttribute(posted);
							}
				*/
				/*	s.setCostingList(S, datas[i]);*/
				/*S.addStyleClass("smObjTitle");*/
				oList.addItem(S);
			}

			oList.addStyleClass("ecerts");
			return oList;
		},
		setAdjustedTimeAndAttendance: function(datas) {
			var s = this;
			s.byId("idtimesheetAdjInfo").setHeaderText("Adjusted Time and Attendance");
			s.byId("idtimesheetAdjInfo").removeAllContent();
			if (datas.length > 0) {
				s.byId("idtimesheetAdjInfo").setVisible(true);
				s.byId("idtimesheetAdjInfo").addContent(s.setCommonTimeList(datas, false));

			} else {
				s.byId("idtimesheetAdjInfo").setVisible(true);
			}
		}

	});

});