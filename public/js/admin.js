// ==================================================
// BCU MAP - ADMIN.JS
// ==================================================


// ==================================================
// CURRENT USER
// ==================================================

function getAdminCurrentUser() {

    return JSON.parse(
        localStorage.getItem(
            "bcuCurrentUser"
        ) || "null"
    );

}


// ==================================================
// ADMIN ACCESS CHECK
// ==================================================

function checkAdminAccess() {

    const user =
        getAdminCurrentUser();


    if (!user) {

        alert(
            "You must be logged in as an administrator."
        );


        location.href =
            "../public/login.html";


        return false;
    }


    if (
        user.role !==
        "admin"
    ) {

        alert(
            "You do not have permission to access the admin page."
        );


        location.href =
            "../public/index.html";


        return false;
    }


    return true;

}


// ==================================================
// ADMIN USER DISPLAY
// ==================================================

function loadAdminUser() {

    const user =
        getAdminCurrentUser();


    const usernameElement =
        document.getElementById(
            "adminUsername"
        );


    if (
        usernameElement &&
        user
    ) {

        usernameElement.textContent =
            user.username;

    }

}


// ==================================================
// LOGOUT
// ==================================================

function adminLogout() {

    localStorage.removeItem(
        "bcuCurrentUser"
    );


    location.href =
        "../public/index.html";

}


// ==================================================
// INITIALIZATION
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        if (
            !checkAdminAccess()
        ) {

            return;

        }


        loadAdminUser();

    }
);


// ==================================================
// GLOBAL
// ==================================================

window.adminLogout =
    adminLogout;