import { render, screen } from "@testing-library/react";
import MusicPlayer from "../src/components/player/MusicPlayer";
import { usePlayerStore } from "../src/store/playerStore";

jest.mock("../src/store/playerStore", () => ({
    usePlayerStore: jest.fn(),
}));

jest.mock("../src/components/player/PlayerSidePanel", () => {
    return function MockPlayerSidePanel() {
        return <div data-testid="player-side-panel" />;
    };
});

describe("MusicPlayer", () => {
    const mockSong = {
        title: "Midnight City",
        artistId: "M83",
        coverUrl: "/cover.jpg",
        duration: 243,
    };

    beforeEach(() => {
        (usePlayerStore as jest.Mock).mockReturnValue({
            currentSong: mockSong,
            isPlaying: false,
            togglePlay: jest.fn(),
            shuffleMode: false,
            toggleShuffle: jest.fn(),
            repeatMode: "OFF",
            cycleRepeat: jest.fn(),
        });
    });

    it("renders current song title", () => {
        render(<MusicPlayer />);
        expect(screen.getByText("Midnight City")).toBeInTheDocument();
    });

    it("renders current song artist", () => {
        render(<MusicPlayer />);
        expect(screen.getByText("M83")).toBeInTheDocument();
    });
});
