import { render, screen } from "@testing-library/react";
import MusicPlayer from "../src/components/player/MusicPlayer";

jest.mock("@/playerStore", () => ({
    usePlayerStore: () => ({
        currentSong: {
            title: "Midnight City",
            artist: "M83",
            coverUrl: "/cover.jpg",
        },
        isPlaying: false,
        togglePlay: jest.fn(),
        shuffleMode: false,
        toggleShuffle: jest.fn(),
        repeatMode: "OFF",
        cycleRepeat: jest.fn(),
        progress: 35,
    }),
}));

describe("MusicPlayer", () => {
    it("renders current song title", () => {
        render(<MusicPlayer />);
        expect(screen.getByText("Midnight City")).toBeInTheDocument();
    });

    it("renders current song artist", () => {
        render(<MusicPlayer />);
        expect(screen.getByText("M83")).toBeInTheDocument();
    });
});
