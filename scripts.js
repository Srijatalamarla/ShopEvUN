// responsive navbar

function toggleMenu() {
    const menuBtn = document.querySelector('#menu-icon');
    const closeBtn = document.querySelector('#close');
    const navLink = document.querySelectorAll('.nav-link');
    const navBar = document.querySelector('.nav-links');
    if (menuBtn.className === "menu-icon" && closeBtn.className === "close") {
        menuBtn.className += " deactivate";
        closeBtn.className += " activate";
        navLink.forEach((link) => {
            link.className += " active";
        });
        navBar.className += " active";
    }
    else {
        closeBtn.classList.remove("activate");
        menuBtn.classList.remove("deactivate");
        navLink.forEach((link) => {
            link.classList.remove("active");
        });
        navBar.classList.remove("active");
    }
}

const productContainer = document.querySelector('.product-container');
const cartContainer = document.querySelector('.cart-container');
const cartIcon = document.getElementById('cart-count');
const categoriesSection = document.querySelector('.categories');
const categoriesContainer = document.querySelector('.categories-container');

const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const scrollAmount = 300;

const modal = document.getElementById('productModal');
const closeModalBtn = document.querySelector('.close-modal');

const featuredProductsContainer = document.querySelector('.featured-products-container');
const noProductDiv = document.querySelector('.no-products-available');
const loadBtn = document.querySelector('#load-btn');
const applyFiltersBtn = document.querySelector('#applyFilters');
const searchBtn = document.querySelector('#search-icon');

let products = [];

//fetch products from API
const fetchProducts = async () => {
    const response = await fetch('https://dummyjson.com/products?limit=0');
    const data = await response.json();
    products = data.products;
}

document.addEventListener('DOMContentLoaded', async () => {

    await fetchProducts();

    //if on products.html page
    if (productContainer) {

        populateCategoryFilterDropDown();

        const category = getQueryParam('category');
        const searchProductTitle = getQueryParam('search');

        if (category) {
            fetchProductsByCategory(category);
        }
        else if (searchProductTitle) {
            const searchedProduct = products.filter((product) => product.title.toLowerCase() === searchProductTitle);
            if (searchedProduct) {
                // Clear existing products
                const modalHTML = modal;
                productContainer.innerHTML = '';
                productContainer.appendChild(modalHTML);
                noProductDiv.style.display = 'none';
                loadBtn.style.display = 'none';

                displayProducts(searchedProduct);
            }
        }
        else {
            loadProducts(); //loads all products
        }

        const filterIcon = document.querySelector('#filter-icon');

        filterIcon.addEventListener("click", () => {
            if (window.innerWidth > 768) {
                filterIcon.classList.add('disable');
            }
            //on smaller screens
            else {
                if (filterIcon.classList.contains('disable')) {
                    filterIcon.classList.remove('disable');
                }
                document.querySelector('.filters').classList.toggle('active');
            }
        });

        applyFiltersBtn.addEventListener("click", (event) => {
            event.preventDefault();
            const filterCategoryValue = document.querySelector('#prod-category-filter').value;
            const filterSortByValue = document.querySelector('#prod-sort-filter').value;
            const filterOrderValue = document.querySelector('#prod-order-filter').value;

            filterProducts(filterCategoryValue, filterSortByValue, filterOrderValue);
        });

        loadBtn.addEventListener("click", loadProducts);

    }

    //if on cart.html page
    if (cartContainer) {
        cart = JSON.parse(sessionStorage.getItem('cart')) || [];
        updateCartCount();
        updateCartUI();
    }

    //works on all pages - updates cart count
    if (cartIcon) {
        updateCartCount();
    }

    //if on index.html
    if (categoriesSection) {

        // display categories
        displayCategories(categoriesContainer);

        categoriesContainer.addEventListener('scroll', updateScrollButtonVisibility);

        //categories scroll
        prevBtn.addEventListener('click', () => {
            stopAutoScroll();
            categoriesContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            updateScrollButtonVisibility();
        });

        nextBtn.addEventListener('click', () => {
            stopAutoScroll();
            categoriesContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            updateScrollButtonVisibility();
        });

        categoriesContainer.addEventListener('mouseenter', stopAutoScroll);
        categoriesContainer.addEventListener('mouseleave', startAutoScroll);


        categoriesContainer.addEventListener('scroll', highlightCategory);
    }

    //featured products on index.html
    if (featuredProductsContainer) {
        displayFeaturedProducts();
    }

    //if product modal is on screen
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.onclick = (event) => {
            const matchedProductsList = document.querySelector('.match-prod-list');
            // console.log(matchedProductsList.childNodes.length);
            if (matchedProductsList !== null && matchedProductsList.childNodes.length > 0) {
                matchedProductsList.innerHTML = ``;

                const searchInput = document.querySelector('#search-space');
                searchInput.value = ``;
            }
            if (event.target === modal)
                modal.style.display = 'none';
        }
    }

});


// display products on products.html

let skip = 0;
const limit = 20;

function loadProducts() {
    if (products.length <= skip) {
        //display remaining products
        displayProducts(products.slice(skip, products.length));
        //no more products
        window.alert("no more products avaailable");
        return;
    }
    const currProducts = products.slice(skip, skip + limit);
    noProductDiv.style.display = 'none';
    loadBtn.style.display = 'block';
    displayProducts(currProducts);
    skip += limit;
}

function getStockStatus(stock) {
    if (stock === 0) {
        return { stockStatusClass: 'out-of-stock', stockText: 'Out of Stock' };
    } else if (stock <= 5) {
        return { stockStatusClass: 'low-stock', stockText: 'Low Stock' };
    } else {
        return { stockStatusClass: 'in-stock', stockText: 'In Stock' };
    }
}


function displayProducts(products) {

    products.forEach(product => {
        const productCard = document.createElement('div');

        productCard.classList.add('product-card');

        const starsHTML = generateRatingStars(product.rating);

        //product stock availability status
        const { stockStatusClass, stockText } = getStockStatus(product.stock);
        const isOutOfStock = (stockStatusClass === 'out-of-stock');

        const addToCartDisabled = isOutOfStock ? 'disabled' : '';

        if (isOutOfStock) {
            productCard.classList.add('product-out-of-stock');
        }

        productCard.innerHTML = `
            <div class="stock-status ${stockStatusClass}">${stockText}</div>
            <img src="${product.thumbnail}" alt="${product.title}" class="product-thumbnail"/>
            <div class="product-content">
                <h2 class="product-title">
                    ${product.title}
                </h2>
                <p class="product-price">
                    Price: $${product.price}
                </p>
                <div class="product-status">
                    <span class="rating">${starsHTML} (${product.rating})</span>
                </div>
                <div class="product-actions">
                    <button class="product-add-to-cart-btn" ${addToCartDisabled}>Add to Cart</button>
                    <button class="product-view-details-btn">View Details</button>
                </div>
            </div>
        `;

        productCard.addEventListener("click", () => {
            showProductDetails(product.id);
        });

        const addToCartBtn = productCard.querySelector('.product-add-to-cart-btn');
        addToCartBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            addToCart(product.id);
        });

        const viewDetailsBtn = productCard.querySelector('.product-view-details-btn');
        viewDetailsBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            showProductDetails(product.id);
        });

        productContainer.appendChild(productCard);
    });
}

function showProductDetails(productId) {
    const product = products.find((product) => product.id === productId);

    const starsHTML = generateRatingStars(product.rating);

    const isNotBrand = (product.brand === undefined);

    const { stockStatusClass, stockText } = getStockStatus(product.stock);
    const isOutOfStock = (stockStatusClass === 'out-of-stock');
    const addToCartDisabled = isOutOfStock ? 'disabled' : '';

    const modalBody = document.querySelector('.modal-body');

    if (isOutOfStock) {
        modalBody.classList.add('product-out-of-stock');
    }

    modalBody.innerHTML = `
                <div class="modal-product-details">
                    <div class="product-gallery">
                        <img src="${product.images[0]}" alt="${product.title}" class="modal-product-image"/>
                    </div>
                    
                    <div class="product-info-main">
                        <div class="product-header-section">
                            <h3>${product.title}</h3>
                            ${isNotBrand ? '' : `<span class="brand">by ${product.brand}</span>`}
                        </div>
                        <div class="price-section">
                            <p class="price">Price: $${product.price}</p>
                            <span class="discount">Discount: ${product.discountPercentage}% OFF</span>
                        </div>
                        
                        <div class="product-meta">
                            <span class="rating">${starsHTML} (${product.rating})</span>
                            <p class="stock">Stock: ${product.stock} units</p>
                        </div>
                        
                        <p class="description">${product.description}</p>
                        
                        <div class="purchase-info">
                            <h3>Order Information</h3>
                            <p>Minimum Order: ${product.minimumOrderQuantity} units</p>
                            <p>${product.shippingInformation}</p>
                            <p>${product.returnPolicy}</p>
                            <p>${product.warrantyInformation}</p>
                        </div>
                        
                        <div class="specifications">
                            <h3>Specifications</h3>
                            <p>Dimensions: ${product.dimensions.width}W x ${product.dimensions.height}H x ${product.dimensions.depth}D cm</p>
                            <p>Weight: ${product.weight}kg</p>
                        </div>
                        
                        <button class="product-add-to-cart-btn" ${addToCartDisabled}>Add to Cart</button>
                    </div>
                </div>
            `;

    const addToCartBtn = modalBody.querySelector('.product-add-to-cart-btn');
    addToCartBtn.addEventListener('click', () => {
        event.stopPropagation();
        addToCart(product.id);
    });
    modal.style.display = 'block';
}

//generate rating stars - visually 
function generateRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const fraction = rating - fullStars;
    let starsHTML = "";

    // Helper function to create a unique ID for each gradient
    const uniqueId = `star-gradient-${Math.random().toString(36).substr(2, 9)}`;

    // Generate full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += `
            <span class="star">
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="gold" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
            </span>
        `;
    }

    // Generate fractional star if needed
    if (fraction > 0) {
        const percent = Math.round(fraction * 100);
        starsHTML += `
            <span class="star">
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <defs>
                        <linearGradient id="${uniqueId}">
                            <stop offset="0%" stop-color="gold"/>
                            <stop offset="${percent}%" stop-color="gold"/>
                            <stop offset="${percent}%" stop-color="lightgray"/>
                            <stop offset="100%" stop-color="lightgray"/>
                        </linearGradient>
                    </defs>
                    <path fill="url(#${uniqueId})" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
            </span>
        `;
    }

    // Generate empty stars
    const emptyStars = 5 - fullStars - (fraction > 0 ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += `
            <span class="star">
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="lightgray" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
            </span>
        `;
    }

    return starsHTML;
}


// add to cart functionality
let cart = JSON.parse(sessionStorage.getItem('cart')) || [];

function addToCart(productId) {
    const product = cart.find(p => p.id === Number(productId)); //check if product is already in the cart

    if (!product) {
        const productData = products.find((product) => product.id === productId);
        cart.push(productData);
        saveCartToSession();
        updateCartCount();

        alert(`${productData.title} has been added to your cart`);
    }
    else {
        alert("Product already in the cart");
    }
}

//remove from cart
function removeFromCart(productId) {

    cart = cart.filter(item => item.id !== Number(productId));

    saveCartToSession();

    updateCartUI();
    updateCartCount();

    alert('Item removed from cart');
}

//update count on cart icon in navbar
function updateCartCount() {
    if (cart.length > 0) {
        cartIcon.textContent = cart.length;
    }
    else {
        //cart is empty
        cartIcon.style.display = 'none';
    }
}

//update cart.html with cart items
function updateCartUI() {
    cartContainer.innerHTML = ``;
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart-content">
                <div>
                    <i class="fa-solid fa-cart-shopping"></i>
                </div>
                <p>
                    Cart is empty
                </p>
                <p>
                    Start adding some products!
                </p>
                <button>
                    <a href="products.html" class="cart-nav-products">
                        Explore Products <span>&raquo;</span>
                    </a>
                </button>
            </div>
        `;

        document.querySelector('.checkout-div').style.display = 'none';
    }
    else {
        let totalPrice = 0;
        cart.forEach(cartItem => {

            cartCard = document.createElement('div');
            cartCard.classList.add('cart-item');

            cartCard.innerHTML = `
                <img src="${cartItem.thumbnail}" alt="${cartItem.title}" class="cart-prod-img"/>
                <div class="product-info">
                    <h2 class="cart-prod-title">${cartItem.title}</h2>
                    <p class="cart-prod-price">Price: $${cartItem.price}</p>
                </div>      
                <button onclick="removeFromCart(${cartItem.id})" class="cart-prod-remove-btn">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            totalPrice += cartItem.price;
            cartContainer.appendChild(cartCard);
        });

        const totalPriceElem = document.querySelector('.total-price');
        const noOfItemsElem = document.querySelector('.no-of-items');

        totalPriceElem.textContent = Math.round(totalPrice);
        noOfItemsElem.textContent = cart.length;
    }
}


//update sessionStorage whenever there is a update in cart
function saveCartToSession() {
    sessionStorage.setItem('cart', JSON.stringify(cart));
}

// display categories on index.html - home page
function displayCategories(container) {
    fetch('https://dummyjson.com/products/category-list')
        .then(res => res.json())
        .then(categoriesData => {
            // const categoriesContainer = document.querySelector('.categories-container');

            document.querySelector('.categories').style.display = 'block'; //categories content only displays when it is fetched
            categoriesData.forEach(category => {
                const categoryItem = document.createElement('div');
                categoryItem.classList.add('category-item');

                const sampleImageURL = products.find((product) => product.category === category).thumbnail;

                categoryItem.style.backgroundImage = `url(${sampleImageURL})`;

                categoryItem.innerHTML = `
                    <span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                `;

                categoryItem.addEventListener('click', () => {
                    window.location.href = `products.html?category=${category}`;
                });

                container.appendChild(categoryItem);
            });

            // Initial update
            updateScrollButtonVisibility();
            //Initial highlight
            highlightCategory();

            //start when page loads
            startAutoScroll();

        });
}

//redirect to products.html and display products category wise when a category is clicked on home page - index.html

function fetchProductsByCategory(category) {
    const filteredProducts = products.filter(product => product.category === category);
    noProductDiv.style.display = 'none';
    loadBtn.style.display = 'block';
    displayProducts(filteredProducts);

}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

//filters- categories on products.html
function populateCategoryFilterDropDown() {
    const categoryDropDown = document.getElementById('prod-category-filter');

    // categoryDropDown.addEventListener('change', (event) => {
    //     const selectedCategory = event.target.value;
    //     setTimeout(() => {
    //         if (selectedCategory === 'all') {
    //             window.location.href = `products.html`;
    //         }
    //         else {
    //             window.location.href = `products.html?category=${selectedCategory}`;
    //         }
    //     }, 500);
    // });

    fetch('https://dummyjson.com/products/category-list')
        .then(res => res.json())
        .then(categories => {

            //Add 'All' option in beginning
            const allOption = document.createElement('option');
            allOption.value = 'all';
            allOption.textContent = 'All';

            categoryDropDown.appendChild(allOption);

            //Add each category
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category.charAt(0).toUpperCase() + category.slice(1);

                categoryDropDown.appendChild(option);
            });

        });
}

function updateScrollButtonVisibility() {
    prevBtn.disabled = categoriesContainer.scrollLeft === 0;
    nextBtn.disabled = categoriesContainer.scrollLeft + categoriesContainer.clientWidth >= categoriesContainer.scrollWidth;
}

function highlightCategory() {
    const categories = document.querySelectorAll('.category-item');

    const scrollLeft = categoriesContainer.scrollLeft;
    const containerWidth = categoriesContainer.clientWidth;

    categories.forEach(category => {
        const categoryStart = category.offsetLeft;
        const categoryEnd = categoryStart + category.offsetWidth;

        if (scrollLeft <= categoryStart && scrollLeft + containerWidth >= categoryEnd) {
            category.classList.add('active');
        }
        else {
            category.classList.remove('active');
        }
    });
}

//auto scroll
const autoScrollInterval = 5000;
let autoScroll;

function startAutoScroll() {
    autoScroll = setInterval(() => {
        if (categoriesContainer.scrollLeft + categoriesContainer.clientWidth >= categoriesContainer.scrollWidth) {
            categoriesContainer.scrollBy({ left: 0, behavior: 'smooth' });
        }
        else {
            categoriesContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }, autoScrollInterval);
}

function stopAutoScroll() {
    clearInterval(autoScroll);
}

//featured products
function displayFeaturedProducts() {
    noProductDiv.style.display = 'none';

    const featuredProducts = products.filter(product => product.rating > 4.5).sort((a, b) => b.rating - a.rating).slice(0, 5);

    featuredProducts.forEach(featuredProduct => {

        const productCard = document.createElement('div');

        productCard.classList.add('featured-product-card');

        productCard.innerHTML = `
                    <img src="${featuredProduct.thumbnail}" alt="${featuredProduct.title}" class="featured-product-thumbnail"/>
                    <div class="featured-product-content">
                        <h2 class="featured-product-title">
                            ${featuredProduct.title}
                        </h2>
                    </div>
                `;

        productCard.addEventListener("click", () => {
            showProductDetails(featuredProduct.id);
        });

        featuredProductsContainer.appendChild(productCard);
    });
}

function filterProducts(category = "", sortBy = "", order = "") {
    if (category === "" && sortBy === "" && order === "")
        return;

    // Clear existing products
    const modalHTML = modal;
    productContainer.innerHTML = '';
    productContainer.appendChild(modalHTML);
    loadBtn.style.display = 'none';

    let currProducts = [...products];

    if (category !== "all" && category !== "") {
        currProducts = currProducts.filter(product => product.category === category);
    }
    if (sortBy != "") {
        currProducts = currProducts.sort((a, b) => {
            if (order === "desc")
                return b[sortBy] - a[sortBy];
            else
                return a[sortBy] - b[sortBy];
        });
    }
    if (sortBy === "" && order != "") {
        alert("Select sort by value");
        return;
    }
    displayProducts(currProducts);
}

function search(event) {
    // console.log(event);
    let matchedProducts;
    let input = document.querySelector('#search-space').value;
    if (input.length < 3) {
        //clear list
        const searchMatchProdListElement = document.querySelector('.match-prod-list');
        searchMatchProdListElement.innerHTML = ``;

        return;
    }
    input = input.toLowerCase();

    matchedProducts = products.filter((product) => product.title.toLowerCase().includes(input));
    if (event.key == 'Enter' || event.type === 'click') {
        // console.log("Display");
        // Clear existing products
        const modalHTML = modal;
        productContainer.innerHTML = '';
        productContainer.appendChild(modalHTML);
        loadBtn.style.display = 'none';

        displayProducts(matchedProducts);

        //clear list
        const searchMatchProdListElement = document.querySelector('.match-prod-list');
        searchMatchProdListElement.innerHTML = ``;

        return;
    }
    populateSearchMatchedProducts(matchedProducts);
}

function populateSearchMatchedProducts(products) {
    const searchMatchProdListElement = document.querySelector('.match-prod-list');
    searchMatchProdListElement.innerHTML = ``;

    products.forEach((product) => {
        const matchedItem = document.createElement('li');
        matchedItem.classList.add('match-prod-list-item');
        matchedItem.innerHTML = `<a href="products.html?search=${product.title.toLowerCase()}">${product.title}</a>`;

        searchMatchProdListElement.appendChild(matchedItem);
    });
}

document.getElementById('footer-queries-form').addEventListener('submit', (event) => {
    event.preventDefault(); // prevents default form submission

    const queryTitle = document.querySelector('#query-title').value.trim();
    const queryDesc = document.querySelector('#query-desc').value.trim();
    const queryMsgElem = document.querySelector('#query-message');

    if (queryTitle === '' || queryDesc === '') {
        queryMsgElem.textContent = "Please fill out both the query title and description!";
        queryMsgElem.style.color = 'red';
        return;
    }

    queryMsgElem.textContent = "Thank you for reaching out! we'll get back to you soon.";
    queryMsgElem.style.color = 'green';

    document.querySelector('#query-title').value = '';
    document.querySelector('#query-desc').value = '';
});