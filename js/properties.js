(() => {
const properties = [
  { id: 'house-1', imageNumber: 1, title: 'Capital hill residence', price: '$5527.00', alt: 'Two-storey cream house with a balcony and green garden' },
  { id: 'house-2', imageNumber: 3, title: 'Picket Fence Realty', price: '$6727.00', alt: 'White homes with steep black pitched roofs' },
  { id: 'house-3', imageNumber: 5, title: 'Banyon Tree Realty', price: '$4327.00', alt: 'White villa with a glass balcony and orange facade details' },
  { id: 'house-4', imageNumber: 2, title: 'Corsair Real Estate', price: '$4427.00', alt: 'Contemporary white and wood villa with large windows and a garage' },
  { id: 'house-5', imageNumber: 6, title: 'Sequoia Real Estate', price: '$4527.00', alt: 'Traditional family house with stone cladding and gabled roofs' },
  { id: 'house-6', imageNumber: 4, title: 'Strive Partners Realty', price: '$5527.00', alt: 'Modern two-storey residence with warm lighting at dusk' },
];

const propertyGrid = document.querySelector('.properties__grid');
const propertyTemplate = document.getElementById('property-template');

const renderProperties = () => {
  if (!propertyGrid || !propertyTemplate) return;

  const fragment = document.createDocumentFragment();

  properties.forEach((property) => {
    const card = propertyTemplate.content.cloneNode(true);
    const image = card.querySelector('.property-card__image');
    const title = card.querySelector('.property-card__title');
    const button = card.querySelector('.property-card__button');
    const imageNumber = property.imageNumber;

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
})();
