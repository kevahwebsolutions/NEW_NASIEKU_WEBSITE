document.addEventListener('DOMContentLoaded', function() {
    // Load cart from localStorage
    let cart = JSON.parse(localStorage.getItem('nasieku_cart')) || [];
    
    // Get DOM elements
    const cartTableBody = document.querySelector('.cart_page tbody');
    const subtotalElement = document.querySelector('.cart_subtotal .cart_amount');
    const checkoutBtn = document.querySelector('.checkout_btn a');

    // Function to calculate subtotal
    function calculateSubtotal() {
        return cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Function to update cart display
    function updateCartDisplay() {
        // Clear existing rows
        if (!cartTableBody) return;
        cartTableBody.innerHTML = '';
        
        // Calculate subtotal
        const subtotal = calculateSubtotal();
        
        // Add each cart item to the table
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="product_remove">
                    <a href="#" class="remove-item" data-index="${index}">
                        <i class="fa fa-trash-o"></i>
                    </a>
                </td>
                <td class="product_thumb">
                    <a href="#"><img src="${item.img}" alt="${item.name}" style="width:80px;height:80px;object-fit:cover;"></a>
                </td>
                <td class="product_name">
                    <a href="#">${item.name}</a>
                </td>
                <td class="product-price">Ksh ${item.price.toLocaleString()}</td>
                <td class="product_quantity">
                    <label>Quantity</label>
                    <input min="1" value="${item.quantity}" type="number" 
                           class="quantity-input" data-index="${index}">
                </td>
                <td class="product_total">Ksh ${itemTotal.toLocaleString()}</td>
            `;
            cartTableBody.appendChild(row);
        });

        // Update subtotal
        if (subtotalElement) {
            subtotalElement.textContent = `Ksh ${subtotal.toLocaleString()}`;
        }

        // Save cart to localStorage
        localStorage.setItem('nasieku_cart', JSON.stringify(cart));
    }

    // Event delegation for dynamic elements
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('quantity-input')) {
            const index = e.target.dataset.index;
            const newQuantity = parseInt(e.target.value);
            
            if (newQuantity > 0) {
                cart[index].quantity = newQuantity;
                updateCartDisplay();
                alert('Quantity updated');
            } else {
                e.target.value = cart[index].quantity;
            }
        }
    });

    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            e.preventDefault();
            const index = e.target.closest('.remove-item').dataset.index;
            cart.splice(index, 1);
            updateCartDisplay();
            alert('Item removed from cart');
        }
    });

    // Checkout button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            if (cart.length === 0) {
                e.preventDefault();
                alert('Your cart is empty. Please add items before checkout.');
            }
        });
    }

    // Initialize cart display
    updateCartDisplay();
});