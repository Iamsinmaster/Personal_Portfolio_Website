document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('interactiveCanvas');
    const ctx = canvas.getContext('2d');
    const body = document.body;
    const mainHeader = document.getElementById('main-header');
    const heroSection = document.getElementById('home-hero');
    const loadingOverlay = document.getElementById('loading-overlay');
    const themeToggle = document.getElementById('checkbox'); 
    const hiThereText = document.getElementById('hi-there-text'); 

    let particles = [];

    const NUM_PARTICLES = 180;
    const PARTICLE_RADIUS = 1.8;
    const LINE_DISTANCE = 150;
    const MOUSE_LINE_DISTANCE = 180;
    const MOUSE_REPULSE_RADIUS = 80;
    const REPULSE_FORCE = 0.8;

    let mouse = {
        x: null,
        y: null,
        radius: MOUSE_REPULSE_RADIUS
    };

    const getCssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = document.documentElement.scrollHeight;
    }
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor(x, y, directionX, directionY, radius, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.color = color;
            this.radius = radius;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
                this.directionY = -this.directionY;
            }

            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius + this.radius) {
                    let angle = Math.atan2(dy, dx);
                    let force = (mouse.radius - distance) / mouse.radius * REPULSE_FORCE;
                    this.directionX -= force * Math.cos(angle);
                    this.directionY -= force * Math.sin(angle);
                }
            }

            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function initCanvasElements() {
        const particleColorBase = getCssVar('--accent-blue-main');
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        const particleOpacity = isDarkMode ? 0.3 : 0.4;
        
        particles = [];
        for (let i = 0; i < NUM_PARTICLES; i++) {
            let radius = PARTICLE_RADIUS;
            let x = Math.random() * (canvas.width - radius * 2) + radius;
            let y = Math.random() * (canvas.height - radius * 2) + radius;
            let directionX = (Math.random() * 0.2) - 0.1;
            let directionY = (Math.random() * 0.2) - 0.1;
            let color = particleColorBase.replace(')', `, ${particleOpacity})`).replace('rgb', 'rgba');
            particles.push(new Particle(x, y, directionX, directionY, radius, color));
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const particleLineColor = getCssVar('--accent-blue-main');
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        const particleLineOpacity = isDarkMode ? 0.4 : 0.6; 
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();

            for (let j = i; j < particles.length; j++) {
                let p1 = particles[i];
                let p2 = particles[j];
                let dx = p1.x - p2.x;
                let dy = p1.y - p2.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < LINE_DISTANCE) {
                    ctx.beginPath();
                    ctx.strokeStyle = particleLineColor.replace(')', `, ${particleLineOpacity * (1 - (distance / LINE_DISTANCE))})`).replace('rgb', 'rgba');
                    ctx.lineWidth = 1.8;
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }

            if (mouse.x !== null && mouse.y !== null) {
                let p = particles[i];
                let dx = p.x - mouse.x;
                let dy = p.y - mouse.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < MOUSE_LINE_DISTANCE) {
                    ctx.beginPath();
                    ctx.strokeStyle = particleLineColor.replace(')', `, ${particleLineOpacity * 1.5 * (1 - (distance / MOUSE_LINE_DISTANCE))})`).replace('rgb', 'rgba');
                    ctx.lineWidth = 2.5;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
    }

    const navLinks = document.querySelectorAll('.nav-link');
    const stickyNavPanel = document.getElementById('sticky-nav-panel');
    const stickyNavLinks = document.querySelectorAll('.nav-link-sticky');
    const sections = document.querySelectorAll('section[id]:not(#sticky-nav-panel)');

    function setBodyPadding() {
        const headerHeight = mainHeader.offsetHeight;
        body.style.paddingTop = `${headerHeight}px`;
        heroSection.style.minHeight = `calc(100vh - ${headerHeight}px)`;
    }

    function updateActiveLink() {
        let currentActiveId = '';
        const headerHeight = mainHeader.offsetHeight;
        const activationOffset = headerHeight + 50;

        for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            const rect = section.getBoundingClientRect();
            if (rect.top <= activationOffset && rect.bottom > activationOffset) {
                currentActiveId = section.getAttribute('id');
                break;
            }
        }

        if (window.scrollY < heroSection.offsetHeight - 50) {
            currentActiveId = 'home-hero';
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === currentActiveId) {
                link.classList.add('active');
            }
        });

        stickyNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === currentActiveId) {
                link.classList.add('active');
            }
        });
    }

    function toggleStickyNavPanel() {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        if (window.scrollY > heroBottom - mainHeader.offsetHeight - 20) {
            stickyNavPanel.classList.add('show');
        } else {
            stickyNavPanel.classList.remove('show');
        }
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const headerHeight = mainHeader.offsetHeight;
                let targetScrollPosition;

                if (targetId === 'home-hero') {
                    targetScrollPosition = 0;
                } else {
                    targetScrollPosition = targetSection.getBoundingClientRect().top + window.scrollY - headerHeight;
                    targetScrollPosition += 5;
                    if (targetScrollPosition < 0) targetScrollPosition = 0;
                }

                window.scrollTo({
                    top: targetScrollPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    window.addEventListener('scroll', () => {
        updateActiveLink();
        toggleStickyNavPanel();
    });

    const setupLayout = () => {
        setBodyPadding();
        updateActiveLink();
        toggleStickyNavPanel();
        setCanvasSize();
        initCanvasElements(); 
    };

    const applyTheme = (isDarkMode) => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        initCanvasElements(); 
    };

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        themeToggle.checked = true;
        applyTheme(true);
    } else {
        themeToggle.checked = false;
        applyTheme(false); 
    }

    themeToggle.addEventListener('change', (event) => {
        applyTheme(event.target.checked);
    });

    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
        setTimeout(() => {
            setupLayout(); 
            animate(); 

            const heroTextElements = document.querySelectorAll('#home-hero h1, #home-hero p:not(#hi-there-text)');
            heroTextElements.forEach(element => {
                const initialDelay = parseFloat(element.style.animationDelay) || 0;
                element.style.animation = `
                    fadeInSlideUp 1s ease-out forwards,
                    heroTextGlow 2s ease-in-out infinite alternate ${initialDelay + 1}s
                `;
            });

            if (hiThereText) {
                const initialDelay = parseFloat(hiThereText.style.animationDelay) || 0;
                hiThereText.style.animation = `
                    fadeInSlideUp 1s ease-out forwards,
                    hiThereColorCycle 6s infinite alternate ${initialDelay + 1}s
                `;
            }
        }, 500); 
    }, 1500); 

    window.addEventListener('resize', setupLayout);
});