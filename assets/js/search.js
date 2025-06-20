document.addEventListener('DOMContentLoaded', function() {
    // Only run this script on shop.html
    if (!window.location.pathname.includes('shop.html')) {
        return;
    }

    // Global variables
    let allProducts = [];
    let currentSearchTerm = '';
    
    // Mobile search elements
    const mobileSearchToggle = document.querySelector('.mobile-search-toggle');
    const dropdownSearch = document.querySelector('.dropdown_search');
    const mobileSearchForm = document.querySelector('.dropdown_search form');
    const mobileSearchInput = document.querySelector('.dropdown_search input');
    
    // Desktop search elements
    const desktopSearchForm = document.querySelector('.search_container_new form');
    const desktopSearchInput = document.querySelector('.search_container_new input');
    
    // Product display elements
    const productContainer = document.querySelector('.tab-pane.grid_view .row');
    const categoryTitle = document.querySelector('.current-category-title');

    // Get search parameter from URL
    function getSearchFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('search') || '';
    }

    // Update URL with search parameter (without page reload)
    function updateUrlWithSearch(searchTerm) {
        const url = new URL(window.location);
        if (searchTerm) {
            url.searchParams.set('search', searchTerm);
        } else {
            url.searchParams.delete('search');
        }
        window.history.replaceState({}, '', url);
    }

    // Mobile search toggle functionality
    if (mobileSearchToggle && dropdownSearch) {
        // Toggle dropdown on mobile search icon click
        mobileSearchToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropdownSearch.classList.toggle('active');
            if (dropdownSearch.classList.contains('active')) {
                mobileSearchInput.focus();
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdownSearch.contains(e.target) && !mobileSearchToggle.contains(e.target)) {
                dropdownSearch.classList.remove('active');
            }
        });
        
        // Prevent closing when clicking inside the dropdown
        dropdownSearch.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Wait for products to be loaded and check for search parameter
    function initializeSearch() {
        // Check if products are loaded from shop.js
        if (window.shopFunctions && window.shopFunctions.allProducts().length > 0) {
            allProducts = window.shopFunctions.allProducts();
            processSearchFromUrl();
        } else {
            // If shop.js hasn't loaded products yet, load them ourselves
            fetch('products.json')
                .then(response => response.json())
                .then(products => {
                    allProducts = products;
                    processSearchFromUrl();
                })
                .catch(error => console.error('Error loading products:', error));
        }
    }

    // Process search parameter from URL
    function processSearchFromUrl() {
        const urlSearchTerm = getSearchFromUrl();
        if (urlSearchTerm) {
            currentSearchTerm = urlSearchTerm.toLowerCase();
            // Populate search inputs with the URL search term
            if (mobileSearchInput) mobileSearchInput.value = urlSearchTerm;
            if (desktopSearchInput) desktopSearchInput.value = urlSearchTerm;
            
            // Display filtered products immediately
            filterAndDisplayProducts();
        }
        
        // Set up search functionality
        setupMobileSearch();
        setupDesktopSearch();
        syncSearchInputs();
    }

    // Set up mobile search functionality
    function setupMobileSearch() {
        if (!mobileSearchForm || !mobileSearchInput) {
            console.log('Mobile search elements not found');
            return;
        }

        // Mobile form submission handler
        mobileSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            currentSearchTerm = mobileSearchInput.value.trim().toLowerCase();
            updateUrlWithSearch(currentSearchTerm);
            filterAndDisplayProducts();
            
            // Close the dropdown after search
            if (dropdownSearch) {
                dropdownSearch.classList.remove('active');
            }
        });

        // Real-time search as user types on mobile
        mobileSearchInput.addEventListener('input', function() {
            const newSearchTerm = this.value.trim().toLowerCase();
            
            // Only update if search term actually changed
            if (newSearchTerm !== currentSearchTerm) {
                currentSearchTerm = newSearchTerm;
                updateUrlWithSearch(currentSearchTerm);
                
                // Clear any existing timeout
                if (window.searchTimeout) {
                    clearTimeout(window.searchTimeout);
                }
                
                // Debounce the search to avoid too many requests
                window.searchTimeout = setTimeout(() => {
                    if (currentSearchTerm.length >= 2 || currentSearchTerm.length === 0) {
                        filterAndDisplayProducts();
                    }
                }, 300);
            }
        });
    }

    // Set up desktop search functionality
    function setupDesktopSearch() {
        if (!desktopSearchForm || !desktopSearchInput) {
            console.log('Desktop search elements not found');
            return;
        }

        // Desktop form submission handler
        desktopSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            currentSearchTerm = desktopSearchInput.value.trim().toLowerCase();
            updateUrlWithSearch(currentSearchTerm);
            filterAndDisplayProducts();
        });

        // Real-time search as user types on desktop
        desktopSearchInput.addEventListener('input', function() {
            const newSearchTerm = this.value.trim().toLowerCase();
            
            // Only update if search term actually changed
            if (newSearchTerm !== currentSearchTerm) {
                currentSearchTerm = newSearchTerm;
                updateUrlWithSearch(currentSearchTerm);
                
                // Clear any existing timeout
                if (window.searchTimeout) {
                    clearTimeout(window.searchTimeout);
                }
                
                // Debounce the search to avoid too many requests
                window.searchTimeout = setTimeout(() => {
                    if (currentSearchTerm.length >= 2 || currentSearchTerm.length === 0) {
                        filterAndDisplayProducts();
                    }
                }, 300);
            }
        });
    }

    // Filter products based on search term
    function filterAndDisplayProducts() {
        if (!productContainer || !categoryTitle) {
            console.log('Product container or category title not found');
            return;
        }

        // Clear existing products
        productContainer.innerHTML = '';

        // Update category title
        if (currentSearchTerm) {
            categoryTitle.textContent = `Search Results for "${currentSearchTerm}"`;
        } else {
            categoryTitle.textContent = "All Products";
        }

        // Filter products
        const filteredProducts = currentSearchTerm 
            ? allProducts.filter(product => 
                product.name.toLowerCase().includes(currentSearchTerm) ||
                product.category.toLowerCase().includes(currentSearchTerm) ||
                (product.description && product.description.toLowerCase().includes(currentSearchTerm))
              )
            : allProducts;

        // Display filtered products
        filteredProducts.forEach(product => {
            const productHtml = `
                <div class="col-lg-4 col-md-4 col-sm-6">
                    <div class="single_product">
                        <div class="product_thumb">
                            <a class="primary_img">
                                <img src="${product.image_url}" alt="${product.name}" class="product-image-zoom">
                            </a>
                        </div>
                        <div class="product_content">
                            <div class="tag_cate">
                                <span>${product.category}</span>
                            </div>
                            <h3><a>${product.name}</a></h3>
                            <div class="price_box">
                                <span class="current_price" data-price="${product.price}">Ksh ${product.price.toLocaleString()}</span>
                            </div>
                            <div class="product_hover">
                                <div class="action_links">
                                    <ul>
                                        <li class="add_to_cart">
                                            <a href="#" class="add-to-cart-btn"
                                                data-product-id="prod${allProducts.indexOf(product) + 1}"
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
                                    data-product-id="prod${allProducts.indexOf(product) + 1}"
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
            productContainer.insertAdjacentHTML('beforeend', productHtml);
        });

        // Show "No products found" message if no results
        if (filteredProducts.length === 0 && currentSearchTerm) {
            productContainer.innerHTML = `
                <div class="col-12">
                    <div class="no-products-found text-center py-5">
                        <h4>No products found for "${currentSearchTerm}"</h4>
                        <p>Try adjusting your search terms or browse our categories.</p>
                    </div>
                </div>
            `;
        }

        // Update pagination if it exists
        if (window.shopFunctions && typeof window.shopFunctions.updatePaginationControls === 'function') {
            window.shopFunctions.updatePaginationControls(filteredProducts.length);
        }
    }

    // Sync search inputs (keeps both search bars in sync)
    function syncSearchInputs() {
        if (mobileSearchInput && desktopSearchInput) {
            mobileSearchInput.addEventListener('input', function() {
                desktopSearchInput.value = this.value;
            });
            
            desktopSearchInput.addEventListener('input', function() {
                mobileSearchInput.value = this.value;
            });
        }
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        const urlSearchTerm = getSearchFromUrl();
        currentSearchTerm = urlSearchTerm.toLowerCase();
        if (mobileSearchInput) mobileSearchInput.value = urlSearchTerm;
        if (desktopSearchInput) desktopSearchInput.value = urlSearchTerm;
        filterAndDisplayProducts();
    });

    // Initialize search functionality
    // Use setTimeout to ensure shop.js has time to load
    setTimeout(initializeSearch, 100);

    // Loading animation functions
    function showLoadingAnimation() {
        if (!productContainer) return;
        
        // Remove existing loading if any
        hideLoadingAnimation();
        
        productContainer.innerHTML = `
            <div class="col-12">
                <div class="search-loading-container text-center py-5">
                    <div class="search-loading-spinner">
                        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                            <span class="sr-only">Loading...</span>
                        </div>
                    </div>
                    <h4 class="mt-3 text-muted">Searching products...</h4>
                    <p class="text-muted">Please wait while we find what you're looking for</p>
                </div>
            </div>
        `;
        
        // Add loading styles if not already present
        if (!document.getElementById('search-loading-styles')) {
            const styles = document.createElement('style');
            styles.id = 'search-loading-styles';
            styles.textContent = `
                .search-loading-container {
                    min-height: 300px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                
                .search-loading-spinner .spinner-border {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .search-loading-spinner .spinner-border {
                    border: 0.25em solid rgba(0,0,0,.1);
                    border-right-color: transparent;
                    border-radius: 50%;
                    display: inline-block;
                    width: 3rem;
                    height: 3rem;
                }
                
                .search-loading-container h4 {
                    color: #6c757d;
                    font-weight: 600;
                    margin-top: 1rem;
                }
                
                .search-loading-container p {
                    color: #6c757d;
                    font-size: 0.9rem;
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    function hideLoadingAnimation() {
        // Loading will be replaced by actual content, so no need to explicitly hide
        // This function exists for consistency and future enhancements
    }
});