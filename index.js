
let myTabs =
    JSON.parse(localStorage.getItem("myTabs")) || [];

let myGroup =
    JSON.parse(localStorage.getItem("myGroup")) || {};


// ELEMENTS

const tabList =
    document.querySelector(".tabs-list");

const deleteBtn =
    document.querySelector(".icon-btn.delete-btn");

const groupsList =
    document.querySelector(".groups-list");

const createGroupBtn =
    document.querySelector(".add-group-btn");



// INITIAL RENDER
renderMyTabs();
renderMyGroups();

// NORMAL TAB - ENTER


noteInputEl.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        event.preventDefault();

        addingTab();

    }

});


// ADD NORMAL TAB

function addingTab(forceUrlOnly = false) {

    const finish = (url) => {

        const note =
            forceUrlOnly ? "" : noteInputEl.value.trim();

        const time =
            new Date().toLocaleString();

        const newTab = {
            note: note,
            url: url || "",
            time: time
        };

        myTabs.push(newTab);

        localStorage.setItem(
            "myTabs",
            JSON.stringify(myTabs)
        );

        renderMyTabs();

        if (!forceUrlOnly) {
            noteInputEl.value = "";
        }

    };

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const active = Array.isArray(tabs) && tabs.length ? tabs[0] : null;
            finish(active && active.url ? active.url : window.location.href);
        });
    } else {
        // Fallback when chrome API isn't available
        finish(window.location.href);
    }

}


// RENDER NORMAL TABS

function renderMyTabs() {

    tabList.innerHTML = "";


    myTabs.forEach((tab, index) => {

        tabList.innerHTML += `

            <article class="tab-item" data-url="${encodeURIComponent(tab.url)}">

                <div class="tab-info">

                    <div class="tab-title">
                        ${escapeHTML(
                            tab.note
                                ? tab.note
                                : tab.url
                        )}
                    </div>

                    <div class="tab-url">
                        ${escapeHTML(tab.url)}
                    </div>

                </div>


                <div class="tab-time">
                    ${escapeHTML(tab.time)}
                </div>


                <button
                    class="delete-tab-btn"
                    data-index="${index}">

                    🗑

                </button>

            </article>

        `;

    });

}

// DELETE INDIVIDUAL NORMAL TAB

tabList.addEventListener("click", (event) => {

    const deleteButton =
        event.target.closest(".delete-tab-btn");

    if (deleteButton) {

        const index =
            Number(deleteButton.dataset.index);

        if (
            Number.isNaN(index) ||
            !myTabs[index]
        ) {
            return;
        }

        myTabs.splice(index, 1);

        localStorage.setItem(
            "myTabs",
            JSON.stringify(myTabs)
        );

        renderMyTabs();

        return;

    }

    // Open saved tab when clicking the tab item
    const tabItem = event.target.closest('.tab-item');

    if (tabItem) {
        const url = decodeURIComponent(tabItem.dataset.url || "");

        if (url) {
            chrome.tabs.create({ url: url });
        }

        return;
    }

});


// DELETE ALL NORMAL TABS

function deleteAll() {

    myTabs = [];


    localStorage.setItem(
        "myTabs",
        JSON.stringify(myTabs)
    );


    renderMyTabs();

}


deleteBtn.addEventListener("click", () => {

    deleteAll();

});

// CREATE GROUP

createGroupBtn.addEventListener("click", () => {

    createGroup();

});

// CREATE GROUP FROM ALL OPEN CHROME TABS

function createGroup() {

    chrome.tabs.query({}, (tabs) => {

        const groupId =
            Date.now();


        const groupTime =
            new Date().toLocaleString();


        const groupNumber =
            Object.keys(myGroup).length + 1;


        const groupTabs =
            tabs
                .filter(tab => tab.url)
                .map(tab => {

                    return {

                        title:
                            tab.title || "Untitled",

                        url:
                            tab.url,

                        favIconUrl:
                            tab.favIconUrl || "",

                        time:
                            groupTime

                    };

                });


        myGroup[groupId] = {

            id: groupId,

            name:
                `Group ${groupNumber}`,

            time:
                groupTime,

            tabs:
                groupTabs

        };


        saveGroups();


        renderMyGroups();

    });

}

// RENDER GROUPS

function renderMyGroups() {

    /*
        Remember which groups are currently open.

        This is important because renderMyGroups()
        destroys and recreates the HTML.
    */

    const openGroups =
        new Set();


    document
        .querySelectorAll(".group-item.open")
        .forEach(group => {

            openGroups.add(
                String(group.dataset.groupId)
            );

        });


    groupsList.innerHTML = "";


    Object.values(myGroup).forEach(group => {

        if (!Array.isArray(group.tabs)) {
            group.tabs = [];
        }


        const isOpen =
            openGroups.has(
                String(group.id)
            );


        groupsList.innerHTML += `

            <article
                class="group-item ${isOpen ? "open" : ""}"
                data-group-id="${group.id}">


                <!-- =========================
                     GROUP HEADER
                ========================== -->

                <div class="group-header">


                    <div class="group-icon">
                        □
                    </div>


                    <div class="group-info">

                        <div class="group-name">

                            ${escapeHTML(group.name)}

                        </div>


                        <div class="group-count">

                            ${group.tabs.length}
                            ${group.tabs.length === 1 ? "tab" : "tabs"}

                        </div>

                    </div>


                    <div class="group-actions">


                        <!-- ADD CURRENT TABS -->

                        <button
                            class="add-tab-to-group-btn"
                            data-group-id="${group.id}"
                            title="Save current tabs">

                            +

                        </button>


                        <!-- DELETE GROUP -->

                        <button
                            class="delete-group-btn"
                            data-group-id="${group.id}"
                            title="Delete group">

                            🗑

                        </button>


                        <!-- ARROW -->

                        <button
                            class="group-arrow"
                            type="button">

                            ›

                        </button>


                    </div>


                </div>


                <!-- =========================
                     GROUP TABS
                ========================== -->

                <div class="group-tabs">

                    ${
                        group.tabs.length === 0

                        ?

                        `
                        <div class="empty-group">
                            No tabs in this group
                        </div>
                        `

                        :

                        group.tabs.map(
                            (tab, tabIndex) => `

                            <div
                                class="group-tab"
                                data-url="${encodeURIComponent(tab.url)}">


                                <div class="group-tab-icon">

                                    ${
                                        tab.favIconUrl

                                        ?

                                        `<img
                                            src="${escapeAttribute(tab.favIconUrl)}"
                                            alt=""
                                            width="18"
                                            height="18"
                                        >`

                                        :

                                        "□"
                                    }

                                </div>


                                <div class="group-tab-info">

                                    <div class="group-tab-title">

                                        ${escapeHTML(
                                            tab.title
                                                ? tab.title
                                                : tab.url
                                        )}

                                    </div>


                                    <div class="group-tab-url">

                                        ${escapeHTML(tab.url)}

                                    </div>

                                </div>


                                <button
                                    class="delete-group-tab-btn"
                                    data-group-id="${group.id}"
                                    data-tab-index="${tabIndex}"
                                    title="Delete tab">

                                    🗑

                                </button>


                            </div>

                        `
                        ).join("")
                    }

                </div>


            </article>

        `;

    });

}


// GROUP CLICK HANDLING

groupsList.addEventListener("click", (event) => {

    // ADD CURRENT TABS

    const addButton =
        event.target.closest(
            ".add-tab-to-group-btn"
        );


    if (addButton) {

        event.stopPropagation();


        const groupId =
            addButton.dataset.groupId;


        saveCurrentTabsToGroup(groupId);


        return;

    }


    // DELETE GROUP

    const deleteGroupButton =
        event.target.closest(
            ".delete-group-btn"
        );


    if (deleteGroupButton) {

        event.stopPropagation();


        const groupId =
            deleteGroupButton.dataset.groupId;


        if (!myGroup[groupId]) {
            return;
        }


        delete myGroup[groupId];


        saveGroups();


        renderMyGroups();


        return;

    }

    // DELETE TAB FROM GROU
    const deleteTabButton =
        event.target.closest(
            ".delete-group-tab-btn"
        );


    if (deleteTabButton) {

        event.stopPropagation();


        const groupId =
            deleteTabButton.dataset.groupId;


        const tabIndex =
            Number(
                deleteTabButton.dataset.tabIndex
            );


        const group =
            myGroup[groupId];


        if (!group) {
            return;
        }


        if (
            Number.isNaN(tabIndex) ||
            !group.tabs[tabIndex]
        ) {
            return;
        }


        /*
            Delete only this tab.
        */

        group.tabs.splice(
            tabIndex,
            1
        );


        saveGroups();


        /*
            renderMyGroups() remembers
            the open state, so the group
            will stay open.
        */

        renderMyGroups();


        return;

    }
    // OPEN SAVED TAB

    const groupTab =
        event.target.closest(".group-tab");


    if (groupTab) {

        const url =
            decodeURIComponent(
                groupTab.dataset.url
            );


        if (url) {

            chrome.tabs.create({
                url: url
            });

        }


        return;

    }


    // OPEN / CLOSE GROUP


    const header =
        event.target.closest(".group-header");


    if (header) {

        const group =
            header.closest(".group-item");


        if (group) {

            group.classList.toggle("open");

        }

    }

});

// SAVE CURRENT CHROME TABS TO EXISTING GROUP

function saveCurrentTabsToGroup(groupId) {

    const group =
        myGroup[groupId];


    if (!group) {
        return;
    }


    chrome.tabs.query({}, (tabs) => {

        const groupTime =
            new Date().toLocaleString();


        const currentTabs =
            tabs
                .filter(tab => tab.url)
                .map(tab => {

                    return {

                        title:
                            tab.title || "Untitled",

                        url:
                            tab.url,

                        favIconUrl:
                            tab.favIconUrl || "",

                        time:
                            groupTime

                    };

                });


        /*
            Replace the group's tabs
            with the current Chrome tabs.
        */

        group.tabs =
            currentTabs;


        group.time =
            groupTime;


        saveGroups();


        renderMyGroups();

    });

}
// SAVE GROUPS

function saveGroups() {

    localStorage.setItem(
        "myGroup",
        JSON.stringify(myGroup)
    );

}

// ESCAPE HTML

function escapeHTML(value) {

    if (value === undefined || value === null) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

// ESCAPE ATTRIBUT
function escapeAttribute(value) {

    return escapeHTML(value);

}


groupsList.addEventListener("dblclick", (event) => {

    // Don't trigger when double-clicking a button
    if (event.target.closest("button")) {
        return;
    }

    const groupItem =
        event.target.closest(".group-item");

    if (!groupItem) {
        return;
    }

    const groupId =
        groupItem.dataset.groupId;

    const group =
        myGroup[groupId];

    if (!group || !group.tabs.length) {
        return;
    }

    const urls =
        group.tabs
            .map(tab => tab.url)
            .filter(url => url);

    if (!urls.length) {
        return;
    }

    // Open the first tab in a new window
    chrome.windows.create(
        {
            url: urls[0]
        },
        (newWindow) => {

            if (!newWindow || !newWindow.id) {
                return;
            }

            // Open the remaining tabs in that window
            urls.slice(1).forEach(url => {

                chrome.tabs.create({
                    windowId: newWindow.id,
                    url: url,
                    active: false
                });

            });

        }
    );

});

// actionBtn2 is handled in action.js (click -> toggle input / add on Enter)