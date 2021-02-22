// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

function initMemoryGrid() {

    var BTN_PREFIX = "grdBtn";
    var NWLN = "\n";
    var BASE_CLASS = "btn-dark";
    var ERR_CLASS = "btn-danger";
    var OK_CLASS = "btn-success";
    var FLASH_CLASS = "btn-info";

    var allButtons;
    var requiredSequence;
    var userSequence;
    var flashReqSqnc;
    var flashUsrSqnc;
    var flashTimeouts;


    var lgTx = (txt) => $("#logArea").append(txt);

    var elmId = (elm) =>
        typeof (elm) === typeof (undefined) ?
            ""
            : elm.attr("id").replace(BTN_PREFIX, "");

    var memGridParameters = {
        gridRows:4,
        gridColumns:4,
        toMemorize: 3,
        showBtnText: false,
        flashTime: 500,
        flashDelay: 500,
        flashes: 2
    };

    function initRequiredSequence() {
        let tmpAllBtn = allButtons.slice();
        let currBtn, tmpIdx;
        requiredSequence = [];
        userSequence = [];
        for (let btnIdx = 1; btnIdx <= memGridParameters.toMemorize; btnIdx++) {
            tmpIdx = Math.floor(Math.random() * tmpAllBtn.length);
            currBtn = $(tmpAllBtn.splice(tmpIdx, 1));
            requiredSequence.push(currBtn);
        }

        flashReqSqnc = [];
        for (let flshOc = memGridParameters.flashes; flshOc > 0; --flshOc) {
            flashReqSqnc = flashReqSqnc.concat(requiredSequence);
        }
        showRequiredSequence();

    }

    function flashRequiredSequence() {
        clearGridBtnStyle(allButtons);
        flashButtonSequence(flashReqSqnc, 0);
    }

    function flashButtonSequence(btnArray, btnIndx) {
        if (btnIndx == 0) {
            preventTimeOuts();
        }
        if (btnIndx < btnArray.length) {
            let btnFlash = btnArray[btnIndx];
            flashButton(btnFlash, 0);
            let tmOut = setTimeout(() => {
                flashButtonSequence(btnArray, btnIndx + 1);
            }, memGridParameters.flashDelay);
            flashTimeouts.push(tmOut);
        }
    }

    function flashButton(target, toggledTimes) {

        target.toggleClass(FLASH_CLASS);
        target.toggleClass(BASE_CLASS);
        if (toggledTimes < 2) {
            let tmOut = setTimeout(() => {
                flashButton(target, toggledTimes + 1);
            }, memGridParameters.flashTime);
            flashTimeouts.push(tmOut);
        } else {
            clearGridBtnStyle(target);
        }

    }

    function printRequiredSequence() {
        lgTx("Required sequence" + NWLN);
        requiredSequence.forEach(element => {
            lgTx(elmId(element) + ",");
        });
        lgTx(NWLN);
    }

    function hintHandler() {
        showRequiredSequence();
    }

    function showRequiredSequence() {
        printRequiredSequence();
        flashRequiredSequence();
    }

    function addButtonListeners() {
        allButtons.off("click", memButtonClickHandler);

        $("#btnReset").off("click", initHandler);
        $("#btnHint").off("click", hintHandler);
        $("#btnCheck").off("click", checkUserSequence);

        allButtons.click(memButtonClickHandler);
        $("#btnReset").click(initHandler);
        $("#btnHint").click(hintHandler);
        $("#btnCheck").click(checkUserSequence);

    }

    function checkUserSequence() {
        let finalResult = true;
        let seqIdx = 0;
        let reqMaxIdx = requiredSequence.length - 1;
        let reqSq, usrSq, reqSqId, usrSqId;
        for (; seqIdx < userSequence.length; seqIdx++) {
            usrSq = userSequence[seqIdx];
            reqSq = seqIdx <= reqMaxIdx ? requiredSequence[seqIdx] : undefined;
            usrSqId = elmId(usrSq);
            reqSqId = elmId(reqSq);

            if (typeof (reqSq) === typeof (undefined)) {
                finalResult = false;
                lgTx(usrSqId + ",XX :(" + NWLN);
                markBtnErr(usrSq);
            } else if (reqSqId === usrSqId) {
                lgTx(usrSqId + "," + reqSqId + " :)" + NWLN);
                markBtnOk(usrSq);
            } else {
                finalResult = false;
                lgTx(usrSqId + "," + reqSqId + " :(" + NWLN);
                markBtnErr(usrSq);
                markBtnErr(reqSq);

            }

        }

        for (; seqIdx <= reqMaxIdx; seqIdx++) {
            finalResult = false;
            reqSq = requiredSequence[seqIdx];
            lgTx("XX, " + elmId(reqSq) + " :(" + NWLN);
            markBtnErr(reqSq);
        }

    }

    function markBtnOk(memBtn) {
        clearGridBtnStyle(memBtn);
        memBtn.removeClass(BASE_CLASS);
        memBtn.addClass(OK_CLASS);
    }

    function markBtnErr(memBtn) {
        clearGridBtnStyle(memBtn);
        memBtn.removeClass(BASE_CLASS);
        memBtn.addClass(ERR_CLASS);
    }

    function memButtonClickHandler() {
        lgTx($(this).attr("id") + " was clicked" + NWLN);
        userSequence.push($(this));
    }

    function clearControls() {
        $("#logArea").text("");
        clearGridBtnStyle(allButtons);


    }

    function clearGridBtnStyle(grdBtn) {
        grdBtn.removeClass(BASE_CLASS);
        grdBtn.removeClass(ERR_CLASS);
        grdBtn.removeClass(OK_CLASS);
        grdBtn.removeClass(FLASH_CLASS);
        grdBtn.addClass(BASE_CLASS);
    }

    function preventTimeOuts() {
        if (typeof flashTimeouts === typeof Array()) {
            flashTimeouts.forEach(tmOut => {
                clearTimeout(tmOut);
            });
        }
        flashTimeouts = [];

    }

    function initHandler() {
        allButtons = $("[id^=" + BTN_PREFIX + "]");
        setButtonsLabel();
        clearControls();
        addButtonListeners();
        initRequiredSequence();
    }

    function setButtonsLabel() {
        let shwTxt = memGridParameters.showBtnText;
        $(allButtons).text(
            (btnIdx) =>
                shwTxt ?
                    btnIdx.toString().padStart(2, 0) :
                    "");

    }

    initHandler();
    return {
        "allButtons": allButtons,
        "requiredSequence": requiredSequence
    }

}

