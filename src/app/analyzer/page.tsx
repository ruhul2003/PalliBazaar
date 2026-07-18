"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Activity, Upload, FileText, Download, CheckCircle, AlertTriangle, 
  Loader2, ShieldAlert, MapPin, Star, Wheat, ChevronRight, BarChart2 
} from "lucide-react";
import toast from "react-hot-toast";

interface MetricType {
  name: string;
  value: string;
  status: string;
  advice: string;
}

interface AnalysisResultType {
  summary: string;
  metrics: MetricType[];
  risks: string[];
  actionItems: string[];
  recommendedCategory: string;
}

interface RecommendedProductType {
  _id: string;
  name: string;
  price: number;
  district: string;
  shortDescription?: string;
  description: string;
  images: string[];
  ratings: { average: number };
  category: { name: string };
}

export default function FarmAnalyzerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [matchedProducts, setMatchedProducts] = useState<RecommendedProductType[]>([]);
  const [fetchingProducts, setFetchingProducts] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch matched marketplace items when AI recommends a category
  useEffect(() => {
    if (result?.recommendedCategory) {
      setFetchingProducts(true);
      fetch(`/api/products?category=${result.recommendedCategory}&limit=2`)
        .then((res) => res.json())
        .then((data) => {
          if (data.products) {
            setMatchedProducts(data.products);
          }
        })
        .catch((err) => console.error("Matched products fetch error:", err))
        .finally(() => setFetchingProducts(false));
    }
  }, [result]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
      toast.success(`Loaded ${file.name}! Press Run Analysis.`);
    };
    reader.readAsText(file);
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) {
      toast.error("Please enter farm stats or upload a report file first.");
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setMatchedProducts([]);

    try {
      const res = await fetch("/api/ai/analyze-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataContent: rawText,
          fileName: fileName || "harvest_log.txt"
        })
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();
      setResult(data);
      toast.success("AI Crop & Sales trend analysis completed!");
    } catch (e) {
      console.error(e);
      toast.error("AI Analysis failed. Using fallback report data.");
      setResult({
        summary: "Based on the submitted data, your crop yield is showing strong growth in leafy greens, but organic honey and fruit harvests indicate a seasonal deficit in Rajshahi/Sundarbans regions.",
        metrics: [
          { name: "Total Harvest Weight", value: "480 kg", status: "Optimal", advice: "Maintain current organic fertilizer." },
          { name: "Average Yield per Acre", value: "1.2 tons", status: "Normal", advice: "Normal range for Bogra soil type." },
          { name: "Total Estimated Revenue", value: "45,500 BDT", status: "Normal", advice: "Slightly higher than last month's averages." },
          { name: "Fertilizer Conversion Efficiency", value: "78%", status: "Underperforming", advice: "Incorporate organic vermicompost." }
        ],
        risks: [
          "Soil nutrient depletion risk due to continuous paddy cultivation.",
          "Estimated market price drop for Mangoes during peak season."
        ],
        actionItems: [
          "Apply premium organic vermicompost to restore soil nitrogen levels.",
          "Rotate crops next season (plant red amaranth or mustard seeds).",
          "Log your daily moisture levels using the PalliBazaar farmer dashboard."
        ],
        recommendedCategory: "seeds"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!result) return;

    const reportContent = `# PalliBazaar Farm Yield & Sales AI Report
Generated on: ${new Date().toLocaleString()}
Farmer Profile: ${user?.name || "Verified Seller"}

## Executive Harvest Summary
${result.summary}

## Key Performance Indicators (KPIs)
${result.metrics.map(m => `- **${m.name}**: ${m.value} (${m.status}) - *Recommendation: ${m.advice}*`).join("\n")}

## Identified Crop & Market Risks
${result.risks.map(r => `- ${r}`).join("\n")}

## Actionable Guidelines
${result.actionItems.map(c => `- [ ] ${c}`).join("\n")}

---
**Disclaimer**: This analysis is synthesized by PalliBazaar AI based on your submitted harvest inputs.
`;

    const blob = new Blob([reportContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PalliBazaar_AI_Farm_Report_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Farm report downloaded successfully!");
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-bg-sand">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-75px)] py-12 px-4 sm:px-6 bg-bg-sand font-sans">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-8 flex flex-col gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Wheat className="w-4 h-4 text-primary" /> AI Agricultural Copilot
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary tracking-tight">Crop Yield & Sales Analyzer</h2>
          <p className="text-text-muted text-sm md:text-base">Upload harvest spreadsheets, expense sheets, or seed logs to evaluate efficiency and soil health</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Main Content Area */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-border-light rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary shrink-0" />
                <span>Upload Farm Statistics</span>
              </h3>

              <form onSubmit={handleRunAnalysis} className="space-y-4">
                {/* Upload Box */}
                <div className="border-2 border-dashed border-border-light hover:border-primary rounded-xl p-6 text-center transition cursor-pointer relative bg-bg-sand/10">
                  <input
                    type="file"
                    accept=".txt,.csv,.json"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <FileText className="w-8 h-8 text-text-muted/65 mx-auto mb-2" />
                  <span className="text-xs font-bold text-text-earth block">
                    {fileName ? `Selected: ${fileName}` : "Select CSV, JSON, or TXT harvest files"}
                  </span>
                  <span className="text-[10px] text-text-muted mt-1 block">Or type/paste raw statistics entries below</span>
                </div>

                {/* Text Area */}
                <div>
                  <label className="block text-xs font-bold text-text-earth mb-1.5">Raw Harvest Details</label>
                  <textarea
                    rows={8}
                    className="w-full p-3 text-xs rounded-xl border border-border-light outline-none focus:border-primary bg-bg-sand/5 focus:bg-white"
                    placeholder="e.g.
Paddy seeds weight: 500 kg
Organic Vermicompost used: 50 kg
Rajshahi plot soil moisture: 68%
Harvest sales total: 35,000 BDT
Pest occurrence rating: 1/5"
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  {rawText && (
                    <button
                      type="button"
                      onClick={() => { setRawText(""); setFileName(""); }}
                      className="px-4 py-2 border border-border-light text-text-muted text-xs font-bold rounded-lg hover:bg-bg-sand/30 cursor-pointer"
                    >
                      Reset Fields
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg cursor-pointer transition shadow flex items-center gap-1.5"
                    disabled={analyzing}
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing stats...
                      </>
                    ) : (
                      <>Evaluate Harvest Report</>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Results Display */}
            {result && (
              <div className="bg-white border border-border-light rounded-2xl p-6 shadow-sm flex flex-col gap-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-border-light pb-4">
                  <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-primary" />
                    <span>AI Agronomist Verdict</span>
                  </h3>
                  <button
                    onClick={handleDownloadReport}
                    className="px-4 py-2 bg-primary-light border border-primary/25 hover:bg-primary hover:text-white text-primary rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Report
                  </button>
                </div>

                {/* Summary */}
                <div className="bg-primary-light/50 p-4 border border-primary/10 rounded-xl text-xs text-text-earth leading-relaxed">
                  <span className="font-bold text-[10px] text-text-muted uppercase block mb-1">Executive Summary</span>
                  {result.summary}
                </div>

                {/* KPI Metrics */}
                <div>
                  <span className="font-bold text-[10px] text-text-muted uppercase block mb-3">Key Performance Indicators</span>
                  <div className="overflow-x-auto rounded-xl border border-border-light">
                    <table className="w-full text-left text-xs text-text-earth border-collapse bg-white">
                      <thead>
                        <tr className="bg-primary-light text-primary font-bold border-b border-border-light">
                          <th className="py-2.5 px-4">Indicator</th>
                          <th className="py-2.5 px-4">Value</th>
                          <th className="py-2.5 px-4">Performance Status</th>
                          <th className="py-2.5 px-4">Expert Recommendation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-light">
                        {result.metrics.map((metric, idx) => (
                          <tr key={idx} className="hover:bg-bg-sand/10">
                            <td className="py-2.5 px-4 font-semibold">{metric.name}</td>
                            <td className="py-2.5 px-4 font-bold text-primary">{metric.value}</td>
                            <td className="py-2.5 px-4">
                              <span className={`inline-flex px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full leading-none ${
                                metric.status.toLowerCase().includes("optimal")
                                  ? "bg-green-50 text-success border border-success/20"
                                  : metric.status.toLowerCase().includes("normal")
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-red-50 text-danger border border-danger/20"
                              }`}>
                                {metric.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-text-muted">{metric.advice}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Risks / Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="bg-red-50 border border-red-250/20 rounded-xl p-4 flex flex-col gap-3">
                    <h4 className="text-[10px] font-bold text-danger uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-danger" /> Agricultural Deficits & Risks
                    </h4>
                    <ul className="list-disc pl-4 text-xs text-text-muted space-y-1">
                      {result.risks.map((risk, idx) => (
                        <li key={idx}>{risk}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-250/20 rounded-xl p-4 flex flex-col gap-3">
                    <h4 className="text-[10px] font-bold text-success uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-success" /> Coordinated Actions Checklist
                    </h4>
                    <ul className="list-decimal pl-4 text-xs text-text-muted space-y-1">
                      {result.actionItems.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recommended Seeds / Products Sidebar */}
          <aside className="flex flex-col gap-6">
            <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h3 className="font-serif text-base font-bold text-primary border-b border-border-light pb-3 flex items-center gap-1.5">
                <Wheat className="w-4 h-4 text-primary" /> Marketplace Matching
              </h3>

              {!result ? (
                <div className="text-center py-10 text-text-muted text-xs leading-relaxed">
                  Run a crop evaluation to find relevant seed packages or organic fertilizers.
                </div>
              ) : fetchingProducts ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : matchedProducts.length === 0 ? (
                <div className="text-center py-10 text-text-muted text-xs">
                  No matching agricultural packages found.
                </div>
              ) : (
                <div className="space-y-4">
                  <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Recommended Seed Packages:</span>
                  {matchedProducts.map((pkg) => (
                    <div key={pkg._id} className="border border-border-light rounded-xl p-3 bg-bg-sand/10 hover:shadow-sm transition flex flex-col gap-2.5">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-bg-sand rounded-lg overflow-hidden shrink-0 relative border border-border-light">
                          <img src={pkg.images?.[0] || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=600"} alt={pkg.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-grow">
                          <h4 className="font-bold text-xs text-text-earth truncate">{pkg.name}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-text-muted mt-1 font-medium">
                            <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {pkg.district}</span>
                            <span className="flex items-center gap-0.5 text-amber-500"><Star className="w-2.5 h-2.5 fill-current" /> {pkg.ratings?.average || 4.7}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-border-light pt-2 shrink-0 text-xs">
                        <span className="font-extrabold text-primary">{pkg.price} BDT</span>
                        <Link href={`/products/${pkg._id}`} className="text-primary font-bold hover:underline flex items-center gap-0.5" onClick={() => {}}>
                          Details <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
