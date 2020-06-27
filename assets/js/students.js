import firebase from "./firebase/primary.js";
import Validator from "./lib/validator.js";
import Modal from "./lib/modal.js";
import Random from "./lib/random.js";
import { getTime, getDate, getDaysInMonth, increaseMonth } from "./lib/time.js";

const developmentEnvironment = window.location.href.split("/")[2] === "attendance.webopers.com";

let schoolDatabase;
let studentCount = 0;
let studentData;

const addStudent = new Modal({ modalSelector: "#add_student_modal" });
const attendanceDetail = new Modal({ modalSelector: "#attendance_detail" });
const showAddStudent = document.querySelector("#show_add_student");
const hideAddStudent = document.querySelector("#hide_add_student");
const hideAddStudentDetail = document.querySelector("#close_attendance_detail");
const random = new Random();

const clearInput = () => {
  const inputs = document.querySelectorAll("#add_form [name]:not([disabled])");
  Array.from(inputs).forEach((input) => {
    const inputElement = input;
    inputElement.value = "";
  });
};

const renderAttendance = (studentID, date = undefined) => {
  let { month, year } = getDate();
  if (date) {
    month = date.month;
    year = date.year;
  }

  const calendarDate = document.querySelector("#calendar_date");
  const nextMonth = document.querySelector("#next_month");
  const previousMonth = document.querySelector("#previous_month");

  nextMonth.onclick = () => renderAttendance(studentID, increaseMonth(1, month, year));
  previousMonth.onclick = () => renderAttendance(studentID, increaseMonth(-1, month, year));

  const attendanceData = studentData[studentID].attendance
    ? studentData[studentID].attendance[year][month]
    : {};
  const studentNameElement = document.querySelector("#student_name");
  const calendarContainer = document.querySelector(".calendar-container");
  const numberDays = getDaysInMonth(month, year);

  while (calendarContainer.firstElementChild) {
    calendarContainer.removeChild(calendarContainer.firstElementChild);
  }

  calendarDate.innerText = `Tháng ${month}, ${year}`;
  studentNameElement.innerText = `${studentData[studentID].name.firstName} ${studentData[studentID].name.lastName} `;
  for (let i = 1; i <= numberDays; i += 1) {
    const calendarBlock = document.createElement("div");
    calendarBlock.className = "calendar-block";
    calendarBlock.innerHTML = i < 10 ? `0${i}` : i;
    if (attendanceData && attendanceData[i]) {
      calendarBlock.innerHTML = `
        <div class="text-center">
          ${i < 10 ? `0${i}` : i}
          <div class="" style="font-size: 14px;">07:46 - 36.5 &deg;C</>
        </div>
      `;
      calendarBlock.classList.add("yes");
    }
    calendarContainer.appendChild(calendarBlock);
  }
  for (let i = numberDays + 1; i <= 35; i += 1) {
    const calendarBlock = document.createElement("div");
    calendarBlock.className = "calendar-block";
    calendarContainer.appendChild(calendarBlock);
  }
  attendanceDetail.show();
};

const onSubmit = (data) => {
  const { name, class: className, phone } = data;
  const nameArr = name.split(" ");
  const lastName = nameArr.pop();
  const firstName = nameArr.join(" ");
  const studentID = random.string(28, "all");
  const studentDataForSet = {
    name: {
      firstName,
      lastName,
    },
    class: className,
    phone,
  };
  schoolDatabase.child(`students/${studentID}`).set(studentDataForSet);
  schoolDatabase.child("statistic").update({ student: studentCount });
  clearInput();
  addStudent.hide();
};

showAddStudent.onclick = () => addStudent.show();
hideAddStudent.onclick = () => addStudent.hide();
hideAddStudentDetail.onclick = () => attendanceDetail.hide();

Validator({
  form: "#add_form",
  errorSelector: ".form-message",
  rules: [
    Validator.isRequired("#name", "Họ và tên không được phép để trống"),
    Validator.isRequired("#class", "Lớp không được phép để trống"),
    Validator.isRequired("#phone", "Số điện thoại không được phép để trống"),
    Validator.isPhone("#phone", "Số điện thoại không hợp lệ"),
  ],
  onSubmit,
});

const render = (data) => {
  const studentContainer = document.querySelector("#student_container");
  while (studentContainer.firstElementChild) {
    studentContainer.removeChild(studentContainer.firstElementChild);
  }
  studentCount = 0;
  Object.keys(data).forEach((studentID) => {
    const { name, class: className, phone } = data[studentID];
    const rowElement = document.createElement("div");
    studentCount += 1;
    rowElement.className = "list-group-item list-group-item-action rounded";
    rowElement.innerHTML = `
      <div class="row d-flex align-items-center">
        <div class="col-lg-4">${name.firstName} ${name.lastName}</div>
        <div class="col-lg-2">${className}</div>
        <div class="col-lg-2">0</div>
        <div class="col-lg-2">${phone}</div>
        <div class="col-lg-2 text-right">
          <button class="btn btn-sm btn-light">
            <i class="fal fa-user-edit ml-1 mr-1"></i>
            Edit
          </button>
        </div>
      </div>
    `;
    rowElement.onclick = () => renderAttendance(studentID);
    studentContainer.prepend(rowElement);
  });
  document.querySelector(".list-loading").classList.add("d-none");
};

const getData = () => {
  schoolDatabase.child("students").on("value", (data) => {
    studentData = data.val();
    render(studentData);
  });
};

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
        const { position: userPosition, schoolID } = dataSnapshot.val();
        const logout = document.querySelector("#logout");

        if (userPosition === "manager") window.location.href = "/manager/";

        schoolDatabase = firebase.database().ref("schools").child(schoolID);

        getData();

        logout.onclick = () => {
          firebase.auth().signOut();
        };
      });
  }
});
