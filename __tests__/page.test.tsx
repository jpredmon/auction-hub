import {render, screen} from '@testing-library/react'
import App from '@/app/page'

//TRIPLE A PATTERN FOR WRITING TESTS:
it('should have auction text', () => {
    render(<App/>) //ARRANGE
    const myElem = screen.getByText(/auction/i)  //ACT
    expect(myElem).toBeInTheDocument() //ASSERT
})