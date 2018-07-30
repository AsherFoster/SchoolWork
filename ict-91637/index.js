class Store {
    constructor(items = []) {
        this.items = items;
        this.sales = {};
    }
    // Changes the amount of a given comic in stock
    changeStock(title, amount) {
        return this.items.find(c => c.title === title).amount += amount;
    }
    // Tracks the sale and changes the stock amount for a comic
    sell(title, amount = 1) {
        this.sales[title] = (0 || this.sales[title]) + amount;
        return this.changeStock(title, -amount);
    }
}
const store = new Store([
    {
        title: 'Super Dude',
        amount: 8
    },
    {
        title: 'Lizard Man',
        amount: 12
    },
    {
        title: 'Water Woman',
        amount: 3
    }
]);
// Top level routing
let activePage = '';
function goTo(page) {
    if (activePage)
        document.getElementById(activePage).style.display = '';
    document.getElementById(page).style.display = 'block';
    activePage = page;
}
goTo(document.getElementsByClassName('view')[0].id);
// Sales page
const salesItemTemplate = document.getElementsByClassName('sales-item')[0];
const salesItemList = salesItemTemplate.parentNode;
store.items.forEach(comic => {
    const comicItem = salesItemTemplate.cloneNode();
    salesItemList.appendChild(comicItem);
    comicItem.textContent = comicItem.textContent.replace('{name}', comic.title);
    comicItem.textContent = comicItem.textContent.replace('{amount}', '' + comic.amount);
    comicItem.classList.remove('template');
});
