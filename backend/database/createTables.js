const db = require("../config/db"); 

async function createTables() { 
  try { 
    // Users Table 
    await db.query(` 
      CREATE TABLE IF NOT EXISTS users ( 
        id INT PRIMARY KEY AUTO_INCREMENT, 
        name VARCHAR(100) NOT NULL, 
        email VARCHAR(100) UNIQUE NOT NULL, 
        password VARCHAR(255) NOT NULL, 
        phone VARCHAR(15), 
        role ENUM('customer','owner','admin') DEFAULT 'customer', 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
      ) 
    `); 
    console.log("✅ Users table created"); 

    // Restaurants Table (Fixed closing parenthesis)
    await db.query(` 
      CREATE TABLE IF NOT EXISTS restaurants ( 
        id INT PRIMARY KEY AUTO_INCREMENT, 
        owner_id INT NOT NULL, 
        restaurant_name VARCHAR(150) NOT NULL, 
        description TEXT, 
        address TEXT, 
        image VARCHAR(255), 
        rating DECIMAL(2,1) DEFAULT 0, 
        status ENUM('active','inactive') DEFAULT 'active', 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
      ) 
    `); 
    console.log("✅ Restaurants table created"); 

    await db.query(`
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id INT NOT NULL,
    category_name VARCHAR(100) NOT NULL,

    FOREIGN KEY (restaurant_id)
    REFERENCES restaurants(id)
    ON DELETE CASCADE
)
`);

console.log("✅ Categories table created");

    // Foods Table
    await db.query(` 
      CREATE TABLE IF NOT EXISTS foods ( 
        id INT PRIMARY KEY AUTO_INCREMENT, 
        restaurant_id INT NOT NULL, 
        category_id INT, 
        food_name VARCHAR(150) NOT NULL, 
        description TEXT, 
        price DECIMAL(10,2) NOT NULL, 
        image VARCHAR(255), 
        available BOOLEAN DEFAULT TRUE, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE, 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL 
      ); 
    `); 
    console.log("✅ foods table created"); 

//cart table
      await db.query(` 
  CREATE TABLE IF NOT EXISTS carts (

    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE

); 
    `); 
    console.log("✅ carts table created"); 


          await db.query(` 
CREATE TABLE IF NOT EXISTS cart_items (

    id INT PRIMARY KEY AUTO_INCREMENT,

    cart_id INT NOT NULL,

    food_id INT NOT NULL,

    quantity INT DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(cart_id)
    REFERENCES carts(id)
    ON DELETE CASCADE,

    FOREIGN KEY(food_id)
    REFERENCES foods(id)
    ON DELETE CASCADE

);
    `); 
    console.log("✅ cart_items table created"); 

    
          await db.query(` 
CREATE TABLE IF NOT EXISTS orders (

    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    total_amount DECIMAL(10,2) NOT NULL,

    status ENUM(
        'pending',
        'confirmed',
        'preparing',
        'out_for_delivery',
        'delivered',
        'cancelled'
    ) DEFAULT 'pending',

    delivery_address TEXT NOT NULL,

    payment_method ENUM(
        'COD',
        'ONLINE'
    ) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE

);
    `); 
    console.log("✅ orders table created"); 

           await db.query(` 
CREATE TABLE IF NOT EXISTS order_items (

    id INT PRIMARY KEY AUTO_INCREMENT,

    order_id INT NOT NULL,

    food_id INT NOT NULL,

    quantity INT NOT NULL,

    price DECIMAL(10,2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,

    FOREIGN KEY(food_id)
    REFERENCES foods(id)
    ON DELETE CASCADE

);
    `); 
    console.log("✅ order_items table created"); 


             await db.query(` 
CREATE TABLE IF NOT EXISTS reviews (

    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    restaurant_id INT NOT NULL,

    food_id INT,

    order_id INT,

    rating INT NOT NULL,

    review TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY(restaurant_id)
        REFERENCES restaurants(id)
        ON DELETE CASCADE,

    FOREIGN KEY(food_id)
        REFERENCES foods(id)
        ON DELETE SET NULL,

    FOREIGN KEY(order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE
);

    `); 
    console.log("✅ reviews table created"); 

             await db.query(` 
CREATE TABLE IF NOT EXISTS addresses (

    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    full_name VARCHAR(100) NOT NULL,

    phone VARCHAR(15) NOT NULL,

    address_line1 VARCHAR(255) NOT NULL,

    address_line2 VARCHAR(255),

    landmark VARCHAR(150),

    city VARCHAR(100) NOT NULL,

    state VARCHAR(100) NOT NULL,

    pincode VARCHAR(10) NOT NULL,

    address_type ENUM(
        'home',
        'work',
        'other'
    ) DEFAULT 'home',

    is_default BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE

);
    `); 
    console.log("✅ addresses table created"); 

               await db.query(` 
CREATE TABLE IF NOT EXISTS payments (

    id INT PRIMARY KEY AUTO_INCREMENT,

    order_id INT NOT NULL,

    transaction_id VARCHAR(150),

    payment_method ENUM(
        'COD',
        'ONLINE'
    ) NOT NULL,

    payment_status ENUM(
        'pending',
        'paid',
        'failed',
        'refunded'
    ) DEFAULT 'pending',

    amount DECIMAL(10,2) NOT NULL,

    paid_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE

);
    `); 
    console.log("✅ payments table created");

               await db.query(` 
CREATE TABLE IF NOT EXISTS refresh_tokens (

    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    token TEXT NOT NULL,

    expires_at DATETIME NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE

);
    `); 
    console.log("✅ refresh_tokens table created");


  } catch (error) { 
    console.error("❌ Error creating tables:", error); 
  } 
} 

module.exports = createTables;
