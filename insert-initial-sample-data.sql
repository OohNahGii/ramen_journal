INSERT INTO restaurant (restaurant_name, restaurant_url, city, state, country, lat_lng) 
VALUES ('Ramen Shop', 'http://www.google.com', 'San Francisco', 'CA', 'USA', ST_GeomFromText('POINT(37.790137 -122.396900)'));

INSERT INTO broth (description, rating) 
VALUES ('Shoyu', 4.0);

INSERT INTO noodles (description, rating) 
VALUES ('Thin, straight', 3.0);

INSERT INTO toppings (description, rating) 
VALUES ('Chashu, egg, bamboo shoots, nori', 3.5);

INSERT INTO entry (entry_name, restaurant_id, entry_date, rating, noodles_id, broth_id, toppings_id, notes)
VALUES ('Shoyu Ramen', 1, '20180418', 3.5, 1, 1, 1, 'This is the first sentence.;;This is the second sentence.;;This is the third sentence');

INSERT INTO image (entry_id, image_type, image_name)
VALUES (1, 'list', '1-list.png');

INSERT INTO image (entry_id, image_type, image_name)
VALUES (1, 'detail', '1-detail.png');