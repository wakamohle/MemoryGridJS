// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

function initMemoryGrid() {

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
    var requiredSequence;
    var userSequence;
    var flashReqSqnc;
    var flashUsrSqnc;
    var flashTimeouts;

    var lgTx = (txt) => $("#logArea").prepend(txt);
    var toggleLogArea = () => $("#logRow").toggleClass("d-none");

    var elmId = (elm) =>
        typeof (elm) === typeof (undefined) ?
            ""
            : elm.data(BTN_MEM_GRID_IDX_KEY).toString().padStart(2, 0);

    var unlistenGridButtons = () => allButtons.off("click", memButtonClickHandler);
    var disableHintButton = () => $("#btnHint").prop("disabled", true);
    var getGameResultParams = (wasSuccess) =>
        wasSuccess
            ? { "class": WIN_GAME_CLASS, "html": WIN_GAME_HTML }
            : { "class": TRY_AGAIN_CLASS, "html": TRY_AGAIN_HTML };

    var memGridParameters = {
        gridRows: 4,
        gridColumns: 4,
        btnWidth: "15vmin",
        btnHeight: "15vmin",
        showBtnText: true,
        flashTime: 500,
        flashDelay: 500,
        flashes: 1,
        toMemorize: 3,
        userCheckDelay: 0
    };

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
        flashButtonSequence(flashReqSqnc, 0, INFO_CLASS);
    }

    function flashButtonSequence(btnArray, btnIndx, flashClass, finalButtonClass) {
        if (btnIndx == 0) {
            preventTimeOuts();
        }
        if (btnIndx < btnArray.length) {
            let btnFlash = btnArray[btnIndx];
            flashButton(btnFlash, 0, flashClass, finalButtonClass);
            let tmOut = setTimeout(() => {
                flashButtonSequence(btnArray, btnIndx + 1, flashClass, finalButtonClass);
            }, memGridParameters.flashDelay);
            flashTimeouts.push(tmOut);
        }
    }

    function flashButton(target, toggledTimes, flashClass, finalButtonClass) {

        target.toggleClass(flashClass);
        target.toggleClass(BASE_CLASS);
        if (toggledTimes < 2) {
            let tmOut = setTimeout(() => {
                flashButton(target, toggledTimes + 1, flashClass, finalButtonClass);
            }, memGridParameters.flashTime);
            flashTimeouts.push(tmOut);
        } else {
            clearGridBtnStyle(target, finalButtonClass);
        }

    }

    function printRequiredSequence() {
        lgTx(NWLN + "Required sequence");
        let sqnc = "";
        requiredSequence.forEach(element => {
            sqnc += elmId(element) + ",";
        });
        lgTx(NWLN + sqnc);
    }

    function hintHandler() {
        showRequiredSequence();
    }

    function showRequiredSequence() {
        printRequiredSequence();
        flashRequiredSequence();
    }


    function addButtonListeners() {
        //Re-enable buttons in case they were disabled
        $("#btnReset").prop("disabled", false);
        $("#btnHint").prop("disabled", false);

        //Prevent listener duplication
        unlistenGridButtons();
        $("#btnReset").off("click", initHandler);
        $("#btnHint").off("click", hintHandler);
        $("#btnToggleLog").off("click", toggleLogArea);

        //Add button listeners
        allButtons.click(memButtonClickHandler);
        $("#btnReset").click(initHandler);
        $("#btnHint").click(hintHandler);
        $("#btnToggleLog").click(toggleLogArea);

    }

    function checkUserSequence() {
        let finalResult = true;
        let seqIdx = 0;
        let reqMaxIdx = requiredSequence.length - 1;
        let reqSq, usrSq, reqSqId, usrSqId;
        flashUsrSqnc = [];
        for (; seqIdx < userSequence.length; seqIdx++) {
            usrSq = userSequence[seqIdx];
            reqSq = seqIdx <= reqMaxIdx ? requiredSequence[seqIdx] : undefined;
            usrSqId = elmId(usrSq);
            reqSqId = elmId(reqSq);

            if (typeof (reqSq) === typeof (undefined)) {
                finalResult = false;
                lgTx(NWLN + usrSqId + ",XX :(");
                flashUsrSqnc.push([{ "button": usrSq, "class": ERR_CLASS }]);
                markBtnErr(usrSq);
            } else if (reqSqId === usrSqId) {
                lgTx(NWLN + usrSqId + "," + reqSqId + " :)");
                flashUsrSqnc.push([{ "button": usrSq, "class": OK_CLASS }]);
                markBtnOk(usrSq);
            } else {
                finalResult = false;
                lgTx(NWLN + usrSqId + "," + reqSqId + " :(");
                flashUsrSqnc.push([{ "button": usrSq, "class": ERR_CLASS }, { "button": reqSq, "class": OK_CLASS }]);
                markBtnErr(usrSq);
                markBtnErr(reqSq);

            }

        }

        for (; seqIdx <= reqMaxIdx; seqIdx++) {
            finalResult = false;
            reqSq = requiredSequence[seqIdx];
            lgTx(NWLN + "XX, " + elmId(reqSq) + " :(");
            flashUsrSqnc.push([{ "button": reqSq, "class": OK_CLASS }]);
            markBtnErr(reqSq);
        }

        flashUsrSqnc.forEach(sqGrp => sqGrp.forEach(() => flashButtonSequence));

        let rslt = getGameResultParams(finalResult);
        showGameResult(rslt);

    }

    function markBtnOk(memBtn) {
        clearGridBtnStyle(memBtn, OK_CLASS);
    }

    function markBtnErr(memBtn) {
        clearGridBtnStyle(memBtn, ERR_CLASS);
    }

    function memButtonClickHandler() {
        lgTx(NWLN + $(this).attr("id") + " was clicked");
        userSequence.push($(this));
        if (userSequence.length == requiredSequence.length) {
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

    function clearGridBtnStyle(grdBtn, finalButtonClass=BASE_CLASS) {
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

    function initializeButtonBar() {
        $("#btnStart").remove();
        $("#btnBar").removeClass("d-none");
    }

    function initHandler() {
        initializeButtonBar();
        initializeGrid();
        clearControls();
        addButtonListeners();
        initRequiredSequence();
        initializeGameResultContainer();
    }

    function startMemoryGrid() {
        $("#btnStart").click(initHandler)
    }

    startMemoryGrid();
    return {
        "allButtons": allButtons,
        "requiredSequence": requiredSequence
    }

}

