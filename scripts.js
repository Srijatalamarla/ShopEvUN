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
        const productCard = document.createElement('div');

        productCard.classList.add('product-card');

        productCard.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}" class="product-thumbnail"/>
            <div class="product-content">
                <h2 class="product-title">
                    ${product.title}
                </h2>
                <p class="product-description">
                    ${product.description}
                </p>
                <p class="product-price">
                    Price: $${product.price}
                </p>
                <p class="product-stock">
                    Stock: ${product.stock}
                </p>
                <p class="product-rating">
                    Rating: ${product.rating}/5
                </p>
                <button class="product-add-to-cart-btn" data-id="${product.id}">
                    Add to Cart
                </button>
            </div>
        `;

        document.querySelector('.product-container').appendChild(productCard);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.product-container')) {
        loadProducts();

        document.getElementById('load-btn').addEventListener("click", loadProducts);

        // Attach the event listener to the product container
        document.querySelector('.product-container').addEventListener('click', (event) => {
            if (event.target.classList.contains('product-add-to-cart-btn')) { // Check if the clicked element is the Add to Cart button
                addToCart(event);
            }
        });

    }

    if (document.querySelector('.cart-container')) {
        cart = JSON.parse(sessionStorage.getItem('cart')) || [];
        updateCartCount();
        updateCartUI();
    }

    if (document.getElementById('cart-count')) {
        updateCartCount();
    }

    if (document.querySelector('.categories')) {
        displayCategories();
    }

});


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
                console.log(cart);
                saveCartToSession();
                updateCartCount();

                alert(`${productData.title} has been added to your cart`);
            });
    }
    else {
        alert("Product already in the cart");
    }
}

//update count on cart icon in navbar
function updateCartCount() {
    const cartIcon = document.getElementById('cart-count');
    console.log(cart);
    cartIcon.textContent = cart.length;
}

//update cart.html with cart items
function updateCartUI() {
    const cartContainer = document.querySelector('.cart-container');
    console.log(cartContainer);
    cart.forEach(cartItem => {
        cartCard = document.createElement('div');
        cartCard.classList.add('cart-item');

        cartCard.innerHTML = `
            <img src="${cartItem.thumbnail}" alt="${cartItem.title}"/>
            <div class="product-info">
                <h2>${cartItem.title}</h2>
                <p>Price: $${cartItem.price}</p>
            </div>      
            <button data-id="${cartItem.id}">remove from cart</button>
        `;
        cartContainer.appendChild(cartCard);
    });
}


//update sessionStorage whenever there is a update in cart
function saveCartToSession() {
    sessionStorage.setItem('cart', JSON.stringify(cart));
}

// display categories on index.html - home page
function displayCategories() {
    fetch('https://dummyjson.com/products/categories')
        .then(res => res.json())
        .then(categoriesData => {
            console.log(categoriesData);
            const categoriesContainer = document.querySelector('.categories-container');

            categoriesData.forEach(category => {
                const categoryItem = document.createElement('div');
                categoryItem.classList.add('category-item');

                categoryItem.innerHTML = `
                    <span>${category.name}</span>
                `;

                categoriesContainer.appendChild(categoryItem);
            })

        });
}

//filters- categories on products.html
