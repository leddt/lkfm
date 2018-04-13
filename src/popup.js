let elements = {
    boardName: document.getElementById("board-name"),
    boardId: document.getElementById("board-id"),
    saveButton: document.getElementById("save"),
    savedFilters: document.getElementById("saved-filters")
};

let boardId, storageKey;

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let tabId = tabs[0].id;

    chrome.tabs.sendMessage(tabId, {message: "getBoard"}, (response) => {
        elements.boardName.textContent = response.name;
        elements.boardId.textContent = response.id;

        boardId = response.id;
        storageKey = `filters:${boardId}`;

        refreshFilterList();
    });

    elements.saveButton.addEventListener("click", () => {
        chrome.tabs.sendMessage(tabId, {message: "getFilters"}, (currentFilters) => {
            let name = prompt("Choose a name for this filter", "New filter");

            chrome.storage.sync.get([storageKey], function (data) {
                data[storageKey] = data[storageKey] || {};
                data[storageKey][name] = currentFilters;

                chrome.storage.sync.set(data, function() {
                    refreshFilterList();
                });
            });
        });
    });
});

function refreshFilterList() {
    let list = elements.savedFilters.querySelector("ul");
    
    list.innerHTML = "";

    chrome.storage.sync.get([storageKey], function (data) {
        for (let name of Object.keys(data[storageKey])) {
            let item = document.createElement("li");
            item.textContent = name;

            list.appendChild(item);
        }
    });
}