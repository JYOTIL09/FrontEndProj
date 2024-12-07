const API_URL = "https://api.coingecko.com/api/v3/coins/markets";
const PARAMS = "?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false";

let selectedCryptos = JSON.parse(localStorage.getItem("selectedCryptos")) || [];
const _loader = document.getElementById("loader")
const _cryptotable = document.getElementById("crypto-table");
const _header = document.getElementById("header");
const _darkmodebtn = document.getElementById("dark-mode-btn");
const _comparisionList = document.getElementById("comparison-list");

document.addEventListener("DOMContentLoaded", () => {
    fetchCryptocurrencies();
    renderComparison();
    document.getElementById("sort-market-cap").addEventListener("click", sortByMarketCap);
});

function showLoading(){
    _loader.style.display = "flex"
}
function hideLoading(){
    _loader.style.display = "none"
}
// setInterval(
//     ()=>{
//         fetchCryptocurrencies();
//         renderComparison();
//     },60000
// )

async function fetchCryptocurrencies() {
    try {
        showLoading()
        const response = await fetch(`${API_URL}${PARAMS}`);
        const data = await response.json();
        renderCryptocurrencies(data);
        hideLoading()
    } catch (error) {
        console.error("Error fetching cryptocurrency data:", error);
        hideLoading()

    }
}

function renderCryptocurrencies(cryptos) {
    const cryptoContainer = document.getElementById("cryptocurrencies");
    cryptoContainer.innerHTML = "";


    cryptos.forEach(crypto => {
        const cryptoCard = document.createElement("tr");
        // cryptoCard.classList.add("crypto-card");
        cryptoCard.innerHTML = `
                <td>${crypto.symbol.toUpperCase()}</td>
                <td>${crypto.name}</td>
                <td style="letter-spacing:1px" class="display-4" data-toggle="counter-up">$${crypto.current_price}</td>
                <td style="letter-spacing:1px">${crypto.price_change_percentage_24h.toFixed(2)}%</td>
                <td style="letter-spacing:1px">$${crypto.market_cap.toLocaleString()}</td>
                <td><button class="side-btn sb-gradients" onclick="addToComparison('${crypto.id}')">Compare</button></td>     
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
            showLoading()
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}`);
            const crypto = await response.json();
            const comparisonCard = document.createElement("div");
            comparisonCard.classList.add("roadmap-item");
            comparisonCard.innerHTML = `
                
                <div class="roadmap-point"><span></span></div>
                <h4 style="color:inherit;">$${crypto.market_data.current_price.usd}</h4>
                <span>24h Change: ${crypto.market_data.price_change_percentage_24h.toFixed(2)}%</span>

                <h5 style="color:inherit;">${crypto.name} (${crypto.symbol.toUpperCase()})</h5>
                <button class="remove-comparision-btn" onclick="removeFromComparison('${crypto.id}')">Remove</button>
            
            `;
            comparisonContainer.appendChild(comparisonCard);
            hideLoading()

        } catch (error) {
            console.error("Error fetching comparison data:", error);
            hideLoading()

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
    theme: "light",
    sortBy: "market-cap",
};
setInitialTheme()
// Apply saved preferences on load
document.addEventListener("DOMContentLoaded", () => {
    applyPreferences();

    // document.getElementById("save-preferences").addEventListener("click", savePreferences);
});

function setInitialTheme(){
    let theme = preferences.theme
    repaintScreen(theme)
}
// Save user preferences
function saveTheme() {
    let theme 
    if(preferences.theme == "light"){
        theme = "dark"
    }else if(theme == "dark"){
        theme = "light"
    }else{
        theme = "light"
    }

    preferences.theme = theme;

    localStorage.setItem("preferences", JSON.stringify(preferences));

    repaintScreen(theme)

    // alert("Preferences saved!");
}

function repaintScreen(_theme){
    if (_theme == "dark") {
        document.body.style.backgroundColor = "black"
        _cryptotable.style.backgroundColor = "#252525"
        _header.style.backgroundColor = "#252525"
        _header.style.color = "white"
        _cryptotable.style.color = "white"
        _darkmodebtn.style.backgroundColor="black"
        _comparisionList.style.color="white"
    } else {
        document.body.style.backgroundColor = "rgb(71,147,227)"
        _cryptotable.style.backgroundColor = "white"
        _header.style.backgroundColor = "white"
        _cryptotable.style.color = "#111111" 
        _header.style.color = "#111111" 
        _darkmodebtn.style.backgroundColor="lightgrey"
        _comparisionList.style.color="black"

    }
}

function saveSortby(sortBy) {

    preferences.sortBy = sortBy;

    localStorage.setItem("preferences", JSON.stringify(preferences));
    applyPreferences();
    // alert("Preferences saved!");
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
            const aCap = parseInt(a.querySelector("td:nth-child(5)").innerText.replace(/[^\d.]/g, ""));
            const bCap = parseInt(b.querySelector("td:nth-child(5)").innerText.replace(/[^\d.]/g, ""));
            return bCap - aCap;
        } else if (sortOption === "price") {
            const aPrice = parseFloat(a.querySelector("td:nth-child(3)").innerText.replace(/[^\d.]/g, ""));
            const bPrice = parseFloat(b.querySelector("td:nth-child(3)").innerText.replace(/[^\d.]/g, ""));
            return bPrice - aPrice;
        } else if (sortOption === "name") {
            const aName = a.querySelector("td:nth-child(2)").innerText.toLowerCase();
            const bName = b.querySelector("td:nth-child(2)").innerText.toLowerCase();
            return aName.localeCompare(bName);
        }
    });

    cryptoContainer.innerHTML = "";
    cards.forEach(card => cryptoContainer.appendChild(card));
}
