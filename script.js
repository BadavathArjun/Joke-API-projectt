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

let selectedCategories = [];
let selectedFlags = [];
let selectedJokeTypes = ['single', 'twopart'];

// Fetch a random joke (basic: for hero section)
async function getJoke() {
  const jokeElement = document.getElementById('joke');
  jokeElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading joke...';

  try {
    let apiUrl = "https://v2.jokeapi.dev/joke/Any?safe-mode";
    const res = await fetch(apiUrl);
    const data = await res.json();
    if (data.error) {
      jokeElement.textContent = `Error: ${data.message}`;
      return;
    }
    jokeElement.innerHTML = data.type === "single"
      ? data.joke
      : `${data.setup} <br> <strong>${data.delivery}</strong>`;
  } catch (error) {
    jokeElement.textContent = "Failed to fetch joke. Check your connection.";
  }
}

// Fetch a random fun fact
async function getFact() {
  const factElement = document.getElementById('fact');
  factElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading fact...';
  try {
    const res = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/random");
    const data = await res.json();
    factElement.textContent = data.text;
  } catch (error) {
    factElement.textContent = "Failed to fetch fact. Check your connection.";
  }
}

// Filter Section: dynamic controls -------------------------------------
async function getCategories() {
  try {
    const res = await fetch("https://v2.jokeapi.dev/categories");
    const data = await res.json();
    const buttonContainer = document.getElementById('category-buttons');
    buttonContainer.innerHTML = "";
    data.categories.forEach(cat => {
      if (cat !== "Any") { // "Any" is implied
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
async function getLanguages() {
  try {
    const res = await fetch("https://v2.jokeapi.dev/languages");
    const data = await res.json();
    const select = document.getElementById('language');
    select.innerHTML = '<option value="">Any</option>';
    data.jokeLanguages.forEach(code => {
      // Try to display human name if available in possibleLanguages
      let name = code;
      const found = data.possibleLanguages?.find(l => l.code===code);
      if (found) name = found.name + ` (${code})`;
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = name;
      select.appendChild(opt);
    });
  } catch {
    document.getElementById('language').innerHTML = '<option>Failed to load</option>';
  }
}
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
// Main handler for "Send Request" button ---------------------------------------------------------------
async function getCustomJoke() {
  const language = document.getElementById('language').value;
  const format = document.getElementById('response-format').value;
  const searchString = document.getElementById('search-string').value.trim();
  const idMin = document.getElementById('id-min').value;
  const idMax = document.getElementById('id-max').value;
  let amount = parseInt(document.getElementById('amount').value || "1");
  if (isNaN(amount) || amount < 1) amount = 1;
  if (amount > 10) amount = 10;

  const jokeResult = document.getElementById('filtered-joke-result');
  jokeResult.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

  // Build categories
  let categoriesParam = "Any";
  if (selectedCategories.length>0) categoriesParam = selectedCategories.join(",");
  // Build joke type
  let typeParam = '';
  if (selectedJokeTypes.length==1) typeParam = selectedJokeTypes[0];

  // Validate: type must fit category (doc: some types may not exist for a category)
  // Input sanitization
  let params = ["safe-mode"];
  if (selectedFlags.length>0) params.push("blacklistFlags="+selectedFlags.join(","));
  if (language) params.push("lang="+language);
  if (typeParam) params.push("type="+typeParam);
  if (searchString) params.push("contains="+encodeURIComponent(searchString));
  if (idMin || idMax) {
    let min = idMin || "0", max = idMax || "1367";
    params.push("idRange=" + min + "-" + max);
  }
  if (amount>1) params.push("amount="+amount);
  if (format && format!=="json") params.push("format="+format);

  let apiUrl = `https://v2.jokeapi.dev/joke/${categoriesParam}?${params.join("&")}`;

  try {
    let res;
    if (format==="json" || !format) {
      res = await fetch(apiUrl);
      const data = await res.json();
      if (data.error) throw data;
      let jokesHtml = '';
      // Support multiple jokes or single joke
      if (data.jokes) {
        jokesHtml = '<div class="multiple-jokes">';
        data.jokes.forEach(joke=>{
          jokesHtml += `<div class="joke-item"><p>${joke.type==="single"?joke.joke:`${joke.setup}<br><strong>${joke.delivery}</strong>`}</p></div>`;
        });
        jokesHtml += "</div>";
        jokeResult.innerHTML = jokesHtml;
      } else {
        jokeResult.innerHTML = data.type==="single"
          ? data.joke
          : `${data.setup}<br><strong>${data.delivery}</strong>`;
      }
    } else {
      res = await fetch(apiUrl);
      const text = await res.text();
      jokeResult.textContent = text.length>500 ? text.substring(0,500)+"..." : text;
    }
  } catch (error) {
    let errMsg = "No jokes found or query invalid.";
    if (error.message) errMsg = error.message;
    if (error.additionalInfo) errMsg += " " + error.additionalInfo;
    jokeResult.innerHTML = `<span style='color:red;'>${errMsg}</span>`;
  }
}

// Reset form
function resetForm() {
  document.querySelectorAll('.category-btn').forEach(btn=>btn.classList.remove('selected'));
  selectedCategories = [];
  document.querySelectorAll('.flag-btn').forEach(btn=>btn.classList.remove('selected'));
  selectedFlags = [];
  document.getElementById('language').value = '';
  document.getElementById('response-format').value = 'json';
  document.querySelectorAll('.joke-type-btn').forEach(btn=>btn.classList.add('selected'));
  selectedJokeTypes = ['single','twopart'];
  document.getElementById('search-string').value = '';
  document.getElementById('id-min').value = '';
  document.getElementById('id-max').value = '';
  document.getElementById('amount').value = '1';
  document.getElementById('filtered-joke-result').innerHTML = '';
  alert('Form has been reset to default values');
}

// Copy to clipboard function
function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  const text = element.innerText || element.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const originalText = element.innerHTML;
    element.innerHTML = '<i class="fas fa-check"></i> Copied to clipboard!';
    setTimeout(()=>{element.innerHTML = originalText;}, 2000);
  });
}

function setupEventListeners() {
  document.getElementById('reset-form-btn').addEventListener('click',resetForm);
  document.getElementById('send-request-btn').addEventListener('click',getCustomJoke);
}

// Animation effects for cards
window.onload = () => {
  getCategories();
  getLanguages();
  getFlags();
  setupJokeTypeButtons();
  setupEventListeners();
  // Animate cards
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  const observer = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  document.querySelectorAll('.card').forEach(card=>{
    card.style.opacity = 0;
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
};
