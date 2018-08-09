class Store {
    constructor(items = []) {
        this.items = items;
        /*
          This class is a reasonably generic Store. Initial items are passed to the constructor, and more items could be
          added by modifying .items. Items are expected to have a unique title attribute, as well as an amount.
          Not using classes for items for simplicity, could be changed in the future.
          Titles are being treated as unique IDs, again, for simplicity.
          The .items array is a array of objects, rather than a title:amount object to allow for future metadata easily.
         * */
        // Object used to keep track of how many comics have been sold
        this.sales = {};
    }
    // Gets the amount of a comic in stock
    getStock(title) {
        return this.getItem(title).amount;
    }
    // Sets the amount of a comic available
    setStock(title, amount) {
        this.getItem(title).amount = amount;
    }
    // Changes the amount of a given comic in stock. Does not affect sales (Can be negative)
    changeStock(title, amount) {
        return this.items.find(c => c.title === title).amount += amount;
    }
    // Tracks the sale and changes the stock amount for a comic
    sell(title, amount = 1) {
        this.sales[title] = (this.sales[title] || 0) + amount;
        return this.changeStock(title, -amount);
    }
    // Gets the full Comic object for a given title. Doesn't just return the amount, making future metadata easier
    getItem(title) {
        return this.items.find(c => c.title === title);
    }
}
// Create a new store, and pass the initial comics. Add more comics here.
const comicStore = new Store([
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
// Add a bunch of random comics, to populate the page.
const comicNames = [
    ['Super', 'Awesome', 'Fantastic', 'Mega', 'Evil', 'Wonder', 'Lizard', 'Magic'],
    ['Man', 'Woman', 'Person', 'Thing', 'Lizard', 'Monster', 'Machine', 'Robot'],
    ['', '', '2', 'II']
];
Array(50).fill(1).forEach(() => {
    comicStore.items.push({
        title: comicNames.map(n => n[Math.floor(Math.random() * n.length)]).join(' '),
        amount: Math.floor(Math.random() * 100)
    });
});
// Dedupe the items, preventing name clash issues
comicStore.items.filter((item, i) => comicStore.items.indexOf(item) === i);
const notifColors = {
    'info': '#4caf50',
    'error': '#f44336'
};
// Navigation
// Link used to navigate between views. Uses quick & dirty this.$parent to update the view.
Vue.component('navLink', {
    props: ['href'],
    template: `<a @click="navigate" href="#"><slot></slot></a>`,
    methods: {
        navigate() {
            if (this.$parent.page === this.href)
                return; // Ignore if same page
            // Change the view, and call the route update handler
            if (this.$parent.routeUpdate)
                this.$parent.routeUpdate(this.href, this.$parent.page);
            this.$parent.page = this.href;
        }
    }
});
// Shows the view if the name prop matches the parent's page. Again, using quick & dirty $parent,
// which should be changed if the app were to be more complex
Vue.component('navView', {
    props: ['name'],
    template: '<div class="view" :id="\'view-\' + name" v-if="$parent.page === name"><slot></slot></div>'
});
// Create the Vue instance
const app = new Vue({
    el: '#app',
    data: {
        store: comicStore,
        notification: null,
        notifQueue: [],
        page: 'sales',
        stockItems: comicStore.items.map(i => ({
            displayAmount: i.amount,
            error: '',
            title: i.title
        }))
    },
    methods: {
        // Sells a comic, if possible
        sell(title) {
            if (this.store.getStock(title) < 1)
                return this.queueNotif(`${title} is out of stock`, 3000, 'error');
            this.store.sell(title);
            this.queueNotif(`Sold "${title}"`, 1000);
        },
        // Queues a notification
        queueNotif(message, duration = 3000, color = 'info') {
            this.notifQueue.push({ message, duration, color: notifColors[color] });
            if (this.notification === null)
                this.doNotif(this.notifQueue.shift());
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
                this.store.setStock(title, amount);
                stockItem.error = '';
            }
            stockItem.displayAmount = value; // Updates the text input's value to the value because binding!
        },
        // Route update to clean up stock page when loaded again
        routeUpdate(to, from) {
            if (to === 'stock') {
                /* The stock page requires a separate list of items in order to be able to correctly accept invalid inputs,
                as well as showing errors properly, because there must be custom ui attributes linked to the item. This list
                gets recreated whenever the stock page is loaded, so that any invalid inputs are fixed, and errors are hidden.
                 *  */
                this.stockItems = this.store.items.map(i => ({
                    displayAmount: i.amount,
                    error: '',
                    title: i.title
                }));
            }
        }
    }
});
