   const tabsBtn =
            document.getElementById("tabsBtn");

        const groupsBtn =
            document.getElementById("groupsBtn");

        const contentSlider =
            document.getElementById("contentSlider");

        const actionBtn2 = document.querySelector('.action-btn-2');


        /* =========================
           TABS BUTTON
        ========================== */

        tabsBtn.addEventListener("click", () => {

            contentSlider.classList.remove(
                "show-groups"
            );

            tabsBtn.classList.add("active");

            groupsBtn.classList.remove("active");

        });



        /* =========================
           GROUPS BUTTON
        ========================== */

        groupsBtn.addEventListener("click", () => {

            contentSlider.classList.add(
                "show-groups"
            );

            groupsBtn.classList.add("active");

            tabsBtn.classList.remove("active");

        });



        /* =========================
           GROUP EXPANSION
        ========================== */

        const groups =
            document.querySelectorAll(".group-item");


        groups.forEach(group => {

            const header =
                group.querySelector(".group-header");


            header.addEventListener("click", () => {

                group.classList.toggle("open");

            });

        });


        // ============================
        // INPUT Element
        // ============================

const actionBtn1 = document.querySelector('.action-btn-1')
const noteInputEl = document.querySelector('.note-input-el')

actionBtn1.addEventListener('click', () => {
    if(noteInputEl.classList.contains('visible')){
        addingTab()
    }else{
        noteInputEl.classList.add('visible')
        noteInputEl.focus();
    }
})

// When the user clicks action-btn-2, save URL only (no note)
actionBtn2.addEventListener('click', () => {
    if (typeof addingTab === 'function') {
        addingTab(true);
    }
});

document.addEventListener('click', (event) => {

    if (
        !actionBtn1.contains(event.target) &&
        !noteInputEl.contains(event.target)
    ) {
        noteInputEl.classList.remove('visible')
    }

})

