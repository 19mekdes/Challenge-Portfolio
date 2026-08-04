// ============================================
// PROJECT DATA
// ============================================
const projects = [
    {
        id: 1,
        title: "Dental Clinic Management System",
        description: "A comprehensive dental clinic management system for appointment scheduling, patient records, and treatment tracking.",
        tags: ["React", "CSS", "JavaScript"],
        image: "image/project1.jpg"
    },
    {
        id: 2,
        title: "CineMatch",
        description: "A movie recommendation system that suggests films based on user preferences and viewing history.",
        tags: ["Next.js", "Tailwind CSS", "TypeScript", "Nest.js", "PostgreSQL"],
        image: "image/project2.jpg"
    },
    {
        id: 3,
        title: "Cake House",
        description: "An e-commerce platform for ordering custom cakes, pastries, and baked goods with online payment integration.",
        tags: ["React", "Tailwind CSS", "TypeScript"],
        image: "image/project3.jpg"
    },
    {
        id: 4,
        title: "AlphaLine Engineering Website",
        description: "A professional corporate website for an engineering company showcasing services, projects, and client portfolios.",
        tags: ["React", "Tailwind CSS", "TypeScript"],
        image: "image/project4.jpg"
    },
    {
        id: 5,
        title: "Product Catalog",
        description: "An interactive product catalog with search, filter, and sorting features for easy product discovery.",
        tags: ["React", "Tailwind CSS", "TypeScript"],
        image: "image/project5.jpg"
    },
    {
        id: 6,
        title: "Book Review",
        description: "A book review platform where users can rate, review, and discover new books across different genres.",
        tags: ["React", "Tailwind CSS", "TypeScript", "Node.js", "PostgreSQL"],
        image: "image/project6.jpg"
    }
];

// ============================================
// API CONFIGURATION
// ============================================

// Use a relative path when served by the backend, and an absolute URL when
// the page is opened directly as a file (file://) so it can still reach the API.
const API_BASE = window.location.protocol.startsWith('http')
    ? '/api'
    : 'http://localhost:5000/api';

// Fallback skills used when the backend isn't reachable
const FALLBACK_SKILLS = [
    { id: 1, category: "Frontend", name: "HTML", level: 90 },
    { id: 2, category: "Frontend", name: "CSS", level: 85 },
    { id: 3, category: "Frontend", name: "JavaScript", level: 80 },
    { id: 4, category: "Frontend", name: "React", level: 75 },
    { id: 5, category: "Backend", name: "Node.js", level: 85 },
    { id: 6, category: "Backend", name: "Express.js", level: 80 },
    { id: 7, category: "Backend", name: "Nest.js", level: 75 },
    { id: 8, category: "Backend", name: "MySQL", level: 85 },
    { id: 9, category: "Tools", name: "Git", level: 85 },
    { id: 10, category: "Tools", name: "Docker", level: 70 },
    { id: 11, category: "Tools", name: "AWS", level: 65 },
    { id: 12, category: "Tools", name: "Linux", level: 80 }
];

// ============================================
// RENDER PROJECTS
// ============================================
function renderProjects(projectData) {
    const grid = document.getElementById('projectGrid');
    const data = projectData || projects;

    grid.innerHTML = data.map(project => `
        <div class="project-card">
            <img 
                src="${escapeHTML(project.image)}" 
                alt="${escapeHTML(project.title)}"
                onerror="this.style.display='none'; this.parentElement.querySelector('.no-image').style.display='flex'"
            >
            <div class="no-image" style="display:none; height:200px; background:#f0f0f0; align-items:center; justify-content:center; flex-direction:column; color:#999; font-size:14px;">
                <i class="fas fa-image" style="font-size:40px; margin-bottom:10px;"></i>
                <span>${escapeHTML(project.title)}</span>
                <span style="font-size:12px;">No image available</span>
            </div>
            <div class="project-info">
                <h3>${escapeHTML(project.title)}</h3>
                <p>${escapeHTML(project.description)}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('')}
                </div>
                <a href="${escapeHTML(project.link || '#')}" class="project-link">View Project →</a>
            </div>
        </div>
    `).join('');
}

// ============================================
// LOAD DATA FROM BACKEND
// (This is what makes admin edits appear on the
// frontend — both sides read/write the same API.)
// ============================================

async function loadFromAPI() {
    // Use allSettled so one failing endpoint doesn't discard the other sections
    const results = await Promise.allSettled([
        fetch(`${API_BASE}/profile`),
        fetch(`${API_BASE}/about`),
        fetch(`${API_BASE}/skills`),
        fetch(`${API_BASE}/projects`)
    ]);

    if (results.every(r => r.status === 'rejected')) {
        console.warn('⚠️ Backend not reachable — showing built-in data.');
    }

    const profile = results[0].status === 'fulfilled' ? (await results[0].value.json()).data : null;
    const about = results[1].status === 'fulfilled' ? (await results[1].value.json()).data : null;
    const skills = results[2].status === 'fulfilled' ? (await results[2].value.json()).data : null;
    const projects = results[3].status === 'fulfilled' ? (await results[3].value.json()).data : null;

    applyProfile(profile);
    applyAbout(about);
    renderSkills(skills);
    renderProjects(projects);

    // Re-run the bar animation now that the skill bars exist
    setTimeout(animateSkillBars, 300);
}

// Escape HTML special characters in admin-provided text (prevents XSS)
function escapeHTML(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Apply profile data to the home section, contact info and footer
function applyProfile(profile) {
    if (!profile) return;

    const navName = document.querySelector('.logo');
    const homeName = document.querySelector('#home .home-text h1');
    const homeRole = document.querySelector('.multiple-text');
    const homeBio = document.querySelector('#home .home-text p');
    const homeImage = document.querySelector('.home-image img');

    if (navName && profile.name) navName.textContent = profile.name;
    if (homeName && profile.name) homeName.textContent = profile.name;
    if (homeRole && profile.title) homeRole.textContent = profile.title;
    if (homeBio && profile.bio) homeBio.textContent = profile.bio;

    // Keep the typing effect in sync with the admin-edited title
    if (profile.title) roles[0] = profile.title;

    if (homeImage && profile.profileImage) {
        homeImage.src = profile.profileImage;
        homeImage.onerror = function () {
            this.src = 'image/Home.jpg';
            this.onerror = null;
        };
    }

    // Contact info (email, phone, location)
    const contactItems = document.querySelectorAll('.contact-item p');
    if (contactItems.length >= 3) {
        if (profile.email) contactItems[0].textContent = profile.email;
        if (profile.phone) contactItems[1].textContent = profile.phone;
        if (profile.location) contactItems[2].textContent = profile.location;
    }

    // Footer social links (linkedin, github)
    const socialLinks = document.querySelectorAll('.footer-social a');
    if (socialLinks.length >= 2) {
        if (profile.linkedin) socialLinks[0].href = profile.linkedin;
        if (profile.github) socialLinks[1].href = profile.github;
    }
}

// Apply about data to the about section
function applyAbout(about) {
    if (!about) return;

    const aboutTitle = document.querySelector('#about .section-title');
    const aboutDesc = document.querySelector('#about .about-text p');
    const aboutImage = document.querySelector('#about .about-image img');

    if (aboutTitle && about.title) aboutTitle.textContent = about.title;
    if (aboutDesc && about.description) aboutDesc.textContent = about.description;

    if (aboutImage && about.image) {
        aboutImage.src = about.image;
        aboutImage.onerror = function () {
            this.src = 'image/About.jpg';
            this.onerror = null;
        };
    }
}

// Render skills grouped by category (from the backend or fallback)
function renderSkills(skillsData) {
    const container = document.querySelector('.skills-content');
    if (!container) return;

    const skillsList = skillsData || FALLBACK_SKILLS;

    if (skillsList.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">No skills added yet</p>';
        return;
    }

    const groups = {};
    skillsList.forEach(skill => {
        if (!groups[skill.category]) groups[skill.category] = [];
        groups[skill.category].push(skill);
    });

    container.innerHTML = Object.entries(groups).map(([category, items]) => {
        const cat = category.toLowerCase();
        const icon = cat.includes('front') ? 'fa-code'
            : cat.includes('back') ? 'fa-server'
            : cat.includes('tool') ? 'fa-tools'
            : 'fa-star';

        return `
            <div class="skill-category">
                <h3><i class="fas ${icon}"></i> ${escapeHTML(category)}</h3>
                <div class="skill-items">
                    ${items.map(skill => `
                        <div class="skill-item">
                            <span>${escapeHTML(skill.name)}</span>
                            <div class="skill-bar">
                                <div class="skill-progress" style="width: ${escapeHTML(skill.level)}%;">${escapeHTML(skill.level)}%</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// TYPING EFFECT
// ============================================
const typingText = document.querySelector('.multiple-text');
const roles = ['Web Developer', 'Backend Developer', 'Full Stack Developer'];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
        typingText.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingText.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
    }

    let speed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentRole.length) {
        speed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        speed = 500;
    }

    setTimeout(typeEffect, speed);
}

// ============================================
// THEME TOGGLE - DARK/LIGHT MODE
// ============================================
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle i');

    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        if (themeToggle) {
            themeToggle.className = 'fas fa-moon';
        }
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        if (themeToggle) {
            themeToggle.className = 'fas fa-sun';
        }
        localStorage.setItem('theme', 'dark');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.querySelector('.theme-toggle i');

    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (themeToggle) {
            themeToggle.className = 'fas fa-sun';
        }
    } else {
        document.body.removeAttribute('data-theme');
        if (themeToggle) {
            themeToggle.className = 'fas fa-moon';
        }
    }
}

// ============================================
// MOBILE MENU TOGGLE
// ============================================
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// ============================================
// CONTACT FORM - WITH BACKEND API (UPDATED)
// ============================================
async function handleSubmit(event) {
    event.preventDefault();
    
    // Get form elements
    const form = event.target;
    const nameInput = form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[type="email"]');
    const messageInput = form.querySelector('textarea');
    const submitBtn = form.querySelector('button[type="submit"]');
    const statusDiv = document.getElementById('formStatus') || createStatusDiv(form);
    
    // Get values
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();
    
    // Validate
    if (!name || !email || !message) {
        showStatus('⚠️ Please fill in all fields!', '#dc2626', statusDiv);
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showStatus('⚠️ Please enter a valid email address!', '#dc2626', statusDiv);
        return;
    }
    
    // Show loading
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '⏳ Sending...';
    submitBtn.disabled = true;
    showStatus('⏳ Sending your message...', '#2563eb', statusDiv);
    
    try {
        // Send to backend API
        const response = await fetch(`${API_BASE}/contact/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, message })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showStatus('✅ Message sent successfully! I will get back to you soon.', '#059669', statusDiv);
            form.reset();
            
            // Clear status after 5 seconds
            setTimeout(() => {
                if (statusDiv) statusDiv.textContent = '';
            }, 5000);
        } else {
            showStatus('❌ ' + (data.message || 'Failed to send message. Please try again.'), '#dc2626', statusDiv);
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus('❌ Failed to connect to server. Please try again later.', '#dc2626', statusDiv);
    }
    
    // Reset button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
}

// ============================================
// HELPER FUNCTIONS FOR CONTACT FORM
// ============================================

function createStatusDiv(form) {
    const statusDiv = document.createElement('div');
    statusDiv.id = 'formStatus';
    statusDiv.style.cssText = 'margin-top: 10px; font-weight: 500; min-height: 25px;';
    form.appendChild(statusDiv);
    return statusDiv;
}

function showStatus(message, color, element) {
    if (element) {
        element.textContent = message;
        element.style.color = color;
    }
}

// ============================================
// SMOOTH SCROLL FOR NAV LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
            document.querySelector('.nav-links').classList.remove('active');
        }
    });
});

// ============================================
// SKILL BAR ANIMATION
// ============================================
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
        const position = bar.getBoundingClientRect().top;
        const screenHeight = window.innerHeight;

        if (position < screenHeight) {
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = width;
            }, 200);
        }
    });
}

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    typeEffect();
    loadTheme();
    setTimeout(animateSkillBars, 500);
    window.addEventListener('scroll', animateSkillBars);
    loadFromAPI();
    console.log('✅ Portfolio Loaded!');
    console.log('📧 Content is loaded from the backend API — admin edits appear here.');
});