import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Sparkles, MessageSquare, Clock, Facebook, Instagram } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../context/LanguageContext';
import { EditableText } from '../EditableText';
import { dbService } from '../../services/dbService';

export const ContactPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const subjectOptions = [
    t.contactSubjectOpt1,
    t.contactSubjectOpt2,
    t.contactSubjectOpt3,
    t.contactSubjectOpt4
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length !== 10) {
      alert(language === 'vi' ? 'Số điện thoại phải có đúng 10 chữ số (VD: 0987654321)!' : 'Phone number must have exactly 10 digits!');
      return;
    }

    dbService.addContact({
      name: name.trim(),
      email: email.trim(),
      phone: cleanPhone,
      subject: subject || subjectOptions[0],
      message: message.trim()
    });

    try {
      confetti({ particleCount: 80, spread: 60 });
    } catch { }
    setSent(true);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setSubject('');
    setMessage('');
    setSent(false);
  };

  return (
    <div className="py-16 bg-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        <div className="text-center max-w-4xl mx-auto space-y-4">
          <EditableText
            contentKey="contactPage.title"
            defaultValue={t.navContactUs || 'Liên Hệ Với Chúng Tôi'}
            as="h1"
            className="text-3xl sm:text-4xl lg:text-5xl font-black metallic-title tracking-tight leading-tight [text-wrap:balance]"
          />
          <EditableText
            contentKey="contactPage.subtitle"
            defaultValue={t.contactPageSubtitle}
            as="p"
            className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto [text-wrap:balance]"
            multiline
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Column: Contact details */}
          <div className="lg:col-span-5 space-y-8 bg-slate-50/80 p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <EditableText
                contentKey="contactPage.findUsTitle"
                defaultValue={t.contactPageFindUsTitle}
                as="h2"
                className="text-3xl sm:text-4xl font-extrabold text-[#5DB5E4] tracking-tight"
              />
            </div>

            {/* Email Section */}
            <div className="space-y-1.5">
              <EditableText
                contentKey="contactPage.emailLabel"
                defaultValue={t.contactPageEmailLabel}
                as="span"
                className="text-xs font-extrabold text-[#5DB5E4] uppercase tracking-wider block"
              />
              <EditableText
                contentKey="contact.email"
                defaultValue="letsdoitvietnam@gmail.com"
                render={(value) => (
                  <a
                    href={`mailto:${value.trim()}`}
                    className="text-base sm:text-lg font-medium text-slate-700 hover:text-[#E81A7F] transition-colors block"
                  >
                    {value}
                  </a>
                )}
              />
            </div>

            {/* Phone Number 1 */}
            <div className="space-y-1.5">
              <EditableText
                contentKey="contactPage.phoneLabel1"
                defaultValue={t.contactPagePhoneLabel1}
                as="span"
                className="text-xs font-extrabold text-[#5DB5E4] uppercase tracking-wider block"
              />
              <EditableText
                contentKey="contact.phone1"
                defaultValue={t.contactPhone1Default || "035.872.6755 (Anh Sơn)"}
                render={(value) => (
                  <a
                    href={`tel:${value.replace(/\D/g, '')}`}
                    className="text-base sm:text-lg font-medium text-slate-700 hover:text-[#E81A7F] transition-colors block"
                  >
                    {value}
                  </a>
                )}
              />
            </div>

            {/* Phone Number 2 */}
            <div className="space-y-1.5">
              <EditableText
                contentKey="contactPage.phoneLabel2"
                defaultValue={t.contactPagePhoneLabel2}
                as="span"
                className="text-xs font-extrabold text-[#5DB5E4] uppercase tracking-wider block"
              />
              <EditableText
                contentKey="contact.phone2"
                defaultValue={t.contactPhone2Default || "0968.514.882 (Chị Tú)"}
                render={(value) => (
                  <a
                    href={`tel:${value.replace(/\D/g, '')}`}
                    className="text-base sm:text-lg font-medium text-slate-700 hover:text-[#E81A7F] transition-colors block"
                  >
                    {value}
                  </a>
                )}
              />
            </div>

            {/* Social Logos: Facebook & Instagram */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://www.facebook.com/LetsDoItVietNam"
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-lg bg-[#4E6746] hover:bg-[#3D5236] text-white flex items-center justify-center shadow-md hover:scale-105 transition-all cursor-pointer"
                title="Let's do it! Vietnam Facebook"
              >
                <Facebook className="w-6 h-6 fill-current" />
              </a>

              <a
                href="https://www.instagram.com/letsdoitvietnam/"
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-lg bg-[#4E6746] hover:bg-[#3D5236] text-white flex items-center justify-center shadow-md hover:scale-105 transition-all cursor-pointer"
                title="Let's do it! Vietnam Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 space-y-6">
            <EditableText
              contentKey="contactPage.formTitle"
              defaultValue={t.contactPageFormTitle}
              as="h3"
              className="text-2xl font-black text-slate-900"
            />

            {sent ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <EditableText
                  contentKey="contactPage.thankYouTitle"
                  defaultValue={t.contactPageThankYouTitle}
                  as="h4"
                  className="text-2xl font-black text-slate-900"
                />
                <p className="text-sm text-slate-600">
                  <EditableText contentKey="contactPage.thankYouMsgPrefix" defaultValue={t.contactPageThankYouMsgPrefix} as="span" />
                  {email}
                  <EditableText contentKey="contactPage.thankYouMsgSuffix" defaultValue={t.contactPageThankYouMsgSuffix} as="span" />
                </p>
                <button
                  onClick={resetForm}
                  className="bg-[#E81A7F] text-white font-bold text-xs px-6 py-2.5 rounded-full cursor-pointer hover:bg-[#D01370] transition-colors"
                >
                  <EditableText contentKey="contactPage.sendAnotherBtn" defaultValue={t.contactPageSendAnotherBtn} as="span" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      <EditableText contentKey="contactPage.nameLabel" defaultValue={t.contactPageNameLabel} as="span" />
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={language === 'vi' ? 'Nguyễn Văn A' : language === 'ja' ? '山田 太郎' : language === 'ko' ? '홍길동' : language === 'zh' ? '张伟' : 'John Doe'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      <EditableText contentKey="contactPage.emailFieldLabel" defaultValue={t.contactPageEmailFieldLabel} as="span" />
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        <EditableText contentKey="contactPage.phoneFieldLabel" defaultValue={t.contactPagePhoneFieldLabel} as="span" />
                      </label>
                      <span className={`text-[10px] font-mono font-bold ${phone.replace(/\D/g, '').length === 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {phone.replace(/\D/g, '').length}/10
                      </span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      minLength={10}
                      placeholder="0987 654 321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-mono focus:outline-hidden focus:border-[#E81A7F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      <EditableText contentKey="contactPage.subjectLabel" defaultValue={t.contactPageSubjectLabel} as="span" />
                    </label>
                    <select
                      value={subject || subjectOptions[0]}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F] bg-white"
                    >
                      {subjectOptions.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    <EditableText contentKey="contactPage.messageLabel" defaultValue={t.contactPageMessageLabel} as="span" />
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={language === 'vi' ? 'Nhập nội dung bạn muốn gửi tới Let\'s do it! Vietnam...' : language === 'ja' ? 'メッセージを入力してください...' : 'Write your message...'}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-xs leading-relaxed focus:outline-hidden focus:border-[#E81A7F]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <EditableText contentKey="contactPage.submitBtn" defaultValue={t.contactPageSubmitBtn} as="span" />
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};


