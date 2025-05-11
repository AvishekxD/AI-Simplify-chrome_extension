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
        contexts: ["page","selection"]
      });

      chrome.contextMenus.create({
        id: "subItem1",
        parentId: "summarizeSelection",
        title: "Brief ",
        contexts: ["page", "selection"]
      });

      chrome.contextMenus.create({
        id: "subItem2",
        parentId: "summarizeSelection",
        title: "Detailed",
        contexts: ["page", "selection"]
      });

      chrome.contextMenus.create({
        id: "subItem3",
        parentId: "summarizeSelection",
        title: "Bullet Points ",
        contexts: ["page", "selection"]
      })
  });
  
chrome.contextMenus.onClicked.addListener((info, tab) => {
  let summaryType = null;
  if (info.menuItemId === "subItem1") summaryType = "brief";
  if (info.menuItemId === "subItem2") summaryType = "detailed";
  if (info.menuItemId === "subItem3") summaryType = "bullets";

  if (summaryType && info.selectionText) {
    // Save selection and type for popup to use
    chrome.storage.local.set({
      contextSummaryRequest: {
        text: info.selectionText,
        type: summaryType
      }
    }, () => {
      chrome.action.openPopup(); // Open popup immediately
    });
  }
});

