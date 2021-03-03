// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

function MemoryGrid($) {

    var ResultParams = (btnClass, rsltHtml) => { return { "class": btnClass, "html": rsltHtml } };
    var Sequence = (actions = [], config = {}) => { return { "actions": actions, "config": config } };
    var SequenceAction = (callback, args = {}, timeout = 0) => { return { "callback": callback, "args": args, "timeout": timeout } };
    var BlinkBase = (btnTarget, btnClass) => { return { "target": btnTarget, "class": btnClass } };
    var BlinkMultiParams = (btnBlinkBases, blinkTime) => { return SequenceAction(setButtonClass, { "blinkBases": btnBlinkBases }, blinkTime) } // { return { "blinkBases": btnBlinkBases, blinkTime: blinkTime } }
    var BlinkParam = (btnTarget, btnClass, blinkTime) => { return BlinkMultiParams([BlinkBase(btnTarget, btnClass)], blinkTime) }



    var BTN_MEM_GRID_CLASS = "btn-mem-grid";
    var BTN_MEM_GRID_CLASS_SELECTOR = "." + BTN_MEM_GRID_CLASS;
    var BTN_MEM_GRID_IDX_KEY = "mem-grid-idx";
    var GRID_CONTAINER_ID = "memoryGridContainer";

    var NWLN = "\n";

    var WIN_GAME_CLASS = "alert-success";
    var TRY_AGAIN_CLASS = "alert-danger";
    var BASE_CLASS = "btn-dark";
    var ERR_CLASS = "btn-danger";
    var OK_CLASS = "btn-success";
    var INFO_CLASS = "btn-info";

    var GAME_RESULT_TAG = '<div class="alert" role="alert"></div>';
    var BTNGRID_TAG = '<div class="btn-group-vertical"></div>';
    var BTNROW_TAG = '<div class="btn-group"></div>';
    var BTN_TAG = '<button class="btn"></button>';

    var WIN_GAME_HTML = '<strong>Congratulations!</strong> You win this game!';
    var TRY_AGAIN_HTML = '<strong>Try again!</strong> Sequence is not correct';

    var allButtons;
    var requiredButtonsOrder;
    var userSequence;
    var flashReqSqnc;
    var flashUsrSqnc;
    var flashTimeouts;
    var memGridParameters;

    var lgTx = (txt) => $("#logArea").prepend(txt);
    var toggleLogArea = () => $("#logRow").toggleClass("d-none");

    var elmId = (elm) =>
        typeof (elm) === typeof (undefined) ?
            -1
            : elm.data(BTN_MEM_GRID_IDX_KEY);

    var unlistenGridButtons = () => allButtons.off("click", memButtonClickHandler);
    var disableHintButton = () => $("#btnHint").prop("disabled", true);
    var getGameResultParams = (wasSuccess) =>
        wasSuccess
            ? ResultParams(WIN_GAME_CLASS, WIN_GAME_HTML)
            : ResultParams(TRY_AGAIN_CLASS, TRY_AGAIN_HTML);

    function showGameResult(resultParams) {
        let alertClass, alertHTML;
        alertClass = resultParams["class"];
        alertHTML = resultParams["html"];
        let jQalert = $(GAME_RESULT_TAG)
            .addClass(alertClass)
            .append(alertHTML)
            .alert();
        $("alerts").append(jQalert);
    }

    function initializeGameResultContainer() {
        $("alerts").empty();
    }

    function initializeGrid() {
        //Extract parameters
        let gridContainerID = GRID_CONTAINER_ID;
        let btnWidth = memGridParameters.btnWidth;
        let btnHeight = memGridParameters.btnHeight;
        let gridRows = memGridParameters.gridRows;
        let gridColumns = memGridParameters.gridColumns;
        let showBtnText = memGridParameters.showBtnText;

        //If grid container ID is not valid, throw error
        if (typeof gridContainerID !== typeof String()) {
            throw "Invalid grid container ID"
        }

        //Initialize container object
        let grdContainer = $("#" + gridContainerID);
        //If grid container ID is not valid, throw error
        if (grdContainer.get().length == 0) {
            throw "Object " + gridContainerID + " does not exist"
        }
        //Global index for buttons
        let btnIdx = 0;
        //Initialize button grid object
        let btnGrid = $(BTNGRID_TAG);
        //Delete all elements in the container
        grdContainer.empty();
        //Add button grid to container
        grdContainer.append(btnGrid);



        //Build button rows
        for (let btnRwIdx = gridRows; btnRwIdx > 0; --btnRwIdx) {
            //Initialize button row
            let btnRow = $(BTNROW_TAG);
            //Build buttons for each column in the row
            for (let btnClIdx = gridColumns; btnClIdx > 0; --btnClIdx) {
                //Initialize individual grid button
                let memBtn = $(BTN_TAG)
                    .data(BTN_MEM_GRID_IDX_KEY, btnIdx) //Set button id
                    .addClass(BASE_CLASS) //Set default appearence
                    .addClass(BTN_MEM_GRID_CLASS)//Class for selector
                    .text(showBtnText ? btnIdx + 1 : "")
                    .width(btnWidth)
                    .height(btnHeight);
                //Add button object to the row
                btnRow.append(memBtn);
                btnIdx++;
            }
            //Add finished row to the grid
            btnGrid.append(btnRow);
        }

        //Initialize allButtons array for easy access
        allButtons = grdContainer.find(BTN_MEM_GRID_CLASS_SELECTOR);

    }


    function initRequiredSequence() {
        let tmpAllBtn = allButtons.slice();
        let currBtn, tmpIdx;
        requiredButtonsOrder = [];
        for (let btnIdx = 1; btnIdx <= memGridParameters.toMemorize; btnIdx++) {
            tmpIdx = Math.floor(Math.random() * tmpAllBtn.length);
            currBtn = $(tmpAllBtn.splice(tmpIdx, 1));
            requiredButtonsOrder.push(currBtn);
        }

        flashReqSqnc = Sequence();
        let reqSqActions = [];
        let flashDelay = memGridParameters.flashDelay;
        let blinks = memGridParameters.blinks;
        let blinkTimeOff = memGridParameters.blinkTimeOff;
        let blinkTimeOn = memGridParameters.blinkTimeOn;
        requiredButtonsOrder.forEach(reqSq => {
            for (let blks = blinks; blks > 0; --blks) {
                reqSqActions.push(BlinkParam(reqSq, INFO_CLASS, blinkTimeOn));
                reqSqActions.push(BlinkParam(reqSq, BASE_CLASS, blinkTimeOff));
            }
        });
        for (let flshOc = memGridParameters.flashes; flshOc > 0; --flshOc) {
            flashReqSqnc.actions = flashReqSqnc.actions.concat(reqSqActions);
            flashReqSqnc.actions.push(BlinkParam(allButtons, BASE_CLASS, flashDelay));
        }
        flashReqSqnc.actions.push(SequenceAction(addButtonListeners));

    }
    function initUserSequence() {
        userSequence = [];
    }


    function playGridButtonSequence(gridButtonSequence) {
        clearGridBtnStyle(allButtons);
        preventTimeOuts();
        unlistenGridButtons();
        execSequenceAction(gridButtonSequence.actions, 0);
    }

    function execSequenceAction(sequenceActions, actionIdx) {
        let sequenceAction = sequenceActions[actionIdx];
        let actionCallback = sequenceAction.callback;
        let callbackArgs = sequenceAction.args;

        actionCallback(callbackArgs);


        // let _trgclass = target.attr("class");
        // console.log(elmId(target), blnkIdx, "blinked", _trgclass)
        let nextIndex = actionIdx + 1;
        let actionTimeout = sequenceAction.timeout;
        if (nextIndex < sequenceActions.length) {
            console.log(nextIndex, "promise-blink", actionTimeout)
            let tmOut = setTimeout(() => {
                execSequenceAction(sequenceActions, nextIndex);

            }, actionTimeout);
            flashTimeouts.push(tmOut);
        }

    }

    function setButtonClass(blinkMultiParams) {
        let btnBlinkBases = blinkMultiParams["blinkBases"];
        btnBlinkBases.forEach(blinkBase => {
            let target = blinkBase["target"];
            let flashClass = blinkBase["class"];

            clearGridBtnStyle(target, flashClass);
        });
    }

    function printRequiredSequence() {
        lgTx(NWLN + "Required sequence");
        let sqnc = "";
        requiredButtonsOrder.forEach(element => {
            sqnc += elmId(element) + ",";
        });
        lgTx(NWLN + sqnc);
    }

    function hintHandler() {
        showRequiredSequence();
    }

    function showRequiredSequence() {
        printRequiredSequence();
        playGridButtonSequence(flashReqSqnc);
    }


    function addButtonListeners() {
        //Re-enable buttons in case they were disabled
        $("#btnReset").prop("disabled", false);
        $("#btnHint").prop("disabled", false);
        $("#btnChange").prop("disabled", false);

        //Prevent listener duplication
        unlistenGridButtons();
        $("#btnReset").off("click", initHandler);
        $("#btnHint").off("click", hintHandler);
        $("#btnToggleLog").off("click", toggleLogArea);
        $("#btnChange").off("click", showForm);

        //Add button listeners
        allButtons.click(memButtonClickHandler);
        $("#btnReset").click(initHandler);
        $("#btnHint").click(hintHandler);
        $("#btnToggleLog").click(toggleLogArea);
        $("#btnChange").click(showForm);

    }

    function checkUserSequence() {
        let finalResult = true;
        let seqIdx = 0;
        let reqMaxIdx = requiredButtonsOrder.length - 1;
        let reqSq, usrSq, reqSqId, usrSqId;
        let usrSqActions = [];
        let playResultAnimation = memGridParameters.playResultAnimation ? 1 : 0;
        let blinkTimeOff = memGridParameters.blinkTimeOff * playResultAnimation;
        let blinkTimeOn = memGridParameters.blinkTimeOn * playResultAnimation;
        flashUsrSqnc = Sequence();
        for (; seqIdx < userSequence.length; seqIdx++) {
            usrSq = userSequence[seqIdx];
            reqSq = seqIdx <= reqMaxIdx ? requiredButtonsOrder[seqIdx] : undefined;
            usrSqId = elmId(usrSq);
            reqSqId = elmId(reqSq);

            if (typeof (reqSq) === typeof (undefined)) {
                finalResult = false;
                lgTx(NWLN + usrSqId + ",XX :(");
                usrSqActions.push(BlinkParam(usrSq, ERR_CLASS, blinkTimeOn));
            } else if (reqSqId === usrSqId) {
                lgTx(NWLN + usrSqId + "," + reqSqId + " :)");
                usrSqActions.push(BlinkParam(usrSq, OK_CLASS, blinkTimeOn));
            } else {
                let blinkBases = [];
                finalResult = false;
                lgTx(NWLN + usrSqId + "," + reqSqId + " :(");
                blinkBases.push(BlinkBase(usrSq, ERR_CLASS));
                blinkBases.push(BlinkBase(reqSq, INFO_CLASS));
                usrSqActions.push(BlinkMultiParams(blinkBases, blinkTimeOn));
                usrSqActions.push(BlinkParam(reqSq, BASE_CLASS, blinkTimeOff));

            }

        }

        for (; seqIdx <= reqMaxIdx; seqIdx++) {
            finalResult = false;
            reqSq = requiredButtonsOrder[seqIdx];
            lgTx(NWLN + "XX, " + elmId(reqSq) + " :(");
            usrSqActions.push(BlinkParam(reqSq, ERR_CLASS, blinkTimeOn));
        }

        let rslt = getGameResultParams(finalResult);
        usrSqActions.push(SequenceAction(showGameResult, rslt))

        flashUsrSqnc.actions = usrSqActions;
        playGridButtonSequence(flashUsrSqnc);

    }

    function markBtnOk(memBtn) {
        clearGridBtnStyle(memBtn, OK_CLASS);
    }

    function markBtnErr(memBtn) {
        clearGridBtnStyle(memBtn, ERR_CLASS);
    }

    function memButtonClickHandler() {
        lgTx(NWLN + elmId($(this)) + " was clicked");
        userSequence.push($(this));
        if (userSequence.length == requiredButtonsOrder.length) {
            let tmOut = setTimeout(timeUp, memGridParameters.userCheckDelay);
            flashTimeouts.push(tmOut);
        }
    }

    function timeUp() {
        unlistenGridButtons();
        disableHintButton();
        checkUserSequence();
    }

    function clearControls() {
        $("#logArea").text("");
        $("#logRow").addClass("d-none");
        clearGridBtnStyle(allButtons);
    }

    function clearGridBtnStyle(grdBtn, finalButtonClass = BASE_CLASS) {
        grdBtn.removeClass(BASE_CLASS);
        grdBtn.removeClass(ERR_CLASS);
        grdBtn.removeClass(OK_CLASS);
        grdBtn.removeClass(INFO_CLASS);
        grdBtn.addClass(finalButtonClass);
    }

    function preventTimeOuts() {
        if (typeof flashTimeouts === typeof Array()) {
            flashTimeouts.forEach(tmOut => {
                clearTimeout(tmOut);
            });
        }
        flashTimeouts = [];

    }

    function showGrid() {
        $("#memoryGridForm").addClass("d-none");
        $("#memoryGridRow").removeClass("d-none");
        $("#btnBar").removeClass("d-none");
        $("#btnCancelChange").prop("disabled", false);
        $("alerts").removeClass("d-none");
    }
    function showForm() {
        $("#memoryGridForm").removeClass("d-none");
        $("#memoryGridRow").addClass("d-none");
        $("#btnBar").addClass("d-none");
        $("alerts").addClass("d-none");
    }

    function mapMemoryGridForm() {
        let blinkSpeedMap = { "fast": [150, 150], "average": [400, 100], "slow": [800, 200] };
        let delayAfterFinishMap = { "none": 0, "short": 750, "long": 2000 };
        let frm = {
            hideButtonNumber: false,
            playResultAnimation: false,
            dimensions: 0,
            sequenceLength: 0,
            blinkSpeed: "",
            delayAfterFinish: ""
        }

        $('#memoryGridForm').serializeArray().forEach(
            elm => frm[elm.name] = elm.value === "on" ? true : elm.value);

        let mgprm = {
            btnWidth: "15vmin",
            btnHeight: "15vmin",
            flashDelay: 0,
            flashes: 1,
            blinks: 1
        }
        mgprm["gridRows"] = mgprm["gridColumns"] = frm["dimensions"];
        mgprm["showBtnText"] = !frm["hideButtonNumber"];
        mgprm["blinkTimeOn"] = blinkSpeedMap[frm["blinkSpeed"]][0];
        mgprm["blinkTimeOff"] = blinkSpeedMap[frm["blinkSpeed"]][1];
        mgprm["toMemorize"] = frm["sequenceLength"]
        mgprm["userCheckDelay"] = delayAfterFinishMap[frm["delayAfterFinish"]];
        mgprm["playResultAnimation"] = frm["playResultAnimation"];

        memGridParameters = mgprm;

    }

    //TODO: #8 Delete auxiliary function _mapMemoryGridForm
    function _mapMemoryGridForm() {

        memGridParameters = {
            gridRows: 4,
            gridColumns: 4,
            btnWidth: "15vmin",
            btnHeight: "15vmin",
            showBtnText: true,
            flashDelay: 0,
            flashes: 1,
            blinkTimeOn: 400,
            blinkTimeOff: 100,
            blinks: 1,
            toMemorize: 3,
            userCheckDelay: 0,
            playResultAnimation: true
        }
    }

    function initHandler() {
        mapMemoryGridForm();
        showGrid();
        initializeGrid();
        clearControls();
        initRequiredSequence();
        initUserSequence();
        initializeGameResultContainer();
        showRequiredSequence();

    }

    function dimensionChangeHandler(e) {
        let selValue = $(e.target).val();
        $("[name=sequenceLength]").prop("max", Math.pow(selValue, 2)).val(selValue);

    }

    function startMemoryGrid() {
        $("#btnStart").click(initHandler);
        $("#btnCancelChange").click(showGrid);
        $("[name=dimensions]").change(dimensionChangeHandler);
    }

    startMemoryGrid();

    //TODO: #6 Review return value of the MemoryGrid class
    return memGridParameters;


}

