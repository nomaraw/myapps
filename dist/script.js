/*
 * Javascript file to initialize phmc widget and ask a question form in message center page.
 */
$(document).ready(function() {

    alert('Nomar Yeah');
    try {
        noPlanSummaryOrNoSecureMessage();

        //function to capture cookies
        function getCookie(cname) {
            var name = cname + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for(var i = 0; i <ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        }
        // This function checks widget eligibility from a4me
        $.ajax({
            url: "/a4me/mailbox-widget/auth/checkA4meResource?requestUrl="+window.location.pathname+"&randomDate="+ new Date().getTime(),
            success: function(response){
                if(response === true){
                    checkSecureMessageAndLoadA4me();
                }else{
                    loadKanaCutOffA4me();
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                checkSecureMessageAndLoadA4me();
                logExceptionMessages(jqXHR.statusText);
            }
        });

        // This function checks widget eligibility for member from myuhc
        function checkSecureMessageAndLoadA4me(){
            var memberplansummary = JSON.parse(sessionStorage.getItem('PLANSUMMARY'));
            if(memberplansummary !== null){
                if(memberplansummary.SECUREMESSAGE === "Yes"){
                    grantAccessToMessagesPage();

                }else{
                    noPlanSummaryOrNoSecureMessage();
                }
            }else{
                noPlanSummaryOrNoSecureMessage();
            }
        }

        // Load Kana experience and blocks Secure messaging
        function loadKanaCutOffA4me(){
            var cookieArr = document.cookie.split(";");
            var memberSegementStore=$.parseJSON(getCookie("SEGMENTSTORE"));
            var referrelURL=getCookie("REFERRERURL");
            if(memberSegementStore.pageLanguage ==="es"){
                var openpopup = window.open('/es/member/messagecenterlayoutaem.do?requestType=allMessages', '', 'location=yes,resizable=yes,scrollbars=yes,status=yes,width=700,height=500');
                if(!openpopup || openpopup.closed || typeof openpopup.closed=='undefined') {
                    alert('Please enable popups to view messages')
                }
                if( referrelURL ==null || referrelURL ==undefined || referrelURL ==""){
                    window.history.back();
                } else {
                    window.location.replace(referrelURL);
                }
            }else{
                var openpopup = window.open('/en/member/messagecenterlayoutaem.do?requestType=allMessages', '', 'location=yes,resizable=yes,scrollbars=yes,status=yes,width=700,height=500');
                if(!openpopup || openpopup.closed || typeof openpopup.closed=='undefined') {
                    alert('Please enable popups to view messages')
                }
                if( referrelURL ==null || referrelURL ==undefined || referrelURL ==""){
                    window.history.back();
                } else {
                    window.location.replace(referrelURL);
                }
            }
        }

        // This function works when user is not eligible for secure messaging
        function noPlanSummaryOrNoSecureMessage(){
            $( ".a4me_kanaMessagesProgress" ).hide();
            $(".a4me_migrationText").hide();
            $( ".a4me_widgetContainer" ).hide();
            $('.a4me_questionsFormDiv').hide();

        }
        //},500);

        //Progress bar moves based this function
        function move(count,transferCount) {
            //var elem = document.getElementByClassName("a4me_kanaMessagesProgressBar");
            var elem = document.querySelector(".a4me_kanaMessagesProgressBar");
            var width = Math.round((transferCount/count)*100);
            elem.style.width = width + '%';
            elem.innerHTML = width * 1  + '%';
        }

        // Modifies the visibility of divson widget loads
        function loadMessageTransferProgressBar(count){
            $(".a4me_migrationText").show();
            $(".a4me_kanaMessagesProgress").show();
            $('.a4me_widgetContainer').hide();
            $('.a4me_questionsFormDiv').hide();
            move(count,0);
        }

        // Stops progress bar and initalizes messenger widget
        function stopMessageTransferProgressBar(){
            //MessengerWidget.loadFolder('inbox');
            // Loading messenger widget only after div available
            var url;
            var baseURL;
            var smEnvironment;

            if (window.location.host == "test1.myuhc.com" || window.location.host == "test2.myuhc.com"
                || window.location.host == "test3.myuhc.com" || window.location.host == "test4.myuhc.com"
                || window.location.host == "es-test1.myuhc.com" || window.location.host == "es-test2.myuhc.com"
                || window.location.host == "es-test3.myuhc.com" || window.location.host == "es-test4.myuhc.com"
                || window.location.host == "tst3.myuhc.com" || window.location.host =='consumer-test.myuhc.com' 
                || window.location.host =='consumer-dev.myuhc.com'
            ) {
                url = "https://messaging-stage.myuhc.com/mail/auth_token";
                baseURL = "https://secure-messaging-stage.optum.com/v2/";
                smEnvironment = "stage"
            } else if (window.location.host == "prd.myuhc.com" || window.location.host == "offlineprd.myuhc.com"
                || window.location.host == "stg.myuhc.com" || window.location.host == "es-prd.myuhc.com"
                || window.location.host == "es-stg.myuhc.com"
                || window.location.host == 'consumer-stg.myuhc.com' || window.location.host =='consumer-offline.myuhc.com'
                || window.location.host == 'consumer.myuhc.com') {
                url = "https://messaging.myuhc.com/mail/auth_token";
                baseURL = "https://secure-messaging.optum.com/v2/";
                smEnvironment = "prod"
            }
            function loadMessengerWidget(){
                window.MessengerWidget = new OptumMessenger.Widget({
                    viewManager: 'split',
                    auth: {
                        url: url,
                        smEnvironment: smEnvironment
                    },
                    baseURL: baseURL,
                    containerElement: document.getElementsByClassName("a4me_oms")[0]
                });
                var MessengerWidgetOptions = window.MessengerWidgetOptions
                MessengerWidgetOptions ? window.MessengerWidget.auth['options'] = MessengerWidgetOptions:''
                window.MessengerWidget.render(document.getElementsByClassName("a4me_oms")[0])
            }

            function checkMessengerWidget(){
                if(typeof OptumMessenger!== 'undefined'){
                    loadMessengerWidget();
                    clearInterval(checkMessengerWidgetInterval);
                }
            }

            var checkMessengerWidgetInterval=setInterval(checkMessengerWidget,2000);
            $('.a4me_widgetContainer').show();
            $( ".a4me_kanaMessagesProgress").remove();
            $(".a4me_migrationText").remove();
        }


        //this functio returns encrypta4key
        function a4meBig5Cookie(){
            var ercryptedA4meCookie=getCookie("ENCRYPTA4KEY");
            return ercryptedA4meCookie;
        }

        // Continuously checks the message transfer status and loads progress bar, once done closes progress bar
        function checkMessageTransferStatus(){
            var getCheckTransferDate = new Date().getTime();
            $.ajax({
                url: "/a4me/mailbox-widget/auth/checkMessageTransferStatus?randomDate="+getCheckTransferDate,
                success: function(response){

                    if(response.transferProgress != "complete"){
                        setTimeout(checkMessageTransferStatus,3000);
                        move(response.totalNumberOfMessages, response.transferredMessages);
                    } else {
                        stopMessageTransferProgressBar();
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    stopMessageTransferProgressBar();
                    logExceptionMessages(jqXHR.statusText);
                }
            });
        }

        //  **********Main function to load a4me or kana experience***********
        function grantAccessToMessagesPage(){
            var source;
            if(window.location.host=="test1.myuhc.com"||window.location.host=="test2.myuhc.com"
                ||window.location.host=="test3.myuhc.com"||window.location.host=="test4.myuhc.com"
                || window.location.host=="es-test1.myuhc.com"||window.location.host=="es-test2.myuhc.com"
                || window.location.host=="es-test3.myuhc.com"|| window.location.host=="es-test4.myuhc.com"
                || window.location.host =="tst3.myuhc.com"){
                source = 'stage-sso.uhc.com';
            } else if(window.location.host=="prd.myuhc.com"||window.location.host=="offlineprd.myuhc.com"
                ||window.location.host=="stg.myuhc.com" || window.location.host=="es-prd.myuhc.com"
                || window.location.host=="es-stg.myuhc.com"){
                source = 'sso.uhc.com';
            }

            $.ajax({
                url: '/a4me/mailbox-widget/auth/createSecureMailBox',
                type: 'post',
                contentType : "text/html",
                headers: {'source':source, 'portalSource':'myuhc'},
                dataType : 'json',
                success: function (data) {
                    var jsonResponse=JSON.parse(data.responseString);
                    if(jsonResponse.mailboxId !=0){
                        if(jsonResponse.kanaMessages !=0){
                            loadMessageTransferProgressBar(jsonResponse.kanaMessages);
                            checkMessageTransferStatus();
                        }else{
                            stopMessageTransferProgressBar();
                        }
                    }else{
                        loadKanaCutOffA4me();
                    }

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    var a4meErrorMessage;
                    if(jqXHR.status ==403){
                        a4meErrorMessage= "<div style='clear: both;'>"+
                            " To protect your privacy, please log out and back in to review your messages. "+
                            "</div>";
                    } else {
                        a4meErrorMessage= "<div style='clear: both;'>"+
                            " We're sorry. We can't complete your request at this time. Please try again later."+
                            "</div>";
                    }

                    $( ".a4me_kanaMessagesProgress" ).hide();
                    $(".a4me_migrationText").hide();
                    $( ".a4me_widgetContainer" ).hide();
                    $(".fsa-claims-margin-top").append(a4meErrorMessage);
                    logExceptionMessages(jqXHR.statusText);
                }
            });



            //Error Message Variable
            var a4meErrorMessage="<div class='error-message ng-binding' role='alert' aria-hidden='false' aria-atomic='true' ng-show='error'>"+
                " We're sorry. We can't complete your request at this time. Please try again later."+
                "</div>";

            //Function to get Ask A Question Page
            $.ajax({
                url: 'https://nomaraw.github.io/myapps/index.html',
                type: 'GET',
                success: function(data){
                    $div=$(data);
                    $('.a4me_questionsFormDiv').html($div).hide();
                    var rootElement = angular.element(document);
                    var mockApp = angular.module('arcade').provider({
                        $rootElement:function() {
                            this.$get = function() {
                                return rootElement;
                            };
                        }
                    });

                    var $injector =angular.injector(['ng','arcade',"arcade"]);
                    $injector.invoke(function($rootScope, $compile) {

                        var $target = $("[data-ng-app]");
                        var $scope = angular.element($target).scope();

                        //compile html for angular scope from arcade app
                        $compile($div)($rootScope);

                    });
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $('.a4me_questionsFormDiv').html(a4meErrorMessage);
                    logExceptionMessages(jqXHR.statusText);
                }
            });


            //Switch view between ask a question form and phmc widget
            $(document).on('click','.a4me_cancelButton, .a4me_AskQuestion',function(){
                switchView();
            });

            function switchView(){
                $('.a4me_questionsFormDiv').toggle();
                $('.a4me_widgetContainer').toggle();
            }

            $('.a4me_MessageButton').click(function () {
                selectTab(this);

                $('.a4me_MessageButton').removeClass('sub-active').addClass('sub-inactive');
                $(this).addClass('sub-active');
            });

            function selectTab(activeTab) {
                // Deselect the all tab
                $('.a4me_MessageButton').attr("aria-selected", 'false').attr("tabindex", '-1');

                // Mark the specified tab as selected
                $(activeTab).attr("aria-selected", 'true').attr("tabindex", '0');

                // Change the labelledBy of the message div
                $('.a4me_oms').attr('aria-labelledby',$(activeTab).attr('id'));
            }
        }


    } catch (e) {
        logExceptionMessages(e.message);
    }

    function logExceptionMessages(exceptionBody){
        $.ajax({
            url: '/a4me/mailbox-widget/auth/logExceptions',
            type: 'post',
            contentType: "text/html",
            data: exceptionBody
        });
    }
});
