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
// RENDER PROJECTS
// ============================================
function renderProjects() {
    const grid = document.getElementById('projectGrid');

    grid.innerHTML = projects.map(project => `
        <div class="project-card">
            <img 
                src="${project.image}" 
                alt="${project.title}"
                onerror="this.style.display='none'; this.parentElement.querySelector('.no-image').style.display='flex'"
            >
            <div class="no-image" style="display:none; height:200px; background:#f0f0f0; align-items:center; justify-content:center; flex-direction:column; color:#999; font-size:14px;">
                <i class="fas fa-image" style="font-size:40px; margin-bottom:10px;"></i>
                <span>${project.title}</span>
                <span style="font-size:12px;">No image available</span>
            </div>
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
                </div>
                <a href="#" class="project-link">View Project →</a>
            </div>
        </div>
    `).join('');
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
        const response = await fetch('http://localhost:5000/api/contact/send', {
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
    renderProjects();
    typeEffect();
    loadTheme();
    setTimeout(animateSkillBars, 500);
    window.addEventListener('scroll', animateSkillBars);
    console.log('✅ Portfolio Loaded!');
    console.log('📧 Contact form sends to backend API');
});