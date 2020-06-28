import firebase from "./firebase/primary.js";
import firebaseSecondary from "./firebase/secondary.js";
import Validator from "./lib/validator.js";
import Modal from "./lib/modal.js";
import Random from "./lib/random.js";
import { getTime } from "./lib/time.js";
import MD5 from "./lib/md5.js";
import SinglyLinkedList from "./lib/linked-list.js";

const developmentEnvironment = window.location.href.split("/")[2] === "attendance.webopers.com";

let schoolDatabase;
const schoolLinkedList = new SinglyLinkedList();

const modal = new Modal({ modalSelector: "#add_school_modal" });
const resultModal = new Modal({ modalSelector: "#school_result_data_modal" });
const random = new Random();
const closeAddFormBtn = document.querySelector("#close_modal");
const closeResultSchoolBtn = document.querySelector("#close_result_school");
const showAddFormBtn = document.querySelector("#show_modal");
const addSchoolInputs = document.querySelectorAll("[name]:not([disabled])");
const searchSchool = document.querySelector("#search_school");

const removeElement = (school) => {
  const removeID = schoolLinkedList.remove(school);
  schoolDatabase.child(removeID).remove();
  render();
};

const appendElement = (parentElement, schoolData) => {
  const { name, phone, address } = schoolData.information;
  const { students } = schoolData;
  const rowElement = document.createElement("div");
  const dataElement = `
    <div class="row">
      <div class="col-lg-4">${name}</div>
      <div class="col-lg-5">${address}</div>
      <div class="col-lg-1">${students ? Object.keys(students).length : 0}</div>
      <div class="col-lg-2 text-right">
        ${phone}
        <button type="button" class="close ml-3" id="hide_add_student">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  `;
  rowElement.addEventListener("click", () => removeElement(schoolData, parentElement, dataElement));
  rowElement.className = "list-group-item list-group-item-action rounded";
  rowElement.innerHTML = dataElement;
  parentElement.appendChild(rowElement);
};

const render = () => {
  const containerElement = document.querySelector("#data_container");
  schoolLinkedList.print(appendElement, containerElement);
  document.querySelector(".list-loading").classList.add("d-none");
};

const getData = () => {
  schoolDatabase.once("value").then((data) => {
    const schoolData = data.val();
    if (schoolData) {
      Object.keys(schoolData).forEach((schoolID) => {
        schoolLinkedList.insert({ id: schoolID, ...schoolData[schoolID] });
      });
      render();
    }
  });
};

const clearInput = () => {
  const inputs = Array.from(addSchoolInputs);
  inputs.forEach((input) => {
    const inputElement = input;
    inputElement.value = "";
  });
};

const disabledInputs = (disabled) => {
  const inputs = Array.from(addSchoolInputs);
  const addBtn = document.querySelector("#add_school_btn");
  const spinner = addBtn.querySelector(".spinner-border");
  inputs.forEach((input) => {
    const inputElement = input;
    inputElement.disabled = disabled;
  });
  addBtn.disabled = disabled;
  if (disabled) spinner.classList.remove("d-none");
  else spinner.classList.add("d-none");
};

const showSchoolResult = (email, password) => {
  const emailElement = document.querySelector("#school_email");
  const passwordElement = document.querySelector("#school_password");
  emailElement.value = email;
  passwordElement.value = password;
};

const onSubmit = (data) => {
  const { name, address, phone } = data;
  const schoolID = random.string(28, "all");
  const time = getTime("miliseconds");
  const email = `${random.string(8, "number", "ATSC")}@webopers.com`;
  const password = random.string(8, "all", "#PW");
  disabledInputs(true);
  firebaseSecondary
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then(() => {
      const newSchool = firebaseSecondary.auth().currentUser;
      const users = firebaseSecondary.database().ref("users").child(newSchool.uid);
      const school = firebaseSecondary.database().ref("schools").child(schoolID);
      const userData = {
        position: "school",
        schoolID,
        password: {
          hash: MD5(password),
          change: false,
        },
        updated: {
          information: time,
          password: time,
        },
      };
      const schoolData = {
        information: {
          name,
          address,
          phone,
        },
        statistic: {
          student: 0,
          class: 0,
        },
      };
      users.set(userData);
      school.set(schoolData);
      firebaseSecondary.auth().signOut();
      clearInput();
      disabledInputs(false);
      showSchoolResult(email, password);
      resultModal.show();
      modal.hide();
      schoolLinkedList.insert(schoolData);
      render();
    });
};

showAddFormBtn.onclick = () => modal.show();
closeAddFormBtn.onclick = () => modal.hide();
closeResultSchoolBtn.onclick = () => resultModal.hide();
searchSchool.oninput = () => {
  const searchValue = searchSchool.value.trim();
  const containerElement = document.querySelector("#data_container");
  if (searchValue.length > 0) schoolLinkedList.search(searchValue, containerElement, appendElement);
  else render();
};

Validator({
  form: "#add_form",
  errorSelector: ".form-message",
  rules: [
    Validator.isRequired("#name", "Tên trường không được phép để trống"),
    Validator.isRequired("#address", "Địa chỉ không được phép để trống"),
    Validator.isRequired("#phone", "Số điện thoại không được phép để trống"),
    Validator.isPhone("#phone", "Số điện thoại không hợp lệ"),
  ],
  onSubmit,
});

firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    if (!developmentEnvironment) window.location.href = "/accounts/login.html";
    else window.location.href = "/login/";
  } else {
    firebase
      .database()
      .ref(`/users/${user.uid}`)
      .once("value")
      .then((dataSnapshot) => {
        const { position: userPosition } = dataSnapshot.val();
        const logout = document.querySelector("#logout");

        schoolDatabase = firebase.database().ref("schools");

        if (userPosition === "school") window.location.href = "/";

        getData();

        logout.onclick = () => {
          firebase.auth().signOut();
        };
      });
  }
});
