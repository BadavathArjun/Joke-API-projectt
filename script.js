// Navigation toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  navToggle.classList.toggle('active');
});

document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
  });
});

// Joke-related global selections
let selectedCategories = [];
let selectedFlags = [];
let selectedJokeTypes = ['single', 'twopart'];

// --- Joke Functions ---

// Fetch a random joke for hero section
async function getJoke() {
  const jokeElement = document.getElementById('joke');
  jokeElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading joke...';

  try {
    const apiUrl = "https://v2.jokeapi.dev/joke/Any?safe-mode";
    const res = await fetch(apiUrl);
    const data = await res.json();
    if (data.error) {
      jokeElement.textContent = `Error: ${data.message}`;
      return;
    }
    jokeElement.innerHTML = data.type === "single"
      ? data.joke
      : `${data.setup} <br> <strong>${data.delivery}</strong>`;
  } catch {
    jokeElement.textContent = "Failed to fetch joke. Check your connection.";
  }
}

// Fetch a random fun fact (simple)
async function getFact() {
  const factElement = document.getElementById('fact');
  factElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading fact...';
  try {
    const res = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/random");
    const data = await res.json();
    factElement.textContent = data.text;
  } catch {
    factElement.textContent = "Failed to fetch fact. Check your connection.";
  }
}

// Fetch and build category buttons dynamically for joke filters
async function getCategories() {
  try {
    const res = await fetch("https://v2.jokeapi.dev/categories");
    const data = await res.json();
    const buttonContainer = document.getElementById('category-buttons');
    buttonContainer.innerHTML = "";
    data.categories.forEach(cat => {
      if (cat !== "Any") {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'category-btn';
        button.textContent = cat;
        button.addEventListener('click', () => {
          button.classList.toggle('selected');
          if (button.classList.contains('selected')) {
            if (!selectedCategories.includes(cat)) selectedCategories.push(cat);
          } else {
            selectedCategories = selectedCategories.filter(c => c !== cat);
          }
        });
        buttonContainer.appendChild(button);
      }
    });
  } catch {
    document.getElementById('category-buttons').innerHTML = "Failed to load categories";
  }
}

// Fetch languages dynamically for joke filters
async function getLanguages() {
  try {
    const res = await fetch("https://v2.jokeapi.dev/languages");
    const data = await res.json();
    const select = document.getElementById('language');
    select.innerHTML = '<option value="">Any</option>';
    data.jokeLanguages.forEach(code => {
      let name = code;
      const found = data.possibleLanguages?.find(l => l.code === code);
      if (found) name = `${found.name} (${code})`;
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = name;
      select.appendChild(opt);
    });
  } catch {
    document.getElementById('language').innerHTML = '<option>Failed to load</option>';
  }
}

// Fetch blacklist flags dynamically
async function getFlags() {
  try {
    const res = await fetch("https://v2.jokeapi.dev/flags");
    const data = await res.json();
    const buttonContainer = document.getElementById('flag-buttons');
    buttonContainer.innerHTML = "";
    data.flags.forEach(flag => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'flag-btn';
      button.textContent = flag;
      button.addEventListener('click', () => {
        button.classList.toggle('selected');
        if (button.classList.contains('selected')) {
          if (!selectedFlags.includes(flag)) selectedFlags.push(flag);
        } else {
          selectedFlags = selectedFlags.filter(f => f !== flag);
        }
      });
      buttonContainer.appendChild(button);
    });
  } catch {
    document.getElementById('flag-buttons').innerHTML = "Failed to load flags";
  }
}

// Setup joke type buttons toggling and data tracking
function setupJokeTypeButtons() {
  document.querySelectorAll('.joke-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
      const type = btn.getAttribute('data-type');
      if (btn.classList.contains('selected')) {
        if (!selectedJokeTypes.includes(type)) selectedJokeTypes.push(type);
      } else {
        selectedJokeTypes = selectedJokeTypes.filter(t => t !== type);
        if (selectedJokeTypes.length === 0) {
          btn.classList.add('selected');
          selectedJokeTypes.push(type);
          alert('At least one joke type must be selected');
        }
      }
    });
  });
}

// Custom joke request builder & fetcher
async function getCustomJoke() {
  const language = document.getElementById('language').value;
  const format = document.getElementById('response-format').value;
  const searchString = document.getElementById('search-string').value.trim();
  const idMin = document.getElementById('id-min').value;
  const idMax = document.getElementById('id-max').value;
  let amount = parseInt(document.getElementById('amount').value || "1");
  amount = (isNaN(amount) || amount < 1) ? 1 : amount;
  amount = amount > 10 ? 10 : amount;

  const jokeResult = document.getElementById('filtered-joke-result');
  jokeResult.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

  let categoriesParam = selectedCategories.length > 0 ? selectedCategories.join(",") : "Any";
  let typeParam = selectedJokeTypes.length === 1 ? selectedJokeTypes[0] : '';

  let params = ["safe-mode"];
  if (selectedFlags.length > 0) params.push("blacklistFlags=" + selectedFlags.join(","));
  if (language) params.push("lang=" + language);
  if (typeParam) params.push("type=" + typeParam);
  if (searchString) params.push("contains=" + encodeURIComponent(searchString));
  if (idMin || idMax) {
    let min = idMin || "0", max = idMax || "1367";
    params.push("idRange=" + min + "-" + max);
  }
  if (amount > 1) params.push("amount=" + amount);
  if (format && format !== "json") params.push("format=" + format);

  let apiUrl = `https://v2.jokeapi.dev/joke/${categoriesParam}?${params.join("&")}`;

  try {
    let res;
    if (format === "json" || !format) {
      res = await fetch(apiUrl);
      const data = await res.json();
      if (data.error) throw data;

      if (data.jokes) {
        let jokesHtml = '<div class="multiple-jokes">';
        data.jokes.forEach(joke => {
          jokesHtml += `<div class="joke-item"><p>${joke.type === "single" ? joke.joke : `${joke.setup}<br><strong>${joke.delivery}</strong>`}</p></div>`;
        });
        jokesHtml += "</div>";
        jokeResult.innerHTML = jokesHtml;
      } else {
        jokeResult.innerHTML = data.type === "single"
          ? data.joke
          : `${data.setup}<br><strong>${data.delivery}</strong>`;
      }
    } else {
      res = await fetch(apiUrl);
      const text = await res.text();
      jokeResult.textContent = text.length > 500 ? text.substring(0, 500) + "..." : text;
    }
  } catch (error) {
    let errMsg = "No jokes found or query invalid.";
    if (error.message) errMsg = error.message;
    if (error.additionalInfo) errMsg += " " + error.additionalInfo;
    jokeResult.innerHTML = `<span style='color:red;'>${errMsg}</span>`;
  }
}

// Reset joke filter form
function resetForm() {
  document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('selected'));
  selectedCategories = [];
  document.querySelectorAll('.flag-btn').forEach(btn => btn.classList.remove('selected'));
  selectedFlags = [];
  document.getElementById('language').value = '';
  document.getElementById('response-format').value = 'json';
  document.querySelectorAll('.joke-type-btn').forEach(btn => btn.classList.add('selected'));
  selectedJokeTypes = ['single', 'twopart'];
  document.getElementById('search-string').value = '';
  document.getElementById('id-min').value = '';
  document.getElementById('id-max').value = '';
  document.getElementById('amount').value = '1';
  document.getElementById('filtered-joke-result').innerHTML = '';
  alert('Form has been reset to default values');
}

// Copy text to clipboard utility
function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  const text = element.innerText || element.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const originalText = element.innerHTML;
    element.innerHTML = '<i class="fas fa-check"></i> Copied to clipboard!';
    setTimeout(() => { element.innerHTML = originalText; }, 2000);
  });
}

// Setup event listeners for the joke filter buttons
function setupEventListeners() {
  document.getElementById('reset-form-btn').addEventListener('click', resetForm);
  document.getElementById('send-request-btn').addEventListener('click', getCustomJoke);
}


// --- Advanced Fun Fact Section ---

// Fact categories mapped with keywords for filtering
const FACT_CATEGORIES = {
  all: [],
  animal: ["cat", "dog", "fish", "animal", "bird", "insect", "horse", "shark", "lion", "tiger", "bear", "monkey"],
  space: ["planet", "moon", "star", "space", "nasa", "mars", "jupiter", "galaxy", "astronaut"],
  history: ["history", "war", "ancient", "roman", "egypt", "egyptian", "king", "queen", "century", "president"],
  tech: ["computer", "internet", "techno", "technology", "robot", "ai", "machine", "engineer", "code", "software"],
  random: []
};

let selectedFactCategory = "all";
let savedFacts = [];

// Setup category toggle for fun facts
document.querySelectorAll('.fact-cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.fact-cat-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedFactCategory = btn.getAttribute('data-category');
  });
});

// Load fun facts with category filtering & display
document.getElementById('load-facts-btn').addEventListener('click', async () => {
  const amount = Math.min(5, Math.max(1, +document.getElementById('fact-amount').value || 1));
  const factList = document.getElementById('advanced-facts-list');
  factList.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading facts...';
  let facts = [];
  let tries = 0;

  while (facts.length < amount && tries < amount * 6) {
    tries++;
    let factObj = await fetchFunFact();
    if (!factObj) continue;

    // Filter by category keywords, or accept all/random
    if (selectedFactCategory === "random" || selectedFactCategory === "all") {
      facts.push(factObj);
    } else {
      const keywords = FACT_CATEGORIES[selectedFactCategory];
      const match = keywords.some(kw => factObj.text.toLowerCase().includes(kw));
      if (match) facts.push(factObj);
    }
  }

  if (!facts.length) {
    factList.innerHTML = `<span style="color:red;">No facts found in this category. Try "All" or "Random".</span>`;
    return;
  }

  factList.innerHTML = facts.map((fact, i) => `
    <div class="fact-item-card">
      <div class="fact-card-icon">📚</div>
      <div class="fact-content">
        <div class="fact-text">${fact.text}</div>
        <div class="fact-tags">${getFactTags(fact.text)}</div>
        <div class="fact-actions">
          <button class="save-fact-btn" data-idx="${i}" title="Save Fact">
            <i class="fas fa-bookmark${savedFacts.includes(fact.text) ? ' saved' : ''}"></i>
          </button>
          <button class="btn btn-secondary btn-small" onclick="copyFactToClipboard('${fact.text.replace(/'/g, "\\'")}')">Copy</button>
        </div>
      </div>
    </div>
  `).join('');

  // Attach save toggle handlers
  document.querySelectorAll('.save-fact-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.getAttribute('data-idx');
      const txt = facts[idx].text;
      if (!savedFacts.includes(txt)) {
        savedFacts.push(txt);
        btn.classList.add("saved");
      } else {
        savedFacts = savedFacts.filter(f => f !== txt);
        btn.classList.remove("saved");
      }
      btn.querySelector('i').classList.toggle('saved');
    });
  });
});

// Fetch a single random fun fact from API
async function fetchFunFact() {
  try {
    const res = await fetch(`https://uselessfacts.jsph.pl/api/v2/facts/random`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.text || data.text.length < 8) return null;
    return data;
  } catch {
    return null;
  }
}

// Get tags for fact based on keyword matching
function getFactTags(text) {
  let tags = [];
  for (const [cat, kws] of Object.entries(FACT_CATEGORIES)) {
    if (cat === "all" || cat === "random") continue;
    if (kws.some(k => text.toLowerCase().includes(k))) tags.push(cat.charAt(0).toUpperCase() + cat.slice(1));
  }
  if (!tags.length) tags.push("General");
  return tags.join(", ");
}

// Copy fact text to clipboard
function copyFactToClipboard(txt) {
  navigator.clipboard.writeText(txt).then(() => {
    alert('Copied fact: ' + txt);
  });
}

// Reset advanced fact filter form
document.getElementById('reset-fact-form-btn').addEventListener('click', () => {
  document.querySelectorAll('.fact-cat-btn').forEach((btn, i) => (i === 0 ? btn.classList.add('selected') : btn.classList.remove('selected')));
  selectedFactCategory = "all";
  document.getElementById('fact-amount').value = "1";
  document.getElementById('advanced-facts-list').innerHTML = '';
});

// Initialize on window load
window.onload = () => {
  getCategories();
  getLanguages();
  getFlags();
  setupJokeTypeButtons();
  setupEventListeners();

  // Animate cards appearance
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.card').forEach(card => {
    card.style.opacity = 0;
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
};
