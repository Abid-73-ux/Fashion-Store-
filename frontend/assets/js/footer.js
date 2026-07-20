/**
 * Footer Component
 * Dynamically loads the footer on all pages to maintain consistency
 */

function loadFooter() {
    const footerHTML = `
        <!-- Footer -->
        <footer class="footer bg-dark text-white pt-5 pb-3">
            <div class="container">
                <div class="row g-4 mb-5">
                    <!-- Company Info -->
                    <div class="col-lg-3 col-md-6 mb-4 mb-lg-0">
                        <h3 class="fw-bold mb-4" style="font-family: var(--font-accent); letter-spacing: 0.05em; font-size: 1.5rem; word-spacing: -0.3em;">
                            TAKANJ<span style="color: var(--secondary-color);"></span>
                        </h3>
                        <p class="text-white-50" style="line-height: 1.8; font-size: 0.9rem; max-width: 280px;">Your destination for premium clothing and timeless fashion.</p>
                        <div class="social-links mt-4">
                            <a href="#" class="btn btn-outline-light btn-sm me-2" style="width: 40px; height: 40px;"><i class="bi bi-facebook"></i></a>
                            <a href="#" class="btn btn-outline-light btn-sm me-2" style="width: 40px; height: 40px;"><i class="bi bi-instagram"></i></a>
                            <a href="#" class="btn btn-outline-light btn-sm me-2" style="width: 40px; height: 40px;"><i class="bi bi-twitter"></i></a>
                            <a href="#" class="btn btn-outline-light btn-sm" style="width: 40px; height: 40px;"><i class="bi bi-youtube"></i></a>
                        </div>
                    </div>
                    
                    <!-- Shop Links -->
                    <div class="col-lg-2 col-md-6 col-6 mb-4 mb-lg-0">
                        <h5 class="mb-3" style="font-weight: 600; font-size: 1rem;">Shop</h5>
                        <ul class="list-unstyled">
                            <li class="mb-2"><a href="shop.html?category=men" class="text-white-50 text-decoration-none" style="font-size: 0.9rem;">Men</a></li>
                            <li class="mb-2"><a href="shop.html?category=women" class="text-white-50 text-decoration-none" style="font-size: 0.9rem;">Women</a></li>
                            <li class="mb-2"><a href="shop.html?category=children" class="text-white-50 text-decoration-none" style="font-size: 0.9rem;">Children</a></li>
                            <li class="mb-2"><a href="shop.html?category=accessories" class="text-white-50 text-decoration-none" style="font-size: 0.9rem;">Accessories</a></li>
                        </ul>
                    </div>
                    
                    <!-- Customer Service -->
                    <div class="col-lg-3 col-md-6 col-6 mb-4 mb-lg-0">
                        <h5 class="mb-3" style="font-weight: 600; font-size: 1rem;">Customer Service</h5>
                        <ul class="list-unstyled">
                            <li class="mb-2"><a href="contact.html" class="text-white-50 text-decoration-none" style="font-size: 0.9rem;">Contact Us</a></li>
                            <li class="mb-2"><a href="shipping.html" class="text-white-50 text-decoration-none" style="font-size: 0.9rem;">Shipping Info</a></li>
                            <li class="mb-2"><a href="returns.html" class="text-white-50 text-decoration-none" style="font-size: 0.9rem;">Returns</a></li>
                            <li class="mb-2"><a href="faq.html" class="text-white-50 text-decoration-none" style="font-size: 0.9rem;">FAQ</a></li>
                        </ul>
                    </div>
                    
                    <!-- Contact Info -->
                    <div class="col-lg-4 col-md-6 mb-4 mb-lg-0">
                        <h5 class="mb-3" style="font-weight: 600; font-size: 1rem;">Contact Us</h5>
                        <ul class="list-unstyled text-white-50" style="font-size: 0.9rem;">
                            <li class="mb-3">
                                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                                    <i class="bi bi-geo-alt me-0" style="flex-shrink: 0; margin-top: 2px;"></i>
                                    <span>Takanj Store<br/>Sargodha, Pakistan</span>
                                </div>
                            </li>
                            <li class="mb-3">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <i class="bi bi-telephone me-0"></i>
                                    <a href="tel:+923001234567" class="text-white-50 text-decoration-none">+92 300 123 4567</a>
                                </div>
                            </li>
                            <li class="mb-2">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <i class="bi bi-envelope me-0"></i>
                                    <a href="mailto:aliahmadameer789@gmail.com" class="text-white-50 text-decoration-none">aliahmadameer789@gmail.com</a>
                                </div>
                            </li>
                            <li class="mb-0">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <i class="bi bi-envelope me-0"></i>
                                    <a href="mailto:info@takanj.com" class="text-white-50 text-decoration-none">info@takanj.com</a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <!-- Copyright -->
                <div class="border-top border-secondary pt-4 text-center">
                    <p class="text-white-50 mb-0" style="font-size: 0.875rem;">&copy; 2026 Takanj. All rights reserved.</p>
                </div>
            </div>
        </footer>
    `;
    
    return footerHTML;
}

// Auto-load footer on all pages
document.addEventListener('DOMContentLoaded', () => {
    // Find the footer element or insert before script tag
    const footerElement = document.querySelector('footer');
    if (!footerElement) {
        const footerContainer = document.createElement('div');
        footerContainer.innerHTML = loadFooter();
        document.body.appendChild(footerContainer);
    }
});

// Export for use in other modules
window.loadFooter = loadFooter;
