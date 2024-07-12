let tabCounter = 1;
var lineNumbers = true;
var currentTab = null;
var closedTabs = [];
const editors = new Map();

function createNewTab(tabId = null) {
    if (tabId == null) {
        tabId = `tab-${tabCounter}`;
        while (editors.has(tabId)) {
            tabCounter++;
            tabId = `tab-${tabCounter}`;
            console.log('Tab ID already exists, incrementing to:', tabId);
        }
        tabCounter++;
    }
    const tabButton = document.createElement('button');
    tabButton.dataset.tabId = tabId;
    tabButton.textContent = `New ${tabId}`;
    tabButton.onclick = () => switchToTab(tabId);

    document.querySelector('.tab-bar').insertBefore(tabButton, document.getElementById('new-tab'));

    const editorDiv = document.createElement('div');
    editorDiv.id = tabId;
    document.querySelector('.editor-container').appendChild(editorDiv);

    const editor = CodeMirror(editorDiv, {
        lineNumbers: lineNumbers,
        mode: "text",
    });


    editor.setSize("100vw", "calc(100vh - 45px)");
    editors.set(tabId, editor);
    switchToTab(tabId);
}

function switchToTab(tabId) {
    document.querySelectorAll('.editor-container > div').forEach(div => div.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
    document.querySelectorAll('.tab-bar > button').forEach(button => button.style.backgroundColor = '#808080');
    document.getElementById("new-tab").style.backgroundColor = '#f0f0f0';
    document.querySelector(`.tab-bar > button:nth-child(${Array.from(editors.keys()).indexOf(tabId) + 1})`).style.backgroundColor = '#f0f0f0';
    currentTab = tabId;
}

function getCurrentFileData() {
    file_data = {
        'filename': currentTab,
        'data': editors.get(currentTab).getValue()
    }
    return file_data;
}

function loadFromLocalStorage() {
    var editor_state = localStorage.getItem('editor_state');
    if (editor_state) {
        try {
            const editorState = JSON.parse(editor_state);
            console.log("Retrieved editor state:", editorState);

            // Optionally, recreate the editors from the saved state
            for (const [tabId, state] of Object.entries(editorState)) {
                if (!editors.has(tabId)) {
                    createNewTab(tabId);
                }
                const editor = editors.get(tabId);
                editor.setValue(state.content);
                editor.setOption('mode', state.mode);
                // TODO
                // Replace this with a localStorage value in the future 
                editor.setOption('lineNumbers', lineNumbers);
            }
            switchToTab(localStorage.getItem('current_tab'));
        } catch (error) {
            console.error("Error parsing editor state:", error);
        }
    } else {
        console.log("No editor state found in localStorage");
    }
    console.log("Current editors:", editors);
}

function saveToLocalStorage() {
    const editorState = {};
    for (const [tabId, editor] of editors) {
        editorState[tabId] = {
            content: editor.getValue(),
            mode: editor.getOption('mode'),
            tabId: tabId
        };
    }
    localStorage.setItem('current_tab', currentTab);
    localStorage.setItem('editor_state', JSON.stringify(editorState));
}

document.getElementById('new-tab').onclick = () => createNewTab();

// Create initial tab
createNewTab();

// Area below will be used for settings and other stuff
document.getElementById('mememmeme').addEventListener('click', function () {
    lineNumbers = !lineNumbers;
    for (let editor of editors.values()) {
        editor.setOption('lineNumbers', lineNumbers);
    }
});

document.getElementById('file-menu').addEventListener('click', function () {
    document.getElementById('file-menu-content').classList.toggle('show');
});

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('#file-menu')) {
        var dropdowns = document.getElementsByClassName("menu-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// Retrieving the editors Map
document.getElementById("test").addEventListener('click', function () {
    loadFromLocalStorage();
});

// Add functionality to menu items
document.getElementById('new-file').addEventListener('click', createNewTab);
document.getElementById('open-file').addEventListener('click', function () {
    // TODO
    console.log('Open file clicked');
});
document.getElementById('save-state').addEventListener('click', function () {
    console.log('Save clicked');
    saveToLocalStorage();
});
document.getElementById('save-as').addEventListener('click', function () {
    var file_data = getCurrentFileData();
    var textToSave = file_data.data;
    var filename = file_data.filename;

    // Step 1 & 2: Create a Blob and a URL for it
    var blob = new Blob([textToSave], { type: "text/plain" });
    var url = URL.createObjectURL(blob);

    // Step 3: Create an <a> element
    var a = document.createElement("a");
    a.href = url; // Step 4
    a.download = filename; // Step 5
    document.body.appendChild(a); // Temporarily add the element to the document

    // Step 6: Trigger the download
    a.click();

    // Step 7: Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});
document.getElementById("close-tab").addEventListener('click', function () {
    // TODO
    // Could be good idea to have confirmation and session saving here
    console.log('Close tab clicked');
    const editor = editors.get(currentTab);
    closedTabs.push({
        'filename': currentTab,
        'data': editor.getValue()
    });
    editor.setValue('');
    editor.clearHistory();
    editors.delete(currentTab);
    document.getElementById(currentTab).remove();
    document.querySelector(`.tab-bar > button[data-tab-id="${currentTab}"]`).remove();
    
});

document.getElementById('settings').addEventListener('click', function () {
    popup = window.open('settings.html', 'Settings', 'width=400,height=400');
});

loadFromLocalStorage();