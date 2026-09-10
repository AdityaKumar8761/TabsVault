function initActionButtons() {
    const actionBtn1 = document.querySelector('.action-btn-1');
    const actionBtn2 = document.querySelector('.action-btn-2');
    const noteInputEl = document.querySelector('.note-input-el');

    if (!actionBtn1 || !noteInputEl) {
        return;
    }

    actionBtn1.addEventListener('click', () => {
        if (noteInputEl.classList.contains('visible')) {
            if (typeof addingTab === 'function') {
                addingTab();
            }
        } else {
            noteInputEl.classList.add('visible');
            noteInputEl.focus();
        }
    });

    if (actionBtn2 && typeof addingTab === 'function') {
        actionBtn2.addEventListener('click', () => {
            addingTab(true);
        });
    }

    document.addEventListener('click', (event) => {
        const clickedInsideToggle = actionBtn1.contains(event.target) || noteInputEl.contains(event.target);
        if (!clickedInsideToggle) {
            noteInputEl.classList.remove('visible');
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initActionButtons);
} else {
    initActionButtons();
}

