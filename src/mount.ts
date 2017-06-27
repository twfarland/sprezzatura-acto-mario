import { fold, listen } from 'acto'
import { updateDom, vDomToDom, VDom } from 'sprezzatura'

interface UIState {
    domNode: HTMLDivElement;
    vDom: VDom;
}

// DomNode -> Sig VDom -> Sig { domNode: DomNode, vDom: VDom }
export default function mount (domParent, vDoms) {

    const div = document.createElement('div')
    const intialUI: UIState = { domNode: div, vDom: ['div', {}, []] }

    domParent.appendChild(div)

    return fold<VDom,UIState>((nextVDom, { domNode, vDom }) => {
            updateDom(vDom, nextVDom, domNode, domParent)
            return { domNode, vDom: nextVDom }    
        }, 
        intialUI, 
        vDoms
    )
}
