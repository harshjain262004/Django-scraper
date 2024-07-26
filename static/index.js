function Client_Side_Signup_Validate() {
    const form = document.getElementById("Signupform");
    const pass1 = document.getElementById("pass1").value;
    const pass2 = document.getElementById("pass2").value;
    const errorSignupMessage = document.getElementById("ErrorSignup");
    if (pass1 != pass2) {
        errorSignupMessage.textContent = "Both the passwords need to be same";
        return false;
    }
    const fname = document.getElementById("fname").value;
    const lname = document.getElementById("lname").value;
    if (allLetter(fname)) {
        errorSignupMessage.textContent = "First Name should be all alphabets";
        return false;
    }
    if (allLetter(lname)) {
        errorSignupMessage.textContent = "Last Name should be all alphabets";
        return false;
    }
    return true;
}

function allLetter(input) {
    var letters = /^[A-Za-z]+$/;
    if (input.match(letters)) {
        return false;
    }
    else {
        return true;
    }
}

window.setTimeout("closeMsgDiv();", 3000);
    function closeMsgDiv() {
      const msg_div = document.getElementById("msgDiv");
      msg_div.style.display = "none";
    }