document.getElementById("summarize").addEventListener("click", () => {
  const resultDiv = document.getElementById("result");
  const summaryType = document.getElementById("summary-type").value;

  resultDiv.innerHTML = '<div class="loader"></div>';

  chrome.storage.sync.get(["geminiApiKey"], ({ geminiApiKey }) => {
    if(!geminiApiKey){
      resultDiv.textContent = "No API key set. Click the gear icon to add one.";
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "GET_ARTICLE_TEXT" },
        async({ text }) => {
          if (!text){
            resultDiv.textContent = "Couldn't extract text from this page.";
            return;
          }

          try{
            const summary = await getGeminiSummary(text, summaryType, geminiApiKey);
            resultDiv.textContent = summary;
          } catch(error){
            resultDiv.textContent = "Gemini error: " + error.message;
          }
        }
      );
    });
  })
});

async function getGeminiSummary(rawText, type, apiKey) {
  const max = 2000;
  const text = rawText.length > max ? rawText.slice(0, max) + "..." : rawText;
  const promptMap = {
    brief: `Summarize in 2-3 sentences:\n\n${text}`,
    detailed: `Give a detailed summary:\n\n${text}`,
    bullets: `Summarize in 5-7 bullets points( start each line with "- "):\n\n${text}`,
  };

  const prompt = promptMap[type] || promptMap.brief;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {"Content-type": "application/json"},
      body: JSON.stringify({
        contents: [{parts: [{ text: prompt}]}],
        generationConfig: { temperature: 0.2},
      }),
    }
  );
  if(!res.ok){
    const { error } = await res.json();
    throw new Error(error?.message || "Request failed");
  } 
  
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No summary.";
};

document.getElementById("copy-btn").addEventListener("click", () => {
  const txt = document.getElementById("result").innerText;
  if(!txt) return;

  navigator.clipboard.writeText(txt).then(() => {
    const btn = document.getElementById("copy-btn");
    const old = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = old), 2000);
  });
});

const heading = "Welcome to the AI Summarizer! 📝";
document.querySelector('#crazy-heading').innerHTML = Array.from(heading).map(char => {
  const isEmoji = /\p{Emoji}/u.test(char);
  return isEmoji
    ? `<span class="transition-all duration-500 hover:-translate-y-2 hover:scale-150 hover:rotate-12 hover:text-lime-400 inline-block cursor-default">${char}</span>`
    : char;
}).join('');

document.addEventListener('DOMContentLoaded', () => {
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const body = document.body;
  const sunEmoji = '☀️';
  const moonEmoji = '🌙';

  function toggleDarkMode() {
      body.classList.toggle('dark');
      const isDarkMode = body.classList.contains('dark');
      darkModeToggle.textContent = isDarkMode ? sunEmoji : moonEmoji;
      if (isDarkMode) {
          darkModeToggle.classList.remove('bg-amber-50', 'hover:bg-amber-100');
          darkModeToggle.classList.add('dark:bg-slate-700', 'dark:hover:bg-slate-600');
      } else {
          darkModeToggle.classList.remove('dark:bg-slate-700', 'dark:hover:bg-slate-600');
          darkModeToggle.classList.add('bg-amber-50', 'hover:bg-amber-100');
      }
      localStorage.setItem('darkMode', isDarkMode);
  }

  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode === 'true') {
      body.classList.add('dark');
      darkModeToggle.textContent = sunEmoji;
      darkModeToggle.classList.remove('bg-amber-50', 'hover:bg-amber-100');
      darkModeToggle.classList.add('dark:bg-slate-700', 'dark:hover:bg-slate-600');
  } else {
      darkModeToggle.textContent = moonEmoji;
      darkModeToggle.classList.remove('dark:bg-slate-700', 'dark:hover:bg-slate-600');
      darkModeToggle.classList.add('bg-amber-50', 'hover:bg-amber-100');
  }

  darkModeToggle.addEventListener('click', toggleDarkMode);
});