const monment = require('moment')
const template = require('art-template')
const fs = require('fs')
const express = require('express')
const e = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
	path: '/mc',
	pingInterval: 10000,
	pingTimeout: 5000,
	cookie: false
})
// 解决跨域问题
app.all('*', function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Credentials", false);
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By", ' 3.2.1')
	next();
});

app.use('/public/', express.static(__dirname + '/public'))

app.get('/money-chat', (req, res) => {
	res.sendFile(__dirname + '/views/index.html');
});
app.get('/money-chat/api/1.0.0/base', (req, res) => {
	let htmlStr = fs.readFileSync(__dirname + '/views/index-template.html').toString();
	let html = template.render(htmlStr, {
		path: `http://localhost:3001`
	})
	let jsStr = fs.readFileSync(__dirname + '/public/core/jsDriver.js').toString();
	let js = template.render(jsStr, {
		path: `http://localhost:3001`,
		socketPath: `http://localhost:3001`
	})
	res.send({
		html,
		js
	});
});

app.get('/money-chat/api/2.0.0/base', (req, res) => {
	let htmlStr = fs.readFileSync(__dirname + '/views/index-template.html').toString();
	let html = template.render(htmlStr, {
		path: `https://shahow.top/chat/`
	})
	let jsStr = fs.readFileSync(__dirname + '/public/core/jsDriver.js').toString();
	let js = template.render(jsStr, {
		path: `https://shahow.top/chat`,
		socketPath: `https://shahow.top`
	})
	res.send({
		html,
		js
	});
});

var users = [];
var rooms = [];
io.on('connection', socket => {
	// 上线
	socket.on('online', (username, name) => {
		// 临时用户
		if (username == '' || name == '') {
			return false;
		}
		socket.name = name
		socket.username = username;
		// 当前线上用户
		let onlineUser = [];
		users.forEach(u => {
			let user = {
				username: u.username,
				name: u.name
			}
			onlineUser.push(user);
		})
		// 当前世界聊天室
		let message = {
			from: 'sys',
			fromName: '系统',
			to: '',
			msg: rooms.filter(e => e.type == 'public').map(e => e.room),
			dataType: 1,
			msgType: 2, // 新聊天室
			createTime: monment().format('Y-MM-DD HH:mm:ss')
		}
		// 保存用户信息
		let user = {
			sid: socket.id,
			username,
			status: 'online',
			name: name
		}
		users.push(user);
		// 自己
		let oneself = {
			username,
			name
		}
		io.to(socket.id).emit('sys_online', onlineUser)
		io.to(socket.id).emit('sys', message)
		socket.broadcast.emit('sys_online', new Array(oneself))
	})
	// 下线
	socket.on('disconnect', reason => {
		let user = {
			username: socket.username,
			name: socket.name
		}
		users = users.filter(u => u.username != socket.username);
		socket.broadcast.emit('sys_offline', user)
	})

	// 私聊
	socket.on('private_chat', (msg, recv) => {
		for (username of recv) {
			let target = users.find(e => e.username == username);
			if (target) {
				let message = {
					from: socket.username,
					fromName: socket.name,
					to: '',
					msg: msg,
					dataType: 1,
					msgType: 10,
					createTime: monment().format('Y-MM-DD HH:mm:ss')
				}
				socket.to(target.sid).emit('private_chat', message);
			}
		}
	})

	// 聊天室
	socket.on('join', (room, type) => {
		let currRoom = room;
		let message = {
			from: 'sys',
			fromName: '系统',
			to: '',
			msg: socket.name,
			dataType: 1,
			msgType: 21,
			room: room,
			createTime: monment().format('Y-MM-DD HH:mm:ss')
		}
		socket.join(room, () => {
			io.to(currRoom).emit('room_chat', message);
		});
		let index = rooms.findIndex(e => e.room == room);
		if (index < 0) {
			let roomInfo = {
				room,
				type,
				count: 1
			}
			rooms.push(roomInfo);
			if (type == 'public') {
				let message2 = {
					from: 'sys',
					fromName: '系统',
					to: '',
					msg: room,
					dataType: 1,
					msgType: 2, // 新聊天室
					room: room,
					createTime: monment().format('Y-MM-DD HH:mm:ss')
				}
				socket.broadcast.emit('sys', message2)
			}
		} else {
			rooms[index].count++;
		}
	})
	socket.on('leave', room => {
		let currRoom = room;
		let message = {
			from: 'sys',
			fromName: '系统',
			to: '',
			msg: socket.name,
			dataType: 1,
			msgType: 22,
			room: room,
			createTime: monment().format('Y-MM-DD HH:mm:ss')
		}
		socket.leave(room, () => {
			io.to(currRoom).emit('room_chat', message);
		});
		let index = rooms.findIndex(e => e.room == room);
		if (index >= 0) {
			rooms[index].count -= 1;
			// 没人了删除
			if(rooms[index].count < 1) 
				rooms = rooms.filter(e=>e != rooms[index]);
		}
	})
	socket.on('room_chat', (msg, room) => {
		let message = {
			from: socket.username,
			fromName: socket.name,
			to: '',
			msg: msg,
			dataType: 1,
			msgType: 20,
			room: room,
			createTime: monment().format('Y-MM-DD HH:mm:ss')
		}
		socket.to(room).emit('room_chat', message);
	})
})


http.listen(3001, () => {
	console.log('ok');
})