// Main JavaScript for Manush Website

document.addEventListener('DOMContentLoaded', function() {
    // Language Switcher
    const languageSwitchers = document.querySelectorAll('.language-switch .btn');
    
    languageSwitchers.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            
            // Remove active class from all buttons
            languageSwitchers.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Set language attribute on html tag
            document.documentElement.setAttribute('lang', lang);
            
            // Store language preference in localStorage
            localStorage.setItem('manush_language', lang);
            
            // Reload page to apply language changes
            // In a real implementation, this would dynamically change text content
            // location.reload();
        });
    });
    
    // Check for stored language preference
    const storedLanguage = localStorage.getItem('manush_language');
    if (storedLanguage) {
        document.documentElement.setAttribute('lang', storedLanguage);
        
        languageSwitchers.forEach(btn => {
            if (btn.getAttribute('data-lang') === storedLanguage) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    // Mobile Menu Toggle
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            const navbarCollapse = document.querySelector('.navbar-collapse');
            navbarCollapse.classList.toggle('show');
        });
    }
    
    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Form Validation
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        }, false);
    });
    
    // Payment Method Selection
    const paymentMethods = document.querySelectorAll('.payment-method-item');
    
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            // Remove active class from all methods
            paymentMethods.forEach(m => {
                m.classList.remove('active');
            });
            
            // Add active class to clicked method
            this.classList.add('active');
            
            // Set payment method value in hidden input
            const paymentMethodInput = document.querySelector('#payment_method');
            if (paymentMethodInput) {
                paymentMethodInput.value = this.getAttribute('data-method');
            }
        });
    });
    
    // Service Booking Date/Time Picker
    const bookingDateInput = document.querySelector('#booking_date');
    const bookingTimeInput = document.querySelector('#booking_time');
    
    if (bookingDateInput) {
        // Set min date to today
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        
        bookingDateInput.setAttribute('min', `${yyyy}-${mm}-${dd}`);
    }
    
    // Animation on Scroll
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    function checkIfInView() {
        const windowHeight = window.innerHeight;
        const windowTopPosition = window.scrollY;
        const windowBottomPosition = windowTopPosition + windowHeight;
        
        animateElements.forEach(element => {
            const elementHeight = element.offsetHeight;
            const elementTopPosition = element.offsetTop;
            const elementBottomPosition = elementTopPosition + elementHeight;
            
            // Check if element is in viewport
            if (
                (elementBottomPosition >= windowTopPosition) &&
                (elementTopPosition <= windowBottomPosition)
            ) {
                element.classList.add('fade-in');
            }
        });
    }
    
    // Run on page load
    checkIfInView();
    
    // Run on scroll
    window.addEventListener('scroll', checkIfInView);
    
    // Service Search Functionality
    const searchForm = document.querySelector('.search-box form');
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const searchQuery = this.querySelector('input[name="query"]').value;
            if (searchQuery.trim() === '') return;
            
            // Redirect to search results page with query parameter
            window.location.href = `/services.html?search=${encodeURIComponent(searchQuery)}`;
        });
    }
    
    // Category Filter Functionality
    const categoryFilters = document.querySelectorAll('.filter-group input[type="checkbox"]');
    
    categoryFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            // In a real implementation, this would filter the services list
            // For now, we'll just log the selected categories
            const selectedCategories = [];
            
            categoryFilters.forEach(checkbox => {
                if (checkbox.checked) {
                    selectedCategories.push(checkbox.value);
                }
            });
            
            console.log('Selected Categories:', selectedCategories);
        });
    });
    
    // Price Range Filter
    const priceRange = document.querySelector('#price_range');
    const priceRangeValue = document.querySelector('#price_range_value');
    
    if (priceRange && priceRangeValue) {
        priceRange.addEventListener('input', function() {
            priceRangeValue.textContent = this.value + ' ৳';
        });
    }
    
    // Rating Filter
    const ratingFilters = document.querySelectorAll('.rating-filter input[type="radio"]');
    
    ratingFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            // In a real implementation, this would filter the services list
            // For now, we'll just log the selected rating
            console.log('Minimum Rating:', this.value);
        });
    });
    
    // Service Provider Profile Tabs
    const profileTabs = document.querySelectorAll('.profile-tabs .nav-link');
    
    profileTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            profileTabs.forEach(t => {
                t.classList.remove('active');
                const tabContent = document.querySelector(t.getAttribute('href'));
                if (tabContent) {
                    tabContent.classList.remove('show', 'active');
                }
            });
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding tab content
            const targetContent = document.querySelector(this.getAttribute('href'));
            if (targetContent) {
                targetContent.classList.add('show', 'active');
            }
        });
    });
});
