console.log("update 40 nomar");

(function ($, window, document, undefined) {

    'use strict';
    // Get member sessionStorage from maestro
    if(document.forms[0].elements["TaskSectionReference"] !== undefined) {
        var pageUrl = document.forms[0].elements["TaskSectionReference"].value;
    }
    var householdIdGpp = getAttributeValue("pyWorkPage", "MemberID");

    var activeTier1IframeId = window.parent.$('div[id^="PegaWebGadget"]').filter(
        function () {
            return this.id.match(/\d$/);
        }).filter(function () {
        return $(this).attr('aria-hidden') === "false";
    }).contents()[0].id;
    var householdIdGpp;

    householdIdGpp = window.parent.$('iframe[id=' + activeTier1IframeId + ']')[0].contentWindow.getAttributeValue("pyWorkPage", "MemberID");


    function isAutodocMnrNotEmpty() {
        if (sessionStorage.getItem('autodocmnrgpp') !== null) {
            window.parent.sessionStorage.removeItem('autodocmnrgpp');
            window.parent.sessionStorage.removeItem('messageSuccess');

        } else if(sessionStorage.getItem('autodocmnrgpp') === null) {
            window.parent.sessionStorage.removeItem('autodocmnrgpp');
            window.parent.sessionStorage.removeItem('messageSuccess');

        }
        return false;
    }

    function checkIfReset(){
        if(sessionStorage.getItem('autodocmnrgpp') !== null) {
            window.parent.sessionStorage.removeItem('autodocmnrgpp');
            window.parent.sessionStorage.removeItem('messageSuccess');
            reset = true;
        }
    }

    //TODO: remove?
    if (pageUrl == "MakeAPayment_GPSCC") {
        isAutodocMnrNotEmpty();
    }

    function launchWinMnR() {
        var appWindow = window.parent.open("/a4me/ezcomm-core-v2/", "a4meEZCommWindow", 'location=no,height=600,width=1000,scrollbars=1');
        isAutodocMnrNotEmpty();
        checkIfReset();

        var configappt = false;
        var myObj = requestMetaDataGPP().plugins;
        Object.keys(myObj).forEach(function (key) {
            if (myObj[key].pluginId === "10" && myObj[key].name === "Autodoc") {
                configappt = true;
                console.log('config is ON');
            }
        });

        var loop = setInterval(function () {
            if (appWindow.closed) {
                if (sessionStorage.getItem('messageSuccess') === null && configappt) {
                    window.parent.sessionStorage.removeItem("autodocmnrgpp");
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
    if (document.forms[0].elements["TaskSectionReference"].value == "Tier1CompletionDetails") {
        console.log('here tier1 autodoc')

        //TODO: ADD OPT_IN MESSAGE HERE..s
        if(sessionStorage.getItem('campaignName') === "MakeAPayment_GPSCC") {   // TODO: change URL PAYMENT HEADER
            console.log('here tier1 autodoc second')
            var configuration = false;
            var myObj = requestMetaDataGPP().plugins;
            Object.keys(myObj).forEach(function (key) {
                console.log(myObj[key].pluginId); // the value of the current key.
                if (myObj[key].pluginId === "10" && myObj[key].name === "Autodoc") {
                    configuration = true;
                    console.log('config is ON');
                }
            });

            if (configuration) {
                if (sessionStorage.getItem('autodocmnrgpp') !== null) { // TODO: Storage name
                    providerTierNotes = sessionStorage.getItem('autodocmnrgpp');

                    // if(sessionStorage.getItem('QuestionRadioStatusAppt') === "OPT_IN"  ) { // // TODO: Storage name
                    //     sessionStorage.removeItem('QuestionRadioStatusAppt');
                    //     sessionStorage.removeItem('schedproviders');
                    // }
                }                
            }  else {
                // if(sessionStorage.getItem('QuestionRadioStatusAppt') === "OPT_IN" || sessionStorage.getItem('QuestionRadioStatusAppt') === "OPT_OUT") {
                //     sessionStorage.removeItem('QuestionRadioStatusAppt');
                //     sessionStorage.removeItem('schedproviders');
               // }
            }
            window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find('#Comments').val(providerTierNotes);
        }
    }


var ezcommCore = {
        app: {

            appWindow: null,

            open: function (config) {
                window.parent.localStorage.setItem('EzcommCommunicationsPayload', JSON.stringify(config));

                if (localStorage.getItem("EzcommWindowOpen") === 'true') {
                    window.open("", "a4meEZCommWindow").close();
                }
                launchWinMnR();
            },

            get: function () {
                return this.appWindow;
            }
        }
    };


    function messageEventGpp(msg) {
        if(msg.data) {
            console.log('msg', msg);
            sessionStorage.setItem('messageSuccess', 'success');
            var data = msg.data.replace("Preference ", "").replace("Override ", "");
            var isNull = false;
            if(window.parent.sessionStorage.getItem('autodocmnrgpp') === null) {
                window.parent.sessionStorage.setItem('autodocmnrgpp', data);
                isNull = true;
            } else {
                appendToStorage('autodocmnrgpp', data);

            }
            return false;
        }
    }


    function appendToStorage(name, data){
        var old = window.parent.sessionStorage.getItem(name);
        var oldContainer = "";
        if(old === null) {
            old = "";
            oldContainer = old;
        } 
        var newAuto = data;
        console.log(newAuto);
        window.parent.sessionStorage.setItem(name, oldContainer += newAuto);
    }


  
    // function getHouseHoldIdAppt() {
    //     householdIdSched = getAttributeValue("pyWorkPage", "MemberID");
    //     return householdIdSched;
    // }

     if (pageUrl == "MakeAPayment_GPSCC") {
    //     getHouseHoldIdAppt();
    //     $(document).on('DOMSubtreeModified', '.sectionDivStyle', function() { // TODO: Change approach 
             sessionStorage.setItem('campaignName', 'MakeAPayment_GPSCC');
    //         getHouseHoldIdAppt();
        };

    // }

    window.parent.document.getElementById('l1').addEventListener('click', loaded, false);

    function loaded(event) {

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
                    sessionStorage.setItem('campaignName', 'MakeAPayment_GPSCC');
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
        }
        ezcommCore.app.open(config);
        window.parent.addEventListener("message", messageEventGpp, false);
    }

       console.log('beforeButtonVar');
        var ezcommButtonVar = setInterval(addEzcommCoreLauncherGPPPayment, 1500);
        console.log('afterButtonVar');
        function addEzcommCoreLauncherGPPPayment() {
            console.log('interval triggered');
            if (window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find("span:contains('None of the cases found are related to the current inquiry')").length > 0 &&
                window.parent.$('iframe[id=' + activeTier1IframeId + ']').contents().find("#gpppaymentheader").length === 0) {
                    console.log('condition in');
                    $('#RULE_KEY > div:nth-child(1) > div > div > div > div > p').append('<button style="margin-bottom:10px;width:65px;height:40px;padding:0;border-radius: 10px;border: none;cursor: pointer;" onclick="window.parent.openGPP()" type="button" id="gpppaymentheader"><div class="pzbtn-rnd" ><div class="pzbtn-lft"><div class="pzbtn-rgt" ><div class="pzbtn-mid" ><img src="ezcomm_big.png" style="width:65px;height: 36px;" alt="" class="pzbtn-i">EZComm</div></div></div></div></button>');
                }    
      } 

}(jQuery, window, document));

