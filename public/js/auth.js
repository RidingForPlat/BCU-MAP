// ==================================================
// BCU MAP - AUTH.JS
// ==================================================


// ==================================================
// USER DATA
// ==================================================

function getUsers() {

    return JSON.parse(
        localStorage.getItem("bcuUsers") || "[]"
    );

}


function saveUsers(users) {

    localStorage.setItem(
        "bcuUsers",
        JSON.stringify(users)
    );

}


// ==================================================
// CURRENT USER
// ==================================================

function getCurrentUser() {

    return JSON.parse(
        localStorage.getItem("bcuCurrentUser") || "null"
    );

}


function saveCurrentUser(user) {

    localStorage.setItem(
        "bcuCurrentUser",
        JSON.stringify(user)
    );

}


function logout() {

    localStorage.removeItem(
        "bcuCurrentUser"
    );

    location.href = "index.html";

}


// ==================================================
// SIGN UP
// ==================================================

function loadSignup() {

    const form =
        document.getElementById(
            "signupForm"
        );

    const message =
        document.getElementById(
            "signupMessage"
        );


    if (!form || !message) {
        return;
    }


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const username =
                document.getElementById(
                    "username"
                ).value.trim();


            const password =
                document.getElementById(
                    "password"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;


            // ------------------------------
            // Username 검사
            // ------------------------------

            if (!username) {

                message.textContent =
                    "Please enter a username.";

                return;
            }


            if (
                username.length < 3
            ) {

                message.textContent =
                    "Username must be at least 3 characters.";

                return;
            }


            if (
                username.length > 20
            ) {

                message.textContent =
                    "Username must be 20 characters or less.";

                return;
            }


            // ------------------------------
            // Password 검사
            // ------------------------------

            if (
                password.length < 6
            ) {

                message.textContent =
                    "Password must be at least 6 characters.";

                return;
            }


            if (
                password !==
                confirmPassword
            ) {

                message.textContent =
                    "Passwords do not match.";

                return;
            }


            const users =
                getUsers();


            // ------------------------------
            // 중복 Username 검사
            // ------------------------------

            const duplicate =
                users.some(
                    user =>
                        String(
                            user.username
                        ).toLowerCase() ===
                        username.toLowerCase()
                );


            if (duplicate) {

                message.textContent =
                    "That username already exists.";

                return;
            }


            // ------------------------------
            // 사용자 생성
            // ------------------------------

            const user = {

                id:
                    "u_" +
                    Date.now(),

                username:
                    username,

                password:
                    password,

                role:
                    username ===
                    "RidingForPlat"
                        ? "admin"
                        : "user"

            };


            users.push(
                user
            );


            saveUsers(
                users
            );


            message.textContent =
                "Account created successfully.";


            form.reset();


            // 잠시 후 로그인
            setTimeout(
                function() {

                    location.href =
                        "login.html";

                },
                1000
            );

        }
    );

}


// ==================================================
// LOGIN
// ==================================================

function loadLogin() {

    const form =
        document.getElementById(
            "loginForm"
        );

    const message =
        document.getElementById(
            "loginMessage"
        );


    if (!form || !message) {
        return;
    }


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const username =
                document.getElementById(
                    "username"
                ).value.trim();


            const password =
                document.getElementById(
                    "password"
                ).value;


            const users =
                getUsers();


            const user =
                users.find(
                    item =>
                        String(
                            item.username
                        ).toLowerCase() ===
                        username.toLowerCase()
                );


            if (!user) {

                message.textContent =
                    "Invalid username or password.";

                return;
            }


            if (
                user.password !==
                password
            ) {

                message.textContent =
                    "Invalid username or password.";

                return;
            }


            saveCurrentUser({

                id:
                    user.id,

                username:
                    user.username,

                role:
                    user.role

            });


            message.textContent =
                "Login successful.";


            setTimeout(
                function() {

                    if (
                        user.role ===
                        "admin"
                    ) {

                        location.href =
                            "../admin/";

                    } else {

                        location.href =
                            "index.html";

                    }

                },
                500
            );

        }
    );

}


// ==================================================
// PAGE INITIALIZATION
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadSignup();
        loadLogin();

    }
);


// ==================================================
// GLOBAL
// ==================================================

window.logout =
    logout;