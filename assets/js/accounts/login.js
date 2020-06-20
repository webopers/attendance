import { firebasePrimary as firebase } from "../firebase/initialize.js";

const developmentEnvironment = window.location.href.split("/")[2];

const inputs = document.getElementsByClassName("input-group-item-text");
const loginBtn = document.getElementById("login-btn");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const showPasswordBtn = document.getElementById("show-password");

const checkLoginStatus = () => {
	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			if (user.displayName === null) {
				if (developmentEnvironment === "todos.webopers.com") window.location.href = "/information/";
				else window.location.href = "/accounts/information.html";
			} else {
				firebase
					.database()
					.ref(`users/${user.uid}`)
					.once("value")
					.then((userData) => {
						const { position: userPosition } = userData.val();
						if (userPosition === "manager") {
							window.location.href = "/";
						} else {
							window.location.href = "/shipper/";
						}
					});
			}
		}
	});
};

const changeInputStatus = (isDisabled, buttonElement) => {
	const button = buttonElement;
	Array.from(inputs).forEach((input) => {
		const inputElement = input;
		inputElement.disabled = isDisabled;
	});
	button.disabled = isDisabled;
	if (isDisabled) button.children[0].style.display = "block";
	else button.children[0].style.display = "none";
};

const showError = (inputID, message) => {
	const input = document.getElementById(inputID);
	const showPlace = input.parentElement;
	const errorElement = showPlace.children[2];
	changeInputStatus(false, loginBtn);
	showPlace.classList.add("input-group-alert");
	errorElement.innerText = message;
};

const suppressError = () => {
	const inputGroups = document.getElementsByClassName("input-group-item");
	Array.from(inputGroups).forEach((item) => {
		item.classList.remove("input-group-alert");
	});
};

const isValidEmail = (email) => {
	const atPosition = email.indexOf("@");
	const dotPosition = email.lastIndexOf(".");
	if (atPosition < 1 || dotPosition < atPosition + 2 || dotPosition + 2 >= email.length) {
		return false;
	}
	return true;
};

const doLogin = (username, password) => {
	firebase
		.auth()
		.signInWithEmailAndPassword(username, password)
		.catch((error) => {
			const errorCode = error.code;
			if (errorCode === "auth/user-not-found") {
				showError("username", "Email hoặc tên đăng nhập không tồn tại");
			} else if (errorCode === "auth/wrong-password") {
				showError("password", "Mật khẩu không chính xác");
			}
		});
};

const onLoginBtnClicked = () => {
	const username = usernameInput.value;
	const password = passwordInput.value;
	let isError = false;
	suppressError();
	changeInputStatus(true, loginBtn);
	if (username === "") {
		isError = true;
		showError("username", "Email hoặc tên đăng nhập không được phép để trống");
	} else if (isValidEmail(username) === false) {
		isError = true;
		showError("username", "Email hoặc tên đăng nhập không tồn tại");
	}
	if (password === "") {
		isError = true;
		showError("password", "Mật khẩu phải có tối thiểu 6 ký tự");
	}

	if (!isError) doLogin(username, password);
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

loginBtn.addEventListener("click", onLoginBtnClicked);
document.addEventListener("keypress", (event) => (event.keyCode === 13 ? onLoginBtnClicked() : ""));
showPasswordBtn.addEventListener("click", onShowPasswordBtnClicked);

checkLoginStatus();
