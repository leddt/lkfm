chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {
                        hostSuffix: ".leankit.com",
                        pathPrefix: "/board/"
                    },
                    css: [
                        "div.filter"
                    ]
                })
            ],
            actions: [
                new chrome.declarativeContent.ShowPageAction()
            ]
        }])
    });
});