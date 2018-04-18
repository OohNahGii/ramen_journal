CREATE TABLE restaurant (
  restaurant_id INT NOT NULL AUTO_INCREMENT,
  restaurant_name VARCHAR(255) NOT NULL,
  restaurant_url VARCHAR(255),
  city VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  lat_lng POINT NOT NULL,
  PRIMARY KEY(restaurant_id),
  UNIQUE KEY(lat_lng)
);

CREATE TABLE noodles (
  noodles_id INT NOT NULL AUTO_INCREMENT,
  description TEXT NOT NULL,
  rating FLOAT(2,1) UNSIGNED NOT NULL,
  PRIMARY KEY(noodles_id)
);

CREATE TABLE broth (
  broth_id INT NOT NULL AUTO_INCREMENT,
  description TEXT NOT NULL,
  rating FLOAT(2,1) UNSIGNED NOT NULL,
  PRIMARY KEY(broth_id)
);

CREATE TABLE toppings (
  toppings_id INT NOT NULL AUTO_INCREMENT,
  description TEXT NOT NULL,
  rating FLOAT(2,1) UNSIGNED NOT NULL,
  PRIMARY KEY(toppings_id)
);

CREATE TABLE entry (
  entry_id INT NOT NULL AUTO_INCREMENT,
  entry_name VARCHAR(255) NOT NULL,
  restaurant_id INT NOT NULL,
  entry_date DATE NOT NULL,
  rating FLOAT(2,1) UNSIGNED NOT NULL,
  noodles_id INT NOT NULL,
  broth_id INT NOT NULL,
  toppings_id INT NOT NULL,
  notes LONGTEXT NOT NULL,
  PRIMARY KEY(entry_id),
  FOREIGN KEY(restaurant_id) REFERENCES restaurant(restaurant_id),
  FOREIGN KEY(noodles_id) REFERENCES noodles(noodles_id),
  FOREIGN KEY(broth_id) REFERENCES broth(broth_id),
  FOREIGN KEY(toppings_id) REFERENCES toppings(toppings_id)
);

CREATE TABLE image (
  image_id INT NOT NULL AUTO_INCREMENT,
  entry_id INT NOT NULL,
  image_type VARCHAR(255) NOT NULL,
  image_name VARCHAR(255) NOT NULL,
  PRIMARY KEY(image_id),
  FOREIGN KEY(entry_id) REFERENCES entry(entry_id)
);