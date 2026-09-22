// ==================================================
// BCU MAP - SEASONS.JS
// ==================================================


// ==================================================
// BACK
// ==================================================

function backToSeasons() {

    location.href = "seasons.html";

}


// ==================================================
// OPEN MAP
// ==================================================

function openSeason(id) {

    if (!id) {
        return;
    }

    location.href =
        "season.html?id=" +
        encodeURIComponent(id);

}


// ==================================================
// LOAD MAP LIST
// ==================================================

async function loadMaps() {

    const list =
        document.getElementById("seasonList");

    if (!list) {
        console.error(
            "[BCU MAP] seasonList not found."
        );

        return;
    }


    // 처음에는 Loading maps...
    list.innerHTML = `
        <p id="mapLoadingText">
            Loading maps...
        </p>
    `;


    try {

        const response =
            await fetch("/api/maps");


        if (!response.ok) {

            throw new Error(
                "Server returned " +
                response.status
            );

        }


        const maps =
            await response.json();


        console.log(
            "[BCU MAP] Maps:",
            maps
        );


        // ==========================================
        // NO MAPS
        // ==========================================

        if (
            !Array.isArray(maps) ||
            maps.length === 0
        ) {

            setTimeout(function() {

                // 혹시 그 사이에 다른 화면으로
                // 바뀌었으면 중단
                const currentList =
                    document.getElementById(
                        "seasonList"
                    );

                if (!currentList) {
                    return;
                }


                currentList.innerHTML = `
                    <p id="mapLoadingText">
                        No maps Founded
                    </p>
                `;

            }, 3000);

            return;
        }


        // ==========================================
        // MAPS EXIST
        // ==========================================

        list.innerHTML = "";


        maps.forEach(function(map) {

            const card =
                document.createElement("div");

            card.className =
                "season-card";


            const updateBadge =
                map.update
                    ? `<span class="update-badge">
                           Update
                       </span>`
                    : "";


            const changeBadge =
                map.change
                    ? `<span class="change-badge">
                           Change
                       </span>`
                    : "";


            card.innerHTML = `
                <h2>
                    ${escapeHTML(
                        map.name || "Unnamed Map"
                    )}
                </h2>

                <p>
                    Creator:
                    ${escapeHTML(
                        map.creator || "Unknown"
                    )}
                </p>

                <p>
                    Version:
                    ${escapeHTML(
                        map.version || "1.0"
                    )}
                </p>

                <div class="map-badges">
                    ${updateBadge}
                    ${changeBadge}
                </div>
            `;


            card.addEventListener(
                "click",
                function() {

                    openSeason(map.id);

                }
            );


            list.appendChild(card);

        });

    }
    catch (error) {

        console.error(
            "[BCU MAP] Failed to load maps:",
            error
        );


        // 서버 오류가 발생해도
        // 3초 뒤에는 확실히 메시지를 표시
        setTimeout(function() {

            const currentList =
                document.getElementById(
                    "seasonList"
                );

            if (!currentList) {
                return;
            }


            currentList.innerHTML = `
                <p id="mapLoadingText">
                    No maps Founded
                </p>
            `;

        }, 3000);

    }

}


// ==================================================
// HTML ESCAPE
// ==================================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==================================================
// MAP DETAIL
// ==================================================

async function loadSeasonDetails() {

    const details =
        document.getElementById(
            "seasonDetails"
        );

    if (!details) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get("id");


    if (!id) {

        details.innerHTML = `
            <p>
                Map not found.
            </p>
        `;

        return;
    }


    try {

        const response =
            await fetch(
                "/api/maps/" +
                encodeURIComponent(id)
            );


        if (!response.ok) {
            throw new Error(
                "Server returned " +
                response.status
            );
        }


        const map =
            await response.json();


        details.innerHTML = `

            <h1>
                ${escapeHTML(
                    map.name || "Unnamed Map"
                )}
            </h1>

            <section class="panel">

                <h2>
                    Map Information
                </h2>

                <p>
                    Creator:
                    ${escapeHTML(
                        map.creator || "Unknown"
                    )}
                </p>

                <p>
                    Version:
                    ${escapeHTML(
                        map.version || "1.0"
                    )}
                </p>

                <p>
                    Description:
                </p>

                <p>
                    ${escapeHTML(
                        map.description ||
                        "No description."
                    )}
                </p>

            </section>

        `;

    }
    catch (error) {

        console.error(
            "[BCU MAP] Failed to load map:",
            error
        );


        details.innerHTML = `
            <p>
                Map not found.
            </p>
        `;

    }

}


// ==================================================
// PAGE START
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "[BCU MAP] seasons.js loaded."
        );


        const list =
            document.getElementById(
                "seasonList"
            );


        const details =
            document.getElementById(
                "seasonDetails"
            );


        if (list) {

            console.log(
                "[BCU MAP] Loading map list..."
            );

            loadMaps();

        }


        if (details) {

            loadSeasonDetails();

        }

    }
);


// ==================================================
// GLOBAL
// ==================================================

window.backToSeasons =
    backToSeasons;

window.openSeason =
    openSeason;

window.loadMaps =
    loadMaps;

window.loadSeasonDetails =
    loadSeasonDetails;