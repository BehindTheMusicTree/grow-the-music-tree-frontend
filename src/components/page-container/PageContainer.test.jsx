// import { PageContainer } from './PageContainer'
// import {render, vi, expect} from 'vitest'
// import {fireEvent} from '@testing-library/user-event'
// import getTrack from './monService'

// describe('PageContainer', () => {
//     describe('when clicking on a track', () => {
//         it('should transform play icon to pause icon', ()=>{
//             vi.mock(getTrack, 'serviceGet', 
//                 [{
//                     id:1, tiltle: 'allumer-lefeu'
//                 }]
//             )

//             const screen = render(PageContainer)

//             const trackButton = screen.getElementByTestId('track-1')
//             fireEvent.click(trackButton)

//             const iconPlay = screen.getElementByTestId('play')
//             const iconPause = screen.getElementByTestId('pause')
//             expect(iconPlay).toBe(true)
//             expect(iconPause).not.toBe(true)
//     })

//     })
// })