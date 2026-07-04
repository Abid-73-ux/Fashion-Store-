// Modal Management Module
const Modal = {
    // Show login required modal
    showLoginRequired(action = 'continue') {
        const modalHTML = `
            <div class="modal fade" id="loginRequiredModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="border: none;">
                        <div class="modal-body text-center p-5">
                            <div class="mb-4">
                                <i class="bi bi-lock-fill" style="font-size: 4rem; color: var(--secondary-color);"></i>
                            </div>
                            <h3 class="mb-3" style="font-family: var(--font-secondary);">Login Required</h3>
                            <p class="text-muted mb-4">Please log in or create an account to ${action}.</p>
                            <div class="d-flex gap-3 justify-content-center">
                                <a href="login.html" class="btn" style="background: var(--primary-color); color: var(--white); padding: 0.75rem 2rem; text-transform: uppercase; letter-spacing: 0.1em;">Login</a>
                                <a href="register.html" class="btn" style="background: transparent; color: var(--primary-color); border: 2px solid var(--primary-color); padding: 0.75rem 2rem; text-transform: uppercase; letter-spacing: 0.1em;">Register</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existing = document.getElementById('loginRequiredModal');
        if (existing) existing.remove();

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('loginRequiredModal'));
        modal.show();

        // Clean up after hide
        document.getElementById('loginRequiredModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    },

    // Show logout confirmation

    showLogoutConfirm(callback) {
        const modalHTML = `
            <div class="modal fade" id="logoutModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="border: none;">
                        <div class="modal-body text-center p-5">
                            <div class="mb-4">
                                <i class="bi bi-box-arrow-right" style="font-size: 4rem; color: var(--danger);"></i>
                            </div>
                            <h3 class="mb-3" style="font-family: var(--font-secondary);">Confirm Logout</h3>
                            <p class="text-muted mb-4">Are you sure you want to logout?</p>
                            <div class="d-flex gap-3 justify-content-center">
                                <button class="btn" id="confirmLogout" style="background: var(--danger); color: var(--white); padding: 0.75rem 2rem; text-transform: uppercase; letter-spacing: 0.1em;">Logout</button>
                                <button class="btn" data-bs-dismiss="modal" style="background: transparent; color: var(--gray-600); border: 2px solid var(--gray-300); padding: 0.75rem 2rem; text-transform: uppercase; letter-spacing: 0.1em;">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const existing = document.getElementById('logoutModal');
        if (existing) existing.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = new bootstrap.Modal(document.getElementById('logoutModal'));
        modal.show();

        document.getElementById('confirmLogout').addEventListener('click', () => {
            modal.hide();
            if (callback) callback();
        });

        document.getElementById('logoutModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    },

    // Show delete confirmation

    showDeleteConfirm(itemName, callback) {
        const modalHTML = `
            <div class="modal fade" id="deleteModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="border: none;">
                        <div class="modal-body text-center p-5">
                            <div class="mb-4">
                                <i class="bi bi-trash-fill" style="font-size: 4rem; color: var(--danger);"></i>
                            </div>
                            <h3 class="mb-3" style="font-family: var(--font-secondary);">Confirm Delete</h3>
                            <p class="text-muted mb-4">Are you sure you want to delete "${itemName}"?</p>
                            <div class="d-flex gap-3 justify-content-center">
                                <button class="btn" id="confirmDelete" style="background: var(--danger); color: var(--white); padding: 0.75rem 2rem; text-transform: uppercase; letter-spacing: 0.1em;">Delete</button>
                                <button class="btn" data-bs-dismiss="modal" style="background: transparent; color: var(--gray-600); border: 2px solid var(--gray-300); padding: 0.75rem 2rem; text-transform: uppercase; letter-spacing: 0.1em;">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const existing = document.getElementById('deleteModal');
        if (existing) existing.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();

        document.getElementById('confirmDelete').addEventListener('click', () => {
            modal.hide();
            if (callback) callback();
        });

        document.getElementById('deleteModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    },

    // Show success message
    showSuccess(title, message) {
        const modalHTML = `
            <div class="modal fade" id="successModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="border: none;">
                        <div class="modal-body text-center p-5">
                            <div class="mb-4">
                                <i class="bi bi-check-circle-fill" style="font-size: 4rem; color: var(--success);"></i>
                            </div>
                            <h3 class="mb-3" style="font-family: var(--font-secondary);">${title}</h3>
                            <p class="text-muted mb-4">${message}</p>
                            <button class="btn" data-bs-dismiss="modal" style="background: var(--success); color: var(--white); padding: 0.75rem 2rem; text-transform: uppercase; letter-spacing: 0.1em;">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const existing = document.getElementById('successModal');
        if (existing) existing.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();

        document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    },

    // Show error message
    showError(title, message) {
        const modalHTML = `
            <div class="modal fade" id="errorModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="border: none;">
                        <div class="modal-body text-center p-5">
                            <div class="mb-4">
                                <i class="bi bi-x-circle-fill" style="font-size: 4rem; color: var(--danger);"></i>
                            </div>
                            <h3 class="mb-3" style="font-family: var(--font-secondary);">${title}</h3>
                            <p class="text-muted mb-4">${message}</p>
                            <button class="btn" data-bs-dismiss="modal" style="background: var(--danger); color: var(--white); padding: 0.75rem 2rem; text-transform: uppercase; letter-spacing: 0.1em;">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const existing = document.getElementById('errorModal');
        if (existing) existing.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = new bootstrap.Modal(document.getElementById('errorModal'));
        modal.show();

        document.getElementById('errorModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
};

console.log('Modal module loaded successfully');
