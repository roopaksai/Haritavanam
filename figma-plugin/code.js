// Haritavanam Figma Design Generator
// Run via: Plugins -> Development -> Import plugin from manifest -> Run

const COLORS = {
  primary: { r: 58/255, g: 90/255, b: 64/255 },
  secondary: { r: 163/255, g: 177/255, b: 138/255 },
  background: { r: 245/255, g: 241/255, b: 232/255 },
  accent: { r: 239/255, g: 68/255, b: 68/255 },
  text: { r: 31/255, g: 41/255, b: 55/255 },
  muted: { r: 107/255, g: 114/255, b: 128/255 },
  surface: { r: 1, g: 1, b: 1 },
  border: { r: 214/255, g: 211/255, b: 200/255 },
};

function solid(c, a) { return [{ type: 'SOLID', color: c, opacity: a || 1 }]; }
function rect(parent, w, h, fill, radius) {
  const r = figma.createRectangle();
  r.resize(w, h);
  if (fill) r.fills = solid(fill);
  if (radius) r.cornerRadius = radius;
  parent.appendChild(r);
  return r;
}
function frame(parent, w, h, name, fill, radius) {
  const f = figma.createFrame();
  f.name = name || 'Frame';
  f.resize(w, h);
  if (fill) f.fills = solid(fill);
  if (radius) f.cornerRadius = radius;
  if (parent) parent.appendChild(f);
  return f;
}
function text(parent, str, size, color, weight, align) {
  const t = figma.createText();
  t.characters = str;
  t.fontSize = size || 14;
  t.fills = solid(color || COLORS.text);
  if (weight) t.fontName = { family: 'Inter', style: weight };
  if (align) t.textAlignHorizontal = align;
  parent.appendChild(t);
  return t;
}

async function main() {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

  // Remove default empty page content is fine; create pages
  const pages = figma.root.children;
  // Rename first page
  if (pages.length > 0) pages[0].name = 'Foundations';

  const foundations = pages[0];
  const components = figma.createPage(); components.name = 'Components'; figma.root.appendChild(components);
  const screens = figma.createPage(); screens.name = 'Screens'; figma.root.appendChild(screens);

  // ---- Foundations: color swatches ----
  const swatchRow = frame(foundations, 900, 200, 'Brand Colors', COLORS.background, 0);
  swatchRow.layoutMode = 'HORIZONTAL';
  swatchRow.itemSpacing = 16;
  swatchRow.paddingLeft = swatchRow.paddingRight = swatchRow.paddingTop = swatchRow.paddingBottom = 24;
  const swatches = [
    { name: 'Primary', hex: '#3A5A40', c: COLORS.primary },
    { name: 'Secondary', hex: '#A3B18A', c: COLORS.secondary },
    { name: 'Background', hex: '#F5F1E8', c: COLORS.background },
    { name: 'Accent', hex: '#EF4444', c: COLORS.accent },
  ];
  swatches.forEach(s => {
    const col = frame(swatchRow, 160, 140, s.name, null, 0);
    col.layoutMode = 'VERTICAL'; col.itemSpacing = 8;
    rect(col, 160, 90, s.c, 12);
    text(col, s.name, 14, COLORS.text, 'Semi Bold');
    text(col, s.hex, 12, COLORS.muted, 'Regular');
  });

  // Typography scale
  const typeFrame = frame(foundations, 900, 320, 'Typography', COLORS.background, 0);
  typeFrame.layoutMode = 'VERTICAL'; typeFrame.itemSpacing = 12;
  typeFrame.paddingLeft = typeFrame.paddingRight = typeFrame.paddingTop = typeFrame.paddingBottom = 24;
  const samples = [
    { label: 'Display', size: 32, weight: 'Bold' },
    { label: 'Heading', size: 24, weight: 'Semi Bold' },
    { label: 'Title', size: 18, weight: 'Semi Bold' },
    { label: 'Body', size: 15, weight: 'Regular' },
    { label: 'Caption', size: 12, weight: 'Regular' },
  ];
  samples.forEach(s => {
    const row = frame(typeFrame, 850, 40, s.label, null, 0);
    row.layoutMode = 'HORIZONTAL'; row.itemSpacing = 16; row.counterAxisAlignItems = 'CENTER';
    text(row, s.label, 12, COLORS.muted, 'Medium');
    text(row, 'A Greener Tomorrow — Plant · Track · Preserve', s.size, COLORS.text, s.weight);
  });

  // ---- Components page ----
  figma.currentPage = components;
  // Buttons
  const btnSection = frame(components, 900, 260, 'Buttons', COLORS.background, 0);
  btnSection.layoutMode = 'VERTICAL'; btnSection.itemSpacing = 16;
  btnSection.paddingLeft = btnSection.paddingRight = btnSection.paddingTop = btnSection.paddingBottom = 24;
  text(btnSection, 'Buttons', 18, COLORS.primary, 'Semi Bold');
  const btnRow = frame(btnSection, 850, 60, 'Button row', null, 0);
  btnRow.layoutMode = 'HORIZONTAL'; btnRow.itemSpacing = 12;
  function makeBtn(label, fill, color, outline) {
    const b = frame(btnRow, 150, 44, label, fill, 12);
    b.layoutMode = 'HORIZONTAL'; b.primaryAxisAlignItems = 'CENTER'; b.counterAxisAlignItems = 'CENTER';
    if (outline) { b.fills = []; b.strokes = solid(fill); b.strokeWeight = 1; }
    text(b, label, 15, color, 'Semi Bold');
    return b;
  }
  makeBtn('Primary', COLORS.primary, { r:1,g:1,b:1 }, false);
  makeBtn('Secondary', COLORS.secondary, COLORS.primary, false);
  makeBtn('Outline', COLORS.primary, COLORS.primary, true);
  makeBtn('Destructive', COLORS.accent, { r:1,g:1,b:1 }, false);

  // Cards
  const cardSection = frame(components, 900, 220, 'Plant card', COLORS.background, 0);
  cardSection.layoutMode = 'VERTICAL'; cardSection.itemSpacing = 16;
  cardSection.paddingLeft = cardSection.paddingRight = cardSection.paddingTop = cardSection.paddingBottom = 24;
  text(cardSection, 'Plant card', 18, COLORS.primary, 'Semi Bold');
  const card = frame(cardSection, 320, 120, 'Card', COLORS.surface, 16);
  card.layoutMode = 'VERTICAL'; card.itemSpacing = 6; card.paddingLeft = card.paddingRight = card.paddingTop = card.paddingBottom = 16;
  card.effects = [{ type: 'DROP_SHADOW', color: { r:0,g:0,b:0,a:0.08 }, offset: { x:0,y:2 }, radius: 8, spread: 0, visible: true, blendMode: 'NORMAL' }];
  const crow = frame(card, 288, 24, 'row', null, 0);
  crow.layoutMode = 'HORIZONTAL'; crow.primaryAxisAlignItems = 'SPACE_BETWEEN'; crow.counterAxisAlignItems = 'CENTER';
  text(crow, 'Neem — Azadirachta indica', 15, COLORS.text, 'Semi Bold');
  const badge = frame(crow, 64, 22, 'badge', { r: 220/255, g: 239/255, b: 216/255 }, 999);
  badge.layoutMode = 'HORIZONTAL'; badge.primaryAxisAlignItems = 'CENTER'; badge.counterAxisAlignItems = 'CENTER';
  text(badge, 'Healthy', 11, { r: 46/255, g: 90/255, b: 49/255 }, 'Semi Bold');
  text(card, 'Planted 12 Mar 2026 · 2.3 km away', 12, COLORS.muted, 'Regular');

  // Badges
  const badgeSection = frame(components, 900, 120, 'Status badges', COLORS.background, 0);
  badgeSection.layoutMode = 'HORIZONTAL'; badgeSection.itemSpacing = 12;
  badgeSection.paddingLeft = badgeSection.paddingRight = badgeSection.paddingTop = badgeSection.paddingBottom = 24;
  const badgeDefs = [
    { label: 'Healthy', bg: { r: 220/255, g: 239/255, b: 216/255 }, fg: { r: 46/255, g: 90/255, b: 49/255 } },
    { label: 'Under care', bg: { r: 1, g: 243/255, b: 205/255 }, fg: { r: 122/255, g: 90/255, b: 0 } },
    { label: 'New', bg: { r: 219/255, g: 234/255, b: 254/255 }, fg: { r: 30/255, g: 64/255, b: 175/255 } },
  ];
  badgeDefs.forEach(bd => {
    const b = frame(badgeSection, 90, 26, bd.label, bd.bg, 999);
    b.layoutMode = 'HORIZONTAL'; b.primaryAxisAlignItems = 'CENTER'; b.counterAxisAlignItems = 'CENTER';
    text(b, bd.label, 11, bd.fg, 'Semi Bold');
  });

  // Map pin
  const pinSection = frame(components, 900, 160, 'Map marker', COLORS.background, 0);
  pinSection.layoutMode = 'HORIZONTAL'; pinSection.itemSpacing = 24;
  pinSection.paddingLeft = pinSection.paddingRight = pinSection.paddingTop = pinSection.paddingBottom = 24;
  text(pinSection, 'Map pin', 18, COLORS.primary, 'Semi Bold');
  const pin = figma.createEllipse();
  pin.resize(28, 28); pin.fills = solid(COLORS.accent);
  pinSection.appendChild(pin);
  // triangle tail
  // (simplified: just circle)

  // ---- Screens page ----
  figma.currentPage = screens;
  const SCREEN_W = 360, SCREEN_H = 720;
  function screen(name) {
    const f = frame(null, SCREEN_W, SCREEN_H, name, COLORS.background, 24);
    f.layoutMode = 'VERTICAL';
    // topbar
    const tb = frame(f, SCREEN_W, 64, 'Topbar', COLORS.primary, 0);
    tb.layoutMode = 'HORIZONTAL'; tb.primaryAxisAlignItems = 'SPACE_BETWEEN'; tb.counterAxisAlignItems = 'CENTER';
    tb.paddingLeft = tb.paddingRight = 16;
    text(tb, 'Haritavanam', 16, { r:1,g:1,b:1 }, 'Semi Bold');
    text(tb, '☰', 18, { r:1,g:1,b:1 }, 'Regular');
    return f;
  }
  function bottomNav(parent) {
    const nav = frame(parent, SCREEN_W, 64, 'BottomNav', COLORS.surface, 0);
    nav.layoutMode = 'HORIZONTAL'; nav.primaryAxisAlignItems = 'SPACE_AROUND'; nav.counterAxisAlignItems = 'CENTER';
    ['Home','Map','Add','QR','More'].forEach((l,i) => {
      const it = frame(nav, 60, 52, l, null, 0);
      it.layoutMode = 'VERTICAL'; it.primaryAxisAlignItems = 'CENTER'; it.counterAxisAlignItems = 'CENTER'; it.itemSpacing = 2;
      text(it, ['⌂','⌖','＋','  ','☰'][i], 16, i===0?COLORS.primary:COLORS.muted, i===0?'Semi Bold':'Regular');
      text(it, l, 10, i===0?COLORS.primary:COLORS.muted, i===0?'Semi Bold':'Regular');
    });
    return nav;
  }

  // Welcome
  const w = screen('Welcome');
  screens.appendChild(w);
  const hero = frame(w, SCREEN_W, 300, 'Hero', null, 0);
  hero.layoutMode = 'VERTICAL'; hero.primaryAxisAlignItems = 'CENTER'; hero.counterAxisAlignItems = 'CENTER'; hero.itemSpacing = 8;
  hero.paddingTop = 60;
  text(hero, 'PLANT · TRACK · PRESERVE', 12, COLORS.secondary, 'Semi Bold');
  text(hero, 'A Greener Tomorrow', 28, COLORS.primary, 'Bold');
  text(hero, 'Plant trees, track their growth and be a part of a sustainable future.', 14, COLORS.muted, 'Regular');
  const wb = frame(w, SCREEN_W, 120, 'Buttons', null, 0);
  wb.layoutMode = 'VERTICAL'; wb.itemSpacing = 12; wb.paddingLeft = wb.paddingRight = 24;
  const b1 = frame(wb, SCREEN_W-48, 48, 'Get started', COLORS.primary, 12);
  b1.layoutMode = 'HORIZONTAL'; b1.primaryAxisAlignItems = 'CENTER'; b1.counterAxisAlignItems = 'CENTER';
  text(b1, 'Get started', 15, { r:1,g:1,b:1 }, 'Semi Bold');
  const b2 = frame(wb, SCREEN_W-48, 48, 'Sign in', COLORS.primary, 12);
  b2.fills = []; b2.strokes = solid(COLORS.primary); b2.strokeWeight = 1;
  b2.layoutMode = 'HORIZONTAL'; b2.primaryAxisAlignItems = 'CENTER'; b2.counterAxisAlignItems = 'CENTER';
  text(b2, 'Sign in', 15, COLORS.primary, 'Semi Bold');

  // Sign in
  const si = screen('Sign in');
  screens.appendChild(si);
  const sib = frame(si, SCREEN_W, 400, 'Form', null, 0);
  sib.layoutMode = 'VERTICAL'; sib.itemSpacing = 12; sib.paddingLeft = sib.paddingRight = 24; sib.paddingTop = 24;
  text(sib, 'Sign in', 22, COLORS.primary, 'Semi Bold');
  text(sib, 'Email or phone', 13, COLORS.text, 'Medium');
  rect(sib, SCREEN_W-48, 48, COLORS.surface, 12);
  text(sib, 'Password', 13, COLORS.text, 'Medium');
  rect(sib, SCREEN_W-48, 48, COLORS.surface, 12);
  const sibtn = frame(sib, SCREEN_W-48, 48, 'Continue', COLORS.primary, 12);
  sibtn.layoutMode = 'HORIZONTAL'; sibtn.primaryAxisAlignItems = 'CENTER'; sibtn.counterAxisAlignItems = 'CENTER';
  text(sibtn, 'Continue', 15, { r:1,g:1,b:1 }, 'Semi Bold');
  text(sib, 'No account? Create one', 13, COLORS.muted, 'Regular');

  // Dashboard
  const db = screen('Dashboard');
  screens.appendChild(db);
  const mapf = frame(db, SCREEN_W, 320, 'Map', { r: 200/255, g: 214/255, b: 192/255 }, 16);
  mapf.paddingLeft = mapf.paddingRight = mapf.paddingTop = mapf.paddingBottom = 0;
  // pins
  const p1 = figma.createEllipse(); p1.resize(24,24); p1.fills = solid(COLORS.accent); p1.x=80; p1.y=60; mapf.appendChild(p1);
  const p2 = figma.createEllipse(); p2.resize(24,24); p2.fills = solid(COLORS.secondary); p2.x=200; p2.y=140; mapf.appendChild(p2);
  const p3 = figma.createEllipse(); p3.resize(24,24); p3.fills = solid(COLORS.accent); p3.x=120; p3.y=220; mapf.appendChild(p3);
  const dbb = frame(db, SCREEN_W, 200, 'List', null, 0);
  dbb.layoutMode = 'VERTICAL'; dbb.itemSpacing = 10; dbb.paddingLeft = dbb.paddingRight = 16; dbb.paddingTop = 12;
  // card 1
  const c1 = frame(dbb, SCREEN_W-32, 80, 'Card1', COLORS.surface, 16);
  c1.layoutMode = 'VERTICAL'; c1.itemSpacing = 4; c1.paddingLeft=c1.paddingRight=c1.paddingTop=c1.paddingBottom=12;
  c1.effects = [{ type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:0.08}, offset:{x:0,y:2}, radius:8, spread:0, visible:true, blendMode:'NORMAL'}];
  const cr1 = frame(c1, SCREEN_W-56, 20, 'row', null, 0);
  cr1.layoutMode='HORIZONTAL'; cr1.primaryAxisAlignItems='SPACE_BETWEEN'; cr1.counterAxisAlignItems='CENTER';
  text(cr1, 'Neem — Azadirachta indica', 14, COLORS.text, 'Semi Bold');
  const bdg = frame(cr1, 60, 20, 'badge', {r:220/255,g:239/255,b:216/255}, 999);
  bdg.layoutMode='HORIZONTAL'; bdg.primaryAxisAlignItems='CENTER'; bdg.counterAxisAlignItems='CENTER';
  text(bdg, 'Healthy', 10, {r:46/255,g:90/255,b:49/255}, 'Semi Bold');
  text(c1, 'Planted 12 Mar 2026 · 2.3 km away', 11, COLORS.muted, 'Regular');
  const c2 = frame(dbb, SCREEN_W-32, 80, 'Card2', COLORS.surface, 16);
  c2.layoutMode = 'VERTICAL'; c2.itemSpacing = 4; c2.paddingLeft=c2.paddingRight=c2.paddingTop=c2.paddingBottom=12;
  c2.effects = [{ type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:0.08}, offset:{x:0,y:2}, radius:8, spread:0, visible:true, blendMode:'NORMAL'}];
  const cr2 = frame(c2, SCREEN_W-56, 20, 'row', null, 0);
  cr2.layoutMode='HORIZONTAL'; cr2.primaryAxisAlignItems='SPACE_BETWEEN'; cr2.counterAxisAlignItems='CENTER';
  text(cr2, 'Mango — Mangifera indica', 14, COLORS.text, 'Semi Bold');
  const bdg2 = frame(cr2, 72, 20, 'badge', {r:1,g:243/255,b:205/255}, 999);
  bdg2.layoutMode='HORIZONTAL'; bdg2.primaryAxisAlignItems='CENTER'; bdg2.counterAxisAlignItems='CENTER';
  text(bdg2, 'Under care', 10, {r:122/255,g:90/255,b:0}, 'Semi Bold');
  text(c2, 'Planted 04 Jan 2026 · 5.1 km away', 11, COLORS.muted, 'Regular');
  bottomNav(db);

  // Plant details
  const pd = screen('Plant details');
  screens.appendChild(pd);
  const ph = frame(pd, SCREEN_W, 180, 'Photo', {r:200/255,g:214/255,b:192/255}, 0);
  ph.layoutMode='HORIZONTAL'; ph.primaryAxisAlignItems='CENTER'; ph.counterAxisAlignItems='CENTER';
  text(ph, 'Photo', 14, COLORS.muted, 'Regular');
  const pdb = frame(pd, SCREEN_W, 400, 'Body', null, 0);
  pdb.layoutMode='VERTICAL'; pdb.itemSpacing=8; pdb.paddingLeft=pdb.paddingRight=16; pdb.paddingTop=12;
  text(pdb, 'Neem', 22, COLORS.primary, 'Bold');
  text(pdb, 'Azadirachta indica · Tree', 13, COLORS.muted, 'Regular');
  text(pdb, 'Planted 12 Mar 2026', 13, COLORS.muted, 'Regular');
  const info = frame(pdb, SCREEN_W-32, 70, 'Info', COLORS.surface, 12);
  info.layoutMode='VERTICAL'; info.itemSpacing=4; info.paddingLeft=info.paddingRight=info.paddingTop=info.paddingBottom=12;
  text(info, 'Owner: Sai Roopak', 13, COLORS.text, 'Regular');
  text(info, 'Monitor: — (request to monitor)', 13, COLORS.text, 'Regular');
  const care = frame(pdb, SCREEN_W-32, 90, 'Care', COLORS.surface, 12);
  care.layoutMode='VERTICAL'; care.itemSpacing=4; care.paddingLeft=care.paddingRight=care.paddingTop=care.paddingBottom=12;
  text(care, 'Next watering: Sat 25 Oct 2026', 13, COLORS.text, 'Semi Bold');
  const mb = frame(care, SCREEN_W-56, 40, 'Mark watered', COLORS.primary, 10);
  mb.layoutMode='HORIZONTAL'; mb.primaryAxisAlignItems='CENTER'; mb.counterAxisAlignItems='CENTER';
  text(mb, 'Mark watered', 14, {r:1,g:1,b:1}, 'Semi Bold');
  const qr = frame(pdb, SCREEN_W-32, 120, 'QR', COLORS.surface, 12);
  qr.layoutMode='VERTICAL'; qr.primaryAxisAlignItems='CENTER'; qr.counterAxisAlignItems='CENTER'; qr.itemSpacing=6;
  const qbox = frame(qr, 80, 80, 'QR box', COLORS.surface, 8);
  qbox.strokes = solid(COLORS.primary); qbox.strokeWeight = 2;
  qbox.layoutMode='HORIZONTAL'; qbox.primaryAxisAlignItems='CENTER'; qbox.counterAxisAlignItems='CENTER';
  text(qbox, 'QR', 12, COLORS.muted, 'Regular');
  text(qr, 'Scan to view public details', 12, COLORS.muted, 'Regular');
  bottomNav(pd);

  // Add tree
  const at = screen('Add tree');
  screens.appendChild(at);
  const atb = frame(at, SCREEN_W, 560, 'Form', null, 0);
  atb.layoutMode='VERTICAL'; atb.itemSpacing=10; atb.paddingLeft=atb.paddingRight=16; atb.paddingTop=16;
  text(atb, 'Add a tree', 20, COLORS.primary, 'Semi Bold');
  text(atb, 'Photo', 13, COLORS.text, 'Medium');
  rect(atb, SCREEN_W-32, 100, {r:232/255,g:228/255,b:216/255}, 12);
  text(atb, 'Tap to capture / upload', 12, COLORS.muted, 'Regular');
  text(atb, 'Common / species name', 13, COLORS.text, 'Medium');
  rect(atb, SCREEN_W-32, 44, COLORS.surface, 12);
  text(atb, 'Description (optional)', 13, COLORS.text, 'Medium');
  rect(atb, SCREEN_W-32, 70, COLORS.surface, 12);
  text(atb, 'Location', 13, COLORS.text, 'Medium');
  rect(atb, SCREEN_W-32, 100, {r:200/255,g:214/255,b:192/255}, 12);
  text(atb, 'Map — tap to set pin (manual fallback)', 12, COLORS.muted, 'Regular');
  const sab = frame(atb, SCREEN_W-32, 48, 'Review & save', COLORS.primary, 12);
  sab.layoutMode='HORIZONTAL'; sab.primaryAxisAlignItems='CENTER'; sab.counterAxisAlignItems='CENTER';
  text(sab, 'Review & save', 15, {r:1,g:1,b:1}, 'Semi Bold');
  bottomNav(at);

  // QR scan
  const qs = screen('QR scan');
  screens.appendChild(qs);
  const qsb = frame(qs, SCREEN_W, 500, 'Body', null, 0);
  qsb.layoutMode='VERTICAL'; qsb.primaryAxisAlignItems='CENTER'; qsb.counterAxisAlignItems='CENTER'; qsb.itemSpacing=16; qsb.paddingTop=40;
  text(qsb, 'Scan QR code', 20, COLORS.primary, 'Semi Bold');
  const qframe = frame(qsb, 240, 240, 'Scan frame', COLORS.surface, 12);
  qframe.strokes = solid(COLORS.primary); qframe.strokeWeight = 3;
  qframe.layoutMode='HORIZONTAL'; qframe.primaryAxisAlignItems='CENTER'; qframe.counterAxisAlignItems='CENTER';
  text(qframe, 'Align QR within frame', 12, COLORS.muted, 'Regular');
  text(qsb, 'Camera permission required. Enter code manually if unavailable.', 12, COLORS.muted, 'Regular');
  const man = frame(qsb, SCREEN_W-48, 44, 'Enter code manually', COLORS.primary, 12);
  man.fills=[]; man.strokes=solid(COLORS.primary); man.strokeWeight=1;
  man.layoutMode='HORIZONTAL'; man.primaryAxisAlignItems='CENTER'; man.counterAxisAlignItems='CENTER';
  text(man, 'Enter code manually', 14, COLORS.primary, 'Semi Bold');
  bottomNav(qs);

  figma.notify('Haritavanam design generated: Foundations, Components, Screens pages.');
  figma.closePlugin();
}

main();
