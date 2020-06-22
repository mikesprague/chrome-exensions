import dayjs from 'dayjs';
import * as settings from './settings';

export function handleError(error, timerHandle = null) {
  if (timerHandle) {
    clearInterval(timerHandle);
  }
  console.error(error);
}

export function reloadWindow() {
  window.location.reload(true);
};

export function currentService() {
  const domains = ['fedex.com', 'ups.com', 'usps.com', 'lasership.com'];
  let returnVal = null;
  domains.forEach(domain => {
    if (window.location.hostname.includes(domain)) {
      [returnVal, ] = domain.split('.');
    }
  });
  return returnVal;
}

export function sendDeliveryNotiication () {
  const title = 'Delivery Status Extension';
  const body = 'Your package has been delivered.';
  const options = {
      body,
      icon: settings.favicons.main,
  };

  const notification = new Notification(title, options);
  return notification;
}

export function updateOverlayStatus (deliveryStatus) {
  const statusImage = document.querySelector('.delivery-status-icon');
  const statusText = document.querySelector('.delivery-status-text');
  statusImage.src = settings.favicons[deliveryStatus];
  statusText.classList.add(settings.statusClass[deliveryStatus]);
  statusText.textContent = settings.titlePrefix[deliveryStatus];
  if (deliveryStatus === 'delivered') {
    document.querySelector('#extension-overlay h3').remove();
  }
}

export function updateDeliveryStatus (deliveryStatus) {
  const linkTags = Array.from(document.querySelectorAll("link[rel*='icon']"));
  linkTags.forEach(link => {
    link.remove();
  });
  const linkTag = document.createElement('link');
  linkTag.type = 'image/png';
  linkTag.rel = 'shortcut icon';
  linkTag.href = settings.favicons[deliveryStatus];
  window.document.title = `${settings.titlePrefix[deliveryStatus]} | ${window.document.title}`;
  document.getElementsByTagName('head')[0].appendChild(linkTag);
}

export function initOverlay() {
  const overlayMarkup = `
    <div id="extension-overlay">
      <h2><img class="delivery-status-icon">&nbsp;<span class="delivery-status-text"></span></h2>
      <h3>Page will reload in <span class="time-remaining">5:00</span></h3>
    </div>
  `;
  const deliveryService = currentService();
  if (deliveryService === 'fedex') {
    document.querySelector('body').innerHTML += overlayMarkup;
  } else {
    document.querySelector(settings.selectors[deliveryService].overlay).insertAdjacentHTML('afterend', overlayMarkup);
  }
  const timeNow = dayjs();
  const timeToReload = dayjs(timeNow).add(settings.reloadInterval, 'millisecond');
  const updateTimer = () => {
    const timeRemaining = dayjs(timeToReload).diff(dayjs());
    const timeRemainingEl = document.querySelector('.time-remaining');
    timeRemainingEl.textContent = dayjs(timeRemaining).format('m:ss');
    if (timeRemaining <= 0) {
      timeRemainingEl.textContent = 'Reloading ...';
      clearInterval();
      reloadWindow();
    }
  };
  const clockTimerHandle = setInterval(updateTimer, 500);
  return clockTimerHandle;
}

export function initNotificationPermissionCheck () {
  Notification.requestPermission().then((result) => {
    console.log(`Notification permission request: ${result}`);
  });
}
