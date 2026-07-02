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
                    aria-label="بستن"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">
                    سیاست حفظ حریم خصوصی
                </h2>

                <div className="text-melora-textSecondary space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar text-sm leading-relaxed">
                    <p>
                        به پلتفرم موسیقی ما خوش آمدید. حفظ حریم خصوصی شما برای ما از اهمیت بالایی برخوردار است و ما متعهد به محافظت از اطلاعات شخصی شما هستیم.
                    </p>

                    <h3 className="text-white font-semibold mt-4 text-base">جمع‌آوری داده‌ها</h3>
                    <p>
                        ما اطلاعاتی نظیر آدرس ایمیل، نام کاربری و تاریخچه پخش موسیقی شما را صرفاً جهت بهبود تجربه کاربری، ارائه پیشنهادات شخصی‌سازی شده و مدیریت نشست‌های فعال (Session Management) جمع‌آوری می‌کنیم.
                    </p>

                    <h3 className="text-white font-semibold mt-4 text-base">امنیت اطلاعات</h3>
                    <p>
                        تمامی رمزهای عبور و داده‌های حساس شما به صورت ایمن ذخیره می‌شوند. ما از استانداردهای روز برای محافظت از داده‌های شما در برابر دسترسی‌های غیرمجاز استفاده می‌کنیم و این اطلاعات در اختیار هیچ شخص ثالثی قرار نخواهند گرفت.
                    </p>

                    <h3 className="text-white font-semibold mt-4 text-base">حقوق کاربر</h3>
                    <p>
                        شما به عنوان کاربر حق دارید در هر زمان به اطلاعات خود دسترسی داشته باشید، آن‌ها را ویرایش کنید و یا درخواست حذف کامل حساب کاربری و تمامی داده‌های مرتبط با آن را ثبت نمایید.
                    </p>
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-white/10">
                    <Button variant="primary" onClick={onClose} className="px-8">
                        تایید و پذیرش
                    </Button>
                </div>

            </div>
        </div>
    );
}
