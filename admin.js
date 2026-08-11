const API_BASE = 'http://localhost:5000/api';

function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem('adminToken', data.token);
                document.getElementById('loginPage').style.display = 'none';
                document.getElementById('adminDashboard').style.display = 'block';
                loadAllData();
            } else {
                errorDiv.textContent = '❌ ' + data.message;
            }
        })
        .catch(() => {
            errorDiv.textContent = '❌ Connection error!';
        });
}

function logout() {
    localStorage.removeItem('adminToken');
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

function getToken() {
    return localStorage.getItem('adminToken');
}

function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': getToken()
    };
}


document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('adminToken');
    if (token) {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        loadAllData();
    }
});


function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

    // Show selected section
    document.getElementById(sectionName + 'Section').classList.add('active');

    // Update sidebar buttons
    document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.sidebar-btn[data-section="${sectionName}"]`).classList.add('active');
}


function loadAllData() {
    loadProfile();
    loadAbout();
    loadSkills();
    loadProjects();
    loadMessages();
}

function loadProfile() {
    fetch(`${API_BASE}/profile`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const p = data.data;
                document.getElementById('pName').value = p.name || '';
                document.getElementById('pTitle').value = p.title || '';
                document.getElementById('pBio').value = p.bio || '';
                document.getElementById('pEmail').value = p.email || '';
                document.getElementById('pPhone').value = p.phone || '';
                document.getElementById('pLocation').value = p.location || '';
                document.getElementById('pGithub').value = p.github || '';
                document.getElementById('pLinkedin').value = p.linkedin || '';
                document.getElementById('pImage').value = p.profileImage || '';
            }
        });
}

function updateProfile(event) {
    event.preventDefault();

    const data = {
        name: document.getElementById('pName').value,
        title: document.getElementById('pTitle').value,
        bio: document.getElementById('pBio').value,
        email: document.getElementById('pEmail').value,
        phone: document.getElementById('pPhone').value,
        location: document.getElementById('pLocation').value,
        github: document.getElementById('pGithub').value,
        linkedin: document.getElementById('pLinkedin').value,
        profileImage: document.getElementById('pImage').value
    };

    fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(data => {
            showStatus('profileStatus', data.message, data.success);
            if (data.success) loadProfile();
        });
}


function loadAbout() {
    fetch(`${API_BASE}/about`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const a = data.data;
                document.getElementById('aTitle').value = a.title || '';
                document.getElementById('aDescription').value = a.description || '';
                document.getElementById('aExperience').value = a.experience || '';
                document.getElementById('aEducation').value = a.education || '';
                document.getElementById('aImage').value = a.image || '';
            }
        });
}

function updateAbout(event) {
    event.preventDefault();

    const data = {
        title: document.getElementById('aTitle').value,
        description: document.getElementById('aDescription').value,
        experience: document.getElementById('aExperience').value,
        education: document.getElementById('aEducation').value,
        image: document.getElementById('aImage').value
    };

    fetch(`${API_BASE}/about`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(data => {
            showStatus('aboutStatus', data.message, data.success);
            if (data.success) loadAbout();
        });
}


function loadSkills() {
    fetch(`${API_BASE}/skills`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                renderSkills(data.data);
            }
        });
}

function renderSkills(skills) {
    const container = document.getElementById('skillsList');

    if (skills.length === 0) {
        container.innerHTML = '<p style="color:#999; text-align:center; padding:20px;">No skills added yet</p>';
        return;
    }

    container.innerHTML = skills.map(skill => `
        <div class="item-card">
            <div class="item-info">
                <h4>${skill.name}</h4>
                <p>Category: ${skill.category} | Level: ${skill.level}%</p>
            </div>
            <div class="item-actions">
                <button onclick="editSkill(${skill.id})" class="btn-edit">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteSkill(${skill.id})" class="btn-delete">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function addSkill(event) {
    event.preventDefault();

    const data = {
        category: document.getElementById('sCategory').value,
        name: document.getElementById('sName').value,
        level: parseInt(document.getElementById('sLevel').value)
    };

    fetch(`${API_BASE}/skills`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(data => {
            showStatus('skillStatus', data.message, data.success);
            if (data.success) {
                document.getElementById('skillForm').reset();
                loadSkills();
            }
        });
}

function deleteSkill(id) {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    fetch(`${API_BASE}/skills/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    })
        .then(res => res.json())
        .then(data => {
            showStatus('skillStatus', data.message, data.success);
            if (data.success) loadSkills();
        });
}

function editSkill(id) {
    // Find the skill
    fetch(`${API_BASE}/skills`)
        .then(res => res.json())
        .then(data => {
            const skill = data.data.find(s => s.id === id);
            if (skill) {
                document.getElementById('sCategory').value = skill.category;
                document.getElementById('sName').value = skill.name;
                document.getElementById('sLevel').value = skill.level;
                // Change button to update
                const form = document.getElementById('skillForm');
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Skill';
                submitBtn.onclick = function (e) {
                    e.preventDefault();
                    updateSkill(id);
                };
            }
        });
}

function updateSkill(id) {
    const data = {
        category: document.getElementById('sCategory').value,
        name: document.getElementById('sName').value,
        level: parseInt(document.getElementById('sLevel').value)
    };

    fetch(`${API_BASE}/skills/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(data => {
            showStatus('skillStatus', data.message, data.success);
            if (data.success) {
                document.getElementById('skillForm').reset();
                // Reset button
                const form = document.getElementById('skillForm');
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Skill';
                submitBtn.onclick = addSkill;
                loadSkills();
            }
        });
}

function loadProjects() {
    fetch(`${API_BASE}/projects`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                renderProjects(data.data);
            }
        });
}

function renderProjects(projects) {
    const container = document.getElementById('projectsList');

    if (projects.length === 0) {
        container.innerHTML = '<p style="color:#999; text-align:center; padding:20px;">No projects added yet</p>';
        return;
    }

    container.innerHTML = projects.map(project => `
        <div class="item-card">
            <div class="item-info">
                <h4>${project.title}</h4>
                <p>${project.description.substring(0, 100)}${project.description.length > 100 ? '...' : ''}</p>
                <div class="item-tags">
                    ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
                </div>
            </div>
            <div class="item-actions">
                <button onclick="editProject(${project.id})" class="btn-edit">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteProject(${project.id})" class="btn-delete">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function addProject(event) {
    event.preventDefault();

    const data = {
        title: document.getElementById('projTitle').value,
        description: document.getElementById('projDescription').value,
        tags: document.getElementById('projTags').value,
        image: document.getElementById('projImage').value || 'image/default.jpg',
        link: document.getElementById('projLink').value || '#'
    };

    fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(data => {
            showStatus('projectStatus', data.message, data.success);
            if (data.success) {
                document.getElementById('projectForm').reset();
                loadProjects();
            }
        });
}

function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;

    fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    })
        .then(res => res.json())
        .then(data => {
            showStatus('projectStatus', data.message, data.success);
            if (data.success) loadProjects();
        });
}

function editProject(id) {
    fetch(`${API_BASE}/projects/${id}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const p = data.data;
                document.getElementById('projTitle').value = p.title;
                document.getElementById('projDescription').value = p.description;
                document.getElementById('projTags').value = p.tags.join(', ');
                document.getElementById('projImage').value = p.image;
                document.getElementById('projLink').value = p.link;

                const form = document.getElementById('projectForm');
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Project';
                submitBtn.onclick = function (e) {
                    e.preventDefault();
                    updateProject(id);
                };
            }
        });
}

function updateProject(id) {
    const data = {
        title: document.getElementById('projTitle').value,
        description: document.getElementById('projDescription').value,
        tags: document.getElementById('projTags').value,
        image: document.getElementById('projImage').value,
        link: document.getElementById('projLink').value
    };

    fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(data => {
            showStatus('projectStatus', data.message, data.success);
            if (data.success) {
                document.getElementById('projectForm').reset();
                const form = document.getElementById('projectForm');
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Project';
                submitBtn.onclick = addProject;
                loadProjects();
            }
        });
}


function loadMessages() {
    fetch(`${API_BASE}/contact/messages`, {
        headers: getHeaders()
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                renderMessages(data.data);
                document.getElementById('messageCount').textContent = data.data.length;
            }
        });
}

function renderMessages(messages) {
    const container = document.getElementById('messagesList');

    if (messages.length === 0) {
        container.innerHTML = '<p style="color:#999; text-align:center; padding:20px;">No messages yet</p>';
        return;
    }

    container.innerHTML = messages.map(msg => `
        <div class="message-card">
            <div class="message-header">
                <div>
                    <strong>${msg.name}</strong> 
                    <span style="color:#999;">&lt;${msg.email}&gt;</span>
                </div>
                <span style="color:#999; font-size:0.8rem;">${new Date(msg.date).toLocaleString()}</span>
            </div>
            <div class="message-body">${msg.message}</div>
            <div class="message-actions">
                <button onclick="deleteMessage(${msg.id})" class="btn-delete-message">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function deleteMessage(id) {
    if (!confirm('Are you sure you want to delete this message?')) return;

    fetch(`${API_BASE}/contact/messages/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    })
        .then(res => res.json())
        .then(data => {
            showStatus('messageStatus', data.message, data.success);
            if (data.success) loadMessages();
        });
}

function showStatus(elementId, message, success) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = 'status-message ' + (success ? 'success' : 'error');
    element.style.display = 'block';

    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}