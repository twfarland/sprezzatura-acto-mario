import { create, send, map, Signal } from 'acto'

export const UP = 38
export const LEFT = 37
export const RIGHT = 39
export const DOWN = 40

export interface Keys {
    [key: string]: boolean;
}

export function fromKeysDown (): Signal<Keys> {

    const keysDown = {}
    const s = create<Keys>(keysDown)

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

export interface Arrows {
    x: number;
    y: number;
}

export function fromArrows (): Signal<Arrows> {

    return map(keys => ({ 
        x: keys[LEFT] ? (keys[RIGHT] ? 0 : -1) : keys[RIGHT] ? (keys[LEFT] ? 0 : 1) : 0,
        y: keys[DOWN] ? (keys[UP] ? 0 : -1) : keys[UP] ? (keys[DOWN] ? 0 : 1) : 0
    }), fromKeysDown())
}

