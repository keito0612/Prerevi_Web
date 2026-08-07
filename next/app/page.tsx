"use client"
import { LocalStorageServise } from '@/service/localStorageServise';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BsFileEarmarkText, BsStar, BsCamera, BsArrowRight, BsGeoAlt, BsPeople, BsShieldCheck } from "react-icons/bs";

const backgroundImage = '/images/big-photo0000-0705.jpg';

// --- Hero Section ---
interface HeroSectionProps {
  onClick: () => void;
}

const HeroSection = ({ onClick }: HeroSectionProps) => (
  <div className="relative min-h-screen w-full overflow-hidden">
    {/* Background Image with Parallax Effect */}
    <div className="absolute inset-0">
      <Image
        src={backgroundImage}
        alt="都市の風景"
        fill
        style={{ objectFit: 'cover' }}
        quality={100}
        priority
        className="scale-105"
      />
    </div>

    {/* Gradient Overlay - More sophisticated gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-primary-700/80 to-primary-500/70" />

    {/* Decorative Elements */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl" />
    </div>

    {/* Content */}
    <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 text-center">
      {/* Badge */}
      <div className="animate-fade-in mb-8">
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-medium border border-white/20">
          <BsGeoAlt className="text-primary-300" />
          日本全国の街の口コミを集めたプラットフォーム
        </span>
      </div>

      {/* Main Heading */}
      <h1 className="animate-slide-up text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
        <span className="block">あなたにぴったりの</span>
        <span className="block bg-gradient-to-r from-primary-200 via-white to-primary-200 bg-clip-text text-transparent">
          街を見つけよう
        </span>
      </h1>

      {/* Subtitle */}
      <p className="animate-slide-up text-base md:text-lg lg:text-xl text-white/80 mb-10 max-w-2xl leading-relaxed" style={{ animationDelay: '0.1s' }}>
        実際に住んでいる人のリアルな声を聞いて、
        <br className="hidden sm:block" />
        治安・子育て・交通など、あなたが大切にする条件で街を比較できます。
      </p>

      {/* CTA Buttons */}
      <div className="animate-slide-up flex flex-col sm:flex-row gap-4" style={{ animationDelay: '0.2s' }}>
        <button
          onClick={onClick}
          className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-100"
        >
          街のレビューを見る
          <BsArrowRight className="transition-transform group-hover:translate-x-1" />
        </button>
        <button
          onClick={onClick}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-full border border-white/30 hover:bg-white/20 transition-all duration-300"
        >
          レビューを投稿する
        </button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

// --- Stats Section ---
const StatsSection = () => (
  <div className="relative -mt-16 z-30 px-4">
    <div className="container mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: "47", label: "都道府県", icon: <BsGeoAlt /> },
            { number: "1,700+", label: "市区町村", icon: <BsShieldCheck /> },
            { number: "10,000+", label: "レビュー数", suffix: "件", icon: <BsFileEarmarkText /> },
            { number: "5,000+", label: "ユーザー", suffix: "人", icon: <BsPeople /> },
          ].map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-primary-50 text-primary-600 rounded-xl group-hover:bg-primary-100 transition-colors">
                <span className="text-xl">{stat.icon}</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                {stat.number}
                <span className="text-lg text-gray-500">{stat.suffix}</span>
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// --- Feature Section ---
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const FeatureCard = ({ icon, title, description, index }: FeatureCardProps) => (
  <div
    className="group relative bg-white rounded-2xl p-8 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-2 border border-gray-100"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    {/* Gradient Border on Hover */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />

    {/* Icon Container */}
    <div className="relative w-16 h-16 mb-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300" />
      <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl text-white text-2xl">
        {icon}
      </div>
    </div>

    <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary-600 transition-colors">
      {title}
    </h3>
    <p className="text-gray-600 leading-relaxed">
      {description}
    </p>
  </div>
);

const FeaturesSection = () => (
  <section className="py-24 px-4 bg-gradient-to-b from-white to-gray-50">
    <div className="container mx-auto">
      {/* Section Header */}
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
          機能紹介
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          プレリビの主な機能
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          移住や引越しの意思決定をサポートする、様々な情報を提供します。
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <FeatureCard
          icon={<BsFileEarmarkText />}
          title="リアルなレビュー"
          description="実際に住んでいる人、住んでいた人のリアルな声。良い点も悪い点も包み隠さず共有できます。"
          index={0}
        />
        <FeatureCard
          icon={<BsStar />}
          title="5段階評価システム"
          description="治安、子育て、公共交通機関、住みやすさなどを直感的に把握できる5段階評価システムです。"
          index={1}
        />
        <FeatureCard
          icon={<BsCamera />}
          title="街の写真投稿"
          description="街の雰囲気を視覚的に伝える写真。テキストだけでは伝わらない魅力を発見できます。"
          index={2}
        />
      </div>
    </div>
  </section>
);

// --- CTA Section ---
interface CallToActionSectionProps {
  imageSrc: string;
  imageAlt: string;
  heading: string;
  body: string;
  reverse?: boolean;
  badge?: string;
}

const CallToActionSection = ({ imageSrc, imageAlt, heading, body, reverse = false, badge }: CallToActionSectionProps) => (
  <section className={`py-20 px-4 ${reverse ? 'bg-gray-50' : 'bg-white'}`}>
    <div className="container mx-auto">
      <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-20 max-w-6xl mx-auto`}>

        {/* Image Container */}
        <div className="relative w-full md:w-1/2">
          <div className={`absolute inset-0 bg-gradient-to-br ${reverse ? 'from-primary-200 to-primary-400' : 'from-primary-300 to-primary-500'} rounded-3xl transform ${reverse ? '-rotate-3' : 'rotate-3'} scale-95`} />
          <div className="relative aspect-square max-w-md mx-auto bg-white rounded-3xl shadow-elevated overflow-hidden p-8">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              style={{ objectFit: 'contain' }}
              className="p-4"
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          {badge && (
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-4">
              {badge}
            </span>
          )}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight whitespace-pre-line">
            {heading}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            {body}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <span className="inline-flex items-center gap-2 text-primary-600 font-semibold">
              <BsArrowRight />
              詳しく見る
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// --- Final CTA Section ---
interface FinalCTAProps {
  onClick: () => void;
}

const FinalCTA = ({ onClick }: FinalCTAProps) => (
  <section className="py-24 px-4 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 relative overflow-hidden">
    {/* Decorative Elements */}
    <div className="absolute inset-0">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-300/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
    </div>

    <div className="container mx-auto text-center relative z-10">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
        あなたの理想の街を、
        <br className="sm:hidden" />
        今すぐ探そう
      </h2>
      <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto">
        プレリビで、住む人のリアルな声を聞いて、
        後悔のない街選びを始めましょう。
      </p>
      <button
        onClick={onClick}
        className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-primary-600 font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-100"
      >
        無料で始める
        <BsArrowRight className="transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  </section>
);

// --- Footer ---
const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-12 px-4">
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <BsGeoAlt className="text-white text-xl" />
          </div>
          <span className="text-xl font-bold text-white">プレリビ</span>
        </div>
        <p className="text-sm text-center md:text-right">
          &copy; {new Date().getFullYear()} プレリビ. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

// --- Main Page Component ---
export default function Main() {
  const personInvestigatingImageSrc = '/images/10223.png';
  const pinGreenImageSrc = '/images/pin_icon_green.png';
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    const visited = LocalStorageServise.getStorage('is_first_time');
    if (visited !== null) {
      router.replace('/home');
    } else {
      LocalStorageServise.setStorage('is_first_time', '1');
      setIsFirstTime(true);
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading && !isFirstTime) {
    return null;
  }

  const handleNavigate = () => {
    router.push('/home');
  };

  return (
    <div className="bg-white font-sans antialiased">
      <HeroSection onClick={handleNavigate} />
      <FeaturesSection />
      <CallToActionSection
        imageSrc={personInvestigatingImageSrc}
        imageAlt="レビュー投稿のイメージ"
        heading="あなたの投稿で移住をする人の手助けに"
        body="あなたが投稿した情報が、移住を考えている誰かの役に立ち、その地域がもっと盛り上がるきっかけになります。ぜひ、あなたの住む地域の魅力をレビューとして教えてください。"
        badge="コミュニティに貢献"
      />
      <CallToActionSection
        imageSrc={pinGreenImageSrc}
        imageAlt="街選びのイメージ"
        heading={"あなたの理想の暮らしを\nプレリビで見つけよう"}
        body="プレリビは、ユーザーが各都道府県の都市の雰囲気、状況、長所と短所を理解し、居住地を決定するのに役立つ情報源となることを目指しています。"
        badge="街選びをサポート"
        reverse
      />
      <FinalCTA onClick={handleNavigate} />
      <Footer />
    </div>
  );
}
