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
                <button class="product-add-to-cart">
                    Add to Cart
                </button>
            </div>
        `;

        document.querySelector('.product-container').appendChild(productCard);
    });
}


document.addEventListener('DOMContentLoaded', loadProducts);



// fetch('https://dummyjson.com/products?limit=200&skip=0')
//     .then(res => res.json())
//     .then(data => {
//         const products = data.products;
//         console.log(products);

//         products.forEach(product => {
//             const productCard = document.createElement('div');
//             productCard.classList.add('product-card');

//             productCard.innerHTML = `
//             <h2 class = "product-title">${product.title}</h3>
//         `;

//             document.querySelector('.product-container').appendChild(productCard);
//         });
//     })
//     .catch(err => console.error('Error fetching data', err));

document.getElementById('load-btn').addEventListener("click", loadProducts);
