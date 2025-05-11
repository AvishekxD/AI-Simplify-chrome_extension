import * as docx from "docx";

/* =======================
  Speech Synthesis Logic
  ======================= */
const speakBtn = document.getElementById("speak-btn");
let isSpeaking = false;
let utterance = null;

function getFemaleVoice() {
  const voices = window.speechSynthesis.getVoices();
  return (
   voices.find((v) =>
    v.lang.startsWith("en") &&
    (
      v.name.toLowerCase().includes("female") ||
      v.name.toLowerCase().includes("woman") ||
      v.name.toLowerCase().includes("girl") ||
      v.name.toLowerCase().includes("susan") ||
      v.name.toLowerCase().includes("zira") ||
      v.name.toLowerCase().includes("linda") ||
      v.name.toLowerCase().includes("emma") ||
      v.name.toLowerCase().includes("samantha") ||
      v.name.toLowerCase().includes("karen") ||
      v.name.toLowerCase().includes("google us english")
    )
   ) || voices.find((v) => v.lang.startsWith("en"))
  );
}

function resetSpeakButton() {
  window.speechSynthesis.cancel();
  isSpeaking = false;
  speakBtn.textContent = "Speak";
}

speakBtn.addEventListener("click", () => {
  const text = document.getElementById("result").innerText;
  if (!text) return;

  if (isSpeaking) {
   window.speechSynthesis.cancel();
   isSpeaking = false;
   speakBtn.textContent = "Speak";
   return;
  }

  utterance = new window.SpeechSynthesisUtterance(text);
  const voice = getFemaleVoice();
  if (voice) utterance.voice = voice;

  isSpeaking = true;
  speakBtn.textContent = "Stop";

  utterance.onend = utterance.onerror = () => resetSpeakButton();

  window.speechSynthesis.speak(utterance);
});

window.speechSynthesis.onvoiceschanged = () => {};

/* =======================
  Summarization Logic
  ======================= */
async function getGeminiSummary(rawText, type, apiKey) {
  const max = 3000;
  const text = rawText.length > max ? rawText.slice(0, max) + "..." : rawText;
  const promptMap = {
   brief: `Summarize in 2-3 sentences:\n\n${text}`,
   detailed: `Give a detailed summary:\n\n${text}`,
   bullets: `Summarize in 5-7 bullets points( start each line with "- "):\n\n${text}`,
  };
  const prompt = promptMap[type] || promptMap.brief;

  const res = await fetch(
   `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
   {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2 },
    }),
   }
  );
  if (!res.ok) {
   const { error } = await res.json();
   throw new Error(error?.message || "Request failed");
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No summary.";
}

document.getElementById("summarize").addEventListener("click", () => {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = '<div class="loader"></div>';
  resultDiv.setAttribute("contenteditable", "false");
  resultDiv.classList.add("p-4");
  saveAsNoteBtn.classList.add("hidden");

  chrome.storage.sync.get(["geminiApiKey"], ({ geminiApiKey }) => {
   if (!geminiApiKey) {
    resultDiv.textContent = "No API key set. Click the gear icon to add one.";
    return;
   }

   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: "GET_ARTICLE_TEXT" },
      async ({ text }) => {
       if (!text) {
        resultDiv.textContent = "Couldn't extract text from this page.";
        return;
       }

       try {
        const summaryType = document.getElementById("summary-type").value;
        const summary = await getGeminiSummary(text, summaryType, geminiApiKey);
        resultDiv.textContent = summary;
        resetSpeakButton();
        resultDiv.setAttribute("contenteditable", "true");

        // Reset save button
        saveAsNoteBtn.classList.remove("hidden", "opacity-50", "cursor-not-allowed");
        saveAsNoteBtn.disabled = false;
        saveAsNoteBtn.textContent = "Save as Note";
       } catch (error) {
        resultDiv.textContent = "Gemini error: " + error.message;
        resetSpeakButton();
       }
      }
    );
   });
  });
});

/* =======================
  Copy to Clipboard Logic
  ======================= */
document.getElementById("copy-btn").addEventListener("click", () => {
  const txt = document.getElementById("result").innerText;
  if (!txt) return;

  navigator.clipboard.writeText(txt).then(() => {
   const btn = document.getElementById("copy-btn");
   const old = btn.textContent;
   btn.textContent = "Copied!";
   setTimeout(() => (btn.textContent = old), 2000);
  });
});

/* =======================
  Heading Animations
  ======================= */
function animateHeading(selector, text) {
  document.querySelector(selector).innerHTML = Array.from(text)
   .map((char) => {
    const isEmoji = /\p{Emoji}/u.test(char);
    return isEmoji
      ? `<span class="transition-all duration-500 hover:-translate-y-2 hover:scale-150 hover:rotate-12 hover:text-lime-400 inline-block cursor-default">${char}</span>`
      : char;
   })
   .join("");
}
animateHeading("#crazy-heading", "Welcome to the AI Summarizer! 📝");
animateHeading("#crazy-heading2", "NOTES 📝");

/* =======================
  Dark Mode Toggle
  ======================= */
document.addEventListener("DOMContentLoaded", () => {
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const body = document.body;
  const sunEmoji = "☀️";
  const moonEmoji = "🌙";

  function toggleDarkMode() {
   body.classList.toggle("dark");
   const isDarkMode = body.classList.contains("dark");
   darkModeToggle.textContent = isDarkMode ? sunEmoji : moonEmoji;
   if (isDarkMode) {
    darkModeToggle.classList.remove("bg-amber-50", "hover:bg-amber-100");
    darkModeToggle.classList.add("dark:bg-slate-700", "dark:hover:bg-slate-600");
   } else {
    darkModeToggle.classList.remove("dark:bg-slate-700", "dark:hover:bg-slate-600");
    darkModeToggle.classList.add("bg-amber-50", "hover:bg-amber-100");
   }
   localStorage.setItem("darkMode", isDarkMode);
  }

  const savedDarkMode = localStorage.getItem("darkMode");
  if (savedDarkMode === "true") {
   body.classList.add("dark");
   darkModeToggle.textContent = sunEmoji;
   darkModeToggle.classList.remove("bg-amber-50", "hover:bg-amber-100");
   darkModeToggle.classList.add("dark:bg-slate-700", "dark:hover:bg-slate-600");
  } else {
   darkModeToggle.textContent = moonEmoji;
   darkModeToggle.classList.remove("dark:bg-slate-700", "dark:hover:bg-slate-600");
   darkModeToggle.classList.add("bg-amber-50", "hover:bg-amber-100");
  }

  darkModeToggle.addEventListener("click", toggleDarkMode);
});

/* =======================
  Context Summary Logic
  ======================= */
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("contextSummary", ({ contextSummary }) => {
   if (contextSummary) {
    document.getElementById("summary-type").value = contextSummary.type;
    document.getElementById("input-text").value = contextSummary.text;
    document.getElementById("summarize").click();
    chrome.storage.local.remove("contextSummary");
   }
  });
  chrome.storage.local.get("contextSummaryResult", ({ contextSummaryResult }) => {
   if (contextSummaryResult) {
    const resultDiv = document.getElementById("result");
    resultDiv.textContent = contextSummaryResult;
    resultDiv.classList.add("p-4");
    resultDiv.setAttribute("contenteditable", "true");
    chrome.storage.local.remove("contextSummaryResult");
   }
  });
  chrome.storage.local.get("contextSummaryRequest", ({ contextSummaryRequest }) => {
   if (contextSummaryRequest) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = '<div class="loader"></div>';
    resultDiv.classList.add("p-4");
    resultDiv.setAttribute("contenteditable", "false");

    chrome.storage.sync.get(["geminiApiKey"], (result) => {
      const apiKey = result.geminiApiKey;
      if (!apiKey) {
       resultDiv.textContent = "No Gemini API key set. Please set it in extension options.";
       chrome.storage.local.remove("contextSummaryRequest");
       return;
      }

      const text = contextSummaryRequest.text;
      const summaryType = contextSummaryRequest.type;
      const promptMap = {
       brief: `Summarize in 2-3 sentences:\n\n${text}`,
       detailed: `Give a detailed summary:\n\n${text}`,
       bullets: `Summarize in 5-7 bullets points( start each line with "- "):\n\n${text}`,
      };
      const prompt = promptMap[summaryType];

      fetch(
       `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
       {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
       }
      )
       .then((res) => res.json())
       .then((data) => {
        let summary = "No summary found.";
        try {
          summary = data.candidates[0].content.parts[0].text;
        } catch (e) {}
        resultDiv.textContent = summary;
        resultDiv.setAttribute("contenteditable", "true");
        chrome.storage.local.remove("contextSummaryRequest");

        // Reset and show the Save as Note button
        const saveAsNoteBtn = document.getElementById("save-as-note-btn");
        saveAsNoteBtn.classList.remove("hidden", "opacity-50", "cursor-not-allowed");
        saveAsNoteBtn.disabled = false;
        saveAsNoteBtn.textContent = "Save as Note";
       })
       .catch((err) => {
        resultDiv.textContent = "Failed to summarize: " + err.message;
        chrome.storage.local.remove("contextSummaryRequest");
       });
    });
   }
  });
});

/* =======================
  Notes Logic
  ======================= */
let notes = [];
let editingIndex = null;

function saveNotes() {
  chrome.storage.local.set({ notes });
}

function loadNotes() {
  chrome.storage.local.get(["notes"], (result) => {
   notes = result.notes || [];
   renderNotes();
  });
}

function renderNotes(filter = "") {
  const list = document.getElementById("notes-list");
  if (!list) return;
  list.innerHTML = "";
  notes
   .filter((note) => note.content.toLowerCase().includes(filter.toLowerCase()))
   .forEach((note, idx) => {
    const li = document.createElement("li");
    li.className = "bg-gray-100 rounded p-2 flex justify-between items-center";
    li.innerHTML = `
      <div>
       <span class="font-semibold">${note.pinned ? "📌" : ""}</span>
       <span>${note.content.slice(0, 40)}${note.content.length > 40 ? "..." : ""}</span>
       <span class="text-xs text-gray-400 ml-2">${note.date}</span>
      </div>
      <div class="flex gap-1">
       <button class="copy-btn" title="Copy">📄</button>
       <button class="pin-btn" title="Pin/Unpin">${note.pinned ? "📌" : "📌"}</button>
       <button class="edit-btn" title="Edit">📝</button>
       <button class="delete-btn" title="Delete">❌</button>
      </div>
    `;
    li.querySelector(".copy-btn").onclick = () => {
      navigator.clipboard.writeText(note.content);
    };
    li.querySelector(".pin-btn").onclick = () => {
      note.pinned = !note.pinned;
      notes.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      saveNotes();
      renderNotes(filter);
    };
    li.querySelector(".edit-btn").onclick = () => {
      editingIndex = idx;
      document.getElementById("note-content").value = note.content;
      document.getElementById("note-editor").classList.remove("hidden");
    };
    li.querySelector(".delete-btn").onclick = () => {
      notes.splice(idx, 1);
      saveNotes();
      renderNotes(filter);
    };
    list.appendChild(li);
   });

  // Show/hide the empty state
  const emptyDiv = document.getElementById("notes-empty");
  const noteEditor = document.getElementById("note-editor");
  if (notes.length === 0 && noteEditor.classList.contains("hidden")) {
   emptyDiv.style.display = "block";
  } else {
   emptyDiv.style.display = "none";
  }
}

// Show/hide notes modal
document.getElementById("notes-btn").addEventListener("click", () => {
  document.getElementById("notes-modal").classList.remove("hidden");
  loadNotes();
});
document.getElementById("close-notes").addEventListener("click", () => {
  document.getElementById("notes-modal").classList.add("hidden");
});

// Note editor controls
document.getElementById("add-note-btn").onclick = () => {
  editingIndex = null;
  document.getElementById("note-content").value = "";
  document.getElementById("note-editor").classList.remove("hidden");
  document.getElementById("notes-empty").style.display = "none";
};
document.getElementById("save-note-btn").onclick = () => {
  const content = document.getElementById("note-content").value.trim();
  if (!content) return;
  const date = new Date().toLocaleString();
  if (editingIndex !== null) {
   notes[editingIndex].content = content;
   notes[editingIndex].date = date;
  } else {
   notes.unshift({ content, date, pinned: false });
  }
  saveNotes();
  renderNotes();
  document.getElementById("note-editor").classList.add("hidden");
};
document.getElementById("cancel-note-btn").onclick = () => {
  document.getElementById("note-editor").classList.add("hidden");
  if (notes.length === 0) {
   document.getElementById("notes-empty").style.display = "block";
  }
};
document.getElementById("search-notes").oninput = (e) => {
  renderNotes(e.target.value);
};

/* =======================
  Notes Import/Export
  ======================= */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById("export-select").onchange = async (e) => {
  if (!e.target.value) return;
  if (e.target.value === "txt") {
   const data = notes.map((n) => `[${n.date}] ${n.content}`).join("\n\n");
   const blob = new Blob([data], { type: "text/plain" });
   downloadBlob(blob, "notes.txt");
  } else if (e.target.value === "docx") {
   const doc = new docx.Document({
    sections: [
      {
       properties: {},
       children: notes.map(
        (n) =>
          new docx.Paragraph({
           children: [
            new docx.TextRun({ text: `[${n.date}]`, bold: true }),
            new docx.TextRun({ text: ` ${n.content}` }),
           ],
          })
       ),
      },
    ],
   });
   const blob = await docx.Packer.toBlob(doc);
   downloadBlob(blob, "notes.docx");
  }
  e.target.value = "";
};

document.getElementById("import-btn").onclick = () => {
  document.getElementById("import-file").click();
};
document.getElementById("import-file").onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  text.split(/\n{2,}/).forEach((line) => {
   if (line.trim()) notes.unshift({ content: line.trim(), date: new Date().toLocaleString(), pinned: false });
  });
  saveNotes();
  renderNotes();
};

/* =======================
  Save as Note Button
  ======================= */
const saveAsNoteBtn = document.getElementById("save-as-note-btn");
saveAsNoteBtn.addEventListener("click", () => {
  const content = document.getElementById("result").innerText.trim();
  if (!content) return;
  const date = new Date().toLocaleString();
  notes.unshift({ content, date, pinned: false });
  saveNotes();
  renderNotes();
  saveAsNoteBtn.disabled = true;
  saveAsNoteBtn.classList.add("opacity-50", "cursor-not-allowed");
  saveAsNoteBtn.textContent = "Saved ✓";
});
