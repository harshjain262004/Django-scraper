function validateModalForm() {
    var ErrorMessageBotCreation = document.getElementById("ErrorMessageBotCreation");
    const SearchQ = document.getElementById("query").value;
    const InputPages = document.getElementById("pages").value;
    if (SearchQ == "" || InputPages == "" || InputPages == null) {
        ErrorMessageBotCreation.textContent = "Please fill Search Query and Pages";
        return;
    }
    numberDiv = document.getElementById("num_bots");
    let currentNumber = parseInt(numberDiv.textContent, 10);
    if (currentNumber == 0) {
        ErrorMessageBotCreation.textContent = "Not enough Credits to make a bot";
        return;
    }
    currentNumber -= 1;
    numberDiv.textContent = currentNumber;
    var ModalCloseButton = document.getElementById("ModalCloseButton");
    const bot = {
        query: SearchQ,
        pages: InputPages,
        userid: document.getElementById("clientUserId").value,
        email: document.getElementById("clientEmailId").value,
        status: "StartBot"
    };
    ModalCloseButton.click();
    $.ajax({
        url: "/dashboard/CreateBot",
        type: "POST",
        data: bot,
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        success: function (response) {
            console.log("Success function running:", response);
            const listofbotsMainRow = document.getElementById('listofbotsMainRow')
            const newDiv = document.createElement('div');
            newDiv.className = "col-xl-3 col-lg-6 col-md-6 col-sm-12 col-xs-12 justify-content-center equal mt-3";
            newDiv.innerHTML =
                `<div class="container-fluid border p-2 shadow rounded outer">
                        <div class="row inner">
                            <div class="col-7">
                                Search Query: ${bot.query}
                            </div>
                            <div class="col-5" id="BotDetails-${response.received_data.botid}">
                                Pages: ${bot.pages}
                                <br>
                                    <button class="rounded StartBotButton" id="StartBot-${response.received_data.botid}" onclick="StartBotRun(${bot.userid},${response.received_data.botid})">
                                        Start Bot
                                    </button>
                            </div>
                        </div>
                    </div>`;
            listofbotsMainRow.appendChild(newDiv);
            numberDiv.textContent = response.received_data.num_bots;
        },
        error: function (response) {
            console.log(response.message);
        }
    });
}

function StartBotRun(ClientId, Bot_id) {
    console.log("Ajax for the bot to start running", Bot_id);
    // hiding button once clicked
    var BotStartButton = document.getElementById(`StartBot-${Bot_id}`);
    BotStartButton.classList.add("nodisplay");
    var BotDetailsDiv = document.getElementById(`BotDetails-${Bot_id}`);
    // add progress bar
    const progressBarHTML = `
    <div class="progress">
        <div class="progress-bar progress-bar-striped progress-bar-animated" id="ProgressBar-${Bot_id}" role="progressbar" aria-label="Animated striped example" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width:0%;">
            0%
        </div>
    </div>`;
    BotDetailsDiv.innerHTML += progressBarHTML;
    $.ajax({
        url: "/dashboard/StartBot",
        type: "POST",
        data: {
            botId: Bot_id,
        },
        success: function (response) {
            BotDetailsDiv.innerHTML =
                `
            Pages: ${response.received_data.pages}
            <br>
            <span id="StatusGreen">${response.received_data.BotStatus}</span>
            <br>
            <a href="data/${ClientId}/${response.received_data.botid}">
                                View Data
            </a>
            `;
        },
        error: function (response) {
            console.log("error: ", error);
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    GetRefreshList();
    setInterval(GetRefreshList, 10000);
});

function GetRefreshList() {
    const ClientId = document.getElementById("clientUserId").value;
    $.ajax({
        url: "/dashboard/getRefreshList",
        type: "POST",
        data: {
            ClientId: ClientId
        },
        success: function (response) {
            response.received_data.forEach(function (bot) {
                if (bot.status != "Completed" && bot.status != "Error") {
                    var Progressbar = document.getElementById(`ProgressBar-${bot.id}`);
                    Progressbar.style.width = bot.status;
                    Progressbar.textContent = bot.status;
                }
                else {
                    var BotDetailsDiv = document.getElementById(`BotDetails-${bot.id}`);
                    if (bot.status == "Completed") {
                        BotDetailsDiv.innerHTML =
                            `
                            Pages: ${bot.pages}
                            <br>
                            <span id="StatusGreen">${bot.status}</span>
                            <br>
                            <a href="data/${ClientId}/${bot.id}">
                            View Data
                            </a>
                            `;
                    }
                    else {
                        BotDetailsDiv.innerHTML =
                            `
                            Pages: ${bot.pages}
                            <br>
                            <span id="StatusRed">${bot.status}</span>
                            <br>
                            <a href="data/${ClientId}/${bot.id}">
                            View Data
                            </a>
                            `;
                    }
                }
            });
        },
        error: function (error) {

        }
    });
}


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}
