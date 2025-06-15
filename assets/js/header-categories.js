document.addEventListener("DOMContentLoaded", () => {
    // Category navigation links
    document.querySelectorAll('.header-category').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;
            window.location.href = `shop.html?category=${encodeURIComponent(category)}`;
        });
    });

    // Get category from URL
    function getCategoryFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('category') || 'all';
    }

    // Load products
    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            const category = getCategoryFromURL().toLowerCase();
            let filteredProducts = category === 'all'
                ? products
                : products.filter(p => p.category.toLowerCase() === category);

            updateCategoryTitle(category);
            renderProducts(filteredProducts);
        });

    // Update the visible heading
function updateCategoryTitle(category) {
    const titleEl = document.querySelector('.current-category-title');
    if (!titleEl) return;

    const params = new URLSearchParams(window.location.search);
    const label = params.get('label');

    titleEl.textContent = category === 'all'
        ? 'All Products'
        : label
            ? decodeURIComponent(label)
            : category.charAt(0).toUpperCase() + category.slice(1);
}


    // Render filtered products
    function renderProducts(products) {
        const container = document.querySelector('.tab-pane.grid_view .row');
        if (!container) return;
        container.innerHTML = '';

        if (products.length === 0) {
            container.innerHTML = '<p class="col-12">No products found in this category.</p>';
            return;
        }

        products.forEach(product => {
            container.innerHTML += `
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
        });
    }
});