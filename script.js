const jobs = [
  {
    id: 1,
    role: "Frontend Developer Intern",
    company: "PixelCraft Studio",
    category: "Web Development",
    skills: ["HTML", "CSS", "JavaScript"],
    stipend: 12000,
    mode: "Remote",
    duration: "3 months",
    location: "Anywhere",
    icon: "💻",
    description: "Help build responsive websites and interactive user interfaces with a friendly development team."
  },
  {
    id: 2,
    role: "UI/UX Design Intern",
    company: "CreativeNest",
    category: "UI/UX Design",
    skills: ["Figma", "Communication"],
    stipend: 9000,
    mode: "Hybrid",
    duration: "2 months",
    location: "Chennai",
    icon: "🎨",
    description: "Create wireframes, explore user journeys, and design clean and accessible digital experiences."
  },
  {
    id: 3,
    role: "Data Analyst Intern",
    company: "InsightWorks",
    category: "Data Science",
    skills: ["Python", "SQL"],
    stipend: 15000,
    mode: "On-site",
    duration: "4 months",
    location: "Bengaluru",
    icon: "📊",
    description: "Explore datasets, create reports, and turn information into useful business insights."
  },
  {
    id: 4,
    role: "AI / ML Intern",
    company: "FutureMind Labs",
    category: "Artificial Intelligence",
    skills: ["Python", "Machine Learning"],
    stipend: 18000,
    mode: "Remote",
    duration: "3 months",
    location: "Anywhere",
    icon: "🤖",
    description: "Explore machine learning workflows and build small AI prototypes with sample datasets."
  },
  {
    id: 5,
    role: "Java Developer Intern",
    company: "CodeBridge",
    category: "Web Development",
    skills: ["Java", "SQL"],
    stipend: 10000,
    mode: "Hybrid",
    duration: "3 months",
    location: "Coimbatore",
    icon: "☕",
    description: "Practise Java programming, work with databases, and help develop application features."
  },
  {
    id: 6,
    role: "Digital Marketing Intern",
    company: "BrightReach Media",
    category: "Marketing",
    skills: ["Marketing", "Communication"],
    stipend: 8000,
    mode: "Remote",
    duration: "2 months",
    location: "Anywhere",
    icon: "📣",
    description: "Assist with content planning, social media campaigns, and basic marketing analysis."
  },
  {
    id: 7,
    role: "Web Design Intern",
    company: "NovaWeb",
    category: "UI/UX Design",
    skills: ["HTML", "CSS", "Figma"],
    stipend: 11000,
    mode: "On-site",
    duration: "3 months",
    location: "Chennai",
    icon: "🖌️",
    description: "Combine visual design and frontend fundamentals to improve website layouts."
  },
  {
    id: 8,
    role: "Python Developer Intern",
    company: "LogicLoop",
    category: "Data Science",
    skills: ["Python", "SQL"],
    stipend: 14000,
    mode: "Remote",
    duration: "3 months",
    location: "Anywhere",
    icon: "🐍",
    description: "Build beginner-friendly Python tools and practise working with data and APIs."
  },
  {
    id: 9,
    role: "Machine Learning Intern",
    company: "DeepVision",
    category: "Artificial Intelligence",
    skills: ["Python", "Machine Learning", "SQL"],
    stipend: 16000,
    mode: "Hybrid",
    duration: "4 months",
    location: "Bengaluru",
    icon: "🧠",
    description: "Explore data preparation, model evaluation, and machine learning experiments."
  }
];

const $ = id => document.getElementById(id);

function loadData(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

let savedJobs = loadData("internhub-saved", []);
let applications = loadData("internhub-applications", {});
let selectedSkills = new Set();
let selectedCategory = "All";
let currentPage = "discover";
let toastTimer;
let lastFocusedElement = null;

const grid = $("internshipGrid");
const searchInput = $("searchInput");
const interest = $("interest");
const workMode = $("workMode");
const minStipend = $("minStipend");
const sortBy = $("sortBy");
const profileFeedback = $("profileFeedback");

function persist() {
  try {
    localStorage.setItem("internhub-saved", JSON.stringify(savedJobs));
    localStorage.setItem("internhub-applications", JSON.stringify(applications));
    return true;
  } catch {
    showToast("Browser storage is unavailable. Changes may not persist.");
    return false;
  }
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function getSelectedSkills() {
  return [...$("skillList").querySelectorAll("input:checked")]
    .map(input => input.value);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function money(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

function matchScore(job) {
  const skills = getSelectedSkills();
  const jobSkills = job.skills;
  const matched = skills.filter(skill => jobSkills.includes(skill)).length;
  const skillScore = skills.length
    ? matched / skills.length
    : 0;

  let score = skills.length ? skillScore * 65 : 25;

  if (interest.value === job.category) score += 25;
  else if (interest.value === "All") score += 15;

  if (workMode.value === job.mode) score += 10;
  else if (workMode.value === "All") score += 10;

  return Math.min(99, Math.round(score));
}

function updateStats() {
  $("totalCount").textContent = jobs.length;
  $("savedCount").textContent = savedJobs.length;
  $("appliedCount").textContent = Object.keys(applications).length;
  $("savedNav").textContent = savedJobs.length;
  $("appNav").textContent = Object.keys(applications).length;
}

function getVisibleJobs() {
  const query = searchInput.value.trim().toLowerCase();

  let result = jobs.filter(job => {
    const searchable = [
      job.role,
      job.company,
      job.category,
      job.mode,
      job.location,
      ...job.skills
    ].join(" ").toLowerCase();

    const searchMatches = searchable.includes(query);
    const categoryMatches = selectedCategory === "All"
      || job.category === selectedCategory;
    const modeMatches = workMode.value === "All"
      || job.mode === workMode.value;
    const stipendMatches = job.stipend >= Number(minStipend.value);

    if (currentPage === "saved" && !savedJobs.includes(job.id)) {
      return false;
    }

    if (currentPage === "applications" && !applications[job.id]) {
      return false;
    }

    return searchMatches && categoryMatches
      && modeMatches && stipendMatches;
  });

  result.sort((a, b) => {
    if (sortBy.value === "stipend") return b.stipend - a.stipend;
    if (sortBy.value === "az") return a.role.localeCompare(b.role);
    return matchScore(b) - matchScore(a);
  });

  return result;
}

function renderJobs() {
  const visibleJobs = getVisibleJobs();

  const titles = {
    discover: "Recommended internships",
    saved: "Your saved internships",
    applications: "Your applications"
  };

  $("resultsTitle").textContent = titles[currentPage];
  $("resultsSubtitle").textContent = currentPage === "saved"
    ? "Your bookmarked career opportunities."
    : currentPage === "applications"
      ? "Review your application progress."
      : "Opportunities selected from your preferences.";

  $("resultCount").textContent =
    `${visibleJobs.length} internship${visibleJobs.length === 1 ? "" : "s"} found`;

  document.querySelectorAll(".nav").forEach(button => {
    button.classList.toggle("active", button.dataset.page === currentPage);
  });

  document.querySelectorAll(".quick-filter").forEach(button => {
    button.classList.toggle(
      "active",
      currentPage === "discover" &&
      button.dataset.category === selectedCategory
    );
  });

  if (!visibleJobs.length) {
    const message = currentPage === "saved"
      ? "No saved internships yet. Explore roles and tap ♡ to save one."
      : currentPage === "applications"
        ? "No applications yet. Open an internship and click Apply."
        : "No matching internships. Try changing your skills or filters.";

    grid.innerHTML = `
      <div class="empty-state">
        <h3>🌱 Nothing to show just yet</h3>
        <p>${escapeHTML(message)}</p>
        <button class="primary-btn" id="emptyExplore">Explore internships</button>
      </div>`;

    $("emptyExplore").addEventListener("click", () => {
      setPage("discover");
      resetFilters();
    });

    return;
  }

  grid.innerHTML = visibleJobs.map(job => {
    const score = matchScore(job);
    const saved = savedJobs.includes(job.id);
    const status = applications[job.id];

    return `
      <article class="job-card">
        <div class="job-top">
          <div class="company-icon">${job.icon}</div>
          <span class="match-badge">${score}% match</span>
          <button class="save-btn ${saved ? "saved" : ""}"
            data-save="${job.id}"
            aria-label="${saved ? "Unsave" : "Save"} ${escapeHTML(job.role)}"
            aria-pressed="${saved}">${saved ? "♥" : "♡"}</button>
        </div>
        <h3>${escapeHTML(job.role)}</h3>
        <p class="company">${escapeHTML(job.company)}</p>
        <div class="stipend">${money(job.stipend)}<span> / month</span></div>
        <p class="job-details">
          📍 ${escapeHTML(job.location)} · ${escapeHTML(job.mode)}
          <br>◷ ${escapeHTML(job.duration)}
        </p>
        <div class="tags">
          ${job.skills.map(skill =>
            `<span class="tag">${escapeHTML(skill)}</span>`
          ).join("")}
        </div>
        <div class="card-actions">
          <button class="details-btn" data-details="${job.id}">View details</button>
          <button class="apply-btn ${status ? "applied" : ""}"
            data-apply="${job.id}">${status ? "✓ " + escapeHTML(status) : "Apply"}</button>
        </div>
      </article>`;
  }).join("");

  grid.querySelectorAll("[data-save]").forEach(button => {
    button.addEventListener("click", () => toggleSaved(Number(button.dataset.save)));
  });

  grid.querySelectorAll("[data-details]").forEach(button => {
    button.addEventListener("click", () => openDetails(Number(button.dataset.details)));
  });

  grid.querySelectorAll("[data-apply]").forEach(button => {
    button.addEventListener("click", () => applyForJob(Number(button.dataset.apply)));
  });
}

function renderApplications() {
  const list = $("applicationList");
  const entries = Object.entries(applications);

  if (!entries.length) {
    list.innerHTML = `
      <div class="empty-state">
        <h3>📋 Your journey starts here</h3>
        <p>Apply to an internship to track its status here.</p>
      </div>`;
    return;
  }

  list.innerHTML = entries.map(([id, status]) => {
    const job = jobs.find(item => item.id === Number(id));
    if (!job) return "";

    return `
      <div class="application-row">
        <div>
          <h3>${escapeHTML(job.role)}</h3>
          <p>${escapeHTML(job.company)} · ${money(job.stipend)}/month</p>
          <span class="status-pill">${escapeHTML(status)}</span>
        </div>
        <select data-status="${job.id}" aria-label="Application status for ${escapeHTML(job.role)}">
          ${["Applied", "Interview", "Selected", "Rejected"].map(option =>
            `<option ${status === option ? "selected" : ""}>${option}</option>`
          ).join("")}
        </select>
      </div>`;
  }).join("");

  list.querySelectorAll("[data-status]").forEach(select => {
    select.addEventListener("change", () => {
      applications[select.dataset.status] = select.value;
      persist();
      updateStats();
      renderApplications();
      renderJobs();
      showToast("Application status updated!");
    });
  });
}

function refresh() {
  updateStats();
  renderJobs();
  renderApplications();
}

function toggleSaved(id) {
  if (savedJobs.includes(id)) {
    savedJobs = savedJobs.filter(item => item !== id);
    showToast("Removed from saved internships.");
  } else {
    savedJobs.push(id);
    showToast("Internship saved successfully! ♥");
  }

  persist();
  refresh();
}

function setPage(page) {
  currentPage = page;
  renderJobs();

  $("results").scrollIntoView({ behavior: "smooth", block: "start" });
}

function applyForJob(id) {
  if (applications[id]) {
    openDetails(id);
    return;
  }

  const job = jobs.find(item => item.id === id);
  if (!job) return;

  lastFocusedElement = document.activeElement;
  $("modalBody").innerHTML = `
    <div class="company-icon">${job.icon}</div>
    <h2 id="modalTitle">Apply for ${escapeHTML(job.role)}</h2>
    <p>${escapeHTML(job.company)} · ${escapeHTML(job.mode)}</p>
    <p>This demo will add the internship to your local application tracker. It will not submit an application to a real employer.</p>
    <div class="modal-actions">
      <button class="primary-btn" id="confirmApply">Confirm demo application</button>
    </div>`;

  openModal();
  $("confirmApply").addEventListener("click", () => {
    applications[id] = "Applied";
    persist();
    closeModal();
    refresh();
    showToast("Added to your application tracker!");
  });
}

function openDetails(id) {
  const job = jobs.find(item => item.id === id);
  if (!job) return;

  lastFocusedElement = document.activeElement;

  $("modalBody").innerHTML = `
    <div class="company-icon">${job.icon}</div>
    <h2 id="modalTitle">${escapeHTML(job.role)}</h2>
    <p>${escapeHTML(job.company)} · ${escapeHTML(job.category)}</p>
    <p><strong>${money(job.stipend)}</strong> per month · ${escapeHTML(job.mode)}</p>
    <p>📍 ${escapeHTML(job.location)} · ${escapeHTML(job.duration)}</p>
    <h3>About this internship</h3>
    <p>${escapeHTML(job.description)}</p>
    <h3>Skills</h3>
    <p>${job.skills.map(escapeHTML).join(" · ")}</p>
    <h3>Your match score: ${matchScore(job)}%</h3>
    <p>This score is a simple estimate based on your selected skills, interest, and work preference.</p>
    <div class="modal-actions">
      <button class="primary-btn" id="modalApply">
        ${applications[id] ? "Application: " + escapeHTML(applications[id]) : "Apply for demo"}
      </button>
      <button class="primary-btn" id="modalSave" style="background:var(--soft);color:var(--accent)">
        ${savedJobs.includes(id) ? "♥ Saved" : "♡ Save"}
      </button>
    </div>`;

  openModal();

  $("modalApply").addEventListener("click", () => {
    closeModal();
    applyForJob(id);
  });

  $("modalSave").addEventListener("click", () => {
    toggleSaved(id);
    openDetails(id);
  });
}

function openModal() {
  $("modalBackdrop").classList.add("open");
  $("closeModal").focus();
}

function closeModal() {
  $("modalBackdrop").classList.remove("open");
  if (lastFocusedElement && document.contains(lastFocusedElement)) {
    lastFocusedElement.focus();
  }
}

function resetFilters() {
  searchInput.value = "";
  interest.value = "All";
  workMode.value = "All";
  minStipend.value = "0";
  sortBy.value = "match";
  selectedCategory = "All";
  $("skillList").querySelectorAll("input").forEach(input => {
    input.checked = false;
  });
  currentPage = "discover";
  profileFeedback.textContent = "Filters reset. Choose your skills to personalize recommendations.";
  refresh();
}

$("skillList").querySelectorAll("input").forEach(input => {
  const label = input.closest("label");
  
});

$("matchBtn").addEventListener("click", () => {
  selectedSkills = new Set(getSelectedSkills());
  currentPage = "discover";
  selectedCategory = "All";
  profileFeedback.textContent = selectedSkills.size
    ? `Profile updated with ${selectedSkills.size} selected skill(s). Your results are ranked by match score.`
    : "Choose some skills for a more personalized match. You can still explore all internships.";

  renderJobs();
  $("results").scrollIntoView({ behavior: "smooth", block: "start" });
  showToast("Your recommendations are updated!");
});

$("startBtn").addEventListener("click", () => {
  $("profile").scrollIntoView({ behavior: "smooth", block: "start" });
  $("skillList").querySelector("input").focus();
});

$("searchBtn").addEventListener("click", () => {
  currentPage = "discover";
  renderJobs();
  $("results").scrollIntoView({ behavior: "smooth", block: "start" });
});

searchInput.addEventListener("input", () => {
  currentPage = "discover";
  renderJobs();
});

[interest, workMode, minStipend, sortBy].forEach(control => {
  control.addEventListener("change", () => {
    currentPage = "discover";
    renderJobs();
  });
});

document.querySelectorAll(".quick-filter").forEach(button => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category;
    currentPage = "discover";
    renderJobs();
  });
});

document.querySelectorAll(".nav").forEach(button => {
  button.addEventListener("click", () => setPage(button.dataset.page));
});

$("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  $("themeBtn").textContent = dark ? "☀" : "☾";

  try {
    localStorage.setItem("internhub-dark", String(dark));
  } catch {}
});

$("closeModal").addEventListener("click", closeModal);

$("modalBackdrop").addEventListener("click", event => {
  if (event.target === $("modalBackdrop")) closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

try {
  if (localStorage.getItem("internhub-dark") === "true") {
    document.body.classList.add("dark");
    $("themeBtn").textContent = "☀";
  }
} catch {}

refresh();