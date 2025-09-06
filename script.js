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

// Fetch a random joke
async function getJoke() {
  try {
    const jokeElement = document.getElementById('joke');
    jokeElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading joke...';
    
    const res = await fetch("https://v2.jokeapi.dev/joke/Any?safe-mode");
    const data = await res.json();
    
    if (data.error) {
      jokeElement.textContent = "Oops! Couldn't fetch a joke. Try again!";
      return;
    }
    
    jokeElement.innerHTML = data.type === "single" 
      ? data.joke 
      : `${data.setup} <br> <strong>${data.delivery}</strong>`;
  } catch (error) {
    document.getElementById('joke').textContent = "Failed to fetch joke. Please check your connection.";
  }
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

// Fetch categories
async function getCategories() {
  try {
    const res = await fetch("https://v2.jokeapi.dev/categories");
    const data = await res.json();
    const list = document.getElementById('category-list');
    
    list.innerHTML = "";
    data.categories.forEach(cat => {
      let li = document.createElement('li');
      li.textContent = cat;
      list.appendChild(li);
    });
  } catch (error) {
    document.getElementById('category-list').innerHTML = "Failed to load categories";
  }
}

// Fetch flags
async function getFlags() {
  try {
    const res = await fetch("https://v2.jokeapi.dev/flags");
    const data = await res.json();
    const list = document.getElementById('flag-list');
    
    list.innerHTML = "";
    data.flags.forEach(flag => {
      let li = document.createElement('li');
      li.textContent = flag;
      list.appendChild(li);
    });
  } catch (error) {
    document.getElementById('flag-list').innerHTML = "Failed to load flags";
  }
}

// Fetch API info
async function getInfo() {
  try {
    const res = await fetch("https://v2.jokeapi.dev/info");
    const data = await res.json();
    const infoElement = document.getElementById('api-info');
    
    infoElement.innerHTML = `
      <div class="info-item"><strong>Version:</strong> ${data.version}</div>
      <div class="info-item"><strong>Jokes:</strong> ${data.jokes.totalCount.toLocaleString()}</div>
      <div class="info-item"><strong>Categories:</strong> ${data.jokes.categories.join(", ")}</div>
      <div class="info-item"><strong>Last Update:</strong> ${new Date(data.timestamp).toLocaleString()}</div>
    `;
  } catch (error) {
    document.getElementById('api-info').textContent = "Failed to fetch API info";
  }
}

// Ping API
async function getPing() {
  try {
    const pingResult = document.getElementById('ping-result');
    pingResult.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking API status...';
    
    const res = await fetch("https://v2.jokeapi.dev/ping");
    const data = await res.json();
    
    pingResult.innerHTML = `
      <div class="ping-status ${data.ping === 'pong' ? 'success' : 'error'}">
        <i class="fas fa-${data.ping === 'pong' ? 'check-circle' : 'exclamation-circle'}"></i>
        Status: ${data.ping} | Timestamp: ${new Date(data.timestamp).toLocaleString()}
      </div>
    `;
  } catch (error) {
    document.getElementById('ping-result').innerHTML = `
      <div class="ping-status error">
        <i class="fas fa-exclamation-circle"></i> API is unreachable
      </div>
    `;
  }
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

// Add CSS for API status and info items
const style = document.createElement('style');
style.textContent = `
  .info-item {
    margin-bottom: 8px;
    padding: 5px 0;
  }
  
  .ping-status {
    padding: 10px;
    border-radius: 5px;
    margin-top: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .ping-status.success {
    background-color: #e6f7ee;
    color: #0f5132;
  }
  
  .ping-status.error {
    background-color: #f8d7da;
    color: #842029;
  }
  
  .fa-spinner {
    margin-right: 8px;
  }
`;
document.head.appendChild(style);

// Auto-load on page load
window.onload = () => {
  getCategories();
  getFlags();
  getInfo();
  
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