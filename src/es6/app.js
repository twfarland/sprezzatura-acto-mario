
import { fold, fromDomEvent, sampleOn, fromAnimationFrames, listen, map, slidingWindow, send, create } from 'acto'
import { fromArrows, LEFT, RIGHT, UP } from './keyboard'
import { fromWindowDimensions } from './window'
import { pipe } from './fp'
import mount from './mount'


function log (n) { console.log(n) }


const initialMario = {
	x: 0,
	y: 0,
	vx: 0,
	vy: 0,
	dir: LEFT
}



// ----- UPDATE

function step ({ delta, arrows }, mario) {
	return pipe(mario, [
				[gravity, delta],
				[jump, arrows],
				[walk, arrows],
				[physics, delta]
			])
}

function jump (arrows, { x, y, vx, vy, dir }) {
	return { x, y, vx, vy: arrows.y > 0 && vy == 0 ? 16.0 : vy, dir }
}

function gravity (delta, { x, y, vx, vy, dir }) {
	return { x, y, vx, vy: y > 0 ? vy - delta / 4 : 0, dir }
}

function physics (delta, { x, y, vx, vy, dir }) {
	return { 
		x: x + delta * vx, 
		y: Math.max(0, y + delta * vy), 
		vx, 
		vy, 
		dir 
	}
}

function walk (arrows, { x, y, vx, vy, dir }) {
	return { 
		x, 
		y, 
		vx: arrows.x * 2, 
		vy, 
		dir: arrows.x < 0 ? LEFT : arrows.x > 0 ? RIGHT : dir 
	}
}


// ----- DISPLAY

function display ({ w, h }, mario) {

	const verb = mario.y > 0 ? 'jump' : mario.vx !== 0 ? 'walk' : 'stand'
	const dir = mario.dir === LEFT ? 'left' : 'right'
	const src = '/img/mario/' + verb + '/' + dir + '.gif'

	return ['div', { style: `width: ${w}px; height: ${h}px; background: rgb(174,238,238); position: fixed;` }, [
				['div', { style: `width: ${w}px; height: 50px; background: rgb(74,167,43); position: fixed; bottom: 0px;` }],
				['img', { src, style: `position: fixed; z-index: 1; bottom: ${mario.y + 46}px; left: ${mario.x}px;` }]
			]]
}


// ----- SIGNALS

// Sig { delta: number, arrows: { x: number, y: number }}
const input = map(
	([prev, current], arrows) => ({ 
		delta: ((current - prev) / 20) || 0, 
		arrows: arrows || { x: 0, y: 0 }
	}),	
	slidingWindow(2, fromAnimationFrames()),
	fromArrows()
)



const states = fold(step, initialMario, input)

const view = map(display, fromWindowDimensions(), states)

mount(document.body, view)