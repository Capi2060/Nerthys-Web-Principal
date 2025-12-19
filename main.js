/**
 * Nerthys Network Main Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initLayout();
    initAnimations();
    loadNews();
});

// --- Layout Injection (Navbar & Footer) ---

function initLayout() {
    // Determine path depth (simple check: are we in 'pages' folder?)
    const isPagesDir = window.location.pathname.includes('/pages/');
    const basePath = isPagesDir ? '../' : './';
    const pagesPath = isPagesDir ? './' : './pages/';

    // Navbar
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        navbarContainer.innerHTML = `
            <nav class="navbar">
                <a href="${basePath}index.html" class="nav-brand">
                    <img src="${basePath}assets/logoprincipal.png" alt="Logo">
                    NERTHYS
                </a>
                <div class="menu-toggle" onclick="toggleMenu()">
                    <i class="fa-solid fa-bars"></i>
                </div>
                <div class="nav-links">
                    <a href="${basePath}index.html" class="nav-link">Inicio</a>
                    <a href="${pagesPath}vote.html" class="nav-link">Votar</a>
                    <a href="${pagesPath}rules.html" class="nav-link">Reglas</a>
                    <a href="${pagesPath}staff.html" class="nav-link">Equipo</a>
                    <a href="https://tienda.nerthys.net" target="_blank" class="nav-link" style="color: var(--primary-yellow);">Tienda</a>
                </div>
            </nav>
        `;

        // Highlight active link
        const currentFile = window.location.pathname.split('/').pop() || 'index.html';
        const links = document.querySelectorAll('.nav-link');
        links.forEach(link => {
            if (link.getAttribute('href').endsWith(currentFile)) {
                link.classList.add('active');
            }
        });
    }

    // Footer
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        footerContainer.innerHTML = `
            <footer>
                <div class="container">
                    <div class="footer-socials">
                        <a href="#" class="social-icon"><i class="fa-brands fa-discord"></i></a>
                        <a href="#" class="social-icon"><i class="fa-brands fa-twitter"></i></a>
                        <a href="#" class="social-icon"><i class="fa-brands fa-youtube"></i></a>
                        <a href="#" class="social-icon"><i class="fa-brands fa-tiktok"></i></a>
                    </div>
                    <p style="color: var(--text-dim);">&copy; 2025 Nerthys Network. Todos los derechos reservados.</p>
                    <p style="font-size: 0.8rem; color: #555; margin-top: 10px;">No afiliado con Mojang AB.</p>
                </div>
            </footer>
        `;
    }
}

// --- Mobile Menu ---

window.toggleMenu = function () {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// --- Notifications ---

function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <span><i class="fa-solid fa-circle-info" style="margin-right: 10px; color: var(--primary-yellow)"></i> ${message}</span>
    `;

    container.appendChild(toast);

    // Remove after 3s
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// --- Features ---

window.copyIP = function () {
    const ip = "mc.nerthys.net";
    navigator.clipboard.writeText(ip).then(() => {
        showToast("¡IP Copiada! Te esperamos dentro.", "success");
    }).catch(err => {
        showToast("No se pudo copiar la IP :(", "error");
    });
}

// --- News Loader ---

function loadNews() {
    const newsGrid = document.getElementById('news-grid');
    if (!newsGrid) return;

    // Fake News Data - In a real app this could come from a JSON file or API
    const newsData = [
        {
            title: "¡Gran Apertura!",
            date: "19 Diciembre, 2024",
            excerpt: "Estamos emocionados de anunciar la apertura oficial de Nerthys Network. ¡Únete ahora!",
            icon: "fa-star"
        },
        {
            title: "Actualización de Navidad",
            date: "24 Diciembre, 2024",
            excerpt: "El lobby se ha decorado y hay nuevos eventos de navidad disponibles. ¡Consigue regalos!",
            icon: "fa-gift"
        },
        {
            title: "Nuevo Rango Disponible",
            date: "01 Enero, 2025",
            excerpt: "Descubre las ventajas del nuevo rango ASTRONAUTA en nuestra tienda.",
            icon: "fa-user-astronaut"
        }
    ];

    newsData.forEach(news => {
        const article = document.createElement('article');
        article.className = 'card';
        article.innerHTML = `
            <span class="news-date"><i class="fa-regular fa-calendar"></i> ${news.date}</span>
            <h3><i class="fa-solid ${news.icon}" style="color: var(--primary-yellow); margin-right: 8px;"></i>${news.title}</h3>
            <p>${news.excerpt}</p>
            <a href="#" style="display: inline-block; margin-top: 15px; color: var(--primary-yellow); font-weight: 600;">Leer más <i class="fa-solid fa-arrow-right"></i></a>
        `;
        newsGrid.appendChild(article);
    });
}

// --- Animations on Scroll ---

function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .vote-item, .section-title, .rule-category').forEach(el => {
        el.style.opacity = '0'; // Hide initially
        observer.observe(el);
    });
}
