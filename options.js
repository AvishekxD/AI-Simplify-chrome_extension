document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(["geminiApiKey"], ({ geminiApiKey }) => {
        if(geminiApiKey) document.getElementById("api-key").value = geminiApiKey;
    });

    document.getElementById("save-button").addEventListener("click", () => {
        const apikey = document.getElementById("api-key").value.trim();
        if(!apikey) return;

        chrome.storage.sync.set({ geminiApiKey: apikey }, ()=>{
            document.getElementById("success-message").style.display = "block";
            setTimeout(() => window.close(), 1000);
        });
    })
});