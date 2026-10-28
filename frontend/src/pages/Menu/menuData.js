// Sample menu shown when the backend is offline or has no dishes yet.
// Images come from src/assets/menu/<folder>/ (see assets/menu/menuImages.js).
import { getImage  } from "../../assests/menu/menuImages.js";

const dish = (id, name, description, price, category, subcategory, folder, slug) => ({
  id: `demo-${id}`,
  name,
  description,
  price,
  category,
  subcategory,
  image: folder ? getImage(folder, slug) : '',
  available: true,
});

export const demoMenu = [
  // Veg
  dish('v1', 'Vegetable Spring Roll', 'Crispy, savory appetizer', 120, 'Veg', 'Starters', 'veg', 'spring-rolls'),
  dish('v2', 'Fresh Rice Paper Rolls', 'Crunchy veggies with mint', 160, 'Veg', 'Starters', 'veg', 'rice-paper-rolls'),
  dish('v3', 'Idli Vada Platter', 'Soft idli, crisp vada, chutneys', 110, 'Veg', 'Starters', 'veg', 'idli-vada'),
  dish('v4', 'Grilled Veg Platter', 'Smoky grilled vegetables', 220, 'Veg', 'Starters', 'veg', 'grilled-veg-platter'),
  dish('v5', 'Vegetable Pulao', 'Fragrant rice with peas and herbs', 240, 'Veg', 'Main Course', 'veg', 'vegetable-pulao'),
  dish('v6', 'Buddha Bowl', 'Fresh salad bowl with dips', 280, 'Veg', 'Main Course', 'veg', 'buddha-bowl'),
  dish('v7', 'Spiced Thali', 'Papad, dal, rice and sides', 320, 'Veg', 'Main Course', 'veg', 'spiced-thali'),
  dish('v8', 'Classic Veg Thali', 'Dal, rice, sabzi and fry', 300, 'Veg', 'Main Course', 'veg', 'veg-thali'),

  // Non-Veg
  dish('n1', 'Butter Chicken', 'Creamy tomato gravy, tender chicken', 420, 'Non Veg', 'Main Course', 'non-veg', 'butter-chicken'),
  dish('n2', 'Chicken Karahi', 'Sauté whole spices, onion..', 460, 'Non Veg', 'Main Course', 'non-veg', 'chicken-karahi'),
  dish('n3', 'Chicken Curry', 'Home-style spicy curry', 380, 'Non Veg', 'Main Course', 'non-veg', 'chicken-curry'),
  dish('n4', 'Mutton Rogan Josh', 'A signature Kashmiri slow..', 660, 'Non Veg', 'Main Course', 'non-veg', 'mutton-curry'),
  dish('n5', 'Chicken Biryani', 'Aromatic rice with spiced chicken', 360, 'Non Veg', 'Biryani & More', 'non-veg', 'chicken-biryani'),
  dish('n6', 'Dum Biryani', 'Slow-cooked, served with raita', 400, 'Non Veg', 'Biryani & More', 'non-veg', 'dum-biryani'),
  dish('n7', 'Chicken Cheese Pizza', 'Loaded with cheese and chicken', 380, 'Non Veg', 'Biryani & More', 'non-veg', 'chicken-pizza'),

  // Liquors
  dish('l1', 'Premium Vodka', 'Smooth, chilled, 60 ml', 450, 'Alcohol', 'Spirits', 'liquors', 'vodka'),
  dish('l2', 'Champagne', 'Classic French bubbly, glass', 950, 'Alcohol', 'Spirits', 'liquors', 'champagne'),
  dish('l3', 'Limoncello', 'Sweet lemon liqueur, 60 ml', 380, 'Alcohol', 'Spirits', 'liquors', 'limoncello'),
  dish('l4', 'Herbal Liqueur', 'Bittersweet herbal digestif', 420, 'Alcohol', 'Spirits', 'liquors', 'herbal-liqueur'),
  dish('l5', 'House Red Wine', 'Full-bodied red, glass', 520, 'Alcohol', 'Wines & Shots', 'liquors', 'wine-bottles'),
  dish('l6', 'Aguardiente Shot', 'Anise spirit, served neat', 300, 'Alcohol', 'Wines & Shots', 'liquors', 'aguardiente'),
  dish('l7', 'Becherovka', 'Spiced herbal shot', 350, 'Alcohol', 'Wines & Shots', 'liquors', 'becherovka'),

  // Non-alcoholic drinks
  dish('d1', 'Fresh Lime Soda', 'Sweet or salted', 80, 'Soft Drink', 'Drinks', null),
  dish('d2', 'Mango Lassi', 'Thick, chilled yogurt drink', 120, 'Soft Drink', 'Drinks', null),
  dish('d3', 'Cold Coffee', 'Creamy iced coffee', 140, 'Soft Drink', 'Drinks', null),
  dish('d4', 'Virgin Mojito', 'Mint, lime and soda', 150, 'Soft Drink', 'Drinks', null),

  // Desserts
  dish('s1', 'Chocolate Brownie', 'Warm fudgy brownie with coffee', 180, 'Dessert', 'Desserts', 'desserts', 'brownie'),
  dish('s2', 'Black Forest Cake', 'Layered chocolate and cherries', 260, 'Dessert', 'Desserts', 'desserts', 'black-forest-cake'),
  dish('s3', 'Strawberry Crepes', 'Fresh cream and strawberries', 220, 'Dessert', 'Desserts', 'desserts', 'strawberry-crepes'),
  dish('s4', 'Glazed Donuts', 'Chocolate glaze and sprinkles', 150, 'Dessert', 'Desserts', 'desserts', 'donuts'),
  dish('s5', 'Gelato Scoops', 'Assorted Italian-style flavours', 170, 'Dessert', 'Desserts', 'desserts', 'gelato'),
  dish('s6', 'Sprinkle Ice Cream Bowl', 'Vanilla scoops in a sprinkle shell', 200, 'Dessert', 'Desserts', 'desserts', 'sprinkle-ice-cream'),
  dish('s7', 'Blueberry Cake Slice', 'Soft sponge with blueberry glaze', 190, 'Dessert', 'Desserts', 'desserts', 'blueberry-cake'),
  dish('s8', 'Pink Cupcakes', 'Buttercream swirls and sprinkles', 120, 'Dessert', 'Desserts', 'desserts', 'cupcakes'),
  dish('s9', 'Ice Cream Cup', 'Creamy scoop on fruit crush', 130, 'Dessert', 'Desserts', 'desserts', 'ice-cream-cup'),
];
