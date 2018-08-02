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
const notifColors = {
    'info': '#4caf50',
    'error': '#f44336'
};
function doNotif(notif) {
    // Starts it
    app.notification = notif;
    setTimeout(() => {
        // Ends it
        app.notification = null;
        // Queues the next
        if (app.notifQueue.length) {
            setTimeout(() => {
                doNotif(app.notifQueue.shift());
            }, 500);
        }
    }, notif.duration);
}
Vue.component('navLink', {
    props: ['href'],
    template: `<a @click="navigate" href="#"><slot></slot></a>`,
    methods: {
        navigate() {
            app.page = this.href;
        }
    }
});
const app = new Vue({
    el: '#app',
    data: {
        store,
        notification: null,
        notifQueue: [],
        page: 'sales'
    },
    methods: {
        sell(title) {
            if (store.getItem(title).amount < 1)
                return this.queueNotif(`${title} is out of stock`, 3000, 'error');
            store.sell(title);
            this.queueNotif(`Sold "${title}"`, 1000);
        },
        queueNotif(message, duration = 3000, color = 'info') {
            this.notifQueue.push({ message, duration, color: notifColors[color] });
            if (!this.notification)
                doNotif(this.notifQueue.shift());
        }
    }
});
