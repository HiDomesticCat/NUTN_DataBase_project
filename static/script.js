// When the page loads, initialize the categories and set the theme
window.onload = function() {
    loadCategories();
    initializeTheme();
}

// Function to toggle the main content (right panel)
function toggleMainContent() {
    const container = document.querySelector('.container');
    container.classList.toggle('collapsed');
    const resizeEvent = new Event('resize');
    window.dispatchEvent(resizeEvent);
}

// Function to toggle the theme
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-theme');
    const themeToggleBtn = document.getElementById('themeToggle');
    // Save the user's theme preference
    if (body.classList.contains('dark-theme')) {
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.innerHTML = '&#9788;'; // Sun symbol
    } else {
        localStorage.setItem('theme', 'light');
        themeToggleBtn.innerHTML = '&#9790;'; // Moon symbol
    }
}

// Initialize the theme based on user's preference
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const body = document.body;
    const themeToggleBtn = document.getElementById('themeToggle');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '&#9788;'; // Sun symbol
    } else {
        body.classList.remove('dark-theme');
        themeToggleBtn.innerHTML = '&#9790;'; // Moon symbol
    }
}

// Fetch product suggestions based on the search input
async function fetchSuggestions() {
    const query = document.getElementById('productSearch').value;
    const suggestionsDiv = document.getElementById('suggestions');

    // Hide suggestions if query is less than 2 characters
    if (query.length < 2) {
        suggestionsDiv.classList.remove('show');
        return;
    }

    try {
        const response = await fetch(`/products?name=${encodeURIComponent(query)}`);
        const results = await response.json();

        suggestionsDiv.innerHTML = '';

        if (response.ok) {
            if (results.length > 0) {
                results.forEach(product => {
                    const div = document.createElement('div');
                    div.textContent = product.Name;
                    div.onclick = () => selectSuggestion(product.Name);
                    suggestionsDiv.appendChild(div);
                });
                suggestionsDiv.classList.add('show');
            } else {
                suggestionsDiv.classList.remove('show');
            }
        } else {
            suggestionsDiv.innerHTML = `<div>${results.error}</div>`;
            suggestionsDiv.classList.add('show');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Error fetching suggestions. Please check your internet connection and try again.');
    }
}

// When a suggestion is selected
function selectSuggestion(name) {
    document.getElementById('productSearch').value = name;
    document.getElementById('suggestions').classList.remove('show');
    fetchProductDetails(name);
}

// Fetch and display product details
async function fetchProductDetails(name) {
    try {
        const response = await fetch(`/products?name=${encodeURIComponent(name)}`);
        const results = await response.json();

        if (response.ok && results.length > 0) {
            showModal(results[0]);
        } else {
            alert('Product details not found.');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Unable to fetch product details.');
    }
}

// Display the product details in a modal
function showModal(product) {
    const modal = document.getElementById('productModal');
    const productDetailsDiv = document.getElementById('productDetails');

    // Populate the modal with product details
    productDetailsDiv.innerHTML = `
        <h2>${product.Name}</h2>
        <img src="${product.ImageURL || 'default-image.jpg'}" alt="${product.Name}" />
        <p>Price: ${product.Price}</p>
        <p>Category: ${product.CategoryID}</p>
        <p>Location: ${product.Location}</p>
        <p>Description: ${product.Description || 'No description available'}</p>
        <button onclick="addToCart(${product.ProductID})">Add to Cart</button>
    `;

    // Show the modal
    modal.style.display = 'block';
}

// Close the modal
function closeModal() {
    const modal = document.getElementById('productModal');
    modal.style.display = 'none';
}

// Add product to cart
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Product added to cart.');
}

// View the cart content
async function viewCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
    }
    try {
        const response = await fetch('/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds: cart })
        });
        const products = await response.json();
        if (response.ok) {
            displayCart(products);
        } else {
            alert('Unable to fetch cart contents.');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Unable to fetch cart contents.');
    }
}

// Display the cart products in the modal
function displayCart(products) {
    const modal = document.getElementById('productModal');
    const productDetailsDiv = document.getElementById('productDetails');

    if (products.length > 0) {
        productDetailsDiv.innerHTML = '<h2>Cart Contents</h2>';
        products.forEach(product => {
            productDetailsDiv.innerHTML += `
                <div>
                    <h3>${product.Name}</h3>
                    <p>Price: ${product.Price}</p>
                </div>
            `;
        });
        // Show the modal
        modal.style.display = 'block';
    } else {
        modal.style.display = 'none';
    }
}

// Load categories for the filter dropdown
async function loadCategories() {
    try {
        const response = await fetch('/categories');
        const categories = await response.json();
        if (response.ok) {
            const categoryFilter = document.getElementById('categoryFilter');
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.CategoryID;
                option.textContent = category.CategoryName;
                categoryFilter.appendChild(option);
            });
        } else {
            console.error('Unable to load categories.');
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Filter products by category
async function filterByCategory() {
    const categoryId = document.getElementById('categoryFilter').value;
    try {
        let url = '/products';
        if (categoryId) {
            url += `?category=${categoryId}`;
        }
        const response = await fetch(url);
        const products = await response.json();
        if (response.ok) {
            displayProducts(products);
        } else {
            console.error('Unable to fetch products.');
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Display products in the #results section
function displayProducts(products) {
    const resultsDiv = document.getElementById('results');
    if (products.length > 0) {
        resultsDiv.innerHTML = '';
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product-item');
            productDiv.onclick = () => showModal(product);
            productDiv.innerHTML = `
                <div>
                    <h3>${product.Name}</h3>
                    <p>Price: ${product.Price}</p>
                </div>
                <img src="${product.ImageURL || 'default-image.jpg'}" alt="${product.Name}" />
            `;
            resultsDiv.appendChild(productDiv);
        });
        resultsDiv.style.display = 'block'; // Show the #results section
    } else {
        resultsDiv.style.display = 'none'; // Hide the #results section if no products are available
    }
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
