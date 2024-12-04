const API_URL = "https://api.coingecko.com/api/v3/coins/markets";
const PARAMS = "?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false";

let selectedCryptos = JSON.parse(localStorage.getItem("selectedCryptos")) || [];

document.addEventListener("DOMContentLoaded", () => {
    fetchCryptocurrencies();
    renderComparison();
    document.getElementById("sort-market-cap").addEventListener("click", sortByMarketCap);
});

async function fetchCryptocurrencies() {
    try {
        const response = await fetch(`${API_URL}${PARAMS}`);
        const data = await response.json();
        renderCryptocurrencies(data);
    } catch (error) {
        console.error("Error fetching cryptocurrency data:", error);
    }
}

function renderCryptocurrencies(cryptos) {
    const cryptoContainer = document.getElementById("cryptocurrencies");
    cryptoContainer.innerHTML = "";

    cryptos.forEach(crypto => {
        const cryptoCard = document.createElement("div");
        cryptoCard.classList.add("crypto-card");
        cryptoCard.innerHTML = `
            <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
            <p>Price: $${crypto.current_price}</p>
            <p>24h Change: ${crypto.price_change_percentage_24h.toFixed(2)}%</p>
            <p>Market Cap: $${crypto.market_cap.toLocaleString()}</p>
            <button onclick="addToComparison('${crypto.id}')">Compare</button>
        `;
        cryptoContainer.appendChild(cryptoCard);
    });
}

function addToComparison(cryptoId) {
    if (selectedCryptos.length >= 5) {
        alert("You can only compare up to 5 cryptocurrencies.");
        return;
    }

    if (!selectedCryptos.includes(cryptoId)) {
        selectedCryptos.push(cryptoId);
        localStorage.setItem("selectedCryptos", JSON.stringify(selectedCryptos));
        renderComparison();
    }
}

function renderComparison() {
    const comparisonContainer = document.getElementById("comparison-list");
    comparisonContainer.innerHTML = "";

    selectedCryptos.forEach(async (cryptoId) => {
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}`);
            const crypto = await response.json();
            const comparisonCard = document.createElement("div");
            comparisonCard.classList.add("crypto-card");
            comparisonCard.innerHTML = `
                <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
                <p>Price: $${crypto.market_data.current_price.usd}</p>
                <p>24h Change: ${crypto.market_data.price_change_percentage_24h.toFixed(2)}%</p>
                <p>Market Cap: $${crypto.market_data.market_cap.usd.toLocaleString()}</p>
                <button onclick="removeFromComparison('${crypto.id}')">Remove</button>
            `;
            comparisonContainer.appendChild(comparisonCard);
        } catch (error) {
            console.error("Error fetching comparison data:", error);
        }
    });
}

function removeFromComparison(cryptoId) {
    selectedCryptos = selectedCryptos.filter(id => id !== cryptoId);
    localStorage.setItem("selectedCryptos", JSON.stringify(selectedCryptos));
    renderComparison();
}

function sortByMarketCap() {
    const cryptoContainer = document.getElementById("cryptocurrencies");
    const cards = Array.from(cryptoContainer.children);
    cards.sort((a, b) => {
        const aCap = parseInt(a.querySelector("p:nth-child(4)").innerText.replace(/\D/g, ""));
        const bCap = parseInt(b.querySelector("p:nth-child(4)").innerText.replace(/\D/g, ""));
        return bCap - aCap;
    });
    cryptoContainer.innerHTML = "";
    cards.forEach(card => cryptoContainer.appendChild(card));
}

const preferences = JSON.parse(localStorage.getItem("preferences")) || {
  theme: "dark",
  sortBy: "market-cap",
};

// Apply saved preferences on load
document.addEventListener("DOMContentLoaded", () => {
  applyPreferences();
  document.getElementById("theme-select").value = preferences.theme;
  document.getElementById("sort-option").value = preferences.sortBy;

  document.getElementById("save-preferences").addEventListener("click", savePreferences);
  document.getElementById("sort-option").addEventListener("change", applySorting);
});

// Save user preferences
function savePreferences() {
  const theme = document.getElementById("theme-select").checked ? "dark" : "light";
  const sortBy = document.getElementById("sort-option").value;

  preferences.theme = theme;
  preferences.sortBy = sortBy;

  localStorage.setItem("preferences", JSON.stringify(preferences));
  applyPreferences();
  alert("Preferences saved!");
}

// Apply preferences like theme and sorting
function applyPreferences() {
  document.body.className = preferences.theme; // Apply theme
  applySorting(); // Apply sorting
}

// Sorting cryptocurrencies based on user preference
function applySorting() {
  const sortOption = preferences.sortBy;
  const cryptoContainer = document.getElementById("cryptocurrencies");
  const cards = Array.from(cryptoContainer.children);

  cards.sort((a, b) => {
      if (sortOption === "market-cap") {
          const aCap = parseInt(a.querySelector("p:nth-child(4)").innerText.replace(/\D/g, ""));
          const bCap = parseInt(b.querySelector("p:nth-child(4)").innerText.replace(/\D/g, ""));
          return bCap - aCap;
      } else if (sortOption === "price") {
          const aPrice = parseFloat(a.querySelector("p:nth-child(2)").innerText.replace(/\D/g, ""));
          const bPrice = parseFloat(b.querySelector("p:nth-child(2)").innerText.replace(/\D/g, ""));
          return bPrice - aPrice;
      } else if (sortOption === "name") {
          const aName = a.querySelector("h3").innerText.toLowerCase();
          const bName = b.querySelector("h3").innerText.toLowerCase();
          return aName.localeCompare(bName);
      }
  });

  cryptoContainer.innerHTML = "";
  cards.forEach(card => cryptoContainer.appendChild(card));
}
