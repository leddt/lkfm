chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === "getBoard") 
            sendResponse(getBoard());
        else if (request.message === "getFilters") 
            sendResponse(getFilters());
    }
);

function getBoard() {
    return {
        name: document.title,
        id: /\/board\/(\d+)/.exec(location.pathname)[1]
    };
}

function getFilters() {
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