function toggleDropdown() { 
    document.getElementById("menu-toggle").className = "show-dropdown";
}
window.onclick = function(event) {
    if (!event.target.matches('.menu')) {
        document.getElementById("menu-toggle").className = "sidebar-menu";
    }
}