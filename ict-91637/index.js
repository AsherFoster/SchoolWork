class Store {
    constructor(items = []) {
        this.items = items;
        // Object used to keep track of which comics are sold
        this.sales = {};
    }
    // Changes the amount of a given comic in stock. Does not affect sales
    changeStock(title, amount) {
        return this.items.find(c => c.title === title).amount += amount;
    }
    // Tracks the sale and changes the stock amount for a comic
    sell(title, amount = 1) {
        this.sales[title] = (this.sales[title] || 0) + amount;
        return this.changeStock(title, -amount);
    }
    // Gets the full Comic object for a given title
    getItem(title) {
        return this.items.find(c => c.title === title);
    }
}
// Add more comics here
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
// Add a bunch of random comics
const comicNames = [
    ['Super', 'Awesome', 'Fantastic', 'Mega', 'Evil', 'Wonder', 'Lizard', 'Magic'],
    ['Man', 'Woman', 'Person', 'Thing', 'Lizard', 'Monster', 'Machine', 'Robot'],
    ['', '', '2', 'II']
];
Array(50).fill(1).forEach(() => {
    store.items.push({
        title: comicNames.map(n => n[Math.floor(Math.random() * n.length)]).join(' '),
        amount: Math.floor(Math.random() * 100)
    });
});
const notifColors = {
    'info': '#4caf50',
    'error': '#f44336'
};
// A link component to switch between views
Vue.component('navLink', {
    props: ['href'],
    template: `<a @click="navigate" href="#"><slot></slot></a>`,
    methods: {
        navigate() {
            if (app.page === this.href)
                return; // Ignore if same page
            // Change the view, and call the route update handler
            if (app.routeUpdate)
                app.routeUpdate(this.href, app.page);
            app.page = this.href;
        }
    }
});
// A view wrapper component
Vue.component('navView', {
    props: ['name', 'current'],
    template: '<div class="view" :name="name" v-if="current === name"><slot></slot></div>'
});
// Create the Vue instance
const app = new Vue({
    el: '#app',
    data: {
        store,
        notification: null,
        notifQueue: [],
        page: 'sales',
        stockItems: store.items.map(i => ({
            displayAmount: i.amount,
            error: '',
            title: i.title
        }))
    },
    methods: {
        // Sells a comic, if possible
        sell(title) {
            if (store.getItem(title).amount < 1)
                return this.queueNotif(`${title} is out of stock`, 3000, 'error');
            store.sell(title);
            this.queueNotif(`Sold "${title}"`, 1000);
        },
        // Queues a notification
        queueNotif(message, duration = 3000, color = 'info') {
            this.notifQueue.push({ message, duration, color: notifColors[color] });
            if (this.notification === null)
                this.doNotif(this.notifQueue.shift());
        },
        // Input event handler for stock inputs
        stockUpdate(title, e) {
            const value = e.target.value;
            const amount = +value; // Accepts any input that can be converted to a positive integer
            const stockItem = this.stockItems.find(i => i.title === title);
            if ((amount !== 0 && !amount) || !value) { // Shows appropriate error
                stockItem.error = 'Invalid number';
            }
            else if (amount < 0) {
                stockItem.error = 'Must be positive';
            }
            else if (amount % 1) {
                stockItem.error = 'Must be an integer';
            }
            else if (amount > Number.MAX_SAFE_INTEGER) {
                stockItem.error = 'Ok, that number is a bit big.';
            }
            else { // If valid, update stock amount, hide error
                this.store.getItem(title).amount = amount;
                stockItem.error = '';
            }
            stockItem.displayAmount = value; // Updates the text input's value to the value because binding!
        },
        // Route update to clean up stock page when loaded again
        routeUpdate(to, from) {
            if (to === 'stock') {
                this.stockItems = store.items.map(i => ({
                    displayAmount: i.amount,
                    error: '',
                    title: i.title
                }));
            }
        },
        // Internal function to execute the notification. Use app.queueNotif
        doNotif(notif) {
            // Starts it
            this.notification = notif;
            setTimeout(() => {
                // Ends, and queues the next
                if (this.notifQueue.length) {
                    this.notification = false; // Not null so that queuing doesn't happen mid reset
                    setTimeout(() => {
                        this.doNotif(this.notifQueue.shift());
                    }, 500);
                }
                else {
                    this.notification = null;
                }
            }, notif.duration);
        }
    }
});
// if(exports) {
//   exports.app = app;
//   exports.Store = store;
// }
