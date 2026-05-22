const GROQ_API_KEY = "YOUR_GROQ_KEY_HERE";
const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";

let studentClass = "";
let studentSubject = "";
let studentLang = "";
let chatHistory = [];

function startSession() {
  studentClass = document.getElementById("classSelect").value;
  studentSubject = document.getElementById("subjectSelect").value;
  studentLang = document.getElementById("langSelect").value;

  if (!studentClass || !studentSubject) {
    alert("Kripya Class aur Vishay chunein!");
    return;
  }

  document.getElementById("setupPanel").classList.add("hidden");
  document.getElementById("chatPanel").classList.remove("hidden");
  document.getElementById("chatInfo").textContent =
    `📖 Class ${studentClass} | ${studentSubject} | ${studentLang}`;
}

function resetSession() {
  chatHistory = [];
  document.getElementById("chatMessages").innerHTML = `
    <div class="message ai-message">
      Namaste! Main aapka VidyaSathi hoon. Aaj hum kya padhenge? 
      Koi sawaal poochein ya practice questions ke liye likhen: 
      <b>"practice questions do"</b> 🙏
    </div>`;
  document.getElementById("setupPanel").classList.remove("hidden");
  document.getElementById("chatPanel").classList.add("hidden");
}

function getSystemPrompt() {
  return `Tu VidyaSathi hai — UP Board ke Class ${studentClass} students ka AI tutor. 
Vishay: ${studentSubject}.
Bhasha: ${studentLang} mein jawab de.

Teri khasiyatein:
- UP Board ke syllabus ke hisaab se padhata hai
- Lucknow aur Uttar Pradesh ke students ki tarah baat karta hai  
- Mushkil concepts ko aasaan hindi mein samjhata hai
- Agar student "practice questions do" likhe toh 5 MCQ ya short answer questions banata hai UP Board exam style mein
- Agar student galat jawab de toh pyaar se sudharata hai aur explain karta hai
- Agar koi topic weak lage toh boldo "Yeh topic aur practice karo"
- Short, clear answers de — zyada lamba mat likho
- Encouraging rehna — "Shabash!", "Bahut achha!", "Koshish karo!" use karo`;
}

async function sendMessage() {
  const input = document.getElementById("userInput");
  const userText = input.value.trim();
  if (!userText) return;

  input.value = "";
  appendMessage(userText, "user");

  const loadingEl = appendMessage("Soch raha hoon...", "loading");

  // Build messages array
  const messages = [
    { role: "system", content: getSystemPrompt() },
    ...chatHistory,
    { role: "user", content: userText }
  ];

  try {
    const response = await fetch(GROQ_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const reply = data.choices[0].message.content;

    loadingEl.remove();
    appendMessage(reply, "ai");

    // Save to history
    chatHistory.push({ role: "user", content: userText });
    chatHistory.push({ role: "assistant", content: reply });

  } catch (err) {
    loadingEl.remove();
    appendMessage("Kuch galat ho gaya: " + err.message, "ai");
  }
}

function appendMessage(text, type) {
  const div = document.createElement("div");
  div.className = `message ${type}-message`;
  div.innerHTML = text.replace(/\n/g, "<br>");
  const container = document.getElementById("chatMessages");
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

document.getElementById("userInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});