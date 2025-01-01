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
            console.log(link.classList);
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

document.addEventListener('DOMContentLoaded', () => {

    //if on products.html page
    if (productContainer) {

        populateCategoryFilterDropDown();

        const category = getQueryParam('category');

        if (category) {
            fetchProductsByCategory(category);
        } else {
            loadProducts(); //loads all products
        }

        document.getElementById('load-btn').addEventListener("click", loadProducts);

        //Add to cart functionality
        // Attach the event listener to the product container
        document.querySelector('.product-container').addEventListener('click', (event) => {
            if (event.target.classList.contains('product-add-to-cart-btn')) { // Check if the clicked element is the Add to Cart button
                addToCart(event);
            }
        });

        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.onclick = (event) => {
            if (event.target === modal)
                modal.style.display = 'none';
        }

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

});

// display products on products.html

let skip = 0;
const limit = 20;

function loadProducts() {
    fetch(`https://dummyjson.com/products?limit=${limit}&skip=${skip}`)
        .then(res => res.json())
        .then(data => {
            // console.log(data.products.length);
            if (data.products.length == 0) {
                //no more products
                window.alert("no more products avaailable");
            }
            displayProducts(data.products);
            skip += limit;
        });
}

function displayProducts(products) {

    products.forEach(product => {
        // console.log(product);
        const productCard = document.createElement('div');

        productCard.classList.add('product-card');

        productCard.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}" class="product-thumbnail"/>
            <div class="product-content">
                <h2 class="product-title">
                    ${product.title}
                </h2>
                <p class="product-price">
                    Price: $${product.price}
                </p>
                <div class="product-status">
                    <span class="stock-status">${product.availabilityStatus}</span>
                    <span class="rating">★ ${product.rating}</span>
                </div>
                <div class="product-actions">
                    <button class="product-add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                    <button class="product-view-details-btn" onclick="showProductDetails(${product.id})">View Details</button>
                </div>
            </div>
        `;

        productCard.addEventListener("click", () => {
            showProductDetails(product.id);
        });

        productContainer.appendChild(productCard);
    });
}

function showProductDetails(productId) {
    fetch(`https://dummyjson.com/products/${productId}`)
        .then(res => res.json())
        .then(product => {

            const modalBody = document.querySelector('.modal-body');

            modalBody.innerHTML = `
                <div class="modal-product-details">
                    <div class="product-gallery">
                        <img src="${product.images[0]}" alt="${product.title}" class="modal-product-image"/>
                    </div>
                    
                    <div class="product-info-main">
                        <h3>${product.title}</h3>
                        <p class="brand">by ${product.brand}</p>
                        <div class="price-section">
                            <p class="price">Price: $${product.price}</p>
                            <span class="discount">Discount: ${product.discountPercentage}% OFF</span>
                        </div>
                        
                        <div class="product-meta">
                            <p class="rating">Rating: ★ ${product.rating}</p>
                            <p class="stock">Stock: ${product.stock} units</p>
                        </div>
                        
                        <p class="description">${product.description}</p>
                        
                        <div class="purchase-info">
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
                        
                        <div class="tags">
                            ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        
                        <button class="product-add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                    </div>
                </div>
            `;
            modal.style.display = 'block';
        });
}

// add to cart functionality
let cart = JSON.parse(sessionStorage.getItem('cart')) || [];

function addToCart(event) {
    const productId = event.target.dataset.id;
    const product = cart.find(p => p.id === Number(productId)); //check if product is already in the cart

    if (!product) {
        fetch(`https://dummyjson.com/products/${productId}`)
            .then(res => res.json())
            .then(productData => {
                cart.push(productData);
                // console.log(cart);
                saveCartToSession();
                updateCartCount();

                alert(`${productData.title} has been added to your cart`);
            });
    }
    else {
        alert("Product already in the cart");
    }
}

//remove from cart
function removeFromCart(event) {
    // console.log(event.target.closest('button').dataset.id);
    const productId = event.target.closest('button').dataset.id;

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
    // console.log(cartContainer);
    cartContainer.innerHTML = ``;
    cart.forEach(cartItem => {
        cartCard = document.createElement('div');
        cartCard.classList.add('cart-item');

        cartCard.innerHTML = `
            <img src="${cartItem.thumbnail}" alt="${cartItem.title}" class="cart-prod-img"/>
            <div class="product-info">
                <h2 class="cart-prod-title">${cartItem.title}</h2>
                <p class="cart-prod-price">Price: $${cartItem.price}</p>
            </div>      
            <button onclick="removeFromCart(event)" class="cart-prod-remove-btn" data-id="${cartItem.id}">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        cartContainer.appendChild(cartCard);
    });
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

            categoriesData.forEach(category => {
                const categoryItem = document.createElement('div');
                categoryItem.classList.add('category-item');

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
    fetch(`https://dummyjson.com/products/category/${category}`)
        .then(res => res.json())
        .then(data => {
            displayProducts(data.products);
        });
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

//filters- categories on products.html
function populateCategoryFilterDropDown() {
    const categoryDropDown = document.getElementById('prod-category-filter');

    categoryDropDown.addEventListener('change', (event) => {
        console.log(event);
        const selectedCategory = event.target.value;
        setTimeout(() => {
            if (selectedCategory === 'all') {
                window.location.href = `products.html`;
            }
            else {
                window.location.href = `products.html?category=${selectedCategory}`;
            }
        }, 500);
    });

    fetch('https://dummyjson.com/products/category-list')
        .then(res => res.json())
        .then(categories => {

            //Add 'All' option in beginning
            const allOption = document.createElement('option');
            allOption.value = 'all';
            allOption.textContent = 'All';
            // allOption.addEventListener('click', () => {
            //     window.location.href = `products.html`;
            // });


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