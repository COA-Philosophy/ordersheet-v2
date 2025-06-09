"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { create } from "zustand";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// zustand store
const useOrderForm = create((set) => ({
  basic: {
    name: "",
    phone: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    zip: "",
    address: "",
  },
  items: [],
  discountType: "yen",
  discountValue: "",
  totalPrice: "",
  setBasic: (field, value) => set((state) => ({
    basic: { ...state.basic, [field]: value }
  })),
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  updateItem: (idx, key, value) => set((state) => ({
    items: state.items.map((it, i) =>
      i === idx ? { ...it, [key]: value } : it
    ),
  })),
  removeItem: (idx) => set((state) => ({
    items: state.items.filter((_, i) => i !== idx)
  })),
  setDiscountType: (type) => set({ discountType: type }),
  setDiscountValue: (val) => set({ discountValue: val }),
  setTotalPrice: (val) => set({ totalPrice: val }),
}));

// 年/月/日生成
const years = Array.from({ length: 100 }, (_, i) => `${new Date().getFullYear() - i}`);
const months = Array.from({ length: 12 }, (_, i) => `${i + 1}`);
const days = Array.from({ length: 31 }, (_, i) => `${i + 1}`);

// アイテム選択肢
const itemTypes = [
  "Suit(2P)", "Suit(3P)", "Suit+Pants", "Suit(3P)+Pants", "Jacket(S)", "Jacket(D)",
  "Vest", "Pants", "D Suit", "D Suit(3P)", "D Suit+Pants", "D Suit(3P)+Pants",
  "Shirts", "tie", "repair", "その他"
];

// ラペル（衿型）
const jacketLapelList = [
  "ノッチドラペル", "ピークドラペル", "ショールカラー", "ナローラペル", "ワイドラペル"
];
const shirtCollarList = [
  "レギュラーカラー", "セミワイドカラー", "ワイドカラー", "ホリゾンタルワイドカラー", "ラウンドカラー", "オープンカラー", "スタンドカラー", "ウィングカラー",
  "ショートレギュラーカラー", "ショートセミワイドカラー", "ショートワイドカラー", "ショートホリゾンタルワイドカラー", "ショートラウンドカラー"
];

// カフス
const jacketCuffs = [
  "4つボタン本切羽", "3つボタン本切羽", "4つボタン（飾り）", "3つボタン（飾り）", "サージャンカフス", "キッシングボタン"
];
const shirtCuffs = [
  "レギュラー（開きなし）", "小丸", "ラウンドB", "ラウンドC", "角落ち", "コーン", "ターンナップ", "ダブル", "アロー"
];

// 郵便番号API
const fetchAddress = async (zip, setAddress) => {
  try {
    const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip}`);
    const json = await res.json();
    if (json && json.results && json.results[0]) {
      const { address1, address2, address3 } = json.results[0];
      setAddress(`${address1}${address2}${address3}`);
    }
  } catch { /* fail silently */ }
};

// フォームUI本体
export default function OrderForm() {
  const {
    basic, setBasic, items, addItem, updateItem, removeItem,
    discountType, setDiscountType, discountValue, setDiscountValue,
    totalPrice, setTotalPrice
  } = useOrderForm();

  // 割引計算
  const discountNumber = parseFloat(discountValue) || 0;
  const total = parseFloat(totalPrice) || 0;
  const discounted = discountType === "yen"
    ? total - discountNumber
    : Math.round(total * (1 - discountNumber / 100));

  // 氏名バリデーション
  const isNameValid = basic.name.trim().length > 1;
  // 電話番号バリデーション
  const isPhoneValid = /^0\d{1,4}-?\d{1,4}-?\d{3,4}$/.test(basic.phone);
  // 生年月日バリデーション
  const isBirthValid = basic.birthYear && basic.birthMonth && basic.birthDay;
  // 郵便番号バリデーション
  const isZipValid = /^\d{3}-?\d{4}$/.test(basic.zip);

  return (
    <div className="max-w-md mx-auto p-2 space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-lg font-bold text-center">オーダーフォーム（スマホ対応）</h2>
          <div className="space-y-3">
            {/* 氏名 */}
            <Label>氏名</Label>
            <div className="flex items-center gap-2">
              <Input name="name" value={basic.name} onChange={e => setBasic("name", e.target.value)} placeholder="山田 太郎" />
              {isNameValid ? <span className="text-green-600">✔️</span> : <span className="text-gray-400">✗</span>}
            </div>
            {/* 電話番号 */}
            <Label>電話番号</Label>
            <div className="flex items-center gap-2">
              <Input name="phone" value={basic.phone} onChange={e => setBasic("phone", e.target.value)} placeholder="090-xxxx-xxxx" />
              {isPhoneValid ? <span className="text-green-600">✔️</span> : <span className="text-gray-400">✗</span>}
            </div>
            {/* 生年月日 */}
            <Label>生年月日</Label>
            <div className="flex gap-2">
              <Select value={basic.birthYear} onValueChange={v => setBasic("birthYear", v)}>
                <SelectTrigger className="w-20"><SelectValue placeholder="年" /></SelectTrigger>
                <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={basic.birthMonth} onValueChange={v => setBasic("birthMonth", v)}>
                <SelectTrigger className="w-16"><SelectValue placeholder="月" /></SelectTrigger>
                <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={basic.birthDay} onValueChange={v => setBasic("birthDay", v)}>
                <SelectTrigger className="w-16"><SelectValue placeholder="日" /></SelectTrigger>
                <SelectContent>{days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
              {isBirthValid ? <span className="text-green-600">✔️</span> : <span className="text-gray-400">✗</span>}
            </div>
            {/* 郵便番号＋住所自動入力 */}
            <Label>郵便番号</Label>
            <div className="flex gap-2">
              <Input name="zip" value={basic.zip} onChange={e => setBasic("zip", e.target.value)} placeholder="100-0001" />
              <Button variant="secondary" onClick={() => fetchAddress(basic.zip, v => setBasic("address", v))}>住所検索</Button>
              {isZipValid ? <span className="text-green-600">✔️</span> : <span className="text-gray-400">✗</span>}
            </div>
            {/* 住所 */}
            <Label>住所</Label>
            <Input name="address" value={basic.address} onChange={e => setBasic("address", e.target.value)} placeholder="東京都千代田区..." />
          </div>
          <Separator />
          {/* アイテム追加 */}
          <h3 className="font-semibold pt-2">アイテム追加</h3>
          {items.map((item, idx) => (
            <Card key={idx} className="mb-2 border border-gray-300 bg-gray-50">
              <CardContent className="space-y-2">
                {/* アイテム種別 */}
                <Label>アイテム種別</Label>
                <Select value={item.itemType || ""} onValueChange={v => updateItem(idx, "itemType", v)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="選択してください" /></SelectTrigger>
                  <SelectContent>{itemTypes.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
                {/* ラペル／カラー */}
                {item.itemType?.startsWith("Jacket") || item.itemType?.startsWith("Suit") || item.itemType?.startsWith("D Suit") ? (
                  <>
                    <Label>ラペル（衿型）</Label>
                    <Select value={item.lapelStyle || ""} onValueChange={v => updateItem(idx, "lapelStyle", v)}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="選択してください" /></SelectTrigger>
                      <SelectContent>{jacketLapelList.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                    <Label>カフス</Label>
                    <Select value={item.cuffStyle || ""} onValueChange={v => updateItem(idx, "cuffStyle", v)}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="選択してください" /></SelectTrigger>
                      <SelectContent>{jacketCuffs.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </>
                ) : item.itemType === "Shirts" ? (
                  <>
                    <Label>カラー（衿型）</Label>
                    <Select value={item.lapelStyle || ""} onValueChange={v => updateItem(idx, "lapelStyle", v)}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="選択してください" /></SelectTrigger>
                      <SelectContent>{shirtCollarList.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                    <Label>カフス</Label>
                    <Select value={item.cuffStyle || ""} onValueChange={v => updateItem(idx, "cuffStyle", v)}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="選択してください" /></SelectTrigger>
                      <SelectContent>{shirtCuffs.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </>
                ) : null}
                {/* 生地・色・価格 */}
                <Label>生地名</Label>
                <Input value={item.fabric || ""} onChange={e => updateItem(idx, "fabric", e.target.value)} placeholder="例：CANONICO 21μ" />
                <Label>色</Label>
                <Input value={item.color || ""} onChange={e => updateItem(idx, "color", e.target.value)} placeholder="例：ネイビー" />
                <Label>価格（円）</Label>
                <Input type="number" value={item.price || ""} onChange={e => updateItem(idx, "price", e.target.value)} />
                {/* 納期・備考 */}
                <Label>納期</Label>
                <Input value={item.deliveryDate || ""} onChange={e => updateItem(idx, "deliveryDate", e.target.value)} placeholder="2024-09-01" />
                <Label>備考</Label>
                <Input value={item.notes || ""} onChange={e => updateItem(idx, "notes", e.target.value)} />
                <Button variant="destructive" onClick={() => removeItem(idx)} size="sm" className="mt-2">削除</Button>
              </CardContent>
            </Card>
          ))}
          <Button onClick={() => addItem({})} variant="secondary" className="w-full">＋アイテム追加</Button>
          <Separator />
          {/* ディスカウント＆総額 */}
          <div className="flex items-center gap-2 pt-2">
            <Label>割引</Label>
            <Select value={discountType} onValueChange={setDiscountType}>
              <SelectTrigger className="w-16"><SelectValue placeholder="割引種別" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yen">円</SelectItem>
                <SelectItem value="percent">％</SelectItem>
              </SelectContent>
            </Select>
            <Input className="w-20" type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} placeholder="0" />
          </div>
          <div className="flex gap-2 items-center pt-2">
            <Label>総額（税込）</Label>
            <Input type="number" value={totalPrice} onChange={e => setTotalPrice(e.target.value)} />
          </div>
          <div className="text-right font-bold text-lg">
            割引後合計：{discounted > 0 ? `¥${discounted.toLocaleString()}` : "-"}
          </div>
          {/* ここにCSV出力や履歴保存ボタンなど拡張できます */}
        </CardContent>
      </Card>
    </div>
  );
}
// これはReactのJSX内（returnの直前or末尾）に直接書けます
// Next.jsでPWA用service-workerを登録
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js");
  });
}
