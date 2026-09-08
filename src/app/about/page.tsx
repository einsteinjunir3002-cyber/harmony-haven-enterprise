import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Utensils, Target, Eye, Compass, Award } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  let contentBlocks: any[] = [];
  try {
    contentBlocks = await prisma.contentBlock.findMany();
  } catch (err) {
    console.error('AboutPage DB error, using default content:', err);
  }

  const getBlock = (key: string, defaultVal: any) => {
    const found = contentBlocks.find((b) => b.key === key);
    if (!found) return defaultVal;
    try {
      return JSON.parse(found.contentJson);
    } catch {
      return defaultVal;
    }
  };

  const storyContent = getBlock('about.story', {
    headline: 'One Vision. Multiple Expressions.',
    story:
      "Founded in Ghana, Harmony Haven Enterprise emerged with a clear ambition: to build distinctive homegrown brands that touch everyday lives with excellence, authenticity, and heart. By merging culinary craftsmanship in Kowah's Dishes with emotive gifting in 4U HEARTLINES, we cultivate unique touchpoints of joy for our community.",
  });

  const visionContent = getBlock('about.vision', {
    text: 'To build a diverse, sustainable and impactful enterprise that creates meaningful experiences and opportunities through innovative brands.',
  });

  const missionContent = getBlock('about.mission', {
    text: "To develop quality products and services that meet people's needs, inspire connection and create value while building brands that can grow, evolve and stand the test of time.",
  });

  const valuesContent = getBlock('about.values', [
    { title: 'Integrity', description: 'Uncompromising honesty and transparency in every meal we serve, gift we wrap, and promise we make.' },
    { title: 'Excellence', description: 'Meticulous attention to detail and unwavering quality standards across all our brands.' },
    { title: 'Creativity', description: 'Inventive thinking and emotional resonance that breathes original life into every offering.' },
    { title: 'Care', description: 'A genuine heart for our customers, staff, partners, and community.' },
    { title: 'Growth', description: 'Continuous learning and relentless pursuit of scalable impact with wide reach.' },
  ]);

  const founderContent = getBlock('about.founder', {
    role: 'Founder & CEO',
    name: 'Alberta Glory',
    biography:
      'Passionate entrepreneur and creative director leading Harmony Haven Enterprise with a vision to build homegrown Ghanaian brands that resonate globally through culinary delight and expressive gifting.',
    photo: '/images/gallery/alberta-glory-founder.jpg',
  });

  return (
    <div className="pb-24 space-y-24">
      {/* Hero Header */}
      <section className="bg-harmony-950 text-white py-20 border-b border-harmony-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
            About Harmony Haven Enterprise
          </span>
          <h1 className="font-serif font-bold text-4xl sm:text-5xl text-white tracking-tight">
            {storyContent.headline}
          </h1>
          <p className="text-gold-200 font-serif italic text-lg max-w-xl mx-auto">
            &ldquo;Small Hands, Wide Reach&rdquo;
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
            Our Origins
          </span>
          <h2 className="font-serif font-bold text-3xl text-stone-950">
            Building Meaningful Homegrown Brands
          </h2>
        </div>
        <p className="text-stone-700 text-base sm:text-lg leading-relaxed font-light text-center">
          {storyContent.story}
        </p>
      </section>

      {/* Vision & Mission Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-harmony-900 to-harmony-950 text-white space-y-4 shadow-xl border border-gold-400/20">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-gold-400 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-white">Our Vision</h3>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
              &ldquo;{visionContent.text}&rdquo;
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-stone-900 to-stone-950 text-white space-y-4 shadow-xl border border-gold-400/20">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-gold-400 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-white">Our Mission</h3>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
              &ldquo;{missionContent.text}&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
            Guiding Principles
          </span>
          <h2 className="font-serif font-bold text-3xl text-stone-950">
            Our Core Values
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {valuesContent.map((v: any, i: number) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2 hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 rounded-xl bg-harmony-50 text-harmony-900 flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              <h4 className="font-serif font-bold text-lg text-stone-900">{v.title}</h4>
              <p className="text-xs text-stone-600 leading-relaxed font-light">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder Section */}
      <section className="bg-stone-100 py-20 border-y border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white aspect-4/5 max-w-sm mx-auto">
                <img
                  src={founderContent.photo}
                  alt={founderContent.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="md:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
                {founderContent.role}
              </span>
              <h3 className="font-serif font-bold text-3xl text-stone-950">
                {founderContent.name}
              </h3>
              <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-light">
                {founderContent.biography}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Child Brands Overview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
            The Brand Ecosystem
          </span>
          <h2 className="font-serif font-bold text-3xl text-stone-950">
            Our Current Brands
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-stone-900 text-white space-y-4 border border-stone-800 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-kowah-800 text-gold-400 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-white">Kowah&apos;s Dishes</h3>
            <p className="text-gold-300 font-serif italic text-sm">&ldquo;Cook Less, Live More!&rdquo;</p>
            <p className="text-xs text-stone-400 leading-relaxed">
              Wholesome soups, grilled meats, natural sorrel drinks, and authentic Ghanaian pepper sauces.
            </p>
            <Link
              href="/kowahs-dishes"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold-400 hover:text-gold-300"
            >
              <span>Explore Brand</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-8 rounded-3xl bg-harmony-950 text-white space-y-4 border border-teal-900 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-harmony-800 text-gold-400 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-white">4U HEARTLINES</h3>
            <p className="text-teal-200 font-serif italic text-sm">&ldquo;Where feelings find their words&rdquo;</p>
            <p className="text-xs text-stone-400 leading-relaxed">
              Curated gift boxes, personalized poetry commissions, milestone citations, and scented candle verses.
            </p>
            <Link
              href="/4u-heartlines"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-300 hover:text-teal-200"
            >
              <span>Explore Brand</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
