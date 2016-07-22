import { fold, listen } from 'acto'
import { updateDom, vDomToDom } from 'sprezzatura'


// DomNode -> Sig VDom -> Sig { domNode: DomNode, vDom: VDom }
export default function mount (domParent, vDoms) {

    const div  = document.createElement('div')
    const intialUI = { domNode: div, vDom: ['div', {}, []] }

    domParent.appendChild(div)

    return fold((nextVDom, { domNode, vDom }) => {
            updateDom(vDom, nextVDom, domNode, domParent)
            return { domNode, vDom: nextVDom }    
        }, 
        intialUI, 
        vDoms
    )
}
