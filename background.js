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

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "summarizeSelection",
        title: "📝 Summarize selected text",
        contexts: ["selection"]
        // icon: { 
        //     "16": "images/favicon-16x16.png",
        //     "32": "images/favicon-32x32.png",
        // }
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "summarizeSelection") {
      // You can replace this with your own functionality
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          alert("You clicked the custom button on selected text!");
        }
      });
    }
  });

  