import sqlite3
import random
from faker import Faker
from werkzeug.security import generate_password_hash

def init_db():
    conn = sqlite3.connect('mall.db')
    cursor = conn.cursor()

    # Delete existing tables
    cursor.execute('DROP TABLE IF EXISTS Users')
    cursor.execute('DROP TABLE IF EXISTS Categories')
    cursor.execute('DROP TABLE IF EXISTS Products')
    cursor.execute('DROP TABLE IF EXISTS CustomerQueries')
    cursor.execute('DROP TABLE IF EXISTS Inventory')
    cursor.execute('DROP TABLE IF EXISTS Carts')
    cursor.execute('DROP TABLE IF EXISTS PurchaseHistory')

    # Create Users table
    cursor.execute('''
        CREATE TABLE Users (
            UserID INTEGER PRIMARY KEY AUTOINCREMENT,
            Username TEXT NOT NULL UNIQUE,
            Password TEXT NOT NULL,
            Email TEXT NOT NULL UNIQUE,
            Role TEXT NOT NULL CHECK (Role IN ('user', 'admin', 'superadmin'))
        )
    ''')

    # Insert default superadmin account
    superadmin_username = 'superadmin'
    superadmin_password = '123456'  # You can set any default password
    superadmin_email = 'superadmin@example.com'
    superadmin_role = 'superadmin'
    hashed_password = generate_password_hash(superadmin_password)
    cursor.execute('''
        INSERT INTO Users (Username, Password, Email, Role)
        VALUES (?, ?, ?, ?)
    ''', (superadmin_username, hashed_password, superadmin_email, superadmin_role))

    # Create Categories table
    cursor.execute('''
        CREATE TABLE Categories (
            CategoryID INTEGER PRIMARY KEY AUTOINCREMENT,
            CategoryName TEXT NOT NULL,
            Description TEXT
        )
    ''')

    # Create Products table (Added Description field)
    cursor.execute('''
        CREATE TABLE Products (
            ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT NOT NULL,
            CategoryID INTEGER,
            Price REAL,
            Location TEXT,
            ImageURL TEXT,
            Description TEXT,
            FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
        )
    ''')

    # Create CustomerQueries table
    cursor.execute('''
        CREATE TABLE CustomerQueries (
            QueryID INTEGER PRIMARY KEY AUTOINCREMENT,
            ProductID INTEGER,
            UserID INTEGER,
            QueryTime DATETIME DEFAULT CURRENT_TIMESTAMP,
            ResponseStatus TEXT,
            FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
            FOREIGN KEY (UserID) REFERENCES Users(UserID)
        )
    ''')

    # Create Inventory table
    cursor.execute('''
        CREATE TABLE Inventory (
            InventoryID INTEGER PRIMARY KEY AUTOINCREMENT,
            ProductID INTEGER,
            Quantity INTEGER,
            LastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
        )
    ''')

    # Create Carts table
    cursor.execute('''
        CREATE TABLE Carts (
            CartID INTEGER PRIMARY KEY AUTOINCREMENT,
            UserID INTEGER,
            ProductID INTEGER,
            Quantity INTEGER,
            FOREIGN KEY (UserID) REFERENCES Users(UserID),
            FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
        )
    ''')

    # Create PurchaseHistory table
    cursor.execute('''
        CREATE TABLE PurchaseHistory (
            PurchaseID INTEGER PRIMARY KEY AUTOINCREMENT,
            UserID INTEGER,
            ProductID INTEGER,
            Quantity INTEGER,
            PurchaseTime DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (UserID) REFERENCES Users(UserID),
            FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
        )
    ''')

    conn.commit()

    # Initialize Faker
    fake = Faker('zh_TW')

    # Insert Categories data
    categories = ['家具', '電子產品', '服裝', '食品', '書籍']
    category_ids = []
    for category in categories:
        cursor.execute("INSERT INTO Categories (CategoryName, Description) VALUES (?, ?)", (category, f"{category}的描述"))
        category_ids.append(cursor.lastrowid)

    # Insert Users data (normal users)
    user_ids = []
    for _ in range(100):  # Generate 100 users
        username = fake.unique.user_name()
        password = generate_password_hash('password')  # Default password
        email = fake.unique.email()
        role = 'user'
        cursor.execute("INSERT INTO Users (Username, Password, Email, Role) VALUES (?, ?, ?, ?)", (username, password, email, role))
        user_ids.append(cursor.lastrowid)

    # Insert Products data
    product_ids = []
    locations = ['A區', 'B區', 'C區', 'D區', 'E區']
    for _ in range(500):  # Generate 500 products
        name = fake.word()
        category_id = random.choice(category_ids)
        price = round(random.uniform(10, 1000), 2)
        location = random.choice(locations)
        image_url = fake.image_url()
        description = fake.sentence()
        cursor.execute("INSERT INTO Products (Name, CategoryID, Price, Location, ImageURL, Description) VALUES (?, ?, ?, ?, ?, ?)", (name, category_id, price, location, image_url, description))
        product_ids.append(cursor.lastrowid)

    # Insert Inventory data
    for product_id in product_ids:
        quantity = random.randint(1, 100)
        cursor.execute("INSERT INTO Inventory (ProductID, Quantity) VALUES (?, ?)", (product_id, quantity))

    conn.commit()
    conn.close()
    print("Database initialized with sample data.")

if __name__ == '__main__':
    init_db()
