import { create, send } from 'acto'


export function fromWindowDimensions () {

    const s = create({ w: window.innerWidth, h: window.innerHeight })

    window.onresize = function () {
        send(s, { w: window.innerWidth, h: window.innerHeight })
    }
    
    return s
}
