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
const SignupButton = document.getElementById('SignupButton');
const LoginButton = document.getElementById('LoginButton');
const LoginFormContainer = document.getElementById('LoginFormContainer');
const SignupFormContainer = document.getElementById('SignupFormContainer');
SignupButton.addEventListener("click", function () {
    LoginFormContainer.classList.remove("display");
    LoginFormContainer.classList.add("nodisplay");
    SignupFormContainer.classList.remove("nodisplay");
    SignupFormContainer.classList.add("display");
});
LoginButton.addEventListener("click", function () {
    SignupFormContainer.classList.remove("display");
    SignupFormContainer.classList.add("nodisplay");
    LoginFormContainer.classList.remove("nodisplay");
    LoginFormContainer.classList.add("display");
});

function allLetter(input) {
    var letters = /^[A-Za-z]+$/;
    if (input.match(letters)) {
        return false;
    }
    else {
        return true;
    }
}