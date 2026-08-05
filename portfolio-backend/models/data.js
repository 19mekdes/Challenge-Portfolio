let profile = {
    id: 1,
    name: "Mekdes Wale",
    title: "Web Developer",
    bio: "Welcome to my portfolio! I'm Mekdes Wale, a passionate web developer specializing in both backend and frontend development.",
    email: "mekdesw60@gmail.com",
    phone: "+25180536095",
    location: "Addis Ababa, Ethiopia",
    github: "https://github.com/19mekdes",
    linkedin: "https://www.linkedin.com/in/mekdes-wale-a25a54396",
    profileImage: "image/mekdi.jpg"
};

let about = {
    id: 1,
    title: "About Me",
    description: "I'm Mekdes Wale, a passionate web developer who loves creating beautiful and functional websites. I enjoy learning new technologies and building projects that solve real problems.",
    experience: "2+ Years",
    education: "Computer Science",
    image: "image/About.jpg"
};


let skills = [
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

let projects = [
    {
        id: 1,
        title: "Dental Clinic Management System",
        description: "A comprehensive dental clinic management system for appointment scheduling, patient records, and treatment tracking.",
        tags: ["React", "CSS", "JavaScript"],
        image: "image/project1.jpg",
        link: "#"
    },
    {
        id: 2,
        title: "CineMatch",
        description: "A movie recommendation system that suggests films based on user preferences and viewing history.",
        tags: ["Next.js", "Tailwind CSS", "TypeScript", "Nest.js", "PostgreSQL"],
        image: "image/project2.jpg",
        link: "#"
    },
    {
        id: 3,
        title: "Cake House",
        description: "An e-commerce platform for ordering custom cakes, pastries, and baked goods with online payment integration.",
        tags: ["React", "Tailwind CSS", "TypeScript"],
        image: "image/project3.jpg",
        link: "#"
    },
    {
        id: 4,
        title: "AlphaLine Engineering Website",
        description: "A professional corporate website for an engineering company showcasing services, projects, and client portfolios.",
        tags: ["React", "Tailwind CSS", "TypeScript"],
        image: "image/project4.jpg",
        link: "#"
    },
    {
        id: 5,
        title: "Product Catalog",
        description: "An interactive product catalog with search, filter, and sorting features for easy product discovery.",
        tags: ["React", "Tailwind CSS", "TypeScript"],
        image: "image/project5.jpg",
        link: "#"
    },
    {
        id: 6,
        title: "Book Review",
        description: "A book review platform where users can rate, review, and discover new books across different genres.",
        tags: ["React", "Tailwind CSS", "TypeScript", "Node.js", "PostgreSQL"],
        image: "image/project6.jpg",
        link: "#"
    }
];

// ===== MESSAGES DATA =====
let messages = [];

// Export all data
module.exports = {
    profile,
    about,
    skills,
    projects,
    messages
};