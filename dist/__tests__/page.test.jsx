import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '@/app/page';
import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();
beforeEach(() => {
    fetchMock.resetMocks();
});
//"TRIPLE A" PATTERN FOR WRITING TESTS:
it('should have Username text', () => {
    render(<App />); //ARRANGE
    const myElems = screen.getAllByText(/Username/i); //ACT
    myElems.forEach((elem) => {
        expect(elem).toBeInTheDocument(); //ASSERT
    });
});
// Test 2: Handle successful login and update UI
it('handles successful login and updates UI', async () => {
    // Mocking a successful login response
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));
    render(<App />);
    // Input username and password
    fireEvent.change(screen.getByLabelText(/Username/i), {
        target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: 'password123' },
    });
    // Click login button
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    // Wait for the UI to update
    await waitFor(() => expect(screen.getByText(/Auction Items/i)).toBeInTheDocument());
    // Check fetch call details
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:5000/login', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'testuser', password: 'password123' }),
    }));
    // Console log for verification
    console.log('Fetch test passed successfully!');
});
