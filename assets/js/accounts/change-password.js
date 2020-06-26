import firebase from "../firebase/primary.js";
import Validator from "../lib/validator.js";

const developmentEnvironment = window.location.href.split("/")[2] !== "attendance.webopers.com";

const inputs = document.getElementsByClassName("input-group-item-text");
const showPasswordBtn = document.getElementById("show-password");
let userPosition;

const checkLoginStatus = () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const userDatabase = firebase.database().ref("users").child(user.uid);
      userDatabase.once("value").then((data) => {
        const userData = data.val();
        const { position, password } = userData;
        userPosition = position;
        if (password && position === "manager") window.location.href = "/manager/";
        else if (password && position === "school") window.location.href = "/";
      });
    } else if (developmentEnvironment) window.location.href = "/accounts/login.html";
    else window.location.href = "/login/";
  });
};

const onShowPasswordBtnClicked = (event) => {
  const clickElement = event.target;
  const passwordInputs = Object.values(inputs).filter((input) => input.dataset.type === "password");
  if (clickElement.dataset.action === "show") {
    passwordInputs.forEach((input) => {
      const inputElement = input;
      inputElement.type = "text";
    });
    clickElement.dataset.action = "hide";
    clickElement.classList.remove("fa-eye-slash");
    clickElement.classList.add("fa-eye");
  } else {
    passwordInputs.forEach((input) => {
      const inputElement = input;
      inputElement.type = "password";
    });
    clickElement.dataset.action = "show";
    clickElement.classList.add("fa-eye-slash");
    clickElement.classList.remove("fa-eye");
  }
};

// const showError = (inputSelector, message) => {
//   const { parentElement } = document.querySelector(inputSelector);
//   parentElement.classList.add("invalid");
//   parentElement.querySelector(".form-message").innerText = message;
//   parentElement.querySelector(".form-input").focus();
// };

const changeInputsStatus = (disabled, selectors, spinnerSelector) => {
  selectors.forEach((selector) => {
    const inputElement = document.querySelector(selector);
    inputElement.disabled = disabled;
  });
  document.querySelector(spinnerSelector).style.display = disabled ? "block" : "none";
};

const doChange = (formData) => {
  const user = firebase.auth().currentUser;
  const { password } = formData;
  const selectors = [["#password", "#confirm_password", "#change"], ".auth-form-btn-spinner"];
  changeInputsStatus(true, ...selectors);
  user.updatePassword(password).then(() => {
    const userPasswordStatus = firebase.database().ref("users").child(user.uid).child("password");
    userPasswordStatus.set(true);
    if (userPosition === "manager") window.location.href = "/manager/";
    else if (userPosition === "school") window.location.href = "/";
  });
};

const validator = new Validator({
  form: "#form",
  errorSelector: ".form-message",
  rules: [
    Validator.isRequired("#password", "Mật khẩu không được phép để trống"),
    Validator.isRequired("#confirm_password", "Mật khẩu không được phép để trống"),
    Validator.minLength("#password", 6, "Mật khẩu phải chứa tối thiểu 6 ký tự"),
    Validator.isConfirmed("#confirm_password", () => document.querySelector("#form #password").value),
  ],
  onSubmit: doChange,
});

document.addEventListener("keypress", (event) => (event.keyCode === 13 ? validator.validate : ""));
showPasswordBtn.addEventListener("click", onShowPasswordBtnClicked);

checkLoginStatus();
