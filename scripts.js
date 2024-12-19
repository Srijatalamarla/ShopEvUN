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