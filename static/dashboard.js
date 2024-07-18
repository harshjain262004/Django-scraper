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
    newDiv.className = "col-xl-3 col-lg-6 col-md-6 col-sm-12 col-xs-12 justify-content-center equal mt-3";
    newDiv.innerHTML = 
            `<div class="container-fluid border p-2 shadow rounded outer">
                        <div class="row inner">
                            <div class="col-7">
                                Search Query: ${bot.query}
                            </div>
                            <div class="col-5">
                                Pages: ${bot.pages}
                                <br>
                                    <span id="StatusRed">${bot.status}</span>
                                <br>
                                <div class="spinner-border mt-1 mb-1 spinner-border-sm" role="status">
                                    <span class="sr-only"></span>
                                </div>
                            </div>
                        </div>
                    </div>`;
    listofbotsMainRow.appendChild(newDiv);
    return true;
}
if (window.history.replaceState){
    window.history.replaceState(null,null,window.location.href);
}
