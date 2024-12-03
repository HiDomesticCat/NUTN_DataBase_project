import sqlite3

def init_db():
    conn = sqlite3.connect('mall.db')
    cursor = conn.cursor()

    # Create Categories list
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Categories (
            CategoryID INTEGER PRIMARY KEY AUTOINCREMENT,
            CategoryName TEXT NOT NULL,
            Description TEXT
        )
    ''')

    # Create Products list
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Products (
            ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT NOT NULL,
            CategoryID INTEGER,
            Price REAL,
            Location TEXT,
            ImageURL TEXT,
            FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
        )
    ''')

    # Create StoreSections list
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS StoreSections (
            SectionID INTEGER PRIMARY KEY AUTOINCREMENT,
            SectionName TEXT NOT NULL,
            Description TEXT,
            OpeningHours TEXT
        )
    ''')

    # Create Customers list
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Customers (
            CustomerID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT NOT NULL,
            Email TEXT NOT NULL UNIQUE,
            Address TEXT
        )
    ''')

    # Create CustomerQueries list
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS CustomerQueries (
            QueryID INTEGER PRIMARY KEY AUTOINCREMENT,
            ProductID INTEGER,
            CustomerID INTEGER,
            QueryTime DATETIME DEFAULT CURRENT_TIMESTAMP,
            ResponseStatus TEXT,
            FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
            FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
        )
    ''')

    # Create Inventory list
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Inventory (
            InventoryID INTEGER PRIMARY KEY AUTOINCREMENT,
            ProductID INTEGER,
            Quantity INTEGER,
            LastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
        )
    ''')
    
    # 插入測試數據
    cursor.execute("INSERT INTO Categories (CategoryName, Description) VALUES ('家具', '各類家具')")
    cursor.execute("INSERT INTO Products (Name, CategoryID, Price, Location) VALUES ('桌子', 1, 1999.99, 'A區')")
    cursor.execute("INSERT INTO Customers (Name, Email, Address) VALUES ('張三', 'zhangsan@example.com', '台北市')")
    conn.commit()
    conn.close()
    print("資料庫初始化完成。")

if __name__ == '__main__':
    init_db()
