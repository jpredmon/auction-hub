import { render, screen } from '@testing-library/react';
import App from '@/app/page';
//TRIPLE A PATTERN FOR WRITING TESTS:
it('should have Username text', () => {
    render(<App />); //ARRANGE
    const myElems = screen.getAllByText(/Username/i); //ACT
    myElems.forEach((elem) => {
        expect(elem).toBeInTheDocument(); //ASSERT
    });
});
