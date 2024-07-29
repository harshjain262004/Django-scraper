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
      newDiv.className = "col-3 mb-4";
      newDiv.innerHTML =
        `
                <div class="card small-cards">
                    <div class="row title-section" style="text-wrap: nowrap">
                        <div class="col-4">Search query:</div>
                        <div class="col-8">
                            <span class="query-name">${bot.query}</span>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-4">
                            <div class="d-flex align-items-center my-3">
                                Pages:<span class="page-no mx-2">${bot.pages} </span>
                            </div>
                        </div>
                        <div class="col-8 d-flex align-items-center" id="BotStat-${response.received_data.botid}">
                            <div id="statusDiv" class="status-div create-div">
                                <i class="fa-regular fa-circle-check me-1"></i> Created
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-center my-2" id="StartBotOrViewData-${response.received_data.botid}">
                        <button class="view-btn" id="StartBot-${response.received_data.botid}" onclick="StartBotRun(${bot.userid},${response.received_data.botid})">Start Bot</button>
                    </div>
                </div>
             `;
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
  var StartBotOrViewDataDiv = document.getElementById(`StartBotOrViewData-${Bot_id}`);
  var BotStatDiv = document.getElementById(`BotStat-${Bot_id}`);
  // add progress bar
  const progressBarHTML = `
        <div id="statusDiv" class="status-div prog-div">
            <div class="progress" role="progressbar" aria-label="Success striped example" aria-valuenow="25"
                  aria-valuemin="0" aria-valuemax="100">
                  <div id="ProgressBar-${Bot_id}" class="progress-bar progress-bar-striped progress-bar-animated bg-success" style="width: 0%;">
                  </div>
            </div>
        </div>
    `;
  BotStatDiv.innerHTML = '';
  BotStatDiv.innerHTML = progressBarHTML;
  StartBotOrViewDataDiv.innerHTML =
    `
    <a href="data/${ClientId}/${Bot_id}">
        <button class="view-btn">View Data</button>
    </a>
    `;
  $.ajax({
    url: "/dashboard/StartBot",
    type: "POST",
    data: {
      botId: Bot_id,
    },
    success: function (response) {

      BotStatDiv.innerHTML =
        `
                <div id="statusDiv" class="status-div comp-div">
                <i class="fa-solid fa-check me-2"></i>Completed
                </div>
            `;
    },
    error: function (response) {
      console.log("error: ", error);
    }
  });
}

// Main Function
$(document).ready(function () {
  GetRefreshList();
  setInterval(GetRefreshList, 10000);
  $("#SearchBarFilter").on("input", function () {
    FindAndPlaceRelevantBots($('#SearchBarFilter').val());
  });
});

function FindAndPlaceRelevantBots(SearchBarFilterValue) {
  client_id = $("#clientUserId").val();
  $.ajax({
    url: "/dashboard/getFilteredBots",
    type: "POST",
    data: {
      keyword: SearchBarFilterValue,
      ClientId: client_id,
    },
    success: function (response) {
      const listofbotsMainRow = document.getElementById('listofbotsMainRow');
      listofbotsMainRow.innerHTML = ""
      response.received_data.forEach(function (bot) {
        listofbotsMainRow.innerHTML += getBotApperance(client_id, bot);
      });
    },
    error: function (response) {
      console.log("error: ", error, response);
    }
  });
}

function GetRefreshList() {
  const ClientId = document.getElementById("clientUserId").value;
  $.ajax({
    url: "/dashboard/getRefreshList",
    type: "POST",
    data: {
      ClientId: ClientId
    },
    success: function (response) {
      let yNewValues = [0, 0, 0, 0];
      response.received_data.forEach(function (bot) {

        if (bot.status != "Completed" && bot.status != "Error" && bot.status != "StartBot") {
          var Progressbar = document.getElementById(`ProgressBar-${bot.id}`);
          Progressbar.style.width = bot.status;
          console.log("Width change");
          yNewValues[3] += 1;
        }
        else {
          if (bot.status == "Completed") {
            var BotStatDiv = document.getElementById(`BotStat-${bot.id}`);
            var StartBotOrViewDataDiv = document.getElementById(`StartBotOrViewData-${bot.id}`);
            BotStatDiv.innerHTML = `
                            <div id="statusDiv" class="status-div comp-div">
                            <i class="fa-solid fa-check me-2"></i>Completed
                            </div>
                        `;

            StartBotOrViewDataDiv.innerHTML = `
                        <a href="data/${ClientId}/${bot.id}">
                          <button class="view-btn">View Data</button>
                        </a>
                        `;
            yNewValues[0] += 1;
          }
          else if (bot.status == "Error") {
            var BotStatDiv = document.getElementById(`BotStat-${bot.id}`);
            var StartBotOrViewDataDiv = document.getElementById(`StartBotOrViewData-${bot.id}`);
            BotStatDiv.innerHTML =
              `
                            <div id="statusDiv" class="status-div error-div">
                            <i class="fa-solid fa-circle-exclamation me-1"></i> Error
                            </div>
                            `;
            StartBotOrViewDataDiv.innerHTML =
              `
                        <a href="data/${ClientId}/${bot.id}">
                          <button class="view-btn">View Data</button>
                        </a>
                        `;
            yNewValues[1] += 1;
          }
          else {
            yNewValues[2] += 1
          }
        }
      });
      ctx.data.datasets[0].data = yNewValues;
      ctx.update();
    },
    error: function (error) {
      console.log(error);
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

function getBotApperance(client_id, bot) {
  if (bot.status == "Completed") {
    html = `<div class="col-3 mb-4">
        <div class="card small-cards">
          <div class="row title-section" style="text-wrap: nowrap">
            <div class="col-4">Search query:</div>
            <div class="col-8">
              <span class="query-name">${bot.query}</span>
            </div>
          </div>
          <div class="row justify-content-between">
            <div class="col-4">
              <div class="d-flex align-items-center my-3">
                Pages:<span class="page-no mx-2">${bot.pages}</span>
              </div>
            </div>
            <div class="col-8 d-flex align-items-center" id="BotStat-${bot.botid}">
              <div id="statusDiv" class="status-div comp-div">
                <i class="fa-solid fa-check me-2"></i>Completed
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-center my-2" id="StartBotOrViewData-${bot.botid}">
            <a href="data/${client_id}/${bot.botid}">
              <button class="view-btn">View Data</button>
            </a>
          </div>
        </div>
      </div>`;
    return html;
  }
  else if (bot.status == "Error") {
    html = `
        <div class="col-3 mb-4">
        <div class="card small-cards">
          <div class="row title-section" style="text-wrap: nowrap">
            <div class="col-4">Search query:</div>
            <div class="col-8">
              <span class="query-name">${bot.query}</span>
            </div>
          </div>
          <div class="row">
            <div class="col-4">
              <div class="d-flex align-items-center my-3">
                Pages:<span class="page-no mx-2">${bot.pages}</span>
              </div>
            </div>
            <div class="col-8 d-flex align-items-center" id="BotStat-${bot.botid}">
              <div id="statusDiv" class="status-div error-div">
                <i class="fa-solid fa-circle-exclamation me-1"></i> Error
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-center my-2" id="StartBotOrViewData-${bot.botid}">
            <a href="data/${client_id}/${bot.botid}">
              <button class="view-btn">View Data</button>
            </a>
          </div>
        </div>
      </div>
        `;
    return html;
  }
  else if (bot.status == "StartBot") {
    html = `
        <div class="col-3 mb-4">
        <div class="card small-cards">
          <div class="row title-section" style="text-wrap: nowrap">
            <div class="col-4">Search query:</div>
            <div class="col-8">
              <span class="query-name">${bot.query}</span>
            </div>
          </div>
          <div class="row">
            <div class="col-4">
              <div class="d-flex align-items-center my-3">
                Pages:<span class="page-no mx-2">${bot.pages}</span>
              </div>
            </div>
            <div class="col-8 d-flex align-items-center" id="BotStat-${bot.botid}">
              <div id="statusDiv" class="status-div create-div">
                <i class="fa-regular fa-circle-check me-1"></i> Created
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-center my-2" id="StartBotOrViewData-${bot.botid}">
            <button class="view-btn" id="StartBot-${bot.botid}"
              onclick="StartBotRun(${client_id},${bot.botid})">Start Bot</button>
          </div>
        </div>
      </div>
        `;
    return html;
  }
  else {
    html = `
        <div class="col-3 mb-4">
        <div class="card small-cards">
          <div class="row title-section" style="text-wrap: nowrap">
            <div class="col-4">Search query:</div>
            <div class="col-8">
              <span class="query-name">${bot.query}</span>
            </div>
          </div>
          <div class="row">
            <div class="col-4">
              <div class="d-flex align-items-center my-3">
                Pages:<span class="page-no mx-2">${bot.pages}</span>
              </div>
            </div>
            <div class="col-8 d-flex align-items-center" id="BotStat-${bot.botid}">
              <div id="statusDiv" class="status-div prog-div">
                <div class="progress" role="progressbar" aria-label="Success striped example" aria-valuenow="25"
                  aria-valuemin="0" aria-valuemax="100">
                  <div id="ProgressBar-${bot.botid}"
                    class="progress-bar progress-bar-striped progress-bar-animated bg-success"
                    style="width: ${bot.status};">
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-center my-2" id="StartBotOrViewData-${bot.botid}">
            <a href="data/${client_id}/${bot.botid}">
              <button class="view-btn">View Data</button>
            </a>
          </div>
        </div>
      </div>
    `;
    return html;
  }
}