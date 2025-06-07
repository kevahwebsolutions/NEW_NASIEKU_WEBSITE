document.addEventListener('DOMContentLoaded', function() {
    // Cart array to store products
    let cart = JSON.parse(localStorage.getItem('nasieku_cart')) || [];
    
    // Notification elements with null checks
    const cartNotification = document.getElementById('cartNotification');
    let notificationMessage = null;
    
    if (cartNotification) {
        notificationMessage = cartNotification.querySelector('.notification-message');
    }
    
    // Function to show notification
    function showNotification(message) {
        if (cartNotification && notificationMessage) {
            notificationMessage.textContent = message;
            cartNotification.classList.add('show');
            
            setTimeout(() => {
                cartNotification.classList.remove('show');
            }, 3000);
        }
    }
    
    // Update cart display
    function updateCartDisplay() {
        const cartContainer = document.querySelector('.cart_items_container');
        const cartQuantity = document.querySelector('.cart_quantity');
        const cartSubtotal = document.querySelector('.cart_subtotal');
        const cartTotal = document.querySelector('.cart_link .cart_text_quantity');
        
        // Clear existing items
        if (cartContainer) cartContainer.innerHTML = '';
        
        let totalQuantity = 0;
        let subtotal = 0;
        
        // Add each item to cart display
        cart.forEach(item => {
            if (!item) return;
            
            const itemTotal = parseFloat(item.price) * parseInt(item.quantity);
            const cartItemHTML = `
                <div class="cart_item" data-product-id="${item.id}">
                    <div class="cart_img">
                        <a href="#"><img src="${item.img}" alt="${item.name}" class="cart-item-image"></a>
                    </div>
                    <div class="cart_info">
                        <a href="#">${item.name}</a>
                        <span class="quantity">Qty: ${item.quantity}</span>
                        <span class="price_cart">Ksh ${itemTotal.toLocaleString()}</span>
                    </div>
                    <div class="cart_remove">
                        <a href="#" class="remove-item"><i class="ion-android-close"></i></a>
                    </div>
                </div>
            `;
            if (cartContainer) cartContainer.insertAdjacentHTML('beforeend', cartItemHTML);
            
            totalQuantity += parseInt(item.quantity);
            subtotal += itemTotal;
        });
        
        // Update totals
        if (cartQuantity) cartQuantity.textContent = totalQuantity;
        if (cartSubtotal) cartSubtotal.textContent = 'Ksh ' + subtotal.toLocaleString();
        if (cartTotal) cartTotal.textContent = 'Ksh ' + subtotal.toLocaleString();
        
        localStorage.setItem('nasieku_cart', JSON.stringify(cart));
    }
    
    // Add to cart functionality
    document.addEventListener('click', function(e) {
        // Handle Add to Cart clicks
        const addToCartBtn = e.target.closest('.add-to-cart-btn');
        if (addToCartBtn) {
            e.preventDefault();
            
            // Get the product card element
            const productCard = addToCartBtn.closest('.single_product');
            
            // Get product details
            const productName = productCard.querySelector('h3 a').textContent;
            const productImg = productCard.querySelector('.primary_img img').src;
            const productPrice = parseFloat(productCard.querySelector('.current_price').dataset.price);
            
            // Generate unique ID
            const productId = 'prod_' + 
                productName.replace(/\s+/g, '_').toLowerCase() + '_' + 
                productImg.split('/').pop().split('.')[0];
            
            const product = {
                id: productId,
                name: productName,
                price: productPrice,
                img: productImg,
                quantity: 1
            };
            
            // Check if product exists in cart
            const existingItemIndex = cart.findIndex(item => item.id === product.id);
            if (existingItemIndex !== -1) {
                cart[existingItemIndex].quantity += 1;
                showNotification(`${product.name} quantity updated to ${cart[existingItemIndex].quantity}`);
            } else {
                cart.push(product);
                showNotification(`${product.name} added to cart!`);
            }
            
            updateCartDisplay();
        }
        
        // Handle Remove Item clicks
        const removeItemBtn = e.target.closest('.remove-item');
        if (removeItemBtn) {
            e.preventDefault();
            const cartItem = removeItemBtn.closest('.cart_item');
            const productId = cartItem.dataset.productId;
            const productName = cartItem.querySelector('.cart_info a').textContent;
            
            cart = cart.filter(item => item.id !== productId);
            updateCartDisplay();
            showNotification(`${productName} removed from cart`);
        }
    });
    
    // Initialize cart display
    updateCartDisplay();
});