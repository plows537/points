const themeToggle = document.getElementById("themeToggle");
let isDarkMode = true;

themeToggle.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    applyTheme();
});

function applyTheme() {
    const svg = themeToggle.querySelector('.theme-icon');
    if (isDarkMode) {
        document.body.classList.add("dark-mode");
        document.body.classList.remove("light-mode");
        svg.innerHTML = '<path d="M565-395q35-35 35-85t-35-85q-35-35-85-35t-85 35q-35 35-35 85t35 85q35 35 85 35t85-35Zm-226.5 56.5Q280-397 280-480t58.5-141.5Q397-680 480-680t141.5 58.5Q680-563 680-480t-58.5 141.5Q563-280 480-280t-141.5-58.5ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z"/>';
    } else {
        document.body.classList.add("light-mode");
        document.body.classList.remove("dark-mode");
        svg.innerHTML = '<path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z"/>';
    }
}

applyTheme();

let settings = { warningThreshold: 3, pointDeduction: 10 };
let confirmCallback = null;
let classIdCounter = 0;
let classes = {};
let currentClassId = null;
let currentAddStudentClassId = null;

const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const addClassBtn = document.getElementById("addClassBtn");
const addClassModal = document.getElementById("addClassModal");
const addStudentModal = document.getElementById("addStudentModal");

settingsBtn.addEventListener("click", openSettingsModal);
addClassBtn.addEventListener("click", () => {
    document.getElementById("classNameInput").value = "";
    addClassModal.classList.add("active");
    document.getElementById("classNameInput").focus();
});

document.getElementById("classNameInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") createClass();
});

document.getElementById("studentNameInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") addStudentFromModal();
});

function openSettingsModal() {
    document.getElementById("warningThreshold").value = settings.warningThreshold;
    document.getElementById("pointDeduction").value = settings.pointDeduction;
    settingsModal.classList.add("active");
}

function closeSettingsModal() {
    settingsModal.classList.remove("active");
}

function saveSettings() {
    settings.warningThreshold = parseInt(document.getElementById("warningThreshold").value);
    settings.pointDeduction = parseInt(document.getElementById("pointDeduction").value);
    saveToLocalStorage();
    closeSettingsModal();
}

function showConfirm(title, message, callback) {
    document.getElementById("confirmTitle").textContent = title;
    document.getElementById("confirmMessage").textContent = message;
    confirmCallback = callback;
    document.getElementById("confirmModal").classList.add("active");
}

function confirmAction() {
    if (confirmCallback) confirmCallback();
    document.getElementById("confirmModal").classList.remove("active");
    confirmCallback = null;
}

function cancelConfirm() {
    document.getElementById("confirmModal").classList.remove("active");
    confirmCallback = null;
}

function closeAddClassModal() {
    addClassModal.classList.remove("active");
}

function closeAddStudentModal() {
    addStudentModal.classList.remove("active");
    document.getElementById("studentNameInput").value = "";
}

function openAddStudentModal(classId) {
    currentAddStudentClassId = classId;
    document.getElementById("studentNameInput").value = "";
    addStudentModal.classList.add("active");
    document.getElementById("studentNameInput").focus();
}

function createClass() {
    const className = document.getElementById("classNameInput").value.trim();
    if (!className) {
        alert("Please enter a class name");
        return;
    }
    addNewClass(className);
    closeAddClassModal();
}

function addNewClass(className) {
    const classId = classIdCounter++;
    classes[classId] = { name: className, students: {} };
    saveToLocalStorage();
    renderClassTabs();
    switchToClass(classId);
}

function deleteClass(classId) {
    showConfirm(
        "Delete Class",
        `Are you sure you want to delete "${classes[classId].name}"?`,
        () => {
            delete classes[classId];
            saveToLocalStorage();
            renderClassTabs();
            const remainingClassId = Object.keys(classes)[0];
            if (remainingClassId !== undefined) {
                switchToClass(remainingClassId);
            } else {
                document.getElementById("classesContainer").innerHTML = '';
            }
        }
    );
}

function renderClassTabs() {
    const tabsContainer = document.getElementById("classTabs");
    tabsContainer.innerHTML = "";
    Object.entries(classes).forEach(([classId, classData]) => {
        const tab = document.createElement("button");
        tab.className = "tab-btn";
        tab.setAttribute("data-class-id", classId);
        tab.innerHTML = `${classData.name}`;
        tab.addEventListener("click", () => switchToClass(classId));
        tabsContainer.appendChild(tab);
    });
}

function switchToClass(classId) {
    currentClassId = classId;
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelector(`[data-class-id="${classId}"]`).classList.add("active");
    renderClassContent(classId);
}

const viewToggle = document.getElementById("viewToggle");
let isListMode = localStorage.getItem("pointTrackerViewMode") === "list" ? true : false;

viewToggle.addEventListener("click", () => {
    isListMode = !isListMode;
    localStorage.setItem("pointTrackerViewMode", isListMode ? "list" : "grid");
    toggleViewMode();
});

function toggleViewMode() {
    const grid = document.querySelector(".students-grid");
    if (grid) {
        if (isListMode) {
            grid.classList.add("list-mode");
            viewToggle.title = "Switch to Grid View";
        } else {
            grid.classList.remove("list-mode");
            viewToggle.title = "Switch to List View";
        }
    }
}

// Update renderClassContent to call this after rendering
function renderClassContent(classId) {
    const classData = classes[classId];
    const container = document.getElementById("classesContainer");
    let html = `<div class="mode-content active">`;
    
    const studentIds = Object.keys(classData.students);
    if (studentIds.length === 0) {
        html += `<div class="empty-state"><p>No students yet. Add one to get started!</p></div>`;
    } else {
        html += `<div class="students-grid">`;
        studentIds.forEach(studentId => {
            const student = classData.students[studentId];
            html += createStudentBox(classId, studentId, student);
        });
        html += `</div>`;
    }
    html += `<div class="class-footer"><button class="add-student-btn" onclick="openAddStudentModal(${classId})">+ Add Student</button><button class="reset-warnings-btn" onclick="resetAllWarnings(${classId})">Reset Warnings</button><button class="delete-class-btn" onclick="deleteClass(${classId})">Delete Class</button></div></div>`;
    container.innerHTML = html;
    
    // Apply view mode immediately after rendering (no animation)
    toggleViewMode();
}

function createStudentBox(classId, studentId, student) {
    return `<div class="student-box"><h2 class="student-name">${student.name}</h2><div class="points-display">${student.points}</div><div class="warnings-display">Warnings: ${student.warnings}</div><div class="student-buttons"><button onclick="addPoint(${classId}, ${studentId})" class="plus-btn">+</button><button onclick="subtractPoint(${classId}, ${studentId})" class="minus-btn">−</button><button onclick="addWarning(${classId}, ${studentId})" class="warning-btn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm330.5-51.5Q520-263 520-280t-11.5-28.5Q497-320 480-320t-28.5 11.5Q440-297 440-280t11.5 28.5Q463-240 480-240t28.5-11.5ZM440-360h80v-200h-80v200Zm40-100Z"/></svg></button></div><div class="warning-area"><div class="warning-indicator"></div></div><button class="student-delete-btn" onclick="deleteStudent(${classId}, ${studentId})">✕</button></div>`;
}

function addStudent(classId) {
    const name = document.getElementById("studentNameInput").value.trim();
    if (!name) {
        alert("Please enter a student name");
        return;
    }
    const studentId = Object.keys(classes[classId].students).length;
    classes[classId].students[studentId] = { name: name, points: 0, warnings: 0 };
    saveToLocalStorage();
    renderClassContent(classId);
    closeAddStudentModal();
}

function addStudentFromModal() {
    addStudent(currentAddStudentClassId);
}

function deleteStudent(classId, studentId) {
    const student = classes[classId].students[studentId];
    showConfirm(
        "Delete Student",
        `Are you sure you want to delete "${student.name}"?`,
        () => {
            delete classes[classId].students[studentId];
            saveToLocalStorage();
            renderClassContent(classId);
        }
    );
}

function addPoint(classId, studentId) {
    classes[classId].students[studentId].points++;
    saveToLocalStorage();
    renderClassContent(classId);
}

function subtractPoint(classId, studentId) {
    classes[classId].students[studentId].points--;
    saveToLocalStorage();
    renderClassContent(classId);
}

function addWarning(classId, studentId) {
    const student = classes[classId].students[studentId];
    student.warnings++;

    if (student.warnings % settings.warningThreshold === 0) {
        student.points -= settings.pointDeduction;
        student.warnings = 0;
    }

    saveToLocalStorage();
    renderClassContent(classId);
}

function resetAllWarnings(classId) {
    showConfirm(
        "Reset Warnings",
        `Reset all warnings for "${classes[classId].name}"?`,
        () => {
            Object.values(classes[classId].students).forEach(student => {
                student.warnings = 0;
            });
            saveToLocalStorage();
            renderClassContent(classId);
        }
    );
}

// Local Storage
function saveToLocalStorage() {
    const data = {
        settings: settings,
        classes: classes,
        classIdCounter: classIdCounter
    };
    localStorage.setItem("pointTrackerData", JSON.stringify(data));
}

function loadFromLocalStorage() {
    const data = localStorage.getItem("pointTrackerData");
    if (data) {
        const parsed = JSON.parse(data);
        settings = parsed.settings;
        classes = parsed.classes;
        classIdCounter = parsed.classIdCounter;
    }
}

// Export/Import
function exportData() {
    let textContent = "";
    
    Object.entries(classes).forEach(([classId, classData]) => {
        textContent += `class ${classData.name}:\n`;
        
        Object.entries(classData.students).forEach(([studentId, student]) => {
            textContent += `  ${student.name}: ${student.points}\n`;
        });
        
        textContent += `\n`;
    });
    
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "point_tracker_data.txt";
    a.click();
    URL.revokeObjectURL(url);
}

function importData() {
    const fileInput = document.getElementById("fileInput");
    fileInput.click();
}

document.getElementById("fileInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const text = event.target.result;
            parseImportedData(text);
        } catch (error) {
            alert("Error importing file: " + error.message);
        }
    };
    reader.readAsText(file);
    
    e.target.value = "";
});

function parseImportedData(text) {
    const lines = text.split("\n");
    let currentClass = null;
    
    // Reset classes
    Object.keys(classes).forEach(key => delete classes[key]);
    classIdCounter = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (!line) continue;
        
        // Check if line is a class header (starts with "class ")
        if (line.toLowerCase().startsWith("class ")) {
            const className = line.replace(/^class\s+/i, "").replace(":", "").trim();
            const classId = classIdCounter++;
            classes[classId] = { name: className, students: {} };
            currentClass = classId;
        } 
        // Check if line has a colon (potential student: points line)
        else if (line.includes(":") && currentClass !== null) {
            const parts = line.split(":");
            if (parts.length >= 2) {
                const studentName = parts[0].trim();
                const pointsStr = parts[1].trim();
                
                // Extract just the number from the points string
                const pointsMatch = pointsStr.match(/\d+/);
                const points = pointsMatch ? parseInt(pointsMatch[0]) : 0;
                
                // Only add if student name looks valid (not empty)
                if (studentName && studentName.length > 0) {
                    const studentId = Object.keys(classes[currentClass].students).length;
                    classes[currentClass].students[studentId] = {
                        name: studentName,
                        points: points,
                        warnings: 0
                    };
                }
            }
        }
    }
    
    saveToLocalStorage();
    renderClassTabs();
    const firstClassId = Object.keys(classes)[0];
    if (firstClassId !== undefined) {
        switchToClass(firstClassId);
    }
    alert("Data imported successfully!");
}

// Initialize
loadFromLocalStorage();
if (Object.keys(classes).length === 0) {
    addNewClass("Class 1");
} else {
    renderClassTabs();
    switchToClass(Object.keys(classes)[0]);
}