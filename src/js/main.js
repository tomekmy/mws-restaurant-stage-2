let restaurants, neighborhoods, cuisines;
var map;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  updateRestaurants();
  fetchNeighborhoods();
  fetchCuisines();
});

window.onload = () => {
  // Register service worker
  DBHelper.registerSW();
};

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.insertAdjacentElement('beforeend', option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.insertAdjacentElement('beforeend', option);
  });
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
let fillRestaurantsHTML = new Promise((resolve) => {
  resolve((restaurants = self.restaurants) => {

  });
});
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  let insertRestaurant = '';
  // Remove no restaurants info
  const parent = document.getElementById('main-content-wrapper');
  const child = document.getElementsByClassName('no-restaurants')[0];
  if (child) {
    parent.removeChild(child);
  }

  if (restaurants.length > 0) {
    restaurants.forEach(restaurant => {
      insertRestaurant = insertRestaurant + createRestaurantHTML(restaurant).outerHTML;
    });
  } else {
    // Add info text when no restaurants found
    ul.innerHTML = '<h4 class="no-restaurants">No restaurants found:(</h4>';
  }
  ul.innerHTML = insertRestaurant;
  // addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  /**
   * Create picture element and fill it with data.
   */
  const picture = document.createElement('picture');
  const sizes = '(min-width: 2300px) 800px, (min-width: 1470px) 600px, (min-width: 1120px) 350px, (min-width: 960px) 600px, (min-width: 680px) 350px';
  picture.innerHTML = `
    <source type="image/webp" sizes="${sizes}" data-srcset="img/${restaurant.photograph}_small.webp 350w, img/${restaurant.photograph}_medium.webp 600w, img/${restaurant.photograph}_large.webp 600w">
    <source sizes="${sizes}" data-srcset="img/${restaurant.photograph}_small.jpg 350w, img/${restaurant.photograph}_medium.jpg 600w, img/${restaurant.photograph}_large.jpg 600w">
    <img class="lazyload restaurant-img" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAJYAQMAAACguBAzAAAAA1BMVEXz8/ML3eGLAAAAUElEQVR42u3BAQEAAACCoP6vbojAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACDg7LgAAfCRwpsAAAAASUVORK5CYII=" data-src="img/${restaurant.photograph}.jpg" alt="${restaurant.name}">
  `;
  li.insertAdjacentElement('beforeend', picture);

  const name = document.createElement('h3');
  name.innerHTML = restaurant.name;
  li.insertAdjacentElement('beforeend', name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.insertAdjacentElement('beforeend', neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.insertAdjacentElement('beforeend', address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.setAttribute('role', 'button');
  more.setAttribute('aria-label', `${restaurant.name}. View details`);
  more.href = `./restaurant.html?id=${restaurant.id}`;
  li.insertAdjacentElement('beforeend', more);
  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
};
