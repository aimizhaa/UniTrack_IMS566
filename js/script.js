
/* ==========================================
   UNITRACK - SHARED JAVASCRIPT
========================================== */


/* ==========================================
   HELPER FUNCTIONS
========================================== */

function getAccounts() {
    try {
        const accounts = JSON.parse(
            localStorage.getItem("unitrackAccounts") || "[]"
        );

        return Array.isArray(accounts) ? accounts : [];
    } catch (error) {
        return [];
    }
}

function saveAccounts(accounts) {
    localStorage.setItem("unitrackAccounts", JSON.stringify(accounts));
}

function showMessage(element, text, type = "error") {
    if (!element) return;

    element.textContent = text;
    element.className = "form-message " + type;
}



/* ==========================================
   1. THEME SYSTEM
========================================== */

const THEME_KEY = "unitrackTheme";

function getSavedTheme() {
    return localStorage.getItem(THEME_KEY) || "light";
}

function applyTheme(theme) {

    const validThemes = ["light", "dark", "system"];

    if (!validThemes.includes(theme)) {
        theme = "light";
    }

    const systemDark = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    const isDark = theme === "dark" ||
        (theme === "system" && systemDark);

    document.documentElement.setAttribute(
        "data-theme",
        isDark ? "dark" : "light"
    );

    document.body.classList.toggle("theme-dark", isDark);
    document.body.classList.toggle("theme-light", !isDark);

    // Update theme dropdown
    document.querySelectorAll("#themeSelector").forEach(selector => {
        selector.value = theme;
    });
}


// Theme Dropdown Event

document.querySelectorAll("#themeSelector").forEach(selector => {

    selector.addEventListener("change", function() {

        const selectedTheme = this.value;

        localStorage.setItem(THEME_KEY, selectedTheme);

        applyTheme(selectedTheme);

    });

});


// Apply Saved Theme

applyTheme(getSavedTheme());


// Listen to System Theme Changes

if (window.matchMedia) {

    const systemTheme = window.matchMedia(
        "(prefers-color-scheme: dark)"
    );

    systemTheme.addEventListener("change", function() {

        if (getSavedTheme() === "system") {
            applyTheme("system");
        }

    });

}




/* ==========================================
   2. SHOW / HIDE PASSWORD
========================================== */

document.querySelectorAll("[data-toggle-password]").forEach(button => {

    button.addEventListener("click", function() {

        const password = document.getElementById(
            this.dataset.togglePassword
        );

        if (!password) return;

        if (password.type === "password") {
            password.type = "text";
            this.textContent = "Hide";
        } else {
            password.type = "password";
            this.textContent = "Show";
        }

    });

});



/* ==========================================
   3. LOGIN VALIDATION
========================================== */

// Demo account credentials

const demoAccount = {
    fullName: "Aimi Nazihah binti Yusri",
    studentID: "2026129795",
    email: "2026129795@student.uitm.edu.my",
    password: "Aimi@123_",
    contactNumber: "",
    birthday: "",
    emergencyContact: "",
    programme: "SI262",
    faculty: "Faculty of Information Management",
    currentSemester: "Semester 4",
    muetResult: "Band 4.0",
    profilePicture: ""
};


// Add or update demo account

let savedAccounts = getAccounts();

const demoIndex = savedAccounts.findIndex(item =>
    (item.email || "").toLowerCase() === demoAccount.email.toLowerCase() ||
    item.studentID === demoAccount.studentID
);

if (demoIndex === -1) {

    savedAccounts.push(demoAccount);

} else {

    savedAccounts[demoIndex] = {
        ...demoAccount,
        ...savedAccounts[demoIndex],
        fullName: "Aimi Nazihah binti Yusri",
        muetResult: "Band 4.0"
    };

}

saveAccounts(savedAccounts);


const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const studentIDInput = document.getElementById("studentID");
        const emailInput = document.getElementById("studentEmail");
        const passwordInput = document.getElementById("password");
        const loginError = document.getElementById("loginError");

        if (!emailInput || !passwordInput) return;

        const studentID = studentIDInput
            ? studentIDInput.value.trim()
            : "";

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        const accounts = getAccounts();

        const account = accounts.find(item => {

            const isDemoAccount =
                item.studentID === demoAccount.studentID;

            if (isDemoAccount) {

                return (
                    studentID === item.studentID &&
                    email.toLowerCase() ===
                    (item.email || "").toLowerCase() &&
                    password === item.password
                );

            }

            return (
                (item.email || "").toLowerCase() === email.toLowerCase() &&
                item.password === password &&
                (!studentID || item.studentID === studentID)
            );

        });

        if (account) {

            localStorage.setItem(
                "unitrackCurrentUser",
                account.email.toLowerCase()
            );

            if (loginError) {
                loginError.textContent = "";
            }

            window.location.href = "dashboard.html";

        } else {

            if (loginError) {
                loginError.textContent =
                    "Invalid Student ID, Email or Password. Please try again.";
            }

        }

    });

}


/* ==========================================
   4. REGISTRATION VALIDATION
========================================== */

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const fullName = document.getElementById("fullName");
        const studentID = document.getElementById("registerStudentID");
        const email = document.getElementById("email");
        const password = document.getElementById("registerPassword");
        const confirmPassword = document.getElementById("confirmPassword");
        const message = document.getElementById("registerMessage");

        if (
            !fullName ||
            !studentID ||
            !email ||
            !password ||
            !confirmPassword
        ) return;

        const nameValue = fullName.value.trim();
        const idValue = studentID.value.trim();
        const emailValue = email.value.trim();
        const passwordValue = password.value;
        const confirmValue = confirmPassword.value;

        if (!nameValue || !idValue || !emailValue) {
            showMessage(message, "Please complete all required fields.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
            showMessage(message, "Please enter a valid email address.");
            return;
        }

        if (passwordValue.length < 8) {
            showMessage(
                message,
                "Password must contain at least 8 characters."
            );
            return;
        }

        if (passwordValue !== confirmValue) {
            showMessage(
                message,
                "Passwords do not match. Please try again."
            );
            return;
        }

        const accounts = getAccounts();

        const existingAccount = accounts.find(account =>
            (account.studentID || "").toLowerCase() === idValue.toLowerCase() ||
            (account.email || "").toLowerCase() === emailValue.toLowerCase()
        );

        if (existingAccount) {
            showMessage(
                message,
                "Student ID or email is already registered."
            );
            return;
        }

        accounts.push({

            fullName: nameValue,
            studentID: idValue,
            email: emailValue,
            password: passwordValue,

            contactNumber: "",
            birthday: "",
            emergencyContact: "",

            programme: "SI262",
            faculty: "Faculty of Information Management",
            currentSemester: "Semester 4",
            muetResult: "Band 4.0",

            profilePicture: ""

        });

        saveAccounts(accounts);

        showMessage(
            message,
            "Account created successfully! You can now sign in.",
            "success"
        );

        registerForm.reset();

    });

}



/* ==========================================
   5. FORGOT PASSWORD
========================================== */

const resetForm = document.getElementById("resetPasswordForm");

if (resetForm) {

    resetForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const studentID = document.getElementById("resetStudentID");
        const email = document.getElementById("resetEmail");
        const newPassword = document.getElementById("newPassword");
        const confirmPassword = document.getElementById("confirmNewPassword");
        const message = document.getElementById("resetMessage");

        if (
            !studentID ||
            !email ||
            !newPassword ||
            !confirmPassword
        ) return;

        const idValue = studentID.value.trim();
        const emailValue = email.value.trim();
        const passwordValue = newPassword.value;
        const confirmValue = confirmPassword.value;

        if (passwordValue.length < 8) {
            showMessage(
                message,
                "Password must contain at least 8 characters."
            );
            return;
        }

        if (passwordValue !== confirmValue) {
            showMessage(message, "Passwords do not match.");
            return;
        }

        const accounts = getAccounts();

        const account = accounts.find(item =>
            (item.studentID || "").toLowerCase() === idValue.toLowerCase() &&
            (item.email || "").toLowerCase() === emailValue.toLowerCase()
        );

        if (!account) {
            showMessage(
                message,
                "Student ID or email does not match."
            );
            return;
        }

        account.password = passwordValue;

        saveAccounts(accounts);

        showMessage(
            message,
            "Password reset successfully! You can now sign in.",
            "success"
        );

        resetForm.reset();

    });

}



/* ==========================================
   6. SIDEBAR NAVIGATION
========================================== */

const sidebarToggle = document.getElementById("sidebarToggle");
const sidebar = document.getElementById("sidebar");

if (sidebarToggle && sidebar) {

    sidebarToggle.setAttribute("aria-expanded", "false");

    sidebarToggle.addEventListener("click", function(event) {

        event.stopPropagation();

        sidebar.classList.toggle("sidebar-open");

        sidebarToggle.setAttribute(
            "aria-expanded",
            String(sidebar.classList.contains("sidebar-open"))
        );

    });

    document.addEventListener("click", function(event) {

        const clickedInsideSidebar = sidebar.contains(event.target);
        const clickedToggle = sidebarToggle.contains(event.target);

        if (
            window.innerWidth <= 991 &&
            !clickedInsideSidebar &&
            !clickedToggle
        ) {

            sidebar.classList.remove("sidebar-open");
            sidebarToggle.setAttribute("aria-expanded", "false");

        }

    });

    document.addEventListener("keydown", function(event) {

        if (event.key === "Escape") {

            sidebar.classList.remove("sidebar-open");
            sidebarToggle.setAttribute("aria-expanded", "false");

        }

    });

}



/* ==========================================
   7. ACADEMIC PERFORMANCE CHART
========================================== */

const academicCanvas = document.getElementById("academicChart");

if (academicCanvas && typeof Chart !== "undefined") {

    new Chart(academicCanvas, {

        type: "line",

        data: {

            labels: [
                "Semester 1",
                "Semester 2",
                "Semester 3",
                "Semester 4",
                "Semester 5"
            ],

            datasets: [{

                label: "GPA",

                data: [3.20, 3.45, 3.30, 3.65, null],

                borderColor: "#4386d8",
                backgroundColor: "rgba(67, 134, 216, 0.10)",

                borderWidth: 3,

                pointBackgroundColor: "#ffffff",
                pointBorderColor: "#4386d8",
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,

                fill: true,
                tension: 0.4,
                spanGaps: false

            }]

        },

        options: {

            responsive: true,
            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {

                    backgroundColor: "#19365c",
                    padding: 12,
                    displayColors: false,

                    callbacks: {

                        label: function(context) {

                            if (context.parsed.y === null) {
                                return "GPA: No result yet";
                            }

                            return "GPA: " + context.parsed.y.toFixed(2);

                        }

                    }

                }

            },

            scales: {

                y: {

                    min: 0,
                    max: 4,

                    ticks: {
                        stepSize: 1,
                        color: "#91a0b3",
                        font: {
                            size: 10
                        }
                    },

                    grid: {
                        color: "#edf1f6"
                    }

                },

                x: {

                    offset: true,

                    ticks: {
                        padding: 12,
                        autoSkip: false,
                        color: "#91a0b3",
                        font: {
                            size: 10
                        }
                    },

                    grid: {
                        display: false
                    }

                }

            }

        }

    });

}



/* ==========================================
   8. ASSIGNMENT OVERVIEW CHART
========================================== */

const assignmentCanvas = document.getElementById("assignmentChart");

if (assignmentCanvas && typeof Chart !== "undefined") {

    new Chart(assignmentCanvas, {

        type: "doughnut",

        data: {

            labels: ["Pending", "Completed"],

            datasets: [{

                data: [6, 6],

                backgroundColor: [
                    "#f1ad52",
                    "#4386d8"
                ],

                borderWidth: 0,
                hoverOffset: 7

            }]

        },

        options: {

            responsive: true,
            maintainAspectRatio: false,
            cutout: "72%",

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {

                    callbacks: {

                        label: function(context) {

                            return context.label + ": " +
                                context.parsed + " assignments";

                        }

                    }

                }

            }

        }

    });

}



/* ==========================================
   9. PROFILE PAGE
========================================== */

const profileForm = document.getElementById("profileForm");

if (profileForm) {

    const fields = {

        fullName: document.getElementById("profileFullName"),
        studentID: document.getElementById("profileID"),
        phone: document.getElementById("profilePhone"),
        birthday: document.getElementById("profileBirthday"),
        emergency: document.getElementById("profileEmergencyContact"),

        programme: document.getElementById("profileProgramme"),
        faculty: document.getElementById("profileFacultyInput"),
        semester: document.getElementById("profileCurrentSemester"),
        muet: document.getElementById("profileMuet")

    };

    const emailInput = document.getElementById("profileEmail");

    const avatar = document.getElementById("profileAvatar");
    const avatarButton = document.getElementById("profileAvatarButton");
    const pictureInput = document.getElementById("profilePictureInput");
    const removeButton = document.getElementById("removeProfilePictureBtn");

    const editButton = document.getElementById("editProfileBtn");
    const saveArea = document.getElementById("profileSaveArea");
    const cancelButton = document.getElementById("cancelEditBtn");
    const message = document.getElementById("profileMessage");

    const currentEmail = localStorage.getItem("unitrackCurrentUser");

    let accounts = getAccounts();

    let account = accounts.find(item =>
        (item.email || "").toLowerCase() ===
        (currentEmail || "").toLowerCase()
    );

    let pendingPicture = "";


    // Display profile picture

    function showPicture(picture) {

        if (!avatar) return;

        avatar.innerHTML = "";

        if (picture) {

            const image = document.createElement("img");

            image.src = picture;
            image.alt = "Profile Picture";

            avatar.appendChild(image);

        } else {

            const icon = document.createElement("i");

            icon.className = "bi bi-person-fill";

            avatar.appendChild(icon);

        }

    }


    // Display profile information

    function displayProfile() {

        if (!account) return;

        if (fields.fullName) {
            fields.fullName.value = account.fullName || "";
        }

        if (fields.studentID) {
            fields.studentID.value = account.studentID || "";
        }

        if (emailInput) {
            emailInput.value = account.email || "";
        }

        if (fields.phone) {
            fields.phone.value = account.contactNumber || "";
        }

        if (fields.birthday) {
            fields.birthday.value = account.birthday || "";
        }

        if (fields.emergency) {
            fields.emergency.value = account.emergencyContact || "";
        }

        if (fields.programme) {
            fields.programme.value = account.programme || "SI262";
        }

        if (fields.faculty) {
            fields.faculty.value =
                account.faculty || "Faculty of Information Management";
        }

        if (fields.semester) {
            fields.semester.value = account.currentSemester || "Semester 4";
        }

        if (fields.muet) {
            fields.muet.value = account.muetResult || "Band 4.0";
        }

        const profileName = document.getElementById("profileName");
        const profileFaculty = document.getElementById("profileFaculty");
        const profileSemester = document.getElementById("profileSemester");
        const topbarName = document.getElementById("topbarName");

        if (profileName) {
            profileName.textContent = account.fullName || "Student Name";
        }

        if (profileFaculty) {
            profileFaculty.textContent =
                account.faculty || "Faculty of Information Management";
        }

        if (profileSemester) {
            profileSemester.textContent =
                account.currentSemester || "Semester 4";
        }

        if (topbarName) {
            topbarName.textContent = (account.fullName || "Student")
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .join(" ");
        }

        pendingPicture = account.profilePicture || "";

        showPicture(pendingPicture);

    }


    // Enable or disable profile editing

    function enableEditing(enabled) {

        Object.values(fields).forEach(field => {

            if (field) {
                field.readOnly = !enabled;
            }

        });

        if (emailInput) {
            emailInput.readOnly = true;
        }

        if (avatarButton) {
            avatarButton.disabled = !enabled;
        }

        if (removeButton) {

            removeButton.disabled = !enabled;

            removeButton.hidden = !enabled || !pendingPicture;

        }

        if (editButton) {
            editButton.hidden = enabled;
        }

        if (saveArea) {
            saveArea.hidden = !enabled;
        }

    }


    if (!account) {

        if (message) {
            message.textContent = "Please log in to view your profile.";
        }

    } else {

        displayProfile();

        enableEditing(false);


        // Edit Profile

        if (editButton) {

            editButton.addEventListener("click", function() {

                enableEditing(true);

                if (message) {
                    message.textContent = "";
                }

            });

        }


        // Upload Profile Picture

        if (avatarButton && pictureInput) {

            avatarButton.addEventListener("click", function() {

                if (!avatarButton.disabled) {
                    pictureInput.click();
                }

            });

            pictureInput.addEventListener("change", function() {

                const file = pictureInput.files[0];

                if (!file) return;

                if (!file.type.startsWith("image/")) {

                    if (message) {
                        message.textContent = "Please select an image file.";
                    }

                    pictureInput.value = "";
                    return;

                }

                if (file.size > 2 * 1024 * 1024) {

                    if (message) {
                        message.textContent = "Image must be smaller than 2 MB.";
                    }

                    pictureInput.value = "";
                    return;

                }

                const reader = new FileReader();

                reader.onload = function(event) {

                    pendingPicture = event.target.result;

                    showPicture(pendingPicture);

                    if (removeButton) {
                        removeButton.hidden = false;
                    }

                    if (message) {
                        message.textContent = "";
                    }

                };

                reader.readAsDataURL(file);

            });

        }


        // Remove Profile Picture

        if (removeButton) {

            removeButton.addEventListener("click", function() {

                pendingPicture = "";

                if (pictureInput) {
                    pictureInput.value = "";
                }

                showPicture("");

                removeButton.hidden = true;

            });

        }


        // Cancel Editing

        if (cancelButton) {

            cancelButton.addEventListener("click", function() {

                displayProfile();

                enableEditing(false);

                if (message) {
                    message.textContent = "";
                }

                if (pictureInput) {
                    pictureInput.value = "";
                }

            });

        }


        // Save Profile

        profileForm.addEventListener("submit", function(event) {

            event.preventDefault();

            account.fullName = fields.fullName
                ? fields.fullName.value.trim()
                : account.fullName;

            account.contactNumber = fields.phone
                ? fields.phone.value.trim()
                : account.contactNumber;

            account.birthday = fields.birthday
                ? fields.birthday.value
                : account.birthday;

            account.emergencyContact = fields.emergency
                ? fields.emergency.value.trim()
                : account.emergencyContact;

            account.programme = fields.programme
                ? fields.programme.value.trim()
                : account.programme;

            account.faculty = fields.faculty
                ? fields.faculty.value.trim()
                : account.faculty;

            account.currentSemester = fields.semester
                ? fields.semester.value.trim()
                : account.currentSemester;

            account.muetResult = fields.muet
                ? fields.muet.value.trim()
                : account.muetResult;

            account.profilePicture = pendingPicture;

            saveAccounts(accounts);

            displayProfile();

            enableEditing(false);

            if (pictureInput) {
                pictureInput.value = "";
            }

            if (message) {
                message.textContent = "Profile updated successfully!";
            }

        });

    }

}



/* ==========================================
   10. LOGOUT
========================================== */

document.querySelectorAll("#logoutLink").forEach(link => {

    link.addEventListener("click", function() {

        localStorage.removeItem("unitrackCurrentUser");

    });

});



/* ==========================================
   11. NOTIFICATION SYSTEM
========================================== */

document.querySelectorAll(
    'button[aria-label="Notifications"]'
).forEach(button => {

    // Create notification wrapper

    const wrapper = document.createElement("div");

    wrapper.className = "notification-wrapper";

    button.parentNode.insertBefore(wrapper, button);

    wrapper.appendChild(button);


    // Create notification panel

    const panel = document.createElement("div");

    panel.className = "notification-panel";
    panel.hidden = true;

    panel.setAttribute("aria-label", "Notification list");

    wrapper.appendChild(panel);

    const dot = button.querySelector(".notification-dot");


    // Demo notifications

    const notifications = [

        {
            id: "class-ims565",
            icon: "bi-calendar-event",
            type: "class",
            title: "Upcoming Class",
            message: "IMS565 – Information System Project Management",
            detail: "Tuesday · 8:00 AM · Information Tools Laboratory"
        },

        {
            id: "assignment-ims562",
            icon: "bi-clipboard-check",
            type: "assignment",
            title: "Assignment Due Soon",
            message: "Information Security Group Project",
            detail: "Due: 17 November 2026"
        },

        {
            id: "academic-announcement",
            icon: "bi-megaphone",
            type: "announcement",
            title: "Academic Announcement",
            message: "Remember to check the latest updates for your Semester 4 courses.",
            detail: "Semester 4 · Academic Update"
        }

    ];


    // Get previously read notifications

    let readNotifications = [];

    try {

        readNotifications = JSON.parse(
            localStorage.getItem("unitrackReadNotifications") || "[]"
        );

        if (!Array.isArray(readNotifications)) {
            readNotifications = [];
        }

    } catch (error) {

        readNotifications = [];

    }


    // Update notification display

    function updateNotifications() {

        const unreadCount = notifications.filter(item =>
            !readNotifications.includes(item.id)
        ).length;


        // Update red notification dot

        if (dot) {
            dot.hidden = unreadCount === 0;
        }


        // Update notification panel

        panel.innerHTML = `

            <div class="notification-header">

                <div>
                    <h6>Notifications</h6>
                    <span>${unreadCount} New</span>
                </div>

                <button type="button" class="mark-all-read">
                    Mark all as read
                </button>

            </div>


            <div class="notification-list">

                ${notifications.map(item => {

                    const isRead = readNotifications.includes(item.id);

                    return `

                        <button
                            type="button"
                            class="notification-item ${isRead ? "read" : "unread"}"
                            data-notification-id="${item.id}"
                        >

                            <div class="notification-icon ${item.type}">
                                <i class="bi ${item.icon}"></i>
                            </div>

                            <div class="notification-text">

                                <strong>${item.title}</strong>

                                <p>${item.message}</p>

                                <small>${item.detail}</small>

                            </div>

                            ${!isRead
                                ? '<span class="unread-indicator"></span>'
                                : ''
                            }

                        </button>

                    `;

                }).join("")}

            </div>


            <div class="notification-footer">
                You are all caught up!
            </div>

        `;

    }


    // Open and close notification panel

    button.setAttribute("aria-expanded", "false");

    button.addEventListener("click", function(event) {

        event.stopPropagation();

        panel.hidden = !panel.hidden;

        button.setAttribute(
            "aria-expanded",
            String(!panel.hidden)
        );

    });


    // Handle notification clicks

    panel.addEventListener("click", function(event) {

        const markAllButton = event.target.closest(".mark-all-read");


        // Mark all notifications as read

        if (markAllButton) {

            readNotifications = notifications.map(item => item.id);

            localStorage.setItem(
                "unitrackReadNotifications",
                JSON.stringify(readNotifications)
            );

            updateNotifications();

            return;

        }


        // Mark selected notification as read

        const notification = event.target.closest(".notification-item");

        if (notification) {

            const notificationID = notification.dataset.notificationId;

            if (!readNotifications.includes(notificationID)) {

                readNotifications.push(notificationID);

                localStorage.setItem(
                    "unitrackReadNotifications",
                    JSON.stringify(readNotifications)
                );

                updateNotifications();

            }

        }

    });


    // Close panel when clicking outside

    document.addEventListener("click", function(event) {

        if (!wrapper.contains(event.target)) {

            panel.hidden = true;

            button.setAttribute("aria-expanded", "false");

        }

    });


    // Close panel using Escape key

    document.addEventListener("keydown", function(event) {

        if (event.key === "Escape") {

            panel.hidden = true;

            button.setAttribute("aria-expanded", "false");

        }

    });


    // Initial notification display

    updateNotifications();

});


/* ==========================================
   12. ASSIGNMENT DATA MANAGEMENT
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const assignmentList = document.getElementById("assignmentList");

    if (!assignmentList) return;

    const STORAGE_KEY = "unitrackAssignments";

    // Get existing assignments from HTML

    function getInitialAssignments() {

        const assignments = [];

        document.querySelectorAll(".assignment-course").forEach(card => {

            const courseCode = card.querySelector(".assignment-course-code");
            const courseName = card.querySelector(".assignment-course-header h5");

            card.querySelectorAll(".assignment-item").forEach(item => {

                const title = item.querySelector(".assignment-info small");
                const type = item.querySelector(".assignment-info strong");
                const due = item.querySelector(".assignment-info span");
                const status = item.querySelector(".status");

                assignments.push({

                    id: Date.now().toString() + Math.random().toString(36).slice(2),
                    courseCode: courseCode?.textContent.trim() || "",
                    courseName: courseName?.textContent.trim() || "",
                    title: title?.textContent.trim() || "",
                    type: type?.textContent.trim() || "Individual Assignment",
                    dueDate: due?.textContent.replace("Due:", "").trim() || "",
                    status: status?.textContent.trim() || "Pending"

                });

            });

        });

        return assignments;

    }


    // Load saved assignments or use original data

    function getAssignments() {

        try {

            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved !== null) {

                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed)) return parsed;

            }

        } catch (error) {

            console.error("Unable to load assignments:", error);

        }

        const initial = getInitialAssignments();

        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));

        return initial;

    }


    let assignments = getAssignments();


    function saveAssignments() {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(assignments)
        );

    }


    // Display assignment data

    function renderAssignments() {

        const groups = {};

        assignments.forEach(item => {

            const key = item.courseCode;

            if (!groups[key]) {
                groups[key] = {
                    name: item.courseName,
                    items: []
                };
            }

            groups[key].items.push(item);

        });


        assignmentList.innerHTML = Object.entries(groups).map(([code, group]) => `

            <div class="col-12 assignment-course">

                <div class="assignment-course-card">

                    <div class="assignment-course-header">

                        <div>
                            <span class="assignment-course-code">${escapeHTML(code)}</span>
                            <h5>${escapeHTML(group.name)}</h5>
                        </div>

                    </div>

                    ${group.items.map(item => `

                        <div class="assignment-item">

                            <div class="assignment-type-icon ${item.status === "Completed" ? "completed-icon" : "pending-icon"}">
                                <i class="bi bi-file-earmark-text"></i>
                            </div>

                            <div class="assignment-info">

                                <strong>${escapeHTML(item.type)}</strong>

                                <small>${escapeHTML(item.title)}</small>

                                <span>
                                    <i class="bi bi-calendar3"></i>
                                    Due: ${escapeHTML(item.dueDate)}
                                </span>

                            </div>

                            <div class="d-flex flex-column gap-2 align-items-end">

                                <span class="status ${item.status === "Completed" ? "completed-status" : "pending-status"}">
                                    ${item.status}
                                </span>

                                <div class="d-flex gap-2">

                                    <button type="button"
                                        class="btn btn-sm btn-outline-primary"
                                        data-action="edit"
                                        data-id="${item.id}">
                                        <i class="bi bi-pencil"></i>
                                    </button>

                                    <button type="button"
                                        class="btn btn-sm btn-outline-danger"
                                        data-action="delete"
                                        data-id="${item.id}">
                                        <i class="bi bi-trash"></i>
                                    </button>

                                    <button type="button"
                                        class="btn btn-sm btn-outline-success"
                                        data-action="status"
                                        data-id="${item.id}">
                                        <i class="bi bi-arrow-repeat"></i>
                                    </button>

                                </div>

                            </div>

                        </div>

                    `).join("")}

                </div>

            </div>

        `).join("");


        updateSummary();

    }


    // Escape text before inserting into HTML

    function escapeHTML(value) {

        return String(value).replace(/[&<>"']/g, character => ({

            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"

        })[character]);

    }


    // Update assignment summary cards

    function updateSummary() {

        const cards = document.querySelectorAll(".summary-row .summary-card");

        const completed = assignments.filter(item =>
            item.status === "Completed"
        ).length;

        const pending = assignments.length - completed;

        if (cards.length >= 3) {

            cards[0].querySelector("h3").textContent = assignments.length;
            cards[1].querySelector("h3").textContent = completed;
            cards[2].querySelector("h3").textContent = pending;

        }

    }


    // Add Assignment button

    const toolbar = document.querySelector(".assignment-toolbar");

    if (toolbar) {

        const addButton = document.createElement("button");

        addButton.type = "button";
        addButton.className = "btn btn-primary";
        addButton.innerHTML = '<i class="bi bi-plus-lg"></i> Add Assignment';

        toolbar.appendChild(addButton);


        addButton.addEventListener("click", function() {

            const courseCode = prompt(
                "Enter course code (e.g. IMS562):"
            );

            if (!courseCode || !courseCode.trim()) return;

            const course = courseCode.trim().toUpperCase();

            const existingCourse = assignments.find(item =>
                item.courseCode === course
            );

            const courseName = existingCourse
                ? existingCourse.courseName
                : prompt("Enter course name:");

            if (!courseName || !courseName.trim()) return;

            const title = prompt("Enter assignment name:");

            if (!title || !title.trim()) return;

            const type = prompt(
                "Enter assignment type (Individual Assignment / Group Assignment):",
                "Individual Assignment"
            );

            if (!type || !type.trim()) return;

            const dueDate = prompt(
                "Enter due date (e.g. 30 Nov 2026):"
            );

            if (!dueDate || !dueDate.trim()) return;

            assignments.push({

                id: Date.now().toString(),
                courseCode: course,
                courseName: courseName.trim(),
                title: title.trim(),
                type: type.trim(),
                dueDate: dueDate.trim(),
                status: "Pending"

            });

            saveAssignments();
            renderAssignments();

        });

    }


    // Edit, Delete and Update Status

    assignmentList.addEventListener("click", function(event) {

        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const id = button.dataset.id;

        const item = assignments.find(assignment =>
            assignment.id === id
        );

        if (!item) return;


        // Edit Assignment

        if (button.dataset.action === "edit") {

            const newTitle = prompt("Edit assignment name:", item.title);

            if (!newTitle || !newTitle.trim()) return;

            const newDate = prompt("Edit due date:", item.dueDate);

            if (!newDate || !newDate.trim()) return;

            item.title = newTitle.trim();
            item.dueDate = newDate.trim();

            saveAssignments();
            renderAssignments();

        }


        // Delete Assignment

        if (button.dataset.action === "delete") {

            if (!confirm("Are you sure you want to delete this assignment?")) {
                return;
            }

            assignments = assignments.filter(assignment =>
                assignment.id !== id
            );

            saveAssignments();
            renderAssignments();

        }


        // Update Status

        if (button.dataset.action === "status") {

            item.status = item.status === "Completed"
                ? "Pending"
                : "Completed";

            saveAssignments();
            renderAssignments();

        }

    });


    // Initial display

    renderAssignments();

});


/* ==========================================
   13. COURSE DATA MANAGEMENT
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const courseList = document.getElementById("courseList");

    if (!courseList) return;

    const STORAGE_KEY = "unitrackCourses";


    // Get original courses from HTML

    function getInitialCourses() {

        const courses = [];

        document.querySelectorAll(".course-item").forEach(card => {

            courses.push({

                id: Date.now().toString() + Math.random().toString(36).slice(2),

                code: card.querySelector(".course-code")?.textContent.trim() || "",

                name: card.querySelector(".course-card h5")?.textContent.trim() || "",

                description: card.querySelector(".course-description")?.textContent.trim() || "",

                lecturer: card.querySelector(".course-card-footer strong")?.textContent.trim() || "",

                contact: card.querySelector(".lecturer-contact span")?.textContent.trim() || ""

            });

        });

        return courses;

    }


    // Load courses from Local Storage

    function getCourses() {

        try {

            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved !== null) {

                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed)) return parsed;

            }

        } catch (error) {

            console.error("Unable to load courses:", error);

        }

        const initial = getInitialCourses();

        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));

        return initial;

    }


    let courses = getCourses();


    // Save courses

    function saveCourses() {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(courses)
        );

    }


    // Escape HTML

    function escapeHTML(value) {

        return String(value).replace(/[&<>"']/g, character => ({

            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"

        })[character]);

    }


    // Display courses

    function renderCourses() {

        courseList.innerHTML = courses.map(course => `

            <div class="col-12 col-md-6 col-xl-4 course-item">

                <div class="course-card">

                    <div class="course-card-header">

                        <div class="course-card-icon blue-icon">
                            <i class="bi bi-book"></i>
                        </div>

                        <span class="course-code">
                            ${escapeHTML(course.code)}
                        </span>

                    </div>

                    <h5>${escapeHTML(course.name)}</h5>

                    <p class="course-description">
                        ${escapeHTML(course.description)}
                    </p>

                    <div class="course-card-footer">

                        <div>
                            <small>Lecturer</small>
                            <strong>${escapeHTML(course.lecturer)}</strong>
                        </div>

                        <div class="lecturer-contact">
                            <i class="bi bi-telephone"></i>
                            <span>${escapeHTML(course.contact)}</span>
                        </div>

                    </div>

                    <div class="d-flex gap-2 mt-3">

                        <button
                            type="button"
                            class="btn btn-sm btn-outline-primary"
                            data-action="edit"
                            data-id="${course.id}">

                            <i class="bi bi-pencil"></i> Edit

                        </button>

                        <button
                            type="button"
                            class="btn btn-sm btn-outline-danger"
                            data-action="delete"
                            data-id="${course.id}">

                            <i class="bi bi-trash"></i> Delete

                        </button>

                    </div>

                </div>

            </div>

        `).join("");


        updateCourseSummary();

    }


    // Update total courses

    function updateCourseSummary() {

        const total = document.querySelector(
            ".course-summary .summary-card h3"
        );

        if (total) {
            total.textContent = courses.length;
        }

    }


    // Add Course button

    const toolbar = document.querySelector(".course-toolbar");

    if (toolbar) {

        const addButton = document.createElement("button");

        addButton.type = "button";
        addButton.className = "btn btn-primary";
        addButton.innerHTML = '<i class="bi bi-plus-lg"></i> Add Course';

        toolbar.appendChild(addButton);


        addButton.addEventListener("click", function () {

            const code = prompt("Enter course code (e.g. IMS562):");

            if (!code || !code.trim()) return;

            const courseCode = code.trim().toUpperCase();

            if (courses.some(course => course.code.toUpperCase() === courseCode)) {

                alert("This course code already exists.");
                return;

            }


            const name = prompt("Enter course name:");

            if (!name || !name.trim()) return;


            const description = prompt("Enter course description:");

            if (!description || !description.trim()) return;


            const lecturer = prompt("Enter lecturer name:");

            if (!lecturer || !lecturer.trim()) return;


            const contact = prompt("Enter lecturer contact number:");

            if (!contact || !contact.trim()) return;


            courses.push({

                id: Date.now().toString(),

                code: courseCode,

                name: name.trim(),

                description: description.trim(),

                lecturer: lecturer.trim(),

                contact: contact.trim()

            });


            saveCourses();
            renderCourses();

        });

    }


    // Edit and Delete Course

    courseList.addEventListener("click", function (event) {

        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const id = button.dataset.id;

        const course = courses.find(item => item.id === id);

        if (!course) return;


        // Edit Course

        if (button.dataset.action === "edit") {

            const newCode = prompt("Edit course code:", course.code);

            if (!newCode || !newCode.trim()) return;

            const updatedCode = newCode.trim().toUpperCase();

            const duplicate = courses.some(item =>
                item.id !== id &&
                item.code.toUpperCase() === updatedCode
            );

            if (duplicate) {

                alert("This course code already exists.");
                return;

            }


            const newName = prompt("Edit course name:", course.name);

            if (!newName || !newName.trim()) return;


            const newDescription = prompt(
                "Edit course description:",
                course.description
            );

            if (!newDescription || !newDescription.trim()) return;


            const newLecturer = prompt(
                "Edit lecturer name:",
                course.lecturer
            );

            if (!newLecturer || !newLecturer.trim()) return;


            const newContact = prompt(
                "Edit lecturer contact number:",
                course.contact
            );

            if (!newContact || !newContact.trim()) return;


            course.code = updatedCode;
            course.name = newName.trim();
            course.description = newDescription.trim();
            course.lecturer = newLecturer.trim();
            course.contact = newContact.trim();


            saveCourses();
            renderCourses();

        }


        // Delete Course

        if (button.dataset.action === "delete") {

            if (!confirm("Are you sure you want to delete this course?")) {
                return;
            }

            courses = courses.filter(item => item.id !== id);

            saveCourses();
            renderCourses();

        }

    });


    // Initial display

    renderCourses();

});


/* ==========================================
   14. DASHBOARD ASSIGNMENT SYNC
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const STORAGE_KEY = "unitrackAssignments";

    function escapeHTML(value) {

        return String(value).replace(/[&<>"']/g, character => ({

            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"

        })[character]);

    }


    function updateDashboard() {

        const saved = localStorage.getItem(STORAGE_KEY);

        // Keep original dashboard values if no assignment data exists yet
        if (saved === null) return;

        let assignments;

        try {

            assignments = JSON.parse(saved);

            if (!Array.isArray(assignments)) return;

        } catch (error) {

            console.error("Unable to load dashboard assignments:", error);
            return;

        }


        // Calculate assignment totals

        const completed = assignments.filter(item =>
            item.status === "Completed"
        ).length;

        const pending = assignments.length - completed;


        // Update dashboard summary cards

        const summaryCards = document.querySelectorAll(
            ".summary-row .summary-card"
        );

        if (summaryCards.length >= 4) {

            summaryCards[2].querySelector("h3").textContent = pending;

            summaryCards[3].querySelector("h3").textContent = completed;

        }


        // Update doughnut chart

        const chartCanvas = document.getElementById("assignmentChart");

        if (chartCanvas && typeof Chart !== "undefined") {

            const chart = Chart.getChart(chartCanvas);

            if (chart) {

                chart.data.datasets[0].data = [pending, completed];

                chart.update();

            }

        }


        // Update chart legend

        const legend = document.querySelectorAll(
            ".assignment-legend > div strong"
        );

        if (legend.length >= 2) {

            legend[0].textContent = pending;
            legend[1].textContent = completed;

        }


        // Update Recent Assignments table

        const tableBody = document.querySelector(
            ".recent-panel .dashboard-table tbody"
        );

        if (tableBody) {

            const recentAssignments = assignments.slice(0, 3);

            if (recentAssignments.length === 0) {

                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center">
                            No assignments available.
                        </td>
                    </tr>
                `;

            } else {

                tableBody.innerHTML = recentAssignments.map(item => {

                    const isCompleted = item.status === "Completed";

                    return `
                        <tr>

                            <td>${escapeHTML(item.title)}</td>

                            <td>${escapeHTML(item.courseCode)}</td>

                            <td>${escapeHTML(item.dueDate)}</td>

                            <td>
                                <span class="status ${isCompleted ? "completed-status" : "pending-status"}">
                                    ${isCompleted ? "Completed" : "Pending"}
                                </span>
                            </td>

                        </tr>
                    `;

                }).join("");

            }

        }

    }


    // Initial dashboard update

    updateDashboard();


    // Update dashboard when assignment data changes in another tab

    window.addEventListener("storage", function (event) {

        if (event.key === STORAGE_KEY) {

            updateDashboard();

        }

    });

});




