chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(["geminiApiKey"], (result) => {
        if (!result.geminiApiKey) {
        chrome.tabs.create({ url: "options.html" }, (tab) => { 
            if (chrome.runtime.lastError) {
            console.error("Error creating tab:", chrome.runtime.lastError);
            }
        });
        }
    });
});

chrome.browserAction.onClicked.addListener(function () {
    chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width: 500,
        height: 400,
    }, function (newWindow) {
        const popupId = newWindow.id;
        chrome.scripting.executeScript({
            target: { tabId: popupId },
            func: () => {
                document.body.style.borderRadius = '10px';
            }
        });
    });
});
