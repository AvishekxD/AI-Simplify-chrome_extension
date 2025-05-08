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
