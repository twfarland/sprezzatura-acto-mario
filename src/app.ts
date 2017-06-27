
import { Signal, fold, fromDomEvent, sampleOn, fromAnimationFrames, listen, map, slidingWindow, send, create } from 'acto'
import { fromArrows, LEFT, RIGHT, UP, Arrows } from './keyboard'
import { fromWindowDimensions, Dimensions } from './window'
import { VDom } from 'sprezzatura'
import { pipe } from './fp'
import mount from './mount'

interface Mario { 
    x: number;
    y: number;
    vx: number;
    vy: number;
    dir: 'LEFT' | 'RIGHT'; 
}
const initialMario: Mario = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    dir: 'LEFT'
}

// ---------- UPDATE ----------

interface State { 
    delta: number; 
    arrows: Arrows 
}

function step ({ delta, arrows }: State, mario: Mario): Mario {
    return pipe(mario, [
                [gravity, delta],
                [jump, arrows],
                [walk, arrows],
                [physics, delta]
            ])
}

function jump (arrows: Arrows, { x, y, vx, vy, dir }: Mario): Mario {
    return { x, y, vx, vy: arrows.y > 0 && vy == 0 ? 16.0 : vy, dir }
}

function gravity (delta: number, { x, y, vx, vy, dir }: Mario): Mario {
    return { x, y, vx, vy: y > 0 ? vy - delta / 1.6 : 0, dir }
}

function physics (delta: number, { x, y, vx, vy, dir }: Mario): Mario {
    return { 
        x: x + delta * vx, 
        y: Math.max(0, y + delta * vy), 
        vx, 
        vy, 
        dir 
    }
}

function walk (arrows: Arrows, { x, y, vx, vy, dir }: Mario): Mario {
    return { 
        x, 
        y, 
        vx: arrows.x * 2, 
        vy, 
        dir: arrows.x < 0 ? 'LEFT' : arrows.x > 0 ? 'RIGHT' : dir 
    }
}

// ---------- DISPLAY ----------

// WindowDimensions -> Mario -> VirtualDom
function display ({ w, h }: Dimensions, mario: Mario): VDom {

    const verb = mario.y > 0 ? 'jump' : mario.vx !== 0 ? 'walk' : 'stand'
    const dir = mario.dir === 'LEFT' ? 'left' : 'right'
    const src = 'img/mario/' + verb + '/' + dir + '.gif'

    return ['div', { style: `width: ${w}px; height: ${h}px; background: rgb(174,238,238); position: fixed;` }, [
                ['div', { style: `width: ${w}px; height: 50px; background: rgb(74,167,43); position: fixed; bottom: 0px;` }],
                ['img', { src, style: `position: fixed; z-index: 1; bottom: ${mario.y + 46}px; left: ${mario.x}px;` }]
            ]]
}

// ---------- SIGNALS ----------

const input: Signal<State> = map(
    ([prev, current], arrows) => ({ 
        delta: ((current - prev) / 20) || 0, 
        arrows: arrows || { x: 0, y: 0 }
    }), 
    slidingWindow(2, fromAnimationFrames()),
    fromArrows()
)

const states: Signal<Mario> = fold(step, initialMario, input)

const view: Signal<VDom> = map(display, fromWindowDimensions(), states)

mount(document.body, view)
