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
    // Gets the full Comic object for a given title
    getItem(title) {
        return this.items.find(c => c.title === title);
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
        document.getElementById(activePage).classList.remove('active');
    document.getElementById(page).classList.add('active');
    activePage = page;
}
goTo(document.getElementsByClassName('view')[0].id);
// Sales page
const salesItemsWrapper = document.getElementById('sales-items');
store.items.forEach(comic => {
    const item = document.createElement('li');
    item.appendChild(document.createTextNode(''));
    item.setAttribute('data-title', comic.title);
    item.addEventListener('click', function () { sellItem(this); });
    salesItemsWrapper.appendChild(item);
});
function renderSalesPage() {
    for (let item of salesItemsWrapper.children) {
        const comic = store.getItem(item.getAttribute('data-title'));
        item.textContent = `${comic.title} -- ${comic.amount}`;
    }
}
function sellItem(el) {
    const title = el.getAttribute('data-title');
    if (store.getItem(title).amount < 1)
        return queueNotif(`${title} is out of stock`, 3000, 'error');
    store.sell(title);
    render();
    queueNotif(`Sold "${title}"`, 1000);
}
// Stock page
const stockItemWrapper = document.getElementById('stock-items');
store.items.forEach(comic => {
    const item = document.createElement('li');
    const text = document.createElement('p');
    text.appendChild(document.createTextNode(''));
    item.appendChild(text);
    item.setAttribute('data-title', comic.title);
    stockItemWrapper.appendChild(item);
});
function render() {
    renderSalesPage();
}
const notifQueue = [];
const notifColors = {
    'info': '#4caf50',
    'error': '#f44336'
};
let notifActive = false;
function queueNotif(message, duration = 3000, color = 'info') {
    notifQueue.push({ message, duration, color: notifColors[color] });
    if (!notifActive)
        doNotif(notifQueue.shift());
}
function doNotif({ duration, color, message }) {
    /*
    - Display notif offscreen
    - Set timer
    - Move onscreen
    - Wait
    - Move offscreen
    - Hide
    * */
    notifActive = true;
    const timer = document.getElementById('timer');
    const notifcation = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    // Gets everything ready
    notifcation.style.display = 'block';
    notifcation.style.background = color;
    notificationText.textContent = message;
    timer.style.width = '100%';
    timer.style.transition = `linear width ${duration / 1000}s`;
    setTimeout(() => {
        // Starts timer, moves notif
        timer.style.width = '0';
        notifcation.style.top = 'calc(100vh - 59px)';
        setTimeout(() => {
            // Hides notif
            notifcation.style.top = '100vh';
            setTimeout(() => {
                notifcation.style.display = 'none';
                notifActive = false;
                if (notifQueue.length) {
                    setTimeout(() => {
                        doNotif(notifQueue.shift());
                    }, 50);
                }
            }, 500);
        }, duration);
    }, 50);
}
render();
