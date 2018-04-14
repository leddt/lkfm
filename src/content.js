chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === "getBoard") 
            sendResponse(getBoard());
        else if (request.message === "getFilters") 
            sendResponse(getFilters());
        else if (request.message === "applyFilter")
            applyFilters(request.data);
    }
);

function getBoard() {
    return {
        name: document.title,
        id: /\/board\/(\d+)/.exec(location.pathname)[1]
    };
}

function getFilters() {
    ensureFiltersOpen();

    return {
        mode: q(".filter-modeButton.is-selected").textContent,
        title: q("#board-filter-title").value,
        filters: qq(".filter-panels .accordion")
            .filter(node => !!q(".accordion-check", node))
            .map(getFilter)
    };
}

function getFilter(node) {
    var result = {
        name: q(".accordion-header", node).textContent
    };

    let hadToLoad = false;
    if (mustLoadContent(node)) {
        hadToLoad = true;
        q(".accordion-title", node).click();
    }

    if (isCheckboxListFilter(node)) {
        result.values = qq(".filter-checkList .is-selected", node).map(label => label.textContent)
    } else if (isActivityFilter(node)) {
        result.card = q(".Select-value-label", node).textContent;
        result.days = q(".filter-daysInput").value;
    } else if (isDateRangeFilter(node)) {
        result.dates = qq(".filter-dateInput", node).map(input => input.value);
    } else if (isRelativeDateFilter(node)) {
        result.days = qq(".filter-daysInput", node).map(input => input.value);
    } else if (isTagsFilter(node)) {
        result.tags = qq(".token-text").map(t => t.textContent);
        result.mode = q(".filter-tagsMode:checked", node).nextSibling.textContent;
    }

    if (hadToLoad) {
        q(".accordion-title", node).click();
    }

    return result;
}



function applyFilters(data) {
    ensureFiltersOpen();
    
    for (button of qq(".filter-modeButton")) {
        if (button.textContent === data.mode) {
            button.click();
            break;
        }
    }

    setInputText(q("#board-filter-title"), data.title);

    for (let node of qq(".filter-panels .accordion")) {
        let name = q(".accordion-header", node).textContent;
        let config = data.filters.find(f => f.name === name);
        
        let hadToLoad = false;
        if (mustLoadContent(node)) {
            hadToLoad = true;
            q(".accordion-title", node).click();
        }

        if (isCheckboxListFilter(node)) {
            for (let cb of qq(".checkList-item", node)) {
                let isChecked = cb.classList.contains("is-selected");
                let shouldCheck = !!config && config.values.indexOf(cb.textContent) >= 0;
                if (isChecked !== shouldCheck) {
                    cb.click();
                }
            }
        } else if (isActivityFilter(node)) {
            if (config && config.card) {
                let arrow = q(".Select-arrow-zone", node);
                arrow.dispatchEvent(createMouseEvent("mousedown"));
                
                let option = q(`.Select-option[aria-label='${config.card}']`);
                option.dispatchEvent(createMouseEvent("mousedown"));
            }

            setInputText(q(".filter-daysInput", node), config ? config.days : "")
        } else if (isDateRangeFilter(node)) {
            let fields = qq(".filter-dateInput", node);
            for (let i = 0; i < fields.length; i++) {
                setInputText(fields[i], config && config.dates ? config.dates[i] : "");
            }
        } else if (isRelativeDateFilter(node)) {
            let fields = qq(".filter-daysInput", node);
            for (let i = 0; i < fields.length; i++) {
                setInputText(fields[i], config && config.days ? config.days[i] : "");
            }
        } else if (isTagsFilter(node)) {

            let existingTags = qq(".token-remove", node);
            for (let tag of existingTags) { tag.click(); }

            if (config && config.tags && config.tags.length > 0) {
                alert("Sorry, restoring tags is not yet supported");
            }
        }

        if (hadToLoad) {
            q(".accordion-title", node).click();
        }
    }
}


function ensureFiltersOpen() {
    if (!q("div.filter")) {
        q(".svgIcon--filter").parentElement.click();
    }
}


function mustLoadContent(node) {
    return q(".accordion-content", node).children.length === 0;
}

function isCheckboxListFilter(node) {
    return !!q(".filter-checkList", node);
}

function isActivityFilter(node) {
    return !!q(".filter-activityWrapper", node);
}

function isDateRangeFilter(node) {
    return !!q(".filter-dateRange", node);
}

function isRelativeDateFilter(node) {
    return !!q(".filter-relativeDateWrapper", node);
}

function isTagsFilter(node) {
    return !!q(".filter-tagsWrapper", node);
}



function q(selector, context) {
    return (context || document).querySelector(selector)
}
function qq(selector, context) {
    return nl2array((context || document).querySelectorAll(selector));
}
function nl2array(nl) {
    return Array.prototype.slice.call(nl);
}

function createMouseEvent(type) {
    let ev = document.createEvent("MouseEvents");
    ev.initEvent(type, true, true);
    return ev;
}
function createHtmlEvent(type) {
    let ev = document.createEvent("HTMLEvents");
    ev.initEvent(type, true, true);
    return ev;
}
function createKeyboardEvent(type, keyCode) {
    let ev = document.createEvent("KeyboardEvent");
    ev.initEvent(type, true, true);
    ev.keyCode = keyCode;
    return ev;
}

function setInputText(input, text) {
    input.value = text;
    input.dispatchEvent(createHtmlEvent("change"));
    input.dispatchEvent(createHtmlEvent("blur"));
}