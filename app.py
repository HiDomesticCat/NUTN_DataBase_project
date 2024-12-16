from flask import Flask, jsonify, request, render_template, redirect, url_for, session, flash
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import sqlite3
import logging

app = Flask(__name__)
app.secret_key = 'your_actual_secret_key_here'  # Replace with a real secret key
CORS(app)

# Set up logging
logging.basicConfig(filename='app.log', level=logging.ERROR, encoding='utf-8')

def get_db_connection():
    conn = sqlite3.connect('mall.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    if 'user_id' in session:
        # Redirect based on user role
        role = session.get('role')
        if role == 'user':
            return redirect(url_for('shopping_page'))
        elif role in ['admin', 'superadmin']:
            return redirect(url_for('admin_main_page'))
    else:
        return redirect(url_for('login'))

# Login page
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Users WHERE Username = ?", (username,))
        user = cursor.fetchone()
        conn.close()

        if user and check_password_hash(user['Password'], password):
            session['user_id'] = user['UserID']
            session['username'] = user['Username']
            session['role'] = user['Role']
            flash('登入成功', 'success')
            return redirect(url_for('index'))
        else:
            flash('用戶名或密碼錯誤', 'danger')
            return render_template('login.html')
    else:
        return render_template('login.html')

# Registration page (only for general users)
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Users WHERE Username = ? OR Email = ?", (username, email))
        existing_user = cursor.fetchone()

        if existing_user:
            flash('用戶名或電子郵件已被使用', 'danger')
            return render_template('register.html')

        hashed_password = generate_password_hash(password)
        cursor.execute("INSERT INTO Users (Username, Password, Email, Role) VALUES (?, ?, ?, ?)", (username, hashed_password, email, 'user'))
        conn.commit()
        conn.close()
        flash('註冊成功，請登入', 'success')
        return redirect(url_for('login'))
    else:
        return render_template('register.html')

# Logout
@app.route('/logout')
def logout():
    session.clear()
    flash('您已成功登出', 'success')
    return redirect(url_for('login'))

# Shopping page (general users)
@app.route('/shopping')
def shopping_page():
    if 'user_id' not in session or session.get('role') != 'user':
        flash('請先登入', 'danger')
        return redirect(url_for('login'))
    return render_template('index.html')

# Admin main page (for both general admins and superadmin)
@app.route('/admin/main')
def admin_main_page():
    if 'user_id' not in session or session.get('role') not in ['admin', 'superadmin']:
        flash('請以管理員身份登入', 'danger')
        return redirect(url_for('login'))
    return render_template('admin_main.html')

# Redirect /admin to /admin/main
@app.route('/admin')
def admin():
    return redirect(url_for('admin_main_page'))

# Product management page
@app.route('/admin/manage_products')
def manage_products():
    if 'user_id' not in session or session.get('role') not in ['admin', 'superadmin']:
        flash('請以管理員身份登入', 'danger')
        return redirect(url_for('login'))
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Products")
    products = cursor.fetchall()
    conn.close()
    return render_template('manage_products.html', products=products)

# add product (admin)
@app.route('/admin/add_product', methods=['GET', 'POST'])
def add_product():
    if 'user_id' not in session or session.get('role') not in ['admin', 'superadmin']:
        flash('請以管理員身份登入', 'danger')
        return redirect(url_for('login'))

    if request.method == 'POST':
        # 獲取表單數據
        name = request.form['name']
        category_id = request.form['category_id']
        price = request.form['price']
        location = request.form['location']
        description = request.form['description']
        image = request.files.get('image')  # 獲取圖片檔案

        # 驗證圖片是否存在
        if not image or image.filename == '':
            flash('請上傳圖片檔案', 'danger')
            return redirect(request.url)

        # 確保圖片檔名安全
        filename = secure_filename(image.filename)

        # 設定圖片儲存路徑
        upload_folder = os.path.join(app.root_path, 'static/image/products')
        os.makedirs(upload_folder, exist_ok=True)  # 確保目錄存在
        image_path = os.path.join(upload_folder, filename)  # 實際檔案路徑
        image_url = f"static/image/products/{filename}"  # 資料庫中儲存相對路徑

        # 儲存圖片檔案
        try:
            image.save(image_path)
        except Exception as e:
            flash(f'圖片儲存失敗: {str(e)}', 'danger')
            return redirect(request.url)

        # 儲存到資料庫
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute('''INSERT INTO products 
                              (name, categoryid, price, location, imageurl, description)
                              VALUES (?, ?, ?, ?, ?, ?)''', 
                           (name, category_id, price, location, image_url, description))
            conn.commit()
            flash('商品添加成功', 'success')
        except Exception as e:
            conn.rollback()
            flash(f'商品添加失敗: {str(e)}', 'danger')
        finally:
            conn.close()

        # 重導向到商品管理頁面
        return redirect(url_for('manage_products'))

    # 如果是 GET 方法，顯示新增商品表單
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM categories")
    categories = cursor.fetchall()
    conn.close()

    return render_template('add_product.html', categories=categories)


# Edit product (admin)
@app.route('/admin/edit_product/<int:product_id>', methods=['GET', 'POST'])
def edit_product(product_id):
    if 'user_id' not in session or session.get('role') not in ['admin', 'superadmin']:
        flash('請以管理員身份登入', 'danger')
        return redirect(url_for('login'))
    conn = get_db_connection()
    cursor = conn.cursor()

    if request.method == 'POST':
        name = request.form['name']
        category_id = request.form['category_id']
        price = request.form['price']
        location = request.form['location']
        image_url = request.form['image_url']
        description = request.form['description']

        cursor.execute('''UPDATE Products SET Name=?, CategoryID=?, Price=?, Location=?, ImageURL=?, Description=?
                          WHERE ProductID=?''', (name, category_id, price, location, image_url, description, product_id))
        conn.commit()
        conn.close()
        flash('商品更新成功', 'success')
        return redirect(url_for('manage_products'))
    else:
        cursor.execute("SELECT * FROM Products WHERE ProductID = ?", (product_id,))
        product = cursor.fetchone()
        cursor.execute("SELECT * FROM Categories")
        categories = cursor.fetchall()
        conn.close()
        return render_template('edit_product.html', product=product, categories=categories)

# Delete product (admin)
@app.route('/admin/delete_product/<int:product_id>', methods=['POST'])
def delete_product(product_id):
    if 'user_id' not in session or session.get('role') not in ['admin', 'superadmin']:
        flash('請以管理員身份登入', 'danger')
        return redirect(url_for('login'))
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM Products WHERE ProductID = ?", (product_id,))
    conn.commit()
    conn.close()
    flash('商品已刪除', 'success')
    return redirect(url_for('manage_products'))

@app.route('/admin/manage_users', methods=['GET', 'POST'])
def manage_users():
    if 'user_id' not in session or session.get('role') != 'superadmin':
        flash('只有超級管理員才能訪問此頁面', 'danger')
        return redirect(url_for('login'))
    conn = get_db_connection()
    cursor = conn.cursor()
    if request.method == 'POST':
        action = request.form['action']
        if action == 'add_user':
            # Add new user
            new_username = request.form['new_username']
            new_password = request.form['new_password']
            new_email = request.form['new_email']
            new_role = request.form['new_role']
            # Check if username or email already exists
            cursor.execute("SELECT * FROM Users WHERE Username = ? OR Email = ?", (new_username, new_email))
            existing_user = cursor.fetchone()
            if existing_user:
                flash('用戶名或電子郵件已被使用', 'danger')
            else:
                hashed_password = generate_password_hash(new_password)
                cursor.execute("INSERT INTO Users (Username, Password, Email, Role) VALUES (?, ?, ?, ?)",
                               (new_username, hashed_password, new_email, new_role))
                conn.commit()
                flash('新用戶已創建', 'success')
        else:
            target_user_id = request.form['user_id']
            if int(target_user_id) == session['user_id']:
                flash('不能修改超級管理員自己', 'danger')
            else:
                cursor.execute("SELECT * FROM Users WHERE UserID = ?", (target_user_id,))
                target_user = cursor.fetchone()
                if not target_user:
                    flash('用戶不存在', 'danger')
                else:
                    if action == 'promote':
                        cursor.execute("UPDATE Users SET Role = 'admin' WHERE UserID = ?", (target_user_id,))
                        conn.commit()
                        flash('用戶已升級為管理員', 'success')
                    elif action == 'demote':
                        cursor.execute("UPDATE Users SET Role = 'user' WHERE UserID = ?", (target_user_id,))
                        conn.commit()
                        flash('管理員已降級為一般用戶', 'success')
                    elif action == 'delete':
                        cursor.execute("DELETE FROM Users WHERE UserID = ?", (target_user_id,))
                        conn.commit()
                        flash('用戶已被刪除', 'success')
    # Fetch all users except superadmin
    cursor.execute("SELECT * FROM Users WHERE UserID != ?", (session['user_id'],))
    users = cursor.fetchall()
    conn.close()
    return render_template('manage_users.html', users=users)

# Fetch all products or search by name/category
@app.route('/products', methods=['GET'])
def get_products():
    name = request.args.get('name')
    category_id = request.args.get('category')
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        query = "SELECT * FROM Products"
        params = []
        conditions = []

        if name:
            conditions.append("Name LIKE ?")
            params.append('%' + name + '%')
        if category_id:
            conditions.append("CategoryID = ?")
            params.append(category_id)

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        cursor.execute(query, params)
        products = cursor.fetchall()
        conn.close()
        products_list = [dict(product) for product in products]
        return jsonify(products_list), 200
    except Exception as e:
        logging.error(f'Error in get_products: {e}')
        conn.close()
        return jsonify({'error': '伺服器錯誤'}), 500

# Get product categories
@app.route('/categories', methods=['GET'])
def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM Categories")
        categories = cursor.fetchall()
        conn.close()
        categories_list = [dict(category) for category in categories]
        return jsonify(categories_list), 200
    except Exception as e:
        logging.error(f'Error in get_categories: {e}')
        conn.close()
        return jsonify({'error': '伺服器錯誤'}), 500

# View cart
#@app.route('/view_cart', methods=['GET'])
#def view_cart():
#    if 'user_id' not in session or session.get('role') != 'user':
#        return jsonify({'error': '請先登入'}), 401
#    user_id = session['user_id']
#    conn = get_db_connection()
#    cursor = conn.cursor()
#    cursor.execute('''
#        SELECT Carts.*, Products.Name, Products.Price, Products.ImageURL
#        FROM Carts
#        JOIN Products ON Carts.ProductID = Products.ProductID
#        WHERE Carts.UserID = ?
#    ''', (user_id,))
#    cart_items = cursor.fetchall()
#    conn.close()
#    cart_list = [dict(item) for item in cart_items]
#    return jsonify(cart_list), 200

# Checkout (purchase)
@app.route('/checkout', methods=['POST'])
def checkout():
    if 'user_id' not in session or session.get('role') != 'user':
        return jsonify({'error': '請先登入'}), 401
    user_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM Carts WHERE UserID = ?', (user_id,))
    cart_items = cursor.fetchall()
    if not cart_items:
        return jsonify({'error': '購物車為空'}), 400
    for item in cart_items:
        cursor.execute('INSERT INTO PurchaseHistory (UserID, ProductID, Quantity) VALUES (?, ?, ?)',
                       (user_id, item['ProductID'], item['Quantity']))
    # Clear cart
    cursor.execute('DELETE FROM Carts WHERE UserID = ?', (user_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': '購買成功'}), 200

# Add to cart
@app.route('/cart', methods=['POST'])
def add_to_cart():
    if 'user_id' not in session:
        return jsonify({'error': '請先登入'}), 401

    user_id = session['user_id']
    data = request.get_json()

    if not data or 'product_id' not in data or 'quantity' not in data:
        return jsonify({'error': '請提供商品ID和數量'}), 400

    product_id = data['product_id']
    quantity = data['quantity']

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the product is already in the cart
        cursor.execute('SELECT * FROM Carts WHERE UserID = ? AND ProductID = ?', (user_id, product_id))
        existing_item = cursor.fetchone()

        if existing_item:
            # Update quantity
            cursor.execute('''
                UPDATE Carts
                SET Quantity = Quantity + ?
                WHERE UserID = ? AND ProductID = ?
            ''', (quantity, user_id, product_id))
        else:
            # Insert new item
            cursor.execute('''
                INSERT INTO Carts (UserID, ProductID, Quantity)
                VALUES (?, ?, ?)
            ''', (user_id, product_id, quantity))

        conn.commit()
        conn.close()
        return jsonify({'message': '商品已加入購物車'}), 200
    except Exception as e:
        return jsonify({'error': f'伺服器錯誤: {e}'}), 500

# View cart
@app.route('/cart', methods=['GET'])
def view_cart():
    if 'user_id' not in session:
        return jsonify({'error': '請先登入'}), 401

    user_id = session['user_id']

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT Carts.CartID, Carts.Quantity, Products.Name, Products.Price, Products.ImageURL
            FROM Carts
            JOIN Products ON Carts.ProductID = Products.ProductID
            WHERE Carts.UserID = ?
        ''', (user_id,))
        cart_items = cursor.fetchall()
        conn.close()

        cart_list = [dict(item) for item in cart_items]
        return jsonify(cart_list), 200
    except Exception as e:
        return jsonify({'error': f'伺服器錯誤: {e}'}), 500

# Update cart item quantity
@app.route('/cart/<int:cart_id>', methods=['PUT'])
def update_cart_item(cart_id):
    if 'user_id' not in session:
        return jsonify({'error': '請先登入'}), 401

    user_id = session['user_id']
    data = request.get_json()

    if not data or 'quantity' not in data:
        return jsonify({'error': '請提供更新後的數量'}), 400

    quantity = data['quantity']

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('''
            UPDATE Carts
            SET Quantity = ?
            WHERE CartID = ? AND UserID = ?
        ''', (quantity, cart_id, user_id))

        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': '購物車中未找到該商品'}), 404

        conn.commit()
        conn.close()
        return jsonify({'message': '商品數量已更新'}), 200
    except Exception as e:
        return jsonify({'error': f'伺服器錯誤: {e}'}), 500

# Delete cart item
@app.route('/cart/<int:cart_id>', methods=['DELETE'])
def delete_cart_item(cart_id):
    if 'user_id' not in session:
        return jsonify({'error': '請先登入'}), 401

    user_id = session['user_id']

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('DELETE FROM Carts WHERE CartID = ? AND UserID = ?', (cart_id, user_id))

        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': '購物車中未找到該商品'}), 404

        conn.commit()
        conn.close()
        return jsonify({'message': '商品已從購物車中刪除'}), 200
    except Exception as e:
        return jsonify({'error': f'伺服器錯誤: {e}'}), 500

# View purchase history
@app.route('/purchase_history', methods=['GET'])
def purchase_history():
    if 'user_id' not in session or session.get('role') != 'user':
        return jsonify({'error': '請先登入'}), 401
    user_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT PurchaseHistory.*, Products.Name, Products.Price, Products.ImageURL
        FROM PurchaseHistory
        JOIN Products ON PurchaseHistory.ProductID = Products.ProductID
        WHERE PurchaseHistory.UserID = ?
    ''', (user_id,))
    purchases = cursor.fetchall()
    conn.close()
    purchase_list = [dict(purchase) for purchase in purchases]
    return jsonify(purchase_list), 200

# Global error handling
@app.errorhandler(Exception)
def handle_exception(e):
    logging.error(f'Unhandled Exception: {e}')
    # For API routes, return JSON
    if request.path.startswith('/api/') or request.is_json:
        return jsonify({'error': '伺服器錯誤'}), 500
    else:
        return render_template('error.html', error=str(e)), 500

if __name__ == '__main__':
    app.run(debug=True)
