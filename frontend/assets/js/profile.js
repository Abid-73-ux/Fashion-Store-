/**
 * Profile Page Module
 * Loads and displays user profile information from login data
 */

const ProfileModule = {
  /**
   * Initialize profile page
   */
  async init() {
    // Check if user is logged in
    if (!Auth.isLoggedIn()) {
      window.location.href = 'login.html';
      return;
    }

    // Load user data
    this.loadUserData();
    
    // Setup event listeners
    this.setupEventListeners();
  },

  /**
   * Load user profile data from localStorage
   */
  loadUserData() {
    try {
      const user = Auth.getCurrentUser();
      
      // Update sidebar info
      this.updateSidebarInfo(user);
      
      // Update personal info form
      this.updatePersonalInfoForm(user);
      
      // Load addresses if available
      this.loadAddresses(user);
    } catch (error) {
      console.error('Error loading user data:', error);
      alert('Error loading profile information');
    }
  },

  /**
   * Update sidebar profile info
   */
  updateSidebarInfo(user) {
    // Update profile name
    const profileNameEl = document.querySelector('.profile-name');
    if (profileNameEl) {
      profileNameEl.textContent = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.name || 'User';
    }

    // Update profile email
    const profileEmailEl = document.querySelector('.profile-email');
    if (profileEmailEl) {
      profileEmailEl.textContent = user.email || '';
    }

    // Update avatar
    const avatarEl = document.getElementById('avatarImage');
    if (avatarEl && user.avatar) {
      avatarEl.src = user.avatar;
    }
  },

  /**
   * Update personal info form with user data
   */
  updatePersonalInfoForm(user) {
    // First Name
    const firstNameInput = document.getElementById('firstName');
    if (firstNameInput) {
      firstNameInput.value = user.firstName || '';
    }

    // Last Name
    const lastNameInput = document.getElementById('lastName');
    if (lastNameInput) {
      lastNameInput.value = user.lastName || '';
    }

    // Email (read-only)
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.value = user.email || '';
      emailInput.readOnly = true;
    }

    // Phone
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
      phoneInput.value = user.phone || '';
    }

    // Date of Birth
    const dobInput = document.getElementById('dob');
    if (dobInput && user.dateOfBirth) {
      dobInput.value = user.dateOfBirth;
    }

    // Gender
    const genderSelect = document.getElementById('gender');
    if (genderSelect && user.gender) {
      genderSelect.value = user.gender;
    }
  },

  /**
   * Load user addresses
   */
  loadAddresses(user) {
    // For now, this is a placeholder
    // In the future, fetch addresses from backend
    console.log('User ID:', user.id);
  },

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Save Changes button
    const saveBtn = document.querySelector('.btn-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => this.handleSaveChanges(e));
    }

    // Avatar upload
    const avatarUpload = document.getElementById('avatarUpload');
    if (avatarUpload) {
      avatarUpload.addEventListener('change', (e) => this.handleAvatarUpload(e));
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Section navigation
    document.querySelectorAll('.profile-nav-link[data-section]').forEach(link => {
      link.addEventListener('click', (e) => this.handleSectionChange(e));
    });
  },

  /**
   * Handle profile changes save
   */
  async handleSaveChanges(e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phone = document.getElementById('phone').value;
    const dob = document.getElementById('dob').value;
    const gender = document.getElementById('gender').value;

    if (!firstName || !lastName) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = Auth.getToken();
      const userId = Auth.getCurrentUser().id;

      const response = await fetch(API_CONFIG.getEndpoint(`/users/${userId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          dateOfBirth: dob,
          gender
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Update localStorage
      Auth.setUser(updatedUser.user, token);
      
      // Update UI
      this.updateSidebarInfo(updatedUser.user);
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error updating profile: ' + error.message);
    }
  },

  /**
   * Handle avatar upload
   */
  handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const avatarEl = document.getElementById('avatarImage');
      if (avatarEl) {
        avatarEl.src = event.target.result;
        // TODO: Send to backend
      }
    };
    reader.readAsDataURL(file);
  },

  /**
   * Handle section navigation
   */
  handleSectionChange(e) {
    e.preventDefault();
    
    // Update active link
    document.querySelectorAll('.profile-nav-link').forEach(l => l.classList.remove('active'));
    e.target.closest('.profile-nav-link').classList.add('active');
    
    // Show corresponding section
    const sectionId = e.target.closest('.profile-nav-link').dataset.section + 'Section';
    document.querySelectorAll('.profile-content').forEach(section => {
      section.classList.add('d-none');
    });
    
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.remove('d-none');
    }
  },

  /**
   * Handle logout
   */
  handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      Auth.logout();
      window.location.href = 'index.html';
    }
  }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  ProfileModule.init();
});
