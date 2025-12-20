/**
 * Lógica Principal de Nerthys Network
 * Aquí se controla todo lo de la web.
 */

// --- CONFIGURACIÓN ---
const APPLICATIONS_OPEN = false; // <--- CAMBIAR ESTO A true PARA ABRIR LAS POSTULACIONES o a false PARA CERRARLAS
const FORM_URL = "https://forms.google.com/tu-formulario"; // Poner aquí el link del formulario de postulaciones

document.addEventListener('DOMContentLoaded', () => {
    initLayout();      // Cargar Navbar y Footer
    initAnimations();  // Iniciar animaciones de scroll
    loadNews();        // Cargar noticias
    initTabs();        // Lógica de las pestañas de reglas
    initApplyLogic();  // Lógica de las postulaciones (Nuevo)
    initRoleModals();  // Lógica de Modals de Roles
});

// --- Inyección del Layout (Navbar y Footer) ---

function initLayout() {
    // Detectar si estoy en una subcarpeta para arreglar las rutas
    const isPagesDir = window.location.pathname.includes('/pages/');
    const basePath = isPagesDir ? '../' : './';
    const pagesPath = isPagesDir ? './' : './pages/';

    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        navbarContainer.innerHTML = `
            <div class="nav-pill-container">
                <div class="nav-highlight"></div> <!-- Elemento mágico deslizante -->
                
                <a href="${basePath}index.html" class="nav-pill-item" data-page="index.html">
                    <i class="fa-solid fa-house"></i>
                    <span>Inicio</span>
                </a>
                <a href="${pagesPath}news.html" class="nav-pill-item" data-page="news.html">
                    <i class="fa-solid fa-newspaper"></i>
                    <span>Noticias</span>
                </a>
                <a href="${pagesPath}vote.html" class="nav-pill-item" data-page="vote.html">
                    <i class="fa-solid fa-gem"></i>
                    <span>Votar</span>
                </a>
                <a href="${pagesPath}rules.html" class="nav-pill-item" data-page="rules.html">
                    <i class="fa-solid fa-book"></i>
                    <span>Reglas</span>
                </a>
                
                <a href="${pagesPath}apply.html" class="nav-pill-item" data-page="apply.html">
                    <i class="fa-solid fa-pen-nib"></i>
                    <span>Postulaciones</span>
                </a>
                <a href="${pagesPath}staff.html" class="nav-pill-item" data-page="staff.html">
                    <i class="fa-solid fa-users"></i>
                    <span>Equipo</span>
                </a>

                <div class="nav-separator"></div>

                <a href="https://tienda.nerthys.net" target="_blank" class="nav-pill-item store-link">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <span>Tienda</span>
                </a>
            </div>
        `;

        // Lógica para marcar el enlace activo y mover el highlight
        const currentFile = window.location.pathname.split('/').pop() || 'index.html';
        const links = document.querySelectorAll('.nav-pill-item:not(.store-link)');
        const highlight = document.querySelector('.nav-highlight');
        let currentTarget = null; // Elemento que debería tener el highlight ahora mismo

        function moveHighlight(element) {
            if (!element || !highlight) return;
            // Cálculos para la posición
            const width = element.offsetWidth;
            const left = element.offsetLeft;

            highlight.style.width = `${width}px`;
            highlight.style.left = `${left}px`;
            highlight.style.opacity = '1';
        }

        // Observer para detectar cuando los items cambian de tamaño (al expandirse el texto)
        // NOTA: Si uno cambia de tamaño, empuja a los demás. Así que si cualquiera cambia,
        // recalculamos la posición del target actual.
        const resizeObserver = new ResizeObserver(entries => {
            if (currentTarget) {
                moveHighlight(currentTarget);
            }
        });

        let activeLink = null;

        links.forEach(link => {
            const page = link.getAttribute('data-page');

            // Detectar activo inicial
            if (page && currentFile.includes(page)) {
                link.classList.add('active');
                activeLink = link;
            } else if ((currentFile === '' || currentFile === '/') && page === 'index.html') {
                link.classList.add('active');
                activeLink = link;
            }

            // Observar cambios de tamaño
            resizeObserver.observe(link);

            // Eventos Hover
            link.addEventListener('mouseenter', () => {
                currentTarget = link;
                moveHighlight(link);
            });
        });

        // Establecer target inicial
        if (activeLink) currentTarget = activeLink;

        const container = document.querySelector('.nav-pill-container');
        if (container) {
            container.addEventListener('mouseleave', () => {
                // Al salir del contenedor, volvemos al activo (si hay)
                if (activeLink) {
                    currentTarget = activeLink;
                    moveHighlight(activeLink);
                } else {
                    currentTarget = null;
                    highlight.style.opacity = '0';
                }
            });
        }

        // Posición Inicial
        setTimeout(() => {
            if (activeLink) {
                currentTarget = activeLink;
                moveHighlight(activeLink);
            }
        }, 100);

        // Listener para redimensionamiento de ventana
        window.addEventListener('resize', () => {
            if (currentTarget) moveHighlight(currentTarget);
        });
    }

    // Inyectar el Footer
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        footerContainer.innerHTML = `
            <footer>
                <div class="container">
                    <div class="footer-socials">
                        <a href="https://discord.gg/nerthys" target="_blank" class="social-icon"><i class="fa-brands fa-discord"></i></a>
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

// --- Lógica de Pestañas (Reglas) ---
function initTabs() {
    // Un pequeño delay para asegurar que el DOM ha cargado
    setTimeout(() => {
        const tabs = document.querySelectorAll('.tab-btn');
        const contents = document.querySelectorAll('.tab-content');

        if (tabs.length === 0) return;

        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const clickedTab = e.currentTarget;
                const targetId = clickedTab.getAttribute('data-target');

                // Desactivar todo
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.style.display = 'none'); // Forzar ocultar
                contents.forEach(c => c.classList.remove('active'));

                // Activar el clickeado
                clickedTab.classList.add('active');
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.style.display = 'block'; // Forzar mostrar
                    setTimeout(() => targetContent.classList.add('active'), 10); // Efecto fade in
                }
            });
        });
    }, 300);
}

// --- Lógica de Postulaciones ---
function initApplyLogic() {
    const applyBtn = document.getElementById('apply-btn');
    const statusBadge = document.getElementById('apply-status');
    const statusText = document.getElementById('status-text');

    // Compruebo si existe el badge para actualizar el estado visual
    if (statusBadge) {
        if (APPLICATIONS_OPEN) {
            statusBadge.className = 'status-badge open';
            statusBadge.innerHTML = '<i class="fa-solid fa-check"></i> ABIERTAS';
            statusText.innerHTML = "Actualmente estamos buscando nuevo personal.";
            statusText.style.color = "#4ade80"; // Verde
        } else {
            statusBadge.className = 'status-badge closed';
            statusBadge.innerHTML = '<i class="fa-solid fa-lock"></i> CERRADAS';
            statusText.innerHTML = "No estamos aceptando solicitudes por el momento.";
            statusText.style.color = "#ef4444"; // Rojo
        }
    }

    // Listener del botón
    if (applyBtn) {
        applyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (APPLICATIONS_OPEN) {
                // Si están abiertas, abro el formulario
                window.open(FORM_URL, '_blank');
            } else {
                // Si no, tiro un error bonito
                showToast("Las postulaciones están cerradas actualmente.", "error");
            }
        });
    }
}

// --- Notificaciones (Toasts Premium) ---

function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-xmark';
    if (type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `
        <div class="toast-icon ${type}"><i class="fa-solid ${icon}"></i></div>
        <div class="toast-content">${message}</div>
    `;

    container.appendChild(toast);

    // Animación de entrada y salida
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// --- Funcionalidades Extra ---

window.copyIP = function () {
    const ip = "mc.nerthys.net";
    navigator.clipboard.writeText(ip).then(() => {
        showToast("¡IP Copiada! Te esperamos dentro.", "success");
    }).catch(err => {
        showToast("No se pudo copiar la IP :(", "error");
    });
}

// --- Cargador de Noticias (Home) ---

// --- Cargador de Noticias (News Page) ---

/*
 * LISTA DE ESTILOS PARA BADGES (Etiquetas de Noticias)
 * Usa estas clases en la propiedad "badgeClass" de cada noticia:
 *
 * 1. NEON (Pulsante):
 *    badge-neon-red, badge-neon-blue, badge-neon-green, badge-neon-yellow,
 *    badge-neon-purple, badge-neon-pink, badge-neon-orange, badge-neon-cyan,
 *    badge-neon-gold, badge-neon-white
 *
 * 2. GLASS (Transparente/Vidrio):
 *    badge-glass-red, badge-glass-blue, badge-glass-green, badge-glass-yellow,
 *    badge-glass-purple, badge-glass-pink, badge-glass-orange, badge-glass-cyan,
 *    badge-glass-gold, badge-glass-white
 *
 * 3. GRADIENT (Degradados Vibrantes):
 *    badge-grad-sunset, badge-grad-ocean, badge-grad-forest, badge-grad-royal,
 *    badge-grad-fire, badge-grad-night, badge-grad-lemon, badge-grad-berry,
 *    badge-grad-teal, badge-grad-gold
 *
 * 4. COSMIC (Espacial Animado):
 *    badge-cosmic (Morado/Rosa), badge-cosmic-blue, badge-cosmic-red, badge-cosmic-gold
 *
 * 5. METAL (Metálico Brillante):
 *    badge-metal-silver, badge-metal-gold, badge-metal-copper
 *
 * 6. OTROS ESTILOS:
 *    badge-fire (Efecto Fuego Animado)
 *    badge-glitch (Efecto Cyberpunk)
 *    badge-frosted-ice (Efecto Hielo)
 *    badge-holo (Holográfico)
 *
 * 7. OUTLINE (Borde Simple):
 *    badge-outline-red, badge-outline-blue, badge-outline-gold, badge-outline-white
 *
 * 8. SOLID (Color Plano):
 *    badge-solid-red, badge-solid-blue, badge-solid-black
 */

function loadNews() {
    const newsGrid = document.getElementById('news-grid-container');
    if (!newsGrid) return; // Si no estoy en la página de noticias, me salgo

    const newsData = [
        {
            title: "¡Gran Apertura de Nerthys!",
            date: "1 Febrero, 2025",
            excerpt: "Tras meses de desarrollo, estamos orgullosos de abrir las puertas de Nerthys Network. ¡Únete ya!",
            icon: "fa-rocket",
            tag: "Importante",
            badgeClass: "badge badge-neon-yellow",
            featured: true,
            content: `
                <p>¡Saludos, aventureros estelares!</p>
                <p>Es un honor absoluto darles la bienvenida al lanzamiento oficial de <strong>Nerthys Network</strong>. Han sido meses de arduo trabajo, configuración y diseño para traerles una experiencia de Minecraft única, enfocada en la calidad y la diversión.</p>
                
                <h3>🚀 ¿Qué es Nerthys Network?</h3>
                <p>Nerthys es más que un servidor; es un universo. Hemos creado una modalidad de <strong>Survival Custom</strong> compatible con Java y Bedrock (1.20 - 1.21) que redefine la forma en que juegas.</p>
                
                <h3>✨ Características Principales</h3>
                <ul>
                    <li><strong>Economía Balanceada:</strong> Un sistema de mercado dinámico donde cada recurso cuenta.</li>
                    <li><strong>Protecciones Avanzadas:</strong> Tu base es tu santuario. Olvídate de los grifeos con nuestras piedras de protección.</li>
                    <li><strong>Items Custom:</strong> Armas, armaduras y herramientas con habilidades especiales que no encontrarás en vanilla.</li>
                    <li><strong>Eventos Diarios:</strong> Desde KOTHs hasta torneos de pesca, siempre hay algo que hacer.</li>
                </ul>

                <h3>🎉 Evento de Bienvenida</h3>
                <p>Para celebrar la apertura, todos los usuarios que entren durante la primera semana recibirán el <strong>Kit Pionero</strong> totalmente gratis, que incluye:</p>
                <ul>
                    <li>1x Espada de Hierro "Reliquia de Inicio"</li>
                    <li>32x Pan Dorado</li>
                    <li>1x LLave de Caja Común</li>
                    <li>Título exclusivo [Pionero] en el chat</li>
                </ul>

                <p>¡No esperes más! Copia la IP <code>mc.nerthys.net</code> y comienza tu aventura hoy mismo.</p>
                <p><em>- El Equipo Administrativo de Nerthys</em></p>
            `
        },
        // {
        //     title: "Actualización de Navidad",
        //     date: "25 Diciembre, 2025",
        //     excerpt: "El lobby se ha decorado y hay nuevos eventos navideños disponibles por tiempo limitado.",
        //     icon: "fa-snowflake",
        //     tag: "Evento",
        //     badgeClass: "badge badge-cosmic-blue",
        //     featured: false,
        //     content: `
        //         <p>¡Felices Fiestas, comunidad!</p>
        //         <p>La Navidad ha llegado a Nerthys Network y el espíritu festivo se ha apoderado de nuestro Lobby y del mundo Survival.</p>

        //         <h3>🎅 Novedades Navideñas</h3>
        //         <ul>
        //             <li><strong>Lobby Invernal:</strong> Hemos cubierto el lobby de nieve y decoraciones mágicas. ¡Busca los regalos ocultos!</li>
        //             <li><strong>Calendario de Adviento:</strong> Usa <code>/adviento</code> cada día para reclamar una recompensa gratuita.</li>
        //             <li><strong>Caja Navideña:</strong> Una nueva caja de loot limitada con cosméticos exclusivos de elfo, reno y Santa.</li>
        //         </ul>

        //         <p>El evento estará activo hasta el 7 de Enero. ¡No te pierdas los regalos diarios!</p>
        //     `
        // },
        // {
        //     title: "Nuevo Rango ",
        //     date: "01 Enero, 2025",
        //     excerpt: "Descubre las ventajas exclusivas del nuevo rango disponible en la tienda.",
        //     icon: "fa-user-astronaut",
        //     tag: "Tienda",
        //     badgeClass: "badge badge-metal-gold",
        //     featured: false,
        //     content: `
        //         <p>¡Alcanza las estrellas con el nuevo rango <strong>ASTRONAUTA</strong>!</p>
        //         <p>Hemos escuchado sus sugerencias y hemos creado un nuevo rango intermedio en nuestra tienda, diseñado para ofrecer las mejores utilidades sin romper el balance del juego.</p>

        //         <h3>💎 Beneficios Destacados</h3>
        //         <ul>
        //             <li>Acceso al comando <code>/fly</code> en tus protecciones.</li>
        //             <li>Kit Astronauta (Reclamable cada 3 días).</li>
        //             <li>Acceso a 3 homes adicionales.</li>
        //             <li>Color de chat exclusivo: <strong>Azul Galáctico</strong>.</li>
        //             <li>Prioridad en la cola de entrada.</li>
        //         </ul>

        //         <p>Adquiérelo ya en <a href="https://tienda.nerthys.net" target="_blank" style="color: var(--primary-yellow);">tienda.nerthys.net</a> con un <strong>20% de descuento</strong> de lanzamiento.</p>
        //     `
        // },
    ];

    newsGrid.innerHTML = '';

    newsData.forEach((news, index) => {
        const article = document.createElement('article');

        // --- Noticia Destacada (Featured) ---
        if (index === 0 && news.featured) {
            article.className = 'news-card-featured';
            article.innerHTML = `
                <span class="${news.badgeClass}" data-text="${news.tag}">${news.tag}</span>
                <div class="news-content">
                    <h2 class="news-title">${news.title}</h2>
                    <div class="news-date"><i class="fa-regular fa-calendar"></i> ${news.date}</div>
                    <p class="news-excerpt">${news.excerpt}</p>
                    <button class="btn btn-primary open-modal-btn">
                        Leer Artículo <i class="fa-solid fa-arrow-right" style="margin-left: 8px;"></i>
                    </button>
                </div>
            `;
        }
        // --- Noticias Normales ---
        else {
            article.className = 'news-card';
            article.innerHTML = `
                <span class="${news.badgeClass}" data-text="${news.tag}">${news.tag}</span>
                <div class="news-date"><i class="fa-regular fa-calendar"></i> ${news.date}</div>
                <h3 class="news-title"><i class="fa-solid ${news.icon}" style="color: var(--primary-yellow); font-size: 0.8em; margin-right: 8px;"></i>${news.title}</h3>
                <p class="news-excerpt">${news.excerpt}</p>
                <button class="read-more-link open-modal-btn" style="background:none; border:none; cursor:pointer; font-family:inherit; font-size: 0.9rem;">
                    Leer más <i class="fa-solid fa-arrow-right"></i>
                </button>
            `;
        }

        // Añadir Listener para abrir modal
        const btn = article.querySelector('.open-modal-btn');
        if (btn) {
            btn.addEventListener('click', () => openNewsModal(news));
        }

        newsGrid.appendChild(article);
    });

    initModalLogic();
}

// --- Lógica del Modal ---
function openNewsModal(news) {
    const modal = document.getElementById('news-modal');
    if (!modal) return;

    // Rellenar datos
    const tagEl = document.getElementById('modal-tag');
    tagEl.textContent = news.tag;
    tagEl.className = news.badgeClass || 'news-tag'; // Fallback

    document.getElementById('modal-title').textContent = news.title;
    document.getElementById('modal-date').innerHTML = `<i class="fa-regular fa-calendar"></i> ${news.date}`;
    document.getElementById('modal-body-content').innerHTML = news.content;

    // Mostrar modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Bloquear scroll de fondo
}

function initModalLogic() {
    const modal = document.getElementById('news-modal');
    const closeBtn = document.querySelector('.close-modal');

    if (!modal || !closeBtn) return;

    // Cerrar con botón X
    closeBtn.onclick = () => closeModal();

    // Cerrar con click fuera
    window.onclick = (event) => {
        if (event.target == modal) {
            closeModal();
        }
    }
}

function closeModal() {
    const modal = document.getElementById('news-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto'; // Restaurar scroll
    }
}

// --- Animaciones al hacer Scroll ---

function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .vote-item, .section-title, .rule-category, .staff-card, .vote-card, .gallery-item').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}


function initRoleModals() {
    const backdrop = document.getElementById('role-modal');
    const closeBtn = document.querySelector('#role-modal .close-modal');
    const roleButtons = document.querySelectorAll('.role-info-btn');

    if (!backdrop || !closeBtn) return;

    // Data definition for roles
    const roleData = {
        'owner': {
            title: 'Dueño',
            desc: 'El corazón y la mente detrás de Nerthys. Son quienes soñaron este universo y trabajan cada día para mantenerlo vivo.',
            reason: 'Para asegurar que el proyecto tenga un rumbo claro, financiación y un futuro estable.',
            scope: 'Todo el servidor, el staff y la comunidad entera.',
            func: 'Toman las decisiones difíciles, pagan los servidores y diseñan la próxima gran actualización.'
        },
        'manager': {
            title: 'Manager',
            desc: 'Los directores de orquesta. Se aseguran de que cada departamento (moderación, construcción, configuración) trabaje en armonía.',
            reason: 'Un proyecto tan grande necesita líderes que coordinen a las personas para evitar el caos.',
            scope: 'Supervisan a Administradores y a todo el equipo de Staff.',
            func: 'Resuelven problemas internos, organizan reuniones y optimizan el funcionamiento del equipo.'
        },
        'admin': {
            title: 'Administrador',
            desc: 'Los guardianes del orden. Tienen las herramientas para arreglar mundos rotos y la sabiduría para resolver conflictos graves.',
            reason: 'Necesitamos gente de confianza máxima que pueda actuar rápido ante fallos técnicos o ataques.',
            scope: 'Jugadores, mundos y el equipo de moderación.',
            func: 'Mantienen el servidor técnico, gestionan eventos masivos y supervisan sanciones graves.'
        },
        'jradmin': {
            title: 'Jr. Admin',
            desc: 'Líderes en entrenamiento. Están demostrando que tienen la madurez para llevar las riendas del servidor en el futuro.',
            reason: 'Para preparar a la siguiente generación de administradores y apoyar en la carga de trabajo.',
            scope: 'Apoyo a Admins y mentoría a rangos bajos.',
            func: 'Gestionan apelaciones complejas y aprenden a manejar herramientas avanzadas del servidor.'
        },
        'srmod': {
            title: 'Sr. Mod',
            desc: 'Los veteranos del chat. Han visto de todo y saben exactamente cómo aplicar las normas con justicia.',
            reason: 'Los moderadores nuevos necesitan guías experimentados que les enseñen el camino.',
            scope: 'Supervisan a Mods y Jr Mods.',
            func: 'Revisan sanciones dudosas, trainan a los nuevos y manejan situaciones de alta tensión.'
        },
        'mod': {
            title: 'Moderador',
            desc: 'Los protectores de la paz. Están en primera línea asegurando que puedas jugar sin tóxicos ni hackers.',
            reason: 'Para que tu experiencia de juego sea divertida y segura, libre de trampas e insultos.',
            scope: 'El chat general y el comportamiento de los jugadores.',
            func: 'Sancionan a quienes rompen las reglas, resuelven dudas y mantienen el ambiente limpio.'
        },
        'jrmod': {
            title: 'Jr. Mod',
            desc: 'Los aprendices dedicados. Acaban de unirse al equipo y están llenos de energía para ayudar y aprender.',
            reason: 'Todo gran staff empieza desde abajo, aprendiendo las bases de la moderación.',
            scope: 'Chat y reportes básicos.',
            func: 'Observan, aprenden los comandos y ayudan con las dudas más frecuentes de los usuarios.'
        },
        'ayudante': {
            title: 'Ayudante',
            desc: 'Los amigos expertos. No están para castigar, sino para echarte una mano cuando no sabes cómo funciona algo.',
            reason: 'A veces solo necesitas a alguien que sepa jugar bien para explicarte las cosas.',
            scope: 'Jugadores nuevos y dudas generales.',
            func: 'Responden preguntas en el chat y guían a los recién llegados por el servidor.'
        },
        'donator': {
            title: 'Donador',
            desc: 'Nuestros héroes sin capa. Gracias a su apoyo, podemos pagar la luz, el host y seguir mejorando Nerthys.',
            reason: 'Para financiar el proyecto y permitir que siga siendo gratis para todos.',
            scope: 'Disfrutan de su experiencia VIP.',
            func: 'Lucen cosméticos increíbles, vuelan en los lobbies y disfrutan de ventajas exclusivas.'
        }
    };

    // Open Modal
    roleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const roleKey = btn.getAttribute('data-role');
            const data = roleData[roleKey];

            if (data) {
                const titleEl = document.getElementById('modal-role-title');
                if (titleEl) titleEl.textContent = data.title;

                const descEl = document.getElementById('modal-role-description');
                if (descEl) descEl.textContent = data.desc;

                // Update New Fields
                const reasonEl = document.getElementById('modal-role-reason');
                if (reasonEl) reasonEl.textContent = data.reason;

                const scopeEl = document.getElementById('modal-role-scope');
                if (scopeEl) scopeEl.textContent = data.scope;

                const funcEl = document.getElementById('modal-role-functions');
                if (funcEl) funcEl.textContent = data.func;

                // --- Dynamic Member List ---
                const membersContainer = document.getElementById('modal-role-members');
                if (membersContainer) {
                    membersContainer.innerHTML = ''; // Clear previous

                    // Find the section associated with this button
                    // Logic: The button is inside a .role-header-container
                    // The NEXT element sibling is likely the .staff-grid-centered
                    const headerContainer = btn.closest('.role-header-container');
                    const gridContainer = headerContainer ? headerContainer.nextElementSibling : null;

                    if (gridContainer && gridContainer.classList.contains('staff-grid-centered')) {
                        const members = gridContainer.querySelectorAll('.staff-name');
                        if (members.length > 0) {
                            members.forEach(member => {
                                const name = member.textContent.trim();
                                const tag = document.createElement('span');

                                if (name.toLowerCase() === 'vacante') {
                                    tag.className = 'member-tag member-vacant';
                                    tag.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ¡Todavía no hay ${data.title}!`;
                                } else {
                                    tag.className = 'member-tag';
                                    tag.textContent = name;
                                }
                                membersContainer.appendChild(tag);
                            });
                        } else {
                            membersContainer.innerHTML = '<span style="color: #666; font-style: italic;">Sin miembros públicos actualmente.</span>';
                        }
                    } else {
                        // Fallback in case structure changes
                        membersContainer.innerHTML = '<span style="color: #666;">No se pudo cargar la lista.</span>';
                    }
                }

                backdrop.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close Modal Logic
    function closeRoleModal() {
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeRoleModal);

    // Close on click outside
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            closeRoleModal();
        }
    });
}
