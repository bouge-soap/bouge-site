// BOUGE — Klaviyo signup form handling
// Public API Key + List ID are safe to expose client-side (Klaviyo's client
// subscribe API is designed for this — it cannot read/export data, only add
// a profile to the given list).
const KLAVIYO_PUBLIC_API_KEY = 'W6Yhh3';
const KLAVIYO_LIST_ID = 'YnmcN5';
const KLAVIYO_API_REVISION = '2024-10-15';

async function subscribeToKlaviyo(email) {
  const response = await fetch(
    `https://a.klaviyo.com/client/subscriptions/?company_id=${KLAVIYO_PUBLIC_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'revision': KLAVIYO_API_REVISION,
      },
      body: JSON.stringify({
        data: {
          type: 'subscription',
          attributes: {
            custom_source: 'BOUGE website signup',
            profile: {
              data: {
                type: 'profile',
                attributes: { email },
              },
            },
          },
          relationships: {
            list: {
              data: { type: 'list', id: KLAVIYO_LIST_ID },
            },
          },
        },
      }),
    }
  );

  return response.ok;
}

// Hero entrance
const heroContent = document.querySelector('.hero__content');
if (heroContent) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => heroContent.classList.add('is-loaded'));
  });
}

// Scroll-triggered reveals
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

// Nav shadow once page scrolls
const nav = document.querySelector('.nav');
if (nav) {
  const toggleNavShadow = () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 8);
  };
  toggleNavShadow();
  window.addEventListener('scroll', toggleNavShadow, { passive: true });
}

document.querySelectorAll('.signup-form').forEach((form) => {
  const input = form.querySelector('.signup-form__input');
  const button = form.querySelector('.signup-form__button');
  const errorEl = form.parentElement.querySelector('.signup-form__error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorEl) errorEl.classList.remove('is-visible');

    button.disabled = true;
    button.textContent = 'Joining...';

    try {
      const ok = await subscribeToKlaviyo(input.value.trim());
      if (ok) {
        button.textContent = "You're in";
        input.value = '';
        input.disabled = true;
      } else {
        throw new Error('Klaviyo request failed');
      }
    } catch (err) {
      button.textContent = 'Try again';
      button.disabled = false;
      if (errorEl) errorEl.classList.add('is-visible');
    }
  });
});
