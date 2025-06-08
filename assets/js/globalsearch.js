document.addEventListener('DOMContentLoaded', function() {
    // Mobile search elements
    const mobileSearchToggle = document.querySelector('.mobile-search-toggle');
    const dropdownSearch = document.querySelector('.dropdown_search');
    const mobileSearchForm = document.querySelector('.dropdown_search form');
    const mobileSearchInput = document.querySelector('.dropdown_search input');
    
    // Desktop search elements
    const desktopSearchForm = document.querySelector('.search_container_new form');
    const desktopSearchInput = document.querySelector('.search_container_new input');

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

    // Set up mobile search functionality
    function setupMobileSearch() {
        if (!mobileSearchForm || !mobileSearchInput) {
            console.log('Mobile search elements not found');
            return;
        }

        // Mobile form submission handler
        mobileSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = mobileSearchInput.value.trim();
            if (searchTerm) {
                // Redirect to shop.html with search parameter
                window.location.href = `shop.html?search=${encodeURIComponent(searchTerm)}`;
            }
        });

        // Optional: Real-time search redirect (uncomment if you want instant redirect)
        /*
        mobileSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const searchTerm = this.value.trim();
                if (searchTerm) {
                    window.location.href = `shop.html?search=${encodeURIComponent(searchTerm)}`;
                }
            }
        });
        */
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
            const searchTerm = desktopSearchInput.value.trim();
            if (searchTerm) {
                // Redirect to shop.html with search parameter
                window.location.href = `shop.html?search=${encodeURIComponent(searchTerm)}`;
            }
        });

        // Optional: Real-time search redirect (uncomment if you want instant redirect)
        /*
        desktopSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const searchTerm = this.value.trim();
                if (searchTerm) {
                    window.location.href = `shop.html?search=${encodeURIComponent(searchTerm)}`;
                }
            }
        });
        */
    }

    // Sync search inputs (optional - keeps both search bars in sync)
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

    // Initialize search functionality
    setupMobileSearch();
    setupDesktopSearch();
    syncSearchInputs();
});