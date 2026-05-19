// Only define if not already defined (may be defined in old-cart-drawer-custom.js)
if (!customElements.get('shipping-progress-bar')) {
  class ShippingProgressBar extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      
      // Default properties - Tier 1 (Free Shipping)
      this._threshold = 7500; // in cents
      this._current = 0;
      this._currency = '$';
      this._thresholdMessage = 'Add __AMOUNT__ more to get FREE shipping!';
      this._successMessage = 'Congratulations! You qualify for FREE shipping!';
      this._progressColor = '#4CAF50';
      this._backgroundColor = '#f0f0f0';

      // Default properties - Tier 2 (Free Gift)
      this._enableTier2 = false;
      this._tier2Threshold = 15000; // in cents
      this._tier2Message = 'Add __AMOUNT__ more to get a discount!';
      this._tier2SuccessMessage = 'Congratulations! You get a discount!';
      this._tier2ProgressColor = '#d4af37';
    }

  static get observedAttributes() {
    return [
      'threshold', 
      'current', 
      'currency', 
      'threshold-message', 
      'success-message',
      'progress-color',
      'background-color',
      'enable-tier2',
      'tier2-threshold',
      'tier2-message',
      'tier2-success-message',
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    switch(name) {
      case 'threshold':
        this._threshold = parseInt(newValue, 10);
        break;
      case 'current':
        this._current = parseInt(newValue, 10);
        break;
      case 'currency':
        this._currency = newValue;
        break;
      case 'threshold-message':
        this._thresholdMessage = newValue;
        break;
      case 'success-message':
        this._successMessage = newValue;
        break;
      case 'progress-color':
        this._progressColor = newValue;
        break;
      case 'background-color':
        this._backgroundColor = newValue;
        break;
      case 'enable-tier2':
        this._enableTier2 = newValue === 'true';
        break;
      case 'tier2-threshold':
        this._tier2Threshold = parseInt(newValue, 10);
        break;
      case 'tier2-message':
        this._tier2Message = newValue;
        break;
      case 'tier2-success-message':
        this._tier2SuccessMessage = newValue;
        break;
      
    }
    
    this.render();
  }

  connectedCallback() {
    // Tier 1 attributes
    if (this.hasAttribute('threshold')) {
      this._threshold = parseInt(this.getAttribute('threshold'), 10);
    }
    if (this.hasAttribute('current')) {
      this._current = parseInt(this.getAttribute('current'), 10);
    }
    if (this.hasAttribute('currency')) {
      this._currency = this.getAttribute('currency');
    }
    if (this.hasAttribute('threshold-message')) {
      this._thresholdMessage = this.getAttribute('threshold-message');
    }
    if (this.hasAttribute('success-message')) {
      this._successMessage = this.getAttribute('success-message');
    }
    if (this.hasAttribute('progress-color')) {
      this._progressColor = this.getAttribute('progress-color');
    }
    if (this.hasAttribute('background-color')) {
      this._backgroundColor = this.getAttribute('background-color');
    }

    // Tier 2 attributes
    if (this.hasAttribute('enable-tier2')) {
      this._enableTier2 = this.getAttribute('enable-tier2') === 'true';
    }
    if (this.hasAttribute('tier2-threshold')) {
      this._tier2Threshold = parseInt(this.getAttribute('tier2-threshold'), 10);
    }
    if (this.hasAttribute('tier2-message')) {
      this._tier2Message = this.getAttribute('tier2-message');
    }
    if (this.hasAttribute('tier2-success-message')) {
      this._tier2SuccessMessage = this.getAttribute('tier2-success-message');
    }
   
    /*
    console.log('[ShippingProgressBar] connectedCallback:', {
      current: this._current,
      threshold: this._threshold,
      enableTier2: this._enableTier2,
      'enable-tier2 raw': this.getAttribute('enable-tier2'),
      tier2Threshold: this._tier2Threshold,
    });
    */
    
    this.render();
  }

  formatCurrency(cents) {
    return (cents / 100).toFixed(2) + this._currency;
  }

  render() {
    console.log('[ShippingProgressBar] render():', {
      current: this._current,
      threshold: this._threshold,
      enableTier2: this._enableTier2,
      tier2Threshold: this._tier2Threshold,
    });

    // Determine max threshold for bar calculation
    const maxThreshold = this._enableTier2 ? this._tier2Threshold : this._threshold;

    // Overall progress percentage (based on max threshold)
    const progressPercentage = Math.min(100, (this._current / maxThreshold) * 100);

    // Tier 1 milestone position on the bar
    const tier1Position = this._enableTier2
      ? Math.min(100, (this._threshold / maxThreshold) * 100)
      : 100;

    // Remaining amounts
    const tier1Remaining = Math.max(0, this._threshold - this._current);
    const tier2Remaining = Math.max(0, this._tier2Threshold - this._current);

    // Goals reached
    const tier1Reached = this._current >= this._threshold;
    const tier2Reached = this._enableTier2 && this._current >= this._tier2Threshold;

    // Formatted remaining
    const tier1FormattedAmount = this.formatCurrency(tier1Remaining);
    const tier2FormattedAmount = this.formatCurrency(tier2Remaining);

    // Active tier text
    const activeTier = (tier1Reached && this._enableTier2) ? 'tier2' : 'tier1';
    const allDone = tier1Reached && (!this._enableTier2 || tier2Reached);

    let displayMessage = '';
    if (activeTier === 'tier1') {
      displayMessage = tier1Reached
        ? this.convertBold(this._successMessage, 'html')
        : this.convertBold(this._thresholdMessage.replace('__AMOUNT__', `<span class="progress-remaining">${tier1FormattedAmount}</span>`));
    } else {
      displayMessage = tier2Reached
        ? this.convertBold(this._tier2SuccessMessage, 'html')
        : this.convertBold(this._tier2Message.replace('__AMOUNT__', `<span class="progress-remaining">${tier2FormattedAmount}</span>`));
    }

    const lockIconUnlocked = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M21,11a2,2,0,0,0-2-2H17V7A5,5,0,0,0,7.669,4.5,1,1,0,0,0,9.4,5.5,3,3,0,0,1,15,7V9H5a2,2,0,0,0-2,2v9a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2Zm-9,6.5a2,2,0,1,1,2-2A2,2,0,0,1,12,17.5Z"/></svg>`;
    const lockIconLocked = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 5H11V3.5C11 2.70435 10.6839 1.94129 10.1213 1.37868C9.55871 0.81607 8.79565 0.5 8 0.5C7.20435 0.5 6.44129 0.81607 5.87868 1.37868C5.31607 1.94129 5 2.70435 5 3.5V5H3C2.73478 5 2.48043 5.10536 2.29289 5.29289C2.10536 5.48043 2 5.73478 2 6V13C2 13.2652 2.10536 13.5196 2.29289 13.7071C2.48043 13.8946 2.73478 14 3 14H13C13.2652 14 13.5196 13.8946 13.7071 13.7071C13.8946 13.5196 14 13.2652 14 13V6C14 5.73478 13.8946 5.48043 13.7071 5.29289C13.5196 5.10536 13.2652 5 13 5ZM6 3.5C6 2.96957 6.21071 2.46086 6.58579 2.08579C6.96086 1.71071 7.46957 1.5 8 1.5C8.53043 1.5 9.03914 1.71071 9.41421 2.08579C9.78929 2.46086 10 2.96957 10 3.5V5H6V3.5Z" fill="black"/></svg>`;
    // Icons from _hover-icons.liquid
    const deliveryIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#fff" viewBox="0 0 256 256"><path d="M255.42,117l-14-35A15.93,15.93,0,0,0,226.58,72H192V64a8,8,0,0,0-8-8H32A16,16,0,0,0,16,72V184a16,16,0,0,0,16,16H49a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V120A7.94,7.94,0,0,0,255.42,117ZM192,88h34.58l9.6,24H192ZM32,72H176v64H32ZM80,208a16,16,0,1,1,16-16A16,16,0,0,1,80,208Zm81-24H111a32,32,0,0,0-62,0H32V152H176v12.31A32.11,32.11,0,0,0,161,184Zm31,24a16,16,0,1,1,16-16A16,16,0,0,1,192,208Zm48-24H223a32.06,32.06,0,0,0-31-24V128h48Z"></path></svg>`;
    const giftIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#fff" viewBox="0 0 256 256"><path d="M216,72H180.92c.39-.33.79-.65,1.17-1A29.53,29.53,0,0,0,192,49.57,32.62,32.62,0,0,0,158.44,16,29.53,29.53,0,0,0,137,25.91a54.94,54.94,0,0,0-9,14.48,54.94,54.94,0,0,0-9-14.48A29.53,29.53,0,0,0,97.56,16,32.62,32.62,0,0,0,64,49.57,29.53,29.53,0,0,0,73.91,71c.38.33.78.65,1.17,1H40A16,16,0,0,0,24,88v32a16,16,0,0,0,16,16v64a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V136a16,16,0,0,0,16-16V88A16,16,0,0,0,216,72ZM149,36.51a13.69,13.69,0,0,1,10-4.5h.49A16.62,16.62,0,0,1,176,49.08a13.69,13.69,0,0,1-4.5,10c-9.49,8.4-25.24,11.36-35,12.4C137.7,60.89,141,45.5,149,36.51Zm-64.09.36A16.63,16.63,0,0,1,96.59,32h.49a13.69,13.69,0,0,1,10,4.5c8.39,9.48,11.35,25.2,12.39,34.92-9.72-1-25.44-4-34.92-12.39a13.69,13.69,0,0,1-4.5-10A16.6,16.6,0,0,1,84.87,36.87ZM40,88h80v32H40Zm16,48h64v64H56Zm144,64H136V136h64Zm16-80H136V88h80v32Z"></path></svg>`;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        
        .progress-message {
          margin-bottom: 20px;
          text-align: center;
          font-size: 14px;
          line-height: 130%;
          font-weight: 500;
          position: relative;
        }
        .progress-message svg {
          position: absolute;
          right: 0;
          top: 0;
        }
        .progress-message strong {
          font-size: 12px;
          font-weight: 600;
        }
        span.progress-remaining {
          font-weight: 600 !important;
        }

        .progress-container {
          position: relative;
        }
        
        .progress-track {
          position: relative;
          height: 7px;
          background-color: ${this._backgroundColor};
          border-radius: 5px;
          border: 1px solid ${this._progressColor};
          
        }
        
        .progress-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: ${progressPercentage}%;
          background-color: ${this._progressColor};
          border-radius: 5px;
          transition: width 0.4s ease-in-out;
        }

        .milestone {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          z-index: 2;
          overflow: hidden;
          transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
        }

        .milestone--shipping {
          left: ${tier1Position}%;
          background-color: ${this._progressColor};
          color: #ffffff;
        }

        .milestone--gift {
          left: 94%;
          background-color: ${this._progressColor};
          color: #ffffff;
        }

        .milestone--reached {
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
      </style>
      
      <div class="progress-container">
        <div class="progress-message">
          ${displayMessage}
        </div>
        <div class="progress-track">
          <div class="progress-fill"></div>

          ${this._enableTier2 ? `
          <!-- Tier 1 milestone: delivery icon (only shown in two-tier mode) -->
          <span class="milestone milestone--shipping ${tier1Reached ? 'milestone--reached' : ''}">
            ${deliveryIcon}
          </span>

          <!-- Tier 2 milestone: gift icon -->
          <span class="milestone milestone--gift ${tier2Reached ? 'milestone--reached' : ''}">
            ${giftIcon}
          </span>` : ''}
        </div>
      </div>
    `;
  }
  convertBold(text, format = 'html') {
    const formats = {
      html: (match, content) => `<strong>${content}</strong>`,
      markdown: (match, content) => `**${content}**`,
      css: (match, content) => `<span style="font-weight: bold;">${content}</span>`,
      bbcode: (match, content) => `[b]${content}[/b]`
    };
    const converter = formats[format] || formats.html;
    return text.replace(/\[bold\](.*?)\[\/bold\]/g, converter);
  }
}

  // Register the custom element
  customElements.define('shipping-progress-bar', ShippingProgressBar);
}

class CountDown extends HTMLElement {
  constructor() {
    super();
    this.endTime = new Date(this.getAttribute("data-time")).getTime();
  }
  updateCountdown() {
    const now = new Date().getTime(),
      timeRemaining = this.endTime - now;
    if (timeRemaining <= 0) {
      this.style.display = "none";
    } else {
      const days = Math.floor(timeRemaining / 864e5),
        hours = Math.floor(
          (timeRemaining % (1e3 * 60 * 60 * 24)) / (1e3 * 60 * 60),
        ),
        minutes = Math.floor((timeRemaining % (1e3 * 60 * 60)) / (1e3 * 60)),
        seconds = Math.floor((timeRemaining % (1e3 * 60)) / 1e3);
      this.innerHTML = `${String(days).padStart(2, "0")}:${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
  }
  addHTML() {
    this.innerHTML = "00:00:00:00";
  }
  connectedCallback() {
    (this.addHTML(),
      this.updateCountdown(),
      (this.interval = setInterval(() => this.updateCountdown(), 1e3)));
  }
  disconnectedCallback() {
    clearInterval(this.interval);
  }
}
customElements.define("count-down", CountDown);

class CountdownTimerb extends HTMLElement {
  constructor() {
    super();
    this.endDate = new Date(this.getAttribute("end-date"));

    this.labels = {
      day: this.dataset.day || "Days",
      hour: this.dataset.hour || "Hours",
      minute: this.dataset.minute || "Minutes",
      second: this.dataset.second || "Seconds",
    };
  }

  addHTML() {
    this.innerHTML = `
      <div class="timer-item days-item">
        <span class="days-counter">00</span>
        <span class="timeName">${this.labels.day}</span>
      </div>
      <div class="timer-item colon-item"><span></span></div>

      <div class="timer-item hours-item">
        <span class="hours-counter">00</span>
        <span class="timeName">${this.labels.hour}</span>
      </div>
      <div class="timer-item colon-item"><span></span></div>

      <div class="timer-item minutes-item">
        <span class="minutes-counter">00</span>
        <span class="timeName">${this.labels.minute}</span>
      </div>
      <div class="timer-item colon-item"><span></span></div>

      <div class="timer-item seconds-item">
        <span class="seconds-counter">00</span>
        <span class="timeName">${this.labels.second}</span>
      </div>
    `;
  }

  updateCountdown() {
    const now = new Date();
    const diff = this.endDate - now;

    if (diff <= 0) {
      this.style.display = "none";
      this.parentElement.style.display = "none";
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    this.querySelector(".days-counter").textContent = String(days).padStart(2, "0");
    this.querySelector(".hours-counter").textContent = String(hours).padStart(2, "0");
    this.querySelector(".minutes-counter").textContent = String(minutes).padStart(2, "0");
    this.querySelector(".seconds-counter").textContent = String(seconds).padStart(2, "0");
  }

  connectedCallback() {
    this.addHTML();
    this.updateCountdown();
    this.interval = setInterval(() => this.updateCountdown(), 1000);
  }

  disconnectedCallback() {
    clearInterval(this.interval);
  }
}

customElements.define("countdown-timerb", CountdownTimerb);



if (!customElements.get('card-product-image-slider')) {
  customElements.define(
    'card-product-image-slider',
    class NVCardProductImageSlider extends HTMLElement {
      constructor() {
        super();
        this.init();
      }
      init() {
        this.swiper = new Swiper(this.querySelector('.swiper'), {
          slidesPerView: 1,
          loop: false,
          spaceBetween:  0,
          centeredSlides: false,
          observer: true,        // auto-update when DOM changes
          observeParents: true,  // watch parent elements too
          resizeObserver: true,
          navigation: {
            nextEl: this.querySelector(".swiper-slider-next"),
            prevEl: this.querySelector(".swiper-slider-prev"),
          },
        });
      }
    }
  );
}

class CartProtectionProduct extends HTMLElement {
  constructor() {
    super();
    
    // Protection product details
    this.protectionProductId = this.dataset.vid;
    this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
    this.toggleInput = this.querySelector(".cart-protection-toggle-label input");
    
    // Session storage key to track manual removal
    this.sessionKey = 'protection_manually_removed';
    
    // Initialize component
    this.init();
  }
  
  init() {
    this.addEventListeners();
    this.checkCartForProtection();
  }
  
  // Check if user manually removed protection this session
  isManuallyRemoved() {
    return sessionStorage.getItem(this.sessionKey) === 'true';
  }
  
  // Set manual removal flag
  setManuallyRemoved(value) {
    if (value) {
      sessionStorage.setItem(this.sessionKey, 'true');
    } else {
      sessionStorage.removeItem(this.sessionKey);
    }
  }
  
  addEventListeners() {
    // Toggle protection product when checkbox changes
    this.toggleInput.addEventListener('change', () => {
      if (this.toggleInput.checked) {
        // User manually added protection, clear the removal flag
        this.setManuallyRemoved(false);
        this.addProtectionToCart();
      } else {
        // User manually removed protection, set the flag
        this.setManuallyRemoved(true);
        this.removeProtectionFromCart();
      }
    });
    
    // Listen for cart updates
    document.addEventListener('cart:refresh', () => {
      this.checkCartForProtection();
    });
    document.addEventListener('cart:change', () => {
      this.checkCartForProtection();
    });
    
    // AUTO-ADD: When products are added to cart, auto-add protection if not manually removed
    document.addEventListener('variant:add', () => {
      if (!this.toggleInput.checked && !this.isManuallyRemoved()) {
        this.toggleInput.checked = true;
        this.addProtectionToCart();
      }
    });
  }
  
  async checkCartForProtection() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      // Check if protection product is in cart
      const hasProtection = cart.items.some(item => 
        item.variant_id === parseInt(this.protectionProductId)
      );
      
      // Count items EXCLUDING protection product
      const itemCountWithoutProtection = cart.items.reduce((count, item) => {
        if (item.variant_id !== parseInt(this.protectionProductId)) {
          return count + item.quantity;
        }
        return count;
      }, 0);
      
      // Update toggle state without triggering event
      this.toggleInput.checked = hasProtection;
      
      // AUTO-REMOVE: If cart only has protection product (no other items), remove it
      if (hasProtection && itemCountWithoutProtection === 0) {
        this.toggleInput.checked = false;
        this.removeProtectionFromCart(false); // false = not manual removal
        return;
      }
      
      // AUTO-ADD: If cart has items but no protection, and user hasn't manually removed it
      if (!hasProtection && itemCountWithoutProtection > 0 && !this.isManuallyRemoved()) {
        this.toggleInput.checked = true;
        this.addProtectionToCart();
      }
      
      // Update cart count display (excluding protection product)
      this.updateCartCountDisplay(itemCountWithoutProtection);
      
    } catch (error) {
      console.error('Error checking cart for protection:', error);
    }
  }
  
  // Update the cart count display to exclude protection product
  updateCartCountDisplay(count) {
    // Update all cart count elements - adjust selectors based on your theme
    const cartCountElements = document.querySelectorAll('.cart-count-bubble span, .cart-count, [data-cart-count]');
    cartCountElements.forEach(element => {
      element.textContent = count;
    });
    
    // Hide/show cart count bubble based on count
    const cartBubbles = document.querySelectorAll('.cart-count-bubble');
    cartBubbles.forEach(bubble => {
      bubble.style.display = count > 0 ? '' : 'none';
    });
  }
  
  async addProtectionToCart() {
    try {
      const formData = {
        'items': [{
          'id': this.protectionProductId,
          'quantity': 1,
          "properties": {
            _isprotection: 1
          }
        }],
        sections: this.cart.getSectionsToRender().map((section) => section.id),
        sections_url: window.location.pathname
      };
      
      fetch(`/cart/add.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then((response) => response.json())
      .then((response) => {
        CartPerformance.measure("add:paint-updated-sections", () => {
          this.cart.renderContents(response);
        });
        // Update count after adding
        this.checkCartForProtection();
      })
      .catch(error => {
        console.error('Error:', error);
      });
    } catch (error) {
      console.error('Error adding protection to cart:', error);
      this.toggleInput.checked = false;
    }
  }
  
  // Added isManual parameter to distinguish manual vs automatic removal
  async removeProtectionFromCart(isManual = true) {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      // Find protection item in cart
      const protectionItem = cart.items.find(item => 
        item.variant_id === parseInt(this.protectionProductId)
      );
      
      if (protectionItem) {
        const formData = {
          id: protectionItem.key,
          quantity: 0,
          sections: this.cart.getSectionsToRender().map((section) => section.id),
          sections_url: window.location.pathname
        };
        
        await fetch('/cart/change.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
        .then((response) => response.json())
        .then((response) => {
          CartPerformance.measure("add:paint-updated-sections", () => {
            this.cart.renderContents(response);
          });
          this.cart.classList.toggle('is-empty', response.item_count === 0);
          // Update count after removing
          this.checkCartForProtection();
        })
        .catch(error => {
          console.error('Error:', error);
        });
      }
      
    } catch (error) {
      console.error('Error removing protection from cart:', error);
      this.toggleInput.checked = true;
    }
  }
}
// Register custom element
customElements.define('cart-protection-product', CartProtectionProduct);

class CartRecommendations extends HTMLElement {
  observer = undefined;

  constructor() {
    super();
  }

  connectedCallback() {
    this.initializeRecommendations(this.dataset.productId);
  }

  initializeRecommendations(productId) {
    this.observer?.unobserve(this);
    this.observer = new IntersectionObserver(
      (entries, observer) => {
        if (!entries[0].isIntersecting) return;
        observer.unobserve(this);
        this.loadRecommendations(productId);
      },
      { rootMargin: '0px 0px 400px 0px' }
    );
    this.observer.observe(this);
  }

  loadRecommendations(productId) {
    fetch(`${this.dataset.url}&product_id=${productId}&section_id=${this.dataset.sectionId}&limit=6`)
      .then((response) => response.text())
      .then((text) => {
        const html = document.createElement('div');
        html.innerHTML = text;
        const recommendations = html.querySelector('cart-recommendations');

        if (recommendations?.innerHTML.trim().length) {
          this.innerHTML = recommendations.innerHTML;
        }
        if (html.querySelector('.cart-custom-recommendations')) {
           this.classList.add('cart-recommendations--loaded');
        }
        
      })
      .catch((e) => {
        console.error(e);
      });
  }
}

customElements.define('cart-recommendations', CartRecommendations);
window.addEventListener('load', function() {
    
});
document.addEventListener("DOMContentLoaded", (event) => {
  const sectionElement = document.querySelector(".custom-nv-collection-swatches");
    if(sectionElement){
        const acItem = sectionElement.querySelector(".story-card.eg-active");
        if(acItem){
          let tabwidth = acItem.offsetWidth;
          sectionElement.querySelector(".eg-tabs-nav__position").style.cssText = '--width:' + tabwidth + 'px;--prevWidth:' + (acItem.offsetLeft) + 'px;';
          acItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
        
    }
  const menu_opener_buttons = document.querySelectorAll(".menu-opener");
  if(menu_opener_buttons.length > 0){
    menu_opener_buttons.forEach((button) => {
      button.addEventListener("click",(evt) => {
        document.querySelectorAll(".custom-cl-product-layout-right-item").forEach(el => el.classList.remove("custom-active"));
        document.querySelectorAll(".custom-cl-product-layout-center-item").forEach(el => el.classList.remove("custom-active"));
        if(button.dataset.type == 'center'){
          document.querySelectorAll(".custom-cl-product-layout-left-item").forEach(el => el.classList.remove("custom-active"));
          button.closest(".custom-cl-product-layout-left-item").classList.add("custom-active");
          const element_identifier = `custom-submenu-${button.dataset.submenu}`;
          document.querySelectorAll(".custom-cl-product-layout-center-main").forEach((el) => {
            if(el.id == element_identifier){
              el.classList.add("custom-active");
              
              el.querySelector(".custom-cl-product-layout-center-item button").dispatchEvent(new Event("click"));
            }else{
              el.classList.remove("custom-active");
            }
          });
          
        }else if(button.dataset.type == 'right'){
           const element_identifier = `custom-product-${button.dataset.submenu}`;
           console.log(button.closest(".custom-cl-product-layout-center-item"),element_identifier);
           button.closest(".custom-cl-product-layout-center-item").classList.add("custom-active");
           document.querySelector(`#${element_identifier}`).classList.add("custom-active");
        }
        
      });
    });
  }
});
