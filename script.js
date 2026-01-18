// State Management
let currentUser = null;
let users = JSON.parse(localStorage.getItem('fandrot_users')) || [];
let messages = JSON.parse(localStorage.getItem('fandrot_messages')) || [];
let privateMessages = JSON.parse(localStorage.getItem('fandrot_private_messages')) || [];
let friendships = JSON.parse(localStorage.getItem('fandrot_friendships')) || [];
let activePrivateChat = null;
let unreadPrivateMessages = {};
let viewingUserProfile = null;

// Default users
const DEFAULT_USERS = [
    {
        id: 'admin_1',
        username: 'admin',
        password: 'password123',
        nickname: 'System Administrator',
        bio: 'Head administrator of FanDrot. Ensuring the community stays safe and friendly.',
        interests: ['Security', 'Community', 'Technology', 'Gaming'],
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=9d4edd&color=ffffff&size=300&bold=true',
        banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        joinDate: new Date().toISOString(),
        role: 'admin',
        status: 'online',
        isBanned: false,
        friends: [],
        posts: 42,
        messages: 156
    },
    {
        id: 'moderator_1',
        username: 'moderator',
        password: 'password123',
        nickname: 'Community Moderator',
        bio: 'FanDrot community moderator. Here to help and keep things friendly!',
        interests: ['Community', 'Support', 'Gaming', 'Music'],
        avatar: 'https://ui-avatars.com/api/?name=Moderator&background=4cc9f0&color=ffffff&size=300&bold=true',
        banner: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        joinDate: new Date().toISOString(),
        role: 'moderator',
        status: 'away',
        isBanned: false,
        friends: [],
        posts: 28,
        messages: 89
    },
    {
        id: 'user_1',
        username: 'john_doe',
        password: 'password123',
        nickname: 'John Doe',
        bio: 'Tech enthusiast and gamer. Love exploring new technologies and connecting with like-minded people.',
        interests: ['Programming', 'Gaming', 'AI', 'Music'],
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0099ff&color=ffffff&size=300&bold=true',
        banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        joinDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        role: 'user',
        status: 'online',
        isBanned: false,
        friends: [],
        posts: 15,
        messages: 42
    },
    {
        id: 'user_2',
        username: 'jane_smith',
        password: 'password123',
        nickname: 'Jane Smith',
        bio: 'Digital artist and content creator. Sharing my art and connecting with creative minds.',
        interests: ['Art', 'Design', 'Photography', 'Music'],
        avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=ff4757&color=ffffff&size=300&bold=true',
        banner: 'https://images.unsplash.com/photo-1543857778-c4a1a569e388?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        joinDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        role: 'user',
        status: 'offline',
        isBanned: false,
        friends: [],
        posts: 23,
        messages: 67
    }
];

// Initialize default users
if (users.length === 0) {
    users = [...DEFAULT_USERS];
    localStorage.setItem('fandrot_users', JSON.stringify(users));
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    createFloatingDots();
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('fandrot_currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForUser();
        showSection('forum');
        loadFriendsList();
    }
    
    // Load sample messages if empty
    if (messages.length === 0) {
        addSampleMessages();
    }
    
    // Initialize UI
    setupNavigation();
    setupAllButtonListeners();
    initializeStickers();
    initializeEmojis();
    
    // Show welcome message
    setTimeout(() => {
        if (!currentUser) {
            showNotification('Welcome to FanDrot', 'Join our social community today!', 'info');
        }
    }, 1000);
    
    // Update active users every 10 seconds
    setInterval(updateActiveUsers, 10000);
});

function createFloatingDots() {
    const container = document.getElementById('floatingDots');
    for (let i = 0; i < 100; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.style.left = `${Math.random() * 100}%`;
        dot.style.top = `${Math.random() * 100}%`;
        dot.style.animationDelay = `${Math.random() * 20}s`;
        dot.style.animationDuration = `${20 + Math.random() * 30}s`;
        container.appendChild(dot);
    }
}

function initializeStickers() {
    const stickers = [
        '😀', '😂', '🥰', '😎', '🤔', '😱', '🎉', '🔥', '💯', '🌟',
        '🎨', '🎮', '🎵', '📷', '🎬', '💻', '📱', '🎁', '🏆', '❤️',
        '👍', '👎', '👏', '🙏', '🤝', '💪', '🧠', '💡', '🎯', '⚡'
    ];
    
    const containers = [
        document.getElementById('stickersContainer'),
        document.getElementById('privateStickersContainer')
    ];
    
    containers.forEach(container => {
        stickers.forEach(sticker => {
            const stickerBtn = document.createElement('button');
            stickerBtn.className = 'sticker-btn';
            stickerBtn.innerHTML = `<span style="font-size: 24px;">${sticker}</span>`;
            stickerBtn.addEventListener('click', () => {
                if (container.id === 'stickersContainer') {
                    sendSticker(sticker);
                } else {
                    sendPrivateSticker(sticker);
                }
                document.querySelectorAll('.stickers-container').forEach(c => c.classList.remove('active'));
            });
            container.appendChild(stickerBtn);
        });
    });
}

function initializeEmojis() {
    const emojis = [
        '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
        '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
        '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸',
        '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️',
        '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡',
        '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓'
    ];
    
    const picker = document.getElementById('emojiPicker');
    emojis.forEach(emoji => {
        const emojiBtn = document.createElement('div');
        emojiBtn.className = 'emoji-item';
        emojiBtn.textContent = emoji;
        emojiBtn.addEventListener('click', () => {
            const input = document.getElementById('messageInput');
            input.value += emoji;
            input.focus();
            picker.classList.remove('active');
        });
        picker.appendChild(emojiBtn);
    });
}

function setupAllButtonListeners() {
    // Modal controls
    document.getElementById('loginBtn').addEventListener('click', () => showModal('login'));
    document.getElementById('registerBtn').addEventListener('click', () => showModal('register'));
    document.getElementById('heroRegisterBtn').addEventListener('click', () => showModal('register'));
    document.getElementById('learnMoreBtn').addEventListener('click', () => {
        showNotification('Demo', 'Check out our features and how FanDrot protects your privacy.', 'info');
    });
    
    // Profile actions
    document.getElementById('avatarUploadBtn').addEventListener('click', () => document.getElementById('avatarInput').click());
    document.getElementById('avatarInput').addEventListener('change', handleAvatarUpload);
    document.getElementById('bannerPreview').addEventListener('click', () => document.getElementById('bannerInput').click());
    document.getElementById('bannerInput').addEventListener('change', handleBannerUpload);
    document.getElementById('saveProfileBtn').addEventListener('click', handleSaveProfile);
    document.getElementById('editProfileBtn').addEventListener('click', () => {
        document.getElementById('userBio').focus();
    });
    document.getElementById('changePasswordBtn').addEventListener('click', () => showModal('changePassword'));
    document.getElementById('changeStatusBtn').addEventListener('click', toggleStatus);
    
    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('changePasswordForm').addEventListener('submit', handleChangePassword);
    document.getElementById('messageForm').addEventListener('submit', handleMessageSubmit);
    
    // Search users
    document.getElementById('searchUsersInput').addEventListener('input', searchUsers);
    document.getElementById('searchUsersInput').addEventListener('focus', () => {
        document.getElementById('searchResults').classList.add('active');
    });
    
    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Switch between login/register
    document.getElementById('switchToRegister').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginModal').classList.remove('active');
        document.getElementById('registerModal').classList.add('active');
    });
    
    document.getElementById('switchToLogin').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerModal').classList.remove('active');
        document.getElementById('loginModal').classList.add('active');
    });
    
    // Emoji picker
    document.getElementById('emojiPickerBtn').addEventListener('click', () => {
        document.getElementById('emojiPicker').classList.toggle('active');
    });
    
    // Sticker picker
    document.getElementById('stickerPickerBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('stickersContainer').classList.toggle('active');
    });
    
    document.getElementById('privateStickerPickerBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('privateStickersContainer').classList.toggle('active');
    });
    
    // Close pickers when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sticker-picker-btn') && !e.target.closest('.stickers-container')) {
            document.querySelectorAll('.stickers-container').forEach(c => c.classList.remove('active'));
        }
        if (!e.target.closest('#emojiPickerBtn') && !e.target.closest('#emojiPicker')) {
            document.getElementById('emojiPicker').classList.remove('active');
        }
        if (!e.target.closest('.search-input') && !e.target.closest('#searchResults')) {
            document.getElementById('searchResults').classList.remove('active');
        }
    });
    
    // Private chat
    document.getElementById('sendPrivateMessageBtn').addEventListener('click', sendPrivateMessage);
    document.getElementById('privateMessageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendPrivateMessage();
        }
    });
    document.getElementById('minimizeChat').addEventListener('click', () => {
        document.getElementById('privateChatContainer').classList.remove('active');
    });
}

function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            if (section) {
                showSection(section);
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

function showSection(section) {
    document.querySelectorAll('.main-content').forEach(sec => {
        sec.classList.remove('active');
    });
    
    if (section === 'home') {
        document.getElementById('home').classList.add('active');
    } else if (section === 'profile') {
        if (currentUser) {
            loadProfileData();
            document.getElementById('profile').classList.add('active');
        } else {
            showModal('login');
            document.getElementById('home').classList.add('active');
        }
    } else if (section === 'friends') {
        if (currentUser) {
            loadFriendsList();
            document.getElementById('friends').classList.add('active');
        } else {
            showModal('login');
            document.getElementById('home').classList.add('active');
        }
    } else if (section === 'forum') {
        document.getElementById('forum').classList.add('active');
        loadMessages();
        updateActiveUsers();
    } else if (section === 'adminPanel') {
        if (currentUser && currentUser.role === 'admin') {
            loadAdminPanel();
            document.getElementById('adminPanel').classList.add('active');
        } else {
            showSection('forum');
        }
    }
}

function showModal(modal) {
    document.getElementById(modal + 'Modal').classList.add('active');
}

// Login handler
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        if (user.isBanned) {
            showNotification('Account Banned', 'This account has been suspended.', 'error');
            return;
        }
        
        // Update user status
        user.status = 'online';
        updateUserInStorage(user);
        
        currentUser = user;
        localStorage.setItem('fandrot_currentUser', JSON.stringify(user));
        
        updateUIForUser();
        document.getElementById('loginModal').classList.remove('active');
        showSection('forum');
        loadFriendsList();
        
        showNotification(`Welcome back, ${user.nickname}!`, `You have ${user.role} privileges.`, 'success');
    } else {
        showNotification('Login Failed', 'Invalid username or password.', 'error');
    }
}

// Register handler
function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('Registration Failed', 'Passwords do not match.', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Registration Failed', 'Password must be at least 6 characters.', 'error');
        return;
    }
    
    if (!username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
        showNotification('Registration Failed', 'Username must be 3-20 characters (letters, numbers, underscores).', 'error');
        return;
    }
    
    const usernameExists = users.some(u => u.username === username);
    if (usernameExists) {
        showNotification('Registration Failed', 'Username already taken.', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: generateId(),
        username: username,
        password: password,
        nickname: username,
        bio: '',
        interests: [],
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=0099ff&color=ffffff&size=300&bold=true`,
        banner: '',
        joinDate: new Date().toISOString(),
        role: 'user',
        status: 'online',
        isBanned: false,
        friends: [],
        posts: 0,
        messages: 0
    };
    
    users.push(newUser);
    localStorage.setItem('fandrot_users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('fandrot_currentUser', JSON.stringify(currentUser));
    
    updateUIForUser();
    document.getElementById('registerModal').classList.remove('active');
    showSection('forum');
    loadFriendsList();
    
    showNotification('Welcome to FanDrot!', 'Your account has been created successfully.', 'success');
}

function toggleStatus() {
    if (!currentUser) return;
    
    const statuses = ['online', 'away', 'offline'];
    const currentIndex = statuses.indexOf(currentUser.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    currentUser.status = nextStatus;
    updateCurrentUser();
    
    const btn = document.getElementById('changeStatusBtn');
    btn.innerHTML = `<i class="fas fa-circle"></i> ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`;
    
    showNotification('Status Updated', `You are now ${nextStatus}.`, 'info');
}

function updateUIForUser() {
    if (!currentUser) return;
    
    loadProfileData();
    updateRoleBadge();
    
    // Update navigation
    const navActions = document.querySelector('.nav-actions');
    navActions.innerHTML = `
        <button class="btn btn-outline btn-small" id="profileNavBtn">
            <i class="fas fa-user"></i> Profile
        </button>
        <button class="btn btn-primary btn-small" id="forumNavBtn">
            <i class="fas fa-comments"></i> Forum
        </button>
        ${currentUser.role === 'admin' ? 
            `<button class="btn btn-admin btn-small" id="adminNavBtn">
                <i class="fas fa-crown"></i> Admin
            </button>` : ''
        }
        <button class="btn btn-danger btn-small" id="logoutBtn">
            <i class="fas fa-sign-out-alt"></i> Logout
        </button>
    `;
    
    // Show/hide admin panel link
    if (currentUser.role === 'admin') {
        document.getElementById('adminPanelLink').style.display = 'block';
    }
    
    // Add new button listeners
    document.getElementById('profileNavBtn').addEventListener('click', () => {
        showSection('profile');
        updateNavActive('profile');
    });
    document.getElementById('forumNavBtn').addEventListener('click', () => {
        showSection('forum');
        updateNavActive('forum');
    });
    if (currentUser.role === 'admin') {
        document.getElementById('adminNavBtn').addEventListener('click', () => {
            showSection('adminPanel');
            loadAdminPanel();
        });
    }
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Update status button
    const statusBtn = document.getElementById('changeStatusBtn');
    statusBtn.innerHTML = `<i class="fas fa-circle"></i> ${currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1)}`;
}

function loadProfileData() {
    if (!currentUser) return;
    
    // Basic info
    document.getElementById('displayName').textContent = currentUser.nickname;
    document.getElementById('usernameDisplay').textContent = '@' + currentUser.username;
    document.getElementById('permanentUsername').value = '@' + currentUser.username;
    document.getElementById('nickname').value = currentUser.nickname;
    document.getElementById('userBio').value = currentUser.bio || '';
    document.getElementById('userInterests').value = currentUser.interests ? currentUser.interests.join(', ') : '';
    
    // Avatar and banner
    document.getElementById('avatarImg').src = currentUser.avatar;
    if (currentUser.banner) {
        document.getElementById('profileBanner').style.backgroundImage = `url('${currentUser.banner}')`;
        document.getElementById('bannerPreview').innerHTML = `<img src="${currentUser.banner}" alt="Banner">`;
    }
    
    // Stats
    document.getElementById('postsCount').textContent = currentUser.posts || 0;
    document.getElementById('friendsCount').textContent = currentUser.friends ? currentUser.friends.length : 0;
    document.getElementById('messagesCount').textContent = currentUser.messages || 0;
    
    // Join date
    const joinDate = new Date(currentUser.joinDate);
    const daysSinceJoin = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
    document.getElementById('joinedDays').textContent = daysSinceJoin + 1;
    document.getElementById('joinDate').textContent = joinDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric',
        day: 'numeric'
    });
    
    // Status
    document.getElementById('userStatus').textContent = currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1);
    const statusIndicator = document.querySelector('.status-indicator');
    statusIndicator.className = 'status-indicator';
    statusIndicator.classList.add(currentUser.status);
    
    updateRoleBadge();
}

function updateRoleBadge() {
    if (!currentUser) return;
    
    const roleBadge = document.getElementById('roleBadge');
    roleBadge.className = 'role-badge';
    roleBadge.innerHTML = '';
    
    if (currentUser.isBanned) {
        roleBadge.className = 'role-badge role-banned';
        roleBadge.innerHTML = '<i class="fas fa-ban"></i> Banned';
    } else if (currentUser.role === 'admin') {
        roleBadge.className = 'role-badge role-admin';
        roleBadge.innerHTML = '<i class="fas fa-crown"></i> Administrator';
    } else if (currentUser.role === 'moderator') {
        roleBadge.className = 'role-badge role-moderator';
        roleBadge.innerHTML = '<i class="fas fa-shield-alt"></i> Moderator';
    } else {
        roleBadge.className = 'role-badge role-user';
        roleBadge.innerHTML = '<i class="fas fa-user"></i> User';
    }
}

function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Upload Failed', 'Image must be less than 5MB.', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            currentUser.avatar = event.target.result;
            updateCurrentUser();
            document.getElementById('avatarImg').src = event.target.result;
            showNotification('Avatar Updated', 'Your profile picture has been changed.', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function handleBannerUpload(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) {
            showNotification('Upload Failed', 'Banner must be less than 10MB.', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            currentUser.banner = event.target.result;
            updateCurrentUser();
            document.getElementById('profileBanner').style.backgroundImage = `url('${event.target.result}')`;
            document.getElementById('bannerPreview').innerHTML = `<img src="${event.target.result}" alt="Banner">`;
            showNotification('Banner Updated', 'Your profile banner has been changed.', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function handleSaveProfile() {
    if (!currentUser) return;
    
    const nickname = document.getElementById('nickname').value.trim();
    const bio = document.getElementById('userBio').value.trim();
    const interests = document.getElementById('userInterests').value.split(',').map(i => i.trim()).filter(i => i);
    
    if (nickname) {
        currentUser.nickname = nickname;
        currentUser.bio = bio;
        currentUser.interests = interests;
        updateCurrentUser();
        
        document.getElementById('displayName').textContent = nickname;
        showNotification('Profile Saved', 'Your changes have been updated.', 'success');
    }
}

function handleChangePassword(e) {
    e.preventDefault();
    
    const currentPass = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmNewPassword').value;
    
    if (!currentPass || !newPass || !confirmPass) {
        showNotification('Error', 'Please fill in all fields.', 'error');
        return;
    }
    
    if (currentPass !== currentUser.password) {
        showNotification('Error', 'Current password is incorrect.', 'error');
        return;
    }
    
    if (newPass !== confirmPass) {
        showNotification('Error', 'New passwords do not match.', 'error');
        return;
    }
    
    if (newPass.length < 6) {
        showNotification('Error', 'New password must be at least 6 characters.', 'error');
        return;
    }
    
    currentUser.password = newPass;
    updateCurrentUser();
    
    document.getElementById('changePasswordModal').classList.remove('active');
    document.getElementById('changePasswordForm').reset();
    showNotification('Password Changed', 'Your password has been updated successfully.', 'success');
}

function updateCurrentUser() {
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('fandrot_users', JSON.stringify(users));
        localStorage.setItem('fandrot_currentUser', JSON.stringify(currentUser));
    }
}

function updateUserInStorage(user) {
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        users[userIndex] = user;
        localStorage.setItem('fandrot_users', JSON.stringify(user));
    }
}

function logout() {
    if (currentUser) {
        currentUser.status = 'offline';
        updateCurrentUser();
    }
    
    currentUser = null;
    localStorage.removeItem('fandrot_currentUser');
    activePrivateChat = null;
    document.getElementById('privateChatContainer').classList.remove('active');
    
    // Reset navigation
    const navActions = document.querySelector('.nav-actions');
    navActions.innerHTML = `
        <button class="btn btn-outline btn-small" id="loginBtn">
            <i class="fas fa-sign-in-alt"></i> Log in
        </button>
        <button class="btn btn-primary btn-small" id="registerBtn">
            <i class="fas fa-user-plus"></i> Sign Up
        </button>
    `;
    
    // Hide admin panel link
    document.getElementById('adminPanelLink').style.display = 'none';
    
    // Reattach listeners
    document.getElementById('loginBtn').addEventListener('click', () => showModal('login'));
    document.getElementById('registerBtn').addEventListener('click', () => showModal('register'));
    
    showSection('home');
    showNotification('Logged Out', 'You have been securely logged out.', 'info');
}

function searchUsers() {
    const query = document.getElementById('searchUsersInput').value.toLowerCase();
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';
    
    if (!query.trim()) {
        resultsContainer.innerHTML = '<div class="search-result-item">Start typing to search users...</div>';
        return;
    }
    
    const filteredUsers = users.filter(user => 
        user.id !== currentUser?.id &&
        !user.isBanned &&
        (user.username.toLowerCase().includes(query) || 
         (user.nickname && user.nickname.toLowerCase().includes(query)))
    );
    
    if (filteredUsers.length === 0) {
        resultsContainer.innerHTML = '<div class="search-result-item">No users found</div>';
    } else {
        filteredUsers.forEach(user => {
            const isFriend = currentUser?.friends?.includes(user.id);
            
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <img src="${user.avatar}" alt="Avatar" class="search-result-avatar">
                <div class="search-result-info">
                    <div class="search-result-name">${user.nickname}</div>
                    <div class="search-result-username">@${user.username}</div>
                    <div class="online-status">
                        <span class="status-dot ${user.status}"></span>
                        <span>${user.status}</span>
                        ${isFriend ? '<span class="badge badge-success">Friend</span>' : ''}
                    </div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                showUserProfile(user);
                resultsContainer.classList.remove('active');
                document.getElementById('searchUsersInput').value = '';
            });
            
            resultsContainer.appendChild(item);
        });
    }
}

function showUserProfile(user) {
    viewingUserProfile = user;
    const modal = document.getElementById('userProfileModal');
    
    // Set user data
    document.getElementById('modalName').textContent = user.nickname;
    document.getElementById('modalUsername').textContent = '@' + user.username;
    document.getElementById('modalBio').textContent = user.bio || 'No bio provided';
    document.getElementById('modalAvatar').src = user.avatar;
    
    // Set banner
    const bannerImg = document.getElementById('modalBanner');
    if (user.banner) {
        bannerImg.src = user.banner;
        bannerImg.style.display = 'block';
    } else {
        bannerImg.style.display = 'none';
    }
    
    // Set role badge
    const roleBadge = document.getElementById('modalRoleBadge');
    roleBadge.className = 'role-badge';
    if (user.isBanned) {
        roleBadge.className = 'role-badge role-banned';
        roleBadge.innerHTML = '<i class="fas fa-ban"></i> Banned';
    } else if (user.role === 'admin') {
        roleBadge.className = 'role-badge role-admin';
        roleBadge.innerHTML = '<i class="fas fa-crown"></i> Administrator';
    } else if (user.role === 'moderator') {
        roleBadge.className = 'role-badge role-moderator';
        roleBadge.innerHTML = '<i class="fas fa-shield-alt"></i> Moderator';
    } else {
        roleBadge.className = 'role-badge role-user';
        roleBadge.innerHTML = '<i class="fas fa-user"></i> User';
    }
    
    // Set status
    const statusElement = document.getElementById('modalStatus');
    statusElement.querySelector('.status-dot').className = `status-dot ${user.status}`;
    statusElement.querySelector('span:last-child').textContent = user.status.charAt(0).toUpperCase() + user.status.slice(1);
    
    // Set stats
    const joinDate = new Date(user.joinDate);
    const daysSinceJoin = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
    
    document.getElementById('modalPosts').textContent = user.posts || 0;
    document.getElementById('modalFriends').textContent = user.friends ? user.friends.length : 0;
    document.getElementById('modalJoined').textContent = daysSinceJoin + 1;
    
    // Set interests
    const interestsContainer = document.getElementById('modalInterests');
    if (user.interests && user.interests.length > 0) {
        interestsContainer.innerHTML = `
            <strong>Interests:</strong>
            <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px;">
                ${user.interests.map(interest => 
                    `<span class="badge badge-primary">${interest}</span>`
                ).join('')}
            </div>
        `;
    } else {
        interestsContainer.innerHTML = '';
    }
    
    // Set actions
    const actionsContainer = document.getElementById('modalActions');
    actionsContainer.innerHTML = '';
    
    if (currentUser && user.id !== currentUser.id) {
        const isFriend = currentUser.friends?.includes(user.id);
        const isAdmin = currentUser.role === 'admin';
        
        if (isFriend) {
            // Already friends
            actionsContainer.innerHTML = `
                <button class="btn btn-primary" id="modalChatBtn">
                    <i class="fas fa-comment"></i> Message
                </button>
                <button class="btn btn-danger" id="modalRemoveFriendBtn">
                    <i class="fas fa-user-times"></i> Remove Friend
                </button>
            `;
            
            document.getElementById('modalChatBtn').addEventListener('click', () => {
                openPrivateChat(user);
                modal.classList.remove('active');
            });
            
            document.getElementById('modalRemoveFriendBtn').addEventListener('click', () => {
                if (confirm(`Remove ${user.nickname} from your friends?`)) {
                    removeFriend(user.id);
                    modal.classList.remove('active');
                }
            });
        } else {
            // Not friends yet
            actionsContainer.innerHTML = `
                <button class="btn btn-success" id="modalAddFriendBtn">
                    <i class="fas fa-user-plus"></i> Add Friend
                </button>
                <button class="btn btn-outline" id="modalMessageBtn">
                    <i class="fas fa-comment"></i> Message
                </button>
            `;
            
            document.getElementById('modalAddFriendBtn').addEventListener('click', () => {
                addFriend(user.id);
                modal.classList.remove('active');
            });
            
            document.getElementById('modalMessageBtn').addEventListener('click', () => {
                openPrivateChat(user);
                modal.classList.remove('active');
            });
        }
        
        // Admin actions
        if (isAdmin) {
            const adminActions = document.createElement('div');
            adminActions.style.marginTop = '15px';
            adminActions.innerHTML = `
                <button class="btn btn-warning btn-small" id="modalBanBtn">
                    <i class="fas fa-ban"></i> ${user.isBanned ? 'Unban' : 'Ban'}
                </button>
                <button class="btn btn-danger btn-small" id="modalDeleteBtn">
                    <i class="fas fa-trash"></i> Delete
                </button>
            `;
            
            actionsContainer.appendChild(adminActions);
            
            document.getElementById('modalBanBtn').addEventListener('click', () => {
                toggleBanUser(user.id);
                modal.classList.remove('active');
            });
            
            document.getElementById('modalDeleteBtn').addEventListener('click', () => {
                if (confirm(`Delete user ${user.username}? This action cannot be undone.`)) {
                    deleteUser(user.id);
                    modal.classList.remove('active');
                }
            });
        }
    } else if (currentUser && user.id === currentUser.id) {
        actionsContainer.innerHTML = `
            <button class="btn btn-outline" style="width: 100%;">
                <i class="fas fa-user"></i> This is you
            </button>
        `;
    }
    
    modal.classList.add('active');
}

function openUserProfile(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        showUserProfile(user);
    }
}

function loadFriendsList() {
    if (!currentUser) return;
    
    const friendsGrid = document.getElementById('friendsGrid');
    friendsGrid.innerHTML = '';
    
    const userFriends = currentUser.friends || [];
    
    if (userFriends.length === 0) {
        friendsGrid.innerHTML = `
            <div style="text-align: center; color: var(--gray); padding: 60px 20px; grid-column: 1 / -1;">
                <i class="fas fa-user-friends" style="font-size: 72px; margin-bottom: 20px; color: var(--primary); opacity: 0.5;"></i>
                <h3 style="color: var(--primary); margin-bottom: 15px;">No friends yet</h3>
                <p>Search for users above and add them as friends to start chatting!</p>
            </div>
        `;
        return;
    }
    
    userFriends.forEach(friendId => {
        const friend = users.find(u => u.id === friendId);
        if (!friend) return;
        
        const friendCard = document.createElement('div');
        friendCard.className = `friend-card ${friend.status}`;
        friendCard.innerHTML = `
            <img src="${friend.avatar}" alt="Avatar" class="friend-avatar">
            <div class="friend-info">
                <h4>${friend.nickname}</h4>
                <span class="friend-username">@${friend.username}</span>
                <div class="friend-status status-${friend.status}">
                    <i class="fas fa-circle"></i> ${friend.status}
                </div>
                <div class="friend-actions">
                    <button class="btn btn-primary btn-small chat-friend-btn" data-friend-id="${friend.id}">
                        <i class="fas fa-comment"></i> Chat
                    </button>
                    <button class="btn btn-danger btn-small remove-friend-btn" data-friend-id="${friend.id}">
                        <i class="fas fa-user-times"></i> Remove
                    </button>
                </div>
            </div>
        `;
        
        // Add click event to open profile
        friendCard.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                showUserProfile(friend);
            }
        });
        
        friendsGrid.appendChild(friendCard);
        
        // Add button listeners
        friendCard.querySelector('.chat-friend-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openPrivateChat(friend);
        });
        
        friendCard.querySelector('.remove-friend-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Remove ${friend.nickname} from your friends?`)) {
                removeFriend(friend.id);
            }
        });
    });
    
    updateChatTabs();
}

function addFriend(friendId) {
    if (!currentUser) return;
    
    // Check if already friends
    if (currentUser.friends?.includes(friendId)) {
        showNotification('Already Friends', 'This user is already in your friends list.', 'info');
        return;
    }
    
    // Add to current user's friends
    if (!currentUser.friends) currentUser.friends = [];
    currentUser.friends.push(friendId);
    
    // Add to other user's friends (if they exist in storage)
    const friendUser = users.find(u => u.id === friendId);
    if (friendUser) {
        if (!friendUser.friends) friendUser.friends = [];
        if (!friendUser.friends.includes(currentUser.id)) {
            friendUser.friends.push(currentUser.id);
            updateUserInStorage(friendUser);
        }
    }
    
    updateCurrentUser();
    loadFriendsList();
    
    showNotification('Friend Added', 'User has been added to your friends list.', 'success');
}

function removeFriend(friendId) {
    if (!currentUser) return;
    
    // Remove from current user's friends
    if (currentUser.friends) {
        currentUser.friends = currentUser.friends.filter(id => id !== friendId);
    }
    
    // Remove from other user's friends
    const friendUser = users.find(u => u.id === friendId);
    if (friendUser && friendUser.friends) {
        friendUser.friends = friendUser.friends.filter(id => id !== currentUser.id);
        updateUserInStorage(friendUser);
    }
    
    updateCurrentUser();
    loadFriendsList();
    
    showNotification('Friend Removed', 'User has been removed from your friends list.', 'info');
}

function openPrivateChat(friend) {
    if (!currentUser || !friend) return;
    
    activePrivateChat = friend;
    const chatContainer = document.getElementById('privateChatContainer');
    chatContainer.classList.add('active');
    
    document.getElementById('privateChatTitle').textContent = friend.nickname;
    
    // Update status
    const statusElement = document.getElementById('privateChatStatus');
    statusElement.querySelector('.status-dot').className = `status-dot ${friend.status}`;
    statusElement.querySelector('span:last-child').textContent = friend.status.charAt(0).toUpperCase() + friend.status.slice(1);
    
    loadPrivateMessages(friend.id);
    updateChatTabs();
    
    // Clear unread count
    delete unreadPrivateMessages[friend.id];
    updateNotificationBadge();
}

function loadPrivateMessages(friendId) {
    const messagesContainer = document.getElementById('privateChatMessages');
    messagesContainer.innerHTML = '';
    
    const privateChatMessages = privateMessages.filter(msg => 
        (msg.senderId === currentUser.id && msg.receiverId === friendId) ||
        (msg.senderId === friendId && msg.receiverId === currentUser.id)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    if (privateChatMessages.length === 0) {
        messagesContainer.innerHTML = `
            <div style="text-align: center; color: var(--gray); padding: 60px 20px;">
                <i class="fas fa-comment-slash" style="font-size: 60px; margin-bottom: 20px; color: var(--primary); opacity: 0.5;"></i>
                <h3 style="color: var(--primary); margin-bottom: 10px;">Start a conversation</h3>
                <p>Send your first message to ${activePrivateChat.nickname}</p>
            </div>
        `;
        return;
    }
    
    privateChatMessages.forEach(message => {
        const isCurrentUser = message.senderId === currentUser.id;
        const sender = users.find(u => u.id === message.senderId);
        
        if (!sender) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = 'message';
        messageEl.style.background = isCurrentUser ? 'rgba(0, 153, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)';
        messageEl.style.marginLeft = isCurrentUser ? 'auto' : '0';
        messageEl.style.marginRight = isCurrentUser ? '0' : 'auto';
        messageEl.style.maxWidth = '80%';
        
        const time = new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        let contentHTML = '';
        if (message.sticker) {
            contentHTML = `<div style="font-size: 48px; text-align: center;">${message.sticker}</div>`;
        } else {
            contentHTML = `<div class="message-text">${message.text || ''}</div>`;
        }
        
        messageEl.innerHTML = `
            <img src="${sender.avatar}" alt="Avatar" class="message-avatar" style="cursor: pointer;" onclick="openUserProfile('${sender.id}')">
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender" style="cursor: pointer;" onclick="openUserProfile('${sender.id}')">
                        ${isCurrentUser ? 'You' : sender.nickname}
                    </span>
                    <span class="message-time">${time}</span>
                </div>
                ${contentHTML}
            </div>
        `;
        
        messagesContainer.appendChild(messageEl);
    });
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendPrivateMessage() {
    if (!currentUser || !activePrivateChat) return;
    
    const input = document.getElementById('privateMessageInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    const message = {
        id: generateId(),
        senderId: currentUser.id,
        receiverId: activePrivateChat.id,
        text: text,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    privateMessages.push(message);
    localStorage.setItem('fandrot_private_messages', JSON.stringify(privateMessages));
    
    // Update unread count
    if (!unreadPrivateMessages[activePrivateChat.id]) {
        unreadPrivateMessages[activePrivateChat.id] = 0;
    }
    
    input.value = '';
    loadPrivateMessages(activePrivateChat.id);
    updateChatTabs();
    updateNotificationBadge();
}

function sendPrivateSticker(sticker) {
    if (!currentUser || !activePrivateChat) return;
    
    const message = {
        id: generateId(),
        senderId: currentUser.id,
        receiverId: activePrivateChat.id,
        sticker: sticker,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    privateMessages.push(message);
    localStorage.setItem('fandrot_private_messages', JSON.stringify(privateMessages));
    
    // Update unread count
    if (!unreadPrivateMessages[activePrivateChat.id]) {
        unreadPrivateMessages[activePrivateChat.id] = 0;
    }
    
    loadPrivateMessages(activePrivateChat.id);
    updateChatTabs();
    updateNotificationBadge();
}

function updateChatTabs() {
    if (!currentUser) return;
    
    const chatTabs = document.getElementById('chatTabs');
    chatTabs.innerHTML = '';
    
    const userFriends = currentUser.friends || [];
    
    userFriends.forEach(friendId => {
        const friend = users.find(u => u.id === friendId);
        if (!friend) return;
        
        const unreadCount = unreadPrivateMessages[friend.id] || 0;
        
        const tab = document.createElement('button');
        tab.className = 'chat-tab';
        if (activePrivateChat && activePrivateChat.id === friend.id) {
            tab.classList.add('active');
        }
        tab.innerHTML = `
            <img src="${friend.avatar}" alt="Avatar" style="width: 20px; height: 20px; border-radius: 50%;">
            ${friend.nickname}
            ${unreadCount > 0 ? `<span class="unread-count">${unreadCount}</span>` : ''}
        `;
        tab.addEventListener('click', () => {
            openPrivateChat(friend);
        });
        chatTabs.appendChild(tab);
    });
}

function updateNotificationBadge() {
    const totalUnread = Object.values(unreadPrivateMessages).reduce((sum, count) => sum + count, 0);
    const badge = document.getElementById('friendsNotification');
    badge.textContent = totalUnread;
    
    if (totalUnread > 0) {
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

// Forum functions
function loadMessages(tab = 'general') {
    const filteredMessages = messages.filter(msg => msg.tab === tab && !msg.deleted);
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = '';
    
    if (filteredMessages.length === 0) {
        messagesContainer.innerHTML = `
            <div style="text-align: center; color: var(--gray); padding: 60px 20px;">
                <i class="fas fa-comment-slash" style="font-size: 60px; margin-bottom: 20px; color: var(--primary); opacity: 0.5;"></i>
                <h3 style="color: var(--primary); margin-bottom: 10px;">No messages yet</h3>
                <p>Be the first to start a conversation in this channel</p>
            </div>
        `;
    } else {
        filteredMessages.forEach(message => addForumMessageToUI(message, false));
    }
    
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

function addForumMessageToUI(message, isNew = false) {
    const existingMessage = document.querySelector(`[data-message-id="${message.id}"]`);
    if (existingMessage && !isNew) return;
    
    const sender = users.find(u => u.id === message.userId);
    if (!sender) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    if (isNew) {
        messageEl.style.animation = 'fadeIn 0.3s ease';
    }
    messageEl.dataset.messageId = message.id;
    
    if (message.deleted) {
        messageEl.classList.add('deleted');
    }
    
    const time = new Date(message.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    const date = new Date(message.timestamp).toLocaleDateString();
    
    let contentHTML = '';
    if (message.sticker) {
        contentHTML = `<div style="font-size: 48px; text-align: center;">${message.sticker}</div>`;
    } else {
        // Process mentions
        let processedText = message.text || '';
        const mentionRegex = /@(\w+)/g;
        processedText = processedText.replace(mentionRegex, (match, username) => {
            const mentionedUser = users.find(u => u.username === username);
            if (mentionedUser) {
                return `<span class="user-mention" onclick="openUserProfile('${mentionedUser.id}')">@${username}</span>`;
            }
            return match;
        });
        
        contentHTML = `<div class="message-text">${processedText}</div>`;
    }
    
    const canDelete = currentUser && 
        (currentUser.role === 'admin' || 
         currentUser.role === 'moderator' || 
         currentUser.id === message.userId);
    
    const deleteButton = canDelete ? `
        <div class="message-actions">
            <button class="btn btn-danger btn-very-small delete-message-btn" data-message-id="${message.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    ` : '';
    
    messageEl.innerHTML = `
        <img src="${sender.avatar}" alt="Avatar" class="message-avatar" onclick="openUserProfile('${sender.id}')">
        <div class="message-content">
            <div class="message-header">
                <span class="message-sender" onclick="openUserProfile('${sender.id}')">
                    ${sender.nickname}
                </span>
                <span class="message-time">${date} ${time}</span>
            </div>
            ${contentHTML}
        </div>
        ${deleteButton}
    `;
    
    document.getElementById('messagesContainer').appendChild(messageEl);
    
    if (canDelete) {
        const deleteBtn = messageEl.querySelector('.delete-message-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Delete this message?')) {
                deleteMessage(message.id);
            }
        });
    }
}

function handleMessageSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showModal('login');
        return;
    }
    
    if (currentUser.isBanned) {
        showNotification('Account Banned', 'You cannot send messages while banned.', 'error');
        return;
    }
    
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text) {
        showNotification('Empty Message', 'Please enter a message.', 'warning');
        return;
    }
    
    const message = {
        id: generateId(),
        userId: currentUser.id,
        username: currentUser.username,
        nickname: currentUser.nickname,
        avatar: currentUser.avatar,
        text: text,
        timestamp: new Date().toISOString(),
        tab: 'general',
        deleted: false
    };
    
    messages.push(message);
    localStorage.setItem('fandrot_messages', JSON.stringify(messages));
    
    // Update user's post count
    currentUser.posts = (currentUser.posts || 0) + 1;
    updateCurrentUser();
    
    input.value = '';
    addForumMessageToUI(message, true);
    document.getElementById('messagesContainer').scrollTop = document.getElementById('messagesContainer').scrollHeight;
    
    showNotification('Message Sent', 'Your message has been posted.', 'success');
}

function sendSticker(sticker) {
    if (!currentUser) {
        showModal('login');
        return;
    }
    
    if (currentUser.isBanned) {
        showNotification('Account Banned', 'You cannot send messages while banned.', 'error');
        return;
    }
    
    const message = {
        id: generateId(),
        userId: currentUser.id,
        username: currentUser.username,
        nickname: currentUser.nickname,
        avatar: currentUser.avatar,
        sticker: sticker,
        timestamp: new Date().toISOString(),
        tab: 'general',
        deleted: false
    };
    
    messages.push(message);
    localStorage.setItem('fandrot_messages', JSON.stringify(messages));
    
    // Update user's post count
    currentUser.posts = (currentUser.posts || 0) + 1;
    updateCurrentUser();
    
    addForumMessageToUI(message, true);
    document.getElementById('messagesContainer').scrollTop = document.getElementById('messagesContainer').scrollHeight;
    
    showNotification('Sticker Sent', 'Your sticker has been posted.', 'success');
}

function deleteMessage(messageId) {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    
    messages[messageIndex].deleted = true;
    messages[messageIndex].deletedBy = currentUser.nickname;
    messages[messageIndex].deletedAt = new Date().toISOString();
    
    localStorage.setItem('fandrot_messages', JSON.stringify(messages));
    
    loadMessages('general');
    showNotification('Message Deleted', 'The message has been removed.', 'info');
}

function updateActiveUsers() {
    const activeUsersContainer = document.getElementById('activeUsers');
    if (!activeUsersContainer) return;
    
    const onlineUsers = users.filter(u => u.status === 'online' && !u.isBanned);
    
    activeUsersContainer.innerHTML = '';
    
    if (onlineUsers.length === 0) {
        activeUsersContainer.innerHTML = '<p style="color: var(--gray);">No users online</p>';
        return;
    }
    
    onlineUsers.slice(0, 5).forEach(user => {
        const userEl = document.createElement('div');
        userEl.style.display = 'flex';
        userEl.style.alignItems = 'center';
        userEl.style.gap = '10px';
        userEl.style.marginBottom = '10px';
        userEl.style.cursor = 'pointer';
        userEl.addEventListener('click', () => openUserProfile(user.id));
        
        userEl.innerHTML = `
            <img src="${user.avatar}" alt="Avatar" style="width: 30px; height: 30px; border-radius: 50%; border: 2px solid var(--success);">
            <div>
                <div style="font-size: 13px; font-weight: 500;">${user.nickname}</div>
                <div style="font-size: 11px; color: var(--gray);">@${user.username}</div>
            </div>
        `;
        
        activeUsersContainer.appendChild(userEl);
    });
    
    if (onlineUsers.length > 5) {
        const moreEl = document.createElement('div');
        moreEl.style.color = 'var(--primary)';
        moreEl.style.fontSize = '12px';
        moreEl.style.marginTop = '10px';
        moreEl.textContent = `+${onlineUsers.length - 5} more online`;
        activeUsersContainer.appendChild(moreEl);
    }
}

// Admin panel functions
function loadAdminPanel() {
    if (!currentUser || currentUser.role !== 'admin') {
        showSection('forum');
        return;
    }
    
    updateAdminStats();
    loadUsersList();
}

function updateAdminStats() {
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalMessages').textContent = messages.length;
    document.getElementById('adminCount').textContent = users.filter(u => u.role === 'admin').length;
    document.getElementById('bannedCount').textContent = users.filter(u => u.isBanned).length;
}

function loadUsersList() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    
    users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = `user-card ${user.isBanned ? 'banned' : ''}`;
        
        const joinDate = new Date(user.joinDate);
        const daysSinceJoin = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
        
        userCard.innerHTML = `
            <div class="user-header">
                <img src="${user.avatar}" alt="Avatar" class="user-avatar" style="cursor: pointer;" onclick="openUserProfile('${user.id}')">
                <div class="user-info">
                    <h4 style="cursor: pointer;" onclick="openUserProfile('${user.id}')">${user.nickname}</h4>
                    <p>@${user.username}</p>
                    <div class="role-badge ${user.isBanned ? 'role-banned' : user.role === 'admin' ? 'role-admin' : user.role === 'moderator' ? 'role-moderator' : 'role-user'}" style="margin-top: 5px;">
                        <i class="fas ${user.isBanned ? 'fa-ban' : user.role === 'admin' ? 'fa-crown' : user.role === 'moderator' ? 'fa-shield-alt' : 'fa-user'}"></i>
                        ${user.isBanned ? 'Banned' : user.role}
                    </div>
                    <div class="online-status" style="margin-top: 5px;">
                        <span class="status-dot ${user.status}"></span>
                        <span>${user.status}</span>
                    </div>
                </div>
            </div>
            <div class="user-details">
                <p style="color: var(--gray); font-size: 13px; margin-bottom: 10px;">
                    <i class="fas fa-calendar"></i> Joined ${daysSinceJoin + 1} days ago<br>
                    <i class="fas fa-comment"></i> ${user.posts || 0} posts<br>
                    <i class="fas fa-users"></i> ${user.friends ? user.friends.length : 0} friends
                </p>
                ${user.id !== currentUser.id ? `
                    <div class="user-actions">
                        <button class="btn ${user.isBanned ? 'btn-success' : 'btn-danger'} btn-small toggle-ban-btn" data-user-id="${user.id}">
                            <i class="fas ${user.isBanned ? 'fa-unlock' : 'fa-ban'}"></i> ${user.isBanned ? 'Unban' : 'Ban'}
                        </button>
                        <button class="btn btn-warning btn-small change-role-btn" data-user-id="${user.id}">
                            <i class="fas fa-user-cog"></i> Role
                        </button>
                        <button class="btn btn-danger btn-small delete-user-btn" data-user-id="${user.id}" ${user.role === 'admin' ? 'disabled' : ''}>
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                ` : '<p style="color: var(--gray); font-size: 12px;">This is your account</p>'}
            </div>
        `;
        
        usersList.appendChild(userCard);
        
        if (user.id !== currentUser.id) {
            const banBtn = userCard.querySelector('.toggle-ban-btn');
            banBtn.addEventListener('click', () => {
                toggleBanUser(user.id);
            });
            
            const roleBtn = userCard.querySelector('.change-role-btn');
            roleBtn.addEventListener('click', () => {
                changeUserRole(user.id);
            });
            
            const deleteBtn = userCard.querySelector('.delete-user-btn');
            deleteBtn.addEventListener('click', () => {
                if (confirm(`Delete user ${user.username}? This action cannot be undone.`)) {
                    deleteUser(user.id);
                }
            });
        }
    });
}

function toggleBanUser(userId) {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;
    
    users[userIndex].isBanned = !users[userIndex].isBanned;
    localStorage.setItem('fandrot_users', JSON.stringify(users));
    
    // If banning current user, log them out
    if (userId === currentUser.id && users[userIndex].isBanned) {
        logout();
    }
    
    updateAdminStats();
    loadUsersList();
    showNotification('User Status Updated', `${users[userIndex].username} has been ${users[userIndex].isBanned ? 'banned' : 'unbanned'}`, 'info');
}

function changeUserRole(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const roles = ['user', 'moderator', 'admin'];
    const currentIndex = roles.indexOf(user.role);
    const nextRole = roles[(currentIndex + 1) % roles.length];
    
    user.role = nextRole;
    updateUserInStorage(user);
    
    updateAdminStats();
    loadUsersList();
    showNotification('Role Changed', `${user.username} is now a ${nextRole}`, 'success');
}

function deleteUser(userId) {
    if (userId === currentUser.id) {
        showNotification('Error', 'You cannot delete your own account.', 'error');
        return;
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;
    
    const username = users[userIndex].username;
    users.splice(userIndex, 1);
    localStorage.setItem('fandrot_users', JSON.stringify(users));
    
    // Remove from all friends lists
    users.forEach(u => {
        if (u.friends) {
            u.friends = u.friends.filter(friendId => friendId !== userId);
        }
    });
    localStorage.setItem('fandrot_users', JSON.stringify(users));
    
    updateAdminStats();
    loadUsersList();
    showNotification('User Deleted', `${username} has been removed from the system.`, 'success');
}

function addSampleMessages() {
    const sampleMessages = [
        {
            id: generateId(),
            userId: 'admin_1',
            username: 'admin',
            nickname: 'System Administrator',
            avatar: 'https://ui-avatars.com/api/?name=Admin&background=9d4edd&color=ffffff&size=300&bold=true',
            text: 'Welcome to the FanDrot community forum! This is a secure, encrypted space for discussions. Remember to follow community guidelines and respect each other.',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            tab: 'general',
            deleted: false
        },
        {
            id: generateId(),
            userId: 'moderator_1',
            username: 'moderator',
            nickname: 'Community Moderator',
            avatar: 'https://ui-avatars.com/api/?name=Moderator&background=4cc9f0&color=ffffff&size=300&bold=true',
            text: 'As a moderator, I\'m here to help maintain a positive and respectful environment. Feel free to ask if you need any help!',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            tab: 'general',
            deleted: false
        },
        {
            id: generateId(),
            userId: 'user_1',
            username: 'john_doe',
            nickname: 'John Doe',
            avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0099ff&color=ffffff&size=300&bold=true',
            text: 'Just joined! The platform looks amazing. Looking forward to meeting new friends here! 👋',
            timestamp: new Date(Date.now() - 900000).toISOString(),
            tab: 'general',
            deleted: false
        }
    ];
    
    messages.push(...sampleMessages);
    localStorage.setItem('fandrot_messages', JSON.stringify(messages));
}

function showNotification(title, message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    notification.innerHTML = `
        <i class="fas ${icon} notification-icon" style="color: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : type === 'warning' ? 'var(--warning)' : 'var(--primary)'};"></i>
        <div class="notification-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

function generateId() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Make functions available globally
window.openUserProfile = openUserProfile;