import React from 'react';
import { X } from 'lucide-react';
import Button from '../common/Button';

interface PrivacyPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-melora-surfaceLayer/80 backdrop-blur-[20px] border border-white/10 rounded-card p-6 md:p-8 shadow-2xl relative">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-melora-textMuted hover:text-white transition-colors duration-base rounded-full hover:bg-white/5"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">
                    Privacy Policy
                </h2>

                <div className="text-melora-textSecondary space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar text-sm leading-relaxed">
                    <p>
                        Welcome to our music platform. Your privacy is of the utmost importance to us, and we are committed to protecting your personal information.
                    </p>

                    <h3 className="text-white font-semibold mt-4 text-base">Data Collection</h3>
                    <p>
                        We collect information such as your email address, username, and music playback history solely to improve user experience, provide personalized recommendations, and manage active sessions.
                    </p>

                    <h3 className="text-white font-semibold mt-4 text-base">Information Security</h3>
                    <p>
                        All your passwords and sensitive data are stored securely. We use industry standards to protect your data against unauthorized access, and this information will never be shared with third parties.
                    </p>

                    <h3 className="text-white font-semibold mt-4 text-base">User Rights</h3>
                    <p>
                        As a user, you have the right to access your data at any time, edit it, or request complete deletion of your account and all associated data.
                    </p>
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-white/10">
                    <Button variant="primary" onClick={onClose} className="px-8">
                        Agree & Accept
                    </Button>
                </div>

            </div>
        </div>
    );
}
