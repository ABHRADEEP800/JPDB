// JPDB Configuration
const jpdbBaseURL = "http://api.login2explore.com:5577";
const jpdbIRL = "/api/irl";
const jpdbIML = "/api/iml";
const empDBName = "SCHOOL-DB";
const empRelationName = "STUDENT-TABLE";
const connToken = "90934579|-31949263|90956650"; // Put Your Connection token for JPDB

function showStatus(message, type = "success") {
  const statusElement = $("#statusMessage");
  const statusText = $("#statusText");
  statusText.text(message);
  statusElement.removeClass("alert-success alert-info alert-danger");
  statusElement.addClass(`alert-${type}`);
  statusElement.css("display", "block");
  statusElement.css("animation", "slideIn 0.5s forwards");
  setTimeout(() => {
    statusElement.css("animation", "fadeOut 0.5s forwards");
    setTimeout(() => {
      statusElement.css("display", "none");
    }, 500);
  }, 5000);
}

const saveRecNo2LS = (jsonObj) => {
  const lvData = JSON.parse(jsonObj.data);
  localStorage.setItem("recno", lvData.rec_no);
};

const getRollNoAsJsonObj = () => {
  const rollno = $("#rollno").val();
  return JSON.stringify({ id: rollno });
};

const fillData = (jsonObj) => {
  saveRecNo2LS(jsonObj);
  const record = JSON.parse(jsonObj.data).record;
  $("#studentName").val(record.name);
  $("#studentClass").val(record.class);
  $("#birthDate").val(record.birthDate);
  $("#address").val(record.address);
  $("#enrollmentDate").val(record.enrollmentDate);
  showStatus("Student record loaded successfully!", "info");
};

const resetForm = () => {
  $("#rollno, #studentName, #birthDate, #address, #enrollmentDate").val("");
  $("#studentClass").val("");
  $("#rollno").prop("disabled", false);
  $("#save, #update, #reset").prop("disabled", true);
  $("input:not(#rollno), #studentClass").prop("disabled", true);
  $("#rollno").focus();
  showStatus("Form has been reset", "info");
};

const validateData = () => {
  const rollno = $("#rollno").val();
  const studentName = $("#studentName").val();
  const studentClass = $("#studentClass").val();
  const birthDate = $("#birthDate").val();
  const address = $("#address").val();
  const enrollmentDate = $("#enrollmentDate").val();

  if (!rollno) {
    showStatus("Roll No. is missing", "danger");
    $("#rollno").focus();
    return "";
  }
  if (!studentName) {
    showStatus("Student name is missing", "danger");
    $("#studentName").focus();
    return "";
  }
  if (!studentClass) {
    showStatus("Student class is missing", "danger");
    $("#studentClass").focus();
    return "";
  }
  if (!birthDate) {
    showStatus("Date of birth is missing", "danger");
    $("#birthDate").focus();
    return "";
  }
  if (!address) {
    showStatus("Address is missing", "danger");
    $("#address").focus();
    return "";
  }
  if (!enrollmentDate) {
    showStatus("Date of enrollment is missing", "danger");
    $("#enrollmentDate").focus();
    return "";
  }

  const jsonStrObj = {
    id: rollno,
    name: studentName,
    class: studentClass,
    birthDate: birthDate,
    address: address,
    enrollmentDate: enrollmentDate,
  };

  return JSON.stringify(jsonStrObj);
};

const getStudent = () => {
  const rollJsonObj = getRollNoAsJsonObj();
  const getRequest = createGET_BY_KEYRequest(
    connToken,
    empDBName,
    empRelationName,
    rollJsonObj
  );

  jQuery.ajaxSetup({ async: false });
  const resJsonObj = executeCommandAtGivenBaseUrl(
    getRequest,
    jpdbBaseURL,
    jpdbIRL
  );
  jQuery.ajaxSetup({ async: true });

  if (resJsonObj.status === 400) {
    $("#rollno").prop("disabled", true);
    $("#save, #reset").prop("disabled", false);
    $("input:not(#rollno), #studentClass").prop("disabled", false);
    $("#studentName").focus();
    showStatus("New student record. Please fill in the details.", "info");
  } else if (resJsonObj.status === 200) {
    $("#rollno").prop("disabled", true);
    fillData(resJsonObj);
    $("#update, #reset").prop("disabled", false);
    $("input:not(#rollno), #studentClass").prop("disabled", false);
    $("#studentName").focus();
  }
};

const saveData = () => {
  const jsonStrObj = validateData();
  if (!jsonStrObj) return "";

  const putRequest = createPUTRequest(
    connToken,
    jsonStrObj,
    empDBName,
    empRelationName
  );

  jQuery.ajaxSetup({ async: false });
  const resJsonObj = executeCommandAtGivenBaseUrl(
    putRequest,
    jpdbBaseURL,
    jpdbIML
  );
  jQuery.ajaxSetup({ async: true });

  if (resJsonObj.status === 200) {
    showStatus("Student record saved successfully!", "success");
    setTimeout(() => {
      resetForm();
    }, 5000);
  } else {
    showStatus("Error saving student record: " + resJsonObj.message, "danger");
  }
};

const changeData = () => {
  $("#update").prop("disabled", true);
  const jsonChg = validateData();
  if (!jsonChg) return "";

  const updateRequest = createUPDATERecordRequest(
    connToken,
    jsonChg,
    empDBName,
    empRelationName,
    localStorage.getItem("recno")
  );

  jQuery.ajaxSetup({ async: false });
  const resJsonObj = executeCommandAtGivenBaseUrl(
    updateRequest,
    jpdbBaseURL,
    jpdbIML
  );
  jQuery.ajaxSetup({ async: true });

  if (resJsonObj.status === 200) {
    showStatus("Student record updated successfully!", "success");
    setTimeout(() => {
      resetForm();
    }, 5000);
  } else {
    showStatus(
      "Error updating student record: " + resJsonObj.message,
      "danger"
    );
    $("#update").prop("disabled", false);
  }
};

$(document).ready(function () {
  resetForm();
  showStatus("Welcome to Student Enrollment System!", "info");
});
