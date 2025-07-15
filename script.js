document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("linkForm");
  const linkList = document.getElementById("linkList");
  const messages = document.getElementById("messages");

  const darkToggle = document.getElementById("darkModeToggle");
  const toggleLangBtn = document.getElementById("toggleLangBtn");
  const exportCsvBtn = document.getElementById("exportCsvBtn");

  let currentLang = localStorage.getItem("lang") || "en";
  let links = JSON.parse(localStorage.getItem("links")) || [];

  const translations = {
    "Link added successfully!": "लिंक सफलतापूर्वक जोड़ा गया!",
    "Link deleted successfully!": "लिंक सफलतापूर्वक हटाया गया!",
    "Link updated successfully!": "लिंक सफलतापूर्वक अपडेट किया गया!",
    "Please enter a valid URL (e.g., https://example.com)": "कृपया एक मान्य URL दर्ज करें (जैसे https://example.com)",
    "No links to export!": "निर्यात करने के लिए कोई लिंक नहीं है!"
  };

  function translate(message) {
    return currentLang === "hi" ? translations[message] || message : message;
  }

  function showMessage(message, type) {
    const msgEl = document.createElement("div");
    msgEl.className = `alert alert-${type === "success" ? "success" : "danger"}`;
    msgEl.textContent = translate(message);
    messages.appendChild(msgEl);
    setTimeout(() => msgEl.remove(), 3000);
  }

  function renderLinks() {
    linkList.innerHTML = "";
    links.forEach((link, index) => {
      const card = document.createElement("div");
      card.className = "col-md-6 mb-3";
      card.innerHTML = `
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">${link.title}</h5>
            <p class="card-text">
              ${link.description || ""}
              <br/>
              <small><strong>Clicks:</strong> ${link.clicks}</small>
              <br/>
              <small><strong>Last Clicked:</strong> ${link.lastClicked ? new Date(link.lastClicked).toLocaleString() : "Never"}</small>
            </p>
            <a href="${link.url}" target="_blank" class="btn btn-sm btn-success">Open</a>
            <button class="btn btn-sm btn-warning" onclick="editLink(${index})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteLink(${index})">Delete</button>
          </div>
        </div>
      `;
      linkList.appendChild(card);
    });
  }

  function saveLinks() {
    localStorage.setItem("links", JSON.stringify(links));
  }

  window.editLink = function(index) {
    const link = links[index];
    document.getElementById("title").value = link.title;
    document.getElementById("url").value = link.url;
    document.getElementById("description").value = link.description;
    deleteLink(index, false);
  };

  window.deleteLink = function(index, show = true) {
    links.splice(index, 1);
    saveLinks();
    renderLinks();
    if (show) showMessage("Link deleted successfully!", "success");
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value.trim();
    const url = document.getElementById("url").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!/^https?:\/\/.+/.test(url)) {
      showMessage("Please enter a valid URL (e.g., https://example.com)", "error");
      return;
    }

    links.push({
      title,
      url,
      description,
      clicks: 0,
      createdAt: Date.now(),
      lastClicked: null
    });

    saveLinks();
    renderLinks();
    form.reset();
    showMessage("Link added successfully!", "success");
  });

  // Handle dark mode
  darkToggle.checked = localStorage.getItem("darkMode") === "enabled";

  function setDarkMode(enabled) {
    if (enabled) {
      document.body.classList.add("bg-dark", "text-white");
      document.querySelectorAll(".card").forEach(card => card.classList.add("bg-secondary", "text-white"));
    } else {
      document.body.classList.remove("bg-dark", "text-white");
      document.querySelectorAll(".card").forEach(card => card.classList.remove("bg-secondary", "text-white"));
    }
    localStorage.setItem("darkMode", enabled ? "enabled" : "disabled");
  }

  setDarkMode(darkToggle.checked);

  darkToggle.addEventListener("change", () => {
    setDarkMode(darkToggle.checked);
  });

  // Language toggle
  function updateLangUI() {
    toggleLangBtn.textContent = currentLang === "en" ? "🇬🇧 English" : "🇮🇳 हिंदी";
    localStorage.setItem("lang", currentLang);
  }

  toggleLangBtn.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "hi" : "en";
    updateLangUI();
  });

  updateLangUI();

  // CSV Export
  exportCsvBtn.addEventListener("click", () => {
    if (!links.length) {
      showMessage("No links to export!", "error");
      return;
    }

    const headers = ["Title", "URL", "Description", "Clicks", "Created At", "Last Clicked"];
    const csvRows = [headers.join(",")];

    links.forEach(link => {
      const row = [
        `"${link.title}"`,
        `"${link.url}"`,
        `"${link.description || ''}"`,
        link.clicks,
        new Date(link.createdAt).toLocaleString(),
        link.lastClicked ? new Date(link.lastClicked).toLocaleString() : ""
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "links.csv";
    a.click();
    URL.revokeObjectURL(url);
  });

  // Track link clicks
  linkList.addEventListener("click", (e) => {
    if (e.target.tagName === "A" && e.target.classList.contains("btn-success")) {
      const index = Array.from(linkList.children).indexOf(e.target.closest(".col-md-6"));
      links[index].clicks++;
      links[index].lastClicked = Date.now();
      saveLinks();
      renderLinks();
    }
  });

  renderLinks();
});
