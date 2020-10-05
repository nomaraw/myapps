console.log('fixing button missing nomar local');
(function($, window, document, undefined) {

    'use strict';
    // Get member sessionStorage from maestro
    var pageUrl;
    if (document.forms[0].elements["TaskSectionReference"] !== undefined) {
        pageUrl = document.forms[0].elements["TaskSectionReference"].value;
    } else {
        pageUrl = sessionStorage.getItem('pageUrl');
    }
    var householdIdGpp = getAttributeValue("pyWorkPage", "MemberID");

    var activeTier1IframeId = window.parent.$('div[id^="PegaWebGadget"]').filter(
        function() {
            return this.id.match(/\d$/);
        }).filter(function() {
        return $(this).attr('aria-hidden') === "false";
    }).contents()[0].id;
    var householdIdGpp;

    householdIdGpp = window.parent.$('iframe[id=' + activeTier1IframeId + ']')[0].contentWindow.getAttributeValue("pyWorkPage", "MemberID");

    function launchWinMnR() {
        var appWindow = window.parent.open("/a4me/ezcomm-core-v2/", "a4meEZCommWindow", 'location=no,height=600,width=1000,scrollbars=1');

        var configappt = false;
        var myObj = requestMetaDataGPP().plugins;
        Object.keys(myObj).forEach(function(key) {
            if (myObj[key].pluginId === "10" && myObj[key].name === "Autodoc") {
                configappt = true;
                console.log('config is ON');
            }
        });

        var loop = setInterval(function() {
            if (appWindow.closed) {
                if (appWindow.closed) {
                    if(sessionStorage.getItem('messageSuccessCc') !== null) {
                        $("#cccbtnyes").prop("checked", true);
                    } else {
                        $("#cccbtnyes").prop("checked", false);
                    }

                    clearInterval(loop);
                }

                clearInterval(loop);
            }
        }, 1000);
    }

    function getMemberDataMandR() {
        console.log(householdIdGpp);
        var ezcommMandRMemObj = {};
        var member_dataSession = JSON.parse(window.parent.sessionStorage.getItem("member_info"));
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
            id: householdIdGpp,
            type: "GPSHID"
        }];
        return ezcommMandRMemObj;
    }


    function requestMetaDataGPP() {
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
        plugin.pluginId = "9";

        plugin2.pluginId = "10";
        plugin2.name = "Autodoc";
        plugin2.params = {
            additionalAutoDoc: ""
        };

        pluginObject.push(plugin);
        pluginObject.push(plugin2);

        requestMetaDataMandRObj.epmp = epmpObj;
        requestMetaDataMandRObj.contact_info_settings = contact_info_setobj;
        requestMetaDataMandRObj.plugins = pluginObject;
        return requestMetaDataMandRObj;
    }



    function messagesMandR() {

        var objs;
        var objprov1 = {};
        var objprov2 = {};
        var msg_param = {};
        var filtersObject = [];

        objprov1.type = "EMAIL";
        objprov1.campaignId = 0;
        objprov1.template_name = "";
        objprov1.msg_parameters = [];

        objprov2.type = "SMS";
        objprov2.campaignId = 0;
        objprov2.template_name = "";
        objprov2.msg_parameters = [];

        filtersObject.push(objprov1);
        filtersObject.push(objprov2);
        return filtersObject;
    }


    var providerTierNotes = '';
    if (document.forms[0].elements["TaskSectionReference"] !== undefined) {

        if (document.forms[0].elements["TaskSectionReference"].value == "Tier1CompletionDetails") {
            if (sessionStorage.getItem('autodocmnrgpp') === null) {
                sessionStorage.removeItem('tier1GppAutoDocEzcomm');
                sessionStorage.removeItem('gppNo');
            } else {
                sessionStorage.setItem('tier1GppAutoDocEzcomm', sessionStorage.getItem('autodocmnrgpp'));
                sessionStorage.removeItem('autodocmnrgpp');
                if (sessionStorage.getItem('messageSuccessCc') !== null) {
                    sessionStorage.removeItem('messageSuccessCc');
                    if(sessionStorage.getItem('gppNo') !== null) {
                        sessionStorage.removeItem('gppNo');
                    }
                }
            }

            //TODO: ADD OPT_IN MESSAGE HERE..s
            if (sessionStorage.getItem('campaignName') === "MakeAPayment_GPSCC" || sessionStorage.getItem('campaignName') === "UHG-MedRet-IIM-Work-MakeAPayment" || sessionStorage.getItem('campaignName') === "PaymentConfirmation_GPSCC") { // TODO: change URL PAYMENT HEADER
                var configuration = false;
                var myObj = requestMetaDataGPP().plugins;
                Object.keys(myObj).forEach(function(key) {
                    console.log(myObj[key].pluginId); // the value of the current key.
                    if (myObj[key].pluginId === "10" && myObj[key].name === "Autodoc") {
                        configuration = true;
                        console.log('config is ON');
                    }
                });

                if (configuration) {
                    if (sessionStorage.getItem('tier1GppAutoDocEzcomm') !== null) { // TODO: Storage name
                        providerTierNotes = sessionStorage.getItem('tier1GppAutoDocEzcomm');

                    }
                }
                window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find('#Comments').val(providerTierNotes);
            }
        }
    }

    var ezcommCore = {
        app: {

            appWindow: null,

            open: function(config) {
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


    function messageEventGpp(msg) {
        if (msg.data) {
            console.log('msg', msg);
            sessionStorage.setItem('messageSuccess', 'success');
            var data = msg.data.replace("Preference ", "").replace("Override ", "");
            var isNull = false;
            if (window.parent.sessionStorage.getItem('autodocmnrgpp') === null) {
                window.parent.sessionStorage.setItem('autodocmnrgpp', data);
                isNull = true;
            } else {
                appendToStorage('autodocmnrgpp', data);

            }
            return false;
        }
    }

    function messageEventGppCC(msg) {
        if(msg.data) {
            console.log('msg12', msg);
            sessionStorage.setItem('messageSuccessCc', 'success');
            var data = msg.data.replace("Preference ", "").replace("Override ", "");
            console.log(data);
            var isNull = false;
            if(window.parent.sessionStorage.getItem('autodocmnrgpp') === null) {
                console.log('testing');
                window.parent.sessionStorage.setItem('autodocmnrgpp', data);
                isNull = true;
            } else {
                console.log('werwere');
                appendToStorage('autodocmnrgpp', data);

            }
            return false;
        }
    }


    function appendToStorage(name, data) {
        var old = window.parent.sessionStorage.getItem(name);
        var oldContainer = "";
        if (old === null) {
            old = "";
        }
        oldContainer = old;
        var newAuto = data;
        console.log(newAuto);
        window.parent.sessionStorage.setItem(name, oldContainer += newAuto);
    }


    if (pageUrl == "MakeAPayment_GPSCC" || pageUrl == "UHG-MedRet-IIM-Work-MakeAPayment" || pageUrl == "PaymentConfirmation_GPSCC") {
        sessionStorage.setItem('campaignName', pageUrl);
    };

    window.parent.document.querySelector('.layout-noheader-interaction_tabs1').addEventListener('click', loaded, false);

    function loaded(event) {

        console.log('event target', event.target);
        if (event.target.matches('.layout-noheader-interaction_tabs .Header_nav')) {

            setTimeout(function() {

                var activeTier1IframeIds = window.parent.$('div[id^="PegaWebGadget"]').filter(
                    function() {
                        return this.id.match(/\d$/);
                    }).filter(function() {
                    return $(this).attr('aria-hidden') == "false"
                }).contents()[0].id;


                if (window.parent.$('iframe[id=' + activeTier1IframeIds + ']').contents().find("span:contains('None of the cases found are related to the current inquiry')").length > 0) {
                    householdIdGpp = window.parent.$('iframe[id=' + activeTier1IframeIds + ']')[0].contentWindow.getAttributeValue("pyWorkPage", "MemberID");
                    sessionStorage.setItem('campaignName', pageUrl);
                }
            }, 2000)

        }

    }


    window.parent.openGPP = function() {

        window.parent.removeEventListener("message", messageEventGpp, false);
        var config = {
            data: {
                member: getMemberDataMandR(),
                request_metadata: requestMetaDataGPP(),
                message: messagesMandR()
            }
        };
        ezcommCore.app.open(config);
        window.parent.addEventListener("message", messageEventGpp, false);
    };

    window.parent.openGPPCc = function() {

        window.parent.removeEventListener("message", messageEventGppCC, false);
        var config = {
            data: {
                member: getMemberDataMandR(),
                request_metadata: requestMetaDataGPP(),
                message: messagesMandR()
            }
        };
        ezcommCore.app.open(config);
        window.parent.addEventListener("message", messageEventGppCC, false);
    };

    window.parent.gppNo = function() {

        sessionStorage.setItem('gppNo', 'gppNoBtn');
    };



    var ezcommButtonVar = setInterval(addEzcommCoreLauncherGPPPayment, 1500);

    function addEzcommCoreLauncherGPPPayment() {
        if (window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find("span:contains('None of the cases found are related to the current inquiry')").length > 0 &&
            window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find("#gpppaymentheader").length === 0) {
            $('#RULE_KEY > div:nth-child(1) > div > div > div > div > p').append('<button style="margin-bottom:10px;width: 100%;max-width: 59px;height: 60px;border-radius: 10px; cursor: pointer;margin-top: 11px;background:url(/a4me/ezcomm-launcher-maestro-gpp-payment-header/images/ezcomm_big.png);background-position: center;background-repeat: no-repeat;background-size: cover" onclick="window.parent.openGPP()" type="button" id="gpppaymentheader"></button>');
        }
    }


    // EFT Payment header start
    var ezcommButtonEftVar = setInterval(addEzcommCoreLauncherGPPPaymentEft, 1500);

    function addEzcommCoreLauncherGPPPaymentEft() {
        if (window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find("span:contains('One Time EFT payment may take up to 72 hours to appear on the member's bank account.')").length > 0 &&
            window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find("#gpppaymentheaderEFT").length === 0) {
            $("div[data-node-id='PaymentConfirmation_GPSCC'] > span:nth-child(3)").prepend('<button style="margin-bottom:10px;width: 100%;max-width: 59px;height: 60px;border-radius: 10px; cursor: pointer;margin-top: 11px;background:url(/a4me/ezcomm-launcher-maestro-gpp-payment-header/images/ezcomm_big.png);background-position: center;background-repeat: no-repeat;background-size: cover" onclick="window.parent.openGPP()" type="button" id="gpppaymentheaderEFT"></button>');
        }
    }

    var ezcommButtonVarCc = setInterval(addTriggerQuestionCC, 1500);

    function addTriggerQuestionCC() {
        if (window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find("label:contains('Review & Submit Payment Confirmation')").length > 0 &&
            window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find("#cctrigger").length === 0) {
            if (document.getElementById("pyWorkPageSaveCreditCardInfoNo").checked) {
                $('#pyWorkPageSaveCreditCardInfoNo').parent().addClass('weeewew').prev().addClass('s').parent().parent().addClass('1').parent().parent().parent().addClass('11').prev().parent().append('<div style="" id="cctrigger" class="content-item content-field item-1" string_type="field" reserve_space="false"><div class="content-inner "><div class="field-item dataValueRead">Does the caller want a link to the Guest Payment Portal?</div></div></div><div style="" class="content-item content-field item-2   " string_type="field" reserve_space="false"><div class="content-inner "><div class="field-item dataValueWrite"><div class="radioTable"><div><span class="col-3"><input validationtype="required" id="cccbtnyes" type="radio" onclick="window.parent.openGPPCc()" name="cccbtnyes" value="Yes" class="Radio" style="vertical-align: middle;"><label title=""for="cccbtnyes" class="rb_ rb_standard radioLabel">Yes</label></span><span class="col-3"><input onclick="window.parent.gppNo()"  id="cccbtnno" type="radio" name="cccbtnyes" value="No" class="Radio" style="vertical-align: middle;"><label title="" for="cccbtnno" class="rb_ rb_standard radioLabel">No</label></span></div></div></div></div></div>');
                if (sessionStorage.getItem("messageSuccessCc") !== null) {
                    document.getElementById('cccbtnyes').checked = true
                } else if(sessionStorage.getItem('gppNo') !== null && sessionStorage.getItem("messageSuccessCc") === null) {
                    document.getElementById('cccbtnno').checked = true
                }
            }
        }
    }


}(jQuery, window, document));