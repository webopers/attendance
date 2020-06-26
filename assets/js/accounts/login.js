import firebase from "../firebase/primary.js";
import Validator from "../lib/validator.js";

const developmentEnvironment = window.location.href.split("/")[2];

const inputs = document.getElementsByClassName("input-group-item-text");
const showPasswordBtn = document.getElementById("show-password");

const checkLoginStatus = () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const userDatabase = firebase.database().ref("users").child(user.uid);
      userDatabase.once("value").then((data) => {
        const userData = data.val();
        const { position, password } = userData;
        if (!password) {
          window.location.href = "/accounts/change-password.html";
        } else if (position === "manager") window.location.href = "/manager/";
        else if (position === "school") window.location.href = "/";
      });
    }
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

const showError = (inputSelector, message) => {
  const { parentElement } = document.querySelector(inputSelector);
  parentElement.classList.add("invalid");
  parentElement.querySelector(".form-message").innerText = message;
  parentElement.querySelector(".form-input").focus();
};

const changeInputsStatus = (disabled, selectors, spinnerSelector) => {
  selectors.forEach((selector) => {
    const inputElement = document.querySelector(selector);
    inputElement.disabled = disabled;
  });
  document.querySelector(spinnerSelector).style.display = disabled ? "block" : "none";
};

const doLogin = (formData) => {
  const { email, password } = formData;
  const selectors = [["#email", "#password", "#login"], ".auth-form-btn-spinner"];
  changeInputsStatus(true, ...selectors);
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .catch((error) => {
      const { code: errorCode } = error;
      if (errorCode === "auth/user-not-found") {
        changeInputsStatus(false, ...selectors);
        showError("#email", "Email chưa được sử dụng cho bất kỳ tài khoản nào");
      } else if (errorCode === "auth/wrong-password") {
        changeInputsStatus(false, ...selectors);
        showError("#password", "Mật khẩu của bạn không chính xác");
      }
    });
};

const validator = new Validator({
  form: "#form",
  errorSelector: ".form-message",
  rules: [
    Validator.isRequired("#email", "Email không được phép để trống"),
    Validator.isEmail("#email"),
    Validator.minLength("#password", 6, "Mật khẩu phải chứa tối thiểu 6 ký tự"),
  ],
  onSubmit: doLogin,
});

document.addEventListener("keypress", (event) => (event.keyCode === 13 ? validator.validate : ""));
showPasswordBtn.addEventListener("click", onShowPasswordBtnClicked);

checkLoginStatus();
