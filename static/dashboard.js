function validateModalForm() {
    numberDiv = document.getElementById("num_bots");
    let currentNumber = parseInt(numberDiv.textContent, 10);
    if (currentNumber == 0) {
        var ErrorMessageBotCreation = document.getElementById("ErrorMessageBotCreation");
        ErrorMessageBotCreation.textContent = "Not enough Credits to make a bot";
        return false;
    }
    currentNumber -= 1;
    numberDiv.textContent = currentNumber;
    var ModalCloseButton = document.getElementById("ModalCloseButton");
    const bot = {
        query: document.getElementById("query").value,
        pages: document.getElementById("pages").value,
        status: "Scraping",
    };
    ModalCloseButton.click();
    const listofbotsMainRow = document.getElementById('listofbotsMainRow')
    const newDiv = document.createElement('div');
    newDiv.className = "col-xl-3 col-lg-6 col-md-6 col-sm-12 col-xs-12 justify-content-center";
    newDiv.innerHTML = 
            `<div class="container-fluid mt-2 mb-3 p-2 border shadow rounded">
                <div class="row">
                    <div class="col-8">
                         Search Query: ${bot.query}
                    </div>
                    <div class="col-4">
                        Pages: ${bot.pages}
                        <br>
                        <span id="StatusRed">${bot.status}</span>
                        <br>
                        <br>
                    </div>
                </div>
            </div>`;
    listofbotsMainRow.appendChild(newDiv);
    return true;
}
if (window.history.replaceState){
    window.history.replaceState(null,null,window.location.href);
}