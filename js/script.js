const properties = [
  { id: 'house-1', title: 'Sunny Family Home', price: '$5527.00', alt: 'Two-storey cream house with a balcony and green garden' },
  { id: 'house-2', title: 'Modern Garden Villa', price: '$6727.00', alt: 'Contemporary white and wood villa with large windows and a garage' },
  { id: 'house-3', title: 'Scandinavian Retreat', price: '$4327.00', alt: 'White homes with steep black pitched roofs' },
  { id: 'house-4', title: 'Contemporary Residence', price: '$4427.00', alt: 'Modern two-storey residence with warm lighting at dusk' },
  { id: 'house-5', title: 'Glass Terrace Villa', price: '$4527.00', alt: 'White villa with a glass balcony and orange facade details' },
  { id: 'house-6', title: 'Classic Family House', price: '$5527.00', alt: 'Traditional family house with stone cladding and gabled roofs' },
];

const propertyGrid = document.querySelector('.properties__grid');
const propertyTemplate = document.getElementById('property-template');

const renderProperties = () => {
  if (!propertyGrid || !propertyTemplate) return;

  const fragment = document.createDocumentFragment();

  properties.forEach((property, index) => {
    const card = propertyTemplate.content.cloneNode(true);
    const image = card.querySelector('.property-card__image');
    const title = card.querySelector('.property-card__title');
    const button = card.querySelector('.property-card__button');
    const imageNumber = index + 1;

    image.src = `assets/img/house-${imageNumber}-724.webp`;
    image.srcset = `assets/img/house-${imageNumber}-362.webp 362w, assets/img/house-${imageNumber}-724.webp 724w`;
    image.alt = property.alt;
    title.textContent = property.title;
    title.id = `${property.id}-title`;
    card.querySelector('.property-card').setAttribute('aria-labelledby', title.id);
    card.querySelector('.property-card__price').textContent = property.price;
    button.dataset.propertyId = property.id;
    button.setAttribute('aria-label', `Leave request for ${property.title}`);
    fragment.append(card);
  });

  propertyGrid.replaceChildren(fragment);
};

renderProperties();

const menuToggle = document.querySelector('.header__toggle');
const headerMenu = document.querySelector('.header__menu');
const desktopMedia = window.matchMedia('(min-width: 800px)');

const setMenuOpen = (isOpen) => {
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  headerMenu.hidden = !desktopMedia.matches && !isOpen;
};

const handleMenuToggle = () => {
  setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
};

const handleMenuClick = (event) => {
  if (!event.target.closest('a, button') || desktopMedia.matches) return;

  setMenuOpen(false);
  menuToggle.focus();
};

const handleKeyDown = (event) => {
  if (event.key !== 'Escape' || menuToggle.getAttribute('aria-expanded') !== 'true') return;

  setMenuOpen(false);
  menuToggle.focus();
};

const handleViewportChange = () => {
  const menuHasFocus = headerMenu.contains(document.activeElement);
  const toggleHasFocus = document.activeElement === menuToggle;

  menuToggle.hidden = desktopMedia.matches;
  setMenuOpen(false);

  if (!desktopMedia.matches && menuHasFocus) menuToggle.focus();
  if (desktopMedia.matches && toggleHasFocus) headerMenu.querySelector('a').focus();
};

if (menuToggle && headerMenu) {
  menuToggle.addEventListener('click', handleMenuToggle);
  headerMenu.addEventListener('click', handleMenuClick);
  document.addEventListener('keydown', handleKeyDown);
  desktopMedia.addEventListener('change', handleViewportChange);
  handleViewportChange();
}

const navigationLinks = [...document.querySelectorAll('.header__link[href^="#"]')];
let navigationFrame = 0;

const updateActiveSection = () => {
  navigationFrame = 0;
  const sections = navigationLinks
    .map((link) => ({ link, section: document.getElementById(link.hash.slice(1)) }))
    .filter(({ section }) => section)
    .sort((first, second) => first.section.getBoundingClientRect().top - second.section.getBoundingClientRect().top);

  if (!sections.length) return;

  const activationLine = window.innerHeight * 0.3;
  let activeLink = sections[0].link;

  for (const { link, section } of sections) {
    if (section.getBoundingClientRect().top > activationLine) break;
    activeLink = link;
  }

  for (const link of navigationLinks) {
    if (link === activeLink) {
      link.setAttribute('aria-current', 'location');
      continue;
    }

    link.removeAttribute('aria-current');
  }
};

const handleSectionScroll = () => {
  if (navigationFrame) return;
  navigationFrame = window.requestAnimationFrame(updateActiveSection);
};

window.addEventListener('scroll', handleSectionScroll, { passive: true });
window.addEventListener('resize', handleSectionScroll);
window.addEventListener('load', handleSectionScroll);
updateActiveSection();
