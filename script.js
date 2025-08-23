let githubConfig = {
    token: localStorage.getItem('githubToken') || '',
    repo: localStorage.getItem('githubRepo') || '',
    branch: 'main'
};

let products = [];

const translations = {
    pl: {
        navHome: "Strona główna",
        navAbout: "O pracy", 
        navPortfolio: "Moje prace",
        navContact: "Kontakt",
        contactBtn: "Skontaktuj się",
        heroSubtitle: "Custom Gunsmith Services",
        heroDescription: "Tworzę unikalne, precyzyjne broń z dbałością o szczegóły. Każdy element jest wykonywany na zamówienie lub jako unikalne dzieło.",
        heroButton: "Zobacz prace",
        aboutTitle: "O mojej pracy",
        aboutText1: "Specjalizuję się w tworzeniu indywidualnej broni, każdy element jest unikalny i wykonany z precyzją. Od indywidualnych montaży po modyfikacje, każdy produkt realizowany jest z dbałością o szczegóły.",
        aboutText2: "Moja praca obejmuje różne typy broni i modyfikacji. Nie prowadzę stałego inwentarza - każdy element jest wykonywany na zamówienie lub tworzony jako unikalne dzieło na sprzedaż.",
        aboutText3: "Wysokiej jakości rzemiosło i precyzja to podstawa mojej pracy. Każdy produkt to pokaz umiejętności technicznych i wizji artystycznej.",
        portfolioTitle: "Moje prace",
        portfolioSubtitle: "Wystawa indywidualnych montaży i modyfikacji. Każdy element reprezentuje unikalne rzemiosło i dbałość o szczegóły.",
        contactTitle: "Kontakt",
        contactPhone: "Telefon",
        contactAddress: "Adres",
        contactInquiries: "Zapytania",
        contactInquiriesText: "Skontaktuj się ze mną w sprawie pracy niestandardowej lub aktualnej dostępności",
        statusAvailable: "Dostępne do zakupu",
        statusSold: "Sprzedane",
        adminBtn: "Zarządzanie",
        adminTitle: "Zarządzanie katalogiem produktów",
        githubConfigTitle: "Konfiguracja GitHub",
        githubTokenLabel: "GitHub Token:",
        githubTokenHelp: "Potrzebny do zapisywania zmian. Utwórz CLASSIC token w GitHub Settings > Developer settings > Personal access tokens (classic) z uprawnieniami 'repo'",
        githubRepoLabel: "Nazwa repozytorium:",
        githubRepoHelp: "Format: username/repository-name",
        testConnectionBtn: "Testuj połączenie",
        saveConfigBtn: "Zapisz konfigurację",
        addProjectTitle: "Dodaj nowy produkt",
        projectNameLabel: "Nazwa produktu:",
        descriptionLabel: "Opis:",
        specsLabel: "Specyfikacje (oddzielone przecinkami):",
        imageLabel: "Zdjęcie produktu:",
        statusLabel: "Status:",
        yearLabel: "Rok:",
        addBtn: "Dodaj produkt",
        currentProjectsTitle: "Obecne produkty",
        refreshBtn: "Odśwież z GitHub",
        statusAvailableOption: "Dostępne do zakupu",
        statusSoldOption: "Sprzedane",
        deleteBtn: "Usuń",
        footerText: "© 2025 Dexter. Usługi rusznikarskie w Krakowie.",
        imageHelp: "Maksymalny rozmiar: 2MB. Obsługiwane formaty: JPG, PNG, WebP"
    },
    en: {
        navHome: "Home",
        navAbout: "About",
        navPortfolio: "My Work",
        navContact: "Contact",
        contactBtn: "Get In Touch",
        heroSubtitle: "Custom Gunsmith Services",
        heroDescription: "Crafting unique, precision firearms with attention to detail. Each piece is custom-made to order or available as one-of-a-kind creations.",
        heroButton: "View My Work",
        aboutTitle: "About My Work",
        aboutText1: "I specialize in creating custom firearms, each one unique and crafted with precision. From custom builds to modifications, every product is approached with meticulous attention to detail.",
        aboutText2: "My work spans various types of firearms and modifications. I don't maintain a permanent inventory - each piece is either custom-made to order or created as a unique piece for sale.",
        aboutText3: "Quality craftsmanship and precision are the cornerstones of my work. Every product is a showcase of technical skill and artistic vision.",
        portfolioTitle: "My Work",
        portfolioSubtitle: "A showcase of custom builds and modifications. Each piece represents unique craftsmanship and attention to detail.",
        contactTitle: "Contact",
        contactPhone: "Phone",
        contactAddress: "Location",
        contactInquiries: "Inquiries",
        contactInquiriesText: "Contact me for custom work or current availability",
        statusAvailable: "Available for Purchase",
        statusSold: "Sold",
        adminBtn: "Management",
        adminTitle: "Product Catalog Management",
        githubConfigTitle: "GitHub Configuration",
        githubTokenLabel: "GitHub Token:",
        githubTokenHelp: "Required for saving changes. Create CLASSIC token in GitHub Settings > Developer settings > Personal access tokens (classic) with 'repo' permissions",
        githubRepoLabel: "Repository name:",
        githubRepoHelp: "Format: username/repository-name",
        testConnectionBtn: "Test connection",
        saveConfigBtn: "Save configuration",
        addProjectTitle: "Add new product",
        projectNameLabel: "Product name:",
        descriptionLabel: "Description:",
        specsLabel: "Specifications (comma separated):",
        imageLabel: "Product image:",
        statusLabel: "Status:",
        yearLabel: "Year:",
        addBtn: "Add product",
        currentProjectsTitle: "Current products",
        refreshBtn: "Refresh from GitHub",
        statusAvailableOption: "Available for purchase",
        statusSoldOption: "Sold",
        deleteBtn: "Delete",
        footerText: "© 2025 Dexter. Custom gunsmith services in Kraków.",
        imageHelp: "Maximum size: 2MB. Supported formats: JPG, PNG, WebP"
    }
};

let currentLanguage = localStorage.getItem('dexterLanguage') || 'pl';

async function loadProductsFromGitHub() {
    const repo = githubConfig.repo || 'mmiki057/dexterwebpage';
    try {
        const headers = { 'Accept': 'application/vnd.github.v3+json' };
        if (githubConfig.token) headers['Authorization'] = `token ${githubConfig.token}`;

        const response = await fetch(`https://api.github.com/repos/${repo}/contents/products.json`, { headers });
        if (response.ok) {
            const data = await response.json();
            const content = atob(data.content);
            products = JSON.parse(content);
        } else {
            products = [];
        }
        renderPortfolio();
        renderProjectsList();
    } catch (error) {
        products = [];
        renderPortfolio();
        renderProjectsList();
        console.error(error);
    }
}

async function saveProductsToGitHub() {
    if (!githubConfig.token || !githubConfig.repo) return showStatus('Brak konfiguracji GitHub', 'error');
    showLoading(true);
    try {
        let sha = null;
        const getResponse = await fetch(`https://api.github.com/repos/${githubConfig.repo}/contents/products.json`, {
            headers: { 'Authorization': `token ${githubConfig.token}`, 'Accept': 'application/vnd.github.v3+json' }
        });
        if (getResponse.ok) {
            sha = (await getResponse.json()).sha;
        }
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(products, null, 2))));
        const payload = { message: `Update products.json - ${new Date().toISOString()}`, content, branch: githubConfig.branch };
        if (sha) payload.sha = sha;

        const response = await fetch(`https://api.github.com/repos/${githubConfig.repo}/contents/products.json`, {
            method: 'PUT',
            headers: { 'Authorization': `token ${githubConfig.token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) showStatus('Produkty zapisane do GitHub', 'success');
        else throw new Error(`HTTP ${response.status}`);
    } catch (error) {
        showStatus(`Błąd zapisu do GitHub: ${error.message}`, 'error');
    } finally { showLoading(false); }
}

function showStatus(message, type) {
    const indicator = document.getElementById('statusIndicator');
    indicator.textContent = message;
    indicator.className = `status-indicator status-${type}`;
    indicator.style.display = 'block';
    setTimeout(() => indicator.style.display = 'none', 5000);
}

function showLoading(show) { document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none'; }

function processImageFile(file) {
    return new Promise((resolve, reject) => {
        if (file.size > 2 * 1024 * 1024) return reject(currentLanguage === 'pl' ? 'Plik jest zbyt duży! Maksymalny rozmiar: 2MB' : 'File is too large! Maximum size: 2MB');
        if (!file.type.startsWith('image/')) return reject(currentLanguage === 'pl' ? 'Nieprawidłowy typ pliku! Wybierz obraz.' : 'Invalid file type! Please select an image.');

        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                let { width, height } = img;
                const maxWidth = 800, maxHeight = 600;
                if (width > height && width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth; }
                else if (height > maxHeight) { width = (width * maxHeight) / height; height = maxHeight; }
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = e.target.result;
        };
        reader.onerror = () => reject('Ошибка при чтении файла');
        reader.readAsDataURL(file);
    });
}

function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('dexterLanguage', lang);
    Object.keys(translations[lang]).forEach(key => {
        const element = document.getElementById(key);
        if (element) element.textContent = translations[lang][key];
    });
    renderPortfolio();
    renderProjectsList();
}

function renderPortfolio() {
    const grid = document.getElementById('portfolioGrid');
    grid.innerHTML = '';
    products.forEach(product => {
        const statusClass = product.status === 'available' ? 'status-available' : 'status-sold';
        const statusText = product.status === 'available' ? translations[currentLanguage].statusAvailable : translations[currentLanguage].statusSold;
        grid.innerHTML += `
            <div class="portfolio-item">
                <div class="portfolio-image">${product.image ? `<img src="${product.image}" alt="${product.title}">` : 'Product Photo'}</div>
                <div class="portfolio-content">
                    <div class="portfolio-title">${product.title}</div>
                    <div class="portfolio-description">${product.description}</div>
                    <div class="portfolio-specs">${product.specs.map(s => `<span class="spec-tag">${s}</span>`).join('')}${product.year ? `<span class="spec-tag">${product.year}</span>` : ''}</div>
                    <div class="portfolio-status ${statusClass}">${statusText}</div>
                </div>
            </div>`;
    });
}

function renderProjectsList() {
    const list = document.getElementById('projectsList');
    list.innerHTML = '';
    products.forEach((product, index) => {
        list.innerHTML += `
            <div class="project-item">
                <h4>${product.title}</h4>
                <p><strong>${translations[currentLanguage].statusLabel}</strong> ${product.status === 'available' ? translations[currentLanguage].statusAvailableOption : translations[currentLanguage].statusSoldOption}</p>
                <p><strong>${translations[currentLanguage].yearLabel}</strong> ${product.year}</p>
                ${product.image ? '<p><strong>📸</strong> Zdjęcie załączone</p>' : ''}
                <button class="btn btn-danger" onclick="removeProduct(${index})">${translations[currentLanguage].deleteBtn}</button>
            </div>`;
    });
}

async function addProduct(productData) { products.push(productData); await saveProductsToGitHub(); renderPortfolio(); renderProjectsList(); }
async function removeProduct(index) { if (confirm(currentLanguage === 'pl' ? 'Czy na pewno chcesz usunąć ten produkt?' : 'Are you sure you want to delete this product?')) { products.splice(index, 1); await saveProductsToGitHub(); renderPortfolio(); renderProjectsList(); } }

function openAdminPanel() {
    const password = prompt(currentLanguage === 'pl' ? 'Wprowadź hasło administratora:' : 'Enter administrator password:');
    if (password === 'dexter2025') {
        document.getElementById('adminModal').style.display = 'block';
        document.getElementById('githubToken').value = githubConfig.token;
        document.getElementById('githubRepo').value = githubConfig.repo;
        renderProjectsList();
    } else if (password !== null) alert(currentLanguage === 'pl' ? 'Nieprawidłowe hasło!' : 'Incorrect password!');
}

function closeAdminPanel() { document.getElementById('adminModal').style.display = 'none'; }

document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('projectImage');
    const imagePreview = document.getElementById('imagePreview');
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) processImageFile(file).then(img => { imagePreview.src = img; imagePreview.style.display = 'block'; }).catch(err => { alert(err); imageInput.value = ''; imagePreview.style.display = 'none'; });
            else imagePreview.style.display = 'none';
        });
    }

    const path = window.location.pathname;

    if (path.endsWith("/admin") || path.endsWith("/admin.html")) openAdminPanel();
    if (path.endsWith("/pl") || path.endsWith("/pl.html")) changeLanguage("pl");
    else if (path.endsWith("/en") || path.endsWith("/en.html")) changeLanguage("en");
    else changeLanguage(currentLanguage);

    document.getElementById("langPl").onclick = () => window.location.pathname = "/pl";
    document.getElementById("langEn").onclick = () => window.location.pathname = "/en";

    loadProductsFromGitHub();
});

document.getElementById('projectForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const title = document.getElementById('projectTitle').value;
    const description = document.getElementById('projectDescription').value;
    const specs = document.getElementById('projectSpecs').value.split(',').map(s => s.trim()).filter(s => s);
    const status = document.getElementById('projectStatus').value;
    const year = document.getElementById('projectYear').value;
    const imagePreview = document.getElementById('imagePreview');
    const image = imagePreview.style.display === 'block' ? imagePreview.src : null;
    await addProduct({ title, description, specs, status, year, image });
    this.reset();
    imagePreview.style.display = 'none';
    showStatus(currentLanguage === 'pl' ? 'Produkt dodany pomyślnie!' : 'Product added successfully!', 'success');
});

document.addEventListener('click', e => { if (e.target === document.getElementById('adminModal')) closeAdminPanel(); });
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const target = document.querySelector(a.getAttribute('href')); if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
