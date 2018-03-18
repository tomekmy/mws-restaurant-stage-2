let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

window.onload = () => {
  window.setTimeout(() => {
    // Add title to Google Maps iframe
    document.querySelectorAll('#map iframe').forEach((item) => {
      item.setAttribute('title', 'Google maps iframe');
    });
    // Remove Google map elements from tab order when page (google maps and markers) is loaded
    // Maps and markers has an animation so I add a little timeout to allow all maps elements appear in the DOM
    DBHelper.removeMapsTabOrder();
  }, 1000);
};

window.onresize = () => {
  // Remove Google map elements from tab order when page is resized
  window.setTimeout(() => {
    DBHelper.removeMapsTabOrder();
  }, 500);
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
}

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
}

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
}

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
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
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
  })
}

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
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  // Remove no restaurants info
  const parent = document.getElementById('main-content-wrapper');
  const child = document.getElementsByClassName('no-restaurants')[0];
  if (child) {
    parent.removeChild(child);
  }

  if (restaurants.length > 0) {
    restaurants.forEach(restaurant => {
      ul.insertAdjacentElement('beforeend', createRestaurantHTML(restaurant));
    });
  } else {
    // Add info text when no restaurants found
    ul.insertAdjacentHTML('beforebegin', '<h4 class="no-restaurants">No restaurants found:(</h4>');
  }
  addMarkersToMap();
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
  picture.insertAdjacentHTML('beforeend', `
    <source type="image/webp" sizes="${sizes}" srcset="${DBHelper.webpSourceForRestaurant(restaurant)}">
    <source sizes="${sizes}" srcset="${DBHelper.imageSourceForRestaurant(restaurant)}">
    <img class="restaurant-img" src="${DBHelper.imageUrlForRestaurant(restaurant)}" alt="${restaurant.name} restaurant">
  `);
  li.insertAdjacentElement('beforeend', picture);

  const name = document.createElement('h2');
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
  more.href = DBHelper.urlForRestaurant(restaurant);
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
  // Remove Google map elements from tab order when changing filter
  // Maps and markers has an animation so I add a little timeout to allow all maps elements appear in the DOM  
  window.setTimeout(() => {
    DBHelper.removeMapsTabOrder();
  }, 1000);
};
