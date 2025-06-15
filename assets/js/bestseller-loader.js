document.addEventListener("DOMContentLoaded", () => {
    let currentSlide = 0;
    const productsPerSlide = 5;
    let allProducts = [];
    const slider = document.querySelector('.product-slider');
    let slideInterval;
    let touchStartX = 0;
    let touchEndX = 0;
    let maxSlide = 0;
    
    // Fetch products
    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            // Normalize product data
            allProducts = products.map(product => ({
                ...product,
                price: typeof product.price === 'string' 
                    ? parseFloat(product.price.replace(/[^\d.]/g, '')) 
                    : parseFloat(product.price), // Ensure it's always a number
                originalPrice: product.originalPrice ? 
                    (typeof product.originalPrice === 'string' 
                        ? parseFloat(product.originalPrice.replace(/[^\d.]/g, '')) 
                        : parseFloat(product.originalPrice)) 
                    : null,
                image_url: product.image_url.replace(/\\/g, '/')
            }));
            
            // Get 20 random products
            const randomProducts = getRandomProducts(allProducts, 20);
            renderProducts(randomProducts);
            initSlider();
            startAutoSlide();
        })
        .catch(error => {
            console.error('Error loading products:', error);
            slider.innerHTML = '<div class="col-12 text-center"><p>Error loading products. Please try again later.</p></div>';
        });

    // Render products
    function renderProducts(products) {
        slider.innerHTML = products.map(product => `
            <div class="single_product">
                <div class="product_thumb">
                    <a class="primary_img"><img src="${product.image_url}" alt="${product.name}"></a>
                </div>
                <div class="product_content">
                    <div class="tag_cate">
                        <span>${product.category}</span>
                    </div>
                    <h3><a>${product.name}</a></h3>
                    <div class="price_box">
                        <span class="current_price" data-price="${product.price}">Ksh ${product.price.toLocaleString()}</span>
                        ${product.originalPrice ? `<span class="old_price">Ksh ${product.originalPrice.toLocaleString()}</span>` : ''}
                    </div>
                    <div class="mobile_add_to_cart">
                        <a href="#" class="add-to-cart-btn"
                            data-product-id="${product.id || product.name.replace(/\s+/g, '-').toLowerCase()}"
                            data-product-name="${product.name}"
                            data-product-price="${product.price}"
                            data-product-img="${product.image_url}">
                            Add to Cart
                        </a>
                    </div>
                    <div class="product_hover">
                        <div class="action_links">
                            <ul>
                                <li class="add_to_cart">
                                    <a href="#" class="add-to-cart-btn"
                                        data-product-id="${product.id || product.name.replace(/\s+/g, '-').toLowerCase()}"
                                        data-product-name="${product.name}"
                                        data-product-price="${product.price}"
                                        data-product-img="${product.image_url}"
                                        title="add to cart">
                                        Add to Cart
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Initialize slider functionality
    function initSlider() {
        const prevBtn = document.querySelector('.slider-prev');
        const nextBtn = document.querySelector('.slider-next');
        const productCount = document.querySelectorAll('.single_product').length;
        maxSlide = Math.ceil(productCount / productsPerSlide);
        
        // Desktop behavior - show 5 products, no sliding
        if (window.innerWidth > 768) {
            // Show first 5 products
            currentSlide = 0;
            updateSlider();
            
            // Hide navigation arrows on desktop
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            return;
        }
        
        // Mobile behavior - enable sliding
        updateSlider();
        
        // Click handlers for mobile
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentSlide = Math.max(currentSlide - 1, 0);
                updateSlider();
                resetAutoSlide();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentSlide = Math.min(currentSlide + 1, maxSlide - 1);
                updateSlider();
                resetAutoSlide();
            });
        }
        
        // Touch/swipe handlers for mobile
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            clearInterval(slideInterval);
        }, {passive: true});
        
        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoSlide();
        }, {passive: true});
        
        function handleSwipe() {
            const threshold = 50;
            if (touchStartX - touchEndX > threshold) {
                // Swipe left - next
                currentSlide = Math.min(currentSlide + 1, maxSlide - 1);
            } else if (touchEndX - touchStartX > threshold) {
                // Swipe right - previous
                currentSlide = Math.max(currentSlide - 1, 0);
            }
            updateSlider();
        }
    }
    
    function updateSlider() {
        if (window.innerWidth > 768) {
            // Desktop - show first 5 products statically
            slider.style.transform = 'translateX(0)';
            slider.querySelectorAll('.single_product').forEach((product, index) => {
                product.style.display = index < 5 ? 'block' : 'none';
            });
        } else {
            // Mobile - slide between sets of products
            const translateValue = -currentSlide * 100;
            slider.style.transform = `translateX(${translateValue}%)`;
            slider.querySelectorAll('.single_product').forEach(product => {
                product.style.display = 'block';
            });
        }
    }
    
    function startAutoSlide() {
        if (window.innerWidth > 768) return; // No auto-slide on desktop
        
        clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % maxSlide;
            updateSlider();
        }, 3000);
    }
    
    function resetAutoSlide() {
        if (window.innerWidth > 768) return; // No auto-slide on desktop
        clearInterval(slideInterval);
        startAutoSlide();
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        initSlider();
        if (window.innerWidth <= 768) {
            startAutoSlide();
        } else {
            clearInterval(slideInterval);
        }
    });

    // Get random products
    function getRandomProducts(products, count) {
        const shuffled = [...products];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, count);
    }
});