// Toast Notification Module
const Toast = {
    // Toast container
    container: null,

    // Initialize toast container
    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 350px;
            `;
            document.body.appendChild(this.container);
            console.log('Toast container initialized');
        }
    },

    // Show toast notification
    show(message, type = 'info', duration = 3000) {
        this.init();

        const icons = {
            success: 'bi-check-circle-fill',
            error: 'bi-x-circle-fill',
            warning: 'bi-exclamation-triangle-fill',
            info: 'bi-info-circle-fill'
        };

        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        const toastId = 'toast-' + Date.now();
        const toastHTML = `
            <div class="toast align-items-center border-0 mb-3 show" id="${toastId}" role="alert" style="background: var(--white); box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div class="d-flex">
                    <div class="toast-body d-flex align-items-center" style="padding: 1rem;">
                        <i class="bi ${icons[type]} me-3" style="font-size: 1.5rem; color: ${colors[type]};"></i>
                        <span style="color: var(--gray-800); font-size: 0.9rem;">${message}</span>
                    </div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;

        this.container.insertAdjacentHTML('beforeend', toastHTML);

        const toastElement = document.getElementById(toastId);
        const bsToast = new bootstrap.Toast(toastElement, { delay: duration });
        bsToast.show();

        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    },

    success(message, duration) {
        this.show(message, 'success', duration);
    },

    error(message, duration) {
        this.show(message, 'error', duration);
    },

    warning(message, duration) {
        this.show(message, 'warning', duration);
    },

    info(message, duration) {
        this.show(message, 'info', duration);
    }
};

console.log('Toast module loaded successfully');
