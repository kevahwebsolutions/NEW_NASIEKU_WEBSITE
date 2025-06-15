(async function () {
  const response = await fetch('/products.json');
  const all = await response.json();

  // Shuffle products
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }

  const chunked = (arr, size) =>
    Array.from({ length: 3 }, (_, i) => arr.slice(i * size, i * size + size));

  const [featured, arrivals, onsale] = chunked(all, 12);

  renderProducts('featured', featured);
  renderProducts('arrivals', arrivals);
  renderProducts('onsale', onsale);
})();

function renderProducts(tabId, products) {
  const container = document
    .getElementById(tabId)
    .querySelector('.product_container .product_column3');

  container.innerHTML = '';

  products.forEach((product) => {
    const col = document.createElement('div');
    col.className = 'custom-col-5';

    // Generate a unique product ID for cart.js compatibility
    const productId = `prod_${slugify(product.name)}_${product.image_url.split('/').pop().split('.')[0]}`;

    col.innerHTML = `
      <div class="single_product">
        <div class="product_thumb">
          <a class="primary_img">
            <img src="${product.image_url}" alt="${product.name}">
          </a>
        </div>
        <div class="product_content">
          <div class="tag_cate"><span>${capitalize(product.category)}</span></div>
          <h3><a>${product.name}</a></h3>
          <div class="price_box">
            <span class="current_price" data-price="${product.price}">Ksh ${formatPrice(product.price)}</span>
          </div>
          <div class="product_hover">
            <div class="action_links">
              <ul>
                <li class="add_to_cart">
                  <a href="#" class="add-to-cart-btn"
                     data-product-id="${productId}"
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
               data-product-id="${productId}"
               data-product-name="${product.name}"
               data-product-price="${product.price}"
               data-product-img="${product.image_url}">
              Add to Cart
            </a>
          </div>
        </div>
      </div>`;
    container.appendChild(col);
  });
}

function formatPrice(price) {
  return parseFloat(price.toString().replace(/[^\d.]/g, '')).toLocaleString();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
}

