const element = document.getElementById("matrix");

window.addEventListener("resize", () => {
	matrixRain.setCanvasDimensions(element.parentElement.offsetWidth, element.parentElement.offsetHeight);
});

function generateNewColor() {
	const r = random(0, 255);
	const g = random(0, 255);
	const b = random(0, 255);
	return "rgb(" + r + "," + g + "," + b + ")"
}

function random(min = 0, max = 1) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

class Entity {
	static showAll(list) {
		for (let i = 0; i < list.length; i++) {
			if (!list[i].show()) {
				list.splice(i, 1);
			}
		}
	}
	constructor(x, y, ctx) {
		this.pos = { x, y };
        this.ctx = ctx;
	}
	show() {
		if (this.update()) {
			this.draw();
			return true;
		}
		else {
			return false;
		}
	}
}
class Strand extends Entity {
	constructor(x, canvas, ctx, charList, charSpace, textColor, headColor) {
		super(x, charSpace, ctx);
		this.canvas = canvas;
		this.charList = charList;
		this.textColor = textColor;
		this.headColor = headColor;
		this.chars = [];
		this.charSpace = charSpace;
	}
	update() {
		if (this.chars.length < 1 || this.chars[this.chars.length - 1].pos.y < this.canvas.height * 2) {
			this.chars.push(new Char(this.pos.x, this.pos.y, this.ctx, this.charList, this.textColor, this.headColor));
			this.pos.y += this.charSpace;
			return true;
		}
		else {
			return false;
		}
	}
	draw() {
		Entity.showAll(this.chars);
	}
}
class Char extends Entity {
	constructor(x, y, ctx, charList, textColor, headColor) {
		super(x, y, ctx);
		this.charList = charList;
		this.textColor = textColor;
		this.headColor = headColor;
		this.head = true;
		this.alpha = 1;
		this.randomizeCharVal();
	}
	randomizeCharVal() {
		this.val = this.charList[random(0, this.charList.length - 1)];
	}
	update() {
		if (random(0, 100) < 5) {
			this.randomizeCharVal();
		}
		this.alpha *= 0.9;
		return (this.alpha >= 0.01) ? true : false;
	}
	draw() {
		if (!this.head) {
			this.ctx.fillStyle = this.textColor;
			this.ctx.globalAlpha = this.alpha;
		}
		else {
			this.ctx.fillStyle = this.headColor;
			this.head = false;
		}
		this.ctx.fillText(this.val, this.pos.x, this.pos.y);
	}
}

class MatrixRain { 
	constructor(font = "15 px Digital", fps = 1) {
		this.canvas = element;
		this.setCanvasDimensions(this.canvas.parentElement.offsetWidth, this.canvas.parentElement.offsetHeight);
		this.charList = ['0','1','2','3','4','5','6','7','8','9',
			'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
			'+','-','*','=','<','>',':','.'];
		this.randomColors = true;
		this.flowRate = 10;
		this.fps = fps;
		this.columnWidth = 14;
		this.charSpace = 12;
		this.font = font;
		this.backgroundColor = "Black";
		this.textColor = "red";
		this.headColor = "white";
		this.ctx = this.canvas.getContext("2d");
		this.ctx.translate(this.canvas.width, 0);
		this.ctx.scale(-1, 1);
		this.columns = Math.ceil(this.canvas.width / this.columnWidth);
		this.ctx.font = font;
		this.strands = [];
		setInterval(() => {
			this.run();
		}, 1000 / this.fps);
	}
	setCanvasDimensions(width, height) {
		this.canvas.width = width;
		this.canvas.height = height;
		this.columns = Math.ceil(this.canvas.width / this.columnWidth);
	}
	run() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = this.backgroundColor;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		let column, available;
		for (let i = 0; i < this.flowRate; i++) {
			column = random(0, this.columns);
			available = true;
			for (let i = 0; i < this.strands.length; i++) {
				if (this.strands[i].pos.x == column * this.columnWidth && this.strands[i].pos.y <= this.canvas.height) {
					available = false;
				}
			}
			if (available) {
				this.strands.push(new Strand(
					column * this.columnWidth,
					this.canvas,
					this.ctx,
					this.charList,
					this.charSpace,
					(this.randomColors) ? generateNewColor() : this.textColor,
					this.headColor
				));
			}
		}
		Entity.showAll(this.strands);
	}
}