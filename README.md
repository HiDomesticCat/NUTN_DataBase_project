商品查詢系統部署指南

目錄

商品查詢系統部署指南
目錄
    一、專案概述
    二、系統需求
        操作系統
        Python 版本
        依賴套件
        開發工具（可選）
    三、環境設置
        安裝 Python 3
        建立並啟用虛擬環境（可選但建議）
        安裝依賴套件
        初始化資料庫並生成測試數據
    四、部署後端
        啟動 Flask 應用
        測試後端 API
    五、部署前端
        確認前端文件位置
        啟動前端服務
        問應用
    六、項目結構
    七、注意事項
        資料庫
        安全性
        編碼與時區
        日誌與調試
        前後端同步
    八、常見問題解答
    九、聯絡方式
    
一、專案概述

    本專案為一個簡單的商品查詢系統，包括前端和後端兩部分：

        後端：使用 Python 的 Flask 框架構建，提供 API 供前端調用，並使用 SQLite 作為資料庫。
        前端：使用原生的 HTML、CSS 和 JavaScript，實現商品搜尋、查看詳情和購物車等功能。
    
    
二、系統需求

    操作系統
        Windows（Windows 7 及以上）
        macOS
        Linux（Ubuntu、CentOS 等）
        Python 版本
        Python 3.6 及以上
    依賴套件
        Flask：Web 框架
        Flask-CORS：解決跨域問題
        SQLite3：輕量級資料庫（通常隨 Python 一同安裝）
        Faker：生成測試數據（可選）
    開發工具（可選）
        文本編輯器或 IDE：如 Visual Studio Code、PyCharm
    
    
三、環境設置

    安裝 Python 3
    從 Python 官方網站下載並安裝適合您操作系統的 Python 版本。

    建立並啟用虛擬環境（可選但建議）
    在項目目錄下，開啟終端或命令提示符：

    Windows：

        python -m venv venv

        venv\Scripts\activate

    macOS/Linux：

        python3 -m venv venv

        source venv/bin/activate

    安裝依賴套件
    在虛擬環境啟用的狀態下，執行：

        pip install -r requirements.txt

    requirements.txt 文件內容：

        Flask
        Flask-CORS
        Faker # 如果需要生成測試數據

    初始化資料庫並生成測試數據
    執行資料庫初始化腳本：

        python init_db.py

    init_db.py 將：

        創建資料庫 mall.db
        建立所需的資料表
        插入大量的測試數據
        
        
四、部署後端

    啟動 Flask 應用
    在項目目錄下，執行：

        python app.py

    應用將在 http://localhost:5000 運行。

    測試後端 API
    您可以使用瀏覽器或工具（如 Postman、cURL）測試後端 API：

    獲取所有商品：
        GET http://localhost:5000/products

    按名稱搜尋商品：
        GET http://localhost:5000/products?name=桌子

    獲取所有分類：
        GET http://localhost:5000/categories
        

五、部署前端

    確認前端文件位置
    確保以下文件位於正確的目錄：

        templates/index.html：HTML 模板文件
        static/styles.css：CSS 樣式表
        static/script.js：JavaScript 腳本
        
    啟動前端服務
    前端文件由 Flask 後端提供，因此確保 Flask 應用已經啟動。

    訪問應用
    在瀏覽器中打開：

        http://localhost:5000/
        

六、項目結構

    your_project/

        ├── app.py

        ├── init_db.py

        ├── requirements.txt

        ├── mall.db

        ├── templates/

        │ └── index.html

        ├── static/

        │ ├── styles.css

        │ └── script.js

七、注意事項

    資料庫
        初始數據：init_db.py 會插入大量測試數據，方便測試。
        資料庫位置：mall.db 位於項目根目錄，確保應用有權限讀取和寫入該文件。

    安全性
        防止 SQL 注入：已在程式碼中使用參數化查詢，避免 SQL 注入風險。
        數據驗證：後端對收到的數據進行驗證，確保數據的完整性和正確性。

    編碼與時區
        UTF-8 編碼：確保所有文件使用 UTF-8 編碼，避免中文顯示問題。
        時區設定：如果應用涉及到時間戳，確認服務器時區設定正確。

    日誌與調試
        日誌文件：後端的錯誤和異常將記錄在 app.log 中，方便調試。
        調試模式：在開發階段，app.run(debug=True) 允許自動重載和詳細錯誤訊息。生產環境中請將 debug 設為 False。

    前後端同步
        文件路徑：確保模板和靜態文件位於正確的目錄，並在 app.py 中正確引用。
        接口一致性：如果修改了後端的 API，需同步更新前端的請求代碼。

八、常見問題解答

    運行 init_db.py 時出現 sqlite3.IntegrityError: UNIQUE constraint failed 錯誤
        解決方案：這是由於重複插入相同的唯一字段值引起的。請確保在 init_db.py 中刪除或重置資料表，或者刪除現有的 mall.db 資料庫文件後重新執行腳本。
        
    前端無法加載樣式或腳本
        解決方案：確保在 index.html 中正確引用了靜態文件，使用 {{ url_for('static', filename='styles.css') }}。並確保靜態文件存在於 static/ 資料夾中。
        
    後端無法啟動，提示缺少模組
        解決方案：確保已經安裝了所有依賴套件，並且在虛擬環境中運行應用。