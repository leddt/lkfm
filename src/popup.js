let elements = {
    boardName: document.getElementById("board-name"),
    boardId: document.getElementById("board-id"),
    saveButton: document.getElementById("save"),
    savedFilters: document.getElementById("saved-filters"),
    nameInput: document.getElementById("name"),
    overwriteWarning: document.getElementById("overwrite-warning")
};

let tabId, boardId, storageKey;

let filterNames = [];

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    tabId = tabs[0].id;

    chrome.tabs.sendMessage(tabId, {message: "getBoard"}, (response) => {
        elements.boardName.textContent = response.name;
        elements.boardId.textContent = response.id;

        boardId = response.id;
        storageKey = `filters:${boardId}`;

        refreshFilterList();
    });

    elements.saveButton.addEventListener("click", onSaveClicked);
    elements.nameInput.addEventListener("keyup", onNameChanged);
    elements.nameInput.addEventListener("keyup", (ev) => {
        if (ev.keyCode === 13) {
            onSaveClicked();
        }
    });
});

function onNameChanged() {
    elements.overwriteWarning.style.display = "none";
    elements.saveButton.disabled = true;

    const name = elements.nameInput.value;
    if (!name) return;

    elements.saveButton.disabled = false;

    if (filterNames.includes(name))
        elements.overwriteWarning.style.display = "block";
}

function onSaveClicked() {
    const name = elements.nameInput.value;
    if (!name) return;

    chrome.tabs.sendMessage(tabId, {message: "getFilters"}, (currentFilters) => {
        chrome.storage.sync.get([storageKey], function (data) {
            data[storageKey] = data[storageKey] || {};
            data[storageKey][name] = currentFilters;

            chrome.storage.sync.set(data, function() {
                elements.nameInput.value = "";
                onNameChanged();

                refreshFilterList();
            });
        });
    });
}

function refreshFilterList() {
    let list = elements.savedFilters.querySelector("ul");
    
    list.innerHTML = "";
    filterNames = [];

    chrome.storage.sync.get([storageKey], function (data) {
        let any = false;
        
        if (data && data[storageKey]) {
            for (let name of Object.keys(data[storageKey])) {
                any = true;
                filterNames.push(name);

                let item = document.createElement("li");
                item.textContent = name;
                
                let deleteButton = document.createElement("button");
                deleteButton.className = "btn btn-delete";
                deleteButton.innerHTML = "&times;"
                deleteButton.addEventListener("click", () => deleteFilter(name));
                item.appendChild(deleteButton);

                let applyButton = document.createElement("button");
                applyButton.className = "btn";
                applyButton.textContent = "Apply";
                applyButton.addEventListener("click", () => applyFilter(data[storageKey][name]));
                item.appendChild(applyButton);

                list.appendChild(item);
            }
        }

        elements.savedFilters.style.display = (any ? "block" : "none");
    });
}

function deleteFilter(name) {
    chrome.storage.sync.get([storageKey], function (data) {
        data[storageKey] = data[storageKey] || {};
        delete data[storageKey][name];

        chrome.storage.sync.set(data, function() {
            refreshFilterList();
        });
    });
}

function applyFilter(data) {
    chrome.tabs.sendMessage(tabId, {message: "applyFilter", data: data});
    window.close();
}