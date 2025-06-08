document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let allProducts = [];
    let currentPage = 1;
    const productsPerPage = 12;
    let currentCategory = null;

    // Fetch products from JSON file
    fetch('products.json')
    .then(response => response.json())
    .then(products => {
        allProducts = products;
        
        // Check if we came from header navigation - READ ONCE AND USE
        const fromHeaderNav = localStorage.getItem('fromHeaderNav') === 'true';
        const storedCategory = localStorage.getItem('selectedCategory');
        
        // Clear the flags after reading
        localStorage.removeItem('fromHeaderNav');
        localStorage.removeItem('selectedCategory');
        
        // If coming from header nav with a category, display that category
        if (fromHeaderNav && storedCategory) {
            const category = storedCategory === 'all' ? null : storedCategory;
            displayProducts(allProducts, category);
        } 
        // Otherwise show all products (default behavior)
        else {
            displayProducts(allProducts);
        }
        
        // Set up category filters
        setupCategoryFilters(allProducts);
    })
    .catch(error => console.error('Error loading products:', error));

    // Function to display products with pagination
    function displayProducts(products, category = null, page = 1) {
        const container = document.querySelector('.tab-pane.grid_view .row');
        const categoryTitle = document.querySelector('.current-category-title');
        container.innerHTML = ''; // Clear existing products
        
        // Update current category and page
        currentCategory = category;
        currentPage = page;
        
        // Update category title
        if (category) {
            const categoryMap = {
                "clothing and fashion": "Clothes & Fashion",
                "bags": "Bags",
                "home decor": "Home Decor & Entertainment",
                "jewelry": "Jewelry & Accessories",
                "art": "African Art & Collectibles",
            };
            categoryTitle.textContent = categoryMap[category] || category;
        } else {
            categoryTitle.textContent = "All Products";
        }
        
        // Filter by category if specified
        const filteredProducts = category 
            ? products.filter(product => product.category.toLowerCase() === category.toLowerCase())
            : products;
        
        // Calculate pagination
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        const startIndex = (page - 1) * productsPerPage;
        const endIndex = Math.min(startIndex + productsPerPage, filteredProducts.length);
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        // Generate HTML for each product
        paginatedProducts.forEach(product => {
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
                                                data-product-id="prod${products.indexOf(product) + 1}"
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
                                    data-product-id="prod${products.indexOf(product) + 1}"
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
            container.insertAdjacentHTML('beforeend', productHtml);
        });
        
        // Update pagination controls
        updatePaginationControls(filteredProducts.length);
    }

    // Function to update pagination controls
    function updatePaginationControls(totalProducts) {
        const paginationContainer = document.querySelector('.shop_toolbar.t_bottom .pagination ul');
        if (!paginationContainer) {
            console.error('Pagination container not found');
            return;
        }
        
        const totalPages = Math.ceil(totalProducts / productsPerPage);
        let paginationHTML = '';
        
        // Previous button
        if (currentPage > 1) {
            paginationHTML += `
                <li class="prev">
                    <a href="#" data-page="${currentPage - 1}">
                        <i class="ion-ios-arrow-left"></i>
                    </a>
                </li>
            `;
        }
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        if (startPage > 1) {
            paginationHTML += '<li><a href="#" data-page="1">1</a></li>';
            if (startPage > 2) {
                paginationHTML += '<li class="dots"><span>...</span></li>';
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            if (i === currentPage) {
                paginationHTML += `<li class="current">${i}</li>`;
            } else {
                paginationHTML += `<li><a href="#" data-page="${i}">${i}</a></li>`;
            }
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += '<li class="dots"><span>...</span></li>';
            }
            paginationHTML += `<li><a href="#" data-page="${totalPages}">${totalPages}</a></li>`;
        }
        
        // Next button
        if (currentPage < totalPages) {
            paginationHTML += `
                <li class="next">
                    <a href="#" data-page="${currentPage + 1}">
                        <i class="ion-ios-arrow-right"></i>
                    </a>
                </li>
            `;
        }
        
        paginationContainer.innerHTML = paginationHTML;
        
        // Add event listeners to pagination links
        document.querySelectorAll('.pagination a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const page = parseInt(this.getAttribute('data-page'));
                displayProducts(allProducts, currentCategory, page);
            });
        });
    }

    // Function to set up category filters
    function setupCategoryFilters(products) {
        const categoryLinks = document.querySelectorAll('.widget_categories a');
        
        // Add "All Products" link
        const allProductsLink = document.createElement('li');
        allProductsLink.innerHTML = '<a href="#" class="show-all">All Products</a>';
        document.querySelector('.widget_categories ul').prepend(allProductsLink);
        
        // Handle "All Products" click
        document.querySelector('.show-all').addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.widget_categories a').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
            displayProducts(products);
        });

        categoryLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const categoryText = this.textContent.trim();
                
                // Remove active class from all
                document.querySelectorAll('.widget_categories a').forEach(link => {
                    link.classList.remove('active');
                });
                
                // Add active to clicked
                this.classList.add('active');
                
                // Map sidebar categories to your data categories
                const categoryMap = {
                    "Clothes & Fashion": "clothing and fashion",
                    "Bags": "bags",
                    "Home Decor & Entertainment": "home decor",
                    "Jewelry & Accessories": "jewelry",
                    "African Art & Collectibles": "art",
                    "Corporate": "corporate"
                };
                
                const dataCategory = categoryMap[categoryText] || categoryText.toLowerCase();
                displayProducts(products, dataCategory);
            });
        });
    }
});