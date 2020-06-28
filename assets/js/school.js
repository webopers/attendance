import firebase from "./firebase/primary.js";
import Random from "./lib/random.js";
import { getTime, getDate, getDaysInMonth, increaseMonth, convertToCustomTime } from "./lib/time.js";
import { sort } from "./lib/sort.js";

const developmentEnvironment = window.location.href.split("/")[2] === "attendance.webopers.com";
const random = new Random();
const randomAttendanceBtn = document.querySelector("#random_attendance");

let schoolDatabase;
let schoolData;

const renderDetail = (date) => {
  const { day, month, year } = date;
  const { students, attendance } = schoolData;
  // let { students } = schoolData;
  if (attendance && attendance[year] && attendance[year][month] && attendance[year][month][day]) {
    const attendanceData = attendance[year][month][day];
    const detailContainer = document.querySelector("#attendance_realtime_detail");
    let studentsAttendance = {};

    Object.keys(attendanceData.detail).forEach((studentID) => {
      const { attendance: studentAttendance, name, class: className } = students[studentID];
      const { time, temperature } = studentAttendance[year][month][day];
      studentsAttendance[studentID] = {
        name,
        class: className,
        time,
        temperature,
      };
    });

    studentsAttendance = sort(studentsAttendance, "time");

    while (detailContainer.firstElementChild) {
      detailContainer.removeChild(detailContainer.firstElementChild);
    }

    document.querySelector("#attendance_realtime_list").classList.remove("d-none");
    document.querySelector("#attendance_detail").classList.add("d-none");
    document.querySelector("#attendance_detail").classList.remove("d-flex");

    Object.keys(studentsAttendance).forEach((studentID) => {
      const { name, class: className, time, temperature } = studentsAttendance[studentID];
      const { hours, minutes } = convertToCustomTime(time, "hh:mm");
      const { firstName, lastName } = name;
      const listItem = document.createElement("div");
      listItem.className = "list-group-item list-group-item-action rounded d-flex align-items-center";
      listItem.innerHTML = `
        <div class="col-lg-6">
          ${firstName} ${lastName}
        </div>
        <div class="col-lg-3">${className}</div>
        <div class="col-lg-3 text-right">${hours}:${minutes} - ${temperature || 37.5} &deg;C</div>
      `;
      if (temperature > 37.5) {
        listItem.classList.add("text-danger");
        listItem.classList.add("border");
        listItem.classList.add("border-danger");
      }
      detailContainer.appendChild(listItem);
    });
  }
};

const render = (date = undefined) => {
  const { attendance } = schoolData;
  const { month, year } = date || getDate();
  const daysNumber = getDaysInMonth(month, year);
  const calendarContainer = document.querySelector(".calendar-container");
  const calendarDate = document.querySelector("#calendar_date");
  const studentsNumber = Object.keys(schoolData.students || {}).length;
  const nextMonth = document.querySelector("#next_month");
  const previousMonth = document.querySelector("#previous_month");

  let attendanceMonth = {};

  while (calendarContainer.firstElementChild) {
    calendarContainer.firstElementChild.removeEventListener("click", renderDetail);
    calendarContainer.removeChild(calendarContainer.firstElementChild);
  }

  nextMonth.onclick = () => render(increaseMonth(1, month, year));
  previousMonth.onclick = () => render(increaseMonth(-1, month, year));

  if (attendance && attendance[year]) attendanceMonth = attendance[year][month];
  calendarDate.innerText = `Tháng ${month}, ${year}`;
  for (let i = 1; i <= daysNumber; i += 1) {
    const calendarBlock = document.createElement("div");
    calendarBlock.className = "calendar-block";
    calendarBlock.addEventListener("click", () => renderDetail({ day: i, month, year }));
    calendarBlock.innerHTML = i < 10 ? `0${i}` : i;
    if (attendanceMonth && attendanceMonth[i]) {
      const { detail: attendanceData, statistic } = attendanceMonth[i];
      const attendanceCount = Object.keys(attendanceData).length;
      if (statistic.highTemperature > 0) calendarBlock.classList.add("no");
      else if (attendanceCount === studentsNumber) calendarBlock.classList.add("yes");
      calendarBlock.innerHTML = `
        <div class="text-center">
          ${i < 10 ? `0${i}` : i}
          <div class="" style="font-size: 14px;">
            &check; ${attendanceCount} / ${studentsNumber}
            ${statistic.highTemperature > 0 ? ` - &#9888; ${statistic.highTemperature}` : ""}
          </div>
        </div>
      `;
    }
    calendarContainer.appendChild(calendarBlock);
    document.querySelector(".list-loading").classList.add("d-none");
    document.querySelector(".list-loading").classList.remove("d-flex");
  }
  for (let i = daysNumber; i < 35; i += 1) {
    const calendarBlock = document.createElement("div");
    calendarBlock.className = "calendar-block";
    calendarContainer.appendChild(calendarBlock);
  }
};

const getData = () => {
  schoolDatabase.on("value", (data) => {
    schoolData = data.val();
    if (schoolData) render();
  });
};

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

randomAttendanceBtn.onclick = async () => {
  const { students } = schoolData;
  const { date, month, year } = getDate();
  // const date = 23;
  const attendanceData = {};
  const studentsID = Object.keys(students);
  const studentsCount = studentsID.length;

  const detailContainer = document.querySelector("#attendance_realtime_detail");

  let absent = 0;
  let fever = 0;

  document.querySelector("#attendance_realtime_list").classList.remove("d-none");
  document.querySelector("#attendance_detail").classList.add("d-none");
  document.querySelector("#attendance_detail").classList.remove("d-flex");

  while (detailContainer.firstElementChild) {
    detailContainer.removeChild(detailContainer.firstElementChild);
  }

  for (let i = 0; i < studentsCount; i += 1) {
    const randomPosition = random.number(0, studentsID.length);
    const attendanceStatus = random.number(0, 100) < 98;
    const temperature = random.number(0, 100) < 99 ? 37.5 : random.number(38, 40);
    if (attendanceStatus) {
      const { name, class: className } = students[studentsID[randomPosition]];
      const { firstName, lastName } = name;
      const listItem = document.createElement("div");
      const time = getTime("miliseconds");
      const { hours, minutes } = convertToCustomTime(time, "hh:mm");
      listItem.className = "list-group-item list-group-item-action rounded d-flex align-items-center";
      listItem.innerHTML = `
        <div class="col-lg-6">
          ${firstName} ${lastName}
        </div>
        <div class="col-lg-3">${className}</div>
        <div class="col-lg-3 text-right">${hours}:${minutes} - ${temperature || 37.5} &deg;C</div>
      `;
      if (temperature > 37.5) {
        listItem.classList.add("text-danger");
        listItem.classList.add("border");
        listItem.classList.add("border-danger");
      }
      detailContainer.prepend(listItem);
      if (temperature > 37.5) fever += 1;
      attendanceData.statistic = {
        absent,
        fever,
        highTemperature: fever,
      };
      attendanceData.detail = {
        [[studentsID[randomPosition]]]: studentsID[randomPosition],
        ...attendanceData.detail,
      };
      schoolDatabase.child(`students/${studentsID[randomPosition]}/attendance/${year}/${month}/${date}`).set({
        time,
        temperature,
      });
      schoolDatabase.child(`attendance/${year}/${month}/${date}`).set(attendanceData);
    } else absent += 1;
    studentsID.splice(randomPosition, 1);
    await timer(Math.random(0, 1) * 1000);
  }
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
