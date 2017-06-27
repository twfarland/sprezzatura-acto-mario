import { create, send, Signal } from 'acto'

export interface Dimensions {
    w: number;
    h: number;
}

export function fromWindowDimensions (): Signal<Dimensions> {

    const s = create<Dimensions>({ w: window.innerWidth, h: window.innerHeight })

    window.onresize = function () {
        send(s, { w: window.innerWidth, h: window.innerHeight })
    }
    
    return s
}
