import { Children, cloneElement, useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, BadgeCheck, BookOpen, Check, ChevronLeft, ChevronRight, Clock3, CreditCard, FileCheck2, Gift, Globe2, LayoutGrid, MonitorSmartphone, Palette, Printer, Scissors, ShieldCheck, Smartphone, Sparkles, Users } from 'lucide-react';
import { content } from './content.js';
import { comercial } from './comercial.js';

const painIcons = [Smartphone, Clock3, LayoutGrid, Globe2, Printer, AlertTriangle];
const mechanismIcons = [Users, BookOpen, Palette, Scissors];
const asset = (name, small = false) => `/assets/${name}${small ? '-sm' : ''}.webp`;

function CTA({ label = 'QUERO O NATAL MÁGICO', href = '#oferta' }) {
  const track = () => { if (href === comercial.checkoutUrl && window.fbq) window.fbq('track', 'InitiateCheckout'); };
  return <a className="btn" href={href} onClick={track}>{label}<span aria-hidden="true">→</span></a>;
}

function SectionTitle({ children, lead }) {
  return <header className="section-title"><h2>{children}</h2>{lead && <p>{lead}</p>}</header>;
}

function ProductComposition({ compact = false }) {
  const lazy = compact ? 'lazy' : undefined;
  return <div className={`product-composition${compact ? ' product-composition--compact' : ''}`} aria-label="Capa e páginas reais do Natal Mágico">
    <img className="product-sheet product-sheet--left" src={asset('desafio-labirinto', true)} alt="Página real do labirinto do Papai Noel" width="520" height="736" loading={lazy} />
    <img className="product-sheet product-sheet--middle" src={asset('familia-bingo', true)} alt="Página real do bingo natalino" width="520" height="736" loading={lazy} />
    <img className="product-sheet product-sheet--right" src={asset('colorir-papai-noel', true)} alt="Página real de colorir do Papai Noel" width="520" height="736" loading={lazy} />
    <img className="product-cover" src={asset('capa', compact)} srcSet={compact ? undefined : `${asset('capa', true)} 520w, ${asset('capa')} 900w`} sizes={compact ? undefined : '(max-width: 560px) 220px, 300px'} alt="Capa do Natal Mágico: Kit de Atividades Infantis" width={compact ? 520 : 900} height={compact ? 736 : 1273} loading={lazy} fetchPriority={compact ? undefined : 'high'} />
    <div className="quantity-seal"><strong>40</strong><span>ATIVIDADES<br/>+4 BÔNUS</span></div>
  </div>;
}

function PitchComposition() {
  return <div className="pitch-composition" aria-label="Capa do Natal Mágico com páginas reais impressas">
    <img className="pitch-page pitch-page--back" src={asset('bonus1-p1', true)} alt="Calendário da Magia de Natal, dias 1 a 12" width="520" height="736" loading="lazy" />
    <img className="pitch-page pitch-page--left" src={asset('colorir-grande-cena', true)} alt="Página real A Grande Festa de Natal" width="520" height="736" loading="lazy" />
    <img className="pitch-page pitch-page--right" src={asset('familia-memoria', true)} alt="Página real do jogo da memória" width="520" height="736" loading="lazy" />
    <img className="pitch-cover" src={asset('capa', true)} alt="Capa do Natal Mágico" width="520" height="736" loading="lazy" />
  </div>;
}

function CollectionComposition() {
  const pages = ['colorir-grande-cena', 'desafio-diferencas', 'criar-enfeites', 'familia-memoria'];
  return <div className="collection" aria-label="Os quatro módulos do Natal Mágico com a capa">
    {pages.map((page, index) => <figure className={`collection-page collection-page--${index + 1}`} key={page}>
      <img src={asset(page, true)} alt={content.modules[index][1]} width="520" height="736" loading="lazy" />
      <figcaption>{content.modules[index][0]}</figcaption>
    </figure>)}
    <img className="collection-cover" src={asset('capa', true)} alt="Capa do Natal Mágico" width="520" height="736" loading="lazy" />
  </div>;
}

function ScrollRail({ children, label, className = '', auto = false, interval = 2800 }) {
  const ref = useRef(null);
  const pausedRef = useRef(false);
  const visibleRef = useRef(false);
  const resumeTimerRef = useRef(null);
  const normalizeTimerRef = useRef(null);
  const items = Children.toArray(children);
  const renderedItems = auto
    ? [...items, ...items.map((child, index) => cloneElement(child, { key: `loop-${index}`, 'aria-hidden': true }))]
    : items;

  const cycleWidth = () => {
    const rail = ref.current;
    if (!rail || rail.children.length <= items.length) return 0;
    return rail.children[items.length].offsetLeft - rail.children[0].offsetLeft;
  };

  const normalize = () => {
    const rail = ref.current;
    const width = cycleWidth();
    if (!rail || !width) return;
    if (rail.scrollLeft >= width) rail.scrollLeft -= width;
  };

  const pauseTemporarily = () => {
    pausedRef.current = true;
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => { pausedRef.current = false; }, 4200);
  };

  const scheduleNormalize = () => {
    window.clearTimeout(normalizeTimerRef.current);
    normalizeTimerRef.current = window.setTimeout(normalize, 700);
  };

  const move = direction => {
    const rail = ref.current;
    if (!rail) return;
    pauseTemporarily();
    const width = cycleWidth();
    if (direction < 0 && width && rail.scrollLeft <= 2) rail.scrollLeft = width;
    rail.scrollBy({ left: direction * rail.clientWidth * .82, behavior: 'smooth' });
    scheduleNormalize();
  };

  useEffect(() => {
    if (!auto || !ref.current) return undefined;
    const rail = ref.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new IntersectionObserver(([entry]) => { visibleRef.current = entry.isIntersecting; }, { threshold: .18 });
    observer.observe(rail);
    const timer = window.setInterval(() => {
      if (reduceMotion.matches || pausedRef.current || !visibleRef.current || document.hidden) return;
      const firstItem = rail.children[0];
      const secondItem = rail.children[1];
      const step = secondItem ? secondItem.offsetLeft - firstItem.offsetLeft : rail.clientWidth * .82;
      rail.scrollBy({ left: step, behavior: 'smooth' });
      scheduleNormalize();
    }, interval);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
      window.clearTimeout(resumeTimerRef.current);
      window.clearTimeout(normalizeTimerRef.current);
    };
  }, [auto, interval, items.length]);

  return <div className={`rail-stage ${className}`}>
    <button type="button" className="rail-arrow rail-arrow--left" onClick={() => move(-1)} aria-label={`Ver anteriores em ${label}`}><ChevronLeft /></button>
    <div
      className={`rail${auto ? ' rail--loop' : ''}`}
      ref={ref}
      tabIndex="0"
      aria-label={label}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      onFocus={() => { pausedRef.current = true; }}
      onBlur={() => { pausedRef.current = false; }}
      onPointerDown={() => { pausedRef.current = true; }}
      onPointerUp={pauseTemporarily}
      onTouchEnd={pauseTemporarily}
    >{renderedItems}</div>
    <button type="button" className="rail-arrow rail-arrow--right" onClick={() => move(1)} aria-label={`Ver próximos em ${label}`}><ChevronRight /></button>
  </div>;
}

function Comparison() {
  const comparisonRef = useRef(null);
  const updatePosition = event => comparisonRef.current?.style.setProperty('--position', `${event.currentTarget.value}%`);
  return <div className="comparison" ref={comparisonRef}>
    <img className="comparison-image" src={asset('bonus3-p2')} alt="Cartões de Natal na versão em preto e branco, para colorir" width="900" height="1273" loading="lazy" />
    <div className="comparison-cut"><img className="comparison-image" src={asset('bonus3-p1')} alt="Cartões de Natal na versão colorida" width="900" height="1273" loading="lazy" /></div>
    <div className="comparison-line" aria-hidden="true"><span><ArrowLeft size={16}/><ArrowRight size={16}/></span></div>
    <input className="comparison-range" type="range" min="8" max="92" defaultValue="50" onInput={updatePosition} aria-label="Comparar a versão colorida com a versão para colorir dos cartões de Natal" />
  </div>;
}

function AvatarProof() {
  const characters = [['noel', 'Noel'], ['faisca', 'Faísca'], ['nevinho', 'Nevinho'], ['pipo', 'Pipo']];
  return <div className="avatar-proof"><div className="avatar-stack">{characters.map(([file, name]) => <img key={file} src={`/assets/avatar-${file}.webp`} alt={name} width="160" height="160" />)}</div><p>{content.hero.amplitude[0]}<strong>{content.hero.amplitude[1]}</strong></p></div>;
}

function useDaysToChristmas() {
  const calculate = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const christmas = new Date(now.getFullYear(), comercial.christmas.month - 1, comercial.christmas.day);
    return Math.round((christmas - today) / 86400000);
  };
  const [days, setDays] = useState(calculate);
  useEffect(() => {
    const timer = window.setInterval(() => setDays(calculate()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  return days;
}

function christmasLabel(days) {
  if (days > 1) return `FALTAM ${days} DIAS PARA O NATAL`;
  if (days === 1) return 'FALTA 1 DIA PARA O NATAL';
  if (days === 0) return 'HOJE É NATAL';
  return null;
}

export default function App() {
  const days = useDaysToChristmas();
  const urgency = christmasLabel(days);
  const usagePhotos = [
    ['uso-colorir', 'Cena ilustrativa: menina colorindo a página do Papai Noel na mesa da cozinha'],
    ['uso-bingo', 'Cena ilustrativa: família jogando o bingo natalino na sala'],
    ['uso-coroa', 'Cena ilustrativa: pai e filho recortando a coroa de Natal'],
  ];
  const bonusCount = content.bonuses.length;

  return <>
    {urgency && days > 0 && <div className="offer-bar"><Sparkles size={14} aria-hidden="true" /><span>{days > 1 ? 'FALTAM ' : 'FALTA '}<strong>{days}</strong>{days > 1 ? ' DIAS PARA O NATAL' : ' DIA PARA O NATAL'}</span></div>}
    <main>
      <section className="hero"><div className="content content--860 hero-flow">
        <p className="hero-pill"><span aria-hidden="true" />{content.hero.badge}</p>
        <h1>{content.hero.titleBefore}<em>{content.hero.titleEmphasis}</em>{content.hero.titleAfter}</h1>
        <div className="hero-media"><ProductComposition /></div>
        <p className="hero-sub">{content.hero.subtitle.map(([text, emphasis], index) => emphasis ? <strong key={index}>{text}</strong> : <span key={index}>{text}</span>)}</p>
        <ul className="hero-bullets">{content.hero.bullets.map(item => <li key={item}><Check size={20} aria-hidden="true"/><span>{item}</span></li>)}</ul>
        <CTA href="#previas" />
        <AvatarProof />
      </div></section>

      <section className="section pain"><div className="content content--880 section-flow">
        <SectionTitle>{content.pain.title}<br/>{content.pain.emphasis}</SectionTitle>
        <div className="ornament" aria-hidden="true"><span /></div>
        <div className="pain-grid">{content.pains.map((item,index)=>{const Icon=painIcons[index];return <div className="pain-chip" key={item}><Icon size={18} aria-hidden="true"/><span>{item}</span></div>})}</div>
        <p className="bridge">{content.pain.bridge.map(([text, emphasis], index) => emphasis ? <strong key={index}>{text}</strong> : <span key={index}>{text}</span>)}</p>
      </div></section>

      <section className="section section--tint gallery" id="previas"><div className="content content--1180 section-flow">
        <SectionTitle>{content.gallerySection.title[0]}<br/>{content.gallerySection.title[1]}</SectionTitle>
        <ScrollRail label="Páginas reais do kit" className="gallery-rail" auto interval={2400}>{content.gallery.map(([file,title])=><figure className="gallery-card" key={file}><img src={asset(file)} alt={`Página real. ${title}`} width="900" height="1273" loading="lazy"/><figcaption>{title}</figcaption></figure>)}</ScrollRail>
      </div></section>

      <section className="section mechanism"><div className="content content--1120 section-flow">
        <SectionTitle>{content.mechanismTitle}</SectionTitle>
        <div className="mechanism-grid">{content.mechanism.map(([title,text],index)=>{const Icon=mechanismIcons[index];return <article key={title}><span className="mechanism-icon"><Icon size={25} aria-hidden="true"/></span><h3>{title}</h3><p>{text}</p></article>})}</div>
        <p className="mechanism-close">{content.mechanismClose}</p><CTA/>
      </div></section>

      <section className="section section--tint compare"><div className="content content--780 section-flow">
        <SectionTitle lead={content.comparison.lead}>{content.comparison.title}</SectionTitle>
        <Comparison /><p className="note">{content.comparison.note}</p><p className="credit">{content.comparison.credit}</p><CTA />
      </div></section>

      <section className="usage-carousel" aria-label="O kit em uso">
        <div className="content content--860 usage-heading">
          <p>{content.usage.eyebrow}</p>
          <h2>{content.usage.title}</h2>
          <span>{content.usage.lead}</span>
        </div>
        <ScrollRail label="Cenas do kit em uso" className="usage-rail" auto interval={3000}>{usagePhotos.map(([file,alt])=><figure className="usage-photo" key={file}><img src={`/assets/uso/${file}.webp`} srcSet={`/assets/uso/${file}-sm.webp 760w, /assets/uso/${file}.webp 1280w`} sizes="(max-width: 560px) 86vw, 560px" alt={alt} width="1280" height="720" loading="lazy"/></figure>)}</ScrollRail>
        <p className="usage-note">{content.usage.note}</p>
      </section>

      <section className="section mid-pitch"><div className="content content--1040 mid-pitch-grid">
        <div className="mid-pitch-media"><PitchComposition /></div>
        <div className="mid-pitch-copy"><h2>{content.midPitch.title}</h2><p>{content.midPitch.text}</p><CTA /></div>
      </div></section>

      <section className="section audiences"><div className="content content--1040 section-flow">
        <SectionTitle>{content.audienceTitle}</SectionTitle>
        <div className="audience-grid">{content.audiences.map(([title,text])=><article key={title}><span><Check size={17} aria-hidden="true"/></span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
      </div></section>

      <section className="section section--tint receive"><div className="content content--1000 section-flow">
        <SectionTitle>{content.receive.title}</SectionTitle>
        <div className="receive-media"><CollectionComposition /></div>
        <article className="receive-card"><p className="access-badge">✦ 40 ATIVIDADES + {bonusCount} BÔNUS</p><h3>{content.receive.name}</h3><p>{content.receive.summary}</p><ul>{content.benefits.map(item=><li key={item}><Check size={20} aria-hidden="true"/><span>{item}</span></li>)}</ul></article>
      </div></section>

      <section className="section bonuses"><div className="content content--1080 section-flow">
        <header className="bonus-intro"><p>E NÃO PARA POR AÍ...</p><h2>VOCÊ TAMBÉM VAI RECEBER</h2><span><Gift size={17} aria-hidden="true"/>{bonusCount} BÔNUS EXCLUSIVOS</span></header>
        <div className="bonus-grid">{content.bonuses.map((bonus)=><article className="bonus-card" key={bonus.title}>
          <div className="bonus-card-top"><p className="bonus-num">{bonus.number}</p><div className="bonus-art"><span className="bonus-art-shadow"/><img className="bonus-page" src={asset(bonus.pages[1], true)} alt="" aria-hidden="true" width="520" height="736" loading="lazy"/><div className="bonus-book"><img src={asset(bonus.pages[0], true)} alt={`Primeira página do ${bonus.title}`} width="520" height="736" loading="lazy"/></div></div></div>
          <div className="bonus-card-body"><h3>{bonus.title}</h3><p>{bonus.text}</p><div className="bonus-gain"><Check size={18} aria-hidden="true"/><span>{bonus.gain}</span></div><div className="bonus-price"><strong>INCLUÍDO NO KIT</strong></div></div>
        </article>)}</div>
      </div></section>

      <section className="section offer" id="oferta"><div className="content content--720 section-flow">
        <SectionTitle>{content.offer.title}</SectionTitle>
        <div className="value-stack" aria-label="O que está incluído na oferta">
          <p>{content.offer.stackTitle}</p>
          <ul>{[...content.stack.slice(0, 1), ...content.bonuses.map((bonus, index) => `Bônus ${index + 1}: ${bonus.title}`), ...content.stack.slice(1)].map(item=><li key={item}><span>{item}</span><em>INCLUÍDO</em></li>)}</ul>
          <div><strong>{content.offer.stackTotal}</strong><b>{comercial.price}</b></div>
        </div>
        <article className="plan-card" id="checkout">
          <p className="plan-badge">40 ATIVIDADES + {bonusCount} {content.offer.badgeSuffix}</p>
          <p className="plan-kicker">{content.offer.kicker}</p><h3>{content.offer.name}</h3>
          <div className="plan-mockup"><ProductComposition compact /></div>
          <ul>{[...content.included.slice(0, 4), ...content.bonuses.map((bonus, index) => `Bônus ${index + 1}: ${bonus.title}`), ...content.included.slice(4)].map(item=><li key={item}><Check size={20} aria-hidden="true"/><span>{item}</span></li>)}</ul>
          <div className="price"><small>{content.offer.priceLabel}</small><strong>{comercial.price}</strong>{comercial.installments && <span>{comercial.installments}</span>}</div>
          <CTA href={comercial.checkoutUrl}/><div className="payment-trust"><span><ShieldCheck size={18} aria-hidden="true"/>Garantia de {comercial.guaranteeDays} dias</span><span><MonitorSmartphone size={18} aria-hidden="true"/>Área de membros</span><span><BadgeCheck size={18} aria-hidden="true"/>Pagamento único</span></div>
        </article>
        <p className="offer-close">{content.offer.noTrick}</p>
      </div></section>

      <section className="section purchase-safety"><div className="content content--1000 safety-layout">
        <article className="guarantee-card"><ShieldCheck size={54} aria-hidden="true"/><h2>Garantia de {comercial.guaranteeDays} dias</h2><p>{comercial.guarantee}</p></article>
        <div className="safety-cards">{content.safety.map(([title, text], index) => { const Icon = index ? FileCheck2 : CreditCard; return <article key={title}><Icon size={30} aria-hidden="true"/><div><h3>{title}</h3><p>{text}</p></div></article>; })}</div>
      </div></section>

      <section className="section section--tint access-steps"><div className="content content--980 section-flow">
        <SectionTitle>Como funciona depois do pagamento</SectionTitle>
        <div className="steps-grid">{content.steps.map(([title, text], index) => { const Icon = [CreditCard, MonitorSmartphone, Printer][index]; return <article key={title}><span>{index + 1}</span><Icon aria-hidden="true"/><h3>{title}</h3><p>{text}</p></article>; })}</div>
        <CTA />
      </div></section>

      <section className="section faq"><div className="content content--780 section-flow"><SectionTitle>{content.faqTitle}</SectionTitle><div className="faq-list">{content.faqs.filter(([,answer])=>!answer.includes('[')).map(([question,answer])=><details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></div></section>

      <section className="closing"><div className="content content--780 closing-inner">{urgency && <p>{urgency}</p>}<h2>{content.closing.titleBefore}<em>{content.closing.titleEmphasis}</em></h2><CTA/><small>{content.closing.small}</small></div></section>
    </main>
    <footer className="footer"><div className="footer-inner"><p>Suporte: {comercial.supportEmail}</p><p className="footer-legal">{content.footerLegal}</p><p>{comercial.company}</p><nav><a href={comercial.termsUrl}>Termos de uso</a><span aria-hidden="true">•</span><a href={comercial.privacyUrl}>Política de privacidade</a></nav></div></footer>
  </>;
}
