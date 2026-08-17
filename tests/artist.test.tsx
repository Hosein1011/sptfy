import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ArtistDashboardPage from '../src/app/artist/page';
import { artistApi } from '../src/lib/api';

jest.mock('../src/lib/api', () => ({
    artistApi: {
        getMyCatalog: jest.fn(),
        uploadSong: jest.fn(),
        deleteSong: jest.fn(),
    },
}));

describe('ArtistDashboardPage Test Suite', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (artistApi.getMyCatalog as jest.Mock).mockResolvedValue({
            results: [],
            count: 0,
        });
    });

    it('renders correctly and allows uploading a new song', async () => {
        const mockNewSong = {
            id: 's-123',
            title: 'Test Song',
            artistName: 'Luna Echo',
            albumTitle: 'Test Album',
            audioUrl: '/audio/test.mp3',
            duration: 180,
            listeners: 0,
        };
        (artistApi.uploadSong as jest.Mock).mockResolvedValue(mockNewSong);

        render(<ArtistDashboardPage />);

        const titleInput = screen.getByPlaceholderText(/e.g. Midnight Drive/i);
        const albumInput = screen.getByPlaceholderText(/e.g. City Lights EP/i);
        const submitButton = screen.getByRole('button', { name: /upload track/i });

        fireEvent.change(titleInput, { target: { value: 'Test Song' } });
        fireEvent.change(albumInput, { target: { value: 'Test Album' } });

        // Create dummy file for audio input
        const file = new File(['dummy audio'], 'test.mp3', { type: 'audio/mp3' });
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            Object.defineProperty(fileInput, 'files', { value: [file] });
            fireEvent.change(fileInput);
        }

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(artistApi.uploadSong).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Test Song',
                    albumName: 'Test Album',
                })
            );
        });
    });

    it('handles deleting an existing song successfully', async () => {
        window.confirm = jest.fn(() => true);
        const mockSongs = [
            {
                id: 's-old',
                title: 'Old Song',
                artistName: 'Luna Echo',
                albumTitle: 'Old Album',
                audioUrl: '/audio/old.mp3',
                duration: 200,
                listeners: 50,
            },
        ];
        (artistApi.getMyCatalog as jest.Mock).mockResolvedValue({
            results: mockSongs,
            count: 1,
        });
        (artistApi.deleteSong as jest.Mock).mockResolvedValue(undefined);

        render(<ArtistDashboardPage />);

        await waitFor(() => {
            expect(screen.getByText('Old Song')).toBeInTheDocument();
        });

        const deleteButton = screen.getByTitle(/delete track/i);
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(artistApi.deleteSong).toHaveBeenCalledWith('s-old');
        });
    });
});
