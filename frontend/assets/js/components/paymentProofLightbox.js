/**
 * Payment Proof Lightbox Component
 * Full-size image viewer with zoom, pan, rotate, and download capabilities
 */

const PaymentProofLightbox = (() => {
    let currentImageUrl = null;
    let currentOrderId = null;
    let currentZoom = 100;
    let isPanning = false;
    let panStartX = 0;
    let panStartY = 0;
    let panOffsetX = 0;
    let panOffsetY = 0;

    const MIN_ZOOM = 10;
    const MAX_ZOOM = 500;
    const ZOOM_STEP = 10;

    /**
     * Initialize the component
     */
    const init = () => {
        createLightboxMarkup();
        setupEventListeners();
    };

    /**
     * Create lightbox HTML markup
     */
    const createLightboxMarkup = () => {
        const markup = `
            <div id="paymentProofLightbox" class="payment-proof-lightbox" style="display: none;">
                <div class="lightbox-backdrop"></div>
                <div class="lightbox-container">
                    <div class="lightbox-header">
                        <div class="lightbox-title">
                            <span>Payment Proof - Order <span id="lightboxOrderId">#</span></span>
                        </div>
                        <div class="lightbox-controls">
                            <button class="lightbox-btn" id="zoomOutBtn" title="Zoom Out (-)">
                                <i class="bi bi-zoom-out"></i>
                            </button>
                            <span class="zoom-display" id="zoomDisplay">100%</span>
                            <button class="lightbox-btn" id="zoomInBtn" title="Zoom In (+)">
                                <i class="bi bi-zoom-in"></i>
                            </button>
                            <button class="lightbox-btn" id="rotateBtn" title="Rotate (R)">
                                <i class="bi bi-arrow-clockwise"></i>
                            </button>
                            <button class="lightbox-btn" id="downloadBtn" title="Download (D)">
                                <i class="bi bi-download"></i>
                            </button>
                            <button class="lightbox-btn lightbox-close" id="closeLightboxBtn" title="Close (ESC)">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        </div>
                    </div>

                    <div class="lightbox-viewer" id="lightboxViewer">
                        <img id="lightboxImage" src="" alt="Payment Proof" 
                             class="lightbox-image" 
                             style="cursor: grab;">
                    </div>

                    <div class="lightbox-footer">
                        <div class="lightbox-info">
                            <p>
                                <strong>Image Info:</strong> 
                                <span id="imageInfo">--</span>
                            </p>
                            <p>
                                <strong>Upload Date:</strong> 
                                <span id="uploadDate">--</span>
                            </p>
                        </div>
                        <div class="lightbox-keyboard-hints">
                            <small>
                                <kbd>+</kbd> Zoom In | 
                                <kbd>-</kbd> Zoom Out | 
                                <kbd>R</kbd> Rotate | 
                                <kbd>D</kbd> Download | 
                                <kbd>ESC</kbd> Close
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .payment-proof-lightbox {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 0, 0, 0.9);
                }

                .lightbox-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    cursor: pointer;
                }

                .lightbox-container {
                    position: relative;
                    width: 95%;
                    height: 95%;
                    max-width: 1200px;
                    max-height: 800px;
                    background: #1a1a1a;
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
                    z-index: 10000;
                }

                .lightbox-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(0, 0, 0, 0.5);
                }

                .lightbox-title {
                    color: #fff;
                    font-size: 1rem;
                    font-weight: 600;
                }

                .lightbox-controls {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .lightbox-btn {
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: #fff;
                    width: 40px;
                    height: 40px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.95rem;
                }

                .lightbox-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.4);
                    transform: scale(1.05);
                }

                .lightbox-btn:active {
                    transform: scale(0.95);
                }

                .lightbox-close:hover {
                    background: rgba(255, 76, 76, 0.3);
                    border-color: rgba(255, 76, 76, 0.6);
                    color: #ff4c4c;
                }

                .zoom-display {
                    color: #fff;
                    font-size: 0.9rem;
                    min-width: 45px;
                    text-align: center;
                    font-weight: 600;
                    padding: 0 5px;
                }

                .lightbox-viewer {
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #000;
                }

                .lightbox-image {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    user-select: none;
                    transition: transform 0.2s ease;
                }

                .lightbox-image.grabbing {
                    cursor: grabbing;
                }

                .lightbox-footer {
                    padding: 12px 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.7);
                }

                .lightbox-info {
                    flex: 1;
                }

                .lightbox-info p {
                    margin: 0;
                    margin-right: 15px;
                    display: inline-block;
                }

                .lightbox-keyboard-hints {
                    text-align: right;
                }

                .lightbox-keyboard-hints kbd {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 3px;
                    padding: 2px 6px;
                    font-size: 0.75rem;
                    font-family: monospace;
                    display: inline-block;
                    margin: 0 2px;
                }

                @media (max-width: 768px) {
                    .lightbox-container {
                        width: 98%;
                        height: 98%;
                        border-radius: 4px;
                    }

                    .lightbox-header {
                        padding: 10px 15px;
                        flex-wrap: wrap;
                    }

                    .lightbox-title {
                        width: 100%;
                        margin-bottom: 10px;
                        font-size: 0.9rem;
                    }

                    .lightbox-controls {
                        width: 100%;
                        gap: 5px;
                    }

                    .lightbox-btn {
                        width: 35px;
                        height: 35px;
                        font-size: 0.85rem;
                    }

                    .zoom-display {
                        font-size: 0.8rem;
                        min-width: 40px;
                    }

                    .lightbox-footer {
                        flex-direction: column;
                        gap: 8px;
                        text-align: center;
                    }

                    .lightbox-keyboard-hints {
                        text-align: center;
                    }
                }
            </style>
        `;

        // Add markup to body
        const container = document.createElement('div');
        container.innerHTML = markup;
        document.body.appendChild(container);
    };

    /**
     * Setup event listeners
     */
    const setupEventListeners = () => {
        const lightbox = document.getElementById('paymentProofLightbox');
        const backdrop = lightbox.querySelector('.lightbox-backdrop');
        const image = document.getElementById('lightboxImage');
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const rotateBtn = document.getElementById('rotateBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const closeBtn = document.getElementById('closeLightboxBtn');

        // Backdrop click to close
        backdrop.addEventListener('click', close);
        closeBtn.addEventListener('click', close);

        // Zoom buttons
        zoomInBtn.addEventListener('click', () => zoom(ZOOM_STEP));
        zoomOutBtn.addEventListener('click', () => zoom(-ZOOM_STEP));

        // Rotate button
        rotateBtn.addEventListener('click', rotate);

        // Download button
        downloadBtn.addEventListener('click', download);

        // Image pan
        image.addEventListener('mousedown', startPan);
        document.addEventListener('mousemove', pan);
        document.addEventListener('mouseup', endPan);

        // Touch support
        image.addEventListener('touchstart', startPan);
        document.addEventListener('touchmove', pan);
        document.addEventListener('touchend', endPan);

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboard);

        // Wheel zoom
        lightbox.addEventListener('wheel', (e) => {
            if (e.target === image || image.contains(e.target)) {
                e.preventDefault();
                zoom(e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP);
            }
        }, { passive: false });
    };

    /**
     * Open lightbox with image
     */
    const open = (imageUrl, orderId, uploadDate) => {
        currentImageUrl = imageUrl;
        currentOrderId = orderId;
        currentZoom = 100;
        panOffsetX = 0;
        panOffsetY = 0;

        const lightbox = document.getElementById('paymentProofLightbox');
        const image = document.getElementById('lightboxImage');
        const orderIdSpan = document.getElementById('lightboxOrderId');
        const uploadDateSpan = document.getElementById('uploadDate');
        const imageInfo = document.getElementById('imageInfo');

        image.src = imageUrl;
        orderIdSpan.textContent = orderId;
        uploadDateSpan.textContent = uploadDate ? new Date(uploadDate).toLocaleDateString() : 'Unknown';
        imageInfo.textContent = 'Loading...';

        // Get image dimensions after loading
        image.onload = () => {
            imageInfo.textContent = `${image.naturalWidth}x${image.naturalHeight}px`;
            updateImageTransform();
        };

        updateZoomDisplay();
        lightbox.style.display = 'flex';
    };

    /**
     * Close lightbox
     */
    const close = () => {
        const lightbox = document.getElementById('paymentProofLightbox');
        lightbox.style.display = 'none';
        currentImageUrl = null;
        currentOrderId = null;
    };

    /**
     * Zoom in/out
     */
    const zoom = (delta) => {
        const newZoom = currentZoom + delta;
        if (newZoom >= MIN_ZOOM && newZoom <= MAX_ZOOM) {
            currentZoom = newZoom;
            updateImageTransform();
            updateZoomDisplay();
        }
    };

    /**
     * Rotate image
     */
    const rotate = () => {
        const image = document.getElementById('lightboxImage');
        const currentRotation = parseInt(image.dataset.rotation || 0);
        const newRotation = (currentRotation + 90) % 360;
        image.dataset.rotation = newRotation;
        updateImageTransform();
    };

    /**
     * Download image
     */
    const download = () => {
        if (!currentImageUrl) return;

        const link = document.createElement('a');
        link.href = currentImageUrl;
        link.download = `payment-proof-${currentOrderId}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Toast.success('Image downloaded successfully');
    };

    /**
     * Start panning
     */
    const startPan = (e) => {
        if (currentZoom <= 100) return;

        isPanning = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        panStartX = clientX;
        panStartY = clientY;

        const image = document.getElementById('lightboxImage');
        image.classList.add('grabbing');
    };

    /**
     * Pan image
     */
    const pan = (e) => {
        if (!isPanning || currentZoom <= 100) return;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - panStartX;
        const deltaY = clientY - panStartY;

        panOffsetX += deltaX;
        panOffsetY += deltaY;

        panStartX = clientX;
        panStartY = clientY;

        updateImageTransform();
    };

    /**
     * End panning
     */
    const endPan = () => {
        isPanning = false;
        const image = document.getElementById('lightboxImage');
        image.classList.remove('grabbing');
    };

    /**
     * Update image transform
     */
    const updateImageTransform = () => {
        const image = document.getElementById('lightboxImage');
        const rotation = parseInt(image.dataset.rotation || 0);
        image.style.transform = `scale(${currentZoom / 100}) rotate(${rotation}deg) translate(${panOffsetX}px, ${panOffsetY}px)`;
    };

    /**
     * Update zoom display
     */
    const updateZoomDisplay = () => {
        document.getElementById('zoomDisplay').textContent = `${currentZoom}%`;
    };

    /**
     * Handle keyboard shortcuts
     */
    const handleKeyboard = (e) => {
        const lightbox = document.getElementById('paymentProofLightbox');
        if (lightbox.style.display !== 'flex') return;

        switch(e.key.toLowerCase()) {
            case '+':
            case '=':
                e.preventDefault();
                zoom(ZOOM_STEP);
                break;
            case '-':
                e.preventDefault();
                zoom(-ZOOM_STEP);
                break;
            case 'r':
                e.preventDefault();
                rotate();
                break;
            case 'd':
                e.preventDefault();
                download();
                break;
            case 'escape':
                close();
                break;
        }
    };

    // Public API
    return {
        init,
        open,
        close
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    PaymentProofLightbox.init();
});
