const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");

const app = express();

const PORT = process.env.PORT || 3000;


// ==================================================
// ADMIN SECURITY
// ==================================================

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD;

const ADMIN_SESSION_SECRET =
    process.env.ADMIN_SESSION_SECRET;

const ADMIN_SESSION_MAX_AGE =
    12 * 60 * 60; // 12시간


if (!ADMIN_PASSWORD) {

    console.error(
        "[BCU MAP] ADMIN_PASSWORD is not set."
    );

    process.exit(1);

}


if (!ADMIN_SESSION_SECRET) {

    console.error(
        "[BCU MAP] ADMIN_SESSION_SECRET is not set."
    );

    process.exit(1);

}


// ==================================================
// PATHS
// ==================================================

const DATA_DIR =
    path.join(
        __dirname,
        "data"
    );

const MAPS_FILE =
    path.join(
        DATA_DIR,
        "maps.json"
    );

const UPLOAD_DIR =
    path.join(
        __dirname,
        "uploads"
    );


// ==================================================
// DATA FOLDER
// ==================================================

if (!fs.existsSync(DATA_DIR)) {

    fs.mkdirSync(
        DATA_DIR,
        {
            recursive: true
        }
    );

}


// ==================================================
// UPLOAD FOLDER
// ==================================================

if (!fs.existsSync(UPLOAD_DIR)) {

    fs.mkdirSync(
        UPLOAD_DIR,
        {
            recursive: true
        }
    );

}


// ==================================================
// MAP FILE
// ==================================================

if (!fs.existsSync(MAPS_FILE)) {

    fs.writeFileSync(
        MAPS_FILE,
        "[]",
        "utf8"
    );

}


// ==================================================
// MIDDLEWARE
// ==================================================

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);


// ==================================================
// COOKIE FUNCTIONS
// ==================================================

function parseCookies(req) {

    const header =
        req.headers.cookie;

    if (!header) {
        return {};
    }

    const cookies = {};

    header
        .split(";")
        .forEach(
            function(part) {

                const index =
                    part.indexOf("=");

                if (index === -1) {
                    return;
                }

                const name =
                    part
                        .slice(
                            0,
                            index
                        )
                        .trim();

                const value =
                    part
                        .slice(
                            index + 1
                        )
                        .trim();

                cookies[name] =
                    decodeURIComponent(
                        value
                    );

            }
        );

    return cookies;

}


function createAdminToken() {

    const timestamp =
        Math.floor(
            Date.now() / 1000
        );

    const data =
        timestamp +
        ":admin";

    const signature =
        crypto
            .createHmac(
                "sha256",
                ADMIN_SESSION_SECRET
            )
            .update(data)
            .digest("base64url");

    return (
        timestamp +
        "." +
        signature
    );

}


function verifyAdminToken(token) {

    if (!token) {
        return false;
    }

    const parts =
        token.split(".");

    if (parts.length !== 2) {
        return false;
    }

    const timestamp =
        Number(
            parts[0]
        );

    const signature =
        parts[1];

    if (
        !Number.isFinite(timestamp) ||
        !signature
    ) {
        return false;
    }

    const now =
        Math.floor(
            Date.now() / 1000
        );

    if (
        timestamp <= 0 ||
        now - timestamp < 0 ||
        now - timestamp >
            ADMIN_SESSION_MAX_AGE
    ) {
        return false;
    }

    const data =
        timestamp +
        ":admin";

    const expected =
        crypto
            .createHmac(
                "sha256",
                ADMIN_SESSION_SECRET
            )
            .update(data)
            .digest("base64url");

    const a =
        Buffer.from(
            signature
        );

    const b =
        Buffer.from(
            expected
        );

    if (
        a.length !==
        b.length
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        a,
        b
    );

}


// ==================================================
// ADMIN AUTH MIDDLEWARE
// ==================================================

function requireAdmin(
    req,
    res,
    next
) {

    const cookies =
        parseCookies(req);

    const token =
        cookies.bcu_admin;

    if (
        !verifyAdminToken(
            token
        )
    ) {

        return res
            .status(401)
            .json({
                error:
                    "Administrator authentication required."
            });

    }

    next();

}


function requireAdminPage(
    req,
    res,
    next
) {

    const cookies =
        parseCookies(req);

    const token =
        cookies.bcu_admin;

    if (
        !verifyAdminToken(
            token
        )
    ) {

        return res.redirect(
            "/admin-login.html"
        );

    }

    next();

}


// ==================================================
// ADMIN LOGIN
// ==================================================

app.post(
    "/api/admin/login",
    (req, res) => {

        const password =
            String(
                req.body.password ||
                ""
            );

        const supplied =
            Buffer.from(
                password
            );

        const actual =
            Buffer.from(
                ADMIN_PASSWORD
            );

        let valid =
            supplied.length ===
            actual.length;

        if (valid) {

            valid =
                crypto.timingSafeEqual(
                    supplied,
                    actual
                );

        }

        if (!valid) {

            return res
                .status(401)
                .json({
                    success: false,
                    error:
                        "Invalid administrator password."
                });

        }

        const token =
            createAdminToken();

        const secure =
            process.env.NODE_ENV ===
            "production"
                ? "; Secure"
                : "";

        res.setHeader(
            "Set-Cookie",
            "bcu_admin=" +
            encodeURIComponent(
                token
            ) +
            "; Path=/; HttpOnly; SameSite=Lax; Max-Age=" +
            ADMIN_SESSION_MAX_AGE +
            secure
        );

        res.json({
            success: true
        });

    }
);


// ==================================================
// ADMIN LOGOUT
// ==================================================

app.post(
    "/api/admin/logout",
    (req, res) => {

        res.setHeader(
            "Set-Cookie",
            "bcu_admin=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
        );

        res.json({
            success: true
        });

    }
);


// ==================================================
// CHECK ADMIN SESSION
// ==================================================

app.get(
    "/api/admin/me",
    requireAdmin,
    (req, res) => {

        res.json({
            admin: true
        });

    }
);


// ==================================================
// PROTECTED ADMIN PAGE
// ==================================================
//
// 반드시 express.static보다 먼저 있어야 한다.
//

app.get(
    "/admin.html",
    requireAdminPage,
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "admin.html"
            )
        );

    }
);


// ==================================================
// STATIC FILES
// ==================================================

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


// ==================================================
// UPLOADED FILES
// ==================================================

app.use(
    "/uploads",
    express.static(
        UPLOAD_DIR
    )
);


// ==================================================
// MULTER
// ==================================================

const storage =
    multer.diskStorage({

        destination:
            function(
                req,
                file,
                cb
            ) {

                cb(
                    null,
                    UPLOAD_DIR
                );

            },

        filename:
            function(
                req,
                file,
                cb
            ) {

                const ext =
                    path.extname(
                        file.originalname
                    );

                const uniqueName =
                    Date.now() +
                    "-" +
                    Math.random()
                        .toString(36)
                        .slice(2) +
                    ext;

                cb(
                    null,
                    uniqueName
                );

            }

    });


const upload =
    multer({
        storage: storage
    });


// ==================================================
// READ MAPS
// ==================================================

function readMaps() {

    try {

        const data =
            fs.readFileSync(
                MAPS_FILE,
                "utf8"
            );

        const maps =
            JSON.parse(
                data
            );

        return Array.isArray(
            maps
        )
            ? maps
            : [];

    }
    catch (error) {

        console.error(
            "Failed to read maps:",
            error
        );

        return [];

    }

}


// ==================================================
// WRITE MAPS
// ==================================================

function writeMaps(maps) {

    fs.writeFileSync(
        MAPS_FILE,
        JSON.stringify(
            maps,
            null,
            4
        ),
        "utf8"
    );

}


// ==================================================
// GET ALL MAPS
// ==================================================

app.get(
    "/api/maps",
    (req, res) => {

        const maps =
            readMaps();

        res.json(
            maps
        );

    }
);


// ==================================================
// GET ONE MAP
// ==================================================

app.get(
    "/api/maps/:id",
    (req, res) => {

        const maps =
            readMaps();

        const map =
            maps.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        req.params.id
                    )
            );

        if (!map) {

            return res
                .status(404)
                .json({
                    error:
                        "Map not found"
                });

        }

        res.json(
            map
        );

    }
);
// ==================================================
// DOWNLOAD MAP
// ==================================================

app.get(
    "/api/maps/:id/download",
    (req, res) => {

        const maps =
            readMaps();

        const map =
            maps.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        req.params.id
                    )
            );

        if (!map) {

            return res
                .status(404)
                .send("Map not found");

        }

        if (!map.file) {

            return res
                .status(404)
                .send("Map file not found");

        }

        const filename =
            path.basename(
                map.file
            );

        const filePath =
            path.join(
                UPLOAD_DIR,
                filename
            );

        if (
            !fs.existsSync(
                filePath
            )
        ) {

            return res
                .status(404)
                .send("Map file not found");

        }

        res.download(
            filePath,
            map.originalFile ||
            "map"
        );

    }
);

// ==================================================
// ADD MAP
// ==================================================
//
// 관리자만 업로드 가능
//

app.post(
    "/api/maps",
    requireAdmin,
    upload.single("file"),
    (req, res) => {

        const {
            name,
            creator,
            version,
            description
        } = req.body;


        if (
            !name ||
            !name.trim()
        ) {

            if (req.file) {

                try {

                    fs.unlinkSync(
                        req.file.path
                    );

                }
                catch {}

            }

            return res
                .status(400)
                .json({
                    error:
                        "Map name is required"
                });

        }


        if (!req.file) {

            return res
                .status(400)
                .json({
                    error:
                        "File is required"
                });

        }


        const maps =
            readMaps();


        const duplicate =
            maps.some(
                map =>
                    String(
                        map.name
                    )
                        .trim()
                        .toLowerCase() ===
                    name
                        .trim()
                        .toLowerCase()
            );


        if (duplicate) {

            try {

                fs.unlinkSync(
                    req.file.path
                );

            }
            catch {}

            return res
                .status(409)
                .json({
                    error:
                        "A map with this name already exists"
                });

        }


        const newMap = {

            id:
                Date.now()
                    .toString(),

            name:
                name.trim(),

            creator:
                creator
                    ? creator.trim()
                    : "",

            version:
                version
                    ? version.trim()
                    : "1.0",

            description:
                description
                    ? description.trim()
                    : "",

            originalFile:
                req.file.originalname,

            file:
                "/uploads/" +
                req.file.filename,

            update:
                false,

            change:
                false,

            createdAt:
                new Date()
                    .toISOString()

        };


        maps.push(
            newMap
        );


        writeMaps(
            maps
        );


        res.status(201).json(
            newMap
        );

    }
);


// ==================================================
// DELETE MAP
// ==================================================
//
// 관리자만 삭제 가능
//

app.delete(
    "/api/maps/:id",
    requireAdmin,
    (req, res) => {

        const maps =
            readMaps();


        const index =
            maps.findIndex(
                map =>
                    String(
                        map.id
                    ) ===
                    String(
                        req.params.id
                    )
            );


        if (index === -1) {

            return res
                .status(404)
                .json({
                    error:
                        "Map not found"
                });

        }


        const map =
            maps[index];


        // 실제 파일 삭제
        if (map.file) {

            const filename =
                path.basename(
                    map.file
                );

            const filePath =
                path.join(
                    UPLOAD_DIR,
                    filename
                );


            if (
                fs.existsSync(
                    filePath
                )
            ) {

                try {

                    fs.unlinkSync(
                        filePath
                    );

                }
                catch (error) {

                    console.error(
                        "Failed to delete uploaded file:",
                        error
                    );

                }

            }

        }


        maps.splice(
            index,
            1
        );


        writeMaps(
            maps
        );


        res.json({
            success: true
        });

    }
);


// ==================================================
// HOME
// ==================================================

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );

    }
);


// ==================================================
// START SERVER
// ==================================================

app.listen(
    PORT,
    () => {

        console.log(
            "================================="
        );

        console.log(
            "BCU Map Server Started"
        );

        console.log(
            "================================="
        );

        console.log(
            "Open: http://localhost:" +
            PORT
        );

        console.log(
            "================================="
        );

    }
);