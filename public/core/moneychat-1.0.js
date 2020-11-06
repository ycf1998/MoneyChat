// 模板接入
function MoneyChat(url='http://localhost:3001/money-chat/api/1.0.0/base') {
	fetch(url).then(res => res.json()).then(json => {
		document.body.insertAdjacentHTML('beforeend', json.html);
		let src = document.createElement('script');
		src.innerHTML = json.js;
		document.body.appendChild(src);
	});
}