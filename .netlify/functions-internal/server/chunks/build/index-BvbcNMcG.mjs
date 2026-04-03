import { defineComponent, ref, provide, watch, mergeProps, unref, computed, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderAttr, ssrRenderList, ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { h as useRoute, u as useRouter, i as useSupabaseSession, d as useSupabaseClient, f as useAuthModal, j as _imports_0, _ as _export_sfc, g as useSupabaseUser, b as useRuntimeConfig } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';
import '@supabase/ssr';

const HALLS = [
  {
    id: 1,
    name: "DMC\uD0C0\uC6CC\uC6E8\uB529",
    location: "\uC11C\uC6B8 \uB9C8\uD3EC\uAD6C \uC0C1\uC554\uB3D9 1622",
    phone: "1899-1221",
    mood: "\uBAA8\uB358",
    foodMin: 5,
    foodMax: 6,
    minPpl: 150,
    maxPpl: 150,
    icon: "\u{1F3E2}",
    tags: ["\uBAA8\uB358", "\uC5B4\uB450\uC6B4\uD640", "\uB192\uC740\uCC9C\uACE0"],
    hallName: "\uADF8\uB79C\uB4DC\uBCFC\uB8F8\uD640",
    hallDesc: "\uC6C5\uC7A5\uD558\uACE0 \uB113\uC740 \uD640. \uB192\uC740 \uCE35\uACE0, \uAE34 \uBC84\uC9C4\uB85C\uB4DC 21m, \uD1B5\uCC3D, \uC0F9\uB4E4\uB9AC\uC5D0, \uC0DD\uD654 \uC7A5\uC2DD \uACE0\uAE09\uC2A4\uB7EC\uC6C0, \uD654\uB824\uD568, \uC5B4\uB450\uC6B4 \uD640",
    hallNote: "\uC2E0\uBD80\uB300\uAE30\uC2E4 \uADDC\uBAA8\uC640 \uD004\uB9AC\uD2F0 \uC190\uC5D0 \uAF3D\uC74C, \uC2E0\uB791\uCE21\xB7\uC2E0\uBD80\uCE21 \uBA54\uC774\uD06C\uC5C5\uC2E4 \uBD84\uB9AC",
    food: "\uBDD4\uD398",
    foodDesc: "\uD004\uB9AC\uD2F0 \uC88B\uC740 \uD68C, \uC0AC\uC2DC\uBBF8 \uCAC4\uAE43\uD558\uACE0 \uBD80\uB4DC\uB7FD\uACE0 \uBE44\uB9B0\uB0B4 \uC5C6\uC74C",
    avgFood: "7.2\uB9CC\uC6D0",
    avgDiff: 24,
    lat: 37.5786,
    lng: 126.896,
    pinX: "36%",
    pinY: "34%"
  },
  {
    id: 2,
    name: "\uC544\uD3A0\uAC00\uBAA8 \uB3C4\uC0B0",
    location: "\uC11C\uC6B8 \uAC15\uB0A8\uAD6C \uC2E0\uC0AC\uB3D9 669",
    phone: "02-3444-0100",
    mood: "\uB7ED\uC154\uB9AC",
    foodMin: 9,
    foodMax: 12,
    minPpl: 200,
    maxPpl: 300,
    icon: "\u{1F3DB}",
    tags: ["\uB7ED\uC154\uB9AC", "\uBDD4\uD398", "\uB300\uD615\uD640"],
    hallName: "\uADF8\uB79C\uB4DC\uBCFC\uB8F8",
    hallDesc: "\uC6C5\uC7A5\uD55C \uB7ED\uC154\uB9AC \uD640. \uB192\uC740 \uCC9C\uACE0\uC640 \uACE0\uAE09\uC2A4\uB7EC\uC6B4 \uC778\uD14C\uB9AC\uC5B4, \uB300\uD615 \uC0F9\uB4E4\uB9AC\uC5D0. \uAC15\uB0A8 \uCD5C\uACE0\uAE09 \uC6E8\uB529\uD640 \uC911 \uD558\uB098.",
    hallNote: "\uC2E0\uBD80\uB300\uAE30\uC2E4 \uBCC4\uB3C4 \uC6B4\uC601, \uC8FC\uCC28 \uD3B8\uB9AC, VIP \uC804\uB2F4 \uD50C\uB798\uB108",
    food: "\uBDD4\uD398",
    foodDesc: "\uACE0\uAE09 \uBDD4\uD398, \uB2E4\uC591\uD55C \uC694\uB9AC \uAD6C\uC131. \uD574\uC0B0\uBB3C \uCF54\uB108\uC640 \uB77C\uC774\uBE0C \uCF54\uB108 \uC6B4\uC601.",
    avgFood: "11\uB9CC\uC6D0",
    avgDiff: -5,
    lat: 37.5247,
    lng: 127.0381,
    pinX: "63%",
    pinY: "60%"
  },
  {
    id: 3,
    name: "\uB354\uD30C\uD2F0\uC6E8\uB529",
    location: "\uC11C\uC6B8 \uC11C\uCD08\uAD6C \uBC18\uD3EC\uB3D9 19-3",
    phone: "02-533-7000",
    mood: "\uBAA8\uB358",
    foodMin: 7,
    foodMax: 8,
    minPpl: 150,
    maxPpl: 200,
    icon: "\u{1F492}",
    tags: ["\uBAA8\uB358", "\uC778\uAE30", "\uC790\uC5F0\uAD11"],
    hallName: "\uBA54\uC778\uD640",
    hallDesc: "\uBAA8\uB358\uD558\uACE0 \uC138\uB828\uB41C \uBD84\uC704\uAE30. \uC790\uC5F0\uAD11\uC774 \uC798 \uB4DC\uB294 \uBC1D\uC740 \uD640\uB85C \uD654\uC0AC\uD55C \uC6E8\uB529 \uC0AC\uC9C4 \uC5F0\uCD9C \uAC00\uB2A5.",
    hallNote: "\uC2E0\uB791/\uC2E0\uBD80 \uB300\uAE30\uC2E4 \uBD84\uB9AC, \uB113\uC740 \uC8FC\uCC28\uC7A5 \uBCF4\uC720",
    food: "\uBDD4\uD398",
    foodDesc: "\uC2E0\uC120\uD55C \uC7AC\uB8CC \uC0AC\uC6A9, \uD569\uB9AC\uC801\uC778 \uAC00\uACA9\uB300. \uC2DC\uC98C\uBCC4 \uBA54\uB274 \uBCC0\uACBD.",
    avgFood: "8.5\uB9CC\uC6D0",
    avgDiff: 18,
    lat: 37.5014,
    lng: 127.002,
    pinX: "55%",
    pinY: "66%"
  },
  {
    id: 4,
    name: "\uB354\uCC44\uD50C \uD55C\uB0A8",
    location: "\uC11C\uC6B8 \uC6A9\uC0B0\uAD6C \uD55C\uB0A8\uB3D9 683-139",
    phone: "02-790-1234",
    mood: "\uD074\uB798\uC2DD",
    foodMin: 10,
    foodMax: 14,
    minPpl: 80,
    maxPpl: 100,
    icon: "\u26EA",
    tags: ["\uD074\uB798\uC2DD", "\uC18C\uADDC\uBAA8", "\uCC44\uD50C"],
    hallName: "\uCC44\uD50C\uD640",
    hallDesc: "\uC720\uB7FD\uD48D \uD074\uB798\uC2DD \uCC44\uD50C. \uC2A4\uD14C\uC778\uB4DC\uAE00\uB77C\uC2A4\uC640 \uC544\uCE58\uD615 \uCC9C\uC7A5\uC774 \uD2B9\uC9D5\uC801\uC778 \uC544\uB984\uB2E4\uC6B4 \uC18C\uADDC\uBAA8 \uACF5\uAC04.",
    hallNote: "\uC18C\uADDC\uBAA8 \uD504\uB77C\uC774\uBE57 \uC6E8\uB529 \uD2B9\uD654, \uB9DE\uCDA4 \uD328\uD0A4\uC9C0 \uD611\uC758 \uAC00\uB2A5",
    food: "\uC591\uC2DD\uCF54\uC2A4",
    foodDesc: "\uBBF8\uC290\uB7AD \uCD9C\uC2E0 \uC170\uD504\uC758 \uC815\uCC2C \uCF54\uC2A4. \uC640\uC778 \uD398\uC5B4\uB9C1 \uC635\uC158.",
    avgFood: "12\uB9CC\uC6D0",
    avgDiff: -8,
    lat: 37.5331,
    lng: 127.0047,
    pinX: "44%",
    pinY: "44%"
  },
  {
    id: 5,
    name: "\uB354\uCEE8\uBCA4\uC158 \uC2E0\uC0AC",
    location: "\uC11C\uC6B8 \uAC15\uB0A8\uAD6C \uB17C\uD604\uB3D9 98",
    phone: "02-512-5000",
    mood: "\uBAA8\uB358",
    foodMin: 8,
    foodMax: 9,
    minPpl: 180,
    maxPpl: 250,
    icon: "\u{1F33F}",
    tags: ["\uBAA8\uB358", "\uAC00\uB4E0", "\uC57C\uC678"],
    hallName: "\uCEE8\uBCA4\uC158\uD640 A",
    hallDesc: "\uB113\uC740 \uCEE8\uBCA4\uC158 \uD640. \uC57C\uC678 \uAC00\uB4E0\uACFC \uC5F0\uACB0, \uC790\uC5F0\uCC44\uAD11\uC774 \uD48D\uBD80\uD55C \uBC1D\uC740 \uACF5\uAC04.",
    hallNote: "\uC57C\uC678 \uAC00\uB4E0 \uBD80\uB300\uC2DC\uC124 \uC774\uC6A9 \uAC00\uB2A5, \uB4DC\uB860 \uCD2C\uC601 \uD5C8\uC6A9",
    food: "\uBDD4\uD398",
    foodDesc: "\uC2E0\uC120\uD55C \uC81C\uCCA0 \uC7AC\uB8CC, \uB2E4\uC591\uD55C \uB77C\uC774\uBE0C \uCF54\uB108 \uC6B4\uC601.",
    avgFood: "9\uB9CC\uC6D0",
    avgDiff: 11,
    lat: 37.5225,
    lng: 127.0314,
    pinX: "64%",
    pinY: "52%"
  },
  {
    id: 6,
    name: "\uC2E0\uB77C\uD638\uD154 \uB2E4\uC774\uB108\uC2A4\uD2F0",
    location: "\uC11C\uC6B8 \uC911\uAD6C \uC7A5\uCDA9\uB3D9 2\uAC00 202",
    phone: "02-2233-3131",
    mood: "\uB7ED\uC154\uB9AC",
    foodMin: 14,
    foodMax: 18,
    minPpl: 300,
    maxPpl: 500,
    icon: "\u{1F3E8}",
    tags: ["\uB7ED\uC154\uB9AC", "\uD638\uD154", "\uCD08\uB300\uD615"],
    hallName: "\uB2E4\uC774\uB108\uC2A4\uD2F0\uD640",
    hallDesc: "\uCD5C\uACE0\uAE09 \uD638\uD154 \uC6E8\uB529\uD640. 500\uBA85 \uC218\uC6A9 \uAC00\uB2A5\uD55C \uCD08\uB300\uD615 \uD640, \uCD5C\uACE0\uAE09 \uC778\uD14C\uB9AC\uC5B4\uC640 \uC2DC\uC124.",
    hallNote: "\uD638\uD154 \uC2A4\uC704\uD2B8\uB8F8 \uC2E0\uBD80 \uB300\uAE30, VIP \uC758\uC804 \uC11C\uBE44\uC2A4 \uD3EC\uD568",
    food: "\uC591\uC2DD/\uD55C\uC2DD \uC120\uD0DD",
    foodDesc: "\uC2E0\uB77C\uD638\uD154 \uD2B9\uAE09 \uC694\uB9AC\uC0AC\uC758 \uD504\uB9AC\uBBF8\uC5C4 \uCF54\uC2A4. \uC640\uC778 \uD3EC\uD568.",
    avgFood: "16\uB9CC\uC6D0",
    avgDiff: -12,
    lat: 37.5558,
    lng: 127.0053,
    pinX: "52%",
    pinY: "38%"
  }
];
function hallMatchesFoodRange(h, foodF) {
  if (foodF === "\uC804\uCCB4") return true;
  if (foodF === "~6\uB9CC\uC6D0") return h.foodMax <= 6;
  if (foodF === "6~9\uB9CC\uC6D0") return h.foodMin <= 9 && h.foodMax >= 6;
  if (foodF === "9\uB9CC\uC6D0~") return h.foodMin >= 9;
  return true;
}
function hallMatchesGuestRange(h, minF) {
  if (minF === "\uC804\uCCB4") return true;
  if (minF === "~100\uBA85") return h.maxPpl <= 100;
  if (minF === "100~200\uBA85") return h.maxPpl >= 100 && h.minPpl <= 200;
  if (minF === "200\uBA85~") return h.maxPpl >= 200;
  return true;
}
const INITIAL_POSTS = [
  {
    id: 1,
    nick: "\uB77C\uBD80\uBD80",
    time: "10\uC2DC\uAC04 \uC804",
    hall: "\uB354\uD30C\uD2F0\uC6E8\uB529",
    body: "\uC608\uB791\uC774\uB791 \uCDE8\uD5A5\uC774 \uB108\uBB34 \uB2EC\uB77C\uC11C \uD798\uB4DC\uB124\uC694 \u3160\u3160 \uC800\uB294 \uBC1D\uACE0 \uD654\uC0AC\uD55C \uD640\uC774 \uC88B\uC740\uB370 \uC608\uB791\uC774\uB294 \uC5B4\uB461\uACE0 \uCC28\uBD84\uD55C \uD640\uC774 \uC88B\uB2E4\uACE0 \uD558\uACE0... \uD558\uB098\uD558\uB098 \uB9DE\uCDB0\uAC00\uB294 \uAC8C \uC774\uB807\uAC8C \uC5D0\uB108\uC9C0 \uC18C\uBAA8\uAC00 \uD074 \uC904 \uBAB0\uB790\uC5B4\uC694.",
    likes: 11,
    comments: 3
  },
  {
    id: 2,
    nick: "\uC288\uC789",
    time: "3\uC6D4 26\uC77C",
    hall: null,
    body: "\uBE14\uB85C\uADF8\uB294 \uAD11\uACE0 \uAC19\uACE0 \uCE74\uD398\uB294 \uC815\uBCF4\uAC00 \uD769\uC5B4\uC838 \uC788\uACE0\u2026 \uC5EC\uAE30\uB294 \uBB54\uAC00 \uD074\uB9B0\uD55C \uB290\uB08C\uC774\uB124\uC694.",
    likes: 1,
    comments: 0
  },
  {
    id: 3,
    nick: "\uC2EC\uBC14\uB9D8",
    time: "3\uC6D4 26\uC77C",
    hall: "\uC2E0\uB3C4\uB9BC \uC6E8\uB529\uD640",
    body: "\uC2E0\uB3C4\uB9BC \uCD5C\uC545\uC758 \uC6E8\uB529\uD640\uC774\uB77C\uACE0 \uD568. \uC808\uB300 \uAC00\uC9C0 \uB9D0\uAE30. \uC2DD\uC0AC\uB3C4 \uBCC4\uB85C\uACE0 \uC9C1\uC6D0\uB3C4 \uBD88\uCE5C\uC808.",
    likes: 21,
    comments: 7
  },
  {
    id: 4,
    nick: "\uC608\uC2DD\uC7A5\uD0D0\uBC29\uC911",
    time: "2\uC6D4 4\uC77C",
    hall: "\uB354\uCEE8\uBCA4\uC158 \uC2E0\uC0AC",
    body: "\uB354\uCEE8\uBCA4\uC158 \uC2E0\uC0AC \uCD5C\uC885 \uD6C4\uBCF4\uB85C \uACE0\uBBFC\uC911\uC778\uB370, \uD639\uC2DC \uD558\uC2E0\uBD84\uB4E4 \uC788\uB2E4\uBA74 \uC815\uBCF4 \uAC19\uC774 \uACF5\uC720\uD558\uBA74 \uC88B\uC744 \uAC83 \uAC19\uC544\uC694!!",
    likes: 7,
    comments: 2
  }
];
const INITIAL_BUDGET_ITEMS = [
  { icon: "\u{1F3DB}", name: "\uC6E8\uB529\uD640", sub: "\uB354\uD30C\uD2F0\uC6E8\uB529 \xB7 \uACC4\uC57D\uC644\uB8CC", amount: 680, done: true },
  { icon: "\u{1F4F8}", name: "\uC2A4\uB4DC\uBA54", sub: "\uC2A4\uD29C\uB514\uC624+\uB4DC\uB808\uC2A4+\uBA54\uC774\uD06C\uC5C5", amount: 740, done: true },
  { icon: "\u2708\uFE0F", name: "\uD5C8\uB2C8\uBB38", sub: "\uBAB0\uB514\uBE0C 5\uBC15 7\uC77C \uC608\uC815", amount: 500, done: false },
  { icon: "\u{1F48D}", name: "\uC608\uBB3C\xB7\uC608\uB2E8", sub: "\uBBF8\uC815", amount: 800, done: false },
  { icon: "\u{1F4E8}", name: "\uCCAD\uCCA9\uC7A5", sub: "\uC778\uC1C4 150\uC7A5", amount: 15, done: true },
  { icon: "\u{1F381}", name: "\uB2F5\uB840\uD488", sub: "\uBBF8\uC815", amount: 200, done: false }
];
const DICT = [
  {
    term: "\uC2A4\uB4DC\uBA54",
    cat: "\uC2A4\uB4DC\uBA54",
    def: "\uC2A4\uD29C\uB514\uC624 + \uB4DC\uB808\uC2A4 + \uBA54\uC774\uD06C\uC5C5\uC758 \uC904\uC784\uB9D0. \uC6E8\uB529 \uC0AC\uC9C4 \uCD2C\uC601, \uB4DC\uB808\uC2A4 \uB300\uC5EC, \uD5E4\uC5B4\uBA54\uC774\uD06C\uC5C5\uC744 \uD328\uD0A4\uC9C0\uB85C \uBB36\uC740 \uAC83."
  },
  {
    term: "\uBCF4\uC99D\uC778\uC6D0",
    cat: "\uC608\uC2DD\uC7A5",
    def: "\uC6E8\uB529\uD640\uC5D0\uC11C \uACC4\uC57D \uC2DC \uCD5C\uC18C\uD55C\uC73C\uB85C \uBCF4\uC7A5\uD574\uC57C \uD558\uB294 \uD558\uAC1D \uC778\uC6D0 \uC218. \uC2E4\uC81C \uD558\uAC1D \uC218\uAC00 \uBCF4\uC99D\uC778\uC6D0\uBCF4\uB2E4 \uC801\uC5B4\uB3C4 \uBCF4\uC99D\uC778\uC6D0 \uAE30\uC900\uC73C\uB85C \uC2DD\uB300 \uC815\uC0B0."
  },
  {
    term: "\uC608\uB2E8",
    cat: "\uC608\uBB3C\xB7\uC608\uB2E8",
    def: "\uC2E0\uBD80\uAC00 \uC2E0\uB791 \uC9D1\uC5D0 \uBCF4\uB0B4\uB294 \uD3D0\uBC31 \uC74C\uC2DD\uC774\uB098 \uD63C\uC218 \uB4F1\uC758 \uC120\uBB3C. \uC694\uC998\uC740 \uD604\uAE08\uC73C\uB85C \uB300\uCCB4\uD558\uAC70\uB098 \uAC04\uC18C\uD654\uD558\uB294 \uCD94\uC138."
  },
  {
    term: "\uBCF8\uC2DD\uC2A4\uB0C5",
    cat: "\uC900\uBE44\uB2E8\uACC4",
    def: "\uACB0\uD63C\uC2DD \uB2F9\uC77C\uC5D0 \uC2DD\uC7A5\uC5D0\uC11C \uCC0D\uB294 \uC0AC\uC9C4. \uC57C\uC678\uCD2C\uC601\uACFC \uBCC4\uAC1C\uB85C \uC2E4\uC81C \uC2DD\uC774 \uC9C4\uD589\uB418\uB294 \uB3D9\uC548 \uD604\uC7A5\uC744 \uB2F4\uB294 \uC2A4\uB0C5 \uC0AC\uC9C4."
  },
  {
    term: "\uC2DD\uB300",
    cat: "\uC74C\uC2DD",
    def: "\uD558\uAC1D 1\uC778\uB2F9 \uC2DD\uC0AC \uBE44\uC6A9. \uBDD4\uD398, \uD55C\uC2DD \uCF54\uC2A4, \uC591\uC2DD \uCF54\uC2A4 \uB4F1 \uBC29\uC2DD\uC5D0 \uB530\uB77C \uB2E4\uB974\uBA70 \uC6E8\uB529 \uC804\uCCB4 \uBE44\uC6A9\uC5D0\uC11C \uD070 \uBE44\uC911 \uCC28\uC9C0."
  },
  {
    term: "\uD3D0\uBC31",
    cat: "\uC900\uBE44\uB2E8\uACC4",
    def: "\uACB0\uD63C\uC2DD \uD6C4 \uC2E0\uB791 \uBD80\uBAA8\uB2D8\uACFC \uCE5C\uCC99\uB4E4\uAED8 \uC778\uC0AC\uB97C \uB4DC\uB9AC\uB294 \uC804\uD1B5 \uC608\uC2DD. \uD55C\uBCF5\uC744 \uC785\uACE0 \uD070\uC808\uC744 \uC62C\uB9AC\uACE0 \uB300\uCD94, \uBC24 \uB4F1\uC744 \uBC1B\uC74C."
  },
  {
    term: "\uD558\uAC1D\uB2F5\uB840\uD488",
    cat: "\uBE44\uC6A9",
    def: "\uACB0\uD63C\uC2DD\uC5D0 \uCC38\uC11D\uD55C \uD558\uAC1D\uC5D0\uAC8C \uAC10\uC0AC\uC758 \uB9C8\uC74C\uC744 \uB2F4\uC544 \uB4DC\uB9AC\uB294 \uC120\uBB3C. \uC2DD\uD488, \uD654\uC7A5\uD488, \uC18C\uD488 \uB4F1 \uB2E4\uC591."
  }
];
const MUSIC = [
  { title: "A Thousand Years", artist: "Christina Perri", icon: "\u{1F3B5}", badge: "\uC778\uAE30", type: "pop", mood: "\uC794\uC794\uD55C" },
  { title: "Canon in D", artist: "Johann Pachelbel", icon: "\u{1F3B6}", badge: "\uD074\uB798\uC2DD", type: "classic", mood: "\uD074\uB798\uC2DD" },
  { title: "\uADF8\uB300\uB77C\uB294 \uC2DC", artist: "\uAC70\uBBF8 & \uAE40\uC870\uD55C", icon: "\u{1F3B8}", badge: "K-\uBC1C\uB77C\uB4DC", type: "kpop", mood: "\uC794\uC794\uD55C" },
  { title: "Perfect", artist: "Ed Sheeran", icon: "\u{1F3B9}", badge: "\uD31D", type: "pop", mood: "\uC124\uB808\uB294" },
  { title: "\uC0AC\uB791\uC774\uB798", artist: "\uBC15\uD6A8\uC2E0", icon: "\u{1F3BC}", badge: "K-\uBC1C\uB77C\uB4DC", type: "kpop", mood: "\uC794\uC794\uD55C" },
  { title: "Marry You", artist: "Bruno Mars", icon: "\u{1F3A4}", badge: "\uC124\uB808\uB294", type: "pop", mood: "\uC124\uB808\uB294" }
];
const AUTH_REQUIRED_TABS = /* @__PURE__ */ new Set(["profile", "lounge", "budget"]);
const SIDE_MENUS = [
  { key: "hall", icon: "\u{1F3E0}", label: "\uD640\uC9C0\uB3C4" },
  { key: "lounge", icon: "\u{1F465}", label: "\uB300\uAE30\uC2E4" },
  { key: "budget", icon: "\u{1F4CB}", label: "\uC6B0\uB9AC\uC608\uC0B0" },
  { key: "dict", icon: "\u{1F4D6}", label: "\uC6A9\uC5B4\uC0AC\uC804" },
  { key: "music", icon: "\u{1F3B5}", label: "\uC120\uACE1\uAE30" },
  { key: "profile", icon: "\u{1F464}", label: "\uD504\uB85C\uD544" }
];
function useThemeColors() {
  return {
    /** 메인 핑크 — 버튼·활성·강조 */
    PRIMARY: "#F2728A",
    /** 중간 핑크 — 호버·세컨더리 강조 */
    PRIMARY_MID: "#E85C78",
    /** 다크 버건디 — 투톤·강한 액센트 */
    PRIMARY_DARK: "#C9325A",
    /** 서페이스/배경 — 거의 화이트 핑크 */
    PRIMARY_LT: "#FFF0F3",
    /** 소프트 핑크 — 칩·보더·비활성 배경 */
    PRIMARY_SOFT: "#FFD6E0",
    /** 다크 모드·히어로 배경용 */
    DARK_BG: "#2A1520",
    GOLD: "#C4A059",
    GOLD_LT: "#FBF6EC",
    TEXT: "#1A1A1A",
    MUTED: "#9B9B9B",
    /** 핑크 톤 보더 */
    BORDER: "#FFD6E0"
  };
}
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "SideBtn",
  __ssrInlineRender: true,
  props: {
    icon: {},
    label: {},
    active: { type: Boolean }
  },
  emits: ["click"],
  setup(__props) {
    const { PRIMARY, PRIMARY_LT, MUTED } = useThemeColors();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        style: {
          width: "56px",
          height: "56px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2px",
          cursor: "pointer",
          borderRight: __props.active ? `2px solid ${unref(PRIMARY)}` : "2px solid transparent",
          background: __props.active ? unref(PRIMARY_LT) : "transparent"
        }
      }, _attrs))}><span style="${ssrRenderStyle({ fontSize: "18px", lineHeight: 1 })}">${ssrInterpolate(__props.icon)}</span><span style="${ssrRenderStyle({
        fontSize: "9px",
        color: __props.active ? unref(PRIMARY) : unref(MUTED),
        fontWeight: 500,
        textAlign: "center",
        lineHeight: 1.2
      })}">${ssrInterpolate(__props.label)}</span></div>`);
    };
  }
});
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/SideBtn.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const HALL_DETAIL_SELECT = `
  id, name, address, phone, website_url, is_verified,
  hall_type, food_type, capacity_min, capacity_max,
  food_price_min, food_price_max,
  grade, description, detail_content,
  parking_info, total_parking, free_parking_min,
  transport, has_shuttle, elevator_info, atm_location,
  region_city, region_district, lat, lng,
  bw_hall_costs (
    target_date,
    meal_cost_min, meal_cost_max, meal_cost_text,
    rental_cost_min, rental_cost_max, rental_cost_text,
    guarantee_min, guarantee_max, guarantee_text,
    add_cost, contract_info, external_corp, source_link
  ),
  bw_hall_rooms (
    name, type, interval_text, feature,
    mood, bride_room, guarantee_min, guarantee_max,
    capacity, source_link
  ),
  bw_hall_dinings (
    food_type, menu_info, capacity, family_room,
    review_score, taste_pros, taste_cons, source_link
  ),
  bw_hall_sources (
    id, source_type, title, summary, url, published_at
  )
`.replace(/\s+/g, " ");
function useHallDetail() {
  const supabase = useSupabaseClient();
  async function fetchHallDetail(hallId) {
    try {
      const { data, error } = await supabase.from("bw_halls").select(HALL_DETAIL_SELECT).eq("id", hallId).eq("status", "active").maybeSingle();
      if (error) throw error;
      if (!data) {
        return { hall: null, error: new Error("\uD640\uC744 \uCC3E\uC744 \uC218 \uC5C6\uAC70\uB098 \uBE44\uACF5\uAC1C\uC785\uB2C8\uB2E4.") };
      }
      return { hall: data, error: null };
    } catch (e) {
      return {
        hall: null,
        error: e instanceof Error ? e : new Error(String(e))
      };
    }
  }
  async function fetchRegionAvgFoodMid(regionCity) {
    var _a, _b;
    if (!(regionCity == null ? void 0 : regionCity.trim())) return null;
    try {
      const { data, error } = await supabase.from("bw_halls").select("food_price_min, food_price_max").eq("region_city", regionCity).eq("status", "active").not("food_price_min", "is", null);
      if (error) throw error;
      const rows = data != null ? data : [];
      if (rows.length === 0) return null;
      let sum = 0;
      for (const h of rows) {
        const r = h;
        const lo = (_a = r.food_price_min) != null ? _a : 0;
        const hi = (_b = r.food_price_max) != null ? _b : lo;
        sum += (lo + hi) / 2;
      }
      return sum / rows.length;
    } catch {
      return null;
    }
  }
  return { fetchHallDetail, fetchRegionAvgFoodMid };
}
function resolveFoodWonRange(hall, detail) {
  var _a, _b, _c, _d, _e;
  const costs = (_a = detail == null ? void 0 : detail.bw_hall_costs) == null ? void 0 : _a[0];
  const min = (_c = (_b = detail == null ? void 0 : detail.food_price_min) != null ? _b : costs == null ? void 0 : costs.meal_cost_min) != null ? _c : typeof hall.foodMin === "number" ? hall.foodMin * 1e4 : null;
  const max = (_e = (_d = detail == null ? void 0 : detail.food_price_max) != null ? _d : costs == null ? void 0 : costs.meal_cost_max) != null ? _e : typeof hall.foodMax === "number" ? hall.foodMax * 1e4 : null;
  return { min: min != null ? min : null, max: max != null ? max : null };
}
function resolveGuaranteeRange(hall, detail) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const costs = (_a = detail == null ? void 0 : detail.bw_hall_costs) == null ? void 0 : _a[0];
  const rooms = (_b = detail == null ? void 0 : detail.bw_hall_rooms) == null ? void 0 : _b[0];
  return {
    min: (_e = (_d = (_c = detail == null ? void 0 : detail.capacity_min) != null ? _c : costs == null ? void 0 : costs.guarantee_min) != null ? _d : rooms == null ? void 0 : rooms.guarantee_min) != null ? _e : typeof hall.minPpl === "number" ? hall.minPpl : null,
    max: (_h = (_g = (_f = detail == null ? void 0 : detail.capacity_max) != null ? _f : costs == null ? void 0 : costs.guarantee_max) != null ? _g : rooms == null ? void 0 : rooms.guarantee_max) != null ? _h : typeof hall.maxPpl === "number" ? hall.maxPpl : null
  };
}
const SOURCE_LABEL = {
  "iwedding.co.kr": "\uC544\uC774\uC6E8\uB529",
  "directwedding.co.kr": "\uB2E4\uC774\uB809\uD2B8\uC6E8\uB529",
  smartwedding: "\uC2A4\uB9C8\uD2B8\uC6E8\uB529",
  "barrowed.co.kr": "barrowed",
  "blog.naver.com": "\uB124\uC774\uBC84 \uBE14\uB85C\uADF8",
  "tistory.com": "tistory",
  "weddingbook.com": "\uC6E8\uB529\uBD81"
};
const SOURCE_ORDER = Object.keys(SOURCE_LABEL);
function labelsFromSourceLink(sourceLink) {
  if (!(sourceLink == null ? void 0 : sourceLink.trim())) return [];
  const out = [];
  for (const key of SOURCE_ORDER) {
    if (sourceLink.includes(key)) out.push(SOURCE_LABEL[key]);
  }
  return out;
}
function sourceTypeLabel(t) {
  var _a;
  if (!t) return "\uC678\uBD80";
  const map = {
    naver_blog: "\uB124\uC774\uBC84 \uBE14\uB85C\uADF8",
    tistory: "tistory",
    iwedding: "\uC544\uC774\uC6E8\uB529",
    directwedding: "\uB2E4\uC774\uB809\uD2B8\uC6E8\uB529",
    other: "\uC678\uBD80"
  };
  return (_a = map[t]) != null ? _a : t;
}
function wonToManwon(won) {
  if (won == null || !Number.isFinite(won)) return null;
  return Math.round(won / 1e4);
}
function formatManwonRange(minWon, maxWon) {
  const a = wonToManwon(minWon != null ? minWon : void 0);
  const b = wonToManwon(maxWon != null ? maxWon : void 0);
  if (a != null && b != null) return `${a}~${b} \uB9CC\uC6D0`;
  if (a != null) return `${a} \uB9CC\uC6D0~`;
  if (b != null) return `~${b} \uB9CC\uC6D0`;
  return null;
}
function displayUrlHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.slice(0, 40);
  }
}
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "HallDetail",
  __ssrInlineRender: true,
  props: {
    hall: {}
  },
  emits: ["back"],
  setup(__props) {
    const { PRIMARY, PRIMARY_SOFT, TEXT, MUTED, BORDER } = useThemeColors();
    useAuthModal();
    useSupabaseUser();
    const props = __props;
    const { fetchHallDetail, fetchRegionAvgFoodMid } = useHallDetail();
    const detail = ref(null);
    const loadError = ref(null);
    const regionAvgMid = ref(null);
    const isUuid = computed(() => typeof props.hall.id === "string");
    const activeRoomTab = ref(0);
    async function loadDetail() {
      if (!isUuid.value) {
        detail.value = null;
        regionAvgMid.value = null;
        loadError.value = null;
        return;
      }
      const { hall, error } = await fetchHallDetail(props.hall.id);
      if (error) {
        loadError.value = error.message;
        detail.value = null;
        return;
      }
      loadError.value = null;
      detail.value = hall;
      activeRoomTab.value = 0;
      if (hall == null ? void 0 : hall.region_city) {
        regionAvgMid.value = await fetchRegionAvgFoodMid(hall.region_city);
      } else {
        regionAvgMid.value = null;
      }
    }
    watch(
      () => props.hall.id,
      () => {
        loadDetail();
      },
      { immediate: true }
    );
    const addressLine = computed(() => {
      var _a, _b, _c;
      const a = (_b = (_a = detail.value) == null ? void 0 : _a.address) == null ? void 0 : _b.trim();
      if (a) return a;
      return ((_c = props.hall.location) == null ? void 0 : _c.trim()) || "";
    });
    const foodWon = computed(() => resolveFoodWonRange(props.hall, detail.value));
    const foodManwonLabel = computed(
      () => formatManwonRange(foodWon.value.min, foodWon.value.max)
    );
    const foodMidWon = computed(() => {
      const { min, max } = foodWon.value;
      if (min == null && max == null) return null;
      return ((min != null ? min : 0) + (max != null ? max : 0)) / 2;
    });
    const diffPct = computed(() => {
      if (foodMidWon.value == null || regionAvgMid.value == null) return null;
      if (regionAvgMid.value === 0) return null;
      return Math.round(
        (foodMidWon.value - regionAvgMid.value) / regionAvgMid.value * 100
      );
    });
    const guarantee = computed(() => resolveGuaranteeRange(props.hall, detail.value));
    const guaranteeLabel = computed(() => {
      const { min, max } = guarantee.value;
      if (min != null && max != null) return `${min}~${max}\uBA85`;
      if (min != null) return `${min}\uBA85~`;
      if (max != null) return `~${max}\uBA85`;
      return null;
    });
    const rooms = computed(() => {
      var _a, _b;
      return (_b = (_a = detail.value) == null ? void 0 : _a.bw_hall_rooms) != null ? _b : [];
    });
    const currentRoom = computed(() => {
      var _a;
      return (_a = rooms.value[activeRoomTab.value]) != null ? _a : null;
    });
    const costs = computed(() => {
      var _a, _b;
      return (_b = (_a = detail.value) == null ? void 0 : _a.bw_hall_costs) != null ? _b : [];
    });
    const dinings = computed(() => {
      var _a, _b;
      return (_b = (_a = detail.value) == null ? void 0 : _a.bw_hall_dinings) != null ? _b : [];
    });
    const sources = computed(() => {
      var _a, _b;
      return (_b = (_a = detail.value) == null ? void 0 : _a.bw_hall_sources) != null ? _b : [];
    });
    function sourceBadgeCount(link) {
      return labelsFromSourceLink(link).length;
    }
    const showEstimate = computed(
      () => Boolean(foodManwonLabel.value) || diffPct.value != null || Boolean(guaranteeLabel.value)
    );
    const showRoomSection = computed(() => {
      var _a, _b;
      if (rooms.value.length > 0) return true;
      const dc = (_b = (_a = detail.value) == null ? void 0 : _a.detail_content) == null ? void 0 : _b.trim();
      return Boolean(dc);
    });
    const showDiningSection = computed(() => {
      var _a, _b, _c;
      if (dinings.value.length > 0) return true;
      const ft = (_c = (_b = (_a = detail.value) == null ? void 0 : _a.food_type) == null ? void 0 : _b[0]) != null ? _c : props.hall.food;
      return Boolean(ft == null ? void 0 : ft.trim());
    });
    const showTransportSection = computed(() => {
      const d = detail.value;
      if (!d && !isUuid.value) return false;
      return Boolean(
        (d == null ? void 0 : d.total_parking) != null || (d == null ? void 0 : d.free_parking_min) != null || (d == null ? void 0 : d.parking_info) && d.parking_info.trim() || (d == null ? void 0 : d.transport) && d.transport.trim() || (d == null ? void 0 : d.has_shuttle) === true || (d == null ? void 0 : d.elevator_info) && d.elevator_info.trim() || (d == null ? void 0 : d.atm_location) && d.atm_location.trim()
      );
    });
    const showCostSection = computed(() => costs.value.length > 0);
    const showContractSection = computed(
      () => costs.value.some(
        (c) => c.contract_info && c.contract_info.trim() || c.external_corp && c.external_corp.trim()
      )
    );
    const showSourcesSection = computed(() => sources.value.length > 0);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R, _S;
      _push(`<div${ssrRenderAttrs(mergeProps({ style: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "auto"
      } }, _attrs))}><div style="${ssrRenderStyle({
        padding: "10px 16px",
        borderBottom: `1px solid ${unref(BORDER)}`,
        fontSize: "13px",
        color: unref(PRIMARY),
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0
      })}"><span style="${ssrRenderStyle({ cursor: "pointer" })}">\u2190 \uBAA9\uB85D\uC73C\uB85C</span><div style="${ssrRenderStyle({ display: "flex", gap: "12px", alignItems: "center" })}"><span style="${ssrRenderStyle({ fontSize: "18px", cursor: "pointer", color: unref(MUTED) })}" title="\uAD00\uC2EC\uD640">\u2661</span><span style="${ssrRenderStyle({ fontSize: "18px", cursor: "pointer", color: unref(MUTED) })}" title="\uB098\uC758\uD640">\u2606</span></div></div>`);
      if (unref(loadError)) {
        _push(`<p style="${ssrRenderStyle({ padding: "8px 16px", fontSize: "12px", color: "#c00", margin: 0 })}"> \uC0C1\uC138 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. ${ssrInterpolate(unref(loadError))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div style="${ssrRenderStyle({
        padding: "16px 16px 12px",
        borderBottom: `1px solid ${unref(BORDER)}`,
        flexShrink: 0
      })}"><div style="${ssrRenderStyle({
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: "6px"
      })}"><div><div style="${ssrRenderStyle({ fontSize: "20px", fontWeight: 700, color: unref(TEXT), marginBottom: "4px" })}">${ssrInterpolate((_b = (_a = unref(detail)) == null ? void 0 : _a.name) != null ? _b : __props.hall.name)}</div><div style="${ssrRenderStyle({ fontSize: "12px", color: unref(MUTED) })}">${ssrInterpolate(unref(addressLine) || "\uC8FC\uC18C \uC815\uBCF4 \uC5C6\uC74C")}</div></div></div>`);
      if (((_d = (_c = unref(detail)) == null ? void 0 : _c.phone) != null ? _d : __props.hall.phone) && ((_f = (_e = unref(detail)) == null ? void 0 : _e.phone) != null ? _f : __props.hall.phone) !== "\uBB38\uC758") {
        _push(`<div style="${ssrRenderStyle({ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" })}"><span style="${ssrRenderStyle({ fontSize: "12px", color: unref(PRIMARY) })}">\u{1F4DE} ${ssrInterpolate((_h = (_g = unref(detail)) == null ? void 0 : _g.phone) != null ? _h : __props.hall.phone)}</span>`);
        if ((_j = (_i = unref(detail)) == null ? void 0 : _i.website_url) == null ? void 0 : _j.trim()) {
          _push(`<a${ssrRenderAttr("href", unref(detail).website_url)} target="_blank" rel="noopener noreferrer" style="${ssrRenderStyle({ fontSize: "12px", color: unref(MUTED) })}">\u{1F310} \uD648\uD398\uC774\uC9C0</a>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<span style="${ssrRenderStyle({
          fontSize: "11px",
          padding: "2px 8px",
          borderRadius: "4px",
          border: `1px solid ${unref(BORDER)}`,
          color: unref(MUTED)
        })}">${ssrInterpolate(((_k = unref(detail)) == null ? void 0 : _k.is_verified) ? "\uC5C5\uCCB4\uC778\uC99D" : "\uC5C5\uCCB4\uC778\uC99D\uC804")}</span></div>`);
      } else {
        _push(`<div style="${ssrRenderStyle({ marginBottom: "8px" })}">`);
        if ((_m = (_l = unref(detail)) == null ? void 0 : _l.website_url) == null ? void 0 : _m.trim()) {
          _push(`<a${ssrRenderAttr("href", unref(detail).website_url)} target="_blank" rel="noopener noreferrer" style="${ssrRenderStyle({ fontSize: "12px", color: unref(MUTED) })}">\u{1F310} \uD648\uD398\uC774\uC9C0</a>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<span style="${ssrRenderStyle({
          fontSize: "11px",
          padding: "2px 8px",
          borderRadius: "4px",
          border: `1px solid ${unref(BORDER)}`,
          color: unref(MUTED),
          marginLeft: "8px"
        })}">${ssrInterpolate(((_n = unref(detail)) == null ? void 0 : _n.is_verified) ? "\uC5C5\uCCB4\uC778\uC99D" : "\uC5C5\uCCB4\uC778\uC99D\uC804")}</span></div>`);
      }
      _push(`<button type="button" style="${ssrRenderStyle({
        width: "100%",
        padding: "10px 0",
        background: unref(PRIMARY),
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px"
      })}"><span>\u{1F4AC}</span> \uC608\uBE44\uBD80\uBD80 \uB300\uAE30\uC2E4 \uC774\uB3D9 </button></div>`);
      if (unref(showEstimate)) {
        _push(`<div style="${ssrRenderStyle({
          padding: "14px 16px",
          borderBottom: `1px solid ${unref(BORDER)}`,
          flexShrink: 0
        })}"><div style="${ssrRenderStyle({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px"
        })}"><span style="${ssrRenderStyle({ fontSize: "13px", fontWeight: 600, color: unref(TEXT) })}">\u2261 \uC608\uC0C1 \uACAC\uC801</span>`);
        if (((_o = unref(costs)[0]) == null ? void 0 : _o.source_link) && sourceBadgeCount(unref(costs)[0].source_link) > 0) {
          _push(`<span style="${ssrRenderStyle({ fontSize: "11px", color: unref(PRIMARY) })}">${ssrInterpolate(unref(labelsFromSourceLink)(unref(costs)[0].source_link)[0])} +${ssrInterpolate(Math.max(0, sourceBadgeCount(unref(costs)[0].source_link) - 1))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(foodManwonLabel)) {
          _push(`<div style="${ssrRenderStyle({
            background: "#FAFBFF",
            borderRadius: "8px",
            padding: "12px 14px",
            marginBottom: "8px"
          })}"><div style="${ssrRenderStyle({ fontSize: "11px", color: unref(MUTED), marginBottom: "4px" })}">\uC2DD\uB300 (1\uC778)</div><div style="${ssrRenderStyle({ display: "flex", justifyContent: "space-between", alignItems: "flex-end" })}"><div><div style="${ssrRenderStyle({ fontSize: "22px", fontWeight: 700, color: unref(TEXT) })}">${ssrInterpolate(unref(foodManwonLabel))}</div>`);
          if (unref(diffPct) != null) {
            _push(`<div style="${ssrRenderStyle({ fontSize: "11px", color: unref(MUTED), marginTop: "2px" })}"> \uC9C0\uC5ED \uD3C9\uADE0 \uB300\uBE44 \uC57D ${ssrInterpolate(Math.abs(unref(diffPct)))}% ${ssrInterpolate(unref(diffPct) < 0 ? "\uC800\uB834" : "\uBE44\uC308")}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><svg width="70" height="38" viewBox="0 0 70 38" aria-hidden="true"><path d="M5,32 C15,32 20,8 35,6 C50,4 55,32 65,32"${ssrRenderAttr("stroke", unref(PRIMARY))} stroke-width="2" fill="none" stroke-linecap="round"></path><line x1="35" y1="6" x2="35" y2="34"${ssrRenderAttr("stroke", unref(PRIMARY))} stroke-width="1" stroke-dasharray="2,2"></line><circle cx="35" cy="34" r="3"${ssrRenderAttr("fill", unref(PRIMARY))}></circle></svg></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(guaranteeLabel)) {
          _push(`<div style="${ssrRenderStyle({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" })}"><span style="${ssrRenderStyle({ fontSize: "13px", color: unref(TEXT) })}">\uBCF4\uC99D\uC778\uC6D0</span><span style="${ssrRenderStyle({ fontSize: "14px", fontWeight: 600, color: unref(PRIMARY) })}">${ssrInterpolate(unref(guaranteeLabel))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showRoomSection)) {
        _push(`<div style="${ssrRenderStyle({
          padding: "14px 16px",
          borderBottom: `1px solid ${unref(BORDER)}`,
          flexShrink: 0
        })}"><div style="${ssrRenderStyle({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px"
        })}"><span style="${ssrRenderStyle({ fontSize: "13px", fontWeight: 600, color: unref(TEXT) })}">\u{1F3DB} \uD640 \uCEE8\uB514\uC158</span>`);
        if (((_p = unref(currentRoom)) == null ? void 0 : _p.source_link) && sourceBadgeCount(unref(currentRoom).source_link) > 0) {
          _push(`<span style="${ssrRenderStyle({ fontSize: "11px", color: unref(PRIMARY) })}">${ssrInterpolate(unref(labelsFromSourceLink)(unref(currentRoom).source_link)[0])} +${ssrInterpolate(Math.max(0, sourceBadgeCount(unref(currentRoom).source_link) - 1))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(rooms).length > 1) {
          _push(`<div style="${ssrRenderStyle({ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" })}"><!--[-->`);
          ssrRenderList(unref(rooms), (r, idx) => {
            _push(`<button type="button" style="${ssrRenderStyle({
              fontSize: "11px",
              padding: "4px 10px",
              borderRadius: "99px",
              border: `1px solid ${unref(BORDER)}`,
              background: unref(activeRoomTab) === idx ? unref(PRIMARY_SOFT) : "#fff",
              color: unref(activeRoomTab) === idx ? unref(PRIMARY) : unref(MUTED),
              cursor: "pointer"
            })}">${ssrInterpolate(r.name || `\uD640 ${idx + 1}`)}</button>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(currentRoom)) {
          _push(`<!--[-->`);
          if ((_q = unref(currentRoom).name) == null ? void 0 : _q.trim()) {
            _push(`<div style="${ssrRenderStyle({ fontSize: "15px", fontWeight: 600, color: unref(TEXT), marginBottom: "6px" })}">${ssrInterpolate(unref(currentRoom).name)}</div>`);
          } else {
            _push(`<!---->`);
          }
          if (((_r = unref(currentRoom).feature) == null ? void 0 : _r.trim()) || ((_t = (_s = unref(detail)) == null ? void 0 : _s.detail_content) == null ? void 0 : _t.trim())) {
            _push(`<div style="${ssrRenderStyle({ fontSize: "13px", color: "#555", lineHeight: 1.7, marginBottom: "8px" })}">${ssrInterpolate(((_u = unref(currentRoom).feature) == null ? void 0 : _u.trim()) || ((_v = unref(detail)) == null ? void 0 : _v.detail_content))}</div>`);
          } else {
            _push(`<!---->`);
          }
          if ((_w = unref(currentRoom).mood) == null ? void 0 : _w.trim()) {
            _push(`<div style="${ssrRenderStyle({ fontSize: "12px", color: unref(MUTED), marginBottom: "6px" })}"> \uBD84\uC704\uAE30: ${ssrInterpolate(unref(currentRoom).mood)}</div>`);
          } else {
            _push(`<!---->`);
          }
          if ((_x = unref(currentRoom).bride_room) == null ? void 0 : _x.trim()) {
            _push(`<div style="${ssrRenderStyle({ fontSize: "12px", color: unref(PRIMARY), lineHeight: 1.6, marginBottom: "8px" })}">${ssrInterpolate(unref(currentRoom).bride_room)}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        } else if ((_z = (_y = unref(detail)) == null ? void 0 : _y.detail_content) == null ? void 0 : _z.trim()) {
          _push(`<div style="${ssrRenderStyle({ fontSize: "13px", color: "#555", lineHeight: 1.7 })}">${ssrInterpolate(unref(detail).detail_content)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if ((_D = (_B = (_A = unref(detail)) == null ? void 0 : _A.tags) == null ? void 0 : _B.length) != null ? _D : (_C = __props.hall.tags) == null ? void 0 : _C.length) {
          _push(`<div style="${ssrRenderStyle({ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" })}"><!--[-->`);
          ssrRenderList((_F = (_E = unref(detail)) == null ? void 0 : _E.tags) != null ? _F : __props.hall.tags, (t) => {
            _push(`<span style="${ssrRenderStyle({
              fontSize: "11px",
              padding: "3px 10px",
              borderRadius: "99px",
              background: "#F0F2FF",
              color: unref(PRIMARY),
              fontWeight: 500
            })}"> #${ssrInterpolate(t)}</span>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showDiningSection)) {
        _push(`<div style="${ssrRenderStyle({
          padding: "14px 16px",
          borderBottom: `1px solid ${unref(BORDER)}`,
          flexShrink: 0
        })}"><div style="${ssrRenderStyle({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px"
        })}"><span style="${ssrRenderStyle({ fontSize: "13px", fontWeight: 600, color: unref(TEXT) })}">\u{1F37D}\uFE0F \uC2DD\uC0AC \uBC0F \uD3C9\uAC00</span>`);
        if (((_G = unref(dinings)[0]) == null ? void 0 : _G.source_link) && sourceBadgeCount(unref(dinings)[0].source_link) > 0) {
          _push(`<span style="${ssrRenderStyle({ fontSize: "11px", color: unref(PRIMARY) })}">${ssrInterpolate(unref(labelsFromSourceLink)(unref(dinings)[0].source_link)[0])} +${ssrInterpolate(Math.max(0, sourceBadgeCount(unref(dinings)[0].source_link) - 1))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><!--[-->`);
        ssrRenderList(unref(dinings).length ? unref(dinings) : [null], (d, di) => {
          var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j2, _k2, _l2, _m2, _n2;
          _push(`<div style="${ssrRenderStyle({ marginBottom: unref(dinings).length > 1 ? "14px" : "0" })}">`);
          if (((_a2 = d == null ? void 0 : d.food_type) == null ? void 0 : _a2.trim()) || !d && (((_c2 = (_b2 = unref(detail)) == null ? void 0 : _b2.food_type) == null ? void 0 : _c2[0]) || __props.hall.food)) {
            _push(`<div style="${ssrRenderStyle({ fontSize: "14px", fontWeight: 600, color: unref(TEXT), marginBottom: "6px" })}">${ssrInterpolate(((_d2 = d == null ? void 0 : d.food_type) == null ? void 0 : _d2.trim()) || ((_f2 = (_e2 = unref(detail)) == null ? void 0 : _e2.food_type) == null ? void 0 : _f2[0]) || __props.hall.food)}</div>`);
          } else {
            _push(`<!---->`);
          }
          if ((_g2 = d == null ? void 0 : d.menu_info) == null ? void 0 : _g2.trim()) {
            _push(`<div style="${ssrRenderStyle({ fontSize: "13px", color: "#555", lineHeight: 1.7, marginBottom: "6px" })}">${ssrInterpolate(d.menu_info)}</div>`);
          } else {
            _push(`<!---->`);
          }
          if ((_h2 = d == null ? void 0 : d.family_room) == null ? void 0 : _h2.trim()) {
            _push(`<div style="${ssrRenderStyle({ fontSize: "12px", color: unref(MUTED), marginBottom: "4px" })}"> \uD63C\uC8FC \uC2DD\uC0AC\uB8F8: ${ssrInterpolate(d.family_room)}</div>`);
          } else {
            _push(`<!---->`);
          }
          if ((d == null ? void 0 : d.review_score) != null) {
            _push(`<div style="${ssrRenderStyle({ fontSize: "12px", color: unref(TEXT), marginBottom: "4px" })}"> \uBCC4\uC810 ${ssrInterpolate(d.review_score)}</div>`);
          } else {
            _push(`<!---->`);
          }
          if (((_i2 = d == null ? void 0 : d.taste_pros) == null ? void 0 : _i2.trim()) || ((_j2 = d == null ? void 0 : d.taste_cons) == null ? void 0 : _j2.trim())) {
            _push(`<div style="${ssrRenderStyle({
              fontSize: "12px",
              color: "#555",
              lineHeight: 1.6,
              padding: "8px 10px",
              background: "#FAFBFF",
              borderRadius: "8px",
              border: `1px solid ${unref(BORDER)}`
            })}">`);
            if ((_k2 = d == null ? void 0 : d.taste_pros) == null ? void 0 : _k2.trim()) {
              _push(`<!--[-->+ ${ssrInterpolate(d.taste_pros)}<!--]-->`);
            } else {
              _push(`<!---->`);
            }
            if (((_l2 = d == null ? void 0 : d.taste_pros) == null ? void 0 : _l2.trim()) && ((_m2 = d == null ? void 0 : d.taste_cons) == null ? void 0 : _m2.trim())) {
              _push(`<br>`);
            } else {
              _push(`<!---->`);
            }
            if ((_n2 = d == null ? void 0 : d.taste_cons) == null ? void 0 : _n2.trim()) {
              _push(`<!--[-->\u2212 ${ssrInterpolate(d.taste_cons)}<!--]-->`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showTransportSection)) {
        _push(`<div style="${ssrRenderStyle({
          padding: "14px 16px",
          borderBottom: `1px solid ${unref(BORDER)}`,
          flexShrink: 0
        })}"><div style="${ssrRenderStyle({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px"
        })}"><span style="${ssrRenderStyle({ fontSize: "13px", fontWeight: 600, color: unref(TEXT) })}">\u{1F697} \uAD50\uD1B5 \uBC0F \uC8FC\uCC28</span></div><div style="${ssrRenderStyle({ display: "flex", gap: "10px", flexWrap: "wrap" })}"><div style="${ssrRenderStyle({
          flex: "1 1 140px",
          padding: "10px 12px",
          borderRadius: "8px",
          border: `1px solid ${unref(BORDER)}`,
          background: "#FAFBFF"
        })}"><div style="${ssrRenderStyle({ fontSize: "12px", fontWeight: 600, color: unref(TEXT), marginBottom: "4px" })}"> \uC8FC\uCC28 `);
        if (((_H = unref(detail)) == null ? void 0 : _H.total_parking) != null) {
          _push(`<!--[--> (${ssrInterpolate(unref(detail).total_parking)}\uB300)<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (((_I = unref(detail)) == null ? void 0 : _I.free_parking_min) != null) {
          _push(`<div style="${ssrRenderStyle({ fontSize: "12px", color: unref(MUTED) })}">${ssrInterpolate(unref(detail).free_parking_min)}\uBD84 \uBB34\uB8CC </div>`);
        } else {
          _push(`<!---->`);
        }
        if ((_K = (_J = unref(detail)) == null ? void 0 : _J.parking_info) == null ? void 0 : _K.trim()) {
          _push(`<div style="${ssrRenderStyle({ fontSize: "12px", color: "#555", lineHeight: 1.6, marginTop: "4px" })}">${ssrInterpolate(unref(detail).parking_info)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div style="${ssrRenderStyle({
          flex: "1 1 140px",
          padding: "10px 12px",
          borderRadius: "8px",
          border: `1px solid ${unref(BORDER)}`,
          background: "#FAFBFF"
        })}"><div style="${ssrRenderStyle({ fontSize: "12px", fontWeight: 600, color: unref(TEXT), marginBottom: "4px" })}"> \uB300\uC911\uAD50\uD1B5 \xB7 \uAE30\uD0C0 </div>`);
        if ((_M = (_L = unref(detail)) == null ? void 0 : _L.transport) == null ? void 0 : _M.trim()) {
          _push(`<div style="${ssrRenderStyle({ fontSize: "12px", color: "#555", lineHeight: 1.6 })}">${ssrInterpolate(unref(detail).transport)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (((_N = unref(detail)) == null ? void 0 : _N.has_shuttle) === true) {
          _push(`<div style="${ssrRenderStyle({ fontSize: "12px", color: unref(MUTED), marginTop: "4px" })}"> \uC154\uD2C0 \uC6B4\uD589 </div>`);
        } else {
          _push(`<!---->`);
        }
        if ((_P = (_O = unref(detail)) == null ? void 0 : _O.elevator_info) == null ? void 0 : _P.trim()) {
          _push(`<div style="${ssrRenderStyle({ fontSize: "12px", color: "#555", marginTop: "4px" })}"> \uC5D8\uB9AC\uBCA0\uC774\uD130: ${ssrInterpolate(unref(detail).elevator_info)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if ((_R = (_Q = unref(detail)) == null ? void 0 : _Q.atm_location) == null ? void 0 : _R.trim()) {
          _push(`<div style="${ssrRenderStyle({ fontSize: "12px", color: unref(MUTED), marginTop: "4px" })}"> ATM: ${ssrInterpolate(unref(detail).atm_location)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showCostSection)) {
        _push(`<div style="${ssrRenderStyle({
          padding: "14px 16px",
          borderBottom: `1px solid ${unref(BORDER)}`,
          flexShrink: 0
        })}"><div style="${ssrRenderStyle({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px"
        })}"><span style="${ssrRenderStyle({ fontSize: "13px", fontWeight: 600, color: unref(TEXT) })}">\uBE44\uC6A9 \uC815\uBCF4 (\uC2DD\uB300\xB7\uBCF4\uC99D\xB7\uB300\uAD00\uB8CC)</span>`);
        if (((_S = unref(costs)[0]) == null ? void 0 : _S.source_link) && sourceBadgeCount(unref(costs)[0].source_link) > 0) {
          _push(`<span style="${ssrRenderStyle({ fontSize: "11px", color: unref(PRIMARY) })}">${ssrInterpolate(unref(labelsFromSourceLink)(unref(costs)[0].source_link)[0])} +${ssrInterpolate(Math.max(0, sourceBadgeCount(unref(costs)[0].source_link) - 1))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><!--[-->`);
        ssrRenderList(unref(costs), (c, ci) => {
          var _a2, _b2, _c2, _d2, _e2;
          _push(`<div style="${ssrRenderStyle({ marginBottom: "12px" })}">`);
          if ((_a2 = c.target_date) == null ? void 0 : _a2.trim()) {
            _push(`<div style="${ssrRenderStyle({ fontSize: "11px", color: unref(MUTED), marginBottom: "4px" })}"> \uAE30\uC900: ${ssrInterpolate(c.target_date)}</div>`);
          } else {
            _push(`<!---->`);
          }
          if ((_b2 = c.meal_cost_text) == null ? void 0 : _b2.trim()) {
            _push(`<div style="${ssrRenderStyle({ fontSize: "13px", color: "#555", marginBottom: "4px" })}"> \uC2DD\uB300: ${ssrInterpolate(c.meal_cost_text)}</div>`);
          } else {
            _push(`<!---->`);
          }
          if ((_c2 = c.guarantee_text) == null ? void 0 : _c2.trim()) {
            _push(`<div style="${ssrRenderStyle({ fontSize: "13px", color: "#555", marginBottom: "4px" })}"> \uBCF4\uC99D: ${ssrInterpolate(c.guarantee_text)}</div>`);
          } else {
            _push(`<!---->`);
          }
          if ((_d2 = c.rental_cost_text) == null ? void 0 : _d2.trim()) {
            _push(`<div style="${ssrRenderStyle({ fontSize: "13px", color: "#555", marginBottom: "4px" })}"> \uB300\uAD00\uB8CC: ${ssrInterpolate(c.rental_cost_text)} `);
            if (c.rental_cost_min != null || c.rental_cost_max != null) {
              _push(`<!--[--> (${ssrInterpolate(unref(formatManwonRange)(c.rental_cost_min, c.rental_cost_max))}) <!--]-->`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          } else if (c.rental_cost_min != null || c.rental_cost_max != null) {
            _push(`<div style="${ssrRenderStyle({ fontSize: "13px", color: "#555" })}"> \uB300\uAD00\uB8CC: ${ssrInterpolate(unref(formatManwonRange)(c.rental_cost_min, c.rental_cost_max))}</div>`);
          } else {
            _push(`<!---->`);
          }
          if ((_e2 = c.add_cost) == null ? void 0 : _e2.trim()) {
            _push(`<div style="${ssrRenderStyle({ fontSize: "12px", color: unref(MUTED), marginTop: "4px" })}"> \uCD94\uAC00 \uBE44\uC6A9: ${ssrInterpolate(c.add_cost)}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showContractSection)) {
        _push(`<div style="${ssrRenderStyle({
          padding: "14px 16px",
          borderBottom: `1px solid ${unref(BORDER)}`,
          flexShrink: 0
        })}"><div style="${ssrRenderStyle({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px"
        })}"><span style="${ssrRenderStyle({ fontSize: "13px", fontWeight: 600, color: unref(TEXT) })}">\uACC4\uC57D \uC815\uBCF4</span></div><!--[-->`);
        ssrRenderList(unref(costs), (c, ci) => {
          var _a2, _b2;
          _push(`<div>`);
          if ((_a2 = c.contract_info) == null ? void 0 : _a2.trim()) {
            _push(`<div style="${ssrRenderStyle({ fontSize: "13px", color: "#555", lineHeight: 1.7, marginBottom: "8px" })}">${ssrInterpolate(c.contract_info)}</div>`);
          } else {
            _push(`<!---->`);
          }
          if ((_b2 = c.external_corp) == null ? void 0 : _b2.trim()) {
            _push(`<div style="${ssrRenderStyle({ fontSize: "12px", color: unref(MUTED) })}"> \uC678\uBD80\uC5C5\uCCB4: ${ssrInterpolate(c.external_corp)}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div style="${ssrRenderStyle({
        padding: "12px 16px",
        borderBottom: `1px solid ${unref(BORDER)}`,
        background: "#FFF8F9",
        flexShrink: 0
      })}"><div style="${ssrRenderStyle({ fontSize: "12px", color: unref(MUTED), lineHeight: 1.6 })}"> \u{1F4A1} \uC218\uC9D1\uB41C \uC815\uBCF4\uC5D0 \uC2E4\uC218\uAC00 \uC788\uC744 \uC218 \uC788\uC5B4\uC694. \uBC29\uBB38 \uC804 \uC0C1\uC138 \uC870\uAC74\uC744 \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694. </div></div>`);
      if (unref(showSourcesSection)) {
        _push(`<div style="${ssrRenderStyle({ padding: "14px 16px", flexShrink: 0 })}"><div style="${ssrRenderStyle({ fontSize: "13px", fontWeight: 600, color: unref(TEXT), marginBottom: "10px" })}"> \uCD9C\uCC98 \uB9C1\uD06C </div><!--[-->`);
        ssrRenderList(unref(sources), (s, si) => {
          var _a2;
          _push(`<a${ssrRenderAttr("href", s.url)} target="_blank" rel="noopener noreferrer" style="${ssrRenderStyle({
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            padding: "8px 0",
            borderBottom: si < unref(sources).length - 1 ? `1px solid ${unref(BORDER)}` : "none",
            textDecoration: "none",
            color: unref(TEXT)
          })}"><span style="${ssrRenderStyle({ fontSize: "11px", color: unref(PRIMARY), flexShrink: 0, minWidth: "88px" })}">${ssrInterpolate(unref(sourceTypeLabel)(s.source_type))}</span><span style="${ssrRenderStyle({ fontSize: "13px", flex: 1, lineHeight: 1.4 })}">${ssrInterpolate(((_a2 = s.title) == null ? void 0 : _a2.trim()) || unref(displayUrlHost)(s.url))}</span><span style="${ssrRenderStyle({ color: unref(MUTED), flexShrink: 0 })}">\u2197</span></a>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/hall/HallDetail.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const HALL_TYPE_CONFIG = {
  \uC6E8\uB529\uD640: {
    label: "\uC6E8\uB529\uD640",
    bg: "#5B7BF5",
    // 인디고 블루
    text: "#ffffff"
  },
  "\uCEE8\uBCA4\uC158 \uC6E8\uB529\uD640": {
    label: "\uCEE8\uBCA4\uC158",
    bg: "#E8543A",
    // 코랄 레드
    text: "#ffffff"
  },
  "\uD638\uD154 \uC6E8\uB529\uD640": {
    label: "\uD638\uD154",
    bg: "#9B59B6",
    // 퍼플
    text: "#ffffff"
  },
  "\uC57C\uC678 \uC6E8\uB529\uD640": {
    label: "\uC57C\uC678",
    bg: "#27AE60",
    // 그린
    text: "#ffffff"
  },
  "\uCC44\uD50C \uC6E8\uB529\uD640": {
    label: "\uCC44\uD50C",
    bg: "#795548",
    // 브라운
    text: "#ffffff"
  },
  "\uD55C\uC625 \uC6E8\uB529\uD640": {
    label: "\uD55C\uC625",
    bg: "#D35400",
    // 번트 오렌지
    text: "#ffffff"
  },
  "\uBCF5\uD569 \uC6E8\uB529\uD640": {
    label: "\uBCF5\uD569",
    bg: "#16A085",
    // 틸 그린
    text: "#ffffff"
  },
  "\uC804\uD1B5 \uC6E8\uB529\uD640": {
    label: "\uC804\uD1B5",
    bg: "#8B6914",
    // 골드 브라운
    text: "#ffffff"
  },
  "\uB300\uD559 \uC6E8\uB529\uD640": {
    label: "\uB300\uD559",
    bg: "#2471A3",
    // 딥 블루
    text: "#ffffff"
  },
  "\uAD50\uD68C \uC6E8\uB529\uD640": {
    label: "\uAD50\uD68C",
    bg: "#616A6B",
    // 그레이 슬레이트
    text: "#ffffff"
  }
};
function getHallTypeBadge(hallType) {
  var _a;
  if (!hallType || hallType.length === 0) return HALL_TYPE_CONFIG["\uC6E8\uB529\uD640"];
  return (_a = HALL_TYPE_CONFIG[hallType[0]]) != null ? _a : HALL_TYPE_CONFIG["\uC6E8\uB529\uD640"];
}
function getHallMarkerBadge(h) {
  var _a;
  return getHallTypeBadge((_a = h.hallTypes) != null ? _a : null);
}
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "HallMapPillLabel",
  __ssrInlineRender: true,
  props: {
    hall: {},
    selected: { type: Boolean },
    primary: {}
  },
  setup(__props) {
    const props = __props;
    const badge = computed(() => getHallMarkerBadge(props.hall));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["hall-map-pill", { "hall-map-pill--selected": __props.selected }],
        style: {
          boxShadow: __props.selected ? `0 0 0 2px ${__props.primary}, 0 2px 8px rgba(0,0,0,0.22)` : "0 2px 6px rgba(0,0,0,0.2)"
        }
      }, _attrs))} data-v-d436aff4><span class="hall-map-pill__tag" style="${ssrRenderStyle({ background: unref(badge).bg, color: unref(badge).text })}" data-v-d436aff4><span data-v-d436aff4>${ssrInterpolate(unref(badge).label)}</span></span><span class="hall-map-pill__name" data-v-d436aff4>${ssrInterpolate(__props.hall.name)}</span></div>`);
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/hall/HallMapPillLabel.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-d436aff4"]]);
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "HallMapView",
  __ssrInlineRender: true,
  props: {
    halls: {},
    selectedId: {}
  },
  emits: ["select", "boundsChange"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const { PRIMARY, MUTED } = useThemeColors();
    const config = useRuntimeConfig();
    const clientId = computed(() => {
      var _a;
      return String((_a = config.public.naverMapClientId) != null ? _a : "").trim();
    });
    computed(() => {
      const v = config.public.naverMapLegacyClientId;
      return v === true || v === "true" || v === "1";
    });
    ref(null);
    let map = null;
    watch(
      () => props.halls,
      () => {
        if (clientId.value && map) ;
      },
      { deep: true }
    );
    watch(
      () => props.selectedId,
      (id) => {
        if (clientId.value && map) ;
        if (!clientId.value || !map) return;
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_HallMapPillLabel = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ style: { position: "relative", flex: 1, minHeight: 0, overflow: "hidden", background: "#E8E6DF" } }, _attrs))}>`);
      if (!unref(clientId)) {
        _push(`<!--[--><svg width="100%" height="100%" style="${ssrRenderStyle({ position: "absolute", inset: 0 })}" preserveAspectRatio="none"><rect width="100%" height="100%" fill="#E8E6DF"></rect><rect x="0" y="0" width="100%" height="18%" fill="#DDDAD2"></rect><rect x="0" y="82%" width="100%" height="18%" fill="#DDDAD2"></rect><rect x="5%" y="18%" width="90%" height="64%" rx="2" fill="#E2DFDA"></rect><line x1="5%" y1="45%" x2="95%" y2="45%" stroke="#D2CECC" stroke-width="6"></line><line x1="50%" y1="18%" x2="50%" y2="82%" stroke="#D2CECC" stroke-width="4"></line><line x1="25%" y1="18%" x2="25%" y2="82%" stroke="#CCCAC5" stroke-width="2"></line><line x1="75%" y1="18%" x2="75%" y2="82%" stroke="#CCCAC5" stroke-width="2"></line><line x1="5%" y1="30%" x2="95%" y2="30%" stroke="#CCCAC5" stroke-width="2"></line><line x1="5%" y1="65%" x2="95%" y2="65%" stroke="#CCCAC5" stroke-width="2"></line><rect x="14%" y="19%" width="9%" height="9%" rx="2" fill="#DAD7D0"></rect><rect x="30%" y="20%" width="11%" height="8%" rx="2" fill="#DAD7D0"></rect><rect x="54%" y="19%" width="9%" height="10%" rx="2" fill="#DAD7D0"></rect><rect x="70%" y="21%" width="13%" height="7%" rx="2" fill="#DAD7D0"></rect><rect x="14%" y="50%" width="8%" height="11%" rx="2" fill="#DAD7D0"></rect><rect x="27%" y="52%" width="10%" height="9%" rx="2" fill="#DAD7D0"></rect><rect x="59%" y="50%" width="11%" height="10%" rx="2" fill="#DAD7D0"></rect><rect x="74%" y="51%" width="9%" height="8%" rx="2" fill="#DAD7D0"></rect><rect x="37%" y="32%" width="11%" height="11%" rx="3" fill="#C8D8B8" opacity="0.7"></rect><text x="50%" y="96%" text-anchor="middle" font-size="11" fill="#B0ABA2"> \uC9C0\uB3C4 API \uC5F0\uB3D9 \uC601\uC5ED (\uB124\uC774\uBC84 \uC9C0\uB3C4 \xB7 .env\uC5D0 \uD0A4 \uC124\uC815) </text></svg><!--[-->`);
        ssrRenderList(__props.halls, (h) => {
          _push(`<div style="${ssrRenderStyle({
            position: "absolute",
            left: h.pinX,
            top: h.pinY,
            transform: "translate(-50%, -100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
            zIndex: __props.selectedId === h.id ? 4 : 2
          })}">`);
          _push(ssrRenderComponent(_component_HallMapPillLabel, {
            hall: h,
            selected: __props.selectedId === h.id,
            primary: unref(PRIMARY)
          }, null, _parent));
          _push(`</div>`);
        });
        _push(`<!--]--><div style="${ssrRenderStyle({
          position: "absolute",
          bottom: "28px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "12px",
          color: unref(MUTED),
          textAlign: "center",
          maxWidth: "90%",
          lineHeight: 1.5
        })}"> \uD504\uB85C\uC81D\uD2B8 \uB8E8\uD2B8\uC5D0 <code style="${ssrRenderStyle({ "font-size": "11px" })}">.env</code> \uB97C \uB9CC\uB4E4\uACE0 <code style="${ssrRenderStyle({ "font-size": "11px" })}">NUXT_PUBLIC_NAVER_MAP_CLIENT_ID</code> \uC5D0 \uBC1C\uAE09\uBC1B\uC740 Client ID\uB97C \uB123\uC73C\uBA74 \uB124\uC774\uBC84 \uC9C0\uB3C4\uAC00 \uD45C\uC2DC\uB429\uB2C8\uB2E4. </div><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div style="${ssrRenderStyle([
        { position: "absolute", inset: 0, width: "100%", height: "100%" },
        unref(clientId) ? null : { display: "none" }
      ])}"></div></div>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/hall/HallMapView.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "HallPage",
  __ssrInlineRender: true,
  setup(__props) {
    const { PRIMARY, TEXT, MUTED, BORDER } = useThemeColors();
    useSupabaseClient();
    const moodF = ref("\uC804\uCCB4");
    const foodF = ref("\uC804\uCCB4");
    const minF = ref("\uC804\uCCB4");
    const q = ref("");
    const selected = ref(null);
    const mapHalls = ref(void 0);
    ref(false);
    let debounceBounds = null;
    const selStyle = computed(() => ({
      fontFamily: "inherit",
      fontSize: "13px",
      fontWeight: 500,
      padding: "6px 28px 6px 12px",
      border: `1px solid ${BORDER}`,
      borderRadius: "99px",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239B9B9B'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 10px center",
      backgroundSize: "10px 6px",
      backgroundColor: "#fff",
      appearance: "none",
      WebkitAppearance: "none",
      color: TEXT,
      cursor: "pointer",
      outline: "none",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      flexShrink: 0,
      minWidth: "96px"
    }));
    const baseHalls = computed(
      () => mapHalls.value !== void 0 ? mapHalls.value : HALLS
    );
    const filtered = computed(() => {
      const qq = q.value.trim().toLowerCase();
      return baseHalls.value.filter((h) => {
        if (moodF.value !== "\uC804\uCCB4" && h.mood !== moodF.value) return false;
        if (!hallMatchesFoodRange(h, foodF.value)) return false;
        if (!hallMatchesGuestRange(h, minF.value)) return false;
        if (qq) {
          const name = h.name.toLowerCase();
          const loc = h.location.toLowerCase();
          if (!name.includes(qq) && !loc.includes(qq)) return false;
        }
        return true;
      });
    });
    watch(filtered, (list) => {
      if (selected.value && !list.some((h) => h.id === selected.value.id)) {
        selected.value = null;
      }
    });
    function onMapSelect(h) {
      selected.value = h;
    }
    async function loadHallsInBounds(b) {
      return;
    }
    function onMapBounds(b) {
      if (debounceBounds) clearTimeout(debounceBounds);
      debounceBounds = setTimeout(() => {
        loadHallsInBounds();
      }, 400);
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_HallDetail = _sfc_main$8;
      const _component_HallMapView = _sfc_main$6;
      const _cssVars = { style: {
        ":--v1bb60fec": unref(BORDER)
      } };
      _push(`<div${ssrRenderAttrs(mergeProps({ style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden"
      } }, _attrs, _cssVars))} data-v-8dbacb22><div style="${ssrRenderStyle({
        flexShrink: 0,
        padding: "8px 12px",
        borderBottom: `1px solid ${unref(BORDER)}`,
        background: "#fff",
        zIndex: 5,
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      })}" data-v-8dbacb22><div style="${ssrRenderStyle({
        display: "flex",
        alignItems: "center",
        gap: "8px",
        minHeight: "40px"
      })}" data-v-8dbacb22><div style="${ssrRenderStyle({
        flex: 1,
        minWidth: 0,
        maxWidth: "480px",
        display: "flex",
        alignItems: "center",
        border: `1px solid ${unref(BORDER)}`,
        borderRadius: "99px",
        padding: "0 12px",
        gap: "6px",
        background: "#FAFAFA"
      })}" data-v-8dbacb22><span style="${ssrRenderStyle({ fontSize: "13px", color: unref(MUTED), flexShrink: 0 })}" data-v-8dbacb22>\u{1F50D}</span><input${ssrRenderAttr("value", unref(q))} placeholder="\uC6E8\uB529\uD640 \uC774\uB984, \uC9C0\uC5ED \uAC80\uC0C9..." style="${ssrRenderStyle({
        flex: 1,
        minWidth: 0,
        border: "none",
        outline: "none",
        fontSize: "13px",
        background: "transparent",
        color: unref(TEXT),
        padding: "7px 0"
      })}" data-v-8dbacb22></div><div style="${ssrRenderStyle({
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        background: unref(PRIMARY),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "15px",
        color: "#fff",
        cursor: "pointer",
        flexShrink: 0
      })}" data-v-8dbacb22> \u{1F464} </div></div><div style="${ssrRenderStyle({
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap"
      })}" data-v-8dbacb22><select style="${ssrRenderStyle(unref(selStyle))}" data-v-8dbacb22><option data-v-8dbacb22${ssrIncludeBooleanAttr(Array.isArray(unref(moodF)) ? ssrLooseContain(unref(moodF), null) : ssrLooseEqual(unref(moodF), null)) ? " selected" : ""}>\uC804\uCCB4</option><option data-v-8dbacb22${ssrIncludeBooleanAttr(Array.isArray(unref(moodF)) ? ssrLooseContain(unref(moodF), null) : ssrLooseEqual(unref(moodF), null)) ? " selected" : ""}>\uB7ED\uC154\uB9AC</option><option data-v-8dbacb22${ssrIncludeBooleanAttr(Array.isArray(unref(moodF)) ? ssrLooseContain(unref(moodF), null) : ssrLooseEqual(unref(moodF), null)) ? " selected" : ""}>\uBAA8\uB358</option><option data-v-8dbacb22${ssrIncludeBooleanAttr(Array.isArray(unref(moodF)) ? ssrLooseContain(unref(moodF), null) : ssrLooseEqual(unref(moodF), null)) ? " selected" : ""}>\uD074\uB798\uC2DD</option></select><select style="${ssrRenderStyle(unref(selStyle))}" data-v-8dbacb22><option data-v-8dbacb22${ssrIncludeBooleanAttr(Array.isArray(unref(foodF)) ? ssrLooseContain(unref(foodF), null) : ssrLooseEqual(unref(foodF), null)) ? " selected" : ""}>\uC804\uCCB4</option><option data-v-8dbacb22${ssrIncludeBooleanAttr(Array.isArray(unref(foodF)) ? ssrLooseContain(unref(foodF), null) : ssrLooseEqual(unref(foodF), null)) ? " selected" : ""}>~6\uB9CC\uC6D0</option><option data-v-8dbacb22${ssrIncludeBooleanAttr(Array.isArray(unref(foodF)) ? ssrLooseContain(unref(foodF), null) : ssrLooseEqual(unref(foodF), null)) ? " selected" : ""}>6~9\uB9CC\uC6D0</option><option data-v-8dbacb22${ssrIncludeBooleanAttr(Array.isArray(unref(foodF)) ? ssrLooseContain(unref(foodF), null) : ssrLooseEqual(unref(foodF), null)) ? " selected" : ""}>9\uB9CC\uC6D0~</option></select><select style="${ssrRenderStyle(unref(selStyle))}" data-v-8dbacb22><option data-v-8dbacb22${ssrIncludeBooleanAttr(Array.isArray(unref(minF)) ? ssrLooseContain(unref(minF), null) : ssrLooseEqual(unref(minF), null)) ? " selected" : ""}>\uC804\uCCB4</option><option data-v-8dbacb22${ssrIncludeBooleanAttr(Array.isArray(unref(minF)) ? ssrLooseContain(unref(minF), null) : ssrLooseEqual(unref(minF), null)) ? " selected" : ""}>~100\uBA85</option><option data-v-8dbacb22${ssrIncludeBooleanAttr(Array.isArray(unref(minF)) ? ssrLooseContain(unref(minF), null) : ssrLooseEqual(unref(minF), null)) ? " selected" : ""}>100~200\uBA85</option><option data-v-8dbacb22${ssrIncludeBooleanAttr(Array.isArray(unref(minF)) ? ssrLooseContain(unref(minF), null) : ssrLooseEqual(unref(minF), null)) ? " selected" : ""}>200\uBA85~</option></select></div></div><div class="hall-main-row" style="${ssrRenderStyle({ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" })}" data-v-8dbacb22>`);
      if (unref(selected)) {
        _push(`<div class="hall-aside-panel" data-v-8dbacb22>`);
        _push(ssrRenderComponent(_component_HallDetail, {
          hall: unref(selected),
          onBack: ($event) => selected.value = null
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_HallMapView, {
        halls: unref(filtered),
        "selected-id": (_b = (_a = unref(selected)) == null ? void 0 : _a.id) != null ? _b : null,
        onSelect: onMapSelect,
        onBoundsChange: onMapBounds
      }, null, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/hall/HallPage.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-8dbacb22"]]);
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "LoungePage",
  __ssrInlineRender: true,
  setup(__props) {
    const { PRIMARY, PRIMARY_LT, GOLD, GOLD_LT, TEXT, MUTED, BORDER } = useThemeColors();
    const posts = ref([...INITIAL_POSTS]);
    const body = ref("");
    const hallTag = ref("");
    const liked = ref({});
    const filter = ref("\uCD5C\uC2E0\uC21C");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ style: { background: "#FAFAFA", height: "100%", overflowY: "auto" } }, _attrs))}><div style="${ssrRenderStyle({ maxWidth: "600px", margin: "0 auto", padding: "24px 16px" })}"><div style="${ssrRenderStyle({ display: "flex", gap: "6px", marginBottom: "14px" })}"><!--[-->`);
      ssrRenderList(["\uCD5C\uC2E0\uC21C", "\uAD00\uC2EC\uD640", "\uB098\uC758\uD640"], (f) => {
        _push(`<button type="button" style="${ssrRenderStyle({
          fontFamily: "inherit",
          fontSize: "13px",
          fontWeight: unref(filter) === f ? 600 : 400,
          padding: "6px 16px",
          borderRadius: "99px",
          border: `1px solid ${unref(filter) === f ? unref(PRIMARY) : unref(BORDER)}`,
          background: unref(filter) === f ? unref(PRIMARY) : "#fff",
          color: unref(filter) === f ? "#fff" : unref(MUTED),
          cursor: "pointer"
        })}">${ssrInterpolate(f)}</button>`);
      });
      _push(`<!--]--></div><div style="${ssrRenderStyle({
        background: "#fff",
        border: `1px solid ${unref(BORDER)}`,
        borderRadius: "12px",
        padding: "14px",
        marginBottom: "14px"
      })}"><textarea placeholder="\uC6E8\uB529\uD640 \uD6C4\uAE30\uB098 \uACB0\uD63C \uC900\uBE44 \uACE0\uBBFC\uC744 \uACF5\uC720\uD574\uBCF4\uC138\uC694 :)" style="${ssrRenderStyle({
        width: "100%",
        border: "none",
        outline: "none",
        resize: "none",
        fontFamily: "inherit",
        fontSize: "14px",
        color: unref(TEXT),
        lineHeight: 1.65,
        minHeight: "70px",
        background: "transparent",
        boxSizing: "border-box"
      })}">${ssrInterpolate(unref(body))}</textarea><div style="${ssrRenderStyle({
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: "10px",
        borderTop: `1px solid ${unref(BORDER)}`,
        marginTop: "4px"
      })}"><select style="${ssrRenderStyle({
        fontFamily: "inherit",
        fontSize: "12px",
        padding: "4px 10px",
        border: `1px solid ${unref(BORDER)}`,
        borderRadius: "99px",
        color: unref(MUTED),
        background: "transparent",
        cursor: "pointer",
        outline: "none"
      })}"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(hallTag)) ? ssrLooseContain(unref(hallTag), "") : ssrLooseEqual(unref(hallTag), "")) ? " selected" : ""}>\uD640 \uD0DC\uADF8</option><!--[-->`);
      ssrRenderList(unref(HALLS), (h) => {
        _push(`<option${ssrRenderAttr("value", h.name)}${ssrIncludeBooleanAttr(Array.isArray(unref(hallTag)) ? ssrLooseContain(unref(hallTag), h.name) : ssrLooseEqual(unref(hallTag), h.name)) ? " selected" : ""}>${ssrInterpolate(h.name)}</option>`);
      });
      _push(`<!--]--></select><button type="button" style="${ssrRenderStyle({
        fontFamily: "inherit",
        fontSize: "13px",
        fontWeight: 600,
        padding: "7px 20px",
        background: unref(PRIMARY),
        color: "#fff",
        border: "none",
        borderRadius: "99px",
        cursor: "pointer"
      })}"> \uAC8C\uC2DC </button></div></div><!--[-->`);
      ssrRenderList(unref(posts), (p) => {
        _push(`<div style="${ssrRenderStyle({
          background: "#fff",
          border: `1px solid ${unref(BORDER)}`,
          borderRadius: "12px",
          padding: "14px",
          marginBottom: "10px"
        })}"><div style="${ssrRenderStyle({ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" })}"><div style="${ssrRenderStyle({
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          background: unref(PRIMARY_LT),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: 700,
          color: unref(PRIMARY),
          flexShrink: 0
        })}">${ssrInterpolate(p.nick.slice(0, 2))}</div><div style="${ssrRenderStyle({ flex: 1 })}"><div style="${ssrRenderStyle({ fontSize: "13px", fontWeight: 600, color: unref(TEXT) })}">${ssrInterpolate(p.nick)}</div><div style="${ssrRenderStyle({ fontSize: "11px", color: unref(MUTED) })}">${ssrInterpolate(p.time)}</div></div>`);
        if (p.hall) {
          _push(`<span style="${ssrRenderStyle({
            fontSize: "11px",
            padding: "3px 10px",
            borderRadius: "99px",
            background: unref(GOLD_LT),
            color: unref(GOLD),
            fontWeight: 500
          })}">${ssrInterpolate(p.hall)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><p style="${ssrRenderStyle({ fontSize: "14px", lineHeight: 1.7, color: "#444", marginBottom: "10px" })}">${ssrInterpolate(p.body)}</p><div style="${ssrRenderStyle({ display: "flex", gap: "14px" })}"><span style="${ssrRenderStyle({
          fontSize: "13px",
          color: unref(liked)[p.id] ? "#E05B5B" : unref(MUTED),
          cursor: "pointer"
        })}">${ssrInterpolate(unref(liked)[p.id] ? "\u2665" : "\u2661")} ${ssrInterpolate(p.likes + (unref(liked)[p.id] ? 1 : 0))}</span><span style="${ssrRenderStyle({ fontSize: "13px", color: unref(MUTED), cursor: "pointer" })}">\u{1F4AC} ${ssrInterpolate(p.comments)}</span><span style="${ssrRenderStyle({ fontSize: "13px", color: unref(MUTED), cursor: "pointer" })}">\uACF5\uC720</span></div></div>`);
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/lounge/LoungePage.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const total = 3500;
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "BudgetPage",
  __ssrInlineRender: true,
  setup(__props) {
    const { PRIMARY, PRIMARY_LT, GOLD, TEXT, MUTED, BORDER } = useThemeColors();
    const items = ref([...INITIAL_BUDGET_ITEMS]);
    const spent = computed(() => items.value.filter((i) => i.done).reduce((a, b) => a + b.amount, 0));
    const pct = computed(() => Math.round(spent.value / total * 100));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ style: { background: "#FAFAFA", height: "100%", overflowY: "auto" } }, _attrs))}><div style="${ssrRenderStyle({ maxWidth: "600px", margin: "0 auto", padding: "24px 16px" })}"><div style="${ssrRenderStyle({
        background: "#fff",
        border: `1px solid ${unref(BORDER)}`,
        borderRadius: "12px",
        padding: "18px",
        marginBottom: "14px"
      })}"><div style="${ssrRenderStyle({ display: "grid", gridTemplateColumns: "repeat(3,1fr)", marginBottom: "14px" })}"><div style="${ssrRenderStyle({ textAlign: "left" })}"><div style="${ssrRenderStyle({ fontSize: "11px", color: unref(MUTED), marginBottom: "3px" })}">\uCD1D \uC608\uC0B0</div><div style="${ssrRenderStyle({ fontSize: "18px", fontWeight: 700, color: unref(TEXT) })}">${ssrInterpolate(total.toLocaleString())}\uB9CC\uC6D0</div></div><div style="${ssrRenderStyle({ textAlign: "center" })}"><div style="${ssrRenderStyle({ fontSize: "11px", color: unref(MUTED), marginBottom: "3px" })}">\uC9C0\uCD9C \uC644\uB8CC</div><div style="${ssrRenderStyle({ fontSize: "18px", fontWeight: 700, color: "#C9716A" })}">${ssrInterpolate(unref(spent).toLocaleString())}\uB9CC\uC6D0 </div></div><div style="${ssrRenderStyle({ textAlign: "right" })}"><div style="${ssrRenderStyle({ fontSize: "11px", color: unref(MUTED), marginBottom: "3px" })}">\uC794\uC5EC \uC608\uC0B0</div><div style="${ssrRenderStyle({ fontSize: "18px", fontWeight: 700, color: unref(GOLD) })}">${ssrInterpolate((total - unref(spent)).toLocaleString())}\uB9CC\uC6D0 </div></div></div><div style="${ssrRenderStyle({ height: "6px", background: "#F0F0F0", borderRadius: "3px", overflow: "hidden" })}"><div style="${ssrRenderStyle({
        height: "100%",
        width: `${unref(pct)}%`,
        background: unref(PRIMARY),
        borderRadius: "3px"
      })}"></div></div><div style="${ssrRenderStyle({ display: "flex", justifyContent: "space-between", marginTop: "6px" })}"><span style="${ssrRenderStyle({ fontSize: "11px", color: unref(MUTED) })}">${ssrInterpolate(unref(pct))}% \uC0AC\uC6A9</span><span style="${ssrRenderStyle({ fontSize: "11px", color: unref(MUTED) })}">D-82</span></div></div><div style="${ssrRenderStyle({
        background: "#fff",
        border: `1px solid ${unref(BORDER)}`,
        borderRadius: "12px",
        overflow: "hidden"
      })}"><!--[-->`);
      ssrRenderList(unref(items), (item, i) => {
        _push(`<div style="${ssrRenderStyle({
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "13px 14px",
          borderBottom: i < unref(items).length - 1 ? `1px solid ${unref(BORDER)}` : "none",
          cursor: "pointer"
        })}"><div style="${ssrRenderStyle({
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          flexShrink: 0,
          background: item.done ? unref(PRIMARY_LT) : "#F5F5F5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px"
        })}">${ssrInterpolate(item.icon)}</div><div style="${ssrRenderStyle({ flex: 1 })}"><div style="${ssrRenderStyle({
          fontSize: "14px",
          fontWeight: 500,
          color: item.done ? "#AAAAAA" : unref(TEXT),
          textDecoration: item.done ? "line-through" : "none"
        })}">${ssrInterpolate(item.name)}</div><div style="${ssrRenderStyle({ fontSize: "11px", color: unref(MUTED) })}">${ssrInterpolate(item.sub)}</div></div><div style="${ssrRenderStyle({ textAlign: "right" })}"><div style="${ssrRenderStyle({ fontSize: "14px", fontWeight: 600, color: unref(TEXT), marginBottom: "2px" })}">${ssrInterpolate(item.amount.toLocaleString())}\uB9CC\uC6D0 </div><span style="${ssrRenderStyle({
          fontSize: "11px",
          fontWeight: 500,
          padding: "2px 8px",
          borderRadius: "99px",
          background: item.done ? "#EDF7EE" : unref(PRIMARY_LT),
          color: item.done ? "#3B8A47" : unref(PRIMARY)
        })}">${ssrInterpolate(item.done ? "\uC644\uB8CC" : "\uC900\uBE44\uC911")}</span></div></div>`);
      });
      _push(`<!--]--></div><p style="${ssrRenderStyle({ fontSize: "12px", color: unref(MUTED), textAlign: "center", marginTop: "12px" })}"> \uD56D\uBAA9 \uD074\uB9AD\uC73C\uB85C \uC644\uB8CC \uC0C1\uD0DC \uD1A0\uAE00 </p></div></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/budget/BudgetPage.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "DictPage",
  __ssrInlineRender: true,
  setup(__props) {
    const { PRIMARY, PRIMARY_LT, GOLD, GOLD_LT, TEXT, MUTED, BORDER } = useThemeColors();
    const q = ref("");
    const cat = ref("\uC804\uCCB4");
    const open = ref(null);
    const cats = ["\uC804\uCCB4", "\uC900\uBE44\uB2E8\uACC4", "\uC608\uC2DD\uC7A5", "\uC2A4\uB4DC\uBA54", "\uC608\uBB3C\xB7\uC608\uB2E8", "\uC74C\uC2DD", "\uBE44\uC6A9"];
    const filtered = computed(
      () => DICT.filter(
        (d) => (cat.value === "\uC804\uCCB4" || d.cat === cat.value) && (!q.value || d.term.includes(q.value) || d.def.includes(q.value))
      )
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ style: { background: "#FAFAFA", height: "100%", overflowY: "auto" } }, _attrs))}><div style="${ssrRenderStyle({ maxWidth: "600px", margin: "0 auto", padding: "24px 16px" })}"><div style="${ssrRenderStyle({
        display: "flex",
        border: `1px solid ${unref(BORDER)}`,
        borderRadius: "99px",
        background: "#fff",
        overflow: "hidden",
        marginBottom: "12px"
      })}"><input${ssrRenderAttr("value", unref(q))} placeholder="\uC6A9\uC5B4\uB97C \uAC80\uC0C9\uD558\uC138\uC694" style="${ssrRenderStyle({
        flex: 1,
        border: "none",
        outline: "none",
        padding: "10px 16px",
        fontFamily: "inherit",
        fontSize: "14px",
        color: unref(TEXT),
        background: "transparent"
      })}"><button type="button" style="${ssrRenderStyle({
        padding: "0 20px",
        background: unref(PRIMARY),
        border: "none",
        color: "#fff",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer"
      })}"> \uAC80\uC0C9 </button></div><div style="${ssrRenderStyle({ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" })}"><!--[-->`);
      ssrRenderList(cats, (c) => {
        _push(`<button type="button" style="${ssrRenderStyle({
          fontFamily: "inherit",
          fontSize: "12px",
          fontWeight: unref(cat) === c ? 600 : 400,
          padding: "5px 14px",
          borderRadius: "99px",
          border: `1px solid ${unref(cat) === c ? unref(PRIMARY) : unref(BORDER)}`,
          background: unref(cat) === c ? unref(PRIMARY) : "#fff",
          color: unref(cat) === c ? "#fff" : unref(MUTED),
          cursor: "pointer"
        })}">${ssrInterpolate(c)}</button>`);
      });
      _push(`<!--]--></div><div style="${ssrRenderStyle({
        background: "#fff",
        border: `1px solid ${unref(BORDER)}`,
        borderRadius: "12px",
        overflow: "hidden"
      })}">`);
      if (unref(filtered).length === 0) {
        _push(`<div style="${ssrRenderStyle({ padding: "32px", textAlign: "center", color: unref(MUTED), fontSize: "14px" })}"> \uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC5B4\uC694 </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(filtered), (d, i) => {
        _push(`<div style="${ssrRenderStyle({
          padding: "13px 14px",
          borderBottom: i < unref(filtered).length - 1 ? `1px solid ${unref(BORDER)}` : "none",
          cursor: "pointer",
          background: unref(open) === i ? unref(PRIMARY_LT) : "#fff"
        })}"><div style="${ssrRenderStyle({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: unref(open) === i ? "6px" : "3px"
        })}"><span style="${ssrRenderStyle({ fontSize: "14px", fontWeight: 600, color: unref(TEXT) })}">${ssrInterpolate(d.term)}</span><span style="${ssrRenderStyle({
          fontSize: "11px",
          padding: "2px 8px",
          borderRadius: "99px",
          background: unref(GOLD_LT),
          color: unref(GOLD),
          fontWeight: 500
        })}">${ssrInterpolate(d.cat)}</span></div><div style="${ssrRenderStyle({
          fontSize: "13px",
          color: unref(MUTED),
          lineHeight: 1.65,
          overflow: unref(open) === i ? "visible" : "hidden",
          textOverflow: unref(open) === i ? "unset" : "ellipsis",
          whiteSpace: unref(open) === i ? "normal" : "nowrap"
        })}">${ssrInterpolate(d.def)}</div></div>`);
      });
      _push(`<!--]--></div></div></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dict/DictPage.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "MusicPage",
  __ssrInlineRender: true,
  setup(__props) {
    const { PRIMARY, GOLD, GOLD_LT, TEXT, MUTED, BORDER, PRIMARY_LT } = useThemeColors();
    const tabIdx = ref(0);
    const mood = ref("\uC804\uCCB4");
    const tabs = ["\uC2E0\uB791 \uC785\uC7A5\uACE1", "\uC2E0\uBD80 \uC785\uC7A5\uACE1", "\uCD95\uAC00", "\uD53C\uB85C\uC5F0"];
    const moods = ["\uC804\uCCB4", "\uC794\uC794\uD55C", "\uC124\uB808\uB294", "\uD074\uB798\uC2DD", "\uD31D", "K-POP"];
    const hovered = ref(null);
    const filtered = computed(
      () => MUSIC.filter((m) => {
        if (mood.value === "\uC804\uCCB4") return true;
        if (mood.value === "K-POP" && m.type === "kpop") return true;
        if (mood.value === "\uD31D" && m.type === "pop") return true;
        if (mood.value === "\uD074\uB798\uC2DD" && m.type === "classic") return true;
        return m.mood === mood.value;
      })
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ style: { background: "#FAFAFA", height: "100%", overflowY: "auto" } }, _attrs))}><div style="${ssrRenderStyle({ maxWidth: "600px", margin: "0 auto", padding: "24px 16px" })}"><div style="${ssrRenderStyle({ display: "flex", borderBottom: `1px solid ${unref(BORDER)}`, marginBottom: "14px" })}"><!--[-->`);
      ssrRenderList(tabs, (t, i) => {
        _push(`<div style="${ssrRenderStyle({
          padding: "9px 16px",
          fontSize: "13px",
          fontWeight: unref(tabIdx) === i ? 600 : 400,
          color: unref(tabIdx) === i ? unref(TEXT) : unref(MUTED),
          cursor: "pointer",
          borderBottom: `2px solid ${unref(tabIdx) === i ? unref(PRIMARY) : "transparent"}`
        })}">${ssrInterpolate(t)}</div>`);
      });
      _push(`<!--]--></div><div style="${ssrRenderStyle({ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" })}"><!--[-->`);
      ssrRenderList(moods, (m) => {
        _push(`<button type="button" style="${ssrRenderStyle({
          fontFamily: "inherit",
          fontSize: "12px",
          fontWeight: unref(mood) === m ? 600 : 400,
          padding: "5px 14px",
          borderRadius: "99px",
          border: `1px solid ${unref(mood) === m ? unref(PRIMARY) : unref(BORDER)}`,
          background: unref(mood) === m ? unref(PRIMARY) : "#fff",
          color: unref(mood) === m ? "#fff" : unref(MUTED),
          cursor: "pointer"
        })}">${ssrInterpolate(m)}</button>`);
      });
      _push(`<!--]--></div><div style="${ssrRenderStyle({
        background: "#fff",
        border: `1px solid ${unref(BORDER)}`,
        borderRadius: "12px",
        overflow: "hidden"
      })}"><!--[-->`);
      ssrRenderList(unref(filtered), (item, i) => {
        _push(`<div style="${ssrRenderStyle({
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "11px 14px",
          borderBottom: i < unref(filtered).length - 1 ? `1px solid ${unref(BORDER)}` : "none",
          cursor: "pointer",
          background: unref(hovered) === i ? unref(PRIMARY_LT) : "#fff"
        })}"><span style="${ssrRenderStyle({ fontSize: "11px", color: unref(MUTED), width: "18px", textAlign: "center", flexShrink: 0 })}">${ssrInterpolate(i + 1)}</span><div style="${ssrRenderStyle({
          width: "42px",
          height: "42px",
          borderRadius: "8px",
          flexShrink: 0,
          background: "#F2F3F5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px"
        })}">${ssrInterpolate(item.icon)}</div><div style="${ssrRenderStyle({ flex: 1, minWidth: 0 })}"><div style="${ssrRenderStyle({ fontSize: "14px", fontWeight: 600, color: unref(TEXT), marginBottom: "2px" })}">${ssrInterpolate(item.title)}</div><div style="${ssrRenderStyle({ fontSize: "12px", color: unref(MUTED) })}">${ssrInterpolate(item.artist)}</div></div><span style="${ssrRenderStyle({
          fontSize: "11px",
          fontWeight: 500,
          padding: "3px 9px",
          borderRadius: "99px",
          background: unref(GOLD_LT),
          color: unref(GOLD),
          whiteSpace: "nowrap"
        })}">${ssrInterpolate(item.badge)}</span></div>`);
      });
      _push(`<!--]--></div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/music/MusicPage.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { PRIMARY_LT, BORDER } = useThemeColors();
    const tab = ref("hall");
    useRoute();
    useRouter();
    const session = useSupabaseSession();
    useSupabaseClient();
    const {
      openAuthModal,
      openAuthModalForTab,
      clearPendingTab,
      pendingTabAfterLogin
    } = useAuthModal();
    function onSelectTab(key) {
      if (AUTH_REQUIRED_TABS.has(key) && !session.value) {
        pendingTabAfterLogin.value = key;
        openAuthModal();
        return;
      }
      tab.value = key;
    }
    function openLoginFor(key) {
      if (session.value) return;
      openAuthModalForTab(key);
    }
    provide("openLoginModal", openLoginFor);
    watch(session, (s) => {
      if (s && pendingTabAfterLogin.value) {
        tab.value = pendingTabAfterLogin.value;
        clearPendingTab();
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_LayoutSideBtn = _sfc_main$9;
      const _component_HallPage = __nuxt_component_1;
      const _component_LoungePage = _sfc_main$4;
      const _component_BudgetPage = _sfc_main$3;
      const _component_DictPage = _sfc_main$2;
      const _component_MusicPage = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({
        style: {
          background: unref(PRIMARY_LT),
          display: "flex",
          height: "100vh",
          overflow: "hidden"
        }
      }, _attrs))}><div style="${ssrRenderStyle({
        width: "56px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderRight: `1px solid ${unref(BORDER)}`,
        background: "#fff",
        flexShrink: 0,
        zIndex: 10,
        paddingTop: "8px"
      })}"><img${ssrRenderAttr("src", _imports_0)} width="36" height="36" alt="WEDDiC" style="${ssrRenderStyle({
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        cursor: "pointer",
        marginBottom: "6px",
        display: "block",
        objectFit: "cover"
      })}"><!--[-->`);
      ssrRenderList(unref(SIDE_MENUS), (m) => {
        _push(ssrRenderComponent(_component_LayoutSideBtn, {
          key: m.key,
          icon: m.icon,
          label: m.label,
          active: unref(tab) === m.key,
          onClick: ($event) => onSelectTab(m.key)
        }, null, _parent));
      });
      _push(`<!--]--></div><div style="${ssrRenderStyle({
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 0
      })}">`);
      if (unref(tab) === "hall") {
        _push(ssrRenderComponent(_component_HallPage, null, null, _parent));
      } else if (unref(tab) === "lounge") {
        _push(ssrRenderComponent(_component_LoungePage, null, null, _parent));
      } else if (unref(tab) === "budget") {
        _push(ssrRenderComponent(_component_BudgetPage, null, null, _parent));
      } else if (unref(tab) === "dict") {
        _push(ssrRenderComponent(_component_DictPage, null, null, _parent));
      } else if (unref(tab) === "music") {
        _push(ssrRenderComponent(_component_MusicPage, null, null, _parent));
      } else if (unref(tab) === "profile") {
        _push(`<div style="${ssrRenderStyle({
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: "8px",
          color: "#9B9B9B",
          fontSize: "14px"
        })}">`);
        if ((_a = unref(session)) == null ? void 0 : _a.user) {
          _push(`<!--[--><span style="${ssrRenderStyle({ color: "#1a1a1a", fontWeight: 600 })}">\uB9C8\uC774 \uD504\uB85C\uD544</span><span>${ssrInterpolate((_c = (_b = unref(session).user.email) != null ? _b : unref(session).user.phone) != null ? _c : "\uC5F0\uACB0\uB428")}</span><!--]-->`);
        } else {
          _push(`<!--[--> \uB85C\uADF8\uC778\uC774 \uD544\uC694\uD574\uC694 <!--]-->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BvbcNMcG.mjs.map
