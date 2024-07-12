function validateHide()
{
    var a = document.getElementById("form");
    a.submit();
    a.classList.add("nodisplay");
    a.classList.remove("display");
    const note = document.createElement("p");
    const node = document.createTextNode("Searching and Scraping!");
    note.appendChild(node);
    document.getElementById("searching").appendChild(note);
}