
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
        tags: ["Next.js", "Tailwind CSS", "TypeScript","nest js","postgreSQL"],
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
        tags: ["React", "Taliwind css", "Typescript"],
        image: "image/project4.jpg"
    },
    {
        id: 5,
        title: "Product Catalog",
        description: "An interactive product catalog with search, filter, and sorting features for easy product discovery.",
        tags: ["React", "Taliwind css", "Typescript"],
        image: "image/project5.jpg"
    },
    {
        id: 6,
        title: "Book Review",
        description: "A book review platform where users can rate, review, and discover new books across different genres.",
        tags: ["React", "Tailwind CSS", "TypeScript", "Node.js","postgreSQL"],
        image: "image/project6.jpg"
    }
];


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
// MOBILE MENU TOGGLE
// ============================================
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// ============================================
// CONTACT FORM HANDLER
// ============================================
function handleSubmit(event) {
    event.preventDefault();
    alert('Thank you for your message! I will get back to you soon.');
    event.target.reset();
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
// SKILL BAR ANIMATION ON SCROLL
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
document.addEventListener('DOMContentLoaded', function() {
    renderProjects();
    typeEffect();
    setTimeout(animateSkillBars, 500);
    window.addEventListener('scroll', animateSkillBars);
    console.log('✅ Portfolio Loaded!');
});