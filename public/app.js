const list = document.getElementById("list");
const form = document.getElementById("form");
const statusEl = document.getElementById("status");

function fmtDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

async function loadMessages() {
  const res = await fetch("/api/messages");
  if (!res.ok) throw new Error("Load failed");
  return res.json();
}

function render(items) {
  list.innerHTML = "";
  for (const m of items) {
    const li = document.createElement("li");
    const meta = document.createElement("div");
    meta.className = "meta";
    const author = document.createElement("span");
    author.className = "author";
    author.textContent = m.author;
    meta.appendChild(author);
    meta.appendChild(document.createTextNode(" · "));
    meta.appendChild(document.createTextNode(fmtDate(m.createdAt)));
    const body = document.createElement("div");
    body.textContent = m.body;
    li.appendChild(meta);
    li.appendChild(body);
    list.appendChild(li);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "Posting…";
  const fd = new FormData(form);
  const author = String(fd.get("author") || "").trim();
  const body = String(fd.get("body") || "").trim();
  try {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, body }),
    });
    if (!res.ok) throw new Error("Post failed");
    form.reset();
    statusEl.textContent = "Posted.";
    const items = await loadMessages();
    render(items);
  } catch {
    statusEl.textContent = "Something went wrong. Try again.";
  }
});

loadMessages()
  .then(render)
  .catch(() => {
    statusEl.textContent = "Could not reach the server.";
  });
