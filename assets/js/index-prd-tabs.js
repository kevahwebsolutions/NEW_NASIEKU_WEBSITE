document.addEventListener("DOMContentLoaded", () => {
    // Fetch products and populate tabs
    fetch('products.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(products => {
            // Normalize product data
            const normalizedProducts = products.map(product => ({
                ...product,
                price: typeof product.price === 'string' 
                    ? parseFloat(product.price.replace(/[^\d.]/g, '')) 
                    : parseFloat(product.price), // Ensure it's always a number
                originalPrice: product.originalPrice ? 
                    (typeof product.originalPrice === 'string' 
                        ? parseFloat(product.originalPrice.replace(/[^\d.]/g, '')) 
                        : parseFloat(product.originalPrice)) 
                    : null,
                image_url: product.image_url.replace(/\\/g, '/'),
                mobile_image_url: product.image_url.replace(/\\/g, '/') 
            }));
            
            // Get 10 products for each tab
            const featuredProducts = getRandomProducts(normalizedProducts, 10);
            const newArrivals = getRandomProducts(normalizedProducts, 10);
            const onSaleProducts = normalizedProducts.filter(p => p.originalPrice).slice(0, 10);
            
            // Populate tabs
            populateTab('featured', featuredProducts);
            populateTab('arrivals', newArrivals);
            populateTab('onsale', onSaleProducts.length ? onSaleProducts : getRandomProducts(normalizedProducts, 10));
            
            // Initialize responsive layout
            initResponsiveLayout();
            
            // Initialize mobile touch scrolling
            initMobileScrolling();
        })
        .catch(error => {
            console.error('Error loading products:', error);
            const errorMessage = '<div class="col-12 text-center"><p>Error loading products. Please try again later.</p></div>';
            document.querySelectorAll('.tab-pane .product_column3').forEach(container => {
                container.innerHTML = errorMessage;
            });
        });

    // Function to populate a tab with products
    function populateTab(tabId, products) {
        const container = document.querySelector(`#${tabId} .product_column3`);
        if (!container) {
            console.error(`Container not found for tab: ${tabId}`);
            return;
        }
        
        // Clear loading message
        container.innerHTML = '';
        
        // Add products to container
        products.forEach(product => {
            const productHTML = `
                <div class="custom-col-5">
                    <div class="single_product">
                        <div class="product_thumb">
                            <a class="primary_img">
                                <img src="${product.image_url}" alt="${product.name}" style="width:100%">
                            </a>
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
                            <div class="product_hover">
                                <div class="action_links">
                                    <ul>
                                        <li class="add_to_cart">
                                            <a href="#" class="add-to-cart-btn"
                                                data-product-id="${product.id || product.name.replace(/\s+/g, '-').toLowerCase()}"
                                                data-product-name="${product.name}"
                                                data-product-price="${product.price}"
                                                data-product-img="${product.image_url}">
                                                Add to Cart
                                            </a>
                                        </li>
                                    </ul>
                                </div>
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
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', productHTML);
        });
        
        console.log(`Loaded ${products.length} products in ${tabId} tab`);
    }

    // Initialize responsive layout
    function initResponsiveLayout() {
        const handleResize = () => {
            const isMobile = window.innerWidth <= 768;
            console.log(`Initializing layout for ${isMobile ? 'mobile' : 'desktop'}`);
            
            document.querySelectorAll('.product_column3').forEach(container => {
                if (isMobile) {
                    // Mobile layout - horizontal scroll with centering
                    container.style.display = 'flex';
                    container.style.flexWrap = 'nowrap';
                    container.style.overflowX = 'auto';
                    container.style.scrollSnapType = 'x mandatory';
                    container.style.scrollBehavior = 'smooth';
                    container.style.padding = '10px 15px';
                    container.style.gap = '15px';
                    container.style.justifyContent = 'flex-start';
                    
                    const products = container.querySelectorAll('.custom-col-5');
                    products.forEach((product, index) => {
                        product.style.flex = '0 0 85%';
                        product.style.scrollSnapAlign = 'center';
                        product.style.minWidth = '0';
                        product.style.margin = '0 auto';
                        
                        // Center first item
                        if (index === 0) {
                            product.style.marginLeft = '7.5%';
                        }
                        // Center last item
                        if (index === products.length - 1) {
                            product.style.marginRight = '7.5%';
                        }
                    });
                } else {
                    // Desktop layout - grid
                    container.style.display = 'flex';
                    container.style.flexWrap = 'wrap';
                    container.style.overflowX = 'hidden';
                    container.style.gap = '15px';
                    container.style.justifyContent = 'center';
                    
                    const products = container.querySelectorAll('.custom-col-5');
                    products.forEach(product => {
                        product.style.flex = '0 0 calc(20% - 12px)';
                        product.style.maxWidth = 'none';
                        product.style.margin = '0';
                        product.style.marginLeft = '0';
                        product.style.marginRight = '0';
                    });
                }
            });
        };
        
        // Initial setup
        handleResize();
        
        // Update on window resize
        window.addEventListener('resize', handleResize);
    }

    // Initialize mobile scrolling functionality with auto-slide
    function initMobileScrolling() {
        if (window.innerWidth <= 768) {
            document.querySelectorAll('.product_column3').forEach(container => {
                let isScrolling = false;
                let startX = 0;
                let scrollLeft = 0;
                let autoSlideInterval;
                let isUserInteracting = false;

                // Auto-slide functionality
                function startAutoSlide() {
                    autoSlideInterval = setInterval(() => {
                        if (!isUserInteracting && container.children.length > 0) {
                            const currentScroll = container.scrollLeft;
                            const itemWidth = container.children[0].offsetWidth + 15; // item width + gap
                            const maxScroll = container.scrollWidth - container.clientWidth;
                            
                            if (currentScroll >= maxScroll - 10) {
                                // At the end, loop back to start
                                container.scrollTo({
                                    left: 0,
                                    behavior: 'smooth'
                                });
                            } else {
                                // Scroll to next item
                                container.scrollBy({
                                    left: itemWidth,
                                    behavior: 'smooth'
                                });
                            }
                        }
                    }, 5000); // Auto-slide every 5 seconds
                }

                function stopAutoSlide() {
                    if (autoSlideInterval) {
                        clearInterval(autoSlideInterval);
                    }
                }

                // Start auto-slide
                startAutoSlide();

                // Touch events for mobile
                container.addEventListener('touchstart', (e) => {
                    isScrolling = true;
                    isUserInteracting = true;
                    stopAutoSlide();
                    startX = e.touches[0].pageX - container.offsetLeft;
                    scrollLeft = container.scrollLeft;
                }, { passive: true });

                container.addEventListener('touchmove', (e) => {
                    if (!isScrolling) return;
                    e.preventDefault();
                    const x = e.touches[0].pageX - container.offsetLeft;
                    const walk = (x - startX) * 2;
                    container.scrollLeft = scrollLeft - walk;
                }, { passive: false });

                container.addEventListener('touchend', () => {
                    isScrolling = false;
                    // Resume auto-slide after user interaction ends
                    setTimeout(() => {
                        isUserInteracting = false;
                        startAutoSlide();
                    }, 5000); // Wait 5 seconds before resuming auto-slide
                });

                // Mouse events for testing on desktop
                container.addEventListener('mousedown', (e) => {
                    if (window.innerWidth > 768) return;
                    isScrolling = true;
                    isUserInteracting = true;
                    stopAutoSlide();
                    container.style.cursor = 'grabbing';
                    startX = e.pageX - container.offsetLeft;
                    scrollLeft = container.scrollLeft;
                });

                container.addEventListener('mouseleave', () => {
                    isScrolling = false;
                    container.style.cursor = 'grab';
                    setTimeout(() => {
                        isUserInteracting = false;
                        startAutoSlide();
                    }, 3000);
                });

                container.addEventListener('mouseup', () => {
                    isScrolling = false;
                    container.style.cursor = 'grab';
                    setTimeout(() => {
                        isUserInteracting = false;
                        startAutoSlide();
                    }, 3000);
                });

                container.addEventListener('mousemove', (e) => {
                    if (!isScrolling || window.innerWidth > 768) return;
                    e.preventDefault();
                    const x = e.pageX - container.offsetLeft;
                    const walk = (x - startX) * 2;
                    container.scrollLeft = scrollLeft - walk;
                });

                // Pause auto-slide when user hovers over container
                container.addEventListener('mouseenter', () => {
                    isUserInteracting = true;
                    stopAutoSlide();
                });

                container.addEventListener('mouseleave', () => {
                    setTimeout(() => {
                        isUserInteracting = false;
                        startAutoSlide();
                    }, 2000);
                });

                // Clean up interval when page unloads
                window.addEventListener('beforeunload', () => {
                    stopAutoSlide();
                });
            });
        }
    }

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