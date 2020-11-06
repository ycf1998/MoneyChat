# API文档

## 引入依赖JS文件

~~~html
<script src="{basePath}/mc/socket.io.js"></script>
<script src="{basePath}/public/core/moneychat.js"></script>
~~~

## 初始化

~~~js
const moneychat = new MoneyChat({
        path: '', // 服务端请求路径
        autoConnect: true, // 是否自动连接，关闭后需手动使用open()打开连接
        cache: false, // 是否缓存，配合cacheLevel
        cacheLevel: 1, // 1：sessionStorage, 2: localStorage
        saveChatHistory: true, // 是否缓存聊天记录,
        tools: ['emoji', 'image', 'video', 'html'], // 聊天工具
        defaultNameFun: this.randomName, // 提供一个生成默认名称的算法
        loadCacheCallback: '', // 提供一个获取缓存后的回调方法，function loadCache(cache) cache: 缓存的数据
});
~~~

## 属性

### 套接字 socket

### 用户名 username

获取唯一的username，初始化后就生成了默认的。在调用login函数时可更改，所以在login函数后获取的username才是当前使用的。

### 状态 status

- ‘online‘ ：上线
- ‘offLine’：离线

### 配置 config

一个json对象，可对MoneyChat进行配置，配置参数：

- **path**：*‘’*, // ws服务器所在地址
- **autoConnect**: *true*, // 是否自动连接，关闭后需手动使用open()打开连接
- **cache**: *false*, // 是否缓存，配合cacheLevel
- **cacheLevel**: *1*, // 1：sessionStorage, 2: localStorage
- **saveChatHistory**: *true*, // 是否缓存聊天记录,
- **tools**: *['emoji', 'image', 'video', 'html']*, // 聊天工具
- **defaultNameFun**: *this.randomName*, // 提供一个生成默认名称的算法
-  **loadCacheCallback**: *''*, // 提供一个获取缓存后的回调方法，function loadCache(cache) cache: 缓存的数据

## 开启/上线

**login(name，username，callback(name, username))**

- name：昵称，默认：通过defaultNameFun的方法生成，默认是 *‘代号‘+时间戳*
- username：唯一标识，默认：*随机id*
- callback(name, username)：登录成功后的回调函数，带有参数name和username
- return: name 返回昵称

> 在接入自己项目的时候，昵称和账户可由原本的项目登录返回的信息赋值，就可保证每次用户使用的是同一个。但username必须是唯一的

## 开启

**open()**

开启socket，仅接收信息

## 关闭

**close()**

关闭后将不再接收任何信息

## 发送消息（私聊）

文本消息：

**send(msg, recv = [])**

- msg：消息内容
- Array recv：接收对象（单个直接传入接收者username，会帮忙封装为数组）

多媒体消息：

**sendMulti(msg, recv = [])**

- msg：消息内容
- Array recv：接收对象（单个直接传入接收者username，会帮忙封装为数组）

## 发送消息（群聊）

文本消息：

**sendToRoom(msg, recv = [])**

- msg：消息内容
- Array recv：接收对象（单个直接传入接收者username，会帮忙封装为数组）

多媒体消息：

**sendMultiToRoom(msg, recv = [])**

- msg：消息内容
- Array recv：接收对象（单个直接传入接收者username，会帮忙封装为数组）

## 加入聊天室

**joinRoom(room)**

- room: 聊天室名

## 离开聊天室

**leaveRoom(room)**

- room: 聊天室名

## 事件监听

**addEventListener(type, callback(msg))**

- type: 事件类型
- callback(msg): 监听回调
  - msg：通常是json类型

例：

~~~js
// 监听用户上线消息
moneychat.addEventListener('online', (msg) => {
    // 返回数组，第一次是所有当前在线用户，接下来每次有人登录都会收到信息
})
// 监听用户下线消息
moneychat.addEventListener('offline', (msg) => {
    // 有人离线
})
// 监听系统消息
moneychat.addEventListener('sys', (msg) => {})
// 监听私聊消息
moneychat.addEventListener('private', (msg) => {})
// 监听群聊消息
moneychat.addEventListener('room', (msg) => {})
~~~

## 查看/修改当前配置

**config(key , value)**

- 不穿参数则返回当前配置
- 根据key，value进行配置修改

## 自定义随机昵称

默认：

~~~js
function randomName() {
    return '代号' + Math.floor(Math.random() * 1000000000)
}
~~~

自定义配置方式

- 初始化时赋值配置`defaultNameFun: yourFunctionName`
- 使用`moneyChat.config('defaultNameFun', loadCache)`方式配置

## 自定义加载缓存

1. 创建方法`loadCache(cache)`

   ~~~js
   // function loadCache([friends, rooms, chatHistroy]) {
   function loadCache(cache) {
       let friends = cache.friends; // 获取缓存中的好友 [{username:'',name:''}]
       let rooms = cache.rooms; // 获取缓存中的聊天室 ['room1', 'room2']
       let chatHistory = cache.chatHistory; // 获取缓存中的聊天记录 html文本(所有的.chatBox节点)
       //自定义操作
       ...
   }
   ~~~

2. 进行配置  config.loadCacheCallback
   - 初始化时赋值`loadCacheCallback: yourFunctionName`
   - 使用`moneyChat.config('loadCacheCallback', loadCache)`方式配置