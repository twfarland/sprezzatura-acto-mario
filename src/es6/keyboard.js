import { create, send, map } from 'acto'


export const UP = 38
export const LEFT = 37
export const RIGHT = 39
export const DOWN = 40


export function fromKeysDown () {

	const keysDown = {}
	const s = create(keysDown)

	window.onkeydown = function (e) {
		keysDown[String(e.keyCode)] = true
		send(s, keysDown)
	}

	window.onkeyup = function (e) {
		delete keysDown[String(e.keyCode)]
		send(s, keysDown)
	}

	return s
}


export function fromArrows () {

	return map(keys => ({ 
		x: keys[LEFT] ? (keys[RIGHT] ? 0 : -1) : keys[RIGHT] ? (keys[LEFT] ? 0 : 1) : 0,
		y: keys[DOWN] ? (keys[UP] ? 0 : -1) : keys[UP] ? (keys[DOWN] ? 0 : 1) : 0
	}), fromKeysDown())
}

