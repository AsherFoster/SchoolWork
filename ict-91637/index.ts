interface Comic {
  title: string;
  amount: number;
}

class Store {
  public sales = {};
  constructor(
    public items: Comic[] = []
  ) {}
  // Changes the amount of a given comic in stock
  public changeStock(title: string, amount: number): number {
    return this.items.find(c => c.title === title).amount += amount
  }
  // Tracks the sale and changes the stock amount for a comic
  public sell(title: string, amount: number = 1): number {
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
function goTo(page: string) {
  if(activePage) document.getElementById(activePage).classList.remove('active');
  document.getElementById(page).classList.add('active');
  activePage = page;
}
goTo(document.getElementsByClassName('view')[0].id);

// Sales page
const salesItemsWrapper = document.getElementById('sales-items');
store.items.forEach(comic => {
  const item = document.createElement('li');
  item.appendChild(document.createTextNode(`${comic.title} -- ${comic.amount}`));
  item.setAttribute('data-title', comic.title);
  item.addEventListener('click', function(){sellItem(this)});
  salesItemsWrapper.appendChild(item);
});
function sellItem(el: HTMLElement) {
  const title = el.getAttribute('data-title');
  store.sell(title);
  queueNotif(`Sold "${title}"`)
}

// Notification
interface QueuedNotif {
  message: string;
  duration: number;
  color: string;
}
const notifQueue: QueuedNotif[] = [];
const notifColors = {
  'info': '#4caf50',
  'error': '#f44336'
};
let notifActive = false;
function queueNotif(message: string, duration: number = 3000, color: string = 'info') {
  notifQueue.push({message, duration, color: notifColors[color]});
  if(!notifActive)
    doNotif(notifQueue.shift());
}
function doNotif({duration, color, message}: QueuedNotif) {
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
  timer.style.transition = `linear width ${duration/1000}s`;
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
        if(notifQueue.length) {
          setTimeout(() => {
            doNotif(notifQueue.shift())
          }, 100);
        }
      }, 1000);
    }, duration);
  }, 100);
}
