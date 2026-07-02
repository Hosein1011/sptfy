import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ArtistDashboardPage from '../src/app/artist/page';

const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        removeItem: jest.fn((key: string) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('ArtistDashboardPage Test Suite', () => {
    beforeEach(() => {
        window.localStorage.clear();
        jest.clearAllMocks();
    });

    it('renders correctly and allows uploading a new song', async () => {
        render(<ArtistDashboardPage />);

        const inputs = screen.getAllByRole('textbox');
        const titleInput = inputs[0];
        const albumInput = inputs[1];
        const submitButton = screen.getByRole('button', { name: /upload|ثبت|افزودن/i });

        fireEvent.change(titleInput, { target: { value: 'آهنگ تستی' } });
        fireEvent.change(albumInput, { target: { value: 'آلبوم تستی' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(window.localStorage.setItem).toHaveBeenCalledWith(
                'sptfy_artist_songs',
                expect.stringContaining('آهنگ تستی')
            );
        });
    });

    it('handles deleting an existing song successfully', async () => {
        const mockSongs = [{ id: 1, title: 'آهنگ قدیمی', album: 'آلبوم قدیمی' }];
        window.localStorage.setItem('sptfy_artist_songs', JSON.stringify(mockSongs));

        render(<ArtistDashboardPage />);

        const deleteButtons = screen.getAllByRole('button');
        const deleteButton = deleteButtons[deleteButtons.length - 1];

        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(window.localStorage.setItem).toHaveBeenCalledWith(
                'sptfy_artist_songs',
                expect.not.stringContaining('آهنگ قدیمی')
            );
        });
    });
});
