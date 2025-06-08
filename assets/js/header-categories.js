document.addEventListener('DOMContentLoaded', function() {
    // Handle header category clicks
    document.querySelectorAll('.header-category').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            
            // Store both the category and a flag that we're coming from header nav
            localStorage.setItem('selectedCategory', category);
            localStorage.setItem('fromHeaderNav', 'true');
            
            // Navigate to shop page
            window.location.href = 'shop.html';
        });
    });
});