// avatar.js — Static canvas portrait renderer for quiz result card
// Draws chibi anime character riding spirit beast, using same art as eye-overlay.js
(function(global) {
  'use strict';

  const CHARS = {
    INTJ:  { name:'夜神月',  hair:'#111117', skin:'#fce8c4', outfit:'#1a1a2e', acc:'#a855f7', animal:'dragon',  ac:'#5b21b6', aa:'#a855f7' },
    INTP:  { name:'石神千空', hair:'#f5f5f5', skin:'#fde8c8', outfit:'#0a3d62', acc:'#38bdf8', animal:'phoenix', ac:'#ef4444', aa:'#f97316' },
    ENTJ:  { name:'罗伊',    hair:'#111117', skin:'#fde8c8', outfit:'#111117', acc:'#a855f7', animal:'horse',   ac:'#78350f', aa:'#d97706' },
    ENTP:  { name:'折原',    hair:'#111117', skin:'#fde8c8', outfit:'#1e3799', acc:'#38bdf8', animal:'tiger',   ac:'#ea580c', aa:'#1e3799' },
    INFJ:  { name:'鼬',      hair:'#111117', skin:'#fde8c8', outfit:'#374151', acc:'#f87171', animal:'phoenix', ac:'#b91c1c', aa:'#ef4444' },
    INFP:  { name:'真嗣',    hair:'#92400e', skin:'#fde8c8', outfit:'#6c5ce7', acc:'#a78bfa', animal:'cat',     ac:'#7c3aed', aa:'#c4b5fd' },
    ENFJ:  { name:'老师',    hair:'#fde68a', skin:'#fce8c4', outfit:'#dc2626', acc:'#fde68a', animal:'lion',    ac:'#b45309', aa:'#d97706' },
    ENFP:  { name:'路飞',    hair:'#111117', skin:'#fce8c4', outfit:'#dc2626', acc:'#f97316', animal:'horse',   ac:'#78350f', aa:'#d97706' },
    ISTJ:  { name:'埼玉',    hair:'#111117', skin:'#fde8c8', outfit:'#e5e7eb', acc:'#f97316', animal:'ox',      ac:'#44403c', aa:'#78716c' },
    ISFJ:  { name:'本田透',  hair:'#92400e', skin:'#fde8c8', outfit:'#059669', acc:'#34d399', animal:'lion',    ac:'#d97706', aa:'#fbbf24' },
    ESTJ:  { name:'利威尔',  hair:'#111117', skin:'#fde8c8', outfit:'#374151', acc:'#60a5fa', animal:'horse',   ac:'#6b7280', aa:'#9ca3af' },
    ESFJ:  { name:'三玖',    hair:'#fbcfe8', skin:'#fde8c8', outfit:'#ec4899', acc:'#fce7f3', animal:'cat',    ac:'#7c3aed', aa:'#c4b5fd' },
    ISTP:  { name:'加兹',    hair:'#111117', skin:'#fde8c8', outfit:'#374151', acc:'#94a3b8', animal:'tiger',   ac:'#374151', aa:'#64748b' },
    ISFP:  { name:'炭治郎',  hair:'#111117', skin:'#fde8c8', outfit:'#0891b2', acc:'#67e8f9', animal:'cat',    ac:'#047857', aa:'#34d399' },
    ESTP:  { name:'五条悟',  hair:'#f5f5f5', skin:'#fde8c8', outfit:'#1d4ed8', acc:'#60a5fa', animal:'dragon', ac:'#1d4ed8', aa:'#60a5fa' },
    ESFP:  { name:'惠惠',    hair:'#7f1d1d', skin:'#fde8c8', outfit:'#ea580c', acc:'#fbbf24', animal:'lion',   ac:'#ea580c', aa:'#fbbf24' },
  };

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
  }

  function drawChibi(ctx, x, y, frame, c) {
    const swing = Math.sin(frame * Math.PI / 4) * 20;
    const { hair, skin, outfit, acc } = c;
    // Legs
    [[-7,-swing],[7,swing]].forEach(([dx, rot]) => {
      ctx.save(); ctx.translate(x+dx, y+14); ctx.rotate(rot * Math.PI/180);
      ctx.fillStyle=outfit; ctx.fillRect(-5,0,10,21);
      ctx.fillStyle='#c4786a'; ctx.fillRect(-5,19,10,6);
      ctx.restore();
    });
    // Body
    ctx.fillStyle=outfit; rr(ctx,x-14,y-12,28,28,7); ctx.fill();
    // Collar
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.moveTo(x,y-12); ctx.lineTo(x-6,y+2); ctx.lineTo(x,y-2); ctx.lineTo(x+6,y+2); ctx.closePath(); ctx.fill();
    // Arms
    ctx.save(); ctx.translate(x-14,y-6); ctx.rotate(-swing*0.5*Math.PI/180);
    ctx.fillStyle=outfit; ctx.fillRect(-10,0,10,20);
    ctx.fillStyle=skin; ctx.fillRect(-10,17,10,7); ctx.restore();
    ctx.save(); ctx.translate(x+14,y-6); ctx.rotate(swing*0.5*Math.PI/180);
    ctx.fillStyle=outfit; ctx.fillRect(0,0,10,20);
    ctx.fillStyle=skin; ctx.fillRect(0,17,10,7); ctx.restore();
    // Neck
    ctx.fillStyle=skin; ctx.fillRect(x-6,y-20,12,10);
    // Head
    ctx.fillStyle=skin; ctx.beginPath(); ctx.arc(x,y-38,22,0,Math.PI*2); ctx.fill();
    // Hair back
    ctx.fillStyle=hair; ctx.beginPath(); ctx.arc(x,y-38,23,-Math.PI,0.1); ctx.fill();
    // Hair front
    ctx.beginPath(); ctx.moveTo(x-22,y-44); ctx.bezierCurveTo(x-18,y-68,x+18,y-68,x+22,y-44);
    ctx.lineTo(x+14,y-52); ctx.lineTo(x+6,y-60); ctx.lineTo(x,y-58);
    ctx.lineTo(x-8,y-60); ctx.lineTo(x-16,y-52); ctx.closePath(); ctx.fill();
    // Eyes (left)
    ctx.fillStyle='#fff'; rr(ctx,x-18,y-46,14,11,3); ctx.fill();
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(x-11,y-41,4.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=acc; ctx.globalAlpha=0.7; ctx.beginPath(); ctx.arc(x-11,y-41,2.8,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x-9,y-43,1.5,0,Math.PI*2); ctx.fill();
    // Eyes (right)
    ctx.fillStyle='#fff'; rr(ctx,x+4,y-46,14,11,3); ctx.fill();
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(x+11,y-41,4.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=acc; ctx.globalAlpha=0.7; ctx.beginPath(); ctx.arc(x+11,y-41,2.8,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x+13,y-43,1.5,0,Math.PI*2); ctx.fill();
    // Mouth
    ctx.strokeStyle='#d4857a'; ctx.lineWidth=1.8; ctx.lineCap='round';
    ctx.beginPath(); ctx.arc(x,y-30,5,0.1,Math.PI-0.1); ctx.stroke();
    // Blush
    ctx.fillStyle='rgba(255,140,140,0.28)';
    ctx.beginPath(); ctx.ellipse(x-17,y-32,7,4,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+17,y-32,7,4,0,0,Math.PI*2); ctx.fill();
  }

  function drawCat(ctx, x, y, frame, c) {
    const { ac, aa } = c, ls = Math.sin(frame * Math.PI / 4) * 16;
    ctx.fillStyle=ac; ctx.beginPath(); ctx.ellipse(x,y+16,20,13,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+15,y+5,13,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x+7,y-3); ctx.lineTo(x+4,y-13); ctx.lineTo(x+14,y-5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x+21,y-4); ctx.lineTo(x+27,y-13); ctx.lineTo(x+26,y+2); ctx.fill();
    ctx.fillStyle='#ffb3c1';
    ctx.beginPath(); ctx.moveTo(x+8,y-4); ctx.lineTo(x+6,y-10); ctx.lineTo(x+13,y-6); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x+22,y-4); ctx.lineTo(x+26,y-10); ctx.lineTo(x+25,y+1); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x+15,y+8,3.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(x+15,y+8,2,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.lineWidth=1;
    [[-1,0],[0,2],[1,4]].forEach(([i,dy]) => {
      ctx.beginPath(); ctx.moveTo(x+8,y+8+dy); ctx.lineTo(x-4+i,y+8+dy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x+22,y+8+dy); ctx.lineTo(x+34+i,y+8+dy); ctx.stroke();
    });
    const wag = Math.sin(frame * Math.PI / 4) * 12;
    ctx.strokeStyle=ac; ctx.lineWidth=5; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(x-18,y+14); ctx.bezierCurveTo(x-32,y+8,x-35,y-8+wag,x-26,y-13+wag); ctx.stroke();
    ctx.fillStyle=aa; ctx.beginPath(); ctx.arc(x-26,y-13+wag,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=ac;
    [x-12,x-5,x+4,x+11].forEach((lx,i) => {
      ctx.save(); ctx.translate(lx,y+26); ctx.rotate((i%2===0?ls:-ls)*Math.PI/180);
      ctx.fillRect(-3,0,7,11); ctx.restore();
    });
  }

  function drawDragon(ctx, x, y, frame, c) {
    const { ac, aa } = c, wave=Math.sin(frame*Math.PI/4)*9, flap=Math.sin(frame*Math.PI/4)*13;
    ctx.fillStyle=ac+'88';
    ctx.beginPath(); ctx.moveTo(x-8,y+6); ctx.quadraticCurveTo(x-28,y-12-flap,x-54-flap*0.5,y-2); ctx.quadraticCurveTo(x-28,y+4,x-8,y+12); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x-8,y+10); ctx.quadraticCurveTo(x-22,y+18+flap,x-46+flap*0.3,y+30); ctx.quadraticCurveTo(x-24,y+18,x-8,y+14); ctx.fill();
    ctx.strokeStyle=ac; ctx.lineWidth=15; ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.beginPath(); ctx.moveTo(x-40,y+16+wave); ctx.bezierCurveTo(x-20,y+4,x+2,y+20-wave,x+22,y+10); ctx.stroke();
    ctx.strokeStyle=aa; ctx.lineWidth=7;
    ctx.beginPath(); ctx.moveTo(x-36,y+17+wave); ctx.bezierCurveTo(x-18,y+7,x+4,y+18-wave,x+20,y+11); ctx.stroke();
    ctx.fillStyle=ac; ctx.beginPath(); ctx.ellipse(x+28,y+6,17,12,-0.25,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=aa;
    ctx.beginPath(); ctx.moveTo(x+22,y-3); ctx.lineTo(x+16,y-17); ctx.lineTo(x+26,y-4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x+30,y-5); ctx.lineTo(x+36,y-17); ctx.lineTo(x+28,y-3); ctx.fill();
    ctx.fillStyle='#ffe44c'; ctx.beginPath(); ctx.arc(x+32,y+3,3.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(x+32,y+3,1.8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x+40,y+9,2.5,1.5,0.4,0,Math.PI*2); ctx.fill();
  }

  function drawPhoenix(ctx, x, y, frame, c) {
    const { ac, aa } = c, flap=Math.sin(frame*Math.PI/4)*16, tailSway=Math.sin(frame*Math.PI/4)*9;
    ctx.strokeStyle=aa; ctx.lineWidth=3.5; ctx.lineCap='round';
    for (let i=-2;i<=2;i++) {
      ctx.beginPath(); ctx.moveTo(x-20+i*4,y+14); ctx.quadraticCurveTo(x-30+i*2,y+26+tailSway+i*2,x-44+i*6,y+34+tailSway); ctx.stroke();
    }
    ctx.fillStyle=ac+'cc';
    ctx.beginPath(); ctx.moveTo(x,y); ctx.quadraticCurveTo(x-12,y-22-flap,x-52,y-12-flap); ctx.quadraticCurveTo(x-30,y+4,x,y+10); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x,y+10); ctx.quadraticCurveTo(x-18,y+4+flap,x-48,y+22+flap*0.6); ctx.quadraticCurveTo(x-28,y+20,x,y+18); ctx.fill();
    ctx.fillStyle=ac; ctx.beginPath(); ctx.ellipse(x+12,y+8,14,10,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=aa;
    ctx.beginPath(); ctx.moveTo(x+12,y-2); ctx.lineTo(x+8,y-14); ctx.lineTo(x+16,y-8); ctx.fill();
    ctx.fillStyle='#ffe44c'; ctx.beginPath(); ctx.arc(x+18,y+6,3.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(x+18,y+6,1.8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=ac;
    [x-4,x+2,x+8,x+14].forEach((lx,i) => {
      ctx.save(); ctx.translate(lx,y+16);
      ctx.rotate((i%2===0?1:-1)*0.3);
      ctx.fillRect(-3,0,7,12); ctx.restore();
    });
  }

  function drawTiger(ctx, x, y, frame, c) {
    const { ac, aa } = c, ls=Math.sin(frame*Math.PI/4)*20;
    ctx.fillStyle=ac; ctx.beginPath(); ctx.ellipse(x,y+14,23,14,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#111'; ctx.globalAlpha=0.2; ctx.fillRect(x-8,y+2,5,22); ctx.fillRect(x+2,y+4,4,18); ctx.globalAlpha=1;
    ctx.fillStyle=ac; ctx.beginPath(); ctx.arc(x+18,y+4,15,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x+10,y-5); ctx.lineTo(x+7,y-16); ctx.lineTo(x+18,y-8); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x+24,y-7); ctx.lineTo(x+30,y-17); ctx.lineTo(x+31,y-4); ctx.fill();
    ctx.fillStyle='#ffcdd2'; ctx.beginPath(); ctx.moveTo(x+11,y-6); ctx.lineTo(x+9,y-13); ctx.lineTo(x+17,y-9); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x+25,y-7); ctx.lineTo(x+29,y-14); ctx.lineTo(x+30,y-5); ctx.fill();
    ctx.fillStyle='#fff9c4'; ctx.beginPath(); ctx.ellipse(x+20,y+8,9,6.5,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ea580c'; ctx.beginPath(); ctx.ellipse(x+20,y+8,3.5,2.5,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(x+13,y+2,3,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+24,y+2,3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x+14,y+1,1,0,Math.PI*2); ctx.fill();
    const wag=Math.sin(frame*Math.PI/4)*12;
    ctx.strokeStyle=ac; ctx.lineWidth=6; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(x-20,y+12); ctx.bezierCurveTo(x-34,y+6,x-38,y-8+wag,x-30,y-14+wag); ctx.stroke();
    ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(x-30,y-14+wag,5.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=ac;
    [x-13,x-5,x+5,x+13].forEach((lx,i) => {
      ctx.save(); ctx.translate(lx,y+25); ctx.rotate((i%2===0?ls:-ls)*Math.PI/180);
      ctx.fillRect(-4,0,9,15); ctx.restore();
    });
  }

  function drawHorse(ctx, x, y, frame, c) {
    const { ac, aa } = c, ls=Math.sin(frame*Math.PI/4)*24;
    ctx.fillStyle=ac; ctx.beginPath(); ctx.ellipse(x,y+14,27,16,0,0,Math.PI*2); ctx.fill();
    rr(ctx,x+14,y-14,15,30,7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+27,y-10,14,10,0.35,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=aa; ctx.lineWidth=5; ctx.lineCap='round';
    const mwave=Math.sin(frame*Math.PI/4)*4;
    ctx.beginPath(); ctx.moveTo(x+14,y-12); ctx.bezierCurveTo(x+5,y-20+mwave,x+7,y-6,x+14,y+4); ctx.stroke();
    ctx.fillStyle=ac;
    ctx.beginPath(); ctx.moveTo(x+20,y-20); ctx.lineTo(x+17,y-30); ctx.lineTo(x+26,y-22); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x+30,y-19); ctx.lineTo(x+33,y-28); ctx.lineTo(x+36,y-19); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x+31,y-13,4.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#1a1a1a'; ctx.beginPath(); ctx.arc(x+31,y-13,2.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x+32,y-14,1.2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#c4786a'; ctx.beginPath(); ctx.ellipse(x+38,y-7,3.5,2,0.5,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=aa; ctx.lineWidth=7;
    const tsway=Math.sin(frame*Math.PI/4)*11;
    ctx.beginPath(); ctx.moveTo(x-24,y+8); ctx.bezierCurveTo(x-38,y+12,x-44,y+22+tsway,x-40,y+36+tsway); ctx.stroke();
    ctx.fillStyle=ac;
    [x-18,x-7,x+7,x+18].forEach((lx,i) => {
      ctx.save(); ctx.translate(lx,y+27); ctx.rotate((i%2===0?ls:-ls)*Math.PI/180);
      ctx.fillRect(-5,0,11,23);
      ctx.fillStyle='#78350f'; ctx.fillRect(-5,21,11,6);
      ctx.fillStyle=ac; ctx.restore();
    });
  }

  function drawLion(ctx, x, y, frame, c) {
    const { ac, aa } = c, ls=Math.sin(frame*Math.PI/4)*18;
    ctx.fillStyle=ac; ctx.beginPath(); ctx.ellipse(x,y+16,23,15,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=aa; ctx.beginPath(); ctx.arc(x+16,y+4,23,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=ac; ctx.beginPath(); ctx.arc(x+16,y+4,15,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fef3c7'; ctx.beginPath(); ctx.arc(x+16,y+4,13,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=ac; ctx.beginPath(); ctx.arc(x+6,y-7,6,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+26,y-7,6,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(x+11,y+1,3.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+21,y+1,3.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x+12,y,1.2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+22,y,1.2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff9c4'; ctx.beginPath(); ctx.ellipse(x+16,y+10,9,6,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#c4786a'; ctx.beginPath(); ctx.arc(x+16,y+8,3.5,0,Math.PI*2); ctx.fill();
    const wag=Math.sin(frame*Math.PI/4)*11;
    ctx.strokeStyle=ac; ctx.lineWidth=6; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(x-20,y+14); ctx.bezierCurveTo(x-36,y+8,x-42,y-4+wag,x-34,y-10+wag); ctx.stroke();
    ctx.fillStyle=aa; ctx.beginPath(); ctx.arc(x-34,y-10+wag,8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fef3c7';
    [x-13,x-4,x+5,x+14].forEach((lx,i) => {
      ctx.save(); ctx.translate(lx,y+29); ctx.rotate((i%2===0?ls:-ls)*Math.PI/180);
      ctx.fillRect(-5,0,11,17); ctx.restore();
    });
  }

  function drawOx(ctx, x, y, frame, c) {
    const { ac, aa } = c, ls=Math.sin(frame*Math.PI/4)*16;
    ctx.fillStyle=ac; ctx.beginPath(); ctx.ellipse(x-2,y+16,29,18,0,0,Math.PI*2); ctx.fill();
    rr(ctx,x+13,y-6,19,30,7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+27,y-2,15,12,0.15,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=aa;
    ctx.beginPath(); ctx.moveTo(x+18,y-12); ctx.quadraticCurveTo(x+9,y-30,x+22,y-24); ctx.lineTo(x+23,y-14); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x+30,y-14); ctx.quadraticCurveTo(x+42,y-30,x+36,y-22); ctx.lineTo(x+30,y-14); ctx.fill();
    ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(x+31,y-4,3.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x+32,y-5,1.2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#bcaaa4'; ctx.beginPath(); ctx.ellipse(x+38,y+6,8,6,0.2,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#fbbf24'; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.arc(x+39,y+6,4.5,-0.5,Math.PI+0.5); ctx.stroke();
    const tsway=Math.sin(frame*Math.PI/4)*9;
    ctx.strokeStyle=ac; ctx.lineWidth=5; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(x-28,y+12); ctx.bezierCurveTo(x-40,y+16,x-42,y+28+tsway,x-36,y+36+tsway); ctx.stroke();
    ctx.fillStyle=aa; ctx.beginPath(); ctx.arc(x-36,y+36+tsway,6,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=ac;
    [x-20,x-7,x+7,x+20].forEach((lx,i) => {
      ctx.save(); ctx.translate(lx,y+31); ctx.rotate((i%2===0?ls:-ls)*Math.PI/180);
      ctx.fillRect(-7,0,14,21);
      ctx.fillStyle='#374151'; ctx.fillRect(-7,19,14,7);
      ctx.fillStyle=ac; ctx.restore();
    });
  }

  function drawAnimal(ctx, x, y, frame, c) {
    switch(c.animal) {
      case 'cat':    drawCat(ctx,x,y,frame,c); break;
      case 'dragon': drawDragon(ctx,x,y,frame,c); break;
      case 'phoenix':drawPhoenix(ctx,x,y,frame,c); break;
      case 'tiger':  drawTiger(ctx,x,y,frame,c); break;
      case 'horse':  drawHorse(ctx,x,y,frame,c); break;
      case 'lion':   drawLion(ctx,x,y,frame,c); break;
      case 'ox':     drawOx(ctx,x,y,frame,c); break;
    }
  }

  function drawSparkles(ctx, cx, cy, size, color) {
    const pts = [
      [-55,-70], [55,-65], [-70,-10], [68,-20],
      [-30, 60], [40, 55], [-60, 30], [60, 30]
    ];
    pts.forEach(([dx, dy], i) => {
      const sz = (i % 3 === 0) ? size * 0.55 : size * 0.35;
      ctx.save();
      ctx.translate(cx + dx, cy + dy);
      ctx.rotate((i * 22.5) * Math.PI / 180);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.9;
      // 4-pointed star
      ctx.beginPath();
      for (let p = 0; p < 8; p++) {
        const angle = (p * Math.PI) / 4;
        const r = (p % 2 === 0) ? sz : sz * 0.35;
        p === 0 ? ctx.moveTo(Math.cos(angle)*r, Math.sin(angle)*r)
                : ctx.lineTo(Math.cos(angle)*r, Math.sin(angle)*r);
      }
      ctx.closePath(); ctx.fill();
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  global.renderAvatar = function(canvas, mbtiType) {
    const cfg = CHARS[mbtiType] || CHARS['INFP'];
    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    // Background gradient (rounded rect clip)
    const grad = ctx.createLinearGradient(0, 0, W * 0.4, H);
    grad.addColorStop(0, cfg.aa + 'ff');
    grad.addColorStop(0.5, cfg.ac + 'dd');
    grad.addColorStop(1, cfg.aa + '99');
    rr(ctx, 0, 0, W, H, 20);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.save(); rr(ctx, 0, 0, W, H, 20); ctx.clip();

    // Soft radial inner glow
    const glow = ctx.createRadialGradient(W*0.5, H*0.35, 0, W*0.5, H*0.35, W*0.7);
    glow.addColorStop(0, 'rgba(255,255,255,0.25)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(0,0,W,H);

    // Sparkles
    drawSparkles(ctx, W/2, H/2, 7, cfg.aa);

    // Scale up and center the character
    // In eye-overlay the draw() call is: draw(ctx, charX, 135, walkFrame, dir, cfg)
    // canvas height=180. The scene spans roughly y-75 to y+41 → 116px.
    // For W=H=240, scale=1.65 → scene spans ~191px, center at H/2=120
    const SCALE = Math.min(W, H) / 145;
    ctx.save();
    ctx.scale(SCALE, SCALE);
    const sx = W / SCALE / 2 - 8;  // slight left shift so tail doesn't clip
    const sy = H / SCALE / 2 + 8;  // slight down shift so chibi head isn't clipped

    // Glow aura beneath character
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = cfg.acc + 'aa';
    ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.ellipse(sx, sy+14, 44, 12, 0, 0, Math.PI*2);
    ctx.fillStyle = cfg.acc + '33'; ctx.fill();
    ctx.restore();

    drawAnimal(ctx, sx, sy + 4, 3, cfg);
    drawChibi(ctx, sx, sy, 3, cfg);
    ctx.restore();

    ctx.restore(); // end clip
  };
})(window);
