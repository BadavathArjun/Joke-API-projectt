// Navigation toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
  });
});

// Global variables for selected categories and flags
let selectedCategories = [];
let selectedFlags = [];
let selectedJokeTypes = ['single', 'twopart'];

// Fetch a random joke (with optional filters)
async function getJoke(categories = [], flags = [], options = {}) {
  try {
    const jokeElement = document.getElementById('joke');
    jokeElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading joke...';
    
    // Build the API URL with parameters
    let apiUrl = "https://v2.jokeapi.dev/joke/";
    
    // Add categories if specified
    if (categories.length > 0) {
      apiUrl += categories.join(',');
    } else {
      apiUrl += 'Any';
    }
    
    // Add safe mode
    apiUrl += '?safe-mode';
    
    // Add blacklist flags if specified
    if (flags.length > 0) {
      apiUrl += `&blacklistFlags=${flags.join(',')}`;
    }
    
    // Add language if specified
    if (options.language) {
      apiUrl += `&lang=${options.language}`;
    }
    
    // Add type if specified
    if (options.type) {
      apiUrl += `&type=${options.type}`;
    }
    
    // Add search string if specified
    if (options.contains) {
      apiUrl += `&contains=${encodeURIComponent(options.contains)}`;
    }
    
    // Add ID range if specified
    if (options.idRange) {
      apiUrl += `&idRange=${options.idRange}`;
    }
    
    // Add amount if specified
    if (options.amount && options.amount > 1) {
      apiUrl += `&amount=${options.amount}`;
    }
    
    console.log("API URL:", apiUrl);
    
    const res = await fetch(apiUrl);
    let data;
    
    // Handle different response formats
    if (options.format === 'xml') {
      data = await res.text();
      // Simple XML to text conversion for demonstration
      jokeElement.textContent = data.length > 500 ? data.substring(0, 500) + '...' : data;
    } else if (options.format === 'yaml') {
      data = await res.text();
      jokeElement.textContent = data.length > 500 ? data.substring(0, 500) + '...' : data;
    } else if (options.format === 'txt') {
      data = await res.text();
      jokeElement.textContent = data;
    } else {
      // Default to JSON
      data = await res.json();
      
      if (data.error) {
        jokeElement.textContent = `Error: ${data.message}`;
        return;
      }
      
      if (data.jokes) {
        // Multiple jokes
        let jokesHtml = '<div class="multiple-jokes">';
        data.jokes.forEach(joke => {
          jokesHtml += `<div class="joke-item"><p>${joke.type === "single" ? joke.joke : `${joke.setup} <br> <strong>${joke.delivery}</strong>`}</p></div>`;
        });
        jokesHtml += '</div>';
        jokeElement.innerHTML = jokesHtml;
      } else {
        // Single joke
        jokeElement.innerHTML = data.type === "single" 
          ? data.joke 
          : `${data.setup} <br> <strong>${data.delivery}</strong>`;
      }
    }
  } catch (error) {
    console.error("Error fetching joke:", error);
    document.getElementById('joke').textContent = "Failed to fetch joke. Please check your connection.";
  }
}

// Get a custom joke based on form inputs
function getCustomJoke() {
  const language = document.getElementById('language').value;
  const format = document.getElementById('response-format').value;
  const searchString = document.getElementById('search-string').value;
  const idMin = document.getElementById('id-min').value;
  const idMax = document.getElementById('id-max').value;
  const amount = document.getElementById('amount').value;
  
  // Build options object
  const options = {
    language: language,
    format: format,
    contains: searchString,
    amount: parseInt(amount)
  };
  
  // Add type if not both selected
  if (selectedJokeTypes.length === 1) {
    options.type = selectedJokeTypes[0];
  }
  
  // Add ID range if specified
  if (idMin || idMax) {
    const min = idMin || '0';
    const max = idMax || '999999';
    options.idRange = `${min}-${max}`;
  }
  
  getJoke(selectedCategories, selectedFlags, options);
}

// Get a random joke from selected categories
function getJokeFromSelectedCategories() {
  if (selectedCategories.length === 0) {
    alert('Please select at least one category');
    return;
  }
  getJoke(selectedCategories, selectedFlags);
}

// Fetch a random fun fact
async function getFact() {
  try {
    const factElement = document.getElementById('fact');
    factElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading fact...';
    
    const res = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/random");
    const data = await res.json();
    
    factElement.textContent = data.text;
  } catch (error) {
    document.getElementById('fact').textContent = "Failed to fetch fact. Please check your connection.";
  }
}

// Fetch categories and create interactive buttons
async function getCategories() {
  try {
    const res = await fetch("https://v2.jokeapi.dev/categories");
    const data = await res.json();
    const buttonContainer = document.getElementById('category-buttons');
    
    buttonContainer.innerHTML = "";
    data.categories.forEach(cat => {
      if (cat !== "Any") { // Skip the "Any" category as it's the default
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'category-btn';
        button.textContent = cat;
        button.addEventListener('click', () => {
          button.classList.toggle('selected');
          
          if (button.classList.contains('selected')) {
            selectedCategories.push(cat);
          } else {
            selectedCategories = selectedCategories.filter(c => c !== cat);
          }
        });
        buttonContainer.appendChild(button);
      }
    });
  } catch (error) {
    document.getElementById('category-buttons').innerHTML = "Failed to load categories";
  }
}

// Fetch languages and populate dropdown
async function getLanguages() {
  try {
    const res = await fetch("https://v2.jokeapi.dev/languages");
    const data = await res.json();
    const languageSelect = document.getElementById('language');
    
    languageSelect.innerHTML = '<option value="">Any</option>';
    data.jokeLanguages.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang.code;
      option.textContent = `${lang.name} (${lang.code})`;
      languageSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Failed to load languages");
  }
}

// Fetch flags and create interactive buttons
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
          selectedFlags.push(flag);
        } else {
          selectedFlags = selectedFlags.filter(f => f !== flag);
        }
      });
      buttonContainer.appendChild(button);
    });
  } catch (error) {
    document.getElementById('flag-buttons').innerHTML = "Failed to load flags";
  }
}

// Set up joke type buttons
function setupJokeTypeButtons() {
  const jokeTypeButtons = document.querySelectorAll('.joke-type-btn');
  
  jokeTypeButtons.forEach(button => {
    button.addEventListener('click', () => {
      button.classList.toggle('selected');
      const type = button.getAttribute('data-type');
      
      if (button.classList.contains('selected')) {
        if (!selectedJokeTypes.includes(type)) {
          selectedJokeTypes.push(type);
        }
      } else {
        selectedJokeTypes = selectedJokeTypes.filter(t => t !== type);
        
        // Ensure at least one type is selected
        if (selectedJokeTypes.length === 0) {
          button.classList.add('selected');
          selectedJokeTypes.push(type);
          alert('At least one joke type must be selected');
        }
      }
    });
  });
}

// Fetch API info
async function getApiInfo() {
  try {
    const res = await fetch("https://v2.jokeapi.dev/info");
    const data = await res.json();
    const infoElement = document.getElementById('api-info-content');
    
    infoElement.innerHTML = `
      <div class="info-item"><strong>Version:</strong> ${data.version}</div>
      <div class="info-item"><strong>Jokes:</strong> ${data.jokes.totalCount.toLocaleString()}</div>
      <div class="info-item"><strong>Categories:</strong> ${data.jokes.categories.join(", ")}</div>
      <div class="info-item"><strong>Last Update:</strong> ${new Date(data.timestamp).toLocaleString()}</div>
    `;
  } catch (error) {
    document.getElementById('api-info-content').textContent = "Failed to fetch API info";
  }
}

// Check API status
async function checkApiStatus() {
  try {
    const statusElement = document.getElementById('api-status');
    statusElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking API status...';
    
    const res = await fetch("https://v2.jokeapi.dev/ping");
    const data = await res.json();
    
    statusElement.innerHTML = `
      <div class="ping-status ${data.ping === 'pong' ? 'success' : 'error'}">
        <i class="fas fa-${data.ping === 'pong' ? 'check-circle' : 'exclamation-circle'}"></i>
        Status: ${data.ping} | Timestamp: ${new Date(data.timestamp).toLocaleString()}
      </div>
    `;
  } catch (error) {
    document.getElementById('api-status').innerHTML = `
      <div class="ping-status error">
        <i class="fas fa-exclamation-circle"></i> API is unreachable
      </div>
    `;
  }
}

// Reset form function
function resetForm() {
  // Reset category buttons
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  selectedCategories = [];
  
  // Reset flag buttons
  document.querySelectorAll('.flag-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  selectedFlags = [];
  
  // Reset language
  document.getElementById('language').value = '';
  
  // Reset response format
  document.getElementById('response-format').value = 'json';
  
  // Reset joke types
  document.querySelectorAll('.joke-type-btn').forEach(btn => {
    btn.classList.add('selected');
  });
  selectedJokeTypes = ['single', 'twopart'];
  
  // Reset search string
  document.getElementById('search-string').value = '';
  
  // Reset ID range
  document.getElementById('id-min').value = '';
  document.getElementById('id-max').value = '';
  
  // Reset amount
  document.getElementById('amount').value = '1';
  
  // Show confirmation
  alert('Form has been reset to default values');
}

// Copy to clipboard function
function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  const text = element.innerText || element.textContent;
  
  navigator.clipboard.writeText(text).then(() => {
    // Show temporary success message
    const originalText = element.innerHTML;
    element.innerHTML = '<i class="fas fa-check"></i> Copied to clipboard!';
    
    setTimeout(() => {
      element.innerHTML = originalText;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}

// Set up event listeners for buttons
function setupEventListeners() {
  // Reset form button
  document.getElementById('reset-form-btn').addEventListener('click', resetForm);
  
  // Send request button
  document.getElementById('send-request-btn').addEventListener('click', getCustomJoke);
}

// Auto-load on page load
window.onload = () => {
  getCategories();
  getLanguages();
  getFlags();
  getApiInfo();
  setupJokeTypeButtons();
  setupEventListeners();
  
  // Add subtle animations to cards when they come into view
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe all cards for animation
  document.querySelectorAll('.card').forEach(card => {
    card.style.opacity = 0;
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
};