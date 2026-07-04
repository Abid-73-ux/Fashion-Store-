# PowerShell script to update footers in all HTML files

$footerHTML = @'
    <!-- Footer -->
    <footer class="footer bg-dark text-white pt-5 pb-3">
        <div class="container">
            <div class="row g-4 mb-5">
                <!-- Company Info -->
                <div class="col-lg-3 col-md-6 mb-4 mb-lg-0">
                    <h3 class="fw-bold mb-4" style="font-family: var(--font-accent); letter-spacing: 0.05em; font-size: 1.5rem; word-spacing: -0.3em;">
                        FASHION<span style="color: var(--secondary-color);">STORE</span>
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
                        <li class="mb-2"><a href="shop.html?category=accessories" class="text-white-50 text-decoration-none" style="font-size: 0.9rem;">Accessories</a></li>
                        <li class="mb-2"><a href="shop.html?filter=sale" class="text-white-50 text-decoration-none" style="font-size: 0.9rem;">Sale</a></li>
                    </ul>
                </div>
                
                <!-- Customer Service -->
                <div class="col-lg-3 col-md-6 col-6 mb-4 mb-lg-0">
                    <h5 class="mb-3" style="font-weight: 600; font-size: 1rem;">Customer Service</h5>
                    <ul class="list-unstyled">
                        <li class="mb-2"><a href="contact.html" class="text-white-50 text-decoration-none" style="font-size: 0.9rem;">Contact Us</a></li>
                        <li class="mb-2"><a href="#" class="text-white-50 text-decoration-none" style="font-size: 0.9rem;">Shipping Info</a></li>
                        <li class="mb-2"><a href="#" class="text-white-50 text-decoration-none" style="font-size: 0.9rem;">Returns</a></li>
                        <li class="mb-2"><a href="#" class="text-white-50 text-decoration-none" style="font-size: 0.9rem;">FAQ</a></li>
                    </ul>
                </div>
                
                <!-- About & Contact -->
                <div class="col-lg-4 col-md-6">
                    <h5 class="mb-3" style="font-weight: 600; font-size: 1rem;">Contact</h5>
                    <ul class="list-unstyled text-white-50" style="font-size: 0.9rem;">
                        <li class="mb-2"><i class="bi bi-geo-alt me-2"></i>123 Fashion St, NY</li>
                        <li class="mb-2"><i class="bi bi-telephone me-2"></i>+1 234 567 8900</li>
                        <li class="mb-2"><i class="bi bi-envelope me-2"></i>info@fashionstore.com</li>
                    </ul>
                </div>
            </div>
            
            <!-- Copyright -->
            <div class="border-top border-secondary pt-4 text-center">
                <p class="text-white-50 mb-0" style="font-size: 0.875rem;">&copy; 2026 FashionStore. All rights reserved.</p>
            </div>
        </div>
    </footer>
'@

$files = @(
    "about.html",
    "shop.html",
    "cart.html",
    "contact.html",
    "product.html",
    "wishlist.html",
    "orders.html",
    "profile.html"
)

foreach ($file in $files) {
    $path = "d:\A Kiro Project\frontend\$file"
    if (Test-Path $path) {
        Write-Host "Updating $file..."
        $content = Get-Content $path -Raw
        
        # Replace footer section using regex
        $pattern = '(?s)<!-- Footer -->.*?</footer>'
        $content = $content -replace $pattern, $footerHTML
        
        Set-Content -Path $path -Value $content -NoNewline
        Write-Host "✓ Updated $file"
    }
}

Write-Host "`nAll footers updated successfully!"
