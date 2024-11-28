# -*- coding: utf-8 -*-
import tkinter as tk
from tkinter import messagebox, ttk, filedialog, simpledialog
import serial.tools.list_ports
from PIL import Image, ImageTk
import os
import json
import pystray
from pystray import MenuItem as item
import sys
import winshell
from win32com.client import Dispatch
import hashlib
import logging
import datetime
import traceback
import random
import webbrowser
import time

# 设置日志记录
logging.basicConfig(filename='app.log', level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# 加载用户数据
def load_user_data():
    if os.path.exists('user_data.json'):
        with open('user_data.json', 'r') as f:
            data = json.load(f)
            return data.get('users', {}), data.get('user_avatars', {}), data.get('user_data', {})
    return {}, {}, {}

# 保存用户数据
def save_user_data():
    data = {
        'users': users,
        'user_avatars': user_avatars,
        'user_data': user_data
    }
    with open('user_data.json', 'w') as f:
        json.dump(data, f)

# 密码加密
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

users, user_avatars, user_data = load_user_data()

# 创建管理员账号
if 'admin' not in users:
    users['admin'] = hash_password('admin123')
    save_user_data()

class Application:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("我的应用")
        self.root.geometry("400x300")
        self.root.protocol("WM_DELETE_WINDOW", self.hide_window)

        # 加载用户数据
        global users, user_avatars, user_data
        users, user_avatars, user_data = load_user_data()

        # 创建一个Frame来容纳登录组件
        login_frame = tk.Frame(self.root, padx=20, pady=20)
        login_frame.pack(expand=True)

        # 创建用户名标签和输入框
        username_label = tk.Label(login_frame, text="用户名:", font=("Arial", 12))
        username_label.grid(row=0, column=0, sticky="e", pady=5)
        self.username_entry = tk.Entry(login_frame, font=("Arial", 12))
        self.username_entry.grid(row=0, column=1, pady=5)

        # 创建密码标签和输入框
        password_label = tk.Label(login_frame, text="密码:", font=("Arial", 12))
        password_label.grid(row=1, column=0, sticky="e", pady=5)
        self.password_entry = tk.Entry(login_frame, show="*", font=("Arial", 12))
        self.password_entry.grid(row=1, column=1, pady=5)

        # 创建登录按钮
        login_button = tk.Button(login_frame, text="登录", command=self.login, font=("Arial", 12))
        login_button.grid(row=2, column=0, columnspan=2, pady=10)

        # 创建注册按钮
        register_button = tk.Button(login_frame, text="注册", command=self.open_register_window, font=("Arial", 12))
        register_button.grid(row=3, column=0, columnspan=2)

        # 创建桌面快捷方式
        self.create_desktop_shortcut()

        # 添加记住密码功能
        self.remember_var = tk.IntVar()
        remember_checkbox = tk.Checkbutton(login_frame, text="记住密码", variable=self.remember_var)
        remember_checkbox.grid(row=4, column=0, columnspan=2)

        # 加载记住的用户名和密码
        self.load_remembered_credentials()

        # 添加一个随机笑话按钮
        joke_button = tk.Button(login_frame, text="来个笑话", command=self.show_random_joke, font=("Arial", 12))
        joke_button.grid(row=5, column=0, columnspan=2, pady=10)

        # 添加贪吃蛇游戏的分数记录
        if 'snake_scores' not in user_data:
            user_data['snake_scores'] = {}

    def login(self):
        username = self.username_entry.get()
        password = self.password_entry.get()
        hashed_password = hash_password(password)
        if username in users and users[username] == hashed_password:
            logging.info(f"用户 {username} 登录成功")
            if self.remember_var.get():
                self.save_credentials(username, password)
            if username == 'admin':
                self.open_admin_window()
            else:
                self.open_main_window(username)
        else:
            logging.warning(f"用户 {username} 登录失败")
            messagebox.showerror("登录失败", "用户名或密码错误")

    def open_register_window(self):
        register_window = tk.Toplevel(self.root)
        register_window.title("注册")
        register_window.geometry("300x300")

        reg_username_label = tk.Label(register_window, text="用户名:")
        reg_username_label.pack()
        reg_username_entry = tk.Entry(register_window)
        reg_username_entry.pack()

        reg_password_label = tk.Label(register_window, text="密码:")
        reg_password_label.pack()
        reg_password_entry = tk.Entry(register_window, show="*")
        reg_password_entry.pack()

        confirm_password_label = tk.Label(register_window, text="确认密码:")
        confirm_password_label.pack()
        confirm_password_entry = tk.Entry(register_window, show="*")
        confirm_password_entry.pack()

        email_label = tk.Label(register_window, text="电子邮箱:")
        email_label.pack()
        email_entry = tk.Entry(register_window)
        email_entry.pack()

        def register():
            username = reg_username_entry.get()
            password = reg_password_entry.get()
            confirm_password = confirm_password_entry.get()
            email = email_entry.get()

            if username in users:
                messagebox.showerror("注册失败", "用户名已存在")
            elif password != confirm_password:
                messagebox.showerror("注册失败", "两次输入的密码不一致")
            elif not self.is_valid_email(email):
                messagebox.showerror("注册失败", "请输入有效的电子邮箱地址")
            else:
                users[username] = hash_password(password)
                user_data[username] = {'sent_data': [], 'email': email}
                save_user_data()
                logging.info(f"新用户 {username} 注册成功")
                messagebox.showinfo("注册成功", "您可以使用新账号登录了")
                register_window.destroy()

        register_button = tk.Button(register_window, text="注册", command=register)
        register_button.pack(pady=10)

    def is_valid_email(self, email):
        # 简单的电子邮箱验证
        import re
        pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        return re.match(pattern, email) is not None

    def open_main_window(self, username):
        main_window = tk.Toplevel(self.root)
        main_window.title(f"主页 - {username}")
        main_window.geometry("500x400")

        notebook = ttk.Notebook(main_window)
        notebook.pack(expand=True, fill="both")

        home_frame = ttk.Frame(notebook)
        info_frame = ttk.Frame(notebook)
        history_frame = ttk.Frame(notebook)
        fun_frame = ttk.Frame(notebook)  # 新增的娱乐页面

        notebook.add(home_frame, text="主页")
        notebook.add(info_frame, text="信息")
        notebook.add(history_frame, text="历史记录")
        notebook.add(fun_frame, text="娱乐")  # 添加娱乐标签页

        # 主页内容
        port_label = tk.Label(home_frame, text="选择串口:")
        port_label.pack(pady=10)
        
        port_frame = tk.Frame(home_frame)
        port_frame.pack()

        port_combobox = ttk.Combobox(port_frame, values=self.get_serial_ports())
        port_combobox.pack(side=tk.LEFT)

        def refresh_ports():
            port_combobox['values'] = self.get_serial_ports()

        refresh_button = tk.Button(port_frame, text="刷新", command=refresh_ports)
        refresh_button.pack(side=tk.LEFT, padx=5)

        data_label = tk.Label(home_frame, text="请输入数据:")
        data_label.pack(pady=10)
        data_entry = tk.Entry(home_frame)
        data_entry.pack()

        def send_data():
            selected_port = port_combobox.get()
            data = data_entry.get()
            if selected_port and data:
                try:
                    with serial.Serial(selected_port, 9600, timeout=1) as ser:
                        ser.write(data.encode())
                    messagebox.showinfo("发送成功", f"数据已发送到 {selected_port}")
                    user_data[username]['sent_data'].append({
                        'data': data,
                        'timestamp': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    })
                    save_user_data()
                    self.update_history(history_frame, username)
                    logging.info(f"用户 {username} 发送数据: {data}")
                except Exception as e:
                    messagebox.showerror("发送失败", str(e))
                    logging.error(f"用户 {username} 发送数据失败: {str(e)}")
            else:
                messagebox.showerror("错误", "请选择串口并输入数据")

        send_button = tk.Button(home_frame, text="发送数据", command=send_data)
        send_button.pack(pady=10)

        # 信息页面内容
        self.setup_info_frame(info_frame, username)

        # 历史记录页面内容
        self.setup_history_frame(history_frame, username)

        # 娱乐页面内容
        self.setup_fun_frame(fun_frame)

        def on_closing():
            main_window.withdraw()
            icon.run()

        def show_window(icon, item):
            icon.stop()
            main_window.after(0, main_window.deiconify)

        # 创建系统托盘图标
        image = Image.open("icon.png")
        menu = (item('显示', show_window), item('退出', lambda: os._exit(0)))
        icon = pystray.Icon("name", image, "我的应用", menu)

        # 添加退出登录按钮
        logout_button = tk.Button(main_window, text="退出登录", command=lambda: self.logout(main_window))
        logout_button.pack(pady=10)

        main_window.protocol("WM_DELETE_WINDOW", on_closing)
        self.root.withdraw()

    def logout(self, window):
        window.destroy()
        self.root.deiconify()
        self.username_entry.delete(0, tk.END)
        self.password_entry.delete(0, tk.END)
        logging.info("用户退出登录")

    def open_admin_window(self):
        admin_window = tk.Toplevel(self.root)
        admin_window.title("管理员界面")
        admin_window.geometry("600x400")

        notebook = ttk.Notebook(admin_window)
        notebook.pack(expand=True, fill="both")

        user_info_frame = ttk.Frame(notebook)
        log_frame = ttk.Frame(notebook)
        notebook.add(user_info_frame, text="用户信息")
        notebook.add(log_frame, text="日志")

        # 用户信息页面
        user_listbox = tk.Listbox(user_info_frame, width=30)
        user_listbox.pack(side=tk.LEFT, fill=tk.Y)

        scrollbar = tk.Scrollbar(user_info_frame, orient="vertical")
        scrollbar.config(command=user_listbox.yview)
        scrollbar.pack(side=tk.LEFT, fill=tk.Y)

        user_listbox.config(yscrollcommand=scrollbar.set)

        for user in users:
            if user != 'admin':
                user_listbox.insert(tk.END, user)

        info_frame = tk.Frame(user_info_frame)
        info_frame.pack(side=tk.LEFT, padx=10)

        avatar_label = tk.Label(info_frame)
        avatar_label.pack()

        username_label = tk.Label(info_frame, text="用户名: ")
        username_label.pack()

        email_label = tk.Label(info_frame, text="电子邮箱: ")
        email_label.pack()

        data_label = tk.Label(info_frame, text="发送的数据:")
        data_label.pack()

        data_listbox = tk.Listbox(info_frame, width=40, height=10)
        data_listbox.pack()

        def show_user_info(event):
            selected_user = user_listbox.get(user_listbox.curselection())
            username_label.config(text=f"用户名: {selected_user}")
            email_label.config(text=f"电子邮箱: {user_data[selected_user].get('email', 'N/A')}")

            if selected_user in user_avatars:
                avatar_image = Image.open(user_avatars[selected_user])
            else:
                avatar_image = Image.open("default_avatar.png")
            avatar_image = avatar_image.resize((100, 100), Image.Resampling.LANCZOS)
            avatar_photo = ImageTk.PhotoImage(avatar_image)
            avatar_label.config(image=avatar_photo)
            avatar_label.image = avatar_photo

            data_listbox.delete(0, tk.END)
            if selected_user in user_data and 'sent_data' in user_data[selected_user]:
                for data_item in user_data[selected_user]['sent_data']:
                    data_listbox.insert(tk.END, f"{data_item['timestamp']}: {data_item['data']}")

        user_listbox.bind('<<ListboxSelect>>', show_user_info)

        # 日志页面
        log_text = tk.Text(log_frame, wrap=tk.WORD, width=70, height=20)
        log_text.pack(expand=True, fill=tk.BOTH)

        def load_log():
            with open('app.log', 'r') as log_file:
                log_content = log_file.read()
                log_text.delete('1.0', tk.END)
                log_text.insert(tk.END, log_content)

        load_log_button = tk.Button(log_frame, text="加载日志", command=load_log)
        load_log_button.pack()

        # 添加退出登录按钮
        logout_button = tk.Button(admin_window, text="退出登录", command=lambda: self.logout(admin_window))
        logout_button.pack(pady=10)

        self.root.withdraw()

    def setup_info_frame(self, info_frame, username):
        def create_circle(canvas, x, y, r, **kwargs):
            return canvas.create_oval(x-r, y-r, x+r, y+r, **kwargs)

        def load_avatar(username):
            if username in user_avatars:
                return Image.open(user_avatars[username])
            else:
                return Image.open("default_avatar.png")

        def update_avatar(image):
            avatar_image = image.copy()
            size = min(avatar_image.size)
            avatar_image = avatar_image.crop((0, 0, size, size))
            avatar_image = avatar_image.resize((100, 100), Image.Resampling.LANCZOS)
            photo = ImageTk.PhotoImage(avatar_image)
            canvas.itemconfig(avatar_item, image=photo)
            canvas.image = photo

        def change_avatar():
            file_path = filedialog.askopenfilename(filetypes=[("Image files", "*.png *.jpg *.jpeg *.gif *.bmp")])
            if file_path:
                user_avatars[username] = file_path
                update_avatar(Image.open(file_path))
                save_user_data()
                logging.info(f"用户 {username} 更新了头像")

        def view_avatar():
            if username in user_avatars:
                img = Image.open(user_avatars[username])
                img.show()

        canvas = tk.Canvas(info_frame, width=200, height=120)
        canvas.pack()

        create_circle(canvas, 100, 60, 50, fill="lightgray", outline="gray")
        avatar_image = load_avatar(username)
        size = min(avatar_image.size)
        avatar_image = avatar_image.crop((0, 0, size, size))
        avatar_image = avatar_image.resize((100, 100), Image.Resampling.LANCZOS)
        photo = ImageTk.PhotoImage(avatar_image)
        avatar_item = canvas.create_image(100, 60, image=photo)
        canvas.image = photo

        canvas.tag_bind(avatar_item, "<Button-1>", lambda e: view_avatar())

        change_avatar_button = tk.Button(info_frame, text="更换头像", command=change_avatar)
        change_avatar_button.pack()

        username_label = tk.Label(info_frame, text=f"用户名: {username}")
        username_label.pack(pady=10)

        email_label = tk.Label(info_frame, text=f"电子邮箱: {user_data[username].get('email', 'N/A')}")
        email_label.pack(pady=5)

        def change_password():
            old_password = tk.simpledialog.askstring("更改密码", "请输入旧密码:", show='*')
            if old_password and hash_password(old_password) == users[username]:
                new_password = tk.simpledialog.askstring("更改密码", "请输入新密码:", show='*')
                if new_password:
                    confirm_password = tk.simpledialog.askstring("更改密码", "请确认新密码:", show='*')
                    if new_password == confirm_password:
                        users[username] = hash_password(new_password)
                        save_user_data()
                        messagebox.showinfo("成功", "密码已更改")
                        logging.info(f"用户 {username} 更改了密码")
                    else:
                        messagebox.showerror("错误", "两次输入的新密码不一致")
            else:
                messagebox.showerror("错误", "密码不正确")

        change_password_button = tk.Button(info_frame, text="更改密码", command=change_password)
        change_password_button.pack(pady=5)

    def setup_history_frame(self, history_frame, username):
        history_listbox = tk.Listbox(history_frame, width=70, height=15)
        history_listbox.pack(pady=10)

        self.update_history(history_frame, username)

        clear_button = tk.Button(history_frame, text="清空历史记录", command=lambda: self.clear_history(username, history_frame))
        clear_button.pack()

    def update_history(self, history_frame, username):
        history_listbox = history_frame.winfo_children()[0]
        history_listbox.delete(0, tk.END)
        if username in user_data and 'sent_data' in user_data[username]:
            for data_item in reversed(user_data[username]['sent_data']):
                history_listbox.insert(0, f"{data_item['timestamp']}: {data_item['data']}")

    def clear_history(self, username, history_frame):
        if messagebox.askyesno("确认", "确定要清空历史记录吗？"):
            user_data[username]['sent_data'] = []
            save_user_data()
            self.update_history(history_frame, username)
            logging.info(f"用户 {username} 清空了历史记录")

    def setup_fun_frame(self, fun_frame):
        joke_button = tk.Button(fun_frame, text="随机笑话", command=self.show_random_joke)
        joke_button.pack(pady=10)

        cat_button = tk.Button(fun_frame, text="随机猫咪图片", command=self.show_random_cat)
        cat_button.pack(pady=10)

        quote_button = tk.Button(fun_frame, text="每日名言", command=self.show_daily_quote)
        quote_button.pack(pady=10)

        # 添加贪吃蛇游戏按钮
        snake_button = tk.Button(fun_frame, text="玩贪吃蛇", command=self.play_snake)
        snake_button.pack(pady=10)

        # 添加查看排行榜按钮
        leaderboard_button = tk.Button(fun_frame, text="查看排行榜", command=self.show_leaderboard)
        leaderboard_button.pack(pady=10)

    def show_random_joke(self):
        jokes = [
            "为什么程序员总是分不清万圣节和圣诞节？因为 Oct 31 == Dec 25",
            "一个字节走进酒吧，点了一品脱啤酒。酒保问：对不起，您是不是新来的？",
            "如何判断一个人是否是程序员？问他们洗澡时是否会带着橡皮鸭子。",
            "为什么程序员不喜欢大自然？因为那里有太多的 bugs。",
            "程序员的三大谎言：1. 这个 bug 我马上就修好了。2. 这段代码很容易维护。3. 当然，我已经测试过了。"
        ]
        messagebox.showinfo("随机笑话", random.choice(jokes))

    def show_random_cat(self):
        webbrowser.open("https://cataas.com/cat")

    def show_daily_quote(self):
        quotes = [
            "生活中没有错误，只有教训。 - 托马斯·爱迪生",
            "成功不是最终的，失败也不是致命的，重要的是继续前进的勇气。 - 温斯顿·丘吉尔",
            "你的时间有限，所以不要为别人而活。 - 史蒂夫·乔布斯",
            "创新区分领导者和跟随者。 - 史蒂夫·乔布斯",
            "编程不是关于你知道什么，而是关于你能学到什么。 - 未知"
        ]
        messagebox.showinfo("每日名言", random.choice(quotes))

    def get_serial_ports(self):
        return [port.device for port in serial.tools.list_ports.comports()]

    def png_to_ico(self, png_path, ico_path):
        img = Image.open(png_path)
        icon_sizes = [(32, 32)]
        img.save(ico_path, sizes=icon_sizes)

    def create_desktop_shortcut(self):
        desktop = winshell.desktop()
        shortcut_path = os.path.join(desktop, "我的应用.lnk")
        script_path = os.path.abspath(__file__)
        working_dir = os.path.dirname(script_path)
        png_path = os.path.join(working_dir, "icon.png")
        ico_path = os.path.join(working_dir, "icon.ico")

        if os.path.exists(png_path):
            self.png_to_ico(png_path, ico_path)
        else:
            logging.warning(f"PNG 图标文件不存在: {png_path}")
            ico_path = ""

        if not os.path.exists(shortcut_path):
            shell = Dispatch('WScript.Shell')
            shortcut = shell.CreateShortCut(shortcut_path)
            shortcut.Targetpath = sys.executable
            shortcut.Arguments = f'"{script_path}"'
            shortcut.WorkingDirectory = working_dir
            if os.path.exists(ico_path):
                shortcut.IconLocation = ico_path
            shortcut.save()

            logging.info(f"桌面快捷方式创建完成，图标路径: {ico_path}")
            messagebox.showinfo("快捷方式创建", "桌面快捷方式已创建")
        else:
            logging.info("桌面快捷方式已存在")

    def hide_window(self):
        self.root.withdraw()

    def save_credentials(self, username, password):
        with open('credentials.json', 'w') as f:
            json.dump({'username': username, 'password': password}, f)

    def load_remembered_credentials(self):
        if os.path.exists('credentials.json'):
            with open('credentials.json', 'r') as f:
                credentials = json.load(f)
                self.username_entry.insert(0, credentials['username'])
                self.password_entry.insert(0, credentials['password'])
                self.remember_var.set(1)

    def play_snake(self):
        snake_window = tk.Toplevel(self.root)
        snake_window.title("贪吃蛇")
        snake_window.geometry("400x450")

        canvas = tk.Canvas(snake_window, width=400, height=400, bg="black")
        canvas.pack()

        score_label = tk.Label(snake_window, text="得分: 0")
        score_label.pack()

        snake = [(100, 100), (90, 100), (80, 100)]
        snake_direction = "Right"
        food = self.create_food(snake)
        score = 0

        def change_direction(new_direction):
            nonlocal snake_direction
            if new_direction == "Left" and snake_direction != "Right":
                snake_direction = new_direction
            elif new_direction == "Right" and snake_direction != "Left":
                snake_direction = new_direction
            elif new_direction == "Up" and snake_direction != "Down":
                snake_direction = new_direction
            elif new_direction == "Down" and snake_direction != "Up":
                snake_direction = new_direction

        def move_snake():
            nonlocal snake, food, score
            head = snake[0]

            if snake_direction == "Left":
                new_head = (head[0] - 10, head[1])
            elif snake_direction == "Right":
                new_head = (head[0] + 10, head[1])
            elif snake_direction == "Up":
                new_head = (head[0], head[1] - 10)
            else:
                new_head = (head[0], head[1] + 10)

            if (new_head[0] < 0 or new_head[0] >= 400 or
                new_head[1] < 0 or new_head[1] >= 400 or
                new_head in snake):
                self.game_over(snake_window, score)
                return

            snake = [new_head] + snake[:-1]

            if new_head == food:
                score += 1
                snake.append(snake[-1])
                food = self.create_food(snake)
                score_label.config(text=f"得分: {score}")

            canvas.delete("all")
            canvas.create_rectangle(food[0], food[1], food[0]+10, food[1]+10, fill="red")
            for segment in snake:
                canvas.create_rectangle(segment[0], segment[1], segment[0]+10, segment[1]+10, fill="green")

            snake_window.after(100, move_snake)

        def on_key_press(event):
            if event.keysym in ["Left", "Right", "Up", "Down"]:
                change_direction(event.keysym)

        snake_window.bind("<KeyPress>", on_key_press)
        snake_window.focus_set()  # 确保窗口获得焦点

        move_snake()

    def create_food(self, snake):
        while True:
            food = (random.randint(0, 39) * 10, random.randint(0, 39) * 10)
            if food not in snake:
                return food

    def game_over(self, window, score):
        username = self.username_entry.get()
        if username not in user_data['snake_scores'] or score > user_data['snake_scores'][username]:
            user_data['snake_scores'][username] = score
            save_user_data()
        
        messagebox.showinfo("游戏结束", f"你的得分是: {score}")
        window.destroy()

    def show_leaderboard(self):
        leaderboard_window = tk.Toplevel(self.root)
        leaderboard_window.title("贪吃蛇排行榜")
        leaderboard_window.geometry("400x500")

        leaderboard = sorted(user_data['snake_scores'].items(), key=lambda x: x[1], reverse=True)

        canvas = tk.Canvas(leaderboard_window)
        canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        scrollbar = tk.Scrollbar(leaderboard_window, orient=tk.VERTICAL, command=canvas.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        canvas.configure(yscrollcommand=scrollbar.set)
        canvas.bind('<Configure>', lambda e: canvas.configure(scrollregion=canvas.bbox("all")))

        frame = tk.Frame(canvas)
        canvas.create_window((0, 0), window=frame, anchor="nw")

        tk.Label(frame, text="排名", font=("Arial", 12, "bold"), width=10).grid(row=0, column=0, padx=5, pady=5)
        tk.Label(frame, text="头像", font=("Arial", 12, "bold"), width=10).grid(row=0, column=1, padx=5, pady=5)
        tk.Label(frame, text="用户名", font=("Arial", 12, "bold"), width=10).grid(row=0, column=2, padx=5, pady=5)
        tk.Label(frame, text="得分", font=("Arial", 12, "bold"), width=10).grid(row=0, column=3, padx=5, pady=5)

        for i, (username, score) in enumerate(leaderboard[:10], 1):
            tk.Label(frame, text=f"{i}", font=("Arial", 11)).grid(row=i, column=0, padx=5, pady=5)
            
            # 加载用户头像
            if username in user_avatars:
                avatar_path = user_avatars[username]
            else:
                avatar_path = "default_avatar.png"
            
            avatar_image = Image.open(avatar_path)
            avatar_image = avatar_image.resize((30, 30), Image.Resampling.LANCZOS)
            avatar_photo = ImageTk.PhotoImage(avatar_image)
            
            avatar_label = tk.Label(frame, image=avatar_photo)
            avatar_label.image = avatar_photo  # 保持引用以防止被垃圾回收
            avatar_label.grid(row=i, column=1, padx=5, pady=5)
            
            tk.Label(frame, text=f"{username}", font=("Arial", 11)).grid(row=i, column=2, padx=5, pady=5)
            tk.Label(frame, text=f"{score}", font=("Arial", 11)).grid(row=i, column=3, padx=5, pady=5)

        leaderboard_window.update_idletasks()
        canvas.configure(scrollregion=canvas.bbox("all"))

    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    try:
        logging.info("程序开始运行")
        app = Application()
        logging.info("Application 实例已创建")
        app.run()
    except Exception as e:
        logging.error(f"发生错误: {str(e)}")
        logging.error(traceback.format_exc())
        with open("error_log.txt", "w", encoding="utf-8") as f:
            f.write(f"发生错误:\n{traceback.format_exc()}")
        print(f"发生错误: {str(e)}")
        input("按回车键退出...")

