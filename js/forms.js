(() => {
const subscribeForm = document.querySelector('.subscribe__form');
if (subscribeForm) {
  const emailInput = subscribeForm.querySelector('.subscribe__input');
  const subscribeButton = subscribeForm.querySelector('.subscribe__button');
  const emailError = subscribeForm.querySelector('.subscribe__error');
  let isSending = false;
  const handleEmailInput = () => {
    emailInput.removeAttribute('aria-invalid');
    emailError.textContent = '';
  };
  const handleSubscribeSubmit = async (event) => {
    event.preventDefault();
    if (isSending) return;
    emailInput.value = emailInput.value.trim();
    if (!emailInput.validity.valid) {
      emailInput.setAttribute('aria-invalid', 'true');
      emailError.textContent = emailInput.validity.valueMissing ? 'Please enter your email address.' : 'Please enter a valid email address.';
      emailInput.focus();
      return;
    }
    handleEmailInput();
    isSending = true;
    subscribeButton.disabled = true;
    subscribeForm.setAttribute('aria-busy', 'true');
    // Demo only: no network request or storage of the email address.
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 600));
      window.alert('Your email has been sent');
      subscribeForm.reset();
    } finally {
      isSending = false;
      subscribeButton.disabled = false;
      subscribeForm.removeAttribute('aria-busy');
    }
  };
  emailInput.addEventListener('input', handleEmailInput);
  subscribeForm.addEventListener('submit', handleSubscribeSubmit);
}
const requestModal = document.querySelector('.request-modal');
if (requestModal) {
  const requestForm = requestModal.querySelector('.request-form');
  const requestTitle = requestModal.querySelector('.request-modal__title');
  const requestSuccess = requestModal.querySelector('.request-modal__success');
  const closeButton = requestModal.querySelector('.request-modal__close');
  const submitButton = requestForm.querySelector('.request-form__submit');
  const requestStatus = requestForm.querySelector('.request-form__status');
  const nameInput = requestForm.elements.namedItem('name');
  const phoneInput = requestForm.elements.namedItem('phone');
  const emailInput = requestForm.elements.namedItem('email');
  const consentInput = requestForm.elements.namedItem('consent');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let triggerButton = null;
  let savedScrollY = 0;
  let isClosing = false;
  let isSubmitting = false;
  let requestVersion = 0;
  let openingAnimation = null;
  let backdropPointerDown = false;

  const setRequestError = (input, message) => {
    const error = document.getElementById(input.getAttribute('aria-describedby'));
    error.textContent = message;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  };

  const formatRequestPhone = (digits) => {
    if (!digits) return '';
    const number = digits.slice(1, 11);
    let value = '+7';
    if (number.length) value += ` (${number.slice(0, 3)}`;
    if (number.length >= 3) value += ') ';
    if (number.length > 3) value += number.slice(3, 6);
    if (number.length > 6) value += `-${number.slice(6, 8)}`;
    if (number.length > 8) value += `-${number.slice(8, 10)}`;
    return value;
  };

  const normalizeRequestDigits = (value) => {
    const raw = value.trim();
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    if (raw.startsWith('+')) {
      return raw.startsWith('+7') && digits.length <= 11 ? digits : null;
    }
    if (digits.length === 10) return `7${digits}`;
    if (digits.length === 11 && digits.startsWith('8')) return `7${digits.slice(1)}`;
    if (digits.startsWith('7') && digits.length <= 11) return digits;
    if (digits === '8') return '7';
    return digits.length < 10 ? `7${digits}` : null;
  };

  const handlePhoneValidation = () => {
    setRequestError(phoneInput, /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phoneInput.value) ? '' : 'Enter a complete phone number: +7 (999) 999-99-99.');
  };

  const handlePhoneInput = () => {
    const oldValue = phoneInput.value;
    const oldCaret = phoneInput.selectionStart ?? oldValue.length;
    const digits = normalizeRequestDigits(oldValue);
    if (digits === null) {
      handlePhoneValidation();
      return;
    }
    const digitsBeforeCaret = normalizeRequestDigits(oldValue.slice(0, oldCaret))?.length || 0;
    phoneInput.value = formatRequestPhone(digits);
    let caret = 0;
    let count = 0;
    while (caret < phoneInput.value.length && count < digitsBeforeCaret) {
      if (/\d/.test(phoneInput.value[caret])) count += 1;
      caret += 1;
    }
    if (oldCaret === oldValue.length) caret = phoneInput.value.length;
    phoneInput.setSelectionRange(caret, caret);
    handlePhoneValidation();
  };

  const handlePhoneBeforeInput = (event) => {
    if (!['deleteContentBackward', 'deleteContentForward'].includes(event.inputType)) return;
    const start = phoneInput.selectionStart;
    const end = phoneInput.selectionEnd;
    if (start !== end || !phoneInput.value) return;
    const backward = event.inputType === 'deleteContentBackward';
    const adjacent = backward ? start - 1 : start;
    if (/\d/.test(phoneInput.value[adjacent] || '')) return;
    event.preventDefault();
    let index = adjacent;
    while (index >= 0 && index < phoneInput.value.length && !/\d/.test(phoneInput.value[index])) index += backward ? -1 : 1;
    if (index < 0 || index >= phoneInput.value.length) return;
    const digits = phoneInput.value.replace(/\D/g, '').split('');
    const digitIndex = phoneInput.value.slice(0, index).replace(/\D/g, '').length;
    if (digitIndex === 0) phoneInput.value = '';
    else {
      digits.splice(digitIndex, 1);
      phoneInput.value = formatRequestPhone(digits.join(''));
      const caret = Math.min(index, phoneInput.value.length);
      phoneInput.setSelectionRange(caret, caret);
    }
    handlePhoneValidation();
  };

  const validateRequest = () => {
    nameInput.value = nameInput.value.trim().normalize('NFC');
    emailInput.value = emailInput.value.trim();
    // Letters, spaces and at most one hyphen or apostrophe across the full name.
    const validName = /\p{L}/u.test(nameInput.value)
      && /^[\p{Script=Cyrillic}\p{Script=Latin}\s'’\-]+$/u.test(nameInput.value)
      && (nameInput.value.match(/['’\-]/g) || []).length <= 1;
    setRequestError(nameInput, validName ? '' : 'Enter a name using Cyrillic or Latin letters and at most one hyphen or apostrophe.');
    handlePhoneValidation();
    setRequestError(emailInput, emailInput.validity.valid ? '' : 'Please enter a valid email address.');
    setRequestError(consentInput, consentInput.checked ? '' : 'Please agree to the Privacy Policy.');
    const firstInvalid = requestForm.querySelector('[aria-invalid="true"]');
    firstInvalid?.focus();
    return !firstInvalid;
  };

  const openRequestModal = (trigger) => {
    if (requestModal.open || isClosing) return;
    triggerButton = trigger;
    const propertyId = trigger.dataset.propertyId || '';
    requestForm.elements.namedItem('propertyId').value = propertyId;
    const deal = trigger.dataset.deal || 'buy';
    const dealRadio = [...requestForm.querySelectorAll('[name="deal"]')].find((radio) => radio.value === deal);
    if (dealRadio) dealRadio.checked = true;
    if (trigger.dataset.email) emailInput.value = trigger.dataset.email;
    savedScrollY = window.scrollY;
    document.body.style.top = `-${savedScrollY}px`;
    document.body.classList.add('has-request-modal');
    requestModal.showModal();
    nameInput.focus({ preventScroll: true });
    requestModal.scrollTop = 0;
    if (!reduceMotion.matches) {
      openingAnimation = requestModal.animate([
        { opacity: 0, transform: 'translateY(20px) scale(.97)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' },
      ], { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
  };

  const closeRequestModal = async () => {
    if (!requestModal.open || isClosing) return;
    isClosing = true;
    requestVersion += 1;
    openingAnimation?.cancel();
    requestModal.classList.add('is-closing');
    if (!reduceMotion.matches) {
      await requestModal.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(12px)' }], { duration: 180, easing: 'ease-in' }).finished.catch(() => {});
    }
    requestModal.close();
    requestModal.classList.remove('is-closing');
    document.body.classList.remove('has-request-modal');
    document.body.style.top = '';
    window.scrollTo(0, savedScrollY);
    requestTitle.hidden = false;
    requestForm.hidden = false;
    requestSuccess.hidden = true;
    requestModal.setAttribute('aria-labelledby', 'request-title');
    submitButton.disabled = false;
    requestForm.removeAttribute('aria-busy');
    requestStatus.textContent = '';
    isSubmitting = false;
    isClosing = false;
    const returnTarget = triggerButton?.getClientRects().length ? triggerButton : document.querySelector('.header__toggle:not([hidden])');
    returnTarget?.focus({ preventScroll: true });
  };

  const handleRequestSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting || !validateRequest()) return;
    isSubmitting = true;
    const version = ++requestVersion;
    submitButton.disabled = true;
    requestForm.setAttribute('aria-busy', 'true');
    requestStatus.textContent = 'Sending…';
    try {
      // Simulation only. No personal data is sent or stored.
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      if (version !== requestVersion || !requestModal.open || isClosing) return;
      requestForm.reset();
      requestForm.hidden = true;
      requestTitle.hidden = true;
      requestSuccess.hidden = false;
      requestSuccess.id = 'request-success';
      requestModal.setAttribute('aria-labelledby', 'request-success');
      requestModal.scrollTop = 0;
      requestSuccess.focus({ preventScroll: true });
    } catch {
      if (version === requestVersion) requestStatus.textContent = 'Something went wrong. Please try again.';
    } finally {
      if (version === requestVersion) {
        isSubmitting = false;
        submitButton.disabled = false;
        requestForm.removeAttribute('aria-busy');
        if (!requestSuccess.hidden) requestStatus.textContent = '';
      }
    }
  };

  const handleRequestTrigger = (event) => {
    const trigger = event.target.closest('.header__contact, .hero__button, .property-card__button, [data-open-request]');
    if (!trigger) return;
    openRequestModal(trigger);
  };
  const handleRequestCancel = (event) => { event.preventDefault(); closeRequestModal(); };
  const handleRequestPointerDown = (event) => {
    const rect = requestModal.getBoundingClientRect();
    backdropPointerDown = event.target === requestModal && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
  };
  const handleRequestClick = (event) => {
    const rect = requestModal.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (backdropPointerDown && outside && event.target === requestModal) closeRequestModal();
    backdropPointerDown = false;
  };
  const handleRequestKeyDown = (event) => {
    if (event.key !== 'Tab') return;
    const focusable = [...requestModal.querySelectorAll('button:not(:disabled), input:not([type="hidden"]), a[href]')].filter((element) => element.getClientRects().length);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === requestSuccess)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === requestSuccess)) { event.preventDefault(); first.focus(); }
  };
  const handleRequestFieldInput = (event) => {
    if (event.target.matches('[aria-describedby]')) setRequestError(event.target, '');
  };
  document.addEventListener('click', handleRequestTrigger);
  closeButton.addEventListener('click', closeRequestModal);
  requestModal.addEventListener('cancel', handleRequestCancel);
  requestModal.addEventListener('pointerdown', handleRequestPointerDown);
  requestModal.addEventListener('click', handleRequestClick);
  requestModal.addEventListener('keydown', handleRequestKeyDown);
  requestForm.addEventListener('submit', handleRequestSubmit);
  requestForm.addEventListener('input', handleRequestFieldInput);
  phoneInput.addEventListener('input', handlePhoneInput);
  phoneInput.addEventListener('blur', handlePhoneValidation);
  phoneInput.addEventListener('beforeinput', handlePhoneBeforeInput);
}
})();
