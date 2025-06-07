document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let allProducts = [];
    let currentSearchTerm = '';
    
    // Search elements
    const mobileToggle = document.querySelector('.mobile-search-toggle');
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search_box input');
    const searchFormElement = document.querySelector('.search-form');
    
    // Product display elements
    const productContainer = document.querySelector('.tab-pane.grid_view .row');
    const categoryTitle = document.querySelector('.current-category-title');

    // Mobile search toggle functionality
    if (mobileToggle && searchForm) {
        // Toggle search form on mobile
        mobileToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            searchForm.classList.toggle('active');
            if (searchForm.classList.contains('active')) {
                searchInput.focus();
            }
        });
        
        // Close search when clicking outside
        document.addEventListener('click', function() {
            searchForm.classList.remove('active');
        });
        
        // Prevent closing when clicking inside the form
        searchForm.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Fetch products from JSON file
    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            allProducts = products;
            setupSearch();
        })
        .catch(error => console.error('Error loading products:', error));

    // Set up search functionality
    function setupSearch() {
        if (!searchFormElement || !searchInput) {
            console.log('Search elements not found');
            return;
        }

        // Form submission handler
        searchFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            currentSearchTerm = searchInput.value.trim().toLowerCase();
            filterAndDisplayProducts();
            
            // On mobile, close the search after submitting
            if (window.innerWidth <= 767) {
                searchForm.classList.remove('active');
            }
        });

        // Real-time search as user types
        searchInput.addEventListener('input', function() {
            currentSearchTerm = this.value.trim().toLowerCase();
            if (currentSearchTerm.length >= 3 || currentSearchTerm.length === 0) {
                filterAndDisplayProducts();
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

        // Update pagination if it exists
        if (typeof updatePaginationControls === 'function') {
            updatePaginationControls(filteredProducts.length);
        }
    }
});