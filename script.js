
(function($, window, document, undefined) {

    'use strict';
    // Get member sessionStorage from maestro
    var member_dataSession = JSON.parse(window.parent.sessionStorage.getItem("member_info"));
    var ezcommCommunications;
    var householdId = getAttributeValue("pyWorkPage", "MemberID");

    var activeTier1IframeId = window.parent.$('div[id^="PegaWebGadget"]').filter(
        function() {
            return this.id.match(/\d$/);
        }).filter(function() {
        return $(this).attr('aria-hidden') === "false";
    }).contents()[0].id;

    var sCase = window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find('title').html().trim();
    console.log('nomar fix opt out v1');

    function checkIfReset(){

        if(sessionStorage.getItem(sCase) !== null && sessionStorage.getItem('QuestionradioStatus') === 'OPT_IN') {
            window.parent.sessionStorage.removeItem(sCase);
            window.parent.sessionStorage.removeItem('messageSuccess');
        }
    }

    if(document.forms[0].elements["TaskSectionReference"].value == "AssignPCP"){
        sessionStorage.setItem("campaignName", "Search and Assign Provider");
        sessionStorage.setItem('provInfoScase', sCase);
        isAutodocMnrNotEmpty();
    }

    function launchWinMnR() {
        var appWindow = window.parent.open("/a4me/ezcomm-core-v2/", "a4meEZCommWindow", 'location=no,height=600,width=1000,scrollbars=1');
        isAutodocMnrNotEmpty();
        checkIfReset();
        var msgprov = messagesMandR()[0].msg_parameters.providers;
        var detail = '';

        var isconfig = false;
        var myObj = requestMetaDataMandR().plugins;
        Object.keys(myObj).forEach(function(key) {
            console.log(myObj[key].pluginId); // the value of the current key.
            if(myObj[key].pluginId === "10" && myObj[key].name === "Autodoc") {
                isconfig = true;
                console.log('config is ON');
            } else {
                isconfig = false;
                console.log('config off');
            }

        });

        if(messagesMandR()[0].msg_parameters.providers.length > 0) {
            Object.keys(msgprov).forEach(function(key) {
                detail += msgprov[key].name + "\n" + msgprov[key].address + "\n" + msgprov[key].phone + "\n" + "\n";
            });
            sessionStorage.setItem('schedprov', detail);
        } else{
            console.log('empty provider table');
            sessionStorage.setItem('schedprov', "");
        }

        var loop = setInterval(function() {
            if (appWindow.closed) {
                if (sessionStorage.getItem('messageSuccess') === null && isconfig) {
                    window.parent.sessionStorage.removeItem("QuestionradioStatus");
                    document.getElementById('ezcomm-mnr-mail-question-yes').checked = false;
                    window.parent.sessionStorage.removeItem("autodocmnrprovider");
                }
                clearInterval(loop);
            }
        }, 1000);
    }


    function getMemberDataMandR() {
        var ezcommMandRMemObj = {};

        var memberDob = member_dataSession.member_dob;
        var year = memberDob.substring(0, 4);
        var month = memberDob.substring(4, 6);
        var day = memberDob.substring(6, 8);
        memberDob = month + "/" + day + "/" + year;

        ezcommMandRMemObj.firstName = member_dataSession.member_first_name;
        ezcommMandRMemObj.lastName = member_dataSession.member_last_name;
        ezcommMandRMemObj.dateOfBirth = memberDob;
        ezcommMandRMemObj.subscriberId = member_dataSession.member_id.split('-')[0];
        ezcommMandRMemObj.idTypeCode = "20202";
        ezcommMandRMemObj.policyId = "0";
        ezcommMandRMemObj.encryptedFlag = false;
        ezcommMandRMemObj.additionalIdentifiers = [{
            id: householdId,
            type: "GPSHID"
        }];
        return ezcommMandRMemObj;
    }


    function requestMetaDataMandR() {
        var requestMetaDataMandRObj = {};
        var pluginObject = [];
        var plugin = {};
        var plugin2 = {};
        var epmpObj = {};
        var contact_info_setobj = {};

        requestMetaDataMandRObj.agentId = pega.d.pyUID;
        requestMetaDataMandRObj.applicationName = "MAESTRO-EZCOMM";
        requestMetaDataMandRObj.lineOfBusiness = "M&R";

        epmpObj.enabled = true;
        epmpObj.retrieveAllStatus = true;
        epmpObj.allowUpdate = false;

        contact_info_setobj.enable_email = true;
        contact_info_setobj.enable_sms = true;
        contact_info_setobj.enable_fax = false;

        plugin.name = "";
        plugin.defaultCampaign = "";
        plugin.pluginId = "";

        plugin2.pluginId = "10";
        plugin2.name = "Autodoc";

        var msgprov = messagesMandR()[0].msg_parameters.providers;
        var detail = '';

        if(messagesMandR()[0].msg_parameters.providers.length > 0) {
            Object.keys(msgprov).forEach(function(key) {
                detail += msgprov[key].name + "\n" + msgprov[key].address + "\n" + msgprov[key].phone + "\n" + "\n";
            });
            sessionStorage.setItem('schedprov', detail);
        } else{
            console.log('empty provider table');
            sessionStorage.setItem('schedprov', "");
        }

        plugin2.params = { additionalAutoDoc: sessionStorage.getItem('schedprov') };

        pluginObject.push(plugin);
        pluginObject.push(plugin2);

        requestMetaDataMandRObj.epmp = epmpObj;
        requestMetaDataMandRObj.contact_info_settings = contact_info_setobj;
        requestMetaDataMandRObj.plugins = pluginObject;
        return requestMetaDataMandRObj;
    }

    function messagesMandR() {

        var objs;
        var obj1 = {};
        var obj2 = {};
        var msg_param = {};
        var msg_param2 = {};
        var filtersObject = [];

        obj1.type = "EMAIL";
        obj1.campaignId = 67;
        obj1.template_name = "Provider_Info_EMAIL";
        msg_param.firstName = member_dataSession.member_first_name;
        msg_param.lastName = member_dataSession.member_last_name;
        obj1.msg_parameters = msg_param;
        obj1.msg_parameters.providers = [];

        obj2.type = "SMS";
        obj2.campaignId = 67;
        obj2.template_name = "Provider_Info_SMS";
        msg_param.firstName = member_dataSession.member_first_name;
        msg_param.lastName = member_dataSession.member_last_name;
        obj2.msg_parameters = msg_param2;
        obj2.msg_parameters.providers = [];

        window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find('#bodyTbl_right tr:not(:first)').each(function() {
            var provider = {};
            provider.name = window.parent.$(this).find("td:eq(2)").find("span").html();
            provider.address = window.parent.$(this).find("td:eq(3)").find("span").html();
            provider.phone = window.parent.$(this).find("td:eq(10)").find("span").html();
            if (typeof provider.name == 'undefined' ||
                provider.name.indexOf("<input") !== -1 ||
                provider.address.indexOf("<input") !== -1 ||
                provider.phone.indexOf("<input") !== -1) {
                console.error("ERROR html tag found in provider.");

            } else {
                var currentProviderInfo = "";
                for (var key2 in provider) {
                    if (key2 !== '$$hashKey' && provider[key2].trim().length !== 0 && provider[key2]) {
                        currentProviderInfo = currentProviderInfo + provider[key2].trim() + "\n";
                    }
                }


                objs = {
                    name: provider.name.trim(),
                    phone: provider.phone.trim(),
                    address: provider.address.trim()
                };


                obj1.msg_parameters.providers.push(objs); // email
                obj2.msg_parameters.providers.push(objs); // sms

            }
        });

        filtersObject.push(obj1);
        filtersObject.push(obj2);

        return filtersObject;
    }


    function getCurrentDateTime() {
        var d = new Date();
        var day = d.getDate();
        var hr = d.getHours();
        var min = d.getMinutes();
        if (min < 10) {
            min = "0" + min;
        }
        var ampm = "am";
        if (hr > 12) {
            hr -= 12;
            ampm = "pm";
        } else if (hr == 12) {
            ampm = "pm";
        }

        if(hr < 10) { hr = "0" + hr; }

        var date = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
        var month = d.getMonth() + 1;
        if(month < 10) { month = "0" + month; }

        var year = d.getFullYear();
        var sec = d.getSeconds();
        if(sec < 10) {
            sec = "0" + sec;
        }

        var dateTimeString = month + "/" + date + "/" + year + " " + hr + ":" + min + ":" + sec + " " + ampm;
        return dateTimeString;
    }


    var EmailCheckRadioButtonContent = '<td class="dataValueWrite" style="height:38px;width:193px;">\
	<div class="radioTable" >\
	    <div>\
	        <span class="col-3"><input name="optradio" type="radio" value="yes" id="ezcomm-mnr-mail-question-yes" class="Radio ezcomm-mnr-mail-question-button" style="vertical-align: middle;"><label class="rb_ rb_standard radioLabel">Yes</label></span>\<span class="col-3"><input name="optradio" type="radio" value="no" id="ezcomm-mnr-mail-question-no" class="ezcomm-mnr-mail-question-button" style="vertical-align: middle;"><label class="rb_ rb_standard radioLabel">No</label></span>\
	    </div>\
	</div>\
	</td>';

    var EmailCheckRadioButtonContentYes = '<td class="dataValueWrite" style="height:38px;width:193px;">\
	<div class="radioTable" >\
	    <div>\
	        <span class="col-3"><input name="optradio" type="radio" value="yes" id="ezcomm-mnr-mail-question-yes" class="Radio ezcomm-mnr-mail-question-button" style="vertical-align: middle;" checked><label class="rb_ rb_standard radioLabel">Yes</label></span>\<span class="col-3"><input name="optradio" type="radio" value="no" id="ezcomm-mnr-mail-question-no" class="ezcomm-mnr-mail-question-button" style="vertical-align: middle;"><label class="rb_ rb_standard radioLabel">No</label></span>\
	    </div>\
	</div>\
	</td>';

    var EmailCheckRadioButtonContentNo = '<td class="dataValueWrite" style="height:38px;width:193px;">\
	<div class="radioTable" >\
	    <div>\
	        <span class="col-3"><input name="optradio" type="radio" value="yes" id="ezcomm-mnr-mail-question-yes" class="Radio ezcomm-mnr-mail-question-button" style="vertical-align: middle;"><label class="rb_ rb_standard radioLabel">Yes</label></span>\<span class="col-3"><input name="optradio" type="radio" value="no" id="ezcomm-mnr-mail-question-no" class="ezcomm-mnr-mail-question-button" style="vertical-align: middle;" checked><label class="rb_ rb_standard radioLabel">No</label></span>\
	    </div>\
	</div>\
	</td>';



    var varSectionIndex = "#pyFlowActionHTML div div[class='layout layout-noheader layout-noheader-default_with_all_borders'";

    if (document.forms[0].elements["TaskSectionReference"].value == "AssignPCP") {
        if(window.parent.sessionStorage.getItem("QuestionradioStatus") == null || window.parent.sessionStorage.getItem("QuestionradioStatus") == "") {
            if(sessionStorage.getItem('messageSuccess') === null) {
                $(varSectionIndex).prev().prepend('<tr id="newlyAddedQuestionEmail"><td><label class="dataValueWrite a4meDiv" style="vertical-align:middle;">Does the member want to receive provider information via text or email?</label></td>' + EmailCheckRadioButtonContent + '</tr>');
            }
        }
    }

    var providerTierNotes = '';
    if (document.forms[0].elements["TaskSectionReference"].value == "Tier1CompletionDetails") {

        //TODO: ADD OPT_IN MESSAGE HERE..

        var sCaseProv = window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find('title').html().trim();

        var configuration = false;
        var myObj = requestMetaDataMandR().plugins;
        Object.keys(myObj).forEach(function(key) {
            if(myObj[key].pluginId === "10" && myObj[key].name === "Autodoc") {
                configuration = true;
                console.log('config is ON');
            } else {
                configuration = false;
            }

        });

        if(sessionStorage.getItem("campaignName") === "Search and Assign Provider") {
            if(configuration){
                if(sessionStorage.getItem(sCaseProv) !== null) {

                    providerTierNotes = sessionStorage.getItem(sCaseProv);

                    if(sessionStorage.getItem('QuestionradioStatus') === "OPT_IN"  ) {
                        sessionStorage.removeItem('QuestionradioStatus');
                        sessionStorage.removeItem('schedprov');
                    }

                    if (sessionStorage.getItem('messageSuccess') !== null) {
                        sessionStorage.removeItem('messageSuccess');
                    }

                } else {
                    if(sessionStorage.getItem('provInfoScase') === sCaseProv) {
                        var tier1Comments = window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find('#Comments').val();
                        if (tier1Comments === undefined || tier1Comments === '' || !tier1Comments.contains("Opt-in: Yes") ) {
                            if(sessionStorage.getItem('QuestionradioStatus') === "OPT_OUT") {
                                providerTierNotes = "***Provider Information Email Message Opt-in: No, " + getCurrentDateTime() + "***\n"
                                    + "***Provider Information SMS Message Opt-in: No, " + getCurrentDateTime() + "***\n";
                                sessionStorage.removeItem('QuestionradioStatus');
                            }
                        }
                    }
                }
            } else {
                if(sessionStorage.getItem('QuestionradioStatus') === "OPT_IN" || sessionStorage.getItem('QuestionradioStatus') === "OPT_OUT") {
                    sessionStorage.removeItem('QuestionradioStatus');
                    sessionStorage.removeItem('schedprov');
                }
            }
            window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find('#Comments').val(providerTierNotes);
        }



    }

    $(document).on('DOMSubtreeModified', '#pyFlowActionHTML div ', function() {
        if ($("#newlyAddedQuestionEmail").length == 0 && document.forms[0].elements["TaskSectionReference"].value == "AssignPCP") {
            if (window.parent.sessionStorage.getItem("QuestionradioStatus") == "OPT_IN"){
                $(varSectionIndex).prev().prepend('<tr id="newlyAddedQuestionEmail"><td><label class="dataValueWrite a4meDiv" style="vertical-align:middle;">Does the member want to receive provider information via text or email?</label></td>' + EmailCheckRadioButtonContentYes + '</tr>');
            }else if  (window.parent.sessionStorage.getItem("QuestionradioStatus") == "OPT_OUT") {
                $(varSectionIndex).prev().prepend('<tr id="newlyAddedQuestionEmail"><td><label class="dataValueWrite a4meDiv" style="vertical-align:middle;">Does the member want to receive provider information via text or email?</label></td>' + EmailCheckRadioButtonContentNo + '</tr>');
            }else {
                $(varSectionIndex).prev().prepend('<tr id="newlyAddedQuestionEmail"><td><label class="dataValueWrite a4meDiv" style="vertical-align:middle;">Does the member want to receive provider information via text or email?</label></td>' + EmailCheckRadioButtonContent + '</tr>');
            }
        }
    });


    var ezcommCore = {
        app : {

            appWindow: null,

            open: function (config) {
                window.parent.localStorage.setItem('EzcommCommunicationsPayload', JSON.stringify(config));

                if (localStorage.getItem("EzcommWindowOpen") === 'true') {
                    window.open("", "a4meEZCommWindow").close();
                }
                launchWinMnR();
            },

            get: function() {
                return this.appWindow;
            }
        }
    };

    function messageEvent(msg) {
        if(msg.data) {
            var additionalAutoDoc = sessionStorage.getItem('schedprov') + "\n";
            sessionStorage.setItem('messageSuccess', 'success');
            var data = msg.data.replace("Preference ", "").replace("Override ", "").replace(additionalAutoDoc, "");
            var isNull = false;
            if(window.parent.sessionStorage.getItem(sCase) === null) {
                window.parent.sessionStorage.setItem(sCase, data + additionalAutoDoc);
                isNull = true;
            }
            else {
                appendToStorage(sCase, data, additionalAutoDoc);

            }
            return false;
        }
    }


    function appendToStorage(name, data, additionalAutoDoc){
        var old = window.parent.sessionStorage.getItem(name);
        var oldContainer = "";
        if(old === null) {
            old = "";
            oldContainer = old;
        } else {
            oldContainer = old.replace(additionalAutoDoc,"");
        }
        var newAuto = data + additionalAutoDoc;
        console.log(newAuto);
        window.parent.sessionStorage.setItem(name, oldContainer += newAuto);
    }


    window.parent.$(document).on('change', '.ezcomm-mnr-mail-question-button', function() {
        if (this.value == "yes") {

            window.parent.removeEventListener("message", messageEvent, false);      // Succeeds

            window.parent.sessionStorage.setItem("QuestionradioStatus", "OPT_IN");

            ezcommCommunications = {
                config: {
                    data: {
                        member: {},
                        request_metadata: {},
                        message: messagesMandR()

                    }
                }
            };

            ezcommCommunications.config.data.member = getMemberDataMandR();
            ezcommCommunications.config.data.request_metadata = requestMetaDataMandR();
            ezcommCommunications.config.data.message;
            ezcommCore.app.open(ezcommCommunications.config);


            var iframe = window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents();

            if(iframe) {
                window.parent.addEventListener("message", messageEvent, false);
            }

        } else {
            if(sessionStorage.getItem(sCase) === null) {
                window.parent.sessionStorage.setItem('optout', 'optoutautodoc');
                window.parent.sessionStorage.setItem("QuestionradioStatus", "OPT_OUT");
            }
        }
    });



}(jQuery, window, document));