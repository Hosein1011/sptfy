"use client";

import React, { useState } from "react";
import { Sparkles, Radio, Check, ArrowRight, Music } from "lucide-react";
import MeloraLogo from "../brand/MeloraLogo";
import MeloraWaveform from "../brand/MeloraWaveform";
import Button from "../common/Button";
import Modal from "../ui/Modal";
import Chip from "../ui/Chip";
import { useAtmosphere, MOOD_CONFIG, MoodType } from "../brand/AtmosphereBackground";

const SOUND_GENRES = [
  "Synthwave & Electronic",
  "Ambient Chillout",
  "Modern Pop",
  "R&B & Soul",
  "Deep Bass & Melodic",
  "Cinematic & Classical",
  "Indie & Acoustic",
  "Dark Wave",
];

export default function OnboardingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const { activeMood, setActiveMood } = useAtmosphere();

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const moodsList = Object.keys(MOOD_CONFIG) as MoodType[];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="text-center py-4 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`h-1.5 rounded-full transition-all duration-base ${
                step === s
                  ? "w-8 bg-gradient-primary"
                  : step > s
                    ? "w-3 bg-melora-purple"
                    : "w-3 bg-white/20"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <MeloraLogo size="lg" showWordmark showTagline variant="gradient" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Discover Your Sound Signature
              </h2>
              <p className="text-xs md:text-sm text-melora-textSecondary leading-relaxed">
                Melora transforms music into visual emotion. Select genres that resonate with your inner rhythm.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 justify-center max-w-lg mx-auto pt-2">
              {SOUND_GENRES.map((genre) => {
                const isSelected = selectedGenres.includes(genre);
                return (
                  <Chip
                    key={genre}
                    label={genre}
                    isActive={isSelected}
                    variant="gradient"
                    onClick={() => toggleGenre(genre)}
                  />
                );
              })}
            </div>

            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => setStep(2)}
              className="rounded-full shadow-glow mt-4"
            >
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center shadow-glow">
              <Radio className="w-7 h-7 text-white" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Choose Your Starting Atmosphere
              </h2>
              <p className="text-xs md:text-sm text-melora-textSecondary">
                Your atmosphere dynamically tints lighting and ambient visualizers across the app.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 justify-center max-w-lg mx-auto pt-2">
              {moodsList.slice(0, 8).map((mood) => {
                const isSelected = activeMood === mood;
                return (
                  <Chip
                    key={mood}
                    label={MOOD_CONFIG[mood].label}
                    isActive={isSelected}
                    variant="gradient"
                    onClick={() => setActiveMood(mood)}
                  />
                );
              })}
            </div>

            <div className="flex justify-center gap-3 mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setStep(3)}
                className="rounded-full shadow-glow"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-melora-purple/20 border border-melora-purple/30 mx-auto flex items-center justify-center shadow-glow-purple">
              <MeloraWaveform isPlaying barCount={14} height={28} color="gradient" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                You're Ready to Feel Every Melody
              </h2>
              <p className="text-xs md:text-sm text-melora-textSecondary leading-relaxed">
                Your soundspace has been customized. Sit back, plug in your headphones, and immerse yourself in sound.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={onClose}
              className="rounded-full shadow-glow mt-4"
            >
              Start Listening
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
