"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Box, Check, ChevronDown, CircleHelp, ClipboardList, ImagePlus, LayoutDashboard, PackagePlus, Search, Settings2, ShieldCheck, Sparkles, Store, UploadCloud, X } from "lucide-react";

type ImageItem = { name: string; url: string };
const steps = ["Product images", "Price, stock & shipping", "Product description", "Additional attributes"];

export default function Home() {
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [stock, setStock] = useState("");
  const [shipping, setShipping] = useState("Seller fulfilled");
  const [description, setDescription] = useState("");
  const [attributes, setAttributes] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedKeywords, setGeneratedKeywords] = useState<string[]>([]);
  const [missingInformation, setMissingInformation] = useState<string[]>([]);
  const ready = productName.trim() && brand.trim() && price.trim() && stock.trim() && description.trim();
  const completeness = useMemo(() => [images.length > 0, !!price && !!stock, !!description, !!attributes].filter(Boolean).length, [images, price, stock, description, attributes]);

  function addImages(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files).slice(0, 9 - images.length).map(file => ({ name: file.name, url: URL.createObjectURL(file) }));
    setImages(old => [...old, ...next]);
  }
  async function generateWithAI() {
    if (!productName.trim() || !brand.trim()) { setNotice("Enter the exact product name and brand before AI generation."); return; }
    setAiLoading(true); setNotice("");
    try {
      const response = await fetch("/api/generate-listing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productName, brand, category, attributes, description }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "AI generation failed.");
      setProductName(result.suggestedTitle || productName);
      setDescription(result.suggestedDescription || description);
      setGeneratedKeywords(Array.isArray(result.searchKeywords) ? result.searchKeywords : []);
      setMissingInformation(Array.isArray(result.missingInformation) ? result.missingInformation : []);
      setNotice("AI draft generated. Verify every claim and required category attribute before using it.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "AI generation failed."); }
    finally { setAiLoading(false); }
  }

  function prepareDraft() {
    if (!productName.trim() || !brand.trim()) { setNotice("Enter product name and brand first."); return; }
    if (!description.trim()) setDescription(`${productName} by ${brand}. Add verified product specifications, pack contents, size and usage information before submission.`);
    setNotice("Draft prepared locally. Verify every field against the actual product packaging.");
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-blue-700 p-2 text-white"><Store size={21}/></div><div><div className="text-lg font-bold tracking-tight">SSTradingCo <span className="text-blue-700">AI</span></div><div className="text-[11px] font-semibold uppercase tracking-[.18em] text-slate-400">Flipkart Listing Studio</div></div></div>
          <div className="hidden w-[340px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 md:flex"><Search size={16}/> Search products, drafts...</div>
          <div className="flex items-center gap-3"><span className="hidden text-xs text-slate-500 sm:inline">Seller workspace</span><div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold"><span className="h-2 w-2 rounded-full bg-amber-500"/> API not connected <ChevronDown size={14}/></div></div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 md:grid-cols-[220px_1fr]">
        <aside className="hidden min-h-[calc(100vh-65px)] border-r border-slate-200 bg-white p-4 md:block">
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Workspace</div>
          <nav className="space-y-1 text-sm">
            <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-3 py-3 font-semibold text-blue-700"><LayoutDashboard size={17}/> Overview</div>
            <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-500"><PackagePlus size={17}/> Create new listing</div>
            <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-500"><ClipboardList size={17}/> Draft listings</div>
            <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-500"><ShieldCheck size={17}/> Approval queue</div>
          </nav>
          <div className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Settings</div>
          <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500"><Settings2 size={17}/> Flipkart API</div>
          <div className="mt-10 rounded-2xl bg-slate-900 p-4 text-white"><div className="mb-2 flex items-center gap-2 text-sm font-semibold"><CircleHelp size={16}/> Safe publishing</div><p className="text-xs leading-5 text-slate-300">Every new listing stays in draft until you review and approve it.</p></div>
        </aside>
        <main className="min-w-0 p-5 md:p-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-blue-700"><span>WORKSPACE</span><span className="text-slate-300">/</span><span>NEW LISTING</span></div><h1 className="text-2xl font-bold tracking-tight md:text-3xl">Create a new product listing</h1><p className="mt-2 text-sm text-slate-500">Create listings for your full product catalogue—not just one category. Review everything before submitting to Flipkart.</p></div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">Draft mode · No Flipkart submission</div>
          </div>
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[["Draft listings","0",ClipboardList],["Awaiting your approval","0",ShieldCheck],["Submitted to Flipkart","0",UploadCloud],["Listing completion",`${completeness}/4`,BadgeCheck]].map(([label,value,Icon]: any) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between text-slate-400"><span className="text-xs">{label}</span><Icon size={17}/></div><div className="text-2xl font-bold">{value}</div></div>)}
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">New listing builder</h2><p className="mt-1 text-xs text-slate-500">Use this builder for any product category. Enter the category exactly as shown or required in Flipkart Seller Hub.</p></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">Step {activeStep + 1} of 4</span></div>
              <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">{steps.map((step,i)=><button key={step} onClick={()=>setActiveStep(i)} className={`rounded-xl px-3 py-3 text-left text-xs font-semibold ${activeStep===i?"bg-blue-700 text-white":"bg-slate-50 text-slate-500 hover:bg-slate-100"}`}><div className="mb-1 opacity-70">0{i+1}</div>{step}</button>)}</div>
            </div>
            <div className="grid gap-7 p-5 md:grid-cols-[1fr_290px] md:p-6">
              <section className="min-w-0">
                {activeStep===0 && <div><h3 className="mb-1 font-bold">Product images & basic information</h3><p className="mb-5 text-xs text-slate-500">Upload clear, authentic product photos. Flipkart category rules and image requirements must be checked before publishing.</p>
                  <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-5 text-center hover:bg-blue-50"><input type="file" accept="image/*" multiple className="hidden" onChange={e=>addImages(e.target.files)}/><div className="mb-3 rounded-xl bg-white p-3 text-blue-700 shadow-sm"><ImagePlus size={23}/></div><span className="text-sm font-semibold">Click to upload product photos</span><span className="mt-1 text-xs text-slate-500">Up to 9 images · JPG, PNG or WEBP</span></label>
                  {images.length>0 && <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">{images.map((img,i)=><div key={img.url} className="relative"><img src={img.url} alt={img.name} className="h-24 w-full rounded-xl border object-cover"/><button onClick={()=>setImages(old=>old.filter((_,n)=>n!==i))} className="absolute -right-2 -top-2 rounded-full bg-slate-900 p-1 text-white"><X size={12}/></button><p className="mt-1 truncate text-[10px] text-slate-500">{img.name}</p></div>)}</div>}
                  <div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Product name" value={productName} onChange={setProductName} placeholder="e.g. Baby diaper pants, pack of 40"/><Field label="Brand (as printed on pack)" value={brand} onChange={setBrand} placeholder="Enter exact brand"/><Field label="Product category / Flipkart vertical" value={category} onChange={setCategory} placeholder="e.g. Home & Kitchen, Electronics, Clothing, Grocery..."/><Field label="Seller SKU (your unique code)" value={sku} onChange={setSku} placeholder="e.g. SST-SKU-001"/></div>
                </div>}
                {activeStep===1 && <div><h3 className="mb-1 font-bold">Price, stock & shipping</h3><p className="mb-5 text-xs text-slate-500">Enter values you have verified. No prices or stock quantities are guessed.</p><div className="grid gap-4 sm:grid-cols-2"><Field label="Selling price (₹)" value={price} onChange={setPrice} placeholder="0.00" type="number"/><Field label="MRP (₹)" value={mrp} onChange={setMrp} placeholder="0.00" type="number"/><Field label="Available stock" value={stock} onChange={setStock} placeholder="Quantity" type="number"/><div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Shipping method</label><select value={shipping} onChange={e=>setShipping(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"><option>Seller fulfilled</option><option>Flipkart fulfilled (verify eligibility)</option></select></div></div><div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">Check that selling price does not exceed MRP and confirm shipping settings in Seller Hub before submission.</div></div>}
                {activeStep===2 && <div><h3 className="mb-1 font-bold">Product description</h3><p className="mb-5 text-xs text-slate-500">Describe only verified features, pack size, material, dimensions and usage details.</p><label className="mb-1.5 block text-xs font-semibold text-slate-600">Product description</label><textarea value={description} onChange={e=>setDescription(e.target.value)} rows={9} placeholder="Write an accurate product description. Include pack quantity, size, material and other verified specifications..." className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"/><div className="mt-3 flex flex-wrap gap-2"><button onClick={generateWithAI} disabled={aiLoading} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50"><Sparkles size={15}/>{aiLoading ? "Generating..." : "Generate listing with AI"}</button><button onClick={prepareDraft} className="rounded-xl bg-violet-50 px-4 py-2.5 text-xs font-semibold text-violet-700">Prepare basic draft</button></div>{generatedKeywords.length>0 && <div className="mt-4 rounded-xl bg-slate-50 p-3"><div className="mb-2 text-xs font-bold text-slate-700">Suggested search keywords</div><div className="flex flex-wrap gap-2">{generatedKeywords.map(word=><span key={word} className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600">{word}</span>)}</div></div>}{missingInformation.length>0 && <div className="mt-3 rounded-xl bg-amber-50 p-3"><div className="mb-1 text-xs font-bold text-amber-800">Information to verify / add</div><ul className="list-disc pl-4 text-xs text-amber-800">{missingInformation.map(item=><li key={item}>{item}</li>)}</ul></div>}</div>}
                {activeStep===3 && <div><h3 className="mb-1 font-bold">Additional attributes</h3><p className="mb-5 text-xs text-slate-500">Add category-specific attributes exactly as required by Flipkart's current listing schema.</p><label className="mb-1.5 block text-xs font-semibold text-slate-600">Attributes (one per line: name: value)</label><textarea value={attributes} onChange={e=>setAttributes(e.target.value)} rows={8} placeholder={"Size: Medium\nPack of: 40\nColour: As shown\nCountry of origin: India"} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"/><p className="mt-2 text-xs text-slate-400">These are draft notes only; final required fields depend on the selected Flipkart category.</p></div>}
                {notice && <div className="mt-4 rounded-xl bg-blue-50 p-3 text-xs text-blue-800">{notice}</div>}
                <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-5"><button onClick={()=>setActiveStep(s=>Math.max(0,s-1))} disabled={activeStep===0} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-40">Previous</button><div className="flex gap-2"><button onClick={()=>setActiveStep(s=>Math.min(3,s+1))} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700">Next section</button><button onClick={()=>setPreview(true)} className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">Review listing</button></div></div>
              </section>
              <aside className="space-y-4"><div className="rounded-2xl border border-slate-200 p-4"><div className="mb-3 flex items-center gap-2 text-sm font-bold"><Sparkles size={16} className="text-violet-600"/> Listing assistant</div><p className="text-xs leading-5 text-slate-500">This first version helps organize a new listing draft. AI generation and direct Flipkart submission will be connected after secure API setup and category schema validation.</p><button onClick={prepareDraft} className="mt-4 w-full rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-xs font-semibold text-violet-700">Prepare basic draft</button></div>
                <div className="rounded-2xl border border-slate-200 p-4"><div className="mb-3 text-sm font-bold">Before you submit</div>{["Brand matches packaging","Images are genuine and clear","Price & stock are verified","Category attributes are complete"].map(t=><div key={t} className="mb-3 flex items-start gap-2 text-xs text-slate-500"><Check size={14} className="mt-0.5 text-emerald-600"/>{t}</div>)}</div>
                <div className="rounded-2xl bg-slate-900 p-4 text-white"><div className="flex items-center gap-2 text-sm font-bold"><ShieldCheck size={16}/> Approval required</div><p className="mt-2 text-xs leading-5 text-slate-300">No product is sent to Flipkart from this dashboard in the current MVP. Your review gate is built into the workflow.</p></div>
              </aside>
            </div>
          </div>
          <p className="mt-5 text-center text-[11px] text-slate-400">SSTradingCo AI · New Listing MVP · API integration pending</p>
        </main>
      </div>
      {preview && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Listing review</h2><p className="mt-1 text-xs text-slate-500">Check these draft details before any future submission.</p></div><button onClick={()=>setPreview(false)} className="rounded-lg bg-slate-100 p-2"><X size={18}/></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><Review label="Product" value={productName}/><Review label="Brand" value={brand}/><Review label="Category" value={category}/><Review label="SKU" value={sku}/><Review label="Selling price" value={price ? `₹${price}` : ""}/><Review label="MRP" value={mrp ? `₹${mrp}` : ""}/><Review label="Stock" value={stock}/><Review label="Shipping" value={shipping}/></div><div className="mt-4"><Review label="Description" value={description}/><Review label="Additional attributes" value={attributes}/></div><p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">{ready ? "Draft fields are present. Verify images, product facts and Flipkart-required attributes before submission." : "Some required draft fields are missing. Complete product name, brand, price, stock and description."} This review does not publish or submit anything.</p><button onClick={()=>{setPreview(false);setNotice("Review closed. Draft remains in this browser session only; persistent saving is not implemented yet.");}} className="mt-4 w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white">Close review</button></div></div>}
    </div>
  );
}

function Field({label,value,onChange,placeholder,type="text"}:{label:string;value:string;onChange:(v:string)=>void;placeholder:string;type?:string}) {
  return <div><label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label><input type={type} min={type==="number"?"0":undefined} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"/></div>;
}
function Review({label,value}:{label:string;value:string}) { return <div className="rounded-xl bg-slate-50 p-3"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div><div className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{value || "Not provided"}</div></div>; }
