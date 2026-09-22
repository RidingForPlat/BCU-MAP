// ==================================================
// BCU MAP - APP.JS
// ==================================================


// ==================================================
// THEME SYSTEM
// ==================================================

function applyTheme() {

    const theme =
        localStorage.getItem("bcuTheme") || "dark";


    if (theme === "white") {

        document.body.classList.add(
            "white-mode"
        );

    } else {

        document.body.classList.remove(
            "white-mode"
        );

    }

}


// ==================================================
// SET THEME
// ==================================================

function setTheme(theme) {

    if (
        theme !== "white" &&
        theme !== "dark"
    ) {
        return;
    }


    localStorage.setItem(
        "bcuTheme",
        theme
    );


    applyTheme();

}


// 페이지가 열릴 때 저장된 테마 적용
applyTheme();


// ==================================================
// THEME BUTTONS
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const darkButton =
            document.getElementById(
                "darkModeButton"
            );


        const whiteButton =
            document.getElementById(
                "whiteModeButton"
            );


        if (darkButton) {

            darkButton.addEventListener(
                "click",
                function() {

                    setTheme("dark");

                }
            );

        }


        if (whiteButton) {

            whiteButton.addEventListener(
                "click",
                function() {

                    setTheme("white");

                }
            );

        }

    }
);


// 다른 스크립트에서 사용할 수 있도록 공개
window.setTheme = setTheme;


// ==================================================
// SERVER MAP API
// ==================================================
//
// 맵 데이터는 서버의 /api/maps를 사용한다.
// localStorage에는 테마만 저장한다.
// ==================================================

async function getSeasons() {

    try {

        const response =
            await fetch(
                "/api/maps",
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load maps"
            );

        }

        const maps =
            await response.json();

        return Array.isArray(maps)
            ? maps
            : [];

    }
    catch (error) {

        console.error(
            "[BCU MAP] Failed to load maps from server:",
            error
        );

        return [];

    }

}

window.getSeasons = getSeasons;


// ==================================================
// ADMIN MAP RENDER
// ==================================================

async function renderAdminSeasons() {

    const list =
        document.getElementById(
            "adminSeasonList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = `
        <p>
            Loading maps...
        </p>
    `;


    const seasons =
        await getSeasons();


    if (seasons.length === 0) {

        list.innerHTML = `
            <p>
                No maps Founded
            </p>
        `;

        return;

    }


    list.innerHTML = "";


    seasons.forEach(
        function(season) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "admin-season";


            item.innerHTML = `
                <strong>
                    ${escapeHTML(
                        season.name ||
                        "Unnamed Map"
                    )}
                </strong>

                <button
                    type="button"
                    class="delete-button"
                    data-id="${escapeHTML(
                        season.id
                    )}"
                >
                    Delete
                </button>
            `;


            const deleteButton =
                item.querySelector(
                    ".delete-button"
                );


            if (deleteButton) {

                deleteButton.addEventListener(
                    "click",
                    function() {

                        deleteAdminSeason(
                            season.id,
                            season.name
                        );

                    }
                );

            }


            list.appendChild(
                item
            );

        }
    );

}


// ==================================================
// DELETE ADMIN MAP
// ==================================================

async function deleteAdminSeason(
    id,
    mapName
) {

    if (!id) {
        return;
    }


    const confirmed =
        confirm(
            "Delete " +
            (mapName || "this map") +
            "?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/maps/" +
                encodeURIComponent(id),
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.error ||
                "Failed to delete map."
            );

            return;

        }


        await renderAdminSeasons();

    }
    catch (error) {

        console.error(
            "[BCU MAP] Failed to delete map:",
            error
        );


        alert(
            "Failed to connect to the server."
        );

    }

}


// ==================================================
// HTML ESCAPE
// ==================================================

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ==================================================
// ADMIN PAGE
// ==================================================

function loadAdminPage() {

    const form =
        document.getElementById(
            "seasonForm"
        );


    const list =
        document.getElementById(
            "adminSeasonList"
        );


    if (
        !form ||
        !list
    ) {
        return;
    }


    renderAdminSeasons();


// ==========================================
// FILE NAME DISPLAY
// ==========================================

    const fileInput =
        document.getElementById(
            "file"
        );


    const fileName =
        document.getElementById(
            "selectedFileName"
        );


    const filePickerButton =
        document.querySelector(
            ".file-picker-button"
        );


    if (
        fileInput &&
        fileName
    ) {

        fileInput.addEventListener(
            "change",
            function() {

                if (
                    fileInput.files &&
                    fileInput.files.length > 0
                ) {

                    fileName.textContent =
                        fileInput.files[0].name;


                    if (filePickerButton) {

                        filePickerButton.textContent =
                            "Change the File";

                    }

                } else {

                    fileName.textContent =
                        "No file selected";


                    if (filePickerButton) {

                        filePickerButton.textContent =
                            "Select File";

                    }

                }

            }
        );

    }


    // ==========================================
    // ADD MAP
    // ==========================================

    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "name"
                )?.value.trim() || "";


            const creator =
                document.getElementById(
                    "creator"
                )?.value.trim() || "";


            const version =
                document.getElementById(
                    "version"
                )?.value.trim() || "";


            const description =
                document.getElementById(
                    "description"
                )?.value.trim() || "";


            const currentFileInput =
                document.getElementById(
                    "file"
                );


            const file =
                currentFileInput?.files[0];


            if (!name) {

                alert(
                    "Please enter a map name."
                );

                return;

            }


            if (!file) {

                alert(
                    "Please select a file."
                );

                return;

            }


            const formData =
                new FormData();


            formData.append(
                "name",
                name
            );


            formData.append(
                "creator",
                creator
            );


            formData.append(
                "version",
                version
            );


            formData.append(
                "description",
                description
            );


            formData.append(
                "file",
                file
            );


            try {

                const response =
                    await fetch(
                        "/api/maps",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    alert(
                        result.error ||
                        "Failed to upload map."
                    );

                    return;

                }


                form.reset();


                if (fileName) {

                    fileName.textContent =
                        "No file selected";

                }


                if (filePickerButton) {

                    filePickerButton.textContent =
                        "Select File";

                }


                await renderAdminSeasons();


                alert(
                    name +
                    " added."
                );

            }
            catch (error) {

                console.error(
                    "[BCU MAP] Upload error:",
                    error
                );


                alert(
                    "Failed to connect to the server."
                );

            }

        }
    );

}


// ==================================================
// MAPS PAGE
// ==================================================

async function renderMapsPage() {

    const list =
        document.getElementById(
            "seasonList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = `
        <p>
            Loading maps...
        </p>
    `;


    const maps =
        await getSeasons();


    if (maps.length === 0) {

        list.innerHTML = `
            <p>
                No maps Founded
            </p>
        `;

        return;

    }


    list.innerHTML = "";


    maps.forEach(
        function(map) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "season-card";


            const labels = [];


            if (map.update) {

                labels.push(
                    `<span class="map-label update-label">Update</span>`
                );

            }


            if (map.change) {

                labels.push(
                    `<span class="map-label change-label">Change</span>`
                );

            }


            card.innerHTML = `
                <h2>
                    ${escapeHTML(
                        map.name ||
                        "Unnamed Map"
                    )}
                    ${labels.join(" ")}
                </h2>

                <p>
                    ${escapeHTML(
                        map.creator ||
                        "Unknown"
                    )}
                </p>

                <p>
                    Version ${escapeHTML(
                        map.version ||
                        "1.0"
                    )}
                </p>
            `;


            card.addEventListener(
                "click",
                function() {

                    if (
                        typeof window.openSeason ===
                        "function"
                    ) {

                        window.openSeason(
                            map.id
                        );

                    } else {

                        location.href =
                            "season.html?id=" +
                            encodeURIComponent(
                                map.id
                            );

                    }

                }
            );


            list.appendChild(
                card
            );

        }
    );

}


// ==================================================
// MAP DETAILS PAGE
// ==================================================

let mapDetailsRenderToken = 0;


async function renderMapDetailsPage() {

    const details =
        document.getElementById(
            "seasonDetails"
        );


    if (!details) {
        return;
    }


    const params =
        new URLSearchParams(
            location.search
        );


    const id =
        params.get("id");


    if (!id) {

        details.innerHTML = `
            <p>
                Map not found
            </p>
        `;

        return;

    }


    // ------------------------------------------
    // 이번 렌더링만 유효하도록 토큰 생성
    // ------------------------------------------

    const renderToken =
        ++mapDetailsRenderToken;


    // ------------------------------------------
    // 처음 로딩할 때만 Loading 표시
    // ------------------------------------------

    if (
        !details.dataset.mapLoaded
    ) {

        details.innerHTML = `
            <p>
                Loading...
            </p>
        `;

    }


    try {

        const response =
            await fetch(
                "/api/maps/" +
                encodeURIComponent(id),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        const map =
            await response.json();


        // ------------------------------------------
        // 이미 더 새로운 렌더링이 시작됐다면
        // 이 오래된 요청은 아무것도 건드리지 않음
        // ------------------------------------------

        if (
            renderToken !==
            mapDetailsRenderToken
        ) {
            return;
        }


        if (!response.ok) {

            details.innerHTML = `
                <p>
                    ${escapeHTML(
                        map.error ||
                        "Map not found"
                    )}
                </p>
            `;

            return;

        }


        const labels = [];


        if (map.update) {

            labels.push(
                `<span class="map-label update-label">Update</span>`
            );

        }


        if (map.change) {

            labels.push(
                `<span class="map-label change-label">Change</span>`
            );

        }


        // ------------------------------------------
        // Download 버튼
        // 무조건 생성
        // ------------------------------------------

const descriptionHTML = document.createElement("p");

descriptionHTML.className =
    "description";

descriptionHTML.textContent =
    map.description || "";


const downloadContainer =
    document.createElement("p");


const downloadLink =
    document.createElement("a");

downloadLink.className =
    "download-map-link";

downloadLink.href =
    "/api/maps/" +
    encodeURIComponent(id) +
    "/download";

downloadLink.textContent =
    "Download Map";

downloadContainer.appendChild(
    downloadLink
);


details.innerHTML = "";

details.insertAdjacentHTML(
    "beforeend",
    `
        <h1>
            ${escapeHTML(
                map.name ||
                "Unnamed Map"
            )}
            ${labels.join(" ")}
        </h1>

        <p>
            Creator: ${escapeHTML(
                map.creator ||
                "Unknown"
            )}
        </p>

        <p>
            Version: ${escapeHTML(
                map.version ||
                "1.0"
            )}
        </p>
    `
);


details.appendChild(
    descriptionHTML
);

details.appendChild(
    downloadContainer
);


        // ------------------------------------------
        // 최종 화면
        // ------------------------------------------

        details.innerHTML = `
            <h1>
                ${escapeHTML(
                    map.name ||
                    "Unnamed Map"
                )}
                ${labels.join(" ")}
            </h1>

            <p>
                Creator:
                ${escapeHTML(
                    map.creator ||
                    "Unknown"
                )}
            </p>

            <p>
                Version:
                ${escapeHTML(
                    map.version ||
                    "1.0"
                )}
            </p>

            <p class="description">
                ${escapeHTML(
                    map.description ||
                    ""
                )}
            </p>

            ${downloadHTML}
        `;


        // ------------------------------------------
        // 정상적으로 최종 렌더링됐음을 기록
        // ------------------------------------------

        details.dataset.mapLoaded = "true";


        // ------------------------------------------
        // Download 링크가 실제 DOM에 들어왔는지 확인
        // ------------------------------------------

        const downloadLink =
            details.querySelector(
                ".download-map-link"
            );


        if (!downloadLink) {

            console.warn(
                "[BCU MAP] Download Map link was not created."
            );

        }

    }
    catch (error) {

        // 오래된 요청이면 무시
        if (
            renderToken !==
            mapDetailsRenderToken
        ) {
            return;
        }


        console.error(
            "[BCU MAP] Failed to load map details:",
            error
        );


        details.innerHTML = `
            <p>
                Failed to connect to the server.
            </p>
        `;

    }

}

// ==================================================
// MAPS OPENING
// ==================================================
//
// Maps 버튼을 누르면 현재 index.html 위에
// seasons.html을 iframe으로 표시한다.
//
// 열기:
// ● → ─── → □
//
// 닫기:
// □ → ─── → ● → wave → 삭제
// ==================================================

function openMapsWithAnimation() {

    // 이미 열려 있으면 중복 생성하지 않음
    if (
        document.querySelector(
            ".maps-opening"
        )
    ) {
        return;
    }


    const opening =
        document.createElement(
            "div"
        );


    opening.className =
        "maps-opening";


    opening.innerHTML = `

        <div
            class="maps-opening-shape"
        >

            <button
                type="button"
                class="maps-close-button"
            >
                ×
            </button>

            <iframe
                src="seasons.html"
                class="maps-opening-frame"
                title="BCU Maps"
            ></iframe>

        </div>

    `;


    document.body.appendChild(
        opening
    );


    // ==========================================
    // CLOSE BUTTON
    // ==========================================

    const closeButton =
        opening.querySelector(
            ".maps-close-button"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function() {

                if (
                    opening.classList.contains(
                        "closing"
                    )
                ) {
                    return;
                }


                opening.classList.add(
                    "closing"
                );


                setTimeout(
                    function() {

                        opening.remove();

                    },
                    850
                );

            }
        );

    }


    // ==========================================
    // OPENING ANIMATION
    // ==========================================

    requestAnimationFrame(
        function() {

            opening.classList.add(
                "step-1"
            );

        }
    );


    setTimeout(
        function() {

            if (
                document.body.contains(
                    opening
                )
            ) {

                opening.classList.add(
                    "step-2"
                );

            }

        },
        150
    );


    setTimeout(
        function() {

            if (
                document.body.contains(
                    opening
                )
            ) {

                opening.classList.add(
                    "step-3"
                );

            }

        },
        400
    );


    setTimeout(
        function() {

            if (
                document.body.contains(
                    opening
                )
            ) {

                opening.classList.add(
                    "step-4"
                );

            }

        },
        750
    );

}


// ==================================================
// MAPS BUTTON
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const mapsButton =
            document.getElementById(
                "mapsButton"
            );


        if (!mapsButton) {
            return;
        }


        mapsButton.addEventListener(
            "click",
            function(event) {

                event.preventDefault();
                event.stopPropagation();

                openMapsWithAnimation();

            }
        );

    }
);


// ==================================================
// THEME SWITCH
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const themeSwitch =
            document.getElementById(
                "themeSwitch"
            );


        if (!themeSwitch) {
            return;
        }


        themeSwitch.checked =
            document.body.classList.contains(
                "white-mode"
            );


        themeSwitch.addEventListener(
            "change",
            function() {

                setTheme(
                    themeSwitch.checked
                        ? "white"
                        : "dark"
                );

            }
        );

    }
);


// ==================================================
// PAGE START
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadAdminPage();
        renderMapsPage();

        // Map 상세 페이지일 때만 실행
        if (
            document.getElementById(
                "seasonDetails"
            )
        ) {

            renderMapDetailsPage();

        }

    }
);